import os
from typing import List, Dict, Any, Union
from elasticsearch import AsyncElasticsearch
from .base_vector_search import BaseVectorSearch
from ..embedding_service import embedding_service

class ElasticsearchService(BaseVectorSearch):
    """Elasticsearch vector search implementation"""

    def __init__(self):
        self.client = AsyncElasticsearch(
            os.getenv("ELASTICSEARCH_URL", "http://localhost:9200"),
            basic_auth=(
                os.getenv("ELASTICSEARCH_USERNAME", "elastic"),
                os.getenv("ELASTICSEARCH_PASSWORD", "changeme")
            )
        )
        self.default_index = "recipes"

    async def search_by_vector(self, vector: List[float], collection: str, limit: int = 5, return_content: bool = False) -> List[Dict[str, Any]]:
        """Search for similar vectors in the collection"""
        raise NotImplementedError("Method not supported")

    async def search_by_text(self, text: str, collection: str = None, limit: int = 5,
                           return_content: bool = False) -> Union[List[str], List[Dict[str, Any]]]:
        """Search for similar text in the collection"""
        try:
            # Get embedding for the query text
            embedding = await embedding_service.get_embedding(text, "ollama")
            
            # Use the embedding for vector search with native vector search
            query = {
                "size": limit,
                "query": {
                    "match": {
                        "content": {
                            "query": text,
                            "boost": 0.3
                        }
                    }
                },
                "knn": {
                    "field": "embedding",
                    "query_vector": embedding,
                    "k": limit,
                    "num_candidates": limit * 10
                }
            }

            # Use the provided collection or default index
            index = collection if collection else self.default_index
            
            response = await self.client.search(
                index=index,
                body=query
            )

            # Format results based on return_content flag
            if return_content:
                return [
                    {
                        "filename": hit["_source"]["filename"],
                        "content": hit["_source"]["content"]
                    }
                    for hit in response["hits"]["hits"]
                ]
            else:
                return [hit["_source"]["filename"] for hit in response["hits"]["hits"]]
                
        except Exception as e:
            raise Exception(f"Error searching in Elasticsearch: {str(e)}")
    
    async def generate_answer(self, question: str, collection: str) -> str:
        """Generate an answer using the vector search provider"""
        raise NotImplementedError("Method not supported")
    
    def get_provider(self) -> str:
        """Get the name of the vector search provider"""
        return "elasticsearch"
