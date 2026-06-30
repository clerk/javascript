---
'@clerk/backend': patch
---

`organizations.deleteOrganization()` now validates that an organization ID was provided. Calling it with an empty ID throws `A valid resource ID is required.` locally instead of issuing a `DELETE` request to the organizations collection endpoint, matching the other ID-based methods on the API.
