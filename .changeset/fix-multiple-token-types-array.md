---
"@clerk/backend": patch
---

Fix token-type-mismatch error when using multiple `acceptsToken` values in `authenticateRequest`. When `acceptsToken` is an array containing both session and machine token types (e.g., `['session_token', 'api_key']`), the function now correctly routes to the appropriate authentication handler based on the actual token type, instead of always treating them as machine tokens.