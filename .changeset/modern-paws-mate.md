---
'@clerk/nextjs': patch
'@clerk/shared': patch
'@clerk/clerk-react': patch
---

Update `useAuth` to handle pending sessions as signed-out by default, with opt-out via `useAuth({ treatPendingAsSignedOut: false })` or `<ClerkProvider treatPendingAsSignedOut={false} />`
