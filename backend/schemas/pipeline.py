from datetime import datetime

from pydantic import BaseModel


class PipelineRunRequest(BaseModel):
    """Admin-triggered pipeline re-run. Empty hazard_types means "run all"."""

    hazard_types: list[str] | None = None
    year: int | None = None


class PipelineRunResponse(BaseModel):
    status: str  # "started" | "completed" | "failed"
    triggered_at: datetime
    detail: str
