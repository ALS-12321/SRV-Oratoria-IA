from sqlalchemy import Column, Integer, Float, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base


class ResultadoD1(Base):
    __tablename__ = "resultados_d1"

    id                = Column(Integer, primary_key=True, index=True)
    sesion_id         = Column(Integer, ForeignKey("sesiones.id"), unique=True, nullable=False)
    transcripcion     = Column(Text)
    ppm               = Column(Float)
    word_count        = Column(Integer)
    speech_duration_s = Column(Float)
    total_pauses      = Column(Integer)
    long_pauses       = Column(Integer)
    avg_pause_s       = Column(Float)
    f0_mean_hz        = Column(Float, nullable=True)
    f0_std_hz         = Column(Float, nullable=True)
    jitter_pct        = Column(Float, nullable=True)
    shimmer_db        = Column(Float, nullable=True)
    hnr_db            = Column(Float, nullable=True)
    intensity_mean_db = Column(Float, nullable=True)
    estrellas         = Column(Integer)
    feedback_json     = Column(JSON)

    sesion = relationship("Sesion", back_populates="resultado")
