from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Enum
from datetime import datetime
import enum

from app.database import Base

class TipoBem(str, enum.Enum):
    MOVEL = "movel"
    IMOVEL = "imovel"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

class Local(Base):
    __tablename__ = "locais"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)

class Bem(Base):
    __tablename__ = "bens"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(String(255))
    tipo = Column(Enum(TipoBem), default=TipoBem.MOVEL, nullable=False)
    valor_estimado = Column(Float, nullable=True)
    data_aquisicao = Column(DateTime, default=datetime.utcnow)
    identificador = Column(String(50), unique=True, index=True)  # Ex: Plaqueta de patrimônio
    local_id = Column(Integer, ForeignKey("locais.id"), nullable=False)
