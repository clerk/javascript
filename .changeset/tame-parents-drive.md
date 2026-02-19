---
'@clerk/astro': patch
---

Fix `PUBLIC_CLERK_PUBLISHABLE_KEY` not readable from runtime environment when using the Astro Node adapter. Added `process.env` as a fallback in `getContextEnvVar()` for cases where `import.meta.env.PUBLIC_*` is statically replaced at build time by Vite.
