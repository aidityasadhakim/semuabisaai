package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"semuabisaai/backend/internal/config"
	"semuabisaai/backend/internal/db"
	"semuabisaai/backend/internal/handlers"
	"semuabisaai/backend/internal/routes"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize Clerk SDK (optional - skip if no secret key)
	if cfg.ClerkSecretKey != "" {
		clerk.SetKey(cfg.ClerkSecretKey)
		log.Println("Clerk authentication enabled")
	} else {
		log.Println("Warning: CLERK_SECRET_KEY not set - authentication disabled")
	}

	// Initialize database connection
	ctx := context.Background()
	database, err := db.NewConnection(ctx, cfg.DatabasePath)
	if err != nil {
		log.Printf("Warning: Failed to connect to database: %v", err)
		log.Println("Server will start but database operations will fail")
	} else {
		defer database.Close()
		log.Printf("Connected to database: %s", cfg.DatabasePath)
	}

	// Initialize handlers
	h := handlers.New(database)

	// Initialize Echo
	e := echo.New()
	e.HideBanner = true

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://localhost:5173",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:5173",
		},
		AllowMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowHeaders: []string{
			echo.HeaderOrigin,
			echo.HeaderContentType,
			echo.HeaderAccept,
			echo.HeaderAuthorization,
		},
		AllowCredentials: true,
	}))

	// Register routes
	routes.Register(e, h, cfg.ClerkSecretKey)

	// Start server
	address := cfg.BackendHost + ":" + cfg.BackendPort
	go func() {
		log.Printf("Starting server on %s", address)
		if err := e.Start(address); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := e.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}
