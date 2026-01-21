---
'@clerk/react': minor
---

Add automatic environment variable fallback for Vite applications. When options are not explicitly provided to `ClerkProvider`, the SDK now checks for `VITE_CLERK_*` and `CLERK_*` environment variables.

Supported environment variables:
- `VITE_CLERK_PUBLISHABLE_KEY` / `CLERK_PUBLISHABLE_KEY`
- `VITE_CLERK_SIGN_IN_URL` / `CLERK_SIGN_IN_URL`
- `VITE_CLERK_SIGN_UP_URL` / `CLERK_SIGN_UP_URL`
- `VITE_CLERK_SIGN_IN_FORCE_REDIRECT_URL` / `CLERK_SIGN_IN_FORCE_REDIRECT_URL`
- `VITE_CLERK_SIGN_UP_FORCE_REDIRECT_URL` / `CLERK_SIGN_UP_FORCE_REDIRECT_URL`
- `VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` / `CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` / `CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`
