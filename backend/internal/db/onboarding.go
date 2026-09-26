package db

import "context"

// EnsureOnboardingSchema keeps production ready when the Goose CLI is unavailable.
// The same schema is tracked in migration 002 for local migration workflows.
func EnsureOnboardingSchema(ctx context.Context, database *DB) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS onboarding_sessions (id TEXT PRIMARY KEY, referral TEXT NOT NULL DEFAULT '', profession TEXT NOT NULL, familiarity TEXT NOT NULL, goal TEXT NOT NULL, city TEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
		`CREATE TABLE IF NOT EXISTS waitlist_members (clerk_user_id TEXT PRIMARY KEY, onboarding_id TEXT REFERENCES onboarding_sessions(id), questions_used INTEGER NOT NULL DEFAULT 0 CHECK (questions_used BETWEEN 0 AND 5), joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
		`CREATE TABLE IF NOT EXISTS visitor_questions (id INTEGER PRIMARY KEY AUTOINCREMENT, clerk_user_id TEXT NOT NULL REFERENCES waitlist_members(clerk_user_id), question TEXT NOT NULL, answer TEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
	}
	for _, statement := range statements {
		if _, err := database.ExecContext(ctx, statement); err != nil {
			return err
		}
	}
	return nil
}
