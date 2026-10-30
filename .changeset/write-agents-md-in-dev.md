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

When your app runs in development and an AI coding agent such as Claude Code, Codex, Cursor, Gemini CLI, or GitHub Copilot is detected, or the repo already has agent files such as `AGENTS.md`, `CLAUDE.md`, `.claude/`, or `.cursor/`, Clerk now adds a Clerk section to the project's `AGENTS.md`, creating the file if needed. In a monorepo, the file is the one at the repo root, with one section per app. If you remove a section, Clerk doesn't add it back on that machine. To turn it off for one app, add `"clerk": { "agentsMd": false }` to that app's `package.json`. To turn it off for the whole repo, add it to the root `package.json`. Clerk then removes its sections on the next dev run. Each section tells the agent to read the installed `@clerk/<sdk>/AGENTS.md` before writing auth code and recommends the Clerk plugin (`npx plugins add clerk/skills`). Nothing is written when `NODE_ENV=production`, in tests, or in CI, and setting `CLERK_AGENTS_MD=false` turns it off. If your deployment doesn't set `NODE_ENV=production`, set `CLERK_AGENTS_MD=false` there. The section is written by the Astro and Nuxt dev servers, the Expo config plugin, the first `auth()` call or `clerkMiddleware()` request in Next.js, TanStack React Start's `clerkMiddleware()`, `clerkMiddleware()` in Express, Hono, and React Router, Fastify's `clerkPlugin`, and `createClerkBridge()` in an unpackaged Electron app.
