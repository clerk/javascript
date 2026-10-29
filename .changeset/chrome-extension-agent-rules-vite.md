---
'@clerk/chrome-extension': minor
---

Add a Vite plugin that writes a Clerk section to the project's `AGENTS.md` when the Vite dev server starts under an AI coding agent, for extensions built with WXT, CRXJS, or a custom Vite setup. Nothing is written during builds, tests, or CI, and setting `CLERK_AGENTS_MD=false` turns it off.

```ts
// wxt.config.ts
import { clerkChromeExtensionAgentRules } from '@clerk/chrome-extension/vite';

export default defineConfig({
  vite: () => ({ plugins: [clerkChromeExtensionAgentRules()] }),
});
```
