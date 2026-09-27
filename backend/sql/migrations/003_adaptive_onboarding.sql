-- +goose Up
CREATE TABLE IF NOT EXISTS onboarding_profiles (
  onboarding_id TEXT PRIMARY KEY REFERENCES onboarding_sessions(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  place TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS onboarding_intro_limits (
  ip_hash TEXT NOT NULL,
  hour_bucket INTEGER NOT NULL,
  hits INTEGER NOT NULL,
  PRIMARY KEY (ip_hash, hour_bucket)
);

-- +goose Down
DROP TABLE IF EXISTS onboarding_intro_limits;
DROP TABLE IF EXISTS onboarding_profiles;
