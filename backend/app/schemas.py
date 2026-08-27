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

# --- Live Stock Screener & Search ---
class StockSearchResult(BaseModel):
    ticker: str
    name: str
    sector: str
    market_cap_category: str # 'Large Cap', 'Mid Cap', 'Small Cap'
    current_price: float
    day_change: float
    day_change_pct: float
    market_cap_cr: float
    pe_ratio: float
    high_52w: float
    low_52w: float
    volume: int
    badge: str
    composite_score: float

class TopMoversResponse(BaseModel):
    large_cap_gainers: List[StockSearchResult]
    large_cap_losers: List[StockSearchResult]
    mid_cap_gainers: List[StockSearchResult]
    mid_cap_losers: List[StockSearchResult]
    small_cap_gainers: List[StockSearchResult]
    small_cap_losers: List[StockSearchResult]

class SectorMovement(BaseModel):
    sector_name: str
    index_symbol: str
    current_value: float
    day_change: float
    day_change_pct: float
    advancing_count: int
    declining_count: int
    top_performer: str
    top_performer_gain_pct: float
    sentiment: str # 'BULLISH', 'BEARISH', 'NEUTRAL'

# --- IPO, Bond, ETF Discovery ---
class IPOItem(BaseModel):
    id: str
    name: str
    symbol: str
    price_band: str
    min_price: float
    max_price: float
    issue_size_cr: float
    lot_size: int
    open_date: str
    close_date: str
    listing_date: str
    gmp_inr: float
    estimated_listing_gain_pct: float
    subscription_times: float # e.g. 14.5x
    retail_subscription_times: float
    qib_subscription_times: float
    nii_subscription_times: float
    status: str # 'UPCOMING', 'OPEN', 'CLOSED', 'LISTED'
    ai_rating: str # 'SUBSCRIBE', 'MAY AVOID', 'NEUTRAL'
    ai_summary: str

class BondItem(BaseModel):
    id: str
    name: str
    issuer: str
    bond_type: str # 'SGB' (Sovereign Gold), 'G-Sec', 'Corporate Bond', 'High-Yield'
    coupon_rate_pct: float
    yield_to_maturity_pct: float # YTM
    credit_rating: str # 'SOV', 'CRISIL AAA', 'ICRA AA+', etc.
    maturity_date: str
    min_investment: float
    interest_payout_frequency: str # 'Annual', 'Semi-Annual', 'Monthly', 'Cumulative'
    risk_level: str # 'Low', 'Moderate', 'High'
    tax_status: str

class ETFItem(BaseModel):
    ticker: str
    name: str
    category: str # 'Index', 'Sectoral', 'Gold & Silver', 'Global/Thematic', 'Debt'
    current_nav: float
    day_change_pct: float
    return_1y_pct: float
    return_3y_cagr_pct: float
    expense_ratio_pct: float
    aum_cr: float
    tracking_error_pct: float
    pe_ratio: float
    high_52w: float
    low_52w: float

# --- Pro Intelligence Features ---
class StressTestHoldingImpact(BaseModel):
    ticker: str
    name: str
    sector: str
    current_value: float
    beta: float
    simulated_change_pct: float
    projected_loss_inr: float
    projected_value: float
    vulnerability_rating: str # 'Low', 'Moderate', 'High', 'Severe'

class StressTestResponse(BaseModel):
    scenario_name: str
    scenario_description: str
    nifty_drop_pct: float
    initial_portfolio_value: float
    simulated_portfolio_value: float
    total_loss_inr: float
    total_loss_pct: float
    max_drawdown_holding: str
    resilient_holding: str
    defensive_recommendation: str
    holdings_impact: List[StressTestHoldingImpact]

class RebalanceTarget(BaseModel):
    asset_or_sector: str
    target_pct: float
    current_pct: float
    current_value: float
    target_value: float
    drift_pct: float
    action: str # 'BUY', 'SELL', 'HOLD'
    amount_inr: float
    status: str # 'BALANCED', 'OVERWEIGHT', 'UNDERWEIGHT'

class RebalancingResponse(BaseModel):
    total_portfolio_value: float
    is_drift_detected: bool
    max_drift_pct: float
    rebalancing_urgency: str # 'High', 'Moderate', 'Low'
    allocation_breakdown: List[RebalanceTarget]
    suggested_orders: List[str]

class TaxHarvestHolding(BaseModel):
    holding_id: int
    ticker: str
    name: str
    holding_days: int
    is_short_term: bool # < 365 days
    tax_type: str # 'STCL' or 'LTCL'
    current_value: float
    cost_basis: float
    unrealized_loss: float # negative number or absolute loss
    tax_rate_applicable_pct: float # 20% for STCG, 12.5% for LTCG
    potential_tax_savings_inr: float
    suggested_peer_alternative: str
    harvest_action: str

class TaxLossHarvestingResponse(BaseModel):
    total_unrealized_losses_inr: float
    total_potential_tax_savings_inr: float
    stcl_amount_inr: float
    ltcl_amount_inr: float
    eligible_holdings_count: int
    recommendation_summary: str
    opportunities: List[TaxHarvestHolding]

class CorrelationMatrixResponse(BaseModel):
    tickers: List[str]
    labels: List[str]
    matrix: List[List[float]] # 2D array of correlation values (-1.0 to +1.0)
    high_correlation_pairs: List[str] # e.g. ["HDFCBANK.NS & ICICIBANK.NS (r=0.88)", ...]
    diversification_score: float # 0 to 100

class OptionSignal(BaseModel):
    ticker: str
    company_name: str
    spot_price: float
    strike_price: float
    option_type: str # 'CE' (Call) or 'PE' (Put)
    expiry: str
    rsi_14: float
    moneyness: str # 'ITM', 'ATM', 'OTM'
    signal_type: str # 'BULLISH CALL BUY', 'BEARISH PUT BUY', 'OVERSOLD BOUNCE', 'SHORT COVERING'
    recommended_action: str # 'BUY CALL', 'BUY PUT'
    entry_premium: float
    target_premium: float
    stop_loss_premium: float
    risk_reward_ratio: str
    rationale: str

class OptionsScreenerResponse(BaseModel):
    timestamp: str
    total_screened: int
    call_opportunities: List[OptionSignal]
    put_opportunities: List[OptionSignal]


