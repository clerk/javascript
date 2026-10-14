---
'@clerk/expo-native-components': minor
---

Add an `enableRestoreCredentials` prop to `AuthView` that turns on [Restore Credentials](https://developer.android.com/identity/sign-in/restore-credentials) on Android, so users stay signed in when they move to a new device. It is off by default and ignored on iOS. When it is on, a signed-out `AuthView` silently signs the user in with a restore credential transferred from their old device, and after a sign-in or sign-up it creates a restore credential in the background. Passkeys must be enabled for your Clerk instance.

```tsx
<AuthView enableRestoreCredentials />
```
