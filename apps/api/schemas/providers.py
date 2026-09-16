from typing import Optional, Any, Dict, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class ModelProviderBase(BaseModel):
    name: str
    provider_type: str
    base_url: Optional[str] = None
    is_active: bool = True
    config: Dict[str, Any] = Field(default_factory=dict)
    priority: int = 0

class ModelProviderCreate(ModelProviderBase):
    company_id: UUID

class ModelProviderUpdate(BaseModel):
    name: Optional[str] = None
    provider_type: Optional[str] = None
    base_url: Optional[str] = None
    is_active: Optional[bool] = None
    config: Optional[Dict[str, Any]] = None
    priority: Optional[int] = None

class ModelProviderResponse(ModelProviderBase):
    id: UUID
    company_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ModelPolicyBase(BaseModel):
    name: str
    description: Optional[str] = None
    reasoning_model_id: Optional[str] = None
    execution_model_id: Optional[str] = None
    fast_model_id: Optional[str] = None
    vision_model_id: Optional[str] = None
    embedding_model_id: Optional[str] = None
    fallback_model_id: Optional[str] = None

class ModelPolicyCreate(ModelPolicyBase):
    company_id: UUID

class ModelPolicyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    reasoning_model_id: Optional[str] = None
    execution_model_id: Optional[str] = None
    fast_model_id: Optional[str] = None
    vision_model_id: Optional[str] = None
    embedding_model_id: Optional[str] = None
    fallback_model_id: Optional[str] = None

class ModelPolicyResponse(ModelPolicyBase):
    id: UUID
    company_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
