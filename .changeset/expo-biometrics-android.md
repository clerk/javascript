---
'@clerk/expo-biometrics': minor
---

Add Android support. Keys live in the Android Keystore and records in the storage shared with the Clerk Android SDK, so credentials enrolled by either SDK in the same app are visible to both. Add `hashIdentifierHint()` and an `identifierHintSha256` field on the records returned by `listRecords()`, so identifier hints can be matched on both platforms (Android stores only the hash).
