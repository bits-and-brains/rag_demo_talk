import os
from typing import List, Dict, Any, Union
import asyncpg
from .base_vector_search import BaseVectorSearch

class PostgresService(BaseVectorSearch):
    """PostgreSQL vector search implementation"""
    
    def __init__(self):
        self.pool = None
        self.default_table = "recipes"
    
    async def connect(self):
        """Connect to PostgreSQL"""
        try:
            if self.pool is None:
                self.pool = await asyncpg.create_pool(
                    host=os.getenv("POSTGRES_HOST", "host.docker.internal"),
                    port=int(os.getenv("POSTGRES_PORT", 5432)),
                    database=os.getenv("POSTGRES_DB", "vectordb"),
                    user=os.getenv("POSTGRES_USER", "postgres"),
                    password=os.getenv("POSTGRES_PASSWORD", "postgres")
                )
        except Exception as e:
            raise Exception(f"Error connecting to PostgreSQL: {str(e)}")
    
    async def search_by_vector(self, vector: List[float], collection: str, limit: int = 5, return_content: bool = False) -> List[Dict[str, Any]]:
        """Search for similar vectors in the collection"""
        raise NotImplementedError("Method not supported")
    
    async def search_by_text(self, text: str, collection: str = None, limit: int = 5,
                           return_content: bool = False) -> Union[List[str], List[Dict[str, Any]]]:
        """Search for similar text in the collection"""
        try:
            # Connect if not already connected
            await self.connect()
            
            # Use the provided collection or default table
            table = collection if collection else self.default_table
            
            async with self.pool.acquire() as conn:
                query = f"""SELECT
                chunk,
                embedding <=> ai.ollama_embed('nomic-embed-text', $1) AS distance
                FROM public.{table}_embedding_store
                ORDER BY distance
                LIMIT $2;
                """
                
                rows = await conn.fetch(query, text, limit)
                
                # Format results based on return_content flag
                if return_content:
                    return [
                        {
                            "filename": "",
                            "content": row["chunk"]
                        }
                        for row in rows
                    ]
                else:
                    return [row["filename"] for row in rows]
        except Exception as e:
            raise Exception(f"Error searching in PostgreSQL: {str(e)}")
    
    async def generate_answer(self, question: str, collection: str) -> str:
        """Generate an answer using the vector search provider"""
        raise NotImplementedError("Method not supported")
    
    def get_provider(self) -> str:
        """Get the name of the vector search provider"""
        return "postgres"
