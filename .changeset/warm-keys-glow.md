---
'@clerk/react': minor
---

Add automatic environment variable fallback for `publishableKey` in Vite applications. When `publishableKey` is not explicitly provided to `ClerkProvider`, the SDK now checks for `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_PUBLISHABLE_KEY` environment variables.
