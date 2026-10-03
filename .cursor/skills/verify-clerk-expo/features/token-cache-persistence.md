# Token cache persistence

A signed-in user who closes and reopens the app is still signed in, because `@clerk/expo`'s token cache restored the client from secure storage.

## Sub-features

- `relaunch` restores the session after a cold relaunch with no ticket.
- `new-scope` starts signed out when storage was cleared, which proves the restore came from storage.

## How to get to it (user POV)

- Sign in, close the app, and open it again. The `tokenCache` screen shows whether a client token is stored.

## Driving it with verify

Preconditions:

- The spec seeds a `+clerk_test` user and signs in with a ticket on the first launch.

- **Relaunch.** Run `.cursor/skills/verify-clerk-expo/bin/control-clerk-expo run token-cache-persistence --platform android` (or `ios`). The spec launches `screen: 'tokenCache'` signed in, relaunches with `keepStorage: true` and no ticket, waits for `signedIn` true with the same `userId` and `ticket` `none`, and expects `stored client token: present`. Screenshot `token-cache`.
- **New scope.** The same test relaunches with a new storage scope and expects `stored client token: absent` and `signedIn` false.
- **Proof.** `states.jsonl` holds the relaunch state with `ticket` `none` and the seeded `userId`.

## Gotchas

- `keepStorage: true` reuses the previous launch's `verifyStorageScope`. Without it, the host clears Clerk's stored client on launch, so the relaunch would start signed out.
- On iOS the host clears every generic-password keychain item the fixture owns when the scope changes, not only Clerk's.
