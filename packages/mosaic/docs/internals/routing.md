# Routing in Mosaic

> [!NOTE]
> This document is written for humans as well as agents, it should stay primarily written by humans or else very heavily reviewed.
>
> We need to fully own the mental model, constraints and high level design here and not let it drift or deteriorate due to agents editing it poorly.

## Mental model - Current state

Routing in Clerk is not like traditional routing. Our router is usually a router embedded inside a host router and it doesn't own the full page (when no framework-adapter is provided, you can think of the host as `window`). You can think of it as having three conceptual parts:

- Segment routing
  - Our components live under some specific part of the hosts url and owns what happens there
  - This might be `/sign-in/*` (path routing), `/sign-in#/x` (hash routing) or a modal on an arbitrary url like `/dashboard` (virtual routing, internal only).
- Navigations away from or outside of that segment - "Exits"
  - Can be soft or hard (cross-origin, Safari ITP)
  - Types of exits:
    - After an auth change. `setActive` with a redirect, sign-out, task redirects.
    - Leaving for Clerk's own pages. Sign-in to sign-up when they are different pages, Account Portal, the public user-verify route. Built from environment URLs.
    - Leaving for a third party. OAuth, SAML, email-link, Web3 wallets. Always a hard navigation, with a return URL we choose.
    - Leaving for the host's pages. `afterSignInUrl`, a custom profile link, "back to app" from a task. Plain URLs the host configured.
- Building and parsing urls
  - This part is pretty ad-hoc rather than well defined currently

In `clerk-js`/`ui`, routing is quite entangled. The router doesn't load until `clerk-js` is fully loaded, including `environment` etc, which is fine since `ui` never renders until that point anyway. The host routing adapter goes into `clerk-js` via options and gets passed on to `ui` in the form of `navigate`, which is used for both segment routing and exits.

Three details about the current implementation worth knowing about:

- Every `clerk.navigate` call also fires listeners that close modals
- Modal state is memory only. Return after a redirect exists for the profile's OAuth and enterprise connect, carried in a query param.
- The "which step next" decisions after an OAuth or email-link return live inside `clerk-js` and navigate using legacy URL shapes and component-relative paths.

### The transitive state

This is a confusing but very central aspect to how Clerk works, so it deserves its own section.

After an auth change that also navigates, we need Page A to only see Session A, and Page B to only see Session B. There are many reasons for this, but the simplest one to understand is; imagine Session A does not have access to Page B. If we navigate before the auth change, we would hit a 403 or redirect. If Session B does not have access to Page A, then if we do the auth change first, the same thing happens so there is no safe order.

What we do instead is, we emit `session: undefined` (loading), navigate, wait until navigation is complete, and then emit Session B. This is what the pages see:

- Page A - Session A
- Page A - Session `undefined` - Loading state Page A
- Page B - Session `undefined` - Loading state Page B
- Page B - Session B

This is built around the navigation being awaitable and is something we might want to change in the future.

Since this is an exit `clerk-js` will keep handling, it only affects Mosaic in one case:

- For any Mosaic component that stays mounted across the transitive gap, we need to handle loading going back to true, either by showing an actual loading state, or by snapshotting the previous state and keep showing that

## Mosaic routing constraints

- Mosaic renders inside the host app
  - It cannot wait for `clerk-js` for segment routing
  - Exits are asynchronous by nature, it can still rely on `clerk-js` for those
- Mosaic can render on the server
  - We don't necessarily build full SSR support initially, but nothing may block it
- We should not rely on navigations being awaitable
  - Most frameworks don't support this and we currently hack around that
  - Mosaic should not make it harder to move away from these hacks
- No breaking changes to `clerk-js`
  - We can do this later, but we need to build Mosaic without any
- Legacy ui and Mosaic can share a page during migration
  - This is necessary for incremental adoption during the experimentation/beta phase
- Need to accept the existing URL shapes
  - Fine to add more
- The host router adapter must be compatible with all frameworks and have a `window` fallback
  - We don't need to build all framework adapters now, but whatever shape we pick needs to support all
- Need to preserve `path`, `hash` and the internal `virtual` router modes
  - Public API should stay identical if possible to avoid churn
  - Still needs to be configurable per component
- Building and parsing URLs has security implications and should be first class citizen
- Return to the right place after a redirect, including back into a modal
  - This does not always happen in legacy, we should have higher ambitions for Mosaic
- We rely heavily on state machines in Mosaic, routing needs to play nicely with these
- Because `environment`, `client` etc is not available on page load, routing must not rely on those

Another big change is that Mosaic also supports subcomponents. This creates a situation where the host app might now own the routing for a surface we previously had full control over. This creates additional challenges, for example when that subcomponent has its own internal routing, or when it does something like an OAuth redirect and needs to come back to the same place, a route the host now owns. This creates more points of interaction between the host router and our components.

## Implications

This is mostly based on the above constraints, but also some research.

- The route is derived, never stored
  - On every location change the router reads and parses the segment, and the result is the route
  - Our own navigation is just one more source of change
  - Because the router keeps no state of its own, there is nothing to sync after a navigation. That is why navigations no longer need to be awaited
- The only stateful piece is where the segment lives
  - For `path`, `hash` and `query` that is the framework adapter's/browser's URL
  - For `virtual` this is a value in memory
- Use framework adapter state over `window` if it exists
  - So our segment and the host page change in the same commit
- Writes go through the adapter if there is one, otherwise `history.pushState`
  - Hash steps are written with `pushState` too, never `location.hash =`, since Next strips a hash it did not write (agent finding, not runtime verified)
- Automatic navigations replace; only a user action pushes
  - Otherwise every bounce and redirect leaves a history entry, which is the source of legacy's back-button traps
- Change notifications
  - Delivered synchronously after the write. Mosaic writes only from handlers and effects, never from a lifecycle where a state change is unsafe; an adapter's own hooks notify whenever the host does
  - Carry no payload. Readers re-read the live location. - Payload can be stale by the time it's read if multiple writes are coalesced
- Exits are not part of the router. They are a single call into `clerk-js` with a full URL, and the router cannot express one
- Guards belongs to machines/components, not routes
- We should move "which step next" decisions from `clerk-js` to `shared`
  - Pure functions returning a step or an exit URL, consumed by `clerk-js`, legacy ui and Mosaic alike. No behaviour change, so we can do this first.
- Mosaic-internal navigations do not need to trigger the navigation events in `clerk-js`
  - These are only used to close legacy modals, which is not necessary on Mosaic-navigation
  - Mosaic also do not need to listen to these as it has its own way to close modals

## Design notes

The decisions are recorded in [the routing EDRs](../edrs/README.md) and the usage in [docs/routing.md](../routing.md); this section keeps the context those two do not carry while the work is in progress.

- The router is three parts: a location, one implementation per mode and per framework adapter; a route table per component, typed, that parses and builds a segment; and the router that derives a route from the two and hands the component `route`, `params` and `go`
- Names are the API, patterns are the codec. `go()` takes a name and params, never a URL, which is what enforces the step/exit split
- The seam is `useSegmentParts()`, `write()`, `clear()` and `own()`. Each location implements how React learns about its changes: with a framework adapter that is `usePathname`/`useLocation`, so the host's transitions apply; `virtual` is plain React state; only the `window` fallback needs `useSyncExternalStore`, since its source is outside React
- Two hooks: `useRouterScope` for the segment's owner, `useRouter` for everything inside it. The owner renders the `scope` it gets back around its children; nested routers read mode and base from it. The owner names its `root`, the route that lives at the base: an unknown segment shows the root and is replaced with the base, so owners of one base always agree and cannot loop. An owner whose table depends on data that has not arrived passes `ready` and reports no route, writing nothing, until it has. The scope is where nesting lands later: a sub-surface's base is the parent's base plus its current segment
- The page's routing state is a map from base to parts, held above the components. An entry lives while its base has an owner, and a parked component keeps its segment in its own state so it resumes where it was; a modal is open while its entry exists. Virtual holds the map as state in `MosaicProvider`. A URL mode holds nothing of its own: it reads its entry from the URL and writes the URL back at once ([MEDR-0008](../edrs/0008-url-carriers.md)); several entries fit in the hash or the query string, exactly one in the pathname. A second pathname owner on a page is a configuration error
- The profiles use legacy's segments with the first page as the root, and there is no `defaultPage`. The modal `page` option is the host writing the entry before the content mounts
- No `<Route>` component. Legacy's `<Route>` tree did matching, rendering, `canActivate` guards and nesting with relative paths. The table does the matching, the view switches on `route`, guards live in the component or machine, and a nested surface is a nested scope with its own table
- Framework adapters
  - For now, they are passed into `<MosaicProvider>`, as copy-paste objects rather than entry points. No adapter means the `window` fallback, which stays a supported mode
  - Later when `<ClerkProvider>` starts rendering `<MosaicProvider>` it comes in that way via the framework SDKs instead. Same adapter, different supplier
  - These are also what would provide the server URL
- SSR status: `virtual` renders the same on server and client. `path` with an adapter reads the request URL through the host's hooks; `hash`, `query` and the `window` fallback render the root on the server and correct once after hydration
- `query` mode is one param per base, `p.user=security`, not one reserved param: two components keep apart and a modal's param can be dropped on its own. It is sent to the server, so it is the candidate for modal state that survives a refresh or a redirect

## Security

The URL is attacker-controlled input: anyone can send a user a link. That covers the path, the hash, the query string, and anything that seeds the virtual store from them. The routing layer treats all of it as untrusted and keeps the handling of it inside a few boundaries, so the rest of Mosaic never has to reason about encoding, canonical forms or redirects.

### Boundaries

- The location is the encoding boundary. It splits on the encoded form, decodes once per part, and encodes once per part on write. A malformed escape reads as no parts. Nothing else in Mosaic calls `decodeURIComponent` or `encodeURIComponent` on anything that came from a URL
- The codec is representation-free. It matches decoded literals against decoded parts and captures params verbatim. It never sees a URL string, so it cannot take part in a double decode, and it never throws on input, only on a bad pattern, which is ours
- The router takes names, never URLs. `go(name, params)` can only produce parts inside the component's own route table, so a step cannot leave the segment, carry an unchecked string, or skip the codec
- Exits are clerk-js's. Anything that navigates outside the segment is a full URL handed to clerk-js, which rewrites disallowed protocols, applies the cross-origin rules and decorates the URL. Mosaic never reimplements those checks
- The base isolates instances. A location reads only its own entry; one component cannot see or be moved by another's segment

### Guarantees

- Encoding cannot change which route matches. The split happens on the encoded form, so an encoded slash stays one part. On a framework adapter that only offers a decoded path the host has already collapsed that distinction; the ambiguity is the host's and Clerk never generates a value with a slash
- A param is either fully decoded, exactly once, or absent. There is no state in which a value is half decoded or still encoded
- Build and parse round-trip for any string, including slashes, percent signs and non-ASCII. Each location carries that test
- Input never throws. Malformed escapes give no parts and unknown segments give no route; both render the component's fallback page
- Pattern literals are written decoded. `compilePattern` throws on a percent-encoded literal, so a pattern cannot be written in a way that matches differently from how it reads

### Rules for code outside the routing layer

- A param is opaque, untrusted text. Use it as an id to look something up, or render it as text. Do not decode it, encode it, split it, or build a URL from it
- Never navigate to a value from the URL. A step is `go(name)`. Anything else is an exit, built as a full URL and passed to clerk-js, which is where open-redirect protection lives. A param, a query value or a hash is never a destination
- Do not read `window.location`, `location.hash` or the query string in a feature. Go through the router, or a location. A state-carrying query param, such as the return after an OAuth redirect, is read in one place, matched against an allowlist of known values, and stripped. Its value is never interpreted as a path or a URL
- Custom page paths are configuration, not URL input, but they become pattern literals, so they are validated where they enter: decoded, no leading colon, not a built-in page's segment
- An unknown route is a fallback page, not an error to repair. Do not try to recover by decoding differently or guessing a route
- The same rules apply to every mode. Values from the hash or a query param are URL input in exactly the way path parts are

## Open questions

- How routing and machines work together. The URL proposes a step and the machine decides, but the contract is undefined: how a proposal enters the machine, how the decision is written back, and whether the runtime can move to an earlier state on request. A deep link, a back press and a redirect return are the three cases.
- How the return after a redirect is carried. With the modal open while its entry exists, it can become an entry seeded on load; the query param and its reader exist while legacy shares the page
- Whether sub-routes nest, for subcomponents with their own steps inside a host-owned container
- Whether the exit seam returns `clerk-js`'s navigation promise. Four models await it today for busy states, all of them exits. Returning it keeps a dependency on the awaitable navigate; dropping it means busy states end on unmount or a timeout instead. This is desirable to move away from awaitable navigation, but there's some details to figure out.
- Typed page ids for the profiles. A `const` type parameter on `UserProfile` can infer custom page paths from an inline `customPages` literal, so `pageOrder`, the modal `page` option and the pages controller's `route`/`go` become a union of built-in ids and the consumer's paths instead of `string`. It only narrows for inline or `as const` pages and must drop the `(string & {})` escape hatch, so it is one change across the props, the modal options and the controller

## Vocabulary

- **Embedded router**: Mosaic's router. It owns one segment of the location and never the page; the host, or the window when there is no host router, owns the rest.
- **Location**: where a segment lives and how it is read and written. One implementation per mode. Its seam is `useSegmentParts()`, `write()`, `clear()` and `own()`.
- **Mode**: which location a component uses. `path` (the pathname under a base), `hash` and `query` (one param per base), `virtual` (the page's in-memory map). Chosen per component through the `routing` prop, and fixed for the component's lifetime; `virtual` is also what modals use by default.
- **Base** (base path): the part of the location a component sits under, `/user` for the profile. Set with the `path` prop, defaulted per component. One owner per base per page.
- **Segment**: the part of the location a component owns, everything after its base. `security` or `billing/statement/st_1`.
- **Parts**: the segment as decoded parts, as `useSegmentParts()` returns it. `undefined` when the base has no entry.
- **Entry**: a base's parts in the page's routing state. Written by a navigation or from outside, dropped when the base's last owner leaves.
- **Owner**: a mounted `useRouterScope` under a base. The only router that redirects, and what keeps the base's entry alive.
- **Route table**: a component's typed map from route names to patterns. The only place patterns are declared.
- **Route name**: how code refers to a route: `factorOne`, `statement`. What `go()` takes, what views switch on, what machine states map to. Never a URL.
- **Pattern**: the shape of a segment, `billing/statement/:statementId`. Only the codec sees it. Param types are derived from it.
- **Route**: the result of parsing a segment against a table: a name plus params, or nothing when no pattern matches.
- **Codec**: parsing a segment into a route and building a segment from a name and params. Representation-free.
- **Step**: a navigation whose destination is inside the component's segment. Made with `go(name, params)`.
- **Exit**: a navigation whose destination is outside the segment. A full URL handed to `clerk-js`, which decides soft or hard, decoration and the transitive state.
- **Scope**: the mode and base a surface was mounted with, shared with everything nested inside it through `MosaicRoutingScope`. Configuration, not state. Returned by `useRouterScope` as an opaque value.
- **Framework adapter**: the host-router integration a URL-mode location reads and writes through, `usePathname` and a raw query string in Next. A plain object of optional members supplied at the top, by `MosaicProvider` now and `ClerkProvider` later ([MEDR-0009](../edrs/0009-router-adapter.md)).
- **Window fallback**: what a URL-mode location reads and writes for each adapter member that is missing. Reads `window.location`, listens to `popstate` and `hashchange`, writes without Next's history marker, and is the one place `useSyncExternalStore` is still needed.
- **Page** vs **step**: a profile's navigation entries are pages; a flow's states are steps. Both are routes; the words only say which kind of surface owns them.
