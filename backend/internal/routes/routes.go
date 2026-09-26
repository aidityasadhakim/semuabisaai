package routes

import (
	"github.com/labstack/echo/v4"

	"semuabisaai/backend/internal/handlers"
	"semuabisaai/backend/internal/middleware"
)

// Register registers all routes for the application
func Register(e *echo.Echo, h *handlers.Handlers, clerkSecretKey string) {
	// Public routes
	e.GET("/api/health", h.Health)
	e.POST("/api/onboarding", h.SaveOnboarding)

	// Protected routes (require authentication)
	api := e.Group("/api")
	api.Use(middleware.ClerkAuth(clerkSecretKey))
	api.POST("/waitlist", h.JoinWaitlist)
	api.GET("/waitlist", h.WaitlistStatus)
	api.POST("/questions", h.AskQuestion)

	// Add your protected routes here
	// Example:
	// api.GET("/users", h.ListUsers)
	// api.GET("/users/:id", h.GetUser)
	// api.POST("/users", h.CreateUser)
	// api.PUT("/users/:id", h.UpdateUser)
	// api.DELETE("/users/:id", h.DeleteUser)
}
