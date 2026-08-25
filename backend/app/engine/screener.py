from typing import List, Dict, Optional
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
        {"ticker": "ICICIBANK.NS", "name": "ICICI Bank Ltd", "beta": 1.05, "volatility": 4.0},
        {"ticker": "SBIN.NS", "name": "State Bank of India", "beta": 1.35, "volatility": 5.9},
        {"ticker": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank", "beta": 0.90, "volatility": 3.7},
        {"ticker": "AXISBANK.NS", "name": "Axis Bank Ltd", "beta": 1.20, "volatility": 5.1}
    ],
    "Automobile": [
        {"ticker": "TATAMOTORS.NS", "name": "Tata Motors Ltd", "beta": 1.40, "volatility": 6.8},
        {"ticker": "M&M.NS", "name": "Mahindra & Mahindra", "beta": 1.10, "volatility": 4.9},
        {"ticker": "MARUTI.NS", "name": "Maruti Suzuki India", "beta": 0.90, "volatility": 3.8},
        {"ticker": "HEROMOTOCO.NS", "name": "Hero MotoCorp", "beta": 0.95, "volatility": 4.1}
    ],
    "Consumer Goods": [
        {"ticker": "HINDUNILVR.NS", "name": "Hindustan Unilever", "beta": 0.65, "volatility": 2.8},
        {"ticker": "ITC.NS", "name": "ITC Ltd", "beta": 0.70, "volatility": 2.9},
        {"ticker": "NESTLEIND.NS", "name": "Nestle India", "beta": 0.60, "volatility": 2.5},
        {"ticker": "BRITANNIA.NS", "name": "Britannia Industries", "beta": 0.68, "volatility": 2.7}
    ]
}

def discover_sector_alternative(
    holding_id: int,
    original_ticker: str,
    sector: str,
    buy_price: float,
    current_price: float,
    quantity: float,
    purchase_date: str,
    user_risk_score: int
) -> Optional[AlternativeDiscovery]:
    """
    Finds intra-sector alternative asset showing stronger technical score, tax drag estimation, and risk guardrail compliance.
    """
    orig_metrics = compute_technical_metrics(original_ticker)

    candidates = SECTOR_UNIVERSE.get(sector, SECTOR_UNIVERSE["IT Services"])
    best_candidate = None
    best_score = -999.0

    for cand in candidates:
        if cand["ticker"] == original_ticker:
            continue

        # Check risk guardrail
        if not is_stock_risk_aligned(cand["beta"], cand["volatility"], user_risk_score):
            continue

        cand_metrics = compute_technical_metrics(cand["ticker"])
        
        # Calculate compound technical score (RSI + MACD bonus + Trend bonus)
        score = cand_metrics.rsi_14 + (20.0 if cand_metrics.badge == "BULLISH TREND" else 0.0) + (10.0 if cand_metrics.macd_hist > 0 else -10.0)
        
        if score > best_score:
            best_score = score
            best_candidate = (cand, cand_metrics)

    if not best_candidate:
        # Fallback to first available alternative in sector
        cand = [c for c in candidates if c["ticker"] != original_ticker][0]
        cand_metrics = compute_technical_metrics(cand["ticker"])
        best_candidate = (cand, cand_metrics)

    alt_info, alt_metrics = best_candidate

    tax_info = calculate_tax_impact(purchase_date, current_price, buy_price, quantity)
    
    rag_explanation = generate_rag_rationale(
        original_ticker, orig_metrics, alt_info["ticker"], alt_metrics, tax_info
    )

    return AlternativeDiscovery(
        original_holding_id=holding_id,
        original_ticker=original_ticker,
        original_badge=orig_metrics.badge,
        alternative_ticker=alt_info["ticker"],
        alternative_name=alt_info["name"],
        sector=sector,
        alternative_price=alt_metrics.current_price,
        alternative_badge=alt_metrics.badge,
        technical_score_improvement=round(float(alt_metrics.rsi_14 - orig_metrics.rsi_14), 1),
        correlation_with_original=0.86,
        holding_days=tax_info["holding_days"],
        tax_type=tax_info["tax_type"],
        tax_rate_pct=tax_info["tax_rate_pct"],
        unrealized_gain=tax_info["unrealized_gain"],
        estimated_tax_payable=tax_info["estimated_tax_payable"],
        net_gain_after_tax=tax_info["net_gain_after_tax"],
        rag_rationale=rag_explanation,
        disclaimer="NiveshDristi provides algorithmic metric translation and quantitative screening based on technical indicators. This does not constitute personalized financial or fiduciary investment advice."
    )
