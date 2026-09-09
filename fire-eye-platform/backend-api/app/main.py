from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json
import asyncio

app = FastAPI(title="Fire-Eye Tactical API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@app.get("/")
def read_root():
    return {"status": "Fire-Eye Backend is running."}

@app.get("/api/anomalies/live")
def get_live_anomalies():
    """
    Returns the most recent anomalies. 
    In production, this would query PostGIS.
    """
    return [
        {
            "id": 1,
            "latitude": 34.0522,
            "longitude": -118.2437,
            "brightness": 340.5,
            "frp": 150.2,
            "is_wildfire": True
        }
    ]

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming commands if necessary
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Background task to mock real-time alerts
@app.on_event("startup")
async def startup_event():
    async def mock_alert_stream():
        while True:
            await asyncio.sleep(10)
            if manager.active_connections:
                alert = {
                    "type": "NEW_ANOMALY",
                    "data": {
                        "latitude": 34.0522,
                        "longitude": -118.2437,
                        "is_wildfire": True,
                        "confidence": "high"
                    }
                }
                await manager.broadcast(alert)
    
    asyncio.create_task(mock_alert_stream())
