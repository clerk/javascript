---
id: 8
title: 'Carry a segment in the pathname, the hash or the query string'
summary: "A URL mode reads its segment from the host URL every render and writes the whole URL back at once. The pathname holds one segment in legacy's shape; the hash and the query string hold one param per base, named by a prefix and the base."
status: accepted
implementation: shipped
implementation_note: 'src/routing/url-location.ts, src/routing/url-params.ts, src/routing/window-location.ts and src/routing/use-mosaic-location.ts.'
date: 2026-11-11
authors:
  - 'Fredrik Höglund <fredrik@clerk.dev>'
tags: [architecture, path, hash, query, modals]
supersedes: null
superseded_by: null
---

## TL;DR

`routing: 'path' | 'hash' | 'query'` puts a component's segment in the page's URL. The location is derived: every render reads the host URL, finds its segment and decodes it, and a write builds the full URL with only that segment changed and hands it to the host at once. Nothing is queued, stored or counted. The pathname holds exactly one segment, `/user/security`, as legacy did. The hash and the query string hold one param per base: the key is a prefix and the base with dots for slashes, `p.user`, and the value is the parts encoded one by one and joined with `/`. A param's value is read decoded, as the host reads any param, so a part there cannot contain a slash; the pathname is Mosaic's and is split before it is decoded. A component's mode is fixed when it mounts.

## Context

[MEDR-0003](./0003-page-state-acts-like-a-url.md) made the virtual store behave like a URL and ended with the note that a URL carrier would have to project the map, or two writes in one tick would clobber each other. Building it the other way round is simpler: a URL already is the shared state the store imitates, so a location that reads the URL and writes it has nothing of its own to keep in step. Projecting the map, or queueing writes into a microtask, was rejected: it adds a second copy of the state, a flush that the host's transitions cannot see, and a window in which a read is stale. Two writes in one handler clobbering each other is accepted; no Mosaic code does it, and a host that does gets the last write, as it would from the URL anywhere else.

Where a segment lives:

- The pathname keeps legacy's shape, and `path` is where the component is mounted. There is room for one owner; a second would need the pathname too. A component mounted somewhere other than its `path` shows its root and warns in development, since legacy threw here and a silent default sends the first click off the page.
- Legacy kept hash and query state in one `__clerk_` param it parsed itself. Hosts should not meet Clerk's name in their URLs, and two components on one page need two params, so there is one param per base, keyed by a prefix the host can set. The query prefix defaults to `p.` because the query string is shared with the app; the hash prefix is empty because the hash rarely is.
- In the pathname, parts are encoded one at a time and the segment is split before it is decoded, as [MEDR-0002](./0002-names-in-parts-out.md) requires, so a slash inside a part survives. The same was tried for the query string, reading pairs on their raw form, and failed in the swingset under Next: something in the host's stack re-serialised the query after hydration, `organization/general` came back as `organization%2Fgeneral`, and the segment read as one unknown part. A host may re-serialise its query at any time, so the raw form of the query is the host's, not Mosaic's. A param's value is therefore read decoded, the way `URLSearchParams` reads it, and split on `/`, which makes the carrier indifferent to how the host serialises it; a write with a slash inside a part is refused with a warning. Writes still touch only Mosaic's own pair, so a pair that is not ours is kept byte for byte.

Rejected: `location.hash =` for hash writes, since Next strips a hash it did not write, so every mode writes with `pushState`; one reserved param for every base, since two components would collide and a modal's entry could not be dropped on its own; escaping dots in the key, since `/a.b` and `/a/b` sharing `p.a.b` costs less than an unreadable key; closing a modal with `history.back()`, since after a navigation inside the modal that would show the previous page of the modal rather than close it.

## Decision

A URL location is derived from the host URL and writes to it directly.

- Reads come from the adapter's hooks where it has them, [MEDR-0009](./0009-router-adapter.md), and from a `window` store otherwise. The server renders no entry, so a URL-mode component renders its root and corrects once after hydration.
- A write is built in the world of whoever performs it: through the adapter's `push` or `replace` it starts from the adapter's reads as this commit rendered them, with `window` for the ones it lacks; without them it starts from `window`, which already has whatever the host puts around a pathname, such as a base path. The rendered values reach a write through an insertion effect, so a write from any effect of the same commit starts from that commit. The location object changes only when its entry does, so a host that re-renders does not hand the components above a new location.
- `own` is a no-op and nothing is parked: the URL outlives the component by itself. `clear` replaces; in the pathname it writes the base, in a param it removes the pair.
- A modal opens with a push and closes with a replace.
- The pathname refuses parts of `.` and `..`, which a URL resolves away; compares its base part by part on the decoded form, since browsers and routers leave different characters raw; and reads one trailing slash as the same pathname.
- A `window` write goes without Next's history marker, so the App Router applies it to its hooks; the rest of the state goes along for any router that keeps its own data there.
- Change notifications are synchronous. Mosaic writes only from handlers and effects.
- The mode is fixed on the first render, since each mode calls its own hooks. A component changes mode by remounting, which the profiles do by keying on `routing`; a changed prop warns and is ignored.

## Consequences

- Back works in every URL mode, a deep link opens the page it names, and the page survives a reload. After a modal is opened and closed the page has two history entries, so the first Back appears to do nothing; cheap to change if it turns out to matter.
- Two writes in one tick clobber each other; the last one wins.
- A host that adds trailing slashes redirects each write once. Under a base path, hash and query work with reads alone, since the write then starts from `window`; path mode needs `push` and `replace` that prepend the base path.
- A write from a passive effect in the hydration commit of a Next.js app runs before Next has patched `history`, so Next does not see it. Nothing in Mosaic writes there today: the profiles wait for Clerk before their first redirect. A write that has to happen then goes through a microtask, as the modal return does.
- A part cannot contain a slash in hash or query mode, and a custom page path with one works in path and virtual mode only. `/a.b` and `/a/b` share a key. Hash routing with the empty prefix needs a `path` other than `/`, and warns otherwise.
- Every mode runs the contract suite. The URL modes declare `parks` and `dropsOnMove` as differences, `path` declares `severalBases`, and `hash` and `query` declare `slashInPart`.
- `ModalSurfaceConfig.routing` puts a surface's entry in the hash or the query string, and the provider's `routing.modals` does it for Mosaic's own modals at once. In the pathname a modal's base is the page it opens from plus its own path, and `clear` writes that page rather than the base, since a pathname at the base would still mean open; the location takes the page as `clearedPath`. They stay virtual by default until a product decision says otherwise.
- Legacy's `__clerk_` hash and query shapes are not read. A host moving from the legacy components to Mosaic changes its URLs.

## References

- `src/routing/url-location.ts`, `src/routing/url-params.ts`, `src/routing/window-location.ts`, `src/routing/use-mosaic-location.ts`
- `src/routing/__tests__/url-location.test.tsx`, `src/routing/__tests__/url-params.test.ts`, `src/routing/__tests__/location-contract.test.tsx`
- [MEDR-0003](./0003-page-state-acts-like-a-url.md), [MEDR-0009](./0009-router-adapter.md)

## Changelog

- **2026-11-11**: Accepted.
- **2026-11-12**: Amended after review: the re-serialised query is attributed to the swingset's stack rather than to Next's hydration.
