"""
Coastal Hazard Portal - FastAPI entrypoint.
Run with: uvicorn main:app --reload
"""
from contextlib import asynccontextmanager
import time
from collections import defaultdict

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
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

RATE_LIMIT_DURATION = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 100  # max requests per duration
request_history = defaultdict(list)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Only rate limit api routes, bypass health checks
    if request.url.path.startswith("/api") and request.url.path != "/api/health":
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Filter request timestamps in the active window
        timestamps = [t for t in request_history[client_ip] if now - t < RATE_LIMIT_DURATION]
        request_history[client_ip] = timestamps
        
        if len(timestamps) >= RATE_LIMIT_MAX_REQUESTS:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please try again later."}
            )
        request_history[client_ip].append(now)
        
    return await call_next(request)

app.include_router(auth.router)
app.include_router(regions.router)
app.include_router(hazards.router)
app.include_router(alerts.router)
app.include_router(pipeline.router)
app.include_router(reports.router)
app.include_router(insights.router)
app.include_router(tsunami_zones.router)


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "environment": settings.environment}


@app.get("/redoc", include_in_schema=False)
async def redoc_html():
    from fastapi.responses import HTMLResponse
    html_content = """<!DOCTYPE html>
<html>
  <head>
    <title>Coastal Hazard Portal API - ReDoc</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
      body { margin: 0; padding: 0; background: #fafafa; font-family: 'Roboto', sans-serif; }
    </style>
  </head>
  <body>
    <redoc spec-url="/openapi.json"></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@2.1.5/bundles/redoc.standalone.js"></script>
    <script>
      if (!window.Redoc) {
        var s = document.createElement('script');
        s.src = 'https://unpkg.com/redoc@2.1.5/bundles/redoc.standalone.js';
        document.body.appendChild(s);
      }
    </script>
  </body>
</html>"""
    return HTMLResponse(content=html_content)
