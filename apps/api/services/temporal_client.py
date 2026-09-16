from typing import Optional
from temporalio.client import Client

class TemporalService:
    _client: Optional[Client] = None

    @classmethod
    async def get_client(cls) -> Client:
        if cls._client is None:
            cls._client = await Client.connect("localhost:7233")
        return cls._client
