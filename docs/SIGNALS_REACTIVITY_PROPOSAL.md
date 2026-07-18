# Proposal: Signals-Based Reactivity Architecture

## Summary

Clerk currently uses signals as a thin notification layer for a small set of custom-flow resources: sign-in, sign-up, waitlist, and checkout. The approach works for the current public hooks, but it is not yet a coherent reactivity architecture. The core issue is that the reactive state is partly global, partly instance-local, and partly hidden inside resource mutation side effects.

The proposed direction is to make reactivity an explicit per-`Clerk` instance store with typed domains, lifecycle ownership, selector-based subscriptions, and framework adapters. This keeps the public hooks stable while removing global state leakage, ambiguous event ordering, and duplicated reactivity patterns.

## Current Architecture

### Sign-in, sign-up, and waitlist

The main custom-flow signals live in `packages/clerk-js/src/core/signals.ts`:

- `signInResourceSignal`, `signInErrorSignal`, `signInFetchSignal`
- `signUpResourceSignal`, `signUpErrorSignal`, `signUpFetchSignal`
- `waitlistResourceSignal`, `waitlistErrorSignal`, `waitlistFetchSignal`
- computed signals that derive `{ resource, errors, fetchStatus }`

`packages/clerk-js/src/core/state.ts` exposes those module-level signals through a `State` class. It subscribes to the global internal `eventBus` and updates the correct signal by checking `resource instanceof SignIn`, `SignUp`, or `Waitlist`.

Resources emit `resource:update` from `fromJSON()`, including during construction. Async custom-flow operations use `runAsyncResourceTask()` to emit `resource:error` and `resource:fetch` around the request.

React consumes these signals in `packages/react/src/hooks/useClerkSignal.ts` with `useSyncExternalStore()`. The subscription is implemented by creating an `alien-signals` `effect()` that reads the computed signal and then invokes React's callback.

### Checkout

Checkout uses a separate architecture in `packages/clerk-js/src/core/resources/BillingCheckout.ts` and `packages/clerk-js/src/core/modules/checkout/instance.ts`:

- signals are created per checkout flow via `createSignals()`
- writes are batched with `startBatch()` and `endBatch()`
- instances are cached in a module-level `Map` by user/org/plan/period

This is closer to the desired direction, but still has global cache lifetime concerns and does not share much structure with sign-in/sign-up/waitlist.

### Other packages

Astro uses nanostores. Vue and Nuxt use their framework-native `computed()` APIs. React has a `StateProxy` that exposes pre-load placeholder resources and throws for `__internal_effect()` / `__internal_computed()` before Clerk is loaded.

## Strengths

- The public React custom-flow hooks are simple and align with React's external-store contract instead of relying on React context value churn.
- Signals are hidden behind Clerk APIs, so the chosen signal library is not directly part of the public API.
- The split between resource, error, and fetch signals is conceptually good. It gives enough state to support ergonomic custom flows without forcing consumers to handle exceptions for expected API errors.
- Checkout already demonstrates useful patterns that should be generalized: local signal creation, batched writes, operation deduplication, and a cache key that models flow identity.

## Critical Issues

### 1. Signal state is module-global, not Clerk-instance-local

The sign-in, sign-up, and waitlist signals are exported module singletons. Every `State` instance points at the same signal functions. This creates several risks:

- multiple Clerk instances in the same JavaScript realm can observe or overwrite each other's flow state
- tests need to manually reset global signals, which is a symptom of hidden shared state
- publishable-key changes, multi-domain setups, browser extension contexts, and embedded multi-app scenarios have no clear state boundary
- the `State` constructor registers event handlers but there is no disposal path, so multiple `State` instances can accumulate event listeners

This is the highest-priority architectural problem. Auth state is instance-scoped; reactivity should be instance-scoped too.

### 2. Resource constructors and deserializers have hidden reactive side effects

`SignIn.fromJSON()`, `SignUp.fromJSON()`, and `Waitlist.fromJSON()` emit `resource:update`. That means parsing a response, constructing a placeholder, or calling `new SignIn(null)` can mutate global reactive state.

This makes control flow hard to reason about:

- construction is not pure
- null/empty resources are real updates, so `State` needs special `shouldIgnoreNullUpdate()` logic
- tests must know about event emission from constructors
- resource deserialization order becomes reactive update order

Resource mutation should be explicit. Parsing JSON should create or update a resource; the store should decide whether and how that resource becomes observable state.

### 3. The event bus is too broad for store updates

The `eventBus` carries generic `resource:update`, `resource:error`, and `resource:fetch` events. `State` then routes events with `instanceof` checks. This works for a small number of resource types, but it does not scale well.

Problems:

- no type-level relationship between event payload and target state slice
- all `State` instances hear all resource events
- adding a new reactive resource requires touching central routing and exports
- operation identity is collapsed into one `fetchStatus`, so overlapping operations can race
- reset/finalize edge cases leak into the state reducer as resource-specific heuristics

A store reducer should receive typed domain events such as `signIn/resourceUpdated`, `signIn/fetchStarted`, or `checkout/operationFinished`, scoped to one Clerk instance.

### 4. Signals wrap mutable resource objects rather than stable snapshots

The computed signals return objects containing mutable resources or future wrappers. React rerenders because the wrapper signal receives a new object, not because nested resource fields are signal-aware.

This gives the cost of a signal dependency graph without getting fine-grained benefits:

- all consumers of `useSignIn()` rerender for any sign-in change
- nested resource reads are not individually tracked
- mutable resource identity makes stale-reference behavior subtle
- public values are a mix of state and imperative methods

This is acceptable for the first version of custom-flow hooks, but it should not become the long-term model for all Clerk reactivity.

### 5. React subscription semantics are indirect

`useClerkSignal()` subscribes by creating an `effect()` that reads the computed signal and calls the React callback. This couples React's external-store bridge to `alien-signals` internals.

Concerns:

- the effect invokes the callback when it is created, which can cause extra subscription-time renders
- there is no selector/equality layer, so the hook subscribes to the whole computed value
- telemetry is recorded during render, so re-renders can record repeated hook calls
- `getSnapshot` and `getServerSnapshot` are the same callback, even though pre-load and SSR behavior is special-cased elsewhere through `StateProxy`

React should depend on a small store interface: `getSnapshot()`, `subscribe()`, and optionally `select()`. The signal library should be an implementation detail of that store.

### 6. Checkout is better isolated but has unbounded global cache lifetime

Checkout's per-flow signals are a good direction, but `CheckoutSignalCache` is module-global and not tied to Clerk instance lifecycle. It is keyed by user/org/plan/period, but not by Clerk instance identity or publishable key. There is also no eviction path on sign-out, organization switch, completed flow, or instance teardown.

The checkout cache should be owned by the instance store, keyed by instance plus flow identity, and cleared on auth boundary changes.

### 7. The architecture is inconsistent across frameworks

React consumes `alien-signals` through `useSyncExternalStore()`. Astro exposes nanostores. Vue uses Vue computed refs. Checkout has its own mini-store. The same product concepts are represented differently in each package.

The core package should expose a framework-neutral reactive store contract. Framework packages should adapt that store to React, Vue, Astro, and Nuxt idioms.

## Target Architecture

### 1. Introduce a per-instance `ReactiveStateStore`

Each `Clerk` instance should own one reactive store:

```ts
type Unsubscribe = () => void;

interface ReactiveStateStore {
  getSnapshot(): ClerkReactiveSnapshot;
  subscribe(listener: () => void): Unsubscribe;
  select<T>(selector: (snapshot: ClerkReactiveSnapshot) => T, equality?: (a: T, b: T) => boolean): StoreView<T>;
  dispatch(event: ClerkReactiveEvent): void;
  dispose(): void;
}
```

Internally this can still use `alien-signals`, but the rest of the SDK should depend on the store contract rather than direct `effect()` / `computed()` exports.

### 2. Model each reactive domain as a typed slice

Start with four slices:

- `signIn`
- `signUp`
- `waitlist`
- `checkout`

Each slice should have:

- `resource`
- `errors`
- `operations`
- `revision`
- explicit reset/finalize/discard state

`fetchStatus: 'idle' | 'fetching'` can remain for compatibility, but internally it should be derived from operation state. This avoids races when two operations overlap.

Example:

```ts
type OperationStatus = 'idle' | 'fetching';

interface FlowSlice<Resource, Errors> {
  resource: Resource | null;
  errors: Errors;
  operations: Record<string, OperationStatus>;
  revision: number;
  discardable: boolean;
}
```

### 3. Make resource parsing pure

Remove `eventBus.emit('resource:update')` from `fromJSON()` over time. Resource constructors and deserializers should only mutate the resource instance.

The operation layer should explicitly dispatch after a successful resource update:

```ts
const result = await resource.__internal_basePost(params);
store.dispatch({ type: 'signIn/resourceUpdated', resource: result });
```

For compatibility, an interim bridge can continue listening to the existing event bus, but it should be treated as a migration adapter, not the primary architecture.

### 4. Replace global `runAsyncResourceTask()` with slice-owned operation runners

The async runner should accept a store slice target instead of emitting global events:

```ts
async function runFlowOperation<T>({
  store,
  slice,
  operation,
  task,
}: {
  store: ReactiveStateStore;
  slice: 'signIn' | 'signUp' | 'waitlist';
  operation: string;
  task: () => Promise<T>;
}) {
  store.dispatch({ type: `${slice}/operationStarted`, operation });
  try {
    const result = await task();
    store.dispatch({ type: `${slice}/operationSucceeded`, operation, result });
    return { result, error: null };
  } catch (error) {
    store.dispatch({ type: `${slice}/operationFailed`, operation, error });
    return { error };
  } finally {
    store.dispatch({ type: `${slice}/operationSettled`, operation });
  }
}
```

This makes batching, error clearing, and operation deduplication consistent across sign-in, sign-up, waitlist, and checkout.

### 5. Return stable public facades backed by snapshots

The public hook return shape can remain the same, but it should be assembled from a store snapshot and stable method facade. The resource state should be observable as data; imperative methods should be stable wrappers that dispatch operations.

This avoids re-creating method trees and makes it possible to add selector hooks later:

```ts
const signIn = useClerkStore(s => s.signIn.publicValue);
const fetchStatus = useClerkStore(s => s.signIn.fetchStatus);
const identifierError = useClerkStore(s => s.signIn.errors.fields.identifier);
```

The initial public API does not need to expose selectors, but the internal adapter should be built this way.

### 6. Move framework adapters to the edge

Core should expose the same store to every framework package. Framework-specific packages should adapt it:

- React: `useSyncExternalStoreWithSelector()`
- Vue/Nuxt: `computed()` wrappers around selected store views
- Astro: nanostore wrappers that subscribe to selected store views

This gives each framework idiomatic APIs without duplicating state semantics.

### 7. Own checkout cache inside the store

Checkout flow instances should be cached under the instance store:

```ts
store.checkout.getOrCreate({
  userId,
  orgId,
  planId,
  planPeriod,
});
```

Cache invalidation should happen on:

- sign-out
- user switch
- organization switch when the flow is organization-scoped
- publishable-key or instance replacement
- flow completion, after a short retention window if needed for UI continuity
- `store.dispose()`

## Migration Plan

### Phase 0: Document and instrument current behavior

- Add tests that prove two Clerk instances cannot share sign-in/sign-up/waitlist state.
- Add tests for listener disposal when a `State` instance is replaced.
- Add tests for React Strict Mode subscription behavior.
- Add tests for overlapping operations, especially send-code plus verify-code flows.
- Add checkout cache tests for sign-out and organization switch.

These tests will likely expose current gaps. That is useful; mark incompatible expectations as skipped or todo if they must wait for the store migration.

### Phase 1: Stop exporting module-level singleton signals as state ownership

- Replace `signals.ts` singleton exports with a `createFlowSignals()` factory.
- Have `State` construct its own signal set.
- Keep the public `State` interface unchanged.
- Add `State.dispose()` and unregister event bus listeners.
- Ensure tests no longer reset imported signal singletons.

This is the minimum viable fix for cross-instance leakage.

### Phase 2: Introduce the `ReactiveStateStore` behind `State`

- Implement the store contract in `@clerk/clerk-js`.
- Make `State` a compatibility facade over the store.
- Move error parsing and fetch state derivation into reducers/selectors.
- Keep `__internal_effect` and `__internal_computed` temporarily, but stop requiring framework packages to call them directly.

### Phase 3: Move resource updates out of constructors/deserializers

- Add explicit dispatches in the operation layer.
- Keep a temporary event-bus bridge for legacy paths that still emit from `fromJSON()`.
- Convert sign-in, sign-up, and waitlist flows first.
- Convert checkout to use the same operation runner and store-owned cache.

### Phase 4: Add selector-based framework adapters

- Replace React's direct signal effect bridge with a store selector hook.
- Adapt Astro nanostores and Vue computed refs from the same core store.
- Add internal selector tests to verify minimal rerenders for common fields.

### Phase 5: Remove legacy internals

- Remove resource `fromJSON()` event emissions.
- Remove the flow-related global event bus bridge.
- Deprecate or narrow `__internal_effect` and `__internal_computed` on public-ish internal types.
- Remove module-global checkout cache.

## Compatibility

Public hooks should keep their current return shapes:

- `useSignIn()`
- `useSignUp()`
- `useWaitlist()`
- `useCheckout()`

The migration should not require users to understand signals. Signals remain an implementation detail.

The main internal compatibility risk is code that reaches into `clerk.__internal_state.__internal_effect` or `__internal_computed`. Those APIs are marked internal/experimental and should be preserved during migration, then narrowed once framework adapters no longer use them.

## Open Questions

- Should Clerk expose selector hooks publicly, or keep them internal for now?
- Should operation state remain one public `fetchStatus`, or should future public APIs expose named operation statuses?
- How long should completed checkout flows stay cached for UI continuity?
- Should resources remain mutable internally, or should new custom-flow resources move toward immutable snapshots over time?
- Should the event bus remain only for cross-cutting notifications such as token/session/environment updates?

## Recommendation

Do the migration in two tracks:

1. Fix ownership first: make signals and checkout caches per Clerk instance, add disposal, and test multi-instance isolation.
2. Then improve semantics: make resource parsing pure, move operation state into typed reducers, and adapt framework packages through a common selector-based store.

This sequence addresses the riskiest architecture problem without forcing a large public API redesign. It also gives Clerk a path to use signals where they are valuable, while avoiding a long-term dependency on global reactive side effects.
