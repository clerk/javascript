---
'@clerk/expo': minor
---

Fix iOS users being signed out when the keychain can't be read for a moment, for example when the app is launched in the background before the device has been unlocked since a restart.

- On iOS, `getToken()` from the `@clerk/expo/token-cache` `tokenCache` now rejects with the keychain error unless the read both starts and fails while the app is active, instead of deleting the stored client token and returning `null`. This also preserves tokens in app extensions. A read that both starts and fails while the app is active still clears the token, as before.
- When reading the client token fails, from this `tokenCache` or a custom one, Clerk now waits until the app is active and reads it again before sending the request. If this happens while the app is in the background, those requests wait until the app is opened. If a custom `tokenCache` still fails, the request fails with its error, as before.
- A custom `tokenCache` that deletes the token and returns `null` whenever a read fails will still sign users out in this situation. To avoid that, rethrow the error unless `AppState.currentState` is `active` both when the read starts and when it fails. A custom `tokenCache` that always rethrows makes Clerk requests fail until the token can be read again.
