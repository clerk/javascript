---
'@clerk/backend': patch
---

The `instanceof` check in `createClerkRequest` is allowing `Request` instances through, which means the required `cookies` object is never created/set on the instance. This causes an error in the TanStack Start middleware when `AuthenticateContext.getCookie` tries to access `cookies`. Instead of checking `instanceof`, we check for the presence of the `cookies` and `clerkUrl` keys to determine whether or not we're dealing with a `Request` or `ClerkRequest`
