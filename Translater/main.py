from typing import List, Dict
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import torch
from dotenv import load_dotenv
import google.generativeai as genai
import os
import json
import re
from pymongo import MongoClient
from datetime import datetime, timedelta
# from apscheduler.schedulers.background import BackgroundScheduler
# @app.on_event("startup")
# def start_scheduler():
#     scheduler = BackgroundScheduler()
#     scheduler.add_job(escalate_complaints, "cron", hour=0, minute=0)  # Runs daily at midnight
#     scheduler.start()

load_dotenv() 
MONGO_URI = os.getenv("MONOGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client.get_database("mydatabase")
complains_collection = db.get_collection("complains")




# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_KEY environment variable is not set.")
genai.configure(api_key=GEMINI_API_KEY)

# Generation configuration
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
}

# Embedding model
embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

app = FastAPI(title="Embeddings + Gemini API")

# ---------------- Embedding Endpoint ----------------
class EmbeddingRequest(BaseModel):
    text: str

class EmbeddingResponse(BaseModel):
    embedding: list[float]

@app.post("/embed", response_model=EmbeddingResponse)
async def get_embedding(request: EmbeddingRequest):
    text = request.text
    prompt = f''' 
Please convert the given text in to english and enhance it for good readability for the people and easy to understand way 
the text is : {text}
Output format is:
text: converted and enhanced text
'''
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )

        extracted_text = response.text
        extracted_text = re.sub(r"```json|```", "", extracted_text).strip()
        

        emb = embedding_model.encode(extracted_text).tolist()
        return {"embedding": emb}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

# ---------------- Gemini Endpoint ----------------
class GeminiRequest(BaseModel):
    from_lang: str
    to_lang: str
    json_data: List[Dict]

class GeminiResponse(BaseModel):
    response_text: str
    translated_json: List[Dict]
class GeminiEnhanceRequest(BaseModel):
    text: str

@app.post("/translate", response_model=GeminiResponse)
async def chat(request: GeminiRequest):
    from_lang = request.from_lang
    to_lang = request.to_lang
    json_data = request.json_data
    if not json_data:
        raise HTTPException(status_code=400, detail="JSON data is required")

    # Convert JSON object to string for the prompt
    json_str = json.dumps(json_data, ensure_ascii=False)

    prompt = f"""
You are a professional multilingual translator AI specialized in structured data translation.
Translate the following JSON object from {from_lang} to {to_lang}.

Rules:

Preserve all field names exactly as they are.

Translate only the values, not the keys.

If a value is:

A number, boolean, date, or hyperlink (URL) → leave it unchanged.

An ObjectId or field named _id → leave it unchanged.

The following fields and their nested values must always be translated (if present):

"Problem", "subproblem", "category", "status", "solution", and "comments" (including arrays) and all other which are possible dont leave single field which is possibel to translate .

Maintain valid JSON syntax with proper escaping.

Return only the translated JSON, no explanations or additional text.

Input JSON:
{json_str}

Output JSON:
"""

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )

        # Clean response
        extracted_text = re.sub(r"```json|```", "", response.text).strip()

        try:
            translated_json = json.loads(extracted_text)
        except Exception:
            translated_json = {"text": extracted_text}

        return {
            "response_text": extracted_text,
            "translated_json": translated_json
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

@app.post("/textEnhance",response_model=GeminiResponse)
async def chat(request: GeminiEnhanceRequest):
    text = request.text.strip()

    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    # Properly escape curly braces in f-string
    prompt = f"""
Please enhance it for good readability for the people and easy to understand way 
the text is : {text}
Output format is:
{{text: enhanced text}}
"""

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )

        extracted_text = response.text
        # Clean code fences
        extracted_text = re.sub(r"```json|```", "", extracted_text).strip()

        try:
            parsed_data = json.loads(extracted_text)
        except Exception:
            parsed_data = {"text": extracted_text}

        return {
    "response_text": extracted_text,  # the raw text returned by Gemini
    "raw_json": parsed_data           # the parsed JSON
}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")
    
@app.post("/daily_escalation")
async def daily_escalation():
    try:
        now = datetime.utcnow()
        three_days_ago = now - timedelta(days=3)
        seven_days_ago = now - timedelta(days=7)

        pending_complaints = list(complains_collection.find({
            "status": "Pending"
        }))

        for complaint in pending_complaints:
            last_notified = complaint.get("lastNotified")
            current_level = complaint.get("currentLevel", "JE")
            complaint_id = complaint["_id"]
            je_id = complaint.get("AssignedJE")
            aee_id = complaint.get("AssignedAEE")

            # 1️⃣ Never notified → notify JE
            if not last_notified:
                print(f"Notify JE {je_id} about complaint {complaint_id}")
                complains_collection.update_one(
                    {"_id": complaint_id},
                    {"$set": {"lastNotified": now}}
                )

            # 2️⃣ Already notified 3+ days ago → escalate to AEE
            elif last_notified <= three_days_ago and current_level == "JE":
                print(f"Escalate complaint {complaint_id} to AEE {aee_id}, make urgent")
                complains_collection.update_one(
                    {"_id": complaint_id},
                    {"$set": {"currentLevel": "AEE", "lastNotified": now}}
                )

        inprogress_complaints = list(complains_collection.find({
            "status": "In-progress",
            "createdAt": {"$lte": seven_days_ago}
        }))

        for complaint in inprogress_complaints:
            complaint_id = complaint["_id"]
            je_id = complaint.get("AssignedJE")
            print(f"Notify JE {je_id} to update comments on complaint {complaint_id} and complete ASAP")
            complains_collection.update_one(
                {"_id": complaint_id},
                {"$set": {"lastNotified": now}}
            )

        return {"message": "Escalation check completed successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

