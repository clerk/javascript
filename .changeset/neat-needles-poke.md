---
"@clerk/clerk-react": patch
---

Refactor our script loading logic to use a `versionSelector` helper function. No change in behavior should occur. This internal change allows versions tagged with `snapshot` and `staging` to use the exact corresponding NPM version of `@clerk/clerk-js`.
