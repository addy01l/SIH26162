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

## 🚀 How It Works (The Pipeline)

1. **Ingestion (NASA FIRMS):** We constantly pull live thermal telemetry from satellites passing overhead. 
2. **Context (OSM & PostGIS):** When a hotspot is detected, we instantly map its coordinates against industrial polygons (like factories, power plants, and refineries) to see exactly what's burning.
3. **AI Classification Engine:** We push the event data through our XGBoost and Isolation Forest models. By comparing the thermal signature against historical baselines, we classify the event as a **Routine Flare**, a harmless **Shutdown**, or an actual **Fire**.
4. **Validation (Sentinel-2):** If it's a Fire, we don't just guess. We query Sentinel-2 optical and Short-Wave Infrared (SWIR) imagery to visually validate the fire core.
5. **Alerting (Tactical GIS Dashboard):** All of this enriched intelligence is beamed to our web-based command dashboard, giving operators the exact information they need to dispatch ground verification.

## 🛠️ Tech Stack

We built FIRE-EYE using robust, industry-standard tools for geospatial processing and modern web development:

* **Frontend:** React, Next.js, Tailwind CSS, MapLibre GL, and Three.js for interactive mapping and data visualization.
* **Backend:** Node.js / Express API.
* **Database & Geospatial Engine:** PostgreSQL with the PostGIS extension for lightning-fast spatial queries.
* **Machine Learning:** Python, XGBoost, and scikit-learn (Isolation Forest) for classification.
* **Data Sources:** NASA FIRMS (VIIRS/MODIS), OpenStreetMap (Overpass API / Geofabrik), and Copernicus (Sentinel-2).

## 📂 Project Structure

* `/frontend` - The Next.js tactical C2 dashboard (includes interactive maps and event telemetry panels).
* `/fire-eye-platform` - Contains our backend infrastructure, including:
  * `/backend-api` - Node.js API serving event data to the dashboard.
  * `/data-ingestion` - Python scripts handling the FIRMS data pipeline and machine learning models.
* `ARCHITECTURE.md` - Deep dive into our system architecture and data flows.
* `WORKFLOW.md` - Detailed explanation of the 5-step classification pipeline.

## 💡 Why This Matters

Emergency services shouldn't have to waste time investigating routine industrial burn-offs. By automating the classification of thermal anomalies, FIRE-EYE ensures that when an alert goes out, it's a real fire that demands a real response. 

---
*Built for SIH 2026. Saving time, saving resources, saving lives.*
