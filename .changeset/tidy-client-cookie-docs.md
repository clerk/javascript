---
'@clerk/shared': patch
---

Clarify that `ClientResource.cookieExpiresAt` is nullable, can change when Clerk refreshes the client cookie, and reflects the cookie Device Trust uses to recognize a browser.
