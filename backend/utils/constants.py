"""
Single source of truth for AOI scope, valid years, and data-source labels.
Update here (not scattered across files) if AOI or year range changes.
"""

# --- AOI: Balochistan only (v2.0 scope - Sindh dropped) ---
BALOCHISTAN_DISTRICTS = [
    "Lasbela",   # incl. Sonmiani
    "Gwadar",    # incl. Pasni, Ormara, Jiwani
]

# --- Yearly analysis cadence ---
MIN_YEAR = 2016
MAX_YEAR = 2025

# --- Hazard types (mirrors models.hazard_reading.HazardType) ---
HAZARD_TYPES = ["flooding", "storm_surge", "erosion", "sea_level_rise", "tsunami_risk"]

# --- Data sources per hazard module (per user's revised source list) ---
DATA_SOURCES = {
    "flooding": {
        "primary": "COPERNICUS/S1_GRD (Sentinel-1C/D SAR, VV+VH, thresholding/change detection)",
        "backup": "COPERNICUS/S2_SR_HARMONIZED (Sentinel-2 NDWI + MNDWI, cloud-free only)",
    },
    "erosion": {
        "primary": "COPERNICUS/S2_SR_HARMONIZED (Sentinel-2, 2015-2026, NDWI shoreline extraction)",
        "method": "DSAS-style shoreline change analysis",
    },
    "land_cover_vulnerability": {
        "primary": "GOOGLE/DYNAMICWORLD/V1",
        "secondary": "ESA/WorldCover/v200",
    },
    "rainfall_extreme_events": {
        "primary": "UCSB-CHG/CHIRPS/DAILY",
        "secondary": "ECMWF/ERA5/DAILY",
    },
    "elevation_sea_level": {
        "primary": "USGS/SRTMGL1_003",
        "secondary": "COPERNICUS/DEM/GLO30",
    },
    "tsunami_risk": {
        "primary": "USGS/SRTMGL1_003 (SRTM DEM)",
        "method": "Elevation (LECZ <10m) + slope analysis + distance to 1945 Makran epicenter",
    },
}

# --- Alert comparator defaults (see models.alert.Comparator) ---
DEFAULT_ALERT_COMPARATOR = "gt"
