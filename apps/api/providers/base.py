from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class ProviderResult:
    content: str | None
    tool_calls: list[dict[str, Any]]
    input_tokens: int
    output_tokens: int

class BaseProvider(ABC):
    @abstractmethod
    async def call(self, messages: list[dict], model: str, tools: list[dict[str, Any]] | None = None) -> ProviderResult:
        """
        Executes a call to the underlying model provider.
        """
        pass
