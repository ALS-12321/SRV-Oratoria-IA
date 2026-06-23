#!/usr/bin/env bash
set -e

echo "==> Instalando dependencias..."
pip install -r requirements-prod.txt

echo "==> Descargando modelo spaCy (es_core_news_lg)..."
python -m spacy download es_core_news_lg

echo "==> Pre-descargando modelos Whisper (esto puede tardar unos minutos)..."
python - <<'EOF'
import os
from faster_whisper import WhisperModel

compute = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
# Predescarga el modelo en vivo (chunks) y el final; evita descargas en runtime.
modelos = {os.getenv("WHISPER_MODEL_LIVE", "small"),
           os.getenv("WHISPER_MODEL_FINAL", "medium")}
for m in modelos:
    print(f"    Descargando modelo '{m}' con compute_type='{compute}'...")
    WhisperModel(m, device="cpu", compute_type=compute)
print("    Modelos listos.")
EOF

echo "==> Build completado."
