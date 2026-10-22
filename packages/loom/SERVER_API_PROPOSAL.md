# Server prefetch implementation

Implemented locally, not deployed. Production SSR, credential rotation, and actual HTML/RSC cache behavior remain **unverified**. The [security review](SERVER_API_SECURITY_REVIEW.md) explains why this implementation reuses existing server authentication instead of forwarding a session JWT.

The JavaScript changes are in this checkout. The Go implementation is saved in the local `clerk_go` branch `codex/loom-server-prefetch`, commit `f8a3db38ec`, based on fetched main `1a3ba374b70489faa5a1a4258962a647896bf363`. The temporary Go checkout was removed after preserving the branch and [backend patch](../../.audit/loom-server-backend.patch). Nothing was deployed and no external application configuration changed.

## Application API

The optional Next adapter follows `currentUser()` by obtaining authenticated request identity and using the request-aware backend client.

```tsx
import { prefetchSessions } from '@clerk/loom/nextjs';

export default async function Page() {
  const hydration = await prefetchSessions();
  return <DevicesClient hydration={hydration} />;
}
```

The existing client boundary consumes the snapshot and browser Clerk instance.

```tsx
<LoomProvider
  clerk={clerk}
  hydration={hydration}
  fallback={<SignIn />}
>
  <Devices />
</LoomProvider>
```

Signed-out requests return undefined hydration. Authenticated read failures throw. The live Active devices preview explicitly falls back to browser loading when prefetch fails, including when the endpoint is unavailable. It requests dynamic, uncached rendering. Other integrations must prevent shared caching of personalized HTML and RSC responses too.

## Ownership

- Existing Clerk middleware and `auth()` authenticate the request, select its session, and own refresh/handshake behavior.
- Next's request-aware client resolution selects existing credentials and resolved proxy/domain options from middleware or environment configuration.
- `@clerk/nextjs/internal/server` exposes that client and projected nonsecret routing through a server-only entry. Domain normalization uses the shared helpers used by ClerkJS.
- `@clerk/backend` performs `sessions.getActiveDevices(sessionId, { signal })` through the existing request, error, and deserializer path. This operation uses no-store and refuses redirects.
- `@clerk/loom/nextjs` obtains identity only from `auth()` and passes the existing request-aware client/routing resolver.
- `@clerk/loom/server` short-circuits signed-out requests, resolves the client and routing together, binds the read to the authenticated session, validates the subject, projects device data, derives browser scope, and owns prefetch, hydration, and disposal.

Next and backend do not import Loom. The shared server entry has no runtime dependency on Next, React, ClerkJS, or the backend SDK. It accepts the existing backend client structurally and validates the unknown response inside Loom.

## Shared adapter contract

SDK adapters use `prefetchSessions({ identity, resolveBackend })` from `@clerk/loom/server`. The Next adapter is:

```ts
export async function prefetchSessions() {
  const { userId, sessionId } = await auth();
  return prefetchRequestSessions({
    identity: { userId, sessionId },
    resolveBackend: getClerkClientAndRouting,
  });
}
```

`identity` contains the verified request's `userId` and `sessionId`, each a string or null. Missing identity returns undefined without calling `resolveBackend`. The resolver returns the SDK's configured `client` and request-resolved `routing`. Loom only requires the client's `sessions.getActiveDevices(sessionId, { signal })` method. It selects the session from the captured identity and validates the response before creating hydration.

Routing uses the existing `ClerkScopeInstance` shape with `publishableKey`, `frontendApi`, optional `proxyUrl`, and normalized `domain`. Each SDK resolves these through its existing request configuration, including dynamic keys and middleware overrides. A shared environment-only resolver would lose that information. The same request must supply both the client and routing.

The shared operation creates no auth verifier, token refresh loop, global query client, or credential store. Adapter inputs are trusted server code. Do not accept identity from route parameters or send the context to the browser. Each call owns a separate Loom cache; only the minimal hydration is serializable output.

The previous public `{ scope, read }` contract is removed from this private prototype. The explicitly named development experiment shares a private cache lifecycle helper. Next is currently the only built-in framework adapter. Other SDKs can use this contract after connecting their existing auth and request-resolved routing.

## Backend contract

```http
GET /v1/sessions/{requestingSessionId}/active_devices
Authorization: Bearer <application-secret-key>
```

The session ID is a selector. BAPI authenticates the application secret, loads that session inside the selected instance, and requires an active session and eligible user. Missing, expired, abandoned, revoked, banned, or deprovisioned state prevents success. Enterprise eligibility lookup errors fail closed through the existing EASIE lookup. This read does not mint tokens or change cookies.

The response contains `object: "active_device_sessions"`, a subject with instance/user/session IDs, and a minimal sessions array. Each session contains ID, status, millisecond timestamps, `has_actor`, and nullable `latest_activity` using the existing activity serializer. Credentials, actor identities, and user/client resources are excluded. Responses use `Cache-Control: private, no-store`.

FAPI and BAPI call the same device-selection policy for DeviceTracking entitlement fallback, actor visibility, and activity attachment. The existing FAPI query remains uncapped. The new server read loads at most 1001 SQL-active candidates and returns an explicit 400 error above 1000. It never reports a partial list as success. Hidden or subsequently inactivity-filtered rows can count toward this conservative limit.

The shared Loom server integration checks exact user/session equality and a nonempty returned instance ID. `auth()` does not expose an independently verified instance ID, so the adapter cannot compare one. Instance binding relies on BAPI's authenticated secret and instance-scoped lookup, together with the verified request's globally unique user/session IDs.

## Trust, caching, and rotation

The app server is trusted to select the requesting session, as it is when `currentUser()` selects a user for a backend read. The zero-argument helper cannot select identity from route or form parameters. Direct backend callers still hold broad application authority and must not expose arbitrary selectors to browsers.

This avoids a second JWT verifier and credential-forwarding path. It gives up independent JWT possession proof at BAPI for each read. A compromised full server key can already read session data and mint session tokens under the existing trust model.

Request JWT validation and refresh remain with Clerk middleware. The device read checks live backend session state without forwarding that JWT or imposing a second JWT-expiry clock. Client-cookie rotation and session revocation remain distinct. Reads can race with revocation, and already delivered snapshots cannot be recalled.

The cache scope includes publishable key, frontend API, proxy URL, domain, user ID, and session ID. It contains no credentials. A matching fresh snapshot seeds the browser cache once; identity changes discard it. Scope validation cannot protect HTML already served from an incorrectly shared cache.

## Verification and release limits

The shared server refactor passes 81 Loom tests, typecheck, lint, formatting, and build. The built-server smoke check produces minimal hydration in plain Node without loading Next, React, ClerkJS, Mosaic, or the backend SDK runtime. The existing Next behavior tests remain in place. An independent scoped review found no actionable issues. No backend or SDK authentication implementation changed in this refactor.

Backend SDK and Loom tests pass. The broader Next middleware/client/isolation selection passes, including legacy routing payload compatibility and explicit empty overrides. Backend, Next, Loom, and Swingset builds pass. The built core imports without React, Mosaic, or ClerkJS.

Go package checks pass, and the new BAPI integration tests compile. The integration tests were **not run** because the local test services were unavailable. OpenAPI YAML parses; full OpenAPI validation remains outstanding. The integration tests cover authorization, eligibility, actor/entitlement policy, activity projection, and the 1000/1001 boundary.

Release remains blocked on executing those backend tests, deploying the matching endpoint, and verifying authenticated SSR, actual document/RSC caching, refresh-cookie propagation, sign-out, account switching, revocation, and rotation in a production-mode test instance. Historical staging proof for the development-browser-credential experiment does not verify this server transport. The explicitly named development helper remains available for that experiment and shares the generic prefetch lifecycle.

See the [JavaScript report](../../.audit/loom-js-implementation.md), [routing regression checks](../../.audit/loom-routing-regression.md), [Go report](../../.audit/loom-go-implementation.md), and [implementation review](../../.audit/loom-server-implementation-review.md) for scoped evidence.
