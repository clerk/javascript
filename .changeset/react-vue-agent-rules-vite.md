---
'@clerk/react': minor
'@clerk/vue': minor
---

Add Vite plugins that write a Clerk section to the project's `AGENTS.md` when the Vite dev server runs under an AI coding agent. Nothing is written during builds or in CI.

```ts
import { clerkReactAgentRules } from '@clerk/react/vite';
// or: import { clerkVueAgentRules } from '@clerk/vue/vite';

export default defineConfig({
  plugins: [react(), clerkReactAgentRules()],
});
```
