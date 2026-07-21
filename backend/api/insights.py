from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.insight import InsightPromptRequest, InsightPromptResponse, ParsedInsightQuery
from services.llm_query_service import generate_summary, parse_prompt, run_query, validate_parsed_query

router = APIRouter(prefix="/api/insights", tags=["insights"])


@router.post("/prompt", response_model=InsightPromptResponse)
def query_insight(payload: InsightPromptRequest, db: Session = Depends(get_db)):
    """Accepts a natural-language prompt; returns parsed params, matched data, and a generated summary."""
    parsed = parse_prompt(payload.prompt)
    validated = validate_parsed_query(parsed)
    readings = run_query(db, validated)
    summary = generate_summary(validated, readings)

    return InsightPromptResponse(
        parsed_query=ParsedInsightQuery(**validated),
        data_points=len(readings),
        summary=summary,
    )
