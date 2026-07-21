from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends

from api.auth import require_role
from models.user import User, UserRole
from schemas.pipeline import PipelineRunRequest, PipelineRunResponse

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])


@router.post("/run", response_model=PipelineRunResponse)
def run_pipeline(
    payload: PipelineRunRequest,
    background_tasks: BackgroundTasks,
    _admin: User = Depends(require_role(UserRole.ADMIN)),
):
    """
    Admin-triggered, on-demand pipeline re-run (SRS: manually-triggered job,
    not a persistent worker). Runs jobs.pipeline_job in the background so
    the request returns immediately; check status via logs/DB until a
    dedicated status endpoint is added.
    """
    from jobs.pipeline_job import run_pipeline_job

    background_tasks.add_task(run_pipeline_job, payload.hazard_types, payload.year)

    return PipelineRunResponse(
        status="started",
        triggered_at=datetime.now(timezone.utc),
        detail="Pipeline run started in the background.",
    )
