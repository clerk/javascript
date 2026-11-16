---
'@clerk/expo-passkeys': patch
---

Fix passkey sign-in failing with `passkey_authentication_failure` on iOS when the passkey is in a credential manager like 1Password. The iOS module now passes the `userVerification` requirement to the system, so the provider asks for Face ID or a passcode before it signs. Passkey creation on iOS now always requires user verification, as it already does on Android.
