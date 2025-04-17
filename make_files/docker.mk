
# Check Docker installation
.PHONY: check-docker
check-docker:
	$(call check-command,docker)

# Check Docker Compose installation
.PHONY: check-docker-compose
check-docker-compose:
	$(call check-command,docker-compose)


# Clean up Docker resources
.PHONY: clean
clean:
	@echo "$(YELLOW)Cleaning up Docker resources...$(NC)"
	@echo "$(YELLOW)Removing unused containers, networks, images...$(NC)"
	@docker system prune -f
	@echo "$(GREEN)Cleanup completed successfully!$(NC)" 