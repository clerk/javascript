---
'@clerk/electron': patch
---

Fix OAuth sign-in staying blocked after a user abandons the browser tab. Starting a new OAuth sign-in now replaces the pending one instead of failing with `Clerk: an OAuth flow is already pending.` until the 3-minute callback timeout. An unsupported OAuth URL no longer cancels a pending flow, a replaced flow's browser launch failure no longer rejects the new flow, and replacing a flow while its browser is still launching no longer causes an unhandled promise rejection in the main process.
