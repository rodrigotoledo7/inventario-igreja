from app.core.config import settings
from app.core.security import get_password_hash
from app.models import Local, User
from app.services.local_service import LocalService
from app.services.user_service import UserService


def seed_database(db) -> None:
    user_svc = UserService(db)
    local_svc = LocalService(db)

    if settings.init_admin_username and settings.init_admin_password:
        existing = user_svc.get_by_username(settings.init_admin_username)
        if existing is None:
            admin = User(
                username=settings.init_admin_username,
                hashed_password=get_password_hash(settings.init_admin_password),
            )
            db.add(admin)

    existing_local = local_svc.get_by_nome(settings.default_local_nome)
    if existing_local is None:
        db.add(Local(nome=settings.default_local_nome))

    db.commit()