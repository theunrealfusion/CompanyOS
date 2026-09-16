from typing import Optional, List, Dict, Any
import logging
from openai import AsyncOpenAI
from .base import BaseProvider, ProviderResult
from .openai_compatible import OpenAIProvider

logger = logging.getLogger(__name__)

class GeminiProvider(BaseProvider):
    def __init__(self, api_key: str):
        # We can use the OpenAI compatible endpoint for Gemini to standardize tool calls
        self.provider = OpenAIProvider(
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )

    async def call(self, messages: list[dict], model: str, tools: Optional[List[Dict[str, Any]]] = None) -> ProviderResult:
        # Map model name
        model_name = "gemini-1.5-pro" if "pro" in model else "gemini-1.5-flash"
        return await self.provider.call(messages, model_name, tools)
