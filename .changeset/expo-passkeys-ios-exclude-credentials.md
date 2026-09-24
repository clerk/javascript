---
'@clerk/expo-passkeys': patch
---

Fix passkey registration on iOS ignoring the credentials Clerk asks it to exclude, which allowed a second passkey to be created for an account that already had one on the device. Registering a duplicate now fails with `passkey_already_exists`, matching Android and web.
