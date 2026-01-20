package db

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

// DB wraps the SQL database connection
type DB struct {
	*sql.DB
}

// NewConnection creates a new SQLite database connection
func NewConnection(ctx context.Context, databasePath string) (*DB, error) {
	// Ensure the directory exists
	dir := filepath.Dir(databasePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create database directory: %w", err)
	}

	// Open SQLite database
	sqlDB, err := sql.Open("sqlite", databasePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Enable foreign keys and WAL mode for better performance
	pragmas := []string{
		"PRAGMA foreign_keys = ON",
		"PRAGMA journal_mode = WAL",
		"PRAGMA busy_timeout = 5000",
	}

	for _, pragma := range pragmas {
		if _, err := sqlDB.ExecContext(ctx, pragma); err != nil {
			sqlDB.Close()
			return nil, fmt.Errorf("failed to set pragma: %w", err)
		}
	}

	// Test the connection
	if err := sqlDB.PingContext(ctx); err != nil {
		sqlDB.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &DB{sqlDB}, nil
}

// Close closes the database connection
func (db *DB) Close() error {
	if db.DB != nil {
		return db.DB.Close()
	}
	return nil
}

// ============================================================================
// PostgreSQL Connection (Uncomment if using PostgreSQL)
// ============================================================================
//
// import (
// 	"context"
// 	"fmt"
//
// 	"github.com/jackc/pgx/v5/pgxpool"
// )
//
// type DB struct {
// 	*pgxpool.Pool
// }
//
// func NewConnection(ctx context.Context, databaseURL string) (*DB, error) {
// 	config, err := pgxpool.ParseConfig(databaseURL)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to parse database URL: %w", err)
// 	}
//
// 	config.MaxConns = 25
// 	config.MinConns = 5
//
// 	pool, err := pgxpool.NewWithConfig(ctx, config)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to connect to database: %w", err)
// 	}
//
// 	if err := pool.Ping(ctx); err != nil {
// 		pool.Close()
// 		return nil, fmt.Errorf("failed to ping database: %w", err)
// 	}
//
// 	return &DB{pool}, nil
// }
//
// func (db *DB) Close() {
// 	if db.Pool != nil {
// 		db.Pool.Close()
// 	}
// }
