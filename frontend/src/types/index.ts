export type BadgeType = "HOLD" | "SELL" | "SWAP";

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
  sentiment_label?: string;
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
  ema_9?: number;
  ema_21?: number;
  support_level: number;
  resistance_level: number;
  volume_sma_ratio: number;
  momentum_score: number;
  trend_score: number;
  volume_score: number;
  composite_score: number;
  badge: BadgeType;
  badge_reason: string;
  sentiment_score: number;
  sentiment_label: string;
  value_trap_risk?: boolean;
  sentiment_headline: string;
}

export interface AlternativeDiscovery {
  original_ticker: string;
  original_name: string;
  original_composite_score: number;
  original_badge: string;
  sector: string;
  alternative_ticker: string;
  alternative_name: string;
  alternative_price: number;
  alternative_composite_score: number;
  alternative_badge: string;
  technical_score_improvement: number;
  sentiment_score: number;
  sentiment_label: string;
  sentiment_headline: string;
  holding_days: number;
  unrealized_gain: number;
  tax_type: string;
  tax_rate_pct: number;
  estimated_tax_payable: number;
  redeployable_capital: number;
  new_shares_acquired: number;
  rag_rationale: string;
}

export interface SwapExecutionPayload {
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
  strategy_equity: number;
  buy_hold_equity: number;
  trade_signal?: string;
}

export interface BacktestResponse {
  ticker: string;
  timeframe_years: number;
  cagr_strategy_pct: number;
  cagr_buy_hold_pct: number;
  win_rate_pct: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  total_trades: number;
  chart_data: BacktestDataPoint[];
}

export interface StockScreenerItem {
  ticker: string;
  name: string;
  sector: string;
  cap_type: "largecap" | "midcap" | "smallcap";
  current_price: number;
  change_pts: number;
  day_change_pct: number;
  open: number;
  day_high: number;
  day_low: number;
  volume: number;
  fifty_two_week_high: number;
  fifty_two_week_low: number;
  market_cap_cr: number;
  market_cap_category?: string;
  pe_ratio: number;
  beta: number;
  badge?: string;
  bse_code?: string;
  exchanges?: string[];
  exchange?: string;
  bse_only?: boolean;
  bse_price?: number;
  nse_price?: number;
}

export type StockSearchResult = StockScreenerItem;

export interface TopMoversResponse {
  largecap_gainers: StockScreenerItem[];
  largecap_losers: StockScreenerItem[];
  midcap_gainers: StockScreenerItem[];
  midcap_losers: StockScreenerItem[];
  smallcap_gainers: StockScreenerItem[];
  smallcap_losers: StockScreenerItem[];
  large_cap_gainers?: StockScreenerItem[];
  large_cap_losers?: StockScreenerItem[];
  mid_cap_gainers?: StockScreenerItem[];
  mid_cap_losers?: StockScreenerItem[];
  small_cap_gainers?: StockScreenerItem[];
  small_cap_losers?: StockScreenerItem[];
}

export interface SectorMovementItem {
  sector: string;
  sector_name?: string;
  index_name: string;
  index_symbol?: string;
  current_value?: number;
  change_pct: number;
  day_change_pct?: number;
  advances: number;
  declines: number;
  advancing_count?: number;
  declining_count?: number;
  top_performer: string;
  top_performer_gain_pct: number;
}

export type SectorMovement = SectorMovementItem;

export interface MarketIndexItem {
  symbol: string;
  name: string;
  exchange: string;
  country: string;
  region: string;
  currency: string;
  category: string;
  current_value: number;
  change_pts: number;
  day_change_pct: number;
  open: number;
  day_high: number;
  day_low: number;
  fifty_two_week_high: number;
  fifty_two_week_low: number;
  sparkline: number[];
}

export interface IpoItem {
  id?: number;
  company_name: string;
  name?: string;
  symbol: string;
  status: "UPCOMING" | "OPEN" | "CLOSED" | "LISTED";
  price_band: string;
  max_price?: number;
  issue_size_cr: number;
  lot_size: number;
  bidding_dates?: string;
  open_date?: string;
  close_date?: string;
  listing_date?: string;
  gmp_pts?: number;
  gmp_inr?: number;
  gmp_pct?: number;
  estimated_listing_gain_pct?: number;
  subscription_rate_x?: number;
  subscription_times?: number;
  retail_subscription_x?: number;
  qib_subscription_x?: number;
  nii_subscription_x?: number;
  ai_verdict?: string;
  ai_rating?: string;
  ai_summary?: string;
}

export type IPOItem = IpoItem;

export interface BondItem {
  id?: number;
  bond_name: string;
  name?: string;
  category: "SGB" | "G-Sec" | "Corporate Bond";
  issuer: string;
  coupon_rate_pct: number;
  ytm_pct: number;
  rating: string;
  face_value: number;
  market_price: number;
  maturity_date: string;
  tax_status: string;
  interest_payout_frequency?: string;
  min_investment?: number;
  risk_level?: string;
}

export interface EtfItem {
  id?: number;
  symbol: string;
  ticker?: string;
  name: string;
  category: "Index ETF" | "Sectoral ETF" | "Gold & Silver" | "Global ETF";
  current_nav: number;
  day_change_pct: number;
  one_year_return_pct?: number;
  return_1y_pct?: number;
  three_year_cagr_pct?: number;
  return_3y_cagr_pct?: number;
  expense_ratio_pct: number;
  aum_cr: number;
  low_52w?: number;
  high_52w?: number;
}

export type ETFItem = EtfItem;

export interface MtfStockItem {
  ticker: string;
  name: string;
  sector: string;
  current_price: number;
  day_change_pct: number;
  margin_required_pct: number;
  leverage_multiplier: number;
  funding_rate_daily_pct: number;
  funding_rate_annual_pct: number;
  holding_period_days: number;
  pledge_collateral_eligible: boolean;
  max_position_size_cr: number;
}

export interface CorporateEventItem {
  ticker: string;
  company_name: string;
  event_type: "DIVIDEND" | "EARNINGS" | "BOARD_MEETING" | "BONUS" | "SPLIT" | string;
  event_date: string;
  description: string;
  impact: "HIGH" | "MEDIUM" | "LOW" | string;
  action_item?: string;
}

export interface StressTestHoldingResult {
  ticker: string;
  name: string;
  weight_pct: number;
  current_value: number;
  beta: number;
  estimated_drop_pct: number;
  projected_loss: number;
  vulnerability_rating: "HIGH" | "MODERATE" | "LOW / DEFENSIVE";
}

export interface StressTestScenarioResult {
  scenario_name: string;
  nifty_shock_pct: number;
  projected_portfolio_loss: number;
  projected_loss_pct: number;
  projected_portfolio_value: number;
  initial_portfolio_value?: number;
  simulated_portfolio_value?: number;
  total_loss_pct?: number;
  total_loss_inr?: number;
  max_drawdown_holding?: string;
  resilient_holding?: string;
  holdings_impact?: Array<{
    ticker: string;
    name: string;
    weight_pct: number;
    beta: number;
    projected_drop_pct: number;
    projected_loss_inr: number;
    risk_level: string;
  }>;
  holdings_breakdown: StressTestHoldingResult[];
  defensive_recommendation?: string;
  ai_risk_advisory: string;
}

export type StressTestResponse = StressTestScenarioResult;

export interface RebalanceAlertItem {
  asset_or_sector: string;
  target_weight_pct: number;
  actual_weight_pct: number;
  drift_pct: number;
  severity: "HIGH" | "MEDIUM" | "LOW";
  action_needed: string;
  rebalance_amount: number;
}

export interface RebalancingResponse {
  alerts?: RebalanceAlertItem[];
  is_drift_detected?: boolean;
  rebalancing_urgency?: string;
  max_drift_pct?: number;
  allocation_breakdown?: Array<{
    sector: string;
    current_pct: number;
    target_pct: number;
    drift_pct: number;
    action: string;
  }>;
  suggested_orders?: Array<{
    action: "BUY" | "SELL";
    ticker_or_sector: string;
    target_amount: number;
    rationale: string;
  }>;
  rebalancing_orders?: any[];
  is_rebalanced?: boolean;
}

export interface TaxLossHarvestingItem {
  holding_id?: number;
  ticker: string;
  name: string;
  sector?: string;
  cost_basis?: number;
  invested_amount?: number;
  current_value?: number;
  current_price?: number;
  quantity?: number;
  average_buy_price?: number;
  unrealized_loss: number;
  holding_days?: number;
  holding_period_days?: number;
  holding_duration_days?: number;
  tax_type?: string;
  tax_classification?: string;
  tax_category?: string;
  harvest_action?: string;
  potential_tax_savings?: number;
  potential_tax_savings_inr?: number;
  potential_tax_offset?: number;
  suggested_peer_alternative?: string;
  recommended_alternative?: string;
  rationale?: string;
  urgency?: string;
  ai_harvest_strategy?: string;
}

export interface TaxLossHarvestingResponse {
  opportunities?: TaxLossHarvestingItem[];
  total_potential_savings?: number;
  total_potential_tax_savings_inr?: number;
  total_loss_harvestable?: number;
  total_unrealized_losses_inr?: number;
  stcl_amount_inr?: number;
  eligible_holdings_count?: number;
}

export interface CorrelationMatrixResponse {
  tickers: string[];
  labels?: string[];
  matrix: number[][];
  average_correlation: number;
  diversification_score?: number;
  diversification_health: string;
  high_correlation_pairs?: Array<{ pair: string; correlation: number }>;
}

export interface OptionSetupItem {
  ticker: string;
  company_name?: string;
  spot_price: number;
  rsi_14: number;
  macd_bias: string;
  option_type: string;
  strike_price: number;
  moneyness: string;
  expiry: string;
  entry_premium?: number;
  estimated_premium: number;
  target_premium: number;
  stop_loss: number;
  stop_loss_premium?: number;
  risk_reward: string;
  risk_reward_ratio?: string;
  recommended_action?: string;
  rationale: string;
}

export type OptionSignal = OptionSetupItem;

export interface OptionsScreenerResponse {
  signals?: OptionSetupItem[];
  call_opportunities?: OptionSetupItem[];
  put_opportunities?: OptionSetupItem[];
}

// -------------------------------------------------------------
// Stock Charting & Multi-Timeframe History
// -------------------------------------------------------------
export interface StockHistoryPoint {
  timestamp: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma_20?: number | null;
  sma_50?: number | null;
  ema_9?: number | null;
}

export interface StockHistoryResponse {
  ticker: string;
  name: string;
  exchange: string;
  current_price: number;
  change_pts: number;
  day_change_pct: number;
  timeframe: string;
  interval: string;
  candles: StockHistoryPoint[];
  fifty_two_week_high: number;
  fifty_two_week_low: number;
  day_high: number;
  day_low: number;
  volume_total: number;
}

// -------------------------------------------------------------
// AI Chat Advisor Types
// -------------------------------------------------------------
export interface AiChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  suggested_actions?: string[];
}

export interface AiChatContext {
  current_ticker?: string;
  portfolio_focus?: boolean;
  user_risk_score?: number;
}

export interface AiChatRequest {
  messages: AiChatMessage[];
  context?: AiChatContext;
}

export interface AiChatResponse {
  reply: string;
  suggested_followups: string[];
  referenced_stocks?: string[];
  sentiment_tag?: string;
}

// -------------------------------------------------------------
// AI Stock Analyst Deep Report Types
// -------------------------------------------------------------
export interface AnalystPoint {
  category: string;
  title: string;
  description: string;
  impact: "BULLISH" | "BEARISH" | "NEUTRAL";
}

export interface TechnicalSummary {
  trend: string;
  rsi_status: string;
  macd_signal: string;
  moving_averages_alignment: string;
  key_support: number;
  key_resistance: number;
  pivot_point: number;
}

export interface FundamentalSummary {
  valuation_assessment: string;
  pe_verdict: string;
  market_cap_cr: number;
  industry_pe: number;
  pb_ratio: number;
  roe_pct: number;
  beta: number;
}

export interface SentimentSummary {
  finbert_score: number;
  sentiment_label: string;
  headline: string;
  value_trap_risk: boolean;
  news_summary: string;
}

export interface AiStockAnalystReport {
  ticker: string;
  company_name: string;
  exchange: string;
  sector: string;
  current_price: number;
  verdict: "STRONG BUY" | "BUY" | "ACCUMULATE" | "HOLD" | "SELL" | "STRONG SELL";
  verdict_badge_color: "emerald" | "green" | "amber" | "rose" | "red" | string;
  confidence_score: number;
  investment_horizon: string;
  risk_profile: string;
  
  target_short_term: number;
  target_medium_term: number;
  target_long_term: number;
  stop_loss_level: number;
  upside_potential_pct: number;
  downside_risk_pct: number;
  risk_reward_ratio: string;
  
  executive_summary: string;
  pros: AnalystPoint[];
  cons: AnalystPoint[];
  
  technical: TechnicalSummary;
  fundamental: FundamentalSummary;
  sentiment: SentimentSummary;
  
  actionable_strategy: string;
  entry_range: string;
  target_exit_strategy: string;
}

// -------------------------------------------------------------
// Groww-Style 5-Tab Detailed Stock View Types
// -------------------------------------------------------------
export interface MarketDepthOrder {
  price: number;
  quantity: number;
  orders: number;
}

export interface MarketDepthSnapshot {
  buy_depth: MarketDepthOrder[];
  sell_depth: MarketDepthOrder[];
  total_buy_qty: number;
  total_sell_qty: number;
}

export interface CompanyProfile {
  about: string;
  ceo: string;
  founded_year: number;
  headquarters: string;
  isin: string;
  industry: string;
  website: string;
}

export interface StockOverviewData {
  current_price: number;
  change_pts: number;
  day_change_pct: number;
  open: number;
  prev_close: number;
  day_high: number;
  day_low: number;
  fifty_two_week_high: number;
  fifty_two_week_low: number;
  volume: number;
  turnover_cr: number;
  upper_circuit: number;
  lower_circuit: number;
  avg_traded_price: number;
  market_depth: MarketDepthSnapshot;
  profile: CompanyProfile;
}

export interface FinancialPeriodItem {
  period: string;
  revenue_cr: number;
  net_profit_cr: number;
  opm_pct: number;
  eps: number;
}

export interface ShareholdingPattern {
  promoters_pct: number;
  fii_pct: number;
  dii_pct: number;
  retail_public_pct: number;
  pledged_promoter_pct: number;
}

export interface StockFundamentalData {
  market_cap_cr: number;
  cap_type: string;
  pe_ratio: number;
  industry_pe: number;
  pb_ratio: number;
  debt_to_equity: number;
  roe_pct: number;
  roce_pct: number;
  eps_ttm: number;
  dividend_yield_pct: number;
  book_value: number;
  face_value: number;
  beta: number;
  quarterly_financials: FinancialPeriodItem[];
  annual_financials: FinancialPeriodItem[];
  shareholding: ShareholdingPattern;
}

export interface MovingAverageItem {
  period: string;
  type: string;
  value: number;
  price_action: string;
  signal: "BULLISH" | "BEARISH" | "NEUTRAL" | string;
}

export interface OscillatorItem {
  name: string;
  value: number;
  signal: string;
  action: string;
}

export interface PivotLevelSet {
  pivot: number;
  s1: number;
  s2: number;
  s3: number;
  r1: number;
  r2: number;
  r3: number;
}

export interface StockTechnicalData {
  summary_verdict: string;
  bullish_count: number;
  neutral_count: number;
  bearish_count: number;
  rsi_14: number;
  rsi_status: string;
  macd_line: number;
  macd_signal: number;
  macd_hist: number;
  macd_bias: string;
  stochastic_k: number;
  adx_14: number;
  bollinger_upper: number;
  bollinger_middle: number;
  bollinger_lower: number;
  moving_averages: MovingAverageItem[];
  oscillators: OscillatorItem[];
  classic_pivots: PivotLevelSet;
  fibonacci_pivots: PivotLevelSet;
}

export interface DividendEvent {
  announcement_date: string;
  ex_date: string;
  record_date: string;
  dividend_amount: number;
  dividend_type: string;
  yield_pct: number;
}

export interface BonusSplitEvent {
  event_type: string;
  ratio: string;
  ex_date: string;
  record_date: string;
}

export interface BoardMeetingEvent {
  meeting_date: string;
  purpose: string;
  status: string;
}

export interface StockEventsData {
  dividends: DividendEvent[];
  bonus_splits: BonusSplitEvent[];
  board_meetings: BoardMeetingEvent[];
}

export interface StockNewsArticle {
  title: string;
  source: string;
  published_at: string;
  summary: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL" | string;
  sentiment_score: number;
  url?: string;
}

export interface StockNewsData {
  finbert_sentiment_score: number;
  sentiment_label: string;
  headline: string;
  value_trap_risk: boolean;
  news_summary: string;
  articles: StockNewsArticle[];
}

export interface GrowwStockDetailResponse {
  ticker: string;
  name: string;
  exchange: string;
  bse_code?: string;
  sector: string;
  cap_type: string;
  is_market_open: boolean;
  overview: StockOverviewData;
  fundamental: StockFundamentalData;
  technical: StockTechnicalData;
  events: StockEventsData;
  news: StockNewsData;
}

export interface ScreenerResponse {
  total_stocks: number;
  selected_sector: string | null;
  sort_by: string;
  is_market_open: boolean;
  available_sectors: string[];
  stocks: StockScreenerItem[];
}
