---
'@clerk/clerk-js': patch
---

Bug fix: Use the correct returnBack url when GoogleOneTap remains open across navigations.
Previously it will only use the url that existed in the browser url bar at the time the component was initially rendered.
