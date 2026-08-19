---
'@clerk/shared': minor
---

Add an `enabled` param to `useOrganization()` and `useOrganizationList()`. On a development instance with organizations disabled, reading either hook opens a prompt offering to turn them on. Pass `enabled: false` from a surface that reads organizations only when the instance already has them, and an instance that does not use organizations is never asked about them. Defaults to `true`, so existing callers are unaffected.
