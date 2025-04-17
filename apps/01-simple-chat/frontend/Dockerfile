FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Expose port 3000
EXPOSE 3000

# Install dependencies and start development server
CMD ["sh", "-c", "pnpm install && pnpm run dev --host"] 