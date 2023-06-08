---
'@clerk/clerk-sdk-node': patch
'@clerk/backend': patch
---

Simplify the signature of the low-level `authenticateRequest` helper.
- One pair of legacy or new instance keys are required instead of all 4 of them in `authenticateRequest`
- `@clerk/backend` now can handle the `"Bearer "` prefix in Authorization header for better DX
- `host` parameter is now optional in `@clerk/backend`
