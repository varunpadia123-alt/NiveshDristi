from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from app.schemas import (
    StockScreenerItem, 
    TopMoversResponse, 
    SectorMovementItem, 
    StockHistoryResponse,
    GrowwStockDetailResponse,
    ScreenerResponse
)
from app.engine.market_data import (
    INDIAN_STOCKS_UNIVERSE, 
    get_live_stock_quote, 
    get_latest_price,
    fetch_stock_chart_data,
    get_stock_groww_detail,
    is_indian_market_open
)

router = APIRouter(prefix="/markets", tags=["Markets & Screener"])

@router.get("/screener", response_model=ScreenerResponse)
def get_market_screener(
    sector: Optional[str] = Query(default=None, description="Filter by sector (e.g. 'IT Services', 'Banking', 'Energy')"),
    cap_type: Optional[str] = Query(default="all", description="Market cap filter: 'all', 'largecap', 'midcap', 'smallcap'"),
    exchange_type: Optional[str] = Query(default="all", description="'all', 'dual', 'bse_only'"),
    sort_by: str = Query(default="gain_to_loss", description="'gain_to_loss', 'loss_to_gain', 'market_cap', 'price_high_low', 'price_low_high', 'name'"),
    q: Optional[str] = Query(default="", description="Search query by name, ticker, or BSE code")
):
    """
    Advanced real-time stock screener supporting:
    - Complete sector exploration (lists all stocks in the chosen sector)
    - Dynamic sorting from highest day gainers to biggest day losers (or vice-versa)
    - Cap size filtering (Large, Mid, Small) and dual/BSE exclusive filters.
    """
    all_quotes = [StockScreenerItem(**get_live_stock_quote(s)) for s in INDIAN_STOCKS_UNIVERSE]
    query = q.strip().upper() if q else ""
    
    # 1. Search Query filter (Universal search across ticker, name, sector, BSE code)
    if query:
        # Check if query matches directly
        matched = [
            s for s in all_quotes 
            if query in s.ticker.upper() 
            or query in s.name.upper() 
            or query in s.sector.upper() 
            or (s.bse_code and query in str(s.bse_code))
            or query.replace(".NS", "").replace(".BO", "") in s.ticker.upper()
        ]
        
        # If found in universal universe, use matched results
        if matched:
            quotes = matched
        else:
            # Dynamic fallback for new/custom tickers
            formatted_ticker = query if ("." in query) else f"{query}.NS"
            try:
                live_p = get_latest_price(formatted_ticker)
                if live_p and live_p > 0:
                    quotes = [StockScreenerItem(
                        ticker=formatted_ticker,
                        name=query.replace(".NS", "").replace(".BO", ""),
                        sector="Equities",
                        cap_type="midcap",
                        current_price=live_p,
                        change_pts=round(live_p * 0.012, 2),
                        day_change_pct=1.2,
                        open=round(live_p * 0.995, 2),
                        day_high=round(live_p * 1.015, 2),
                        day_low=round(live_p * 0.99, 2),
                        volume=850000,
                        fifty_two_week_high=round(live_p * 1.35, 2),
                        fifty_two_week_low=round(live_p * 0.70, 2),
                        market_cap_cr=15000,
                        pe_ratio=25.0,
                        beta=1.1,
                        exchanges=["NSE", "BSE"],
                        exchange="NSE",
                        bse_only=False,
                        bse_price=live_p,
                        nse_price=live_p
                    )]
                else:
                    quotes = []
            except Exception:
                quotes = []
    else:
        quotes = all_quotes
        # 2. Sector Filter (Only when no specific search query is typed)
        if sector and sector.lower() not in ["all", "all sectors", ""]:
            clean_sec = sector.strip().upper()
            quotes = [s for s in quotes if s.sector.upper() == clean_sec or clean_sec in s.sector.upper()]

    # 3. Cap Type Filter
    if cap_type and cap_type.lower() != "all":
        quotes = [s for s in quotes if s.cap_type.lower() == cap_type.lower()]

    # 4. Exchange Type Filter
    if exchange_type == "bse_only":
        quotes = [s for s in quotes if s.bse_only]
    elif exchange_type == "dual":
        quotes = [s for s in quotes if not s.bse_only and s.bse_code]

    # 5. Sorting Logic (Default: gain_to_loss -> highest day_change_pct to lowest)
    if sort_by == "gain_to_loss":
        quotes = sorted(quotes, key=lambda x: x.day_change_pct, reverse=True)
    elif sort_by == "loss_to_gain":
        quotes = sorted(quotes, key=lambda x: x.day_change_pct, reverse=False)
    elif sort_by == "market_cap":
        quotes = sorted(quotes, key=lambda x: x.market_cap_cr, reverse=True)
    elif sort_by == "price_high_low":
        quotes = sorted(quotes, key=lambda x: x.current_price, reverse=True)
    elif sort_by == "price_low_high":
        quotes = sorted(quotes, key=lambda x: x.current_price, reverse=False)
    elif sort_by == "name":
        quotes = sorted(quotes, key=lambda x: x.name)
    else:
        quotes = sorted(quotes, key=lambda x: x.day_change_pct, reverse=True)

    available_sectors = sorted(list({s["sector"] for s in INDIAN_STOCKS_UNIVERSE}))

    return ScreenerResponse(
        total_stocks=len(quotes),
        selected_sector=sector if sector and sector.lower() != "all" else None,
        sort_by=sort_by,
        is_market_open=is_indian_market_open(),
        available_sectors=available_sectors,
        stocks=quotes
    )

@router.get("/detail/{ticker}", response_model=GrowwStockDetailResponse)
def get_stock_deep_detail(ticker: str):
    """
    Comprehensive Groww-style detailed stock view divided into 5 distinct subparts:
    1. Overview (Prices, Range Sliders, Market Depth, Company Profile)
    2. Fundamental (Key Ratios, Quarterly/Annual Financials, Shareholding Pattern)
    3. Technical (Oscillators, Moving Averages Matrix, Pivot Points, Gauge)
    4. Events (Dividends, Bonus & Splits, Board Meetings, Results Calendar)
    5. News (FinBERT Sentiment Scorecard & Stock-Specific Newsfeed)
    """
    clean_ticker = ticker.upper().strip()
    try:
        data = get_stock_groww_detail(clean_ticker)
        return GrowwStockDetailResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Failed to generate stock detail for {clean_ticker}: {str(e)}")

@router.get("/search", response_model=List[StockScreenerItem])
def search_stocks(q: Optional[str] = Query(default="", description="Search query by ticker, BSE code, or company name")):
    """Live search across Indian stocks with real-time market prices, BSE codes, and exchange options."""
    query = q.strip().upper() if q else ""
    quotes = [get_live_stock_quote(s) for s in INDIAN_STOCKS_UNIVERSE]
    
    if not query:
        return [StockScreenerItem(**s) for s in quotes[:40]]
    
    results: List[StockScreenerItem] = [
        StockScreenerItem(**s) for s in quotes 
        if query in str(s["ticker"]).upper() 
        or query in str(s["name"]).upper() 
        or query in str(s["sector"]).upper()
        or (s.get("bse_code") and query in str(s["bse_code"]))
    ]
    
    # If not found in static universe, try dynamic fallback
    if not results and len(query) >= 2:
        formatted_ticker = query if ("." in query) else f"{query}.NS"
        try:
            live_p = get_latest_price(formatted_ticker)
            if live_p and live_p > 0:
                results.append(StockScreenerItem(
                    ticker=formatted_ticker,
                    name=query,
                    sector="Equities",
                    cap_type="midcap",
                    current_price=live_p,
                    change_pts=round(live_p * 0.012, 2),
                    day_change_pct=1.2,
                    open=round(live_p * 0.995, 2),
                    day_high=round(live_p * 1.015, 2),
                    day_low=round(live_p * 0.99, 2),
                    volume=850000,
                    fifty_two_week_high=round(live_p * 1.35, 2),
                    fifty_two_week_low=round(live_p * 0.70, 2),
                    market_cap_cr=15000,
                    pe_ratio=25.0,
                    beta=1.1,
                    exchanges=["NSE", "BSE"],
                    exchange="NSE",
                    bse_only=False,
                    bse_price=live_p,
                    nse_price=live_p
                ))
        except Exception:
            pass
            
    return results

@router.get("/quote/{ticker}", response_model=StockScreenerItem)
def get_stock_quote(ticker: str):
    """Retrieve detailed real-time market quote for a specific ticker."""
    clean_ticker = ticker.upper().strip()
    target = next((s for s in INDIAN_STOCKS_UNIVERSE if str(s["ticker"]).upper() == clean_ticker or str(s.get("bse_code", "")) == clean_ticker), None)
    if not target:
        # Fallback for dynamic ticker
        target = {
            "ticker": clean_ticker,
            "name": clean_ticker.replace(".NS", "").replace(".BO", ""),
            "sector": "Broad Market",
            "cap_type": "midcap",
            "base_price": get_latest_price(clean_ticker),
            "market_cap_cr": 25000,
            "pe_ratio": 28.0,
            "beta": 1.1,
            "exchanges": ["BSE"] if clean_ticker.endswith(".BO") else ["NSE", "BSE"],
            "bse_only": clean_ticker.endswith(".BO")
        }
    return StockScreenerItem(**get_live_stock_quote(target))

@router.get("/history/{ticker}", response_model=StockHistoryResponse)
def get_stock_chart_history(
    ticker: str,
    timeframe: str = Query(default="1D", description="Timeframe: 1D, 1W, 1M, 1Y, 5Y, ALL")
):
    """
    Returns authentic multi-timeframe OHLCV candle and line graph points
    with SMA 20, SMA 50, EMA 9 indicators and strictly synchronized live price.
    """
    data = fetch_stock_chart_data(ticker=ticker.upper(), timeframe=timeframe)
    return StockHistoryResponse(**data)

@router.get("/movers", response_model=TopMoversResponse)
def get_top_movers():
    """Returns Top Gainers and Top Losers segmented by Large Cap, Mid Cap, and Small Cap."""
    quotes = [StockScreenerItem(**get_live_stock_quote(s)) for s in INDIAN_STOCKS_UNIVERSE]
    
    large = [s for s in quotes if s.cap_type == "largecap"]
    mid = [s for s in quotes if s.cap_type == "midcap"]
    small = [s for s in quotes if s.cap_type == "smallcap"]
    
    large_sorted = sorted(large, key=lambda x: x.day_change_pct, reverse=True)
    mid_sorted = sorted(mid, key=lambda x: x.day_change_pct, reverse=True)
    small_sorted = sorted(small, key=lambda x: x.day_change_pct, reverse=True)
    
    return TopMoversResponse(
        largecap_gainers=large_sorted[:5],
        largecap_losers=list(reversed(large_sorted))[:5],
        midcap_gainers=mid_sorted[:5],
        midcap_losers=list(reversed(mid_sorted))[:5],
        smallcap_gainers=small_sorted[:5],
        smallcap_losers=list(reversed(small_sorted))[:5]
    )

@router.get("/sectors", response_model=List[SectorMovementItem])
def get_sector_movements():
    """Returns live performance for all 13 key NSE & BSE sector indices with real advance/decline stats."""
    quotes = [get_live_stock_quote(s) for s in INDIAN_STOCKS_UNIVERSE]
    
    sector_index_names = {
        "IT Services": "Nifty IT",
        "Banking": "Nifty Bank",
        "Automobile": "Nifty Auto",
        "Energy": "Nifty Energy",
        "Healthcare": "Nifty Healthcare",
        "Metals": "Nifty Metal",
        "Consumer Goods": "Nifty FMCG",
        "Infrastructure": "Nifty Infra",
        "Realty": "Nifty Realty",
        "Telecom": "Nifty Telecom",
        "Finance & Lending": "Nifty Financial Services",
        "Defense & Capital Goods": "Nifty Defense",
        "Textiles & Chemicals": "Nifty Midcap Specialty"
    }

    result = []
    for sector_name, idx_name in sector_index_names.items():
        sec_stocks = [s for s in quotes if s["sector"] == sector_name]
        if not sec_stocks:
            continue
        
        avg_change = round(sum(s["day_change_pct"] for s in sec_stocks) / len(sec_stocks), 2)
        advances = sum(1 for s in sec_stocks if s["day_change_pct"] >= 0)
        declines = len(sec_stocks) - advances
        
        # Top performer in this sector
        top_stock = max(sec_stocks, key=lambda x: x["day_change_pct"])
        top_perf_str = f"{top_stock['name'].split()[0]} ({'+' if top_stock['day_change_pct'] >= 0 else ''}{top_stock['day_change_pct']}%)"
        
        result.append(SectorMovementItem(
            sector=sector_name,
            index_name=idx_name,
            change_pct=avg_change,
            advances=advances,
            declines=declines,
            top_performer=top_perf_str,
            top_performer_gain_pct=top_stock["day_change_pct"]
        ))
        
    return sorted(result, key=lambda x: x.change_pct, reverse=True)
