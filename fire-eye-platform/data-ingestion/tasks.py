import os
import io
import logging
import requests
import pandas as pd
import psycopg2
from celery_app import app

logger = logging.getLogger(__name__)

# Use the specific MAP_KEY provided or fall back to an environment variable
FIRMS_API_KEY = os.getenv("FIRMS_API_KEY", "338fc0eb481c2cdedbd695c560df857f")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@database:5432/fireeye")

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

@app.task
def fetch_firms_data():
    """
    Fetches NASA FIRMS Near Real-Time (NRT) thermal anomalies data,
    processes it using pandas, and inserts into PostGIS.
    """
    logger.info("Starting FIRMS data ingestion task for India...")
    
    # Target sensor: VIIRS_NOAA20_NRT (375m high-resolution)
    source = "VIIRS_NOAA20_NRT"
    
    # India bounding box (68,6,97,37)
    area = "68,6,97,37"
    
    # Last 24 hours (1 day)
    day_range = 1
    
    # API URL structure
    url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{FIRMS_API_KEY}/{source}/{area}/{day_range}"
    
    try:
        logger.info(f"Fetching data from FIRMS API: {url.replace(FIRMS_API_KEY, '***')}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Use pandas to read the CSV data
        df = pd.read_csv(io.StringIO(response.text))
        
        if df.empty:
            logger.info("No new thermal anomalies found in the requested region.")
            return "No data"
            
        # Extract the required columns
        columns_to_extract = ['latitude', 'longitude', 'bright_ti4', 'frp', 'confidence']
        
        # Verify columns exist in the response
        missing_cols = [col for col in columns_to_extract if col not in df.columns]
        if missing_cols:
            logger.error(f"Missing expected columns in FIRMS response: {missing_cols}")
            return f"Error: Missing columns {missing_cols}"
            
        df = df[columns_to_extract]
        
        # Filter out rows with invalid coordinates
        df = df.dropna(subset=['latitude', 'longitude'])
        
        records_to_insert = []
        for index, row in df.iterrows():
            lat = row['latitude']
            lng = row['longitude']
            bright_ti4 = row['bright_ti4']
            frp = row['frp']
            confidence = str(row['confidence'])
            
            # Construct PostGIS Point Geometry in EWKT format (SRID=4326;POINT(lon lat))
            geom = f"SRID=4326;POINT({lng} {lat})"
            
            records_to_insert.append((
                lat,
                lng,
                bright_ti4 if not pd.isna(bright_ti4) else None,
                frp if not pd.isna(frp) else None,
                confidence if confidence != 'nan' else None,
                geom
            ))
            
        if not records_to_insert:
            logger.info("No valid records found to insert.")
            return "No valid data"
            
        # Bulk insert into PostgreSQL
        insert_query = """
            INSERT INTO firms_detections (
                latitude, longitude, bright_ti4, frp, confidence, geom
            ) VALUES (
                %s, %s, %s, %s, %s, ST_GeomFromEWKT(%s)
            )
        """
        
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.executemany(insert_query, records_to_insert)
            conn.commit()
            
        logger.info(f"Successfully inserted {len(records_to_insert)} thermal anomalies.")
        return f"Inserted {len(records_to_insert)} records."
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching FIRMS data: {e}")
        raise
    except Exception as e:
        logger.error(f"Error processing/inserting FIRMS data: {e}")
        raise
