---
'@clerk/shared': major
---

Removes now unused contexts `ClientContext`, `SessionContext`, `UserContext` and `OrganizationProvider`. We do not anticipate public use of these. If you were using any of these, file an issue to discuss a path forward as they are no longer available even internally.
