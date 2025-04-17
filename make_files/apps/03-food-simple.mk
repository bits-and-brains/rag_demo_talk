# Build food simple application
.PHONY: food-simple-build
food-simple-build: check-docker check-docker-compose
	@echo "$(YELLOW)Building food simple application...$(NC)"
	@echo "$(YELLOW)Building frontend...$(NC)"
	@cd apps/03-food-simple && docker-compose build frontend
	@echo "$(YELLOW)Building PHP backend...$(NC)"
	@cd apps/03-food-simple && docker-compose build backend-php
	@echo "$(YELLOW)Building Node.js backend...$(NC)"
	@cd apps/03-food-simple && docker-compose build backend-nodejs
	@echo "$(YELLOW)Building Python backend...$(NC)"
	@cd apps/03-food-simple && docker-compose build backend-python
	@echo "$(YELLOW)Building Golang backend...$(NC)"
	@cd apps/03-food-simple && docker-compose build backend-golang
	@echo "$(YELLOW)Building vector databases...$(NC)"
	@cd apps/03-food-simple && docker-compose build weaviate qdrant postgres elasticsearch vectorizer-worker
	@echo "$(GREEN)Food simple application built successfully!$(NC)"

# Check PostgreSQL services
.PHONY: check-postgres
check-postgres:
	@echo "$(YELLOW)Checking PostgreSQL services...$(NC)"
	@cd apps/03-food-simple/data/base_prep/scripts && ./check-postgres.sh

# Start food simple application
.PHONY: food-simple-start
food-simple-start: check-docker check-docker-compose check-ollama
	@echo "$(YELLOW)Starting vector databases...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d weaviate qdrant postgres vectorizer-worker elasticsearch
	@echo "$(YELLOW)Starting food simple application...$(NC)"
	@echo "$(YELLOW)Starting frontend on port 3002...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d frontend
	@echo "$(YELLOW)Starting PHP backend on port 8010...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d backend-php
	@echo "$(YELLOW)Starting Node.js backend on port 8011...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d backend-nodejs
	@echo "$(YELLOW)Starting Python backend on port 8012...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d backend-python
	@echo "$(YELLOW)Starting Golang backend on port 8013...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d backend-golang
	@echo "$(YELLOW)Waiting for services to be available...$(NC)"
	@$(call check-service,Frontend,http://localhost:3002)
	@$(call check-service,PHP Backend,http://localhost:8010)
	@$(call check-service,Node.js Backend,http://localhost:8011)
	@$(call check-service,Python Backend,http://localhost:8012)
	@$(call check-service,Golang Backend,http://localhost:8013)
	@$(call check-service,Weaviate,http://localhost:8080)
	@$(call check-service,Qdrant,http://localhost:6333)
	@$(call check-service,Elasticsearch,http://localhost:9200)
	@make check-postgres
	@echo "$(GREEN)Food simple application started successfully!$(NC)"
	@echo "$(BLUE)=================================================$(NC)"
	@echo "$(GREEN)All services are running:$(NC)"
	@echo "$(BLUE)• Frontend:$(NC) http://localhost:3002"
	@echo "$(BLUE)• PHP Backend:$(NC) http://localhost:8010"
	@echo "$(BLUE)• Node.js Backend:$(NC) http://localhost:8011"
	@echo "$(BLUE)• Python Backend:$(NC) http://localhost:8012"
	@echo "$(BLUE)• Golang Backend:$(NC) http://localhost:8013"
	@echo "$(BLUE)• Ollama:$(NC) http://localhost:11434"
	@echo "$(BLUE)• Weaviate:$(NC) http://localhost:8080"
	@echo "$(BLUE)• Qdrant:$(NC) http://localhost:6333"
	@echo "$(BLUE)• PostgreSQL:$(NC) localhost:5460"
	@echo "$(BLUE)• Vectorizer Worker:$(NC) Running"
	@echo "$(BLUE)• Elasticsearch:$(NC) http://localhost:9200"
	@echo "$(BLUE)=================================================$(NC)"

# Stop food simple application
.PHONY: food-simple-stop
food-simple-stop: check-docker check-docker-compose
	@echo "$(YELLOW)Stopping vector databases...$(NC)"
	@cd apps/03-food-simple && docker-compose stop weaviate qdrant postgres vectorizer-worker elasticsearch
	@echo "$(YELLOW)Stopping food simple application...$(NC)"
	@echo "$(YELLOW)Stopping frontend...$(NC)"
	@cd apps/03-food-simple && docker-compose stop frontend
	@echo "$(YELLOW)Stopping PHP backend...$(NC)"
	@cd apps/03-food-simple && docker-compose stop backend-php
	@echo "$(YELLOW)Stopping Node.js backend...$(NC)"
	@cd apps/03-food-simple && docker-compose stop backend-nodejs
	@echo "$(YELLOW)Stopping Python backend...$(NC)"
	@cd apps/03-food-simple && docker-compose stop backend-python
	@echo "$(YELLOW)Stopping Golang backend...$(NC)"
	@cd apps/03-food-simple && docker-compose stop backend-golang
	@cd apps/03-food-simple && docker-compose down
	@echo "$(GREEN)Food simple application stopped successfully!$(NC)"

# Restart food simple application
.PHONY: food-simple-restart
food-simple-restart: check-docker check-docker-compose check-ollama
	@echo "$(YELLOW)Restarting food simple application...$(NC)"
	@echo "$(YELLOW)Stopping all services...$(NC)"
	@cd apps/03-food-simple && docker-compose down
	@echo "$(YELLOW)Starting vector databases...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d weaviate qdrant postgres vectorizer-worker elasticsearch
	@echo "$(YELLOW)Starting frontend on port 3002...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d frontend
	@echo "$(YELLOW)Starting PHP backend on port 8010...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d backend-php
	@echo "$(YELLOW)Starting Node.js backend on port 8011...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d backend-nodejs
	@echo "$(YELLOW)Starting Python backend on port 8012...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d backend-python
	@echo "$(YELLOW)Starting Golang backend on port 8013...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d backend-golang
	@echo "$(YELLOW)Waiting for services to be available...$(NC)"
	@$(call check-service,Frontend,http://localhost:3002)
	@$(call check-service,PHP Backend,http://localhost:8010)
	@$(call check-service,Node.js Backend,http://localhost:8011)
	@$(call check-service,Python Backend,http://localhost:8012)
	@$(call check-service,Golang Backend,http://localhost:8013)
	@$(call check-service,Weaviate,http://localhost:8080)
	@$(call check-service,Qdrant,http://localhost:6333)
	@$(call check-service,Elasticsearch,http://localhost:9200)
	@make check-postgres
	@echo "$(GREEN)Food simple application restarted successfully!$(NC)"
	@echo "$(BLUE)=================================================$(NC)"
	@echo "$(GREEN)All services are running:$(NC)"
	@echo "$(BLUE)• Frontend:$(NC) http://localhost:3002"
	@echo "$(BLUE)• PHP Backend:$(NC) http://localhost:8010"
	@echo "$(BLUE)• Node.js Backend:$(NC) http://localhost:8011"
	@echo "$(BLUE)• Python Backend:$(NC) http://localhost:8012"
	@echo "$(BLUE)• Golang Backend:$(NC) http://localhost:8013"
	@echo "$(BLUE)• Ollama:$(NC) http://localhost:11434"
	@echo "$(BLUE)• Weaviate:$(NC) http://localhost:8080"
	@echo "$(BLUE)• Qdrant:$(NC) http://localhost:6333"
	@echo "$(BLUE)• PostgreSQL:$(NC) localhost:5460"
	@echo "$(BLUE)• Vectorizer Worker:$(NC) Running"
	@echo "$(BLUE)• Elasticsearch:$(NC) http://localhost:9200"
	@echo "$(BLUE)=================================================$(NC)"

# Populate Qdrant with recipe embeddings
.PHONY: food-simple-qdrant-populate
food-simple-qdrant-populate: check-docker check-docker-compose
	@echo "$(YELLOW)Ensuring Qdrant is running...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d qdrant
	@echo "$(YELLOW)Waiting for Qdrant to be available...$(NC)"
	@$(call check-service,Qdrant,http://localhost:6333)
	@echo "$(YELLOW)Installing dependencies for embedding generation...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm install
	@echo "$(YELLOW)Generating embeddings and populating Qdrant...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm run qdrant-propagation
	@echo "$(GREEN)Qdrant populated successfully with recipe embeddings!$(NC)"

# Recreate Qdrant collections and repopulate
.PHONY: food-simple-qdrant-recreate
food-simple-qdrant-recreate: check-docker check-docker-compose
	@echo "$(YELLOW)Ensuring Qdrant is running...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d qdrant
	@echo "$(YELLOW)Waiting for Qdrant to be available...$(NC)"
	@$(call check-service,Qdrant,http://localhost:6333)
	@echo "$(YELLOW)Installing dependencies for embedding generation...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm install
	@echo "$(YELLOW)Recreating collections and repopulating Qdrant...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm run qdrant-propagation -- --recreate
	@echo "$(GREEN)Qdrant collections recreated and repopulated successfully!$(NC)"

# Populate Qdrant with only Ollama model embeddings
.PHONY: food-simple-qdrant-ollama-populate
food-simple-qdrant-ollama-populate: check-docker check-docker-compose check-ollama
	@echo "$(YELLOW)Ensuring Qdrant is running...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d qdrant
	@echo "$(YELLOW)Waiting for Qdrant to be available...$(NC)"
	@$(call check-service,Qdrant,http://localhost:6333)
	@echo "$(YELLOW)Installing dependencies for embedding generation...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm install
	@echo "$(YELLOW)Generating Ollama embeddings and populating Qdrant...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm run qdrant-propagation -- --types=ollama
	@echo "$(GREEN)Qdrant populated successfully with Ollama embeddings!$(NC)"

# Recreate Ollama collection and repopulate
.PHONY: food-simple-qdrant-ollama-recreate
food-simple-qdrant-ollama-recreate: check-docker check-docker-compose check-ollama
	@echo "$(YELLOW)Ensuring Qdrant is running...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d qdrant
	@echo "$(YELLOW)Waiting for Qdrant to be available...$(NC)"
	@$(call check-service,Qdrant,http://localhost:6333)
	@echo "$(YELLOW)Installing dependencies for embedding generation...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm install
	@echo "$(YELLOW)Recreating Ollama collection and repopulating Qdrant...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm run qdrant-propagation -- --types=ollama --recreate
	@echo "$(GREEN)Qdrant Ollama collection recreated and repopulated successfully!$(NC)"

# Populate Weaviate with recipe embeddings
.PHONY: food-simple-weaviate-populate
food-simple-weaviate-populate: check-docker check-docker-compose
	@echo "$(YELLOW)Ensuring Weaviate is running...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d weaviate
	@echo "$(YELLOW)Waiting for Weaviate to be available...$(NC)"
	@$(call check-service,Weaviate,http://localhost:8080)
	@echo "$(YELLOW)Installing dependencies for embedding generation...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm install
	@echo "$(YELLOW)Generating embeddings and populating Weaviate...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm run weaviate-propagation
	@echo "$(GREEN)Weaviate populated successfully with recipe embeddings!$(NC)"

# Recreate Weaviate schema and repopulate
.PHONY: food-simple-weaviate-recreate
food-simple-weaviate-recreate: check-docker check-docker-compose
	@echo "$(YELLOW)Ensuring Weaviate is running...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d weaviate
	@echo "$(YELLOW)Waiting for Weaviate to be available...$(NC)"
	@$(call check-service,Weaviate,http://localhost:8080)
	@echo "$(YELLOW)Installing dependencies for embedding generation...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm install
	@echo "$(YELLOW)Recreating schema and repopulating Weaviate...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm run weaviate-propagation -- --recreate
	@echo "$(GREEN)Weaviate schema recreated and repopulated successfully!$(NC)"

# Populate PostgreSQL with recipe embeddings
.PHONY: food-simple-postgres-populate
food-simple-postgres-populate: check-docker check-docker-compose check-ollama
	@echo "$(YELLOW)Ensuring PostgreSQL is running...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d postgres vectorizer-worker
	@echo "$(YELLOW)Waiting for PostgreSQL services to be available...$(NC)"
	@make check-postgres
	@echo "$(YELLOW)Installing dependencies for embedding generation...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm install
	@echo "$(YELLOW)Generating embeddings and populating PostgreSQL...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm run postgres-propagation
	@echo "$(GREEN)PostgreSQL populated successfully with recipe embeddings!$(NC)"

# Recreate PostgreSQL schema and repopulate
.PHONY: food-simple-postgres-recreate
food-simple-postgres-recreate: check-docker check-docker-compose check-ollama
	@echo "$(YELLOW)Ensuring PostgreSQL is running...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d postgres vectorizer-worker
	@echo "$(YELLOW)Waiting for PostgreSQL services to be available...$(NC)"
	@make check-postgres
	@echo "$(YELLOW)Installing dependencies for embedding generation...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm install
	@echo "$(YELLOW)Recreating schema and repopulating PostgreSQL...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm run postgres-propagation -- --recreate
	@echo "$(GREEN)PostgreSQL schema recreated and repopulated successfully!$(NC)"

# Populate Elasticsearch with recipe embeddings
.PHONY: food-simple-elasticsearch-populate
food-simple-elasticsearch-populate: check-docker check-docker-compose check-ollama
	@echo "$(YELLOW)Ensuring Elasticsearch is running...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d elasticsearch
	@echo "$(YELLOW)Waiting for Elasticsearch to be available...$(NC)"
	@$(call check-service,Elasticsearch,http://localhost:9200)
	@echo "$(YELLOW)Installing dependencies for embedding generation...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm install
	@echo "$(YELLOW)Generating embeddings and populating Elasticsearch...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm run elasticsearch-propagation
	@echo "$(GREEN)Elasticsearch populated successfully with recipe embeddings!$(NC)"

# Recreate Elasticsearch index and repopulate
.PHONY: food-simple-elasticsearch-recreate
food-simple-elasticsearch-recreate: check-docker check-docker-compose check-ollama
	@echo "$(YELLOW)Ensuring Elasticsearch is running...$(NC)"
	@cd apps/03-food-simple && docker-compose up -d elasticsearch
	@echo "$(YELLOW)Waiting for Elasticsearch to be available...$(NC)"
	@$(call check-service,Elasticsearch,http://localhost:9200)
	@echo "$(YELLOW)Installing dependencies for embedding generation...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm install
	@echo "$(YELLOW)Recreating index and repopulating Elasticsearch...$(NC)"
	@cd apps/03-food-simple/data/base_prep && npm run elasticsearch-propagation -- --recreate
	@echo "$(GREEN)Elasticsearch index recreated and repopulated successfully!$(NC)"
