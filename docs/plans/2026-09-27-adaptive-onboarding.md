# Adaptive onboarding

## Scope

- Replace the fixed four-step flow with one active chat prompt and a collapsible transcript.
- Show name, role, and workplace/campus/business together first. After that answer and each later answer, generate one brief Indonesian acknowledgement and the wording of the next question, with deterministic fallbacks.
- Keep the topic order and role-specific answer options controlled by the app: domicile, activity, AI familiarity, then goal. Save the completed profile and referral for analytics.
- Preserve the waiting-list join and server-enforced five-question chat.

## Implementation

- Add a bounded public turn endpoint with input validation, a small model output budget, and IP-based hourly caps. Validate model output so it cannot change the required topic.
- Add nullable profile fields to the existing onboarding table for current databases, while keeping the current migration and runtime schema creation aligned.
- Build the active-turn UI in `frontend/src/routes/onboarding.tsx`, using a native `details` transcript and keyboard-accessible controls.

## Verification

- Cover turn validation, model and fallback output, rate cap, and completed profile persistence in Go tests.
- Run frontend build/lint and backend test/vet; review mobile and keyboard states.
