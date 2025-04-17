from typing import Optional
import os
import aiohttp
from .llm_interface import LLMInterface

class OllamaService(LLMInterface):
    """Ollama service implementation"""
    
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "llama2")
        self.embedding_model = os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
    
    async def send_message(self, message: str) -> str:
        """Send a message to the Ollama API and get a response"""
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": message,
                    "stream": False
                }
            ) as response:
                if response.status != 200:
                    raise Exception(f"Failed to get response from Ollama: {response.status}")
                result = await response.json()
                return result.get("response", "")

    async def get_embeddings(self, text: str) -> list:
        """Get embeddings for the given text using the embedding model"""
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/api/embeddings",
                json={
                    "model": self.embedding_model,
                    "prompt": text
                }
            ) as response:
                if response.status != 200:
                    raise Exception(f"Failed to get embeddings from Ollama: {response.status}")
                result = await response.json()
                if "embedding" not in result:
                    raise Exception("No embedding found in Ollama response")
                return result["embedding"]
    
    def get_provider(self) -> str:
        """Get the name of the LLM provider"""
        return "ollama"
    
    def get_model(self) -> str:
        """Get the model name used by the LLM provider"""
        return self.model

    def get_embedding_model(self) -> str:
        """Get the embedding model name used by the LLM provider"""
        return self.embedding_model 