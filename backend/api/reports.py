from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from io import BytesIO

from database import get_db
from services.export_service import export_readings_csv, export_readings_pdf
from utils.constants import MIN_YEAR, MAX_YEAR
from utils.validators import validate_year_range

router = APIRouter(prefix="/api/reports", tags=["reports"])


class ExportRequest(BaseModel):
    region_id: int | None = None
    hazard_type: str | None = None
    hotspot: str | None = None
    year_start: int = MIN_YEAR
    year_end: int = MAX_YEAR
    format: str = "csv"  # "csv" | "pdf" | "geotiff"


@router.post("/export")
def export_report(payload: ExportRequest, db: Session = Depends(get_db)):
    year_start, year_end = validate_year_range(payload.year_start, payload.year_end)

    mapped_hazard = None
    if payload.hazard_type:
        mapping = {
            "flooding": "flooding",
            "storm-surge": "storm_surge",
            "storm_surge": "storm_surge",
            "coastal-erosion": "erosion",
            "erosion": "erosion",
            "tsunami-risk": "tsunami_risk",
            "tsunami_risk": "tsunami_risk",
            "sea-level-rise": "sea_level_rise",
            "sea_level_rise": "sea_level_rise",
            "sea-level": "sea_level_rise",
            "vulnerability-index": "vulnerability_index",
            "vulnerability_index": "vulnerability_index",
            "safe-zones": "safe_zones",
            "safe_zones": "safe_zones",
        }
        mapped_hazard = mapping.get(payload.hazard_type.lower())

    # Build safe filename segment
    hotspot_slug = f"_{payload.hotspot.lower().replace(' ', '_')}" if payload.hotspot else ""

    if payload.format == "pdf":
        buffer = export_readings_pdf(db, payload.region_id, mapped_hazard, payload.hotspot, year_start, year_end)
        media_type = "application/pdf"
        filename = f"report_{payload.region_id or 'all'}_{payload.hazard_type or 'all'}{hotspot_slug}_{year_start}_{year_end}.pdf"
    elif payload.format == "geotiff":
        from services.export_service import export_readings_geotiff
        buffer = export_readings_geotiff(db, payload.region_id, mapped_hazard, year_start, year_end)
        media_type = "image/tiff"
        filename = f"report_{payload.region_id or 'all'}_{payload.hazard_type or 'all'}{hotspot_slug}_{year_start}_{year_end}.tif"
    else:
        buffer = export_readings_csv(db, payload.region_id, mapped_hazard, payload.hotspot, year_start, year_end)
        media_type = "text/csv"
        filename = f"report_{payload.region_id or 'all'}_{payload.hazard_type or 'all'}{hotspot_slug}_{year_start}_{year_end}.csv"

    return StreamingResponse(
        buffer,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
