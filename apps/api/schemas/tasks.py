from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class TaskBase(BaseModel):
    title: str
    description: str | None = None
    priority: int = 5
    department_id: UUID | None = None
    parent_task_id: UUID | None = None
    expected_outcome: str | None = None
    acceptance_criteria: str | None = None
    max_retries: int = 3
    deadline: datetime | None = None

class TaskCreate(TaskBase):
    company_id: UUID
    assignee_id: UUID
    creator_agent_id: UUID | None = None

class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: int | None = None
    status: str | None = None
    result: str | None = None
    assignee_id: UUID | None = None
    expected_outcome: str | None = None
    acceptance_criteria: str | None = None
    deadline: datetime | None = None

class TaskResponse(TaskBase):
    id: UUID
    company_id: UUID
    assignee_id: UUID
    creator_agent_id: UUID | None = None
    status: str
    result: str | None = None
    retry_count: int
    token_usage: int | None = None
    cost: float | None = None
    error: str | None = None
    correlation_id: UUID | None = None
    created_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None
    updated_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)
