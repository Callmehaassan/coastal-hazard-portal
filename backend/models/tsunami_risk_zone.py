from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class TsunamiRiskZone(Base):
    """
    One row per region: a STATIC relative risk score, not a year-by-year
    reading like HazardIndexReading. Tsunamis are rare, sudden events with
    no yearly satellite trend to measure, so this table intentionally has
    a different shape - a single current assessment per region, recomputed
    only when the underlying elevation data or methodology changes (hence
    computed_at rather than a `year` column).

    This is a simplified RELATIVE risk-screening index (elevation exposure
    + proximity to the one instrumentally recorded Makran Subduction Zone
    tsunamigenic earthquake, Nov 1945 Mw 8.1), NOT a physics-based tsunami
    inundation model. Real inundation modeling (wave propagation, runup)
    needs bathymetry + fault rupture simulation software (e.g. MOST,
    ComMIT) that's out of scope here - see services/gee_service.py's
    compute_tsunami_risk() docstring for the full methodology and its
    limitations.
    """

    __tablename__ = "tsunami_risk_zones"

    id: Mapped[int] = mapped_column(primary_key=True)
    region_id: Mapped[int] = mapped_column(ForeignKey("regions.id"), nullable=False, unique=True)

    risk_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0-1, composite, higher = more exposed
    low_elevation_fraction: Mapped[float] = mapped_column(Float, nullable=False)  # fraction of area below 10m (LECZ)
    mean_elevation_m: Mapped[float] = mapped_column(Float, nullable=False)
    distance_to_1945_epicenter_km: Mapped[float] = mapped_column(Float, nullable=False)

    methodology_note: Mapped[str] = mapped_column(String(500), nullable=False)
    computed_at: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    region = relationship("Region")

    def __repr__(self) -> str:
        return f"<TsunamiRiskZone region_id={self.region_id} score={self.risk_score}>"