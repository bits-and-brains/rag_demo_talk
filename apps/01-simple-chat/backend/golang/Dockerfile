FROM golang:1.21-alpine

WORKDIR /app

# Expose port
EXPOSE 8004

# Install dependencies and build the application
CMD ["sh", "-c", "go mod download && go mod tidy && go build -o main ./src && ./main"] 