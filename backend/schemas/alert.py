from datetime import datetime

from pydantic import BaseModel, ConfigDict

from models.hazard_reading import HazardType
from models.alert import Comparator


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    region_id: int
    hazard_type: HazardType
    threshold_value: float
    comparator: Comparator
    is_active: bool
    last_triggered_at: datetime | None = None


class AlertCreate(BaseModel):
    region_id: int
    hazard_type: HazardType
    threshold_value: float
    comparator: Comparator = Comparator.GREATER_THAN
