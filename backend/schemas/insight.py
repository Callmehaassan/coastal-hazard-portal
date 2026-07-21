from pydantic import BaseModel, Field


class InsightPromptRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=500)


class ParsedInsightQuery(BaseModel):
    hazard_type: str
    district: str | None = None
    year_start: int
    year_end: int


class InsightPromptResponse(BaseModel):
    parsed_query: ParsedInsightQuery
    data_points: int
    summary: str
