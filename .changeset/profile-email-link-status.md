---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/localizations': minor
'@clerk/ui': minor
---

The page that opens from a `<UserProfile />` email verification link now shows whether the verification worked. Until now it always said the email was verified, even when the link had expired or could not be used. It now says when the link has expired, is invalid, or must be opened on the device and browser where it was requested. A status that verification links never redirect with reads as an invalid link.

`<UserProfile />` now also mounts while no user is signed in when the URL carries an email verification link status. It shows only that status, so a link opened in a browser that is not signed in no longer leads to an empty page. Without a link status, mounting `<UserProfile />` while signed out behaves as before.

Adds the localization key `userProfile.emailAddressPage.emailLink.clientMismatch.subtitle`.
