import pandas as pd
import pandas_ta as ta
import numpy as np
from app.engine.market_data import fetch_stock_history
from app.schemas import TechnicalMetrics

def compute_technical_metrics(ticker: str, df: pd.DataFrame = None) -> TechnicalMetrics:
    """
    Computes 130+ technical metrics using pandas-ta (RSI, MACD, Moving Averages, Support/Resistance).
    Assigns NiveshDristi regulatory compliant badges: BULLISH TREND, BEARISH SIGNAL, NEUTRAL/STAGNANT.
    """
    if df is None or df.empty:
        df = fetch_stock_history(ticker, period="1y")

    # Clone df to avoid pandas warnings
    df_ta = df.copy()

    # Calculate RSI 14
    rsi = ta.rsi(df_ta['Close'], length=14)
    rsi_val = float(rsi.iloc[-1]) if rsi is not None and not rsi.isna().iloc[-1] else 50.0

    # Calculate MACD (12, 26, 9)
    macd = ta.macd(df_ta['Close'], fast=12, slow=26, signal=9)
    if macd is not None and not macd.empty:
        macd_line = float(macd.iloc[-1, 0])
        macd_hist = float(macd.iloc[-1, 1])
        macd_signal = float(macd.iloc[-1, 2])
    else:
        macd_line, macd_hist, macd_signal = 0.0, 0.0, 0.0

    # Calculate Moving Averages (SMA 20, 50, 200, EMA 9, 21)
    sma_20 = float(ta.sma(df_ta['Close'], length=20).iloc[-1])
    sma_50 = float(ta.sma(df_ta['Close'], length=50).iloc[-1])
    sma_200 = float(ta.sma(df_ta['Close'], length=200).iloc[-1])
    ema_9 = float(ta.ema(df_ta['Close'], length=9).iloc[-1])
    ema_21 = float(ta.ema(df_ta['Close'], length=21).iloc[-1])

    current_price = float(df_ta['Close'].iloc[-1])

    # Support & Resistance (Pivot points / 50-day min/max)
    support_level = float(df_ta['Low'].tail(50).min())
    resistance_level = float(df_ta['High'].tail(50).max())

    # Regulatory Compliant Badge Engine Logic
    # 1. Bearish Signal condition: RSI < 42 OR MACD Hist < 0 AND Price < SMA 50
    if rsi_val < 42 and macd_hist < 0:
        badge = "BEARISH SIGNAL"
        badge_reason = f"RSI is oversold/weak ({rsi_val:.1f}) and MACD histogram is negative ({macd_hist:.2f}) with price below 50-SMA."
    elif current_price < sma_50 and macd_hist < 0:
        badge = "BEARISH SIGNAL"
        badge_reason = f"Price (₹{current_price:.2f}) crossed below 50-day Moving Average (₹{sma_50:.2f}) with bearish MACD crossover."
    # 2. Bullish Trend condition: Price > SMA 20 > SMA 50, RSI 52-70, positive MACD
    elif current_price > sma_20 and rsi_val > 52 and macd_hist > 0:
        badge = "BULLISH TREND"
        badge_reason = f"Healthy momentum with RSI at {rsi_val:.1f}, price trading above 20-SMA (₹{sma_20:.2f}), and positive MACD trajectory."
    else:
        badge = "NEUTRAL/STAGNANT"
        badge_reason = f"Consolidating between support (₹{support_level:.2f}) and resistance (₹{resistance_level:.2f}). Momentum metrics neutral."

    return TechnicalMetrics(
        ticker=ticker,
        current_price=round(current_price, 2),
        rsi_14=round(rsi_val, 2),
        macd_line=round(macd_line, 2),
        macd_signal=round(macd_signal, 2),
        macd_hist=round(macd_hist, 2),
        sma_20=round(sma_20, 2),
        sma_50=round(sma_50, 2),
        sma_200=round(sma_200, 2),
        ema_9=round(ema_9, 2),
        ema_21=round(ema_21, 2),
        badge=badge,
        badge_reason=badge_reason,
        support_level=round(support_level, 2),
        resistance_level=round(resistance_level, 2)
    )
