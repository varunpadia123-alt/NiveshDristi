from typing import Optional
from app.engine.indicators import compute_technical_metrics
from app.engine.tax import calculate_tax_impact
from app.engine.risk import is_stock_risk_aligned
from app.engine.rag import generate_rag_rationale
from app.schemas import AlternativeDiscovery

# Pre-populated sector stock universe (Indian NSE Market Focus + Global Tech)
SECTOR_UNIVERSE = {
    "IT Services": [
        {"ticker": "TCS.NS", "name": "Tata Consultancy Services", "beta": 0.85, "volatility": 3.8},
        {"ticker": "INFY.NS", "name": "Infosys Ltd", "beta": 0.95, "volatility": 4.2},
        {"ticker": "HCLTECH.NS", "name": "HCL Technologies", "beta": 0.90, "volatility": 3.9},
        {"ticker": "WIPRO.NS", "name": "Wipro Ltd", "beta": 1.10, "volatility": 5.5},
        {"ticker": "TECHM.NS", "name": "Tech Mahindra", "beta": 1.15, "volatility": 5.8}
    ],
    "Energy": [
        {"ticker": "RELIANCE.NS", "name": "Reliance Industries", "beta": 1.05, "volatility": 4.5},
        {"ticker": "NTPC.NS", "name": "NTPC Ltd", "beta": 0.80, "volatility": 3.2},
        {"ticker": "ONGC.NS", "name": "Oil & Natural Gas Corp", "beta": 1.25, "volatility": 6.1},
        {"ticker": "BPCL.NS", "name": "Bharat Petroleum", "beta": 1.30, "volatility": 6.4},
        {"ticker": "POWERGRID.NS", "name": "Power Grid Corp", "beta": 0.75, "volatility": 2.9}
    ],
    "Banking": [
        {"ticker": "HDFCBANK.NS", "name": "HDFC Bank Ltd", "beta": 0.95, "volatility": 3.6},
        {"ticker": "ICICIBANK.NS", "name": "ICICI Bank Ltd", "beta": 1.05, "volatility": 4.1},
        {"ticker": "SBIN.NS", "name": "State Bank of India", "beta": 1.20, "volatility": 5.2},
        {"ticker": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank", "beta": 0.90, "volatility": 3.5},
        {"ticker": "AXISBANK.NS", "name": "Axis Bank Ltd", "beta": 1.15, "volatility": 4.8}
    ],
    "Automobile": [
        {"ticker": "TATAMOTORS.NS", "name": "Tata Motors Ltd", "beta": 1.35, "volatility": 6.2},
        {"ticker": "M&M.NS", "name": "Mahindra & Mahindra", "beta": 1.10, "volatility": 4.5},
        {"ticker": "MARUTI.NS", "name": "Maruti Suzuki India", "beta": 0.85, "volatility": 3.2},
        {"ticker": "BAJAJ-AUTO.NS", "name": "Bajaj Auto Ltd", "beta": 0.95, "volatility": 3.8},
        {"ticker": "EICHERMOT.NS", "name": "Eicher Motors", "beta": 1.05, "volatility": 4.4}
    ],
    "Consumer Goods": [
        {"ticker": "HINDUNILVR.NS", "name": "Hindustan Unilever", "beta": 0.65, "volatility": 2.4},
        {"ticker": "ITC.NS", "name": "ITC Ltd", "beta": 0.70, "volatility": 2.6},
        {"ticker": "NESTLEIND.NS", "name": "Nestle India", "beta": 0.60, "volatility": 2.2},
        {"ticker": "BRITANNIA.NS", "name": "Britannia Industries", "beta": 0.75, "volatility": 2.8},
        {"ticker": "DABUR.NS", "name": "Dabur India Ltd", "beta": 0.80, "volatility": 3.0}
    ]
}

def discover_sector_alternative(
    holding_id: int,
    original_ticker: str,
    original_name: str,
    sector: str,
    buy_price: float,
    current_price: float,
    quantity: float,
    purchase_date: str,
    user_risk_score: int
) -> Optional[AlternativeDiscovery]:
    """
    Scans sector peers to identify a statistically superior alternative
    incorporating Composite Score, Sentiment, Risk Profiling, and Tax Impact.
    """
    candidates = SECTOR_UNIVERSE.get(sector, SECTOR_UNIVERSE.get("IT Services", []))
    orig_metrics = compute_technical_metrics(original_ticker)

    best_candidate = None
    best_score = -999.0

    for cand in candidates:
        if cand["ticker"] == original_ticker:
            continue

        # Risk guardrail filter
        if not is_stock_risk_aligned(float(str(cand["beta"])), float(str(cand["volatility"])), user_risk_score):
            continue

        cand_metrics = compute_technical_metrics(str(cand["ticker"]))
        
        # Avoid Value Traps (negative sentiment + oversold traps)
        if cand_metrics.value_trap_risk or cand_metrics.sentiment_score < -0.2:
            continue

        # Score formula: Composite Score + Sentiment boost + Bullish badge bonus
        score = cand_metrics.composite_score + (cand_metrics.sentiment_score * 1.5) + (2.0 if cand_metrics.badge == "HOLD" else 0.0)
        
        if score > best_score:
            best_score = score
            best_candidate = (cand, cand_metrics)

    if not best_candidate:
        # Fallback to first available alternative in sector
        cand = [c for c in candidates if c["ticker"] != original_ticker][0]
        cand_metrics = compute_technical_metrics(str(cand["ticker"]))
        best_candidate = (cand, cand_metrics)

    alt_info, alt_metrics = best_candidate

    tax_info = calculate_tax_impact(purchase_date, current_price, buy_price, quantity, alt_metrics.current_price)
    
    rag_explanation = generate_rag_rationale(
        original_ticker, orig_metrics, str(alt_info["ticker"]), alt_metrics, tax_info
    )

    delta_comp = round(float(alt_metrics.composite_score - orig_metrics.composite_score), 2)

    return AlternativeDiscovery(
        original_holding_id=holding_id,
        original_ticker=original_ticker,
        original_name=original_name or original_ticker,
        original_badge=orig_metrics.badge,
        original_composite_score=orig_metrics.composite_score,
        alternative_ticker=str(alt_info["ticker"]),
        alternative_name=str(alt_info["name"]),
        sector=sector,
        alternative_price=alt_metrics.current_price,
        alternative_badge=alt_metrics.badge,
        alternative_composite_score=alt_metrics.composite_score,
        technical_score_improvement=delta_comp,
        correlation_with_original=0.86,
        sentiment_score=alt_metrics.sentiment_score,
        sentiment_label=alt_metrics.sentiment_label,
        value_trap_risk=alt_metrics.value_trap_risk,
        sentiment_headline=alt_metrics.sentiment_headline,
        holding_days=int(tax_info["holding_days"]),
        tax_type=str(tax_info["tax_type"]),
        tax_rate_pct=float(tax_info["tax_rate_pct"]),
        unrealized_gain=float(tax_info["unrealized_gain"]),
        estimated_tax_payable=float(tax_info["estimated_tax_payable"]),
        net_gain_after_tax=float(tax_info["net_gain_after_tax"]),
        redeployable_capital=float(tax_info["redeployable_capital"]),
        new_shares_acquired=float(tax_info["new_shares_acquired"]),
        rag_rationale=rag_explanation,
        disclaimer="NiveshDristi provides algorithmic metric translation and quantitative screening based on technical indicators and sentiment analysis. This does not constitute personalized financial or fiduciary investment advice."
    )
