from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user import Usuario
from models.session import Sesion
from models.metrics import ResultadoD1
from utils.auth import get_current_user
from schemas.metrics import ResultadoD1Response, SesionHistorialItem

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/historial", response_model=list[SesionHistorialItem])
def historial(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    sesiones = (
        db.query(Sesion)
        .filter(Sesion.usuario_id == current_user.id)
        .order_by(Sesion.created_at.desc())
        .limit(20)
        .all()
    )
    items = []
    for s in sesiones:
        items.append(SesionHistorialItem(
            id=s.id,
            modo=s.modo,
            created_at=s.created_at,
            estrellas=s.resultado.estrellas if s.resultado else None,
            ppm=s.resultado.ppm if s.resultado else None,
            long_pauses=s.resultado.long_pauses if s.resultado else None,
        ))
    return items


@router.get("/sesion/{sesion_id}", response_model=ResultadoD1Response)
def detalle_sesion(sesion_id: int, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    resultado = (
        db.query(ResultadoD1)
        .join(Sesion)
        .filter(Sesion.id == sesion_id, Sesion.usuario_id == current_user.id)
        .first()
    )
    if not resultado:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Sesion no encontrada")
    return resultado
