
from temporalio.client import Client


class TemporalService:
    _client: Client | None = None

    @classmethod
    async def get_client(cls) -> Client:
        if cls._client is None:
            cls._client = await Client.connect("localhost:7233")
        return cls._client
