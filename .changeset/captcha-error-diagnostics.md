---
"@clerk/clerk-js": patch
---

Add debug logging for Turnstile captcha failures to help diagnose error 200100 race conditions. Logs error timeline, timing, and container state on failure only.
