from packages.providers.base import ModelProvider, ModelRequest, ModelResponse
import os

class OpenAIProvider(ModelProvider):
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")

    async def generate(self, request: ModelRequest) -> ModelResponse:
        return ModelResponse(content=f"[OpenAI Simulation] Processed: {request.prompt[:20]}...", usage={"tokens": 30})
