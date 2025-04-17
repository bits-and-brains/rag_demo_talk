import os
from typing import List, Dict, Any, Union
import weaviate
from .base_vector_search import BaseVectorSearch

class WeaviateService(BaseVectorSearch):
    """Weaviate vector search implementation"""
    
    def __init__(self):
        self.url = os.getenv("WEAVIATE_URL", "host.docker.internal")
        self.default_class = "Recipe"
        self.client = None
    
    async def connect_to_weaviate(self):
        """Connect to Weaviate"""
        try:
            # Construct the URL properly
            weaviate_url = f"{self.url}"
            self.client = weaviate.Client(
                url=weaviate_url,
                additional_headers={
                    "X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY", "")
                }
            )
        except Exception as e:
            raise Exception(f"Error connecting to Weaviate: {str(e)}")
    
    async def search_by_vector(self, vector: List[float], collection: str, limit: int = 5, return_content: bool = False) -> List[Dict[str, Any]]:
        """Search for similar vectors in the collection"""
        raise NotImplementedError("Method not supported")
    
    async def search_by_text(self, text: str, collection: str = None, limit: int = 5,
                           return_content: bool = False) -> Union[List[str], List[Dict[str, Any]]]:
        """Search for similar text in the collection"""
        try:
            # Connect if not already connected
            if self.client is None:
                await self.connect_to_weaviate()
            
            # Use the provided collection or default class
            collection_name = collection if collection else self.default_class
            
            # Use Weaviate's text search capabilities
            query = (
                self.client.query
                .get(collection_name, ["filename", "content"])
                .with_near_text({
                    "concepts": [text]
                })
                .with_limit(limit)
            )
            
            result = query.do()
            
            if "data" not in result or "Get" not in result["data"]:
                return []
            
            # Format results based on return_content flag
            if return_content:
                return [
                    {
                        "filename": item.get("filename", ""),
                        "content": item.get("content", "")
                    }
                    for item in result["data"]["Get"][collection_name]
                ]
            else:
                return [item.get("filename", "") for item in result["data"]["Get"][collection_name]]
        except Exception as e:
            raise Exception(f"Error searching in Weaviate: {str(e)}")
    
    async def generate_answer(self, question: str, collection: str = None) -> str:
        """Generate an answer using Weaviate"""
        try:
            # Connect if not already connected
            if self.client is None:
                await self.connect_to_weaviate()
            
            # Use the provided collection or default class
            collection_name = collection if collection else self.default_class
            
            prompt = f"""You are an expert chef with extensive experience working in kitchens around the world.
You have a deep knowledge of cooking techniques, ingredients, and culinary traditions from various cultures. 
You are given a question about cooking or recipes and relevant recipe information.
Please answer the question based ONLY on the information provided in the context. 
You do not generate any information outside of the context. 
If you do not know the answer based on the provided context, just say (I do not have enough information to answer this question.)
<question>{question}</question>"""

            result = (
                self.client.query
                .get(collection_name, ["content"])
                .with_near_text({
                    "concepts": [question]
                })
                .with_limit(5)
                .with_generate({
                    "singlePrompt": prompt
                })
                .do()
            )
            
            if "data" not in result or "Get" not in result["data"]:
                return "I do not have enough information to answer this question."
            
            generated = result["data"]["Get"][collection_name][0].get("_additional", {}).get("generate", {})
            return generated.get("singleResult", "I do not have enough information to answer this question.")
        except Exception as e:
            raise Exception(f"Error generating answer with Weaviate: {str(e)}")
    
    def get_provider(self) -> str:
        """Get the name of the vector search provider"""
        return "weaviate" 