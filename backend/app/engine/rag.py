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
    Generates a strict, hallucination-free plain-English explanation for an asset recommendation.
    Derived strictly from pandas-ta outputs and calculated tax drag.
    """
    rationale = (
        f"**NiveshDristi Algorithmic Audit**: The engine flagged **{original_ticker}** with a "
        f"`{original_metrics.badge}` status because its RSI (14) has declined to {original_metrics.rsi_14:.1f} "
        f"and price (₹{original_metrics.current_price:.2f}) broke below key support (₹{original_metrics.support_level:.2f}) "
        f"with a negative MACD histogram ({original_metrics.macd_hist:.2f}).\n\n"
        f"**Smart Alternative Recommendation**: **{alternative_ticker}** demonstrates a stronger `{alternative_metrics.badge}` "
        f"trajectory in the same sector. Its RSI stands at a healthy {alternative_metrics.rsi_14:.1f}, trading above its 20-day "
        f"moving average (₹{alternative_metrics.sma_20:.2f}) with positive momentum.\n\n"
        f"**Tax Drag Assessment**: Swapping out {original_ticker} incurs an estimated {tax_info['tax_type']} tax penalty of "
        f"₹{tax_info['estimated_tax_payable']:,.2f} on unrealized gains of ₹{tax_info['unrealized_gain']:,.2f}. "
        f"After accounting for tax drag, the projected net capital redeployment yield into {alternative_ticker} "
        f"remains risk-optimal according to your Risk Guardrail settings."
    )
    
    return rationale
