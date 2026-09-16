import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from apps.api.models.agent import Task
from apps.api.schemas.tasks import TaskCreate
from apps.api.services.temporal_client import TemporalService
from apps.api.workflows.models import AgentWorkflowInput

class TaskService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_task(self, data: TaskCreate) -> Task:
        task = Task(**data.model_dump())
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def dispatch_task(self, task_id: uuid.UUID) -> str:
        task = await self.db.scalar(select(Task).where(Task.id == task_id))
        if not task:
            raise ValueError("Task not found")

        run_id = str(uuid.uuid4())
        
        input_data = AgentWorkflowInput(
            run_id=run_id,
            agent_id=str(task.assignee_id),
            task_id=str(task.id),
            input_text=task.title + " " + (task.description or "")
        )

        client = await TemporalService.get_client()
        handle = await client.start_workflow(
            "AgentWorkflow",
            input_data,
            id=f"agent-run-{run_id}",
            task_queue="companyos-tasks"
        )
        
        return run_id
