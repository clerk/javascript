---
'@clerk/localizations': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Add a clear button to search inputs for quickly resetting the current query. It appears in the `<APIKeys />` search and the `<OrganizationProfile />` members search.

The button is themeable via the new shared `searchInputClearButton` appearance element, and its label can be customized with the new shared `searchInput.action__clear` localization key.
