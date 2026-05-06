from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Configuración de CORS para que React pueda enviar datos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/analizar-fluidez")
async def analizar_fluidez(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # Aquí es donde entrará Whisper más adelante
    return {
        "mensaje": "¡Audio recibido!",
        "nombre_archivo": file.filename,
        "status": "procesando"
    }