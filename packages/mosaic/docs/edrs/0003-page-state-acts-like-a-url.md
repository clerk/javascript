---
id: 3
title: 'Hold routing state above the components and make it behave like a URL'
summary: "The page's routing state is a map from base to parts in MosaicProvider. An entry lives while its base has a mounted owner. A modal is open exactly while its entry exists. Components hold no routing state in any mode."
status: accepted
implementation: shipped
implementation_note: 'src/routing/virtual-store.tsx, src/modals/modal-host.tsx. Only the virtual carrier exists; URL carriers project the same map later.'
date: 2026-11-06
authors:
  - 'Fredrik Höglund <fredrik@clerk.dev>'
tags: [architecture, virtual, modals]
supersedes: null
superseded_by: null
---

## TL;DR

In virtual mode `MosaicProvider` holds a map keyed by normalised base, one entry per owner. A location is one entry: it reads its own, writes its own, clears its own. A mounted `useRouterScope` counts itself in as an owner of its base; when a base's last owner leaves, the store drops the entry after the commit. A modal host keeps no open flag: `open(options)` writes `initialParts(options)` to the modal's base, `close()` clears it, and the content renders while the entry exists. Nothing a component does on mount or unmount writes to the location.

## Context

Legacy virtual state lived inside each component, so it could not be written before mount and did not behave like a URL. Lifting it gave modals a way to open at a page and made two profiles with different bases independent, but it also made the state outlive the component, which no URL does: a host that navigated away and back found the profile where it left it.

Rejected, in order: clearing on modal close only (left inline profiles stale); the component clearing on its own unmount (wipes a pre-mount write under StrictMode and puts mode knowledge in the component); a writer-keyed release that clears only what the leaving scope wrote (right for user navigations, wrong for a host's seed, which a URL would also drop); an ownership registry with takeover (correct, but a queue, two contexts and a provider). Owner counting with a post-commit sweep is what survived the contract suite, including an owner replaced in the same commit. On its own it treated a parked component as having left, which under `Activity` would reset a profile on Back and on every hide; parking in component state is what keeps that case. A `WeakMap` in the store keyed by the location was passed over because the component's own state already has the right lifetime. Parking from the same effect that owns the base, with the entry as a dependency, was tried and failed the outside-clear case: the cleanup also ran when the entry was cleared and the next run restored it.

## Decision

Routing state is a map above the components. An entry lives while its base has an owner, counted in store state and swept after the commit; only a base that has had an owner is swept, so a write ahead of a later mount survives. A component owns its segment only while its effects are live; when they stop it parks the segment in its own state, and when they run again it writes the segment back unless the base was written meanwhile. The park happens only on hide, unmount or a change of location, never on a navigation; the scope renders from the parked entry while hidden, so the page's subtree keeps its state and resume has no flash; a park is tied to the location it came from, so a scope moved to another base starts on that base's root; and the parked value is consumed in render once an entry is present, so an entry cleared from outside shows the root. A truly unmounted component has no state to park in and starts fresh. A modal's open state is the presence of its entry, and its content loads whenever the entry is present, so an entry written from outside opens the modal fully. The sweep deletes only the entry committed with the zero count, never one written after it. In URL modes `own` is a no-op and nothing is parked, because the carrier holds the segment; owners are keyed by base alone.

## Consequences

- Leave and return starts fresh; a parked owner resumes where it was; an owner replaced mid-exit keeps its page; StrictMode changes nothing.
- A parked modal does not resume, since its content is inside a closed dialog; legacy closes modals on navigation too.
- The parked case is a todo in the contract suite until a React 19 test project exists, since React 18 cannot produce the cycle. The outside-clear case is in the suite, because it is the one a park that also ran on navigation got wrong.
- Back closes a modal and a URL with the segment opens one, once a URL mode exists. The return after a redirect can become an entry seeded on load.
- Ownership arrives one commit after mount, so an owner's first redirect runs on its second commit.
- `useSegmentParts` returns `undefined` for a base with no entry; a scope reads that as the root, a modal as closed.
- A URL carrier must project the map rather than let each location write the URL on its own, or two writes in one tick clobber each other.

## References

- `src/routing/virtual-store.tsx`, `src/routing/location.ts`, `src/modals/modal-host.tsx`
- `src/routing/__tests__/location-contract.test.tsx`
- [MEDR-0007](./0007-location-contract-suite.md)

## Changelog

- **2026-11-06**: Accepted.
- **2026-11-06**: Amended after review: render from the parked entry while hidden, park tied to its location, compare-and-delete in the sweep, content loaded on any entry.
