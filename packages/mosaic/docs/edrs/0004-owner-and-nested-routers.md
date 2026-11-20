---
id: 4
title: "Let the segment's owner name its root and decide the rest; nested routers never write"
summary: 'useRouterScope is for the one component that owns a segment: it names the root that lives at the base, an unknown segment shows the root and is replaced with the base, and an unsettled table reports no route. useRouter is for anything inside: it never writes.'
status: accepted
implementation: shipped
implementation_note: 'src/routing/use-router.ts; MosaicRoutingScope is rendered only in tests until a nested consumer exists.'
date: 2026-11-06
authors:
  - 'Fredrik Höglund <fredrik@clerk.dev>'
tags: [api]
supersedes: null
superseded_by: null
---

## TL;DR

The component that owns a segment calls `useRouterScope(routes, { routing, path, root })` once and renders the `scope` it returns around its children. `root` is the route that lives at the base: it is matched by the empty segment and `go` writes the empty segment for it, whatever pattern the table gives it, and that pattern is accepted too and canonicalised to the base. Any other segment nothing matches shows the root at once and is replaced with the base, so the dead segment leaves history. `route` is never undefined, unless the owner passes `ready: false` because its table depends on data that has not arrived; then it is undefined and nothing is written, so an entry the table cannot match yet survives. Children call `useRouter(routes)` with their own table, read mode and base from the scope, and get `route: undefined` for a segment a sibling owns. They never redirect.

## Context

If every router could redirect, two tables under one base would fight. Not-found needs a single decision, and the replace is what keeps legacy's back-button traps out. Page-shaped surfaces all put their first entry at the base, and the profiles also let that entry be named from outside through the modal `page` option, so the root needs both an empty segment and its own name.

Earlier shape: a `notFound` route, which the owner redirected unknown segments to. Two owners on one base with different fallbacks then looped, and three guards were tried: remembering the last redirected-from segment (blocked legitimately recurring segments), detecting an overwritten redirect (only worked at mount), and an ownership registry (correct, but a queue, two contexts and a provider). A redirect fuse replaced them. Naming the root made all of it unnecessary: every owner's fallback is its own base, so two owners of one base write the same thing and cannot loop, and the fuse was removed as untestable. A separate `aliases` map for the root's own segment was folded into `root` for the same reason.

Not-ready: the combined profile routed while the organization model loaded, and a deep link to an organization page was replaced with the base before the pages existed. Withholding the table at the call site was `main`'s answer; `ready` is the same answer as a routing-layer concept.

## Decision

Two hooks with an opaque scope between them. The owner names its `root`, redirects unknown segments to the base with replace, and reports no route while not ready; nested routers never write.

## Consequences

- `route` can be switched on without a guard. Passing `ready` at all makes it optional in the type, so an owner with an unsettled table has to decide what the loading window shows.
- Owners of one base cannot loop each other, but the second keeps snapping the first back to its root on every navigation; a configuration error shows as that, with no warning.
- An empty table, as when a profile has no pages yet, routes to a placeholder root and writes nothing.
- Nesting lands on the scope later: a sub-surface's base is the parent's base plus its segment.

## References

- `src/routing/use-router.ts`, `src/routing/routing-scope.tsx`
- `src/routing/__tests__/use-router.test.tsx`

## Changelog

- **2026-11-06**: Accepted.
- **2026-11-06**: Amended after review: `notFound` and the redirect fuse replaced by `root`; `ready` added.
