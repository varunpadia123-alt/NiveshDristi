from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class UserProfile(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, default="Retail Investor")
    email = Column(String, unique=True, index=True, default="user@niveshdristi.in")
    risk_score = Column(Integer, default=6)  # 1 (Most Conservative) to 10 (High Aggressive)
    broker_connected = Column(String, default="Zerodha Kite") # 'Zerodha Kite', 'Upstox', 'Direct'
    created_at = Column(DateTime, default=datetime.utcnow)

    holdings = relationship("PortfolioHolding", back_populates="user", cascade="all, delete-orphan")

class PortfolioHolding(Base):
    __tablename__ = "portfolio_holdings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ticker = Column(String, index=True)          # e.g., 'RELIANCE.NS', 'TCS.NS', 'INFY.NS'
    symbol_name = Column(String)                 # e.g., 'Reliance Industries', 'Tata Consultancy Services'
    sector = Column(String, index=True)          # e.g., 'Energy', 'IT Services', 'Banking'
    quantity = Column(Float, default=1.0)
    average_buy_price = Column(Float, default=0.0)
    purchase_date = Column(String)               # ISO format 'YYYY-MM-DD'
    current_price = Column(Float, default=0.0)
    market_value = Column(Float, default=0.0)
    pnl = Column(Float, default=0.0)
    pnl_percentage = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)

    user = relationship("UserProfile", back_populates="holdings")

class MarketTicker(Base):
    __tablename__ = "market_tickers"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, unique=True, index=True)
    name = Column(String)
    sector = Column(String, index=True)
    market_cap_category = Column(String) # 'LargeCap', 'MidCap', 'SmallCap'
    current_price = Column(Float)
    pe_ratio = Column(Float, nullable=True)
    beta = Column(Float, default=1.0)
    volatility_score = Column(Float, default=5.0)
    last_updated = Column(DateTime, default=datetime.utcnow)
