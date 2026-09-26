package handlers

import (
	"net/http"
	"time"

	"semuabisaai/backend/internal/db"
)

// Handlers holds all HTTP handlers and their dependencies
type Handlers struct {
	db            *db.DB
	openRouterKey string
	client        *http.Client
}

// New creates a new Handlers instance with dependencies
func New(database *db.DB, openRouterKey string) *Handlers {
	return &Handlers{
		db:            database,
		openRouterKey: openRouterKey,
		client:        &http.Client{Timeout: 25 * time.Second},
	}
}

// DB returns the database connection (for use in handlers)
func (h *Handlers) DB() *db.DB {
	return h.db
}
