from datetime import datetime, timezone

from geoalchemy2 import Geometry
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Region(Base):
    """One row per Balochistan coastal district (Lasbela, Gwadar) with PostGIS geometry."""

    __tablename__ = "regions"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)          # e.g. "Gwadar"
    district: Mapped[str] = mapped_column(String(100), nullable=False)      # admin district name
    province: Mapped[str] = mapped_column(String(100), default="Balochistan", nullable=False)

    # Polygon/MultiPolygon boundary in WGS84 (SRID 4326)
    geometry: Mapped[str] = mapped_column(Geometry(geometry_type="MULTIPOLYGON", srid=4326, spatial_index=False), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    hazard_readings = relationship("HazardIndexReading", back_populates="region", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="region", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Region {self.name} ({self.district})>"
