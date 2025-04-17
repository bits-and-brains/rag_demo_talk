import os
from typing import List, Dict, Any, Union
from qdrant_client import QdrantClient
from qdrant_client.http import models
from .base_vector_search import BaseVectorSearch

class QdrantService(BaseVectorSearch):
    """Qdrant vector search implementation"""

    def __init__(self):
        self.url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self.client = QdrantClient(url=self.url)

    async def search_by_vector(self, vector: List[float], collection: str, limit: int = 5, return_content: bool = False):
        """Search for similar vectors in the collection"""
        try:
            search_result = self.client.search(
                collection_name=collection,
                query_vector=vector,
                limit=limit
            )
            # Format results based on return_content flag
            if return_content:
                return [
                    {
                        "filename": hit.payload.get('filename', ''),
                        "content": hit.payload.get('content', '')
                    }
                    for hit in search_result
                ]
            else:
                return [hit.payload.get('filename', '') for hit in search_result]
        except Exception as e:
            raise Exception(f"Error searching in Qdrant: {str(e)}")
    
    async def search_by_text(self, text: str, collection: str, limit: int = 5, return_content: bool = False) -> List[Dict[str, Any]]:
        """Search for similar text in the collection"""
        raise NotImplementedError("Method not supported")
    
    async def generate_answer(self, question: str, collection: str) -> str:
        """Generate an answer using the vector search provider"""
        raise NotImplementedError("Method not supported")
    
    def get_provider(self) -> str:
        """Get the name of the vector search provider"""
        return "qdrant"

