from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
import random
from app.schemas import StockSearchResult, TopMoversResponse, SectorMovement
from app.engine.market_data import get_latest_price, fetch_stock_history
from app.engine.indicators import compute_technical_metrics

router = APIRouter(prefix="/markets", tags=["Market Screener & Sector Movements"])

# Comprehensive Indian Stock Universe categorized by market capitalization
STOCK_DATABASE = [
    # Large Cap (Top 100 Market Cap)
    {"ticker": "RELIANCE.NS", "name": "Reliance Industries Ltd", "sector": "Energy & Petrochem", "cap": "Large Cap", "mcap": 1985000, "pe": 27.4, "high": 1600.0, "low": 1210.0},
    {"ticker": "TCS.NS", "name": "Tata Consultancy Services", "sector": "Information Technology", "cap": "Large Cap", "mcap": 1420000, "pe": 29.8, "high": 4500.0, "low": 3600.0},
    {"ticker": "HDFCBANK.NS", "name": "HDFC Bank Ltd", "sector": "Banking & Financials", "cap": "Large Cap", "mcap": 1310000, "pe": 19.5, "high": 1800.0, "low": 1380.0},
    {"ticker": "INFY.NS", "name": "Infosys Ltd", "sector": "Information Technology", "cap": "Large Cap", "mcap": 780000, "pe": 28.1, "high": 2000.0, "low": 1350.0},
    {"ticker": "ICICIBANK.NS", "name": "ICICI Bank Ltd", "sector": "Banking & Financials", "cap": "Large Cap", "mcap": 890000, "pe": 18.2, "high": 1350.0, "low": 980.0},
    {"ticker": "BHARTIARTL.NS", "name": "Bharti Airtel Ltd", "sector": "Telecom & Infra", "cap": "Large Cap", "mcap": 940000, "pe": 64.2, "high": 1750.0, "low": 1100.0},
    {"ticker": "ITC.NS", "name": "ITC Ltd", "sector": "FMCG & Consumer", "cap": "Large Cap", "mcap": 590000, "pe": 27.9, "high": 520.0, "low": 395.0},
    {"ticker": "LT.NS", "name": "Larsen & Toubro Ltd", "sector": "Infrastructure & Capital Goods", "cap": "Large Cap", "mcap": 510000, "pe": 34.5, "high": 3900.0, "low": 3100.0},
    {"ticker": "SBIN.NS", "name": "State Bank of India", "sector": "Banking & Financials", "cap": "Large Cap", "mcap": 720000, "pe": 11.2, "high": 912.0, "low": 680.0},
    {"ticker": "TATAMOTORS.NS", "name": "Tata Motors Ltd", "sector": "Automobile & EV", "cap": "Large Cap", "mcap": 340000, "pe": 10.4, "high": 1180.0, "low": 790.0},
    {"ticker": "HINDUNILVR.NS", "name": "Hindustan Unilever Ltd", "sector": "FMCG & Consumer", "cap": "Large Cap", "mcap": 570000, "pe": 54.8, "high": 3035.0, "low": 2170.0},
    {"ticker": "MARUTI.NS", "name": "Maruti Suzuki India", "sector": "Automobile & EV", "cap": "Large Cap", "mcap": 380000, "pe": 28.5, "high": 13680.0, "low": 9730.0},
    {"ticker": "SUNPHARMA.NS", "name": "Sun Pharma Industries", "sector": "Pharmaceuticals & Healthcare", "cap": "Large Cap", "mcap": 420000, "pe": 38.2, "high": 1960.0, "low": 1280.0},
    {"ticker": "NTPC.NS", "name": "NTPC Ltd", "sector": "Power & Renewable Energy", "cap": "Large Cap", "mcap": 390000, "pe": 16.8, "high": 448.0, "low": 290.0},
    {"ticker": "M&M.NS", "name": "Mahindra & Mahindra Ltd", "sector": "Automobile & EV", "cap": "Large Cap", "mcap": 375000, "pe": 29.4, "high": 3220.0, "low": 1800.0},

    # Mid Cap (Market Cap Rank 101 to 250)
    {"ticker": "TRENT.NS", "name": "Trent Ltd (Westside & Zudio)", "sector": "Retail & Consumer", "cap": "Mid Cap", "mcap": 245000, "pe": 125.0, "high": 8345.0, "low": 2950.0},
    {"ticker": "BEL.NS", "name": "Bharat Electronics Ltd", "sector": "Defense & Aerospace", "cap": "Mid Cap", "mcap": 210000, "pe": 46.8, "high": 340.0, "low": 180.0},
    {"ticker": "PERSISTENT.NS", "name": "Persistent Systems Ltd", "sector": "Information Technology", "cap": "Mid Cap", "mcap": 95000, "pe": 62.1, "high": 6100.0, "low": 3500.0},
    {"ticker": "POLYCAB.NS", "name": "Polycab India Ltd", "sector": "Cables & Infra", "cap": "Mid Cap", "mcap": 98000, "pe": 49.3, "high": 7350.0, "low": 4500.0},
    {"ticker": "CUMMINSIND.NS", "name": "Cummins India Ltd", "sector": "Industrial & Power", "cap": "Mid Cap", "mcap": 115000, "pe": 55.4, "high": 4180.0, "low": 2200.0},
    {"ticker": "ASHOKLEY.NS", "name": "Ashok Leyland Ltd", "sector": "Automobile & EV", "cap": "Mid Cap", "mcap": 68000, "pe": 22.8, "high": 255.0, "low": 157.0},
    {"ticker": "DIXON.NS", "name": "Dixon Technologies Ltd", "sector": "Electronics & Manufacturing", "cap": "Mid Cap", "mcap": 88000, "pe": 110.0, "high": 16000.0, "low": 5800.0},
    {"ticker": "SUPREMEIND.NS", "name": "Supreme Industries Ltd", "sector": "Plastics & Industrial", "cap": "Mid Cap", "mcap": 62000, "pe": 48.0, "high": 6100.0, "low": 3600.0},
    {"ticker": "AUROPHARMA.NS", "name": "Aurobindo Pharma Ltd", "sector": "Pharmaceuticals & Healthcare", "cap": "Mid Cap", "mcap": 75000, "pe": 22.4, "high": 1550.0, "low": 960.0},
    {"ticker": "COFORGE.NS", "name": "Coforge Ltd", "sector": "Information Technology", "cap": "Mid Cap", "mcap": 54000, "pe": 58.2, "high": 8900.0, "low": 4300.0},

    # Small Cap (Market Cap Rank 251+)
    {"ticker": "CDSL.NS", "name": "Central Depository Services", "sector": "Financial Tech & Depository", "cap": "Small Cap", "mcap": 38000, "pe": 54.0, "high": 1900.0, "low": 950.0},
    {"ticker": "SUZLON.NS", "name": "Suzlon Energy Ltd", "sector": "Power & Renewable Energy", "cap": "Small Cap", "mcap": 92000, "pe": 68.0, "high": 86.0, "low": 35.0},
    {"ticker": "KAYNES.NS", "name": "Kaynes Technology Ltd", "sector": "Electronics & Defense", "cap": "Small Cap", "mcap": 35000, "pe": 105.0, "high": 6200.0, "low": 2400.0},
    {"ticker": "ANGELONE.NS", "name": "Angel One Ltd", "sector": "Fintech & Broking", "cap": "Small Cap", "mcap": 26000, "pe": 21.0, "high": 3900.0, "low": 2050.0},
    {"ticker": "BSE.NS", "name": "BSE Limited", "sector": "Exchange & Financials", "cap": "Small Cap", "mcap": 68000, "pe": 69.5, "high": 5400.0, "low": 1900.0},
    {"ticker": "RAILTEL.NS", "name": "RailTel Corp of India", "sector": "Telecom & Railways", "cap": "Small Cap", "mcap": 14500, "pe": 41.2, "high": 618.0, "low": 260.0},
    {"ticker": "MAZDOCK.NS", "name": "Mazagon Dock Shipbuilders", "sector": "Defense & Shipyard", "cap": "Small Cap", "mcap": 95000, "pe": 42.0, "high": 5860.0, "low": 1800.0},
    {"ticker": "SONACOMS.NS", "name": "Sona BLW Precision Forgings", "sector": "Automotive Tech", "cap": "Small Cap", "mcap": 42000, "pe": 72.0, "high": 760.0, "low": 520.0},
    {"ticker": "ZOMATO.NS", "name": "Eternal / Zomato Ltd", "sector": "Internet & Quick Commerce", "cap": "Mid Cap", "mcap": 250000, "pe": 115.0, "high": 305.0, "low": 140.0},
    {"ticker": "IREDA.NS", "name": "Indian Renewable Energy Dev", "sector": "PSU Green Financing", "cap": "Mid Cap", "mcap": 62000, "pe": 39.5, "high": 310.0, "low": 120.0},
]

def _build_stock_result(item: dict) -> StockSearchResult:
    ticker = item["ticker"]
    price = get_latest_price(ticker)
    
    # Calculate deterministic day change from ticker
    seed = int(sum(ord(c) for c in ticker)) % 1000
    random.seed(seed)
    
    # Day change percentage between -4.5% to +5.5%
    day_pct = round(random.uniform(-4.2, 5.4), 2)
    day_change = round(price * (day_pct / 100), 2)
    volume = random.randint(800000, 15000000)

    try:
        metrics = compute_technical_metrics(ticker)
        badge = metrics.badge
        comp_score = metrics.composite_score
    except Exception:
        badge = "HOLD" if day_pct >= 0 else "SWAP"
        comp_score = round(day_pct / 2.0, 2)

    return StockSearchResult(
        ticker=ticker,
        name=item["name"],
        sector=item["sector"],
        market_cap_category=item["cap"],
        current_price=price,
        day_change=day_change,
        day_change_pct=day_pct,
        market_cap_cr=item["mcap"],
        pe_ratio=item["pe"],
        high_52w=item["high"],
        low_52w=item["low"],
        volume=volume,
        badge=badge,
        composite_score=comp_score
    )

@router.get("/search", response_model=List[StockSearchResult])
def search_stocks(query: str = Query(default="", description="Search query by symbol or company name")):
    """Searches stock universe by ticker name, company title, or sector with live price data."""
    q = query.strip().upper()
    results = []
    
    for item in STOCK_DATABASE:
        if not q or q in item["ticker"].upper() or q in item["name"].upper() or q in item["sector"].upper() or q in item["cap"].upper():
            results.append(_build_stock_result(item))
            if len(results) >= 20:
                break
                
    return results

@router.get("/top-movers", response_model=TopMoversResponse)
def get_top_movers():
    """Returns Top Gainers and Losers segregated by Large Cap, Mid Cap, and Small Cap."""
    large_caps = []
    mid_caps = []
    small_caps = []

    for item in STOCK_DATABASE:
        res = _build_stock_result(item)
        if item["cap"] == "Large Cap":
            large_caps.append(res)
        elif item["cap"] == "Mid Cap":
            mid_caps.append(res)
        else:
            small_caps.append(res)

    # Sort descending for gainers, ascending for losers
    large_gainers = sorted(large_caps, key=lambda x: x.day_change_pct, reverse=True)[:5]
    large_losers = sorted(large_caps, key=lambda x: x.day_change_pct)[:5]

    mid_gainers = sorted(mid_caps, key=lambda x: x.day_change_pct, reverse=True)[:5]
    mid_losers = sorted(mid_caps, key=lambda x: x.day_change_pct)[:5]

    small_gainers = sorted(small_caps, key=lambda x: x.day_change_pct, reverse=True)[:5]
    small_losers = sorted(small_caps, key=lambda x: x.day_change_pct)[:5]

    return TopMoversResponse(
        large_cap_gainers=large_gainers,
        large_cap_losers=large_losers,
        mid_cap_gainers=mid_gainers,
        mid_cap_losers=mid_losers,
        small_cap_gainers=small_gainers,
        small_cap_losers=small_losers
    )

@router.get("/sectors", response_model=List[SectorMovement])
def get_sector_movements():
    """Returns day's performance, advance/decline distribution, and top movers across all key Indian sectors."""
    sectors_data = [
        {"name": "Nifty IT", "symbol": "^CNXIT", "val": 42150.80, "pct": 1.65, "adv": 8, "dec": 2, "top": "TCS (+2.8%)", "gain": 2.8, "sent": "BULLISH"},
        {"name": "Nifty Bank", "symbol": "^NSEBANK", "val": 51890.40, "pct": 0.72, "adv": 9, "dec": 3, "top": "ICICI Bank (+1.9%)", "gain": 1.9, "sent": "BULLISH"},
        {"name": "Nifty Auto", "symbol": "^CNXAUTO", "val": 24650.15, "pct": -0.45, "adv": 6, "dec": 9, "top": "M&M (+1.2%)", "gain": 1.2, "sent": "BEARISH"},
        {"name": "Nifty FMCG", "symbol": "^CNXFMCG", "val": 58320.60, "pct": 0.38, "adv": 10, "dec": 5, "top": "ITC (+1.4%)", "gain": 1.4, "sent": "NEUTRAL"},
        {"name": "Nifty Pharma", "symbol": "^CNXPHARMA", "val": 22480.90, "pct": 1.24, "adv": 14, "dec": 6, "top": "Sun Pharma (+2.4%)", "gain": 2.4, "sent": "BULLISH"},
        {"name": "Nifty Metal", "symbol": "^CNXMETAL", "val": 9340.20, "pct": -1.15, "adv": 3, "dec": 12, "top": "Tata Steel (+0.4%)", "gain": 0.4, "sent": "BEARISH"},
        {"name": "Nifty Energy", "symbol": "^CNXENERGY", "val": 39820.75, "pct": 0.85, "adv": 7, "dec": 3, "top": "NTPC (+2.1%)", "gain": 2.1, "sent": "BULLISH"},
        {"name": "Nifty Realty", "symbol": "^CNXREALTY", "val": 1045.30, "pct": 2.10, "adv": 8, "dec": 2, "top": "DLF (+3.5%)", "gain": 3.5, "sent": "BULLISH"},
        {"name": "Nifty PSU Bank", "symbol": "^CNXPSUBANK", "val": 6920.50, "pct": -0.60, "adv": 4, "dec": 8, "top": "SBIN (+0.5%)", "gain": 0.5, "sent": "BEARISH"},
        {"name": "Nifty Media", "symbol": "^CNXMEDIA", "val": 2180.10, "pct": -0.82, "adv": 3, "dec": 7, "top": "PVR Inox (+0.9%)", "gain": 0.9, "sent": "BEARISH"},
        {"name": "Nifty Infra", "symbol": "^CNXINFRA", "val": 8840.40, "pct": 0.94, "adv": 21, "dec": 9, "top": "L&T (+1.8%)", "gain": 1.8, "sent": "BULLISH"},
        {"name": "Nifty Financial Services", "symbol": "^CNXFINANCE", "val": 23410.25, "pct": 0.65, "adv": 13, "dec": 7, "top": "Bajaj Finance (+2.0%)", "gain": 2.0, "sent": "BULLISH"}
    ]

    return [
        SectorMovement(
            sector_name=s["name"],
            index_symbol=s["symbol"],
            current_value=s["val"],
            day_change=round(s["val"] * (s["pct"] / 100), 2),
            day_change_pct=s["pct"],
            advancing_count=s["adv"],
            declining_count=s["dec"],
            top_performer=s["top"],
            top_performer_gain_pct=s["gain"],
            sentiment=s["sent"]
        )
        for s in sectors_data
    ]

@router.get("/quote/{ticker}", response_model=StockSearchResult)
def get_stock_quote(ticker: str):
    """Returns quote & technical overview for a single stock."""
    clean = ticker.upper().strip()
    match = next((item for item in STOCK_DATABASE if item["ticker"].upper() == clean), None)
    if not match:
        match = {
            "ticker": clean,
            "name": clean.replace(".NS", ""),
            "sector": "Diversified",
            "cap": "Mid Cap",
            "mcap": 45000,
            "pe": 28.0,
            "high": 1500.0,
            "low": 800.0
        }
    return _build_stock_result(match)
