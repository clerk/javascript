---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/localizations': minor
'@clerk/ui': minor
---

The page that opens from a `<UserProfile />` email verification link now shows whether the verification worked. Until now it always said the email was verified, even when the link had expired or could not be used. It now says when the link has expired, is invalid, or must be opened on the device and browser where it was requested. A status that verification links never redirect with reads as an invalid link.

`<UserProfile />` now also mounts while no user is signed in when the URL is the page an email verification link opens: its `verify` route exactly, such as `/user/verify` with path routing or `#/verify` with hash routing, with an email verification link status. It shows only that status, so a link opened in a browser that is not signed in no longer leads to an empty page. Any other signed-out URL, including other `<UserProfile />` routes and paths under `verify`, mounts nothing as before. This needs a `@clerk/ui` version that includes this change. With an older one, it mounts nothing while signed out.

The page also updates when the app navigates to another link status while `<UserProfile />` stays mounted.

Adds the localization key `userProfile.emailAddressPage.emailLink.clientMismatch.subtitle`.
