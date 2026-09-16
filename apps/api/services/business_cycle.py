import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from apps.api.models.agent import Agent
from apps.api.models.organization import Company
from apps.api.schemas.tasks import TaskCreate
from apps.api.services.task_service import TaskService

class BusinessCycleService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.task_service = TaskService(db)

    async def trigger_cycle(self, company_id: uuid.UUID, goal_directive: str):
        # Find the CEO
        result = await self.db.execute(
            select(Agent).where(Agent.company_id == company_id, Agent.role == "CEO")
        )
        ceo = result.scalars().first()
        if not ceo:
            raise ValueError("No CEO found for company")
            
        task = await self.task_service.create_task(TaskCreate(
            title="Execute Business Cycle",
            description=goal_directive,
            company_id=company_id,
            assignee_id=ceo.id
        ))
        run_id = await self.task_service.dispatch_task(task.id)
        return {"cycle_run_id": run_id, "ceo_task_id": str(task.id)}
