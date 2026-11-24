---
id: 10
title: "Link to a component's page with the query mode's own param"
summary: '?.user=security lands the owner of /user on security in every mode. Owners outside query mode take the param into their own carrier and remove it; an entry they mount with wins. Redirects return through useReturnUrl.'
status: accepted
implementation: shipped
implementation_note: 'src/routing/consume-link.ts, called from useRouterScope in src/routing/use-router.ts and from src/modals/modal-host.tsx; useReturnUrl in src/routing/use-router.ts.'
date: 2026-11-17
authors:
  - 'Fredrik Höglund <fredrik@clerk.dev>'
tags: [architecture, virtual, modals, redirects]
supersedes: null
superseded_by: null
---

## TL;DR

A link to a component's page is the query mode's own param: the query prefix and the base with dots for slashes, valued as the query carrier values it. `?.user=security` lands the owner of `/user` on `security` and `?.modal.user=account` opens the profile modal on `account`, whatever mode they route in. In query mode the param is the entry and nothing happens. In `virtual`, `path` and `hash` mode the owner reads the param for its own base, writes the parts to its own carrier with a replace, and removes the param. The modal host does the same for each surface, since a modal's content does not mount until its entry exists. A link present at mount gives way to an entry the owner already has; one that arrives later is applied. A redirect hands Clerk `useReturnUrl(routes)(name, params)`, which is the page's URL with that link in it.

## Context

The first return was profile-specific: three section models appended `__clerk_mosaic_modal=user-profile/account` to the redirect URL in modal mode, and a component in the provider matched that one value and opened the profile modal. Every new redirecting feature would have needed its own value and reader. [MEDR-0003](./0003-page-state-acts-like-a-url.md) made a modal open exactly while its entry exists, so a return can be an entry written from outside, as a deep link is in the URL modes.

The next shape was a return seed: in virtual mode `useReturnUrl` added a param under a separate return prefix, `r.user=security`, and the provider wrote every such param into the virtual store when it mounted and removed them. It was rejected:

- Two params meant one thing. `?.user=security` already said "the owner of `/user` on `security`" in query mode; `r.user` said it again, for virtual mode only. A host linking to a page had to know which mode the component was in.
- Nothing outside needs a format of its own. The backend never writes a component's step; it appends `__clerk_*` params to a URL the frontend built. The only writers of the format are `useReturnUrl` and a host's own links, and both can use the query mode's.
- The provider read the URL once, at mount. A link clicked while the page stayed mounted, a Next `<Link href="?.user=security">`, did nothing until a reload.
- The provider wrote entries for bases it knew nothing about, before anything owned them.

Also rejected:

- A reserved param holding every link, rejected for the carriers in [MEDR-0008](./0008-url-carriers.md) for the same reasons: two links would share one value, and one could not be removed on its own.
- Writing or stripping from render or from the hydration commit. Under Next.js a replace in the hydration commit is lost, because Next patches `history` after it. The link is read during render, from the `window` store's committed snapshot, so the linked page is in the first client render; the write and the strip run in an effect and then a microtask.
- Reading links from the hash. The hash belongs to hash mode's live state and to the host's anchors; a link is a query param only.
- Carrying a modal's open options in the URL. Options are code, such as custom page content; a link falls back to the provider's, as any open without options does.
- Letting models build the URL from the mode, as the first return did. It puts routing knowledge in features.
- Guarding two owners of one base in different modes. They are already a configuration error ([MEDR-0004](./0004-owner-and-nested-routers.md)); a link adds one more way it shows.

## Decision

The owner consumes the link for its own base; the provider has no part in it.

- `useConsumeLink(location, entry, { routing, path })` is called by `useRouterScope` and by the modal host for each surface. Nested routers never write, so they do not consume. The key is `paramKey(queryPrefix, path)`, the query carrier's key for that base; the modal host passes the surface's path.
- In query mode it does nothing. Otherwise it subscribes to the `window` store, and while the owner holds no entry of its own it renders from the link's parts, so a deep link shows its page in the first render. An effect keyed on the query string writes the parts into the owner's carrier or the store and strips the link, so a link that arrives while the owner is mounted is seen too; mount is its first run. The effect reads the live `window.location.search` in a microtask, skipping a run that was cleaned up before the microtask, so StrictMode reads once.
- At the first run an entry the owner has wins: the link is removed and not applied. "Has" means the store or the carrier holds parts for the base; in path mode the base itself counts as nothing, since a pathname always says something. A link seen on a later run is applied whatever the entry, because it is a navigation.
- Applying is the location's own write with a replace, to the store, the pathname or the hash. The link is then removed by rewriting the live `window` URL with `writeWindowUrl(url, true)`, never through the adapter's `replace`, so two owners removing their links in one tick compose. Only that one pair is removed; the rest of the query string is rewritten in `URLSearchParams` form, and the write carries no history state.
- `useReturnUrl(routes)` reads the inherited scope and returns a builder typed like `go` without the write options. It reads `window.location` when called and returns an absolute URL with the route's parts written by the scope's carrier, and by the query carrier under the query prefix in virtual mode. Outside a scope it returns the page's URL as it is.

## Consequences

- One URL means one thing in every mode. A host links to a component's page without knowing its mode, and a redirect returns to the modal or inline component it left from.
- Only the route comes back. A modal opened by a link has the provider's options; machine state and unsaved input are gone; sections read their resources again, which is what shows the result of the redirect.
- The link is read through the adapter's `useSearchParams` where there is one, so a server render shows the linked page too. Without an adapter the `window` store has no server snapshot, so a server render shows the root and the client takes the link in the re-render that follows hydration. A modal is open from its first render as well, since the host derives the same way.
- A link to a base nothing owns stays in the URL until an owner mounts. A link for an owner mounted later, such as a profile waiting for Clerk, is applied when it mounts.
- An unknown segment in a link goes through the owner's table like any entry and shows the root. Nothing in a link is ever used as a URL or a destination.
- A virtual and a query owner of one base on one page share one param: the query owner reads it as its entry and the virtual owner removes it. It is the configuration error of [MEDR-0004](./0004-owner-and-nested-routers.md), unguarded.
- Every owner outside query mode re-renders on a change of the page's URL, to see a link arrive.
- Under an adapter whose `replace` applies asynchronously, the location's write may land after the link is removed and bring it back for one more pass.
- `/a.b` and `/a/b` share a link, as they share a carrier key. A redirect started before an upgrade returns with `__clerk_mosaic_modal` or `r.<base>`, neither of which is read.

## References

- `src/routing/consume-link.ts`, `src/routing/use-router.ts`, `src/modals/modal-host.tsx`
- `src/routing/__tests__/location-contract.test.tsx`, `src/routing/__tests__/consume-link.test.tsx`, `src/routing/__tests__/use-return-url.test.tsx`, `src/features/user-profile/__tests__/user-profile.return.feature.test.tsx`
- [MEDR-0003](./0003-page-state-acts-like-a-url.md), [MEDR-0004](./0004-owner-and-nested-routers.md), [MEDR-0008](./0008-url-carriers.md)

## Changelog

- **2026-11-17**: Accepted.
- **2026-11-24**: Amended: path mode for modals is gone; a removed link leaves the query string in `URLSearchParams` form and no history state.
