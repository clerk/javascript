# Production SSR prefetch security review

This records the design review before implementation. The [current implementation contract](SERVER_API_PROPOSAL.md) and [implementation review](../../.audit/loom-server-implementation-review.md) describe the locally implemented approach and remaining verification gaps.

This review records the pre-implementation decision. The selected application-secret contract is now implemented locally in JavaScript and under local implementation in Go, but is not deployed. The statements below that an endpoint does not exist describe the source state at review time. Production SSR, response-cache behavior, and credential rotation remain unverified.

## Intent

Support authenticated server rendering and hydration of active devices without requiring an application proxy. Review the proposed authorization design and identify a smaller, safer integration under Clerk's existing application-server trust model.

This is a source-based design review, not a security signoff or production test. The proposed endpoint does not exist. Go was reviewed at fetched `origin/main` revision [`1a3ba374b70489faa5a1a4258962a647896bf363`](https://github.com/clerk/clerk_go/commit/1a3ba374b70489faa5a1a4258962a647896bf363), dated 2026-10-21. The Go checkout was left unchanged. The [original proposal](./SERVER_API_PROPOSAL.md) remains intact; this review recommends revising its authentication approach.

## Reviewers

- Reviewer A: gpt-6-astra, four findings.
- Reviewer B: gpt-6-sol, four findings.
- Reviewer C: gpt-6-luna, one primary finding and additional authorization constraints.

The lead checked the consequential claims against the pinned Go source and current JavaScript checkout. Model agreement is supporting evidence, not proof.

## Recommendation

Use the existing request authenticator, followed by a narrow Backend API read authenticated with the application's existing secret. Do not forward the user's JWT to a second verifier for this operation.

```text
Browser page request
  → existing Clerk middleware authenticates the request
  → server-only prefetchSessions() obtains its verified session ID
  → BAPI authenticates the application's secret
  → BAPI loads that session within the authenticated instance
  → BAPI checks live session/user eligibility and applies shared FAPI policy
  → Loom hydrates a request-local cache into private HTML/RSC
```

Illustrative backend contract:

```http
GET /v1/sessions/{requesting_session_id}/active_devices
Authorization: Bearer <application-secret-key>
```

The session ID is a selector, not a credential. The endpoint derives the user from the stored session; it accepts no independent user ID or actor identity. Return the original proposal's minimal subject and device projection. The adapter checks the returned instance/user/session against verified request identity.

The public application API remains:

```tsx
const hydration = await prefetchSessions();
return <DevicesClient hydration={hydration} />;
```

The zero-argument framework helper must obtain identity exclusively from authenticated request context. Route, form and search parameters cannot select the session. Framework-neutral integrations must preserve the same rule. BAPI credentials and host configuration remain server-owned. Requests must bypass shared caches and refuse redirects; document and RSC responses containing hydration must also be private and uncached.

**Explicit tradeoff:** BAPI trusts the app server's session selection. An incorrectly exposed app endpoint that accepts an attacker's victim-session ID could disclose that victim's data. The original JWT-bearing contract would reject that particular ID-only substitution. The simpler approach reduces credential handling and authentication machinery; it is not stronger against every application bug.

This is appropriate for the existing full-secret-key trust model. A full-key holder can already read session data and [mint a token for an eligible session](https://github.com/clerk/clerk_go/blob/1a3ba374b70489faa5a1a4258962a647896bf363/api/bapi/v1/sessions/service.go#L375). That mint operation is not development-only. Consequently, requiring a JWT alongside that key does not contain a compromised app server or key. Both designs reject direct access with only a stolen user JWT.

If independent session-token possession on every backend read is a product requirement, retain dual authentication and address the verifier findings below. Restricted credentials could change this decision, but their permissions for this operation have not been established.

## Act on

### 1. Protect the rendered response, not only the API call

**A, B, C. Blocks either design.** BAPI's `private, no-store` header does not govern the separate application HTML/RSC response. Hydration includes IP/location data, and [LoomProvider](./src/react.tsx) deliberately renders its bootstrap before browser Clerk identity resolves. If a shared page cache serves user A's response to user B, later scope rejection cannot undo disclosure.

Require request-local ownership, supported dynamic rendering, no shared memoization of authenticated results, private/no-store application responses and framework-safe serialization. Check the actual deployment cache path. This is an integration requirement, not evidence that the existing prototype page leaks.

### 2. Do not treat the existing Go verifier as a complete new session-auth contract

**A, B; C also requires stronger subject and eligibility checks. Blocks the original dual-auth implementation.** [`VerifySessionToken`](https://github.com/clerk/clerk_go/blob/1a3ba374b70489faa5a1a4258962a647896bf363/pkg/auth/auth.go#L204) uses a [generic verifier](https://github.com/clerk/clerk_go/blob/1a3ba374b70489faa5a1a4258962a647896bf363/pkg/jwt/jwt.go#L379) that checks signature, algorithm, `typ` and time claims, but does not enforce token category, issuer, audience or authorized party. A `sid` claim alone does not prove token class: current [SAPI authorization](https://github.com/clerk/clerk_go/blob/1a3ba374b70489faa5a1a4258962a647896bf363/api/sapi/v1/router/authorization.go#L37) explicitly addresses other instance-signed token classes carrying it.

If retaining dual auth, define the accepted signed category and proven legacy exceptions, mandatory claims, instance/session/user binding, and issuer/audience/origin policy. Keep live-session and active-user checks. Test foreign token classes and missing claims. This is a gap in the proposed reuse, not a demonstrated exploit of an implemented Loom route. The recommended design keeps token authentication in the existing request middleware, whose configured policy still matters.

### 3. Enforce credential-safe errors and transport

**A, B; B additionally identified SDK transport defaults.** Go's generic verifier interpolates token bytes into some errors. The existing deprecated session Verify service sanitizes them; a new handler must not capture raw causes in logs or tracing. Header/body redaction alone is insufficient.

The current [backend request helper](../backend/src/api/request.ts) does not itself set `redirect: 'error'` or `cache: 'no-store'`. A new method cannot claim those guarantees merely by using that helper; runtime wrappers may differ. Establish and test the operation's effective transport behavior. JWT forwarding adds a sensitive body that could survive a redirect even where Authorization is stripped. Removing forwarding avoids that path, while secret-key and response protection remain necessary.

### 4. Preserve one device-visibility policy

**A, B; C agrees on required parity.** Existing [BAPI session listing](https://github.com/clerk/clerk_go/blob/1a3ba374b70489faa5a1a4258962a647896bf363/api/bapi/v1/sessions/list_service.go#L78) already includes activity when entitled. However, unlike [FAPI](https://github.com/clerk/clerk_go/blob/1a3ba374b70489faa5a1a4258962a647896bf363/api/fapi/v1/sessions/service.go#L550), it does not fall back to only the requesting session when DeviceTracking is unavailable or hide actor sessions based on the requesting session.

Do not hydrate the browser query with the broader administrative result. Extract the existing FAPI selection policy for both routes, retaining instance isolation, live requesting-session/user checks, actor rules, entitlement fallback and minimal projection. Exact parity still calls for a small Go change; reproducing the policy in Loom increases drift risk.

## Consider

- **Retain dual auth for protection against incorrect session selection (C; acknowledged by A/B).** It gives Clerk an independently checked token for each read. Choose it if that protection warrants extra verification, redaction and expiry handling. It does not protect against the full-key holder.
- **Reduce hydrated fields further (lead).** Preserve fields needed by Active devices, but avoid carrying IP/location data into views that do not use it. Data minimization complements cache isolation.

## Noted

- **Rotation and revocation differ (A/B/C).** Middleware owns request-token refresh and response cookie propagation. The recommended read has no second JWT-expiry clock or cookie exchange. It still checks current session eligibility. Client-cookie rotation need not revoke an otherwise eligible session. Already delivered snapshots cannot be recalled, and a final eligibility check cannot make reads atomic with revocation.
- **Alternative designs (A/B/C).** A delegated-token exchange adds a credential lifecycle and extra request. JWT-only FAPI changes the browser-facing authorization contract. Browser-only prefetch cannot supply authenticated initial server HTML.
- Existing hydration allowlisting and scope matching are useful protections at the client handoff; neither replaces server response isolation.

## Dismissed

- **“Dual authentication is useless.”** It can catch an accidental session-selector substitution, even though a full-key holder can satisfy both checks.
- **“Using a JWT means anyone with it can call the proposed BAPI.”** Both proposed BAPI designs require the application secret.
- **“The proposal already leaks credentials or user data.”** The endpoint is unimplemented. The identified failures are concrete implementation conditions, not observed deployed exploits.
- **“Current BAPI cannot return device information.”** It can; its visibility semantics are the mismatch.

## Agreement map

All three reviewers agree on protecting HTML/RSC, the full key's broad authority, live authorization checks and FAPI parity. A and B independently identified verifier/category and raw-error problems and preferred secret-only BAPI. C preferred dual auth for per-read session evidence. The lead favors A/B for this trusted-server use case and preserves C's objection as an explicit tradeoff, not a dismissed concern.

## Proof before production support

1. Reject cross-instance selectors and revoked, expired or deprovisioned sessions; never accept a browser-controlled session selector in the framework helper.
2. Compare FAPI/BAPI results across entitlement, actor and activity cases. Fail closed on unavailable authorization state.
3. Test concurrent users, account switching, cached navigations and actual HTML/RSC response headers through the deployment path. Verify safe serialization and minimal fields.
4. Verify redirect refusal, effective no-store behavior, credential/error redaction and instance/session rate limits.
5. Exercise real production-mode authentication, refresh-cookie propagation, rotation, sign-out and revocation without a proxy; confirm correct hydration and no duplicate initial browser read.

No runtime code or app configuration was changed for this review, and no tests or live production probes were run. Production SSR and rotation remain unresolved until a suitable production-mode test instance and the implementation are available.
