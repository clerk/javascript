---
'@clerk/localizations': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Add a clear button to search inputs for quickly resetting the current query. It appears in the `<APIKeys />` search and the `<OrganizationProfile />` members search.

Search inputs now expose a shared `searchInput` appearance element (layered alongside any existing component-specific element), and the clear button is themeable via the new shared `searchInputClearButton` element. The clear button's label can be customized with the new shared `searchInput.action__clear` localization key.
