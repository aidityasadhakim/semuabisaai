# ================================
# Fastship - Makefile
# ================================
# A production-ready fullstack boilerplate
# https://github.com/yourusername/fastship

# ================================
# Configuration
# ================================
PROJECT_NAME ?= fastship
DB_PATH ?= ./data/$(PROJECT_NAME).db
MIGRATIONS_DIR ?= backend/sql/migrations

# Load .env if exists
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

.DEFAULT_GOAL := help

.PHONY: help dev dev-backend dev-frontend down logs logs-service restart status \
	goose-install db-migrate db-rollback db-status db-reset db-create \
	sqlc sqlc-install test test-backend test-frontend lint check \
	frontend-install frontend-build \
	prod-up prod-down prod-logs prod-rebuild \
	clean clean-volumes init

# ================================
# Local Development
# ================================

## Start all services with hot-reload (requires Docker)
dev:
	docker compose up --build

## Start all services in background
dev-detach:
	docker compose up --build -d

## Start backend only (local, no Docker)
dev-backend:
	@echo "Starting backend with hot-reload..."
	cd backend && air -c .air.toml

## Start frontend only (local, no Docker)
dev-frontend:
	@echo "Starting frontend dev server..."
	cd frontend && bun run dev

## Stop all services
down:
	docker compose down

## View all logs
logs:
	docker compose logs -f

## View specific service logs (usage: make logs-service SERVICE=backend)
logs-service:
	docker compose logs -f $(SERVICE)

## Restart a service (usage: make restart SERVICE=backend)
restart:
	docker compose restart $(SERVICE)

## Check service status
status:
	docker compose ps

# ================================
# Database Operations
# ================================

## Install goose CLI locally
goose-install:
	go install github.com/pressly/goose/v3/cmd/goose@latest

## Create database directory and file
db-create:
	@mkdir -p data
	@touch $(DB_PATH)
	@echo "Database created at $(DB_PATH)"

## Run database migrations (SQLite)
db-migrate:
	goose -dir $(MIGRATIONS_DIR) sqlite3 $(DB_PATH) up

## Rollback last migration
db-rollback:
	goose -dir $(MIGRATIONS_DIR) sqlite3 $(DB_PATH) down

## Check migration status
db-status:
	goose -dir $(MIGRATIONS_DIR) sqlite3 $(DB_PATH) status

## Reset database (rollback all + migrate)
db-reset:
	goose -dir $(MIGRATIONS_DIR) sqlite3 $(DB_PATH) reset
	goose -dir $(MIGRATIONS_DIR) sqlite3 $(DB_PATH) up

## Open SQLite shell
db-shell:
	sqlite3 $(DB_PATH)

# ================================
# Database Operations (PostgreSQL - if using Docker)
# ================================

## Run migrations in Docker (PostgreSQL)
db-migrate-docker:
	docker compose exec backend goose -dir /app/sql/migrations postgres "$(DATABASE_URL)" up

## Rollback migration in Docker (PostgreSQL)
db-rollback-docker:
	docker compose exec backend goose -dir /app/sql/migrations postgres "$(DATABASE_URL)" down

## Check migration status in Docker (PostgreSQL)
db-status-docker:
	docker compose exec backend goose -dir /app/sql/migrations postgres "$(DATABASE_URL)" status

## Open PostgreSQL shell in Docker
db-shell-docker:
	docker compose exec db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

# ================================
# Code Generation
# ================================

## Install sqlc CLI locally
sqlc-install:
	go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest

## Generate SQLC code (local)
sqlc:
	cd backend && sqlc generate

## Generate SQLC code (Docker)
sqlc-docker:
	docker compose exec backend sqlc generate

# ================================
# Code Quality
# ================================

## Run all tests
test: test-backend test-frontend

## Run backend tests
test-backend:
	cd backend && go test ./...

## Run frontend tests
test-frontend:
	cd frontend && bun run test

## Run linters
lint:
	cd backend && go vet ./...
	cd frontend && bun run lint

## Run format + lint fix
check:
	cd frontend && bun run check

# ================================
# Frontend
# ================================

## Install frontend dependencies
frontend-install:
	cd frontend && bun install

## Build frontend for production
frontend-build:
	cd frontend && bun install && bun run build

# ================================
# Production (Docker)
# ================================

## Start production environment
prod-up:
	docker compose -f docker-compose.prod.yml up --build -d

## Stop production environment
prod-down:
	docker compose -f docker-compose.prod.yml down

## View production logs
prod-logs:
	docker compose -f docker-compose.prod.yml logs -f

## Rebuild and restart production
prod-rebuild:
	docker compose -f docker-compose.prod.yml up --build -d --force-recreate

# ================================
# Cleanup
# ================================

## Remove containers, volumes, and images
clean:
	docker compose down -v --rmi local --remove-orphans

## Remove only volumes
clean-volumes:
	docker compose down -v

## Remove SQLite database
clean-db:
	rm -f $(DB_PATH)

# ================================
# Setup (First-time)
# ================================

## Initialize project (copy .env, create db, install deps)
init:
	@echo "Initializing $(PROJECT_NAME)..."
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created .env from .env.example"; fi
	@if [ ! -f frontend/.env ]; then cp frontend/.env.example frontend/.env && echo "Created frontend/.env"; fi
	@mkdir -p data
	@echo "Installing frontend dependencies..."
	@cd frontend && bun install
	@echo "Creating database..."
	@touch $(DB_PATH)
	@echo ""
	@echo "Setup complete! Next steps:"
	@echo "  1. Edit .env with your configuration"
	@echo "  2. Run 'make db-migrate' to run migrations"
	@echo "  3. Run 'make dev-backend' and 'make dev-frontend' in separate terminals"
	@echo "     OR run 'make dev' to use Docker"

# ================================
# Help
# ================================

## Show this help
help:
	@echo "Fastship - Available Commands"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make \033[36m<target>\033[0m\n\n"} \
		/^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) }' $(MAKEFILE_LIST)
