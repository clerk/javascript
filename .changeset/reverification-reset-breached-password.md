---
'@clerk/shared': minor
'@clerk/clerk-js': minor
'@clerk/ui': minor
'@clerk/localizations': minor
---

Let users whose password was found in a data breach pass reverification by resetting it. Until now the reverification modal only showed the breached-password error, so these users couldn't make any change that needs reverification, including changing that password. The modal now offers "Reset your password": the user sets a new password and enters a code sent to their email or phone, as in sign-in. Their other verification methods stay available.

From UserProfile's change password form, the modal reuses the new password the user already entered, so they only enter the code.

`session.prepareFirstFactorVerification()` and `session.attemptFirstFactorVerification()` accept the `reset_password_email_code` and `reset_password_phone_code` strategies, so custom flows can build the same reset.
