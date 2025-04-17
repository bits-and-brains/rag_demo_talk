import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.controllers.chat_controller import ChatController
from src.services.llm_service import LLMService
from src.services.markdown_service import MarkdownService

# Load environment variables from .env file
load_dotenv()

# Create FastAPI app
app = FastAPI(title="Simple Chat Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3001").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
llm_service = LLMService()
markdown_service = MarkdownService()
chat_controller = ChatController(llm_service, markdown_service)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Personal MD Files Backend"}

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
    port = int(os.getenv("PORT", 8003))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True) 