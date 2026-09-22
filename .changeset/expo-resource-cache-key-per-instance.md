---
'@clerk/expo': patch
---

Fix the offline resource cache so an app that switches Clerk instances no longer starts offline with the previous instance's cached user and session. Existing caches are not carried over, so the first launch after upgrading fetches from the network.
