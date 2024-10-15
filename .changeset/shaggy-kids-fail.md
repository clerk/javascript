---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Add experimental standalone mode for `<UserButton />` and `<OrganizationSwitcher />`.
When `__experimental_asStandalone: true` the component will not render its trigger, and instead it will render only the contents of the popover in place.

APIs that changed:
- (For internal usage) Added `__experimental_prefetchOrganizationSwitcher` as a way to mount an internal component that will render the `useOrganizationList()` hook and prefetch the necessary data for the popover of `<OrganizationSwitcher />`. This enhances the UX since no loading state will be visible and keeps CLS to the minimum.
- New property for `mountOrganizationSwitcher(node, { __experimental_asStandalone: true })`
- New property for `mountUserButton(node, { __experimental_asStandalone: true })`
