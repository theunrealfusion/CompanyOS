import os
import logging
import uuid
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Body, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from apps.api.database.session import get_db
from apps.api.database.mongodb import mongo_manager
from apps.api.models.organization import Company
from apps.api.routers.ws import publish_event

logger = logging.getLogger("companyos.system")
router = APIRouter(prefix="/system", tags=["system"])

@router.get("/setup-status")
async def get_setup_status(db: AsyncSession = Depends(get_db)):
    """
    Evaluates system readiness and required onboarding steps.
    MongoDB setup is required before autonomous company cycles can run.
    """
    # Fetch company settings from PostgreSQL
    try:
        comp_res = await db.execute(select(Company))
        company = comp_res.scalars().first()
        settings = company.settings if (company and company.settings) else {}
    except Exception as e:
        logger.warning(f"Could not read company from PostgreSQL database: {e}")
        company = None
        settings = {}

    # If MongoDB is not connected yet, but settings has a saved mongodb_uri, auto-connect
    if not mongo_manager.is_connected:
        saved_uri = settings.get("mongodb_uri", "").strip() or os.getenv("MONGODB_URI", "").strip()
        if saved_uri:
            try:
                await mongo_manager.connect(saved_uri)
            except Exception as e:
                logger.warning(f"Auto-connect to saved MongoDB URI failed: {e}")

    # Real MongoDB status
    mongo_status = await mongo_manager.ping()

    # Check LLM Key configuration
    nvidia_key = settings.get("nvidia_api_key", "").strip() or os.getenv("NVIDIA_API_KEY", "").strip()
    gemini_key = settings.get("gemini_api_key", "").strip() or os.getenv("GEMINI_API_KEY", "").strip()
    openai_key = settings.get("openai_api_key", "").strip() or os.getenv("OPENAI_API_KEY", "").strip()
    nim_endpoint = settings.get("nvidia_nim_endpoint", "").strip()
    if not nim_endpoint or "localhost:8000" in nim_endpoint:
        nim_endpoint = "https://integrate.api.nvidia.com/v1"

    configured_providers = []
    if nvidia_key:
        configured_providers.append("NVIDIA NIM (build.nvidia.com)")
    if gemini_key:
        configured_providers.append("Google Gemini")
    if openai_key:
        configured_providers.append("OpenAI")

    # Required setup check:
    # MongoDB connection is strictly required by founder directive
    missing_requirements = []
    if not mongo_status.get("is_connected", False):
        missing_requirements.append({
            "code": "MONGODB_SETUP_REQUIRED",
            "title": "Cloud MongoDB Atlas Connection Required",
            "description": "Cloud MongoDB Atlas is active by default. You must enter your Atlas connection string (URI) to persist multi-agent operations and audit logs.",
            "action_label": "Configure MongoDB Atlas",
            "target": "settings-mongodb"
        })

    is_setup_complete = len(missing_requirements) == 0

    return {
        "is_setup_complete": is_setup_complete,
        "company_id": str(company.id) if company else None,
        "company_name": company.name if company else "CompanyOS Labs",
        "missing_requirements": missing_requirements,
        "mongodb": {
            "required": True,
            "is_connected": mongo_status.get("is_connected", False),
            "status": mongo_status.get("status", "NOT_CONFIGURED"),
            "latency_ms": mongo_status.get("latency_ms"),
            "database": mongo_status.get("database"),
            "collections": mongo_status.get("collections", []),
            "error": mongo_status.get("error"),
        },
        "llm": {
            "has_key": len(configured_providers) > 0,
            "configured_providers": configured_providers,
            "default_model": settings.get("default_model", "nvidia/nemotron-3-ultra-550b-a55b"),
            "nvidia_nim_endpoint": nim_endpoint,
        }
    }


@router.post("/quick-setup")
async def complete_quick_setup(
    payload: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Directly completes setup from the onboarding gate modal.
    Validates and connects Cloud MongoDB Atlas, saves configuration to PostgreSQL.
    """
    mongodb_uri = payload.get("mongodb_uri", "").strip()
    nvidia_api_key = payload.get("nvidia_api_key", "").strip()
    nvidia_nim_endpoint = payload.get("nvidia_nim_endpoint", "").strip()

    if not mongodb_uri:
        raise HTTPException(
            status_code=400,
            detail="Cloud MongoDB Atlas connection string (URI) is required."
        )

    # 1. Test real connection to MongoDB
    success, msg = await mongo_manager.connect(custom_uri=mongodb_uri)
    mongo_status = await mongo_manager.ping()

    if not success or not mongo_status.get("is_connected", False):
        raise HTTPException(
            status_code=400,
            detail=f"Failed to connect to Cloud MongoDB cluster: {mongo_status.get('error') or msg}"
        )

    # 2. Persist to Company in PostgreSQL
    comp_res = await db.execute(select(Company))
    company = comp_res.scalars().first()
    if not company:
        company = Company(
            name="CompanyOS Labs",
            mission="Build and scale autonomous AI software companies",
            settings={}
        )
        db.add(company)
        await db.commit()
        await db.refresh(company)

    curr_settings = dict(company.settings or {})
    curr_settings["mongodb_uri"] = mongodb_uri
    if nvidia_api_key:
        curr_settings["nvidia_api_key"] = nvidia_api_key
    if nvidia_nim_endpoint:
        curr_settings["nvidia_nim_endpoint"] = nvidia_nim_endpoint

    company.settings = curr_settings
    await db.commit()
    await db.refresh(company)

    # 3. Publish setup complete event over WebSocket
    await publish_event("SetupCompleted", {
        "mongodb_connected": True,
        "latency_ms": mongo_status.get("latency_ms"),
        "collections": mongo_status.get("collections", []),
        "company_id": str(company.id)
    })

    return {
        "status": "success",
        "message": f"Cloud MongoDB successfully connected ({mongo_status.get('latency_ms')}ms) and verified!",
        "mongodb": mongo_status,
        "company_id": str(company.id)
    }
