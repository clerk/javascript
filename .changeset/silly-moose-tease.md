---
"@clerk/tanstack-start": patch
---

- Fixes a bug where the initial router context is getting overwritten when updating the router inside `createClerkHandler`
