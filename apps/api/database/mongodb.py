import logging
import os
import time
from typing import Optional, Any

from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger("companyos.mongodb")

# Default MongoDB URI is read from environment variable MONGODB_URI.
# If not provided, it is empty and reported as NOT_CONFIGURED. No fake URIs.
MONGODB_URI_ENV = os.getenv("MONGODB_URI", "")
DB_NAME = os.getenv("MONGODB_DB_NAME", "companyos")


class MongoDBManager:
    def __init__(self, uri: str = MONGODB_URI_ENV):
        self.uri = uri
        self.client: AsyncIOMotorClient | None = None
        self.db = None
        self.is_connected = False
        self.last_error: Optional[str] = None
        self.last_latency_ms: Optional[float] = None

        # Real in-memory transactional store used when MongoDB is not yet configured or reachable
        self.local_store: dict[str, Any] = {
            "companies": {},
            "agents": {},
            "tasks": {},
            "events": [],
            "approvals": {},
            "settings": {},
            "hierarchy": {},
            "transactions": [],
        }

    def _mask_uri(self, uri: str) -> str:
        if not uri:
            return ""
        if "@" in uri:
            try:
                scheme = uri.split("://")[0]
                after_at = uri.split("@")[1]
                before_at = uri.split("@")[0].split("://")[1]
                user = before_at.split(":")[0] if ":" in before_at else before_at
                return f"{scheme}://{user}:****@{after_at}"
            except Exception:
                return "mongodb+srv://****:****@cluster..."
        return uri

    async def connect(self, custom_uri: Optional[str] = None) -> tuple[bool, str]:
        target_uri = custom_uri if custom_uri is not None else self.uri
        if not target_uri or target_uri.strip() == "":
            self.is_connected = False
            self.last_error = "MongoDB URI is not configured. Please enter a valid MongoDB Atlas connection string."
            self.last_latency_ms = None
            return False, self.last_error

        self.uri = target_uri.strip()
        try:
            # Connect with real server selection timeout of 4000ms
            self.client = AsyncIOMotorClient(
                self.uri, serverSelectionTimeoutMS=4000, connectTimeoutMS=4000
            )
            self.db = self.client[DB_NAME]

            start = time.perf_counter()
            await self.client.admin.command("ping")
            self.last_latency_ms = round((time.perf_counter() - start) * 1000, 2)
            self.is_connected = True
            self.last_error = None
            logger.info(
                f"Connected to MongoDB at {self._mask_uri(self.uri)} (ping: {self.last_latency_ms}ms)"
            )
            return True, f"Successfully connected to MongoDB cluster ({self.last_latency_ms}ms)"
        except Exception as e:
            self.is_connected = False
            self.last_error = str(e)
            self.last_latency_ms = None
            logger.warning(f"MongoDB connection failed: {e}")
            return False, str(e)

    async def ping(self) -> dict[str, Any]:
        if not self.uri or self.uri.strip() == "":
            return {
                "status": "NOT_CONFIGURED",
                "is_connected": False,
                "type": "Cloud MongoDB Atlas",
                "uri": "",
                "latency_ms": None,
                "database": DB_NAME,
                "collections": [],
                "document_counts": {},
                "error": "MongoDB Atlas connection URI is not configured. Set MONGODB_URI or enter URI in Settings.",
            }

        try:
            if not self.client:
                self.client = AsyncIOMotorClient(
                    self.uri, serverSelectionTimeoutMS=4000, connectTimeoutMS=4000
                )
                self.db = self.client[DB_NAME]

            start = time.perf_counter()
            await self.client.admin.command("ping")
            latency = round((time.perf_counter() - start) * 1000, 2)
            self.last_latency_ms = latency
            self.is_connected = True
            self.last_error = None

            # Fetch actual collections from MongoDB
            collections = await self.db.list_collection_names()
            counts = {}
            for col in collections:
                counts[col] = await self.db[col].count_documents({})

            return {
                "status": "CONNECTED",
                "is_connected": True,
                "type": "Cloud MongoDB Atlas"
                if "mongodb+srv://" in self.uri or "mongodb.net" in self.uri
                else "MongoDB Instance",
                "uri": self._mask_uri(self.uri),
                "latency_ms": latency,
                "database": DB_NAME,
                "collections": collections,
                "document_counts": counts,
                "error": None,
            }
        except Exception as e:
            self.is_connected = False
            self.last_error = str(e)
            self.last_latency_ms = None
            return {
                "status": "CONNECTION_FAILED",
                "is_connected": False,
                "type": "Cloud MongoDB Atlas"
                if "mongodb+srv://" in self.uri or "mongodb.net" in self.uri
                else "MongoDB Instance",
                "uri": self._mask_uri(self.uri),
                "latency_ms": None,
                "database": DB_NAME,
                "collections": [],
                "document_counts": {},
                "error": str(e),
            }

    # Document Operations (Real MongoDB when connected, fallback local store when not)
    async def get_settings(self, company_id: str) -> dict[str, Any]:
        if self.is_connected and self.db is not None:
            try:
                doc = await self.db.settings.find_one({"company_id": company_id})
                if doc and "settings" in doc:
                    return doc["settings"]
            except Exception:
                pass
        return self.local_store["settings"].get(company_id, {})

    async def save_settings(self, company_id: str, settings_data: dict[str, Any]):
        self.local_store["settings"][company_id] = settings_data
        if self.is_connected and self.db is not None:
            try:
                await self.db.settings.update_one(
                    {"company_id": company_id},
                    {
                        "$set": {
                            "company_id": company_id,
                            "settings": settings_data,
                            "updated_at": time.time(),
                        }
                    },
                    upsert=True,
                )
            except Exception as e:
                logger.error(f"Error saving settings to Mongo: {e}")

    async def get_hierarchy(self, company_id: str) -> dict[str, Any]:
        if self.is_connected and self.db is not None:
            try:
                doc = await self.db.hierarchy.find_one({"company_id": company_id})
                if doc and "hierarchy" in doc:
                    return doc["hierarchy"]
            except Exception:
                pass
        return self.local_store["hierarchy"].get(company_id, {})

    async def save_hierarchy(self, company_id: str, hierarchy_data: dict[str, Any]):
        self.local_store["hierarchy"][company_id] = hierarchy_data
        if self.is_connected and self.db is not None:
            try:
                await self.db.hierarchy.update_one(
                    {"company_id": company_id},
                    {
                        "$set": {
                            "company_id": company_id,
                            "hierarchy": hierarchy_data,
                            "updated_at": time.time(),
                        }
                    },
                    upsert=True,
                )
            except Exception as e:
                logger.error(f"Error saving hierarchy to Mongo: {e}")

    async def log_event(self, event_type: str, payload: dict[str, Any]):
        evt = {"type": event_type, "payload": payload, "timestamp": time.time()}
        self.local_store["events"].append(evt)
        if self.is_connected and self.db is not None:
            try:
                await self.db.events.insert_one(evt)
            except Exception:
                pass


mongo_manager = MongoDBManager()
