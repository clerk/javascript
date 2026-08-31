---
'@clerk/ui': patch
---

Fix sign-ins gated by Clerk Protect via `status: 'needs_protect_check'` without an inline `protectCheck` payload bouncing back to the flow start. `<SignInProtectCheck />` now reloads the sign-in to fetch the challenge and only falls back to the flow start when no gate exists.
