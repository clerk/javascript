---
'@clerk/shared': minor
---

Add `@clerk/shared/agentRules`, `@clerk/shared/agentRulesWriter`, and `@clerk/shared/vite` for writing Clerk sections to a project's `AGENTS.md`. Add `isClerkAgentRulesWriteAllowed()` to `@clerk/shared/utils`, which returns `false` in production, in tests, in CI, or when `CLERK_AGENTS_MD=false`.
