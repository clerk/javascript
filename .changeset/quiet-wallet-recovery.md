---
"@clerk/mosaic": patch
---

Handle rejected wallet requests in UserProfile without showing a generic error, and explain when a request is still pending in the wallet. Ignore late wallet responses after closing the profile so reopening starts a fresh connection flow.
