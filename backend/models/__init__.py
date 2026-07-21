"""
Import every model here so that a single `import models` (as done in main.py
before create_all / Alembic autogenerate) registers all tables on Base.metadata.
"""
from models.region import Region
from models.hazard_reading import HazardIndexReading, HazardType, DataQuality
from models.alert import Alert, Comparator
from models.user import User, UserRole
from models.tsunami_risk_zone import TsunamiRiskZone

__all__ = [
    "Region",
    "HazardIndexReading",
    "HazardType",
    "DataQuality",
    "Alert",
    "Comparator",
    "User",
    "UserRole",
    "TsunamiRiskZone",
]