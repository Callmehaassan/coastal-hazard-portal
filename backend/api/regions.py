from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.region import Region
from schemas.region import RegionOut
from utils.geo import geometry_to_geojson

router = APIRouter(prefix="/api/regions", tags=["regions"])


@router.get("", response_model=list[RegionOut])
def list_regions(db: Session = Depends(get_db)):
    regions = db.query(Region).all()
    return [
        RegionOut(
            id=r.id,
            name=r.name,
            district=r.district,
            province=r.province,
            geometry=geometry_to_geojson(r.geometry),
        )
        for r in regions
    ]


@router.get("/{region_id}", response_model=RegionOut)
def get_region(region_id: int, db: Session = Depends(get_db)):
    region = db.query(Region).filter(Region.id == region_id).first()
    if region is None:
        raise HTTPException(status_code=404, detail="Region not found")
    return RegionOut(
        id=region.id,
        name=region.name,
        district=region.district,
        province=region.province,
        geometry=geometry_to_geojson(region.geometry),
    )
