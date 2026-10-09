# Native AuthView

A signed-out user sees the native AuthView (SwiftUI from clerk-ios on iOS, Compose from clerk-android on Android) inside the Expo app, starts sign-in with an email address, and can close the view to get back to the JS screen. An app can give the view a React Native logo.

## Sub-features

- `opens` shows the AuthView start screen as the root of the window from the home's `Sign in full screen` button, once `useAuthViewState().isLoaded` is true, on iOS and Android.
- `opens-from-home` opens AuthView in a modal from the home's `Sign in` button, on iOS and Android.
- `close-modal` closes the AuthView that the home opened, with the close button on iOS and the back button on Android, and the home is back.
- `logo` shows a React Native view as the logo of AuthView, and shows it again after AuthView closes and reopens, on iOS and Android.
- `logo-sign-in` signs in with a password through the AuthView that has the logo, after it closed and reopened, on iOS and Android.
- `dismiss` closes a full-screen AuthView with its close button and returns to the home (iOS).
- `complete` moves an existing user from the identifier field to the email code screen, accepts the test code, and signs the user in, so the home shows the user and the session (iOS).

## How to get to it (user POV)

- On the signed-out home, tap `Sign in` (AuthView in a modal), `Sign in with a logo` (the same modal with a React Native logo), `Sign in full screen` (AuthView with no close button), or `Sign in full screen with a close button`.
- Type the email address and tap Continue. On the standard settings the first factor is an email link, so tap `Use another method`, then `Email code to <address>`.

## Driving it with verify

Preconditions:

- `integration/expo-native/bin/control-clerk-expo doctor --platform <ios|android>` passes apart from `build`.
- `up` has created the worktree's throwaway Clerk application. The sign-in specs seed their own `+clerk_test` user.

- **Opens.** Run `integration/expo-native/bin/control-clerk-expo run native-auth-view/opens --platform ios`, and again with `--platform android`. The first test taps `Sign in full screen` on the home and expects the identifier field, and on iOS no close button. The test app shows its spinner in place of that AuthView until `useAuthViewState().isLoaded` is true, so the field on screen proves the flag. Screenshot `auth-full-screen`.
- **Opens from the home and closes.** The second test expects the home to be signed out, taps `Sign in`, and expects the identifier field. Screenshot `auth-from-home`. It then closes AuthView with `closeNativeAuth` from `specs/native.ts`, and expects the home to show `Signed out` and the `Sign in` button, with no identifier field left. Screenshot `closed-modal`.
- **Logo.** Run `integration/expo-native/bin/control-clerk-expo run native-auth-view/logo --platform ios`, and again with `--platform android`. It seeds a user with a password, taps `Sign in with a logo` on the home, expects the text `E2E Custom Logo` above the identifier field, closes AuthView, expects the logo to be gone, opens AuthView again, and expects the logo again. Screenshots `logo` and `logo-reopened`. It then signs in with `signInWithPassword` from `specs/native.ts`, and expects the home to show the user. Screenshot `signed-in-with-logo`.
- **Dismiss.** The third test in `opens.e2e.ts` (iOS only) taps `Sign in full screen with a close button` on the home, taps `clerk.dismissButton`, and expects the home to show `Signed out` and the `Sign in` button. While nobody is signed in, the test app shows the home again only when `onDismiss` fires. Screenshot `dismissed-home`.
- **Request the code.** Run `integration/expo-native/bin/control-clerk-expo run native-auth-view/complete` (iOS only). It taps `Sign in full screen`, AuthView with no close button, so nothing can dismiss the form mid-spec. The spec fills `clerk.auth.start.identifier`, taps `clerk.auth.start.continue`, waits for `Use another method`, taps it and `clerk.auth.signIn.alternativeMethod.email_code`, and expects `clerk.auth.signIn.code` and the user's email on the code screen. Screenshot `code-screen`.
- **Enter the code.** The spec then types `CLERK_TEST_CODE`, and `host.expectSignedInAs(user)` waits for the home to show the user's email, the seeded user ID, and a session ID. Screenshot `signed-in`.
- **Proof.** The run directory holds `video.mp4` and `screenshots/auth-full-screen.png`, which shows AuthView with the whole window.

## Gotchas

- On iOS a full-screen AuthView renders inline, where SwiftUI's `dismiss` has no effect, so `@clerk/expo` calls `onDismiss` from the close button itself. The `dismiss` test covers that. The close button of the AuthView in the modal goes through the modal's own dismissal, which `close-modal` covers.
- clerk-ios AuthView remembers the last identifier in UserDefaults. The test app clears it on every new storage scope, so the field starts empty. A prefilled field shows as two `clerk.auth.start.identifier` nodes (label and textbox) and fails a locator with `LOCATOR_AMBIGUOUS`. If that happens, the test app's scope clearing regressed.
- `@clerk/expo` ships the clerk-ios release pinned in `packages/expo/ios/ClerkExpo.podspec`, so iOS has the `clerk.auth.*` identifiers. The clerk-android release it pins has no test tags yet, so Android specs find AuthView by its text (`Enter your email or username`, `Continue`). Replace them with `getByTestId` after a clerk-android release with tags lands in `@clerk/expo`.
- The test app puts nothing above, below, or over AuthView. On iOS the screen tree leaves out what a modal covers, so the home's nodes are not in the tree while the modal AuthView is up.
- On Android, an AuthView that can be dismissed shows a close button with the label `Close`, and `Sign in full screen` shows none. No spec taps that button. The back button closes the AuthView that the home opened.
- The `complete` spec is iOS only. On Android, with the clerk-android 1.1.11 that `@clerk/expo` pins, the `Email code to <address>` row under `Use another method` leads to the email link screen (`Open email app`), which has no code field. The Android sign-in through AuthView is `native-js-sync/sign-in-from-native`, which uses a password.
- Close the modal AuthView with `closeNativeAuth` from `specs/native.ts`. On iOS one tap on the close button can do nothing, and `closeNativeAuth` taps the button once more when it is still on screen three seconds after the first tap.
- The logo is a React Native view that AuthView hosts. The spec finds it by its text on both platforms.
