from pydantic import BaseModel
from typing import Optional


class RegisterRequest(BaseModel):
    nombre: str
    apellido: str
    username: str
    password: str
    grado: Optional[str] = None
    seccion: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    nombre: str
    apellido: str
    username: str
    rol: str
    grado: Optional[str]
    seccion: Optional[str]

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
