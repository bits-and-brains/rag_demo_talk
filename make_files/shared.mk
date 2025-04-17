# Colors for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Check if a command exists
check-command = @if ! command -v $(1) >/dev/null 2>&1; then \
	echo "$(RED)$(1) is not installed. Please install $(1) first.$(NC)"; \
	exit 1; \
	fi

# Check if a service is available
check-service = @echo "$(YELLOW)Waiting for $(1) to be available...$(NC)" && \
	for i in 1 2 3 4 5 6 7 8 9 10; do \
		if curl -s $(2) >/dev/null 2>&1; then \
			echo "$(GREEN)$(1) is available at $(2)$(NC)"; \
			break; \
		fi; \
		if [ $$i -eq 10 ]; then \
			echo "$(RED)$(1) is not available after 10 attempts.$(NC)"; \
			exit 1; \
		fi; \
		echo "$(YELLOW)Attempt $$i: $(1) is not available yet. Waiting...$(NC)"; \
		sleep 10; \
	done
