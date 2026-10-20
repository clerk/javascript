---
'@clerk/chrome-extension': patch
---

Fix production builds that drop the setup code `@clerk/chrome-extension` runs when it loads. The package declared `sideEffects: false`, so bundlers such as Parcel, Rollup, Vite and webpack could skip that setup. With `plasmo build`, this left the extension popup blank.
