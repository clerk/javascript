---
'@clerk/backend': patch
'@clerk/nextjs': patch
---

Pass `devBrowserToken` to `createRedirect()` to ensure methods from `auth()` that trigger redirects correctly pass the dev browser token for URL-based session syncing.
