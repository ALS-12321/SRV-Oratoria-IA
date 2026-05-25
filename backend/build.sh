#!/usr/bin/env bash
set -e

echo "==> Instalando dependencias..."
pip install -r requirements-prod.txt

echo "==> Pre-descargando modelo Whisper (esto puede tardar unos minutos)..."
python - <<'EOF'
import os
from faster_whisper import WhisperModel

model_name = os.getenv("WHISPER_MODEL_FINAL", "small")
compute    = os.getenv("WHISPER_COMPUTE_TYPE", "int8")

print(f"    Descargando modelo '{model_name}' con compute_type='{compute}'...")
WhisperModel(model_name, device="cpu", compute_type=compute)
print("    Modelo listo.")
EOF

echo "==> Build completado."
