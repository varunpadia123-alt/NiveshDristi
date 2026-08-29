from sqlalchemy import Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from typing import List, Optional
from app.database import Base

class UserProfile(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String, default="Retail Investor")
    email: Mapped[str] = mapped_column(String, unique=True, index=True, default="user@niveshdristi.in")
    risk_score: Mapped[int] = mapped_column(Integer, default=6)  # 1 (Most Conservative) to 10 (High Aggressive)
    broker_connected: Mapped[str] = mapped_column(String, default="Zerodha Kite") # 'Zerodha Kite', 'Upstox', 'Direct'
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    holdings: Mapped[List["PortfolioHolding"]] = relationship("PortfolioHolding", back_populates="user", cascade="all, delete-orphan")

class PortfolioHolding(Base):
    __tablename__ = "portfolio_holdings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    ticker: Mapped[str] = mapped_column(String, index=True)          # e.g., 'RELIANCE.NS', 'TCS.NS', 'INFY.NS'
    symbol_name: Mapped[str] = mapped_column(String)                 # e.g., 'Reliance Industries', 'Tata Consultancy Services'
    sector: Mapped[str] = mapped_column(String, index=True)          # e.g., 'Energy', 'IT Services', 'Banking'
    quantity: Mapped[float] = mapped_column(Float, default=1.0)
    average_buy_price: Mapped[float] = mapped_column(Float, default=0.0)
    purchase_date: Mapped[str] = mapped_column(String)               # ISO format 'YYYY-MM-DD'
    current_price: Mapped[float] = mapped_column(Float, default=0.0)
    market_value: Mapped[float] = mapped_column(Float, default=0.0)
    pnl: Mapped[float] = mapped_column(Float, default=0.0)
    pnl_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped[Optional["UserProfile"]] = relationship("UserProfile", back_populates="holdings")

class MarketTicker(Base):
    __tablename__ = "market_tickers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ticker: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    sector: Mapped[str] = mapped_column(String, index=True)
    market_cap_category: Mapped[str] = mapped_column(String) # 'LargeCap', 'MidCap', 'SmallCap'
    current_price: Mapped[float] = mapped_column(Float)
    pe_ratio: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    beta: Mapped[float] = mapped_column(Float, default=1.0)
    volatility_score: Mapped[float] = mapped_column(Float, default=5.0)
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
