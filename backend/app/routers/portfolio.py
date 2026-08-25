from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import PortfolioHolding, UserProfile
from app.schemas import (
    HoldingCreate, HoldingResponse, PortfolioSummary, SectorExposure,
    SwapExecutionRequest, SwapExecutionResponse
)
from app.engine.broker_sync import sync_broker_portfolio
from app.engine.market_data import get_latest_price
from app.engine.indicators import compute_technical_metrics
from app.engine.tax import calculate_tax_impact
from app.config import settings

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])

@router.get("/summary", response_model=PortfolioSummary)
def get_portfolio_summary(user_id: int = 1, db: Session = Depends(get_db)):
    holdings = db.query(PortfolioHolding).filter(
        PortfolioHolding.user_id == user_id, 
        PortfolioHolding.is_active == True
    ).all()

    # If empty, seed default broker portfolio for user 1
    if not holdings:
        holdings = sync_broker_portfolio(db, user_id=user_id, broker_name="Zerodha Kite")

    user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    broker_name = user.broker_connected if user else "Zerodha Kite"

    total_investment = sum(h.quantity * h.average_buy_price for h in holdings)
    total_current_val = 0.0
    sector_totals = {}
    total_comp_score = 0.0

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

    # Sector Concentration Risk Analysis (25% threshold)
    sector_exposures = []
    concentration_alerts = []
    overconcentrated_penalty = 0

    for sector, data in sector_totals.items():
        pct = (data["value"] / total_current_val * 100) if total_current_val > 0 else 0.0
        is_over = pct > settings.CONCENTRATION_ALERT_THRESHOLD_PCT
        if is_over:
            overconcentrated_penalty += 15
            concentration_alerts.append(
                f"Concentration Alert: {sector} accounts for {pct:.1f}% of your portfolio (Safety Threshold: {settings.CONCENTRATION_ALERT_THRESHOLD_PCT}%)."
            )
        sector_exposures.append(SectorExposure(
            sector=sector,
            value=round(data["value"], 2),
            percentage=round(pct, 1),
            stock_count=data["count"],
            is_overconcentrated=is_over
        ))

    # Portfolio Health Score calculation (0 to 100)
    base_health = 80.0
    if total_pnl_pct > 0:
        base_health += min(15.0, total_pnl_pct * 0.5)
    else:
        base_health -= min(25.0, abs(total_pnl_pct) * 0.8)
    base_health -= overconcentrated_penalty
    portfolio_health_score = round(float(max(20.0, min(100.0, base_health))), 1)

    return PortfolioSummary(
        total_investment=round(total_investment, 2),
        total_current_value=round(total_current_val, 2),
        total_pnl=round(total_pnl, 2),
        total_pnl_percentage=round(total_pnl_pct, 2),
        holdings_count=len(holdings),
        broker_connected=broker_name,
        concentration_alerts=concentration_alerts,
        sector_exposures=sector_exposures,
        portfolio_health_score=portfolio_health_score
    )

@router.get("/holdings", response_model=List[HoldingResponse])
def get_user_holdings(user_id: int = 1, db: Session = Depends(get_db)):
    holdings = db.query(PortfolioHolding).filter(
        PortfolioHolding.user_id == user_id, 
        PortfolioHolding.is_active == True
    ).all()
    if not holdings:
        holdings = sync_broker_portfolio(db, user_id=user_id, broker_name="Zerodha Kite")
    
    response_list = []
    for h in holdings:
        curr_p = get_latest_price(h.ticker)
        mkt_val = h.quantity * curr_p
        h.current_price = curr_p
        h.market_value = round(mkt_val, 2)
        h.pnl = round(mkt_val - (h.quantity * h.average_buy_price), 2)
        h.pnl_percentage = round((h.pnl / (h.quantity * h.average_buy_price) * 100), 2) if h.average_buy_price > 0 else 0.0
        
        # Attach dynamic technical metrics
        try:
            metrics = compute_technical_metrics(h.ticker)
            badge = metrics.badge
            composite_score = metrics.composite_score
            sentiment_label = metrics.sentiment_label
        except Exception:
            badge = "HOLD"
            composite_score = 0.0
            sentiment_label = "NEUTRAL"
            
        res = HoldingResponse(
            id=h.id,
            user_id=h.user_id,
            ticker=h.ticker,
            symbol_name=h.symbol_name,
            sector=h.sector,
            quantity=h.quantity,
            average_buy_price=h.average_buy_price,
            purchase_date=h.purchase_date,
            current_price=h.current_price,
            market_value=h.market_value,
            pnl=h.pnl,
            pnl_percentage=h.pnl_percentage,
            badge=badge,
            composite_score=composite_score,
            sentiment_label=sentiment_label
        )
        response_list.append(res)

    db.commit()
    return response_list

@router.post("/sync", response_model=List[HoldingResponse])
def trigger_broker_sync(broker: str = Query(default="Zerodha Kite"), user_id: int = 1, db: Session = Depends(get_db)):
    """Triggers automated broker sync (Zerodha Kite, Upstox, Groww, AngelOne)."""
    holdings = sync_broker_portfolio(db, user_id=user_id, broker_name=broker)
    return get_user_holdings(user_id=user_id, db=db)

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
        pnl_percentage=round(pnl_pct, 2),
        is_active=True
    )
    db.add(new_holding)
    db.commit()
    db.refresh(new_holding)
    
    metrics = compute_technical_metrics(new_holding.ticker)
    return HoldingResponse(
        id=new_holding.id,
        user_id=new_holding.user_id,
        ticker=new_holding.ticker,
        symbol_name=new_holding.symbol_name,
        sector=new_holding.sector,
        quantity=new_holding.quantity,
        average_buy_price=new_holding.average_buy_price,
        purchase_date=new_holding.purchase_date,
        current_price=new_holding.current_price,
        market_value=new_holding.market_value,
        pnl=new_holding.pnl,
        pnl_percentage=new_holding.pnl_percentage,
        badge=metrics.badge,
        composite_score=metrics.composite_score,
        sentiment_label=metrics.sentiment_label
    )

@router.post("/swap", response_model=SwapExecutionResponse)
def execute_asset_swap(swap_in: SwapExecutionRequest, user_id: int = 1, db: Session = Depends(get_db)):
    """
    Executes a 1-Click Asset Swap:
    Exits the underperforming holding, deducts tax drag, and redeploys the net proceeds
    into the selected high-potential intra-sector alternative.
    """
    holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.id == swap_in.holding_id,
        PortfolioHolding.user_id == user_id,
        PortfolioHolding.is_active == True
    ).first()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Original holding position not found")

    curr_p = get_latest_price(holding.ticker)
    alt_price = swap_in.alternative_price if swap_in.alternative_price > 0 else get_latest_price(swap_in.alternative_ticker)
    
    tax_info = calculate_tax_impact(
        purchase_date_str=holding.purchase_date,
        current_price=curr_p,
        buy_price=holding.average_buy_price,
        quantity=holding.quantity,
        alt_price=alt_price
    )
    
    old_ticker = holding.ticker
    redeployable = tax_info["redeployable_capital"]
    new_qty = round(redeployable / alt_price, 2)
    today_str = datetime.now().strftime("%Y-%m-%d")

    # Replace holding with new asset
    holding.ticker = swap_in.alternative_ticker.upper()
    holding.symbol_name = swap_in.alternative_name
    holding.sector = swap_in.sector
    holding.quantity = new_qty
    holding.average_buy_price = alt_price
    holding.purchase_date = today_str
    holding.current_price = alt_price
    holding.market_value = round(new_qty * alt_price, 2)
    holding.pnl = 0.0
    holding.pnl_percentage = 0.0

    db.commit()
    db.refresh(holding)

    return SwapExecutionResponse(
        success=True,
        message=f"Successfully swapped {old_ticker} into {holding.ticker}. Redeployed Rs {redeployable:,.2f} ({new_qty} shares).",
        old_ticker=old_ticker,
        new_ticker=holding.ticker,
        sold_amount=round(holding.quantity * curr_p, 2),
        tax_deducted=tax_info["estimated_tax_payable"],
        redeployed_amount=redeployable,
        new_quantity=new_qty,
        new_holding_id=holding.id
    )

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
