---
'@clerk/expo': minor
---

Fix iOS users being signed out when the keychain can't be read for a moment, for example when the app launches in the background before the device has been unlocked since a restart.

- On iOS, `getToken()` from the `tokenCache` in `@clerk/expo/token-cache` now rejects with the keychain error instead of deleting the stored client token, unless the read starts and fails while the app is active.
- When reading the client token fails, Clerk waits until the app is active and reads it again before sending the request. Requests made in the background wait until the app is opened.
- If your custom `tokenCache` deletes the token and returns `null` when a read fails, it can still sign users out in this case. Rethrow the error instead, unless `AppState.currentState` is `active` both when the read starts and when it fails.
