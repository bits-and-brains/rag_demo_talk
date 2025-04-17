import os
import httpx
from .llm_interface import LLMInterface

class OllamaService(LLMInterface):
    """Ollama service implementation"""
    
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "llama2")
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def send_message(self, message: str) -> str:
        """Send a message to the Ollama API and get a response"""
        try:
            response = await self.client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": message,
                    "stream": False
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Ollama API error: {response.text}")
            
            data = response.json()
            
            if "response" not in data:
                raise Exception(f"Invalid response format from Ollama API: {data}")
            
            return data["response"]
        except Exception as e:
            raise Exception(f"Error communicating with Ollama API: {str(e)}")
    
    def get_provider(self) -> str:
        """Get the name of the LLM provider"""
        return "Ollama (Local)"
    
    def get_model(self) -> str:
        """Get the model name used by the LLM provider"""
        return self.model 