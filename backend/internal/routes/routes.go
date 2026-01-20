package routes

import (
	"github.com/labstack/echo/v4"

	"fastship/backend/internal/handlers"
	"fastship/backend/internal/middleware"
)

// Register registers all routes for the application
func Register(e *echo.Echo, h *handlers.Handlers, clerkSecretKey string) {
	// Public routes
	e.GET("/api/health", h.Health)

	// Protected routes (require authentication)
	api := e.Group("/api")
	api.Use(middleware.ClerkAuth(clerkSecretKey))

	// Add your protected routes here
	// Example:
	// api.GET("/users", h.ListUsers)
	// api.GET("/users/:id", h.GetUser)
	// api.POST("/users", h.CreateUser)
	// api.PUT("/users/:id", h.UpdateUser)
	// api.DELETE("/users/:id", h.DeleteUser)
}
