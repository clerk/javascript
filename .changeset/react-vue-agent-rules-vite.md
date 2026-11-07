---
'@clerk/react': minor
'@clerk/vue': minor
---

Add Vite plugins that write a Clerk section to the project's `AGENTS.md` when the Vite dev server starts under an AI coding agent, or in a repo that already has agent files such as `AGENTS.md` or `CLAUDE.md`. Nothing is written during builds, tests, or CI, and setting `CLERK_AGENTS_MD=false` turns it off.

```ts
import { clerkReactAgentRules } from '@clerk/react/vite';
// or: import { clerkVueAgentRules } from '@clerk/vue/vite';

export default defineConfig({
  plugins: [react(), clerkReactAgentRules()],
});
```
