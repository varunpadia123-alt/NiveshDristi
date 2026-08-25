from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models import UserProfile
from app.engine.broker_sync import sync_broker_portfolio
from app.routers import portfolio, analysis, backtest, risk

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="NiveshDristi AI-Powered Intelligent Portfolio Optimization & Analytics Engine"
)

# Enable CORS for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(portfolio.router, prefix=settings.API_V1_STR)
app.include_router(analysis.router, prefix=settings.API_V1_STR)
app.include_router(backtest.router, prefix=settings.API_V1_STR)
app.include_router(risk.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_db_seed():
    db = SessionLocal()
    try:
        user = db.query(UserProfile).filter(UserProfile.id == 1).first()
        if not user:
            user = UserProfile(id=1, full_name="Retail Investor", risk_score=6, broker_connected="Zerodha Kite")
            db.add(user)
            db.commit()
            sync_broker_portfolio(db, user_id=1, broker_name="Zerodha Kite")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "disclaimer": "Persistent Disclaimer: NiveshDristi provides data-driven algorithmic metrics and technical indicator translation, not fiduciary investment or financial advice."
    }
