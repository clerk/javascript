---
'@clerk/ui': patch
---

Fix BaseRouter state not syncing after popup OAuth by observing `pushState`/`replaceState` changes in addition to `popstate`
