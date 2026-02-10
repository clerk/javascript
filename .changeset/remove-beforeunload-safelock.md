---
'@clerk/clerk-js': patch
---

Removed redundant `beforeunload` event listener from SafeLock that was disabling the browser's back-forward cache (bfcache), degrading navigation performance.
