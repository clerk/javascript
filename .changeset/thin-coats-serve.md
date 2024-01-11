---
'gatsby-plugin-clerk': minor
'@clerk/clerk-sdk-node': minor
'@clerk/backend': minor
'@clerk/fastify': minor
'@clerk/nextjs': minor
'@clerk/remix': minor
---

Replace the `Clerk-Backend-SDK` header with `User-Agent` in BAPI requests and update it's value to contain both the package name and the package version of the clerk package
executing the request. Eg request from `@clerk/nextjs` to BAPI with append `User-Agent: @clerk/nextjs@5.0.0-alpha-v5.16` using the latest version.

Miscellaneous changes: The backend test build changed to use tsup.