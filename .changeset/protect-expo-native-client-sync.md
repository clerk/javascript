---
'@clerk/expo': patch
---

Prevent native client updates from replacing a signed-in Expo client with a stale or sessionless client. Native-to-JS synchronization now keeps newer JavaScript tokens, validates client changes before applying them, and restores the previous token when validation fails.
