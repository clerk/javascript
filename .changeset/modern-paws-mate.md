---
'@clerk/nextjs': patch
'@clerk/shared': patch
'@clerk/astro': patch
'@clerk/clerk-react': patch
'@clerk/vue': patch
---

Update `useAuth` to handle pending sessions as signed-out by default, with opt-out via `treatPendingAsSignedOut: false`
