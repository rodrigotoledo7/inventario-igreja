from app.core.security import get_password_hash
from app.models import User
from app.schemas import UserCreate, UserUpdate
from app.services.base import BaseService


class UserService(BaseService):

    def list_users(self) -> list[User]:
        return self.db.query(User).order_by(User.username.asc()).all()

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_username(self, username: str) -> User | None:
        return self.db.query(User).filter(User.username == username).first()

    def create_user(self, payload: UserCreate) -> User:
        if self.get_by_username(payload.username):
            raise ValueError("Usuario ja cadastrado.")
        user = User(
            username=payload.username.strip(),
            hashed_password=get_password_hash(payload.password),
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_user(self, user_id: int, payload: UserUpdate) -> User:
        user = self.get_by_id(user_id)
        if user is None:
            raise LookupError("Usuario nao encontrado.")
        username = payload.username.strip()
        existing = self.db.query(User).filter(
            User.username == username, User.id != user_id
        ).first()
        if existing:
            raise ValueError("Usuario ja cadastrado.")
        user.username = username
        if payload.password:
            user.hashed_password = get_password_hash(payload.password)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete_user(self, user_id: int, current_user_id: int) -> None:
        user = self.get_by_id(user_id)
        if user is None:
            raise LookupError("Usuario nao encontrado.")
        if user.id == current_user_id:
            raise ValueError("Nao e permitido excluir o proprio usuario logado.")
        self.db.delete(user)
        self.db.commit()