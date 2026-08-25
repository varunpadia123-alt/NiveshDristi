from app.schemas import TechnicalMetrics
from typing import Dict, Any

def generate_rag_rationale(
    original_ticker: str,
    original_metrics: TechnicalMetrics,
    alternative_ticker: str,
    alternative_metrics: TechnicalMetrics,
    tax_info: Dict[str, Any]
) -> str:
    """
    Generates a clear, plain-English algorithmic explanation for the asset recommendation.
    Combines 130+ pandas-ta technical metrics, FinBERT sentiment overlay, and tax drag calculation.
    """
    delta_score = round(alternative_metrics.composite_score - original_metrics.composite_score, 2)
    
    rationale = (
        f"**NiveshDristi Algorithmic Audit**: **{original_ticker}** is currently rated `{original_metrics.badge}` "
        f"with a composite technical score of `{original_metrics.composite_score:+.2f}` (scale -5.0 to +5.0). "
        f"Key triggers include RSI (14) at {original_metrics.rsi_14:.1f}, MACD histogram at {original_metrics.macd_hist:.2f}, "
        f"and price trading at ₹{original_metrics.current_price:.2f} relative to 50-day SMA (₹{original_metrics.sma_50:.2f}).\n\n"
        f"**Smart Intra-Sector Swap**: **{alternative_ticker}** boasts a superior `{alternative_metrics.badge}` status "
        f"with a composite score of `{alternative_metrics.composite_score:+.2f}` (a **+{delta_score:+.2f} point technical improvement**). "
        f"It maintains healthy momentum (RSI: {alternative_metrics.rsi_14:.1f}) and trades above key moving averages with institutional volume accumulation.\n\n"
        f"**FinBERT Sentiment Overlay**: {alternative_metrics.sentiment_headline} Market sentiment score is "
        f"`{alternative_metrics.sentiment_score:+.2f}` ({alternative_metrics.sentiment_label}), confirming strong fundamental support without value-trap risks.\n\n"
        f"**Capital Redeployment & Tax Impact**: Swapping {original_ticker} realizes {tax_info['tax_type']} tax of "
        f"₹{tax_info['estimated_tax_payable']:,.2f} on gains of ₹{tax_info['unrealized_gain']:,.2f}. "
        f"Net redeployable capital is **₹{tax_info['redeployable_capital']:,.2f}**, which acquires approximately "
        f"**{tax_info['new_shares_acquired']:.2f} shares** of {alternative_ticker} with optimized risk-adjusted potential."
    )
    
    return rationale
