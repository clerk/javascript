---
id: 9
title: 'Reach the host router through a plain adapter object'
summary: 'A host hands MosaicProvider a RouterAdapter of optional hooks and navigation functions, and each missing method falls back to window. The hooks are fixed on the first render. Next supplies its own two hooks as they are.'
status: accepted
implementation: shipped
implementation_note: 'src/routing/router-adapter.tsx; the Next.js App Router adapter is packages/swingset/src/lib/mosaic-next-router-adapter.ts.'
date: 2026-11-11
authors:
  - 'Fredrik Höglund <fredrik@clerk.dev>'
tags: [architecture, adapters, ssr]
supersedes: null
superseded_by: null
---

## TL;DR

`<MosaicProvider routing={{ adapter, keyPrefix }}>` connects the URL modes to the host router. The adapter is a plain object with `usePathname`, `useSearchParams`, `useHash`, `push` and `replace`, every one of them optional; a read the adapter does not have comes from `window`, and a write without `push` or `replace` goes to `window.history`. `usePathname` returns the pathname as the address bar has it; `useSearchParams` returns a string or a `URLSearchParams`. Mosaic has no framework entry points: the Next.js adapter is `{ usePathname, useSearchParams }` from `next/navigation`, in a file a host copies.

## Context

Reading the host's own hooks is what makes a component's segment and the page change in the same commit, inside the host's transitions. Frameworks expose different things: Next has `usePathname` and a `ReadonlyURLSearchParams`, no hash hook, and a `router.push` that fetches from the server; React Router has `useLocation`; TanStack applies navigations asynchronously. One adapter per mode was considered and rejected, since the pathname never needs one and the hash rarely does. Making the reads mandatory whenever `push` is given was considered and rejected in favour of stating what a partial adapter can and cannot see.

The first adapter read the query string raw, from `window.location.search` under a subscription to Next's hook, because `useSearchParams().toString()` re-encodes the `/` between a value's parts. That workaround was a sign the model was wrong, and the swingset proved it: under Next the query came back re-serialised on load, adapter or not, from something in that app's stack rather than from Next's own hydration. [MEDR-0008](./0008-url-carriers.md) now reads a param's value decoded, so Next's hook serves as it is and the adapter is two imports. Next needs no `push` or `replace`: a `window` write without its history marker moves its hooks without the server round trip `router.push` makes.

## Decision

The adapter is a plain object on `MosaicProvider`, with per-method fallback to `window`.

- The hooks an adapter has are fixed on the first render under the provider, because the components below call them in their own hook order. An adapter that later has other hooks warns and is ignored; `push` and `replace` are taken fresh.
- `usePathname` and `useHash` return the URL percent-encoded, with or without the leading `#`. `useSearchParams` returns the query string with or without its `?`, or a `URLSearchParams`, or `undefined` where it cannot read, and that read falls back to `window`.
- A write through `push` or `replace` is seen through the adapter's hooks, and through `window.location` for a field the adapter does not read, read right after the call returns.
- `keyPrefix` sets what hash and query param names start with, `{ query: 'p.', hash: '' }` by default.

## Consequences

- Build the adapter once, outside render. The provider keeps the first set of hooks.
- A host router moves its hooks inside a React transition, so a page change that comes from the host arrives in a transition render. Anything that suspends on purpose to hold the DOM, `Freeze` under a leaving tab panel or dialog, would make that transition wait forever; `Freeze` therefore asks for its hold from the render that first sees it, commits the hold in a sync update before the transition can commit, and lets the transition retry against the already held boundary, which React does not wait for. The profile's pages did not switch in path mode under Next until it did.
- Under Next, every component under the provider calls the adapter's `useSearchParams`, which in a statically rendered route opts the tree up to the nearest `Suspense` boundary into client rendering. That is Next's rule for its own hook; the adapter's docs say so.
- A router that applies a navigation asynchronously must read the fields it moves, or a write through its `push` is never observed. Under a base path, hash and query work with reads alone, since the write then starts from `window`; path mode needs `push` and `replace` that prepend the base path, because the pathname is read in the host's world, without it, and written in `window`'s, which needs it.
- The server renders the pathname through the adapter and nothing else, so `path` is the one mode that renders its page on the server.
- When `ClerkProvider` starts rendering `MosaicProvider`, the framework SDKs supply the same adapter and hosts stop copying it.

## References

- `src/routing/router-adapter.tsx`, `src/routing/use-mosaic-location.ts`
- `packages/swingset/src/lib/mosaic-next-router-adapter.ts`, `packages/swingset/src/app/(clerk)/live/user-profile/user-profile/[[...page]]/page.tsx`
- `src/routing/__tests__/url-location.test.tsx`
- [MEDR-0008](./0008-url-carriers.md)

## Changelog

- **2026-11-11**: Accepted.
