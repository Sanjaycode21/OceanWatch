# OceanWatch AI
### AI-Powered Ocean Hazard Intelligence Platform

OceanWatch AI is an AI-powered maritime hazard detection, response, and routing platform designed for coast guards, disaster management operators, and citizens.

---

## System Architecture

```mermaid
graph TD
    A[Citizen Mobile App] -->|Report Upload / GPS / SOS| B(FastAPI Backend Gateway)
    B -->|Ingest Queue| C(AI Processing Pipeline)
    C -->|Vision Check| D[Gemini Vision Engine]
    C -->|Evidence Factors| E[Credibility Engine]
    C -->|Centroid Clusters| F[Incident Intelligence Engine]
    C -->|Dispatches Alerts| G[Alert & Notification Engine]
    G -->|Mock SMS Broadcast| H[SMS Provider]
    G -->|SSE Streams| I[Next.js Command Center Dashboard]
    B -->|Database Operations| J[PostgreSQL + PostGIS]
```

---

## Monorepo Directory Organization

*   [/backend](file:///c:/Users/sanja/OneDrive/Documents/GitHub/OceanWatch/backend): Clean Architecture FastAPI, PostgreSQL + PostGIS, SQLAlchemy, Alembic database migrations.
*   [/web](file:///c:/Users/sanja/OneDrive/Documents/GitHub/OceanWatch/web): Next.js 16 command center operations dashboard (TypeScript, Tailwind v4, Leaflet, Recharts).
*   [/mobile](file:///c:/Users/sanja/OneDrive/Documents/GitHub/OceanWatch/mobile): Citizen mobile app (Flutter, Riverpod, Hive offline caching, Geolocator, Camera).

---

## Setup & Running Instructions

### 1. Backend Server Setup
Ensure PostgreSQL and PostGIS are installed and running.

```bash
cd backend
# Install dependencies
pip install -r requirements.txt

# Configure settings in .env
# Copy template configs or define environment variables:
# DATABASE_URL=postgresql://user:password@localhost:5432/oceanwatch
# GEMINI_API_KEY=your_google_gemini_api_key

# Run database migrations
alembic upgrade head

# Seed mock database logs
python app/seed.py

# Launch development server
uvicorn app.main:app --reload
```

---

### 2. Next.js Command Center Dashboard
Build and launch the operations web dashboard.

```bash
cd web
# Install npm dependencies
npm install

# Build production client
npm run build

# Start production server
npm run start
```

---

### 3. Flutter Citizen Application
Mount the Flutter application on Android/iOS emulators.

```bash
cd mobile
# Retrieve package dependencies
flutter pub get

# Launch target device emulator
flutter run
```

---

## Smart India Hackathon (SIH) Demonstration Script

Showcase the OceanWatch AI platform using this step-by-step presentation script:

### Step 1: Citizen Ingestion
1. Open the **Flutter Citizen App** on the device emulator.
2. Navigate to **Report Hazard**. Capture an ocean asset photography using the camera picker, add description tags, and click **Transmit Hazard Log** (Location coordinates are automatically triangulated via Geolocator).

### Step 2: Multimodal AI Classification
1. The backend server intercepts the upload and triggers the **AI Orchestrator Pipeline**.
2. **Gemini Vision** scans the image asset, returning hazard categories (`Pollution`) and specific tags (`Oil Spill`) alongside reasoning logs.
3. The **Credibility Engine** checks report integrity factor constraints, updating citizen reputation profiles.

### Step 3: Fused Centroid Clustering
1. The **Incident Intelligence Engine** checks reports inside a 500m geofence radius.
2. It groups duplicates under an active incident centroid or instantiates a new incident block.

### Step 4: Emergency Alert Dispatches
1. The **Alert Engine** determines threat bounds, setting priority status indicators.
2. The **Notification Engine** queries geolocated citizen lists and sends out mock SMS warnings to operators.
3. Simultaneously, updates are pushed via **Server-Sent Events (SSE)**.

### Step 5: Command Center Operations
1. Open the **Next.js Dashboard** at `http://localhost:3000`.
2. View real-time alert logs and markers updating instantly on the **GIS Map Console** without browser page refreshes.
3. Click on the active incident pin to inspect credibility scores and AI visual evidence, and coordinate dispatches.