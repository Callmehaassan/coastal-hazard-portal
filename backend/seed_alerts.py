from database import SessionLocal
from models.alert import Alert, Comparator
from models.hazard_reading import HazardIndexReading, HazardType
from models.region import Region
from datetime import datetime, timezone

def seed_alerts():
    db = SessionLocal()
    try:
        # Clear existing alerts
        db.query(Alert).delete()
        db.commit()
        print("Cleared existing alerts.")

        regions = {r.district.lower(): r.id for r in db.query(Region).all()}
        if not regions:
            print("No regions found - run seed_regions.py first.")
            return

        # Define alert configurations
        alert_configs = [
            {
                "district": "gwadar",
                "hazard_type": HazardType.STORM_SURGE,
                "threshold_value": 1.0,
                "comparator": Comparator.GREATER_THAN,
            },
            {
                "district": "lasbela",
                "hazard_type": HazardType.FLOODING,
                "threshold_value": 1500.0,
                "comparator": Comparator.GREATER_THAN,
            },
            {
                "district": "gwadar",
                "hazard_type": HazardType.EROSION,
                "threshold_value": -15.0,
                "comparator": Comparator.LESS_THAN,
            },
            {
                "district": "lasbela",
                "hazard_type": HazardType.STORM_SURGE,
                "threshold_value": 0.8,
                "comparator": Comparator.GREATER_THAN,
            },
            {
                "district": "gwadar",
                "hazard_type": HazardType.TSUNAMI_RISK,
                "threshold_value": 5.0,
                "comparator": Comparator.GREATER_THAN,
            }
        ]

        for config in alert_configs:
            region_id = regions.get(config["district"])
            if not region_id:
                continue

            alert = Alert(
                region_id=region_id,
                hazard_type=config["hazard_type"],
                threshold_value=config["threshold_value"],
                comparator=config["comparator"],
                is_active=True,
                last_triggered_at=None
            )
            db.add(alert)
            db.flush()

            # Find readings that trigger this alert
            readings = (
                db.query(HazardIndexReading)
                .filter(
                    HazardIndexReading.region_id == region_id,
                    HazardIndexReading.hazard_type == config["hazard_type"]
                )
                .all()
            )

            triggered_readings = []
            for r in readings:
                if config["comparator"] == Comparator.GREATER_THAN and r.value > config["threshold_value"]:
                    triggered_readings.append(r)
                elif config["comparator"] == Comparator.LESS_THAN and r.value < config["threshold_value"]:
                    triggered_readings.append(r)

            if triggered_readings:
                latest_reading = max(triggered_readings, key=lambda r: r.year)
                simulated_time = datetime(latest_reading.year, 5, 15, 9, 20, tzinfo=timezone.utc)
                alert.last_triggered_at = simulated_time

        db.commit()
        print("Successfully seeded alerts and evaluated thresholds against readings.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_alerts()
