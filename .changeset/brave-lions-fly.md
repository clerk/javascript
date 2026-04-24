---
"@clerk/shared": patch
"@clerk/react": patch
"@clerk/express": patch
---

Add `publishableKeyFromHost` utility for resolving the correct publishable key per hostname in multi-domain setups. Re-exported from `@clerk/react/internal` and `@clerk/express/internal`.

Support dynamic options callback in `clerkMiddleware` for multi-domain and multi-tenant setups.
