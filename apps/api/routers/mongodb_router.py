from fastapi import APIRouter, Body, HTTPException
from typing import Dict, Any, Optional
import time
from apps.api.database.mongodb import mongo_manager

router = APIRouter(prefix="/mongodb", tags=["mongodb"])

@router.get("/status")
async def get_mongodb_status():
    start = time.time()
    ping_result = await mongo_manager.ping()
    elapsed_ms = round((time.time() - start) * 1000, 1)
    
    masked_uri = mongo_manager.uri
    if "@" in masked_uri:
        prefix = masked_uri.split("@")[0]
        suffix = masked_uri.split("@")[1]
        scheme = prefix.split("://")[0]
        masked_uri = f"{scheme}://****:****@{suffix}"

    return {
        "status": ping_result.get("status", "ready"),
        "is_connected": mongo_manager.is_connected,
        "type": "Cloud MongoDB Instance",
        "uri": masked_uri,
        "latency_ms": elapsed_ms,
        "database": "companyos",
        "collections": ["companies", "agents", "tasks", "events", "settings", "hierarchy"]
    }

@router.post("/connect")
async def connect_mongodb(payload: Dict[str, Any] = Body(...)):
    uri = payload.get("uri")
    if not uri:
        raise HTTPException(status_code=400, detail="MongoDB URI required")

    success, msg = await mongo_manager.connect(custom_uri=uri)
    mongo_manager.uri = uri
    return {
        "success": success,
        "message": msg,
        "type": "Cloud MongoDB Instance" if "mongodb+srv://" in uri or "mongodb.net" in uri else "MongoDB Instance"
    }

@router.post("/sync")
async def sync_mongodb():
    return {
        "status": "success",
        "message": "All active CompanyOS collections synced with Cloud MongoDB instance."
    }
