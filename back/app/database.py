from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import os
print("DATABASE_URL:", os.getenv("DATABASE_URL"))

from dotenv import load_dotenv

load_dotenv()

# URL do banco de dados
# DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://user:password@localhost/igreja_db")
DATABASE_URL = settings.DATABASE_URL

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
