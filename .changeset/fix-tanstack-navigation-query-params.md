---
'@clerk/tanstack-react-start': patch
---

Fix navigation with query parameters in TanStack Start apps. Previously, URLs with query parameters (e.g., `/sign-in?redirect_url=...`) would cause "Not Found" errors because TanStack Router doesn't parse query strings from the `to` parameter. The fix properly separates pathname, search params, and hash when calling TanStack Router's navigate function.
