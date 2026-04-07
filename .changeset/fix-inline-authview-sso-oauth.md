---
'@clerk/expo': patch
---

Fix OAuth (SSO) sign-in from the forgot-password screen when using the inline `<AuthView>` component on iOS. Previously, embedding the AuthView's `UIHostingController` as a child of a React Native view disrupted `ASWebAuthenticationSession` callbacks, causing OAuth flows initiated from the forgot-password screen to silently fail. The inline view now presents its hosting controller via `UIViewController.present()` so the OAuth callback chain completes correctly. Visual appearance is unchanged.
