---
'@clerk/clerk-sdk-node': patch
'@clerk/backend': patch
---

- One pair of legacy or new instance keys are required now and not all 4 of them
- `@clerk/backend` now can handle the `"Bearer "` prefix in Authorization header for better DX
- `host` parameter is now optional in `@clerk/backend`
