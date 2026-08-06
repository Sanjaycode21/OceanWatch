from typing import Any, List, Optional, Union
from pydantic import field_validator, ValidationInfo
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, extra="ignore"
    )
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "OceanWatch AI"
    
    SECRET_KEY: str = "placeholder_secret_key_change_me_in_production_1234567890_oceanwatch"
    class_name: str = "HS256"
    ALGORITHM: str = "HS256"
    
    # AI configurations
    GEMINI_API_KEY: Optional[str] = None
    GOOGLE_GENAI_MODEL: str = "gemini-2.5-flash"
    
    # Token lifespans
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Media configurations
    MAX_UPLOAD_SIZE_MB: int = 20
    UPLOAD_DIR: str = "uploads"
    

    
    # CORS Origins (supports lists or comma-separated strings)
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    POSTGRES_PORT: str = "5432"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info: ValidationInfo) -> Any:
        if isinstance(v, str) and v:
            return v
        
        # Check if Postgres variables are configured
        data = info.data
        postgres_server = data.get("POSTGRES_SERVER")
        postgres_user = data.get("POSTGRES_USER")
        postgres_password = data.get("POSTGRES_PASSWORD")
        postgres_db = data.get("POSTGRES_DB")
        postgres_port = data.get("POSTGRES_PORT", "5432")

        if postgres_server and postgres_user and postgres_password and postgres_db:
            return f"postgresql://{postgres_user}:{postgres_password}@{postgres_server}:{postgres_port}/{postgres_db}"
        
        # Fallback to local SQLite database for scaffolding testing
        return "sqlite:///./oceanwatch.db"

settings = Settings()
