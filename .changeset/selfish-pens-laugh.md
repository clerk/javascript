---
"@clerk/nextjs": patch
---

Update the error thrown by auth() or getAuth() to indicate that if the /src directory exists, then the middleware.ts file needs to be placed inside it, otherwise the middleware will not run.
