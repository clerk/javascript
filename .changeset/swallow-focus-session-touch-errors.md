---
'@clerk/clerk-js': patch
---

Ignore errors from the background session touch that runs when the page regains focus.

These errors were previously both unhandled and uncaught, now they are just intentionally unhandled. The page is usually in a good enough state to recover gracefully, but the uncaught errors led to noise in the browser console and error tracking tools which we now avoid.
