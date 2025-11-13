# Google Cloud Run Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache ca-certificates curl python3 make g++ libc6-compat

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Create build-info.json with minimal info
RUN echo '{"gitHash":"cloud-run","gitBranch":"main","buildTime":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > build-info.json

# Cloud Run sets PORT environment variable
ENV NODE_ENV=production

# Use exec form to ensure proper signal handling
CMD ["sh", "-c", "NODE_ENV=production node dist/src/ecs-server.js"]
