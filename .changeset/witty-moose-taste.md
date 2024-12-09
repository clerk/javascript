---
'@clerk/nextjs': patch
---

Implements a server action for copying the keys generated from the keyless mode, into an `.env.local` file.
- If a `.env.development.local` file already exists, it will be used instead of `.env.local`.  
