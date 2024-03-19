---
'@clerk/localizations': minor
'@clerk/clerk-js': minor
---

During sign in, navigate to the `reset-password` route if the user needs a new password. This happens when you enforce password usage during sign-in in your dashboard. Previously this case wasn't handled in the password form.

The `signIn.resetPassword.requiredMessage` localization was updated to `'For security reasons, it is required to reset your password.'`.
