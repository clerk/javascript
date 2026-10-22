---
'@clerk/mosaic': patch
---

Fix avatar loading in UserButton and OrganizationSwitcher so responsive images follow the browser-selected source and failed cached images keep their fallback. Avatar images can also render in server output when their data is available.
