from app.database import SessionLocal
from app.services.seed import seed_database


def seed_db() -> None:
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
