---
'@clerk/clerk-js': patch
---

The `zxcvbn` is now bundled within the clerk-js headless variant.

This affects only the `clerk.headless.js` bundle because dynamic `import()` cannot be achieved in non-browser environments, so the whole library needs to be bundled together with the rest of clerk-js.
