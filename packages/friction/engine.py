from packages.domain.friction import Friction, Proposal, Claim
from infrastructure.mongodb.client import get_database
import uuid
from datetime import datetime
from packages.events.publisher import publish_event
from packages.events.envelope import EventEnvelope

class FrictionEngine:
    async def create_friction(self, org_id: str, subject: str, conflict_type: str, participants: list[str]) -> Friction:
        db = get_database()
        fric = Friction(
            id=f"fric_{uuid.uuid4().hex[:8]}",
            organization_id=org_id,
            subject=subject,
            conflict_type=conflict_type,
            participants=participants
        )
        await db.frictions.insert_one(fric.model_dump())
        
        await publish_event(EventEnvelope(
            event_id=str(uuid.uuid4()),
            event_type="friction.created",
            organization_id=org_id,
            actor_id="system",
            correlation_id=fric.id,
            payload=fric.model_dump()
        ))
        return fric

    async def add_proposal(self, friction_id: str, proposal: Proposal):
        db = get_database()
        await db.frictions.update_one(
            {"id": friction_id},
            {"$push": {"proposals": proposal.model_dump()}, "$set": {"updated_at": datetime.utcnow()}}
        )
