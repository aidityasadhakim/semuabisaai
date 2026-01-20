package config

import "os"

// Config holds the application configuration
type Config struct {
	// Database
	DatabasePath string // SQLite file path (e.g., "./data/fastship.db")
	// DatabaseURL string // PostgreSQL/MySQL connection string (uncomment if using)

	// Server
	BackendPort string
	BackendHost string

	// Authentication (Clerk)
	ClerkSecretKey string
}

// Load loads configuration from environment variables
func Load() *Config {
	return &Config{
		// Database - SQLite by default
		DatabasePath: getEnv("DATABASE_PATH", "./data/fastship.db"),
		// DatabaseURL: getEnv("DATABASE_URL", ""), // Uncomment for PostgreSQL/MySQL

		// Server
		BackendPort: getEnv("BACKEND_PORT", "8080"),
		BackendHost: getEnv("BACKEND_HOST", "0.0.0.0"),

		// Authentication
		ClerkSecretKey: getEnv("CLERK_SECRET_KEY", ""),
	}
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
