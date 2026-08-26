---
'@clerk/ui': minor
---

Add the Mosaic `Otp` component: a styled verification-code field built on the headless `Otp` primitive. It renders one box per character, matches `Input`'s border, hover, and focus treatment, supports `sm`/`md`/`lg` sizes, and colours every box for a `neutral`, `success`, or `error` status. Inside a `Field.Root` it picks up the field's `disabled` and `invalid` state.
