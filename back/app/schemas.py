from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from app.core.enums import TipoBem

class BemBase(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    descricao: Optional[str] = None
    tipo: TipoBem = TipoBem.MOVEL
    valor_estimado: Optional[float] = None
    identificador: Optional[str] = None
    local_id: int

class BemCreate(BemBase):
    pass

class BemUpdate(BemBase):
    pass

class BemResponse(BemBase):
    id: int
    data_aquisicao: datetime

    class Config:
        from_attributes = True

class LocalBase(BaseModel):
    nome: str = Field(min_length=2, max_length=100)

class LocalCreate(LocalBase):
    pass

class LocalUpdate(LocalBase):
    pass

class LocalResponse(LocalBase):
    id: int

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=128)

class UserUpdate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: Optional[str] = Field(default=None, min_length=6, max_length=128)

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
