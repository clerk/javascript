---
'@clerk/mosaic': minor
---

`UserProfile` and `OrganizationProfile` can keep the open page in the page's URL. The new `routing` prop takes `virtual` (the default, in memory), `path` (the pathname under `path`, as the legacy components do), `hash` or `query` (one param per component in the hash or the query string, `.user=security` for a profile at `/user`). `routing` and `path` can also be set once for every profile through `MosaicProvider`'s `profile` prop. `routing` is read when the component mounts; the profiles remount themselves when it changes.

`MosaicProvider` takes a `routing` prop. `adapter` connects the URL modes to your router so the page and the component change together; it is a plain object of optional hooks and navigation functions, and the routing guide in the repository, `packages/mosaic/docs/routing.md`, shows the Next.js App Router one. `keyPrefix` sets what goes in front of the hash and query param names, which are the component's base with dots for slashes, `.user` for `/user`; nothing by default. `modals` set to `hash` or `query` puts the profile modals in the URL too, so a modal survives a reload and Back closes it. A modal kept in memory now closes when the host navigates to another pathname. Without an adapter the URL modes read and write `window.location`.

A custom page path with a `.` or `..` part is left out with a warning, since a URL resolves those away.
