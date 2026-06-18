---
"@clerk/expo": patch
---

Fix Android native component initialization when the Expo native module does not expose React Native event listener bookkeeping methods, and make the generated iOS bridge compatible with Swift's explicit import visibility checks.
