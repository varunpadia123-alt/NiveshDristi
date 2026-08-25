from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import PortfolioHolding, UserProfile
from app.schemas import TechnicalMetrics, AlternativeDiscovery
from app.engine.indicators import compute_technical_metrics
from app.engine.screener import discover_sector_alternative

router = APIRouter(prefix="/analysis", tags=["Algorithmic Analysis & RAG Alternatives"])

@router.get("/metrics/{ticker}", response_model=TechnicalMetrics)
def get_stock_technical_metrics(ticker: str):
    """Returns pandas-ta computed technical metrics & NiveshDristi badge."""
    try:
        metrics = compute_technical_metrics(ticker.upper())
        return metrics
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error computing indicators for {ticker}: {str(e)}")

@router.get("/alternatives", response_model=List[AlternativeDiscovery])
def get_portfolio_alternatives(user_id: int = 1, db: Session = Depends(get_db)):
    """
    Scans portfolio holdings for BEARISH SIGNAL or NEUTRAL stocks,
    and returns tax-aware intra-sector alternative recommendations with RAG rationales.
    """
    user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    risk_score = user.risk_score if user else 6

    holdings = db.query(PortfolioHolding).filter(
        PortfolioHolding.user_id == user_id,
        PortfolioHolding.is_active == True
    ).all()

    discoveries = []
    for h in holdings:
        metrics = compute_technical_metrics(h.ticker)
        # Screen alternatives if stock shows BEARISH SIGNAL or NEUTRAL
        if metrics.badge in ["BEARISH SIGNAL", "NEUTRAL/STAGNANT"]:
            alt = discover_sector_alternative(
                holding_id=h.id,
                original_ticker=h.ticker,
                sector=h.sector,
                buy_price=h.average_buy_price,
                current_price=h.current_price,
                quantity=h.quantity,
                purchase_date=h.purchase_date,
                user_risk_score=risk_score
            )
            if alt:
                discoveries.append(alt)

    return discoveries
