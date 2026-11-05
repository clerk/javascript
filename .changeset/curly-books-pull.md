---
'@clerk/mosaic': minor
---

`UserProfile` and `OrganizationProfile` now route their pages through a location instead of local state, which changes a few things for consumers:

- The `defaultPage` prop is removed. A profile opens on the first page in its navigation, as the legacy components do. To open on another page, put it first with `pageOrder`, or open the profile as a modal with the `page` option:

  ```tsx
  // before
  <UserProfile defaultPage='security' />;

  // after
  <UserProfile pageOrder={['security', 'account']} />;
  // or
  const userProfile = useModal(userProfileModal);
  userProfile.open({ page: 'security' });
  ```

- A new `path` prop sets the base a profile's pages live under, `/user` and `/organization` by default. Two profiles on one page need different bases.
- The open page outlives the component: a profile that unmounts and mounts again under the same `MosaicProvider` comes back on the page it was on.
- A profile opened as a modal starts on the requested page every time, and closing it no longer leaves the page behind for the next open.
- A custom page whose `path` cannot be a route, because it is percent-encoded, starts with a colon, or is the URL segment of a built-in page such as `api-keys`, is left out of the navigation with a console warning instead of rendering a page that cannot be reached.
