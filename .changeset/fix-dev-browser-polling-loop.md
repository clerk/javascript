---
'@clerk/clerk-js': patch
---

Fix infinite request loop caused by `dev_browser_unauthenticated` errors during runtime polling by handling them in the base fetcher with a dev browser reset instead of triggering recursive `handleUnauthenticated` calls.
