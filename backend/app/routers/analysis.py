from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import PortfolioHolding, UserProfile
from app.schemas import TechnicalMetrics, AlternativeDiscovery
from app.engine.indicators import compute_technical_metrics
from app.engine.screener import discover_sector_alternative
from app.engine.sentiment import analyze_sentiment

router = APIRouter(prefix="/analysis", tags=["Algorithmic Analysis & RAG Alternatives"])

@router.get("/metrics/{ticker}", response_model=TechnicalMetrics)
def get_stock_technical_metrics(ticker: str):
    """Returns 130+ pandas-ta computed technical metrics, composite score (-5.0 to +5.0), and FinBERT sentiment."""
    try:
        metrics = compute_technical_metrics(ticker.upper())
        return metrics
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error computing indicators for {ticker}: {str(e)}")

@router.get("/sentiment/{ticker}")
def get_stock_sentiment(ticker: str):
    """Returns FinBERT financial news sentiment analysis and value-trap risk evaluation."""
    try:
        sentiment = analyze_sentiment(ticker.upper())
        return sentiment
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error analyzing sentiment for {ticker}: {str(e)}")

@router.get("/alternatives", response_model=List[AlternativeDiscovery])
def get_portfolio_alternatives(user_id: int = 1, db: Session = Depends(get_db)):
    """
    Scans portfolio holdings for SELL or SWAP stocks,
    and returns tax-aware intra-sector alternative recommendations with FinBERT sentiment and AI RAG rationales.
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
        # Screen alternatives if stock shows SELL or SWAP badge (or lower composite score)
        if metrics.badge in ["SELL", "SWAP"] or metrics.composite_score < 1.5:
            alt = discover_sector_alternative(
                holding_id=h.id,
                original_ticker=h.ticker,
                original_name=h.symbol_name,
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

@router.get("/alternatives/for-holding/{holding_id}", response_model=AlternativeDiscovery)
def get_alternative_for_specific_holding(holding_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    """Returns top intra-sector alternative specifically for a single holding."""
    user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    risk_score = user.risk_score if user else 6

    holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.id == holding_id,
        PortfolioHolding.user_id == user_id,
        PortfolioHolding.is_active == True
    ).first()

    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")

    alt = discover_sector_alternative(
        holding_id=holding.id,
        original_ticker=holding.ticker,
        original_name=holding.symbol_name,
        sector=holding.sector,
        buy_price=holding.average_buy_price,
        current_price=holding.current_price,
        quantity=holding.quantity,
        purchase_date=holding.purchase_date,
        user_risk_score=risk_score
    )
    if not alt:
        raise HTTPException(status_code=404, detail="No suitable alternative found in sector")

    return alt
