# User button and profile

A signed-in user opens the native profile from the native UserButton or from a screen that shows UserProfileView, and sees their own account.

## Sub-features

- `profile` shows the native UserProfileView for the signed-in user, and `Manage account` lists the user's email.
- `user-button` opens the profile from the native UserButton.

## How to get to it (user POV)

- Launch a screen whose root is UserProfileView (`verifyScreen userProfile`).
- Tap the avatar UserButton (`verifyScreen userButton`).

## Driving it with verify

Preconditions:

- The spec seeds a `+clerk_test` user on `with-email-codes` and signs in with a ticket (`host.launch({ signedInAs })`).

- **Profile.** Run `bin/verify run user-button-and-profile --platform ios`, and again with `--platform android`. The first test launches `screen: 'userProfile'`, checks `userId` and `sessionStatus` `active`, expects `Manage account`, taps it, and expects the user's email. Screenshot `profile`.
- **User button.** The second test launches `screen: 'userButton'`, taps the UserButton, and expects `Manage account`. Both tests pass on iOS and Android. Screenshot `user-button-profile`.
- **Proof.** `states.jsonl` holds the seeded user's id for each test, and `screenshots/profile.png` shows the email.

## Gotchas

- The UserButton is `clerk.userButton.profile` on iOS and the accessibility label `Open user profile` on Android (`nativeUserButton` in `specs/native.ts`).
- Profile rows have no stable identifier on Android, and the iOS rows are inside a sheet, so the specs find them by text (`Manage account`, `Sign out`).
- A seeded user has no name, so the profile header shows only the avatar. The email appears under `Manage account`.
- The Security screen lists active devices with this Mac's public IP address and city. Do not screenshot it, and keep it out of videos attached to a public PR.
- `state.screen` reads `launching` while the ticket sign-in runs. `host.launch` waits for `ticket` `succeeded` before it returns.
