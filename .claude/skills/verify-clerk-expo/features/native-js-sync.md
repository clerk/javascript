# Native and JS session sync

A session change in the native UI reaches the `@clerk/expo` JS hooks, and a session started in JS reaches the native views.

## Sub-features

- `native-sign-out` signs out from the native profile, and `useAuth`, `useUser`, and `useSession` report signed out.
- `native-sign-in` signs in with a password in the AuthView that the home opened, and the three hooks report the user and a session. The same session is back after a relaunch.
- `second-native-sign-in` signs in natively, signs out in the native profile, and signs in natively again in the same process, and the hooks report the user again.
- `client-fetch-failure` signs in natively while the JS client fetch that follows fails. One failed fetch still reaches the hooks, because the SDK retries it.
- `js-sign-in` signs in with a ticket through `useSignIn`, and the native profile shows the same user. `user-button-and-profile/profile` proves it.
- `js-sign-out` signs out through `useAuth().signOut()`, and the home shows no user and no session. The second test of `user-button-and-profile/profile` proves it.
- `offline-sign-out` signs out through `useAuth().signOut()` while the sign-out request fails, and the home shows `Signed out`. Another user then signs in natively on a single-session instance.

## How to get to it (user POV)

- Tap the UserButton on the home, then tap `Sign out` in the native profile.
- Tap `Sign in` on the home, type the email address, tap Continue, type the password, and tap Continue.

## Driving it with verify

Preconditions:

- Each spec seeds a `+clerk_test` user. The sign-out spec starts signed in through a ticket, because it tests no sign-in. The sign-in spec starts signed out and signs in through the real form.

- **Native sign-out.** Run `integration/expo-native/bin/control-clerk-expo run native-js-sync/sign-out-from-native --platform ios`, and again with `--platform android`. The spec launches signed in, taps the UserButton, taps `Sign out` in the profile, and calls `host.expectSignedOut`. That waits for the home to show `Signed out` (from `useAuth`), with no `Signed in as` text and no user ID (from `useUser`) and no session ID (from `useSession`). Screenshots `before-sign-out` and `signed-out-from-native`.
- **Native sign-in.** Run `integration/expo-native/bin/control-clerk-expo run native-js-sync/sign-in-from-native --platform ios`, and again with `--platform android`. Both tests seed a user with `host.seedUser({ password: true })`, tap `Sign in` on the home, and sign in with `signInWithPassword` from `specs/native.ts`. The first test expects the home to show the user and a session ID, relaunches with `keepStorage`, and expects the same user and the same session ID. Screenshots `signed-in-from-native` and `restored-home`. The second test signs out with the profile's `Sign out` row, signs in again, and expects the home to show the user. Screenshot `signed-in-again`.
- **Client fetch failure.** Run `integration/expo-native/bin/control-clerk-expo run native-js-sync/client-fetch-failure --platform ios`, and again with `--platform android`. The signed-out home of a verify launch has a `Drop the next client fetch` button (`verify.fault.dropClientFetch`). Each tap makes the next `GET /v1/client` of clerk-js fail with `Network request failed`, and `verify.fault.dropped` shows how many requests were dropped. The test taps it once, signs in with `signInWithPassword`, expects the home to show the user, and expects the count to read `1`, so the pass cannot come from a fetch that was never dropped. Screenshot `signed-in-after-one-failed-fetch`.
- **JS sign-in and sign-out.** `user-button-and-profile/profile` proves both. Run `integration/expo-native/bin/control-clerk-expo run user-button-and-profile/profile --platform ios`, and again with `--platform android`. The first test signs in with a ticket through `useSignIn` and expects the native profile's Manage account screen to show the user's email. The second test signs out with the home's `Sign out` button, which calls `useAuth().signOut()`, and `host.expectSignedOut` waits until the home shows no user and no session. Screenshots `user-button-profile`, `profile`, and `signed-out`.
- **Sign-out that never reaches Clerk.** Run `integration/expo-native/bin/control-clerk-expo run native-js-sync/offline-sign-out --platform ios`, and again with `--platform android`. The spec turns off multi-session mode, launches signed in through a ticket, taps `Drop the next sign-out request` (`verify.fault.dropSignOut`), and taps `Sign out`. The app's `fetch` then fails the `DELETE /v1/client/sessions` request as it fails offline, and `verify.fault.droppedSignOuts` counts it. The spec expects the home to show `Signed out`, then signs in as a second user with `signInWithPassword` and expects the home to show that user. Screenshot `signed-in-as-second-user`.
- **Proof.** `screenshots/signed-out-from-native.png` shows the home with `Signed out` and the `Sign in` button. The native profile closes by itself when the native user goes away. On iOS the native UserButton closes the profile it presented. On Android the UserProfileView dismisses itself, and the UserButton then hides it.

## Gotchas

- The drop hook is in `integration/templates/expo-native/verify/faults.ts` and runs only in a verify launch. It matches a GET whose path ends in `/v1/client` and nothing else, so tokens, touches, and the foreground app-version check (`GET /v1/`) pass. Arm it only where no other `GET /v1/client` can run before the sign-in, as on the signed-out home right after `host.launch`.

- The `Sign out` row is at the bottom of the profile. On a small simulator it can be below the fold. The devices the CLI leases show it without scrolling.
- A seeded password user is created with `bypass_client_trust`, so the password is the only step of the sign-in.
- AuthView remembers the last identifier. When it opens a second time in one process the email field is already filled, on iOS and Android, and on iOS `clerk.auth.start.identifier` then matches two nodes. `reachPasswordScreen` in `specs/native.ts` types the email only when the field does not show it.
- The password field has no identifier of its own on Android, and on iOS three nodes share `clerk.auth.signIn.password`. The spec fills the last text field on the password screen.
- After a password sign-in iOS can offer to save the password, and `host.expectSignedInAs` declines. On Android the Google Password Manager can offer the same, and `signInWithPassword` declines.
- A sign-out that only clears the native session leaves the user or the session on the home. `host.expectSignedOut` then fails and says what the home shows. That is the bug this feature guards against.
- clerk-js sends every request but a GET as a POST with `_method` in the query, so the sign-out request the fault drops is `POST /v1/client/sessions?_method=DELETE`.
- Without the fix, a failed sign-out request leaves the home on a spinner, because clerk-js clears its session before the request and throws when it fails. The device token still holds the live session, so a single-session instance refuses the next sign-in with `session_exists`.
- Each part of the home reads its own hook, so do not merge them. If the home took the session ID from `useAuth`, a stale `useSession` would pass unseen.
