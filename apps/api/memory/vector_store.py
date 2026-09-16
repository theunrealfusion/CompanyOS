from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from apps.api.models.memory import MemoryEmbedding

class MemoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add_memory(self, agent_id: str, content: str, embedding: list[float], metadata: dict):
        mem = MemoryEmbedding(agent_id=agent_id, content=content, embedding=embedding, metadata_=metadata)
        self.db.add(mem)
        await self.db.commit()
        return mem

    async def search_memory(self, agent_id: str, query_embedding: list[float], limit: int = 5):
        # Using pgvector cosine distance
        result = await self.db.execute(
            select(MemoryEmbedding)
            .where(MemoryEmbedding.agent_id == agent_id)
            .order_by(MemoryEmbedding.embedding.cosine_distance(query_embedding))
            .limit(limit)
        )
        return result.scalars().all()
