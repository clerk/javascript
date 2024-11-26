---
'@clerk/nextjs': patch
---

- Re-export `isClerkRuntimeError` from `@clerk/clerk-react/errors`.
- Fixes and issue where `isClerkAPIError` would only exist in the client bundle. 
