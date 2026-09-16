from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CompanyBase(BaseModel):
    name: str
    mission: str | None = None
    settings: dict[str, Any] = Field(default_factory=dict)
    org_hierarchy: dict[str, Any] = Field(default_factory=dict)

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: str | None = None
    mission: str | None = None
    settings: dict[str, Any] | None = None
    org_hierarchy: dict[str, Any] | None = None

class CompanyResponse(CompanyBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DepartmentBase(BaseModel):
    name: str
    mission: str | None = None
    parent_department_id: UUID | None = None
    head_agent_id: UUID | None = None

class DepartmentCreate(DepartmentBase):
    company_id: UUID

class DepartmentUpdate(BaseModel):
    name: str | None = None
    mission: str | None = None
    parent_department_id: UUID | None = None
    head_agent_id: UUID | None = None

class DepartmentResponse(DepartmentBase):
    id: UUID
    company_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    email: str
    name: str
    is_active: bool = True
    is_founder: bool = False

class UserCreate(UserBase):
    company_id: UUID

class UserResponse(UserBase):
    id: UUID
    company_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
