# User button and profile

A signed-in user opens the native profile from the native UserButton, sees their own account, and can sign out from the app's own button. An app can also render the profile inline, add a page of its own to it, and close it from the profile's Back button.

## Sub-features

- `user-button` opens the native profile from the UserButton on the home.
- `profile` shows the profile of the signed-in user, and `Manage account` lists the user's email.
- `home-sign-out` ends the session with the home's `Sign out` button, which calls `useAuth().signOut()`.
- `embedded-profile` renders UserProfileView inline with `isDismissible={false}`. The Back button pops a screen inside the profile, and on the root of the profile it calls `onHostBack`, which shows the home.
- `custom-page` adds a row to the profile with `customPages`, and the row opens a page with React Native content.

## How to get to it (user POV)

- Tap the avatar UserButton on the signed-in home.
- Tap `Sign out` on the home.
- Tap `Embedded profile` on the signed-in home. The profile is the root of the window.

## Driving it with verify

Preconditions:

- The spec seeds a `+clerk_test` user and signs in with a ticket (`host.launch({ signedInAs })`).

- **User button and profile.** Run `.claude/skills/verify-clerk-expo/bin/control-clerk-expo run user-button-and-profile --platform ios`, and again with `--platform android`. The first test launches signed in. The launch lands on the home only when it shows the seeded user's email and user ID and a session ID. The test taps the UserButton, expects `Manage account`, taps it, and expects the user's email. Screenshots `user-button-profile` and `profile`.
- **Home sign-out.** The second test launches signed in, taps `Sign out`, and expects the home to show `Signed out`, no user ID, no session ID, and the `Sign in` button. Screenshot `signed-out`.
- **Embedded profile and `onHostBack`.** Run `.claude/skills/verify-clerk-expo/bin/control-clerk-expo run user-button-and-profile/embedded-profile --platform ios`, and again with `--platform android`. The first test launches signed in, taps `Embedded profile` on the home, and expects `Manage account`. It taps `Manage account`, expects the user's email, taps Back, and expects the root of the profile. It taps Back again and expects the home to show the same user, with no profile left. Screenshots `embedded-profile` and `closed-home`.
- **Custom page.** The second test taps the `E2E Custom Page` row and expects the text `Rehosted RN body`. It leaves the page with Back on iOS and the device's back button on Android, expects the root of the profile, taps Back, and expects the home.
- **Proof.** `screenshots/profile.png` shows the email in the native profile, and the video shows the home with the same email before the tap. The video of the embedded profile run shows the custom page. All four tests pass on iOS and Android.

## Gotchas

- The UserButton is `clerk.userButton.profile` on iOS and the accessibility label `Open user profile` on Android (`nativeUserButton` in `specs/native.ts`).
- Profile rows have no stable identifier on Android, and the iOS rows are inside a sheet, so the specs find them by text (`Manage account`, `Sign out`).
- A seeded user has no name, so the profile header shows only the avatar. The email appears under `Manage account`.
- Open the profile from the UserButton, as a user does. The `embeddedProfile` screen is for what only an inline UserProfileView has: `onHostBack` and custom pages.
- Tap the profile's Back button with `tapProfileBack` from `specs/native.ts`, which taps the middle of its frame. On Android the label `Back` is on a group that holds the button, and `locator.tap()` on it fails with "no parent-owned touch point".
- Do not call `host.screenshot` while a custom page is on screen. On iOS the Back button of the page then does nothing. The video shows the page.
- The test app shows a spinner while the ticket sign-in runs, and `host.launch` waits for the home.
