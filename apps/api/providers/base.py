from abc import ABC, abstractmethod
from typing import Optional, Any, List, Dict
from dataclasses import dataclass

@dataclass
class ProviderResult:
    content: Optional[str]
    tool_calls: List[Dict[str, Any]]
    input_tokens: int
    output_tokens: int

class BaseProvider(ABC):
    @abstractmethod
    async def call(self, messages: list[dict], model: str, tools: Optional[List[Dict[str, Any]]] = None) -> ProviderResult:
        """
        Executes a call to the underlying model provider.
        """
        pass
