import uuid
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from apps.api.database.session import get_db
from apps.api.models.goal import Goal
from apps.api.schemas.goals import GoalCreate, GoalUpdate, GoalResponse

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("/", response_model=List[GoalResponse])
async def get_goals(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Goal))
    return result.scalars().all()


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(goal_id: str, db: AsyncSession = Depends(get_db)):
    try:
        g_uuid = uuid.UUID(goal_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid goal ID format")
    result = await db.execute(select(Goal).where(Goal.id == g_uuid))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.post("/", response_model=GoalResponse)
async def create_goal(payload: GoalCreate, db: AsyncSession = Depends(get_db)):
    goal = Goal(
        title=payload.title,
        description=payload.description,
        goal_type=payload.goal_type,
        target=payload.target,
        parent_goal_id=payload.parent_goal_id,
        owner_agent_id=payload.owner_agent_id,
        deadline=payload.deadline,
        company_id=payload.company_id,
        status="PENDING",
        progress=0.0,
        confidence=0.0,
        metrics={},
    )
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return goal


@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(goal_id: str, payload: GoalUpdate, db: AsyncSession = Depends(get_db)):
    try:
        g_uuid = uuid.UUID(goal_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid goal ID format")
    result = await db.execute(select(Goal).where(Goal.id == g_uuid))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(goal, key, value)

    await db.commit()
    await db.refresh(goal)
    return goal


@router.delete("/{goal_id}")
async def delete_goal(goal_id: str, db: AsyncSession = Depends(get_db)):
    try:
        g_uuid = uuid.UUID(goal_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid goal ID format")
    result = await db.execute(select(Goal).where(Goal.id == g_uuid))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    await db.delete(goal)
    await db.commit()
    return {"status": "success", "deleted_id": goal_id}
