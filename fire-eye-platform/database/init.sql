-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS postgis;
-- h3-pg provides H3 index support in Postgres
CREATE EXTENSION IF NOT EXISTS h3;
CREATE EXTENSION IF NOT EXISTS h3_postgis CASCADE;

-- Schema for raw ingested FIRMS data
CREATE TABLE IF NOT EXISTS thermal_anomalies (
    id SERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    brightness DOUBLE PRECISION,
    scan DOUBLE PRECISION,
    track DOUBLE PRECISION,
    acq_date DATE NOT NULL,
    acq_time VARCHAR(4) NOT NULL,
    satellite VARCHAR(20),
    instrument VARCHAR(20),
    confidence VARCHAR(10),
    version VARCHAR(10),
    bright_t31 DOUBLE PRECISION,
    frp DOUBLE PRECISION,
    daynight VARCHAR(1),
    -- PostGIS Point Geometry (SRID 4326 - WGS84)
    geom GEOMETRY(Point, 4326),
    -- Uber H3 cell index (Resolution will be calculated on ingest, typically res 8 or 9)
    h3_index h3index, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a spatial index on the geometry column
CREATE INDEX IF NOT EXISTS thermal_anomalies_geom_idx
  ON thermal_anomalies
  USING GIST (geom);

-- Create an index on the H3 column for fast hierarchical queries
CREATE INDEX IF NOT EXISTS thermal_anomalies_h3_idx
  ON thermal_anomalies(h3_index);

-- Index for time-series querying
CREATE INDEX IF NOT EXISTS thermal_anomalies_date_idx
  ON thermal_anomalies(acq_date, acq_time);
