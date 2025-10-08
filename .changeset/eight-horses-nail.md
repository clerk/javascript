---
"@clerk/vue": patch
---

Fixed an issue where the `transferable` prop in the `<SignIn />` component was incorrectly defaulting to `false` due to Vue's boolean prop coercion.
