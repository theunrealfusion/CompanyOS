from typing import Optional, Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class AgentVersionBase(BaseModel):
    system_prompt: Optional[str] = None
    instructions: Optional[str] = None
    model_id: Optional[str] = None
    runtime_type: Optional[str] = None
    autonomy_level: Optional[int] = None
    config_snapshot: Dict[str, Any] = Field(default_factory=dict)
    status: str = "DRAFT"

class AgentVersionCreate(AgentVersionBase):
    pass

class AgentVersionResponse(AgentVersionBase):
    id: UUID
    agent_id: UUID
    version: int
    created_at: datetime
    published_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class AgentBase(BaseModel):
    name: str
    role: str
    mission: Optional[str] = None
    department_id: Optional[UUID] = None
    manager_id: Optional[UUID] = None
    system_prompt: Optional[str] = None
    instructions: Optional[str] = None
    model_id: Optional[str] = None
    runtime_type: str = "native"
    autonomy_level: int = 3
    token_budget: Optional[int] = None
    cost_budget: Optional[float] = None
    icon: Optional[str] = None
    display_name: Optional[str] = None
    is_active: bool = True
    config: Dict[str, Any] = Field(default_factory=dict)

class AgentCreate(AgentBase):
    company_id: UUID

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    mission: Optional[str] = None
    department_id: Optional[UUID] = None
    manager_id: Optional[UUID] = None
    system_prompt: Optional[str] = None
    instructions: Optional[str] = None
    model_id: Optional[str] = None
    runtime_type: Optional[str] = None
    autonomy_level: Optional[int] = None
    token_budget: Optional[int] = None
    cost_budget: Optional[float] = None
    icon: Optional[str] = None
    display_name: Optional[str] = None
    is_active: Optional[bool] = None
    config: Optional[Dict[str, Any]] = None

class AgentResponse(AgentBase):
    id: UUID
    company_id: UUID
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
