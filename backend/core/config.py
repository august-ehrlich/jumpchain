from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Pydantic will automatically look for an environment variable named DATABASE_URL (case-insensitive)
    database_url: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings() # pyright: ignore[reportCallIssue]