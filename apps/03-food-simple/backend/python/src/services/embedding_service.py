import os
from typing import Dict, Any, List
import httpx
import json
from google.generativeai import GenerativeModel, configure
from .llm.ollama_service import OllamaService
from .llm.openai_service import OpenAIService
from .llm.gemini_service import GeminiService

class EmbeddingService:
    """Service for generating embeddings"""
    
    def __init__(self):
        self.ollama_api_url = os.getenv("OLLAMA_API_URL", "http://host.docker.internal:11434")
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        
        # Configure Gemini if API key is available
        if self.gemini_api_key:
            configure(api_key=self.gemini_api_key)
        
        # Initialize providers configuration
        self.providers = {
            "ollama": {
                "name": "Ollama",
                "enabled": True,
                "model": os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
            },
            "openai": {
                "name": "OpenAI",
                "enabled": bool(self.openai_api_key),
                "model": os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
            },
            "gemini": {
                "name": "Google Gemini",
                "enabled": bool(self.gemini_api_key),
                "model": os.getenv("GEMINI_EMBEDDING_MODEL", "embedding-001")
            }
        }
        
        # Initialize service instances map
        self.service_instances = {}
    
    def get_available_providers(self) -> Dict[str, Any]:
        """Get available embedding providers"""
        return {
            key: {
                "name": provider["name"],
                "enabled": provider["enabled"],
                "model": provider["model"]
            }
            for key, provider in self.providers.items()
            if provider["enabled"]
        }
    
    def is_provider_available(self, provider: str) -> bool:
        """Check if a provider is available"""
        return self.providers.get(provider, {}).get("enabled", False)
    
    def get_service_instance(self, provider: str) -> Any:
        """Get or create a service instance for the specified provider"""
        if provider not in self.service_instances:
            if provider == "ollama":
                self.service_instances[provider] = OllamaService()
            elif provider == "openai":
                self.service_instances[provider] = OpenAIService()
            elif provider == "gemini":
                self.service_instances[provider] = GeminiService()
            else:
                raise ValueError(f"Unknown embedding provider: {provider}")
        return self.service_instances[provider]
    
    async def get_embedding(self, text: str, provider: str = "ollama") -> List[float]:
        """Get embedding for the given text using the specified provider"""
        if not self.is_provider_available(provider):
            raise ValueError(f"Embedding provider {provider} is not available")
        
        try:
            service = self.get_service_instance(provider)
            return await service.get_embeddings(text)
        except Exception as e:
            raise Exception(f"Error getting embedding with {provider}: {str(e)}")

# Create a singleton instance
embedding_service = EmbeddingService() 