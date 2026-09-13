from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from infrastructure.mongodb.client import get_database

router = APIRouter(prefix="/api/v1/agents", tags=["agents"])

class AgentStatusUpdate(BaseModel):
    status: str

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    mission: Optional[str] = None
    model_provider: Optional[str] = None
    model: Optional[str] = None
    authority: Optional[int] = None
    status: Optional[str] = None
    system_instructions: Optional[str] = None

@router.get("/{org_id}")
async def list_agents(org_id: str):
    db = get_database()
    agents = await db.agents.find({"organization_id": org_id}).to_list(100)
    for doc in agents:
        if "_id" in doc:
            del doc["_id"]
    return agents

@router.patch("/{agent_id}/status")
async def update_agent_status(agent_id: str, payload: AgentStatusUpdate):
    db = get_database()
    result = await db.agents.update_one(
        {"id": agent_id},
        {"$set": {"status": payload.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"id": agent_id, "status": payload.status}

@router.put("/{agent_id}")
async def update_agent(agent_id: str, payload: AgentUpdate):
    db = get_database()
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        return {"message": "No changes"}
    result = await db.agents.update_one(
        {"id": agent_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"id": agent_id, "updated": update_data}
