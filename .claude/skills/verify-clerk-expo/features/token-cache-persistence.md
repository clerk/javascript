# Token cache persistence

A signed-in user who closes and reopens the app is still signed in, because the client token survived in storage. The test app links `@clerk/expo-native-components`, so `ClerkProvider` reads the client token from the native SDK's device token and mirrors it to `@clerk/expo`'s token cache in secure storage (`packages/expo/src/provider/nativeClientSync.ts`).

## Sub-features

- `relaunch` restores the same user and the same session after a cold relaunch with no ticket.
- `kept-token` shows that the token cache in secure storage held the client token when the app started.
- `new-scope` starts signed out when storage was cleared, which proves the restore came from storage.

## How to get to it (user POV)

- Sign in, close the app, and open it again. The home shows the same user and session ID. Tap `Token cache` on the home. That screen says whether the token cache held a client token when the app started.

## Driving it with verify

Preconditions:

- The spec seeds a `+clerk_test` user and signs in with a ticket on the first launch.

- **Relaunch.** Run `integration/expo-native/bin/control-clerk-expo run token-cache-persistence --platform android` (or `ios`). The spec launches signed in and reads the session ID on the home. It relaunches with `keepStorage: true` and no ticket, and expects the home to show the same user and the same session ID. Screenshot `restored-home-after-relaunch`.
- **Kept token.** On that relaunched home the test taps `Token cache` and expects `client token kept from the last launch: yes` and `user: <the seeded user ID>`. Screenshot `token-cache`.
- **New scope.** The same test relaunches with a new storage scope, taps `Token cache` on the signed-out home, and expects `client token kept from the last launch: no` and `user: none`. Screenshot `new-scope`.
- **Proof.** `screenshots/restored-home-after-relaunch.png` shows the user and the session after a launch that had no ticket, and `screenshots/token-cache.png` shows the kept token.

## Gotchas

- `keepStorage: true` reuses the previous launch's `verifyStorageScope`. Without it, the test app clears Clerk's stored client on launch, so the relaunch would start signed out.
- When the scope changes, the test app clears more than Clerk's own storage. On iOS it clears every generic-password keychain item the test app owns, and the UserDefaults keys in which clerk-ios remembers the last identifier the start screen used. On Android it deletes the `clerk_preferences` and `SecureStore` SharedPreferences files, so every `expo-secure-store` item goes.
- The home alone does not prove the token cache. The JS client restores from the native device token, so the home would look the same if only native storage kept the token. The `Token cache` screen shows whether the copy in secure storage held the client token at launch.
- The test app reads the cache once, when the app starts and before Clerk has loaded, and the `Token cache` screen shows that answer whenever the home opens it. Do not read the cache again after Clerk loads. A signed-out client stores a client token of its own by then, so the text would say `yes` on a new scope.
- A launch with no `signedInAs` that keeps storage needs `landsOn`, because only the spec knows that it expects a signed-in home.
