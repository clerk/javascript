---
'@clerk/clerk-react': minor
---

Update `useSession` to handle pending sessions as signed-out by default, with opt-out via `useSession({ treatPendingAsSignedOut: false })` or `<ClerkProvider treatPendingAsSignedOut={false} />`
