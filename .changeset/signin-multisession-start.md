---
'@clerk/ui': minor
'@clerk/shared': minor
---

Add a `multiSessionStart` prop to `<SignIn />`. On multi-session instances, setting it to `'switcher'` starts a signed-in visitor on the account switcher (listing the signed-in accounts, with "Add account" and "Sign out of all accounts") instead of the identifier form, so flows that route through sign-in such as OAuth authorization can continue with an existing account. The default `'form'` keeps the current behavior, and the prop is ignored in single-session mode. The switcher's "Add account" action now also preserves the current `redirect_url`, so the newly added account continues where the flow left off.
