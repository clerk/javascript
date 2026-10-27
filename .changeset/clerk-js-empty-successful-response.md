---
'@clerk/clerk-js': patch
---

Let a Frontend API request opt in to an empty successful response. With the internal `allowEmptyBody` option, an empty body resolves with a `null` payload and runs the response callbacks, as a `204 No Content` response does, even when a proxy drops `Content-Length`. Every other request parses its response as before.
