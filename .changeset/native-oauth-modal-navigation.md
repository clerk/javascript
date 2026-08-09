---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Fix native OAuth transport flows (e.g. `@clerk/electron`) breaking out of modal components and failing with "Redirect url mismatch" errors.

Intermediate OAuth callback steps (sign-in to sign-up transfer, continue, MFA factors, password reset) now navigate inside the component's own router instead of navigating the app window to an internal Clerk route. Transport flows also always send the registered transport callback URL as the completion redirect, so production instances no longer reject sign-in or sign-up requests when a page-derived URL was picked up as the completion redirect.
