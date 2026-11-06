---
id: 1
title: 'Embed a segment router that derives its route from the location'
summary: "A Mosaic component owns one segment of the page's location and derives its route from it on every change. Navigations inside the segment are steps through the router; everything else is an exit handed to clerk-js as a full URL."
status: accepted
implementation: shipped
implementation_note: 'src/routing; exits still go through clerk-js as before.'
date: 2026-11-06
authors:
  - 'Fredrik Höglund <fredrik@clerk.dev>'
tags: [architecture]
supersedes: null
superseded_by: null
---

## TL;DR

A component owns a segment under a base, `security` under `/user`, and never the page. It reads its segment, derives a route from it, and navigates by writing a new segment. It keeps no routing state and awaits nothing after a write. A navigation whose destination is outside the segment is not a routing concern: build a full URL and hand it to `clerk-js`, which keeps its origin and protocol checks, URL decoration and the transitive-state handling.

## Context

Mosaic renders inside the host app and on the server, before `clerk-js` has loaded, so it cannot wait for `clerk-js` to route. Legacy's router loads with `clerk-js`, uses one `navigate` for both steps and exits, and awaits navigations, which most frameworks cannot honour and which Clerk hacks around. Legacy's `<Route>` tree also mixes matching, rendering, guards and relative paths.

Rejected: routing through `clerk.navigate` for steps, as PR #9843 did. It awaited the write and committed with `flushSync`, ignoring outside changes while in flight, which reintroduced the awaitable-navigate dependency and a stuck state when a host promise never resolves.

## Decision

Mosaic has its own routing layer that owns one segment per component and derives the route from the location on every change. `go(name, params)` is the only navigation it offers. Exits are not part of the router and cannot be expressed through it. Guards belong to the component or its machine, not to routes.

## Consequences

- Nothing is synchronised after a navigation, so nothing needs to be awaited.
- The server and the client render the same thing from the same input.
- Open-redirect protection stays in one place, `clerk-js`.
- "Which step next" decisions after an OAuth or email-link return still live in `clerk-js` and should move to `shared` as pure functions; that is separate work.

## References

- `src/routing/use-router.ts`, `src/routing/router.ts`
- [Routing in Mosaic](../internals/routing.md), mental model and constraints
- [MEDR-0002](./0002-names-in-parts-out.md), [MEDR-0004](./0004-owner-and-nested-routers.md)

## Changelog

- **2026-11-06**: Accepted.
