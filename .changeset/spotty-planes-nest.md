---
'@clerk/react': patch
---

Fix a false-positive "multiple `<ClerkProvider>`" crash in apps that run more than one React root in a single JavaScript runtime, most commonly React Native Android apps during activity recreation. `<ClerkProvider>` now throws this error only when it is genuinely nested inside another `<ClerkProvider>`.
