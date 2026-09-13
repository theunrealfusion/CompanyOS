import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content.strip() + '\n')

# PHASE 3: EVENT FABRIC
write_file('packages/events/publisher.py', """
import json
from infrastructure.nats.client import connect_nats
from packages.events.envelope import EventEnvelope

async def publish_event(envelope: EventEnvelope):
    js = await connect_nats()
    subject = f"company.{envelope.organization_id}.{envelope.event_type}"
    payload = envelope.model_dump_json().encode()
    await js.publish(subject, payload)
""")

write_file('packages/events/audit.py', """
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
""")

# PHASE 4: AGENT RUNTIME
write_file('packages/providers/base.py', """
from typing import Protocol, Dict, Any

class ModelRequest:
    def __init__(self, prompt: str, system: str, kwargs: Dict[str, Any] = None):
        self.prompt = prompt
        self.system = system
        self.kwargs = kwargs or {}

class ModelResponse:
    def __init__(self, content: str, usage: Dict[str, Any] = None):
        self.content = content
        self.usage = usage or {}

class ModelProvider(Protocol):
    async def generate(self, request: ModelRequest) -> ModelResponse:
        ...
""")

write_file('packages/providers/nvidia_nim.py', """
from packages.providers.base import ModelProvider, ModelRequest, ModelResponse
import os
import httpx

class NvidiaNimProvider(ModelProvider):
    def __init__(self):
        self.api_key = os.getenv("NVIDIA_API_KEY", "")
        self.base_url = os.getenv("NIM_BASE_URL", "https://integrate.api.nvidia.com/v1")

    async def generate(self, request: ModelRequest) -> ModelResponse:
        # Mocked implementation for safety during dev
        return ModelResponse(content=f"[NVIDIA NIM Simulation] Processed: {request.prompt[:20]}...", usage={"tokens": 42})
""")

write_file('packages/providers/openai_provider.py', """
from packages.providers.base import ModelProvider, ModelRequest, ModelResponse
import os

class OpenAIProvider(ModelProvider):
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")

    async def generate(self, request: ModelRequest) -> ModelResponse:
        return ModelResponse(content=f"[OpenAI Simulation] Processed: {request.prompt[:20]}...", usage={"tokens": 30})
""")

write_file('packages/agents/router.py', """
from packages.providers.nvidia_nim import NvidiaNimProvider
from packages.providers.openai_provider import OpenAIProvider

class ModelRouter:
    def __init__(self):
        self.providers = {
            "nvidia": NvidiaNimProvider(),
            "openai": OpenAIProvider()
        }

    def get_provider(self, provider_name: str):
        provider = provider_name.lower()
        if "nvidia" in provider:
            return self.providers["nvidia"]
        return self.providers["openai"]
""")

write_file('packages/agents/runtime.py', """
from packages.domain.agent import Agent
from packages.agents.router import ModelRouter
from packages.providers.base import ModelRequest
import uuid
from packages.events.publisher import publish_event
from packages.events.envelope import EventEnvelope

class AgentRuntime:
    def __init__(self):
        self.router = ModelRouter()

    async def run_agent(self, agent: Agent, task_description: str) -> str:
        provider = self.router.get_provider(agent.model_provider)
        request = ModelRequest(prompt=task_description, system=agent.system_instructions)
        response = await provider.generate(request)
        
        # Emit observation event
        evt = EventEnvelope(
            event_id=str(uuid.uuid4()),
            event_type="agent.acted",
            organization_id=agent.organization_id,
            actor_id=agent.id,
            correlation_id=str(uuid.uuid4()),
            payload={"task": task_description, "response": response.content}
        )
        await publish_event(evt)
        return response.content
""")

# PHASE 5: FRICTION ENGINE
write_file('packages/friction/engine.py', """
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
""")

# PHASE 6: DECISION ENGINE
write_file('packages/decisions/engine.py', """
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
""")

# PHASE 7: ACTION FABRIC
write_file('packages/tools/action.py', """
from typing import Protocol, Any, Dict
import uuid
from packages.events.publisher import publish_event
from packages.events.envelope import EventEnvelope

class ActionRequest:
    def __init__(self, action_type: str, payload: Dict[str, Any]):
        self.action_type = action_type
        self.payload = payload

class ActionResult:
    def __init__(self, success: bool, output: Any):
        self.success = success
        self.output = output

class ActionExecutor(Protocol):
    async def execute(self, action: ActionRequest) -> ActionResult:
        ...

class GenericActionExecutor(ActionExecutor):
    async def execute(self, action: ActionRequest) -> ActionResult:
        # Mock execution
        return ActionResult(success=True, output=f"Executed {action.action_type}")
""")

# PHASE 8: MEMORY
write_file('packages/memory/core.py', """
from infrastructure.mongodb.client import get_database
from typing import Dict, Any

class MemoryStore:
    async def store_episodic(self, org_id: str, memory_item: Dict[str, Any]):
        db = get_database()
        await db.memory_episodic.insert_one({"org_id": org_id, **memory_item})

    async def store_decision_memory(self, org_id: str, decision_id: str, context: Dict[str, Any]):
        db = get_database()
        await db.memory_decision.insert_one({"org_id": org_id, "decision_id": decision_id, **context})
""")

# PHASE 10: SIMULATION
write_file('packages/simulation/engine.py', """
class SimulationEngine:
    async def snapshot_state(self, org_id: str) -> str:
        # MVP: Just return a mock snapshot ID
        return f"snap_{org_id}_123"
""")

if __name__ == "__main__":
    print("Scaffolded core engine files successfully.")
