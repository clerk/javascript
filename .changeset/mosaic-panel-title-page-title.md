---
'@clerk/mosaic': minor
---

**Breaking:** A page's `Panel.Title` is now its profile page title, so `Profile.Content` no longer takes `pageTitle`. On compact layouts it still opens the navigation.

A page can now open sub-pages. Give its `Profile.ContentPanel` a `label`, `subPage` and `onSubPageChange`, and wrap each view in a `Profile.SubPage`, with `value={null}` for the page itself. A sub-page's `Panel.Title` gets a back button to the page above it.

| Before | After |
| --- | --- |
| `<Profile.Content pageTitle={label}>` | `<Profile.Content>`, with `<Panel.Title>{label}</Panel.Title>` in each `Profile.ContentPanel` |

Find affected usage with `git grep -n "pageTitle="`.
