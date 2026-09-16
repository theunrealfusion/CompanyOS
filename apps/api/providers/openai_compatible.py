from typing import Optional, List, Dict, Any
import logging
import json
from openai import AsyncOpenAI
from .base import BaseProvider, ProviderResult

logger = logging.getLogger(__name__)

class OpenAIProvider(BaseProvider):
    def __init__(self, api_key: str, base_url: str = None):
        self.api_key = api_key
        self.base_url = base_url
        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url)

    async def call(self, messages: list[dict], model: str, tools: Optional[List[Dict[str, Any]]] = None) -> ProviderResult:
        try:
            kwargs = {
                "model": model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 4096
            }
            if tools:
                kwargs["tools"] = [{"type": "function", "function": t} for t in tools]
                kwargs["tool_choice"] = "auto"
                
            response = await self.client.chat.completions.create(**kwargs)
            choice = response.choices[0]
            message = choice.message
            
            tool_calls = []
            if message.tool_calls:
                for tc in message.tool_calls:
                    if tc.type == 'function':
                        try:
                            args = json.loads(tc.function.arguments)
                        except:
                            args = {}
                        tool_calls.append({
                            "id": tc.id,
                            "name": tc.function.name,
                            "args": args
                        })
                        
            return ProviderResult(
                content=message.content,
                tool_calls=tool_calls,
                input_tokens=response.usage.prompt_tokens if response.usage else 0,
                output_tokens=response.usage.completion_tokens if response.usage else 0
            )
        except Exception as e:
            logger.error(f"Error calling OpenAI-compatible provider: {e}")
            return ProviderResult(content=f"Error: {str(e)}", tool_calls=[], input_tokens=0, output_tokens=0)
