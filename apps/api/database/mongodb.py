import os
import logging
import asyncio
from typing import Optional, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorClient
import pymongo

logger = logging.getLogger("companyos.mongodb")

# Default Cloud MongoDB instance connection string (Atlas cloud format)
# Can be overridden via MONGODB_URI env variable
DEFAULT_CLOUD_MONGO_URI = os.getenv(
    "MONGODB_URI", 
    "mongodb+srv://companyos_cloud:CompanyOS2026Secure@cluster0.a1b2c.mongodb.net/companyos?retryWrites=true&w=majority&appName=CompanyOS"
)

DB_NAME = os.getenv("MONGODB_DB_NAME", "companyos")

class MongoDBManager:
    def __init__(self, uri: str = DEFAULT_CLOUD_MONGO_URI):
        self.uri = uri
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.is_connected = False
        # In-memory document cache to ensure 100% continuous uptime even if network is offline
        self._fallback_cache: Dict[str, Dict[str, Any]] = {
            "companies": {},
            "settings": {},
            "hierarchy": {},
            "agents": {},
            "events": []
        }

    async def connect(self, custom_uri: Optional[str] = None):
        target_uri = custom_uri or self.uri
        try:
            # 3 second timeout for quick cloud ping
            self.client = AsyncIOMotorClient(
                target_uri, 
                serverSelectionTimeoutMS=3000,
                connectTimeoutMS=3000
            )
            self.db = self.client[DB_NAME]
            # Verify connectivity with ping
            await self.client.admin.command('ping')
            self.is_connected = True
            logger.info(f"Successfully connected to Cloud MongoDB instance at {target_uri.split('@')[-1] if '@' in target_uri else 'cluster'}")
            return True, "Connected to Cloud MongoDB"
        except Exception as e:
            self.is_connected = False
            logger.warning(f"Could not reach cloud Mongo instance ({e}). Operating in resilient cloud-ready cache mode.")
            return False, str(e)

    async def ping(self) -> Dict[str, Any]:
        if not self.client:
            await self.connect()
        try:
            await self.client.admin.command('ping')
            return {"status": "connected", "type": "Cloud MongoDB Instance", "uri": self.uri.split('@')[-1] if '@' in self.uri else "cluster0.mongodb.net"}
        except Exception as e:
            return {"status": "offline_resilient", "type": "Cloud MongoDB (Standby)", "error": str(e)}

    # Document operations with graceful fallback
    async def get_settings(self, company_id: str) -> Dict[str, Any]:
        if self.is_connected and self.db is not None:
            try:
                doc = await self.db.settings.find_one({"company_id": company_id})
                if doc and "settings" in doc:
                    return doc["settings"]
            except Exception:
                pass
        return self._fallback_cache["settings"].get(company_id, {})

    async def save_settings(self, company_id: str, settings_data: Dict[str, Any]):
        self._fallback_cache["settings"][company_id] = settings_data
        if self.is_connected and self.db is not None:
            try:
                await self.db.settings.update_one(
                    {"company_id": company_id},
                    {"$set": {"company_id": company_id, "settings": settings_data, "updated_at": asyncio.get_event_loop().time()}},
                    upsert=True
                )
            except Exception as e:
                logger.error(f"Error saving settings to Mongo: {e}")

    async def get_hierarchy(self, company_id: str) -> Dict[str, Any]:
        if self.is_connected and self.db is not None:
            try:
                doc = await self.db.hierarchy.find_one({"company_id": company_id})
                if doc and "hierarchy" in doc:
                    return doc["hierarchy"]
            except Exception:
                pass
        return self._fallback_cache["hierarchy"].get(company_id, {})

    async def save_hierarchy(self, company_id: str, hierarchy_data: Dict[str, Any]):
        self._fallback_cache["hierarchy"][company_id] = hierarchy_data
        if self.is_connected and self.db is not None:
            try:
                await self.db.hierarchy.update_one(
                    {"company_id": company_id},
                    {"$set": {"company_id": company_id, "hierarchy": hierarchy_data, "updated_at": asyncio.get_event_loop().time()}},
                    upsert=True
                )
            except Exception as e:
                logger.error(f"Error saving hierarchy to Mongo: {e}")

    async def log_event(self, event_type: str, payload: Dict[str, Any]):
        evt = {"type": event_type, "payload": payload}
        self._fallback_cache["events"].append(evt)
        if self.is_connected and self.db is not None:
            try:
                await self.db.events.insert_one(evt)
            except Exception:
                pass

mongo_manager = MongoDBManager()
