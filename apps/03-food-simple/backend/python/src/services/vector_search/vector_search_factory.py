from typing import Dict, Any, List
from .base_vector_search import BaseVectorSearch
from .qdrant_service import QdrantService
from .elasticsearch_service import ElasticsearchService
from .postgres_service import PostgresService
from .weaviate_service import WeaviateService

class VectorSearchFactory:
    """Factory class for managing vector search providers"""
    
    def __init__(self):
        self.providers = {
            'qdrant': {
                'name': 'Qdrant',
                'enabled': True,
                'supports_embedding_selection': True,
                'requires_embedding': True,
                'returns_content': False
            },
            'elasticsearch': {
                'name': 'Elasticsearch',
                'enabled': True,
                'supports_embedding_selection': False,
                'requires_embedding': False,
                'returns_content': True
            },
            'postgres': {
                'name': 'PostgreSQL',
                'enabled': True,
                'supports_embedding_selection': False,
                'requires_embedding': False,
                'returns_content': True
            },
            'weaviate': {
                'name': 'Weaviate',
                'enabled': True,
                'supports_embedding_selection': False,
                'requires_embedding': False,
                'returns_content': True
            }
        }
        
        # Initialize service instances map but don't create instances yet
        self.service_instances: Dict[str, BaseVectorSearch] = {}
    
    def get_available_providers(self) -> Dict[str, Dict[str, Any]]:
        """Get all available vector search providers"""
        return {
            key: {
                'name': provider['name'],
                'enabled': provider['enabled'],
                'supports_embedding_selection': provider['supports_embedding_selection'],
                'requires_embedding': provider['requires_embedding'],
                'returns_content': provider['returns_content']
            }
            for key, provider in self.providers.items()
            if provider['enabled']
        }
    
    def is_provider_available(self, provider: str) -> bool:
        """Check if a provider is available"""
        return self.providers.get(provider, {}).get('enabled', False)
    
    def supports_embedding_selection(self, provider: str) -> bool:
        """Check if a provider supports embedding selection"""
        return self.providers.get(provider, {}).get('supports_embedding_selection', False)
    
    def requires_embedding(self, provider: str) -> bool:
        """Check if a provider requires embedding"""
        return self.providers.get(provider, {}).get('requires_embedding', False)
    
    def returns_content(self, provider: str) -> bool:
        """Check if a provider returns content"""
        return self.providers.get(provider, {}).get('returns_content', False)
    
    def get_service_instance(self, provider: str) -> BaseVectorSearch:
        """Get a service instance, creating it if it doesn't exist"""
        if provider not in self.service_instances:
            if provider == 'qdrant':
                self.service_instances[provider] = QdrantService()
            elif provider == 'elasticsearch':
                self.service_instances[provider] = ElasticsearchService()
            elif provider == 'postgres':
                self.service_instances[provider] = PostgresService()
            elif provider == 'weaviate':
                self.service_instances[provider] = WeaviateService()
            else:
                raise ValueError(f"Unknown vector search provider: {provider}")
        return self.service_instances[provider]
    
    async def search_by_vector(self, vector: List[float], collection: str, provider: str = 'qdrant', 
                             limit: int = 5, return_content: bool = False) -> List[Dict[str, Any]]:
        """Search using vector with the specified provider"""
        if not self.is_provider_available(provider):
            raise ValueError(f"Vector search provider {provider} is not available")
        
        try:
            service = self.get_service_instance(provider)
            return await service.search_by_vector(vector, collection, limit, return_content)
        except Exception as e:
            raise Exception(f"Error searching with {provider}: {str(e)}")
    
    async def search_by_text(self, text: str, collection: str, provider: str = 'qdrant',
                           limit: int = 5, return_content: bool = False) -> List[Dict[str, Any]]:
        """Search using text with the specified provider"""
        if not self.is_provider_available(provider):
            raise ValueError(f"Vector search provider {provider} is not available")
        
        try:
            service = self.get_service_instance(provider)
            return await service.search_by_text(text, collection, limit, return_content)
        except Exception as e:
            raise Exception(f"Error searching by text with {provider}: {str(e)}")
    
    async def generate_answer(self, question: str, collection: str, provider: str = 'weaviate') -> str:
        """Generate an answer using the specified provider"""
        if not self.is_provider_available(provider):
            raise ValueError(f"Vector search provider {provider} is not available")
        
        try:
            service = self.get_service_instance(provider)
            return await service.generate_answer(question, collection)
        except Exception as e:
            raise Exception(f"Error generating answer with {provider}: {str(e)}")

# Create a singleton instance
vector_search_factory = VectorSearchFactory() 