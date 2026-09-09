# Expo shared-owner integration fixture

This app renders the real Expo provider and native UserProfileView together. It uses the installed Clerk packages and a deterministic service fixture for the reserved `native-core.clerk.accounts.dev` test domain. Other traffic is not intercepted. The fixture is not live authentication and contains no real credentials.

## Prepare

Use a disposable Expo SDK 57 app with React Native 0.86, React 19.2.8, and the locally built Clerk packages. Install the normal Expo Clerk peer dependencies and enable its native config plugin. Both native SDKs and the generated Expo projection must have the same contract hash. A source build does not establish that the unpublished prerelease coordinates resolve from a registry.

From the JavaScript repository, run:

```sh
node packages/expo/proofs/shared-owner/prepare.mjs /absolute/path/to/disposable-expo-app
```

This replaces the destination's index.js and the three named proof files. Set its package.json main to index.js. Build/install the native app against the current local SDK, start Metro, then launch the development app with that Metro endpoint. On iOS this fixture was run with the launch arguments `-RCT_jsLocation localhost:8088` because it does not include expo-dev-client.

## Exercise

1. Wait for Owner: same, Loaded: true, Signed in: true, and Engine: Hermes. The native account view and JavaScript hook both show Test User.
2. In the native Edit profile sheet, change the first name to Native and save. Both displays must show Native User; the JavaScript request log gains one /me mutation.
3. Press Rename from JavaScript. Both displays must show JavaScript User; the same owner remains selected.
4. Press the native Sign out action. The hook must settle at Loaded: true, Signed in: false, with no user or native account view. The owner must still be the same object.

Record the screen and retain the JavaScript request log, actual package hashes, native build commit, generated contract, engine, and platform. The on-screen owner identity and request counter are observable diagnostics; source inspection and transport tests separately establish that native views do not construct a second core.

The fixture follows FAPI's POST plus `_method` override for PATCH and DELETE. Environment responses contain no client credential. Returning a client credential from every environment response incorrectly creates parallel credential rotation during startup. Sign-out returns an empty client from /client/sessions; omitting that route produces a fixture error, not evidence of SDK sign-out behavior.

This journey proves state propagation and native UI invocation in a development app. It does not establish live service acceptance, old-major upgrades, physical-device prompt behavior, Android behavior, release latency, or memory budgets.
