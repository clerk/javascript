---
'@clerk/shared': patch
'@clerk/upgrade': patch
---

Rename "Client Trust" to "Device Trust" in documentation strings and links. This is a naming change only — the `needs_client_trust` sign-in status, the `clientTrustState` property, and every other API value keep their existing names, so no integration changes are required.
