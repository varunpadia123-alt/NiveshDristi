from fastapi import APIRouter
from typing import List
from app.schemas import MarketIndexItem
from app.engine.market_data import INDIAN_INDICES, GLOBAL_INDICES, get_live_index_quote

router = APIRouter(prefix="/indices", tags=["Indices"])

@router.get("/indian", response_model=List[MarketIndexItem])
def get_indian_indices():
    """Returns real-time status of all prominent Indian Market Indices (Nifty 50, Sensex, Sectorals, etc.)."""
    return [get_live_index_quote(idx) for idx in INDIAN_INDICES]

@router.get("/global", response_model=List[MarketIndexItem])
def get_global_indices():
    """Returns real-time status of major Global Market Indices (US, Europe, Asia-Pacific)."""
    return [get_live_index_quote(idx) for idx in GLOBAL_INDICES]
