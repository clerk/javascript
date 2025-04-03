---
'@clerk/vue': minor
---

Update `useAuth` to handle pending sessions as signed-out by default, with opt-out via `useAuth({ treatPendingAsSignedOut: false })` or `app.use(clerkPlugin, { treatPendingAsSignedOut: false })`
