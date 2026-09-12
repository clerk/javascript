---
'@clerk/ui': minor
---

`<SignIn />` now honors `prompt=select_account` on its URL. On multi-session instances, a signed-in visitor arriving with it sees the account switcher instead of the identifier form, so flows that route through sign-in (such as OAuth authorization) can continue with an existing account. "Add account" opens the form. Single-session instances and visitors with no session are unaffected.
