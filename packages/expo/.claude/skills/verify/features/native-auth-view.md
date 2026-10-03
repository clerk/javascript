# Native AuthView

A signed-out user sees the native AuthView (SwiftUI from clerk-ios on iOS, Compose from clerk-android on Android) inside the Expo app, starts sign-in with an email address, and can dismiss the view back to the JS screen.

## Sub-features

- `opens` shows the AuthView start screen as soon as the `nativeAuth` screen mounts, on iOS and Android.
- `dismiss` closes the dismissible AuthView and returns to the JS home screen (iOS).
- `request-code` moves an existing user from the identifier field to the email code screen (iOS).
- `complete` accepts the test code and signs the user in, so the JS hooks report the session (iOS, `form-entry`).

## How to get to it (user POV)

- Tap `Open native AuthView` on the fixture home screen, or launch straight into `verifyScreen nativeAuth` (dismissible) or `verifyScreen auth` (inline, not dismissible).
- Type the email address and tap Continue. On `with-email-codes` the first factor is an email link, so tap `Use another method`, then `Email code`.

## Driving it with verify

Preconditions:

- `bin/verify doctor --platform <ios|android>` passes apart from `build`.
- `with-email-codes` keys are present. The sign-in specs seed their own `+clerk_test` user.

- **Opens.** Run `bin/verify run native-auth-view/opens --platform ios`, and again with `--platform android`. The first test launches `screen: 'nativeAuth'`, expects the identifier field, and waits for `extra.authViewLoaded` true with `lastError` null. Screenshot `native-auth`.
- **Dismiss.** The second test in `opens.e2e.ts` (iOS only, tag `known-bug`) taps `clerk.dismissButton` and waits for `state.screen` `home` and the `open-auth-view-button` testID. Screenshot `dismissed-home`. It fails today: see Gotchas.
- **Request the code.** Run `bin/verify run native-auth-view/request-code`. The spec fills `clerk.auth.start.identifier`, taps `clerk.auth.start.continue`, waits for `signInStatus` `needs_first_factor`, taps `Use another method` and `clerk.auth.signIn.alternativeMethod.email_code`, and expects `clerk.auth.signIn.code`. Screenshot `code-screen`.
- **Enter the code.** Run `bin/verify run native-auth-view/complete` (tag `form-entry`). It types `CLERK_TEST_CODE` and waits for `signedIn` true, `sessionStatus` `active`, and the seeded `userId`. Screenshots `code-screen` and `signed-in`.
- **Proof.** The run directory holds `video.mp4`, `screenshots/native-auth.png`, and `states.jsonl` with `screen` `nativeAuth` and `extra.authViewLoaded` true.

## Gotchas

- Known bug: on iOS, the close button of an inline dismissible AuthView does nothing, and `onDismiss` never fires. clerk-ios's close button calls SwiftUI's `dismiss`, which has no effect when the view is not presented. The `dismiss` test carries the `known-bug` tag until `@clerk/expo` fixes it. Remove the tag in the fix PR.
- clerk-ios AuthView remembers the last identifier in UserDefaults. The host clears it on every new storage scope, so the field starts empty. A prefilled field shows as two `clerk.auth.start.identifier` nodes (label and textbox) and fails a locator with `LOCATOR_AMBIGUOUS`. If that happens, the host's scope clearing regressed.

- `@clerk/expo` ships the clerk-ios release pinned in `packages/expo/ios/ClerkExpo.podspec`, so iOS has the `clerk.auth.*` identifiers. The clerk-android release it pins has no test tags yet, so Android specs find AuthView by its text (`Enter your email or username`, `Continue`). Replace them with `getByTestId` after a clerk-android release with tags lands in `@clerk/expo`.
- The `verify.state` footer stays readable under AuthView because the RN host renders it below the native view.
- AuthView controls on iOS 27 sit under a hittable `Toolbar` node. Use `host.tap` and `host.fill`, not `locator.tap()` and `locator.fill()`.
- On Android, `nativeAuth` is a full-screen Compose view with no close button. The dismiss and form specs are iOS only.
