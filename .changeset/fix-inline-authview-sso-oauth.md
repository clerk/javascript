---
'@clerk/expo': patch
---

- Fix iOS OAuth (SSO) sign-in failing silently when initiated from the forgot password screen of the inline `<AuthView>` component.
- Fix Android `<AuthView>` getting stuck on the "Get help" screen after sign out via `<UserProfileView>`.
- Fix a brief white flash when the inline `<AuthView>` first mounts on iOS.
