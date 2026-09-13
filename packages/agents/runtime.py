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
