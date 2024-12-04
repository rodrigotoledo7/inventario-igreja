from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Local(Base):
    __tablename__ = "locais"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)

class Bem(Base):
    __tablename__ = "bens"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(String(255))
    local_id = Column(Integer, ForeignKey("locais.id"), nullable=False)
