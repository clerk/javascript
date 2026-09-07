# iOS shared runtime

`ClerkProvider` creates one Clerk.js instance in Hermes. Native Clerk UI forwards operations to that instance through the `clerkRuntimeOperation` event. The JS adapter resolves resources, executes authentication logic, serializes results, and publishes versioned client and environment snapshots. ClerkKit persists and projects those snapshots before native operations return.

The native module supplies Keychain storage, cryptographic primitives, passkeys, Apple authentication, biometric credentials, and App Attest. It does not configure an embedded JavaScriptCore client or fetch Clerk resources. Expo retains ownership of its token cache and initial resource loading. Foreground recovery refreshes the existing JS instance. Disposing a native connection removes its listeners and hooks without clearing the JS client's token cache.

Each connection has a runtime ID. Native operation requests include the current client and session IDs; JS rejects stale requests before invoking a resource method. Snapshot revisions are monotonic within a connection. Reconfiguration, cancellation, or module destruction invalidates pending native calls. Requests have a 120-second response deadline and are not replayed automatically.

## Local SDK development

This integration requires ClerkKit's `ClerkExpo` runtime SPI. Until the matching iOS SDK is released and the podspec version is updated, select the local iOS checkout when installing pods:

```sh
CLERK_IOS_SDK_PATH=/absolute/path/to/clerk-ios bundle exec pod install
```

React Native's SPM integration recognizes the existing local package path. Rebuild the native application after changing the Swift SDK or module. The iOS-only adapter replaces the previous two-way client synchronization; Android JS authentication remains available, and Android native components require a follow-up adapter.

The JS adapter implementation lives in `packages/clerk-js/src/embedded`, and the native module connection is in `ClerkExternalRuntime.swift`. Changes to the operation protocol must be coordinated with ClerkKit's runtime SPI and tested against the same source revisions.
