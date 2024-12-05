---
'@clerk/nextjs': minor
---

Added support "Keyless mode" (experimental):
- supported Next.js versions are `14.2` or later.
- to enable use `NEXT_PUBLIC_CLERK_ENABLE_KEYLESS=true`.

While on Keyless mode, developers will be able to start a Clerk application without defining a secret and/or publishable key. Keys will automatically be generated and can be claimed via a UI prompt in the browser or via a URL in your terminal.
