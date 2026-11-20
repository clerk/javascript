---
'@clerk/mosaic': minor
---

**Breaking:** A page's `Panel.Title` is now its profile page title, so `Profile.Content` no longer takes `pageTitle`. The title renders inside the page, so it moves with `Flow` transitions, and on compact layouts it still opens the navigation. Give `Panel.Title` a `back` of `{ label, onClick }` to make the whole title a back button for a sub-page.

| Before | After |
| --- | --- |
| `<Profile.Content pageTitle={label}>` | `<Profile.Content>`, with `<Panel.Title>{label}</Panel.Title>` in each `Profile.ContentPanel` |

Find affected usage with `git grep -n "pageTitle="`.
