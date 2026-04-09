from functools import lru_cache

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = Field(default="development", alias="APP_ENV")
    database_url: str = Field(..., alias="DATABASE_URL")
    secret_key: str = Field(..., alias="SECRET_KEY")
    access_token_expire_minutes: int = Field(default=60 * 8, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    cors_origins: str = Field(default="http://localhost,http://localhost:80,http://localhost:3000", alias="CORS_ORIGINS")
    init_admin_username: str | None = Field(default=None, alias="INIT_ADMIN_USERNAME")
    init_admin_password: str | None = Field(default=None, alias="INIT_ADMIN_PASSWORD")
    admin_usernames: str = Field(default="", alias="ADMIN_USERNAMES")
    default_local_nome: str = Field(default="Templo Sede", alias="DEFAULT_LOCAL_NOME")

    model_config = SettingsConfigDict(
        env_file=("app/.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def admin_usernames_list(self) -> list[str]:
        usernames = [username.strip() for username in self.admin_usernames.split(",") if username.strip()]
        if self.init_admin_username and self.init_admin_username not in usernames:
            usernames.append(self.init_admin_username)
        return usernames

    @field_validator("app_env")
    @classmethod
    def validate_app_env(cls, value: str) -> str:
        normalized_value = value.strip().lower()
        allowed_values = {"development", "production", "test"}
        if normalized_value not in allowed_values:
            raise ValueError("APP_ENV deve ser development, production ou test.")
        return normalized_value

    @model_validator(mode="after")
    def validate_security_settings(self) -> "Settings":
        weak_secrets = {"change-me-app-secret", "uma-chave-muito-secreta", "changeme", "secret"}
        weak_admin_passwords = {"admin1234", "password", "changeme", "123456"}
        localhost_origins = {"http://localhost", "http://localhost:80", "http://localhost:3000"}

        if self.app_env == "production":
            if self.secret_key.strip().lower() in weak_secrets:
                raise ValueError("SECRET_KEY insegura para producao.")

            if any(origin in localhost_origins for origin in self.allowed_origins):
                raise ValueError("CORS_ORIGINS de producao nao pode incluir origens localhost.")

            if self.init_admin_password and self.init_admin_password.strip().lower() in weak_admin_passwords:
                raise ValueError("INIT_ADMIN_PASSWORD insegura para producao.")

        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
