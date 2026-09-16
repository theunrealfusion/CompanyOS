import uuid
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from apps.api.database.session import get_db
from apps.api.models.execution import AgentRun
from apps.api.schemas.runs import AgentRunResponse

router = APIRouter(prefix="/runs", tags=["runs"])


@router.get("/", response_model=List[AgentRunResponse])
async def get_runs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AgentRun))
    return result.scalars().all()


@router.get("/{run_id}", response_model=AgentRunResponse)
async def get_run(run_id: str, db: AsyncSession = Depends(get_db)):
    try:
        r_uuid = uuid.UUID(run_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid run ID format")
    result = await db.execute(select(AgentRun).where(AgentRun.id == r_uuid))
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@router.delete("/{run_id}")
async def delete_run(run_id: str, db: AsyncSession = Depends(get_db)):
    try:
        r_uuid = uuid.UUID(run_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid run ID format")
    result = await db.execute(select(AgentRun).where(AgentRun.id == r_uuid))
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    await db.delete(run)
    await db.commit()
    return {"status": "success", "deleted_id": run_id}
