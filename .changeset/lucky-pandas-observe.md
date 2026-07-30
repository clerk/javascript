---
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Acquire an optional Protect session token and attach it to sign-in and sign-up requests.

On instances whose loader config references the new `{cid}` / `{pid}` / `{rid}` / `{instance_id}` placeholders, Clerk mints an opaque, random correlation id and acquires a signed session token once per browser session — shared across tabs under a lock rather than acquired once per tab. The token, along with the correlation id and an acquisition status, travels in the form-encoded body of sign-in and sign-up requests.

Acquisition never blocks a sign-in: if the token cannot be obtained, a status code (`timeout`, `script_error`, `fetch_error`, `http_<n>`, `unsupported`) travels in its place and the request proceeds. Instances that do not use these placeholders are unaffected, and nothing is stored in the browser for them.

`ProtectLoader` gains two optional fields, `tokenUrl` and `tokenTimeoutMs`.
