---
'@clerk/cli-auth': minor
---

Add `@clerk/cli-auth/server` subpath export: a `cliAuth()` factory that binds a `@clerk/backend` client and a standalone `handle()` route handler that verifies bearer tokens via `clerk.authenticateRequest` and returns an `Identity` payload. Drops into any framework using the Fetch API.
