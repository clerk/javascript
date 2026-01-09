---
'@clerk/backend': patch
---

Add validation to require `azp` claim in cookie-based session tokens. Tokens from cookies that are missing the `azp` (authorized party) claim will now return a signed-out state with reason `token-missing-azp`.
