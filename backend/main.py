from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import os

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar modelo de IA (se descarga la primera vez)
# Usamos 'base' por velocidad, ideal para pruebas locales
model = WhisperModel("base", device="cpu", compute_type="int8")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/analizar-fluidez")
async def analizar_fluidez(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # --- LÓGICA DE NEGOCIO: PROCESAMIENTO DE IA ---
    segments, info = model.transcribe(file_path, beam_size=5)
    
    texto_completo = ""
    total_palabras = 0
    duracion_segundos = info.duration
    
    for segment in segments:
        texto_completo += segment.text + " "
        total_palabras += len(segment.text.split())

    # Cálculo de Palabras por Minuto (PPM)
    duracion_minutos = duracion_segundos / 60
    ppm = round(total_palabras / duracion_minutos) if duracion_minutos > 0 else 0

    return {
        "transcripcion": texto_completo.strip(),
        "ppm": ppm,
        "duracion_seg": round(duracion_segundos, 2),
        "total_palabras": total_palabras,
        "mensaje": f"Fluidez analizada: {ppm} PPM"
    }