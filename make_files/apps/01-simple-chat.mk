
# Build simple chat application
.PHONY: simple-chat-build
simple-chat-build: check-docker check-docker-compose
	@echo "$(YELLOW)Building simple chat application...$(NC)"
	@echo "$(YELLOW)Building frontend...$(NC)"
	@cd apps/01-simple-chat && docker-compose build frontend
	@echo "$(YELLOW)Building PHP backend...$(NC)"
	@cd apps/01-simple-chat && docker-compose build backend-php
	@echo "$(YELLOW)Building Node.js backend...$(NC)"
	@cd apps/01-simple-chat && docker-compose build backend-nodejs
	@echo "$(YELLOW)Building Python backend...$(NC)"
	@cd apps/01-simple-chat && docker-compose build backend-python
	@echo "$(YELLOW)Building Golang backend...$(NC)"
	@cd apps/01-simple-chat && docker-compose build backend-golang
	@echo "$(GREEN)Simple chat application built successfully!$(NC)"

# Start simple chat application
.PHONY: simple-chat-start
simple-chat-start: check-docker check-docker-compose check-ollama
	@echo "$(YELLOW)Starting simple chat application...$(NC)"
	@echo "$(YELLOW)Starting frontend on port 3000...$(NC)"
	@cd apps/01-simple-chat && docker-compose up -d frontend
	@echo "$(YELLOW)Starting PHP backend on port 8001...$(NC)"
	@cd apps/01-simple-chat && docker-compose up -d backend-php
	@echo "$(YELLOW)Starting Node.js backend on port 8002...$(NC)"
	@cd apps/01-simple-chat && docker-compose up -d backend-nodejs
	@echo "$(YELLOW)Starting Python backend on port 8003...$(NC)"
	@cd apps/01-simple-chat && docker-compose up -d backend-python
	@echo "$(YELLOW)Starting Golang backend on port 8004...$(NC)"
	@cd apps/01-simple-chat && docker-compose up -d backend-golang
	@echo "$(YELLOW)Waiting for services to be available...$(NC)"
	@$(call check-service,Frontend,http://localhost:3000)
	@$(call check-service,PHP Backend,http://localhost:8001)
	@$(call check-service,Node.js Backend,http://localhost:8002)
	@$(call check-service,Python Backend,http://localhost:8003)
	@$(call check-service,Golang Backend,http://localhost:8004)
	@echo "$(GREEN)Simple chat application started successfully!$(NC)"
	@echo "$(BLUE)=================================================$(NC)"
	@echo "$(GREEN)All services are running:$(NC)"
	@echo "$(BLUE)• Frontend:$(NC) http://localhost:3000"
	@echo "$(BLUE)• PHP Backend:$(NC) http://localhost:8001"
	@echo "$(BLUE)• Node.js Backend:$(NC) http://localhost:8002"
	@echo "$(BLUE)• Python Backend:$(NC) http://localhost:8003"
	@echo "$(BLUE)• Golang Backend:$(NC) http://localhost:8004"
	@echo "$(BLUE)• Ollama:$(NC) http://localhost:11434"
	@echo "$(BLUE)=================================================$(NC)"

# Stop simple chat application
.PHONY: simple-chat-stop
simple-chat-stop: check-docker check-docker-compose
	@echo "$(YELLOW)Stopping simple chat application...$(NC)"
	@echo "$(YELLOW)Stopping frontend...$(NC)"
	@cd apps/01-simple-chat && docker-compose stop frontend
	@echo "$(YELLOW)Stopping PHP backend...$(NC)"
	@cd apps/01-simple-chat && docker-compose stop backend-php
	@echo "$(YELLOW)Stopping Node.js backend...$(NC)"
	@cd apps/01-simple-chat && docker-compose stop backend-nodejs
	@echo "$(YELLOW)Stopping Python backend...$(NC)"
	@cd apps/01-simple-chat && docker-compose stop backend-python
	@echo "$(YELLOW)Stopping Golang backend...$(NC)"
	@cd apps/01-simple-chat && docker-compose stop backend-golang
	@cd apps/01-simple-chat && docker-compose down
	@echo "$(GREEN)Simple chat application stopped successfully!$(NC)"

# Restart simple chat application
.PHONY: simple-chat-restart
simple-chat-restart: check-docker check-docker-compose check-ollama
	@echo "$(YELLOW)Restarting simple chat application...$(NC)"
	@echo "$(YELLOW)Stopping all services...$(NC)"
	@cd apps/01-simple-chat && docker-compose down
	@echo "$(YELLOW)Starting frontend on port 3000...$(NC)"
	@cd apps/01-simple-chat && docker-compose up -d frontend
	@echo "$(YELLOW)Starting PHP backend on port 8001...$(NC)"
	@cd apps/01-simple-chat && docker-compose up -d backend-php
	@echo "$(YELLOW)Starting Node.js backend on port 8002...$(NC)"
	@cd apps/01-simple-chat && docker-compose up -d backend-nodejs
	@echo "$(YELLOW)Starting Python backend on port 8003...$(NC)"
	@cd apps/01-simple-chat && docker-compose up -d backend-python
	@echo "$(YELLOW)Starting Golang backend on port 8004...$(NC)"
	@cd apps/01-simple-chat && docker-compose up -d backend-golang
	@echo "$(YELLOW)Waiting for services to be available...$(NC)"
	@$(call check-service,Frontend,http://localhost:3000)
	@$(call check-service,PHP Backend,http://localhost:8001)
	@$(call check-service,Node.js Backend,http://localhost:8002)
	@$(call check-service,Python Backend,http://localhost:8003)
	@$(call check-service,Golang Backend,http://localhost:8004)
	@echo "$(GREEN)Simple chat application restarted successfully!$(NC)"
	@echo "$(BLUE)=================================================$(NC)"
	@echo "$(GREEN)All services are running:$(NC)"
	@echo "$(BLUE)• Frontend:$(NC) http://localhost:3000"
	@echo "$(BLUE)• PHP Backend:$(NC) http://localhost:8001"
	@echo "$(BLUE)• Node.js Backend:$(NC) http://localhost:8002"
	@echo "$(BLUE)• Python Backend:$(NC) http://localhost:8003"
	@echo "$(BLUE)• Golang Backend:$(NC) http://localhost:8004"
	@echo "$(BLUE)• Ollama:$(NC) http://localhost:11434"
	@echo "$(BLUE)=================================================$(NC)"
