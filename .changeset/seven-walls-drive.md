---
'@clerk/vue': patch
---

fix UsesessionList bug. When `clientCtx` is defined `clerk` can be `null` and throw when trying to access `clerk.value.setActive`. Added a condition to return the default values also when `clerk.value` is `null`.
