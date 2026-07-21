import enum
from datetime import datetime, timezone

from sqlalchemy import ForeignKey, Float, DateTime, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base
from models.hazard_reading import HazardType


class Comparator(str, enum.Enum):
    GREATER_THAN = "gt"
    GREATER_OR_EQUAL = "gte"
    LESS_THAN = "lt"
    LESS_OR_EQUAL = "lte"


class Alert(Base):
    """Configured threshold per region/hazard type, and when it was last triggered."""

    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    region_id: Mapped[int] = mapped_column(ForeignKey("regions.id", ondelete="CASCADE"), nullable=False)

    hazard_type: Mapped[HazardType] = mapped_column(Enum(HazardType), nullable=False)
    threshold_value: Mapped[float] = mapped_column(Float, nullable=False)
    comparator: Mapped[Comparator] = mapped_column(Enum(Comparator), default=Comparator.GREATER_THAN, nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_triggered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    region = relationship("Region", back_populates="alerts")

    def __repr__(self) -> str:
        return f"<Alert {self.hazard_type} region={self.region_id} {self.comparator} {self.threshold_value}>"
