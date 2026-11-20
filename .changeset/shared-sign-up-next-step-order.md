---
'@clerk/shared': patch
---

Fix the internal sign-up step helper used by `@clerk/mosaic` so it verifies the email and phone before asking for missing fields, the same order `<SignUp />` follows. `<SignUp />` is unaffected.
