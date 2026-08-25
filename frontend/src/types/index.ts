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
