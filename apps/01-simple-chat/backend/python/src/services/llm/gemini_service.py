import os
import httpx
from .llm_interface import LLMInterface

class GeminiService(LLMInterface):
    """Gemini service implementation"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=30.0
        )
        
        if not self.api_key:
            raise Exception("Gemini API key is not configured")
    
    async def send_message(self, message: str) -> str:
        """Send a message to the Gemini API and get a response"""
        try:
            url = f"/models/{self.model}:generateContent?key={self.api_key}"
            
            response = await self.client.post(
                url,
                json={
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": message
                                }
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.7,
                        "topK": 40,
                        "topP": 0.95,
                        "maxOutputTokens": 1024,
                    }
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Gemini API error: {response.text}")
            
            data = response.json()
            
            if not data.get("candidates") or len(data["candidates"]) == 0:
                raise Exception(f"No candidates returned from Gemini API: {data}")
            
            if not data["candidates"][0].get("content") or not data["candidates"][0]["content"].get("parts"):
                raise Exception(f"Invalid response format from Gemini API: {data}")
            
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            raise Exception(f"Error communicating with Gemini API: {str(e)}")
    
    def get_provider(self) -> str:
        """Get the name of the LLM provider"""
        return "Google Gemini"
    
    def get_model(self) -> str:
        """Get the model name used by the LLM provider"""
        return self.model 