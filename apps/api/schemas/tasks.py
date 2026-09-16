from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: int = 5
    department_id: Optional[UUID] = None
    parent_task_id: Optional[UUID] = None
    expected_outcome: Optional[str] = None
    acceptance_criteria: Optional[str] = None
    max_retries: int = 3
    deadline: Optional[datetime] = None

class TaskCreate(TaskBase):
    company_id: UUID
    assignee_id: UUID
    creator_agent_id: Optional[UUID] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None
    status: Optional[str] = None
    result: Optional[str] = None
    assignee_id: Optional[UUID] = None
    expected_outcome: Optional[str] = None
    acceptance_criteria: Optional[str] = None
    deadline: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: UUID
    company_id: UUID
    assignee_id: UUID
    creator_agent_id: Optional[UUID] = None
    status: str
    result: Optional[str] = None
    retry_count: int
    token_usage: Optional[int] = None
    cost: Optional[float] = None
    error: Optional[str] = None
    correlation_id: Optional[UUID] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
