import os
import uuid
from fastapi import APIRouter, Depends, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models.user import Usuario
from models.session import Sesion
from models.metrics import ResultadoD1
from utils.auth import get_current_user
from utils.audio import to_wav
from services.audio_processor import get_model_final
from services.dimension1 import transcribe, calculate_ppm, detect_pauses, analyze_prosody, generate_feedback
from schemas.audio import TextoLecturaResponse
from models.session import TextoLectura

router = APIRouter(prefix="/audio", tags=["audio"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/textos", response_model=list[TextoLecturaResponse])
def listar_textos(db: Session = Depends(get_db)):
    return db.query(TextoLectura).all()


@router.post("/analizar")
async def analizar_fluidez(
    file: UploadFile = File(...),
    modo: str = Form(default="libre"),
    texto_id: Optional[int] = Form(default=None),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    uid = uuid.uuid4().hex
    ext = os.path.splitext(file.filename or "audio")[1] or ".webm"
    raw_path = os.path.join(UPLOAD_DIR, f"{uid}_raw{ext}")
    wav_path = os.path.join(UPLOAD_DIR, f"{uid}.wav")

    with open(raw_path, "wb") as f:
        f.write(await file.read())

    try:
        to_wav(raw_path, wav_path)
        model = get_model_final()
        words, transcript = transcribe(wav_path, model)
        ppm_result    = calculate_ppm(words)
        pauses_result = detect_pauses(words)
        prosody_result = analyze_prosody(wav_path)
    finally:
        for path in (raw_path, wav_path):
            if os.path.exists(path):
                os.remove(path)

    feedback = generate_feedback(ppm_result, pauses_result)

    # Guardar en base de datos
    sesion = Sesion(usuario_id=current_user.id, modo=modo, texto_id=texto_id)
    db.add(sesion)
    db.flush()

    resultado = ResultadoD1(
        sesion_id         = sesion.id,
        transcripcion     = transcript,
        ppm               = ppm_result["ppm"],
        word_count        = ppm_result["word_count"],
        speech_duration_s = ppm_result["speech_duration_s"],
        total_pauses      = pauses_result["total_pauses"],
        long_pauses       = pauses_result["long_pauses"],
        avg_pause_s       = pauses_result["avg_pause_s"],
        f0_mean_hz        = prosody_result.get("f0_mean_hz") if prosody_result else None,
        f0_std_hz         = prosody_result.get("f0_std_hz") if prosody_result else None,
        jitter_pct        = prosody_result.get("jitter_pct") if prosody_result else None,
        shimmer_db        = prosody_result.get("shimmer_db") if prosody_result else None,
        hnr_db            = prosody_result.get("hnr_db") if prosody_result else None,
        intensity_mean_db = prosody_result.get("intensity_mean_db") if prosody_result else None,
        estrellas         = feedback["estrellas"],
        feedback_json     = feedback,
    )
    db.add(resultado)
    db.commit()

    ppm = ppm_result["ppm"]
    tag = "Normal" if 80 <= ppm <= 120 else ("Rapido" if ppm > 120 else "Lento")

    return {
        "sesion_id": sesion.id,
        "transcripcion": transcript,
        "ppm": ppm_result,
        "pausas": {k: v for k, v in pauses_result.items() if k != "pauses"},
        "prosodia": prosody_result,
        "retroalimentacion": feedback,
        "mensaje": f"Fluidez analizada: {ppm} PPM ({tag})",
    }
