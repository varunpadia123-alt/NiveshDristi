import os
from dataclasses import dataclass

@dataclass
class Settings:
    PROJECT_NAME: str = "NiveshDristi Engine"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./niveshdristi.db")
    CONCENTRATION_ALERT_THRESHOLD_PCT: float = 30.0
    LTCG_THRESHOLD_DAYS: int = 365
    STCG_TAX_RATE: float = 0.20
    LTCG_TAX_RATE: float = 0.125

settings = Settings()
