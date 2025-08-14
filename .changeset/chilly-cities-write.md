---
'@clerk/clerk-js': minor
---

Rework the OTP input to use a single transparent input (via `input-otp`) to improve password manager compatibility and iOS/Android SMS-based autofill. Removes individual digit fields; a single invisible input drives the six visual slots.
