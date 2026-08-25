import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_all_endpoints():
    print("--- 1. Testing Root Endpoint ---")
    res = client.get("/")
    assert res.status_code == 200
    print("Root OK:", res.json()["project"])

    print("\n--- 2. Testing Portfolio Summary ---")
    res = client.get("/api/portfolio/summary")
    assert res.status_code == 200
    data = res.json()
    print("Portfolio Total Value:", data["total_current_value"])
    print("Concentration Alerts:", data["concentration_alerts"])

    print("\n--- 3. Testing Technical Indicators (RELIANCE.NS) ---")
    res = client.get("/api/analysis/metrics/RELIANCE.NS")
    assert res.status_code == 200
    metrics = res.json()
    print(f"Ticker: {metrics['ticker']} | RSI: {metrics['rsi_14']} | MACD Hist: {metrics['macd_hist']} | Badge: {metrics['badge']}")

    print("\n--- 4. Testing AI Alternatives Discovery & Tax Impact ---")
    res = client.get("/api/analysis/alternatives")
    assert res.status_code == 200
    alts = res.json()
    print(f"Discovered {len(alts)} alternative recommendations.")
    if alts:
        first = alts[0]
        print(f"Original: {first['original_ticker']} ({first['original_badge']}) -> Alternative: {first['alternative_ticker']} ({first['alternative_badge']})")
        print(f"Tax Penalty: ₹{first['estimated_tax_payable']} ({first['tax_type']})")
        print(f"RAG Rationale Snippet:\n{first['rag_rationale'][:150]}...")

    print("\n--- 5. Testing Historical Backtesting Sandbox (3Y) ---")
    res = client.get("/api/backtest/run?ticker=RELIANCE.NS&timeframe_years=3")
    assert res.status_code == 200
    backtest = res.json()
    print(f"Backtest Ticker: {backtest['ticker']}")
    print(f"Strategy CAGR: {backtest['cagr_strategy_pct']}% vs Buy-and-Hold CAGR: {backtest['cagr_buy_hold_pct']}%")
    print(f"Win Rate: {backtest['win_rate_pct']}% | Max Drawdown: {backtest['max_drawdown_pct']}%")

    print("\n--- 6. Testing Risk Profile Update ---")
    res = client.put("/api/risk/profile", json={"risk_score": 4, "broker_connected": "Upstox"})
    assert res.status_code == 200
    print("Updated Risk Profile successfully:", res.json())

    print("\n================ ALL BACKEND TESTS PASSED SUCCESSFULLY! ================")

if __name__ == "__main__":
    test_all_endpoints()
