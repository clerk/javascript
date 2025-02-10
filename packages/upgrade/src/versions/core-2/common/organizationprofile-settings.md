---
title: '`Settings` -> `General` tab in `OrganizationProfile`'
matcher: '<OrganizationProfile'
warning: true
category: 'appearance'
image: true
---

The "Settings" tab within the `<OrganizationProfile />` component has been renamed to "General". If you are linking directly to `/organization-settings` from anywhere, the link will need to be updated to `/organization-general`.

If you are [customizing the component](https://clerk.com/docs/components/customization/organization-profile) by re-ordering the pages, the label used to target this page must be changed from `settings` to `general` as well.

If you are using the [appearance prop](https://clerk.com/docs/components/customization/overview) to customize the appearance of the `<OrganizationProfile />` component, please note that the `cl-profilePage__organizationSettings` key has also been changed to `cl-profilePage__organizationGeneral` to be consistent with the naming change.
