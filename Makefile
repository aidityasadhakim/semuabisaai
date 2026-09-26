# ================================
# Semua Bisa AI - Makefile
# ================================
# A production-ready fullstack boilerplate
# https://github.com/yourusername/semuabisaai

# ================================
# Configuration
# ================================
PROJECT_NAME ?= semuabisaai
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
# Database Operations (SQLite)
# ================================

## Install goose CLI locally
goose-install:
	go install github.com/pressly/goose/v3/cmd/goose@latest

## Create database directory and file
db-create:
	@mkdir -p data
	@touch $(DB_PATH)
	@echo "Database created at $(DB_PATH)"

## Run database migrations
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
	@echo ""
	@echo "Semua Bisa AI - Available Commands"
	@echo "=============================="
	@echo ""
	@echo "Usage: make \033[36m<target>\033[0m"
	@echo ""
	@echo "\033[1mLocal Development:\033[0m"
	@echo "  \033[36mdev\033[0m                 Start all services with hot-reload (Docker)"
	@echo "  \033[36mdev-detach\033[0m          Start all services in background"
	@echo "  \033[36mdev-backend\033[0m         Start backend only (local, no Docker)"
	@echo "  \033[36mdev-frontend\033[0m        Start frontend only (local, no Docker)"
	@echo "  \033[36mdown\033[0m                Stop all services"
	@echo "  \033[36mlogs\033[0m                View all logs"
	@echo "  \033[36mlogs-service\033[0m        View specific service logs (SERVICE=backend)"
	@echo "  \033[36mrestart\033[0m             Restart a service (SERVICE=backend)"
	@echo "  \033[36mstatus\033[0m              Check service status"
	@echo ""
	@echo "\033[1mDatabase (SQLite):\033[0m"
	@echo "  \033[36mdb-create\033[0m           Create database directory and file"
	@echo "  \033[36mdb-migrate\033[0m          Run database migrations"
	@echo "  \033[36mdb-rollback\033[0m         Rollback last migration"
	@echo "  \033[36mdb-status\033[0m           Check migration status"
	@echo "  \033[36mdb-reset\033[0m            Reset database (rollback all + migrate)"
	@echo "  \033[36mdb-shell\033[0m            Open SQLite shell"
	@echo ""
	@echo "\033[1mCode Generation:\033[0m"
	@echo "  \033[36msqlc\033[0m                Generate SQLC code (local)"
	@echo "  \033[36msqlc-docker\033[0m         Generate SQLC code (Docker)"
	@echo "  \033[36msqlc-install\033[0m        Install sqlc CLI locally"
	@echo "  \033[36mgoose-install\033[0m       Install goose CLI locally"
	@echo ""
	@echo "\033[1mCode Quality:\033[0m"
	@echo "  \033[36mtest\033[0m                Run all tests"
	@echo "  \033[36mtest-backend\033[0m        Run backend tests"
	@echo "  \033[36mtest-frontend\033[0m       Run frontend tests"
	@echo "  \033[36mlint\033[0m                Run linters"
	@echo "  \033[36mcheck\033[0m               Run format + lint fix"
	@echo ""
	@echo "\033[1mFrontend:\033[0m"
	@echo "  \033[36mfrontend-install\033[0m    Install frontend dependencies"
	@echo "  \033[36mfrontend-build\033[0m      Build frontend for production"
	@echo ""
	@echo "\033[1mProduction (Docker):\033[0m"
	@echo "  \033[36mprod-up\033[0m             Start production environment"
	@echo "  \033[36mprod-down\033[0m           Stop production environment"
	@echo "  \033[36mprod-logs\033[0m           View production logs"
	@echo "  \033[36mprod-rebuild\033[0m        Rebuild and restart production"
	@echo ""
	@echo "\033[1mCleanup:\033[0m"
	@echo "  \033[36mclean\033[0m               Remove containers, volumes, and images"
	@echo "  \033[36mclean-volumes\033[0m       Remove only volumes"
	@echo "  \033[36mclean-db\033[0m            Remove SQLite database"
	@echo ""
	@echo "\033[1mSetup:\033[0m"
	@echo "  \033[36minit\033[0m                Initialize project (first-time setup)"
	@echo ""
