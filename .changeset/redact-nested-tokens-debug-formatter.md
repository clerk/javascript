---
'@clerk/nextjs': patch
---

Harden middleware debug log output: the formatter now recursively truncates known credential keys (`sessionToken`, `tokenInHeader`, `sessionTokenInCookie`, `secretKey`, `jwtKey`) at any nesting depth, so a bearer token can no longer reach the logs even if a debug producer nests one. This is a defense-in-depth backstop alongside the source-level redaction in `@clerk/backend`.
