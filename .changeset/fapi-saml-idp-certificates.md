---
'@clerk/shared': minor
'@clerk/clerk-js': minor
---

SAML enterprise connections can trust several Identity Provider signing certificates at once. `EnterpriseConnection.samlConnection` now includes `idpCertificates`, every trusted certificate with its validity window, and `organization.createEnterpriseConnection()` and `organization.updateEnterpriseConnection()` accept `saml.idpCertificates`, an array that replaces the connection's whole set. The single `saml.idpCertificate` input is deprecated in favor of the array; it keeps working and still replaces the whole set.
