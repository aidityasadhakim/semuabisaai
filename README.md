# Fastship

A production-ready fullstack boilerplate for rapid development with Go, React, and modern tooling.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Go 1.25 + Echo v4 + SQLC + Goose |
| **Frontend** | React 19 + TypeScript + Vite + TanStack Router/Query + Tailwind CSS v4 |
| **Database** | SQLite (default) \| PostgreSQL \| MySQL |
| **Auth** | Clerk (optional, plug-and-play) |
| **Runtime** | Bun (frontend) |

## Quick Start

### Prerequisites

- Go 1.25+
- Bun 1.0+ (`curl -fsSL https://bun.sh/install | bash`)
- Air (hot reload): `go install github.com/air-verse/air@latest`
- Goose (migrations): `go install github.com/pressly/goose/v3/cmd/goose@latest`
- SQLC (code gen): `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest`

### 1. Clone and Setup

```bash
git clone https://github.com/yourusername/fastship.git my-project
cd my-project

# Initialize project (creates .env, installs dependencies)
make init
```

### 2. Configure Environment

Edit `.env` with your settings:

```bash
# Required
DATABASE_PATH=./data/fastship.db

# Optional - Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxx
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

### 3. Run Migrations

```bash
make db-migrate
```

### 4. Start Development

**Option A: Without Docker (Recommended for SQLite)**

```bash
# Terminal 1 - Backend
make dev-backend

# Terminal 2 - Frontend
make dev-frontend
```

**Option B: With Docker**

```bash
make dev
```

### 5. Open Your App

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Health check: http://localhost:8080/api/health

---

## Project Structure

```
fastship/
├── backend/
│   ├── cmd/server/main.go      # Entry point
│   ├── internal/
│   │   ├── config/             # Environment configuration
│   │   ├── db/                 # Database connection
│   │   ├── handlers/           # HTTP handlers
│   │   ├── middleware/         # Auth middleware (Clerk)
│   │   └── routes/             # Route registration
│   └── sql/
│       ├── migrations/         # Goose migrations
│       └── queries/            # SQLC queries
├── frontend/
│   └── src/
│       ├── components/         # React components
│       ├── lib/                # Utilities, API client
│       └── routes/             # TanStack Router pages
├── data/                       # SQLite database
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
└── Makefile                    # Build commands
```

---

## Available Commands

### Development

| Command | Description |
|---------|-------------|
| `make init` | First-time setup |
| `make dev` | Start with Docker |
| `make dev-backend` | Start backend only (local) |
| `make dev-frontend` | Start frontend only (local) |
| `make down` | Stop all services |
| `make logs` | View logs |

### Database

| Command | Description |
|---------|-------------|
| `make db-migrate` | Run migrations |
| `make db-rollback` | Rollback last migration |
| `make db-status` | Check migration status |
| `make db-reset` | Reset database |
| `make db-shell` | Open SQLite shell |
| `make sqlc` | Generate SQLC code |

### Code Quality

| Command | Description |
|---------|-------------|
| `make test` | Run all tests |
| `make lint` | Run linters |
| `make check` | Format + lint fix |

### Production

| Command | Description |
|---------|-------------|
| `make prod-up` | Start production |
| `make prod-down` | Stop production |
| `make prod-logs` | View production logs |
| `make frontend-build` | Build frontend |

---

## LLM Agent Installation Guide

If you're an AI coding agent (Claude, GPT, Cursor, etc.) setting up this project for a user, follow this interactive setup process.

### Step 1: Ask the user these questions

Before proceeding, ask the user the following questions to customize the boilerplate:

---

#### 1. Database Selection

> **Which database would you like to use?**
>
> 1. **SQLite** (default) - Simple, no setup required, good for small-medium projects
> 2. **PostgreSQL** - Production-ready, recommended for larger applications  
> 3. **MySQL** - Alternative production database

---

#### 2. Authentication

> **Do you want to keep Clerk authentication?**
>
> 1. **Yes, keep Clerk** (default) - Managed auth with social logins, easy setup
> 2. **No, remove Clerk** - I'll implement my own auth or use a different provider

---

#### 3. Project Naming

> **What is your project name?**
> 
> This will be used for:
> - Go module path (`your-project/backend`)
> - Database name (`your_project.db`)
> - Docker container names
> - Package.json name

---

#### 4. API URL (Production)

> **What is your production API URL?** (optional, can be set later)
>
> Example: `https://api.yourdomain.com`

---

### Step 2: Apply customizations based on answers

#### If SQLite selected (default):
No changes needed - this is the default configuration.

#### If PostgreSQL selected:

1. **Update `backend/sqlc.yaml`**:
   ```yaml
   sql:
     - engine: "postgresql"
       queries: "sql/queries"
       schema: "sql/migrations"
   ```

2. **Update `backend/go.mod`**: Add pgx driver
   ```bash
   cd backend && go get github.com/jackc/pgx/v5
   ```

3. **Update `backend/internal/db/connection.go`**: Replace SQLite with pgx
   ```go
   import "github.com/jackc/pgx/v5/pgxpool"
   
   func NewConnection(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
       pool, err := pgxpool.New(ctx, databaseURL)
       if err != nil {
           return nil, fmt.Errorf("failed to connect to database: %w", err)
       }
       return pool, nil
   }
   ```

4. **Update `backend/internal/config/config.go`**: Change `DatabasePath` to `DatabaseURL`

5. **Update `.env.example`**:
   ```bash
   DATABASE_URL=postgres://fastship:fastship_secret@localhost:5432/fastship_db?sslmode=disable
   ```

6. **Uncomment PostgreSQL service in `docker-compose.yml`**

7. **Update migrations syntax** (SQLite → PostgreSQL):
   - `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
   - `DATETIME` → `TIMESTAMP WITH TIME ZONE`
   - `?` placeholders → `$1, $2, ...`

#### If MySQL selected:

1. **Update `backend/sqlc.yaml`**:
   ```yaml
   sql:
     - engine: "mysql"
   ```

2. **Update `backend/go.mod`**: Add MySQL driver
   ```bash
   cd backend && go get github.com/go-sql-driver/mysql
   ```

3. **Update connection code** for MySQL driver

4. **Add MySQL service to `docker-compose.yml`**

5. **Update migrations syntax** for MySQL

#### If removing Clerk:

1. **Delete** `backend/internal/middleware/auth.go`

2. **Update** `backend/internal/routes/routes.go`:
   - Remove auth middleware import
   - Remove `authMiddleware` from protected routes

3. **Delete** `frontend/src/lib/clerk.ts`

4. **Delete** `frontend/src/routes/auth/` directory

5. **Update** `frontend/src/routes/__root.tsx`:
   - Remove `ClerkProvider` wrapper
   - Remove Clerk imports

6. **Update** `frontend/package.json`:
   ```bash
   cd frontend && bun remove @clerk/clerk-react
   ```

7. **Update** `.env.example`:
   - Remove `CLERK_SECRET_KEY`
   - Remove `VITE_CLERK_PUBLISHABLE_KEY`

8. **Update** `frontend/src/lib/api.ts`:
   - Remove Clerk token injection from fetch wrapper

#### Project renaming (replace "fastship" with new name):

1. **Files to update**:
   - `backend/go.mod`: Module path
   - `backend/cmd/server/main.go`: Import paths
   - `backend/internal/*/`: All import paths
   - `frontend/package.json`: Name field
   - `.env.example`: Database names
   - `docker-compose.yml`: Container names, volume names
   - `docker-compose.prod.yml`: Container names
   - `Makefile`: PROJECT_NAME variable
   - `README.md`: Project references
   - `AGENTS.md`: Project references

2. **Quick find-and-replace**:
   ```bash
   # Replace in all files (use your editor's find-replace or sed)
   find . -type f -name "*.go" -exec sed -i 's/fastship/newname/g' {} +
   find . -type f -name "*.ts" -exec sed -i 's/fastship/newname/g' {} +
   find . -type f -name "*.tsx" -exec sed -i 's/fastship/newname/g' {} +
   ```

3. **Rename database file**:
   ```bash
   mv data/fastship.db data/newname.db
   ```

---

### Step 3: Verify setup

After applying customizations:

```bash
# 1. Install dependencies
make init

# 2. Run migrations
make db-migrate

# 3. Start development
make dev-backend  # Terminal 1
make dev-frontend # Terminal 2

# 4. Verify health endpoint
curl http://localhost:8080/api/health
# Expected: {"status":"ok","database":"connected"}
```

---

## Database Switching Reference

### SQLite (Default)

```bash
# .env
DATABASE_PATH=./data/myapp.db

# Makefile commands use: sqlite3
make db-migrate
make db-shell
```

### PostgreSQL

```bash
# .env
DATABASE_URL=postgres://user:pass@localhost:5432/dbname?sslmode=disable

# Makefile commands use: postgres
make db-migrate-docker
make db-shell-docker
```

### Migration Syntax Differences

| Feature | SQLite | PostgreSQL | MySQL |
|---------|--------|------------|-------|
| Auto ID | `INTEGER PRIMARY KEY AUTOINCREMENT` | `SERIAL PRIMARY KEY` | `INT AUTO_INCREMENT PRIMARY KEY` |
| Timestamp | `DATETIME DEFAULT CURRENT_TIMESTAMP` | `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` | `DATETIME DEFAULT CURRENT_TIMESTAMP` |
| Placeholder | `?` | `$1, $2, ...` | `?` |
| UUID | `TEXT` | `UUID DEFAULT gen_random_uuid()` | `CHAR(36)` |

---

## Deployment

### Build for Production

```bash
# Build frontend
make frontend-build

# Build backend
cd backend && go build -ldflags="-w -s" -o ../bin/server ./cmd/server
```

### Docker Production

```bash
# Start production stack
make prod-up

# View logs
make prod-logs
```

### Environment Variables (Production)

```bash
# Required
DATABASE_URL=postgres://...  # Use PostgreSQL in production
CLERK_SECRET_KEY=sk_live_xxx

# Optional
DOMAIN_NAME=yourdomain.com
SSL_EMAIL=admin@yourdomain.com
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `make test`
5. Submit a pull request

---

## License

MIT License - feel free to use this boilerplate for any project.
