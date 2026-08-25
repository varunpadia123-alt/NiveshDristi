from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import PortfolioHolding, UserProfile
from app.schemas import HoldingCreate, HoldingResponse, PortfolioSummary, SectorExposure
from app.engine.broker_sync import sync_broker_portfolio
from app.engine.market_data import get_latest_price
from app.config import settings

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])

@router.get("/summary", response_model=PortfolioSummary)
def get_portfolio_summary(user_id: int = 1, db: Session = Depends(get_db)):
    holdings = db.query(PortfolioHolding).filter(
        PortfolioHolding.user_id == user_id, 
        PortfolioHolding.is_active == True
    ).all()

    # If empty, sync default broker portfolio for user 1
    if not holdings:
        holdings = sync_broker_portfolio(db, user_id=user_id, broker_name="Zerodha Kite")

    user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    broker_name = user.broker_connected if user else "Zerodha Kite"

    total_investment = sum(h.quantity * h.average_buy_price for h in holdings)
    total_current_val = 0.0
    sector_totals = {}

    for h in holdings:
        curr_p = get_latest_price(h.ticker)
        mkt_val = h.quantity * curr_p
        h.current_price = curr_p
        h.market_value = round(mkt_val, 2)
        h.pnl = round(mkt_val - (h.quantity * h.average_buy_price), 2)
        h.pnl_percentage = round((h.pnl / (h.quantity * h.average_buy_price) * 100), 2) if h.average_buy_price > 0 else 0.0
        
        total_current_val += mkt_val
        
        if h.sector not in sector_totals:
            sector_totals[h.sector] = {"value": 0.0, "count": 0}
        sector_totals[h.sector]["value"] += mkt_val
        sector_totals[h.sector]["count"] += 1

    db.commit()

    total_pnl = total_current_val - total_investment
    total_pnl_pct = (total_pnl / total_investment * 100) if total_investment > 0 else 0.0

    # Sector Concentration Risk Analysis
    sector_exposures = []
    concentration_alerts = []

    for sector, data in sector_totals.items():
        pct = (data["value"] / total_current_val * 100) if total_current_val > 0 else 0.0
        is_over = pct > settings.CONCENTRATION_ALERT_THRESHOLD_PCT
        if is_over:
            concentration_alerts.append(
                f"Concentration Alert: {sector} accounts for {pct:.1f}% of your portfolio (Threshold: {settings.CONCENTRATION_ALERT_THRESHOLD_PCT}%)."
            )
        sector_exposures.append(SectorExposure(
            sector=sector,
            value=round(data["value"], 2),
            percentage=round(pct, 1),
            stock_count=data["count"],
            is_overconcentrated=is_over
        ))

    return PortfolioSummary(
        total_investment=round(total_investment, 2),
        total_current_value=round(total_current_val, 2),
        total_pnl=round(total_pnl, 2),
        total_pnl_percentage=round(total_pnl_pct, 2),
        holdings_count=len(holdings),
        broker_connected=broker_name,
        concentration_alerts=concentration_alerts,
        sector_exposures=sector_exposures
    )

@router.get("/holdings", response_model=List[HoldingResponse])
def get_user_holdings(user_id: int = 1, db: Session = Depends(get_db)):
    holdings = db.query(PortfolioHolding).filter(
        PortfolioHolding.user_id == user_id, 
        PortfolioHolding.is_active == True
    ).all()
    if not holdings:
        holdings = sync_broker_portfolio(db, user_id=user_id, broker_name="Zerodha Kite")
    return holdings

@router.post("/sync", response_model=List[HoldingResponse])
def trigger_broker_sync(broker: str = Query(default="Zerodha Kite"), user_id: int = 1, db: Session = Depends(get_db)):
    """Triggers automated broker sync (Zerodha Kite Connect / Upstox)."""
    holdings = sync_broker_portfolio(db, user_id=user_id, broker_name=broker)
    return holdings

@router.post("/add", response_model=HoldingResponse)
def add_manual_holding(holding_in: HoldingCreate, user_id: int = 1, db: Session = Depends(get_db)):
    current_p = get_latest_price(holding_in.ticker)
    cost = holding_in.quantity * holding_in.average_buy_price
    mkt_val = holding_in.quantity * current_p
    pnl = mkt_val - cost
    pnl_pct = (pnl / cost * 100) if cost > 0 else 0.0

    new_holding = PortfolioHolding(
        user_id=user_id,
        ticker=holding_in.ticker.upper(),
        symbol_name=holding_in.symbol_name,
        sector=holding_in.sector,
        quantity=holding_in.quantity,
        average_buy_price=holding_in.average_buy_price,
        purchase_date=holding_in.purchase_date,
        current_price=current_p,
        market_value=round(mkt_val, 2),
        pnl=round(pnl, 2),
        pnl_percentage=round(pnl_pct, 2)
    )
    db.add(new_holding)
    db.commit()
    db.refresh(new_holding)
    return new_holding

@router.delete("/remove/{holding_id}")
def delete_holding(holding_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.id == holding_id,
        PortfolioHolding.user_id == user_id
    ).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    db.delete(holding)
    db.commit()
    return {"message": f"Successfully deleted holding {holding_id}"}
