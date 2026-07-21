"""
Rule-based alert evaluation: checks a new hazard reading against any
configured, active alert for the same region + hazard_type, and updates
last_triggered_at when the threshold is crossed.
"""
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from models.alert import Alert, Comparator
from models.hazard_reading import HazardIndexReading

_COMPARATORS = {
    Comparator.GREATER_THAN: lambda value, threshold: value > threshold,
    Comparator.GREATER_OR_EQUAL: lambda value, threshold: value >= threshold,
    Comparator.LESS_THAN: lambda value, threshold: value < threshold,
    Comparator.LESS_OR_EQUAL: lambda value, threshold: value <= threshold,
}


def evaluate_alerts_for_reading(db: Session, reading: HazardIndexReading) -> list[Alert]:
    """Check active alerts matching this reading's region + hazard type; trigger any that cross threshold."""
    matching_alerts = (
        db.query(Alert)
        .filter(
            Alert.region_id == reading.region_id,
            Alert.hazard_type == reading.hazard_type,
            Alert.is_active.is_(True),
        )
        .all()
    )

    triggered = []
    for alert in matching_alerts:
        compare_fn = _COMPARATORS[alert.comparator]
        if compare_fn(reading.value, alert.threshold_value):
            alert.last_triggered_at = datetime.now(timezone.utc)
            triggered.append(alert)

    if triggered:
        db.commit()
    return triggered


def get_active_alerts(db: Session) -> list[Alert]:
    return db.query(Alert).filter(Alert.is_active.is_(True)).all()
