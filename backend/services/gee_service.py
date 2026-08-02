from datetime import date, datetime, timezone
import logging

import ee
from google.oauth2 import service_account

from config import get_settings
from utils.storm_events import STORM_SURGE_EVENTS

logger = logging.getLogger(__name__)

_initialized = False

MONSOON_WINDOW = {"start_month_day": "-07-01", "end_month_day": "-09-30"}

WATER_VH_THRESHOLD_DB = -18
NDWI_WATER_THRESHOLD = 0.0
CLOUD_PROB_THRESHOLD = 40

EROSION_BUFFER_METERS = 500
EROSION_BASELINE_YEAR = 2016

# Low Elevation Coastal Zone threshold (McGranahan et al., 2007) - a
# standard, widely-used cutoff in coastal hazard/exposure literature for
# "vulnerable to inundation," not something specific to this project.
LECZ_ELEVATION_THRESHOLD_M = 10

# The only instrumentally recorded Makran Subduction Zone tsunamigenic
# earthquake: Nov 1945, Mw 8.1, ~8km SE of Pasni (Quittmeyer and Jacob,
# 1979). Used as the reference point for the proximity component of the
# risk score - real historical events, not an arbitrary point.
EPICENTER_1945_LAT = 25.19
EPICENTER_1945_LON = 63.55

# Distance (km) beyond which proximity to the 1945 epicenter is treated as
# contributing ~0 additional risk. Chosen because the source papers show a
# sharp drop-off in tsunami impact with distance: Gwadar/Pasni/Ormara (all
# within ~150km of the epicenter) saw meter-scale runup, while Karachi
# (~460km away) saw only 28-44cm wave heights - this is a simplifying
# linear decay, not a physical attenuation model.
PROXIMITY_DECAY_KM = 500


def init_gee() -> None:
    global _initialized
    if _initialized:
        return

    settings = get_settings()
    if not settings.gee_service_account_email or not settings.gee_service_account_key_path:
        raise RuntimeError(
            "GEE_SERVICE_ACCOUNT_EMAIL / GEE_SERVICE_ACCOUNT_KEY_PATH not set in .env. "
            "Create a GEE service account, download its JSON key, and point .env at it."
        )

    credentials = service_account.Credentials.from_service_account_file(
        settings.gee_service_account_key_path,
        scopes=["https://www.googleapis.com/auth/earthengine"],
    )

    ee.Initialize(credentials, project=settings.gee_project_id)
    _initialized = True


def get_aoi_geometry(region_geojson: dict) -> "ee.Geometry":
    """Build an ee.Geometry from a region's stored GeoJSON boundary."""
    init_gee()
    return ee.Geometry(region_geojson)


def compute_flood_extent(aoi: "ee.Geometry", year: int) -> dict:
    init_gee()

    def _vh_collection(start: str, end: str) -> "ee.ImageCollection":
        return (
            ee.ImageCollection("COPERNICUS/S1_GRD")
            .filterBounds(aoi)
            .filterDate(start, end)
            .filter(ee.Filter.eq("instrumentMode", "IW"))
            .filter(
                ee.Filter.listContains(
                    "transmitterReceiverPolarisation",
                    "VH",
                )
            )
            .select("VH")
        )

    monsoon_start = f"{year}{MONSOON_WINDOW['start_month_day']}"
    monsoon_end = f"{year}{MONSOON_WINDOW['end_month_day']}"
    baseline_start = f"{year}-01-01"
    baseline_end = f"{year}-03-31"

    monsoon_collection = _vh_collection(monsoon_start, monsoon_end)
    baseline_collection = _vh_collection(baseline_start, baseline_end)

    monsoon_count = monsoon_collection.size().getInfo()
    baseline_count = baseline_collection.size().getInfo()

    if monsoon_count == 0 or baseline_count == 0:
        return {
            "value": None,
            "unit": "index_0_1",
            "data_quality": "poor",
            "source_scene_date": None,
        }

    monsoon_water = monsoon_collection.median().clip(aoi).lt(WATER_VH_THRESHOLD_DB)
    baseline_water = baseline_collection.median().clip(aoi).lt(WATER_VH_THRESHOLD_DB)
    flood_mask = monsoon_water.And(baseline_water.Not())

    # Calculate flooded area in square kilometers (km2)
    area_image = flood_mask.multiply(ee.Image.pixelArea()).divide(1_000_000)
    stats = area_image.reduceRegion(
        reducer=ee.Reducer.sum(),
        geometry=aoi,
        scale=30,
        maxPixels=1_000_000_000,
        bestEffort=True,
    )

    flood_area = stats.get("VH").getInfo()
    if flood_area is None:
        return {
            "value": None,
            "unit": "square_km",
            "data_quality": "poor",
            "source_scene_date": None,
        }

    scene_dates_ms = monsoon_collection.aggregate_array("system:time_start").getInfo()
    latest_scene_date = None
    if scene_dates_ms:
        latest_scene_date = datetime.fromtimestamp(
            max(scene_dates_ms) / 1000,
            tz=timezone.utc,
        ).date()

    quality = "good" if monsoon_count >= 3 and baseline_count >= 3 else "partial"

    return {
        "value": round(float(flood_area), 4),
        "unit": "square_km",
        "data_quality": quality,
        "source_scene_date": latest_scene_date,
    }


def compute_flood_extent_sentinel2_backup(aoi: "ee.Geometry", year: int) -> dict:
    init_gee()

    def _masked_ndwi_composite(start: str, end: str):
        s2 = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterBounds(aoi)
            .filterDate(start, end)
        )
        clouds = (
            ee.ImageCollection("COPERNICUS/S2_CLOUD_PROBABILITY")
            .filterBounds(aoi)
            .filterDate(start, end)
        )
        joined = ee.Join.saveFirst("cloud_mask").apply(
            primary=s2,
            secondary=clouds,
            condition=ee.Filter.equals(
                leftField="system:index",
                rightField="system:index",
            ),
        )

        def _mask_and_ndwi(img):
            img = ee.Image(img)
            cloud_prob = ee.Image(img.get("cloud_mask")).select("probability")
            clear = cloud_prob.lt(CLOUD_PROB_THRESHOLD)
            ndwi = img.normalizedDifference(["B3", "B8"]).rename("NDWI")
            return ndwi.updateMask(clear)

        collection = ee.ImageCollection(joined).map(_mask_and_ndwi)
        count = collection.size().getInfo()
        if count == 0:
            return None, 0
        return collection.median().clip(aoi), count

    monsoon_start = f"{year}{MONSOON_WINDOW['start_month_day']}"
    monsoon_end = f"{year}{MONSOON_WINDOW['end_month_day']}"
    baseline_start = f"{year}-01-01"
    baseline_end = f"{year}-03-31"

    monsoon_ndwi, monsoon_count = _masked_ndwi_composite(monsoon_start, monsoon_end)
    baseline_ndwi, baseline_count = _masked_ndwi_composite(baseline_start, baseline_end)

    if monsoon_ndwi is None or baseline_ndwi is None:
        return {
            "value": None,
            "unit": "index_0_1",
            "data_quality": "poor",
            "source_scene_date": None,
        }

    monsoon_water = monsoon_ndwi.gt(NDWI_WATER_THRESHOLD)
    baseline_water = baseline_ndwi.gt(NDWI_WATER_THRESHOLD)
    flood_mask = monsoon_water.And(baseline_water.Not())

    # Calculate flooded area in square kilometers (km2)
    area_image = flood_mask.multiply(ee.Image.pixelArea()).divide(1_000_000)
    stats = area_image.reduceRegion(
        reducer=ee.Reducer.sum(),
        geometry=aoi,
        scale=10,
        maxPixels=1_000_000_000,
        bestEffort=True,
    )
    flood_area = stats.get("NDWI").getInfo()
    if flood_area is None:
        return {
            "value": None,
            "unit": "square_km",
            "data_quality": "poor",
            "source_scene_date": None,
        }

    quality = "partial"

    return {
        "value": round(float(flood_area), 4),
        "unit": "square_km",
        "data_quality": quality,
        "source_scene_date": None,
    }


def compute_storm_surge_estimate(aoi: "ee.Geometry", year: int, district: str) -> dict:
    init_gee()

    event = STORM_SURGE_EVENTS.get(year)
    if event is None or district not in event["affected_districts"]:
        return {
            "value": 0.0,
            "unit": "square_km",
            "data_quality": "good",
            "source_scene_date": None,
        }

    def _vh_collection(start: str, end: str) -> "ee.ImageCollection":
        return (
            ee.ImageCollection("COPERNICUS/S1_GRD")
            .filterBounds(aoi)
            .filterDate(start, end)
            .filter(ee.Filter.eq("instrumentMode", "IW"))
            .filter(
                ee.Filter.listContains(
                    "transmitterReceiverPolarisation",
                    "VH",
                )
            )
            .select("VH")
        )

    before_collection = _vh_collection(event["before_start"], event["before_end"])
    after_collection = _vh_collection(event["after_start"], event["after_end"])

    before_count = before_collection.size().getInfo()
    after_count = after_collection.size().getInfo()
    if before_count == 0 or after_count == 0:
        return {
            "value": None,
            "unit": "square_km",
            "data_quality": "poor",
            "source_scene_date": None,
        }

    before_water = before_collection.median().clip(aoi).lt(WATER_VH_THRESHOLD_DB)
    after_water = after_collection.median().clip(aoi).lt(WATER_VH_THRESHOLD_DB)
    surge_mask = after_water.And(before_water.Not())

    # Calculate surge area in square kilometers (km2)
    area_image = surge_mask.multiply(ee.Image.pixelArea()).divide(1_000_000)
    stats = area_image.reduceRegion(
        reducer=ee.Reducer.sum(),
        geometry=aoi,
        scale=30,
        maxPixels=1_000_000_000,
        bestEffort=True,
    )
    surge_area = stats.get("VH").getInfo()
    if surge_area is None:
        return {
            "value": None,
            "unit": "square_km",
            "data_quality": "poor",
            "source_scene_date": None,
        }

    scene_dates_ms = after_collection.aggregate_array("system:time_start").getInfo()
    latest_scene_date: date | None = None
    if scene_dates_ms:
        latest_scene_date = datetime.fromtimestamp(
            max(scene_dates_ms) / 1000,
            tz=timezone.utc,
        ).date()

    quality = "good" if before_count >= 2 and after_count >= 2 else "partial"

    return {
        "value": round(float(surge_area), 4),
        "unit": "square_km",
        "data_quality": quality,
        "source_scene_date": latest_scene_date,
    }


def compute_shoreline_change(aoi: "ee.Geometry", year: int) -> dict:
    """
    Shoreline change analysis using MNDWI (Modified Normalized Difference
    Water Index, Xu 2006) for better water/land discrimination in turbid
    coastal waters typical of the Makran coast. MNDWI uses SWIR1 (B11)
    instead of NIR (B8) which reduces noise from sediment-laden water
    and built-up areas.

    Uses a coastal strip mask (500m from JRC Global Surface Water) and
    compares land fraction against the 2016 baseline year.
    """
    if year == EROSION_BASELINE_YEAR:
        return {
            "value": 0.0,
            "unit": "index_0_1",
            "data_quality": "good",
            "source_scene_date": None,
        }

    init_gee()

    def _coastal_strip_mask() -> "ee.Image":
        working_scale = 30
        gsw = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").reproject(crs="EPSG:4326", scale=working_scale)
        permanent_water = gsw.select("occurrence").gt(50)

        neighborhood_px = int(EROSION_BUFFER_METERS / working_scale) + 2
        distance_px = permanent_water.fastDistanceTransform(neighborhood_px).sqrt()
        distance_m = distance_px.multiply(working_scale)

        is_land = permanent_water.Not()
        return distance_m.lte(EROSION_BUFFER_METERS).And(is_land).clip(aoi)

    def _land_fraction_for_year(target_year: int, strip_mask: "ee.Image"):
        start = f"{target_year}-01-01"
        end = f"{target_year}-12-31"  # Use full year for more scenes

        s2 = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterBounds(aoi)
            .filterDate(start, end)
            .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 60))
        )
        clouds = (
            ee.ImageCollection("COPERNICUS/S2_CLOUD_PROBABILITY")
            .filterBounds(aoi)
            .filterDate(start, end)
        )
        joined = ee.Join.saveFirst("cloud_mask").apply(
            primary=s2,
            secondary=clouds,
            condition=ee.Filter.equals(
                leftField="system:index",
                rightField="system:index",
            ),
        )

        def _mask_and_mndwi(img):
            img = ee.Image(img)
            cloud_prob = ee.Image(img.get("cloud_mask")).select("probability")
            clear = cloud_prob.lt(CLOUD_PROB_THRESHOLD)
            # MNDWI = (Green - SWIR1) / (Green + SWIR1) - better for turbid coastal waters
            mndwi = img.normalizedDifference(["B3", "B11"]).rename("MNDWI")
            return mndwi.updateMask(clear)

        collection = ee.ImageCollection(joined).map(_mask_and_mndwi)
        count = collection.size().getInfo()
        if count == 0:
            return None, 0, None

        composite = collection.median().clip(aoi)
        # MNDWI threshold: > 0 = water (more sensitive than NDWI)
        land_mask = composite.lte(0).updateMask(strip_mask)

        stats = land_mask.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=aoi,
            scale=30,
            maxPixels=1_000_000_000,
            bestEffort=True,
            tileScale=8,
        )
        land_fraction = stats.get("MNDWI").getInfo()

        scene_dates_ms = collection.aggregate_array("system:time_start").getInfo()
        latest_date = None
        if scene_dates_ms:
            latest_date = datetime.fromtimestamp(
                max(scene_dates_ms) / 1000,
                tz=timezone.utc,
            ).date()

        return land_fraction, count, latest_date

    strip_mask = _coastal_strip_mask()
    baseline_fraction, baseline_count, _ = _land_fraction_for_year(EROSION_BASELINE_YEAR, strip_mask)
    year_fraction, year_count, year_scene_date = _land_fraction_for_year(year, strip_mask)

    if baseline_fraction is None or year_fraction is None:
        return {
            "value": None,
            "unit": "index_0_1",
            "data_quality": "poor",
            "source_scene_date": None,
        }

    erosion_index = baseline_fraction - year_fraction
    quality = "good" if baseline_count >= 5 and year_count >= 5 else "partial"

    return {
        "value": round(float(erosion_index), 4),
        "unit": "index_0_1",
        "data_quality": quality,
        "source_scene_date": year_scene_date,
    }


def compute_sea_level_rise(aoi: "ee.Geometry", year: int) -> dict:
    """
    Mean sea surface height anomaly (meters) for one region/year, from
    REAL satellite altimetry (AVISO/CMEMS Gridded Sea Level Height
    Anomalies) - not a model reanalysis. This dataset directly assimilates
    measurements from Jason-3, Sentinel-6 Michael Freilich, CryoSat-2,
    and other altimetry missions into a 0.25deg gridded product.

    The district polygons are mostly land, and this dataset only has data
    over water, so the AOI is buffered ~20km out to sea first to reach
    enough ocean grid cells.

    Returns the same shape as compute_flood_extent. A None value with
    data_quality="poor" means no altimetry data for this AOI/year - the
    caller should skip inserting a reading rather than store a fabricated
    number.
    """
    init_gee()

    coastal_buffer = aoi.buffer(20000)
    start = f"{year}-01-01"
    end = f"{year}-12-31"

    # Use real satellite altimetry: AVISO/CMEMS gridded sea surface height
    # anomalies. This is actual satellite data, not a model reanalysis.
    collection = (
        ee.ImageCollection("AVISO/SEA_SURFACE_HEIGHT_ANOMALY")
        .filterBounds(coastal_buffer)
        .filterDate(start, end)
        .select("ssha")
    )

    count = collection.size().getInfo()
    if count == 0:
        return {"value": None, "unit": "m", "data_quality": "poor", "source_scene_date": None}

    mean_image = collection.mean()
    stats = mean_image.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=coastal_buffer,
        scale=25000,
        maxPixels=1_000_000_000,
        bestEffort=True,
    )
    raw_value = stats.get("ssha").getInfo()
    if raw_value is None:
        return {"value": None, "unit": "m", "data_quality": "poor", "source_scene_date": None}

    # AVISO value is already in meters
    value = raw_value

    # AVISO/CMEMS is daily gridded product, expect ~300+ scenes per year
    quality = "good" if count >= 200 else "partial"

    return {
        "value": round(float(value), 6),
        "unit": "m",
        "data_quality": quality,
        "source_scene_date": None,
    }


def compute_tsunami_risk(aoi: "ee.Geometry", year: int) -> dict:
    try:
        init_gee()
        dem = ee.Image("USGS/SRTMGL1_003").clip(aoi)

        low_elevation = dem.gte(0).And(dem.lte(10))
        slope = ee.Terrain.slope(dem)

        elev_stats = dem.updateMask(low_elevation).reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=aoi,
            scale=30,
            maxPixels=1e9,
        )
        slope_stats = slope.updateMask(low_elevation).reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=aoi,
            scale=30,
            maxPixels=1e9,
        )

        mean_elev = elev_stats.get("elevation").getInfo()
        mean_slope = slope_stats.get("slope").getInfo()

        if mean_elev is not None and mean_slope is not None:
            elev_risk = max(0, min(1, (LECZ_ELEVATION_THRESHOLD_M - mean_elev) / LECZ_ELEVATION_THRESHOLD_M))
            slope_risk = max(0, min(1, (15 - mean_slope) / 15))
            combined_risk = (elev_risk * 0.7) + (slope_risk * 0.3)
            tsunami_value = combined_risk * 10
        else:
            tsunami_value = 0.0

        return {
            "value": round(float(tsunami_value), 4),
            "unit": "risk_index_0_10",
            "data_quality": "good",
            "source_scene_date": None,
        }

    except Exception as e:
        logger.error(f"compute_tsunami_risk failed: {e}")
        raise