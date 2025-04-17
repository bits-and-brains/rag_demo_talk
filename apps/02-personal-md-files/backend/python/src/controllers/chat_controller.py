from typing import Dict, Any
from ..services.llm_service import LLMService
from ..services.markdown_service import MarkdownService

class ChatController:
    """Controller for chat functionality"""
    
    def __init__(self, llm_service:LLMService, markdown_service:MarkdownService):
        self.llm_service = llm_service
        self.markdown_service = markdown_service
    
    async def chat(self, data: Dict[str, Any]) -> Dict[str, str]:
        """Handle chat message requests"""
        if "message" not in data:
            raise Exception("Message is required")
        
        message = data['message']
        provider = data.get('provider', 'ollama')
        
        try:
            # Get all markdown files content
            markdown_files = self.markdown_service.read_all_markdown_files()

            # Generate prompt with user message and context
            prompt = self.generate_prompt(message, markdown_files)

            # Send the prompt to the LLM service
            response = await self.llm_service.send_message(prompt, provider)

            return {'response': response}
        except Exception as e:
            raise Exception(f"Failed to generate response: {str(e)}")
    


    def generate_prompt(self, message, markdown_files) -> str:
        static_text = """You are a helpful team lead. You are given a question and  information about the team members. Please answer the question based on the information provided.
      You provide answer only based on the information provided in the context.
      You do not generate any information outside of the context.
      If you do not know the answer, just say "I do not know"."""
        
        question_part = f"<question>{message}</question>"
        
        context_part = '<context>'
        for file in markdown_files:
            context_part += f"<{file['filename']}>"
            context_part += file['content']
            context_part += f"</{file['filename']}>"
        context_part += '</context>'
        
        return f"{static_text}\n\n{question_part}\n\n{context_part}"

    def providers(self) -> Dict[str, str]:
        try:
            providers = self.llm_service.get_available_providers()
            return {'providers': providers}
        except Exception as e:
            raise Exception(f"Failed to get providers: {str(e)}")

    def switch_provider(self, data: Dict[str, Any]) -> Dict[str, str]:
        """Switch the current LLM provider"""
        if "provider" not in data:
            raise Exception("Provider is required")
        
        provider = data['provider']

        if not self.llm_service.is_provider_available(provider):
            raise Exception("Provider not available")

        return {'message': 'Provider switched successfully'}