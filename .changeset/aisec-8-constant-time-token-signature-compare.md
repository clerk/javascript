---
'@clerk/nextjs': patch
---

Use a constant-time comparison when validating the integrity signature on the middleware-to-origin auth header handoff (`assertTokenSignature`). The previous `!==` compare was timing-variable; the new helper is synchronous and runtime-agnostic so it works in both Node and Edge Runtime.
