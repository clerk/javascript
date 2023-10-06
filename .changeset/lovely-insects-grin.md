---
"@clerk/clerk-sdk-node": patch
---

When verifying a session with the Node SDK, a JWT key is required. If no custom JWT key is set, Clerk falls back to the secret key. This change makes the SDK implement the stated default behavior.
