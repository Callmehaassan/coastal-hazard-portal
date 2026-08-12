"""
Whitelist validation helpers.

Per SRS 8.1 (Security Hardening): any parameter that could originate from
outside the frontend's own dropdowns - including parsed LLM output in
Phase 3 - must be re-validated here against a fixed whitelist before it
touches a query. Never trust district/hazard_type/year strings as-is.
"""
from fastapi import HTTPException, status

from utils.constants import BALOCHISTAN_DISTRICTS, HAZARD_TYPES, MIN_YEAR, MAX_YEAR


def validate_district(district: str | None) -> str | None:
    if district is None:
        return None
    if district not in BALOCHISTAN_DISTRICTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown district '{district}'. Must be one of {BALOCHISTAN_DISTRICTS}.",
        )
    return district


def validate_hazard_type(hazard_type: str) -> str:
    if not hazard_type or hazard_type not in HAZARD_TYPES:
        return "all"
    return hazard_type


def validate_year_range(year_start: int, year_end: int) -> tuple[int, int]:
    if not (MIN_YEAR <= year_start <= MAX_YEAR) or not (MIN_YEAR <= year_end <= MAX_YEAR):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Years must be within {MIN_YEAR}-{MAX_YEAR}.",
        )
    if year_start > year_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="year_start must be <= year_end.",
        )
    return year_start, year_end
