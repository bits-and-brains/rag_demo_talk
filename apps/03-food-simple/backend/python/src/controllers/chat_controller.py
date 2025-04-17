from typing import Dict, Any
from ..services.llm_service import LLMService
from ..services.markdown_service import MarkdownService
from ..services.embedding_service import EmbeddingService
from ..services.vector_search.vector_search_factory import vector_search_factory

class ChatController:
    """Controller for chat functionality"""
    
    def __init__(self, llm_service: LLMService, markdown_service: MarkdownService, embedding_service: EmbeddingService):
        self.llm_service = llm_service
        self.markdown_service = markdown_service
        self.embedding_service = embedding_service
    
    async def chat(self, data: Dict[str, Any]) -> Dict[str, str]:
        """Handle chat message requests"""
        if "message" not in data:
            raise Exception("Message is required")
        
        message = data['message']
        provider = data.get('provider', 'ollama')
        embedding_model = data.get('embeddingModel', 'ollama')
        vector_search_provider = data.get('vectorSearchProvider', 'qdrant')
        
        try:
            context = ''
            
            # Get embedding for the message if needed
            if vector_search_factory.requires_embedding(vector_search_provider):
                embedding = await self.embedding_service.get_embedding(message, embedding_model)
                collection_name = f"recipes-{embedding_model}"
                search_results = await vector_search_factory.search_by_vector(
                    embedding, collection_name, vector_search_provider
                )
                # Extract filenames from search results
                # The search_results might be a list of strings (filenames) or a list of dictionaries
                if search_results and isinstance(search_results[0], dict):
                    relevant_recipe_filenames = [result['filename'] for result in search_results]
                else:
                    # If search_results is already a list of filenames
                    relevant_recipe_filenames = search_results
                
                relevant_recipes = await self.markdown_service.read_markdown_files_by_names(relevant_recipe_filenames)
                context = '\n\n'.join(
                    f"<{recipe['filename']}>{recipe['content']}</{recipe['filename']}>"
                    for recipe in relevant_recipes
                )
            else:
                # For other providers, use hardcoded collection names and get content directly
                collection_name = 'Recipe' if vector_search_provider == 'weaviate' else 'recipes'
                search_results = await vector_search_factory.search_by_text(
                    message, collection_name, vector_search_provider, 5, True
                )
                context = '\n\n'.join(result['content'] for result in search_results)
            
            # Generate prompt with the relevant recipes
            prompt = self.generate_prompt(message, context)
            
            # Generate response using the selected LLM provider
            response = await self.llm_service.send_message(prompt, provider)
            
            return {'response': response}
        except Exception as e:
            raise Exception(f"Failed to generate response: {str(e)}")
    
    def generate_prompt(self, message: str, context: str) -> str:
        """Generate the prompt for the LLM"""
        return f"""You are an expert chef with extensive experience working in kitchens around the world. 
You have a deep knowledge of cooking techniques, ingredients, and culinary traditions from various cultures.

You are given a question about cooking or recipes and relevant recipe information. 
Please answer the question based ONLY on the information provided in the context.

You do not generate any information outside of the context.
If you do not have enough information to answer this question, just say "I do not have enough information to answer this question."

<question>{message}</question>

<context>{context}</context>"""
    
    def providers(self) -> Dict[str, Any]:
        """Get available LLM providers"""
        try:
            providers = self.llm_service.get_available_providers()
            return {'providers': providers}
        except Exception as e:
            raise Exception(f"Failed to get providers: {str(e)}")
    
    def embedding_models(self) -> Dict[str, Any]:
        """Get available embedding models"""
        try:
            models = self.embedding_service.get_available_providers()
            return {'models': models}
        except Exception as e:
            raise Exception(f"Failed to get embedding models: {str(e)}")
    
    def vector_search_providers(self) -> Dict[str, Any]:
        """Get available vector search providers"""
        try:
            providers = vector_search_factory.get_available_providers()
            return {'providers': providers}
        except Exception as e:
            raise Exception(f"Failed to get vector search providers: {str(e)}")
    
    def switch_provider(self, data: Dict[str, Any]) -> Dict[str, str]:
        """Switch the current LLM provider"""
        if "provider" not in data:
            raise Exception("Provider is required")
        
        provider = data['provider']
        
        if not self.llm_service.is_provider_available(provider):
            raise Exception("Provider not available")
        
        return {'message': 'Provider switched successfully'}