---
title: 'Runtime environment variables now take precedence over build-time values'
packages: ['astro']
matcher:
  - 'PUBLIC_CLERK_PUBLISHABLE_KEY'
  - 'PUBLIC_CLERK_DOMAIN'
  - 'PUBLIC_CLERK_SIGN_IN_URL'
  - 'PUBLIC_CLERK_SIGN_UP_URL'
  - 'import.meta.env'
category: 'behavior-change'
warning: true
---

Environment variable resolution in `@clerk/astro` now prefers `process.env` over `import.meta.env`. This means runtime environment variables (e.g., set in the Node.js adapter or container) take precedence over values statically replaced by Vite at build time.

The new resolution order is:

1. `locals.runtime.env` (Cloudflare Workers)
2. `process.env` (Node.js runtime)
3. `import.meta.env` (Vite build-time static replacement)

Previously, `import.meta.env` was checked before `process.env`. If you rely on build-time `PUBLIC_*` values that differ from your runtime `process.env`, you may need to update your configuration to ensure the correct values are set in `process.env` at runtime.
