export type BadgeType = "HOLD" | "SELL" | "SWAP";
export type SentimentLabelType = "BULLISH" | "NEUTRAL" | "BEARISH";

export interface Holding {
  id: number;
  user_id: number;
  ticker: string;
  symbol_name: string;
  sector: string;
  quantity: number;
  average_buy_price: number;
  purchase_date: string;
  current_price: number;
  market_value: number;
  pnl: number;
  pnl_percentage: number;
  badge: BadgeType;
  composite_score: number;
  sentiment_label: SentimentLabelType;
}

export interface SectorExposure {
  sector: string;
  value: number;
  percentage: number;
  stock_count: number;
  is_overconcentrated: boolean;
}

export interface PortfolioSummary {
  total_investment: number;
  total_current_value: number;
  total_pnl: number;
  total_pnl_percentage: number;
  holdings_count: number;
  broker_connected: string;
  concentration_alerts: string[];
  sector_exposures: SectorExposure[];
  portfolio_health_score: number;
}

export interface TechnicalMetrics {
  ticker: string;
  current_price: number;
  rsi_14: number;
  macd_line: number;
  macd_signal: number;
  macd_hist: number;
  sma_20: number;
  sma_50: number;
  sma_200: number;
  ema_9: number;
  ema_21: number;
  volume_sma_ratio: number;
  support_level: number;
  resistance_level: number;
  composite_score: number;
  momentum_score: number;
  trend_score: number;
  volume_score: number;
  badge: BadgeType;
  badge_reason: string;
  sentiment_score: number;
  sentiment_label: SentimentLabelType;
  value_trap_risk: boolean;
  sentiment_headline: string;
}

export interface AlternativeDiscovery {
  original_holding_id: number;
  original_ticker: string;
  original_name: string;
  original_badge: BadgeType;
  original_composite_score: number;
  alternative_ticker: string;
  alternative_name: string;
  sector: string;
  alternative_price: number;
  alternative_badge: BadgeType;
  alternative_composite_score: number;
  technical_score_improvement: number;
  correlation_with_original: number;
  sentiment_score: number;
  sentiment_label: SentimentLabelType;
  value_trap_risk: boolean;
  sentiment_headline: string;
  holding_days: number;
  tax_type: string;
  tax_rate_pct: number;
  unrealized_gain: number;
  estimated_tax_payable: number;
  net_gain_after_tax: number;
  redeployable_capital: number;
  new_shares_acquired: number;
  rag_rationale: string;
  disclaimer: string;
}

export interface SwapExecutionRequest {
  holding_id: number;
  alternative_ticker: string;
  alternative_name: string;
  sector: string;
  alternative_price: number;
}

export interface SwapExecutionResponse {
  success: boolean;
  message: string;
  old_ticker: string;
  new_ticker: string;
  sold_amount: number;
  tax_deducted: number;
  redeployed_amount: number;
  new_quantity: number;
  new_holding_id: number;
}

export interface BacktestDataPoint {
  date: string;
  price: number;
  signal?: string | null;
  strategy_equity: number;
  buy_hold_equity: number;
}

export interface BacktestResponse {
  ticker: string;
  timeframe_years: number;
  initial_capital: number;
  final_strategy_capital: number;
  final_buy_hold_capital: number;
  cagr_strategy_pct: number;
  cagr_buy_hold_pct: number;
  win_rate_pct: number;
  max_drawdown_pct: number;
  sharpe_ratio: number;
  total_trades: number;
  chart_data: BacktestDataPoint[];
}

// --- Live Market Screener Types ---
export interface StockSearchResult {
  ticker: string;
  name: string;
  sector: string;
  market_cap_category: string; // 'Large Cap', 'Mid Cap', 'Small Cap'
  current_price: number;
  day_change: number;
  day_change_pct: number;
  market_cap_cr: number;
  pe_ratio: number;
  high_52w: number;
  low_52w: number;
  volume: number;
  badge: BadgeType;
  composite_score: number;
}

export interface TopMoversResponse {
  large_cap_gainers: StockSearchResult[];
  large_cap_losers: StockSearchResult[];
  mid_cap_gainers: StockSearchResult[];
  mid_cap_losers: StockSearchResult[];
  small_cap_gainers: StockSearchResult[];
  small_cap_losers: StockSearchResult[];
}

export interface SectorMovement {
  sector_name: string;
  index_symbol: string;
  current_value: number;
  day_change: number;
  day_change_pct: number;
  advancing_count: number;
  declining_count: number;
  top_performer: string;
  top_performer_gain_pct: number;
  sentiment: SentimentLabelType;
}

// --- Discovery Types (IPO, Bond, ETF) ---
export interface IPOItem {
  id: string;
  name: string;
  symbol: string;
  price_band: string;
  min_price: number;
  max_price: number;
  issue_size_cr: number;
  lot_size: number;
  open_date: string;
  close_date: string;
  listing_date: string;
  gmp_inr: number;
  estimated_listing_gain_pct: number;
  subscription_times: number;
  retail_subscription_times: number;
  qib_subscription_times: number;
  nii_subscription_times: number;
  status: "UPCOMING" | "OPEN" | "CLOSED" | "LISTED";
  ai_rating: "SUBSCRIBE" | "MAY AVOID" | "NEUTRAL";
  ai_summary: string;
}

export interface BondItem {
  id: string;
  name: string;
  issuer: string;
  bond_type: "SGB" | "G-Sec" | "Corporate Bond" | "High-Yield";
  coupon_rate_pct: number;
  yield_to_maturity_pct: number;
  credit_rating: string;
  maturity_date: string;
  min_investment: number;
  interest_payout_frequency: string;
  risk_level: "Low" | "Moderate" | "High";
  tax_status: string;
}

export interface ETFItem {
  ticker: string;
  name: string;
  category: "Index" | "Sectoral" | "Gold & Silver" | "Global/Thematic" | "Debt";
  current_nav: number;
  day_change_pct: number;
  return_1y_pct: number;
  return_3y_cagr_pct: number;
  expense_ratio_pct: number;
  aum_cr: number;
  tracking_error_pct: number;
  pe_ratio: number;
  high_52w: number;
  low_52w: number;
}

// --- Pro Intelligence Types ---
export interface StressTestHoldingImpact {
  ticker: string;
  name: string;
  sector: string;
  current_value: number;
  beta: number;
  simulated_change_pct: number;
  projected_loss_inr: number;
  projected_value: number;
  vulnerability_rating: "Low" | "Moderate" | "High" | "Severe";
}

export interface StressTestResponse {
  scenario_name: string;
  scenario_description: string;
  nifty_drop_pct: number;
  initial_portfolio_value: number;
  simulated_portfolio_value: number;
  total_loss_inr: number;
  total_loss_pct: number;
  max_drawdown_holding: string;
  resilient_holding: string;
  defensive_recommendation: string;
  holdings_impact: StressTestHoldingImpact[];
}

export interface RebalanceTarget {
  asset_or_sector: string;
  target_pct: number;
  current_pct: number;
  current_value: number;
  target_value: number;
  drift_pct: number;
  action: "BUY" | "SELL" | "HOLD";
  amount_inr: number;
  status: "BALANCED" | "OVERWEIGHT" | "UNDERWEIGHT";
}

export interface RebalancingResponse {
  total_portfolio_value: number;
  is_drift_detected: boolean;
  max_drift_pct: number;
  rebalancing_urgency: "High" | "Moderate" | "Low";
  allocation_breakdown: RebalanceTarget[];
  suggested_orders: string[];
}

export interface TaxHarvestHolding {
  holding_id: number;
  ticker: string;
  name: string;
  holding_days: number;
  is_short_term: boolean;
  tax_type: string;
  current_value: number;
  cost_basis: number;
  unrealized_loss: number;
  tax_rate_applicable_pct: number;
  potential_tax_savings_inr: number;
  suggested_peer_alternative: string;
  harvest_action: string;
}

export interface TaxLossHarvestingResponse {
  total_unrealized_losses_inr: number;
  total_potential_tax_savings_inr: number;
  stcl_amount_inr: number;
  ltcl_amount_inr: number;
  eligible_holdings_count: number;
  recommendation_summary: string;
  opportunities: TaxHarvestHolding[];
}

export interface CorrelationMatrixResponse {
  tickers: string[];
  labels: string[];
  matrix: number[][];
  high_correlation_pairs: string[];
  diversification_score: number;
}

export interface OptionSignal {
  ticker: string;
  company_name: string;
  spot_price: number;
  strike_price: number;
  option_type: "CE" | "PE";
  expiry: string;
  rsi_14: number;
  moneyness: "ITM" | "ATM" | "OTM";
  signal_type: string;
  recommended_action: "BUY CALL (CE)" | "BUY PUT (PE)";
  entry_premium: number;
  target_premium: number;
  stop_loss_premium: number;
  risk_reward_ratio: string;
  rationale: string;
}

export interface OptionsScreenerResponse {
  timestamp: string;
  total_screened: number;
  call_opportunities: OptionSignal[];
  put_opportunities: OptionSignal[];
}
