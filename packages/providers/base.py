from typing import Protocol, Dict, Any

class ModelRequest:
    def __init__(self, prompt: str, system: str, kwargs: Dict[str, Any] = None):
        self.prompt = prompt
        self.system = system
        self.kwargs = kwargs or {}

class ModelResponse:
    def __init__(self, content: str, usage: Dict[str, Any] = None):
        self.content = content
        self.usage = usage or {}

class ModelProvider(Protocol):
    async def generate(self, request: ModelRequest) -> ModelResponse:
        ...
