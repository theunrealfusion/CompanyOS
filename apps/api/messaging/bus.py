import json
import logging
from typing import Callable, Awaitable
import redis.asyncio as redis

logger = logging.getLogger(__name__)

class RedisEventBus:
    def __init__(self, redis_url: str = "redis://localhost:6380/0"):
        self.redis_url = redis_url
        self.redis = None
        self.pubsub = None

    async def connect(self):
        self.redis = redis.from_url(self.redis_url)
        self.pubsub = self.redis.pubsub()
        await self.pubsub.subscribe("companyos_events")
        logger.info("Connected to Redis Event Bus")

    async def publish(self, event_type: str, payload: dict):
        if not self.redis:
            await self.connect()
        message = json.dumps({"type": event_type, "payload": payload})
        await self.redis.publish("companyos_events", message)

    async def listen(self, callback: Callable[[dict], Awaitable[None]]):
        if not self.pubsub:
            await self.connect()
        async for message in self.pubsub.listen():
            if message["type"] == "message":
                try:
                    data = json.loads(message["data"])
                    await callback(data)
                except Exception as e:
                    logger.error(f"Error parsing message: {e}")

event_bus = RedisEventBus()
