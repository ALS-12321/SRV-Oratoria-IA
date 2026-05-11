from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id         = Column(Integer, primary_key=True, index=True)
    nombre     = Column(String(100), nullable=False)
    apellido   = Column(String(100), nullable=False)
    username   = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(200), nullable=False)
    rol        = Column(Enum("alumno", "docente", name="rol_enum"), default="alumno")
    grado      = Column(String(10), nullable=True)
    seccion    = Column(String(10), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sesiones = relationship("Sesion", back_populates="usuario")
