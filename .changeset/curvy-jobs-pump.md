---
"@clerk/react-router": minor
"@clerk/shared": patch
"@clerk/tanstack-react-start": patch
---

Introduce Keyless quickstart for React Router. This allows the Clerk SDK to be used without having to sign up and paste your keys manually.

Additionally, extract `createFileStorage` to `@clerk/shared/keyless` to reduce code duplication across Vite-based frameworks (TanStack Start and React Router now use the shared implementation).
