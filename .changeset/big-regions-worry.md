---
'@clerk/vue': minor
---

Update `useSession` to handle pending sessions as signed-out by default, with opt-out via `useSession({ treatPendingAsSignedOut: false })` or `app.use(clerkPlugin, { treatPendingAsSignedOut: false })`
