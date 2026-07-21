"""
Coastal Hazard Portal - FastAPI entrypoint.
Run with: uvicorn main:app --reload
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models  # noqa: F401 - registers all models on Base.metadata before create_all
from config import get_settings
from database import Base, engine
from api import auth, regions, hazards, alerts, pipeline, reports, insights, tsunami_zones

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Dev convenience only - use Alembic migrations for anything beyond local dev.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Coastal Hazard Portal API",
    description="Multi-hazard coastal monitoring for the Balochistan (Makran) coastline.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,  # required so the httpOnly auth cookie is sent
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(regions.router)
app.include_router(hazards.router)
app.include_router(alerts.router)
app.include_router(pipeline.router)
app.include_router(reports.router)
app.include_router(insights.router)
app.include_router(tsunami_zones.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "environment": settings.environment}
