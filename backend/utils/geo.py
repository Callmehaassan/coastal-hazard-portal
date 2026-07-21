"""
Helpers for converting between PostGIS geometry columns and GeoJSON
for API responses (frontend Map.tsx renders GeoJSON via Leaflet/Mapbox GL).
"""
import json
import math

from geoalchemy2.shape import to_shape
from shapely.geometry import mapping


def geometry_to_geojson(geom) -> dict | None:
    """Convert a GeoAlchemy2 WKBElement column value into a GeoJSON dict."""
    if geom is None:
        return None
    shape = to_shape(geom)
    return mapping(shape)


def geojson_to_wkt(geojson: dict) -> str:
    """Convert an incoming GeoJSON dict (e.g. from a seed script) into WKT for insertion."""
    from shapely.geometry import shape as shapely_shape

    return shapely_shape(geojson).wkt


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Haversine formula for great-circle distance between two points
    on the Earth (specified in decimal degrees). Returns distance in km.
    """
    R = 6371.0  # Earth mean radius in km

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c
