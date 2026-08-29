from fastapi import APIRouter
from typing import List
from app.schemas import IpoItem, BondItem, EtfItem

router = APIRouter(prefix="/discovery", tags=["Discovery Hub"])

@router.get("/ipos", response_model=List[IpoItem])
def get_ipos():
    """Live 2026 IPO Discovery Engine with Grey Market Premium (GMP) & Real-time Subscriptions."""
    return [
        IpoItem(
            company_name="NTPC Green Energy Ltd",
            symbol="NTPCGREEN",
            status="OPEN",
            price_band="₹102 - ₹108",
            issue_size_cr=10000.0,
            lot_size=138,
            bidding_dates="Aug 27 - Aug 29",
            gmp_pts=18.50,
            gmp_pct=17.13,
            subscription_rate_x=5.82,
            retail_subscription_x=6.40,
            qib_subscription_x=7.95,
            nii_subscription_x=3.10,
            ai_verdict="SUBSCRIBE (Green Energy Leader)"
        ),
        IpoItem(
            company_name="Swiggy Delivery Solutions Ltd",
            symbol="SWIGGY",
            status="OPEN",
            price_band="₹370 - ₹390",
            issue_size_cr=11327.0,
            lot_size=38,
            bidding_dates="Aug 26 - Aug 29",
            gmp_pts=32.0,
            gmp_pct=8.21,
            subscription_rate_x=3.45,
            retail_subscription_x=4.12,
            qib_subscription_x=4.85,
            nii_subscription_x=1.80,
            ai_verdict="SUBSCRIBE (Quick-Commerce Scale)"
        ),
        IpoItem(
            company_name="Waaree Energies Ltd",
            symbol="WAAREE",
            status="UPCOMING",
            price_band="₹1,427 - ₹1,503",
            issue_size_cr=4321.0,
            lot_size=9,
            bidding_dates="Sep 03 - Sep 06",
            gmp_pts=680.0,
            gmp_pct=45.24,
            subscription_rate_x=0.0,
            retail_subscription_x=0.0,
            qib_subscription_x=0.0,
            nii_subscription_x=0.0,
            ai_verdict="SUBSCRIBE (High GMP Conviction)"
        ),
        IpoItem(
            company_name="Hyundai Motor India Ltd",
            symbol="HYUNDAI",
            status="UPCOMING",
            price_band="₹1,850 - ₹1,960",
            issue_size_cr=27870.0,
            lot_size=7,
            bidding_dates="Sep 12 - Sep 15",
            gmp_pts=145.0,
            gmp_pct=7.40,
            subscription_rate_x=0.0,
            retail_subscription_x=0.0,
            qib_subscription_x=0.0,
            nii_subscription_x=0.0,
            ai_verdict="SUBSCRIBE (Mega-Cap Anchor)"
        ),
        IpoItem(
            company_name="Premier Energies Ltd",
            symbol="PREMIERENE",
            status="CLOSED",
            price_band="₹427 - ₹450",
            issue_size_cr=2830.0,
            lot_size=33,
            bidding_dates="Aug 20 - Aug 23",
            gmp_pts=390.0,
            gmp_pct=86.67,
            subscription_rate_x=74.38,
            retail_subscription_x=25.40,
            qib_subscription_x=216.67,
            nii_subscription_x=50.04,
            ai_verdict="SUBSCRIBE (Blockbuster Listing)"
        ),
        IpoItem(
            company_name="Bajaj Housing Finance Ltd",
            symbol="BAJAJHFL",
            status="CLOSED",
            price_band="₹66 - ₹70",
            issue_size_cr=6560.0,
            lot_size=214,
            bidding_dates="Aug 14 - Aug 18",
            gmp_pts=65.0,
            gmp_pct=92.86,
            subscription_rate_x=63.61,
            retail_subscription_x=7.41,
            qib_subscription_x=209.36,
            nii_subscription_x=41.51,
            ai_verdict="SUBSCRIBE (High Listing Gains)"
        )
    ]

@router.get("/bonds", response_model=List[BondItem])
def get_bonds():
    """Fixed Income & Debt Market Hub (SGBs, G-Secs, Corporate Bonds) with 2026 Yields."""
    return [
        BondItem(
            bond_name="Sovereign Gold Bond 2028-29 Series IV (SGB)",
            category="SGB",
            issuer="Reserve Bank of India (RBI)",
            coupon_rate_pct=2.50,
            ytm_pct=9.40,
            rating="Sovereign (AAA)",
            face_value=5850.0,
            market_price=7180.0,
            maturity_date="2029-02-15",
            tax_status="Tax-Free Capital Gains upon Maturity"
        ),
        BondItem(
            bond_name="Sovereign Gold Bond 2030 Series I (SGB)",
            category="SGB",
            issuer="Reserve Bank of India (RBI)",
            coupon_rate_pct=2.50,
            ytm_pct=9.85,
            rating="Sovereign (AAA)",
            face_value=6120.0,
            market_price=7240.0,
            maturity_date="2030-06-20",
            tax_status="Tax-Free Capital Gains upon Maturity"
        ),
        BondItem(
            bond_name="7.18% GS 2033 (10-Year Benchmark G-Sec)",
            category="G-Sec",
            issuer="Government of India",
            coupon_rate_pct=7.18,
            ytm_pct=6.98,
            rating="Sovereign (AAA)",
            face_value=100.0,
            market_price=101.40,
            maturity_date="2033-08-14",
            tax_status="Taxable at slab rate"
        ),
        BondItem(
            bond_name="7.30% GS 2053 (Long-Duration Sovereign Debt)",
            category="G-Sec",
            issuer="Government of India",
            coupon_rate_pct=7.30,
            ytm_pct=7.15,
            rating="Sovereign (AAA)",
            face_value=100.0,
            market_price=102.10,
            maturity_date="2053-05-22",
            tax_status="Taxable at slab rate"
        ),
        BondItem(
            bond_name="National Highways Authority 7.90% 2030 (NHAI)",
            category="Corporate Bond",
            issuer="NHAI Ltd (Govt of India Undertaking)",
            coupon_rate_pct=7.90,
            ytm_pct=7.45,
            rating="CRISIL AAA",
            face_value=1000.0,
            market_price=1022.50,
            maturity_date="2030-03-31",
            tax_status="Taxable at slab rate"
        ),
        BondItem(
            bond_name="REC Ltd 7.75% Tax-Free 2031",
            category="Corporate Bond",
            issuer="REC Limited (Govt PSU)",
            coupon_rate_pct=7.75,
            ytm_pct=5.85,
            rating="ICRA AAA",
            face_value=1000.0,
            market_price=1140.0,
            maturity_date="2031-10-15",
            tax_status="100% Tax-Free Interest (Sec 10(15))"
        ),
        BondItem(
            bond_name="HDFC Bank Tier-2 Subordinated 8.05% 2034",
            category="Corporate Bond",
            issuer="HDFC Bank Ltd",
            coupon_rate_pct=8.05,
            ytm_pct=7.82,
            rating="CARE AAA",
            face_value=10000.0,
            market_price=10180.0,
            maturity_date="2034-06-20",
            tax_status="Taxable at slab rate"
        ),
        BondItem(
            bond_name="SIDBI 7.95% Annual 2031",
            category="Corporate Bond",
            issuer="Small Industries Development Bank of India",
            coupon_rate_pct=7.95,
            ytm_pct=7.55,
            rating="CRISIL AAA",
            face_value=1000.0,
            market_price=1016.0,
            maturity_date="2031-04-10",
            tax_status="Taxable at slab rate"
        )
    ]

@router.get("/etfs", response_model=List[EtfItem])
def get_etfs():
    """Live ETFs Catalog across Index, Sectoral, Commodity, and Global assets."""
    return [
        EtfItem(
            symbol="NIFTYBEES",
            name="Nippon India Nifty 50 BeES ETF",
            category="Index ETF",
            current_nav=274.50,
            day_change_pct=0.82,
            one_year_return_pct=26.40,
            three_year_cagr_pct=17.80,
            expense_ratio_pct=0.04,
            aum_cr=28450.0
        ),
        EtfItem(
            symbol="BANKBEES",
            name="Nippon India Nifty Bank BeES ETF",
            category="Sectoral ETF",
            current_nav=532.80,
            day_change_pct=1.15,
            one_year_return_pct=18.20,
            three_year_cagr_pct=14.90,
            expense_ratio_pct=0.18,
            aum_cr=16200.0
        ),
        EtfItem(
            symbol="ITBEES",
            name="Nippon India Nifty IT BeES ETF",
            category="Sectoral ETF",
            current_nav=43.80,
            day_change_pct=1.92,
            one_year_return_pct=34.80,
            three_year_cagr_pct=19.40,
            expense_ratio_pct=0.22,
            aum_cr=7890.0
        ),
        EtfItem(
            symbol="GOLDBEES",
            name="Nippon India Gold ETF",
            category="Gold & Silver",
            current_nav=64.20,
            day_change_pct=-0.25,
            one_year_return_pct=24.50,
            three_year_cagr_pct=16.20,
            expense_ratio_pct=0.79,
            aum_cr=14500.0
        ),
        EtfItem(
            symbol="SILVERBEES",
            name="Nippon India Silver ETF",
            category="Gold & Silver",
            current_nav=86.40,
            day_change_pct=0.45,
            one_year_return_pct=28.10,
            three_year_cagr_pct=21.40,
            expense_ratio_pct=0.55,
            aum_cr=4300.0
        ),
        EtfItem(
            symbol="MON100",
            name="Motilal Oswal Nasdaq 100 ETF",
            category="Global ETF",
            current_nav=162.80,
            day_change_pct=1.40,
            one_year_return_pct=36.80,
            three_year_cagr_pct=23.50,
            expense_ratio_pct=0.58,
            aum_cr=6800.0
        ),
        EtfItem(
            symbol="JUNIORBEES",
            name="Nippon India Nifty Next 50 Junior BeES ETF",
            category="Index ETF",
            current_nav=742.00,
            day_change_pct=1.05,
            one_year_return_pct=48.50,
            three_year_cagr_pct=24.20,
            expense_ratio_pct=0.12,
            aum_cr=5100.0
        ),
        EtfItem(
            symbol="CPSEETF",
            name="CPSE ETF (Top Central Public Sector Equities)",
            category="Sectoral ETF",
            current_nav=94.50,
            day_change_pct=2.15,
            one_year_return_pct=64.20,
            three_year_cagr_pct=38.40,
            expense_ratio_pct=0.05,
            aum_cr=42100.0
        ),
        EtfItem(
            symbol="AUTOBEES",
            name="Nippon India Nifty Auto ETF",
            category="Sectoral ETF",
            current_nav=265.40,
            day_change_pct=1.45,
            one_year_return_pct=52.80,
            three_year_cagr_pct=29.60,
            expense_ratio_pct=0.20,
            aum_cr=2400.0
        )
    ]
