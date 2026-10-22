# Loom user and active-device query prototype

Private, unpublished `@clerk/loom` shares user and active-device queries through one owner, one QueryClient, and one React provider. The core loads without React, Mosaic, or ClerkJS. Browser authentication comes from the existing ClerkJS host.

The user SSR example uses the existing Backend API `users.getUser` operation. It projects identity, name, picture URL and upload status, email addresses, password presence, delete availability, and external verification status and recovery errors, enterprise display policy. It does not serialize Backend resources, metadata, verification secrets, or credentials. Production credentials and rotation remain unverified.

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

In the isolated `loom-user-ssr` worktree, run `rtk proxy pnpm --filter @clerk/swingset exec next dev --port 6008` and use `http://127.0.0.1:6008` to keep this test login separate from localhost previews.

Open `/live/loom` for the composed Mosaic Account and Security profile, or `/live/loom/password` for standalone Password. One `prefetchProfile` operation returns the user snapshot and a shared settings promise. Profile hooks seed their scoped query when those settings arrive. The server response preloads the picture URL; the shared Avatar image renders after client mount. Before Clerk connects, these facts render read-only. Loom retains display ownership after readiness. Shared ClerkJS action hooks attach compatible controls and authorize mutations against current resources. Unverified external accounts are not shown as connected. API keys are not included in this experimental composition. The page shows the profile first, with a collapsed **App code** section below it. The dynamic, no-store route shares the live shell's existing `window.Clerk`; it does not create a second runtime. If server prefetch fails, the browser loads both profile queries. The live Active devices preview remains browser-only.

React callers create or load the ClerkJS instance, then pass it to the single public provider. The provider owns the Loom binding and client lifecycle:

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
import { LoomComposedProfile, UserLivePreview } from './preview';

async function PrefetchedUserLivePreview() {
  const prefetch = await prefetchProfile();
  return (
    <UserLivePreview prefetch={prefetch}>
      <LoomComposedProfile />
    </UserLivePreview>
  );
}
```

The client preview retains the existing Clerk bridge and MosaicProvider. Its Loom provider is `<LoomProvider clerk={clerk} prefetch={prefetch}>{children}</LoomProvider>`. The standalone route passes `<LoomPassword />` as its child with the same `prefetchProfile()` call. These Mosaic source imports are private prototype exports, not published package APIs.

The `prefetch` prop requires React 19. Passing its server-created promise across HTTP also requires a framework streaming integration, verified here with Next App Router. The installed Next runtime supplies React 19; ordinary workspace React 18 continues to support the existing `hydration` and browser-query APIs. The two provider props are mutually exclusive.

`useSuspenseUser` renders from the user snapshot immediately. `useSuspenseProfile` waits for shared settings inside the component's Suspense boundary and seeds the official TanStack query adapter only when that query is absent. Existing pending, error, invalidated, and successful queries bypass the stream. Scope changes permanently retire the old stream, including returning to the original identity. The composed profile owns its section boundaries, and standalone Password owns a null-fallback boundary.

Other SDKs call `prefetchProfile` from `@clerk/loom/server` with verified `identity: { userId, sessionId }` and a lazy `resolveBackend: async () => ({ client, routing })`. The client needs only `users.getUser(userId)`. The shared server helper also reads public `/v1/environment` over HTTPS at the trusted publishable-key host without credentials or incoming headers. Routing must match the browser's publishable key, frontend API, proxy URL, and domain. Server credentials remain inside the resolver.

Hydration v5 contains exact scope and independently optional `user`, `profileSettings`, and `sessions` entries, each with `{ data, updatedAt }`. Empty, invalid, and wrong-scope snapshots reject. Only successful query entries serialize, and future timestamps clamp to the current time. This private prototype rejects older versions.

During bootstrap, regular hooks have `isEnabled: false`; disable refresh until live. Bootstrap imperative reads and mutations reject. A matching fresh seed avoids a duplicate browser read, while stale seeds refresh on handoff. Sign-out or identity mismatch retires the owner. The browser user read is a fresh host FAPI `GET /me`, with captured session, abort signal, response projection, and pre/post identity checks. Validated host user projection changes invalidate only the user query; unchanged listener emissions do not refetch.

Without hydration, the provider fallback waits for the host, then `useSuspenseProfile` drives actual query pending/error behavior. `QueryErrorResetBoundary` enables retries through the example's React boundary. With the legacy `hydration` prop, a resource absent from a nonempty bootstrap seed raises the explicit unavailable-transport error before handoff. Omit the hydration prop to use an unseeded query.

The existing user-only `prefetchUser` and `useSuspenseUser`, `prefetchSessions`, and development-only sessions helper remain available for the earlier experiment. No devices backend endpoint is required for user SSR.

Keep the `prefetch` or `hydration` object reference stable during ordinary client re-renders. A replacement snapshot starts a new provider lifetime. Next's server-provided prop is stable until navigation supplies new data. Do not recreate a hydration object on every render.

## Data and ownership

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
rtk proxy pnpm --filter @clerk/mosaic build
rtk proxy pnpm --filter @clerk/swingset build
```

| Evidence                             | Observed result                                                                                                                                                                                                                                                                                                                           | Limit                                                                                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Loom unit and React tests            | 106 passed, including user projection, picture and email invalidation, request isolation/disposal, user-only hydration, cold Suspense/error reset, account changes, and preserved sessions coverage                                                                                                                                       | Controlled transports and DOM environment; no live-backend authorization proof                                                     |
| Chromium feature tests               | 6 passed with real ClerkJS and MSW, including disabled pre-host actions, a provider-free flow, and compatibility/reverification flows                                                                                                                                                                                                     | FAPI is served by MSW                                                                                                              |
| Live staging browser                 | Initial read and refresh returned HTTP 200. Single-device revocation through Loom changed backend status to revoked while the current session stayed active; refresh/reload kept the row absent. Test sign-out returned to the signed-out sandbox                                                                                         | Target session was created through BAPI. Live reverification remains unverified                                                    |
| Live user SSR (development instance) | Existing BAPI `users.getUser` succeeded for the test account. Script-stripped server HTML contained the name; response was `no-store, must-revalidate`. Fresh hydration made no initial Loom `/me` read; Refresh made one HTTP 200 read. Cold mode mounted Suspense and resolved after HTTP 200. Sign-out and reload removed the profile. | Verified locally on 2026-10-21 against staging. Production Clerk credentials, rotation, and deployment caches remain unverified.   |
| Historical development SSR           | Server `/client` and `/me/sessions/active` returned 200 for the test account on the prior page path. Device text appeared in server HTML. Matching browser binding made zero initial Loom reads; Refresh made one.                                                                                                                        | Existing development credential only; not a test of the current BAPI path.                                                         |
| Characterization probes              | 7 passed against current resource/transport source and query-core                                                                                                                                                                                                                                                                         | Mocked fetch; captures existing cache/error behavior and transport mechanics                                                       |
| Existing ClerkJS baseline            | 79 passed; one preexisting skip and four preexisting todos                                                                                                                                                                                                                                                                                | Existing User/FAPI tests unchanged                                                                                                 |
| Built core import check              | Plain Node operation passes; module graph contains no React, Mosaic, or ClerkJS runtime                                                                                                                                                                                                                                                   | React Query remains a dependency for the optional adapter; this is runtime graph independence, not a claim about installation size |
| Builds and types                     | Loom, Mosaic, and Swingset pass; `/loom` appears in the production route output                                                                                                                                                                                                                                                           | Building a page does not exercise live credentials                                                                                 |

The browser runner reports a Vite close-timeout warning after successful tests but exits with code 0. Next emits existing StyleX and ESLint configuration warnings while completing its build. No task server is left running.

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
