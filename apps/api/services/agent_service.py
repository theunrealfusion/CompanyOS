from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from apps.api.models.agent import Agent, AgentVersion
from apps.api.schemas.agents import AgentCreate, AgentUpdate, AgentVersionCreate

class AgentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_agent(self, data: AgentCreate) -> Agent:
        agent = Agent(**data.model_dump())
        self.db.add(agent)
        await self.db.commit()
        await self.db.refresh(agent)
        
        # Create initial version
        version = AgentVersion(
            agent_id=agent.id,
            version=1,
            system_prompt=agent.system_prompt,
            instructions=agent.instructions,
            model_id=agent.model_id,
            runtime_type=agent.runtime_type,
            autonomy_level=agent.autonomy_level,
            config_snapshot=agent.config,
            status="PUBLISHED"
        )
        self.db.add(version)
        await self.db.commit()
        return agent

    async def get_agent(self, agent_id: UUID) -> Optional[Agent]:
        result = await self.db.execute(select(Agent).where(Agent.id == agent_id))
        return result.scalars().first()

    async def get_agent_hierarchy(self, root_id: UUID) -> dict:
        agent = await self.get_agent(root_id)
        if not agent:
            return {}
        result = await self.db.execute(
            select(Agent).where(Agent.manager_id == root_id)
        )
        subordinates = result.scalars().all()
        return {
            "id": agent.id,
            "name": agent.name,
            "role": agent.role,
            "subordinates": [await self.get_agent_hierarchy(sub.id) for sub in subordinates]
        }
