---
'@clerk/astro': minor
'@clerk/expo': minor
'@clerk/nextjs': minor
'@clerk/nuxt': minor
'@clerk/tanstack-react-start': minor
---

When your app runs in development under an AI coding agent (such as Claude Code, Cursor, or GitHub Copilot), Clerk now adds a Clerk section to the project's root `AGENTS.md`, creating the file if needed, plus a `CLAUDE.md` that imports it when none exists. The section tells the agent to read `node_modules/@clerk/<sdk>/AGENTS.md` before writing auth code and points it to the Clerk MCP server. Nothing is written in production or CI. The section is written by the Astro and Nuxt dev servers, the Expo config plugin, the first `auth()` call in Next.js, and TanStack React Start's `clerkMiddleware()`.
