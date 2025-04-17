from abc import ABC, abstractmethod

class LLMInterface(ABC):
    """Interface for LLM providers"""
    
    @abstractmethod
    async def send_message(self, message: str) -> str:
        """Send a message to the LLM provider and get a response"""
        pass
    
    @abstractmethod
    def get_provider(self) -> str:
        """Get the name of the LLM provider"""
        pass
    
    @abstractmethod
    def get_model(self) -> str:
        """Get the model name used by the LLM provider"""
        pass 