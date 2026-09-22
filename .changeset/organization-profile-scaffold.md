---
'@clerk/mosaic': patch
---

Add an initial `OrganizationProfileView`: an organization profile surface built on the `Profile` shell, with a sidebar of General, Members, Security, Billing, and API Keys pages. The General page provides workspace detail editing and guarded leave and delete actions. The Members page is a first pass at a responsive members table with avatars, sortable columns, row selection, bulk actions, and empty and filtered-no-results states for members, invitations, and requests. New `organizationProfile` localization keys ship with it.

Also add `ActionBar`, the floating bulk-action layout used by organization lists.
