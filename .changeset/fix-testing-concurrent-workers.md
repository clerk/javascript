---
"@clerk/testing": patch
---

Fix `signIn()` timing out with concurrent Playwright workers by de-duplicating route handler registration and adding retry with exponential backoff for transient FAPI errors (429, 502, 503, 504).
