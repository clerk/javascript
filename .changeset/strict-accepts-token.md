---
'@clerk/backend': minor
---

`authenticateRequest()` now throws an error when `acceptsToken` is not `'any'`, a token type, or an array of token types. Before, an invalid value such as `'sesion_token'` could sign in a request with a session cookie, return a signed-out state whose `toAuth()` throws, or be ignored inside an array, depending on where the token was sent. An empty array is still valid and rejects every token.
