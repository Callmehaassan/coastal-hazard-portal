# Coastal Hazard Portal (Balochistan Coastline)

A state-of-the-art decision support system and multi-hazard mapping application for monitoring, analyzing, and visualizing coastal vulnerability, erosion, flooding, and storm surge dynamics along the Makran (Balochistan) coastline of Pakistan. It integrates Next.js, FastAPI, PostgreSQL/PostGIS, and live Google Earth Engine (GEE) algorithms to compute spatial risk indexes in real-time.

---

## 🛰️ Key Features

- **Google Earth Engine (GEE) Live Pipeline**:
  - Run live Sentinel-2 cloud-masked MNDWI (Modified Normalized Difference Water Index) calculations to analyze coastal erosion rates against the 2016 baseline.
  - Compute dynamic flood inundation extents using SAR-based Otsu backscatter thresholding.
  - Track storm surge impact areas and CVI (Coastal Vulnerability Index) metrics in real-time.
- **Dynamic CVI Weights Optimization**:
  - Multi-Criteria Evaluation (MCE) sliders to adjust parameters dynamically: Elevation, Slope, Erosion (DSAS), SLR (SSHA), Tsunami Run-up, and Storm Surge.
- **GEE Interactive Execution Console**:
  - A real-time terminal interface displaying logging outputs, API connections, database queries, and compilation stages from GEE.
- **High-Fidelity GIS Leaflet Mapping Canvas**:
  - **Seamless Shape-Clipped Heatmap**: Renders GEE classification rasters (Low to Very High Risk) clipped strictly inside the admin boundaries of Gwadar and Lasbela.
  - **Non-Overlapping Beacon Markers**: Glowing hazard beacons featuring a smart 4-way direction layout (Flooding tooltip points UP, Erosion points DOWN, Storm Surge points RIGHT, Vulnerability points LEFT) preventing collision.
  - **Layers Controls**: Toggle layers for designated safe zones, capacity shelters, meteorological stations, major highways, and province coastlines.
  - **Basemaps**: Switch dynamically between open-street map and satellite view styles.
- **Report Generation**:
  - Compile analysis weights, active hazards, GEE run-logs, and maps into a downloadable, print-ready PDF analysis report.

---

## 🎨 UI, Mobile & 🔒 Security Enhancements

We recently introduced several core UI, accessibility, and backend security upgrades:

- **Branding & Light-Theme Styling**:
  - Integrated the circular Urdu-English **Coastal Hazard Portal logo** across all header navigation bars.
  - Converted the entire dashboard page layout, sidebars, charts (Recharts config), AI chatbot log, mapping controls/legends, modals, and the **GEE Live Analysis** page to a beautiful, clean white glassmorphic Light-Theme matching the homepage styling.
- **Mobile Responsiveness**:
  - Added a collapsible mobile hamburger navigation menu (toggle button showing `Menu`/`X` close icons) on the homepage.
  - Styled the **GEE Live Analysis** workspace to adapt dynamically (`flex-col md:flex-row`). The weights console stacks cleanly on top on mobile, leaving the Leaflet canvas to occupy the remaining screen height.
- **Robust Security Upgrades**:
  - **In-Memory Rate Limiter**: Configured a backend IP-based rate limiting middleware enforcing a maximum threshold of `100 requests per minute` on all `/api` endpoints, blocking DDoS and brute-force abuse.
  - **HTTP Security Headers**: Updated the Next.js configurations to serve secure HTTP headers protecting users from typical attack vectors:
    - `Strict-Transport-Security`: Forces secure SSL/HTTPS traffic.
    - `X-Frame-Options (SAMEORIGIN)`: Eliminates clickjacking vulnerability.
    - `X-Content-Type-Options (nosniff)`: Prevents MIME-type sniffing exploits.
    - `Referrer-Policy`: Secures navigation logs.

---

## 🏗️ Architecture Stack

- **Frontend**:
  - Next.js 14 (App Router)
  - React 18, TypeScript
  - Leaflet / React-Leaflet
  - TailwindCSS & Custom Glassmorphism Theme
- **Backend**:
  - FastAPI (Python 3.10+)
  - SQLAlchemy ORM
  - Google Earth Engine Python SDK (`ee`)
  - PostgreSQL 16 with PostGIS extension (via Docker Compose)
  - PyPDF2 / ReportLab (for PDF generation)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.10 or higher)
- [Docker](https://www.docker.com/) & Docker Compose
- Google Earth Engine Service Account credentials (`gee-key.json`)

---

### Step 1: Database Setup (Docker)

Spin up the PostGIS-enabled PostgreSQL instance:

```bash
docker-compose up -d
```

This starts a PostgreSQL database with PostGIS extensions listening on port `5433`.

---

### Step 2: Backend Setup

1. **Navigate to the backend directory and create a virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install python packages**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Add your database connection credentials and your Google Earth Engine Service Account info:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/coastal_hazard
   GEE_SERVICE_ACCOUNT_EMAIL=coastal-hazard-pipeline@coastal-hazard-portal.iam.gserviceaccount.com
   GEE_SERVICE_ACCOUNT_KEY_PATH=D:/coastal-hazard-portal/backend/gee-key.json
   GEE_PROJECT_ID=coastal-hazard-portal
   FORCE_OFFLINE=false
   ```

4. **Seed the database**:
   Run the seeding scripts to register district metadata and hazard readings:
   ```bash
   python seed_regions.py
   python seed_hazard_readings.py
   python update_region_boundaries.py
   ```

5. **Start the FastAPI server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

The backend API docs will be available at `http://localhost:8000/docs`.

---

### Step 3: Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the Next.js development server**:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to access the application. Go to `http://localhost:3000/dashboard/analysis` to run GEE Live Analysis!

---

## 🛰️ Google Earth Engine Service Account Configuration

To run live calculations on Google Earth Engine:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a service account named `coastal-hazard-pipeline`.
3. Generate a JSON Key for the account, download it, and rename it to `gee-key.json`.
4. Place `gee-key.json` in the `/backend` folder.
5. In the Google Earth Engine registration portal, make sure the service account email is registered and has access to the GEE API.

---

## 🛠️ Running Tests

To run API backend tests:
```bash
cd backend
pytest
```