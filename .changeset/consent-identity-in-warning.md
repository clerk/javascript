---
'@clerk/shared': patch
'@clerk/ui': patch
'@clerk/localizations': patch
---

Move the OAuth client identity notice on `<OAuthConsent />` into the existing consent warning instead of a separate line under the header. A client that registered itself through Dynamic Client Registration now reads "{{applicationName}} registered itself, so its name and logo are not verified.", and a client identified by a Client ID Metadata Document reads "Details published by {{metadataHost}}.".
