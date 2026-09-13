from fastapi import APIRouter, Depends
from infrastructure.mongodb.client import get_database

router = APIRouter(prefix="/api/v1/graph", tags=["graph"])

@router.get("/{org_id}")
async def get_org_graph(org_id: str):
    db = get_database()
    
    agents = await db.agents.find({"organization_id": org_id}).to_list(100)
    frictions = await db.frictions.find({"organization_id": org_id}).to_list(100)
    decisions = await db.decisions.find({"organization_id": org_id}).to_list(100)
    tasks = await db.tasks.find({"organization_id": org_id}).to_list(100)
    
    # Strip ObjectId for JSON serialization
    for doc in agents + frictions + decisions + tasks:
        if "_id" in doc:
            del doc["_id"]

    return {
        "nodes": {
            "agents": agents,
            "frictions": frictions,
            "decisions": decisions,
            "tasks": tasks
        }
    }
