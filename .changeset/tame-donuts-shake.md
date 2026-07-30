---
'@clerk/astro': patch
'@clerk/vue': patch
---

Fix the `appearance` option rejecting valid properties such as `theme`, `variables`, and `elements` with a "does not exist in type `Appearance<Ui>`" TypeScript error. This also affects `@clerk/nuxt`, which derives its module options from `@clerk/vue`.
