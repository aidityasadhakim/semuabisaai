# ====================
# Fastship Frontend - Multi-stage Dockerfile
# ====================

# ====================
# Stage: Development
# ====================
FROM oven/bun:1 AS dev

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

EXPOSE 3000

# Start Vite dev server with host flag for Docker networking
CMD ["bun", "run", "dev", "--host"]

# ====================
# Stage: Builder
# ====================
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install all dependencies (including devDependencies)
RUN bun install

# Copy source code
COPY . .

# Build for production
RUN bun run build

# ====================
# Stage: Distribution (Static files only)
# ====================
FROM scratch AS dist

# Copy only the built static files
# This stage is designed to be used with an external web server like Caddy
COPY --from=builder /app/dist /
