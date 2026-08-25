from datetime import datetime
from app.config import settings

def calculate_tax_impact(purchase_date_str: str, current_price: float, buy_price: float, quantity: float):
    """
    Calculates exact Tax Drag for exiting a stock position.
    Under Indian Equity tax laws:
    - Holding period < 365 days => STCG (Short Term Capital Gain) @ 20%
    - Holding period >= 365 days => LTCG (Long Term Capital Gain) @ 12.5%
    """
    try:
        purchase_dt = datetime.strptime(purchase_date_str, "%Y-%m-%d")
    except Exception:
        purchase_dt = datetime.now() - datetime.timedelta(days=180)

    days_held = (datetime.now() - purchase_dt).days
    total_cost = buy_price * quantity
    total_value = current_price * quantity
    unrealized_gain = max(0.0, total_value - total_cost)

    if days_held >= settings.LTCG_THRESHOLD_DAYS:
        tax_type = "LTCG (Long Term)"
        tax_rate_pct = settings.LTCG_TAX_RATE * 100
        # ₹1.25 Lakh LTCG exemption threshold simulation (scaled to position)
        taxable_gain = max(0.0, unrealized_gain - 125000.0 if unrealized_gain > 125000 else unrealized_gain)
        tax_payable = taxable_gain * settings.LTCG_TAX_RATE
    else:
        tax_type = "STCG (Short Term)"
        tax_rate_pct = settings.STCG_TAX_RATE * 100
        tax_payable = unrealized_gain * settings.STCG_TAX_RATE

    net_after_tax_gain = unrealized_gain - tax_payable

    return {
        "holding_days": days_held,
        "tax_type": tax_type,
        "tax_rate_pct": tax_rate_pct,
        "unrealized_gain": round(unrealized_gain, 2),
        "estimated_tax_payable": round(tax_payable, 2),
        "net_gain_after_tax": round(net_after_tax_gain, 2)
    }
