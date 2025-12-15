---
title: '`hideSlug` prop removed'
matcher: 'hideSlug'
category: 'deprecation-removal'
---

The `hideSlug` prop has been removed. Organization slugs are now managed through the Clerk Dashboard under Organization Settings.

```diff
<OrganizationProfile
- hideSlug={true}
/>
```

To hide organization slugs, update your settings in the Clerk Dashboard → Organization Settings → Slug.
