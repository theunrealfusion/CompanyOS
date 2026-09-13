from infrastructure.mongodb.client import get_database
from typing import Dict, Any

class MemoryStore:
    async def store_episodic(self, org_id: str, memory_item: Dict[str, Any]):
        db = get_database()
        await db.memory_episodic.insert_one({"org_id": org_id, **memory_item})

    async def store_decision_memory(self, org_id: str, decision_id: str, context: Dict[str, Any]):
        db = get_database()
        await db.memory_decision.insert_one({"org_id": org_id, "decision_id": decision_id, **context})
