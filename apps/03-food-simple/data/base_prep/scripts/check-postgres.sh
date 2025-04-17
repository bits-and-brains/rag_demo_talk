#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the absolute path to the docker-compose.yml file
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DOCKER_COMPOSE_PATH="$SCRIPT_DIR/../../../docker-compose.yml"
COMPOSE_PROJECT_NAME="03-food-simple"

# Debug information
echo -e "${YELLOW}Debug Information:${NC}"
echo -e "Script directory: ${SCRIPT_DIR}"
echo -e "Docker compose path: ${DOCKER_COMPOSE_PATH}"
echo -e "Current working directory: $(pwd)"

# Get PostgreSQL container ID
get_postgres_container() {
    local container_id
    # Try to find the container using the project name prefix
    container_id=$(docker ps --filter "name=${COMPOSE_PROJECT_NAME}_postgres" --format "{{.ID}}")
    if [ -z "$container_id" ]; then
        # Fallback to just postgres if project name doesn't match
        container_id=$(docker ps --filter "name=postgres" --format "{{.ID}}")
        if [ -z "$container_id" ]; then
            echo -e "${RED}Error: Could not find PostgreSQL container${NC}"
            echo -e "${YELLOW}Running containers:${NC}"
            docker ps
            return 1
        fi
    fi
    echo "$container_id"
}

# Check PostgreSQL
check_postgres() {
    local max_attempts=30
    local attempt=1
    local container_id

    echo -e "${YELLOW}Checking PostgreSQL connection...${NC}"
    
    # Get container ID
    container_id=$(get_postgres_container)
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    echo -e "${YELLOW}Found PostgreSQL container: ${container_id}${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        echo -e "${YELLOW}Attempt $attempt/$max_attempts: Trying to connect to PostgreSQL...${NC}"
        
        # Try to connect using docker exec
        if docker exec -i "$container_id" psql -U postgres -d vectordb -c "SELECT 1;" 2>&1; then
            echo -e "${GREEN}PostgreSQL is running!${NC}"
            return 0
        else
            echo -e "${YELLOW}Connection attempt failed. Error:${NC}"
            docker exec -i "$container_id" psql -U postgres -d vectordb -c "SELECT 1;" 2>&1
        fi
        
        echo -e "${YELLOW}Waiting 2 seconds before next attempt...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e "${RED}PostgreSQL failed to start after $max_attempts attempts${NC}"
    return 1
}

# Check vectorizer worker
check_vectorizer() {
    local max_attempts=30
    local attempt=1

    echo -e "${YELLOW}Checking vectorizer worker...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        echo -e "${YELLOW}Attempt $attempt/$max_attempts: Checking vectorizer worker status...${NC}"
        
        # Check if the container exists and is running
        if docker ps | grep -q "${COMPOSE_PROJECT_NAME}_vectorizer-worker\|vectorizer-worker"; then
            echo -e "${GREEN}Vectorizer worker is running!${NC}"
            return 0
        else
            echo -e "${YELLOW}Vectorizer worker not found in running containers.${NC}"
            echo -e "${YELLOW}Current running containers:${NC}"
            docker ps
        fi
        
        echo -e "${YELLOW}Waiting 2 seconds before next attempt...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e "${RED}Vectorizer worker failed to start after $max_attempts attempts${NC}"
    return 1
}

# Main check
echo -e "${YELLOW}Starting PostgreSQL service checks...${NC}"

# Check if docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker is not running.${NC}"
    exit 1
fi

# Check if PostgreSQL container is running
if ! docker ps | grep -q "${COMPOSE_PROJECT_NAME}_postgres\|postgres"; then
    echo -e "${RED}Error: PostgreSQL container is not running.${NC}"
    echo -e "${YELLOW}Current running containers:${NC}"
    docker ps
    exit 1
fi

# Check PostgreSQL
if ! check_postgres; then
    echo -e "${RED}PostgreSQL check failed${NC}"
    exit 1
fi

# Check vectorizer worker
if ! check_vectorizer; then
    echo -e "${RED}Vectorizer worker check failed${NC}"
    exit 1
fi

echo -e "${GREEN}All PostgreSQL services are running correctly!${NC}"
exit 0 