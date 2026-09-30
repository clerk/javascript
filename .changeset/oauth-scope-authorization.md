---
'@clerk/backend': minor
'@clerk/nextjs': minor
'@clerk/shared': minor
---

OAuth access-token auth objects now support `has({ oauth_scope: 'scope' })` to authorize against the exact scopes granted in the token.
