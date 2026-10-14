---
'@clerk/expo': minor
---

Fix iOS users being signed out when the keychain can't be read for a moment, for example when the app launches in the background before the device has been unlocked since a restart.

- On iOS, `getToken()` from the `tokenCache` in `@clerk/expo/token-cache` no longer deletes the stored client token when the keychain read fails. It rejects with the keychain error instead, which also keeps tokens in app extensions. The one exception is a read that starts and fails while the app is active. That read still deletes the token and returns `null`, as before.
- When reading the client token fails, from this `tokenCache` or a custom one, Clerk waits until the app is active and reads it once more before sending the request. Requests made in the background wait until the app is opened. If the second read also fails, the request fails with that error.
- A custom `tokenCache` that deletes the token and returns `null` whenever a read fails still signs users out in this case. To avoid that, rethrow the error unless `AppState.currentState` is `active` both when the read starts and when it fails. A custom `tokenCache` that always rethrows makes Clerk requests fail until the token can be read again.
