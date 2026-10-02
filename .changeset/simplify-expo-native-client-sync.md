---
'@clerk/expo': minor
---

Rewrite the sync between the Clerk JS client and the native Clerk SDK. Both now share a single device token stored by the native SDK, and startup makes fewer requests. This fixes a stale token in the app's `tokenCache` signing out a session that was signed in natively, and the two SDKs ending up on different tokens when both rotated the device token at the same time. Requires the matching native module that ships with the next native SDK versions.
