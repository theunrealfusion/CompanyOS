from __future__ import annotations
import os
from motor.motor_asyncio import AsyncIOMotorClient

_client: AsyncIOMotorClient | None = None

def get_mongo_client() -> AsyncIOMotorClient:
    global _client
    if not _client:
        mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        _client = AsyncIOMotorClient(mongo_url)
    return _client

def get_database():
    client = get_mongo_client()
    return client.companyos
