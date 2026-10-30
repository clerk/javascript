---
'@clerk/mosaic': patch
---

Fix the user profile modal's return from a redirect on Next.js App Router apps: the URL change now reaches the router, so `useSearchParams` no longer keeps the removed param and going back no longer reloads the page. History state that isn't a plain object is also kept intact.
