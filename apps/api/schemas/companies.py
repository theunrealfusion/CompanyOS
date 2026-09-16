from typing import Optional, Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class CompanyBase(BaseModel):
    name: str
    mission: Optional[str] = None
    settings: Dict[str, Any] = Field(default_factory=dict)
    org_hierarchy: Dict[str, Any] = Field(default_factory=dict)

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    mission: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    org_hierarchy: Optional[Dict[str, Any]] = None

class CompanyResponse(CompanyBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DepartmentBase(BaseModel):
    name: str
    mission: Optional[str] = None
    parent_department_id: Optional[UUID] = None
    head_agent_id: Optional[UUID] = None

class DepartmentCreate(DepartmentBase):
    company_id: UUID

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    mission: Optional[str] = None
    parent_department_id: Optional[UUID] = None
    head_agent_id: Optional[UUID] = None

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
