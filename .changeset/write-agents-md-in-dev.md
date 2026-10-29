---
'@clerk/astro': minor
'@clerk/electron': minor
'@clerk/expo': minor
'@clerk/express': minor
'@clerk/fastify': minor
'@clerk/hono': minor
'@clerk/nextjs': minor
'@clerk/nuxt': minor
'@clerk/react-router': minor
'@clerk/tanstack-react-start': minor
---

When your app runs in development, Clerk now adds a Clerk section to the `AGENTS.md` next to the app's `package.json`, creating the file if needed. It also creates a `CLAUDE.md` that imports `AGENTS.md`, or adds an `@AGENTS.md` import to an existing `CLAUDE.md` that doesn't load it. The section tells the agent to read `node_modules/@clerk/<sdk>/AGENTS.md` before writing auth code and recommends the Clerk plugin (`npx plugins add clerk/skills`). Nothing is written when `NODE_ENV=production`, in tests, or in CI, and setting `CLERK_AGENTS_MD=false` turns it off. If your deployment doesn't set `NODE_ENV=production`, set `CLERK_AGENTS_MD=false` there. The section is written by the Astro and Nuxt dev servers, the Expo config plugin, the first `auth()` call or `clerkMiddleware()` request in Next.js, TanStack React Start's `clerkMiddleware()`, `clerkMiddleware()` in Express, Hono, and React Router, Fastify's `clerkPlugin`, and `createClerkBridge()` in an unpackaged Electron app.
