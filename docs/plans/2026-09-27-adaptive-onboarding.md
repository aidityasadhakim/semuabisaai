# Adaptive onboarding

## Scope

- Replace the fixed four-step flow with one active chat prompt and a collapsible transcript.
- Ask name, role, workplace/campus/business or other context, and domicile first. Generate one brief, grounded Indonesian AI acknowledgement with a deterministic fallback.
- Ask one role-specific activity question, then AI familiarity and goal. Save the completed profile and referral for analytics.
- Preserve the waiting-list join and server-enforced five-question chat.

## Implementation

- Add a bounded public intro endpoint with input validation, a small model output budget, and an IP-based hourly cap.
- Add nullable profile fields to the existing onboarding table for current databases, while keeping the current migration and runtime schema creation aligned.
- Build the active-turn UI in `frontend/src/routes/onboarding.tsx`, using a native `details` transcript and keyboard-accessible controls.

## Verification

- Cover intro validation, fallback, rate cap, and completed profile persistence in Go tests.
- Run frontend build/lint and backend test/vet; review mobile and keyboard states.
