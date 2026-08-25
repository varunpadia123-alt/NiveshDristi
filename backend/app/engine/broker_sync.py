from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models import PortfolioHolding, UserProfile
from app.engine.market_data import get_latest_price

# Seed portfolios for Zerodha Kite and Upstox OAuth sync simulation
MOCK_BROKER_HOLDINGS = {
    "Zerodha Kite": [
        {"ticker": "RELIANCE.NS", "symbol_name": "Reliance Industries Ltd", "sector": "Energy", "quantity": 25.0, "average_buy_price": 2850.0, "purchase_date": "2023-11-15"},
        {"ticker": "TCS.NS", "symbol_name": "Tata Consultancy Services", "sector": "IT Services", "quantity": 15.0, "average_buy_price": 3950.0, "purchase_date": "2024-03-10"},
        {"ticker": "INFY.NS", "symbol_name": "Infosys Ltd", "sector": "IT Services", "quantity": 40.0, "average_buy_price": 1720.0, "purchase_date": "2024-01-20"},
        {"ticker": "TATAMOTORS.NS", "symbol_name": "Tata Motors Ltd", "sector": "Automobile", "quantity": 50.0, "average_buy_price": 980.0, "purchase_date": "2023-08-05"},
        {"ticker": "HDFCBANK.NS", "symbol_name": "HDFC Bank Ltd", "sector": "Banking", "quantity": 30.0, "average_buy_price": 1420.0, "purchase_date": "2024-05-12"}
    ],
    "Upstox": [
        {"ticker": "ICICIBANK.NS", "symbol_name": "ICICI Bank Ltd", "sector": "Banking", "quantity": 35.0, "average_buy_price": 1050.0, "purchase_date": "2023-10-10"},
        {"ticker": "WIPRO.NS", "symbol_name": "Wipro Ltd", "sector": "IT Services", "quantity": 60.0, "average_buy_price": 510.0, "purchase_date": "2024-02-14"},
        {"ticker": "NTPC.NS", "symbol_name": "NTPC Ltd", "sector": "Energy", "quantity": 100.0, "average_buy_price": 310.0, "purchase_date": "2023-12-01"},
        {"ticker": "ITC.NS", "symbol_name": "ITC Ltd", "sector": "Consumer Goods", "quantity": 80.0, "average_buy_price": 440.0, "purchase_date": "2024-04-18"}
    ]
}

def sync_broker_portfolio(db: Session, user_id: int, broker_name: str = "Zerodha Kite"):
    """
    Simulates automated OAuth broker sync with Zerodha Kite Connect or Upstox.
    Fetches user holdings, entry price, and purchase date directly into DB.
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
    
    new_holdings = []
    for item in raw_items:
        current_p = get_latest_price(item["ticker"])
        cost = item["quantity"] * item["average_buy_price"]
        market_val = item["quantity"] * current_p
        pnl = market_val - cost
        pnl_pct = (pnl / cost * 100) if cost > 0 else 0.0

        holding = PortfolioHolding(
            user_id=user_id,
            ticker=item["ticker"],
            symbol_name=item["symbol_name"],
            sector=item["sector"],
            quantity=item["quantity"],
            average_buy_price=item["average_buy_price"],
            purchase_date=item["purchase_date"],
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
