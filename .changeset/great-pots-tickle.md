---
'@clerk/localizations': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Display a proper message when a password is rejected for matching one of the account's identifiers. Previously this error rendered as the incomplete sentence "Your password must contain ." on sign-up, reset password, and the user profile password form. The new message is available under the `unstable__errors.form_password_matches_identifier` localization key, and any password error the UI does not recognize now falls back to the message returned by the API instead of an empty sentence.
