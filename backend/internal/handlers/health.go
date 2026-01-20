package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// HealthResponse is the response for the health check endpoint
type HealthResponse struct {
	Status   string `json:"status"`
	Database string `json:"database"`
}

// Health returns the health status of the application
func (h *Handlers) Health(c echo.Context) error {
	response := HealthResponse{
		Status:   "ok",
		Database: "disconnected",
	}

	// Check database connection
	if h.db != nil {
		if err := h.db.Ping(); err == nil {
			response.Database = "connected"
		}
	}

	return c.JSON(http.StatusOK, response)
}
