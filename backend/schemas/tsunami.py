from datetime import date

from pydantic import BaseModel, ConfigDict


class TsunamiRiskZoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    region_id: int
    risk_score: float
    low_elevation_fraction: float
    mean_elevation_m: float
    distance_to_1945_epicenter_km: float
    methodology_note: str
    computed_at: date


class TsunamiRiskZoneCreate(BaseModel):
    region_id: int
    risk_score: float
    low_elevation_fraction: float
    mean_elevation_m: float
    distance_to_1945_epicenter_km: float
    methodology_note: str
    computed_at: date