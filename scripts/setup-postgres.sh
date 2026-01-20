#!/bin/bash
# ====================
# PostgreSQL Local Setup Script
# ====================
# Run this script to set up PostgreSQL locally (alternative to SQLite)
# Usage: ./scripts/setup-postgres.sh

set -e

# Configuration
DB_USER="${POSTGRES_USER:-fastship}"
DB_PASSWORD="${POSTGRES_PASSWORD:-fastship_secret}"
DB_NAME="${POSTGRES_DB:-fastship_db}"

echo "Setting up PostgreSQL for Fastship..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install it first:"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql"
    echo "  macOS: brew install postgresql"
    echo "  Arch: sudo pacman -S postgresql"
    exit 1
fi

# Create user and database
echo "Creating database user and database..."

# Try to create user (ignore error if exists)
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true

# Try to create database (ignore error if exists)
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

echo ""
echo "PostgreSQL setup complete!"
echo ""
echo "Connection string:"
echo "  postgres://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?sslmode=disable"
echo ""
echo "To use PostgreSQL instead of SQLite:"
echo "  1. Update .env: DATABASE_URL=postgres://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?sslmode=disable"
echo "  2. Update backend/sqlc.yaml: change engine to 'postgresql'"
echo "  3. Update backend/internal/db/connection.go: use pgx driver"
echo "  4. Run: make db-migrate"
