from typing import Dict, Any
from ..services.llm_service import LLMService

class ChatController:
    """Controller for chat functionality"""
    
    def __init__(self, llm_service: LLMService):
        self.llm_service = llm_service
    
    async def chat(self, data: Dict[str, Any]) -> Dict[str, str]:
        """Handle chat message requests"""
        if "message" not in data:
            raise Exception("Message is required")
        
        message = data["message"]
        provider = data.get("provider", "ollama")
        
        try:
            response = await self.llm_service.send_message(message, provider)
            return {"response": response}
        except Exception as e:
            raise Exception(f"Failed to generate response: {str(e)}")
    
    def providers(self) -> Dict[str, Dict]:
        """Get available LLM providers"""
        try:
            return {
                "providers": self.llm_service.get_available_providers()
            }
        except Exception as e:
            raise Exception(f"Failed to get providers: {str(e)}")
    
    def switch_provider(self, data: Dict[str, Any]) -> Dict[str, str]:
        """Switch the current LLM provider"""
        if "provider" not in data:
            raise Exception("Provider is required")
        
        provider = data["provider"]
        
        if not self.llm_service.is_provider_available(provider):
            raise Exception("Provider not available")
        
        return {"message": "Provider switched successfully"} 