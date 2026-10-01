---
'@clerk/shared': minor
'@clerk/clerk-js': minor
'@clerk/ui': minor
'@clerk/localizations': minor
'@clerk/react': minor
---

Support passkeys as a second factor during sign-in and session reverification.

As with first factor, when a passkey is available, prebuilt `<SignIn/>` and
`<UserVerification/>` flows preselect the passkey as the preferred second
factor method. Other methods stay reachable under "Use another method".

This feature is only enabled for instances which allow passkeys to satisfy
second factor; this is true for any instances created after 2026-07-08, or can
be toggled in the Dashboard for older instances.
