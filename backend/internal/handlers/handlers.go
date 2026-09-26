package handlers

import (
	"semuabisaai/backend/internal/db"
)

// Handlers holds all HTTP handlers and their dependencies
type Handlers struct {
	db *db.DB
}

// New creates a new Handlers instance with dependencies
func New(database *db.DB) *Handlers {
	return &Handlers{
		db: database,
	}
}

// DB returns the database connection (for use in handlers)
func (h *Handlers) DB() *db.DB {
	return h.db
}
