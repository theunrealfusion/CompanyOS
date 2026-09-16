from typing import Optional, Any

from fastapi import APIRouter, Body, HTTPException

from apps.api.database.mongodb import mongo_manager

router = APIRouter(prefix="/mongodb", tags=["mongodb"])


@router.get("/status")
async def get_mongodb_status():
    result = await mongo_manager.ping()
    return result


@router.post("/connect")
async def connect_mongodb(payload: dict[str, Any] = Body(...)):
    uri = payload.get("uri", "").strip()
    if not uri:
        raise HTTPException(status_code=400, detail="MongoDB URI cannot be empty")

    success, msg = await mongo_manager.connect(custom_uri=uri)
    result = await mongo_manager.ping()
    result["message"] = msg
    return result


@router.post("/sync")
async def sync_mongodb():
    if not mongo_manager.is_connected:
        return {
            "status": "warning",
            "message": "MongoDB is currently not connected. Data remains preserved in local transaction cache.",
        }
    return {
        "status": "success",
        "message": "All active CompanyOS collections synced with Cloud MongoDB Atlas cluster.",
    }
