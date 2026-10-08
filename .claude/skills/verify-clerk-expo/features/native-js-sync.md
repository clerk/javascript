# Native and JS session sync

A session change in the native UI reaches the `@clerk/expo` JS hooks, and a session started in JS reaches the native views.

## Sub-features

- `native-sign-out` signs out from the native profile, and `useAuth`, `useUser`, and `useSession` report signed out.
- `native-sign-in` signs in with a password in the AuthView that the home opened, and the three hooks report the user and a session. The same session is back after a relaunch.
- `second-native-sign-in` signs in natively, signs out in the native profile, and signs in natively again in the same process, and the hooks report the user again.
- `js-sign-in` signs in with a ticket through `useSignIn`, and the native profile shows the same user. `user-button-and-profile/profile` proves it.
- `js-sign-out` signs out through `useAuth().signOut()`, and the home shows no user and no session. The second test of `user-button-and-profile/profile` proves it.

## How to get to it (user POV)

- Tap the UserButton on the home, then tap `Sign out` in the native profile.
- Tap `Sign in` on the home, type the email address, tap Continue, type the password, and tap Continue.

## Driving it with verify

Preconditions:

- Each spec seeds a `+clerk_test` user. The sign-out spec starts signed in through a ticket, because it tests no sign-in. The sign-in spec starts signed out and signs in through the real form.

- **Native sign-out.** Run `integration/expo-native/bin/control-clerk-expo run native-js-sync/sign-out-from-native --platform ios`, and again with `--platform android`. The spec launches signed in, taps the UserButton, taps `Sign out` in the profile, and calls `host.expectSignedOut`. That waits for the home to show `Signed out` (from `useAuth`), with no `Signed in as` text and no user ID (from `useUser`) and no session ID (from `useSession`). Screenshots `before-sign-out` and `signed-out`.
- **Native sign-in.** Run `integration/expo-native/bin/control-clerk-expo run native-js-sync/sign-in-from-native --platform ios`, and again with `--platform android`. Both tests seed a user with `host.seedUser({ password: true })`, tap `Sign in` on the home, and sign in with `signInWithPassword` from `specs/native.ts`. The first test expects the home to show the user and a session ID, relaunches with `keepStorage`, and expects the same user and the same session ID. Screenshots `signed-in` and `restored-home`. The second test signs out with the profile's `Sign out` row, signs in again, and expects the home to show the user. Screenshot `signed-in-again`.
- **Proof.** `screenshots/signed-out.png` shows the home with `Signed out` and the `Sign in` button. The native profile closes by itself, because the UserButton that presented it leaves the home.

## Gotchas

- The `Sign out` row is at the bottom of the profile. On a small simulator it can be below the fold. The devices the CLI leases show it without scrolling.
- A seeded password user is created with `bypass_client_trust`, so the password is the only step of the sign-in.
- AuthView remembers the last identifier. When it opens a second time in one process the email field is already filled, on iOS and Android, and on iOS `clerk.auth.start.identifier` then matches two nodes. `reachPasswordScreen` in `specs/native.ts` types the email only when the field does not show it.
- The password field has no identifier of its own on Android, and on iOS three nodes share `clerk.auth.signIn.password`. The spec fills the last text field on the password screen.
- After a password sign-in iOS can offer to save the password, and `host.expectSignedInAs` declines. On Android the Google Password Manager can offer the same, and `signInWithPassword` declines.
- A sign-out that only clears the native session leaves the user or the session on the home. `host.expectSignedOut` then fails and says what the home shows. That is the bug this feature guards against.
- Each part of the home reads its own hook, so do not merge them. If the home took the session ID from `useAuth`, a stale `useSession` would pass unseen.
