"""
Loads validated pipeline outputs (or, for now, seed data) into PostGIS.
This is the only place that writes to hazard_index_readings, so the
no-hardcoding rule (SRS 4.4) stays enforceable in one spot.
"""
from sqlalchemy.orm import Session

from models.hazard_reading import HazardIndexReading
from schemas.hazard import HazardReadingCreate
from services.alert_service import evaluate_alerts_for_reading


def ingest_hazard_reading(db: Session, reading: HazardReadingCreate) -> HazardIndexReading:
    """Insert one hazard_index_readings row and evaluate any alerts it might trigger."""
    db_reading = HazardIndexReading(**reading.model_dump())
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)

    evaluate_alerts_for_reading(db, db_reading)
    return db_reading


def ingest_hazard_readings_bulk(db: Session, readings: list[HazardReadingCreate]) -> list[HazardIndexReading]:
    """Bulk variant used by the pipeline job after a full run."""
    return [ingest_hazard_reading(db, r) for r in readings]
