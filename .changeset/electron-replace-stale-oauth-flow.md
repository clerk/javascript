---
'@clerk/electron': patch
---

Fix OAuth sign-in staying blocked after a user abandons the browser tab. Starting a new OAuth sign-in now replaces the pending one instead of failing with `Clerk: an OAuth flow is already pending.` until the 3-minute callback timeout. If the user later finishes the abandoned browser tab, its callback is ignored and no longer completes the newer sign-in.
