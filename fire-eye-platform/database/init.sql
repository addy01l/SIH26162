-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS postgis;

-- Schema for OpenStreetMap industrial boundaries
CREATE TABLE IF NOT EXISTS osm_industrial (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    geom GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a spatial index on the geometry column for fast spatial queries
CREATE INDEX IF NOT EXISTS osm_industrial_geom_idx
  ON osm_industrial
  USING GIST (geom);

-- Schema for raw ingested FIRMS data (thermal anomalies)
CREATE TABLE IF NOT EXISTS firms_detections (
    id SERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    bright_ti4 DOUBLE PRECISION,
    frp DOUBLE PRECISION,
    confidence VARCHAR(20),
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a spatial index on the geometry column for fast spatial queries
CREATE INDEX IF NOT EXISTS firms_detections_geom_idx
  ON firms_detections
  USING GIST (geom);

-- =========================================================================
-- OPTIMIZED ST_Intersects QUERY
-- =========================================================================
-- This query checks if newly inserted FIRMS coordinates fall within 
-- any osm_industrial polygon.
-- We can create a view to easily query the intersection of firms_detections 
-- with osm_industrial. The spatial indexes (GIST) on both tables will 
-- make this JOIN highly optimized.

CREATE OR REPLACE VIEW firms_in_industrial_zones AS
SELECT 
    f.id AS detection_id,
    f.latitude,
    f.longitude,
    f.bright_ti4,
    f.frp,
    f.confidence,
    f.created_at,
    o.id AS osm_industrial_id,
    o.name AS osm_industrial_name
FROM 
    firms_detections f
JOIN 
    osm_industrial o
ON 
    ST_Intersects(f.geom, o.geom);

-- Example query to check if a specific new coordinate (e.g., from an incoming stream)
-- falls within an industrial zone before inserting it:
/*
SELECT id, name 
FROM osm_industrial 
WHERE ST_Intersects(
    geom, 
    ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
);
*/
