---
'@clerk/mosaic': patch
---

Add `<OrganizationList />`, a card that lists the personal account, the organizations the user belongs to, and the organizations they are invited to or may request to join. Selecting one makes it active, and **Create organization** opens `<CreateOrganization />` in place of the list. It accepts `afterSelectOrganizationUrl`, `afterSelectPersonalUrl`, `afterCreateOrganizationUrl`, `hidePersonal` and `skipInvitationScreen`, as Clerk's `<OrganizationList />` does, plus a `fallback` that renders while Clerk loads.
