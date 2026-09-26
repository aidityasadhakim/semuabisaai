# Landing page and waiting list frame

- Replace the current blue landing page with a warm editorial layout inspired by Hims: compact navigation, oversized headline, large media slot, direct CTA, and a few modular sections. Leave copy and imagery clearly editable.
- Send the CTA to a join route. Clerk handles Google or email authentication according to its instance settings; after authentication, record waitlist interest in the user's Clerk metadata and show a confirmation state.
- Show a clear setup state when Clerk keys are absent. Add Agentation in development only and document setup.
- Verify frontend build/lint, the Clerk-disabled route, and the changed navigation. Full OAuth requires real Clerk keys and provider configuration.
