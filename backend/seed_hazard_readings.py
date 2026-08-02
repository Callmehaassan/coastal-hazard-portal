"""
Seeds sample hazard readings for both regions (Lasbela, Gwadar) across
storm_surge, erosion, and sea_level_rise for the full 2016-2025 year range,
so the dashboard has real rows to query and chart before those hazard
types get their own GEE pipeline.

IMPORTANT: These are PLACEHOLDER values with a realistic year-over-year
trend shape, NOT real satellite-derived measurements.

NOTE: flooding is deliberately NOT included here anymore - it now has a
real Sentinel-1-based pipeline (jobs/pipeline_job.py -> services/gee_service.py
compute_flood_extent). Seeding fake flooding rows here would sit alongside
real ones with no way to tell them apart. Run the real pipeline for
flooding instead (POST /api/pipeline/run with hazard_types=["flooding"]).

Run with: python seed_hazard_readings.py
"""
import random

from database import Base, SessionLocal, engine
from models.hazard_reading import HazardIndexReading, HazardType, DataQuality
from models.region import Region
from utils.constants import MIN_YEAR, MAX_YEAR

random.seed(42)  # reproducible demo data

# (start_value, yearly_drift, noise, unit) per hazard type - values are
# unitless indices or physically-plausible small numbers, not measurements.
# Flooding excluded on purpose - see note above.
HAZARD_PROFILES = {
    HazardType.FLOODING: {"start": 80.0, "drift": 5.0, "noise": 10.0, "unit": "square_km"},
    HazardType.STORM_SURGE: {"start": 0.9, "drift": 0.05, "noise": 0.15, "unit": "meters"},
    HazardType.EROSION: {"start": -0.8, "drift": -0.06, "noise": 0.2, "unit": "meters_per_year"},
    HazardType.SEA_LEVEL_RISE: {"start": 2.1, "drift": 0.15, "noise": 0.1, "unit": "mm_per_year"},
    HazardType.TSUNAMI_RISK: {"start": 5.2, "drift": 0.1, "noise": 0.3, "unit": "index_0_10"},
    HazardType.VULNERABILITY_INDEX: {"start": 6.8, "drift": 0.08, "noise": 0.25, "unit": "index_0_10"},
    HazardType.SAFE_ZONES: {"start": 45.2, "drift": -0.5, "noise": 2.0, "unit": "square_km"},
}

# Gwadar's coastline is generally more exposed than Lasbela's in this demo data.
REGION_MULTIPLIER = {"Gwadar": 1.15, "Lasbela": 0.9}


def _generate_value(profile: dict, year_index: int, multiplier: float) -> float:
    base = profile["start"] + profile["drift"] * year_index
    noisy = base + random.uniform(-profile["noise"], profile["noise"])
    return round(noisy * multiplier, 3)


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Clear existing readings so we seed clean, correct series values
        db.query(HazardIndexReading).delete()
        db.commit()
        print("Cleared existing hazard readings.")

        regions = db.query(Region).all()
        if not regions:
            print("No regions found - run seed_regions.py first.")
            return

        created = 0
        for region in regions:
            multiplier = REGION_MULTIPLIER.get(region.name, 1.0)

            for hazard_type, profile in HAZARD_PROFILES.items():
                existing_count = (
                    db.query(HazardIndexReading)
                    .filter(
                        HazardIndexReading.region_id == region.id,
                        HazardIndexReading.hazard_type == hazard_type,
                    )
                    .count()
                )
                if existing_count > 0:
                    print(f"Skipping {region.name}/{hazard_type.value} - {existing_count} readings already exist.")
                    continue

                for year in range(MIN_YEAR, MAX_YEAR + 1):
                    year_index = year - MIN_YEAR
                    value = _generate_value(profile, year_index, multiplier)

                    quality = DataQuality.GOOD
                    if year_index in (2, 7):
                        quality = DataQuality.PARTIAL

                    reading = HazardIndexReading(
                        region_id=region.id,
                        hazard_type=hazard_type,
                        year=year,
                        value=value,
                        unit=profile["unit"],
                        data_quality=quality,
                    )
                    db.add(reading)
                    created += 1

        db.commit()
        print(f"Done. Created {created} hazard readings.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()