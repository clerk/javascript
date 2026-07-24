---
'@clerk/expo': patch
---

Prevent native client updates from replacing a signed-in Expo client with a stale or sessionless client. Native-to-JS synchronization now validates client changes before applying them, restores the previous token when validation fails, and applies the same protection during 401 recovery.
