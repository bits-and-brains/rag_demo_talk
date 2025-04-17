import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.controllers.chat_controller import ChatController
from src.services.llm_service import LLMService
from src.services.markdown_service import MarkdownService
from src.services.embedding_service import EmbeddingService

# Load environment variables from .env file
load_dotenv()

# Create FastAPI app
app = FastAPI(title="Simple Chat Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3002").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
llm_service = LLMService()
markdown_service = MarkdownService()
embedding_service = EmbeddingService()
chat_controller = ChatController(llm_service, markdown_service, embedding_service)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Simple food example"}

@app.post("/api/chat")
async def chat(request: Request):
    """Chat endpoint"""
    try:
        data = await request.json()
        result = await chat_controller.chat(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/providers")
async def providers():
    """Get available providers endpoint"""
    try:
        result = chat_controller.providers()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/embedding-models")
async def embedding_models():
    """Get available embedding models endpoint"""
    try:
        result = chat_controller.embedding_models()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/vector-search-providers")
async def vector_search_providers():
    """Get available vector search providers endpoint"""
    try:
        result = chat_controller.vector_search_providers()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/switch-provider")
async def switch_provider(request: Request):
    """Switch provider endpoint"""
    try:
        data = await request.json()
        result = chat_controller.switch_provider(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8012))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
