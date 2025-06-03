---
'@clerk/clerk-expo': minor
---

Default token cache `SecureStore` implementation `keychainAccessible` to `AFTER_FIRST_UNLOCK` createResourceCacheStore to align with createTokenCache - The data in the keychain item cannot be accessed after a restart until the device has been unlocked once by the user. This may be useful if you need to access the item when the device is locked.
