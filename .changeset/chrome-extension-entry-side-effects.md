---
'@clerk/chrome-extension': patch
---

Mark the entry files that run setup code at load as having side effects. Previously `sideEffects: false` let bundlers such as Parcel, Rollup, Vite and webpack drop that setup in production builds. In Parcel (used by `plasmo build`), this left the extension popup blank.
