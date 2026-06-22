---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/react': minor
---

Expose the loaded `@clerk/ui` version on the `Clerk` object via a new `uiVersion` property. It returns the version of the prebuilt UI bundle once it has loaded (for example `Clerk.uiVersion` in the browser console), or `undefined` if the UI has not been loaded yet. `@clerk/clerk-js` and `@clerk/ui` are versioned and loaded independently, so `uiVersion` can differ from `Clerk.version`.
