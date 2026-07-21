from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.auth import require_role
from database import get_db
from models.alert import Alert
from models.user import User, UserRole
from schemas.alert import AlertOut, AlertCreate
from services.alert_service import get_active_alerts

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertOut])
def list_active_alerts(db: Session = Depends(get_db)):
    """Currently active threshold-based alerts - public, matches FR-5 'All users' visibility of banners."""
    return get_active_alerts(db)


@router.post("", response_model=AlertOut, status_code=201)
def create_alert(
    payload: AlertCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(UserRole.ANALYST, UserRole.ADMIN)),
):
    alert = Alert(**payload.model_dump())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
