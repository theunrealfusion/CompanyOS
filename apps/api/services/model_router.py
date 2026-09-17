from apps.api.providers.base import BaseProvider
from apps.api.providers.gemini import GeminiProvider
from apps.api.providers.openai_compatible import OpenAIProvider


class ModelRouter:
    @staticmethod
    def get_provider(provider_type: str, api_key: str, base_url: str | None = None) -> BaseProvider:
        if provider_type.lower() == "gemini":
            return GeminiProvider(api_key=api_key)
        else:
            return OpenAIProvider(api_key=api_key, base_url=base_url)
