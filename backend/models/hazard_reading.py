import enum
from datetime import datetime, timezone

from sqlalchemy import ForeignKey, Float, Integer, DateTime, Enum, String, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class HazardType(str, enum.Enum):
    TSUNAMI_RISK = "tsunami_risk"
    FLOODING = "flooding"
    STORM_SURGE = "storm_surge"
    EROSION = "erosion"
    SEA_LEVEL_RISE = "sea_level_rise"
    VULNERABILITY_INDEX = "vulnerability_index"
    SAFE_ZONES = "safe_zones"


class DataQuality(str, enum.Enum):
    GOOD = "good"          # full cloud-free coverage for the year
    PARTIAL = "partial"    # some cloud/monsoon gaps, usable with caveat
    POOR = "poor"          # heavy gaps, flagged in UI + insight text


class HazardIndexReading(Base):
    """One row per computed hazard value for a region/year (yearly cadence, 2016-2025)."""

    __tablename__ = "hazard_index_readings"

    id: Mapped[int] = mapped_column(primary_key=True)
    region_id: Mapped[int] = mapped_column(ForeignKey("regions.id", ondelete="CASCADE"), nullable=False)

    hazard_type: Mapped[HazardType] = mapped_column(Enum(HazardType), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)

    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "m", "index_0_1", "m/yr"

    source_scene_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    data_quality: Mapped[DataQuality] = mapped_column(Enum(DataQuality), default=DataQuality.GOOD, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    region = relationship("Region", back_populates="hazard_readings")

    def __repr__(self) -> str:
        return f"<HazardIndexReading {self.hazard_type} region={self.region_id} year={self.year} value={self.value}>"
