---
'@clerk/ui': minor
'@clerk/shared': patch
---

On multi-session instances, visiting the sign-in start screen while accounts are already signed in now shows the account switcher instead of the identifier form, so flows arriving at sign-in (such as OAuth authorization) continue with an existing account instead of asking for the email again. Navigations that intend to add another account bypass the switcher via the `__clerk_add_account` search param — the switcher's "Add account" action sets it automatically and now also preserves `redirect_url`, so the newly added account continues where the flow left off.
