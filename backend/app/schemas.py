from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

# User Profile
class UserProfileBase(BaseModel):
    full_name: str
    risk_score: int
    broker_connected: str

class UserRiskProfileUpdate(BaseModel):
    risk_score: int
    broker_connected: Optional[str] = None

class UserProfileResponse(UserProfileBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Portfolio Holdings
class HoldingBase(BaseModel):
    ticker: str
    symbol_name: str
    sector: str
    quantity: float
    average_buy_price: float
    purchase_date: str

class HoldingCreate(HoldingBase):
    pass

class HoldingResponse(HoldingBase):
    id: int
    user_id: int
    current_price: float
    market_value: float
    pnl: float
    pnl_percentage: float
    badge: str
    composite_score: float
    sentiment_label: Optional[str] = "NEUTRAL"
    class Config:
        from_attributes = True

# Portfolio Summary
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
    portfolio_health_score: float

# Technical Analysis & AI Swap
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
    support_level: float
    resistance_level: float
    volume_sma_ratio: float
    momentum_score: float
    trend_score: float
    volume_score: float
    composite_score: float
    badge: str
    badge_reason: str
    sentiment_score: float
    sentiment_label: str
    sentiment_headline: str
    ema_9: Optional[float] = None
    ema_21: Optional[float] = None
    value_trap_risk: Optional[bool] = False

class AlternativeDiscovery(BaseModel):
    original_ticker: str
    original_name: str
    original_composite_score: float
    original_badge: str
    sector: str
    alternative_ticker: str
    alternative_name: str
    alternative_price: float
    alternative_composite_score: float
    alternative_badge: str
    technical_score_improvement: float
    sentiment_score: float
    sentiment_label: str
    sentiment_headline: str
    holding_days: int
    unrealized_gain: float
    tax_type: str
    tax_rate_pct: float
    estimated_tax_payable: float
    redeployable_capital: float
    new_shares_acquired: float
    rag_rationale: str
    original_holding_id: Optional[int] = None
    correlation_with_original: Optional[float] = None
    value_trap_risk: Optional[bool] = False
    net_gain_after_tax: Optional[float] = None
    disclaimer: Optional[str] = None

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

# Backtesting
class BacktestRequest(BaseModel):
    ticker: str
    timeframe_years: int = 3

class BacktestPoint(BaseModel):
    date: str
    strategy_equity: float
    buy_hold_equity: float
    trade_signal: Optional[str] = None
    price: Optional[float] = None
    signal: Optional[str] = None

BacktestDataPoint = BacktestPoint

class BacktestResponse(BaseModel):
    ticker: str
    timeframe_years: int
    cagr_strategy_pct: float
    cagr_buy_hold_pct: float
    win_rate_pct: float
    sharpe_ratio: float
    max_drawdown_pct: float
    total_trades: int
    chart_data: List[BacktestPoint]
    initial_capital: Optional[float] = None
    final_strategy_capital: Optional[float] = None
    final_buy_hold_capital: Optional[float] = None

# Stock Screener & Market Movers
class StockScreenerItem(BaseModel):
    ticker: str
    name: str
    sector: str
    cap_type: str
    current_price: float
    change_pts: float
    day_change_pct: float
    open: float
    day_high: float
    day_low: float
    volume: int
    fifty_two_week_high: float
    fifty_two_week_low: float
    market_cap_cr: float
    pe_ratio: float
    beta: float
    bse_code: Optional[str] = None
    exchanges: List[str] = ["NSE", "BSE"]
    exchange: str = "NSE"
    bse_only: bool = False
    bse_price: Optional[float] = None
    nse_price: Optional[float] = None

class TopMoversResponse(BaseModel):
    largecap_gainers: List[StockScreenerItem]
    largecap_losers: List[StockScreenerItem]
    midcap_gainers: List[StockScreenerItem]
    midcap_losers: List[StockScreenerItem]
    smallcap_gainers: List[StockScreenerItem]
    smallcap_losers: List[StockScreenerItem]

class SectorMovementItem(BaseModel):
    sector: str
    index_name: str
    change_pct: float
    advances: int
    declines: int
    top_performer: str
    top_performer_gain_pct: float

# Indices (Groww-Style)
class MarketIndexItem(BaseModel):
    symbol: str
    name: str
    exchange: str
    country: str
    region: str
    currency: str
    category: str
    current_value: float
    change_pts: float
    day_change_pct: float
    open: float
    day_high: float
    day_low: float
    fifty_two_week_high: float
    fifty_two_week_low: float
    sparkline: List[float]

# Discovery: IPOs, Bonds, ETFs
class IpoItem(BaseModel):
    company_name: str
    symbol: str
    status: str
    price_band: str
    issue_size_cr: float
    lot_size: int
    bidding_dates: str
    gmp_pts: float
    gmp_pct: float
    subscription_rate_x: float
    retail_subscription_x: float
    qib_subscription_x: float
    nii_subscription_x: float
    ai_verdict: str

class BondItem(BaseModel):
    bond_name: str
    category: str
    issuer: str
    coupon_rate_pct: float
    ytm_pct: float
    rating: str
    face_value: float
    market_price: float
    maturity_date: str
    tax_status: str

class EtfItem(BaseModel):
    symbol: str
    name: str
    category: str
    current_nav: float
    day_change_pct: float
    one_year_return_pct: float
    three_year_cagr_pct: float
    expense_ratio_pct: float
    aum_cr: float

# Pro Intelligence Features
class StressTestHoldingResult(BaseModel):
    ticker: str
    name: str
    weight_pct: float
    current_value: float
    beta: float
    estimated_drop_pct: float
    projected_loss: float
    vulnerability_rating: str

class StressTestScenarioResult(BaseModel):
    scenario_name: str
    nifty_shock_pct: float
    projected_portfolio_loss: float
    projected_loss_pct: float
    projected_portfolio_value: float
    holdings_breakdown: List[StressTestHoldingResult]
    ai_risk_advisory: str

class RebalanceAlertItem(BaseModel):
    asset_or_sector: str
    drift_pct: float
    severity: str
    target_weight_pct: Optional[float] = None
    actual_weight_pct: Optional[float] = None
    target_allocation_pct: Optional[float] = None
    current_allocation_pct: Optional[float] = None
    action_needed: Optional[str] = None
    suggested_action: Optional[str] = None
    action_rationale: Optional[str] = None
    rebalance_amount: Optional[float] = 0.0
    category: Optional[str] = "Sector Drift"

class TaxLossHarvestingItem(BaseModel):
    ticker: str
    name: str
    unrealized_loss: float
    sector: Optional[str] = None
    quantity: Optional[float] = None
    average_buy_price: Optional[float] = None
    invested_amount: Optional[float] = None
    current_price: Optional[float] = None
    current_value: Optional[float] = None
    holding_period_days: Optional[int] = None
    holding_duration_days: Optional[int] = None
    tax_classification: Optional[str] = None
    tax_category: Optional[str] = None
    potential_tax_savings: Optional[float] = None
    potential_tax_offset: Optional[float] = None
    recommended_alternative: Optional[str] = None
    rationale: Optional[str] = None
    urgency: Optional[str] = None
    ai_harvest_strategy: Optional[str] = None

class CorrelationMatrixResponse(BaseModel):
    tickers: List[str]
    matrix: List[List[float]]
    average_correlation: Optional[float] = 0.45
    diversification_health: Optional[str] = "GOOD"
    diversification_score: Optional[float] = 78.5
    highest_correlated_pair: Optional[str] = None
    ai_diversification_verdict: Optional[str] = None

class OptionSetupItem(BaseModel):
    ticker: str
    spot_price: float
    strike_price: float
    rsi_14: float
    name: Optional[str] = None
    recommended_option: Optional[str] = None
    option_type: Optional[str] = None
    moneyness: Optional[str] = None
    expiry: Optional[str] = None
    expiry_date: Optional[str] = None
    estimated_premium: Optional[float] = None
    option_premium: Optional[float] = None
    target_premium: Optional[float] = None
    stop_loss: Optional[float] = None
    risk_reward: Optional[str] = None
    risk_reward_ratio: Optional[str] = None
    rationale: Optional[str] = None
    trade_rationale: Optional[str] = None
    implied_volatility_pct: Optional[float] = None
    breakeven_price: Optional[float] = None
    macd_bias: Optional[str] = None

# -------------------------------------------------------------
# Stock Charting & Multi-Timeframe History
# -------------------------------------------------------------
class StockHistoryPoint(BaseModel):
    timestamp: str
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    ema_9: Optional[float] = None

class StockHistoryResponse(BaseModel):
    ticker: str
    name: str
    exchange: str
    current_price: float
    change_pts: float
    day_change_pct: float
    timeframe: str
    interval: str
    candles: List[StockHistoryPoint]
    fifty_two_week_high: float
    fifty_two_week_low: float
    day_high: float
    day_low: float
    volume_total: int

# -------------------------------------------------------------
# AI Chat Advisor Schemas
# -------------------------------------------------------------
class AiChatMessage(BaseModel):
    role: str # "user" | "assistant" | "system"
    content: str
    timestamp: Optional[str] = None
    suggested_actions: Optional[List[str]] = None

class AiChatContext(BaseModel):
    current_ticker: Optional[str] = None
    portfolio_focus: Optional[bool] = False
    user_risk_score: Optional[int] = 6

class AiChatRequest(BaseModel):
    messages: List[AiChatMessage]
    context: Optional[AiChatContext] = None

class AiChatResponse(BaseModel):
    reply: str
    suggested_followups: List[str]
    referenced_stocks: Optional[List[str]] = []
    sentiment_tag: Optional[str] = "BALANCED"

# -------------------------------------------------------------
# AI Stock Analyst Deep Report Schemas
# -------------------------------------------------------------
class AnalystPoint(BaseModel):
    category: str # "Technical", "Fundamental", "Growth", "Valuation", "Risk", "Sentiment"
    title: str
    description: str
    impact: str # "BULLISH" | "BEARISH" | "NEUTRAL"

class TechnicalSummary(BaseModel):
    trend: str
    rsi_status: str
    macd_signal: str
    moving_averages_alignment: str
    key_support: float
    key_resistance: float
    pivot_point: float

class FundamentalSummary(BaseModel):
    valuation_assessment: str
    pe_verdict: str
    market_cap_cr: float
    industry_pe: float
    pb_ratio: float
    roe_pct: float
    beta: float

class SentimentSummary(BaseModel):
    finbert_score: float
    sentiment_label: str
    headline: str
    value_trap_risk: bool
    news_summary: str

class AiStockAnalystReport(BaseModel):
    ticker: str
    company_name: str
    exchange: str
    sector: str
    current_price: float
    verdict: str # "STRONG BUY" | "BUY" | "ACCUMULATE" | "HOLD" | "SELL" | "STRONG SELL"
    verdict_badge_color: str # "emerald" | "green" | "amber" | "rose" | "red"
    confidence_score: int # 0 - 100%
    investment_horizon: str # e.g. "3-6 Months Swing", "1-2 Years Long Term"
    risk_profile: str # "Low Risk" | "Moderate Risk" | "High Volatility"
    
    # Specific Targets & Stoploss
    target_short_term: float # 1-3 Months Target
    target_medium_term: float # 6-12 Months Target
    target_long_term: float # 1-2 Years Target
    stop_loss_level: float
    upside_potential_pct: float
    downside_risk_pct: float
    risk_reward_ratio: str # e.g. "1 : 2.8"
    
    executive_summary: str
    pros: List[AnalystPoint]
    cons: List[AnalystPoint]
    
    technical: TechnicalSummary
    fundamental: FundamentalSummary
    sentiment: SentimentSummary
    
    actionable_strategy: str
    entry_range: str
    target_exit_strategy: str

