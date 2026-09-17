from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from apps.api.models.goal import Goal
from apps.api.schemas.goals import GoalCreate


class GoalService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_goal(self, data: GoalCreate) -> Goal:
        goal = Goal(**data.model_dump())
        self.db.add(goal)
        await self.db.commit()
        await self.db.refresh(goal)
        return goal

    async def get_goal(self, goal_id: UUID) -> Goal | None:
        result = await self.db.execute(select(Goal).where(Goal.id == goal_id))
        return result.scalars().first()
