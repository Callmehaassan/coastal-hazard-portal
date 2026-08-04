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


HOTSPOT_OFFSETS = {
    # flooding
    "Jiwani Estuary": {"flooding": 1.1},
    "Akra Kaur Reservoir Basin": {"flooding": 1.3},
    "Shadi Kaur Basin (Pasni)": {"flooding": 1.4},
    "Basol River Valley (Ormara)": {"flooding": 1.2},
    "Hingol River Delta": {"flooding": 1.4},
    "Windar River Basin": {"flooding": 1.3},
    "Siranda Lake Basin": {"flooding": 1.2},
    "Porali River Plain (Uthal)": {"flooding": 1.5},
    # storm surge
    "Jiwani Fishery Harbor": {"storm_surge": 1.2},
    "Gwadar East Bay Harbor": {"storm_surge": 1.3},
    "Pasni Jetty & Port": {"storm_surge": 1.4},
    "Ormara East Bay Jetty": {"storm_surge": 1.1},
    "Sonmiani Port Harbor": {"storm_surge": 1.3},
    "Damb Fishing Jetty": {"storm_surge": 1.2},
    "Gadani Shipyard Breakwater": {"storm_surge": 1.4},
    "Kund Malir Bay Area": {"storm_surge": 1.1},
    # coastal erosion
    "Jiwani Sand Beach": {"erosion": 1.3},
    "Gwadar West Bay Spit (Paddi Zirr)": {"erosion": 1.4},
    "Gwadar Tombolo Neck Spit": {"erosion": 1.5},
    "Ormara Sandy Spit": {"erosion": 1.2},
    "Gadani Beach Resort Coast": {"erosion": 1.5},
    "Sonmiani Barrier Sand Spit": {"erosion": 1.4},
    "Kund Malir Active Beach": {"erosion": 1.3},
    "Miani Hor Mangrove Spit": {"erosion": 0.8},
    # tsunami risk
    "Jiwani Low-lying Coast": {"tsunami_risk": 1.2},
    "Gwadar Tombolo Lowland": {"tsunami_risk": 1.4},
    "Pasni Town (1945 Epicenter proximity)": {"tsunami_risk": 1.6},
    "Ormara City Lowland": {"tsunami_risk": 1.2},
    "Sonmiani Lagoon Flats": {"tsunami_risk": 1.2},
    "Gadani Coastal Settlements": {"tsunami_risk": 1.1},
    "Kund Malir Coastline": {"tsunami_risk": 1.0},
    "Sujawal Tidal Flats": {"tsunami_risk": 1.3},
    # sea level rise
    "Jiwani Tide Station": {"sea_level_rise": 1.0},
    "Gwadar Deep Sea Sensor": {"sea_level_rise": 1.0},
    "Pasni Offshore Gauge": {"sea_level_rise": 1.0},
    "Ormara Marine Gauge": {"sea_level_rise": 1.0},
    "Gadani Deep Offshore": {"sea_level_rise": 1.0},
    "Sonmiani Harbor Sensor": {"sea_level_rise": 1.0},
    "Kund Malir Deepsea Node": {"sea_level_rise": 1.0},
    "Hingol River Mouth Sensor": {"sea_level_rise": 1.0},
    # vulnerability index
    "Jiwani Coastal Zone": {"vulnerability_index": 1.1},
    "Gwadar City Area": {"vulnerability_index": 0.9},
    "Pasni Settlement": {"vulnerability_index": 1.2},
    "Ormara Town Area": {"vulnerability_index": 1.1},
    "Gadani Town Coast": {"vulnerability_index": 1.3},
    "Sonmiani Lagoon Flats": {"vulnerability_index": 1.2},
    "Kund Malir Coast": {"vulnerability_index": 1.0},
    "Uthal Town Area": {"vulnerability_index": 1.1},
    # safe zones
    "Jiwani Plateau Shelter": {"safe_zones": 1.3},
    "Koh-e-Batil High Ground (Gwadar)": {"safe_zones": 1.5},
    "Pasni Inland Hills": {"safe_zones": 1.2},
    "Ormara Hammerhead Plateau": {"safe_zones": 1.4},
    "Uthal Evacuation Center": {"safe_zones": 1.5},
    "Gadani Hinterland Hills": {"safe_zones": 1.2},
    "Hingol National Park High Ground": {"safe_zones": 1.3},
    "Windar Town Evacuation Point": {"safe_zones": 1.4}
}


def export_readings_csv(db: Session, region_id: int | None, hazard_type: str | None, hotspot: str | None, year_start: int, year_end: int) -> io.StringIO:
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
        val = reading.value
        name_to_use = region_name
        if hotspot:
            name_to_use = f"{hotspot} ({region_name})"
            multiplier = HOTSPOT_OFFSETS.get(hotspot, {}).get(reading.hazard_type.value, 1.0)
            val = val * multiplier
            
        writer.writerow(
            [
                name_to_use,
                reading.hazard_type.value,
                reading.year,
                val,
                reading.unit,
                reading.data_quality.value,
                reading.source_scene_date or "",
            ]
        )
    buffer.seek(0)
    return buffer


def export_readings_pdf(db: Session, region_id: int | None, hazard_type: str | None, hotspot: str | None, year_start: int, year_end: int) -> io.BytesIO:
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
        val = reading.value
        name_to_use = region_name
        if hotspot:
            name_to_use = f"{hotspot} ({region_name})"
            multiplier = HOTSPOT_OFFSETS.get(hotspot, {}).get(reading.hazard_type.value, 1.0)
            val = val * multiplier
            
        data.append(
            [name_to_use, reading.hazard_type.value, reading.year, val, reading.unit, reading.data_quality.value]
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
