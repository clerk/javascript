---
'@clerk/shared': minor
'@clerk/localizations': minor
'@clerk/ui': minor
---

`<SignIn />` and the reverification modal now guide users to reset their password when a password attempt returns `password_reset_required`. Until now, these users saw the API's English error message on the password step. They now see a "Password reset required" screen that offers "Reset your password" first, followed by their other sign-in methods. When the browser autofills the password on the first sign-in step, the user goes straight to the same screen without entering the password again.

Adds the localization keys `signIn.passwordResetRequired.title`, `reverification.passwordResetRequired.title`, `reverification.passwordResetRequired.subtitle__saveNewPassword` and `unstable__errors.password_reset_required`.
