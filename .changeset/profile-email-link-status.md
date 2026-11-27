---
'@clerk/shared': minor
'@clerk/localizations': minor
'@clerk/ui': minor
---

The page that opens from a `<UserProfile />` email verification link now shows whether the verification worked. Until now it always said the email was verified, even when the link had expired or could not be used. It now says when the link has expired, is invalid, or must be opened on the device and browser where it was requested.

Adds the localization key `userProfile.emailAddressPage.emailLink.clientMismatch.subtitle`, translated for every locale.

Translates the sign-in email link message for a link opened on another device into Bulgarian, Catalan, Mongolian, Serbian, Ukrainian and Simplified Chinese. The profile page reuses its title.

Corrects that message's title in Belarusian, Danish, Dutch, French, German, Greek, Italian, Portuguese (Portugal) and Spanish (Spain), where it described a client error instead of a link opened on another device.
