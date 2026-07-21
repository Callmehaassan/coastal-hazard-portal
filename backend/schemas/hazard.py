from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from models.hazard_reading import HazardType, DataQuality


class HazardReadingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    region_id: int
    hazard_type: HazardType
    year: int
    value: float
    unit: str
    source_scene_date: date | None = None
    data_quality: DataQuality


class HazardQueryParams(BaseModel):
    """Shared, whitelisted query params for every /api/hazards/* endpoint."""

    district: str | None = Field(default=None, description="Must match a known Balochistan district")
    year_start: int = Field(default=2016, ge=2016, le=2025)
    year_end: int = Field(default=2025, ge=2016, le=2025)


class HazardReadingCreate(BaseModel):
    """Used by the ingestion job (services/ingest_service.py), not exposed directly to end users."""

    region_id: int
    hazard_type: HazardType
    year: int
    value: float
    unit: str
    source_scene_date: date | None = None
    data_quality: DataQuality = DataQuality.GOOD
