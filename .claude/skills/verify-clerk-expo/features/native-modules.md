# Native modules

An app that uses `useSignInWithGoogle` from `@clerk/expo/google` or `useBiometricCredentials` from `@clerk/expo/biometrics` gets an answer that comes from native code. The Google hook opens the native Google sign-in of `@clerk/expo-google-signin`, and a user who cancels it is left signed out with no error. The biometrics hook reports what the native module of `@clerk/expo-biometrics` found on the device.

## Sub-features

- `google-sign-in` starts the Google flow with `startGoogleAuthenticationFlow()` and cancels it. The hook configures the native module with the test app's placeholder client IDs and calls its `presentExplicitSignIn`. On iOS the system asks whether the app may use `accounts.google.com` to sign in. On Android Google Play services opens a page of its own. Cancelling resolves the hook with no session.
- `biometric-availability` asks `getAvailability()` whether a biometric credential on this device can sign in. With biometric sign-in on for the instance, the hook calls the native `getAvailability` and shows the reason that follows from its answer.

## How to get to it (user POV)

- Tap `Native modules` on the signed-out home.
- Tap `Sign in with Google`, then cancel what opens. On iOS that is `Cancel` on the system prompt. On Android it is `Skip` where Google's page offers it, and the back button otherwise. `Google sign-in was cancelled` shows under the button.
- Tap `Check biometric availability`. The result shows as text under the button.

## Driving it with verify

Preconditions:

- `up` has built the test app. The build links `@clerk/expo-google-signin` and `@clerk/expo-biometrics` from the workspace. The test app's `app.json` lists the `@clerk/expo-google-signin` config plugin and holds three placeholder values under `extra`: a web client ID, an iOS client ID, and the iOS URL scheme that the plugin registers. They belong to no Google project.
- `specs/golden/native-modules/biometric-availability.settings.json` turns biometric sign-in on for the instance (`auth_biometric.used_for_sign_in`), and `run` applies it before the test of that spec file. The Google spec file runs on the standard settings, so a run of both has two settings groups.

- **Google sign-in.** Run `.claude/skills/verify-clerk-expo/bin/control-clerk-expo run native-modules/google-sign-in --platform ios`, and again with `--platform android`. The test taps `Native modules` on the home and taps `google-sign-in-button`. On iOS it waits for the system prompt that names `accounts.google.com` and dismisses it with `device.alert('dismiss')`. On Android it waits until Google's page covers the test app's button, then taps `Skip` when the page has one and presses back when it does not, until the test app is on screen again. It then expects `google-result` to say `Google sign-in was cancelled`. Screenshots `google-system-prompt` on iOS, then `google-cancelled`.
- **Biometric availability.** Run `run native-modules/biometric-availability` on each platform. The test opens the same screen, taps `biometric-availability-button`, and expects `biometric-availability-result` to say `biometric availability: biometric_authentication_unavailable` on iOS and `biometric availability: no_local_credential` on Android. Screenshot `biometric-availability`.
- **Proof.** Each screenshot shows the result text under its button. Both tests pass on iOS and Android.

## Gotchas

- Neither test signs anyone in. No Google account and no enrolled biometric is involved, and the Google test never loads a Google sign-in form. On iOS it cancels at the system prompt, before any page loads.
- The Google test fails when the native module is not linked, because the hook then throws `ClerkGoogleSignIn native module is not available` and nothing opens. It also fails when the plugin did not register the URL scheme. Google's iOS SDK then raises an exception and the app stops.
- The Google test proves that the hook reaches the native module and that the module opens Google's sign-in and reports a cancel. It does not prove that a Google account can sign in, or anything about the ID token and the Clerk sign-in that follow.
- On Android, what Google Play services shows on an emulator with no Google account differs between images: an account page that the back button cancels, or a "Sign in with ease" page with `Skip` and `Next` that the back button does not cancel. The test asserts on none of Google's text. It leaves whichever page is up and asserts only the test app's result.
- The two biometric answers come from native code. On an iOS simulator the native module reports no Secure Enclave, so the hook answers `biometric_authentication_unavailable`. An Android emulator has key storage, so the hook goes on to the native list of stored credentials, finds none, and answers `no_local_credential`. With the standard settings the hook would answer `feature_disabled` from JS, and the test would fail.
- Neither answer changes when a biometric is enrolled on the device. Enrollment matters only once a credential is stored, and no test stores one. An iOS simulator cannot create the key, and an Android emulator would need a fingerprint and a screen lock set up in each run.
- The buttons and their results have the testIDs `google-sign-in-button`, `google-result`, `biometric-availability-button`, and `biometric-availability-result`, without the `verify.` prefix of the test app's other screens.
- A result that starts with `Google sign-in failed:` or `biometric availability failed:` means the call threw, and the test fails on it.
