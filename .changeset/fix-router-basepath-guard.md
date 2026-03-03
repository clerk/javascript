---
'@clerk/ui': patch
---

Fix router updating state when navigating outside of the specified basePath, which caused components like SignIn to re-render and trigger catch-all redirects.
