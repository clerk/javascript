---
'@clerk/astro': minor
---

Update `useAuth` to handle pending sessions as signed-out by default, with opt-out via `useAuth({ treatPendingAsSignedOut: false })` or `clerk({ treatPendingAsSignedOut: false })`
