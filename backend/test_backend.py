import sys
import os

# Fix Windows console encoding for Rupee symbol
if sys.platform == "win32":
    getattr(sys.stdout, "reconfigure", lambda **kw: None)(encoding="utf-8")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_suite():
    print("================ RUNNING COMPLETE NIVESHDRISTI BACKEND TEST SUITE ================")
    
    # 1. Root & Health
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.text}"
    print("✔ 1. Testing Root Endpoint")

    # 2. Portfolio Summary
    r = client.get("/api/portfolio/summary")
    assert r.status_code == 200, f"Summary failed: {r.text}"
    data = r.json()
    assert "total_investment" in data
    assert "total_current_value" in data
    print("✔ 2. Testing Portfolio Summary & Concentration Risk")

    # 3. Holdings
    r = client.get("/api/portfolio/holdings")
    assert r.status_code == 200, f"Holdings failed: {r.text}"
    holdings = r.json()
    assert len(holdings) > 0, "No holdings found"
    holding_id = holdings[0]["id"]
    ticker = holdings[0]["ticker"]
    print(f"✔ 3. Testing User Holdings with Badges & Composite Scores ({len(holdings)} holdings)")

    # 4. Technical Analysis
    r = client.get(f"/api/analysis/technical/{ticker}")
    assert r.status_code == 200, f"Technical failed: {r.text}"
    tech = r.json()
    assert "composite_score" in tech
    assert "rsi_14" in tech
    print("✔ 4. Testing Multi-Indicator Technical Engine & FinBERT Sentiment")

    # 5. Smart Swap
    r = client.get(f"/api/analysis/alternative/{holding_id}")
    assert r.status_code == 200, f"Swap failed: {r.text}"
    swap_data = r.json()
    assert "alternative_ticker" in swap_data
    print(f"✔ 5. Testing AI Swap Engine & RAG Rationales (Alternative: {swap_data['alternative_ticker']})")

    # 6. Backtest Sandbox
    r = client.get(f"/api/backtest/run?ticker={ticker}&timeframe_years=3")
    assert r.status_code == 200, f"Backtest failed: {r.text}"
    bt = r.json()
    assert "cagr_strategy_pct" in bt
    print("✔ 6. Testing Backtesting Sandbox (3Y)")

    # 7. Stock Screener & Search
    r = client.get("/api/markets/search?q=TCS")
    assert r.status_code == 200, f"Search failed: {r.text}"
    results = r.json()
    assert len(results) > 0
    print(f"✔ 7. Testing Live Stock Screener & Search ({len(results)} matches for 'TCS')")

    # 8. Top Movers
    r = client.get("/api/markets/movers")
    assert r.status_code == 200, f"Movers failed: {r.text}"
    movers = r.json()
    assert len(movers["largecap_gainers"]) > 0
    assert len(movers["midcap_gainers"]) > 0
    assert len(movers["smallcap_gainers"]) > 0
    print("✔ 8. Testing Top Movers (Large Cap, Mid Cap, Small Cap)")

    # 9. Day's Sector Movements
    r = client.get("/api/markets/sectors")
    assert r.status_code == 200, f"Sectors failed: {r.text}"
    sectors = r.json()
    assert len(sectors) >= 12
    print(f"✔ 9. Testing Day's Sector Movements ({len(sectors)} NSE & BSE sectors)")

    # 10. Indian Indices (Groww-Style)
    r = client.get("/api/indices/indian")
    assert r.status_code == 200, f"Indian indices failed: {r.text}"
    ind_indices = r.json()
    assert len(ind_indices) >= 15
    print(f"✔ 10. Testing Indian Indices Hub ({len(ind_indices)} Indian indices: Nifty 50, Sensex, Sectorals, Mid/Smallcap)")

    # 11. Global Indices
    r = client.get("/api/indices/global")
    assert r.status_code == 200, f"Global indices failed: {r.text}"
    glob_indices = r.json()
    assert len(glob_indices) >= 10
    print(f"✔ 11. Testing Global Indices Hub ({len(glob_indices)} Global indices: S&P 500, Nasdaq, Nikkei, FTSE, DAX, etc.)")

    # 12. Discovery Hub (IPOs, Bonds, ETFs, MTF, Events)
    r_ipo = client.get("/api/discovery/ipos")
    r_bonds = client.get("/api/discovery/bonds")
    r_etfs = client.get("/api/discovery/etfs")
    r_mtf = client.get("/api/discovery/mtf-stocks")
    r_events = client.get("/api/discovery/events-calendar")
    assert r_ipo.status_code == 200 and r_bonds.status_code == 200 and r_etfs.status_code == 200
    assert r_mtf.status_code == 200 and len(r_mtf.json()) > 0
    assert r_events.status_code == 200 and len(r_events.json()) > 0
    print(f"✔ 12. Testing Discovery Hub (IPOs with GMP, Bonds & SGBs, ETFs, {len(r_mtf.json())} MTF Stocks, Events Calendar)")

    # 13. Stress Testing
    r = client.post("/api/intelligence/stress-test?scenario_type=nifty_drop_20")
    assert r.status_code == 200, f"Stress test failed: {r.text}"
    st = r.json()
    assert "projected_portfolio_loss" in st
    print("✔ 13. Testing Portfolio Stress Testing ('What if Nifty drops 20%?')")

    # 14. Rebalancing Alerts
    r = client.get("/api/intelligence/rebalance-alerts")
    assert r.status_code == 200, f"Rebalancing alerts failed: {r.text}"
    print("✔ 14. Testing Rebalancing Alerts & Allocation Drift")

    # 15. Tax-Loss Harvesting
    r = client.get("/api/intelligence/tax-loss-harvesting")
    assert r.status_code == 200, f"Tax loss failed: {r.text}"
    print("✔ 15. Testing Tax-Loss Harvesting Engine")

    # 16. Correlation Matrix
    r = client.get("/api/intelligence/correlation-matrix")
    assert r.status_code == 200, f"Correlation failed: {r.text}"
    assert "matrix" in r.json()
    print("✔ 16. Testing Correlation Matrix")

    # 17. Options Screener
    r = client.get("/api/intelligence/options-screener")
    assert r.status_code == 200, f"Options screener failed: {r.text}"
    options = r.json()
    assert len(options) > 0
    print(f"✔ 17. Testing Options Screener (RSI-based Call/Put setups)")

    # 18. Enhanced Market Screener (Sector & Gain-to-Loss sorting)
    r = client.get("/api/markets/screener?sector=IT%20Services&sort_by=gain_to_loss")
    assert r.status_code == 200, f"Screener failed: {r.text}"
    sc_data = r.json()
    assert "stocks" in sc_data and len(sc_data["stocks"]) > 0
    assert sc_data["selected_sector"] == "IT Services"
    print(f"✔ 18. Testing Enhanced Screener ({len(sc_data['stocks'])} stocks in IT Services sorted by Gain-to-Loss)")

    # 19. Groww 5-Tab Deep Stock Detail
    r = client.get(f"/api/markets/detail/{ticker}")
    assert r.status_code == 200, f"Groww detail failed: {r.text}"
    dt = r.json()
    assert "overview" in dt and "fundamental" in dt and "technical" in dt and "events" in dt and "news" in dt
    assert "market_depth" in dt["overview"]
    assert "quarterly_financials" in dt["fundamental"]
    assert "moving_averages" in dt["technical"]
    assert "dividends" in dt["events"]
    assert "articles" in dt["news"]
    print(f"✔ 19. Testing Groww 5-Tab Deep Stock Detail for {ticker} (Overview, Fundamental, Technical, Events, News)")

    print("================ ALL BACKEND TESTS PASSED WITH 100% SUCCESS! ================")

if __name__ == "__main__":
    test_full_suite()
