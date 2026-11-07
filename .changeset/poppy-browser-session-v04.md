---
"@clerk/backend": minor
---

Add server helpers for Poppy v0.4 browser Sessions. Signed-in joins create agent-attributed Clerk Sessions for normal Clerk authentication. The SDK checks the live OAuth grant for browser cookies and Poppy-derived Session JWTs, supports guest browsing, and ends account access on sign-out or revocation.
