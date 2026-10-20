---
'@clerk/chrome-extension': patch
---

Fix production builds that drop the setup code `@clerk/chrome-extension` runs when it loads. The package no longer declares `sideEffects: false`, which let bundlers such as Parcel skip that setup. With `plasmo build`, this left the extension popup blank. Bundle size is unchanged.
