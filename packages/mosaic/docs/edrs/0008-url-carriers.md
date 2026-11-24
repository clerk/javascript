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

`routing: 'path' | 'hash' | 'query'` puts a component's segment in the page's URL. The location is derived: every render reads the host URL, finds its segment and decodes it, and a write builds the full URL with only that segment changed and hands it to the host at once. Nothing is queued, stored or counted. The pathname holds exactly one segment, `/user/security`, as legacy did. The hash and the query string hold one param per base: the key is a prefix and the base with dots for slashes, `.user`, and the value is the parts encoded one by one and joined with `/`. The query string and the hash are read and written as `URLSearchParams`, and a param's value is the encoded segment encoded once more, so a slash inside a part survives there as it does in the pathname. A component's mode is fixed when it mounts.

## Context

[MEDR-0003](./0003-page-state-acts-like-a-url.md) made the virtual store behave like a URL and ended with the note that a URL carrier would have to project the map, or two writes in one tick would clobber each other. Building it the other way round is simpler: a URL already is the shared state the store imitates, so a location that reads the URL and writes it has nothing of its own to keep in step. Projecting the map, or queueing writes into a microtask, was rejected: it adds a second copy of the state, a flush that the host's transitions cannot see, and a window in which a read is stale. Two writes in one handler clobbering each other is accepted; no Mosaic code does it, and a host that does gets the last write, as it would from the URL anywhere else.

Where a segment lives:

- The pathname keeps legacy's shape, and `path` is where the component is mounted. There is room for one owner; a second would need the pathname too. A component mounted somewhere other than its `path` shows its root, and its first navigation writes under `path`, away from the page. Legacy threw here; a development warning was tried and dropped.
- Legacy kept hash and query state in one `__clerk_` param it parsed itself. Hosts should not meet Clerk's name in their URLs, and two components on one page need two params, so there is one param per base. The key is the base with its slashes as dots, leading slash included, `.user` and `.modal.user`: the leading dot keeps Clerk's params apart from the host's without naming Clerk, and it survives a host re-serialising the query string, which `~`, `@`, `$` and `:` do not, since `URLSearchParams` percent-encodes everything but letters, digits and `-._*`. A prefix the host sets goes in front, `clerk.user`; there is none by default.
- In the pathname, parts are encoded one at a time and the segment is split before it is decoded, as [MEDR-0002](./0002-names-in-parts-out.md) requires, so a slash inside a part survives. The same was tried for the query string, reading pairs on their raw form, and failed in the swingset under Next: something in the host's stack re-serialised the query after hydration, `organization/general` came back as `organization%2Fgeneral`, and the segment read as one unknown part. A host may re-serialise its query at any time, so the raw form of the query is the host's, not Mosaic's. The query string and the hash are therefore read and written as `URLSearchParams`, the platform's parser, and a param's value is the encoded segment encoded once more: a slash between parts is `%2F`, a slash inside a part `%252F`, and reading reverses both, so a part may contain a slash in every mode. A write spells every pair in `URLSearchParams` form. A raw pair writer that kept the host's bytes, with a decoder of its own to find Mosaic's pair, was built and dropped: the bytes are not Mosaic's to promise once any host re-serialises, the two parsers disagreed at their edges, and a readable slash that turned into `%2F` on the next host write was harder to explain than `%2F` from the start.

Rejected: `location.hash =` for hash writes, since Next strips a hash it did not write, so every mode writes with `pushState`; one reserved param for every base, since two components would collide and a modal's entry could not be dropped on its own; escaping dots in the key, since `/a.b` and `/a/b` sharing `.a.b` costs less than an unreadable key; closing a modal with `history.back()`, since after a navigation inside the modal that would show the previous page of the modal rather than close it.

## Decision

A URL location is derived from the host URL and writes to it directly.

- Reads come from the adapter's hooks where it has them, [MEDR-0009](./0009-router-adapter.md), and from a `window` store otherwise. The server renders no entry, so a URL-mode component renders its root and corrects once after hydration.
- A write is built in the world of whoever performs it: through the adapter's `push` or `replace` it starts from the adapter's reads as this commit rendered them, with `window` for the ones it lacks; without them it starts from `window`, which already has whatever the host puts around a pathname, such as a base path. The rendered values reach a write through an insertion effect, so a write from any effect of the same commit starts from that commit. The location object changes only when its entry does, so a host that re-renders does not hand the components above a new location.
- `own` is a no-op and nothing is parked: the URL outlives the component by itself. `clear` replaces; in the pathname it writes the base, in a param it removes the pair.
- A modal opens with a push and closes with a replace.
- The pathname refuses parts of `.` and `..`, which a URL resolves away; compares its base part by part on the decoded form, since browsers and routers leave different characters raw; and reads one trailing slash as the same pathname.
- A `window` write carries no history state, so a host router's bookkeeping never lands on an entry it did not make. Next's App Router copies its own marker onto a foreign write by itself; a router that needs its state on every entry, for blockers or scroll restoration, is given `push` and `replace` instead. Copying the host's state onto Mosaic's pushes was tried and dropped: React Router and TanStack then saw their index twice and turned a blocked Back into a reload.
- Change notifications are synchronous. A `window` write asked for before the page has settled, in the first commit's effects, is parked and lands in a microtask after that commit, in order; `RouterAdapterProvider` marks the page settled from its first effect. The Next.js App Router installs its `history` patch in its own first effect, which runs after every descendant's, so an unparked correction there would be invisible to it.
- The mode is fixed on the first render, since each mode calls its own hooks. A component changes mode by remounting, which the profiles do by keying on `routing`; a changed prop warns and is ignored.

## Consequences

- Back works in every URL mode, a deep link opens the page it names, and the page survives a reload. After a modal is opened and closed the page has two history entries, so the first Back appears to do nothing; cheap to change if it turns out to matter.
- Two writes in one tick clobber each other; the last one wins.
- A host that adds trailing slashes serves one redirect when a Mosaic-written URL is loaded; a write makes no request. Under a base path, hash and query work with reads alone; path mode needs the base path in the adapter's pathname and in the component's `path`, since Next leaves it out of both.
- A correction made in the first commit, an unknown segment replaced or a link consumed, lands after the page has settled and is seen by a host router that patches `history` in its own first effect. A guard a feature writes from an effect gets the same treatment without knowing about it.
- A slash inside a part is `%252F` in a param. A write spells the host's own pairs in `URLSearchParams` form, `x%20y` as `x+y` and a bare `flag` as `flag=`; in hash mode a bare anchor `#top` becomes `top=`, since the fragment is Mosaic's there. `/a.b` and `/a/b` share a key. Hash routing with the empty prefix needs a `path` other than `/`, and warns otherwise.
- Every mode runs the contract suite. The URL modes declare `parks` and `dropsOnMove` as differences, `path` declares `severalBases`, and `query` declares `linkIsEntry`.
- `ModalSurfaceConfig.routing` puts a surface's entry in the hash or the query string, and the provider's `routing.modals` does it for Mosaic's own modals at once. Path mode is not offered for modals: a pathname holds one segment, the page's, and a modal whose base is one configured page misbehaves when opened from any other, so a version that composed the modal's base under a page and closed back to it was built and removed. They stay virtual by default until a product decision says otherwise.
- Legacy's `__clerk_` hash and query shapes are not read. A host moving from the legacy components to Mosaic changes its URLs.

## References

- `src/routing/url-location.ts`, `src/routing/url-params.ts`, `src/routing/window-location.ts`, `src/routing/use-mosaic-location.ts`
- `src/routing/__tests__/url-location.test.tsx`, `src/routing/__tests__/url-params.test.ts`, `src/routing/__tests__/location-contract.test.tsx`
- [MEDR-0003](./0003-page-state-acts-like-a-url.md), [MEDR-0009](./0009-router-adapter.md)

## Changelog

- **2026-11-11**: Accepted.
- **2026-11-12**: Amended after review: the re-serialised query is attributed to the swingset's stack rather than to Next's hydration.
- **2026-11-17**: Amended: the microtask example is consuming a link.
- **2026-11-24**: Amended: params go through `URLSearchParams` with the segment encoded twice, so a slash in a part works in every mode; `window` writes carry no history state and wait for the page to settle; path mode for modals removed.
