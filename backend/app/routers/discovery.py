from fastapi import APIRouter, Query
from typing import List, Optional
from app.schemas import IPOItem, BondItem, ETFItem

router = APIRouter(prefix="/discovery", tags=["IPOs, Bonds & ETFs Discovery"])

# 1. IPO Catalog with Live GMP & Subscription Multiples
IPOS_DATA = [
    {
        "id": "ipo-1",
        "name": "Tata EV Technologies Ltd",
        "symbol": "TATAEV",
        "price_band": "₹475 - ₹500",
        "min_price": 475.0,
        "max_price": 500.0,
        "issue_size_cr": 3850.0,
        "lot_size": 30,
        "open_date": "2026-08-25",
        "close_date": "2026-08-29",
        "listing_date": "2026-09-04",
        "gmp_inr": 185.0,
        "estimated_listing_gain_pct": 37.0,
        "subscription_times": 48.2,
        "retail_subscription_times": 24.5,
        "qib_subscription_times": 78.4,
        "nii_subscription_times": 52.1,
        "status": "OPEN",
        "ai_rating": "SUBSCRIBE",
        "ai_summary": "Pioneering Indian EV battery and powertrain tech with strong Tata parentage. High operating margin expansion and strong institutional bidding."
    },
    {
        "id": "ipo-2",
        "name": "Swiggy Quick Commerce Ltd",
        "symbol": "SWIGGY",
        "price_band": "₹371 - ₹390",
        "min_price": 371.0,
        "max_price": 390.0,
        "issue_size_cr": 11327.0,
        "lot_size": 38,
        "open_date": "2026-09-02",
        "close_date": "2026-09-05",
        "listing_date": "2026-09-12",
        "gmp_inr": 45.0,
        "estimated_listing_gain_pct": 11.5,
        "subscription_times": 3.6,
        "retail_subscription_times": 1.9,
        "qib_subscription_times": 6.2,
        "nii_subscription_times": 2.8,
        "status": "UPCOMING",
        "ai_rating": "NEUTRAL",
        "ai_summary": "Leading Indian food delivery & Instamart quick commerce platform. Rapid top-line scale though EBITDA turnaround still in progress."
    },
    {
        "id": "ipo-3",
        "name": "NTPC Green Energy Ltd",
        "symbol": "NTPCGREEN",
        "price_band": "₹102 - ₹108",
        "min_price": 102.0,
        "max_price": 108.0,
        "issue_size_cr": 10000.0,
        "lot_size": 138,
        "open_date": "2026-08-18",
        "close_date": "2026-08-22",
        "listing_date": "2026-08-27",
        "gmp_inr": 16.0,
        "estimated_listing_gain_pct": 14.8,
        "subscription_times": 18.7,
        "retail_subscription_times": 11.2,
        "qib_subscription_times": 32.5,
        "nii_subscription_times": 19.4,
        "status": "LISTED",
        "ai_rating": "SUBSCRIBE",
        "ai_summary": "100% pure renewable subsidiary of PSU giant NTPC. Vast pipeline in solar & green hydrogen with sovereign-backed PPAs."
    },
    {
        "id": "ipo-4",
        "name": "Hyundai Motor India Ltd",
        "symbol": "HYUNDAI",
        "price_band": "₹1865 - ₹1960",
        "min_price": 1865.0,
        "max_price": 1960.0,
        "issue_size_cr": 27870.0,
        "lot_size": 7,
        "open_date": "2026-08-10",
        "close_date": "2026-08-14",
        "listing_date": "2026-08-20",
        "gmp_inr": 85.0,
        "estimated_listing_gain_pct": 4.3,
        "subscription_times": 2.4,
        "retail_subscription_times": 0.8,
        "qib_subscription_times": 6.9,
        "nii_subscription_times": 1.2,
        "status": "LISTED",
        "ai_rating": "NEUTRAL",
        "ai_summary": "Second largest passenger vehicle OEM in India. Steady free cash flows and premium SUV dominance with attractive RoCE."
    },
    {
        "id": "ipo-5",
        "name": "Zepto Quick Delivery Ltd",
        "symbol": "ZEPTO",
        "price_band": "₹620 - ₹660",
        "min_price": 620.0,
        "max_price": 660.0,
        "issue_size_cr": 4500.0,
        "lot_size": 22,
        "open_date": "2026-09-15",
        "close_date": "2026-09-18",
        "listing_date": "2026-09-25",
        "gmp_inr": 210.0,
        "estimated_listing_gain_pct": 31.8,
        "subscription_times": 0.0,
        "retail_subscription_times": 0.0,
        "qib_subscription_times": 0.0,
        "nii_subscription_times": 0.0,
        "status": "UPCOMING",
        "ai_rating": "SUBSCRIBE",
        "ai_summary": "Hyper-growth 10-minute grocery delivery leader with dense dark-store network and accelerating unit economics in Tier 1 metros."
    }
]

# 2. Fixed Income & Bond Universe
BONDS_DATA = [
    {
        "id": "bond-1",
        "name": "Sovereign Gold Bond (SGB) 2031-IX",
        "issuer": "Reserve Bank of India (Govt of India)",
        "bond_type": "SGB",
        "coupon_rate_pct": 2.50,
        "yield_to_maturity_pct": 11.80, # Capital appreciation + coupon
        "credit_rating": "SOVEREIGN (AAA)",
        "maturity_date": "2031-11-15",
        "min_investment": 7250.0,
        "interest_payout_frequency": "Semi-Annual",
        "risk_level": "Low",
        "tax_status": "100% Tax-Free Capital Gains on Maturity"
    },
    {
        "id": "bond-2",
        "name": "7.18% GS 2033 (Benchmark 10Y G-Sec)",
        "issuer": "Government of India",
        "bond_type": "G-Sec",
        "coupon_rate_pct": 7.18,
        "yield_to_maturity_pct": 7.08,
        "credit_rating": "SOVEREIGN",
        "maturity_date": "2033-08-14",
        "min_investment": 10000.0,
        "interest_payout_frequency": "Semi-Annual",
        "risk_level": "Low",
        "tax_status": "Taxed at Slab Rates"
    },
    {
        "id": "bond-3",
        "name": "HDFC Bank Tier-II Subordinated Bond 2034",
        "issuer": "HDFC Bank Ltd",
        "bond_type": "Corporate Bond",
        "coupon_rate_pct": 7.75,
        "yield_to_maturity_pct": 7.82,
        "credit_rating": "CRISIL AAA",
        "maturity_date": "2034-03-28",
        "min_investment": 100000.0,
        "interest_payout_frequency": "Annual",
        "risk_level": "Low",
        "tax_status": "Taxed at Slab Rates"
    },
    {
        "id": "bond-4",
        "name": "Power Finance Corp (PFC) 54EC Capital Gain Bond",
        "issuer": "PFC Ltd (Govt of India Enterprise)",
        "bond_type": "Corporate Bond",
        "coupon_rate_pct": 5.25,
        "yield_to_maturity_pct": 5.25,
        "credit_rating": "ICRA AAA",
        "maturity_date": "2029-10-31",
        "min_investment": 20000.0,
        "interest_payout_frequency": "Annual",
        "risk_level": "Low",
        "tax_status": "Exempts Capital Gains Tax under Sec 54EC"
    },
    {
        "id": "bond-5",
        "name": "Tata Capital Financial Services Senior Secured NCD",
        "issuer": "Tata Capital Ltd",
        "bond_type": "Corporate Bond",
        "coupon_rate_pct": 8.45,
        "yield_to_maturity_pct": 8.52,
        "credit_rating": "CARE AAA",
        "maturity_date": "2027-12-10",
        "min_investment": 10000.0,
        "interest_payout_frequency": "Monthly",
        "risk_level": "Moderate",
        "tax_status": "Taxed at Slab Rates"
    },
    {
        "id": "bond-6",
        "name": "Muthoot Finance High-Yield NCD Series IX",
        "issuer": "Muthoot Finance Ltd",
        "bond_type": "High-Yield",
        "coupon_rate_pct": 9.20,
        "yield_to_maturity_pct": 9.35,
        "credit_rating": "CRISIL AA+",
        "maturity_date": "2028-06-20",
        "min_investment": 10000.0,
        "interest_payout_frequency": "Annual",
        "risk_level": "Moderate",
        "tax_status": "Taxed at Slab Rates"
    }
]

# 3. ETF Universe
ETFS_DATA = [
    {
        "ticker": "NIFTYBEES.NS",
        "name": "Nippon India Nifty 50 BeES ETF",
        "category": "Index",
        "current_nav": 268.45,
        "day_change_pct": 0.65,
        "return_1y_pct": 21.8,
        "return_3y_cagr_pct": 16.4,
        "expense_ratio_pct": 0.04,
        "aum_cr": 28450.0,
        "tracking_error_pct": 0.02,
        "pe_ratio": 23.2,
        "high_52w": 282.0,
        "low_52w": 210.0
    },
    {
        "ticker": "BANKBEES.NS",
        "name": "Nippon India Bank BeES ETF",
        "category": "Index",
        "current_nav": 535.20,
        "day_change_pct": 0.78,
        "return_1y_pct": 18.2,
        "return_3y_cagr_pct": 14.8,
        "expense_ratio_pct": 0.18,
        "aum_cr": 14200.0,
        "tracking_error_pct": 0.03,
        "pe_ratio": 16.5,
        "high_52w": 560.0,
        "low_52w": 430.0
    },
    {
        "ticker": "GOLDBEES.NS",
        "name": "Nippon India ETF Gold BeES",
        "category": "Gold & Silver",
        "current_nav": 68.90,
        "day_change_pct": 0.42,
        "return_1y_pct": 28.5,
        "return_3y_cagr_pct": 19.2,
        "expense_ratio_pct": 0.79,
        "aum_cr": 16800.0,
        "tracking_error_pct": 0.04,
        "pe_ratio": 0.0,
        "high_52w": 72.0,
        "low_52w": 52.0
    },
    {
        "ticker": "SILVERBEES.NS",
        "name": "Nippon India ETF Silver BeES",
        "category": "Gold & Silver",
        "current_nav": 94.10,
        "day_change_pct": -0.85,
        "return_1y_pct": 32.1,
        "return_3y_cagr_pct": 21.0,
        "expense_ratio_pct": 0.48,
        "aum_cr": 4500.0,
        "tracking_error_pct": 0.08,
        "pe_ratio": 0.0,
        "high_52w": 105.0,
        "low_52w": 68.0
    },
    {
        "ticker": "ITBEES.NS",
        "name": "Nippon India ETF Nifty IT",
        "category": "Sectoral",
        "current_nav": 43.60,
        "day_change_pct": 1.72,
        "return_1y_pct": 29.4,
        "return_3y_cagr_pct": 15.6,
        "expense_ratio_pct": 0.22,
        "aum_cr": 3800.0,
        "tracking_error_pct": 0.04,
        "pe_ratio": 29.5,
        "high_52w": 47.0,
        "low_52w": 32.0
    },
    {
        "ticker": "PHARMABEES.NS",
        "name": "Nippon India ETF Nifty Pharma",
        "category": "Sectoral",
        "current_nav": 22.80,
        "day_change_pct": 1.15,
        "return_1y_pct": 34.2,
        "return_3y_cagr_pct": 18.9,
        "expense_ratio_pct": 0.24,
        "aum_cr": 2100.0,
        "tracking_error_pct": 0.05,
        "pe_ratio": 36.0,
        "high_52w": 25.0,
        "low_52w": 16.0
    },
    {
        "ticker": "MON100.NS",
        "name": "Motilal Oswal Nasdaq 100 ETF",
        "category": "Global/Thematic",
        "current_nav": 182.40,
        "day_change_pct": 1.28,
        "return_1y_pct": 38.6,
        "return_3y_cagr_pct": 22.4,
        "expense_ratio_pct": 0.58,
        "aum_cr": 8200.0,
        "tracking_error_pct": 0.09,
        "pe_ratio": 34.0,
        "high_52w": 195.0,
        "low_52w": 128.0
    },
    {
        "ticker": "CPSEETF.NS",
        "name": "CPSE ETF (PSU Navratnas)",
        "category": "Sectoral",
        "current_nav": 92.30,
        "day_change_pct": 0.55,
        "return_1y_pct": 46.8,
        "return_3y_cagr_pct": 32.5,
        "expense_ratio_pct": 0.05,
        "aum_cr": 41000.0,
        "tracking_error_pct": 0.02,
        "pe_ratio": 13.8,
        "high_52w": 105.0,
        "low_52w": 58.0
    }
]

@router.get("/ipos", response_model=List[IPOItem])
def get_ipos(status: Optional[str] = Query(default=None, description="Filter by status: OPEN, UPCOMING, LISTED")):
    """Returns IPO pipeline with grey market premium (GMP) and subscription metrics."""
    if status:
        return [i for i in IPOS_DATA if i["status"].upper() == status.upper()]
    return IPOS_DATA

@router.get("/bonds", response_model=List[BondItem])
def get_bonds(bond_type: Optional[str] = Query(default=None, description="Filter by SGB, G-Sec, Corporate Bond, High-Yield")):
    """Returns fixed-income products and bonds with yield-to-maturity (YTM) and coupon details."""
    if bond_type:
        return [b for b in BONDS_DATA if b["bond_type"].upper() == bond_type.upper()]
    return BONDS_DATA

@router.get("/etfs", response_model=List[ETFItem])
def get_etfs(category: Optional[str] = Query(default=None, description="Filter by Index, Sectoral, Gold & Silver, Global/Thematic")):
    """Returns exchange traded funds (ETFs) with live NAV, CAGR returns, and expense ratios."""
    if category:
        return [e for e in ETFS_DATA if category.lower() in e["category"].lower()]
    return ETFS_DATA
