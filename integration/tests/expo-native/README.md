# Expo native e2e

Drives the `@clerk/expo` native components (`AuthView`, `UserButton`,
`UserProfileView`) on a real simulator or emulator, through
[touchpress](https://github.com/wobsoriano/touchpress) on the Playwright runner.
Every spec asserts across the native-to-JS bridge: a sign-in completed by the
native SDK has to show up in `useAuth()`, and a JS sign-out has to reach the
native side.

The app under test is the fixture in `integration/templates/expo-native`.

## Running it

You need a booted device, the fixture installed on it, and a test user.

```sh
# iOS
xcrun simctl install booted \
  integration/templates/expo-native/ios/build/Build/Products/Release-iphonesimulator/ClerkExpoNativeBuildFixture.app

# Android
adb install -r integration/templates/expo-native/android/app/build/outputs/apk/release/app-release.apk
```

```sh
export CLERK_TEST_EMAIL=... CLERK_TEST_PASSWORD=...
pnpm test:integration:expo-native --project=ios
pnpm test:integration:expo-native --project=android
```

One booted device per platform. The config names no device, so it takes the one
that is booted; set `E2E_DEVICE_NAME` if you keep several running. `preflight`
fails in about a second when nothing is booted, rather than once per spec.

## Writing a spec

`flows.ts` holds what every spec shares: `openApp`, `signInWithEmailPassword`,
`expectSignedIn`, `expectSignedOut`, and `tapControl`. Import `test` and `expect`
from there rather than from `touchpress`, so the spec gets the `control` fixture.

Selectors are English text and accessibility labels, because clerk-android ships
no test identifiers and both native SDKs localize every string. The devices have
to run the `en` locale.

Two rules the tree enforces, both explained where they are implemented:

- Match whole strings on anything near an icon or a heading. `getByText` is a
  substring match, and `'Security'` also finds the image labelled
  `icon-security`.
- Tap Clerk's own buttons through `tapControl`, which is a whole-string text tap.
  Jetpack Compose puts the label on a container beside an unlabeled button, and
  touchpress retargets onto it. The report shows that as `retarget to @eNN`.

Clearing state, going back, and typing into a focused field are `device`
methods. `clearState` relaunches and waits for the ready gate itself, and
`clearKeychain` is separate because the simulator keychain belongs to every app
on it, so `openApp` calls it first.

## When a spec fails

The failure message carries the locator, what was expected, the names closest to
it on screen, and the whole accessibility tree. Read that before changing a
selector, and never add a sleep. CI uploads the HTML report, which carries a
screenshot and a tree listing per failed test, as `expo-native-e2e-<platform>`.
