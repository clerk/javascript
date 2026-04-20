---
"@clerk/nextjs": patch
---

Improve developer experience for incorrect auth import

Add helpful TypeScript error when importing `auth` from `@clerk/nextjs` instead of `@clerk/nextjs/server`. The error message shows exactly how to fix the import with a clear diff format and explains that `auth` is only available in server contexts.