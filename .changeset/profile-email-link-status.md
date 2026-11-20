---
'@clerk/shared': minor
'@clerk/localizations': minor
'@clerk/ui': minor
---

The page that opens from a `<UserProfile />` email verification link now shows whether the verification worked. Until now it always said the email was verified, even when the link had expired or could not be used. It now says when the link has expired, is invalid, or must be opened on the device and browser where it was requested.

Adds the localization key `userProfile.emailAddressPage.emailLink.clientMismatch.subtitle`, translated for every locale.
