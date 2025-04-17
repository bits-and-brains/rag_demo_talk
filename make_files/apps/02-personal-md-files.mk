# Build personal MD files application
.PHONY: personal-md-files-build
personal-md-files-build: check-docker check-docker-compose
	@echo "$(YELLOW)Building personal MD files application...$(NC)"
	@echo "$(YELLOW)Building frontend...$(NC)"
	@cd apps/02-personal-md-files && docker-compose build frontend
	@echo "$(YELLOW)Building PHP backend...$(NC)"
	@cd apps/02-personal-md-files && docker-compose build backend-php
	@echo "$(YELLOW)Building Node.js backend...$(NC)"
	@cd apps/02-personal-md-files && docker-compose build backend-nodejs
	@echo "$(YELLOW)Building Python backend...$(NC)"
	@cd apps/02-personal-md-files && docker-compose build backend-python
	@echo "$(YELLOW)Building Golang backend...$(NC)"
	@cd apps/02-personal-md-files && docker-compose build backend-golang
	@echo "$(GREEN)Personal MD files application built successfully!$(NC)"

# Start personal MD files application
.PHONY: personal-md-files-start
personal-md-files-start: check-docker check-docker-compose check-ollama
	@echo "$(YELLOW)Starting personal MD files application...$(NC)"
	@echo "$(YELLOW)Starting frontend on port 3001...$(NC)"
	@cd apps/02-personal-md-files && docker-compose up -d frontend
	@echo "$(YELLOW)Starting PHP backend on port 8005...$(NC)"
	@cd apps/02-personal-md-files && docker-compose up -d backend-php
	@echo "$(YELLOW)Starting Node.js backend on port 8006...$(NC)"
	@cd apps/02-personal-md-files && docker-compose up -d backend-nodejs
	@echo "$(YELLOW)Starting Python backend on port 8007...$(NC)"
	@cd apps/02-personal-md-files && docker-compose up -d backend-python
	@echo "$(YELLOW)Starting Golang backend on port 8008...$(NC)"
	@cd apps/02-personal-md-files && docker-compose up -d backend-golang
	@echo "$(YELLOW)Waiting for services to be available...$(NC)"
	@$(call check-service,Frontend,http://localhost:3001)
	@$(call check-service,PHP Backend,http://localhost:8005)
	@$(call check-service,Node.js Backend,http://localhost:8006)
	@$(call check-service,Python Backend,http://localhost:8007)
	@$(call check-service,Golang Backend,http://localhost:8008)
	@echo "$(GREEN)Personal MD files application started successfully!$(NC)"
	@echo "$(BLUE)=================================================$(NC)"
	@echo "$(GREEN)All services are running:$(NC)"
	@echo "$(BLUE)• Frontend:$(NC) http://localhost:3001"
	@echo "$(BLUE)• PHP Backend:$(NC) http://localhost:8005"
	@echo "$(BLUE)• Node.js Backend:$(NC) http://localhost:8006"
	@echo "$(BLUE)• Python Backend:$(NC) http://localhost:8007"
	@echo "$(BLUE)• Golang Backend:$(NC) http://localhost:8008"
	@echo "$(BLUE)• Ollama:$(NC) http://localhost:11434"
	@echo "$(BLUE)=================================================$(NC)"

# Stop personal MD files application
.PHONY: personal-md-files-stop
personal-md-files-stop: check-docker check-docker-compose
	@echo "$(YELLOW)Stopping personal MD files application...$(NC)"
	@echo "$(YELLOW)Stopping frontend...$(NC)"
	@cd apps/02-personal-md-files && docker-compose stop frontend
	@echo "$(YELLOW)Stopping PHP backend...$(NC)"
	@cd apps/02-personal-md-files && docker-compose stop backend-php
	@echo "$(YELLOW)Stopping Node.js backend...$(NC)"
	@cd apps/02-personal-md-files && docker-compose stop backend-nodejs
	@echo "$(YELLOW)Stopping Python backend...$(NC)"
	@cd apps/02-personal-md-files && docker-compose stop backend-python
	@echo "$(YELLOW)Stopping Golang backend...$(NC)"
	@cd apps/02-personal-md-files && docker-compose stop backend-golang
	@cd apps/02-personal-md-files && docker-compose down
	@echo "$(GREEN)Personal MD files application stopped successfully!$(NC)"

# Restart personal MD files application
.PHONY: personal-md-files-restart
personal-md-files-restart: check-docker check-docker-compose check-ollama
	@echo "$(YELLOW)Restarting personal MD files application...$(NC)"
	@echo "$(YELLOW)Stopping all services...$(NC)"
	@cd apps/02-personal-md-files && docker-compose down
	@echo "$(YELLOW)Starting frontend on port 3001...$(NC)"
	@cd apps/02-personal-md-files && docker-compose up -d frontend
	@echo "$(YELLOW)Starting PHP backend on port 8005...$(NC)"
	@cd apps/02-personal-md-files && docker-compose up -d backend-php
	@echo "$(YELLOW)Starting Node.js backend on port 8006...$(NC)"
	@cd apps/02-personal-md-files && docker-compose up -d backend-nodejs
	@echo "$(YELLOW)Starting Python backend on port 8007...$(NC)"
	@cd apps/02-personal-md-files && docker-compose up -d backend-python
	@echo "$(YELLOW)Starting Golang backend on port 8008...$(NC)"
	@cd apps/02-personal-md-files && docker-compose up -d backend-golang
	@echo "$(YELLOW)Waiting for services to be available...$(NC)"
	@$(call check-service,Frontend,http://localhost:3001)
	@$(call check-service,PHP Backend,http://localhost:8005)
	@$(call check-service,Node.js Backend,http://localhost:8006)
	@$(call check-service,Python Backend,http://localhost:8007)
	@$(call check-service,Golang Backend,http://localhost:8008)
	@echo "$(GREEN)Personal MD files application restarted successfully!$(NC)"
	@echo "$(BLUE)=================================================$(NC)"
	@echo "$(GREEN)All services are running:$(NC)"
	@echo "$(BLUE)• Frontend:$(NC) http://localhost:3001"
	@echo "$(BLUE)• PHP Backend:$(NC) http://localhost:8005"
	@echo "$(BLUE)• Node.js Backend:$(NC) http://localhost:8006"
	@echo "$(BLUE)• Python Backend:$(NC) http://localhost:8007"
	@echo "$(BLUE)• Golang Backend:$(NC) http://localhost:8008"
	@echo "$(BLUE)• Ollama:$(NC) http://localhost:11434"
	@echo "$(BLUE)=================================================$(NC)"
