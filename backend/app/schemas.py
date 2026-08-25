from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class HoldingCreate(BaseModel):
    ticker: str
    symbol_name: str
    sector: str
    quantity: float
    average_buy_price: float
    purchase_date: str

class HoldingResponse(HoldingCreate):
    id: int
    user_id: int
    current_price: float
    market_value: float
    pnl: float
    pnl_percentage: float

    class Config:
        from_attributes = True

class TechnicalMetrics(BaseModel):
    ticker: str
    current_price: float
    rsi_14: float
    macd_line: float
    macd_signal: float
    macd_hist: float
    sma_20: float
    sma_50: float
    sma_200: float
    ema_9: float
    ema_21: float
    badge: str # 'BULLISH TREND', 'BEARISH SIGNAL', 'NEUTRAL/STAGNANT'
    badge_reason: str
    support_level: float
    resistance_level: float

class AlternativeDiscovery(BaseModel):
    original_holding_id: int
    original_ticker: str
    original_badge: str
    alternative_ticker: str
    alternative_name: str
    sector: str
    alternative_price: float
    alternative_badge: str
    technical_score_improvement: float # e.g. +24.5%
    correlation_with_original: float # e.g. 0.82
    
    # Tax awareness
    holding_days: int
    tax_type: str # 'STCG' (Short Term Capital Gains) or 'LTCG' (Long Term)
    tax_rate_pct: float
    unrealized_gain: float
    estimated_tax_payable: float
    net_gain_after_tax: float
    
    # RAG Rationale
    rag_rationale: str
    disclaimer: str

class SectorExposure(BaseModel):
    sector: str
    value: float
    percentage: float
    stock_count: int
    is_overconcentrated: bool

class PortfolioSummary(BaseModel):
    total_investment: float
    total_current_value: float
    total_pnl: float
    total_pnl_percentage: float
    holdings_count: int
    broker_connected: str
    concentration_alerts: List[str]
    sector_exposures: List[SectorExposure]

class BacktestRequest(BaseModel):
    ticker: str
    timeframe_years: int = Field(default=3, ge=1, le=5)

class BacktestDataPoint(BaseModel):
    date: str
    price: float
    signal: Optional[str] = None # 'BUY', 'SELL', None
    strategy_equity: float
    buy_hold_equity: float

class BacktestResponse(BaseModel):
    ticker: str
    timeframe_years: int
    initial_capital: float
    final_strategy_capital: float
    final_buy_hold_capital: float
    cagr_strategy_pct: float
    cagr_buy_hold_pct: float
    win_rate_pct: float
    max_drawdown_pct: float
    sharpe_ratio: float
    total_trades: int
    chart_data: List[BacktestDataPoint]

class UserRiskProfileUpdate(BaseModel):
    risk_score: int = Field(..., ge=1, le=10)
    broker_connected: Optional[str] = "Zerodha Kite"
