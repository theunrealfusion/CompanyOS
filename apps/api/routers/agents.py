import uuid
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from apps.api.database.session import get_db
from apps.api.models.agent import Agent
from apps.api.models.organization import Company
from apps.api.routers.ws import publish_event

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("/")
async def get_agents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Agent))
    return result.scalars().all()


@router.get("/{agent_id}")
async def get_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    try:
        a_uuid = uuid.UUID(agent_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid agent ID format")
    result = await db.execute(select(Agent).where(Agent.id == a_uuid))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("/")
async def create_agent(payload: dict[str, Any] = Body(...), db: AsyncSession = Depends(get_db)):
    company_id = payload.get("company_id")
    if not company_id:
        # Pick the first company as default
        comp_res = await db.execute(select(Company))
        comp = comp_res.scalars().first()
        if not comp:
            raise HTTPException(status_code=400, detail="No company found. Create a company first.")
        company_id = comp.id
    else:
        company_id = uuid.UUID(company_id)

    manager_id = None
    if payload.get("manager_id"):
        try:
            manager_id = uuid.UUID(payload["manager_id"])
        except ValueError:
            pass

    agent = Agent(
        company_id=company_id,
        name=payload.get("name", "New Agent"),
        role=payload.get("role", "Specialist"),
        mission=payload.get("mission", ""),
        status=payload.get("status", "IDLE"),
        manager_id=manager_id,
        config=payload.get(
            "config",
            {
                "model": payload.get("model", "Gemini 1.5 Pro"),
                "runtime": payload.get("runtime", "CompanyOS Native"),
                "permission_level": payload.get("permission_level", "L3 Execute"),
                "cost_per_hour": payload.get("cost_per_hour", "₹50.00"),
                "department": payload.get("department", "Operations"),
                "icon": payload.get("icon", "strategy"),
                "metrics": payload.get("metrics", {"efficiency": 90, "tasks": 0}),
            },
        ),
    )
    db.add(agent)
    await db.commit()
    await db.refresh(agent)

    await publish_event(
        "AgentCreated",
        {"id": str(agent.id), "name": agent.name, "role": agent.role, "status": agent.status},
    )
    return agent


@router.put("/{agent_id}")
async def update_agent(
    agent_id: str, payload: dict[str, Any] = Body(...), db: AsyncSession = Depends(get_db)
):
    try:
        a_uuid = uuid.UUID(agent_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid agent ID format")
    result = await db.execute(select(Agent).where(Agent.id == a_uuid))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if "name" in payload:
        agent.name = payload["name"]
    if "role" in payload:
        agent.role = payload["role"]
    if "mission" in payload:
        agent.mission = payload["mission"]
    if "status" in payload:
        agent.status = payload["status"]
    if "manager_id" in payload:
        agent.manager_id = uuid.UUID(payload["manager_id"]) if payload["manager_id"] else None
    if "config" in payload:
        cfg = dict(agent.config or {})
        cfg.update(payload["config"])
        agent.config = cfg

    await db.commit()
    await db.refresh(agent)

    await publish_event(
        "AgentUpdated",
        {
            "id": str(agent.id),
            "name": agent.name,
            "role": agent.role,
            "status": agent.status,
            "config": agent.config,
        },
    )
    return agent


@router.delete("/{agent_id}")
async def delete_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    try:
        a_uuid = uuid.UUID(agent_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid agent ID format")
    result = await db.execute(select(Agent).where(Agent.id == a_uuid))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    await db.delete(agent)
    await db.commit()

    await publish_event("AgentDeleted", {"id": agent_id})
    return {"status": "success", "deleted_id": agent_id}


@router.post("/{agent_id}/status")
async def set_agent_status(
    agent_id: str, status: str = Body(..., embed=True), db: AsyncSession = Depends(get_db)
):
    try:
        a_uuid = uuid.UUID(agent_id)
        result = await db.execute(select(Agent).where(Agent.id == a_uuid))
        agent = result.scalar_one_or_none()
        if agent:
            agent.status = status
            await db.commit()
    except Exception:
        pass

    await publish_event("AgentStatusChanged", {"agent": agent_id, "status": status})
    return {"status": "updated", "agent": agent_id, "new_status": status}
