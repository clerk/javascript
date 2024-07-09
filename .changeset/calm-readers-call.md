---
'@clerk/clerk-js': minor
'@clerk/backend': minor
'@clerk/shared': minor
---

Support reading / writing / removing  suffixed/un-suffixed cookies from `@clerk/clerk-js` and `@clerk/backend`.
The `__session`, `__clerk_db_jwt` and `__client_uat` cookies will now include a suffix derived from the instance's publishakeKey. The cookie name suffixes are used to prevent cookie collisions, effectively enabling support for multiple Clerk applications running on the same domain.
