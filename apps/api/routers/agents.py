import uuid
from typing import Optional, Any, List

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from apps.api.database.session import get_db
from apps.api.models.agent import Agent
from apps.api.models.organization import Company
from apps.api.routers.ws import publish_event
from apps.api.schemas.agents import AgentCreate, AgentUpdate, AgentResponse

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("/", response_model=List[AgentResponse])
async def get_agents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Agent))
    return result.scalars().all()


@router.get("/{agent_id}", response_model=AgentResponse)
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


@router.post("/", response_model=AgentResponse)
async def create_agent(payload: AgentCreate, db: AsyncSession = Depends(get_db)):
    company_id = payload.company_id
    comp_res = await db.execute(select(Company).where(Company.id == company_id))
    comp = comp_res.scalar_one_or_none()
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")

    agent = Agent(
        company_id=payload.company_id,
        name=payload.name,
        role=payload.role,
        mission=payload.mission,
        department_id=payload.department_id,
        manager_id=payload.manager_id,
        system_prompt=payload.system_prompt,
        instructions=payload.instructions,
        model_id=payload.model_id,
        runtime_type=payload.runtime_type,
        autonomy_level=payload.autonomy_level,
        token_budget=payload.token_budget,
        cost_budget=payload.cost_budget,
        icon=payload.icon,
        display_name=payload.display_name,
        is_active=payload.is_active,
        config=payload.config,
    )
    db.add(agent)
    await db.commit()
    await db.refresh(agent)

    await publish_event(
        "AgentCreated",
        {"id": str(agent.id), "name": agent.name, "role": agent.role, "status": agent.status if hasattr(agent, 'status') else "IDLE"},
    )
    return agent


@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str, payload: AgentUpdate, db: AsyncSession = Depends(get_db)
):
    try:
        a_uuid = uuid.UUID(agent_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid agent ID format")
    result = await db.execute(select(Agent).where(Agent.id == a_uuid))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(agent, key, value)

    await db.commit()
    await db.refresh(agent)

    await publish_event(
        "AgentUpdated",
        {
            "id": str(agent.id),
            "name": agent.name,
            "role": agent.role,
            "status": agent.status if hasattr(agent, 'status') else "IDLE",
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


@router.post("/{agent_id}/status", response_model=AgentResponse)
async def set_agent_status(
    agent_id: str, status: str = Body(..., embed=True), db: AsyncSession = Depends(get_db)
):
    try:
        a_uuid = uuid.UUID(agent_id)
        result = await db.execute(select(Agent).where(Agent.id == a_uuid))
        agent = result.scalar_one_or_none()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        if hasattr(agent, 'status'):
            agent.status = status
            await db.commit()
            await db.refresh(agent)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        pass

    await publish_event("AgentStatusChanged", {"agent": agent_id, "status": status})
    return agent
