---
'@clerk/nextjs': minor
---

A new **experimental** feature is available: "Keyless mode"

Normally, in order to start a Clerk + Next.js application you need to provide a publishable key and secret key. With "Keyless mode" activated you no longer need to provide these two keys to start your Clerk application. These keys will be automatically generated and the application can be claimed with your account either through a UI prompt or with a URL in your terminal.

**Requirements**:
- You need to use Next.js `14.2.0` or later
- You need to set the environment variable `NEXT_PUBLIC_CLERK_ENABLE_KEYLESS=true`
