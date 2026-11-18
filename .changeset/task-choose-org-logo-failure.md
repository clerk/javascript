---
'@clerk/mosaic': patch
---

Fix `TaskChooseOrganization` leaving the user stuck when the logo upload fails after creating an organization. The new organization is now made active and the task completes, as in the existing `TaskChooseOrganization` component.
