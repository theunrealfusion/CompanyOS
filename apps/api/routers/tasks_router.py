import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from infrastructure.mongodb.client import get_database

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])

class CreateTaskPayload(BaseModel):
    organization_id: str = "acme_ai_labs"
    executor: str
    description: str
    priority: str = "medium"
    risk: str = "low"
    expected_outcome: Optional[str] = None

class UpdateTaskStatusPayload(BaseModel):
    status: str

@router.get("/{org_id}")
async def list_tasks(org_id: str):
    db = get_database()
    tasks = await db.tasks.find({"organization_id": org_id}).sort("created_at", -1).to_list(100)
    for t in tasks:
        if "_id" in t:
            del t["_id"]
    return tasks

@router.post("")
async def create_task(payload: CreateTaskPayload):
    db = get_database()
    task_id = f"task_{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat()
    
    task_doc = {
        "id": task_id,
        "organization_id": payload.organization_id,
        "project_id": "proj_general",
        "description": payload.description,
        "owner": "human_admin",
        "executor": payload.executor,
        "priority": payload.priority,
        "risk": payload.risk,
        "status": "in_progress",
        "expected_outcome": payload.expected_outcome or payload.description,
        "created_at": now,
        "updated_at": now
    }
    
    await db.tasks.insert_one(task_doc)
    
    # Update the agent's current task & status to working
    await db.agents.update_one(
        {"id": payload.executor},
        {"$set": {
            "current_task": payload.description,
            "status": "working",
            "last_task_id": task_id
        }}
    )
    
    if "_id" in task_doc:
        del task_doc["_id"]
        
    return task_doc

@router.patch("/{task_id}/status")
async def update_task_status(task_id: str, payload: UpdateTaskStatusPayload):
    db = get_database()
    now = datetime.utcnow().isoformat()
    
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    await db.tasks.update_one(
        {"id": task_id},
        {"$set": {"status": payload.status, "updated_at": now}}
    )
    
    # If completed or cancelled, set agent back to active/idle
    if payload.status in ["completed", "failed", "cancelled"]:
        executor = task.get("executor")
        if executor:
            await db.agents.update_one(
                {"id": executor, "last_task_id": task_id},
                {"$set": {"current_task": None, "status": "active"}}
            )
            
    return {"id": task_id, "status": payload.status}
