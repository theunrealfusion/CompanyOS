from packages.domain.decision import Decision
from packages.domain.friction import Friction
from infrastructure.mongodb.client import get_database
import uuid
from packages.events.publisher import publish_event
from packages.events.envelope import EventEnvelope

class DecisionEngine:
    async def evaluate_friction(self, friction: Friction) -> Decision:
        db = get_database()
        # Simulated logic: picks highest confidence proposal
        best_proposal = None
        highest_conf = -1.0
        for p in friction.proposals:
            for c in p.claims:
                if c.confidence > highest_conf:
                    highest_conf = c.confidence
                    best_proposal = p
                    
        dec = Decision(
            id=f"dec_{uuid.uuid4().hex[:8]}",
            organization_id=friction.organization_id,
            friction_id=friction.id,
            description="Evaluated from proposals",
            chosen_proposal_id=best_proposal.id if best_proposal else None,
            decision_score=highest_conf,
            required_authority=80, # Hardcoded for now
            status="pending_approval"
        )
        await db.decisions.insert_one(dec.model_dump())
        
        await publish_event(EventEnvelope(
            event_id=str(uuid.uuid4()),
            event_type="decision.proposed",
            organization_id=friction.organization_id,
            actor_id="decision_engine",
            correlation_id=friction.id,
            payload=dec.model_dump()
        ))
        return dec
