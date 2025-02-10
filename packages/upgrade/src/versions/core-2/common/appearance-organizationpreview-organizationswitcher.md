---
title: '`elements.organizationPreview__organizationSwitcher` -> `elements.organizationPreview__organizationSwitcherTrigger` in `<OrganizationSwitcher />` appearance prop'
matcher: "<OrganizationSwitcher[\\s\\S]*?appearance={\\s*{\\s*elements:\\s*{\\s*(organizationPreview__organizationSwitcher)[\\s\\S]*?>"
matcherFlags: 'm'
category: 'appearance'
replaceWithString: 'organizationPreview__organizationSwitcherTrigger'
---

If you are using `organizationPreview__organizationSwitcher` as an [appearance prop](https://clerk.com/docs/components/customization/overview#appearance-prop) value to the [`<OrganizationSwitcher />` component](https://clerk.com/docs/references/javascript/clerk/organization-switcher#organization-switcher-component), it must be updated to `organizationPreview__organizationSwitcherTrigger` instead. This is a simple text replacement. However, it should be noted that component designs have been updated as part of v5, so you may need to make adjustments to any appearance prop customizations that have been implemented as a whole.
