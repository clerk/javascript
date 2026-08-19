# @clerk/expo native architecture

How the TypeScript SDK, the Expo native modules, and the clerk-ios / clerk-android SDKs fit
together, and where every moving part lives.

## Module registration and the bridge

- `expo-module.config.json` registers four modules per platform: `ClerkExpoModule`,
  `ClerkAuthViewModule`, `ClerkUserProfileViewModule`, `ClerkUserButtonViewModule`, plus the iOS
  appDelegate subscriber `ClerkAppDelegateSubscriber`. Expo Modules autolinking wires them up; the
  config plugin does **not** register modules.
- `react-native.config.js` sets `android: null` so the RN CLI ignores Android (Expo autolinking
  owns it) while iOS keeps the podspec.
- Names must match on three sides: Swift `Name("ClerkExpo")` (`ios/ClerkExpoModule.swift`), Kotlin
  `Name("ClerkExpo")` (`android/.../ClerkExpoModule.kt`), and the TS specs.
- TS side: `src/specs/NativeClerkModule(.android).ts` resolve via
  `requireOptionalNativeModule<Spec>('ClerkExpo')`, so Expo Go and plugin-less apps get `null`
  instead of a crash. `src/specs/NativeClerkModule.web.ts` exports `null`.
  `src/utils/native-module.ts` runtime-validates the module shape (`isClerkExpoModule`) and
  exports `ClerkExpoModule` + `isNativeSupported`. Native views resolve with
  `requireNativeView(...)` guarded by `Platform.OS`.
- Module surface (keep Swift, Kotlin, and `src/specs/NativeClerkModule.types.ts` in lockstep):
  `configure(publishableKey, bearerToken)`, `getClientToken()`,
  `syncClientStateFromJs(deviceToken, sourceId, didChangeClient, didChangeDeviceToken)`, the
  auth-flow and trusted-device functions, and the events `clerkNativeAuthFlowChanged` /
  `clerkNativeClientChanged`.
- The two platforms are shaped differently. On iOS the logic concentrates in one large
  `ios/ClerkNativeBridge.swift`, which talks to clerk-ios through
  `@_spi(FrameworkIntegration) import ClerkKit` + `ClerkKitUI` (configure/reconfigure, client
  refresh, device token, trusted devices), with the view files thin wrappers around
  `ClerkNativeViewHost.swift`. On Android the same responsibilities spread across the Kotlin
  modules in `android/src/main/java/expo/modules/clerk/` (`ClerkExpoModule.kt` for the client
  bridge, one module per native view, `ClerkComposeNativeViewHost.kt` hosting the clerk-android
  Compose UI), calling the clerk-android `Clerk.*` entry points. A bridge change is not done
  until both sides implement it.

## Native SDK version pinning

| SDK           | Pinned where                                  | Mechanism                                                                        |
| ------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| clerk-ios     | `ios/ClerkExpo.podspec` (`clerk_ios_version`) | SPM `spm_dependency(:kind => 'exactVersion')`, products `ClerkKit`, `ClerkKitUI` |
| clerk-android | `android/build.gradle` `ext` block            | `com.clerk:clerk-android-api` / `clerk-android-ui` maven coordinates             |

- clerk-ios bumps are **automated**: clerk-ios's `bump-javascript-expo-ios-sdk.yml` workflow fires
  on release, rewrites `clerk_ios_version`, writes a changeset, and opens a PR. Do not hand-bump
  on a feature branch; let the automation land and rebase.
- clerk-android bumps are manual. When bumping, re-verify the transitive excludes (kotlin-stdlib,
  okhttp) and the `-Xskip-metadata-version-check` compiler arg, which exists because clerk-android
  ships Kotlin metadata newer than Expo's Kotlin toolchain.
- Platform floors set by the native layer: iOS 17.0 (podspec + `CLERK_MIN_IOS_VERSION` in
  `app.plugin.js`, which must match), Android minSdk 24 (trusted devices need API 28+), RN >= 0.75
  (the podspec raises below it), Java 17.
- A JS-layer change ships against the **pinned** native versions, not clerk-ios/android `main`.
  If a change needs an unreleased native API, the native release and the pin bump land first.

## JS <-> native client sync

The hardest part of the package. Both clerk-js (JS) and clerk-ios/android (native) maintain their
own Clerk client + device token; this machinery keeps them converged so native views and JS hooks
agree on who is signed in. Files:

- `src/provider/nativeClientSync.tsx` (~1300 lines): bootstrap + sync logic and all tunables.
- `src/provider/nativeClientSyncCoordinator.ts`: module-level singleton that serializes JS->native
  and native->JS syncs (pending-sync tracking, event coalescing, generation counters,
  `__internal_resetNativeClientSyncCoordinator()` for tests).
- `src/hooks/useNativeClientEvents.ts`: subscribes to `clerkNativeClientChanged` and validates
  snapshots before applying them.
- `src/provider/ClerkProvider.tsx`: wires it all, gated by
  `isNative() && !__experimental_disableNativeClientSync`.
- Shared token-cache key with clerk-js: `CLERK_CLIENT_JWT_KEY = '__clerk_client_jwt'`
  (`src/constants.ts`).

**Bootstrap** (`useNativeClientBootstrap`): wait for the JS Clerk instance to load, read the cached
device token, `configure(publishableKey, jsDeviceToken)`, then reconcile. If JS and native device
tokens differ, push JS->native (`syncClientStateFromJs`) or pull native->JS. One retry on failure;
"Cannot find native module" is downgraded to a dev hint about the missing app.json plugin.
Readiness is generation-guarded so a re-render mid-bootstrap can't apply stale state.

**Steady state**: JS changes flow out via a clerk-js listener (`skipInitialEmit: true`); native
changes flow in via the `clerkNativeClientChanged` event. Changes made while sync is disabled are
buffered (`queueNativeRefreshBeforeReady`) and flushed on enable.

**401 recovery + cooldown**: `ClerkProvider` monkey-patches `clerkInstance.handleUnauthenticated`.
A 401 burst is throttled by a 5s cooldown; a rotated device token reopens it. Recovery re-reads
the native device token and refreshes the JS client (rejecting foreign sessionless clients) before
clerk-js's stale-session path can collapse to signed-out, suppressing JS client-change emissions
while it runs. This is the defense against the "ghost client" class of bugs where a fresh native
client gets adopted and signs the user out.

**Tunables**: the constants at the top of `nativeClientSync.tsx` (token-cache read timeout,
device-token availability timeout, 401 recovery cooldown, configuration retry count, bootstrap
timeout) each encode a fixed production race; current values live in the file. Two are load-bearing
enough to call out: the bootstrap timeout is deliberately much longer on Android than iOS, and the
401 cooldown resets when the device token rotates. Read the git blame / linked PR before touching
one.
