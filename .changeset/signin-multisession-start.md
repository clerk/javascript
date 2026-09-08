---
'@clerk/ui': minor
'@clerk/shared': minor
---

Add a `multiSessionStart` prop to `<SignIn />`. On multi-session instances, `'switcher'` starts a signed-in visitor on the account switcher instead of the identifier form, so flows that route through sign-in (such as OAuth authorization) can continue with an existing account. Defaults to `'form'`; ignored in single-session mode. "Add account" from the switcher now preserves the current `redirect_url`; from the switcher and the `<UserButton />` it opens the sign-in form directly instead of returning to the switcher.
