from pydantic import BaseModel
from typing import Optional


class TextoLecturaResponse(BaseModel):
    id: int
    titulo: str
    contenido: str
    nivel: str

    class Config:
        from_attributes = True
