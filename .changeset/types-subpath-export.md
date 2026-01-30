---
'@clerk/react': minor
'@clerk/nextjs': minor
'@clerk/tanstack-react-start': minor
'@clerk/react-router': minor
'@clerk/express': minor
'@clerk/fastify': minor
'@clerk/astro': minor
'@clerk/nuxt': minor
'@clerk/vue': minor
'@clerk/expo': minor
'@clerk/chrome-extension': minor
---

Add `/types` subpath export to re-export types from `@clerk/shared/types` along with SDK-specific types. This allows importing Clerk types directly from the SDK package (e.g., `import type { UserResource } from '@clerk/react/types'`) without needing to install `@clerk/types` as a separate dependency.
