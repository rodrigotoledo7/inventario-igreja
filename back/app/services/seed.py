from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import Local, User


def seed_database(db: Session) -> None:
    admin = db.query(User).filter(User.username == settings.init_admin_username).first()
    if admin is None:
        admin = User(
            username=settings.init_admin_username,
            hashed_password=get_password_hash(settings.init_admin_password),
        )
        db.add(admin)

    local = db.query(Local).filter(Local.nome == settings.default_local_nome).first()
    if local is None:
        db.add(Local(nome=settings.default_local_nome))

    db.commit()
