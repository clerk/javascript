---
'@clerk/expo-native-components': minor
---

Add an `enableRestoreCredentials` prop to `AuthView` that turns on [Restore Credentials](https://developer.android.com/identity/sign-in/restore-credentials) on Android, so users stay signed in when they move to a new device. It is off by default and ignored on iOS. When it is on, on the first launch after the app is installed or restored onto a device, a signed-out `AuthView` silently signs the user in with the restore credential transferred from their old device. Later launches don't try again. After a sign-in or sign-up, it creates a restore credential for the signed-in user in the background, replacing the one this device created for that user before; a device holds one restore credential, for the user who most recently signed in. Passkeys must be enabled as a first factor for your Clerk instance. On Android, when a signed-in session on the device ends, including a sign-out from JavaScript, the device's restore credential is deleted.

```tsx
<AuthView enableRestoreCredentials />
```
