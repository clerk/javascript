---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Add optional `intent` parameter to `session.touch()` to indicate why the touch was triggered (focus, session switch, or org switch). This enables the backend to skip expensive client piggybacking for focus-only touches.
