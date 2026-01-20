-- ====================
-- SQLC Queries Template
-- ====================
-- Define your SQL queries here. SQLC will generate type-safe Go code.
--
-- Query annotations:
--   :one    - Returns a single row
--   :many   - Returns multiple rows
--   :exec   - Executes without returning rows
--   :execrows - Executes and returns affected row count
--   :execresult - Executes and returns result (for last insert ID)
--
-- ====================
-- Example Queries (uncomment after creating tables)
-- ====================

-- SQLite placeholder syntax: ?

-- -- name: GetUser :one
-- SELECT * FROM users WHERE id = ? LIMIT 1;

-- -- name: GetUserByClerkID :one
-- SELECT * FROM users WHERE clerk_id = ? LIMIT 1;

-- -- name: ListUsers :many
-- SELECT * FROM users ORDER BY created_at DESC;

-- -- name: CreateUser :one
-- INSERT INTO users (clerk_id, email, name)
-- VALUES (?, ?, ?)
-- RETURNING *;

-- -- name: UpdateUser :exec
-- UPDATE users
-- SET name = ?, updated_at = CURRENT_TIMESTAMP
-- WHERE id = ?;

-- -- name: DeleteUser :exec
-- DELETE FROM users WHERE id = ?;

-- ====================
-- PostgreSQL Queries (use $1, $2, ... instead of ?)
-- ====================

-- -- name: GetUser :one
-- SELECT * FROM users WHERE id = $1 LIMIT 1;

-- -- name: CreateUser :one
-- INSERT INTO users (clerk_id, email, name)
-- VALUES ($1, $2, $3)
-- RETURNING *;
