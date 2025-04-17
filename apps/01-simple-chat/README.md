# Simple Chat Application

A simple chat application that demonstrates integration with multiple LLM providers (OpenAI, Google Gemini, and Ollama). The application consists of a single frontend and multiple backend implementations in different languages.

## Features

- Real-time chat interface with Markdown support
- Multiple LLM provider support (OpenAI, Google Gemini, Ollama)
- Responsive design with Tailwind CSS
- Docker-based deployment
- Multiple backend implementations:
  - PHP (Port 8001)
  - Node.js (Port 8002)
  - Python (Port 8003)
  - Golang (Port 8004)

## Prerequisites

- Docker and Docker Compose
- Git
- Make (for using the Makefile)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rag_demo.git
cd rag_demo
```

2. Create environment files:
```bash
# Frontend
cp apps/01-simple-chat/frontend/.env.example apps/01-simple-chat/frontend/.env

# Backend (PHP)
cp apps/01-simple-chat/backend/php/.env.example apps/01-simple-chat/backend/php/.env

# Backend (Node.js)
cp apps/01-simple-chat/backend/nodejs/.env.example apps/01-simple-chat/backend/nodejs/.env

# Backend (Python)
cp apps/01-simple-chat/backend/python/.env.example apps/01-simple-chat/backend/python/.env

# Backend (Golang)
cp apps/01-simple-chat/backend/golang/.env.example apps/01-simple-chat/backend/golang/.env
```

3. Edit the environment files to add your API keys and configuration:

### Frontend (.env)
```
VITE_PHP_API_URL=http://localhost:8001
VITE_NODE_API_URL=http://localhost:8002
VITE_PYTHON_API_URL=http://localhost:8003
VITE_GOLANG_API_URL=http://localhost:8004
VITE_DEFAULT_PROVIDER=ollama
```

### Backend (.env) - Required for all backends
```
PORT=<backend_port>
CORS_ALLOWED_ORIGINS=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
OLLAMA_HOST=http://host.docker.internal:11434
OLLAMA_MODEL=llama2
OPENAI_MODEL=gpt-3.5-turbo
GEMINI_MODEL=gemini-2.0-flash
DEFAULT_PROVIDER=ollama
```

4. Start the application using the Makefile from the project root:
```bash
# Build all services
make build-simple

# Start all services
make start-simple

# To stop the services
make stop-simple
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend APIs: 
  - PHP: http://localhost:8001
  - Node.js: http://localhost:8002
  - Python: http://localhost:8003
  - Golang: http://localhost:8004

## Architecture

The application consists of:

- **Frontend**: React application with TypeScript and Tailwind CSS
- **Backend**: Multiple implementations (PHP, Node.js, Python, Golang)
- **LLM Services**: Integration with OpenAI, Google Gemini, and Ollama

## API Endpoints

All backends provide the same API endpoints:

- `POST /api/chat`: Send a message to the LLM
  ```json
  {
    "message": "Hello, how are you?",
    "provider": "openai"
  }
  ```
- `GET /api/providers`: Get available LLM providers
- `POST /api/switch-provider`: Switch the active LLM provider
  ```json
  {
    "provider": "openai"
  }
  ```

## Development

### Using Docker Compose

The application is designed to be run using Docker Compose from the project root directory. The Makefile provides convenient commands for common operations:

```bash
# Build all services
make build-simple

# Start all services
make start-simple

# Stop all services
make stop-simple

# Restart all services
make restart-simple

# Clean up Docker resources
make clean

## License

MIT 