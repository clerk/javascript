# Native and JS session sync

A session change in the native UI reaches the `@clerk/expo` JS hooks, and a session started in JS reaches the native views.

## Sub-features

- `native-sign-out` signs out from the native UserProfileView, and `useAuth` and `useUser` report signed out.
- `js-sign-in` signs in with a ticket through `useSignIn`, and the native profile shows the same user. `user-button-and-profile/profile` proves it.

## How to get to it (user POV)

- Open the native profile (`verifyScreen userProfile`) and tap `Sign out`.

## Driving it with verify

Preconditions:

- The spec seeds a `+clerk_test` user and signs in with a ticket.

- **Native sign-out.** Run `bin/verify run native-js-sync --platform ios`. The spec launches `screen: 'userProfile'`, taps `Sign out`, and waits for `signedIn` false with `userId` and `sessionId` null. Those fields come from the JS hooks. Screenshots `before-sign-out` and `signed-out`.
- **Proof.** `states.jsonl` shows the seeded `userId` then `signedIn` false in the same launch.

## Gotchas

- The `Sign out` row is at the bottom of the profile. On a small simulator it can be below the fold. The lane simulator shows it without scrolling.
- A sign-out that only clears the native session leaves `signedIn` true in JS. That is the bug this feature guards against.
