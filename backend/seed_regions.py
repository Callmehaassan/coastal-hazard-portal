"""
Seeds the two in-scope regions (Lasbela, Gwadar) so the API/frontend have
something real to render before the GEE pipeline produces hazard readings.
Run with: python seed_regions.py
"""
from geoalchemy2.shape import from_shape
from shapely.geometry import box

from database import Base, SessionLocal, engine
from models.region import Region
from models.hazard_reading import HazardIndexReading  # noqa: F401 - needed so Region.hazard_readings relationship resolves
from models.alert import Alert  # noqa: F401 - needed so Region.alerts relationship resolves
from models.user import User  # noqa: F401

REGION_SEEDS = [
    {"name": "Lasbela", "district": "Lasbela", "province": "Balochistan", "bbox": (66.3, 24.9, 67.6, 25.9)},
    {"name": "Gwadar", "district": "Gwadar", "province": "Balochistan", "bbox": (61.6, 24.6, 64.8, 25.6)},
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for seed_data in REGION_SEEDS:
            existing = db.query(Region).filter(Region.district == seed_data["district"]).first()
            if existing:
                print(f"Skipping {seed_data['district']} - already seeded (id={existing.id}).")
                continue
            geom = from_shape(box(*seed_data["bbox"]), srid=4326)
            region = Region(name=seed_data["name"], district=seed_data["district"], province=seed_data["province"], geometry=geom)
            db.add(region)
            print(f"Seeding region: {seed_data['name']}")
        db.commit()
        print("Done.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()