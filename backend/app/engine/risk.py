def is_stock_risk_aligned(stock_beta: float, volatility_score: float, user_risk_score: int) -> bool:
    """
    Evaluates whether an alternative stock recommendation fits user's onboarding risk score (1 to 10).
    - Conservative investor (1-4): Only Large-cap, Beta <= 1.1, Volatility <= 4.0
    - Moderate investor (5-7): Mid/Large-cap, Beta <= 1.4, Volatility <= 7.0
    - Aggressive investor (8-10): All caps, high growth momentum.
    """
    if user_risk_score <= 4:
        # Conservative
        return stock_beta <= 1.1 and volatility_score <= 5.0
    elif user_risk_score <= 7:
        # Moderate
        return stock_beta <= 1.45 and volatility_score <= 7.5
    else:
        # Aggressive
        return True
