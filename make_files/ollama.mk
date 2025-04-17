# Check if Ollama is running
.PHONY: check-ollama
check-ollama:
	@if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then \
		echo "$(RED)Ollama is not running. Please run 'make setup-ollama' first.$(NC)"; \
		exit 1; \
	fi

# Setup Ollama
.PHONY: setup-ollama
setup-ollama:
	@echo "$(YELLOW)Checking Ollama installation...$(NC)"
	@if ! command -v ollama >/dev/null 2>&1; then \
		echo "$(YELLOW)Ollama not found. Installing...$(NC)"; \
		if [[ "$(shell uname)" == "Linux" ]]; then \
			curl -fsSL https://ollama.com/install.sh | sh; \
		elif [[ "$(shell uname)" == "Darwin" ]]; then \
			brew install ollama; \
		else \
			echo "$(RED)Unsupported operating system. Please install Ollama manually.$(NC)"; \
			exit 1; \
		fi \
	else \
		echo "$(GREEN)Ollama is already installed.$(NC)"; \
	fi
	@echo "$(YELLOW)Stopping any existing Ollama service...$(NC)"
	@-sudo systemctl stop ollama 2>/dev/null || true
	@-pkill ollama 2>/dev/null || true
	@echo "$(YELLOW)Starting Ollama service with Docker-compatible configuration...$(NC)"
	@OLLAMA_HOST=0.0.0.0:11434 ollama serve &
	@sleep 5
	@if ! curl -s http://localhost:11434/api/tags | grep -q "llama2"; then \
		echo "$(YELLOW)Pulling Llama2 model...$(NC)"; \
		ollama pull llama2; \
	else \
		echo "$(GREEN)Llama2 model is already installed.$(NC)"; \
	fi
	@if ! curl -s http://localhost:11434/api/tags | grep -q "nomic-embed-text"; then \
		echo "$(YELLOW)Pulling nomic-embed-text model for embeddings...$(NC)"; \
		ollama pull nomic-embed-text; \
	else \
		echo "$(GREEN)nomic-embed-text model is already installed.$(NC)"; \
	fi
	@echo "$(GREEN)Ollama setup completed successfully!$(NC)"
	@echo "$(GREEN)Ollama is now listening on 0.0.0.0:11434$(NC)"

# Restart Ollama
.PHONY: restart-ollama
restart-ollama:
	@echo "$(YELLOW)Restarting Ollama service...$(NC)"
	@-sudo systemctl stop ollama 2>/dev/null || true
	@-pkill ollama 2>/dev/null || true
	@echo "$(YELLOW)Starting Ollama service with Docker-compatible configuration...$(NC)"
	@OLLAMA_HOST=0.0.0.0:11434 ollama serve &
	@sleep 5
	@echo "$(GREEN)Ollama restarted successfully!$(NC)"
	@echo "$(GREEN)Ollama is now listening on 0.0.0.0:11434$(NC)"
