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

The client credential is separate from session JWTs. It uses the same shared mobile request/response transport as Expo. General snapshots exclude client credentials, session JWTs, redirect URLs, challenges, and recovery secrets. Explicit token or recovery-code method results remain available to the caller that requested them. Production logs must not contain bridge payloads.

Deterministic protocol tests exercise the actual bundled core, including email verification, returned API errors, remaining MFA requirements, SSO, explicit finalization, pending session tasks, getToken, local reset, stale groups, and sign-out races. Native tests must additionally run the generated API on both engines. Fixture timing is not a performance budget or a release benchmark. Platform authentication, app upgrade continuity, UI completion, and release performance require the native integration suites.
