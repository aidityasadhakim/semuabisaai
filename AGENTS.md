# AGENTS.md - Coding Agent Guidelines for Fastship

This document provides guidelines for AI coding agents working in this monorepo.

## Project Overview

Fastship is a full-stack monorepo boilerplate with:
- **Backend**: Go 1.25 + Echo v4 + SQLite (default) + SQLC + Goose
- **Frontend**: React 19 + TypeScript + Vite + TanStack Router/Query + Tailwind CSS v4
- **Auth**: Clerk (optional, plug-and-play)
- **Infrastructure**: Docker Compose for development (optional)

## Repository Structure

```
fastship/
├── backend/           # Go API server
│   ├── cmd/server/    # Application entry point
│   ├── internal/      # Private application code
│   │   ├── config/    # Environment configuration
│   │   ├── db/        # Database connection
│   │   ├── handlers/  # HTTP handlers
│   │   ├── middleware/# Auth middleware
│   │   └── routes/    # Route registration
│   └── sql/           # Migrations and SQLC queries
├── frontend/          # React application
│   └── src/
│       ├── components/# UI components
│       ├── lib/       # Utilities and API client
│       └── routes/    # TanStack Router file-based routes
├── data/              # SQLite database directory
└── docker-compose.yml # Development environment
```

---

## Build/Lint/Test Commands

### Full Stack (Docker)

```bash
make dev              # Start all services (backend, frontend)
make down             # Stop all services
make logs             # View logs from all services
make status           # Check service status
```

### Full Stack (Local - No Docker)

```bash
make init             # First-time setup (creates .env, installs deps)
make dev-backend      # Start backend with hot-reload (terminal 1)
make dev-frontend     # Start frontend dev server (terminal 2)
```

### Backend (Go)

```bash
# Local development
cd backend
go build ./...                        # Build
go test ./...                         # All tests
go test -v ./internal/handlers/...    # Single package
go test -v -run TestFunctionName ./path/to/package  # Single test
go vet ./...                          # Lint

# Via Docker
docker compose exec backend go build ./...
docker compose exec backend go test ./...
```

### Frontend (TypeScript/React)

```bash
cd frontend
bun run dev                           # Start dev server
bun run build                         # Production build
bun run test                          # Run all tests
bun run test -- path/to/file.test.ts  # Single test file
bun run lint                          # ESLint
bun run format                        # Prettier
bun run check                         # Format + lint fix
```

### Database

```bash
make db-create        # Create SQLite database file
make db-migrate       # Run migrations
make db-rollback      # Rollback last migration
make db-status        # Check migration status
make db-reset         # Reset database
make db-shell         # Open SQLite shell
make sqlc             # Generate SQLC code
```

---

## Code Style Guidelines

### Go (Backend)

**Imports**: Group imports in this order, separated by blank lines:
1. Standard library
2. External packages
3. Internal packages

```go
import (
    "context"
    "net/http"

    "github.com/labstack/echo/v4"

    "fastship/backend/internal/db"
)
```

**Formatting**: Use `gofmt` (automatic). No configuration needed.

**Naming**:
- Use `camelCase` for unexported, `PascalCase` for exported
- Handlers: `nameHandler` (e.g., `healthHandler`, `createUserHandler`)
- Interfaces: verb-noun (e.g., `UserStore`, `DataRepository`)
- Files: `snake_case.go`

**Error Handling**:
```go
// Always check errors explicitly
if err != nil {
    return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
}

// Use echo's error handling
return c.JSON(http.StatusOK, result)
```

**Handlers**: Return JSON with appropriate HTTP status codes:
```go
func exampleHandler(c echo.Context) error {
    return c.JSON(http.StatusOK, map[string]string{
        "message": "success",
    })
}
```

### TypeScript/React (Frontend)

**Formatting** (Prettier config):
- No semicolons
- Single quotes
- Trailing commas

**Imports**: Order (enforced by ESLint):
1. React/external libraries
2. Internal components/hooks
3. Types (use `import type`)

```typescript
import { createFileRoute } from '@tanstack/react-router'

import { Button } from '@/components/ui/Button'

import type { User } from '@/types'
```

**Naming**:
- Components: `PascalCase` (files and functions)
- Hooks: `useCamelCase`
- Utilities: `camelCase`
- Types/Interfaces: `PascalCase`
- Routes: kebab-case folders, index.tsx files

**Types**: Use TypeScript strictly:
- Enable `strict: true` in tsconfig
- Avoid `any` - use `unknown` if type is uncertain
- Define interfaces for API responses

```typescript
interface User {
  id: string
  email: string
  name: string
}

type ApiResponse<T> = { data: T } | { error: string }
```

**Components**: Use functional components with hooks:
```typescript
export function MyComponent({ title }: { title: string }) {
  const [state, setState] = useState(false)
  return <div>{title}</div>
}
```

**Styling**: Use Tailwind CSS with `cn()` utility for conditional classes:
```typescript
import { cn } from '@/lib/utils'

<div className={cn('base-class', isActive && 'active-class')} />
```

---

## Database Guidelines

### Migrations (Goose)

Location: `backend/sql/migrations/`

```sql
-- +goose Up
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
DROP TABLE IF EXISTS users;
```

### Queries (SQLC)

Location: `backend/sql/queries/`

```sql
-- name: GetUser :one
SELECT * FROM users WHERE id = ? LIMIT 1;

-- name: ListUsers :many
SELECT * FROM users ORDER BY created_at DESC;

-- name: CreateUser :one
INSERT INTO users (email, name) VALUES (?, ?) RETURNING *;

-- name: UpdateUser :exec
UPDATE users SET name = ? WHERE id = ?;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = ?;
```

After modifying queries, run `make sqlc` to regenerate Go code.

---

## API Conventions

- All API routes prefixed with `/api/`
- Use JSON for request/response bodies
- HTTP methods: GET (read), POST (create), PUT (update), DELETE (delete)
- Return appropriate status codes (200, 201, 400, 404, 500)

Example response format:
```json
{
  "data": { ... },
  "message": "Success"
}
```

Error response format:
```json
{
  "error": "Error message here"
}
```

---

## Authentication (Clerk)

Authentication is optional. If `CLERK_SECRET_KEY` is not set, auth middleware is bypassed.

### Backend Usage

```go
// Get authenticated user ID in handler
userID, err := middleware.RequireUserID(c)
if err != nil {
    return err
}

// Or get user ID without error (returns empty string if not authenticated)
userID := middleware.GetUserID(c)
```

### Frontend Usage

```typescript
import { useAuth, useUser } from '@clerk/clerk-react'

function MyComponent() {
  const { isSignedIn, getToken } = useAuth()
  const { user } = useUser()
  
  // Get token for API calls
  const token = await getToken()
}
```

---

## Adding New Features

1. Add migration in `backend/sql/migrations/` (use sequential numbering)
2. Add queries in `backend/sql/queries/queries.sql`
3. Run `make sqlc` to generate Go code
4. Add handler in `backend/internal/handlers/`
5. Register route in `backend/internal/routes/routes.go`
6. Add frontend API method in `frontend/src/lib/api.ts`
7. Create component/route in `frontend/src/`

---

## Environment Variables

Copy `.env.example` to `.env` before development. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_PATH` | SQLite database file path | `./data/fastship.db` |
| `BACKEND_PORT` | API server port | `8080` |
| `BACKEND_HOST` | API server host | `0.0.0.0` |
| `CLERK_SECRET_KEY` | Clerk secret key (optional) | - |
| `VITE_API_URL` | Backend URL for frontend | `http://localhost:8080` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | - |
