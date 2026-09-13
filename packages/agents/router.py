from packages.providers.nvidia_nim import NvidiaNimProvider
from packages.providers.openai_provider import OpenAIProvider

class ModelRouter:
    def __init__(self):
        self.providers = {
            "nvidia": NvidiaNimProvider(),
            "openai": OpenAIProvider()
        }

    def get_provider(self, provider_name: str):
        provider = provider_name.lower()
        if "nvidia" in provider:
            return self.providers["nvidia"]
        return self.providers["openai"]
