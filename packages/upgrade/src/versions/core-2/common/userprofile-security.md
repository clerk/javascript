---
title: 'Within `<UserProfile />`, Account and Security Pages Separated'
matcher: '(?:<UserProfile|<UserButton)'
category: 'appearance'
warning: true
image: true
---

Within the `<UserProfile />` component (which is also rendered by `<UserButton />`), the "Account" and "Security" pages now live within their own tabs. Previously, "Security" was a section within the "Account" tab. The "Security" page can now be directly linked to under the `/security` path if desired.
