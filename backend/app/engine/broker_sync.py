from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models import PortfolioHolding, UserProfile
from app.engine.market_data import get_latest_price

# Seed portfolios for Zerodha Kite and Upstox OAuth sync simulation
MOCK_BROKER_HOLDINGS: Dict[str, List[Dict[str, Any]]] = {
    "Zerodha Kite": [
        {"ticker": "RELIANCE.NS", "symbol_name": "Reliance Industries Ltd", "sector": "Energy", "quantity": 25.0, "average_buy_price": 2850.0, "purchase_date": "2023-11-15"},
        {"ticker": "TCS.NS", "symbol_name": "Tata Consultancy Services", "sector": "IT Services", "quantity": 15.0, "average_buy_price": 3950.0, "purchase_date": "2024-03-10"},
        {"ticker": "INFY.NS", "symbol_name": "Infosys Ltd", "sector": "IT Services", "quantity": 40.0, "average_buy_price": 1720.0, "purchase_date": "2024-01-20"},
        {"ticker": "M&M.NS", "symbol_name": "Mahindra & Mahindra Ltd", "sector": "Automobile", "quantity": 30.0, "average_buy_price": 2750.0, "purchase_date": "2023-08-05"},
        {"ticker": "HDFCBANK.NS", "symbol_name": "HDFC Bank Ltd", "sector": "Banking", "quantity": 30.0, "average_buy_price": 1420.0, "purchase_date": "2024-05-12"}
    ],
    "Upstox": [
        {"ticker": "ICICIBANK.NS", "symbol_name": "ICICI Bank Ltd", "sector": "Banking", "quantity": 35.0, "average_buy_price": 1050.0, "purchase_date": "2023-10-10"},
        {"ticker": "WIPRO.NS", "symbol_name": "Wipro Ltd", "sector": "IT Services", "quantity": 60.0, "average_buy_price": 510.0, "purchase_date": "2024-02-14"},
        {"ticker": "NTPC.NS", "symbol_name": "NTPC Ltd", "sector": "Energy", "quantity": 100.0, "average_buy_price": 310.0, "purchase_date": "2023-12-01"},
        {"ticker": "ITC.NS", "symbol_name": "ITC Ltd", "sector": "Consumer Goods", "quantity": 80.0, "average_buy_price": 440.0, "purchase_date": "2024-04-18"}
    ]
}

def sync_broker_portfolio(db: Session, user_id: int, broker_name: str = "Zerodha Kite") -> List[PortfolioHolding]:
    """
    Simulates automated OAuth broker sync with Zerodha Kite Connect or Upstox.
    Fetches real-time portfolio holdings, calculates PnL, and stores in database.
    """
    user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if not user:
        user = UserProfile(id=user_id, full_name="Retail Investor", risk_score=6, broker_connected=broker_name)
        db.add(user)
        db.commit()
    else:
        user.broker_connected = broker_name
        db.commit()

    # Clear old active holdings for fresh broker sync
    db.query(PortfolioHolding).filter(PortfolioHolding.user_id == user_id).delete()
    db.commit()

    raw_items = MOCK_BROKER_HOLDINGS.get(broker_name, MOCK_BROKER_HOLDINGS["Zerodha Kite"])
    
    new_holdings: List[PortfolioHolding] = []
    for item in raw_items:
        ticker_str = str(item["ticker"])
        qty = float(item["quantity"])
        buy_p = float(item["average_buy_price"])
        current_p = get_latest_price(ticker_str)
        cost = qty * buy_p
        market_val = qty * current_p
        pnl = market_val - cost
        pnl_pct = (pnl / cost * 100) if cost > 0 else 0.0

        holding = PortfolioHolding(
            user_id=user_id,
            ticker=ticker_str,
            symbol_name=str(item["symbol_name"]),
            sector=str(item["sector"]),
            quantity=qty,
            average_buy_price=buy_p,
            purchase_date=str(item["purchase_date"]),
            current_price=current_p,
            market_value=round(market_val, 2),
            pnl=round(pnl, 2),
            pnl_percentage=round(pnl_pct, 2),
            is_active=True
        )
        db.add(holding)
        new_holdings.append(holding)

    db.commit()
    return new_holdings
