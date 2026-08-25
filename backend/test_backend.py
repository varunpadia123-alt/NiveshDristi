import sys
import os
import codecs
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
    for h in holdings[:3]:
        print(f"Holding: {h['ticker']} ({h['symbol_name']}) | Badge: {h['badge']} | Composite Score: {h['composite_score']} | P&L: {h['pnl_percentage']}%")

    print("\n--- 4. Testing Multi-Indicator Technical Engine & FinBERT Sentiment ---")
    test_ticker = holdings[0]["ticker"] if holdings else "RELIANCE.NS"
    res = client.get(f"/api/analysis/metrics/{test_ticker}")
    assert res.status_code == 200
    metrics = res.json()
    print(f"Ticker: {metrics['ticker']} | Price: Rs {metrics['current_price']}")
    print(f"Composite Score: {metrics['composite_score']} (Scale: -5.0 to +5.0) | Badge: {metrics['badge']}")
    print(f"Momentum: {metrics['momentum_score']} | Trend: {metrics['trend_score']} | Volume: {metrics['volume_score']}")
    print(f"FinBERT Sentiment: {metrics['sentiment_score']} ({metrics['sentiment_label']}) | Value Trap Risk: {metrics['value_trap_risk']}")
    print(f"Headline: {metrics['sentiment_headline']}")

    print("\n--- 5. Testing AI Swap Engine & RAG Rationales ---")
    res = client.get("/api/analysis/alternatives")
    assert res.status_code == 200
    alts = res.json()
    print(f"Discovered {len(alts)} alternative recommendations.")
    if alts:
        first = alts[0]
        print(f"Original: {first['original_ticker']} ({first['original_badge']}, Score: {first['original_composite_score']})")
        print(f"Alternative: {first['alternative_ticker']} ({first['alternative_badge']}, Score: {first['alternative_composite_score']})")
        print(f"Technical Improvement: +{first['technical_score_improvement']} pts")
        print(f"Tax Type: {first['tax_type']} | Estimated Tax: Rs {first['estimated_tax_payable']} | Redeployable: Rs {first['redeployable_capital']}")
        print(f"RAG Snippet: {first['rag_rationale'][:160]}...")

    print("\n--- 6. Testing 1-Click Swap Execution ---")
    if alts:
        swap_target = alts[0]
        swap_payload = {
            "holding_id": swap_target["original_holding_id"],
            "alternative_ticker": swap_target["alternative_ticker"],
            "alternative_name": swap_target["alternative_name"],
            "sector": swap_target["sector"],
            "alternative_price": swap_target["alternative_price"]
        }
        res = client.post("/api/portfolio/swap", json=swap_payload)
        assert res.status_code == 200
        swap_res = res.json()
        print(f"Swap Result: {swap_res['message']}")
        print(f"Redeployed Amount: Rs {swap_res['redeployed_amount']} into {swap_res['new_quantity']} shares of {swap_res['new_ticker']}")

    print("\n--- 7. Testing Backtesting Sandbox (3Y) ---")
    res = client.get("/api/backtest/run?ticker=RELIANCE.NS&timeframe_years=3")
    assert res.status_code == 200
    backtest = res.json()
    print(f"Strategy CAGR: {backtest['cagr_strategy_pct']}% vs Buy-and-Hold CAGR: {backtest['cagr_buy_hold_pct']}%")
    print(f"Win Rate: {backtest['win_rate_pct']}% | Sharpe: {backtest['sharpe_ratio']} | Max Drawdown: {backtest['max_drawdown_pct']}%")

    print("\n--- 8. Testing Risk Profile & Broker Sync ---")
    res = client.put("/api/risk/profile", json={"risk_score": 7, "broker_connected": "Upstox"})
    assert res.status_code == 200
    print("Risk profile updated successfully.")

    print("\n================ ALL NIVESHDRISTI BACKEND TESTS PASSED SUCCESSFULLY! ================")

if __name__ == "__main__":
    test_all_endpoints()
