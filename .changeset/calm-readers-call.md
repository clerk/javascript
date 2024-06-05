---
'@clerk/clerk-js': minor
'@clerk/backend': minor
'@clerk/shared': minor
---

Support reading / writing / removing  suffixed/un-suffixed cookies from `@clerk/clerk-js` and `@clerk/backend`.
Everyone of `__session`, `__clerk_db_jwt` and `__client_uat` cookies will also be set with a suffix  to support multiple apps on the same domain.
