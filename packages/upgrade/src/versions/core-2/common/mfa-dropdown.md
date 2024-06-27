---
title: 'Within `<UserProfile />`, Multi-Factor Auth is Added via Dropdown'
matcher: '(?:<UserProfile|<UserButton)'
matcherFlags: 'm'
category: 'appearance'
warning: true
image: true
---

Within the `<UserProfile />` component (which is also rendered by `<UserButton />`), adding a multi-factor auth (MFA) method is now rendered as a dropdown instead of a modal. If you were relying on the modal for any sort of customizations, these customizations will need to be adjusted to the new form factor.

Two new appearance prop keys were added to aid with this process: `cl-menuList__mfa` for styling the list of MFA factors, and `cl-menuItem__mfa` for styling individual items.
