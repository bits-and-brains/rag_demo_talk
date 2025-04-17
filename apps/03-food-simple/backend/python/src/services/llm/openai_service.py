import os
import httpx
from .llm_interface import LLMInterface

class OpenAIService(LLMInterface):
    """OpenAI service implementation"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        self.embedding_model = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
        self.base_url = "https://api.openai.com/v1"
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            timeout=30.0
        )
        
        if not self.api_key:
            raise Exception("OpenAI API key is not configured")
    
    async def send_message(self, message: str) -> str:
        """Send a message to the OpenAI API and get a response"""
        try:
            response = await self.client.post(
                "/chat/completions",
                json={
                    "model": self.model,
                    "messages": [
                        {
                            "role": "user",
                            "content": message
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1000
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenAI API error: {response.text}")
            
            data = response.json()
            
            if not data.get("choices") or len(data["choices"]) == 0:
                raise Exception(f"No response choices returned from OpenAI API: {data}")
            
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            raise Exception(f"Error communicating with OpenAI API: {str(e)}")
    
    async def get_embeddings(self, text: str) -> list:
        """Get embeddings for the given text using the embedding model"""
        try:
            response = await self.client.post(
                "/embeddings",
                json={
                    "model": self.embedding_model,
                    "input": text
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenAI API error: {response.text}")
            
            data = response.json()
            
            if not data.get("data") or len(data["data"]) == 0:
                raise Exception(f"No embedding data returned from OpenAI API: {data}")
            
            return data["data"][0]["embedding"]
        except Exception as e:
            raise Exception(f"Error getting embeddings from OpenAI API: {str(e)}")
    
    def get_provider(self) -> str:
        """Get the name of the LLM provider"""
        return "OpenAI"
    
    def get_model(self) -> str:
        """Get the model name used by the LLM provider"""
        return self.model
        
    def get_embedding_model(self) -> str:
        """Get the embedding model name used by the LLM provider"""
        return self.embedding_model 