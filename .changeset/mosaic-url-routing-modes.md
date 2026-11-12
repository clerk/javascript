---
'@clerk/mosaic': minor
---

`UserProfile` and `OrganizationProfile` can keep the open page in the page's URL. The new `routing` prop takes `virtual` (the default, in memory), `path` (the pathname under `path`, as the legacy components do), `hash` or `query` (one param per component in the hash or the query string, `p.user=security` for a profile at `/user`). `routing` and `path` can also be set once for every profile through `MosaicProvider`'s `profile` prop. Changing `routing` on a mounted component needs a remount; a changed value logs a warning and is otherwise ignored.

`MosaicProvider` takes a `routing` prop. `adapter` connects the URL modes to your router so the page and the component change together; it is a plain object of optional hooks and navigation functions, and `docs/routing.md` in the package shows the Next.js App Router one. `keyPrefix` sets what the hash and query param names start with, `p.` and nothing by default. `modals` set to `hash` or `query` puts the profile modals in the URL too, so a modal survives a reload and Back closes it; `{ routing: 'path', path }` puts them in the pathname under the page named by `path`. Without an adapter the URL modes read and write `window.location`.

A custom page path with a `.` or `..` part is left out with a warning, since a URL resolves those away. In `hash` and `query` mode a segment's part cannot contain a slash, because the host decodes the value before Mosaic reads it.

A profile page switch, a closing dialog or a closing popup now also commits when the change arrives inside a React transition, as it does when a host router such as Next.js moves its hooks, and the leaving content holds the same frame it would from a click. Before, the leaving content's frozen frame held the transition back indefinitely.
