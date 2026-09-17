from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ModelProviderBase(BaseModel):
    name: str
    provider_type: str
    base_url: str | None = None
    is_active: bool = True
    config: dict[str, Any] = Field(default_factory=dict)
    priority: int = 0

class ModelProviderCreate(ModelProviderBase):
    company_id: UUID

class ModelProviderUpdate(BaseModel):
    name: str | None = None
    provider_type: str | None = None
    base_url: str | None = None
    is_active: bool | None = None
    config: dict[str, Any] | None = None
    priority: int | None = None

class ModelProviderResponse(ModelProviderBase):
    id: UUID
    company_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ModelPolicyBase(BaseModel):
    name: str
    description: str | None = None
    reasoning_model_id: str | None = None
    execution_model_id: str | None = None
    fast_model_id: str | None = None
    vision_model_id: str | None = None
    embedding_model_id: str | None = None
    fallback_model_id: str | None = None

class ModelPolicyCreate(ModelPolicyBase):
    company_id: UUID

class ModelPolicyUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    reasoning_model_id: str | None = None
    execution_model_id: str | None = None
    fast_model_id: str | None = None
    vision_model_id: str | None = None
    embedding_model_id: str | None = None
    fallback_model_id: str | None = None

class ModelPolicyResponse(ModelPolicyBase):
    id: UUID
    company_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
