# Embedded mobile runtime

This private entry point executes the existing `clerk-js` implementation in a controlled JavaScriptCore or QuickJS environment. It installs native HTTP, secure-storage, browser, passkey, timer, and randomness adapters. It provides no window or document. Unsupported dynamic modules return a capability error; server authentication and anti-abuse requirements are not bypassed.

```sh
pnpm --filter @clerk/shared build
pnpm --filter @clerk/native-bindings generate
pnpm --filter @clerk/mobile-runtime build
pnpm --filter @clerk/mobile-runtime test
pnpm --dir packages/mobile-runtime exec tsc --noEmit
```

The production protocol uses `init`, `invoke`, `cancel`, `release`, `lifecycle`, and `dispose` messages. The native transport validates the bundle hash before evaluation. Initialization rejects incompatible bindings before credential access. Requests use generated operation identifiers and structured arguments; they are never interpolated into executable JavaScript.

Each transport has one Clerk owner. `ResourceRuntime` assigns handles to actual resources and future facades. It rebinds retained handles when the core replaces a facade for the same server resource, invalidates replaced attempts and their groups, and projects state after both successful and failed operations. Local reset publishes state without requiring HTTP. Native wrappers apply an entire revision before resolving their awaiting caller.

Cancellation stops the native waiter without pretending an already-sent mutation was rolled back. A later authoritative result still reconciles state. Reset and sign-out cancel browser and passkey effects and fence outstanding credential writes and responses. Native consumers must retain the generated Clerk root while using its resources; nested resources do not indefinitely keep a disposed engine alive.

Concurrent `Session.getToken()` calls can share one source request. Canceling either native waiter leaves the other waiting for that request. If every waiter cancels, the request may still populate the cache for a later call. A surviving waiter receives the original token error, and a later call can retry after that failed cache entry is removed. `token-cancellation.test.mjs` checks these outcomes and verifies that each canceled call receives only one completion.

The client credential is separate from session JWTs. It uses the same shared mobile request/response transport as Expo. General snapshots exclude client credentials, session JWTs, redirect URLs, challenges, and recovery secrets. Explicit token or recovery-code method results remain available to the caller that requested them. Production logs must not contain bridge payloads.

Deterministic protocol tests exercise the actual bundled core, including email verification, returned API errors, remaining MFA requirements, SSO, explicit finalization, pending session tasks, getToken, local reset, stale groups, and sign-out races. Native tests must additionally run the generated API on both engines. Fixture timing is not a performance budget or a release benchmark. Platform authentication, app upgrade continuity, UI completion, and release performance require the native integration suites.

Prebuilt identifier entry uses `startAuthentication` for the shared sign-in-or-up fallback. Google One Tap uses the native `googleIdentity` capability through `authenticateWithSSO`; the core owns token submission, account transfer, and fallback to browser OAuth when the picker reports no Google account. Both return the generated future resource and leave `finalize()` explicit. Cancellation never starts the browser fallback.

The Node protocol suite runs with `--no-opt` because Node 24.15's optimizing compiler can crash on the embedded VM fixtures. This suite validates contracts; performance measurements must use the packaged native engines with their production settings.

The build attributes its included module graph to package versions and emits `THIRD_PARTY_NOTICES.txt` plus `bundled-dependencies.json`. Missing license notices fail the build. Packaging ships the notices with both SDKs, adds the pinned QuickJS notice on Android, and hashes the notice file in the core manifest. Build paths are rooted at the repository so invoking the build from another directory produces the same bundle.

Embedded native hosts report `connectivity` messages with a boolean `online` value from the OS. Unknown connectivity permits HTTP. Offline state suppresses shared network eligibility and foreground recovery; an online transition refreshes initial resources only while active. Concurrent lifecycle/connectivity recovery uses one reload; a restoration received during a failed reload is retried after that reload settles. Recovery does not adopt a listed session. The attached Expo transport leaves connectivity and recovery with the existing Expo owner. Monitoring starts after successful standalone initialization, so this does not provide offline cold-start initialization or turn an OS path into proof that the Clerk service is reachable.

Standalone initialization includes the native package's `sdkVersion`, used for the matching `x-ios-sdk-version` or `x-android-sdk-version` header. A low-level host that omits the version sends no invented version header. Malformed version values fail initialization before HTTP. The `_is_native=1` query marker and `x-mobile: 1` header continue to come from the shared mobile credential transport.

When an operation returns a resource while removing it from the selected roots, the runtime reconciles root ownership before encoding the return value. Existing handles become stale when their root disappears; a returned detached resource receives a readable handle included in the same completion snapshot. Active/pending session reloads retain their canonical handle, while an expired or removed selected session cannot leave a successful completion pointing at an invalidated handle.
