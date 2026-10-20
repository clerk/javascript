---
'@clerk/chrome-extension': patch
---

Mark the entry files that run setup code at load as having side effects. Previously `sideEffects: false` let bundlers without scope hoisting (such as Parcel in `plasmo build`) drop that setup, which left the extension popup blank in production builds.
