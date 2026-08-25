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
    badge: Optional[str] = "HOLD" # 'HOLD', 'SELL', 'SWAP'
    composite_score: Optional[float] = 0.0 # -5.0 to +5.0
    sentiment_label: Optional[str] = "NEUTRAL" # 'BULLISH', 'NEUTRAL', 'BEARISH'

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
    volume_sma_ratio: float = 1.0
    support_level: float
    resistance_level: float
    
    # Algorithmic Weighted Composite Score (-5.0 to +5.0)
    composite_score: float
    momentum_score: float
    trend_score: float
    volume_score: float
    
    # Actionable 3-Tier Badge
    badge: str # 'HOLD', 'SELL', 'SWAP'
    badge_reason: str
    
    # FinBERT Financial News Sentiment Overlay
    sentiment_score: float # -1.0 to +1.0
    sentiment_label: str # 'BULLISH', 'NEUTRAL', 'BEARISH'
    value_trap_risk: bool # True if oversold technicals but severely negative sentiment
    sentiment_headline: str

class AlternativeDiscovery(BaseModel):
    original_holding_id: int
    original_ticker: str
    original_name: str
    original_badge: str
    original_composite_score: float
    
    alternative_ticker: str
    alternative_name: str
    sector: str
    alternative_price: float
    alternative_badge: str
    alternative_composite_score: float
    
    technical_score_improvement: float # e.g. +3.4 points
    correlation_with_original: float # e.g. 0.86
    
    # FinBERT Sentiment Overlay
    sentiment_score: float
    sentiment_label: str
    value_trap_risk: bool
    sentiment_headline: str
    
    # Capital Gains Tax Drag Modeling
    holding_days: int
    tax_type: str # 'STCG' (20%) or 'LTCG' (12.5%)
    tax_rate_pct: float
    unrealized_gain: float
    estimated_tax_payable: float
    net_gain_after_tax: float
    redeployable_capital: float
    new_shares_acquired: float
    
    # RAG Explanatory Rationale
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
    portfolio_health_score: float # 0 to 100

class SwapExecutionRequest(BaseModel):
    holding_id: int
    alternative_ticker: str
    alternative_name: str
    sector: str
    alternative_price: float

class SwapExecutionResponse(BaseModel):
    success: bool
    message: str
    old_ticker: str
    new_ticker: str
    sold_amount: float
    tax_deducted: float
    redeployed_amount: float
    new_quantity: float
    new_holding_id: int

class BacktestRequest(BaseModel):
    ticker: str
    timeframe_years: int = Field(default=3, ge=1, le=5)

class BacktestDataPoint(BaseModel):
    date: str
    price: float
    signal: Optional[str] = None # 'BUY', 'SELL', 'HOLD'
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

