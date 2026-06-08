---
"@clerk/shared": minor
"@clerk/ui": minor
"@clerk/clerk-js": minor
---

Add `__internal_nativeOAuthHandler` to `ClerkOptions` for SDK wrappers (e.g. `@clerk/electron`) that need to handle OAuth flows outside the browser. When registered, Clerk uses the handler's `getRedirectUrl` as the FAPI redirect URL and calls `open` instead of navigating the browser, routing the callback through the native runtime. The `NativeOAuthHandler` type is exported from `@clerk/shared/types`.
