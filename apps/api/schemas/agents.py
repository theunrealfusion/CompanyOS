from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AgentVersionBase(BaseModel):
    system_prompt: str | None = None
    instructions: str | None = None
    model_id: str | None = None
    runtime_type: str | None = None
    autonomy_level: int | None = None
    config_snapshot: dict[str, Any] = Field(default_factory=dict)
    status: str = "DRAFT"

class AgentVersionCreate(AgentVersionBase):
    pass

class AgentVersionResponse(AgentVersionBase):
    id: UUID
    agent_id: UUID
    version: int
    created_at: datetime
    published_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class AgentBase(BaseModel):
    name: str
    role: str
    mission: str | None = None
    department_id: UUID | None = None
    manager_id: UUID | None = None
    system_prompt: str | None = None
    instructions: str | None = None
    model_id: str | None = None
    runtime_type: str = "native"
    autonomy_level: int = 3
    token_budget: int | None = None
    cost_budget: float | None = None
    icon: str | None = None
    display_name: str | None = None
    is_active: bool = True
    config: dict[str, Any] = Field(default_factory=dict)

class AgentCreate(AgentBase):
    company_id: UUID

class AgentUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    mission: str | None = None
    department_id: UUID | None = None
    manager_id: UUID | None = None
    system_prompt: str | None = None
    instructions: str | None = None
    model_id: str | None = None
    runtime_type: str | None = None
    autonomy_level: int | None = None
    token_budget: int | None = None
    cost_budget: float | None = None
    icon: str | None = None
    display_name: str | None = None
    is_active: bool | None = None
    config: dict[str, Any] | None = None

class AgentResponse(AgentBase):
    id: UUID
    company_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)
