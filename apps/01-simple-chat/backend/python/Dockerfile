FROM python:3.11-slim

WORKDIR /app

# Expose port
EXPOSE 8003

# Add the src directory to PYTHONPATH
ENV PYTHONPATH=/app/src

# Install dependencies and start the application
CMD ["sh", "-c", "pip install -r requirements.txt && uvicorn src.main:app --host 0.0.0.0 --port 8003 --reload"] 