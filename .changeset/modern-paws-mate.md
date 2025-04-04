---
'@clerk/nextjs': minor
'@clerk/shared': minor
'@clerk/clerk-react': minor
---

Update `useAuth` to handle pending sessions as signed-out by default, with opt-out via `useAuth({ treatPendingAsSignedOut: false })` or `<ClerkProvider treatPendingAsSignedOut={false} />`
