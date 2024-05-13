---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/types': minor
---

Introduce new `client_mismatch` verification status for email link sign-in and sign-up. This error (and its message) will be shown if a verification link was opened in another device/browser from which the user initiated the sign-in/sign-up attempt. This functionality needs to be enabled in the Clerk dashboard.