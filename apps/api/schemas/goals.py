from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class GoalBase(BaseModel):
    title: str
    description: str | None = None
    goal_type: str
    target: str | None = None
    parent_goal_id: UUID | None = None
    owner_agent_id: UUID | None = None
    deadline: datetime | None = None

class GoalCreate(GoalBase):
    company_id: UUID

class GoalUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    target: str | None = None
    progress: float | None = None
    confidence: float | None = None
    metrics: dict[str, Any] | None = None
    deadline: datetime | None = None
    owner_agent_id: UUID | None = None
    parent_goal_id: UUID | None = None

class GoalResponse(GoalBase):
    id: UUID
    company_id: UUID
    status: str
    progress: float
    confidence: float
    metrics: dict[str, Any]
    created_at: datetime
    updated_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)
