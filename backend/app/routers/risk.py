from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import UserProfile
from app.schemas import UserRiskProfileUpdate

router = APIRouter(prefix="/risk", tags=["Risk Guardrails"])

@router.get("/profile")
def get_user_risk_profile(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if not user:
        user = UserProfile(id=user_id, full_name="Retail Investor", risk_score=6, broker_connected="Zerodha Kite")
        db.add(user)
        db.commit()
        db.refresh(user)
    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "risk_score": user.risk_score,
        "broker_connected": user.broker_connected,
        "risk_category": "Conservative" if user.risk_score <= 4 else "Moderate" if user.risk_score <= 7 else "Aggressive"
    }

@router.put("/profile")
def update_user_risk_profile(profile_in: UserRiskProfileUpdate, user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if not user:
        user = UserProfile(id=user_id, full_name="Retail Investor", risk_score=profile_in.risk_score)
        db.add(user)
    else:
        user.risk_score = profile_in.risk_score
        if profile_in.broker_connected:
            user.broker_connected = profile_in.broker_connected
    db.commit()
    return {
        "message": "Risk Profile updated successfully",
        "risk_score": user.risk_score,
        "broker_connected": user.broker_connected
    }
