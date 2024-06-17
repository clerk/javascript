---
title: '`button` -> `organizationListCreateOrganizationActionButton` customization id'
image: true
replaceWithString: 'organizationListCreateOrganizationActionButton'
category: 'appearance'
matcherFlags: 'm'
matcher:
  - "\\.cl-(button)"
  - "elements:\\s+{[\\s\\S]*?(button):[\\s\\S]*?}"
---

The `button` customization id was used only in one place, for a button to create a new organization in the `<OrganizationList />` component. This id has been removed and replaced by the more appropriately named `organizationListCreateOrganizationActionButton` customization id instead.
