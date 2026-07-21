"""
Tsunami Risk Zone API - provides static tsunami risk assessment per region.
These are NOT yearly readings like other hazards; tsunamis are rare events
with no yearly satellite trend. Instead, this returns a single composite
risk score per region based on elevation (LECZ), slope, and proximity to the
1945 Makran Subduction Zone earthquake epicenter.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.tsunami_risk_zone import TsunamiRiskZone
from schemas.tsunami import TsunamiRiskZoneOut

router = APIRouter(prefix="/api/tsunami-zones", tags=["tsunami"])


@router.get("", response_model=list[TsunamiRiskZoneOut])
def list_tsunami_zones(db: Session = Depends(get_db)):
    """List all tsunami risk zone assessments (one per region)."""
    zones = db.query(TsunamiRiskZone).all()
    return zones


@router.get("/{region_id}", response_model=TsunamiRiskZoneOut)
def get_tsunami_zone(region_id: int, db: Session = Depends(get_db)):
    """Get tsunami risk zone assessment for a specific region."""
    zone = db.query(TsunamiRiskZone).filter(TsunamiRiskZone.region_id == region_id).first()
    if zone is None:
        raise HTTPException(status_code=404, detail="Tsunami risk zone not found for this region")
    return zone