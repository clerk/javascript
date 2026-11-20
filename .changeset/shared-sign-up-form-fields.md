---
'@clerk/shared': patch
'@clerk/ui': patch
---

Move the rules that decide which fields the `<SignUp />` form shows and requires, and the parser for blocked-request errors, into `@clerk/shared` so `@clerk/mosaic` can use them too. No behavior change.
