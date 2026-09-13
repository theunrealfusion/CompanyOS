from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Any, Optional

class EventEnvelope(BaseModel):
    event_id: str
    event_type: str
    organization_id: str
    actor_id: str
    correlation_id: str
    causation_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    schema_version: int = 1
    payload: Dict[str, Any]
