---
'@clerk/backend': minor
---

SAML connections can trust several Identity Provider signing certificates at once. `SamlConnection` and `EnterpriseConnection.samlConnection` now include `idpCertificates`, every trusted certificate with its validity window, and `createSamlConnection()`, `updateSamlConnection()`, `createEnterpriseConnection()` and `updateEnterpriseConnection()` accept an `idpCertificates` array that replaces the connection's whole set. The single `idpCertificate` parameter is deprecated in favor of the array; it keeps working and still replaces the whole set.
