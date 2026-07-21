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
    region_id: int
    year_start: int = MIN_YEAR
    year_end: int = MAX_YEAR
    format: str = "csv"  # "csv" | "pdf" | "geotiff"


@router.post("/export")
def export_report(payload: ExportRequest, db: Session = Depends(get_db)):
    year_start, year_end = validate_year_range(payload.year_start, payload.year_end)

    if payload.format == "pdf":
        buffer = export_readings_pdf(db, payload.region_id, year_start, year_end)
        media_type = "application/pdf"
        filename = f"region_{payload.region_id}_{year_start}_{year_end}.pdf"
    elif payload.format == "geotiff":
        # Mock GeoTIFF for now
        buffer = BytesIO(bytes([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00]))
        media_type = "image/tiff"
        filename = f"region_{payload.region_id}_{year_start}_{year_end}.tif"
    else:
        buffer = export_readings_csv(db, payload.region_id, year_start, year_end)
        media_type = "text/csv"
        filename = f"region_{payload.region_id}_{year_start}_{year_end}.csv"

    return StreamingResponse(
        buffer,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
