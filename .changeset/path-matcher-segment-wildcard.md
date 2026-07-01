---
'@clerk/shared': patch
---

`createRouteMatcher()` route suggestions now use the `:path*` subtree form (e.g. `/dashboard/:path*`) instead of `(.*)`. Unlike `/dashboard(.*)`, which also matches sibling routes such as `/dashboardxyz`, `/dashboard/:path*` matches only `/dashboard` and its path-segment subtree. Existing `(.*)` patterns keep working; this only changes the type-level autocomplete suggestion.
