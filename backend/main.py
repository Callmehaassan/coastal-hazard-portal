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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      body { margin: 0; padding: 0; background: #070e1b; color: #f8fafc; font-family: 'Inter', sans-serif; }
      #redoc-container { width: 100%; min-height: 100vh; }
      .loading-box { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #06b6d4; font-family: 'Inter', sans-serif; }
      .spinner { border: 4px solid rgba(6, 182, 212, 0.2); border-top: 4px solid #06b6d4; border-radius: 50%; width: 44px; height: 44px; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .fallback-card { max-width: 900px; margin: 40px auto; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
      .endpoint-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; margin-bottom: 8px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }
      .badge-get { background: #0284c7; color: white; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 11px; }
      .badge-post { background: #059669; color: white; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 11px; }
      .path-text { font-family: monospace; font-size: 13px; color: #e2e8f0; font-weight: 600; }
      .tag-text { font-size: 11px; color: #94a3b8; }
    </style>
  </head>
  <body>
    <div id="redoc-container">
      <div class="loading-box" id="loader">
        <div class="spinner"></div>
        <p style="font-weight: 600; letter-spacing: 0.5px;">Loading Coastal Hazard Portal API Documentation...</p>
      </div>
    </div>

    <!-- Official Redoc Bundle -->
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
    <script>
      function initDocs() {
        if (window.Redoc) {
          Redoc.init('/openapi.json', {
            scrollYOffset: 0,
            hideDownloadButton: false,
            theme: {
              colors: { primary: { main: '#06b6d4' } },
              typography: { fontFamily: 'Inter, sans-serif' }
            }
          }, document.getElementById('redoc-container'));
        } else {
          // Instant Interactive Fallback Viewer
          fetch('/openapi.json')
            .then(res => res.json())
            .then(data => {
              let html = '<div class="fallback-card">';
              html += '<h1 style="color:#06b6d4;margin-top:0;">' + (data.info.title || 'Coastal Hazard Portal API') + '</h1>';
              html += '<p style="color:#94a3b8;font-size:14px;">' + (data.info.description || 'Multi-hazard coastal monitoring API') + '</p>';
              html += '<hr style="border:0;border-top:1px solid rgba(255,255,255,0.1);margin:20px 0;">';
              html += '<h2 style="font-size:16px;margin-bottom:16px;color:#f8fafc;">All Registered Endpoints (' + Object.keys(data.paths).length + ' Paths)</h2>';
              for (const [path, methods] of Object.entries(data.paths)) {
                for (const [method, details] of Object.entries(methods)) {
                  const isGet = method.toUpperCase() === 'GET';
                  html += '<div class="endpoint-row">';
                  html += '<div style="display:flex;align-items:center;gap:12px;">';
                  html += '<span class="' + (isGet ? 'badge-get' : 'badge-post') + '">' + method.toUpperCase() + '</span>';
                  html += '<span class="path-text">' + path + '</span>';
                  html += '</div>';
                  html += '<span class="tag-text">' + (details.summary || (details.tags ? details.tags[0] : '')) + '</span>';
                  html += '</div>';
                }
              }
              html += '<div style="margin-top:24px;text-align:center;"><a href="/docs" style="display:inline-block;background:#06b6d4;color:#070e1b;font-weight:700;padding:10px 20px;border-radius:10px;text-decoration:none;font-size:13px;">Open Interactive Swagger Tester (/docs)</a></div>';
              html += '</div>';
              document.getElementById('redoc-container').innerHTML = html;
            })
            .catch(err => {
              document.getElementById('redoc-container').innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;">Failed to load OpenAPI specification. <a href="/docs" style="color:#06b6d4;">Click here to open /docs</a></div>';
            });
        }
      }

      window.addEventListener('load', initDocs);
      setTimeout(initDocs, 1000);
    </script>
  </body>
</html>"""
    return HTMLResponse(content=html_content)
