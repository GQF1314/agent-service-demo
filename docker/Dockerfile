# Use AWS ECR Public mirror to avoid Docker Hub rate limits
FROM public.ecr.aws/docker/library/node:22-alpine


WORKDIR /app

# Install base tools; avoid git requirement by passing build args from host
RUN apk add --no-cache ca-certificates curl python3 make g++ libc6-compat

# Allow overriding npm registry to avoid regional/GFW issues
ARG NPM_REGISTRY=https://registry.npmjs.org/
RUN npm config set registry "$NPM_REGISTRY"

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm \
    && pnpm config set registry "$NPM_REGISTRY"
RUN pnpm install

# Copy source code
COPY . .

# Build metadata (provided by build args)
ARG GIT_HASH="unknown"
ARG GIT_BRANCH="unknown"
ARG BUILD_TIME="unknown"
RUN echo "{\"gitHash\":\"$GIT_HASH\",\"gitBranch\":\"$GIT_BRANCH\",\"buildTime\":\"$BUILD_TIME\"}" > build-info.json

# Build the application
RUN pnpm run build

# Verify build-info.json exists
RUN cat build-info.json

# Load environment variables from .env file and start the application
CMD ["sh", "-c", "set -a && set +a && pnpm run deploy"] 
