from pydantic import BaseModel, ConfigDict


class RegionBase(BaseModel):
    name: str
    district: str
    province: str = "Balochistan"


class RegionOut(RegionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    # GeoJSON representation of the boundary, built in the API layer via utils/geo.py
    geometry: dict | None = None
