from geoalchemy2.shape import from_shape
from shapely.geometry import box

from models.region import Region
from models.hazard_reading import HazardIndexReading, HazardType, DataQuality


def _make_region(db_session) -> Region:
    geom = from_shape(box(62.0, 24.5, 63.0, 25.5), srid=4326)  # rough Gwadar-area bbox
    region = Region(name="Gwadar", district="Gwadar", province="Balochistan", geometry=geom)
    db_session.add(region)
    db_session.commit()
    db_session.refresh(region)
    return region


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_flooding_endpoint_empty(client):
    response = client.get("/api/hazards/flooding")
    assert response.status_code == 200
    assert response.json() == []


def test_flooding_endpoint_returns_seeded_reading(client, db_session):
    region = _make_region(db_session)
    reading = HazardIndexReading(
        region_id=region.id,
        hazard_type=HazardType.FLOODING,
        year=2022,
        value=0.42,
        unit="index_0_1",
        data_quality=DataQuality.GOOD,
    )
    db_session.add(reading)
    db_session.commit()

    response = client.get("/api/hazards/flooding", params={"district": "Gwadar"})
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["year"] == 2022
    assert body[0]["value"] == 0.42


def test_flooding_endpoint_rejects_unknown_district(client):
    response = client.get("/api/hazards/flooding", params={"district": "Karachi"})
    assert response.status_code == 400
