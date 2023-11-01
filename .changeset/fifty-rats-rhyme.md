---
"@clerk/nextjs": patch
"@clerk/remix": patch
"@clerk/clerk-sdk-node": patch
"@clerk/shared": patch
---

Introduce `isTruthy` helper to better cast environment variables to a boolean. Previously only the string `"true"` was checked, now `true`, `"true"`, `"1"`, and `1` will work.
