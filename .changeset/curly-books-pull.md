---
'@clerk/mosaic': minor
---

`UserProfile` and `OrganizationProfile` now route their pages through a location instead of local state, which changes a few things for consumers:

- The `defaultPage` prop is removed. A profile opens on the first page in its navigation, as the legacy components do. To open on another page, put it first with `pageOrder`, or open the profile as a modal with the `page` option.
- A new `path` prop sets the base a profile's pages live under, `/user` and `/organization` by default. Two profiles on one page need different bases.
- There is no path or hash mode yet, so urls are not updated, this will come in a later version.
- A custom page whose `path` cannot be a route, because it is percent-encoded, starts with a colon, or is the URL segment of a built-in page such as `api-keys`, is left out of the navigation with a console warning instead of rendering a page that cannot be reached.
