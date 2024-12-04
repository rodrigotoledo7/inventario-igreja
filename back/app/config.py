from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://user:password@localhost/igreja_db")

settings = Settings()
