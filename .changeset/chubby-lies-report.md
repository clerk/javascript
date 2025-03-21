---
'@clerk/clerk-js': minor
---

Improve session refresh logic.
- Switched from interval-based polling to timeout-based polling, ensuring retries for a `getToken()` call complete before the next poll begins.
- `Clerk.handleUnauthenticated()` now sets the session to null when a `/client` request returns a `500` status code, preventing infinite request loops.
- Improved error handling: If the `/client` request fails during initialization, the poller stops, a dummy client is created, a manual request to `/tokens` is attempted, and polling resumes.
