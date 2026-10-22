---
"@clerk/react": patch
"@clerk/shared": patch
---

Expose the current Clerk runtime's optional transport through `useClerk()` so integrations can reuse the existing authenticated client.
