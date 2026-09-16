from typing import Optional, Any, Dict, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    goal_type: str
    target: Optional[str] = None
    parent_goal_id: Optional[UUID] = None
    owner_agent_id: Optional[UUID] = None
    deadline: Optional[datetime] = None

class GoalCreate(GoalBase):
    company_id: UUID

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    target: Optional[str] = None
    progress: Optional[float] = None
    confidence: Optional[float] = None
    metrics: Optional[Dict[str, Any]] = None
    deadline: Optional[datetime] = None
    owner_agent_id: Optional[UUID] = None
    parent_goal_id: Optional[UUID] = None

class GoalResponse(GoalBase):
    id: UUID
    company_id: UUID
    status: str
    progress: float
    confidence: float
    metrics: Dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
