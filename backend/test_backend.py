import sys
import os
import io

# Ensure UTF-8 stdout for Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
elif hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

sys.path.append(os.path.join(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_all_endpoints():
    print("--- 1. Testing Root Endpoint ---")
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    print(f"Project: {data['project']} | Version: {data['version']}")

    print("\n--- 2. Testing Portfolio Summary & Concentration Risk ---")
    res = client.get("/api/portfolio/summary")
    assert res.status_code == 200
    data = res.json()
    print(f"Portfolio Total Value: Rs {data['total_current_value']:,.2f}")
    print(f"Portfolio Health Score: {data['portfolio_health_score']}/100")
    print(f"Concentration Alerts: {data['concentration_alerts']}")

    print("\n--- 3. Testing User Holdings with Badges & Composite Scores ---")
    res = client.get("/api/portfolio/holdings")
    assert res.status_code == 200
    holdings = res.json()
    print(f"Found {len(holdings)} active holdings.")
    for h in holdings[:2]:
        print(f"Holding: {h['ticker']} ({h['symbol_name']}) | Badge: {h['badge']} | Composite Score: {h['composite_score']} | P&L: {h['pnl_percentage']}%")

    print("\n--- 4. Testing Multi-Indicator Technical Engine & FinBERT Sentiment ---")
    test_ticker = holdings[0]["ticker"] if holdings else "RELIANCE.NS"
    res = client.get(f"/api/analysis/metrics/{test_ticker}")
    assert res.status_code == 200
    metrics = res.json()
    print(f"Ticker: {metrics['ticker']} | Price: Rs {metrics['current_price']}")
    print(f"Composite Score: {metrics['composite_score']} | Badge: {metrics['badge']}")
    print(f"Momentum: {metrics['momentum_score']} | Trend: {metrics['trend_score']} | Sentiment: {metrics['sentiment_label']}")

    print("\n--- 5. Testing AI Swap Engine & RAG Rationales ---")
    res = client.get("/api/analysis/alternatives")
    assert res.status_code == 200
    alts = res.json()
    print(f"Discovered {len(alts)} alternative recommendations.")

    print("\n--- 6. Testing Backtesting Sandbox (3Y) ---")
    res = client.get("/api/backtest/run?ticker=RELIANCE.NS&timeframe_years=3")
    assert res.status_code == 200
    backtest = res.json()
    print(f"Strategy CAGR: {backtest['cagr_strategy_pct']}% | Sharpe: {backtest['sharpe_ratio']}")

    print("\n--- 7. Testing Live Stock Screener & Search ---")
    res = client.get("/api/markets/search?query=TATA")
    assert res.status_code == 200
    search_results = res.json()
    print(f"Stock search returned {len(search_results)} results for 'TATA'.")
    if search_results:
        print(f"Top result: {search_results[0]['ticker']} ({search_results[0]['name']}) - Rs {search_results[0]['current_price']} ({search_results[0]['day_change_pct']}%)")

    print("\n--- 8. Testing Top Movers (Large Cap, Mid Cap, Small Cap) ---")
    res = client.get("/api/markets/top-movers")
    assert res.status_code == 200
    movers = res.json()
    print(f"Large Cap Gainers: {len(movers['large_cap_gainers'])} | Mid Cap: {len(movers['mid_cap_gainers'])} | Small Cap: {len(movers['small_cap_gainers'])}")
    if movers['large_cap_gainers']:
        lg = movers['large_cap_gainers'][0]
        print(f"Top Large Cap Gainer: {lg['ticker']} (+{lg['day_change_pct']}%)")

    print("\n--- 9. Testing Day's Sector Movements ---")
    res = client.get("/api/markets/sectors")
    assert res.status_code == 200
    sectors = res.json()
    print(f"Tracked {len(sectors)} Indian sector indices.")
    for s in sectors[:3]:
        print(f"Sector: {s['sector_name']} | Day Move: {s['day_change_pct']:+.2f}% | Sentiment: {s['sentiment']} | Top: {s['top_performer']}")

    print("\n--- 10. Testing IPOs, Bonds, and ETFs Hub ---")
    ipos_res = client.get("/api/discovery/ipos")
    assert ipos_res.status_code == 200
    bonds_res = client.get("/api/discovery/bonds")
    assert bonds_res.status_code == 200
    etfs_res = client.get("/api/discovery/etfs")
    assert etfs_res.status_code == 200
    print(f"Found {len(ipos_res.json())} IPOs, {len(bonds_res.json())} Bonds, and {len(etfs_res.json())} ETFs.")

    print("\n--- 11. Testing Portfolio Stress Testing ('What if Nifty drops 20%?') ---")
    res = client.get("/api/intelligence/stress-test?scenario=nifty_drop_20")
    assert res.status_code == 200
    stress = res.json()
    print(f"Scenario: {stress['scenario_name']}")
    print(f"Portfolio Simulated Value: Rs {stress['simulated_portfolio_value']:,.2f} (Loss: {stress['total_loss_pct']}%)")
    print(f"Max Drawdown Holding: {stress['max_drawdown_holding']} | Defensive Rec: {stress['defensive_recommendation'][:100]}...")

    print("\n--- 12. Testing Rebalancing Alerts & Allocation Drift ---")
    res = client.get("/api/intelligence/rebalancing")
    assert res.status_code == 200
    reb = res.json()
    print(f"Drift Detected: {reb['is_drift_detected']} | Urgency: {reb['rebalancing_urgency']} | Max Drift: {reb['max_drift_pct']}%")
    print(f"Suggested Orders: {reb['suggested_orders']}")

    print("\n--- 13. Testing Tax-Loss Harvesting Engine ---")
    res = client.get("/api/intelligence/tax-harvesting")
    assert res.status_code == 200
    tax_harv = res.json()
    print(f"Eligible Loss Positions: {tax_harv['eligible_holdings_count']} | Potential Tax Savings: Rs {tax_harv['total_potential_tax_savings_inr']:,.2f}")

    print("\n--- 14. Testing Correlation Matrix ---")
    res = client.get("/api/intelligence/correlation-matrix")
    assert res.status_code == 200
    corr = res.json()
    print(f"Correlation Matrix Size: {len(corr['matrix'])}x{len(corr['matrix'][0])} | Diversification Score: {corr['diversification_score']}/100")
    print(f"High Correlation Pairs: {corr['high_correlation_pairs']}")

    print("\n--- 15. Testing Options Screener (RSI-based Call/Put) ---")
    res = client.get("/api/intelligence/options-screener")
    assert res.status_code == 200
    opt = res.json()
    print(f"Screened {opt['total_screened']} F&O contracts. Found {len(opt['call_opportunities'])} CALL setups and {len(opt['put_opportunities'])} PUT setups.")
    if opt['call_opportunities']:
        c = opt['call_opportunities'][0]
        print(f"Call Signal: {c['ticker']} Strike {c['strike_price']} | RSI: {c['rsi_14']} | Target: Rs {c['target_premium']} (SL: Rs {c['stop_loss_premium']})")

    print("\n================ ALL NIVESHDRISTI BACKEND TESTS PASSED WITH 100% SUCCESS! ================")

if __name__ == "__main__":
    test_all_endpoints()
