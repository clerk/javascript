---
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Acquire an optional Protect session token and attach it to sign-in and sign-up requests.

On instances whose loader config references the new `{cid}` / `{pid}` / `{rid}` / `{instance_id}` placeholders, Clerk mints an opaque, random correlation id and substitutes it into the loader's attributes and `textContent`. The loader is served with a signed session token, which is taken up once per browser session — shared across tabs under a lock rather than acquired once per tab — and travels alongside the correlation id and an acquisition status in the form-encoded body of sign-in and sign-up requests.

Acquisition can never block or fail a sign-in: it is bounded by a deadline, and when no token can be obtained a status (`timeout`, `script_error`, `fetch_error`, `http_<n>`, `unsupported`) travels in its place and the request proceeds unchanged. Only the loader carrying the correlation id is governed by the shared token; any other configured loader is still applied on every page load. Nothing is stored in the browser unless a loader references `{cid}`, `{pid}` or `{rid}`.

`ProtectLoader` gains two optional fields: `tokenTimeoutMs`, and `tokenUrl` for instances that opt into fetching the token from a dedicated endpoint instead of taking the one served with the loader.
