---
'@clerk/expo': patch
---

Fixes iOS prebuild failures caused by newer Google Sign-In pod dependencies by avoiding the AppCheckCore version that requires additional CocoaPods modular header configuration.
