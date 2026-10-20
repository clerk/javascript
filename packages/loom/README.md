# Loom: active-device sessions prototype

Private, unpublished `@clerk/loom` proves one sessions query through plain JavaScript, the official TanStack React adapter, and an isolated Mosaic consumer. The core loads without React, Mosaic, or ClerkJS. Browser authentication still comes from the host ClerkJS instance.

**Authenticated SSR remains unresolved.** Node request isolation, serialization, server rendering, and browser hydration pass with controlled transports. They do not establish an end-user credential path to `/me/sessions/active` on a server. No administrative Backend API is substituted.

The [investigation and SDK matrix](INVESTIGATION.md) trace the existing implementation and explain the transport boundary. Existing production hooks, resources, and public exports are unchanged.

The work followed transport probes → competing ownership designs → scoped core → React and Mosaic → server isolation and hydration checks. Verification focused on authentication boundaries and stale results: controlled race tests, real runtime browser tests, and independent design/code/evidence reviews. The [decision trail](DECISIONS.tsv) records the choices and outcomes.

## Try the prototype

From the repository root, using its pinned pnpm:

```sh
rtk proxy pnpm --filter @clerk/loom build
rtk proxy node packages/loom/examples/plain-js.mjs
rtk proxy pnpm --filter @clerk/swingset dev
```

Open `/loom` on Swingset (normally `http://localhost:6006/loom`). Use its existing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` configuration and sign in. Hover or focus **Show devices** to prefetch, open the list, hide and reopen it to reuse fresh data, or choose **Refresh devices** to revalidate. Revoking another device uses Mosaic's existing confirmation and reverification flow.

This route sits outside Swingset's existing Clerk layout. It creates a bundled Clerk instance in the browser and passes that exact instance to both `ClerkProvider` and `ClerkLoomProvider`. The new existing-file edits are dependency wiring in the two consumer manifests and lockfile. Mosaic's experimental component is not publicly exported or included in its production bundle.

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

## Data and ownership

Each owner has one QueryClient and one key: schema version, instance/routing key, user ID, active session ID, and operation name. Browser scope includes publishable key, frontend API, proxy URL, and domain. Token rotation stays with the host and does not create another cache key. Organization ID is absent because this endpoint does not select an organization.

The result is a readonly array of serializable snapshots: session ID/status, epoch timestamps, nullable last activity time, an actor-presence flag, and nested device activity. It contains no resource methods, dates, credentials, or transport objects. Session and activity projections use the same query; Mosaic owns sorting, localization, relative dates, actor badges, and dialogs.

The server is authoritative. Loom owns the latest accepted response for its consumers. It bypasses `User.getSessions()` entirely, so it never layers its cache on top of the resource cache. Legacy consumers retain their existing independent cache; this prototype does not make them coherent with Loom.

`ClerkLoomProvider` creates and disposes owners in its effect. Resource and status events retire the old owner before publishing a new one. Each owner lifetime has a distinct React key, even when authenticated IDs are reused. `LoomProvider` instead borrows an explicit client; its caller must dispose it. Separate owners never share data implicitly. Sharing across roots requires deliberately passing the same live owner.

The prototype exposes `queryClient` and `queryOptions()` so the official adapter can use the concrete engine directly. These are integration details, not a settled public API. Direct cache writes or changes to query options bypass Loom's guarantees and are unsupported. A restricted facade is a possible follow-up, not another abstraction in this experiment.

## Observable contract

Freshness is 30 seconds; inactive cache retention is five minutes. These are explicit experiment defaults. Loom adds no query retries or focus/reconnect refetch on top of host transport behavior. TanStack still handles online/paused state, deduplication, observers, freshness, and React Suspense/error reset.

| Event                       | Observable result                                                                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Host loading or signed out  | Browser boundary renders its fallback; no query mounts. SSR identity alone does not enable transport.                                                                                                                          |
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
| Server request              | Caller creates a fresh owner and supplies a transport. Concurrent Node owners are isolated, including identical scope IDs. Authenticated transport is not implemented.                                                         |
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
rtk proxy pnpm --filter @clerk/mosaic test:feature src/experimental/loom/loom-active-devices.feature.test.tsx
rtk proxy pnpm --filter @clerk/mosaic build
rtk proxy pnpm --filter @clerk/swingset build
```

| Evidence                  | Observed result                                                                                                                                                                                                    | Limit                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Loom unit and React tests | 22 passed: sharing, freshness, empty/error/recovery, disposal, revoke races, host identity checks, Suspense/reset, background failures, owner replacement, snapshot projection, Node isolation, rendered hydration | Controlled transports and DOM environment; no live-backend authorization proof                                                     |
| Chromium feature tests    | 4 passed under StrictMode, real ClerkJS and real ClerkProvider: prefetch/remount, full provider remount, refresh/error/recovery, reverification/revoke/sign-out; second consumer sees removal                      | FAPI is served by MSW                                                                                                              |
| Characterization probes   | 7 passed against current resource/transport source and query-core                                                                                                                                                  | Mocked fetch; captures existing cache/error behavior and transport mechanics                                                       |
| Existing ClerkJS baseline | 79 passed; one preexisting skip and four preexisting todos                                                                                                                                                         | Existing User/FAPI tests unchanged                                                                                                 |
| Built core import check   | Plain Node operation passes; module graph contains no React, Mosaic, or ClerkJS runtime                                                                                                                            | React Query remains a dependency for the optional adapter; this is runtime graph independence, not a claim about installation size |
| Builds and types          | Loom, Mosaic, and Swingset pass; `/loom` appears in the production route output                                                                                                                                    | Building a page does not exercise live credentials                                                                                 |

The browser runner reports a Vite close-timeout warning after successful tests but exits with code 0. Next emits existing StyleX and ESLint configuration warnings while completing its build. No task server is left running.

To reproduce the unchanged ClerkJS baseline, run from `packages/clerk-js`:

```sh
rtk proxy pnpm exec vitest run src/core/resources/__tests__/User.test.ts src/core/__tests__/fapiClient.test.ts
```

## Limits to resolve before expanding

- **Authenticated SSR:** an actual incoming end-user credential path to FAPI, including rotation and equivalent sessions/activity semantics, remains unproven. A server's `credentials: 'include'` flag does not supply browser cookies. The host bridge has no server-auth adapter.
- **Authenticated backend evidence:** no live backend read or revocation was performed. Chromium verifies real runtime behavior against controlled responses.
- **Resource-layer parity:** direct FAPI calls preserve host transport hooks and structured status/code/message/long-message/retry/trace errors. They do not reproduce BaseResource's selected 401 recovery, client-payload updates, country updates, fraud-protection preparation, or all error metadata. Reverification for this operation is demonstrated; general mutation parity is not.
- **Other SDKs and roots:** the matrix describes proposed adaptations. Native credential stores, extension/IPC transports, simultaneous independent ClerkProvider runtimes, and runtime replacement without a provider remount are not verified.
- **Hydration delivery:** controlled request-local data is tested. The browser Clerk boundary does not ingest server snapshots, and no production route embeds authenticated data. Applications would need safe framework serialization and independent authorization before using this path.
- **API and presentation:** this is an unpublished experiment. Integration fields remain exposed, and example-only loading/error/refresh copy is English. Existing localized device presentation and reverification are reused.

Intentional improvements over the current sessions resource are observable failures instead of fabricated empty success, genuinely fresh refreshes, shared prefetch/cache state, and revocation publication to all Loom consumers with stale-read protection.
