---
'@clerk/expo': patch
---

Fix a crash on Android in Expo Go where rendering `<ClerkProvider>` failed with `Cannot find native module 'ClerkExpo'`, even for JavaScript-only flows that use no native components.
