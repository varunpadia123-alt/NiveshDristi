import os

class Settings:
    PROJECT_NAME: str = "NiveshDristi API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "sqlite:///./niveshdristi.db"
    
    # Financial Engine Defaults
    STCG_TAX_RATE: float = 0.20  # 20% Short Term Capital Gains Tax (India equity standard)
    LTCG_TAX_RATE: float = 0.125 # 12.5% Long Term Capital Gains Tax
    LTCG_THRESHOLD_DAYS: int = 365
    CONCENTRATION_ALERT_THRESHOLD_PCT: float = 25.0 # Alert if 1 sector > 25% (as per product specification)
    
    # Sentiment Engine Settings
    FINBERT_VALUE_TRAP_THRESHOLD: float = -0.35 # Negative sentiment threshold triggering value-trap warning
    
    # LLM Settings (Optional API Key - gracefully falls back to deterministic RAG template engine)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

settings = Settings()
