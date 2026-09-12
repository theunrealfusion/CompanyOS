from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any, Optional
import uuid

from apps.api.database.session import get_db
from apps.api.models.organization import Company
import asyncio
from apps.api.routers.ws import publish_event

router = APIRouter(prefix="/companies", tags=["companies"])

DEFAULT_SETTINGS = {
    # Model Router Settings
    "gemini_api_key": "",
    "openai_api_key": "",
    "anthropic_api_key": "",
    "nvidia_nim_endpoint": "http://localhost:8000/v1",
    "ollama_vllm_url": "http://localhost:11434",
    "default_model": "gemini-1.5-pro",
    "fallback_model": "gpt-4o-mini",
    "temperature": 0.2,
    "max_tokens": 4096,
    # Telegram Message Gateway Settings
    "telegram_bot_token": "",
    "telegram_allowed_users": "@founder, @ceo",
    "telegram_mode": "polling", # polling | webhook
    "telegram_topic_routing": True,
    # Economics & Governance
    "currency": "INR (₹)",
    "monthly_budget_cap": "500000",
    "human_approval_threshold": "5000",
    "emergency_spend_limit": "25000",
    "autonomous_mode": "SUPERVISED", # HUMAN_LED, AI_ASSISTED, SUPERVISED, BOUNDED, FULL_AUTONOMOUS
}

@router.get("/")
async def get_companies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Company))
    return result.scalars().all()

@router.post("/")
async def create_company(name: str, mission: str = "", db: AsyncSession = Depends(get_db)):
    company = Company(name=name, mission=mission, settings=DEFAULT_SETTINGS, org_hierarchy={})
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company

@router.get("/{company_id}")
async def get_company(company_id: str, db: AsyncSession = Depends(get_db)):
    try:
        c_uuid = uuid.UUID(company_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid company ID format")
    result = await db.execute(select(Company).where(Company.id == c_uuid))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.get("/{company_id}/settings")
async def get_company_settings(company_id: str, db: AsyncSession = Depends(get_db)):
    try:
        c_uuid = uuid.UUID(company_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid company ID format")
    result = await db.execute(select(Company).where(Company.id == c_uuid))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    settings = dict(DEFAULT_SETTINGS)
    if company.settings:
        settings.update(company.settings)
    return settings

@router.put("/{company_id}/settings")
async def update_company_settings(company_id: str, payload: Dict[str, Any] = Body(...), db: AsyncSession = Depends(get_db)):
    try:
        c_uuid = uuid.UUID(company_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid company ID format")
    result = await db.execute(select(Company).where(Company.id == c_uuid))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    current_settings = dict(company.settings or DEFAULT_SETTINGS)
    current_settings.update(payload)
    company.settings = current_settings
    
    # Also update company name or mission if provided
    if "company_name" in payload and payload["company_name"]:
        company.name = payload["company_name"]
    if "company_mission" in payload and payload["company_mission"]:
        company.mission = payload["company_mission"]

    await db.commit()
    await db.refresh(company)

    await publish_event("SettingsUpdated", {"company_id": company_id, "settings": current_settings})
    return {"status": "success", "settings": current_settings}

@router.get("/{company_id}/hierarchy")
async def get_company_hierarchy(company_id: str, db: AsyncSession = Depends(get_db)):
    try:
        c_uuid = uuid.UUID(company_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid company ID format")
    result = await db.execute(select(Company).where(Company.id == c_uuid))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company.org_hierarchy or {}

@router.put("/{company_id}/hierarchy")
async def update_company_hierarchy(company_id: str, payload: Dict[str, Any] = Body(...), db: AsyncSession = Depends(get_db)):
    try:
        c_uuid = uuid.UUID(company_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid company ID format")
    result = await db.execute(select(Company).where(Company.id == c_uuid))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    company.org_hierarchy = payload
    await db.commit()
    await db.refresh(company)

    await publish_event("OrgHierarchyUpdated", {"company_id": company_id, "nodes_count": len(payload.get("nodes", []))})
    return {"status": "success", "hierarchy": company.org_hierarchy}

@router.post("/{company_id}/simulate")
async def simulate_company(company_id: str):
    async def run_simulation():
        events = [
            {"type": "AgentStatusChanged", "payload": {"agent": "ceo", "status": "WORKING", "task": "Reviewing strategy"}},
            {"type": "AgentStatusChanged", "payload": {"agent": "strategy", "status": "WORKING", "task": "Researching market"}},
            {"type": "TaskCreated", "payload": {"from": "ceo", "to": "strategy", "task": "Find profitable AI business"}},
        ]
        for event in events:
            await asyncio.sleep(2)
            await publish_event(event["type"], event["payload"])
            
        await asyncio.sleep(3)
        await publish_event("AgentStatusChanged", {"agent": "product", "status": "WORKING", "task": "Writing PRD"})
        await publish_event("AgentStatusChanged", {"agent": "strategy", "status": "IDLE", "task": None})
        
        await asyncio.sleep(4)
        await publish_event("AgentStatusChanged", {"agent": "engineering", "status": "WORKING", "task": "Implementing features"})
        await publish_event("AgentStatusChanged", {"agent": "product", "status": "IDLE", "task": None})
        
        await asyncio.sleep(4)
        await publish_event("AgentStatusChanged", {"agent": "revenue", "status": "WORKING", "task": "Recording sales"})
        await publish_event("AgentStatusChanged", {"agent": "engineering", "status": "IDLE", "task": None})
        
    asyncio.create_task(run_simulation())
    return {"status": "started", "company_id": company_id}
