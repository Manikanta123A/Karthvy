# import torch
# from fastapi import FastAPI, WebSocket
# from fastapi.middleware.cors import CORSMiddleware
# from io import BytesIO
# from transformers import AutoModel
# from torchcodec.decoders import AudioDecoder


# print(torch.__version__)
# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # restrict in production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# decoder = AudioDecoder()

# model = AutoModel.from_pretrained(
#     "ai4bharat/indic-conformer-600m-multilingual",
#     trust_remote_code=True
# )

# print(torch.__version__)

# def preprocess_audio(wav, sr):
#     # Convert to mono and resample to 16 kHz
#     wav = torch.mean(wav, dim=0, keepdim=True)
#     target_sr = 16000
#     if sr != target_sr:
#         wav = torch.nn.functional.interpolate(
#             wav.unsqueeze(0), scale_factor=target_sr / sr, mode='linear', align_corners=False
#         ).squeeze(0)
#     return wav


# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
    
#     await websocket.accept()
    
#     try:
#         while True:
#             data = await websocket.receive_bytes()
#             wav, sr = decoder.decode(data)  # decode webm/opus bytes
#             wav = preprocess_audio(wav, sr)
            
#             # Model inference (per Hugging Face example)
#             transcription_ctc = model(wav, "hi", "ctc")
#             transcription_rnnt = model(wav, "hi", "rnnt")

#             response = {
#                 "ctc": transcription_ctc,
#                 "rnnt": transcription_rnnt
#             }
#             await websocket.send_json(response)

#     except Exception as e:
#         print(f"WebSocket error: {e}")
#         await websocket.close()
import ctypes
import os

dll_path = r'C:\Users\MANIKANTA\AppData\Local\Programs\Python\Python312\Lib\site-packages\torchcodec\libtorchcodec_core7.dll'
ctypes.WinDLL(dll_path)

from torchcodec.decoders import AudioDecoder
print("TorchCodec loaded successfully")
