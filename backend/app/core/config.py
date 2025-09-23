# backend/app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str

    class Config:
        env_file = ".env"  # reads DATABASE_URL from backend/.env

settings = Settings()

