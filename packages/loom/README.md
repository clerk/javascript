# Loom profile handoff and active-device prototype

Private, unpublished `@clerk/loom` explores server-prefetched profile rendering. The live profile now uses `@clerk/loom/handoff`: Loom renders a read-only server snapshot, then ordinary Mosaic components read data and run actions directly through ClerkJS. The separate active-device query experiment remains under `@clerk/loom/react` and in the plain JavaScript examples. The profile no longer has a Loom query cache or action wrappers.

The user SSR example uses the existing Backend API `users.getUser` operation. Its allowlisted snapshot supplies profile details, picture, email addresses and phone numbers, connected and linked enterprise accounts, wallets, passkeys, password presence, MFA status, and delete availability. Public instance settings supply section visibility and action eligibility. The snapshot excludes Backend resources, metadata, verification secrets, backup codes, and credentials. Production credentials and rotation remain unverified.

The earlier experimental Backend devices endpoint remains in this branch but is not used by the live showcase. Its deployment and release gate are unchanged. Historical evidence for that experiment is in [the investigation](INVESTIGATION.md) and [decision trail](DECISIONS.tsv).

## Try the prototype

From the repository root, using its pinned pnpm:

```sh
rtk proxy pnpm --filter @clerk/loom build
rtk proxy node packages/loom/examples/plain-js.mjs
rtk proxy pnpm --filter @clerk/swingset dev
```

Open `/loom` on Swingset (normally `http://localhost:6006/loom`). Use its existing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` configuration and sign in. Hover or focus **Show devices** to prefetch, open the list, hide and reopen it to reuse fresh data, or choose **Refresh devices** to revalidate. The direct route displays active devices without ClerkProvider. `/loom/legacy` preserves the Mosaic demonstration with confirmation and reverification.

Both routes sit outside Swingset's existing Clerk layout. The direct route creates and loads a bundled ClerkJS instance in the browser, then passes it to `LoomProvider`. It has no Clerk React provider or hooks. The legacy route passes a bundled instance to both `ClerkProvider` and `LoomProvider` because Mosaic's experimental device component still uses Clerk React hooks for reverification. Mosaic's experimental component is not publicly exported or included in its production bundle.

Open `/live/loom` for the composed Mosaic Account and Security profile, or `/live/loom/password` for standalone Password. Compare with the ordinary profile at `/live/user-profile/user-profile`. One `prefetchProfile` operation returns the user snapshot and a shared settings promise. Snapshot hooks read those settings through React Suspense when they arrive. The server response preloads the picture URL, and Avatar emits its image during SSR. Eligible controls render disabled until ClerkJS is ready. Once ClerkJS is ready, the profile replaces its snapshot panels with ordinary Mosaic panels while preserving the selected tab. Standalone Password uses the same handoff. Mosaic keeps its existing forms, validation, reverification, and guarded ClerkJS resource actions.

The handoff path reads a validated snapshot directly from context. It creates no QueryClient and exposes no mutation methods. Once ClerkJS resolves, the snapshot is retired; late settings cannot overwrite the live account. Sign-out, account changes, and host replacement cannot revive the retired snapshot.

Phone, wallet, passkey, MFA, and linked enterprise rows use the same prefetch. Active-device details and eligible enterprise connection choices still require browser reads because their deployed server APIs are unavailable. These queries do not block other sections. The live test instance disables the newly migrated features; populated server rendering is covered by browser fixtures without changing that instance. Loom passkey labels use absolute UTC dates for deterministic hydration. Satellite passkey Add eligibility is not known before the host connects, so its disabled placeholder can disappear after handoff.

Unverified external accounts are not shown as connected. API keys are not included in this experimental composition. The dynamic, no-store route shares the live shell's existing `window.Clerk`; it does not create a second runtime. If server prefetch fails, ordinary Mosaic sections render once ClerkJS is ready.

The earlier device-query experiment uses the original React provider, which owns its Loom binding and query-client lifecycle:

```tsx
import { LoomProvider, useSessions } from '@clerk/loom/react';

function Devices() {
  const sessions = useSessions();
  return <p>{sessions.data?.length ?? 0} active devices</p>;
}

<LoomProvider
  clerk={clerk}
  fallback={<p>Sign in to view devices</p>}
>
  <Devices />
</LoomProvider>;
```

The plain JavaScript example uses a controlled empty-list transport. A browser host integration can use:

```ts
import { bindClerk } from '@clerk/loom/clerk';

const binding = bindClerk(clerk);
const client = binding.getSnapshot();
if (client) {
  const stop = client.subscribe(result => render(result));
  await client.prefetch();
  await client.fetch();
  stop();
}
binding.dispose();
```

`bindClerk` requires a concrete host with `getFapiClient()`. `useClerk()` alone does not expose that transport. If binding before readiness, subscribe to the binding and attach to each new client it publishes. Retired clients cannot be reused.

## Server prefetch and hydration

The Next helper starts the authenticated user and public settings reads together, then waits only for the user. Pass its result intact to `LoomProvider`. A failed user or request setup returns `undefined`, allowing browser recovery. Settings failures fulfill a safe unavailable result without exposing backend errors.

```tsx
import { prefetchProfile } from '@clerk/loom/nextjs';
import Profile from './profile';

async function PrefetchedProfile() {
  const prefetch = await prefetchProfile();
  return <Profile prefetch={prefetch} />;
}
```

The client `Profile` imports `LoomProvider` from `@clerk/loom/handoff`, obtains the existing Clerk instance with `useClerk()` and renders `MosaicProvider` around `<LoomProvider clerk={clerk} prefetch={prefetch}><LoomComposedProfile /></LoomProvider>`. The standalone route renders `<LoomPassword />` inside the same providers with the same `prefetchProfile()` call. These Mosaic source imports are private prototype exports, not published package APIs.

The `prefetch` prop requires React 19. Passing its server-created promise across HTTP also requires a framework streaming integration, verified here with Next App Router. The installed Next runtime supplies React 19; ordinary workspace React 18 continues to support the existing `hydration` and browser-query APIs. The two provider props are mutually exclusive.

`useUserSnapshot()` reads the initial user immediately. `useProfileSnapshot()` also reads instance settings, suspending while the shared settings promise is pending. The composed profile owns section boundaries, and standalone Password owns a null-fallback boundary. Missing or rejected settings reach the section error boundary. ClerkJS readiness replaces those snapshot sections even if their settings remain pending or failed.

Mosaic's snapshot models only project display data and disabled controls. After handoff, ordinary Mosaic models read `clerk.user` and call its resource methods. Forms, validation, and reverification stay in Mosaic. There is no profile cache reconciliation, mutation invalidation, or additional Loom `/me` request.

Other SDKs call `prefetchProfile` from `@clerk/loom/server` with verified `identity: { userId, sessionId }` and a lazy `resolveBackend: async () => ({ client, routing })`. The client needs only `users.getUser(userId)`. The shared server helper also reads public `/v1/environment` over HTTPS at the trusted publishable-key host without credentials or incoming headers. Routing must match the browser's publishable key, frontend API, proxy URL, and domain. Server credentials remain inside the resolver.

Hydration v5 contains exact scope and independently optional `user`, `profileSettings`, and `sessions` entries, each with `{ data, updatedAt }`. Empty, invalid, and wrong-scope snapshots reject. The parser validates every snapshot entry and clamps future timestamps to the current time. This private prototype rejects older versions.

The provider captures one snapshot and settings promise for its lifetime. To supply a new server snapshot, mount a new provider. Ordinary re-renders do not replace its seed. The handoff validates instance routing, user, and session identity before exposing live sections.

The user-only `prefetchUser` helper returns the same snapshot format without instance settings. The separate `prefetchSessions` and development-only sessions helper remain available for the device experiment. No devices backend endpoint is required for profile SSR.

## Device-query ownership

Each owner has one QueryClient with a key per query: schema version, instance/routing key, user ID, active session ID, and operation name. Browser scope includes publishable key, frontend API, proxy URL, and domain. Token rotation stays with the host and does not create another cache key. Organization ID is absent because this endpoint does not select an organization.

The sessions result is a readonly array of serializable snapshots: session ID/status, epoch timestamps, nullable last activity time, an actor-presence flag, and nested device activity. It contains no resource methods, dates, credentials, or transport objects. Session and activity projections use the same query; Mosaic owns sorting, localization, relative dates, actor badges, and dialogs.

The server is authoritative. Loom owns the latest accepted response for its consumers. It bypasses `User.getSessions()` entirely, so it never layers its cache on top of the resource cache. Legacy consumers retain their existing independent cache; this prototype does not make them coherent with Loom.

`LoomProvider` creates and disposes its host binding in an effect and subscribes through React's external-store API. Resource and status events retire the old owner before publishing a new one. Each owner lifetime has a distinct React key, even when authenticated IDs are reused. With `hydration`, a validated read-only snapshot renders on the server and first browser render. Without it, the boundary shows its fallback. Controlled client injection is private to Loom's internal tests. Each LoomProvider boundary owns a separate cache, even when two boundaries receive the same Clerk instance. The public React API does not expose cross-root owner sharing. Plain JavaScript callers can still share a client deliberately.

The prototype exposes `queryClient` and `queryOptions()` so the official adapter can use the concrete engine directly. These are integration details, not a settled public API. Direct cache writes or changes to query options bypass Loom's guarantees and are unsupported. A restricted facade is a possible follow-up, not another abstraction in this experiment.

## Observable contract

Freshness is 30 seconds; inactive cache retention is five minutes. These are explicit experiment defaults. Loom adds no query retries or focus/reconnect refetch on top of host transport behavior. TanStack still handles online/paused state, deduplication, observers, freshness, and React Suspense/error reset.

| Event                       | Observable result                                                                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Host loading or signed out  | A valid initial snapshot can render while loading, with actions disabled. Loaded sign-out discards it and renders the fallback.                                                                                                |
| First read                  | Pending with fetching or paused status. Concurrent observers, `fetch`, and hover/focus `prefetch` share one request.                                                                                                           |
| Fresh cache read            | Reuses the snapshot. Explicit refresh marks it stale and fetches, or joins a read already in flight.                                                                                                                           |
| Empty success               | Successful `[]`, distinct from initial failure.                                                                                                                                                                                |
| Initial failure             | Original network error or structured HTTP error. `fetch` rejects; `prefetch` follows TanStack's best-effort semantics and stores the error.                                                                                    |
| Background refresh          | Existing data stays visible with fetching state. Failure retains data and exposes an error. Explicit retry can recover.                                                                                                        |
| Suspense                    | Initial pending suspends; initial error reaches the error boundary. QueryErrorResetBoundary enables retry. Refresh with data does not suspend or replace the list.                                                             |
| Identity change or disposal | Abort reads/mutations, clear cache, release owned observers/listeners. Dispatch and completion check the captured host scope. A late result cannot populate the replacement owner.                                             |
| Revoke                      | Refuse current, missing, inactive, or retired targets. Preserve structured reverification errors for Mosaic's existing challenge/retry flow.                                                                                   |
| Successful revoke           | Advance the mutation revision, cancel old reads, filter the latest shared cache, then invalidate active observers. An ignored abort cannot let an older read restore the row. Overlapping revokes filter the current cache.    |
| Failed revoke               | Preserve the error and the row. No optimistic removal.                                                                                                                                                                         |
| Server request              | Shared `prefetchProfile` starts user and settings concurrently, returning the user snapshot and safe settings promise. Retained `prefetchSessions` reads devices and disposes its request-local owner.                         |
| Hydration                   | Initialization only; validate schema, shape, and exact scope. Serialize successful state only. Clamp future timestamps for clock skew. No operation can merge an old hydration snapshot into an existing owner after mutation. |

Disposing an owner cannot undo a mutation already accepted by the backend. It prevents completion from publishing into another owner. Host routing, cookies, credential callbacks, retries, and rotation remain in its FAPI client.

## Evidence and reproduction

Run from the repository root:

```sh
rtk proxy pnpm --filter @clerk/loom test
rtk proxy pnpm --filter @clerk/loom typecheck
rtk proxy pnpm --filter @clerk/loom lint
rtk proxy pnpm --filter @clerk/loom build
rtk proxy pnpm --filter @clerk/loom verify:core
rtk proxy pnpm exec vitest run --config packages/loom/research/vitest.config.mjs
rtk proxy pnpm --filter @clerk/mosaic test:feature src/experimental/loom/__tests__
rtk proxy pnpm --filter @clerk/mosaic exec vitest run --project handoff
rtk proxy pnpm --filter @clerk/mosaic build
rtk proxy pnpm --filter @clerk/swingset build
```

Profile handoff tests cover server snapshots, React 19 hydration, streamed settings, and identity retirement. Device tests retain query caching, cancellation, revocation, and hydration coverage. Browser feature tests use MSW, so they do not prove backend authorization or production credential behavior.

Historical live development evidence remains in [the investigation](INVESTIGATION.md) and [decision trail](DECISIONS.tsv). The old profile query and mutation tests describe retired APIs and no longer establish the current profile contract.

To reproduce the unchanged ClerkJS baseline, run from `packages/clerk-js`:

```sh
rtk proxy pnpm exec vitest run src/core/resources/__tests__/User.test.ts src/core/__tests__/fapiClient.test.ts
```

## Limits to resolve before expanding

- **Production SSR:** the user path uses existing BAPI; the earlier devices endpoint remains undeployed. The current user path is verified with the staging development instance; the historical devices proof remains separate. Production auth refresh, proxy/domain deployments, credential rotation, private HTML/RSC cache behavior, and endpoint availability remain unverified. A session JWT alone returned `401 signed_out` in the earlier staging FAPI probe.
- **Server read limit:** the new endpoint rejects requests with more than 1000 eligible device candidates instead of returning a partial list. This limit belongs to the earlier devices server experiment.
- **Earlier devices instance identity:** Next's verified request exposes user/session IDs and a publishable key, but no independently verified instance ID. The adapter requires a nonempty backend `instance_id` and exact user/session match; the Backend API binds the session to the secret-key instance. This is not an independent client-side instance-ID comparison. User prefetch does not require a Backend `instance_id` field; it validates returned user ID and uses request-resolved routing for scope.
- **Live mutation evidence:** browser reads, refresh, and single-device revocation are verified against staging through the existing ClerkJS host. A disposable session created through BAPI was revoked through the Loom UI; backend readback confirmed `revoked` while the current session remained `active`, and refresh/reload did not restore the row. This fresh sign-in did not trigger reverification, so the live challenge path remains unverified. Controlled MSW tests cover that path.
- **Resource-layer parity:** direct FAPI calls preserve host transport hooks and structured status/code/message/long-message/retry/trace errors. They do not reproduce BaseResource's selected 401 recovery, client-payload updates, country updates, fraud-protection preparation, or all error metadata. Reverification for this operation is demonstrated; general mutation parity is not.
- **Other SDKs and roots:** the matrix describes proposed adaptations. Native credential stores, extension/IPC transports, and simultaneous independent ClerkJS runtimes are not verified. Controlled tests cover replacing the Loom host with the same IDs; the browser feature test does not exercise that transition.
- **Hydration delivery:** the Next live preview requests dynamic, uncached rendering and uses framework serialization after request authentication. Local authenticated HTML returned `no-store, must-revalidate`. RSC response headers and deployment caches remain unverified. Other integrations must authenticate each request, keep the server helper and credentials on the server, use safe framework serialization, and prevent shared caching of personalized output.
- **API and presentation:** this is an unpublished experiment. Integration fields remain exposed, and example-only loading/error/refresh copy is English. Existing localized device presentation and reverification are reused.

Intentional improvements over the current sessions resource are observable failures instead of fabricated empty success, genuinely fresh refreshes, shared prefetch/cache state, and revocation publication to all Loom consumers with stale-read protection.
