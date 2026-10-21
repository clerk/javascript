---
'@clerk/astro': minor
'@clerk/expo': minor
'@clerk/nextjs': minor
'@clerk/nuxt': minor
'@clerk/tanstack-react-start': minor
---

When your app runs in development, Clerk now adds a Clerk section to the project's root `AGENTS.md`, creating the file if needed. It also creates a `CLAUDE.md` that imports `AGENTS.md`, or adds an `@AGENTS.md` import to an existing `CLAUDE.md` that doesn't load it. The section tells the agent to read `node_modules/@clerk/<sdk>/AGENTS.md` before writing auth code and recommends the Clerk plugin (`npx plugins add clerk/skills`). Nothing is written in production or CI, and setting `CLERK_AGENTS_MD=false` turns it off. The section is written by the Astro and Nuxt dev servers, the Expo config plugin, the first `auth()` call in Next.js, and TanStack React Start's `clerkMiddleware()`.
