---
'@clerk/backend': patch
---

`authenticateRequest()` now logs a warning once when `acceptsToken` is not `'any'`, a token type, or an array of token types. An invalid value such as `'sesion_token'` behaves differently depending on where the token is sent: it can sign in a request with a session cookie, return a signed-out state whose `toAuth()` throws, or be ignored inside an array. A future major version will throw an error for these values. An empty array is still valid and rejects every token.
