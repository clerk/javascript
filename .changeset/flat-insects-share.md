---
'@clerk/clerk-react': patch
'@clerk/vue': patch
---

Update `useSession` to handle pending sessions as signed-out by default, with opt-out via `useSession({ treatPendingAsSignedOut: false })`
