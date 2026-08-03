"""
Builds downloadable report files for /api/reports/export.
CSV is fully implemented; PDF uses reportlab with a minimal layout that
can be styled further once the frontend export UI is built.
"""
import csv
import io

from sqlalchemy.orm import Session

from models.hazard_reading import HazardIndexReading
from models.region import Region


def export_readings_csv(db: Session, region_id: int | None, hazard_type: str | None, year_start: int, year_end: int) -> io.StringIO:
    query = db.query(HazardIndexReading, Region.name).join(Region, Region.id == HazardIndexReading.region_id)
    
    if region_id is not None and region_id > 0:
        query = query.filter(HazardIndexReading.region_id == region_id)
    if hazard_type:
        query = query.filter(HazardIndexReading.hazard_type == hazard_type)
        
    query = query.filter(
        HazardIndexReading.year >= year_start,
        HazardIndexReading.year <= year_end,
    )
    rows = query.order_by(Region.name, HazardIndexReading.hazard_type, HazardIndexReading.year).all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["region", "hazard_type", "year", "value", "unit", "data_quality", "source_scene_date"])
    for reading, region_name in rows:
        writer.writerow(
            [
                region_name,
                reading.hazard_type.value,
                reading.year,
                reading.value,
                reading.unit,
                reading.data_quality.value,
                reading.source_scene_date or "",
            ]
        )
    buffer.seek(0)
    return buffer


def export_readings_pdf(db: Session, region_id: int | None, hazard_type: str | None, year_start: int, year_end: int) -> io.BytesIO:
    """Minimal PDF export - table of readings. Styling deferred to the frontend-design pass."""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle

    query = db.query(HazardIndexReading, Region.name).join(Region, Region.id == HazardIndexReading.region_id)
    
    if region_id is not None and region_id > 0:
        query = query.filter(HazardIndexReading.region_id == region_id)
    if hazard_type:
        query = query.filter(HazardIndexReading.hazard_type == hazard_type)
        
    query = query.filter(
        HazardIndexReading.year >= year_start,
        HazardIndexReading.year <= year_end,
    )
    rows = query.order_by(Region.name, HazardIndexReading.hazard_type, HazardIndexReading.year).all()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    data = [["Region", "Hazard", "Year", "Value", "Unit", "Quality"]]
    for reading, region_name in rows:
        data.append(
            [region_name, reading.hazard_type.value, reading.year, reading.value, reading.unit, reading.data_quality.value]
        )

    table = Table(data)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f2a3d")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ]
        )
    )
    doc.build([table])
    buffer.seek(0)
    return buffer
