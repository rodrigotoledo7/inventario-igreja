from app.core.security import create_access_token, verify_password
from app.models import User
from app.schemas import Token
from app.services.base import BaseService


class AuthService(BaseService):

    def authenticate_user(self, username: str, password: str) -> Token:
        user = self.db.query(User).filter(User.username == username).first()
        if user is None or not verify_password(password, user.hashed_password):
            raise ValueError("Usuario ou senha incorretos.")
        return Token(
            access_token=create_access_token(subject=user.username),
            token_type="bearer",
        )