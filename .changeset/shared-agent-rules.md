---
'@clerk/shared': minor
---

Add `@clerk/shared/agentRules`, `@clerk/shared/agentRulesWriter`, and `@clerk/shared/vite` for writing Clerk sections to a project's `AGENTS.md`. Add `isAgentEnvironment()` and `isClerkAgentRulesWriteAllowed()` to `@clerk/shared/utils`. `isClerkAgentRulesWriteAllowed()` returns `false` when `NODE_ENV=production`, in tests, in CI, or when `CLERK_AGENTS_MD=false`. Deployments that don't set `NODE_ENV=production` should set `CLERK_AGENTS_MD=false` to turn writes off.
