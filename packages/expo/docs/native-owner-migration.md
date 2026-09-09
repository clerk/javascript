# Expo native views: one Clerk owner

Native views attach a generated resource projection to the loaded Expo Clerk instance. The native modules cannot read/write the client credential, reload a second client, or adopt a native session. Native SDK 2.0 prereleases and matching generated contracts are required; this branch is not a published release.

## Build requirements

The native dependencies are `ClerkKit`/`ClerkKitUI` 2.0.0-alpha.0 and `clerk-android-api`/`clerk-android-ui` 2.0.0-alpha.0. These are prerelease coordinates for the sibling implementation branches; they must be published together before a consumer can resolve them. Local source verification does not prove registry installation.

The iOS bridge uses Swift 6 and iOS 17 or newer. The Android config plugin defaults to Kotlin 2.3.20 when the app has no explicit Kotlin version. Expo SDK 57's native module compiles with that compiler against the SDK built with Kotlin 2.4.10. Configure custom Kotlin/Compose versions consistently; Expo's optional compiler plugins may not support newer compilers immediately. The plugin no longer suppresses incompatible Kotlin metadata checks. Client credentials remain in the Expo token cache. Native secure storage is used only for magic-link and biometric platform state.

The Android plugin enables core-library desugaring in the application for the generated date API on supported Android versions below API 26. Full Expo SDK 57 iOS and Android development-app builds have been verified with the local prerelease SDKs.

On iOS the config plugin registers `clerk://<bundle-id>.native-callback`. On Android the 2.x SDK manifest registers `<application-id>.clerk://oauth/callback`. Existing hosted-auth routes remain separate. Regenerate the development build when moving to this transport.

The attached bridge is generated from `packages/mobile-runtime/src/attached-core.ts` and the canonical binding artifacts using `pnpm --filter @clerk/mobile-runtime build:attached`; Expo's build performs this step. CI runs `check:attached` to detect an out-of-date bundled projection. It contains no Clerk constructor, network environment, or second credential transport.

## Coverage migration

The three old client synchronization suites below exercise the retired second-client transport. Their full test inventory is recorded here before removal. Native-to-JavaScript adoption, token echo suppression, synchronization queues, native recovery authority, and reconciliation cooldowns have no corresponding runtime operation in the new architecture. The existing JavaScript implementation continues to own session selection, recovery, request credentials, and persistence.

Preserved behavior is covered by:

- `packages/mobile-runtime/test/attached-core.test.mjs`: the actual Clerk owner, native and direct JS mutations, reset/sign-out races, foreign connection handles, detach without cancelling ordinary JS work, and reattachment without another initialization request.
- `packages/mobile-runtime/test/protocol.test.mjs`, `external-account.test.mjs`, `biometrics.test.mjs`, `apple-identity.test.mjs`, and other runtime suites: state-before-completion, explicit finalization, pending tasks, late responses, secure-persistence fences, returned errors, OS cancellation, and lifecycle recovery through the existing core.
- `src/provider/__tests__/nativeResourceConnection.test.ts`: transport initialization, wrong-connection events, late preparation, prompt cancellation, and handshake failure availability.
- `src/provider/__tests__/ClerkProvider.nativeClientSync.test.tsx`: provider opt-out, loaded-owner gating, key changes, StrictMode/unmount lifetime, and bounded reconnect.
- `src/provider/singleton/__tests__/createClerkInstance.test.ts` and shared mobile-credential tests remain: owner construction/configuration, credential transport, storage scope and offline resource-cache behavior.
- The biometric hook suite now exercises the existing JS resource API, preserves its public Expo return shape, and checks errors, required remaining factors, readiness and explicit activation.

These replacements do not establish live-device prompt behavior or production upgrade continuity. Full Expo app builds, device journeys, and old-major upgrade checks remain release gates.

The [iOS Simulator shared-owner journey](shared-owner-simulator-proof.md) now demonstrates native-to-JavaScript and JavaScript-to-native profile changes plus native sign-out on Hermes for the recorded commits. Android interaction, physical-device prompts, old-major upgrades and release-performance gates remain separate.

| Retired suite                                                | Retired two-client case                                                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | does not start native client synchronization when disabled                                             |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | configures native once with the cached device token during StrictMode bootstrap                        |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | registers native bootstrap before child effects can await synchronization                              |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | syncs the native device token to JS after Clerk loads during bootstrap                                 |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | syncs a JS token rotated during bootstrap to native exactly once                                       |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | flushes one JS client change that occurs after JS loads but before native is ready                     |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | preserves native configure failures and keeps synchronization disabled                                 |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | does not wait for an obsolete native bootstrap after switching publishable keys                        |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | does not wait for an active native refresh after switching publishable keys                            |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | retries a transient native configure failure                                                           |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | disables synchronization when switching publishable keys fails to configure native                     |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | keeps native recovery authoritative when JS creates a client from an empty cache                       |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | does not notify native when the token cache writes the current token again                             |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | syncs JS token cache changes when ClerkProvider uses the default token cache                           |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | reloads JS resources after native emits a device token change                                          |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | reloads JS resources after native clears the device token                                              |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | reloads JS resources after a native client-only change without rewriting the token cache               |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | does not bounce a JS client listener event while applying a native client change                       |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | serializes native token writes while keeping cache notifications suppressed                            |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | emits the refreshed JS client after a native client update keeps the active session                    |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | sets the refreshed native last active session without emitting a stale signed-out JS state             |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | does not explicitly sign JS out when a native client change leaves no signed-in sessions               |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | rejects a foreign sessionless client when refreshing mutates the JS client in place                    |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | keeps the remaining JS session when the old active session becomes unauthenticated                     |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | treats client payloads that remove the active session as a session switch when another session remains |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | does not start fallback activation during an explicit session transition                               |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | keeps follow-up client updates suppressed while reconciling a removed active session                   |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | does not fall back to JS sign-out when stale unauthenticated recovery still has a native device token  |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | falls back to JS unauthenticated handling when native token recovery has no signed-in sessions         |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | runs native recovery once for a burst of unauthenticated responses                                     |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | recovers again inside the cooldown window once native pushes a new device token                        |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | keeps the cooldown when a failed recovery rolls the device token back                                  |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | refreshes native from the server after the JS client changes                                           |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | retries failed native state while processing a queued sync                                             |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | keeps a pending native client refresh while a token sync is in flight                                  |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | refreshes native with the saved token after the JS token cache changes                                 |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | tracks an in-flight device-token sync until native reconciliation completes                            |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | preserves a failed native refresh until a later refresh succeeds                                       |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | ignores a canceled native refresh that later rejects                                                   |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | awaits JS session activation during explicit native-to-JS synchronization                              |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | ignores native client events that echo a JS-originated sync                                            |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | refreshes native from the server after the JS token cache is cleared                                   |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | rejects a foreign session-less native client and restores the signed-in JS token                       |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | restores the signed-in JS token when native client verification fails                                  |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | does not replace a signed-in JS token when the native client cannot be verified                        |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | applies a session-less native response when it belongs to the current JS client                        |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | rejects a foreign session-less native client during unauthenticated recovery                           |
| `provider/__tests__/ClerkProvider.nativeClientSync.test.tsx` | skips native adoption when the cached device token read times out while signed in                      |
| `provider/__tests__/nativeClientSyncCoordinator.test.ts`     | preserves a JS-to-native sync failure until a later sync succeeds                                      |
| `provider/__tests__/nativeClientSyncCoordinator.test.ts`     | does not restore an older failure after a newer sync succeeds                                          |
| `provider/__tests__/nativeClientSyncCoordinator.test.ts`     | ignores a tracked synchronization that is invalidated before it rejects                                |
| `provider/__tests__/nativeClientSyncCoordinator.test.ts`     | rejects with environment unavailable when JS-to-native synchronization times out                       |
| `provider/__tests__/nativeClientSyncCoordinator.test.ts`     | honors an extended timeout for native bootstrap synchronization                                        |
| `provider/__tests__/nativeClientSyncCoordinator.test.ts`     | ignores pending synchronization outcomes from before a reset                                           |
| `provider/__tests__/nativeClientSyncCoordinator.test.ts`     | waits for an event sync before starting explicit synchronization                                       |
| `provider/__tests__/nativeClientSyncCoordinator.test.ts`     | runs a follow-up synchronization when an event arrives during explicit synchronization                 |
| `provider/__tests__/nativeClientSyncCoordinator.test.ts`     | merges change flags while preserving the latest event snapshot during explicit synchronization         |
| `provider/__tests__/nativeClientSyncCoordinator.test.ts`     | runs a follow-up synchronization for another explicit request                                          |
| `provider/__tests__/nativeClientSyncCoordinator.test.ts`     | serializes native event synchronizations in arrival order                                              |
| `hooks/__tests__/useNativeClientEvents.test.ts`              | stores native client change payloads                                                                   |
| `hooks/__tests__/useNativeClientEvents.test.ts`              | subscribes only while native client events are enabled                                                 |
| `hooks/__tests__/useNativeClientEvents.test.ts`              | does not subscribe modules without an Expo event emitter                                               |
