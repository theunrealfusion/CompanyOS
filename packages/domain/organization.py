from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Any, Optional

class Organization(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    settings: Dict[str, Any] = Field(default_factory=dict)
    policies: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
