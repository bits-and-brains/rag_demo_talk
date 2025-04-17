from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseVectorSearch(ABC):
    """Base class for vector search implementations"""
    
    @abstractmethod
    async def search_by_vector(self, vector: List[float], collection: str, limit: int = 5, return_content: bool = False) -> List[Dict[str, Any]]:
        """Search for similar vectors in the collection"""
        pass
    
    @abstractmethod
    async def search_by_text(self, text: str, collection: str, limit: int = 5, return_content: bool = False) -> List[Dict[str, Any]]:
        """Search for similar text in the collection"""
        pass
    
    @abstractmethod
    async def generate_answer(self, question: str, collection: str) -> str:
        """Generate an answer using the vector search provider"""
        pass 