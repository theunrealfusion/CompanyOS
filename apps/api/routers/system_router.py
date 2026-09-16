import logging
import os
from typing import Any

from fastapi import APIRouter, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from apps.api.database.session import get_db
from apps.api.models.organization import Company
from apps.api.routers.ws import publish_event

logger = logging.getLogger("companyos.system")
router = APIRouter(prefix="/system", tags=["system"])


@router.get("/setup-status")
async def get_setup_status(db: AsyncSession = Depends(get_db)):
    """
    Evaluates system readiness and required onboarding steps.
    All core models and memory are persisted directly in PostgreSQL + pgvector.
    """
    postgres_connected = True
    company = None
    settings = {}

    # Fetch company settings from PostgreSQL
    try:
        comp_res = await db.execute(select(Company))
        company = comp_res.scalars().first()
        settings = company.settings if (company and company.settings) else {}
    except Exception as e:
        logger.warning(f"Could not read company from PostgreSQL database: {e}")
        postgres_connected = False

    # Check LLM Key configuration
    nvidia_key = (
        settings.get("nvidia_api_key", "").strip() or os.getenv("NVIDIA_API_KEY", "").strip()
    )
    gemini_key = (
        settings.get("gemini_api_key", "").strip() or os.getenv("GEMINI_API_KEY", "").strip()
    )
    openai_key = (
        settings.get("openai_api_key", "").strip() or os.getenv("OPENAI_API_KEY", "").strip()
    )
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

    missing_requirements = []
    if not postgres_connected:
        missing_requirements.append(
            {
                "code": "POSTGRES_SETUP_REQUIRED",
                "title": "PostgreSQL Database Connection Required",
                "description": "PostgreSQL is required to store company agents, tasks, and embeddings.",
                "action_label": "Start PostgreSQL",
                "target": "database",
            }
        )

    is_setup_complete = len(missing_requirements) == 0

    return {
        "is_setup_complete": is_setup_complete,
        "company_id": str(company.id) if company else None,
        "company_name": company.name if company else "CompanyOS Labs",
        "missing_requirements": missing_requirements,
        "database": {
            "type": "PostgreSQL + pgvector",
            "is_connected": postgres_connected,
        },
        "llm": {
            "has_key": len(configured_providers) > 0,
            "configured_providers": configured_providers,
            "default_model": settings.get("default_model", "nvidia/nemotron-3-ultra-550b-a55b"),
            "nvidia_nim_endpoint": nim_endpoint,
        },
    }


@router.post("/quick-setup")
async def complete_quick_setup(
    payload: dict[str, Any] = Body(...), db: AsyncSession = Depends(get_db)
):
    """
    Saves initial API keys and configuration directly to PostgreSQL.
    """
    nvidia_api_key = payload.get("nvidia_api_key", "").strip()
    nvidia_nim_endpoint = payload.get("nvidia_nim_endpoint", "").strip()

    # 1. Persist to Company in PostgreSQL
    comp_res = await db.execute(select(Company))
    company = comp_res.scalars().first()
    if not company:
        company = Company(
            name="CompanyOS Labs",
            mission="Build and scale autonomous AI software companies",
            settings={},
        )
        db.add(company)
        await db.commit()
        await db.refresh(company)

    curr_settings = dict(company.settings or {})
    if nvidia_api_key:
        curr_settings["nvidia_api_key"] = nvidia_api_key
    if nvidia_nim_endpoint:
        curr_settings["nvidia_nim_endpoint"] = nvidia_nim_endpoint

    company.settings = curr_settings
    await db.commit()
    await db.refresh(company)

    # 2. Publish setup complete event over WebSocket
    await publish_event(
        "SetupCompleted",
        {
            "database_connected": True,
            "company_id": str(company.id),
        },
    )

    return {
        "status": "success",
        "message": "System setup successfully updated and saved to PostgreSQL!",
        "company_id": str(company.id),
    }
