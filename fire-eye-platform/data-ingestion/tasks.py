import os
import csv
import io
import requests
import psycopg2
import h3
import logging
from celery_app import app

logger = logging.getLogger(__name__)

FIRMS_API_KEY = os.getenv("FIRMS_API_KEY", "DEMO_KEY")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@database:5432/fireeye")

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

@app.task
def fetch_firms_data():
    """
    Fetches NASA FIRMS Near Real-Time (NRT) thermal anomalies data,
    processes H3 indexing, and inserts into PostGIS.
    """
    logger.info("Starting FIRMS data ingestion task...")
    
    # We'll use VIIRS SNPP (source: VIIRS_SNPP_NRT) as an example
    # Area format: World (-180,-90,180,90) or a specific bounding box
    # Using 'world' for 1 day
    source = "VIIRS_SNPP_NRT"
    area = "world"
    day_range = 1
    
    # Check if we're running without a real key
    if FIRMS_API_KEY == "DEMO_KEY":
        logger.warning("Using DEMO_KEY. NASA FIRMS API requires a valid MAP_KEY. "
                       "Skipping real fetch to avoid API errors.")
        return "Skipped fetch (No API Key)"
        
    url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{FIRMS_API_KEY}/{source}/{area}/{day_range}"
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Parse CSV
        csv_data = response.text
        reader = csv.DictReader(io.StringIO(csv_data))
        
        records_to_insert = []
        for row in reader:
            lat = float(row['latitude'])
            lng = float(row['longitude'])
            
            # Calculate H3 index at resolution 8
            h3_idx = h3.geo_to_h3(lat, lng, 8)
            
            records_to_insert.append((
                lat,
                lng,
                float(row.get('brightness', 0)) if row.get('brightness') else None,
                float(row.get('scan', 0)) if row.get('scan') else None,
                float(row.get('track', 0)) if row.get('track') else None,
                row['acq_date'],
                row['acq_time'],
                row.get('satellite', ''),
                row.get('instrument', ''),
                row.get('confidence', ''),
                row.get('version', ''),
                float(row.get('bright_t31', 0)) if row.get('bright_t31') else None,
                float(row.get('frp', 0)) if row.get('frp') else None,
                row.get('daynight', ''),
                # PostGIS geometry uses EWKT: SRID=4326;POINT(lon lat)
                f"SRID=4326;POINT({lng} {lat})",
                h3_idx
            ))
            
        if not records_to_insert:
            logger.info("No new thermal anomalies found.")
            return "No data"
            
        # Bulk insert into PostgreSQL
        insert_query = """
            INSERT INTO thermal_anomalies (
                latitude, longitude, brightness, scan, track, acq_date, acq_time,
                satellite, instrument, confidence, version, bright_t31, frp, daynight,
                geom, h3_index
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                ST_GeomFromEWKT(%s), %s
            )
        """
        
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.executemany(insert_query, records_to_insert)
            conn.commit()
            
        logger.info(f"Successfully inserted {len(records_to_insert)} thermal anomalies.")
        return f"Inserted {len(records_to_insert)} records."
        
    except Exception as e:
        logger.error(f"Error fetching/inserting FIRMS data: {e}")
        raise
