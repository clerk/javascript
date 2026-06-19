---
'@clerk/clerk-js': minor
---

Fix the inline captcha spotlight to expand correctly when an older clerk-js runtime is paired with a newer UI that expects the `data-cl-interactive` attribute — the challenge now falls back to the `maxHeight` heuristic so the spotlight still fires across version skews.
