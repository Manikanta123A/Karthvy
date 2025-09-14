from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from optimum.onnxruntime import ORTModelForCTC, ORTQuantizer
from pathlib import Path

# Use AI4Bharat Hindi/Indian language model checkpoint
model_id = "ai4bharat/indic-conformer-600m-multilingual"

processor = Wav2Vec2Processor.from_pretrained(model_id,trust_remote_code=True)
model = Wav2Vec2ForCTC.from_pretrained(model_id,trust_remote_code=True)

onnx_path = Path("onnx_model")
onnx_model = ORTModelForCTC.from_transformers(model, processor, export=True, save_dir=onnx_path)

# Quantize the ONNX model for better performance
quantizer = ORTQuantizer.from_pretrained(onnx_path)
quantizer.quantize(save_dir=onnx_path, optimization_level=99)
