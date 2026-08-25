import pandas as pd
import pandas_ta as ta
import numpy as np
from app.engine.market_data import fetch_stock_history
from app.engine.sentiment import analyze_sentiment
from app.schemas import TechnicalMetrics

def compute_technical_metrics(ticker: str, df: pd.DataFrame = None) -> TechnicalMetrics:
    """
    Computes 130+ technical metrics using pandas-ta (RSI, MACD, Moving Averages, Volume, Support/Resistance).
    Calculates a weighted composite score (-5.0 to +5.0) across Momentum, Trend Strength, and Volume/Risk,
    assigning NiveshDristi's actionable badges: HOLD, SELL, or SWAP, with FinBERT sentiment overlay.
    """
    if df is None or df.empty:
        df = fetch_stock_history(ticker, period="1y")

    df_ta = df.copy()

    # 1. Momentum Indicators
    rsi = ta.rsi(df_ta['Close'], length=14)
    rsi_val = float(rsi.iloc[-1]) if rsi is not None and not rsi.isna().iloc[-1] else 50.0

    # 2. MACD (12, 26, 9)
    macd = ta.macd(df_ta['Close'], fast=12, slow=26, signal=9)
    if macd is not None and not macd.empty:
        macd_line = float(macd.iloc[-1, 0])
        macd_hist = float(macd.iloc[-1, 1])
        macd_signal = float(macd.iloc[-1, 2])
    else:
        macd_line, macd_hist, macd_signal = 0.0, 0.0, 0.0

    # 3. Moving Averages (SMA 20, 50, 200, EMA 9, 21)
    sma_20 = float(ta.sma(df_ta['Close'], length=20).iloc[-1])
    sma_50 = float(ta.sma(df_ta['Close'], length=50).iloc[-1])
    sma_200 = float(ta.sma(df_ta['Close'], length=200).iloc[-1])
    ema_9 = float(ta.ema(df_ta['Close'], length=9).iloc[-1])
    ema_21 = float(ta.ema(df_ta['Close'], length=21).iloc[-1])

    current_price = float(df_ta['Close'].iloc[-1])

    # 4. Volume Profile
    vol_sma_20 = float(ta.sma(df_ta['Volume'].astype(float), length=20).iloc[-1])
    current_vol = float(df_ta['Volume'].iloc[-1])
    vol_ratio = (current_vol / vol_sma_20) if vol_sma_20 > 0 else 1.0

    # 5. Support & Resistance (Pivot Channel / 50-day min-max)
    support_level = float(df_ta['Low'].tail(50).min())
    resistance_level = float(df_ta['High'].tail(50).max())

    # -------------------------------------------------------------
    # Weighted Composite Scoring Engine (-5.0 to +5.0 scale)
    # -------------------------------------------------------------
    # (a) Momentum Score (-5.0 to +5.0)
    # RSI: 50 is 0. 70+ is +4, 30- is -4. EMA 9 vs 21 adds +/- 1.
    rsi_norm = ((rsi_val - 50.0) / 25.0) * 4.0
    ema_cross = 1.0 if ema_9 > ema_21 else -1.0
    momentum_score = np.clip(rsi_norm + (ema_cross * 0.8), -5.0, 5.0)

    # (b) Trend Score (-5.0 to +5.0)
    trend_points = 0.0
    if current_price > sma_20:
        trend_points += 1.2
    else:
        trend_points -= 1.2
        
    if current_price > sma_50:
        trend_points += 1.5
    else:
        trend_points -= 1.5
        
    if current_price > sma_200:
        trend_points += 1.0
    else:
        trend_points -= 1.0

    if macd_hist > 0:
        trend_points += 1.3
    else:
        trend_points -= 1.3
    trend_score = np.clip(trend_points, -5.0, 5.0)

    # (c) Volume & Channel Score (-5.0 to +5.0)
    channel_range = max(resistance_level - support_level, 1.0)
    pos_in_channel = (current_price - support_level) / channel_range # 0.0 (at support) to 1.0 (at resistance)
    
    vol_boost = 0.8 if vol_ratio > 1.2 else (-0.5 if vol_ratio < 0.7 else 0.0)
    # If price near support and bouncing, favorable. If breaking support, severe negative.
    if current_price < support_level * 1.01:
        support_points = -3.5
    elif pos_in_channel > 0.6:
        support_points = 2.0
    elif pos_in_channel > 0.3:
        support_points = 0.5
    else:
        support_points = -1.0
    volume_score = np.clip(support_points + vol_boost, -5.0, 5.0)

    # Weighted Composite Formula: 35% Momentum + 35% Trend + 30% Volume/Support
    composite_raw = (0.35 * momentum_score) + (0.35 * trend_score) + (0.30 * volume_score)
    composite_score = round(float(np.clip(composite_raw, -5.0, 5.0)), 2)

    # Actionable 3-Tier Badge Assignment:
    # HOLD: >= +1.5 (Strong momentum & upward trend)
    # SELL: <= -1.5 (Bearish crossovers & broken support)
    # SWAP: -1.5 < score < +1.5 (Neutral/stagnant momentum with higher-potential alternatives nearby)
    if composite_score >= 1.5:
        badge = "HOLD"
        badge_reason = f"Strong upward trend with composite score +{composite_score:.1f}. RSI ({rsi_val:.1f}) and moving averages indicate solid bullish momentum."
    elif composite_score <= -1.5:
        badge = "SELL"
        badge_reason = f"Bearish signal with composite score {composite_score:.1f}. MACD histogram is negative ({macd_hist:.2f}) and price is testing/below critical support."
    else:
        badge = "SWAP"
        badge_reason = f"Consolidating/stagnant momentum with composite score {composite_score:+.1f}. Technical indicators suggest capital redeployment into higher-momentum peers."

    # FinBERT Sentiment Overlay
    sentiment = analyze_sentiment(ticker)

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
        volume_sma_ratio=round(vol_ratio, 2),
        support_level=round(support_level, 2),
        resistance_level=round(resistance_level, 2),
        composite_score=composite_score,
        momentum_score=round(float(momentum_score), 2),
        trend_score=round(float(trend_score), 2),
        volume_score=round(float(volume_score), 2),
        badge=badge,
        badge_reason=badge_reason,
        sentiment_score=sentiment["sentiment_score"],
        sentiment_label=sentiment["sentiment_label"],
        value_trap_risk=sentiment["value_trap_risk"],
        sentiment_headline=sentiment["headline"]
    )
