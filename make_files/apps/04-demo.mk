# Build demo application
.PHONY: demo-build
demo-build: check-docker check-docker-compose
	@echo "$(YELLOW)Building demo application...$(NC)"
	@echo "$(YELLOW)Installing frontend dependencies...$(NC)"
	@cd apps/04-demo/frontend && bun install
	@echo "$(YELLOW)Installing backend dependencies...$(NC)"
	@cd apps/04-demo/backend && bun install
	@echo "$(YELLOW)Building Docker services...$(NC)"
	@cd apps/04-demo && docker-compose build
	@echo "$(GREEN)Demo application built successfully!$(NC)"

# Start Docker services
.PHONY: demo-docker-start
demo-docker-start: check-docker check-docker-compose
	@echo "$(YELLOW)Starting Docker services...$(NC)"
	@cd apps/04-demo && docker-compose up -d
	@echo "$(GREEN)Docker services started successfully!$(NC)"

# Stop Docker services
.PHONY: demo-docker-stop
demo-docker-stop: check-docker check-docker-compose
	@echo "$(YELLOW)Stopping Docker services...$(NC)"
	@cd apps/04-demo && docker-compose down
	@echo "$(GREEN)Docker services stopped successfully!$(NC)"

# Start backend server
.PHONY: demo-backend-start
demo-backend-start:
	@echo "$(YELLOW)Starting backend server...$(NC)"
	@cd apps/04-demo/backend && nohup bun server.ts > backend.log 2>&1 & echo $$! > backend.pid
	@echo "$(YELLOW)Waiting for backend to be available...$(NC)"
	@$(call check-service,Backend,http://localhost:3001)
	@echo "$(GREEN)Backend server started successfully!$(NC)"

# Stop backend server
.PHONY: demo-backend-stop
demo-backend-stop:
	@echo "$(YELLOW)Stopping backend server...$(NC)"
	@-if [ -f apps/04-demo/backend/backend.pid ]; then \
		kill $$(cat apps/04-demo/backend/backend.pid) 2>/dev/null || true; \
		rm apps/04-demo/backend/backend.pid; \
	fi
	@echo "$(GREEN)Backend server stopped successfully!$(NC)"

# Start frontend server
.PHONY: demo-frontend-start
demo-frontend-start:
	@echo "$(YELLOW)Starting frontend development server...$(NC)"
	@cd apps/04-demo/frontend && nohup bun dev > frontend.log 2>&1 & echo $$! > frontend.pid
	@echo "$(YELLOW)Waiting for frontend to be available...$(NC)"
	@$(call check-service,Frontend,http://localhost:3000)
	@echo "$(GREEN)Frontend server started successfully!$(NC)"

# Stop frontend server
.PHONY: demo-frontend-stop
demo-frontend-stop:
	@echo "$(YELLOW)Stopping frontend development server...$(NC)"
	@-if [ -f apps/04-demo/frontend/frontend.pid ]; then \
		kill $$(cat apps/04-demo/frontend/frontend.pid) 2>/dev/null || true; \
		rm apps/04-demo/frontend/frontend.pid; \
	fi
	@echo "$(GREEN)Frontend server stopped successfully!$(NC)"

# Start all demo services
.PHONY: demo-start
demo-start: demo-docker-start demo-backend-start demo-frontend-start
	@echo "$(GREEN)Demo application started successfully!$(NC)"
	@echo "$(BLUE)=================================================$(NC)"
	@echo "$(GREEN)All services are running:$(NC)"
	@echo "$(BLUE)• Frontend:$(NC) http://localhost:3000"
	@echo "$(BLUE)• Backend:$(NC) http://localhost:3001"
	@echo "$(BLUE)• Docker services are running$(NC)"
	@echo "$(BLUE)=================================================$(NC)"

# Stop all demo services
.PHONY: demo-stop
demo-stop: demo-docker-stop demo-backend-stop demo-frontend-stop
	@echo "$(GREEN)Demo application stopped successfully!$(NC)"

# Restart all demo services
.PHONY: demo-restart
demo-restart: demo-stop demo-start
	@echo "$(GREEN)Demo application restarted successfully!$(NC)"

# Show demo logs
.PHONY: demo-logs
demo-logs:
	@echo "$(YELLOW)Showing demo application logs...$(NC)"
	@echo "$(BLUE)Frontend logs:$(NC)"
	@tail -f apps/04-demo/frontend/frontend.log
	@echo "$(BLUE)Backend logs:$(NC)"
	@tail -f apps/04-demo/backend/backend.log
