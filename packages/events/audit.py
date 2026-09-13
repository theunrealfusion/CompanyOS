from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional, Any
from packages.events.publisher import publish_event
from packages.events.envelope import EventEnvelope
import uuid

class AuditRecord(BaseModel):
    actor: str
    action: str
    reason: str
    evidence: List[str] = []
    policy: str
    model: Optional[str] = None
    timestamp: datetime

async def log_audit(org_id: str, record: AuditRecord):
    env = EventEnvelope(
        event_id=str(uuid.uuid4()),
        event_type="audit.logged",
        organization_id=org_id,
        actor_id=record.actor,
        correlation_id=str(uuid.uuid4()),
        payload=record.model_dump()
    )
    await publish_event(env)
