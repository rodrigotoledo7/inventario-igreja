from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_admin_user, get_current_user
from app.database import get_db
from app.services.auth_service import AuthService
from app.services.bem_service import BemService
from app.services.local_service import LocalService
from app.services.user_service import UserService

__all__ = ["get_current_user", "get_current_admin_user"]


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


def get_local_service(db: Session = Depends(get_db)) -> LocalService:
    return LocalService(db)


def get_bem_service(db: Session = Depends(get_db)) -> BemService:
    return BemService(db)


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)