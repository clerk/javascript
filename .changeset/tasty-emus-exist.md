---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/types': patch
---

Append the devBrowser JWT to searchParams always in order to make v4 support both older v4 versions as well as v5 versions when a redirect flow is goes through AccountPortal
