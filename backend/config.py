"""
Central app configuration, loaded from environment variables / .env.
Never hardcode secrets here - this file only defines shape + defaults.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/coastal_hazard"

    # Auth
    jwt_secret_key: str = "dev-only-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # Google Earth Engine (used by services/gee_service.py in the pipeline phase)
    gee_service_account_email: str | None = None
    gee_service_account_key_path: str | None = None
    gee_project_id: str | None = None

    # LLM
    groq_api_key: str | None = None

    # CORS
    frontend_origin: str = "http://localhost:3000"

    # App
    environment: str = "development"


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance - import get_settings() rather than instantiating Settings() directly."""
    return Settings()
