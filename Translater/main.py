from typing import List, Dict,Any
from fastapi import FastAPI, HTTPException,Depends
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from fastapi import FastAPI
from pymongo import MongoClient
import torch
from dotenv import load_dotenv
import google.generativeai as genai
import os
import json
import re
from pymongo import MongoClient
from datetime import datetime, timedelta
import psycopg2
from psycopg2 import pool




# from apscheduler.schedulers.background import BackgroundScheduler
# @app.on_event("startup")
# def start_scheduler():
#     scheduler = BackgroundScheduler()
#     scheduler.add_job(escalate_complaints, "cron", hour=0, minute=0)  # Runs daily at midnight
#     scheduler.start()

load_dotenv() 
MONGO_URI = os.getenv("MONOGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client.get_database("test")
complains_collection = db["complains"]
Personnel = db["personnels"]

# Neon connection URL
DATABASE_URL = "postgresql://neondb_owner:npg_dvtXDl1R7yTk@ep-royal-night-a1cfbdfv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
db_pool: pool.SimpleConnectionPool | None = None
def init_pool():
    global db_pool
    if db_pool is None:
        db_pool = pool.SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=DATABASE_URL
        )

def get_db():
    global db_pool
    if db_pool is None:
        init_pool()

    try:
        conn = db_pool.getconn()
        with conn.cursor() as cur:
            cur.execute("SELECT 1;")
        yield conn
    except (psycopg2.OperationalError, psycopg2.InterfaceError):
        # reconnect pool if closed
        init_pool()
        conn = db_pool.getconn()
        yield conn
    finally:
        try:
            db_pool.putconn(conn)
        except Exception:
            pass

GEMINI_API_KEY = os.getenv("GEMINI_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_KEY environment variable is not set.")
genai.configure(api_key=GEMINI_API_KEY)


generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
}

embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

app = FastAPI(title="Embeddings + Gemini API")


class EmbeddingRequest(BaseModel):
    text: str

class EmbeddingResponse(BaseModel):
    embedding: list[float]

@app.post("/embed", response_model=EmbeddingResponse)
async def get_embedding(request: EmbeddingRequest):
    text = request.text
    try:
        emb = embedding_model.encode(text).tolist()
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
class GeminiEnhanceResponse(BaseModel):
    response_text:str
    raw_json:Dict[str,Any]

@app.post("/translate", response_model=GeminiResponse)
async def chat(request: GeminiRequest, db=Depends(get_db)):

    from_lang = request.from_lang
    to_lang = request.to_lang
    json_data = request.json_data
    if not json_data:
        raise HTTPException(status_code=400, detail="JSON data is required")

    json_str = json.dumps(json_data, ensure_ascii=False)


    
    for item in json_data:
        if "kpin" in item:
            kpin = item["kpin"]
            break
        elif "pkpin" in item:
            kpin = item["pkpin"]
            break
        elif "Kpin" in item:
            kpin = item["Kpin"]
            break
    
    cur = db.cursor()


    

    cur.execute('SELECT id, hindi, telugu, tamil, kannada, urdu, marathi, malayalam FROM "Language" WHERE kpin = %s', (kpin,))
    row = cur.fetchone()

    if row:cur.execute(f"""
            UPDATE "Language"
            SET {to_lang} = COALESCE({to_lang}, 0) + 1
            WHERE kpin = %s
        """, (kpin,))
    else:
        # 3. Not exists: insert new row with kpin and language count 1
        cur.execute(f"""
            INSERT INTO "Language" (kpin, {to_lang})
            VALUES (%s, 1)
        """, (kpin,))

    db.commit()
    cur.close()
    if to_lang not in ["hindi", "telugu", "tamil", "kannada", "urdu", "bengali", "marathi", "malayalam"]:
        raise HTTPException(status_code=400, detail=f"Unknown Language: {to_lang}")
    
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

@app.post("/textEnhance",response_model=GeminiEnhanceResponse)
async def chat(request: GeminiEnhanceRequest):
    text = request.text.strip()

    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    # Properly escape curly braces in f-string
    prompt = f"""
Please enhance it for good readability for the people and easy to understand way 
the text is : {text}, dont keep any empty spaces or ask users to fill in the gap, You need to just make it good without any requiremnt of the external data for the user
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



def monthly_asset_complaints_report():
    try:
        today = datetime.utcnow()

        # Date range: last month to current month
        first_day_last_month = (today.replace(day=1) - relativedelta(months=1)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        last_day_this_month = (today.replace(day=1) + relativedelta(months=1, days=-1)).replace(
            hour=23, minute=59, second=59, microsecond=999999
        )

        # Aggregation pipeline
        pipeline = [
            {
                "$match": {
                    "createdAt": {"$gte": first_day_last_month, "$lte": last_day_this_month},
                    "AssetId": {"$ne": None}  # Ignore null AssetIds
                }
            },
            {
                "$group": {
                    "_id": "$AssetId",
                    "count": {"$sum": 1},
                    "kpin": {"$first": "$kpin"},          # same for all complaints of this asset
                    "category": {"$first": "$category"}   # same for all complaints of this asset
                }
            },
            {
                "$match": {
                    "count": {"$gt": 0}  # Only include assets with >5 complaints
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "AssetId": "$_id",
                    "kpin": 1,
                    "category": 1,
                    "complaintCount": "$count"
                }
            },
            {
                "$sort": {"complaintCount": -1}
            }
        ]

        # Run aggregation
        results = list(complains_collection.aggregate(pipeline))

        # Fetch JE phone numbers for each result
        for r in results:
            kpin_prefix = str(r["kpin"])[:6]
            category = r["category"]

            je_list = list(Personnel.find(
                {
                    "role": "JE",
                    "category": category,
                    "pkpin": {"$regex": f"^{kpin_prefix}"}
                },
                {"phoneNumber": 1, "_id": 0}
            ))

            r["jePhoneNumbers"] = [je["phoneNumber"] for je in je_list]



#   "report": [
#     {
#       "kpin": "36280101000111",
#       "category": "Electricity",
#       "AssetId": "1784334198341",
#       "complaintCount": 1,
#       "jePhoneNumbers": [
#         "9000000001"
#       ]
#     }
#   ]
# }

        print(f"Monthly Asset Complaints Report ({first_day_last_month.date()} - {last_day_this_month.date()}):")

        return {"report": results}

    except Exception as e:
        print("Error in monthly_asset_complaints_report:", str(e))
        return {"error": str(e)}



# Scheduler to run on last day of every month at 23:59
scheduler = BackgroundScheduler()
scheduler.add_job(
    monthly_asset_complaints_report,
    trigger='cron',
    day='last',
    hour=23,
    minute=59,
    id='monthly_asset_report'
)
scheduler.start()


# Optional manual endpoint to test the report
@app.get("/test_monthly_report")
async def test_monthly_report():
    results = monthly_asset_complaints_report()
    return {"report": results}
