# FIRE-EYE Architecture

## 1. System Overview

FIRE-EYE is an automated geospatial intelligence platform designed to process near-real-time satellite thermal telemetry, connect thermal anomalies with industrial infrastructure, and classify anomalies such as routine industrial activity, fire events, and abnormal or shutdown conditions. It is purpose-built to provide tactical oversight for disaster management and industrial monitoring.

## 2. High-Level Architecture

```
Satellite / External Data Sources
        ↓
Data Ingestion
        ↓
Geospatial Processing
        ↓
Anomaly Detection & Classification
        ↓
Validation
        ↓
Alert / Event Processing
        ↓
GIS Dashboard
```

## 3. Data Sources

- **NASA FIRMS:** Primary source for near-real-time global active fire data.
- **VIIRS / MODIS:** Specific satellite instruments providing the raw thermal anomaly and fire detections.
- **OpenStreetMap / Overpass:** Source for industrial infrastructure boundaries and contextual geospatial data.
- **Sentinel-2:** Optical and SWIR (Short-Wave Infrared) imagery source for visual validation of detected anomalies.
- **Sentinel-1 SAR:** Synthetic Aperture Radar imagery for all-weather, day-and-night observation (Planned).

## 4. Geospatial Layer

- **PostgreSQL + PostGIS:** Core spatial database used for storing and querying geographical features, such as intersecting thermal points with industrial polygons.
- **Uber H3:** Hexagonal hierarchical spatial indexing system used for efficient spatial analytics and clustering.
- **GeoPandas:** Python library for manipulating and analyzing geospatial data during ingestion and preprocessing.
- **GDAL:** Geospatial Data Abstraction Library used for format translation and advanced raster/vector processing.

## 5. ML Layer

- **XGBoost:** Used for structured tabular data classification, primarily evaluating historical thermal characteristics to determine anomaly types (Routine, Fire, Shutdown).
- **Isolation Forest:** Used for unsupervised anomaly detection to identify statistical outliers in thermal intensity baselines.
- **PyTorch / UNet / CNN:** Used for deep learning computer vision tasks, specifically semantic segmentation of Sentinel-2 optical/SWIR imagery to validate fire cores (Planned).

## 6. Backend

- **FastAPI:** High-performance web framework serving as the primary API connecting the ML/Geospatial engines to the frontend dashboard. (In development)
- **Celery:** Distributed task queue used to handle asynchronous, long-running processes such as fetching satellite overpass data and running heavy ML inference pipelines. (In development)

## 7. Frontend

- **React / Next.js:** Core UI framework providing the tactical dashboard interface. (Implemented)
- **MapLibre GL:** WebGL-based vector map rendering engine used for rendering the base tactical map. (Implemented)
- **Deck.gl:** Large-scale data visualization framework used for layering thermal events and high-performance WebGL overlays. (Implemented)

## 8. Deployment

- **Docker:** Containerization of all system components ensuring reproducible builds and easy scaling. (Implemented)
- **Offline / air-gapped deployment:** The system is architected to be deployable in secure, disconnected operational environments, leveraging localized caching of maps and pre-trained ML models. (Planned)

## 9. Data Flow

1. A thermal detection is captured by the VIIRS/MODIS instruments and ingested via NASA FIRMS.
2. The coordinate is mapped against OpenStreetMap industrial polygons using PostGIS.
3. The event's historical baseline and current telemetry are fed into the XGBoost and Isolation Forest models.
4. The model classifies the event as a Routine Flare, Fire, or Shutdown.
5. If classified as a fire, Sentinel-2 SWIR imagery is queried for validation.
6. The fully enriched event (Coordinates, Severity, Classification, Industrial Context) is broadcasted to the FIRE-EYE GIS Dashboard for tactical operator review.

## 10. Security / Operational Considerations

The platform is designed to operate in highly secure environments. The air-gapped deployment capability ensures that sensitive industrial location intelligence remains entirely on-premises. Map tiles, base datasets (OSM extracts), and ML models are pre-packaged within the Docker environment, eliminating the need for an active external internet connection during deployment, save for the incoming one-way satellite telemetry feed.
