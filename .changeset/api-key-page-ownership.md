---
'@clerk/ui': patch
---

API key pages reset search and modal state when the active user or organization changes. Results from the previous page no longer change the new page's loading state or reveal its key secret. Repeated submissions share one pending creation request.
