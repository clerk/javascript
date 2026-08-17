---
'@clerk/expo': patch
---

Fix email link sign-in never completing on iOS. Callback URLs opened by the "Return to App" button are now forwarded to the native SDK, including on a cold launch, so a flow started from `<AuthView />` signs the user in instead of leaving them signed out with no error.
