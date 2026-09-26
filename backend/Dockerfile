# ====================
# Semua Bisa AI Backend - Multi-stage Dockerfile
# ====================

# ====================
# Stage: Development
# ====================
FROM golang:1.27.1-alpine3.24 AS dev

# Install development tools
RUN apk add --no-cache git sqlite

# Install Air for hot-reload
RUN go install github.com/air-verse/air@v1.67.4

# Install Goose for migrations
RUN go install github.com/pressly/goose/v3/cmd/goose@v3.28.0

# Install SQLC for code generation
RUN go install github.com/sqlc-dev/sqlc/cmd/sqlc@v1.31.1

WORKDIR /app

# Copy go.mod and go.sum first for caching
COPY go.mod go.sum* ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Create data directory
RUN mkdir -p /app/data

EXPOSE 8080

# Start with Air hot-reload
CMD ["air", "-c", ".air.toml"]

# ====================
# Stage: Builder
# ====================
FROM golang:1.27.1-alpine3.24 AS builder

WORKDIR /app

# Copy go.mod and go.sum first for caching
COPY go.mod go.sum* ./
RUN go mod download

# Copy source code
COPY . .

# Build with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/main ./cmd/server

# ====================
# Stage: Production
# ====================
FROM alpine:3.24.2 AS prod

# Install CA certificates for HTTPS and SQLite
RUN apk --no-cache add ca-certificates sqlite

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/main .

# Copy migrations for runtime migration
COPY --from=builder /app/sql/migrations ./sql/migrations

# Create data directory
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data

# Switch to non-root user
USER appuser

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

CMD ["./main"]
