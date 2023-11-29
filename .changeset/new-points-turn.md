---
'@clerk/clerk-react': minor
---

Fix `@clerk/clerk-react` bundle output to resolve issues with vite / rollup ESM module imports.
We have also used the `bundle` output to export a single index.ts and dropped the unnecessary
published files / folders (eg `__tests__`).
