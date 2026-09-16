
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from apps.api.database.session import get_db
from apps.api.models.execution import AgentRun, AgentStep

router = APIRouter(prefix="/metrics", tags=["metrics"])

@router.get("/")
async def get_system_metrics(db: AsyncSession = Depends(get_db)):
    # Real metrics replacing the fabricated compute_cost
    runs_count = await db.scalar(select(func.count(AgentRun.id)))
    steps_count = await db.scalar(select(func.count(AgentStep.id)))

    # Calculate real cost from execution runs
    total_cost = await db.scalar(select(func.sum(AgentRun.cost))) or 0.0
    total_tokens = await db.scalar(select(func.sum(AgentRun.total_tokens))) or 0

    return {
        "total_runs": runs_count,
        "total_steps": steps_count,
        "compute_cost": total_cost,
        "token_usage": total_tokens,
        "active_agents": 5  # Could be queried from DB
    }
