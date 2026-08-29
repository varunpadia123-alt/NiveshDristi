from fastapi import APIRouter, HTTPException, Query
from app.schemas import BacktestResponse
from app.engine.backtest import run_historical_backtest

router = APIRouter(prefix="/backtest", tags=["Backtesting Sandbox"])

@router.get("/run", response_model=BacktestResponse)
def execute_backtest(ticker: str = Query(default="RELIANCE.NS"), timeframe_years: int = Query(default=3, ge=1, le=5)):
    """Runs 1Y-5Y backtest strategy on stock ticker and returns equity curves and signal logs."""
    try:
        results = run_historical_backtest(ticker=ticker.upper(), timeframe_years=timeframe_years)
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Backtest execution failed: {str(e)}")
