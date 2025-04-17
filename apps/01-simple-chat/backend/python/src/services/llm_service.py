import os
from typing import Dict, List, Optional
from .llm.llm_interface import LLMInterface
from .llm.ollama_service import OllamaService
from .llm.openai_service import OpenAIService
from .llm.gemini_service import GeminiService

class LLMService:
    """Service for managing LLM providers"""
    
    def __init__(self):
        self.default_provider = os.getenv("DEFAULT_PROVIDER", "ollama")
        self.providers: Dict[str, LLMInterface] = {}
        self.provider_names = {
            "openai": "OpenAI",
            "gemini": "Google Gemini",
            "ollama": "Ollama (Local)"
        }
        self.initialize_providers()
    
    def initialize_providers(self) -> None:
        """Initialize available LLM providers"""
        # Initialize OpenAI provider if API key is configured
        if os.getenv("OPENAI_API_KEY"):
            try:
                self.providers["openai"] = OpenAIService()
            except Exception:
                # Provider initialization failed
                pass
        
        # Initialize Gemini provider if API key is configured
        if os.getenv("GEMINI_API_KEY"):
            try:
                self.providers["gemini"] = GeminiService()
            except Exception:
                # Provider initialization failed
                pass
        
        # Initialize Ollama provider
        try:
            self.providers["ollama"] = OllamaService()
        except Exception:
            # Provider initialization failed
            pass
    
    async def send_message(self, message: str, provider: Optional[str] = None) -> str:
        """Send a message to the specified LLM provider"""
        provider = provider or self.default_provider
        
        if provider not in self.providers:
            raise Exception(f"LLM provider '{provider}' is not available")
        
        try:
            return await self.providers[provider].send_message(message)
        except Exception as e:
            raise Exception(f"Failed to generate response: {str(e)}")
    
    def get_available_providers(self) -> Dict[str, Dict]:
        """Get the list of available providers with their details"""
        result = {}
        for provider_id, provider_name in self.provider_names.items():
            enabled = provider_id in self.providers
            result[provider_id] = {
                "name": provider_name,
                "enabled": enabled,
                "model": self.providers[provider_id].get_model() if enabled else None
            }
        return result
    
    def is_provider_available(self, provider: str) -> bool:
        """Check if a provider is available"""
        return provider in self.providers
    
    def get_default_provider(self) -> str:
        """Get the default provider"""
        return self.default_provider 