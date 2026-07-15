---
'@clerk/backend': patch
---

Reject machine tokens (M2M and OAuth JWTs) presented in the `__session` cookie. Previously such a token could pass session verification and produce a signed-in state with the machine identity as `userId`, defeating `if (userId)` authorization checks. The cookie path now mirrors the existing header-path guard and returns a signed-out state for these tokens.
