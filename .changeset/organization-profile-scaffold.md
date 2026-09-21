---
'@clerk/mosaic': patch
---

Add an initial `OrganizationProfileView`: an organization profile surface built on the `Profile` shell, with a sidebar of General, Members, Security, Billing, and API Keys pages. The General page provides workspace detail editing and guarded leave and delete actions. The Members page is a first pass at a responsive members table with avatars, sortable columns, row selection, bulk actions, and empty and filtered-no-results states for members, invitations, and requests. New `organizationProfile` localization keys ship with it.

Also add styled `Tabs` and `ActionBar` components. Tabs provide an animated selection indicator, and ActionBar provides the floating bulk-action layout used by organization lists.

`Pagination` is reworked into the compact table-footer control used by the members table: it now shows the visible item range, the results-per-page control, first/previous/next/last controls, and the current page over the total, instead of a row of page-number buttons. `hasFirstLast` defaults to `true`, the default `pageSizeOptions` are now `[10, 15, 20, 100]`, and the `siblingCount` prop is removed because there are no longer page numbers to window. New `rangeLabel` and `pageSizeLabelCompact` props make the remaining visible strings translatable.
