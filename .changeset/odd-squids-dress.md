---
"@clerk/clerk-js": patch
---

Improve bot detection by loading the Turnstile SDK directly from CloudFlare.

If loading fails due to CSP rules, load it through FAPI instead.
