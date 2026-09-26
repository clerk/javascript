---
'@clerk/nextjs': patch
---

Fix the App Router hanging on the intermediate route after Clerk's post-authentication navigation lands on a page whose Server Component calls `redirect()`. `ClerkProvider` now waits for in-flight route transitions to settle before dispatching its post-`setActive` `router.refresh()`, so the refresh is no longer lost inside Next.js' router action queue while the server redirect is being followed.
