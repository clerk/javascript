---
'@clerk/ui': minor
'@clerk/localizations': minor
---

The self-serve SSO configuration (`<OrganizationProfile />` enterprise connection page and the `ConfigureSSO` SAML steps) now shows every IdP signing certificate a SAML connection trusts, with its expiry, and lets an admin add certificates from a file (a PEM bundle adds several) or remove one, so an IdP key rotation no longer needs a replacement timed with the IdP. Saving sends the whole list and only when it changed. The list holds at most five certificates. New `configureSSOCertificateList*` and `configureSSOCertificatePrimaryBadge` appearance element descriptors cover the list, and new `configureSSO.signingCertificates.*` localization keys hold its strings.
