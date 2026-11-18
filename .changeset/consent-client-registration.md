---
'@clerk/shared': minor
'@clerk/clerk-js': minor
'@clerk/ui': minor
'@clerk/localizations': minor
---

Show how an OAuth client's identity was established on `<OAuthConsent />`. Clients that registered themselves through Dynamic Client Registration get an "Unverified app" notice, and clients identified by a Client ID Metadata Document show the host that publishes their details. `OAuthConsentInfo` gains optional `clientRegistration` and `clientMetadataHost` fields, and the notice can be styled with the new `oauthConsentClientIdentity` appearance element.
