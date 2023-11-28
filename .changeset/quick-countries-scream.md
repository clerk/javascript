---
'@clerk/clerk-js': minor
'@clerk/backend': minor
'@clerk/types': minor
---

Re-use common pagination types for consistency across types.

Types introduced in `@clerk/types`:
- `ClerkPaginationRequest` : describes pagination related props in request payload
- `ClerkPaginatedResponse` : describes pagination related props in response body
- `ClerkPaginationParams`  : describes pagination related props in api client method params