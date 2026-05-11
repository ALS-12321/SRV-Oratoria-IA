from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class ResultadoD1Response(BaseModel):
    id: int
    sesion_id: int
    transcripcion: Optional[str]
    ppm: float
    word_count: int
    speech_duration_s: float
    total_pauses: int
    long_pauses: int
    avg_pause_s: float
    f0_mean_hz: Optional[float]
    f0_std_hz: Optional[float]
    jitter_pct: Optional[float]
    shimmer_db: Optional[float]
    hnr_db: Optional[float]
    intensity_mean_db: Optional[float]
    estrellas: int
    feedback_json: Optional[Any]

    class Config:
        from_attributes = True


class SesionHistorialItem(BaseModel):
    id: int
    modo: str
    created_at: datetime
    estrellas: Optional[int]
    ppm: Optional[float]
    long_pauses: Optional[int]

    class Config:
        from_attributes = True
