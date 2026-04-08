from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TipoBem(str, Enum):
    MOVEL = "movel"
    IMOVEL = "imovel"

class BemBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo: TipoBem = TipoBem.MOVEL
    valor_estimado: Optional[float] = None
    identificador: Optional[str] = None
    local_id: int

class BemCreate(BemBase):
    pass

class BemResponse(BemBase):
    id: int
    data_aquisicao: datetime

    class Config:
        from_attributes = True

class LocalBase(BaseModel):
    nome: str

class LocalCreate(LocalBase):
    pass

class LocalResponse(LocalBase):
    id: int

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
