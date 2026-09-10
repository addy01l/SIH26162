# 🔥 FIRE-EYE

**Smart India Hackathon 2026 | Problem Statement: SIH26162**

**Theme:** Disaster Management  
**Project:** AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources Using NASA FIRMS, OSM & Satellite Data.

---

## 🌍 What is FIRE-EYE?

Industrial zones generate a lot of heat—whether it's a routine flare at a refinery, a harmless shutdown process, or an actual dangerous facility fire. For disaster management teams and emergency responders, the challenge isn't *finding* heat from space; it's figuring out if that heat is normal or an emergency. 

**FIRE-EYE** is an automated geospatial intelligence platform designed to solve this exact problem. 

We take near-real-time satellite thermal data (like VIIRS and MODIS via NASA FIRMS), cross-reference those hotspots against known industrial infrastructure boundaries using OpenStreetMap (OSM), and use machine learning to intelligently classify the thermal event. Finally, we validate critical fires using high-resolution Sentinel-2 satellite imagery, presenting everything on a live tactical dashboard.

Instead of alerting responders to every single heat source, FIRE-EYE cuts through the noise. We tell you exactly where the fire is, what industrial site is affected, and whether it's actually an emergency.

## 🚀 Data Flow & Architecture

FIRE-EYE operates on a near-real-time (NRT) geospatial event-driven pipeline, splitting workloads between a lightweight Next.js edge and a heavy Python/PostGIS processing backend.

### 1. Ingestion Layer (Next.js Edge)
- **Global Polling:** The React dashboard (`/frontend`) maintains a 30-second silent polling cycle against our Next.js API route (`app/api/firms/route.ts`).
- **NASA FIRMS Uplink:** The Next.js API queries NASA's global VIIRS 375m NRT thermal footprint, fetching telemetry across the last 12-hour sliding window.
- **Initial Heuristics:** The server computes instant, heuristic-based classifications (e.g. Fire Radiative Power (FRP) > 15 MW or Brightness > 360 K flags a potential severe anomaly).
- **Asynchronous ML Logging:** While the API resolves immediately to the UI for zero-latency dashboard updates, a background Node.js thread writes every unique raw thermal record to a local CSV (`data/ml_training_log.csv`). This decouples live monitoring from ML data harvesting.

### 2. Analytical & Geospatial Layer (FastAPI + PostGIS)
- **Data Broker:** The FastAPI backend (running on port 8000 via a Next.js proxy) acts as the bridge to our heavy geospatial models.
- **Spatial Intersections (PostGIS):** Live thermal coordinates are injected into PostgreSQL. We run optimized `ST_Intersects` queries against OpenStreetMap (OSM) polygons (loaded in `osm_industrial`) to identify exactly what physical infrastructure is radiating heat.
- **AI Classification Engine:** The historical telemetry logged by Next.js is consumed by Python ML models (XGBoost & Isolation Forest). By comparing the live thermal signature and spatial context against historical baseline norms, the engine accurately scores the event as a **Routine Flare**, a harmless **Shutdown**, or an actual **Emergency Fire**.

### 3. Validation & C2 Layer (Sentinel-2 + UI)
- **Optical Validation:** High-confidence emergencies trigger a request for Copernicus Sentinel-2 Short-Wave Infrared (SWIR) imagery to visually validate the fire core without ground deployment.
- **Command & Control (C2) Dashboard:** Operators see a pulsing, 60 FPS 3D globe (MapLibre + Three.js) that auto-highlights the newest, most severe anomalies in neon red, allowing for immediate tactical dispatch.

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui, MapLibre GL, Three.js.
* **Backend:** FastAPI (Python), Next.js Serverless Routes (Node.js).
* **Database / Geospatial:** PostgreSQL + PostGIS extension.
* **Machine Learning:** Python, XGBoost, scikit-learn (Isolation Forest).
* **Data Sources:** NASA FIRMS (VIIRS), OpenStreetMap (Geofabrik), Copernicus (Sentinel-2).

## 📂 Project Structure

* `/frontend` - The Next.js tactical C2 dashboard and NASA FIRMS API ingestion routes.
* `/fire-eye-platform` - Heavy infrastructure layer:
  * `/backend-api` - FastAPI services bridging PostGIS and the ML pipeline.
  * `/database` - SQL init scripts (`init.sql`) for PostGIS geometries and ST_Intersects logic.
  * `/data-ingestion` - Python Celery workers and legacy ingestion scripts.

## 💡 Why This Matters

Emergency services shouldn't have to waste time investigating routine industrial burn-offs. By automating the classification of thermal anomalies, FIRE-EYE ensures that when an alert goes out, it's a real fire that demands a real response. 

---
*Built for SIH 2026. Saving time, saving resources, saving lives.*
