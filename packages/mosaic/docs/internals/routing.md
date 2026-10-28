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
  - For `path` and `hash` that is the framework adapter's/browser's URL
  - For `virtual` this is a value in memory
- Use framework adapter state over `window` if it exists
  - So our segment and the host page change in the same commit
- Writes go through the adapter if there is one, otherwise `history.pushState`
  - Hash steps are written with `pushState` too, never `location.hash =`, since Next strips a hash it did not write (agent finding, not runtime verified)
- Automatic navigations replace; only a user action pushes
  - Otherwise every bounce and redirect leaves a history entry, which is the source of legacy's back-button traps
- Change notifications
  - Delivered in a microtask, never synchronously - Frameworks can trigger these from lifecycles where triggering state changes/rerenders are not safe, like in insertion effects (Next.js)
  - Carry no payload. Readers re-read the live location. - Payload can be stale by the time it's read if multiple writes are coalesced
- Exits are not part of the router. They are a single call into `clerk-js` with a full URL, and the router cannot express one
- Guards belongs to machines/components, not routes
- We should move "which step next" decisions from `clerk-js` to `shared`
  - Pure functions returning a step or an exit URL, consumed by `clerk-js`, legacy ui and Mosaic alike. No behaviour change, so we can do this first.

## Design notes

> TODO as we make more decisions and start implementing

The router is probably:

- The Location
  - This is separate for path, hash and virtual and for different framework adapters
- The Route Definitions
  - Handles url parse and create
  - Agnostic to where the url is coming from
  - Should be typed
  - Something like a table per component

The router derives a route from these two and gives the component the route and some way to navigate.

- Framework adapters
  - For now, we pass them into `<MosaicProvider>` - Maybe we provide them as separate entrypoints in `mosaic/`
  - No adapter means the `window` fallback, which stays a supported mode
  - Later when `<ClerkProvider>` starts rendering `<MosaicProvider>` it comes in that way via the framework SDKs instead. Same adapter, different supplier
  - These are also what would provide the server URL

## Open questions

- How routing and machines work together. The URL proposes a step and the machine decides, but the contract is undefined: how a proposal enters the machine, how the decision is written back, and whether the runtime can move to an earlier state on request. A deep link, a back press and a redirect return are the three cases.
- How modal state and return-after-redirect are carried, and what the param is called while legacy shares the page
- Whether sub-routes nest, for subcomponents with their own steps inside a host-owned container
- Whether the exit seam returns `clerk-js`'s navigation promise. Four models await it today for busy states, all of them exits. Returning it keeps a dependency on the awaitable navigate; dropping it means busy states end on unmount or a timeout instead. This is desirable to move away from awaitable navigation, but there's some details to figure out.

## Temporary comparison to #9843

> [!NOTE]
> This part is an agent-comparison meant to be removed later

About half of PR #9843 survives, and the half that does is the hard part to get right.

Matches the plan:

- The MosaicLocation seam with read, subscribe, write, and one implementation per mode.
- The typed route table with go and href, parse and build in one place, preserved query params.
- One history patch per bundle, Navigation API where present, microtask coalescing.
- useSyncExternalStore with a memoised page object per URL string.

Contradicts the plan:

- Path writes go through clerk.navigate. We said adapter or raw pushState, never clerk-js. In-tree it reaches IsomorphicClerk, which drops replace, the internal flag and the promise.
- It awaits the write and commits with flushSync, with inFlight dedupe and outside changes ignored while in flight. We said re-read on every notification, nothing awaited. That block goes, and with it the stuck case when a host promise never resolves.
- Hash writes use location.hash =, which Next's router.refresh() strips. We said live pushState with the state spread.
- Reads always come from window. We said host state when there is an adapter, and a server source for SSR.
- routing: 'memory' is a public prop. We said virtual is internal.
- The fragment-to-path conversion runs in an effect with no guard and fires twice under StrictMode.

Missing from both, still open: nesting for subcomponents, the adapter contract, replace as the default for automatic navigations.

Verdict: keep the seam, the codec and the subscription plumbing; rewrite the write side, the commit model and the provider. The location files and their tests largely survive, the router core and the provider do not. And nanostores stays a pattern, not a dependency.
