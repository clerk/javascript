# Update required

An instance sets a minimum version for an app. A build below it can't use Clerk: `<ClerkProvider>` covers the app with an update screen that shows the build's version and links to the App Store or Google Play. Users stay signed in, so they continue where they left off once the build is allowed again.

## Sub-features

- `signed-in` covers a signed-in user's app with the update screen on a build below the minimum, showing `Your version` and the store button, plus `Required` on iOS. Lowering the minimum returns the same user and session.
- `signed-out` covers a signed-out user's app with the update screen too.
- `at-the-minimum` leaves a build at the minimum to open as usual.

## How to get to it (user POV)

- A developer sets a minimum on the Clerk Dashboard's `Native applications` page, then a user opens a build below it.

## Driving it with verify

Preconditions:

- The native app settings are off the standard settings, so each test calls `host.useMinimumAppVersion({ minimumVersion, updateUrl })`. It registers `com.clerk.exponativebuildfixture` with the application, sets the minimum, and waits for the public environment to show it. When the test ends, the CLI removes the minimum and leaves the registration.
- Clerk's `native_app_force_update` flag must be on for the instance. It's on globally, and with it off the call fails.
- The test app installs `expo-application` (`EXPO_PACKAGES` in `src/fixture.ts`), so `@clerk/expo` can read its version. Its `version` is `1.0.0` in `app.json`, and its Android version code is Expo's default of `1`. A minimum is a version on iOS and a whole version code on Android, so the spec blocks it with `2.0` and `2`.

- **Signed in.** Run `integration/expo-native/bin/control-clerk-expo run update-required --platform ios --grep "signed-in user"` (or `android`). The spec signs in with a ticket, sets the minimum above the build, and relaunches with `keepStorage: true`. It expects `1.0.0` and the store button (screenshot `update-required`). It then lowers the minimum to the build's version, relaunches, and expects the same user and session ID on the home (screenshot `signed-in-after-lowering`).
- **Signed out.** Run `integration/expo-native/bin/control-clerk-expo run update-required --platform ios --grep "signed-out user"` (or `android`). The spec sets the minimum before the first launch, then expects the update screen and `1.0.0` (screenshot `update-required-signed-out`).
- **At the minimum.** Run `integration/expo-native/bin/control-clerk-expo run update-required --platform ios --grep "at the minimum"` (or `android`). The spec sets the minimum to the build's version, signs in with a ticket, and expects the signed-in home with no update screen.
- **Proof.** `specs/features/update-required/update-required.e2e.ts` passes on each platform. The video shows the update screen, then the home with the same user and session ID.

## States a spec cannot reach

| State                                        | Where the app decides                                                           | What it takes                                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Can't update? Get help`                     | `UpdateRequiredView.tsx`, from `getUpdateRequiredDisplay`                       | A support email on the instance. The Platform API config has no leaf for it, so a spec cannot set one                       |
| The screen with no store button              | `UpdateRequiredView.tsx`, when `status.updateUrl` is empty                      | A minimum with no update URL. Clerk requires one (`validateNativeAppMinimum` in clerk_go), so only a local patch reaches it |
| An app's own screen instead of Clerk's       | `ClerkProvider.tsx`, `updateRequiredViewEnabled`                                | That prop set to `false` in the test app, and a screen that reads `useAppVersionSupport()`                                  |
| The native clerk-ios or clerk-android screen | `@clerk/expo` falls back to it when the app does not install `expo-application` | A build of the test app without `expo-application`, which this spec no longer uses                                          |

## Gotchas

- The version box differs by platform. iOS shows `Your version` and `Required`, and groups each label and value into one element, so the spec uses `getByLabel('Your version, 1.0.0')`. Android shows only `Your version`, as two text nodes, so the spec uses `getByText('1.0.0')`.
- The store button opens an outside app, so the spec checks that it shows and does not tap it.
- The screen has no test IDs, so the spec finds it by its text. A change to that wording changes the spec.
- A minimum applies to the next request or launch. The spec relaunches instead of waiting for a running app to foreground.
- The subtitle names the application, which here is the `verify-throwaway-...` name. Don't assert on it.
- A launch that the update screen covers needs `landsOn`, because the home isn't on screen.
