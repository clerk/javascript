---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Add an `enterpriseConnectionsUrl` option to `handleRedirectCallback()` and `<AuthenticateWithRedirectCallback />`. When the Clerk API asks an OAuth sign-up to choose between several enterprise connections for the same email domain, the callback navigates to this URL, which defaults to the `enterprise-connections` route of your sign-up page.
