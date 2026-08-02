"""
Prompt-based query & AI insight layer (SRS section 5, new in v2.0).

Flow (each step is a separate function so the boundary is auditable):
  1. parse_prompt()          - LLM turns free text into structured JSON. UNTRUSTED.
  2. validate_parsed_query() - re-validate every field against the same
                                whitelist api/hazards.py uses for dropdown requests.
  3. run_query()              - run the identical PostGIS query a dropdown
                                request would run, using only validated params.
  4. generate_summary()      - send ONLY the returned data (never the raw
                                prompt) back to the LLM for a short summary.

Security-critical (SRS 8.1): LLM output only ever populates whitelisted
query parameters that the backend re-validates independently. It never
constructs or touches raw SQL, and step 4 never lets the model see the
original prompt again - it can only describe data that's actually there.
"""
import json

from groq import Groq
from sqlalchemy.orm import Session

from config import get_settings
from models.hazard_reading import HazardIndexReading
from models.region import Region
from utils.constants import HAZARD_TYPES, BALOCHISTAN_DISTRICTS, MIN_YEAR, MAX_YEAR
from utils.validators import validate_district, validate_hazard_type, validate_year_range

settings = get_settings()

# Check Groq's current model list before relying on this in production -
# model names/aliases on Groq change over time.
_GROQ_MODEL = "llama-3.1-8b-instant"

_PARSE_SYSTEM_PROMPT = f"""You extract structured query parameters from a user's natural-language
question about coastal hazards in Balochistan, Pakistan.

Respond with STRICT JSON only, no prose, exactly this shape:
{{"hazard_type": "<one of {HAZARD_TYPES}>", "district": "<one of {BALOCHISTAN_DISTRICTS} or null>", "year_start": <int {MIN_YEAR}-{MAX_YEAR}>, "year_end": <int {MIN_YEAR}-{MAX_YEAR}>}}

Rules:
- If the user doesn't mention a district, set district to null (portal-wide).
- If the user doesn't mention years, use year_start={MIN_YEAR}, year_end={MAX_YEAR}.
- If the user mentions a single year, set year_start and year_end to that same year.
- "flooding"/"inundation" -> flooding. "surge"/"cyclone" -> storm_surge.
  "erosion"/"shoreline" -> erosion. "sea level"/"sea-level" -> sea_level_rise.
"""


def _client() -> Groq:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY not set in .env")
    return Groq(api_key=settings.groq_api_key)


def parse_prompt(prompt: str) -> dict:
    """Step 1: LLM parses free text into structured params. Treat the result as untrusted."""
    try:
        response = _client().chat.completions.create(
            model=_GROQ_MODEL,
            messages=[
                {"role": "system", "content": _PARSE_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content
        return json.loads(raw)
    except Exception:
        # Fallback local parser
        p_lower = prompt.lower()
        
        # Detect hazard type
        hazard_type = "flooding"
        if "surge" in p_lower or "cyclone" in p_lower or "storm" in p_lower:
            hazard_type = "storm_surge"
        elif "erosion" in p_lower or "shoreline" in p_lower or "shore" in p_lower:
            hazard_type = "erosion"
        elif "sea level" in p_lower or "sea-level" in p_lower or "anomaly" in p_lower or "rise" in p_lower:
            hazard_type = "sea_level_rise"
        elif "tsunami" in p_lower:
            hazard_type = "tsunami_risk"
        elif "vulner" in p_lower or "cvi" in p_lower:
            hazard_type = "vulnerability_index"
        elif "safe" in p_lower:
            hazard_type = "safe_zones"
            
        # Detect district
        district = None
        if "gwadar" in p_lower:
            district = "Gwadar"
        elif "lasbela" in p_lower:
            district = "Lasbela"
            
        # Detect years
        year_start = MIN_YEAR
        year_end = MAX_YEAR
        import re
        years = [int(y) for y in re.findall(r"\b(20\d{2})\b", prompt)]
        if len(years) == 1:
            year_start = years[0]
            year_end = years[0]
        elif len(years) >= 2:
            year_start = min(years)
            year_end = max(years)
            
        return {
            "hazard_type": hazard_type,
            "district": district,
            "year_start": year_start,
            "year_end": year_end
        }


def validate_parsed_query(parsed: dict) -> dict:
    """Step 2: re-validate every LLM-produced field - same whitelist as dropdown-driven requests."""
    hazard_type = validate_hazard_type(parsed.get("hazard_type", ""))
    district = validate_district(parsed.get("district"))
    year_start, year_end = validate_year_range(
        int(parsed.get("year_start", MIN_YEAR)),
        int(parsed.get("year_end", MAX_YEAR)),
    )
    return {"hazard_type": hazard_type, "district": district, "year_start": year_start, "year_end": year_end}


def run_query(db: Session, validated: dict) -> list[HazardIndexReading]:
    """Step 3: identical query shape to /api/hazards/* - built only from validated params."""
    query = (
        db.query(HazardIndexReading)
        .join(Region, Region.id == HazardIndexReading.region_id)
        .filter(
            HazardIndexReading.hazard_type == validated["hazard_type"],
            HazardIndexReading.year >= validated["year_start"],
            HazardIndexReading.year <= validated["year_end"],
        )
    )
    if validated["district"]:
        query = query.filter(Region.district == validated["district"])
    return query.order_by(HazardIndexReading.year).all()


def generate_summary(validated: dict, readings: list[HazardIndexReading]) -> str:
    """Step 4: summarize the RETURNED DATA only - the model never sees the raw prompt again."""
    if not readings:
        return (
            f"No {validated['hazard_type']} data found for "
            f"{validated['district'] or 'Balochistan'} between {validated['year_start']} and {validated['year_end']}."
        )

    data_points = [
        {"year": r.year, "value": r.value, "unit": r.unit, "data_quality": r.data_quality.value} for r in readings
    ]
    try:
        response = _client().chat.completions.create(
            model=_GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You write a short (2-3 sentence) factual summary of coastal hazard data for "
                        "Balochistan, Pakistan. Only state what's in the provided JSON data - never invent "
                        "numbers or years not present. Explicitly flag if any year has data_quality "
                        "'partial' or 'poor'."
                    ),
                },
                {"role": "user", "content": json.dumps(data_points)},
            ],
            temperature=0.2,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        # Local fallback text generator based on real-time database results
        district_label = validated['district'] or "Balochistan coast overall"
        hazard_label = validated['hazard_type'].replace("_", " ")
        
        values = [d["value"] for d in data_points]
        years = [d["year"] for d in data_points]
        unit = data_points[0]["unit"]
        
        max_val = max(values)
        max_year = years[values.index(max_val)]
        min_val = min(values)
        min_year = years[values.index(min_val)]
        
        first_val = values[0]
        last_val = values[-1]
        trend = "increased" if last_val > first_val else "decreased" if last_val < first_val else "remained stable"
        
        summary = (
            f"Based on GEE satellite measurements, the {hazard_label} for {district_label} from {years[0]} to {years[-1]} "
            f"{trend} from {first_val} {unit} to {last_val} {unit}. "
            f"The maximum recorded value was {max_val} {unit} in {max_year}, "
            f"and the minimum recorded value was {min_val} {unit} in {min_year}."
        )
        
        poor_years = [d["year"] for d in data_points if d["data_quality"] in ("poor", "partial")]
        if poor_years:
            summary += f" Note: Data quality is flagged as partial/poor for years: {', '.join(map(str, poor_years))}."
            
        return summary
