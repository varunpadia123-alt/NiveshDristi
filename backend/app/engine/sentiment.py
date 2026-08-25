from typing import Dict, Any
import hashlib

# Curated financial sentiment knowledge base for stock universe with realistic market context
FINANCIAL_NEWS_DATABASE = {
    "TCS.NS": {
        "headline": "TCS bags $1.2B mega-deal in European cloud migration; margins expand 80bps.",
        "sentiment_score": 0.72,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "INFY.NS": {
        "headline": "Infosys raises FY revenue guidance on strong digital transformation demand.",
        "sentiment_score": 0.65,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "HCLTECH.NS": {
        "headline": "HCL Tech delivers record deal wins in engineering R&D services.",
        "sentiment_score": 0.58,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "WIPRO.NS": {
        "headline": "Wipro faces leadership reshuffle and margin pressure amid consulting slowdown.",
        "sentiment_score": -0.42,
        "sentiment_label": "BEARISH",
        "value_trap_risk": True
    },
    "TECHM.NS": {
        "headline": "Tech Mahindra restructures telecom vertical; short-term revenue headwinds persist.",
        "sentiment_score": -0.28,
        "sentiment_label": "BEARISH",
        "value_trap_risk": False
    },
    "RELIANCE.NS": {
        "headline": "Reliance expands retail footprint and green energy giga-factories; refining steady.",
        "sentiment_score": 0.45,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "NTPC.NS": {
        "headline": "NTPC Green Energy IPO gets strong institutional subscription; capacity targets raised.",
        "sentiment_score": 0.78,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "ONGC.NS": {
        "headline": "ONGC benefits from firm crude prices but faces higher windfall tax adjustments.",
        "sentiment_score": 0.12,
        "sentiment_label": "NEUTRAL",
        "value_trap_risk": False
    },
    "BPCL.NS": {
        "headline": "BPCL reports robust marketing margins; refinery modernization on track.",
        "sentiment_score": 0.35,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "POWERGRID.NS": {
        "headline": "Power Grid capitalizes on interstate transmission tariff order with 15% ROE.",
        "sentiment_score": 0.68,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "HDFCBANK.NS": {
        "headline": "HDFC Bank deposit growth outpaces credit expansion; CDR normalizes post-merger.",
        "sentiment_score": 0.62,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "ICICIBANK.NS": {
        "headline": "ICICI Bank posts 17% YoY PAT growth with pristine asset quality & 2.4% ROA.",
        "sentiment_score": 0.84,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "SBIN.NS": {
        "headline": "SBI credit growth steady across SME & retail; slippages at multi-year lows.",
        "sentiment_score": 0.54,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "KOTAKBANK.NS": {
        "headline": "Kotak Mahindra Bank lifts RBI regulatory tech curbs; customer onboarding resumes.",
        "sentiment_score": 0.60,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "AXISBANK.NS": {
        "headline": "Axis Bank completes Citi integration synergies; fee income surges.",
        "sentiment_score": 0.48,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "TATAMOTORS.NS": {
        "headline": "Tata Motors demerger into CV and PV entities unlocks shareholder value.",
        "sentiment_score": 0.70,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "M&M.NS": {
        "headline": "Mahindra & Mahindra SUV order backlog hits 220k units; tractor sales rebound.",
        "sentiment_score": 0.82,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "MARUTI.NS": {
        "headline": "Maruti Suzuki hybrid model sales accelerate; export volumes gain traction.",
        "sentiment_score": 0.52,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "HINDUNILVR.NS": {
        "headline": "Hindustan Unilever sees rural FMCG volume recovery; raw material costs stable.",
        "sentiment_score": 0.40,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    },
    "ITC.NS": {
        "headline": "ITC hotels demerger nears completion; paperboard demand stabilizing.",
        "sentiment_score": 0.50,
        "sentiment_label": "BULLISH",
        "value_trap_risk": False
    }
}

def analyze_sentiment(ticker: str) -> Dict[str, Any]:
    """
    Simulates FinBERT-based contextual NLP sentiment scoring across market news and social feeds.
    Flags value-trap risks when sentiment is intensely negative.
    """
    clean_ticker = ticker.upper()
    
    if clean_ticker in FINANCIAL_NEWS_DATABASE:
        return FINANCIAL_NEWS_DATABASE[clean_ticker]
    
    # Deterministic dynamic sentiment based on ticker hash for uncatalogued stocks
    val = (int(hashlib.md5(clean_ticker.encode()).hexdigest(), 16) % 100) / 100.0  # 0.0 to 0.99
    score = round((val * 2.0) - 1.0, 2) # -1.0 to +1.0
    
    if score >= 0.25:
        label = "BULLISH"
        risk = False
        headline = f"Positive institutional sentiment and steady operational momentum reported for {clean_ticker}."
    elif score <= -0.25:
        label = "BEARISH"
        risk = (score <= -0.45)
        headline = f"Sector headwind cautions and conservative analyst revisions noted for {clean_ticker}."
    else:
        label = "NEUTRAL"
        risk = False
        headline = f"Balanced market sentiment and rangebound analyst expectations for {clean_ticker}."
        
    return {
        "headline": headline,
        "sentiment_score": score,
        "sentiment_label": label,
        "value_trap_risk": risk
    }
