---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/ui': minor
'@clerk/localizations': minor
---

Support sign-in-or-sign-up combined flow with Clerk <SignIn> component
when strict enumeration protection is enabled.

On development instances, `<SignIn>` now logs a warning when the sign-in-or-up flow is rendered on an
instance that has both password and strict enumeration protection enabled. In that configuration
visitors without an account are routed to the password screen and cannot complete a sign-up, so the
warning names both settings and how to resolve them.
