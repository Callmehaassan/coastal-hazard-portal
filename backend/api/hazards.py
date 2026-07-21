from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models.hazard_reading import HazardIndexReading, HazardType
from models.region import Region
from schemas.hazard import HazardReadingOut
from utils.constants import MIN_YEAR, MAX_YEAR
from utils.validators import validate_district, validate_year_range

router = APIRouter(prefix="/api/hazards", tags=["hazards"])


def _query_readings(
    db: Session,
    hazard_type: HazardType,
    district: str | None,
    year_start: int,
    year_end: int,
) -> list[HazardIndexReading]:
    district = validate_district(district)
    year_start, year_end = validate_year_range(year_start, year_end)

    query = (
        db.query(HazardIndexReading)
        .join(Region, Region.id == HazardIndexReading.region_id)
        .filter(
            HazardIndexReading.hazard_type == hazard_type,
            HazardIndexReading.year >= year_start,
            HazardIndexReading.year <= year_end,
        )
    )
    if district:
        query = query.filter(Region.district == district)
    return query.order_by(HazardIndexReading.year).all()


@router.get("/flooding", response_model=list[HazardReadingOut])
def get_flooding(
    district: str | None = Query(default=None),
    year_start: int = Query(default=MIN_YEAR, ge=MIN_YEAR, le=MAX_YEAR),
    year_end: int = Query(default=MAX_YEAR, ge=MIN_YEAR, le=MAX_YEAR),
    db: Session = Depends(get_db),
):
    """Coastal flooding index per region (SAR/NDWI-derived)."""
    return _query_readings(db, HazardType.FLOODING, district, year_start, year_end)


@router.get("/storm-surge", response_model=list[HazardReadingOut])
def get_storm_surge(
    district: str | None = Query(default=None),
    year_start: int = Query(default=MIN_YEAR, ge=MIN_YEAR, le=MAX_YEAR),
    year_end: int = Query(default=MAX_YEAR, ge=MIN_YEAR, le=MAX_YEAR),
    db: Session = Depends(get_db),
):
    """Storm surge estimates for tracked cyclone events."""
    return _query_readings(db, HazardType.STORM_SURGE, district, year_start, year_end)


@router.get("/erosion", response_model=list[HazardReadingOut])
def get_erosion(
    district: str | None = Query(default=None),
    year_start: int = Query(default=MIN_YEAR, ge=MIN_YEAR, le=MAX_YEAR),
    year_end: int = Query(default=MAX_YEAR, ge=MIN_YEAR, le=MAX_YEAR),
    db: Session = Depends(get_db),
):
    """Shoreline change statistics per coastal district (DSAS-style)."""
    return _query_readings(db, HazardType.EROSION, district, year_start, year_end)


@router.get("/sea-level", response_model=list[HazardReadingOut])
def get_sea_level(
    district: str | None = Query(default=None),
    year_start: int = Query(default=MIN_YEAR, ge=MIN_YEAR, le=MAX_YEAR),
    year_end: int = Query(default=MAX_YEAR, ge=MIN_YEAR, le=MAX_YEAR),
    db: Session = Depends(get_db),
):
    """Sea-level trend data per monitoring station (real satellite altimetry)."""
    return _query_readings(db, HazardType.SEA_LEVEL_RISE, district, year_start, year_end)


@router.get("/tsunami-risk", response_model=list[HazardReadingOut])
def get_tsunami_risk(
    district: str | None = Query(default=None),
    year_start: int = Query(default=MIN_YEAR, ge=MIN_YEAR, le=MAX_YEAR),
    year_end: int = Query(default=MAX_YEAR, ge=MIN_YEAR, le=MAX_YEAR),
    db: Session = Depends(get_db),
):
    """Tsunami risk index based on elevation (LECZ), slope, and proximity to 1945 Makran epicenter."""
    return _query_readings(db, HazardType.TSUNAMI_RISK, district, year_start, year_end)


@router.get("/vulnerability-index", response_model=list[HazardReadingOut])
def get_vulnerability_index(
    district: str | None = Query(default=None),
    year_start: int = Query(default=MIN_YEAR, ge=MIN_YEAR, le=MAX_YEAR),
    year_end: int = Query(default=MAX_YEAR, ge=MIN_YEAR, le=MAX_YEAR),
    db: Session = Depends(get_db),
):
    """Coastal vulnerability index combining exposure, sensitivity, and adaptive capacity."""
    return _query_readings(db, HazardType.VULNERABILITY_INDEX, district, year_start, year_end)


@router.get("/safe-zones", response_model=list[HazardReadingOut])
def get_safe_zones(
    district: str | None = Query(default=None),
    year_start: int = Query(default=MIN_YEAR, ge=MIN_YEAR, le=MAX_YEAR),
    year_end: int = Query(default=MAX_YEAR, ge=MIN_YEAR, le=MAX_YEAR),
    db: Session = Depends(get_db),
):
    """Safe zone assessment based on elevation, infrastructure, and evacuation routes."""
    return _query_readings(db, HazardType.SAFE_ZONES, district, year_start, year_end)
