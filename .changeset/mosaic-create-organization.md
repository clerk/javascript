---
'@clerk/mosaic': patch
---

Add `<CreateOrganization />`, a card for creating an organization with a logo, a name and a slug. The new organization becomes active, and the card then offers to invite members to it. It accepts `afterCreateOrganizationUrl` and `skipInvitationScreen`, as Clerk's `<CreateOrganization />` does, plus a `fallback` that renders while Clerk loads.
