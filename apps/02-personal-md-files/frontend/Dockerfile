FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Expose port 3001
EXPOSE 3001

# Install dependencies and start development server
CMD ["sh", "-c", "pnpm install && pnpm run dev --host"] 