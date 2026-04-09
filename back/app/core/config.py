from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field(..., alias="DATABASE_URL")
    secret_key: str = Field(..., alias="SECRET_KEY")
    access_token_expire_minutes: int = Field(default=60 * 8, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    cors_origins: str = Field(
        default=(
            "http://localhost,"
            "http://localhost:80,"
            "http://localhost:3000,"
            "https://api.ipbportovelho.org.br,"
            "https://sistema.ipbportovelho.org.br"
        ),
        alias="CORS_ORIGINS",
    )
    init_admin_username: str = Field(default="admin", alias="INIT_ADMIN_USERNAME")
    init_admin_password: str = Field(default="admin1234", alias="INIT_ADMIN_PASSWORD")
    default_local_nome: str = Field(default="Templo Sede", alias="DEFAULT_LOCAL_NOME")

    model_config = SettingsConfigDict(
        env_file=("app/.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
