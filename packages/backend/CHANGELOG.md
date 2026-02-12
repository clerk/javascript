# Change Log

## 2.31.0

### Minor Changes

- Add `providerUserId` field to `ExternalAccount` resource as the preferred way to access the unique user ID from the OAuth provider. The existing `externalId` field is now deprecated in favor of `providerUserId` for better clarity and consistency across the API. ([#7778](https://github.com/clerk/javascript/pull/7778)) by [@Jibaru](https://github.com/Jibaru)

- Add `createBulk()` method to `WaitlistEntryAPI` for bulk creating waitlist entries ([#7762](https://github.com/clerk/javascript/pull/7762)) by [@Jibaru](https://github.com/Jibaru)

### Patch Changes

- Updated dependencies [[`35bcbd1`](https://github.com/clerk/javascript/commit/35bcbd11f5753ee396cd090d3dd1848f3f2727e0)]:
  - @clerk/shared@3.45.0
  - @clerk/types@4.101.15

## 2.30.1

### Patch Changes

- Improved token type validation in authentication requests ([#7764](https://github.com/clerk/javascript/pull/7764)) by [@wobsoriano](https://github.com/wobsoriano)

## 2.30.0

### Minor Changes

- Add `lastSignInAtAfter` and `lastSignInAtBefore` filters to the Users API list and count endpoints. ([#7721](https://github.com/clerk/javascript/pull/7721)) by [@Jibaru](https://github.com/Jibaru)

  These parameters are supported by `users.getUserList()` and are forwarded to `/v1/users` and `/v1/users/count` to filter users by last sign-in timestamp.

### Patch Changes

- Fixed an issue where JWT OAuth access tokens where not treated as a machine token ([#7756](https://github.com/clerk/javascript/pull/7756)) by [@wobsoriano](https://github.com/wobsoriano)

## 2.29.7

### Patch Changes

- fix: correct `createInvitationBulk` return type to `Promise<Invitation[]>` ([#7702](https://github.com/clerk/javascript/pull/7702)) by [@jacekradko](https://github.com/jacekradko)

## 2.29.6

### Patch Changes

- Updated dependencies [[`64a35f7`](https://github.com/clerk/javascript/commit/64a35f79e9a49dfc140b4c8a8df517b74d46d6c6)]:
  - @clerk/shared@3.44.0
  - @clerk/types@4.101.14

## 2.29.5

### Patch Changes

- Updated dependencies [[`b7a4e1e`](https://github.com/clerk/javascript/commit/b7a4e1eabe7aa61e7d2cb7f27cbd22671c49f2b1)]:
  - @clerk/shared@3.43.2
  - @clerk/types@4.101.13

## 2.29.4

### Patch Changes

- Updated dependencies [[`e995cc3`](https://github.com/clerk/javascript/commit/e995cc3572f85aa47bdee8f7b56130a383488a7f)]:
  - @clerk/shared@3.43.1
  - @clerk/types@4.101.12

## 2.29.3

### Patch Changes

- Add optional `idToken` member to `OauthAccessToken` returned by `getUserOauthAccessToken`. The ID token is retrieved from OIDC providers and is only present for OIDC-compliant OAuth 2.0 providers when available. ([#7599](https://github.com/clerk/javascript/pull/7599)) by [@jfoshee](https://github.com/jfoshee)

- Updated dependencies [[`271ddeb`](https://github.com/clerk/javascript/commit/271ddeb0b47357f7da316eef389ae46b180c36da)]:
  - @clerk/shared@3.43.0
  - @clerk/types@4.101.11

## 2.29.2

### Patch Changes

- Fixed an issue when using multiple `acceptsToken` values in `authenticateRequest`. When `acceptsToken` is an array containing both session and machine token types (e.g., `['session_token', 'api_key']`), the function now correctly routes to the appropriate authentication handler based on the actual token type, instead of always treating them as machine tokens. ([#7556](https://github.com/clerk/javascript/pull/7556)) by [@wobsoriano](https://github.com/wobsoriano)

## 2.29.1

### Patch Changes

- Move cookie to devDependencies and bundle it within @clerk/backend to fix module compatibility problems in TanStack Start apps. ([#7545](https://github.com/clerk/javascript/pull/7545)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`a4e6932`](https://github.com/clerk/javascript/commit/a4e693262f734bfd3ab08ffac019168c874c2bd8)]:
  - @clerk/shared@3.42.0
  - @clerk/types@4.101.10

## 2.29.0

### Minor Changes

- Improves resilience by keeping users logged in when Clerk's origin is temporarily unavailable using edge-based token generation ([#7516](https://github.com/clerk/javascript/pull/7516)) by [@bratsos](https://github.com/bratsos)

### Patch Changes

- Updated dependencies [[`03dd374`](https://github.com/clerk/javascript/commit/03dd37458eedf59198dc3574e12030b217efcb41)]:
  - @clerk/shared@3.41.1
  - @clerk/types@4.101.9

## 2.28.0

### Minor Changes

- Dropping the `__experimental_` prefix from `setPasswordCompromised` and `unsetPasswordCompromised` and marking them as stable ([#7503](https://github.com/clerk/javascript/pull/7503)) by [@octoper](https://github.com/octoper)

### Patch Changes

- Renaming `__experimental_passwordCompromised` to `__experimental_setPasswordCompromised` and introducing `__experimental_unsetPasswordCompromised` ([#7477](https://github.com/clerk/javascript/pull/7477)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`79eb5af`](https://github.com/clerk/javascript/commit/79eb5afd91d7b002faafd2980850d944acb37917), [`b3b02b4`](https://github.com/clerk/javascript/commit/b3b02b46dfa6d194ed12d2e6b9e332796ee73c4a), [`7b3024a`](https://github.com/clerk/javascript/commit/7b3024a71e6e45e926d83f1a9e887216e7c14424), [`2cd4da9`](https://github.com/clerk/javascript/commit/2cd4da9c72bc7385c0c7c71e2a7ca856d79ce630)]:
  - @clerk/shared@3.41.0
  - @clerk/types@4.101.8

## 2.27.1

### Patch Changes

- Fixed an issue where TanStack React Start middleware fails to properly handle requests. ([#7431](https://github.com/clerk/javascript/pull/7431)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`375a32d`](https://github.com/clerk/javascript/commit/375a32d0f44933605ffb513ff28f522ac5e851d6), [`175883b`](https://github.com/clerk/javascript/commit/175883b05228138c9ff55d0871cc1041bd68d7fe), [`f626046`](https://github.com/clerk/javascript/commit/f626046c589956022b1e1ac70382c986822f4733), [`14342d2`](https://github.com/clerk/javascript/commit/14342d2b34fe0882f7676195aefaaa17f034af70)]:
  - @clerk/shared@3.40.0
  - @clerk/types@4.101.7

## 2.27.0

### Minor Changes

- Added API keys `get`, `delete` and `update` methods. ([#7400](https://github.com/clerk/javascript/pull/7400)) by [@wobsoriano](https://github.com/wobsoriano)

  Usage:

  ```ts
  await clerkClient.apiKeys.get('api_key_id');

  await clerkClient.apiKeys.update({
    apiKeyId: 'api_key_id',
    scopes: ['scope1', 'scope2'],
  });

  await clerkClient.apiKeys.delete('api_key_id');
  ```

## 2.26.0

### Minor Changes

- Added support for JWTs in oauth token type ([#7308](https://github.com/clerk/javascript/pull/7308)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Updated dependencies [[`b117ebc`](https://github.com/clerk/javascript/commit/b117ebc956e1a5d48d5fdb7210de3344a74a524a)]:
  - @clerk/shared@3.39.0
  - @clerk/types@4.101.6

## 2.25.1

### Patch Changes

- Rename `__experimental_passwordUntrusted` to `__experimental_passwordCompromised` ([#7352](https://github.com/clerk/javascript/pull/7352)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`e31f3d5`](https://github.com/clerk/javascript/commit/e31f3d567302f99d8d073ba75cd934fb3c1eca7f), [`8376789`](https://github.com/clerk/javascript/commit/8376789de2383b52fabc563a9382622627055ecd), [`f917d68`](https://github.com/clerk/javascript/commit/f917d68fc2fc5d317770491e9d4d7185e1985d04), [`818c25a`](https://github.com/clerk/javascript/commit/818c25a9eec256245152725c64419c73e762c1a2), [`b41c0d5`](https://github.com/clerk/javascript/commit/b41c0d539835a5a43d15e3399bac7cbf046d9345)]:
  - @clerk/shared@3.38.0
  - @clerk/types@4.101.5

## 2.25.0

### Minor Changes

- Unified machine token verification methods under a consistent `verify()` API. The previous methods (`verifySecret`, `verifyToken`, `verifyAccessToken`) are now deprecated. ([#7347](https://github.com/clerk/javascript/pull/7347)) by [@wobsoriano](https://github.com/wobsoriano)

  Before

  ```ts
  await clerkClient.apiKeys.verifySecret('ak_...');
  await clerkClient.m2m.verifyToken({ token: 'mt_...' });
  ```

  After

  ```ts
  await clerkClient.apiKeys.verify('ak_...');
  await clerkClient.m2m.verify({ token: 'mt_...' });
  ```

- Introducing `users.__experimental_passwordUntrusted` action ([#7268](https://github.com/clerk/javascript/pull/7268)) by [@octoper](https://github.com/octoper)

- Export `UserDeletedJSON` type from API resources ([#7309](https://github.com/clerk/javascript/pull/7309)) by [@kduprey](https://github.com/kduprey)

### Patch Changes

- Updated dependencies [[`40a841d`](https://github.com/clerk/javascript/commit/40a841d56cd8983dce21376c832f1085c43a9518), [`f364924`](https://github.com/clerk/javascript/commit/f364924708f20f0bc7b8b291ea2ae01ce09e2e9f), [`f115e56`](https://github.com/clerk/javascript/commit/f115e56d14b5c49f52b6aca01b434dbe4f6193cf), [`d4aef71`](https://github.com/clerk/javascript/commit/d4aef71961d6d0abf8f1d1142c4e3ae943181c4b), [`3f99742`](https://github.com/clerk/javascript/commit/3f997427e400248502b0977e1b69e109574dfe7d), [`02798f5`](https://github.com/clerk/javascript/commit/02798f571065d8142cf1dade57b42b3e8ce0f818), [`07a30ce`](https://github.com/clerk/javascript/commit/07a30ce52b7d2ba85ce3533879700b9ec129152e), [`ce8b914`](https://github.com/clerk/javascript/commit/ce8b9149bff27866cdb686f1ab0b56cef8d8c697)]:
  - @clerk/shared@3.37.0
  - @clerk/types@4.101.4

## 2.24.0

### Minor Changes

- Fix TypeScript return type for `clerk.client.waitlistEntries.list()` and export `WaitlistEntry` type. ([#7280](https://github.com/clerk/javascript/pull/7280)) by [@kduprey](https://github.com/kduprey)

### Patch Changes

- Updated dependencies [[`f85abda`](https://github.com/clerk/javascript/commit/f85abdac03fde4a5109f31931c55b56a365aa748), [`36e43cc`](https://github.com/clerk/javascript/commit/36e43cc614865e52eefbd609a9491c32371cda44)]:
  - @clerk/shared@3.36.0
  - @clerk/types@4.101.3

## 2.23.2

### Patch Changes

- Updated dependencies [[`d8f59a6`](https://github.com/clerk/javascript/commit/d8f59a66d56d8fb0dfea353ecd86af97d0ec56b7)]:
  - @clerk/shared@3.35.2
  - @clerk/types@4.101.2

## 2.23.1

### Patch Changes

- Updated dependencies [[`a9c13ca`](https://github.com/clerk/javascript/commit/a9c13cae5a6f46ca753d530878f7e4492ca7938b)]:
  - @clerk/shared@3.35.1
  - @clerk/types@4.101.1

## 2.23.0

### Minor Changes

- Add `external_id` field to `user.deleted` webhook events; Add `user` field to `SessionWebhookEventJSON` ([#7209](https://github.com/clerk/javascript/pull/7209)) by [@kduprey](https://github.com/kduprey)
  - Adds `external_id` field to `user.deleted` webhook events by creating a new `UserDeletedJSON` interface that extends `DeletedObjectJSON` to include an optional `external_id` string.
  - Creates a new `SessionWebhookEventJSON` interface that extends `SessionJSON` to include a nullable `user` field as the `UserJSON` interface, and updates the webhook event types to use this new interface for `session.created`, `session.ended`, `session.removed`, and `session.revoked` events.

### Patch Changes

- Updated dependencies [[`7be8f45`](https://github.com/clerk/javascript/commit/7be8f458367b2c050b0dc8c0481d7bbe090ea400), [`bdbb0d9`](https://github.com/clerk/javascript/commit/bdbb0d91712a84fc214c534fc47b62b1a2028ac9), [`aa184a4`](https://github.com/clerk/javascript/commit/aa184a46a91f9dec3fd275ec5867a8366d310469), [`1d4e7a7`](https://github.com/clerk/javascript/commit/1d4e7a7769e9efaaa945e4ba6468ad47bd24c807), [`42f0d95`](https://github.com/clerk/javascript/commit/42f0d95e943d82960de3f7e5da17d199eff9fddd), [`c63cc8e`](https://github.com/clerk/javascript/commit/c63cc8e9c38ed0521a22ebab43e10111f04f9daf), [`d32d724`](https://github.com/clerk/javascript/commit/d32d724c34a921a176eca159273f270c2af4e787), [`00291bc`](https://github.com/clerk/javascript/commit/00291bc8ae03c06f7154bd937628e8193f6e3ce9)]:
  - @clerk/shared@3.35.0
  - @clerk/types@4.101.0

## 2.22.0

### Minor Changes

- Removed internal parameter when creating API keys ([#7207](https://github.com/clerk/javascript/pull/7207)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Updated dependencies [[`b5a7e2f`](https://github.com/clerk/javascript/commit/b5a7e2f8af5514e19e06918632d982be65f4a854), [`a1d10fc`](https://github.com/clerk/javascript/commit/a1d10fc6e231f27ec7eabd0db45b8f7e8c98250e), [`b944ff3`](https://github.com/clerk/javascript/commit/b944ff30494a8275450ca0d5129cdf58f02bea81), [`4011c5e`](https://github.com/clerk/javascript/commit/4011c5e0014ede5e480074b73d064a1bc2a577dd)]:
  - @clerk/types@4.100.0
  - @clerk/shared@3.34.0

## 2.21.0

### Minor Changes

- Update the supported API version to `2025-11-10`. ([#7095](https://github.com/clerk/javascript/pull/7095)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`613cb97`](https://github.com/clerk/javascript/commit/613cb97cb7b3b33c3865cfe008ef9b1ea624cc8d)]:
  - @clerk/shared@3.33.0
  - @clerk/types@4.99.0

## 2.20.1

### Patch Changes

- Updated dependencies [[`cc11472`](https://github.com/clerk/javascript/commit/cc11472e7318b806ee43d609cd03fb0446f56146), [`539fad7`](https://github.com/clerk/javascript/commit/539fad7b80ed284a7add6cf8c4c45cf4c6a0a8b2), [`296fb0b`](https://github.com/clerk/javascript/commit/296fb0b8f34aca4f527508a5e6a6bbaad89cfdaa), [`c413433`](https://github.com/clerk/javascript/commit/c413433fee49701f252df574ce6a009d256c0cb9), [`a940c39`](https://github.com/clerk/javascript/commit/a940c39354bd0ee48d2fc9b0f3217ec20b2f32b4)]:
  - @clerk/shared@3.32.0
  - @clerk/types@4.98.0

## 2.20.0

### Minor Changes

- Fixed API keys `list` method return type ([#7162](https://github.com/clerk/javascript/pull/7162)) by [@wobsoriano](https://github.com/wobsoriano)

  ```ts
  const apiKeys = await clerkClient.apiKeys.list({ subject: 'user_xxxxx' });

  apiKeys.data;
  apiKeys.totalCount;
  ```

### Patch Changes

- Updated dependencies [[`a474c59`](https://github.com/clerk/javascript/commit/a474c59e3017358186de15c5b1e5b83002e72527), [`5536429`](https://github.com/clerk/javascript/commit/55364291e245ff05ca1e50e614e502d2081b87fb)]:
  - @clerk/shared@3.31.1
  - @clerk/types@4.97.2

## 2.19.3

### Patch Changes

- Updated dependencies [[`85b5acc`](https://github.com/clerk/javascript/commit/85b5acc5ba192a8247f072fa93d5bc7d42986293), [`ea65d39`](https://github.com/clerk/javascript/commit/ea65d390cd6d3b0fdd35202492e858f8c8370f73), [`b09b29e`](https://github.com/clerk/javascript/commit/b09b29e82323c8fc508c49ffe10c77a737ef0bec)]:
  - @clerk/types@4.97.1
  - @clerk/shared@3.31.0

## 2.19.2

### Patch Changes

- Deprecate `@clerk/types` in favor of `@clerk/shared/types` ([#7022](https://github.com/clerk/javascript/pull/7022)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  The `@clerk/types` package is now deprecated. All type definitions have been consolidated and moved to `@clerk/shared/types` to improve consistency across the Clerk ecosystem.

  **Backward Compatibility:**

  The `@clerk/types` package will remain available and will continue to re-export all types from `@clerk/shared/types` to ensure backward compatibility. Existing applications will continue to work without any immediate breaking changes. However, we strongly recommend migrating to `@clerk/shared/types` as new type definitions and updates will only be added to `@clerk/shared/types` starting with the next major release.

  **Migration Steps:**

  Please update your imports from `@clerk/types` to `@clerk/shared/types`:

  ```typescript
  // Before
  import type { ClerkResource, UserResource } from '@clerk/types';

  // After
  import type { ClerkResource, UserResource } from '@clerk/shared/types';
  ```

  **What Changed:**

  All type definitions including:
  - Resource types (User, Organization, Session, etc.)
  - API response types
  - Configuration types
  - Authentication types
  - Error types
  - And all other shared types

  Have been moved from `packages/types/src` to `packages/shared/src/types` and are now exported via `@clerk/shared/types`.

- Updated dependencies [[`3e0ef92`](https://github.com/clerk/javascript/commit/3e0ef9281194714f56dcf656d0caf4f75dcf097c), [`2587aa6`](https://github.com/clerk/javascript/commit/2587aa671dac1ca66711889bf1cd1c2e2ac8d7c8)]:
  - @clerk/shared@3.30.0
  - @clerk/types@4.97.0

## 2.19.1

### Patch Changes

- Remove \_\_clerk_handshake_nonce query parameter from redirect URLs in development mode to prevent infinite loops. ([#7054](https://github.com/clerk/javascript/pull/7054)) by [@bratsos](https://github.com/bratsos)

- Updated dependencies [[`791ff19`](https://github.com/clerk/javascript/commit/791ff19a55ecb39eac20e1533a7d578a30386388), [`439427e`](https://github.com/clerk/javascript/commit/439427e44adef4f43e5f0719adf5654ea58c33e7), [`7dfbf3a`](https://github.com/clerk/javascript/commit/7dfbf3aa1b5269aee2d3af628b02027be9767088), [`d33b7b5`](https://github.com/clerk/javascript/commit/d33b7b5538e9bcbbca1ac23c46793d0cddcef533)]:
  - @clerk/shared@3.29.0
  - @clerk/types@4.96.0

## 2.19.0

### Minor Changes

- Add missing payer field to BillingSubscriptionItemWebhookEventJSON ([#7024](https://github.com/clerk/javascript/pull/7024)) by [@Wendrowiec13](https://github.com/Wendrowiec13)

### Patch Changes

- Fix infinite redirect loop in multi-domain development flows by reordering authentication checks to prioritize satellite sync requests over dev-browser-sync handshakes. ([#7018](https://github.com/clerk/javascript/pull/7018)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`4d46e4e`](https://github.com/clerk/javascript/commit/4d46e4e601a5f2a213f1718af3f9271db4db0911)]:
  - @clerk/types@4.95.1
  - @clerk/shared@3.28.3

## 2.18.3

### Patch Changes

- Updated dependencies [[`a172d51`](https://github.com/clerk/javascript/commit/a172d51df2d7f2e450c983a15ae897624304a764), [`947d0f5`](https://github.com/clerk/javascript/commit/947d0f5480b0151a392966cad2e1a45423f66035)]:
  - @clerk/types@4.95.0
  - @clerk/shared@3.28.2

## 2.18.2

### Patch Changes

- Updated dependencies [[`d8147fb`](https://github.com/clerk/javascript/commit/d8147fb58bfd6caf9a4f0a36fdc48c630d00387f)]:
  - @clerk/shared@3.28.1

## 2.18.1

### Patch Changes

- Fixed JWT public key caching in `verifyToken()` to support multi-instance scenarios. Public keys are now correctly cached per `kid` from the token header instead of using a single shared cache key. ([#6993](https://github.com/clerk/javascript/pull/6993)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  **What was broken:**

  When verifying JWT tokens with the `jwtKey` option (PEM public key), all keys were cached under the same cache key. This caused verification failures in multi-instance scenarios.

  **What's fixed:**

  JWT public keys are now cached using the `kid` value from each token's header.

- Replace `/commerce` endpoints with `/billing` endpoints. ([#6854](https://github.com/clerk/javascript/pull/6854)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`305f4ee`](https://github.com/clerk/javascript/commit/305f4eeb825086d55d1b0df198a0c43da8d94993), [`53214f9`](https://github.com/clerk/javascript/commit/53214f9a600074affc84d616bbbe7a6b625e7d33), [`1441e68`](https://github.com/clerk/javascript/commit/1441e6851102e9eed5697ad78c695f75b4a20db2), [`1236c74`](https://github.com/clerk/javascript/commit/1236c745fd58020e0972938ca0a9ae697a24af02)]:
  - @clerk/shared@3.28.0
  - @clerk/types@4.94.0

## 2.18.0

### Minor Changes

- Added support for User `locale` ([#6938](https://github.com/clerk/javascript/pull/6938)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Add `enterpriseConnectionId` to `SamlAccount` and `EnterpriseAccount` resources ([#6961](https://github.com/clerk/javascript/pull/6961)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Added API keys list method to the backend SDK client ([#6948](https://github.com/clerk/javascript/pull/6948)) by [@wobsoriano](https://github.com/wobsoriano)

- Add `last_authenticated_at` to `SAMLAccount` resource, which represents the date when the SAML account was last authenticated ([#6954](https://github.com/clerk/javascript/pull/6954)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Added internal helper type for `auth` and `getAuth()` functions that don't require a request or context parameter ([#6910](https://github.com/clerk/javascript/pull/6910)) by [@wobsoriano](https://github.com/wobsoriano)

- Added `adminDeleteEnabled` param to Organization update method ([#6880](https://github.com/clerk/javascript/pull/6880)) by [@ccaspanello](https://github.com/ccaspanello)

- Updated dependencies [[`65b7cc7`](https://github.com/clerk/javascript/commit/65b7cc787a5f02a302b665b6eaf4d4b9a1cae4b0), [`6e09786`](https://github.com/clerk/javascript/commit/6e09786adeb0f481ca8b6d060ae8754b556a3f9a), [`aa7210c`](https://github.com/clerk/javascript/commit/aa7210c7fff34f6c6e2d4ca3cb736bbd35439cb6), [`2cd53cd`](https://github.com/clerk/javascript/commit/2cd53cd8c713dfa7f2e802fe08986411587095fa), [`1a2eee6`](https://github.com/clerk/javascript/commit/1a2eee6b8b6ead2d0481e93104fcaed6452bd1b9), [`2cd53cd`](https://github.com/clerk/javascript/commit/2cd53cd8c713dfa7f2e802fe08986411587095fa), [`1a2430a`](https://github.com/clerk/javascript/commit/1a2430a166fb1df5fbca76437c63423b18a49ced), [`31a04fc`](https://github.com/clerk/javascript/commit/31a04fc2b783f01cd4848c1e681af3b30e57bb2f), [`9766c4a`](https://github.com/clerk/javascript/commit/9766c4afd26f2841d6f79dbdec2584ef8becd22f), [`22b8e49`](https://github.com/clerk/javascript/commit/22b8e49f9fb65d55ab737d11f1f57a25bf947511), [`a66357e`](https://github.com/clerk/javascript/commit/a66357e8a5928199aebde408ec7cfaac152c2c42), [`dacc1af`](https://github.com/clerk/javascript/commit/dacc1af22e1d1af0940b2d626b8a47d376c19342)]:
  - @clerk/types@4.93.0
  - @clerk/shared@3.27.4

## 2.17.2

### Patch Changes

- Updated dependencies [[`fba4781`](https://github.com/clerk/javascript/commit/fba4781ff2a2d16f8934029fa6fb77d70953f2be), [`a1f6714`](https://github.com/clerk/javascript/commit/a1f671480cda6f978db059ba0640d4ed8b08f112)]:
  - @clerk/types@4.92.0
  - @clerk/shared@3.27.3

## 2.17.1

### Patch Changes

- Add `slug_disabled` field on organization settings ([#6902](https://github.com/clerk/javascript/pull/6902)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`f737d26`](https://github.com/clerk/javascript/commit/f737d268aa167889a4f3f7aba2658c2ba1fd909a), [`8777f35`](https://github.com/clerk/javascript/commit/8777f350f5fb51413609a53d9de05b2e5d1d7cfe), [`2c0128b`](https://github.com/clerk/javascript/commit/2c0128b05ecf48748f27f10f0b0215a279ba6cc1)]:
  - @clerk/types@4.91.0
  - @clerk/shared@3.27.2

## 2.17.0

### Minor Changes

- Add `user_id` field to `organizationInvitation.accepted` webhook events. ([#6887](https://github.com/clerk/javascript/pull/6887)) by [@kduprey](https://github.com/kduprey)

  Creates a new `OrganizationInvitationAcceptedJSON` interface that extends `OrganizationInvitationJSON` with a required `user_id` field, and updates the webhook type system to use this interface specifically for `organizationInvitation`.accepted events.

### Patch Changes

- Updated dependencies [[`37028ca`](https://github.com/clerk/javascript/commit/37028caad59cb0081ac74e70a44e4a419082a999)]:
  - @clerk/types@4.90.0
  - @clerk/shared@3.27.1

## 2.16.0

### Minor Changes

- Udpate Tyepdoc links to fix temporary ignore warnings ([#6846](https://github.com/clerk/javascript/pull/6846)) by [@SarahSoutoul](https://github.com/SarahSoutoul)

- [Billing Beta] Update subscription item `plan` and `planId` properties to be `null`. ([#6839](https://github.com/clerk/javascript/pull/6839)) by [@paddycarver](https://github.com/paddycarver)

### Patch Changes

- Updated dependencies [[`e3e77eb`](https://github.com/clerk/javascript/commit/e3e77eb277c6b36847265db7b863c418e3708ab6), [`9cf89cd`](https://github.com/clerk/javascript/commit/9cf89cd3402c278e8d5bfcd8277cee292bc45333), [`090ca74`](https://github.com/clerk/javascript/commit/090ca742c590bc4f369cf3e1ca2ec9917410ffe4), [`5546352`](https://github.com/clerk/javascript/commit/55463527df9a710ef3215c353bab1ef423d1de62)]:
  - @clerk/shared@3.27.0
  - @clerk/types@4.89.0

## 2.15.0

### Minor Changes

- Add invite, reject, and delete to Waitlist Entry API resources ([#6799](https://github.com/clerk/javascript/pull/6799)) by [@tmilewski](https://github.com/tmilewski)

- [Billing Beta] Rename types and classes that contain commerce to use billing instead. ([#6812](https://github.com/clerk/javascript/pull/6812)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Fix a case where handshakes would get triggered in a loop on cross origin requests in development. ([#6755](https://github.com/clerk/javascript/pull/6755)) by [@brkalow](https://github.com/brkalow)

- Update jsdocs mentions of `@experimental` tag. ([#6651](https://github.com/clerk/javascript/pull/6651)) by [@panteliselef](https://github.com/panteliselef)

- [Billing Beta] Rename types, interfaces and classes that contain `commerce` to use `billing` instead. ([#6757](https://github.com/clerk/javascript/pull/6757)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`41e0a41`](https://github.com/clerk/javascript/commit/41e0a4190b33dd2c4bdc0d536bbe83fcf99af9b0), [`1aa9e9f`](https://github.com/clerk/javascript/commit/1aa9e9f10c051319e9ff4b1a0ecd71507bd6a6aa), [`a88ee58`](https://github.com/clerk/javascript/commit/a88ee5827adee0cc8a62246d03a3034d8566fe21), [`d6c7bbb`](https://github.com/clerk/javascript/commit/d6c7bbba23f38c0b3ca7edebb53028a05c7b38e6)]:
  - @clerk/shared@3.26.1
  - @clerk/types@4.88.0

## 2.14.1

### Patch Changes

- Added missing `orderBy` field to machines list method ([#6767](https://github.com/clerk/javascript/pull/6767)) by [@wobsoriano](https://github.com/wobsoriano)

  Example:

  ```ts
  clerkClient.machines.list({
    ...params,
    orderBy: 'name',
  });
  ```

- Add JSDoc around Machine and M2M resource types ([#6774](https://github.com/clerk/javascript/pull/6774)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`bcf24f2`](https://github.com/clerk/javascript/commit/bcf24f2f91913fa0dd3fbf02b3bbef345c4e1ea9), [`1ceedad`](https://github.com/clerk/javascript/commit/1ceedad4bc5bc3d5f01c95185f82ff0f43983cf5), [`de90ede`](https://github.com/clerk/javascript/commit/de90ede82664b58bef9e294498384cf2c99a331e), [`9d4a95c`](https://github.com/clerk/javascript/commit/9d4a95c766396a0bc327fbf0560228bedb4828eb), [`428cd57`](https://github.com/clerk/javascript/commit/428cd57a8581a58a6a42325ec50eb98000068e97)]:
  - @clerk/types@4.87.0
  - @clerk/shared@3.26.0

## 2.14.0

### Minor Changes

- Adds the ability to create bulk invitations with `.createInvitationBulk([{...}])` ([#6751](https://github.com/clerk/javascript/pull/6751)) by [@tmilewski](https://github.com/tmilewski)

- Add lastAuthenticationStrategy to API resources ([#6748](https://github.com/clerk/javascript/pull/6748)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Align create params for Invitation and OrganizationInvitation with backend API ([#6750](https://github.com/clerk/javascript/pull/6750)) by [@tmilewski](https://github.com/tmilewski)

- Add machine secret key rotation BAPI method ([#6760](https://github.com/clerk/javascript/pull/6760)) by [@wobsoriano](https://github.com/wobsoriano)

  Usage:

  ```ts
  clerkClient.machines.rotateSecretKey({
    machineId: 'mch_xxx',
    previousTokenTtl: 3600,
  });
  ```

- Remove `expired` from `OrganizationInvitationStatus` according to latest Backend API spec ([#6753](https://github.com/clerk/javascript/pull/6753)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`23948dc`](https://github.com/clerk/javascript/commit/23948dc777ec6a17bafbae59c253a93143b0e105), [`82b84fe`](https://github.com/clerk/javascript/commit/82b84fed5f207673071ba7354a17f4a76e101201), [`54b4b5a`](https://github.com/clerk/javascript/commit/54b4b5a5f811f612fadf5c47ffda94a750c57a5e), [`50a8622`](https://github.com/clerk/javascript/commit/50a8622c3579306f15e5d40e5ea72b4fe4384ef7), [`23948dc`](https://github.com/clerk/javascript/commit/23948dc777ec6a17bafbae59c253a93143b0e105)]:
  - @clerk/types@4.86.0
  - @clerk/shared@3.25.0

## 2.13.0

### Minor Changes

- Extend the trial of a subscription item via the BillingAPI. ([#6714](https://github.com/clerk/javascript/pull/6714)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`55490c3`](https://github.com/clerk/javascript/commit/55490c31fadc82bdca6cd5f2b22e5e158aaba0cb), [`e8d21de`](https://github.com/clerk/javascript/commit/e8d21de39b591973dad48fc1d1851c4d28b162fe), [`637f2e8`](https://github.com/clerk/javascript/commit/637f2e8768b76aaf756062b6b5b44bf651f66789)]:
  - @clerk/types@4.85.0
  - @clerk/shared@3.24.2

## 2.12.1

### Patch Changes

- Updated dependencies [[`fced4fc`](https://github.com/clerk/javascript/commit/fced4fc869bb21c77826dfaf281b6640e0f0c006), [`e6e19d2`](https://github.com/clerk/javascript/commit/e6e19d2d2f3b2c4617b25f53830216a1d550e616), [`1b1e8b1`](https://github.com/clerk/javascript/commit/1b1e8b1fd33b787f956b17b193e5fd0a4cdc6cec)]:
  - @clerk/types@4.84.1
  - @clerk/shared@3.24.1

## 2.12.0

### Minor Changes

- [Billing Beta] Use correct casing for past due events types. ([#6687](https://github.com/clerk/javascript/pull/6687)) by [@panteliselef](https://github.com/panteliselef)
  - `'subscription.past_due'` -> `'subscription.pastDue'`
  - `'subscriptionItem.past_due'` -> `'subscriptionItem.pastDue'`

- Include `'subscriptionItem.freeTrialEnding'` event in `CommerceSubscriptionItemWebhookEvent`. ([#6684](https://github.com/clerk/javascript/pull/6684)) by [@panteliselef](https://github.com/panteliselef)

## 2.11.0

### Minor Changes

- Get user's subscription via BillingApi. ([#6667](https://github.com/clerk/javascript/pull/6667)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- - Export `Feature` type from backend resource. ([#6649](https://github.com/clerk/javascript/pull/6649)) by [@alexisintech](https://github.com/alexisintech)

  - Re-export canonical `CommerceMoneyAmount` type from `@clerk/types`.

- Updated dependencies [[`2a82737`](https://github.com/clerk/javascript/commit/2a8273705b9764e1a4613d5a0dbb738d0b156c05), [`cda5d7b`](https://github.com/clerk/javascript/commit/cda5d7b79b28dc03ec794ea54e0feb64b148cdd2), [`ba25a5b`](https://github.com/clerk/javascript/commit/ba25a5b5a3fa686a65f52e221d9d1712a389fea9), [`a50cfc8`](https://github.com/clerk/javascript/commit/a50cfc8f1dd168b436499e32fc8b0fc41d28bbff), [`377f67b`](https://github.com/clerk/javascript/commit/377f67b8e552d1a19efbe4530e9306675b7f8eab), [`65b12ee`](https://github.com/clerk/javascript/commit/65b12eeeb57ee80cdd8c36c5949d51f1227a413e), [`263722e`](https://github.com/clerk/javascript/commit/263722e61fd27403b4c8d9794880686771e123f9)]:
  - @clerk/types@4.84.0
  - @clerk/shared@3.24.0

## 2.10.1

### Patch Changes

- Updated dependencies [[`600c648`](https://github.com/clerk/javascript/commit/600c648d4087a823341041c90018797fbc0033f0)]:
  - @clerk/shared@3.23.0
  - @clerk/types@4.83.0

## 2.10.0

### Minor Changes

- Add missing properties to OAuthApplicationJSON ([#6378](https://github.com/clerk/javascript/pull/6378)) by [@SarahSoutoul](https://github.com/SarahSoutoul)

- [Billing Beta] Add `cancelSubscriptionItem` to BillingApi. ([#6611](https://github.com/clerk/javascript/pull/6611)) by [@panteliselef](https://github.com/panteliselef)

- Add `getOrganizationBillingSubscription` to BillingApi. ([#6632](https://github.com/clerk/javascript/pull/6632)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Fixes an issue where a handshake would trigger more than intended in development. ([#6635](https://github.com/clerk/javascript/pull/6635)) by [@brkalow](https://github.com/brkalow)

- Fix logic for forcing a session sync on cross origin requests. ([#6600](https://github.com/clerk/javascript/pull/6600)) by [@brkalow](https://github.com/brkalow)

- Updated dependencies [[`d52714e`](https://github.com/clerk/javascript/commit/d52714e4cb7f369c74826cd4341c58eb1900abe4), [`ce49740`](https://github.com/clerk/javascript/commit/ce49740d474d6dd9da5096982ea4e9f14cf68f09), [`2ed539c`](https://github.com/clerk/javascript/commit/2ed539cc7f08ed4d70c33621563ad386ea8becc5), [`deaafe4`](https://github.com/clerk/javascript/commit/deaafe449773632d690aa2f8cafaf959392622b9), [`a26ecae`](https://github.com/clerk/javascript/commit/a26ecae09fd06cd34f094262f038a8eefbb23f7d), [`c16a7a5`](https://github.com/clerk/javascript/commit/c16a7a5837fc15e0e044baf9c809b8da6fbac795), [`05b6d65`](https://github.com/clerk/javascript/commit/05b6d65c0bc5736443325a5defee4c263ef196af)]:
  - @clerk/types@4.82.0
  - @clerk/shared@3.22.1

## 2.9.4

### Patch Changes

- Add `orderBy` parameter to OAuth Applications list request ([#6593](https://github.com/clerk/javascript/pull/6593)) by [@tmilewski](https://github.com/tmilewski)

- Updated dependencies [[`e52bf8e`](https://github.com/clerk/javascript/commit/e52bf8ebef74a9e123c69b69acde1340c01d32d7), [`c043c19`](https://github.com/clerk/javascript/commit/c043c1919854aaa5b9cf7f6df5bb517f5617f7a1), [`c28d29c`](https://github.com/clerk/javascript/commit/c28d29c79bb4f144d782313ca72df7db91a77340), [`172e054`](https://github.com/clerk/javascript/commit/172e054a3511be12d16ba19037db320c2d9838bf)]:
  - @clerk/types@4.81.0
  - @clerk/shared@3.22.0

## 2.9.3

### Patch Changes

- Updated dependencies [[`8dc6bad`](https://github.com/clerk/javascript/commit/8dc6bad5c7051b59bd8c73e65d497f6a974bb1c3), [`aa6a3c3`](https://github.com/clerk/javascript/commit/aa6a3c3d3ba2de67a468c996cbf0bff43a09ddb8), [`db50c47`](https://github.com/clerk/javascript/commit/db50c4734920ada6002de8c62c994047eb6cb5a0)]:
  - @clerk/types@4.80.0
  - @clerk/shared@3.21.2

## 2.9.2

### Patch Changes

- Updated dependencies [[`413468c`](https://github.com/clerk/javascript/commit/413468c9b9c8fb7576f8e4cbdccff98784e33fef), [`7b7eb1f`](https://github.com/clerk/javascript/commit/7b7eb1fc0235249c5c179239078294118f2947cd)]:
  - @clerk/shared@3.21.1
  - @clerk/types@4.79.0

## 2.9.1

### Patch Changes

- Updated dependencies [[`5b24129`](https://github.com/clerk/javascript/commit/5b24129ddcfc2f7dc6eb79d8c818b4ff97c68e9a)]:
  - @clerk/shared@3.21.0
  - @clerk/types@4.78.0

## 2.9.0

### Minor Changes

- Remove `secret` in favor of `token` in m2m response. ([#6542](https://github.com/clerk/javascript/pull/6542)) by [@wobsoriano](https://github.com/wobsoriano)

  Before:

  ```ts
  const result = await clerkClient.m2mTokens.create();

  console.log(result.secret);
  ```

  After:

  ```ts
  const result = await clerkClient.m2mTokens.create();

  console.log(result.token);
  ```

- Rename M2M namespace from `m2mTokens` to `m2m` in Backend API client ([#6544](https://github.com/clerk/javascript/pull/6544)) by [@wobsoriano](https://github.com/wobsoriano)

  Before:

  ```ts
  clerkClient.m2mTokens.create();

  clerkClient.m2mTokens.revoke();

  clerkClient.m2mTokens.verifySecret({ secret: 'ak_xxx' });
  ```

  After:

  ```ts
  clerkClient.m2m.createToken();

  clerkClient.m2m.revokeToken();

  clerkClient.m2m.verifyToken({ token: 'ak_xxx' });
  ```

  The `verifySecret()` method is removed. Please use `.verifyToken()` instead.

- Deprecates `clerkClient.m2mTokens.verifySecret({ secret: 'mt_xxx' })` in favor or `clerkClient.m2mTokens.verifyToken({ token: 'mt_xxx' })` ([#6536](https://github.com/clerk/javascript/pull/6536)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Updated dependencies [[`4db1e58`](https://github.com/clerk/javascript/commit/4db1e58d70b60e1e236709b507666715d571e925), [`69498df`](https://github.com/clerk/javascript/commit/69498dfca3e6bb388eb8c94313eac06347dd5a27), [`59f1559`](https://github.com/clerk/javascript/commit/59f15593bab708b9e13eebfff6780c2d52b31b0a)]:
  - @clerk/types@4.77.0
  - @clerk/shared@3.20.1

## 2.8.0

### Minor Changes

- Exports `Machine` and `M2MToken` resource classes ([#6500](https://github.com/clerk/javascript/pull/6500)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Updated dependencies [[`15fe106`](https://github.com/clerk/javascript/commit/15fe1060f730a6a4391f3d2451d23edd3218e1ae), [`173837c`](https://github.com/clerk/javascript/commit/173837c2526aa826b7981ee8d6d4f52c00675da5), [`8b52d7a`](https://github.com/clerk/javascript/commit/8b52d7ae19407e8ab5a5451bd7d34b6bc38417de), [`854dde8`](https://github.com/clerk/javascript/commit/854dde88e642c47b5a29ac8f576c8c1976e5d067), [`ae2e2d6`](https://github.com/clerk/javascript/commit/ae2e2d6b336be6b596cc855e549843beb5bfd2a1), [`037f25a`](https://github.com/clerk/javascript/commit/037f25a8171888168913b186b7edf871e0aaf197), [`f8b38b7`](https://github.com/clerk/javascript/commit/f8b38b7059e498fef3ac1271346be0710aa31c76)]:
  - @clerk/types@4.76.0
  - @clerk/shared@3.20.0

## 2.7.1

### Patch Changes

- Updated dependencies [[`b72a3dd`](https://github.com/clerk/javascript/commit/b72a3dda2467720e5dc8cab3e7e6a110f3beb79b), [`d93b0ed`](https://github.com/clerk/javascript/commit/d93b0edf4adc57d48a26cb08444192887ccec659), [`6459f7d`](https://github.com/clerk/javascript/commit/6459f7dabe5f163f48ed73106bb901d8187da3e2), [`0ff648a`](https://github.com/clerk/javascript/commit/0ff648aeac0e2f5481596a98c8046d9d58a7bf75), [`9084759`](https://github.com/clerk/javascript/commit/90847593300be605e1ee1c06dac147ce68b25dc7)]:
  - @clerk/types@4.75.0
  - @clerk/shared@3.19.0

## 2.7.0

### Minor Changes

- Add billing API for fetching available plans. ([#6449](https://github.com/clerk/javascript/pull/6449)) by [@panteliselef](https://github.com/panteliselef)

- Adds machine-to-machine endpoints to the Backend SDK: ([#6479](https://github.com/clerk/javascript/pull/6479)) by [@wobsoriano](https://github.com/wobsoriano)

  **Note:** Renamed from "machine_tokens" to "m2m_tokens" for clarity and consistency with canonical terminology. This avoids confusion with other machine-related concepts like machine secrets.

  ### Create M2M Tokens

  A machine secret is required when creating M2M tokens.

  ```ts
  const clerkClient = createClerkClient({
    machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY,
  });

  clerkClient.m2mTokens.create({
    // or pass as an option here
    // machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY
    secondsUntilExpiration: 3600,
  });
  ```

  ### Revoke M2M Tokens

  You can revoke tokens using either a machine secret or instance secret:

  ```ts
  // Using machine secret
  const clerkClient = createClerkClient({ machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY });
  clerkClient.m2mTokens.revoke({
    // or pass as an option here
    // machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY
    m2mTokenId: 'mt_xxxxx',
    revocationReason: 'Revoked by user',
  });

  // Using instance secret (default)
  const clerkClient = createClerkClient({ secretKey: 'sk_xxxx' });
  clerkClient.m2mTokens.revoke({
    m2mTokenId: 'mt_xxxxx',
    revocationReason: 'Revoked by user',
  });
  ```

  ### Verify M2M Tokens

  You can verify tokens using either a machine secret or instance secret:

  ```ts
  // Using machine secret
  const clerkClient = createClerkClient({ machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY });
  clerkClient.m2mTokens.verifySecret({
    // or pass as an option here
    // machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY
    secret: 'mt_secret_xxxxx',
  });

  // Using instance secret (default)
  const clerkClient = createClerkClient({ secretKey: 'sk_xxxx' });
  clerkClient.m2mTokens.verifySecret({
    secret: 'mt_secret_xxxxx',
  });
  ```

  To verify machine-to-machine tokens using when using `authenticateRequest()` with a machine secret, use the `machineSecret` option:

  ```ts
  const clerkClient = createClerkClient({
    machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY,
  });

  const authReq = await clerkClient.authenticateRequest(c.req.raw, {
    // or pass as an option here
    // machineSecretKey: process.env.CLERK_MACHINE_SECRET_KEY
    acceptsToken: 'm2m_token', // previously machine_token
  });

  if (authReq.isAuthenticated) {
    // ... do something
  }
  ```

### Patch Changes

- feat(nextjs): Forward user-agent, arch, platform, and npm config with POST requests to /accountless_applications ([#6483](https://github.com/clerk/javascript/pull/6483)) by [@heatlikeheatwave](https://github.com/heatlikeheatwave)

- Updated dependencies [[`1ad16da`](https://github.com/clerk/javascript/commit/1ad16daa49795a861ae277001831230580b6b9f4), [`4edef81`](https://github.com/clerk/javascript/commit/4edef81dd423a0471e3f579dd6b36094aa8546aa), [`696f8e1`](https://github.com/clerk/javascript/commit/696f8e11a3e5391e6b5a97d98e929b8973575b9a), [`f318d22`](https://github.com/clerk/javascript/commit/f318d22cf83caaef272bcf532561a03ca72575e7), [`1cc66ab`](https://github.com/clerk/javascript/commit/1cc66aba1c0adac24323876e4cc3d96be888b07b)]:
  - @clerk/types@4.74.0
  - @clerk/shared@3.18.1

## 2.6.3

### Patch Changes

- Updated dependencies [[`9368daf`](https://github.com/clerk/javascript/commit/9368dafb119b5a8ec6a9d6d82270e72bab6d8f1e), [`f93965f`](https://github.com/clerk/javascript/commit/f93965f64c81030f9fcf9d1cc4e4984d30cd12ec), [`7b6dcee`](https://github.com/clerk/javascript/commit/7b6dceea5bfd7f1cc1bf24126aa715307e24ae7f), [`ef87617`](https://github.com/clerk/javascript/commit/ef87617ae1fd125c806a33bfcfdf09c885319fa8)]:
  - @clerk/shared@3.18.0
  - @clerk/types@4.73.0

## 2.6.2

### Patch Changes

- Fix Node 18 compatibility issues with `snakecase-keys`. ([#6441](https://github.com/clerk/javascript/pull/6441)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`7a46679`](https://github.com/clerk/javascript/commit/7a46679a004739a7f712097c5779e9f5c068722e), [`05cc5ec`](https://github.com/clerk/javascript/commit/05cc5ecd82ecdbcc9922d3286224737a81813be0), [`22c35ef`](https://github.com/clerk/javascript/commit/22c35efb59226df2efaa2891fa4775c13312f4c6), [`e8d816a`](https://github.com/clerk/javascript/commit/e8d816a3350e862c3e9e1d4f8c96c047a0a016a2), [`aa9f185`](https://github.com/clerk/javascript/commit/aa9f185e21b58f8a6e03ea44ce29ee09ad2477d9), [`af0e123`](https://github.com/clerk/javascript/commit/af0e12393c9412281626e20dafb1b3a15558f6d9), [`3d1d871`](https://github.com/clerk/javascript/commit/3d1d8711405646cf3c2aabe99e08337a1028703a)]:
  - @clerk/shared@3.17.0
  - @clerk/types@4.72.0

## 2.6.1

### Patch Changes

- Adds scoping and secret key retrieval to machines BAPI methods: ([#6417](https://github.com/clerk/javascript/pull/6417)) by [@wobsoriano](https://github.com/wobsoriano)

  ```ts
  // Creates a new machine scope
  clerkClient.machines.createScope('machine_id', 'to_machine_id');

  // Deletes a machine scope
  clerkClient.machines.deleteScope('machine_id', 'other_machine_id');

  // Retrieve a secret key
  clerkClient.machines.getSecretKey('machine_id');
  ```

- Fix SAML Connection `attributeMapping` keys not being converted from camelCase to snake_case. ([#6418](https://github.com/clerk/javascript/pull/6418)) by [@tmilewski](https://github.com/tmilewski)

- Fixes an issue where the Clerk SDK was improperly detecting the request's origin. ([#6393](https://github.com/clerk/javascript/pull/6393)) by [@brkalow](https://github.com/brkalow)

- Updated dependencies [[`e404456`](https://github.com/clerk/javascript/commit/e4044566bca81f63c8e9c630fdec0f498ad6fc08), [`2803133`](https://github.com/clerk/javascript/commit/28031330a9810946feb44b93be10c067fb3b63ba), [`f1d9d34`](https://github.com/clerk/javascript/commit/f1d9d3482a796dd5f7796ede14159850e022cba2), [`d58b959`](https://github.com/clerk/javascript/commit/d58b9594cf65158e87dbaa90d632c45f543373e1), [`822ba1f`](https://github.com/clerk/javascript/commit/822ba1fd5e7daf665120cf183e4600a227098d53), [`d4d2612`](https://github.com/clerk/javascript/commit/d4d2612483baf356c389ef0ba5084059025481f2)]:
  - @clerk/types@4.71.0
  - @clerk/shared@3.16.0

## 2.6.0

### Minor Changes

- Add types for Commerce webhooks ([#6338](https://github.com/clerk/javascript/pull/6338)) by [@mauricioabreu](https://github.com/mauricioabreu)

### Patch Changes

- Updated dependencies [[`b0fdc9e`](https://github.com/clerk/javascript/commit/b0fdc9eaf764ca0c17cbe0810b7d240f6d9db0b6)]:
  - @clerk/types@4.70.1
  - @clerk/shared@3.15.1

## 2.5.2

### Patch Changes

- Updated dependencies [[`cd59c0e`](https://github.com/clerk/javascript/commit/cd59c0e5512a341dd8fb420aca583333c8243aa5), [`cd59c0e`](https://github.com/clerk/javascript/commit/cd59c0e5512a341dd8fb420aca583333c8243aa5)]:
  - @clerk/types@4.70.0
  - @clerk/shared@3.15.0

## 2.5.1

### Patch Changes

- Updated dependencies [[`fecc99d`](https://github.com/clerk/javascript/commit/fecc99d43cb7db5b99863829acb234cbce0da264), [`959d63d`](https://github.com/clerk/javascript/commit/959d63de27e5bfe27b46699b441dfd4e48616bf8), [`10e1060`](https://github.com/clerk/javascript/commit/10e10605b18a58f33a93caed058159c190678e74), [`92c44dd`](https://github.com/clerk/javascript/commit/92c44dd9d51e771a928a8da7004bdb8f8bdbaf58), [`a04a8f5`](https://github.com/clerk/javascript/commit/a04a8f5f81241ee41d93cd64793beca9d6296abb), [`c61855c`](https://github.com/clerk/javascript/commit/c61855c51d9c129d48c4543da3719939ad82f623), [`43ea069`](https://github.com/clerk/javascript/commit/43ea069c570dc64503fc82356ad28a2e43689d45)]:
  - @clerk/types@4.69.0
  - @clerk/shared@3.14.0

## 2.5.0

### Minor Changes

- Add machines Backend API resource and methods ([#6335](https://github.com/clerk/javascript/pull/6335)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Bump `snakecase-keys` to v9 which is the first ESM-only versions. This change should resolve any `TypeError: Cannot destructure property 'snakeCase' of 'require(...)' as it is undefined.` errors using Vitest. ([#6255](https://github.com/clerk/javascript/pull/6255)) by [@wobsoriano](https://github.com/wobsoriano)

- Update `clerk.samlConnections.getSamlConnectionList()` to return paginated data and export the `SamlConnection` type. ([#6332](https://github.com/clerk/javascript/pull/6332)) by [@jaredpiedt](https://github.com/jaredpiedt)

- Updated dependencies [[`d2f6f9e`](https://github.com/clerk/javascript/commit/d2f6f9e02036a4288916fcce14f24be5d56561c4), [`a329836`](https://github.com/clerk/javascript/commit/a329836a6c64f0a551a277ccae07043456a70523), [`6041c39`](https://github.com/clerk/javascript/commit/6041c39a31e787a6065dbc3f21e1c569982a06de), [`3f1270d`](https://github.com/clerk/javascript/commit/3f1270db86a21ead0ed6f0bd4f9986485203e973)]:
  - @clerk/types@4.68.0
  - @clerk/shared@3.13.0

## 2.4.5

### Patch Changes

- Updated dependencies [[`2a90b68`](https://github.com/clerk/javascript/commit/2a90b689550ae960496c9292ca23e0225e3425cd), [`af50905`](https://github.com/clerk/javascript/commit/af50905ea497ed3286c8c4c374498e06ca6ee82b)]:
  - @clerk/types@4.67.0
  - @clerk/shared@3.12.3

## 2.4.4

### Patch Changes

- Updated dependencies [[`8ee859c`](https://github.com/clerk/javascript/commit/8ee859ce00d1d5747c14a80fe7166303e64a4f1f)]:
  - @clerk/shared@3.12.2
  - @clerk/types@4.66.1

## 2.4.3

### Patch Changes

- Updated dependencies [[`025e304`](https://github.com/clerk/javascript/commit/025e304c4d6402dfd750ee51ac9c8fc2dea1f353), [`dedf487`](https://github.com/clerk/javascript/commit/dedf48703986d547d5b28155b0182a51030cffeb), [`b96114e`](https://github.com/clerk/javascript/commit/b96114e438638896ba536bb7a17b09cdadcd9407)]:
  - @clerk/types@4.66.0
  - @clerk/shared@3.12.1

## 2.4.2

### Patch Changes

- Add `query`, `orderBy`, and `organizationId` to the `SamlConnectionListParams` type. ([#6279](https://github.com/clerk/javascript/pull/6279)) by [@jaredpiedt](https://github.com/jaredpiedt)

- Add `event_attributes` to the `Webhook` type. ([#6162](https://github.com/clerk/javascript/pull/6162)) by [@jaredpiedt](https://github.com/jaredpiedt)

- Updated dependencies [[`2be6a53`](https://github.com/clerk/javascript/commit/2be6a53959cb8a3127c2eb5d1aeb4248872d2c24), [`f6a1c35`](https://github.com/clerk/javascript/commit/f6a1c35bd5fb4bd2a3cd45bdaf9defe6be59d4a9), [`6826d0b`](https://github.com/clerk/javascript/commit/6826d0bbd03e844d49224565878a4326684f06b4), [`f6a1c35`](https://github.com/clerk/javascript/commit/f6a1c35bd5fb4bd2a3cd45bdaf9defe6be59d4a9), [`97a07f7`](https://github.com/clerk/javascript/commit/97a07f78b4b0c3dc701a2610097ec7d6232f79e7)]:
  - @clerk/types@4.65.0
  - @clerk/shared@3.12.0

## 2.4.1

### Patch Changes

- Updated dependencies [[`f42c4fe`](https://github.com/clerk/javascript/commit/f42c4fedfdab873129b876eba38b3677f190b460), [`ec207dc`](https://github.com/clerk/javascript/commit/ec207dcd2a13340cfa4e3b80d3d52d1b4e7d5f23), [`ec207dc`](https://github.com/clerk/javascript/commit/ec207dcd2a13340cfa4e3b80d3d52d1b4e7d5f23), [`0e0cc1f`](https://github.com/clerk/javascript/commit/0e0cc1fa85347d727a4fd3718fe45b0f0244ddd9)]:
  - @clerk/types@4.64.0
  - @clerk/shared@3.11.0

## 2.4.0

### Minor Changes

- Trigger a handshake on a signed in, cross origin request to sync session state from a satellite domain. ([#6238](https://github.com/clerk/javascript/pull/6238)) by [@brkalow](https://github.com/brkalow)

### Patch Changes

- Refactor webhook verification to use verification from the `standardwebhooks` package, which is what our underlying provider relies on. ([#6252](https://github.com/clerk/javascript/pull/6252)) by [@brkalow](https://github.com/brkalow)

- Add optional `secret` property in API key response ([#6246](https://github.com/clerk/javascript/pull/6246)) by [@wobsoriano](https://github.com/wobsoriano)

- Use Headers constructor when building BAPI client headers ([#6235](https://github.com/clerk/javascript/pull/6235)) by [@wobsoriano](https://github.com/wobsoriano)

- Use explicit config for api version handling in backend client request builder ([#6232](https://github.com/clerk/javascript/pull/6232)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`abd8446`](https://github.com/clerk/javascript/commit/abd844609dad263d974da7fbf5e3575afce73abe), [`8387a39`](https://github.com/clerk/javascript/commit/8387a392a04906f0f10d84c61cfee36f23942f85), [`f2a6641`](https://github.com/clerk/javascript/commit/f2a66419b1813abc86ea98fde7475861995a1486)]:
  - @clerk/shared@3.10.2
  - @clerk/types@4.63.0

## 2.3.1

### Patch Changes

- Updated dependencies [[`02a1f42`](https://github.com/clerk/javascript/commit/02a1f42dfdb28ea956d6cbd3fbabe10093d2fad8), [`edc0bfd`](https://github.com/clerk/javascript/commit/edc0bfdae929dad78a99dfd6275aad947d9ddd73)]:
  - @clerk/shared@3.10.1
  - @clerk/types@4.62.1

## 2.3.0

### Minor Changes

- ## Optimize handshake payload delivery with nonce-based fetching ([#5905](https://github.com/clerk/javascript/pull/5905)) by [@jacekradko](https://github.com/jacekradko)

  This change introduces a significant optimization to the handshake flow by replacing direct payload delivery with a nonce-based approach to overcome browser cookie size limitations.

  ## Problem Solved

  Previously, the handshake payload (an encoded JWT containing set-cookie headers) was sent directly in a cookie. Since browsers limit cookies to ~4KB, this severely restricted the practical size of session tokens, which are also JWTs stored in cookies but embedded within the handshake payload.

  ## Solution

  We now use a conditional approach based on payload size:
  - **Small payloads (≤2KB)**: Continue using the direct approach for optimal performance
  - **Large payloads (>2KB)**: Use nonce-based fetching to avoid cookie size limits

  For large payloads, we:
  1. Generate a short nonce (ID) for each handshake instance
  2. Send only the nonce in the `__clerk_handshake_nonce` cookie
  3. Use the nonce to fetch the actual handshake payload via a dedicated BAPI endpoint

  ## New Handshake Flow (for payloads >2KB)
  1. User visits `example.com`
  2. Client app middleware triggers handshake → `307 FAPI/v1/client/handshake`
  3. FAPI handshake resolves → `307 example.com` with `__clerk_handshake_nonce` cookie containing the nonce
  4. Client app middleware makes `GET BAPI/v1/clients/handshake_payload?nonce=<nonce_value>` request (BAPI)
  5. BAPI returns array of set-cookie header values
  6. Client app middleware applies headers to the response

  ## Traditional Flow (for payloads ≤2KB)

  No changes. Continues to work as before with direct payload delivery in cookies for optimal performance.

  ## Trade-offs
  - **Added**: One additional BAPI call per handshake (only for payloads >2KB)
  - **Removed**: Cookie size restrictions that previously limited session token size

### Patch Changes

- Ensure `__clerk_synced` is removed from cross-origin return-back urls ([#6196](https://github.com/clerk/javascript/pull/6196)) by [@tmilewski](https://github.com/tmilewski)

- Updated dependencies [[`f1be1fe`](https://github.com/clerk/javascript/commit/f1be1fe3d575c11acd04fc7aadcdec8f89829894), [`bffb42a`](https://github.com/clerk/javascript/commit/bffb42aaf266a188b9ae7d16ace3024d468a3bd4)]:
  - @clerk/types@4.62.0
  - @clerk/shared@3.10.0

## 2.2.0

### Minor Changes

- Add support for `expiresInSeconds` parameter in session token generation. This allows setting custom expiration times for tokens both with and without templates via the backend API. ([#6150](https://github.com/clerk/javascript/pull/6150)) by [@jacekradko](https://github.com/jacekradko)

- - Optimize `auth()` calls to avoid unnecessary verification calls when the provided token type is not in the `acceptsToken` array. ([#6123](https://github.com/clerk/javascript/pull/6123)) by [@wobsoriano](https://github.com/wobsoriano)

  - Add handling for invalid token types when `acceptsToken` is an array in `authenticateRequest()`: now returns a clear unauthenticated state (`tokenType: null`) if the token is not in the accepted list.

- Introduce API keys Backend SDK methods ([#6169](https://github.com/clerk/javascript/pull/6169)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Add logic to ensure that we consider the proxy_url when creating the frontendApi url. ([#6120](https://github.com/clerk/javascript/pull/6120)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`b495279`](https://github.com/clerk/javascript/commit/b4952796e3c7dee4ab4726de63a17b7f4265ce37), [`c3fa15d`](https://github.com/clerk/javascript/commit/c3fa15d60642b4fcbcf26e21caaca0fc60975795), [`52d5e57`](https://github.com/clerk/javascript/commit/52d5e5768d54725b4d20d028135746493e05d44c), [`15a945c`](https://github.com/clerk/javascript/commit/15a945c02a9f6bc8d2f7d1e3534217100bf45936), [`72629b0`](https://github.com/clerk/javascript/commit/72629b06fb1fe720fa2a61462306a786a913e9a8)]:
  - @clerk/types@4.61.0
  - @clerk/shared@3.9.8

## 2.1.0

### Minor Changes

- Improve `subject` property handling for machine auth objects. ([#6099](https://github.com/clerk/javascript/pull/6099)) by [@wobsoriano](https://github.com/wobsoriano)

  Usage:

  ```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  });

  const requestState = await clerkClient.authenticateRequest(request, {
    acceptsToken: 'any',
  });

  const authObject = requestState.toAuth();

  switch (authObject.tokenType) {
    case 'api_key':
      // authObject.userId
      // authObject.orgId
      break;
    case 'machine_token':
      // authObject.machineId
      break;
    case 'oauth_token':
      // authObject.userId
      // authObject.clientId
      break;
  }
  ```

- Respect `acceptsToken` when returning unauthenticated session or machine object. ([#6112](https://github.com/clerk/javascript/pull/6112)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Re-organize internal types for the recently added "machine authentication" feature. ([#6067](https://github.com/clerk/javascript/pull/6067)) by [@wobsoriano](https://github.com/wobsoriano)

- Fix calculation of handshake URL when proxy URL is set on the ClerkProvider ([#6119](https://github.com/clerk/javascript/pull/6119)) by [@jacekradko](https://github.com/jacekradko)

- Add JSdoc comments for user methods. ([#6091](https://github.com/clerk/javascript/pull/6091)) by [@NWylynko](https://github.com/NWylynko)

- Updating type of Verification.status ([#6110](https://github.com/clerk/javascript/pull/6110)) by [@jacekradko](https://github.com/jacekradko)

- Resolve machine token property mixing in discriminated unions ([#6079](https://github.com/clerk/javascript/pull/6079)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`19e9e11`](https://github.com/clerk/javascript/commit/19e9e11af04f13fd12975fbf7016fe0583202056), [`18bcb64`](https://github.com/clerk/javascript/commit/18bcb64a3e8b6d352d7933ed094d68214e6e80fb), [`138f733`](https://github.com/clerk/javascript/commit/138f733f13121487268a4f96e6eb2cffedc6e238), [`48be55b`](https://github.com/clerk/javascript/commit/48be55b61a86e014dd407414764d24bb43fd26f3), [`2c6f805`](https://github.com/clerk/javascript/commit/2c6f805a9e6e4685990f9a8abc740b2d0859a453), [`97749d5`](https://github.com/clerk/javascript/commit/97749d570bc687c7e05cd800a50e0ae4180a371d)]:
  - @clerk/types@4.60.1
  - @clerk/shared@3.9.7

## 2.0.0

### Major Changes

- Introduces machine authentication, supporting four token types: `api_key`, `oauth_token`, `machine_token`, and `session_token`. For backwards compatibility, `session_token` remains the default when no token type is specified. This enables machine-to-machine authentication and use cases such as API keys and OAuth integrations. Existing applications continue to work without modification. ([#5689](https://github.com/clerk/javascript/pull/5689)) by [@wobsoriano](https://github.com/wobsoriano)

  You can specify which token types are allowed by using the `acceptsToken` option in the `authenticateRequest()` function. This option can be set to a specific type, an array of types, or `'any'` to accept all supported tokens.

  Example usage:

  ```ts
  import express from 'express';
  import { clerkClient } from '@clerk/backend';

  const app = express();

  app.use(async (req, res, next) => {
    const requestState = await clerkClient.authenticateRequest(req, {
      acceptsToken: 'any',
    });

    if (!requestState.isAuthenticated) {
      // do something for unauthenticated requests
    }

    const authObject = requestState.toAuth();

    if (authObject.tokenType === 'session_token') {
      console.log('this is session token from a user');
    } else {
      console.log('this is some other type of machine token');
      console.log('more specifically, a ' + authObject.tokenType);
    }

    // Attach the auth object to locals so downstream handlers
    // and middleware can access it
    res.locals.auth = authObject;
    next();
  });
  ```

### Minor Changes

- The `svix` dependency is no longer needed when using the `verifyWebhook()` function. `verifyWebhook()` was refactored to not rely on `svix` anymore while keeping the same functionality and behavior. ([#6059](https://github.com/clerk/javascript/pull/6059)) by [@royanger](https://github.com/royanger)

  If you previously installed `svix` to use `verifyWebhook()` you can uninstall it now:

  ```shell
  npm uninstall svix
  ```

### Patch Changes

- Improve JSDoc comments for verifyWebhook and verifyToken ([#6060](https://github.com/clerk/javascript/pull/6060)) by [@LekoArts](https://github.com/LekoArts)

- Improve JSDoc comments ([#6049](https://github.com/clerk/javascript/pull/6049)) by [@LekoArts](https://github.com/LekoArts)

- Introduce `getAuthObjectFromJwt` as internal utility function that centralizes the logic for generating auth objects from session JWTs. ([#6053](https://github.com/clerk/javascript/pull/6053)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`d8fa5d9`](https://github.com/clerk/javascript/commit/d8fa5d9d3d8dc575260d8d2b7c7eeeb0052d0b0d), [`be2e89c`](https://github.com/clerk/javascript/commit/be2e89ca11aa43d48f74c57a5a34e20d85b4003c), [`5644d94`](https://github.com/clerk/javascript/commit/5644d94f711a0733e4970c3f15c24d56cafc8743), [`b578225`](https://github.com/clerk/javascript/commit/b5782258242474c9b0987a3f8349836cd763f24b), [`8838120`](https://github.com/clerk/javascript/commit/8838120596830b88fec1c6c853371dabfec74a0d)]:
  - @clerk/types@4.60.0
  - @clerk/shared@3.9.6

## 1.34.0

### Minor Changes

- Adds `clerkClient.organizations.getInstanceOrganizationMembershipList` ([#6022](https://github.com/clerk/javascript/pull/6022)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Add `notifyPrimaryEmailAddressChanged` to `client.users.updateUser(...)` ([#6023](https://github.com/clerk/javascript/pull/6023)) by [@tmilewski](https://github.com/tmilewski)

- Updated dependencies [[`f897773`](https://github.com/clerk/javascript/commit/f89777379da63cf45039c1570b51ba10a400817c), [`2c6a0cc`](https://github.com/clerk/javascript/commit/2c6a0cca6e824bafc6b0d0501784517a5b1f75ea), [`71e6a1f`](https://github.com/clerk/javascript/commit/71e6a1f1024d65b7a09cdc8fa81ce0164e0a34cb)]:
  - @clerk/shared@3.9.5
  - @clerk/types@4.59.3

## 1.33.1

### Patch Changes

- Ensure SAMLConnection API responses are explicitly deserialized ([#5993](https://github.com/clerk/javascript/pull/5993)) by [@tmilewski](https://github.com/tmilewski)

- Add missing request params to `getOrganizationMembershipList` ([#5987](https://github.com/clerk/javascript/pull/5987)) by [@tmilewski](https://github.com/tmilewski)

- Updated dependencies [[`6ed3dfc`](https://github.com/clerk/javascript/commit/6ed3dfc1bc742ac9d9a2307fe8e4733411cbc0d7)]:
  - @clerk/types@4.59.2
  - @clerk/shared@3.9.4

## 1.33.0

### Minor Changes

- Introduce `treatPendingAsSignedOut` option to `getAuth` ([#5842](https://github.com/clerk/javascript/pull/5842)) by [@LauraBeatris](https://github.com/LauraBeatris)

  ```ts
  // `pending` sessions will be treated as signed-out by default
  const { userId } = getAuth(req);
  ```

  ```ts
  // Both `active` and `pending` sessions will be treated as authenticated when `treatPendingAsSignedOut` is false
  const { userId } = getAuth(req, { treatPendingAsSignedOut: false });
  ```

### Patch Changes

- Fixes an issue with infinite redirect detection in the handshake flow. ([#5981](https://github.com/clerk/javascript/pull/5981)) by [@brkalow](https://github.com/brkalow)

- Updated dependencies [[`f237d76`](https://github.com/clerk/javascript/commit/f237d7617e5398ca0ba981e4336cac2191505b00)]:
  - @clerk/shared@3.9.3

## 1.32.3

### Patch Changes

- Introduces `createOrganizationInvitationBulk` - it creates new organization invitations in bulk and sends out emails to the provided email addresses with a link to accept the invitation and join the organization. ([#5962](https://github.com/clerk/javascript/pull/5962)) by [@LauraBeatris](https://github.com/LauraBeatris)

  ```ts
  const organizationId = 'org_123';
  const params = [
    {
      inviterUserId: 'user_1',
      emailAddress: 'testclerk1@clerk.dev',
      role: 'org:admin',
    },
    {
      inviterUserId: 'user_2',
      emailAddress: 'testclerk2@clerk.dev',
      role: 'org:member',
    },
  ];

  const response = await clerkClient.organizations.createOrganizationInvitationBulk(organizationId, params);
  ```

- Use domain in AuthenticateRequest only for satellite domains ([#5919](https://github.com/clerk/javascript/pull/5919)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`c305b31`](https://github.com/clerk/javascript/commit/c305b310e351e9ce2012f805b35e464c3e43e310), [`6bb480e`](https://github.com/clerk/javascript/commit/6bb480ef663a6dfa219bc9546aca087d5d9624d0)]:
  - @clerk/types@4.59.1
  - @clerk/shared@3.9.2

## 1.32.2

### Patch Changes

- Updated dependencies [[`b1337df`](https://github.com/clerk/javascript/commit/b1337dfeae8ccf8622efcf095e3201f9bbf1cefa), [`65f0878`](https://github.com/clerk/javascript/commit/65f08788ee5e56242eee2194c73ba90965c75c97), [`df6fefd`](https://github.com/clerk/javascript/commit/df6fefd05fd2df93f5286d97e546b48911adea7c), [`4282bfa`](https://github.com/clerk/javascript/commit/4282bfa09491225bde7d619fe9a3561062703f69), [`5491491`](https://github.com/clerk/javascript/commit/5491491711e0a8ee37828451c1f603a409de32cf)]:
  - @clerk/types@4.59.0
  - @clerk/shared@3.9.1

## 1.32.1

### Patch Changes

- Updated dependencies [[`1ff6d6e`](https://github.com/clerk/javascript/commit/1ff6d6efbe838b3f7f6977b2b5215c2cafd715f6), [`fbf3cf4`](https://github.com/clerk/javascript/commit/fbf3cf4916469c4e118870bf12efca2d0f77d9d8)]:
  - @clerk/shared@3.9.0
  - @clerk/types@4.58.1

## 1.32.0

### Minor Changes

- Add handling of new Handshake nonce flow when authenticating requests ([#5865](https://github.com/clerk/javascript/pull/5865)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Updated dependencies [[`0f5145e`](https://github.com/clerk/javascript/commit/0f5145e164f3d3d5faf57e58162b05e7110d2403), [`afdfd18`](https://github.com/clerk/javascript/commit/afdfd18d645608dec37e52a291a91ba5f42dcbe7), [`b7c51ba`](https://github.com/clerk/javascript/commit/b7c51baac6df1129b468274c9a7f63ca303f16ce), [`437b53b`](https://github.com/clerk/javascript/commit/437b53b67e281d076b5b3f927e11c1d64666d154), [`5217155`](https://github.com/clerk/javascript/commit/52171554250c5c58f4f497b6d3c7416e79ac77da)]:
  - @clerk/types@4.58.0
  - @clerk/shared@3.8.2

## 1.31.4

### Patch Changes

- Updated dependencies [[`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`36fb43f`](https://github.com/clerk/javascript/commit/36fb43f8b35866bdc20680fac58020f036d30d1f), [`e5ac444`](https://github.com/clerk/javascript/commit/e5ac4447f52bb6887ad686feab308fe9daf76e33), [`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`d227805`](https://github.com/clerk/javascript/commit/d22780599a5e29545a3d8309cc411c2e8659beac)]:
  - @clerk/types@4.57.1
  - @clerk/shared@3.8.1

## 1.31.3

### Patch Changes

- Updated dependencies [[`db0138f`](https://github.com/clerk/javascript/commit/db0138f3f72aea8cb68a5684a90123f733848f63), [`aa97231`](https://github.com/clerk/javascript/commit/aa97231962e3f472a46135e376159c6ddcf1157b), [`c792f37`](https://github.com/clerk/javascript/commit/c792f37129fd6475d5af95146e9ef0f1c8eff730), [`3bf08a9`](https://github.com/clerk/javascript/commit/3bf08a9e0a9e65496edac5fc3bb22ad7b561df26), [`74cf3b2`](https://github.com/clerk/javascript/commit/74cf3b28cdf622a942aaf99caabfba74b7e856fd), [`037b113`](https://github.com/clerk/javascript/commit/037b113aaedd53d4647d88f1659eb9c14cf6f275), [`c15a412`](https://github.com/clerk/javascript/commit/c15a412169058e2304a51c9e92ffaa7f6bb2a898), [`7726a03`](https://github.com/clerk/javascript/commit/7726a03a7fec4d292b6de2587b84ed4371984c23), [`ed10566`](https://github.com/clerk/javascript/commit/ed1056637624eec5bfd50333407c1e63e34c193b), [`b846a9a`](https://github.com/clerk/javascript/commit/b846a9ab96db6b1d8344a4b693051618865508a8), [`e66c800`](https://github.com/clerk/javascript/commit/e66c8002b82b2902f77e852e16482f5cfb062d2c), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed), [`9c41091`](https://github.com/clerk/javascript/commit/9c41091eb795bce8ffeeeca0264ae841fe07b426), [`29462b4`](https://github.com/clerk/javascript/commit/29462b433eb411ce614e4768e5844cacd00c1975), [`322c43f`](https://github.com/clerk/javascript/commit/322c43f6807a932c3cfaaef1b587b472c80180d2), [`17397f9`](https://github.com/clerk/javascript/commit/17397f95b715bd4fefd7f63c1d351abcf1c8ee16), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed)]:
  - @clerk/types@4.57.0
  - @clerk/shared@3.8.0

## 1.31.2

### Patch Changes

- Updated dependencies [[`9ec0a73`](https://github.com/clerk/javascript/commit/9ec0a7353e9f6ea661c3d7b9542423b6eb1d29e9), [`d9222fc`](https://github.com/clerk/javascript/commit/d9222fc3c21da2bcae30b06f0b1897f526935582)]:
  - @clerk/types@4.56.3
  - @clerk/shared@3.7.8

## 1.31.1

### Patch Changes

- Updated dependencies [[`225b9ca`](https://github.com/clerk/javascript/commit/225b9ca21aba44930872a85d6b112ee2a1b606b9)]:
  - @clerk/types@4.56.2
  - @clerk/shared@3.7.7

## 1.31.0

### Minor Changes

- Initial stub of the new handshake payload flow with nonce ([#5750](https://github.com/clerk/javascript/pull/5750)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Fix an issue where the handshake redirect was not respecting the supported Clerk API version specified in `@clerk/backend`. ([#5780](https://github.com/clerk/javascript/pull/5780)) by [@brkalow](https://github.com/brkalow)

## 1.30.2

### Patch Changes

- Improve JSDoc comments ([#5751](https://github.com/clerk/javascript/pull/5751)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`387bf62`](https://github.com/clerk/javascript/commit/387bf623406306e0c5c08da937f4930a7ec5e4a5), [`2716622`](https://github.com/clerk/javascript/commit/27166224e12af582298460d438bd7f83ea8e04bf), [`294da82`](https://github.com/clerk/javascript/commit/294da82336e7a345900d7ef9b28f56a7c8864c52)]:
  - @clerk/types@4.56.1
  - @clerk/shared@3.7.6

## 1.30.1

### Patch Changes

- Updated dependencies [[`b02e766`](https://github.com/clerk/javascript/commit/b02e76627e47aec314573586451fa345a089115a), [`5d78b28`](https://github.com/clerk/javascript/commit/5d78b286b63e35fbcf44aac1f7657cbeaba4d659), [`d7f4438`](https://github.com/clerk/javascript/commit/d7f4438fa4bfd04474d5cdb9212ba908568ad6d2), [`5866855`](https://github.com/clerk/javascript/commit/58668550ec91d5511cf775972c54dc485185cc58), [`0007106`](https://github.com/clerk/javascript/commit/00071065998a3676c51e396b4c0afcbf930a9898), [`462b5b2`](https://github.com/clerk/javascript/commit/462b5b271d4e120d58a85818a358b60a6b3c8100), [`447d7a9`](https://github.com/clerk/javascript/commit/447d7a9e133c2a0e7db014bd5837e6ffff08f572), [`2beea29`](https://github.com/clerk/javascript/commit/2beea2957c67bc62446fe24d36332b0a4e850d7d), [`115601d`](https://github.com/clerk/javascript/commit/115601d12fd65dbf3011c0cda368525a2b95bfeb)]:
  - @clerk/types@4.56.0
  - @clerk/shared@3.7.5

## 1.30.0

### Minor Changes

- Adding reportTo and reportOnly configuration options to the contentSecurityPolicy config for clerkMiddleware ([#5702](https://github.com/clerk/javascript/pull/5702)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Updated dependencies [[`8b25035`](https://github.com/clerk/javascript/commit/8b25035aa49382fe1cd1c6f30ec80e86bcf9d66e)]:
  - @clerk/types@4.55.1
  - @clerk/shared@3.7.4

## 1.29.2

### Patch Changes

- Updated dependencies [[`33201bf`](https://github.com/clerk/javascript/commit/33201bf972d6a980617d47ebd776bef76f871833), [`4334598`](https://github.com/clerk/javascript/commit/4334598108ff2cfa3c25b5a46117c1c9c65b7974), [`0ae0403`](https://github.com/clerk/javascript/commit/0ae040303d239b75a3221436354a2c2ecdb85aae)]:
  - @clerk/types@4.55.0
  - @clerk/shared@3.7.3

## 1.29.1

### Patch Changes

- Improve JSDoc comments ([#5643](https://github.com/clerk/javascript/pull/5643)) by [@alexisintech](https://github.com/alexisintech)

- Updated dependencies [[`45486ac`](https://github.com/clerk/javascript/commit/45486acebf4d133efb09a3622a738cdbf4e51d66), [`837692a`](https://github.com/clerk/javascript/commit/837692aa40197b1574783ad36d0d017a771c08e1), [`0c00e59`](https://github.com/clerk/javascript/commit/0c00e59ff4714491650ac9480ae3b327c626d30d), [`6a5f644`](https://github.com/clerk/javascript/commit/6a5f6447a36a635d6201f8bb7619fb844ab21b79)]:
  - @clerk/types@4.54.2
  - @clerk/shared@3.7.2

## 1.29.0

### Minor Changes

- Adds the following functionality for Instances to the Backend API client. ([#5600](https://github.com/clerk/javascript/pull/5600)) by [@tmilewski](https://github.com/tmilewski)

  ```ts
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient(...);

    await clerkClient.instance.get();
    await clerkClient.instance.update({...});
    await clerkClient.instance.updateRestrictions({...});
    await clerkClient.instance.updateOrganizationSettings({...});
  ```

- Adds the ability to perform CRUD operations on OAuth Applications to the Backend API client. ([#5599](https://github.com/clerk/javascript/pull/5599)) by [@tmilewski](https://github.com/tmilewski)

  ```ts
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient(...);

    await clerkClient.oauthApplications.list({...});
    await clerkClient.oauthApplications.get('templateId');
    await clerkClient.oauthApplications.create({...});
    await clerkClient.oauthApplications.update({...});
    await clerkClient.oauthApplications.delete('templateId');
    await clerkClient.oauthApplications.rotateSecret('templateId');
  ```

- Adds domain endpoints to the Backend API client. ([#5621](https://github.com/clerk/javascript/pull/5621)) by [@tmilewski](https://github.com/tmilewski)

  ```ts
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient(...);
    await clerkClient.domains.list();
    await clerkClient.domains.add({...});
    await clerkClient.domains.update({...});
    await clerkClient.domains.delete('satelliteDomainId');
  ```

- Adds the ability to retrieve and update Sign Up Attempts to the Backend API client. ([#5625](https://github.com/clerk/javascript/pull/5625)) by [@tmilewski](https://github.com/tmilewski)

  ```ts
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient(...);

    await clerkClient.signUps.get('signUpAttemptId');
    await clerkClient.signUps.update({...});
  ```

- Adds the ability to change production domains [beta] to the Backend API client. ([#5633](https://github.com/clerk/javascript/pull/5633)) by [@tmilewski](https://github.com/tmilewski)

  ```ts
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient(...);

    await clerkClient.betaFeatures.changeDomain({
      homeUrl: 'https://www.example.com',
      isSecondary: false,
    });
  ```

### Patch Changes

- Append expired status to invitation types ([#5646](https://github.com/clerk/javascript/pull/5646)) by [@tmilewski](https://github.com/tmilewski)

- Improve JSDoc comments ([#5630](https://github.com/clerk/javascript/pull/5630)) by [@LekoArts](https://github.com/LekoArts)

- Include `expiresAt` in OAuth access token resource ([#5631](https://github.com/clerk/javascript/pull/5631)) by [@Nikpolik](https://github.com/Nikpolik)

- Update typing of Organization.slug ([#5636](https://github.com/clerk/javascript/pull/5636)) by [@tmilewski](https://github.com/tmilewski)

- Adds the ability to list and create waitlist entries to the Backend API client. ([#5591](https://github.com/clerk/javascript/pull/5591)) by [@tmilewski](https://github.com/tmilewski)

  ```ts
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient(...);

    await clerkClient.waitlistEntries.list({...});
    await clerkClient.waitlistEntries.create({
      emailAddress: 'you@yourdomain.com',
      notify: true
    });
  ```

- Adds the ability to create and revoke actor tokens to the Backend API client. ([#5585](https://github.com/clerk/javascript/pull/5585)) by [@tmilewski](https://github.com/tmilewski)

  ```ts
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient(...);

    const { id } = await clerkClient.actorTokens.create({...});
    await clerkClient.actorTokens.revoke(id);
  ```

- Updated dependencies [[`ab939fd`](https://github.com/clerk/javascript/commit/ab939fdb29150c376280b42f861a188a33f57dcc), [`03284da`](https://github.com/clerk/javascript/commit/03284da6a93a790ce3e3ebbd871c06e19f5a8803), [`7389ba3`](https://github.com/clerk/javascript/commit/7389ba3164ca0d848fb0a9de5d7e9716925fadcc), [`f6ef841`](https://github.com/clerk/javascript/commit/f6ef841125ff21ca8cae731d1f47f3a101d887e1), [`e634830`](https://github.com/clerk/javascript/commit/e6348301ab56a7868f24c1b9a4dd9e1d60f6027b), [`f8887b2`](https://github.com/clerk/javascript/commit/f8887b2cbd145e8e49bec890e8b6e02e34178d6a)]:
  - @clerk/types@4.54.1
  - @clerk/shared@3.7.1

## 1.28.0

### Minor Changes

- Add support for feature or plan based authorization. ([#5582](https://github.com/clerk/javascript/pull/5582)) by [@panteliselef](https://github.com/panteliselef)

- Adds the ability to grab an instance's JWKS to the Backend API client. ([#5588](https://github.com/clerk/javascript/pull/5588)) by [@tmilewski](https://github.com/tmilewski)

  ```ts
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient(...);
    await clerkClient.jwks.getJWKS();
  ```

- Adds the Blocklist Identifier endpoints to the Backend API client. ([#5617](https://github.com/clerk/javascript/pull/5617)) by [@tmilewski](https://github.com/tmilewski)

  ```ts
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient(...);
    await clerkClient.blocklistIdentifiers.getBlocklistIdentifierList();
    await clerkClient.blocklistIdentifiers.createBlocklistIdentifier({ identifier });
    await clerkClient.blocklistIdentifiers.deleteBlocklistIdentifier('blocklistIdentifierId');
  ```

  Updates the ability paginate Allowlist Identifier reponses and access `identifierType` and `instanceId` from the response.

  ```ts
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient(...);
    const res = await clerkClient.blocklistIdentifiers.getAllowlistIdentifierList({ limit, offset });
  ```

  Corrects the type of the Allowlist Identifier `DeletedObject`

- Adds webhooks endpoints to the Backend API client. ([#5619](https://github.com/clerk/javascript/pull/5619)) by [@tmilewski](https://github.com/tmilewski)

  ```ts
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient(...);
    await clerkClient.webhooks.createSvixApp();
    await clerkClient.webhooks.generateSvixAuthURL();
    await clerkClient.webhooks.deleteSvixApp();
  ```

- Adds the ability to perform CRUD operations on JWT Templates to the Backend API client. ([#5598](https://github.com/clerk/javascript/pull/5598)) by [@tmilewski](https://github.com/tmilewski)

  ```ts
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient(...);

    await clerkClient.jwtTemplates.list({...});
    await clerkClient.jwtTemplates.get('templateId');
    await clerkClient.jwtTemplates.create({...});
    await clerkClient.jwtTemplates.update({...});
    await clerkClient.jwtTemplates.delete('templateId');
  ```

- Adds the ability to create an active session to the Backend API client. ([#5592](https://github.com/clerk/javascript/pull/5592)) by [@tmilewski](https://github.com/tmilewski)

  ```ts
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient(...);
    await clerkClient.sessions.createSession({
      userId: 'user_xxxxxx',
    });
  ```

### Patch Changes

- Add support for phpass_md5 and ldap_ssha hashers ([#5583](https://github.com/clerk/javascript/pull/5583)) by [@Nikpolik](https://github.com/Nikpolik)

- Adds the ability to verify proxy checks to the Backend API client. ([#5589](https://github.com/clerk/javascript/pull/5589)) by [@tmilewski](https://github.com/tmilewski)

  ```ts
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient(...);
    await clerkClient.proxyChecks.verify({
      domainId: 'dmn_xxxxxx',
      proxyUrl: 'https://[your-domain].com'
    });
  ```

- Adds the following User-centric functionality to the Backend API client. ([#5593](https://github.com/clerk/javascript/pull/5593)) by [@tmilewski](https://github.com/tmilewski)

  ```ts
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient(...);

    await clerkClient.users.getOrganizationInvitationList({
      userId: 'user_xxxxxx',
      status: 'pending',
    });
    await clerkClient.users.deleteUserPasskey({
      userId: 'user_xxxxxx',
      passkeyIdentificationId: 'xxxxxxx',
    });
    await clerkClient.users.deleteUserWeb3Wallet({
      userId: 'user_xxxxxx',
      web3WalletIdentificationId: 'xxxxxxx',
    });
    await clerkClient.users.deleteUserExternalAccount({
      userId: 'user_xxxxxx',
      externalAccountId: 'xxxxxxx',
    });
    await clerkClient.users.deleteUserBackupCodes('user_xxxxxx');
    await clerkClient.users.deleteUserTOTP('user_xxxxxx');
  ```

- Improve JSDoc comments ([#5596](https://github.com/clerk/javascript/pull/5596)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`e4d04ae`](https://github.com/clerk/javascript/commit/e4d04aea490ab67e3431729398d3f4c46fc3e7e7), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`93068ea`](https://github.com/clerk/javascript/commit/93068ea9eb19d8c8b9c7ade35d0cd860e08049fc), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`103bc03`](https://github.com/clerk/javascript/commit/103bc03571c8845df205f4c6fd0c871c3368d1d0), [`48438b4`](https://github.com/clerk/javascript/commit/48438b409036088701bda7e1e732d6a51bee8cdc), [`196dcb4`](https://github.com/clerk/javascript/commit/196dcb47928bd22a3382197f8594a590f688faee)]:
  - @clerk/types@4.54.0
  - @clerk/shared@3.7.0

## 1.27.3

### Patch Changes

- Improve JSDoc comments ([#5575](https://github.com/clerk/javascript/pull/5575)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`70c9db9`](https://github.com/clerk/javascript/commit/70c9db9f3b51ba034f76e0cc4cf338e7b406d9b1), [`554242e`](https://github.com/clerk/javascript/commit/554242e16e50c92a6afb6ed74c681b04b9f113b5), [`cc1f9a0`](https://github.com/clerk/javascript/commit/cc1f9a0adb7771b615b0f2994a5ac571b59889dd), [`8186cb5`](https://github.com/clerk/javascript/commit/8186cb564575ac3ce97079ec203865bf5deb05ee)]:
  - @clerk/shared@3.6.0
  - @clerk/types@4.53.0

## 1.27.2

### Patch Changes

- Uses the helper function `__experimental_JWTPayloadToAuthObjectProperties` from `@clerk/shared` to handle the new JWT v2 schema. ([#5549](https://github.com/clerk/javascript/pull/5549)) by [@octoper](https://github.com/octoper)

- Update the supported API version to `2025-04-10` ([#5568](https://github.com/clerk/javascript/pull/5568)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`3ad3bc8`](https://github.com/clerk/javascript/commit/3ad3bc8380b354b0cd952eb58eb6c07650efa0f2), [`cfa94b8`](https://github.com/clerk/javascript/commit/cfa94b88476608edf8c2486e8ec0d3f3f82e0bfb), [`2033919`](https://github.com/clerk/javascript/commit/203391964857b98dae11944799d1e6328439e838), [`5f3cc46`](https://github.com/clerk/javascript/commit/5f3cc460b6b775b5a74746758b8cff11649a877a)]:
  - @clerk/shared@3.5.0
  - @clerk/types@4.52.0

## 1.27.1

### Patch Changes

- Expose the 'external_account.phone_number' property. This represents the associated phone number, if exists, with the specific external account ([#5557](https://github.com/clerk/javascript/pull/5557)) by [@chanioxaris](https://github.com/chanioxaris)

- Updated dependencies [[`f6f275d`](https://github.com/clerk/javascript/commit/f6f275dac5ae83ac0c2016a85a6a0cee9513f224)]:
  - @clerk/types@4.51.1
  - @clerk/shared@3.4.1

## 1.27.0

### Minor Changes

- Introduces `ver` as JWT claim to allow versioning of the session token. ([#5521](https://github.com/clerk/javascript/pull/5521)) by [@octoper](https://github.com/octoper)

- Added constants.Headers.ContentSecurityPolicy and constants.Headers.Nonce ([#5493](https://github.com/clerk/javascript/pull/5493)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Updated dependencies [[`e1ec52b`](https://github.com/clerk/javascript/commit/e1ec52b93038c9cb24e030dc06e53825a384a480), [`bebb6d8`](https://github.com/clerk/javascript/commit/bebb6d8af66b2bb7a4b3bdf96f9d480e65b31ba2), [`d0d5203`](https://github.com/clerk/javascript/commit/d0d5203e4ee9e2e1bed5c00ef0f87f0130f1d298), [`6112420`](https://github.com/clerk/javascript/commit/6112420889f1577fb16d7bfa706aaffe1090093d), [`9b25e31`](https://github.com/clerk/javascript/commit/9b25e311cf5e15f896c7948faa42ace45df364c5)]:
  - @clerk/types@4.51.0
  - @clerk/shared@3.4.0

## 1.26.0

### Minor Changes

- Expose `retryAfter` value on `ClerkAPIResponseError` for 429 responses. ([#5480](https://github.com/clerk/javascript/pull/5480)) by [@dstaley](https://github.com/dstaley)

- Introduce a `verifyWebhook()` function to verify incoming Clerk webhook requests and process the payload. This function handles webhook signature verification using `Svix` and is now available across all backend and fullstack SDKs. ([#5468](https://github.com/clerk/javascript/pull/5468)) by [@wobsoriano](https://github.com/wobsoriano)

  To get started, install [`svix`](https://www.npmjs.com/package/svix), which Clerk uses to verify its webhooks:

  ```shell
  npm install svix
  ```

  Then in your webhook route handler, import `verifyWebhook()` from the Backend SDK:

  ```ts
  // app/api/webhooks/route.ts
  import { verifyWebhook } from '@clerk/backend/webhooks';

  try {
    const evt = await verifyWebhook(req);

    // Do something with payload
    const { id } = evt.data;
    const eventType = evt.type;
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
    console.log('Webhook payload:', body);
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
  }
  ```

  For more information on how to sync Clerk data to your app with webhooks, [see our guide](https://clerk.com/docs/webhooks/sync-data).

- Redirect to tasks on `auth.protect` and `auth.redirectToSignIn` ([#5440](https://github.com/clerk/javascript/pull/5440)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Updated dependencies [[`60a9a51`](https://github.com/clerk/javascript/commit/60a9a51dff7d59e7397536586cf1cfe029bc021b), [`e984494`](https://github.com/clerk/javascript/commit/e984494416dda9a6f04acaaba61f8c2683090961), [`ec4521b`](https://github.com/clerk/javascript/commit/ec4521b4fe56602f524a0c6d1b09d21aef5d8bd0), [`38828ae`](https://github.com/clerk/javascript/commit/38828ae58d6d4e8e3c60945284930179b2b6bb40), [`f30fa75`](https://github.com/clerk/javascript/commit/f30fa750754f19030f932a666d2bdbdf0d86743d), [`9c68678`](https://github.com/clerk/javascript/commit/9c68678e87047e6312b708b775ebfb23a3e22f8a), [`619cde8`](https://github.com/clerk/javascript/commit/619cde8c532d635d910ebbc08ad6abcc025694b4)]:
  - @clerk/shared@3.3.0
  - @clerk/types@4.50.2

## 1.25.8

### Patch Changes

- Updated dependencies [[`e20fb6b`](https://github.com/clerk/javascript/commit/e20fb6b397fb69c9d5af4e321267b82f12a5f127), [`77e6462`](https://github.com/clerk/javascript/commit/77e64628560cab688af214edb5922e67cd68a951)]:
  - @clerk/shared@3.2.3
  - @clerk/types@4.50.1

## 1.25.7

### Patch Changes

- Derive session status from server-side state ([#5447](https://github.com/clerk/javascript/pull/5447)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`1da28a2`](https://github.com/clerk/javascript/commit/1da28a28bf602069b433c15b92df21f682779294), [`a9b618d`](https://github.com/clerk/javascript/commit/a9b618dfa97a0dacc462186c8b2588ad5ddb6902), [`f20dc15`](https://github.com/clerk/javascript/commit/f20dc159f542449e7f5b437b70d3eb3ba04d6975), [`4d9f1ee`](https://github.com/clerk/javascript/commit/4d9f1ee8c22fe1e4a166ff054d0af4d37b829f0a)]:
  - @clerk/types@4.50.0
  - @clerk/shared@3.2.2

## 1.25.6

### Patch Changes

- Update `RevokeOrganizationInvitationParams.requestUserId` to optional ([#5448](https://github.com/clerk/javascript/pull/5448)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`466ed13`](https://github.com/clerk/javascript/commit/466ed136af73b59b267d92ad3296039d1c3a4fcc)]:
  - @clerk/types@4.49.2
  - @clerk/shared@3.2.1

## 1.25.5

### Patch Changes

- Update `@clerk/shared` dependency to use new shared `buildAccountsBaseUrl` utility. ([#5416](https://github.com/clerk/javascript/pull/5416)) by [@dstaley](https://github.com/dstaley)

- Updated dependencies [[`892bc0e`](https://github.com/clerk/javascript/commit/892bc0eee9e0bb04d327eb84b44201fa34806483)]:
  - @clerk/shared@3.2.0

## 1.25.4

### Patch Changes

- Handle Basic auth gracefully ([#5395](https://github.com/clerk/javascript/pull/5395)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`3910ebe`](https://github.com/clerk/javascript/commit/3910ebea85817273f18fd2f3f142dd1c728e2220), [`e513333`](https://github.com/clerk/javascript/commit/e5133330a196c5c3742634cc9c3d3233ff488b0d)]:
  - @clerk/types@4.49.1
  - @clerk/shared@3.1.0

## 1.25.3

### Patch Changes

- Added invitation status `expired` ([#5335](https://github.com/clerk/javascript/pull/5335)) by [@danilofuchs](https://github.com/danilofuchs)

- Refactoring code to remove @ts-ignore directives ([#5323](https://github.com/clerk/javascript/pull/5323)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`725918d`](https://github.com/clerk/javascript/commit/725918df2e74cea15e9b748aaf103a52df8e8500), [`91d0f0b`](https://github.com/clerk/javascript/commit/91d0f0b0dccab7168ad4dc06c8629808938c235f), [`9572bf5`](https://github.com/clerk/javascript/commit/9572bf5bdfb7dc309ec8714989b98ab12174965b), [`39bbc51`](https://github.com/clerk/javascript/commit/39bbc5189a33dc6cebdc269ac2184dc4ffff2534), [`3dddcda`](https://github.com/clerk/javascript/commit/3dddcda191d8f8d6a9b02464f1f6374d3c6aacb9), [`7524943`](https://github.com/clerk/javascript/commit/7524943300d7e693d61cc1820b520abfadec1c64), [`150b5c8`](https://github.com/clerk/javascript/commit/150b5c89477abb0feab15e0a886179473f653cac), [`23c931e`](https://github.com/clerk/javascript/commit/23c931e9e95e6de992549ad499b477aca9a9c344), [`730262f`](https://github.com/clerk/javascript/commit/730262f0f973923c8749b09078c80c2fc966a8ec), [`0b18bb1`](https://github.com/clerk/javascript/commit/0b18bb1fe6fa3ded97547bb6b4d2c73030aad329), [`021bc5f`](https://github.com/clerk/javascript/commit/021bc5f40044d34e49956ce3c9b61d833d815b42), [`1a61390`](https://github.com/clerk/javascript/commit/1a61390d3482bd4af58508b972ad89dea56fa224)]:
  - @clerk/types@4.49.0
  - @clerk/shared@3.0.2

## 1.25.2

### Patch Changes

- Change sampling rate of telemetry events to 0.1. ([#5297](https://github.com/clerk/javascript/pull/5297)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`75879672c5805bfba1caca906ac0729497744164`](https://github.com/clerk/javascript/commit/75879672c5805bfba1caca906ac0729497744164), [`7ec95a7e59033600958aca4b86f3bcd5da947dec`](https://github.com/clerk/javascript/commit/7ec95a7e59033600958aca4b86f3bcd5da947dec), [`3c225d90227141dc62d955e76c7f8e0202524bc7`](https://github.com/clerk/javascript/commit/3c225d90227141dc62d955e76c7f8e0202524bc7), [`2a66c16af08573000bb619607346ac420cd4ce56`](https://github.com/clerk/javascript/commit/2a66c16af08573000bb619607346ac420cd4ce56)]:
  - @clerk/shared@3.0.1
  - @clerk/types@4.48.0

## 1.25.1

### Patch Changes

- Add .raw property to `Invitation`, `Organization`, `OrganizationInvitation` and `OrganizationMembership` ([#5291](https://github.com/clerk/javascript/pull/5291)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.25.0

### Minor Changes

- Add waitlist entry types ([#5148](https://github.com/clerk/javascript/pull/5148)) by [@mackenzienolan](https://github.com/mackenzienolan)
  - `WaitlistEntryJSON`
  - `WaitlistEntryWebhookEvent`

  Update `WebhookEvent` to include `WaitlistEntryWebhookEvent`

### Patch Changes

- Update `CreateOrganizationInvitationParams.inviterUserId` type to optional ([#5255](https://github.com/clerk/javascript/pull/5255)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Bug fix: Properly remove `Authorization` header on requests that don't require a secret key. ([#5252](https://github.com/clerk/javascript/pull/5252)) by [@panteliselef](https://github.com/panteliselef)

## 1.24.3

### Patch Changes

- Updated dependencies [[`28179323d9891bd13625e32c5682a3276e73cdae`](https://github.com/clerk/javascript/commit/28179323d9891bd13625e32c5682a3276e73cdae), [`7ae77b74326e378bf161e29886ee82e1556d9840`](https://github.com/clerk/javascript/commit/7ae77b74326e378bf161e29886ee82e1556d9840), [`c5c246ce91c01db9f1eaccbd354f646bcd24ec0a`](https://github.com/clerk/javascript/commit/c5c246ce91c01db9f1eaccbd354f646bcd24ec0a), [`bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a`](https://github.com/clerk/javascript/commit/bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a), [`382c30240f563e58bc4d4832557c6825da40ce7f`](https://github.com/clerk/javascript/commit/382c30240f563e58bc4d4832557c6825da40ce7f)]:
  - @clerk/types@4.47.0
  - @clerk/shared@3.0.0

## 1.24.2

### Patch Changes

- Updated dependencies [[`d76c4699990b8477745c2584b1b98d5c92f9ace6`](https://github.com/clerk/javascript/commit/d76c4699990b8477745c2584b1b98d5c92f9ace6), [`a9b0087fca3f427f65907b358d9b5bc0c95921d8`](https://github.com/clerk/javascript/commit/a9b0087fca3f427f65907b358d9b5bc0c95921d8), [`92d17d7c087470b262fa5407cb6720fe6b17d333`](https://github.com/clerk/javascript/commit/92d17d7c087470b262fa5407cb6720fe6b17d333)]:
  - @clerk/shared@2.22.0
  - @clerk/types@4.46.1

## 1.24.1

### Patch Changes

- Adds an internal `raw()` getter method to the `User` resource that returns the raw JSON payload of the request that instantiated the resource. ([#5130](https://github.com/clerk/javascript/pull/5130)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`dd2cbfe9f30358b6b298901bb52fa378b0acdca3`](https://github.com/clerk/javascript/commit/dd2cbfe9f30358b6b298901bb52fa378b0acdca3), [`570d8386f6aa596bf7bb1659bdddb8dd4d992b1d`](https://github.com/clerk/javascript/commit/570d8386f6aa596bf7bb1659bdddb8dd4d992b1d)]:
  - @clerk/types@4.46.0
  - @clerk/shared@2.21.1

## 1.24.0

### Minor Changes

- Add organizationId to GetOrganizationListParams ([#4882](https://github.com/clerk/javascript/pull/4882)) by [@jacekradko](https://github.com/jacekradko)

- Deprecate usage of the `oauth_` prefix in `client.users.getUserOauthAccessToken()`. Going forward, please use the provider name without that prefix. Example: ([#5097](https://github.com/clerk/javascript/pull/5097)) by [@panteliselef](https://github.com/panteliselef)

  ```diff
  - client.users.getUserOauthAccessToken('user_id', 'oauth_google')
  + client.users.getUserOauthAccessToken('user_id', 'google')
  ```

### Patch Changes

- Adds types for organization domain webhook events ([#4819](https://github.com/clerk/javascript/pull/4819)) by [@ijxy](https://github.com/ijxy)

- Updated dependencies [[`f41081c563ddd2afc05b837358e0de087ae0c895`](https://github.com/clerk/javascript/commit/f41081c563ddd2afc05b837358e0de087ae0c895), [`767ac85fe6ce0ee0594c923e9af701bb05f40a0b`](https://github.com/clerk/javascript/commit/767ac85fe6ce0ee0594c923e9af701bb05f40a0b), [`225b38c7187d31fc755155ea99834ca03894d36b`](https://github.com/clerk/javascript/commit/225b38c7187d31fc755155ea99834ca03894d36b), [`429f1bfe5f7a554ab1fdf265475ba6c8b3f78472`](https://github.com/clerk/javascript/commit/429f1bfe5f7a554ab1fdf265475ba6c8b3f78472)]:
  - @clerk/shared@2.21.0
  - @clerk/types@4.45.1

## 1.23.11

### Patch Changes

- Updated dependencies [[`d3152be7f01fbb5ca26aeddc2437021f4b7ecc83`](https://github.com/clerk/javascript/commit/d3152be7f01fbb5ca26aeddc2437021f4b7ecc83), [`f976349243da2b75023e59e802460e6f3592ebbd`](https://github.com/clerk/javascript/commit/f976349243da2b75023e59e802460e6f3592ebbd)]:
  - @clerk/types@4.45.0
  - @clerk/shared@2.20.18

## 1.23.10

### Patch Changes

- Updated dependencies [[`26225f2c31a22560f7ece2e02f1d0080b5b89520`](https://github.com/clerk/javascript/commit/26225f2c31a22560f7ece2e02f1d0080b5b89520), [`833693a6792b621e72162d70673e7bdfa84a69b6`](https://github.com/clerk/javascript/commit/833693a6792b621e72162d70673e7bdfa84a69b6)]:
  - @clerk/shared@2.20.17
  - @clerk/types@4.44.3

## 1.23.9

### Patch Changes

- Mark keyless onboarding as complete when stored keys match explicit keys ([#4971](https://github.com/clerk/javascript/pull/4971)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`a309be354275b91a7b17d5a67e8ef6aa230a9935`](https://github.com/clerk/javascript/commit/a309be354275b91a7b17d5a67e8ef6aa230a9935), [`1345cb487970a7347351897e80dfb829d85c41ea`](https://github.com/clerk/javascript/commit/1345cb487970a7347351897e80dfb829d85c41ea)]:
  - @clerk/shared@2.20.16
  - @clerk/types@4.44.2

## 1.23.8

### Patch Changes

- Improve JSDoc comments to provide you with better IntelliSense information in your IDE ([#4994](https://github.com/clerk/javascript/pull/4994)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`57c983fdc2b8d883623a2294daae0ac6c02c48f6`](https://github.com/clerk/javascript/commit/57c983fdc2b8d883623a2294daae0ac6c02c48f6), [`a26cf0ff10c76244975c454fdf6c615475d4bcd5`](https://github.com/clerk/javascript/commit/a26cf0ff10c76244975c454fdf6c615475d4bcd5)]:
  - @clerk/types@4.44.1
  - @clerk/shared@2.20.15

## 1.23.7

### Patch Changes

- Updated dependencies [[`2179690c10a61b117e82fdd566b34939f4d28bc1`](https://github.com/clerk/javascript/commit/2179690c10a61b117e82fdd566b34939f4d28bc1), [`bdb537a9902c0f0ae58ca1d4b7590d929f28fedb`](https://github.com/clerk/javascript/commit/bdb537a9902c0f0ae58ca1d4b7590d929f28fedb)]:
  - @clerk/types@4.44.0
  - @clerk/shared@2.20.14

## 1.23.6

### Patch Changes

- Add `orderBy` to `getOrganizationMembershipList` ([#4976](https://github.com/clerk/javascript/pull/4976)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`f87ede848265d75ea1e880a3ab80c53a250f42cf`](https://github.com/clerk/javascript/commit/f87ede848265d75ea1e880a3ab80c53a250f42cf), [`6126cc98281bca96797fd8a55b6ec6aeda397e46`](https://github.com/clerk/javascript/commit/6126cc98281bca96797fd8a55b6ec6aeda397e46), [`6e096564a459db4eaf953e99e570905b10be6c84`](https://github.com/clerk/javascript/commit/6e096564a459db4eaf953e99e570905b10be6c84)]:
  - @clerk/shared@2.20.13
  - @clerk/types@4.43.0

## 1.23.5

### Patch Changes

- Updated dependencies [[`fe3e49f61acefe8d7f1992405f7cb415fea2e5c8`](https://github.com/clerk/javascript/commit/fe3e49f61acefe8d7f1992405f7cb415fea2e5c8), [`4427c4702f64d4f28f7564ce5889d41e260aa519`](https://github.com/clerk/javascript/commit/4427c4702f64d4f28f7564ce5889d41e260aa519)]:
  - @clerk/types@4.42.0
  - @clerk/shared@2.20.12

## 1.23.4

### Patch Changes

- Updated dependencies [[`418ec5c62c4eb600566faab07684c068a29007e3`](https://github.com/clerk/javascript/commit/418ec5c62c4eb600566faab07684c068a29007e3)]:
  - @clerk/types@4.41.2
  - @clerk/shared@2.20.11

## 1.23.3

### Patch Changes

- Updated dependencies [[`9eef7713212378351e8e01628611eaa18de250e8`](https://github.com/clerk/javascript/commit/9eef7713212378351e8e01628611eaa18de250e8)]:
  - @clerk/shared@2.20.10

## 1.23.2

### Patch Changes

- Updated dependencies [[`7ffc99b48977b9f6c74c0c71c500b60cb8aba65e`](https://github.com/clerk/javascript/commit/7ffc99b48977b9f6c74c0c71c500b60cb8aba65e)]:
  - @clerk/types@4.41.1
  - @clerk/shared@2.20.9

## 1.23.1

### Patch Changes

- Updated dependencies [[`4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d`](https://github.com/clerk/javascript/commit/4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d), [`aa48b1f9e890b2402e9d05989a4820141076f7bf`](https://github.com/clerk/javascript/commit/aa48b1f9e890b2402e9d05989a4820141076f7bf), [`53bd34fff38b17498edf66cc4bc2d42d707f28dc`](https://github.com/clerk/javascript/commit/53bd34fff38b17498edf66cc4bc2d42d707f28dc)]:
  - @clerk/types@4.41.0
  - @clerk/shared@2.20.8

## 1.23.0

### Minor Changes

- `authenticateRequest()` will now set a refreshsed session cookie on the response when an expired session token is refreshed via the Clerk API. ([#4884](https://github.com/clerk/javascript/pull/4884)) by [@brkalow](https://github.com/brkalow)

### Patch Changes

- Add property `query` to `GetInvitationListParams` to allow filtering based on `email_address` or `id`. ([#4804](https://github.com/clerk/javascript/pull/4804)) by [@effektsvk](https://github.com/effektsvk)

- Updated dependencies [[`fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6`](https://github.com/clerk/javascript/commit/fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6)]:
  - @clerk/types@4.40.3
  - @clerk/shared@2.20.7

## 1.22.0

### Minor Changes

- Update Session resource with new properties to align with OpenAPI spec ([#4869](https://github.com/clerk/javascript/pull/4869)) by [@octoper](https://github.com/octoper)
  - `lastActiveOrganizationId`
  - `latestActivity`
  - `actor`

### Patch Changes

- Fixes an issue with the satellite sync flow for development instances. ([#4864](https://github.com/clerk/javascript/pull/4864)) by [@BRKalow](https://github.com/BRKalow)

- Upgrading cookies@1.0.2 and snakecase-keys@8.0.1 ([#4881](https://github.com/clerk/javascript/pull/4881)) by [@renovate](https://github.com/apps/renovate)

## 1.21.6

### Patch Changes

- Add type-level validation to prevent server-side usage of system permissions ([#4816](https://github.com/clerk/javascript/pull/4816)) by [@LauraBeatris](https://github.com/LauraBeatris)

  System permissions (e.g., `org:sys_domains:manage`) are intentionally excluded from session claims to maintain reasonable JWT sizes. For more information, refer to our docs: https://clerk.com/docs/organizations/roles-permissions#system-permissions

- Updated dependencies [[`44cab6038af0a4d23869b3b292ece742fbbc4d85`](https://github.com/clerk/javascript/commit/44cab6038af0a4d23869b3b292ece742fbbc4d85)]:
  - @clerk/types@4.40.2
  - @clerk/shared@2.20.6

## 1.21.5

### Patch Changes

- Updated dependencies [[`80e1117631d35834705119a79cdcf9e0ed423fdd`](https://github.com/clerk/javascript/commit/80e1117631d35834705119a79cdcf9e0ed423fdd)]:
  - @clerk/types@4.40.1
  - @clerk/shared@2.20.5

## 1.21.4

### Patch Changes

- Allow to create and update SAML connections with organization IDs. ([#4792](https://github.com/clerk/javascript/pull/4792)) by [@LauraBeatris](https://github.com/LauraBeatris)

  When users sign in or up using an organization's SAML connection, they're automatically added as members of that organization. For more information, refer to our docs: https://clerk.com/docs/organizations/manage-sso

- Updated dependencies [[`c9da04636ffe1ba804a1ce5e5b79027d3a2344d2`](https://github.com/clerk/javascript/commit/c9da04636ffe1ba804a1ce5e5b79027d3a2344d2)]:
  - @clerk/types@4.40.0
  - @clerk/shared@2.20.4

## 1.21.3

### Patch Changes

- Updated dependencies [[`84ccb0049041534f111be65f7c7d4d6120069446`](https://github.com/clerk/javascript/commit/84ccb0049041534f111be65f7c7d4d6120069446)]:
  - @clerk/shared@2.20.3

## 1.21.2

### Patch Changes

- Updated dependencies [[`aeafa7c5efd50c893d088ac99199d7eaecc04025`](https://github.com/clerk/javascript/commit/aeafa7c5efd50c893d088ac99199d7eaecc04025), [`acd9326ef2d6942b981b3ee59c4b20ddd303323d`](https://github.com/clerk/javascript/commit/acd9326ef2d6942b981b3ee59c4b20ddd303323d)]:
  - @clerk/types@4.39.4
  - @clerk/shared@2.20.2

## 1.21.1

### Patch Changes

- Add property `api_keys_url` in the `AccountlessApplication` class ([#4755](https://github.com/clerk/javascript/pull/4755)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`66ad299e4b6496ea4a93799de0f1ecfad920ddad`](https://github.com/clerk/javascript/commit/66ad299e4b6496ea4a93799de0f1ecfad920ddad), [`dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d`](https://github.com/clerk/javascript/commit/dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d), [`e1748582d0c89462f48a482a7805871b7065fa19`](https://github.com/clerk/javascript/commit/e1748582d0c89462f48a482a7805871b7065fa19), [`7f7edcaa8228c26d19e9081979100ada7e982095`](https://github.com/clerk/javascript/commit/7f7edcaa8228c26d19e9081979100ada7e982095), [`dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d`](https://github.com/clerk/javascript/commit/dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d)]:
  - @clerk/shared@2.20.1
  - @clerk/types@4.39.3

## 1.21.0

### Minor Changes

- Switching to use ^ for semver ranges of internal @clerk/ production dependencies. ([#4664](https://github.com/clerk/javascript/pull/4664)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Updated dependencies [[`ffa631d2480cfe77bf08c61b1302ace308e5b630`](https://github.com/clerk/javascript/commit/ffa631d2480cfe77bf08c61b1302ace308e5b630)]:
  - @clerk/shared@2.20.0

## 1.20.3

### Patch Changes

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/types@4.39.2
  - @clerk/shared@2.19.4

## 1.20.2

### Patch Changes

- Add missing `reservedForSecondFactor` property to `CreatePhoneNumberParams` and `UpdatePhoneNumberParams` types. ([#4730](https://github.com/clerk/javascript/pull/4730)) by [@tmoran-stenoa](https://github.com/tmoran-stenoa)

- Updated dependencies [[`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/types@4.39.1
  - @clerk/shared@2.19.3

## 1.20.1

### Patch Changes

- Updated dependencies [[`4cb22548da81dd8b186a6ef1cf120aea99c85c62`](https://github.com/clerk/javascript/commit/4cb22548da81dd8b186a6ef1cf120aea99c85c62)]:
  - @clerk/shared@2.19.2

## 1.20.0

### Minor Changes

- New **experimental** API: `AccountlessApplicationAPI` ([#4602](https://github.com/clerk/javascript/pull/4602)) by [@panteliselef](https://github.com/panteliselef)

  Inside `clerkClient` you can activate this new API through `__experimental_accountlessApplications`. It allows you to generate an "accountless" application and the API returns the publishable key, secret key, and an URL as a response. The URL allows a user to claim this application with their account. Hence the name "accountless" because in its initial state the application is not attached to any account yet.

### Patch Changes

- Updated dependencies [[`550c7e9851329688e37be29b83ea0c3b12482af7`](https://github.com/clerk/javascript/commit/550c7e9851329688e37be29b83ea0c3b12482af7), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99)]:
  - @clerk/types@4.39.0
  - @clerk/shared@2.19.1

## 1.19.2

### Patch Changes

- Updated dependencies [[`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3), [`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3)]:
  - @clerk/shared@2.19.0
  - @clerk/types@4.38.0

## 1.19.1

### Patch Changes

- Updated dependencies [[`4e5e7f463c12893a21cb3b5f9317fc3f2945879b`](https://github.com/clerk/javascript/commit/4e5e7f463c12893a21cb3b5f9317fc3f2945879b)]:
  - @clerk/types@4.37.0
  - @clerk/shared@2.18.1

## 1.19.0

### Minor Changes

- Allow creating organizations without an initial owner to facilitate B2B onboarding flows ([#4670](https://github.com/clerk/javascript/pull/4670)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Updated dependencies [[`8ee5d84995fa17532491ff96efac5738c9bcd9ef`](https://github.com/clerk/javascript/commit/8ee5d84995fa17532491ff96efac5738c9bcd9ef), [`09fedd1df155d30cc055ce701b133aa6470e9b47`](https://github.com/clerk/javascript/commit/09fedd1df155d30cc055ce701b133aa6470e9b47), [`235eaae4c3c9400492fca47d20a47c7081041565`](https://github.com/clerk/javascript/commit/235eaae4c3c9400492fca47d20a47c7081041565)]:
  - @clerk/types@4.36.0
  - @clerk/shared@2.18.0

## 1.18.1

### Patch Changes

- Update the supported API version to `2024-10-01` that includes the following changes ([#4596](https://github.com/clerk/javascript/pull/4596)) by [@Nikpolik](https://github.com/Nikpolik)

  No changes affecting the Backend API have been made in this version.

  Read more in the [API Version docs](https://clerk.com/docs/backend-requests/versioning/available-versions#2024-10-01)

- Updated dependencies [[`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d)]:
  - @clerk/types@4.35.1
  - @clerk/shared@2.17.1

## 1.18.0

### Minor Changes

- Update AuthObject property from `__experimental_factorVerificationAge` to `factorVerificationAge`. ([#4536](https://github.com/clerk/javascript/pull/4536)) by [@panteliselef](https://github.com/panteliselef)

  Also replaces the following APIs:
  - `__experimental_reverificationError` -> `__reverificationError`
  - `__experimental_reverificationErrorResponse` -> `reverificationErrorResponse`

### Patch Changes

- Updated dependencies [[`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`d84d7e31235c5c7da3415981dc76db4473a71a39`](https://github.com/clerk/javascript/commit/d84d7e31235c5c7da3415981dc76db4473a71a39), [`dce4f7ffca7248c0500f0ec9a978672b1f2fad69`](https://github.com/clerk/javascript/commit/dce4f7ffca7248c0500f0ec9a978672b1f2fad69)]:
  - @clerk/shared@2.17.0
  - @clerk/types@4.35.0

## 1.17.2

### Patch Changes

- Updated dependencies [[`c70994b5b6f92a6550dfe37547f01bbfa810c223`](https://github.com/clerk/javascript/commit/c70994b5b6f92a6550dfe37547f01bbfa810c223), [`7623a99594e7329200b6b374e483152d7679ce66`](https://github.com/clerk/javascript/commit/7623a99594e7329200b6b374e483152d7679ce66)]:
  - @clerk/types@4.34.2
  - @clerk/shared@2.16.1

## 1.17.1

### Patch Changes

- Updated dependencies [[`e47eb5882a7fd4a8dee25933c6644790d6ea3407`](https://github.com/clerk/javascript/commit/e47eb5882a7fd4a8dee25933c6644790d6ea3407), [`273d16cb0665d4d960838cb294dc356f41814745`](https://github.com/clerk/javascript/commit/273d16cb0665d4d960838cb294dc356f41814745), [`6b0961765e1f3d09679be4b163fa13ac7dd97191`](https://github.com/clerk/javascript/commit/6b0961765e1f3d09679be4b163fa13ac7dd97191)]:
  - @clerk/shared@2.16.0
  - @clerk/types@4.34.1

## 1.17.0

### Minor Changes

- Rename `reverificationMismatch` to `reverificationError`. ([#4582](https://github.com/clerk/javascript/pull/4582)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`536fa996ff84a545678a3036b28409824d1c00dd`](https://github.com/clerk/javascript/commit/536fa996ff84a545678a3036b28409824d1c00dd), [`b28c5e8bc44885bf6b1533df48e872ba90c387da`](https://github.com/clerk/javascript/commit/b28c5e8bc44885bf6b1533df48e872ba90c387da)]:
  - @clerk/shared@2.15.0

## 1.16.4

### Patch Changes

- Updated dependencies [[`46faeb6f59b19c963fb137c858347525b1cd9e19`](https://github.com/clerk/javascript/commit/46faeb6f59b19c963fb137c858347525b1cd9e19), [`ea6c52dd751abe38b350ee07f148652c24125e22`](https://github.com/clerk/javascript/commit/ea6c52dd751abe38b350ee07f148652c24125e22)]:
  - @clerk/shared@2.14.0
  - @clerk/types@4.34.0

## 1.16.3

### Patch Changes

- Updated dependencies [[`1c0b5001f7f975a2f3f54ad692526ecf7257847e`](https://github.com/clerk/javascript/commit/1c0b5001f7f975a2f3f54ad692526ecf7257847e), [`6217a3f7c94311d49f873214bd406961e0b8d6f7`](https://github.com/clerk/javascript/commit/6217a3f7c94311d49f873214bd406961e0b8d6f7), [`1783025cdb94c447028704c2121fa0b8af785904`](https://github.com/clerk/javascript/commit/1783025cdb94c447028704c2121fa0b8af785904)]:
  - @clerk/types@4.33.0
  - @clerk/shared@2.13.0

## 1.16.2

### Patch Changes

- Fixes satellite syncing when both the satellite and the primary apps use server-side enabled frameworks like NextJS ([#4516](https://github.com/clerk/javascript/pull/4516)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.16.1

### Patch Changes

- Updated dependencies [[`7dbad4c5abd226d7b10941a626ead5d85b1a3f24`](https://github.com/clerk/javascript/commit/7dbad4c5abd226d7b10941a626ead5d85b1a3f24)]:
  - @clerk/types@4.32.0
  - @clerk/shared@2.12.1

## 1.16.0

### Minor Changes

- Send API version through request headers. ([#4458](https://github.com/clerk/javascript/pull/4458)) by [@jacekradko](https://github.com/jacekradko)

- Introduce experimental verification helpers exported from `@clerk/backend/internal` ([#4480](https://github.com/clerk/javascript/pull/4480)) by [@panteliselef](https://github.com/panteliselef)
  - \_\_experimental_reverificationMismatch
  - \_\_experimental_reverificationMismatchResponse

### Patch Changes

- Updated dependencies [[`5a21de1f46df3642828dc27e4862263c9858da2b`](https://github.com/clerk/javascript/commit/5a21de1f46df3642828dc27e4862263c9858da2b), [`f7472e22877f62fc7f3c8d3efe409ff2276fb4a3`](https://github.com/clerk/javascript/commit/f7472e22877f62fc7f3c8d3efe409ff2276fb4a3), [`e199037b8f484abdeeb9fc24455a1b4b8c31c8dd`](https://github.com/clerk/javascript/commit/e199037b8f484abdeeb9fc24455a1b4b8c31c8dd), [`886e294a8d8c54b39cd5bda88d46b89eace3861e`](https://github.com/clerk/javascript/commit/886e294a8d8c54b39cd5bda88d46b89eace3861e), [`0e443ad7c76643420b50e5b169193e03f6ef79f9`](https://github.com/clerk/javascript/commit/0e443ad7c76643420b50e5b169193e03f6ef79f9), [`cc24c8145f1eea7fb91550f2c3e0bac3993e4320`](https://github.com/clerk/javascript/commit/cc24c8145f1eea7fb91550f2c3e0bac3993e4320)]:
  - @clerk/shared@2.12.0
  - @clerk/types@4.31.0

## 1.15.7

### Patch Changes

- Updated dependencies [[`8a04ae47b8305f994b348301fd8134d5baf02943`](https://github.com/clerk/javascript/commit/8a04ae47b8305f994b348301fd8134d5baf02943)]:
  - @clerk/shared@2.11.5

## 1.15.6

### Patch Changes

- Updated dependencies [[`d74a6a7c0f291104c6bba722a8c432814d7b336e`](https://github.com/clerk/javascript/commit/d74a6a7c0f291104c6bba722a8c432814d7b336e), [`1a0c8fe665869e732d3c800bde0f5219fce54301`](https://github.com/clerk/javascript/commit/1a0c8fe665869e732d3c800bde0f5219fce54301), [`0800fc3f1f4e1b6a1d13f5c02557001a283af6e8`](https://github.com/clerk/javascript/commit/0800fc3f1f4e1b6a1d13f5c02557001a283af6e8)]:
  - @clerk/types@4.30.0
  - @clerk/shared@2.11.4

## 1.15.5

### Patch Changes

- Updated dependencies [[`a7726cc12a824b278f6d2a37cb1901c38c5f70dc`](https://github.com/clerk/javascript/commit/a7726cc12a824b278f6d2a37cb1901c38c5f70dc)]:
  - @clerk/shared@2.11.3

## 1.15.2

### Patch Changes

- Updated dependencies [[`f875463da`](https://github.com/clerk/javascript/commit/f875463da9692f2d173b6d5388743cf720750ae3), [`5be7ca9fd`](https://github.com/clerk/javascript/commit/5be7ca9fd239c937cc88e20ce8f5bfc9f3b84f22), [`08c5a2add`](https://github.com/clerk/javascript/commit/08c5a2add6872c76e62fc0df06db723e3728452e), [`434b432f8`](https://github.com/clerk/javascript/commit/434b432f8c114825120eef0f2c278b8142ed1563)]:
  - @clerk/types@4.29.0
  - @clerk/shared@2.11.0

## 1.15.1

### Patch Changes

- Add the 'session-token-expired-refresh-unexpected-bapi-error' debug handshake reason. ([#4363](https://github.com/clerk/javascript/pull/4363)) by [@anagstef](https://github.com/anagstef)

- Updated dependencies [[`3fdcdbf88`](https://github.com/clerk/javascript/commit/3fdcdbf88c38facf8b82563f634ec1b6604fd8e5)]:
  - @clerk/types@4.28.0
  - @clerk/shared@2.10.1

## 1.15.0

### Minor Changes

- - Added `legalAcceptedAt` on `User` ([#4367](https://github.com/clerk/javascript/pull/4367)) by [@octoper](https://github.com/octoper)

  - Added `legalAcceptedAt` and `skipLegalChecks` on `CreateUserParams` and `UpdateUserParams`
  - Added `legal_accepted_at` on `UserJSON`

### Patch Changes

- Updated dependencies [[`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc), [`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc)]:
  - @clerk/shared@2.10.0
  - @clerk/types@4.27.0

## 1.14.1

### Patch Changes

- Remove console error message from refresh token flow failures. ([#4351](https://github.com/clerk/javascript/pull/4351)) by [@anagstef](https://github.com/anagstef)

## 1.14.0

### Minor Changes

- Updates `organizationPatterns` to take precedence over `personalAccountPatterns` in `organizationSyncOptions` ([#4320](https://github.com/clerk/javascript/pull/4320)) by [@izaaklauer](https://github.com/izaaklauer)

- Use EIP-4361 message spec for Web3 wallets sign in signature requests ([#4334](https://github.com/clerk/javascript/pull/4334)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Updated dependencies [[`e81d45b72`](https://github.com/clerk/javascript/commit/e81d45b72c81403c7c206dac5454de1fef6bec57), [`752ce9bfa`](https://github.com/clerk/javascript/commit/752ce9bfa47a8eebd38cd272eeb58ae26fea3371), [`99cdf9b67`](https://github.com/clerk/javascript/commit/99cdf9b67d1e99e66cc73d8a5bfce1f1f8df1b83), [`ce40ff6f0`](https://github.com/clerk/javascript/commit/ce40ff6f0d3bc79e33375be6dd5e03f140a07000), [`2102052c0`](https://github.com/clerk/javascript/commit/2102052c017065ab511339870fcebaa6719f2702)]:
  - @clerk/types@4.26.0
  - @clerk/shared@2.9.2

## 1.13.10

### Patch Changes

- Updated dependencies [[`d64e54c40`](https://github.com/clerk/javascript/commit/d64e54c40c9cf001b25e45a1b8939c9f7e80c6d6), [`2ba2fd148`](https://github.com/clerk/javascript/commit/2ba2fd1483b7561d7df9a1952ead0ee15e422131)]:
  - @clerk/shared@2.9.1
  - @clerk/types@4.25.1

## 1.13.9

### Patch Changes

- Expose `permissions` field for `OrganizationMembership` resource ([#4310](https://github.com/clerk/javascript/pull/4310)) by [@dstaley](https://github.com/dstaley)

- Introduces organizationSyncOptions option to clerkMiddleware, which syncs an active organization or personal account from a URL to the Clerk session. (https://github.com/clerk/javascript/pull/3977) by [@izaaklauer](https://github.com/izaaklauer)

## 1.13.8

### Patch Changes

- Updated dependencies [[`fb932e5cf`](https://github.com/clerk/javascript/commit/fb932e5cf21315adf60bee0855b6bd5ee2ff9867)]:
  - @clerk/shared@2.9.0
  - @clerk/types@4.25.0

## 1.13.7

### Patch Changes

- Updated dependencies [[`f6fb8b53d`](https://github.com/clerk/javascript/commit/f6fb8b53d236863ad7eca576ee7a16cd33f3506b), [`4a8570590`](https://github.com/clerk/javascript/commit/4a857059059a02bb4f20893e08601e1e67babbed)]:
  - @clerk/types@4.24.0
  - @clerk/shared@2.8.5

## 1.13.6

### Patch Changes

- Add the 'session-token-expired-refresh-expired-session-token-missing-sid-claim' handshake reason for debugging purposes ([#4237](https://github.com/clerk/javascript/pull/4237)) by [@anagstef](https://github.com/anagstef)

- Update `uploaderUserId` parameter on `updateOrganizationLogo` to be optional. ([#4236](https://github.com/clerk/javascript/pull/4236)) by [@izaaklauer](https://github.com/izaaklauer)

- Handle "Cannot convert argument to a ByteString" errors ([#4244](https://github.com/clerk/javascript/pull/4244)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.13.5

### Patch Changes

- Conditionally renders identification sections on `UserProfile` based on the SAML connection configuration for disabling additional identifiers. ([#4211](https://github.com/clerk/javascript/pull/4211)) by [@NicolasLopes7](https://github.com/NicolasLopes7)

- Introduces the CRUD of organization domains under the `organizations` API. ([#4224](https://github.com/clerk/javascript/pull/4224)) by [@NicolasLopes7](https://github.com/NicolasLopes7)

- Updated dependencies [[`4749ed4c5`](https://github.com/clerk/javascript/commit/4749ed4c55a5ba5810451b8d436aad0d49829050), [`f1f17eaab`](https://github.com/clerk/javascript/commit/f1f17eaabed0dc4b7de405fb77d85503cf75ad33), [`2e35ac538`](https://github.com/clerk/javascript/commit/2e35ac53885f8008779940d41d1e804fa77ebfa9)]:
  - @clerk/types@4.23.0
  - @clerk/shared@2.8.4

## 1.13.4

### Patch Changes

- Updated dependencies [[`c9063853e`](https://github.com/clerk/javascript/commit/c9063853e538a4010f5d4e522a3da5abc80098a4), [`19d3808d4`](https://github.com/clerk/javascript/commit/19d3808d4672234944226d6709ec51214e8d6e1d), [`737bcbb0f`](https://github.com/clerk/javascript/commit/737bcbb0ffb5e2dcadbb02e8fc718fe8825c5842)]:
  - @clerk/types@4.22.0
  - @clerk/shared@2.8.3

## 1.13.3

### Patch Changes

- Introduce `includeMembersCount` parameter to `getOrganization`, allowing to retrieve an organization with `membersCount`. ([#4196](https://github.com/clerk/javascript/pull/4196)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Improve debugging error reasons. ([#4205](https://github.com/clerk/javascript/pull/4205)) by [@anagstef](https://github.com/anagstef)

- Drop the `__clerk_refresh` debugging query param and use only the `__clerk_hs_reason` param for all scenarios. ([#4213](https://github.com/clerk/javascript/pull/4213)) by [@anagstef](https://github.com/anagstef)

- Introduce more refresh token error reasons. ([#4193](https://github.com/clerk/javascript/pull/4193)) by [@anagstef](https://github.com/anagstef)

- Updated dependencies [[`cb32aaf59`](https://github.com/clerk/javascript/commit/cb32aaf59d38dcd12e959f542782f71a87adf9c1), [`2e5c550e4`](https://github.com/clerk/javascript/commit/2e5c550e4aec61150c2a17fdcd4a0e1273cb50e7), [`6275c242c`](https://github.com/clerk/javascript/commit/6275c242cd8bcb6f7766934059967e0fe775a0c1), [`f9faaf031`](https://github.com/clerk/javascript/commit/f9faaf03100baf679c78e6c24877fbf3b60be529)]:
  - @clerk/shared@2.8.2
  - @clerk/types@4.21.1

## 1.13.2

### Patch Changes

- Add the handshake reason as a query param for observability. ([#4184](https://github.com/clerk/javascript/pull/4184)) by [@anagstef](https://github.com/anagstef)

## 1.13.1

### Patch Changes

- Updated dependencies [[`3743eb911`](https://github.com/clerk/javascript/commit/3743eb9114733f20ed56a863ab98fa9c363b6723)]:
  - @clerk/shared@2.8.1

## 1.13.0

### Minor Changes

- Add new refresh token flow to reduce errors arising from too many redirects ([#4154](https://github.com/clerk/javascript/pull/4154)) by [@dstaley](https://github.com/dstaley)

## 1.12.0

### Minor Changes

- Experimental support for `has()` with assurance. ([#4118](https://github.com/clerk/javascript/pull/4118)) by [@panteliselef](https://github.com/panteliselef)

  Example usage:

  ```ts
  has({
    __experimental_assurance: {
      level: 'L2.secondFactor',
      maxAge: 'A1.10min',
    },
  });
  ```

  Created a shared utility called `createCheckAuthorization` exported from `@clerk/shared`

### Patch Changes

- Add webhook event types for roles and permissions ([#4153](https://github.com/clerk/javascript/pull/4153)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Fix Chrome caching 307 redirects when a handshake is triggered. ([#4171](https://github.com/clerk/javascript/pull/4171)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`ba19be354`](https://github.com/clerk/javascript/commit/ba19be35461f0e5c76a58d11e4252a16781322c6), [`248142a6d`](https://github.com/clerk/javascript/commit/248142a6ded6ca937d0df7d628197f25228aadec), [`1189f71f8`](https://github.com/clerk/javascript/commit/1189f71f872f2683c12de5add5f154aeb953ca8d)]:
  - @clerk/shared@2.8.0
  - @clerk/types@4.21.0

## 1.11.1

### Patch Changes

- Updated dependencies [[`be3b119f8`](https://github.com/clerk/javascript/commit/be3b119f840d2ae74f4b75d717711d53ac0e5f54)]:
  - @clerk/shared@2.7.2

## 1.11.0

### Minor Changes

- Bug fix: Introducing missing `deleteSelfEnabled` from User. ([#4139](https://github.com/clerk/javascript/pull/4139)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Update type of `__experimental_factorVerificationAge` to be `[number, number] | null`. ([#4135](https://github.com/clerk/javascript/pull/4135)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`8c6909d46`](https://github.com/clerk/javascript/commit/8c6909d46328c943f1d464a28f1a324a27d0f3f1)]:
  - @clerk/types@4.20.1
  - @clerk/shared@2.7.1

## 1.10.0

### Minor Changes

- Experimental support: Expect a new sessionClaim called `fva` that tracks the age of verified factor groups. ([#4061](https://github.com/clerk/javascript/pull/4061)) by [@panteliselef](https://github.com/panteliselef)

  ### Server side

  This can be applied to any helper that returns the auth object

  **Nextjs example**

  ```ts
  auth().__experimental_factorVerificationAge;
  ```

  ### Client side

  **React example**

  ```ts
  const { session } = useSession();
  session?.__experimental_factorVerificationAge;
  ```

### Patch Changes

- Updated dependencies [[`c63a5adf0`](https://github.com/clerk/javascript/commit/c63a5adf0ba4b99252146f168318f51b709bb5dd), [`8823c21a2`](https://github.com/clerk/javascript/commit/8823c21a26bc81cbc3ed007908b1a9ea474bd343), [`95ac67a14`](https://github.com/clerk/javascript/commit/95ac67a143c263bef0c1f589728566ab8f95768d), [`a0cb062fa`](https://github.com/clerk/javascript/commit/a0cb062faa4d23bef7a577e5cc486f4c5efe6bfa), [`746b4ed5e`](https://github.com/clerk/javascript/commit/746b4ed5e2007505d5850a2a728484809474d7bf)]:
  - @clerk/types@4.20.0
  - @clerk/shared@2.7.0

## 1.9.2

### Patch Changes

- Add url property to the Invitation object ([#4076](https://github.com/clerk/javascript/pull/4076)) by [@issuedat](https://github.com/issuedat)

- Updated dependencies [[`8a3b9f079`](https://github.com/clerk/javascript/commit/8a3b9f0793484b32dd609a5c80a194e62151d6ea), [`e95c28196`](https://github.com/clerk/javascript/commit/e95c2819675cea7963f2404e5f71f37ebed8d5e0)]:
  - @clerk/types@4.19.0
  - @clerk/shared@2.6.2

## 1.9.1

### Patch Changes

- Updated dependencies [[`82593173a`](https://github.com/clerk/javascript/commit/82593173aafbf6646e12c5779627cdcb138a1f27), [`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733)]:
  - @clerk/types@4.18.0
  - @clerk/shared@2.6.1

## 1.9.0

### Minor Changes

- Add missing `deleteSelfEnabled` property in `UpdateUserParams`. ([#4044](https://github.com/clerk/javascript/pull/4044)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Fix error from duplicate leading slashes in URL path on Cloudflare Pages ([#3982](https://github.com/clerk/javascript/pull/3982)) by [@mlafeldt](https://github.com/mlafeldt)

- Add missing `slug` property in TS type declaration for SMS webhook events ([#4024](https://github.com/clerk/javascript/pull/4024)) by [@tmoran-stenoa](https://github.com/tmoran-stenoa)

- Tidy up and improve README ([#4053](https://github.com/clerk/javascript/pull/4053)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`58e6754ad`](https://github.com/clerk/javascript/commit/58e6754ad9f9a1244b023ce1f5e5f2c1c4eb20e7), [`13693018f`](https://github.com/clerk/javascript/commit/13693018f4f7ac5d224698aa730e20960896f68c), [`3aa63dc5a`](https://github.com/clerk/javascript/commit/3aa63dc5a48161cfe92d94093ef0c32efd401342), [`3304dcc0b`](https://github.com/clerk/javascript/commit/3304dcc0bc93a92a7f729f585c60ff91d2ae04f6)]:
  - @clerk/types@4.17.0
  - @clerk/shared@2.6.0

## 1.8.3

### Patch Changes

- Updated dependencies [[`c1389492d`](https://github.com/clerk/javascript/commit/c1389492d8b6a9292ab04889bf776c0f45e66845)]:
  - @clerk/types@4.16.0
  - @clerk/shared@2.5.5

## 1.8.2

### Patch Changes

- Updated dependencies [[`0158c774a`](https://github.com/clerk/javascript/commit/0158c774af2243a2cd13b55c4d6fae877178c961), [`8be1a7abc`](https://github.com/clerk/javascript/commit/8be1a7abc8849d7d59552011bd6b25bc917d51f5)]:
  - @clerk/types@4.15.1
  - @clerk/shared@2.5.4

## 1.8.1

### Patch Changes

- Updated dependencies [[`247b3fd75`](https://github.com/clerk/javascript/commit/247b3fd75042365dc9f950db056b76f9fadfdcf6)]:
  - @clerk/types@4.15.0
  - @clerk/shared@2.5.3

## 1.8.0

### Minor Changes

- Add `deleteUserProfileImage` method to the UserAPI class. ([#3991](https://github.com/clerk/javascript/pull/3991)) by [@octoper](https://github.com/octoper)

## 1.7.0

### Minor Changes

- Adds `awscognito` to backend `PasswordHasher` type ([#3943](https://github.com/clerk/javascript/pull/3943)) by [@thiskevinwang](https://github.com/thiskevinwang)

### Patch Changes

- Updated dependencies [[`dc0e1c33d`](https://github.com/clerk/javascript/commit/dc0e1c33d6844b028cb1ee11c3359b886d609f3c)]:
  - @clerk/types@4.14.0
  - @clerk/shared@2.5.2

## 1.6.3

### Patch Changes

- Updated dependencies [[`7e0ced3da`](https://github.com/clerk/javascript/commit/7e0ced3da94f41056bc4445d163d3b615afb6ab1), [`b6f0613dc`](https://github.com/clerk/javascript/commit/b6f0613dc9d8b0bab41cfabbaa8621b126e3bdf5)]:
  - @clerk/shared@2.5.1
  - @clerk/types@4.13.1

## 1.6.2

### Patch Changes

- Updated dependencies [[`59d5f19d3`](https://github.com/clerk/javascript/commit/59d5f19d333bf4a35c244886e93b4368e215225c), [`4e6c94e3f`](https://github.com/clerk/javascript/commit/4e6c94e3f4cc92cbba8bddcd2b90fcc9cfb83763)]:
  - @clerk/shared@2.5.0
  - @clerk/types@4.13.0

## 1.6.1

### Patch Changes

- Export the type `AuthObject`. You can now use it like so: ([#3844](https://github.com/clerk/javascript/pull/3844)) by [@kduprey](https://github.com/kduprey)

  ```ts
  import type { AuthObject } from '@clerk/backend';
  ```

- Updated dependencies [[`9b2aeacb3`](https://github.com/clerk/javascript/commit/9b2aeacb32fff7c300bda458636a1cc81a42ee7b)]:
  - @clerk/types@4.12.1
  - @clerk/shared@2.4.5

## 1.6.0

### Minor Changes

- Add `createOrganizationsLimit` param in `@clerk/backend` method `User.updateUser()` ([#3823](https://github.com/clerk/javascript/pull/3823)) by [@NicolasLopes7](https://github.com/NicolasLopes7)

  Example:

  ```typescript
      import { createClerkClient }  from '@clerk/backend';

      const clerkClient = createClerkClient({...});
      // Update user with createOrganizationsLimit equals 10
      await clerkClient.users.updateUser('user_...', { createOrganizationsLimit: 10 })

      // Remove createOrganizationsLimit
      await clerkClient.users.updateUser('user_...', { createOrganizationsLimit: 0 })
  ```

### Patch Changes

- Updated dependencies [[`7e94fcf0f`](https://github.com/clerk/javascript/commit/7e94fcf0fcbee8842a54f7931c45190370aa870d)]:
  - @clerk/types@4.12.0
  - @clerk/shared@2.4.4

## 1.5.2

### Patch Changes

- Updated dependencies [[`568186cad`](https://github.com/clerk/javascript/commit/568186cad29acaf0b084a9f86ccb9d29bd23fcf4), [`407195270`](https://github.com/clerk/javascript/commit/407195270ed8aab6eef18c64a4918e3870fef471)]:
  - @clerk/types@4.11.0
  - @clerk/shared@2.4.3

## 1.5.1

### Patch Changes

- Retry handshake in case of handshake cookie collision in order to support multiple apps on same-level subdomains ([#3848](https://github.com/clerk/javascript/pull/3848)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.5.0

### Minor Changes

- Added a `locked` property to the User object in the SDK ([#3748](https://github.com/clerk/javascript/pull/3748)) by [@iamjameswalters](https://github.com/iamjameswalters)

### Patch Changes

- Updated dependencies [[`aa06f3ba7`](https://github.com/clerk/javascript/commit/aa06f3ba7e725071c90d4a1d6840060236da3c23), [`80e647731`](https://github.com/clerk/javascript/commit/80e64773135865434cf0e6c220e287397aa07937)]:
  - @clerk/types@4.10.0
  - @clerk/shared@2.4.2

## 1.4.3

### Patch Changes

- Updated dependencies [[`b48689705`](https://github.com/clerk/javascript/commit/b48689705f9fc2251d2f24addec7a0d0b1da0fe1)]:
  - @clerk/types@4.9.1
  - @clerk/shared@2.4.1

## 1.4.2

### Patch Changes

- Fix `getToken` returning `null` when signing in. ([#3764](https://github.com/clerk/javascript/pull/3764)) by [@anagstef](https://github.com/anagstef)

## 1.4.1

### Patch Changes

- Handle the scenario where FAPI returns unsuffixed cookies without throwing a handshake ([#3789](https://github.com/clerk/javascript/pull/3789)) by [@dimkl](https://github.com/dimkl)

## 1.4.0

### Minor Changes

- Support reading / writing / removing suffixed/un-suffixed cookies from `@clerk/clerk-js` and `@clerk/backend`. by [@dimkl](https://github.com/dimkl)

  The `__session`, `__clerk_db_jwt` and `__client_uat` cookies will now include a suffix derived from the instance's publishakeKey. The cookie name suffixes are used to prevent cookie collisions, effectively enabling support for multiple Clerk applications running on the same domain.

### Patch Changes

- Updated dependencies [[`b87f7b9e1`](https://github.com/clerk/javascript/commit/b87f7b9e163756fd43789bc7b7344d2eb24015ec), [`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`86c75e50c`](https://github.com/clerk/javascript/commit/86c75e50cba9c4efb480672f1b8c6a6fff4ef477)]:
  - @clerk/shared@2.4.0
  - @clerk/types@4.9.0

## 1.3.2

### Patch Changes

- Updated dependencies [[`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7)]:
  - @clerk/types@4.8.0
  - @clerk/shared@2.3.3

## 1.3.1

### Patch Changes

- Fixes a bug where Clerk's Handshake mechanism would not run when an application is rendered in an iframe. ([#3555](https://github.com/clerk/javascript/pull/3555)) by [@anagstef](https://github.com/anagstef)

## 1.3.0

### Minor Changes

- Introduces dynamic keys from `clerkMiddleware`, allowing access by server-side helpers like `auth`. Keys such as `signUpUrl`, `signInUrl`, `publishableKey` and `secretKey` are securely encrypted using AES algorithm. ([#3525](https://github.com/clerk/javascript/pull/3525)) by [@LauraBeatris](https://github.com/LauraBeatris)
  - When providing `secretKey`, `CLERK_ENCRYPTION_KEY` is required as the encryption key. If `secretKey` is not provided, `CLERK_SECRET_KEY` is used by default.
  - `clerkClient` from `@clerk/nextjs` should now be called as a function, and its singleton form is deprecated. This change allows the Clerk backend client to read keys from the current request, which is necessary to support dynamic keys.

  For more information, refer to the documentation: https://clerk.com/docs/references/nextjs/clerk-middleware#dynamic-keys

## 1.2.5

### Patch Changes

- Updated dependencies [[`d6b5006c4`](https://github.com/clerk/javascript/commit/d6b5006c4cc1b6f07bb3a6832b4ec6e65ea15814)]:
  - @clerk/types@4.7.0
  - @clerk/shared@2.3.2

## 1.2.4

### Patch Changes

- Updated dependencies [[`1273b04ec`](https://github.com/clerk/javascript/commit/1273b04ecf1866b59ef59a74abe31dbcc726da2c)]:
  - @clerk/types@4.6.1
  - @clerk/shared@2.3.1

## 1.2.3

### Patch Changes

- Updated dependencies [[`4ec3f63e2`](https://github.com/clerk/javascript/commit/4ec3f63e26d8d3725a7ba9bbf988a7776fe893ff)]:
  - @clerk/shared@2.3.0

## 1.2.2

### Patch Changes

- Set `@clerk/types` as a dependency for packages that had it as a dev dependency. ([#3450](https://github.com/clerk/javascript/pull/3450)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`86a27f693`](https://github.com/clerk/javascript/commit/86a27f6933de50c99b6bc354bf87ff5c2cfcaf38), [`02bed2e00`](https://github.com/clerk/javascript/commit/02bed2e00d3e0a4e1bb1698b13267faf6aeb31b3), [`73e5d61e2`](https://github.com/clerk/javascript/commit/73e5d61e21ab3f77f3c8343bc63da0626466c7ac), [`b8e46328d`](https://github.com/clerk/javascript/commit/b8e46328da874859c4928f19f924219cd6520b11)]:
  - @clerk/shared@2.2.2
  - @clerk/types@4.6.0

## 1.2.1

### Patch Changes

- Updated dependencies [[`ff31f7255`](https://github.com/clerk/javascript/commit/ff31f725541d82caaa9c13cf42cf15f8ce3992f4), [`0e48fc210`](https://github.com/clerk/javascript/commit/0e48fc210cf0b5852052a21494a05f6e723101f5)]:
  - @clerk/shared@2.2.1

## 1.2.0

### Minor Changes

- Consume and expose the 'saml_accounts' property of the user resource ([#3405](https://github.com/clerk/javascript/pull/3405)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Updated dependencies [[`456b06849`](https://github.com/clerk/javascript/commit/456b068493b8679e1772819eea24d49aa1bc6556)]:
  - @clerk/shared@2.2.0

## 1.1.5

### Patch Changes

- Added missing phpass and bcrypt_sha256_django hashers to PasswordHasher type ([#3380](https://github.com/clerk/javascript/pull/3380)) by [@royanger](https://github.com/royanger)

- Updated dependencies [[`ec84d51e7`](https://github.com/clerk/javascript/commit/ec84d51e705370273ffb82a0d7c94d90ba3de874)]:
  - @clerk/shared@2.1.1

## 1.1.4

### Patch Changes

- Updated dependencies [[`b27ca8366`](https://github.com/clerk/javascript/commit/b27ca8366a1d6ec1d7ce4a5be5005f1b1b017c20)]:
  - @clerk/shared@2.1.0

## 1.1.3

### Patch Changes

- Inherit verifyToken options from clerkClient. ([#3296](https://github.com/clerk/javascript/pull/3296)) by [@panteliselef](https://github.com/panteliselef)

  The below code now works as expected: (requires CLERK_SECRET_KEY env var to have been set)

  ```ts
  import { clerkClient } from '@clerk/clerk-sdk-node';

  // Use the default settings from the already instantiated clerkClient
  clerkClient.verifyToken(token);
  // or provide overrides the options
  clerkClient.verifyToken(token, {
    secretKey: 'xxxx',
  });
  ```

## 1.1.2

### Patch Changes

- Fix bug in JWKS cache logic that caused a race condition resulting in no JWK being available. ([#3321](https://github.com/clerk/javascript/pull/3321)) by [@BRKalow](https://github.com/BRKalow)

- Pass `devBrowserToken` to `createRedirect()` to ensure methods from `auth()` that trigger redirects correctly pass the dev browser token for URL-based session syncing. ([#3334](https://github.com/clerk/javascript/pull/3334)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`1662aaae9`](https://github.com/clerk/javascript/commit/1662aaae965fcf36b13dba6b148e096ab6a1cd83), [`f70c885f7`](https://github.com/clerk/javascript/commit/f70c885f798f7ff513f6687f87c8a56daf26fa05), [`f5804a225`](https://github.com/clerk/javascript/commit/f5804a225e9d67cd315700f0ced0ff17b8b14e53)]:
  - @clerk/shared@2.0.2

## 1.1.1

### Patch Changes

- Fix the following `@clerk/backend` methods to populate their paginated responses: ([#3276](https://github.com/clerk/javascript/pull/3276)) by [@dimkl](https://github.com/dimkl)
  - `clerkClient.allowListIndentifiers.getAllowlistIdentifierList()`
  - `clerkClient.clients.getClientList()`
  - `clerkClient.invitations.getInvitationList`
  - `clerkClient.redirectUrls.getRedirectUrlList()`
  - `clerkClient.sessions.getSessionList()`
  - `clerkClient.users.getUserOauthAccessToken()`

- Updated dependencies [[`a78bc447c`](https://github.com/clerk/javascript/commit/a78bc447c1aabaa41bcbaa2a8fe3c48f31275574), [`19cd42434`](https://github.com/clerk/javascript/commit/19cd42434450e568998336bf6d705e475122abbc)]:
  - @clerk/shared@2.0.1

## 1.1.0

### Minor Changes

- Updated types for `orderBy` in OrganizationApi and UserApi ([#3266](https://github.com/clerk/javascript/pull/3266)) by [@panteliselef](https://github.com/panteliselef)
  - `OrganizationAPI.getOrganizationMembershipList` now accepts `orderBy`
    - Acceptable values `phone_number`, `+phone_number`, `-phone_number`, `email_address`, `+email_address`, `-email_address`, `created_at`, `+created_at`, `-created_at`, `first_name`, `+first_name`, `-first_name`
  - `UserAPI.getUserList` expands the acceptable values of the `orderBy` to:
    - `email_address`, `+email_address`, `-email_address`, `web3wallet`, `+web3wallet`, `-web3wallet`, `first_name`, `+first_name`, `-first_name`, `last_name`, `+last_name`, `-last_name`, `phone_number`, `+phone_number`, `-phone_number`, `username`, `+username`, `-username`

- Add support for the Testing Tokens API ([#3258](https://github.com/clerk/javascript/pull/3258)) by [@anagstef](https://github.com/anagstef)

### Patch Changes

- Fix infinite redirect loops for production instances with incorrect secret keys ([#3259](https://github.com/clerk/javascript/pull/3259)) by [@dimkl](https://github.com/dimkl)

## 1.0.1

### Patch Changes

- Export all Webhook event types and related JSON types. The newly exported types are: `DeletedObjectJSON`, `EmailJSON`, `OrganizationInvitationJSON`, `OrganizationJSON`, `OrganizationMembershipJSON`, `SessionJSON`, `SMSMessageJSON`, `UserJSON`, `UserWebhookEvent`, `EmailWebhookEvent`, `SMSWebhookEvent`, `SessionWebhookEvent`, `OrganizationWebhookEvent`, `OrganizationMembershipWebhookEvent`, `OrganizationInvitationWebhookEvent` ([#3248](https://github.com/clerk/javascript/pull/3248)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Added missing 'organizationId' parameter to UserListParams ([#3240](https://github.com/clerk/javascript/pull/3240)) by [@royanger](https://github.com/royanger)

  Moved last_active_at_since from UserCountParams to UserListParams

## 1.0.0

### Major Changes

- 3a2f13604: Drop `user` / `organization` / `session` from auth object on **signed-out** state (current value was `null`). Eg

  ```diff
      // Backend
      import { createClerkClient } from '@clerk/backend';

      const clerkClient = createClerkClient({...});
      const requestState = clerkClient.authenticateRequest(request, {...});

      - const { user, organization, session } = requestState.toAuth();
      + const { userId, organizationId, sessionId } = requestState.toAuth();

      // Remix
      import { getAuth } from '@clerk/remix/ssr.server';

      - const { user, organization, session } = await getAuth(args);
      + const { userId, organizationId, sessionId } = await getAuth(args);

      // or
      rootAuthLoader(
          args,
          ({ request }) => {
              - const { user, organization, session } = request.auth;
              + const { userId, organizationId, sessionId } = request.auth;
              // ...
          },
          { loadUser: true },
      );

      // NextJS
      import { getAuth } from '@clerk/nextjs/server';

      - const { user, organization, session } = getAuth(args);
      + const { userId, organizationId, sessionId } = getAuth(req, opts);

      // Gatsby
      import { withServerAuth } from 'gatsby-plugin-clerk';

      export const getServerData: GetServerData<any> = withServerAuth(
          async props => {
              - const { user, organization, session } =  props;
              + const { userId, organizationId, sessionId } = props;
              return { props: { data: '1', auth: props.auth, userId, organizationId, sessionId } };
          },
          { loadUser: true },
      );
  ```

- c2a090513: Change the minimal Node.js version required by Clerk to `18.17.0`.
- deac67c1c: Drop default exports from all packages. Migration guide:
  - use `import { Clerk } from '@clerk/backend';`
  - use `import { clerkInstance } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-js';`
  - use `import { Clerk } from '@clerk/clerk-js/headless';`
  - use `import { IsomorphicClerk } from '@clerk/clerk-react'`
- 244de5ea3: Make all listing API requests to return consistent `{ data: Resource[], totalCount: number }`.

  Support pagination request params `{ limit, offset }` to:
  - `sessions.getSessionList({ limit, offset })`
  - `clients.getClientList({ limit, offset })`

  Since the `users.getUserList()` does not return the `total_count` as a temporary solution that
  method will perform 2 BAPI requests:
  1. retrieve the data
  2. retrieve the total count (invokes `users.getCount()` internally)

- a9fe242be: Change return value of `verifyToken()` from `@clerk/backend` to `{ data, error}`.
  To replicate the current behaviour use this:

  ```typescript
  import { verifyToken } from '@clerk/backend'

  const { data, error }  = await verifyToken(...);
  if(error){
      throw error;
  }
  ```

- 799abc281: Change `SessionApi.getToken()` to return consistent `{ data, errors }` return value
  and fix the `getToken()` from requestState to have the same return behavior as v4
  (return Promise<string> or throw error).
  This change fixes issues with `getToken()` in `@clerk/nextjs` / `@clerk/remix` / `@clerk/fastify` / `@clerk/sdk-node` / `gatsby-plugin-clerk`:

  Example:

  ```typescript
  import { getAuth } from '@clerk/nextjs/server';

  const { getToken } = await getAuth(...);
  const jwtString = await getToken(...);
  ```

  The change in `SessionApi.getToken()` return value is a breaking change, to keep the existing behavior use the following:

  ```typescript
  import { ClerkAPIResponseError } from '@clerk/shared/error';

  const response = await clerkClient.sessions.getToken(...);

  if (response.errors) {
      const { status, statusText, clerkTraceId } = response;
      const error = new ClerkAPIResponseError(statusText || '', {
          data: [],
          status: Number(status || ''),
          clerkTraceId,
      });
      error.errors = response.errors;

      throw error;
  }

  // the value of the v4 `clerkClient.sessions.getToken(...)`
  const jwtString = response.data.jwt;
  ```

- 71663c568: Internal update default apiUrl domain from clerk.dev to clerk.com
- 02976d494: Remove the named `Clerk` import from `@clerk/backend` and import `createClerkClient` instead. The latter is a factory method that will create a Clerk client instance for you. This aligns usage across our SDKs and will enable us to better ship DX improvements in the future.

  Inside your code, search for occurrences like these:

  ```js
  import { Clerk } from '@clerk/backend';
  const clerk = Clerk({ secretKey: '...' });
  ```

  You need to rename the import from `Clerk` to `createClerkClient` and change its usage:

  ```js
  import { createClerkClient } from '@clerk/backend';
  const clerk = createClerkClient({ secretKey: '...' });
  ```

- 8e5c881c4: The following paginated APIs now return `{ data, totalCount }` instead of simple arrays, in order to make building paginated UIs easier:
  - `clerkClient.users.getOrganizationMembershipList(...)`
  - `clerkClient.organization.getOrganizationList(...)`
  - `clerkClient.organization.getOrganizationInvitationList(...)`

  Revert changing the `{ data, errors }` return value of the following helpers to throw the `errors` or return the `data` (keep v4 format):
  - `import { verifyToken } from '@clerk/backend'`
  - `import { signJwt, hasValidSignature, decodeJwt, verifyJwt } from '@clerk/backend/jwt'`
  - BAPI `clerkClient` methods eg (`clerkClient.users.getUserList(...)`)

- dd5703013: Change the response payload of Backend API requests to return `{ data, errors }` instead of return the data and throwing on error response.
  Code example to keep the same behavior:

  ```typescript
  import { users } from '@clerk/backend';
  import { ClerkAPIResponseError } from '@clerk/shared/error';

  const { data, errors, clerkTraceId, status, statusText } = await users.getUser('user_deadbeef');
  if (errors) {
    throw new ClerkAPIResponseError(statusText, {
      data: errors,
      status,
      clerkTraceId,
    });
  }
  ```

- 86d52fb5c: - Refactor the `authenticateRequest()` flow to use the new client handshake endpoint. This replaces the previous "interstitial"-based flow. This should improve performance and overall reliability of Clerk's server-side request authentication functionality.
  - `authenticateRequest()` now accepts two arguments, a `Request` object to authenticate and options:
    ```ts
    authenticateRequest(new Request(...), { secretKey: '...' })
    ```
- a9fe242be: Change return values of `signJwt`, `hasValidSignature`, `decodeJwt`, `verifyJwt`
  to return `{ data, error }`. Example of keeping the same behavior using those utilities:

  ```typescript
  import { signJwt, hasValidSignature, decodeJwt, verifyJwt } from '@clerk/backend/jwt';

  const { data, error } = await signJwt(...)
  if (error) throw error;

  const { data, error } = await hasValidSignature(...)
  if (error) throw error;

  const { data, error } = decodeJwt(...)
  if (error) throw error;

  const { data, error } = await verifyJwt(...)
  if (error) throw error;
  ```

- 97407d8aa: Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now.
- 9615e6cda: Enforce passing `request` param to `authenticateRequest` method of `@clerk/backend`
  instead of passing each header or cookie related option that is used internally to
  determine the request state.

  Migration guide:
  - use `request` param in `clerkClient.authenticateRequest()` instead of:
    - `origin`
    - `host`
    - `forwardedHost`
    - `forwardedProto`
    - `referrer`
    - `userAgent`
    - `cookieToken`
    - `clientUat`
    - `headerToken`
    - `searchParams`

  Example

  ```typescript
  //
  // current
  //
  import { clerkClient } from '@clerk/backend'

  const requestState = await clerkClient.authenticateRequest({
      secretKey: 'sk_....'
      publishableKey: 'pk_....'
      origin: req.headers.get('origin'),
      host: req.headers.get('host'),
      forwardedHost: req.headers.get('x-forwarded-host'),
      forwardedProto: req.headers.get('x-forwarded-proto'),
      referrer: req.headers.get('referer'),
      userAgent: req.headers.get('user-agent'),
      clientUat: req.cookies.get('__client_uat'),
      cookieToken: req.cookies.get('__session'),
      headerToken: req.headers.get('authorization'),
      searchParams: req.searchParams
  });

  //
  // new
  //
  import { clerkClient,  } from '@clerk/backend'

  // use req (if it's a fetch#Request instance) or use `createIsomorphicRequest` from `@clerk/backend`
  // to re-construct fetch#Request instance
  const requestState = await clerkClient.authenticateRequest({
      secretKey: 'sk_....'
      publishableKey: 'pk_....'
      request: req
  });

  ```

- 0ec3a146c: Changes in exports of `@clerk/backend`:
  - Expose the following helpers and enums from `@clerk/backend/internal`:
    ```typescript
    import {
      AuthStatus,
      buildRequestUrl,
      constants,
      createAuthenticateRequest,
      createIsomorphicRequest,
      debugRequestState,
      makeAuthObjectSerializable,
      prunePrivateMetadata,
      redirect,
      sanitizeAuthObject,
      signedInAuthObject,
      signedOutAuthObject,
    } from '@clerk/backend/internal';
    ```
  - Drop the above exports from the top-level api:
    ```typescript
    // Before
    import { AuthStatus, ... } from '@clerk/backend';
    // After
    import { AuthStatus, ... } from '@clerk/backend/internal';
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.
- cace85374: Drop deprecated properties. Migration steps:
  - use `createClerkClient` instead of `__unstable_options`
  - use `publishableKey` instead of `frontendApi`
  - use `clockSkewInMs` instead of `clockSkewInSeconds`
  - use `apiKey` instead of `secretKey`
  - drop `httpOptions`
  - use `*.image` instead of
    - `ExternalAccount.picture`
    - `ExternalAccountJSON.avatar_url`
    - `Organization.logoUrl`
    - `OrganizationJSON.logo_url`
    - `User.profileImageUrl`
    - `UserJSON.profile_image_url`
    - `OrganizationMembershipPublicUserData.profileImageUrl`
    - `OrganizationMembershipPublicUserDataJSON.profile_image_url`
  - drop `pkgVersion`
  - use `Organization.getOrganizationInvitationList` with `status` instead of `getPendingOrganizationInvitationList`
  - drop `orgs` claim (if required, can be manually added by using `user.organizations` in a jwt template)
  - use `localInterstitial` instead of `remotePublicInterstitial` / `remotePublicInterstitialUrl`

  Internal changes:
  - replaced error enum (and it's) `SetClerkSecretKeyOrAPIKey` with `SetClerkSecretKey`

- 1ad910eb9: Changes in exports of `@clerk/backend`:
  - Drop the following internal exports from the top-level api:
    ```typescript
    // Before
    import {
      AllowlistIdentifier,
      Client,
      DeletedObject,
      Email,
      EmailAddress,
      ExternalAccount,
      IdentificationLink,
      Invitation,
      OauthAccessToken,
      ObjectType,
      Organization,
      OrganizationInvitation,
      OrganizationMembership,
      OrganizationMembershipPublicUserData,
      PhoneNumber,
      RedirectUrl,
      SMSMessage,
      Session,
      SignInToken,
      Token,
      User,
      Verification,
    } from '@clerk/backend';
    // After : no alternative since there is no need to use those classes
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.
  - Keep those 3 resource related type exports
    ```typescript
    import type { Organization, Session, User, WebhookEvent, WebhookEventType } from '@clerk/backend';
    ```
- f58a9949b: Changes in exports of `@clerk/backend`:
  - Expose the following helpers and enums from `@clerk/backend/jwt`:
    ```typescript
    import { decodeJwt, hasValidSignature, signJwt, verifyJwt } from '@clerk/backend/jwt';
    ```
  - Drop the above exports from the top-level api:
    ```typescript
    // Before
    import { decodeJwt, ... } from '@clerk/backend';
    // After
    import { decodeJwt, ... } from '@clerk/backend/jwt';
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.
- d22e6164d: Rename property `members_count` to `membersCount` for `Organization` resource
- e1f7eae87: Limit TokenVerificationError exports to TokenVerificationError and TokenVerificationErrorReason
- 9b02c1aae: Changes in `@clerk/backend` exports:
  - Drop Internal `deserialize` helper
  - Introduce `/errors` subpath export, eg:
    ```typescript
    import {
      TokenVerificationError,
      TokenVerificationErrorAction,
      TokenVerificationErrorCode,
      TokenVerificationErrorReason,
    } from '@clerk/backend/errors';
    ```
  - Drop errors from top-level export
    ```typescript
    // Before
    import { TokenVerificationError, TokenVerificationErrorReason } from '@clerk/backend';
    // After
    import { TokenVerificationError, TokenVerificationErrorReason } from '@clerk/backend/errors';
    ```
- e602d6c1f: Drop unused SearchParams.AuthStatus constant
- 6fffd3b54: Replace return the value of the following jwt helpers to match the format of backend API client return values (for consistency).

  ```diff
  import { signJwt } from '@clerk/backend/jwt';

  - const { data, error } = await signJwt(...);
  + const { data, errors: [error] = [] } = await signJwt(...);
  ```

  ```diff
  import { verifyJwt } from '@clerk/backend/jwt';

  - const { data, error } = await verifyJwt(...);
  + const { data, errors: [error] = [] } = await verifyJwt(...);
  ```

  ```diff
  import { hasValidSignature } from '@clerk/backend/jwt';

  - const { data, error } = await hasValidSignature(...);
  + const { data, errors: [error] = [] } = await hasValidSignature(...);
  ```

  ```diff
  import { decodeJwt } from '@clerk/backend/jwt';

  - const { data, error } = await decodeJwt(...);
  + const { data, errors: [error] = [] } = await decodeJwt(...);
  ```

  ```diff
  import { verifyToken } from '@clerk/backend';

  - const { data, error } = await verifyToken(...);
  + const { data, errors: [error] = [] } = await verifyToken(...);
  ```

### Minor Changes

- 966b31205: Add `unbanUser`, `lockUser`, and `unlockUser` methods to the UserAPI class.
- ecb60da48: Implement token signature verification when passing verified token from Next.js middleware to the application origin.
- 448e02e93: Add fullName, primaryEmailAddress, primaryPhoneNumber, primaryWeb3Wallet to User class.
- 2671e7aa5: Add `external_account_id` to OAuth access token response
- 8b6b094b9: Added prefers-color-scheme to interstitial
- a6b893d28: - Added the `User.last_active_at` timestamp field which stores the latest date of session activity, with day precision. For further details, please consult the [Backend API documentation](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUser).
  - Added the `last_active_at_since` filtering parameter for the Users listing request. The new parameter can be used to retrieve users that have displayed session activity since the given date. For further details, please consult the [Backend API documentation](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUserList).
  - Added the `last_active_at` available options for the `orderBy` parameter of the Users listing request. For further details, please consult the [Backend API documentation](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUserList).
- a605335e1: Add support for NextJS 14
- 2964f8a47: Expose debug headers in response for handshake / signed-out states from SDKs using headers returned from `authenticateRequest()`
- 7af0949ae: Add missing `createdAt` param in `User#createUser()` of `@clerk/backend`.
  Fix `clerkClient.verifyToken()` signature to support a single `token: string` parameter.
- d08ec6d8f: Improve ESM support in `@clerk/backend` for Node by using .mjs for #crypto subpath import
- 03079579d: Expose `totalCount` from `@clerk/backend` client responses for responses
  containing pagination information or for responses with type `{ data: object[] }`.

  Example:

  ```typescript
  import { Clerk } from '@clerk/backend';

  const clerkClient = Clerk({ secretKey: '...' });

  // current
  const { data } = await clerkClient.organizations.getOrganizationList();
  console.log('totalCount: ', data.length);

  // new
  const { data, totalCount } = await clerkClient.organizations.getOrganizationList();
  console.log('totalCount: ', totalCount);
  ```

- c7e6d00f5: Experimental support for `<Gate/>` with role checks.
- 12962bc58: Re-use common pagination types for consistency across types.

  Types introduced in `@clerk/types`:
  - `ClerkPaginationRequest` : describes pagination related props in request payload
  - `ClerkPaginatedResponse` : describes pagination related props in response body
  - `ClerkPaginationParams` : describes pagination related props in api client method params

- 4bb57057e: Breaking Changes:
  - Drop `isLegacyFrontendApiKey` from `@clerk/shared`
  - Drop default exports from `@clerk/clerk-js`
    - on headless Clerk type
    - on ui and ui.retheme `Portal`
  - Use `isProductionFromSecretKey` instead of `isProductionFromApiKey`
  - Use `isDevelopmentFromSecretKey` instead of `isDevelopmentFromApiKey`

  Changes:
  - Rename `HeadlessBrowserClerkConstrutor` / `HeadlessBrowserClerkConstructor` (typo)
  - Use `isomorphicAtob` / `isomorhpicBtoa` to replace `base-64` in `@clerk/expo`
  - Refactor merging build-time and runtime props in `@clerk/backend` clerk client
  - Drop `node-fetch` dependency from `@clerk/backend`
  - Drop duplicate test in `@clerk/backend`

- 46040a2f3: Introduce Protect for authorization.
  Changes in public APIs:
  - Rename Gate to Protect
  - Support for permission checks. (Previously only roles could be used)
  - Remove the `experimental` tags and prefixes
  - Drop `some` from the `has` utility and Protect. Protect now accepts a `condition` prop where a function is expected with the `has` being exposed as the param.
  - Protect can now be used without required props. In this case behaves as `<SignedIn>`, if no authorization props are passed.
  - `has` will throw an error if neither `permission` or `role` is passed.
  - `auth().protect()` for Nextjs App Router. Allow per page protection in app router. This utility will automatically throw a 404 error if user is not authorized or authenticated.
    - inside a page or layout file it will render the nearest `not-found` component set by the developer
    - inside a route handler it will return empty response body with a 404 status code
- 4aaf5103d: Deprecate `createSMSMessage` and `SMSMessageApi` from `clerkClient`.

  The equivalent `/sms_messages` Backend API endpoint will also be dropped in the future, since this feature will no longer be available for new instances.

  For a brief period it will still be accessible for instances that have used it in the past 7
  days (13-11-2023 to 20-11-2023).

  New instances will get a 403 forbidden response if they try to access it.

- 7f751c4ef: Add support for X/Twitter v2 OAuth provider
- 4fced88ac: Add `banUser` method to the User operations (accessible under `clerkClient.users`). Executes the [Ban a user](https://clerk.com/docs/reference/backend-api/tag/Users#operation/BanUser) backend API call.
- e7e2a1eae: Add `createOrganizationEnabled` param in `@clerk/backend` method `User.updateUser()`
  Example:

  ```typescript
      import { createClerkClient }  from '@clerk/backend';

      const clerkClient = createClerkClient({...});
      await clerkClient.users.updateUser('user_...', { createOrganizationEnabled: true })
  ```

- b4e79c1b9: Replace the `Clerk-Backend-SDK` header with `User-Agent` in BAPI requests and update it's value to contain both the package name and the package version of the clerk package
  executing the request. Eg request from `@clerk/nextjs` to BAPI with append `User-Agent: @clerk/nextjs@5.0.0-alpha-v5.16` using the latest version.

  Miscellaneous changes: The backend test build changed to use tsup.

- 142ded732: Add support for the `orderBy` parameter to the `getOrganizationList()` function

### Patch Changes

- 8c23651b8: Introduce `clerkClient.samlConnections` to expose `getSamlConnectionList`, `createSamlConnection`, `getSamlConnection`, `updateSamlConnection` and `deleteSamlConnection` endpoints. Introduce `SamlConnection` resource for BAPI.

  Example:

  ```
  import { clerkClient } from '@clerk/nextjs/server';
  const samlConnection = await clerkClient.samlConnections.getSamlConnectionList();
  ```

- f4f99f18d: `OrganizationMembershipRole` should respect authorization types provided by the developer if those exist.
- 9272006e7: Export the JSON types for clerk resources.
- a8901be64: Expose resources types
- 7b200af49: The `auth().redirectToSignIn()` helper no longer needs to be explicitly returned when called within the middleware. The following examples are now equivalent:

  ```js
  // Before
  export default clerkMiddleware(auth => {
    if (protectedRoute && !auth.user) {
      return auth().redirectToSignIn()
    }
  })

  // After
  export default clerkMiddleware(auth => {
    if (protectedRoute && !auth.user) {
      auth().redirectToSignIn()
    }
  })
  ```

  Calling `auth().protect()` from a page will now automatically redirect back to the same page by setting `redirect_url` to the request url before the redirect to the sign-in URL takes place.

- 988a299c0: Fix typo in `jwk-remote-missing` error message
- b3a3dcdf4: Add OrganizationRoleAPI for CRUD operations regarding instance level organization roles.
- 935b0886e: The `emails` endpoint helper and the corresponding `createEmail` method have been removed from the `@clerk/backend` SDK and `apiClint.emails.createEmail` will no longer be available.

  We will not be providing an alternative method for creating and sending emails directly from our JavaScript SDKs with this release. If you are currently using `createEmail` and you wish to update to the latest SDK version, please reach out to our support team (https://clerk.com/support) so we can assist you.

- 93d05c868: Drop the introduction of `OrganizationRole` and `OrganizationPermission` resources fro BAPI.
- 4aaf5103d: Remove createSms functions from @clerk/backend and @clerk/sdk-node.

  The equivalent /sms_messages Backend API endpoint will also dropped in the future, since this feature will no longer be available for new instances.

  For a brief period it will still be accessible for instances that have used it in the past 7
  days (13-11-2023 to 20-11-2023).

  New instances will get a 403 forbidden response if they try to access it.

- 2de442b24: Rename beta-v5 to beta
- 15af02a83: Remove `__dev_session` legacy query param used to pass the Dev Browser token in previous major version.
  This param will be visible only when using Account Portal with "Core 1" version.
- de6519daa: Added missing types for `clerkClient.invitations.createInvitation`
- e6ecbaa2f: Fix an error in the handshake flow where the request would throw an unhandled error when verification of the handshake payload fails.
- 6a769771c: Update README for v5
- 9e99eb727: Update `@clerk/nextjs` error messages to refer to `clerkMiddleware()` and deprecated `authMiddleware()` and fix a typo in `cannotRenderSignUpComponentWhenSessionExists` error message.
- 034c47ccb: Fix `clerkClient.organizations.getOrganizationMembershipList()` return type to be `{ data, totalCount }`
- 90aa2ea9c: Add `sha256` hasher support to PasswordHasher as described in [`Users#CreateUser`](https://clerk.com/docs/reference/backend-api/tag/Users#operation/CreateUser!path=password_hasher)
- 1e98187b4: Update the handshake flow to only trigger for document requests.
- 2e77cd737: Set correct information on required Node.js and React versions in README
- 63dfe8dc9: Resolve Vercel edge-runtime "TypeError: Failed to parse URL" when `@clerk/remix` is used
- e921af259: Replace enums with `as const` objects so `@clerk/backend` is consistent with the other packages
- c22cd5214: Fix type inference for auth helper.
- 7cb1241a9: Trigger the handshake when no dev browser token exists in development.
- bad4de1a2: Fixed an issue where errors returned from backend api requests are not converted to camelCase.
- 66b283653: Fix infinite redirect loops for production instances with incorrect secret keys'
- f5d55bb1f: Add clerkTraceId to ClerkBackendApiResponse and ClerkAPIResponseError to allow for better tracing and debugging API error responses.
  Uses `clerk_trace_id` when available in a response and defaults to [`cf-ray` identifier](https://developers.cloudflare.com/fundamentals/reference/cloudflare-ray-id/) if missing.
- a6308c67e: Add the following properties to `users.updateUser(userId, params)` params:
  - `password_hasher`
  - `password_digest`
  - `publicMetadata`
  - `privateMetadata`
  - `unsafeMetadata`

- 0ce0edc28: Add OrganizationPermissionAPI for CRUD operations regarding instance level organization permissions.
- 051833167: fix(backend): Align types based on FAPI/BAPI structs
- e6fc58ae4: Introduce `debug: true` option for the `clerkMiddleware` helper
- a6451aece: Strip `experimental__has` from the auth object in `makeAuthObjectSerializable()`. This fixes an issue in Next.js where an error is being thrown when this function is passed to a client component as a prop.
- 987994909: Add support for `scrypt_werkzeug` in `UserAPI` `PasswordHasher`.
- 40ac4b645: Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry.
- 1bea9c200: Add missing pagination params types for `clerkClient.invitations.getInvitationList()`
- c2b982749: Preserve url protocol when joining paths.
- Updated dependencies [743c4d204]
- Updated dependencies [4b8bedc66]
- Updated dependencies [c2a090513]
- Updated dependencies [1834a3ee4]
- Updated dependencies [896cb6104]
- Updated dependencies [64d3763ec]
- Updated dependencies [8350109ab]
- Updated dependencies [1dc28ab46]
- Updated dependencies [83e9d0846]
- Updated dependencies [791c49807]
- Updated dependencies [ea4933655]
- Updated dependencies [a68eb3083]
- Updated dependencies [2de442b24]
- Updated dependencies [db18787c4]
- Updated dependencies [7f833da9e]
- Updated dependencies [ef2325dcc]
- Updated dependencies [fc3ffd880]
- Updated dependencies [bab2e7e05]
- Updated dependencies [71663c568]
- Updated dependencies [492b8a7b1]
- Updated dependencies [e5c989a03]
- Updated dependencies [7ecd6f6ab]
- Updated dependencies [12f3c5c55]
- Updated dependencies [c776f86fb]
- Updated dependencies [97407d8aa]
- Updated dependencies [5f58a2274]
- Updated dependencies [52ff8fe6b]
- Updated dependencies [8cc45d2af]
- Updated dependencies [97407d8aa]
- Updated dependencies [4bb57057e]
- Updated dependencies [d4ff346dd]
- Updated dependencies [7644b7472]
- Updated dependencies [2ec9f6b09]
- Updated dependencies [8daf8451c]
- Updated dependencies [75ea300bc]
- Updated dependencies [f5d55bb1f]
- Updated dependencies [0d1052ac2]
- Updated dependencies [d30ea1faa]
- Updated dependencies [1fd2eff38]
- Updated dependencies [5471c7e8d]
- Updated dependencies [38d8b3e8a]
- Updated dependencies [be991365e]
- Updated dependencies [8350f73a6]
- Updated dependencies [e0e79b4fe]
- Updated dependencies [fb794ce7b]
- Updated dependencies [40ac4b645]
- Updated dependencies [6f755addd]
- Updated dependencies [6eab66050]
  - @clerk/shared@2.0.0

## 1.0.0-beta.37

### Patch Changes

- Updated dependencies [[`bab2e7e05`](https://github.com/clerk/javascript/commit/bab2e7e0590d0da1fd7db0680e63e8f2eb836b41)]:
  - @clerk/shared@2.0.0-beta.23

## 1.0.0-beta.36

### Minor Changes

- Add support for the `orderBy` parameter to the `getOrganizationList()` function ([#3164](https://github.com/clerk/javascript/pull/3164)) by [@IGassmann](https://github.com/IGassmann)

### Patch Changes

- Introduce `debug: true` option for the `clerkMiddleware` helper ([#3189](https://github.com/clerk/javascript/pull/3189)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`fb794ce7b`](https://github.com/clerk/javascript/commit/fb794ce7b88001b98ad4a628bc2cc39a0c8ccfa5)]:
  - @clerk/shared@2.0.0-beta.22

## 1.0.0-beta.35

### Patch Changes

- Trigger the handshake when no dev browser token exists in development. ([#3175](https://github.com/clerk/javascript/pull/3175)) by [@BRKalow](https://github.com/BRKalow)

## 1.0.0-beta.34

### Minor Changes

- Implement token signature verification when passing verified token from Next.js middleware to the application origin. ([#3121](https://github.com/clerk/javascript/pull/3121)) by [@BRKalow](https://github.com/BRKalow)

## 1.0.0-beta.33

### Major Changes

- Rename property `members_count` to `membersCount` for `Organization` resource ([#3094](https://github.com/clerk/javascript/pull/3094)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Resolve Vercel edge-runtime "TypeError: Failed to parse URL" when `@clerk/remix` is used ([#3129](https://github.com/clerk/javascript/pull/3129)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.0.0-beta.32

### Patch Changes

- Add support for `scrypt_werkzeug` in `UserAPI` `PasswordHasher`. ([#3060](https://github.com/clerk/javascript/pull/3060)) by [@Nikpolik](https://github.com/Nikpolik)

- Add missing pagination params types for `clerkClient.invitations.getInvitationList()` ([#3079](https://github.com/clerk/javascript/pull/3079)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`fc3ffd880`](https://github.com/clerk/javascript/commit/fc3ffd88064a09ab98877dfba119150390f9296e), [`1fd2eff38`](https://github.com/clerk/javascript/commit/1fd2eff38dc71e45d2ff95a5b6e5a99cca53c6e7)]:
  - @clerk/shared@2.0.0-beta.21

## 1.0.0-beta.31

### Patch Changes

- Fix typo in `jwk-remote-missing` error message ([#3057](https://github.com/clerk/javascript/pull/3057)) by [@dimkl](https://github.com/dimkl)

## 1.0.0-beta.30

### Patch Changes

- Updated dependencies [[`8350109ab`](https://github.com/clerk/javascript/commit/8350109ab85909e0457199da1db0c9787d94001e)]:
  - @clerk/shared@2.0.0-beta.20

## 1.0.0-beta.29

### Minor Changes

- Add `external_account_id` to OAuth access token response ([#2982](https://github.com/clerk/javascript/pull/2982)) by [@kostaspt](https://github.com/kostaspt)

### Patch Changes

- Introduce `clerkClient.samlConnections` to expose `getSamlConnectionList`, `createSamlConnection`, `getSamlConnection`, `updateSamlConnection` and `deleteSamlConnection` endpoints. Introduce `SamlConnection` resource for BAPI. ([#2980](https://github.com/clerk/javascript/pull/2980)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

  Example:

  ```
  import { clerkClient } from '@clerk/nextjs/server';
  const samlConnection = await clerkClient.samlConnections.getSamlConnectionList();
  ```

- Export the JSON types for clerk resources. ([#2965](https://github.com/clerk/javascript/pull/2965)) by [@desiprisg](https://github.com/desiprisg)

- Fix infinite redirect loops for production instances with incorrect secret keys' ([#2994](https://github.com/clerk/javascript/pull/2994)) by [@dimkl](https://github.com/dimkl)

## 1.0.0-beta.28

### Minor Changes

- Expose debug headers in response for handshake / signed-out states from SDKs using headers returned from `authenticateRequest()` ([#2898](https://github.com/clerk/javascript/pull/2898)) by [@dimkl](https://github.com/dimkl)

## 1.0.0-beta.27

### Patch Changes

- Updated dependencies [[`8350f73a6`](https://github.com/clerk/javascript/commit/8350f73a67f8980be78e3bd3343e772f5653d718)]:
  - @clerk/shared@2.0.0-beta.19

## 1.0.0-beta.26

### Patch Changes

- Updated dependencies [[`e5c989a03`](https://github.com/clerk/javascript/commit/e5c989a035fa16413414c213febe16fcdbeef9b1), [`2ec9f6b09`](https://github.com/clerk/javascript/commit/2ec9f6b09f98ae276658d6dc705e16df0573d817)]:
  - @clerk/shared@2.0.0-beta.18

## 1.0.0-beta.25

### Patch Changes

- Remove `__dev_session` legacy query param used to pass the Dev Browser token in previous major version. ([#2883](https://github.com/clerk/javascript/pull/2883)) by [@dimkl](https://github.com/dimkl)

  This param will be visible only when using Account Portal with "Core 1" version.

- Updated dependencies [[`1834a3ee4`](https://github.com/clerk/javascript/commit/1834a3ee496ea27b9f7ceeb32ec5361f9de8ee30)]:
  - @clerk/shared@2.0.0-beta.17

## 1.0.0-beta.24

### Patch Changes

- Updated dependencies [[`db18787c4`](https://github.com/clerk/javascript/commit/db18787c4d9fa8ee1306db9b65f3b3f5e2fe2dad)]:
  - @clerk/shared@2.0.0-beta.16

## 1.0.0-beta.23

### Patch Changes

- Updated dependencies [[`6eab66050`](https://github.com/clerk/javascript/commit/6eab66050608a1bc5cb9aca6a234b1fea16106e5)]:
  - @clerk/shared@2.0.0-beta.15

## 1.0.0-beta.22

### Patch Changes

- Updated dependencies [[`12f3c5c55`](https://github.com/clerk/javascript/commit/12f3c5c55580f93a81df27851fbc92ce1312107e)]:
  - @clerk/shared@2.0.0-beta.14

## 1.0.0-beta.21

### Patch Changes

- fix(backend): Align types based on FAPI/BAPI structs ([#2818](https://github.com/clerk/javascript/pull/2818)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.0.0-beta.20

### Patch Changes

- Rename beta-v5 to beta by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`2de442b24`](https://github.com/clerk/javascript/commit/2de442b2465cc5d424b8a0b21aa57c557f3aa2e7)]:
  - @clerk/shared@2.0.0-beta.13

## 1.0.0-beta-v5.19

### Major Changes

- Make all listing API requests to return consistent `{ data: Resource[], totalCount: number }`. ([#2714](https://github.com/clerk/javascript/pull/2714)) by [@dimkl](https://github.com/dimkl)

  Support pagination request params `{ limit, offset }` to:
  - `sessions.getSessionList({ limit, offset })`
  - `clients.getClientList({ limit, offset })`

  Since the `users.getUserList()` does not return the `total_count` as a temporary solution that
  method will perform 2 BAPI requests:
  1. retrieve the data
  2. retrieve the total count (invokes `users.getCount()` internally)

### Minor Changes

- Add `unbanUser`, `lockUser`, and `unlockUser` methods to the UserAPI class. ([#2780](https://github.com/clerk/javascript/pull/2780)) by [@panteliselef](https://github.com/panteliselef)

- Add support for X/Twitter v2 OAuth provider ([#2690](https://github.com/clerk/javascript/pull/2690)) by [@kostaspt](https://github.com/kostaspt)

- Add `banUser` method to the User operations (accessible under `clerkClient.users`). Executes the [Ban a user](https://clerk.com/docs/reference/backend-api/tag/Users#operation/BanUser) backend API call. ([#2766](https://github.com/clerk/javascript/pull/2766)) by [@bartlenaerts](https://github.com/bartlenaerts)

### Patch Changes

- Expose resources types ([#2660](https://github.com/clerk/javascript/pull/2660)) by [@panteliselef](https://github.com/panteliselef)

- The `auth().redirectToSignIn()` helper no longer needs to be explicitly returned when called within the middleware. The following examples are now equivalent: ([#2691](https://github.com/clerk/javascript/pull/2691)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  ```js
  // Before
  export default clerkMiddleware(auth => {
    if (protectedRoute && !auth.user) {
      return auth().redirectToSignIn()
    }
  })

  // After
  export default clerkMiddleware(auth => {
    if (protectedRoute && !auth.user) {
      auth().redirectToSignIn()
    }
  })
  ```

  Calling `auth().protect()` from a page will now automatically redirect back to the same page by setting `redirect_url` to the request url before the redirect to the sign-in URL takes place.

- Fix `clerkClient.organizations.getOrganizationMembershipList()` return type to be `{ data, totalCount }` ([#2681](https://github.com/clerk/javascript/pull/2681)) by [@dimkl](https://github.com/dimkl)

- Preserve url protocol when joining paths. ([#2745](https://github.com/clerk/javascript/pull/2745)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`8daf8451c`](https://github.com/clerk/javascript/commit/8daf8451cb564bc834dd856174ffc2cdfa932e37), [`be991365e`](https://github.com/clerk/javascript/commit/be991365e1c78d0f1dfc59bb33dd533b6fad223a)]:
  - @clerk/shared@2.0.0-beta-v5.12

## 1.0.0-beta-v5.18

### Major Changes

- The following paginated APIs now return `{ data, totalCount }` instead of simple arrays, in order to make building paginated UIs easier: ([#2633](https://github.com/clerk/javascript/pull/2633)) by [@dimkl](https://github.com/dimkl)
  - `clerkClient.users.getOrganizationMembershipList(...)`
  - `clerkClient.organization.getOrganizationList(...)`
  - `clerkClient.organization.getOrganizationInvitationList(...)`

  Revert changing the `{ data, errors }` return value of the following helpers to throw the `errors` or return the `data` (keep v4 format):
  - `import { verifyToken } from '@clerk/backend'`
  - `import { signJwt, hasValidSignature, decodeJwt, verifyJwt } from '@clerk/backend/jwt'`
  - BAPI `clerkClient` methods eg (`clerkClient.users.getUserList(...)`)

### Patch Changes

- Add the following properties to `users.updateUser(userId, params)` params: ([#2619](https://github.com/clerk/javascript/pull/2619)) by [@SokratisVidros](https://github.com/SokratisVidros)
  - `password_hasher`
  - `password_digest`
  - `publicMetadata`
  - `privateMetadata`
  - `unsafeMetadata`

- Updated dependencies [[`d4ff346dd`](https://github.com/clerk/javascript/commit/d4ff346dd53bb3e1970e80bdc7b188c2dd344f12)]:
  - @clerk/shared@2.0.0-beta-v5.11

## 1.0.0-alpha-v5.17

### Major Changes

- Drop `user` / `organization` / `session` from auth object on **signed-out** state (current value was `null`). Eg ([#2598](https://github.com/clerk/javascript/pull/2598)) by [@dimkl](https://github.com/dimkl)

  ```diff
      // Backend
      import { createClerkClient } from '@clerk/backend';

      const clerkClient = createClerkClient({...});
      const requestState = clerkClient.authenticateRequest(request, {...});

      - const { user, organization, session } = requestState.toAuth();
      + const { userId, organizationId, sessionId } = requestState.toAuth();

      // Remix
      import { getAuth } from '@clerk/remix/ssr.server';

      - const { user, organization, session } = await getAuth(args);
      + const { userId, organizationId, sessionId } = await getAuth(args);

      // or
      rootAuthLoader(
          args,
          ({ request }) => {
              - const { user, organization, session } = request.auth;
              + const { userId, organizationId, sessionId } = request.auth;
              // ...
          },
          { loadUser: true },
      );

      // NextJS
      import { getAuth } from '@clerk/nextjs/server';

      - const { user, organization, session } = getAuth(args);
      + const { userId, organizationId, sessionId } = getAuth(req, opts);

      // Gatsby
      import { withServerAuth } from 'gatsby-plugin-clerk';

      export const getServerData: GetServerData<any> = withServerAuth(
          async props => {
              - const { user, organization, session } =  props;
              + const { userId, organizationId, sessionId } = props;
              return { props: { data: '1', auth: props.auth, userId, organizationId, sessionId } };
          },
          { loadUser: true },
      );
  ```

- Replace return the value of the following jwt helpers to match the format of backend API client return values (for consistency). ([#2596](https://github.com/clerk/javascript/pull/2596)) by [@dimkl](https://github.com/dimkl)

  ```diff
  import { signJwt } from '@clerk/backend/jwt';

  - const { data, error } = await signJwt(...);
  + const { data, errors: [error] = [] } = await signJwt(...);
  ```

  ```diff
  import { verifyJwt } from '@clerk/backend/jwt';

  - const { data, error } = await verifyJwt(...);
  + const { data, errors: [error] = [] } = await verifyJwt(...);
  ```

  ```diff
  import { hasValidSignature } from '@clerk/backend/jwt';

  - const { data, error } = await hasValidSignature(...);
  + const { data, errors: [error] = [] } = await hasValidSignature(...);
  ```

  ```diff
  import { decodeJwt } from '@clerk/backend/jwt';

  - const { data, error } = await decodeJwt(...);
  + const { data, errors: [error] = [] } = await decodeJwt(...);
  ```

  ```diff
  import { verifyToken } from '@clerk/backend';

  - const { data, error } = await verifyToken(...);
  + const { data, errors: [error] = [] } = await verifyToken(...);
  ```

### Patch Changes

- Update `@clerk/nextjs` error messages to refer to `clerkMiddleware()` and deprecated `authMiddleware()` and fix a typo in `cannotRenderSignUpComponentWhenSessionExists` error message. ([#2589](https://github.com/clerk/javascript/pull/2589)) by [@dimkl](https://github.com/dimkl)

## 1.0.0-alpha-v5.16

### Patch Changes

- The `emails` endpoint helper and the corresponding `createEmail` method have been removed from the `@clerk/backend` SDK and `apiClint.emails.createEmail` will no longer be available. ([#2548](https://github.com/clerk/javascript/pull/2548)) by [@Nikpolik](https://github.com/Nikpolik)

  We will not be providing an alternative method for creating and sending emails directly from our JavaScript SDKs with this release. If you are currently using `createEmail` and you wish to update to the latest SDK version, please reach out to our support team (https://clerk.com/support) so we can assist you.

- Update README for v5 ([#2577](https://github.com/clerk/javascript/pull/2577)) by [@LekoArts](https://github.com/LekoArts)

## 1.0.0-alpha-v5.15

### Major Changes

- Change `SessionApi.getToken()` to return consistent `{ data, errors }` return value ([#2539](https://github.com/clerk/javascript/pull/2539)) by [@dimkl](https://github.com/dimkl)

  and fix the `getToken()` from requestState to have the same return behavior as v4
  (return Promise<string> or throw error).
  This change fixes issues with `getToken()` in `@clerk/nextjs` / `@clerk/remix` / `@clerk/fastify` / `@clerk/sdk-node` / `gatsby-plugin-clerk`:

  Example:

  ```typescript
  import { getAuth } from '@clerk/nextjs/server';

  const { getToken } = await getAuth(...);
  const jwtString = await getToken(...);
  ```

  The change in `SessionApi.getToken()` return value is a breaking change, to keep the existing behavior use the following:

  ```typescript
  import { ClerkAPIResponseError } from '@clerk/shared/error';

  const response = await clerkClient.sessions.getToken(...);

  if (response.errors) {
      const { status, statusText, clerkTraceId } = response;
      const error = new ClerkAPIResponseError(statusText || '', {
          data: [],
          status: Number(status || ''),
          clerkTraceId,
      });
      error.errors = response.errors;

      throw error;
  }

  // the value of the v4 `clerkClient.sessions.getToken(...)`
  const jwtString = response.data.jwt;
  ```

### Minor Changes

- Replace the `Clerk-Backend-SDK` header with `User-Agent` in BAPI requests and update it's value to contain both the package name and the package version of the clerk package ([#2558](https://github.com/clerk/javascript/pull/2558)) by [@dimkl](https://github.com/dimkl)

  executing the request. Eg request from `@clerk/nextjs` to BAPI with append `User-Agent: @clerk/nextjs@5.0.0-alpha-v5.16` using the latest version.

  Miscellaneous changes: The backend test build changed to use tsup.

### Patch Changes

- Updated dependencies [[`8cc45d2af`](https://github.com/clerk/javascript/commit/8cc45d2af98320ccced3768fb039b86576e424a5)]:
  - @clerk/shared@2.0.0-alpha-v5.10

## 1.0.0-alpha-v5.14

### Minor Changes

- Add fullName, primaryEmailAddress, primaryPhoneNumber, primaryWeb3Wallet to User class. ([#2493](https://github.com/clerk/javascript/pull/2493)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Fix an error in the handshake flow where the request would throw an unhandled error when verification of the handshake payload fails. ([#2541](https://github.com/clerk/javascript/pull/2541)) by [@BRKalow](https://github.com/BRKalow)

- Replace enums with `as const` objects so `@clerk/backend` is consistent with the other packages ([#2516](https://github.com/clerk/javascript/pull/2516)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.0.0-alpha-v5.13

### Patch Changes

- Updated dependencies [[`1dc28ab46`](https://github.com/clerk/javascript/commit/1dc28ab46f6930074334be183c637ce7a81bebf7), [`ea4933655`](https://github.com/clerk/javascript/commit/ea4933655863ce315324aa2a3be7d5f263c2b61f), [`38d8b3e8a`](https://github.com/clerk/javascript/commit/38d8b3e8a0387bcf0b9c8d16e3bbfcfe9b643ca2)]:
  - @clerk/shared@2.0.0-alpha-v5.9

## 1.0.0-alpha-v5.12

### Patch Changes

- Updated dependencies [[`7ecd6f6ab`](https://github.com/clerk/javascript/commit/7ecd6f6abb0e5bfb1a57c99cc11860de311c3e82)]:
  - @clerk/shared@2.0.0-alpha-v5.8

## 1.0.0-alpha-v5.11

### Minor Changes

- Add `createOrganizationEnabled` param in `@clerk/backend` method `User.updateUser()` ([#2415](https://github.com/clerk/javascript/pull/2415)) by [@dimkl](https://github.com/dimkl)

  Example:

  ```typescript
      import { createClerkClient }  from '@clerk/backend';

      const clerkClient = createClerkClient({...});
      await clerkClient.users.updateUser('user_...', { createOrganizationEnabled: true })
  ```

### Patch Changes

- `OrganizationMembershipRole` should respect authorization types provided by the developer if those exist. ([#2408](https://github.com/clerk/javascript/pull/2408)) by [@panteliselef](https://github.com/panteliselef)

- Fixed an issue where errors returned from backend api requests are not converted to camelCase. ([#2423](https://github.com/clerk/javascript/pull/2423)) by [@Nikpolik](https://github.com/Nikpolik)

## 1.0.0-alpha-v5.10

### Major Changes

- Change return value of `verifyToken()` from `@clerk/backend` to `{ data, error}`. ([#2377](https://github.com/clerk/javascript/pull/2377)) by [@dimkl](https://github.com/dimkl)

  To replicate the current behaviour use this:

  ```typescript
  import { verifyToken } from '@clerk/backend'

  const { data, error }  = await verifyToken(...);
  if(error){
      throw error;
  }
  ```

- Change return values of `signJwt`, `hasValidSignature`, `decodeJwt`, `verifyJwt` ([#2377](https://github.com/clerk/javascript/pull/2377)) by [@dimkl](https://github.com/dimkl)

  to return `{ data, error }`. Example of keeping the same behavior using those utilities:

  ```typescript
  import { signJwt, hasValidSignature, decodeJwt, verifyJwt } from '@clerk/backend/jwt';

  const { data, error } = await signJwt(...)
  if (error) throw error;

  const { data, error } = await hasValidSignature(...)
  if (error) throw error;

  const { data, error } = decodeJwt(...)
  if (error) throw error;

  const { data, error } = await verifyJwt(...)
  if (error) throw error;
  ```

- Changes in exports of `@clerk/backend`: ([#2363](https://github.com/clerk/javascript/pull/2363)) by [@dimkl](https://github.com/dimkl)
  - Expose the following helpers and enums from `@clerk/backend/internal`:
    ```typescript
    import {
      AuthStatus,
      buildRequestUrl,
      constants,
      createAuthenticateRequest,
      createIsomorphicRequest,
      debugRequestState,
      makeAuthObjectSerializable,
      prunePrivateMetadata,
      redirect,
      sanitizeAuthObject,
      signedInAuthObject,
      signedOutAuthObject,
    } from '@clerk/backend/internal';
    ```
  - Drop the above exports from the top-level api:
    ```typescript
    // Before
    import { AuthStatus, ... } from '@clerk/backend';
    // After
    import { AuthStatus, ... } from '@clerk/backend/internal';
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.

- Changes in exports of `@clerk/backend`: ([#2365](https://github.com/clerk/javascript/pull/2365)) by [@dimkl](https://github.com/dimkl)
  - Drop the following internal exports from the top-level api:
    ```typescript
    // Before
    import {
      AllowlistIdentifier,
      Client,
      DeletedObject,
      Email,
      EmailAddress,
      ExternalAccount,
      IdentificationLink,
      Invitation,
      OauthAccessToken,
      ObjectType,
      Organization,
      OrganizationInvitation,
      OrganizationMembership,
      OrganizationMembershipPublicUserData,
      PhoneNumber,
      RedirectUrl,
      SMSMessage,
      Session,
      SignInToken,
      Token,
      User,
      Verification,
    } from '@clerk/backend';
    // After : no alternative since there is no need to use those classes
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.
  - Keep those 3 resource related type exports
    ```typescript
    import type { Organization, Session, User, WebhookEvent, WebhookEventType } from '@clerk/backend';
    ```

- Changes in exports of `@clerk/backend`: ([#2364](https://github.com/clerk/javascript/pull/2364)) by [@dimkl](https://github.com/dimkl)
  - Expose the following helpers and enums from `@clerk/backend/jwt`:
    ```typescript
    import { decodeJwt, hasValidSignature, signJwt, verifyJwt } from '@clerk/backend/jwt';
    ```
  - Drop the above exports from the top-level api:
    ```typescript
    // Before
    import { decodeJwt, ... } from '@clerk/backend';
    // After
    import { decodeJwt, ... } from '@clerk/backend/jwt';
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.

- Changes in `@clerk/backend` exports: ([#2362](https://github.com/clerk/javascript/pull/2362)) by [@dimkl](https://github.com/dimkl)
  - Drop Internal `deserialize` helper
  - Introduce `/errors` subpath export, eg:
    ```typescript
    import {
      TokenVerificationError,
      TokenVerificationErrorAction,
      TokenVerificationErrorCode,
      TokenVerificationErrorReason,
    } from '@clerk/backend/errors';
    ```
  - Drop errors from top-level export
    ```typescript
    // Before
    import { TokenVerificationError, TokenVerificationErrorReason } from '@clerk/backend';
    // After
    import { TokenVerificationError, TokenVerificationErrorReason } from '@clerk/backend/errors';
    ```

### Minor Changes

- Improve ESM support in `@clerk/backend` for Node by using .mjs for #crypto subpath import ([#2360](https://github.com/clerk/javascript/pull/2360)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Update the handshake flow to only trigger for document requests. ([#2352](https://github.com/clerk/javascript/pull/2352)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e)]:
  - @clerk/shared@2.0.0-alpha-v5.7

## 1.0.0-alpha-v5.9

### Major Changes

- Drop unused SearchParams.AuthStatus constant ([#2347](https://github.com/clerk/javascript/pull/2347)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.0.0-alpha-v5.8

### Major Changes

- Remove the named `Clerk` import from `@clerk/backend` and import `createClerkClient` instead. The latter is a factory method that will create a Clerk client instance for you. This aligns usage across our SDKs and will enable us to better ship DX improvements in the future. ([#2317](https://github.com/clerk/javascript/pull/2317)) by [@tmilewski](https://github.com/tmilewski)

  Inside your code, search for occurrences like these:

  ```js
  import { Clerk } from '@clerk/backend';
  const clerk = Clerk({ secretKey: '...' });
  ```

  You need to rename the import from `Clerk` to `createClerkClient` and change its usage:

  ```js
  import { createClerkClient } from '@clerk/backend';
  const clerk = createClerkClient({ secretKey: '...' });
  ```

- - Refactor the `authenticateRequest()` flow to use the new client handshake endpoint. This replaces the previous "interstitial"-based flow. This should improve performance and overall reliability of Clerk's server-side request authentication functionality. ([#2300](https://github.com/clerk/javascript/pull/2300)) by [@BRKalow](https://github.com/BRKalow)

  - `authenticateRequest()` now accepts two arguments, a `Request` object to authenticate and options:
    ```ts
    authenticateRequest(new Request(...), { secretKey: '...' })
    ```

### Minor Changes

- Introduce Protect for authorization. ([#2170](https://github.com/clerk/javascript/pull/2170)) by [@panteliselef](https://github.com/panteliselef)

  Changes in public APIs:
  - Rename Gate to Protect
  - Support for permission checks. (Previously only roles could be used)
  - Remove the `experimental` tags and prefixes
  - Drop `some` from the `has` utility and Protect. Protect now accepts a `condition` prop where a function is expected with the `has` being exposed as the param.
  - Protect can now be used without required props. In this case behaves as `<SignedIn>`, if no authorization props are passed.
  - `has` will throw an error if neither `permission` or `role` is passed.
  - `auth().protect()` for Nextjs App Router. Allow per page protection in app router. This utility will automatically throw a 404 error if user is not authorized or authenticated.
    - inside a page or layout file it will render the nearest `not-found` component set by the developer
    - inside a route handler it will return empty response body with a 404 status code

### Patch Changes

- Updated dependencies [[`896cb6104`](https://github.com/clerk/javascript/commit/896cb610409f84c0ff7a4f502f0b4ccee1afc157), [`75ea300bc`](https://github.com/clerk/javascript/commit/75ea300bce16a0ce401a225263bb267ad2a217b8)]:
  - @clerk/shared@2.0.0-alpha-v5.6

## 1.0.0-alpha-v5.7

### Major Changes

- Limit TokenVerificationError exports to TokenVerificationError and TokenVerificationErrorReason ([#2189](https://github.com/clerk/javascript/pull/2189)) by [@tmilewski](https://github.com/tmilewski)

### Minor Changes

- Add missing `createdAt` param in `User#createUser()` of `@clerk/backend`. ([#2284](https://github.com/clerk/javascript/pull/2284)) by [@dimkl](https://github.com/dimkl)

  Fix `clerkClient.verifyToken()` signature to support a single `token: string` parameter.

### Patch Changes

- Added missing types for `clerkClient.invitations.createInvitation` ([#2268](https://github.com/clerk/javascript/pull/2268)) by [@royanger](https://github.com/royanger)

## 1.0.0-alpha-v5.6

### Minor Changes

- - Added the `User.last_active_at` timestamp field which stores the latest date of session activity, with day precision. For further details, please consult the [Backend API documentation](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUser). ([#2261](https://github.com/clerk/javascript/pull/2261)) by [@georgepsarakis](https://github.com/georgepsarakis)

  - Added the `last_active_at_since` filtering parameter for the Users listing request. The new parameter can be used to retrieve users that have displayed session activity since the given date. For further details, please consult the [Backend API documentation](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUserList).
  - Added the `last_active_at` available options for the `orderBy` parameter of the Users listing request. For further details, please consult the [Backend API documentation](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUserList).

### Patch Changes

- Drop the introduction of `OrganizationRole` and `OrganizationPermission` resources fro BAPI. ([#2252](https://github.com/clerk/javascript/pull/2252)) by [@panteliselef](https://github.com/panteliselef)

- Set correct information on required Node.js and React versions in README ([#2264](https://github.com/clerk/javascript/pull/2264)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`d30ea1faa`](https://github.com/clerk/javascript/commit/d30ea1faa45074e09c037530e8ba3ca2dbd50654)]:
  - @clerk/shared@2.0.0-alpha-v5.5

## 1.0.0-alpha-v5.5

### Patch Changes

- Updated dependencies [[`4b8bedc66`](https://github.com/clerk/javascript/commit/4b8bedc66d47dca5c6192148f4b31ae6d49ff733), [`c776f86fb`](https://github.com/clerk/javascript/commit/c776f86fb2a999dcae46fda9abb5005718c354b2)]:
  - @clerk/shared@2.0.0-alpha-v5.4

## 1.0.0-alpha-v5.4

### Minor Changes

- Expose `totalCount` from `@clerk/backend` client responses for responses ([#2199](https://github.com/clerk/javascript/pull/2199)) by [@dimkl](https://github.com/dimkl)

  containing pagination information or for responses with type `{ data: object[] }`.

  Example:

  ```typescript
  import { Clerk } from '@clerk/backend';

  const clerkClient = Clerk({ secretKey: '...' });

  // current
  const { data } = await clerkClient.organizations.getOrganizationList();
  console.log('totalCount: ', data.length);

  // new
  const { data, totalCount } = await clerkClient.organizations.getOrganizationList();
  console.log('totalCount: ', totalCount);
  ```

- Re-use common pagination types for consistency across types. ([#2210](https://github.com/clerk/javascript/pull/2210)) by [@dimkl](https://github.com/dimkl)

  Types introduced in `@clerk/types`:
  - `ClerkPaginationRequest` : describes pagination related props in request payload
  - `ClerkPaginatedResponse` : describes pagination related props in response body
  - `ClerkPaginationParams` : describes pagination related props in api client method params

## 1.0.0-alpha-v5.3

### Minor Changes

- Breaking Changes: ([#2169](https://github.com/clerk/javascript/pull/2169)) by [@dimkl](https://github.com/dimkl)
  - Drop `isLegacyFrontendApiKey` from `@clerk/shared`
  - Drop default exports from `@clerk/clerk-js`
    - on headless Clerk type
    - on ui and ui.retheme `Portal`
  - Use `isProductionFromSecretKey` instead of `isProductionFromApiKey`
  - Use `isDevelopmentFromSecretKey` instead of `isDevelopmentFromApiKey`

  Changes:
  - Rename `HeadlessBrowserClerkConstrutor` / `HeadlessBrowserClerkConstructor` (typo)
  - Use `isomorphicAtob` / `isomorhpicBtoa` to replace `base-64` in `@clerk/expo`
  - Refactor merging build-time and runtime props in `@clerk/backend` clerk client
  - Drop `node-fetch` dependency from `@clerk/backend`
  - Drop duplicate test in `@clerk/backend`

- Deprecate `createSMSMessage` and `SMSMessageApi` from `clerkClient`. ([#2165](https://github.com/clerk/javascript/pull/2165)) by [@Nikpolik](https://github.com/Nikpolik)

  The equivalent `/sms_messages` Backend API endpoint will also be dropped in the future, since this feature will no longer be available for new instances.

  For a brief period it will still be accessible for instances that have used it in the past 7
  days (13-11-2023 to 20-11-2023).

  New instances will get a 403 forbidden response if they try to access it.

### Patch Changes

- Add OrganizationRoleAPI for CRUD operations regarding instance level organization roles. ([#2177](https://github.com/clerk/javascript/pull/2177)) by [@panteliselef](https://github.com/panteliselef)

- Remove createSms functions from @clerk/backend and @clerk/sdk-node. ([#2165](https://github.com/clerk/javascript/pull/2165)) by [@Nikpolik](https://github.com/Nikpolik)

  The equivalent /sms_messages Backend API endpoint will also dropped in the future, since this feature will no longer be available for new instances.

  For a brief period it will still be accessible for instances that have used it in the past 7
  days (13-11-2023 to 20-11-2023).

  New instances will get a 403 forbidden response if they try to access it.

- Add OrganizationPermissionAPI for CRUD operations regarding instance level organization permissions. ([#2178](https://github.com/clerk/javascript/pull/2178)) by [@panteliselef](https://github.com/panteliselef)

- Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry. ([#2154](https://github.com/clerk/javascript/pull/2154)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`52ff8fe6b`](https://github.com/clerk/javascript/commit/52ff8fe6b6ff88ceb5e1246378b54b0565bede9d), [`4bb57057e`](https://github.com/clerk/javascript/commit/4bb57057e9af20fc433626ed178d97d3ca811362), [`40ac4b645`](https://github.com/clerk/javascript/commit/40ac4b645f449b546dae5b4c0d013c9d9ea6d09c)]:
  - @clerk/shared@2.0.0-alpha-v5.3

## 1.0.0-alpha-v5.2

### Major Changes

- Change the minimal Node.js version required by Clerk to `18.17.0`. ([#2162](https://github.com/clerk/javascript/pull/2162)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`c2a090513`](https://github.com/clerk/javascript/commit/c2a0905132684a4a1e8d598b66caddf20062273e)]:
  - @clerk/shared@2.0.0-alpha-v5.2

## 1.0.0-alpha-v5.1

### Major Changes

- Drop default exports from all packages. Migration guide: ([#2150](https://github.com/clerk/javascript/pull/2150)) by [@dimkl](https://github.com/dimkl)
  - use `import { Clerk } from '@clerk/backend';`
  - use `import { clerkInstance } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-js';`
  - use `import { Clerk } from '@clerk/clerk-js/headless';`
  - use `import { IsomorphicClerk } from '@clerk/clerk-react'`

- Change the response payload of Backend API requests to return `{ data, errors }` instead of return the data and throwing on error response. ([#2126](https://github.com/clerk/javascript/pull/2126)) by [@dimkl](https://github.com/dimkl)

  Code example to keep the same behavior:

  ```typescript
  import { users } from '@clerk/backend';
  import { ClerkAPIResponseError } from '@clerk/shared/error';

  const { data, errors, clerkTraceId, status, statusText } = await users.getUser('user_deadbeef');
  if (errors) {
    throw new ClerkAPIResponseError(statusText, {
      data: errors,
      status,
      clerkTraceId,
    });
  }
  ```

- Enforce passing `request` param to `authenticateRequest` method of `@clerk/backend` ([#2122](https://github.com/clerk/javascript/pull/2122)) by [@dimkl](https://github.com/dimkl)

  instead of passing each header or cookie related option that is used internally to
  determine the request state.

  Migration guide:
  - use `request` param in `clerkClient.authenticateRequest()` instead of:
    - `origin`
    - `host`
    - `forwardedHost`
    - `forwardedProto`
    - `referrer`
    - `userAgent`
    - `cookieToken`
    - `clientUat`
    - `headerToken`
    - `searchParams`

  Example

  ```typescript
  //
  // current
  //
  import { clerkClient } from '@clerk/backend'

  const requestState = await clerkClient.authenticateRequest({
      secretKey: 'sk_....'
      publishableKey: 'pk_....'
      origin: req.headers.get('origin'),
      host: req.headers.get('host'),
      forwardedHost: req.headers.get('x-forwarded-host'),
      forwardedProto: req.headers.get('x-forwarded-proto'),
      referrer: req.headers.get('referer'),
      userAgent: req.headers.get('user-agent'),
      clientUat: req.cookies.get('__client_uat'),
      cookieToken: req.cookies.get('__session'),
      headerToken: req.headers.get('authorization'),
      searchParams: req.searchParams
  });

  //
  // new
  //
  import { clerkClient,  } from '@clerk/backend'

  // use req (if it's a fetch#Request instance) or use `createIsomorphicRequest` from `@clerk/backend`
  // to re-construct fetch#Request instance
  const requestState = await clerkClient.authenticateRequest({
      secretKey: 'sk_....'
      publishableKey: 'pk_....'
      request: req
  });

  ```

- Drop deprecated properties. Migration steps: ([#1899](https://github.com/clerk/javascript/pull/1899)) by [@dimkl](https://github.com/dimkl)
  - use `createClerkClient` instead of `__unstable_options`
  - use `publishableKey` instead of `frontendApi`
  - use `clockSkewInMs` instead of `clockSkewInSeconds`
  - use `apiKey` instead of `secretKey`
  - drop `httpOptions`
  - use `*.image` instead of
    - `ExternalAccount.picture`
    - `ExternalAccountJSON.avatar_url`
    - `Organization.logoUrl`
    - `OrganizationJSON.logo_url`
    - `User.profileImageUrl`
    - `UserJSON.profile_image_url`
    - `OrganizationMembershipPublicUserData.profileImageUrl`
    - `OrganizationMembershipPublicUserDataJSON.profile_image_url`
  - drop `pkgVersion`
  - use `Organization.getOrganizationInvitationList` with `status` instead of `getPendingOrganizationInvitationList`
  - drop `orgs` claim (if required, can be manually added by using `user.organizations` in a jwt template)
  - use `localInterstitial` instead of `remotePublicInterstitial` / `remotePublicInterstitialUrl`

  Internal changes:
  - replaced error enum (and it's) `SetClerkSecretKeyOrAPIKey` with `SetClerkSecretKey`

### Patch Changes

- Strip `experimental__has` from the auth object in `makeAuthObjectSerializable()`. This fixes an issue in Next.js where an error is being thrown when this function is passed to a client component as a prop. ([#2101](https://github.com/clerk/javascript/pull/2101)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`64d3763ec`](https://github.com/clerk/javascript/commit/64d3763ec73747ad04c4b47017195cf4114e150c), [`83e9d0846`](https://github.com/clerk/javascript/commit/83e9d08469e7c2840f06aa7d86831055e23f67a5), [`7f833da9e`](https://github.com/clerk/javascript/commit/7f833da9ebc1b2ec9c65513628c377d0584e5d72), [`492b8a7b1`](https://github.com/clerk/javascript/commit/492b8a7b12f14658a384566012e5807f0a171710), [`0d1052ac2`](https://github.com/clerk/javascript/commit/0d1052ac284b909786fd0e4744b02fcf4d1a8be6), [`5471c7e8d`](https://github.com/clerk/javascript/commit/5471c7e8dd0155348748fa90e5ae97093f59efe9), [`e0e79b4fe`](https://github.com/clerk/javascript/commit/e0e79b4fe47f64006718d547c898b9f67fe4d424)]:
  - @clerk/shared@2.0.0-alpha-v5.1

## 1.0.0-alpha-v5.0

### Major Changes

- Internal update default apiUrl domain from clerk.dev to clerk.com ([#1878](https://github.com/clerk/javascript/pull/1878)) by [@dimkl](https://github.com/dimkl)

- Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

### Minor Changes

- Added prefers-color-scheme to interstitial ([#1935](https://github.com/clerk/javascript/pull/1935)) by [@royanger](https://github.com/royanger)

- Add support for NextJS 14 ([#1968](https://github.com/clerk/javascript/pull/1968)) by [@dimkl](https://github.com/dimkl)

- Experimental support for `<Gate/>` with role checks. ([#1942](https://github.com/clerk/javascript/pull/1942)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Add `sha256` hasher support to PasswordHasher as described in [`Users#CreateUser`](https://clerk.com/docs/reference/backend-api/tag/Users#operation/CreateUser!path=password_hasher) ([#1941](https://github.com/clerk/javascript/pull/1941)) by [@MathieuNls](https://github.com/MathieuNls)

- Fix type inferance for auth helper. ([#2047](https://github.com/clerk/javascript/pull/2047)) by [@panteliselef](https://github.com/panteliselef)

- Add clerkTraceId to ClerkBackendApiResponse and ClerkAPIResponseError to allow for better tracing and debugging API error responses. ([#1986](https://github.com/clerk/javascript/pull/1986)) by [@Nikpolik](https://github.com/Nikpolik)

  Uses `clerk_trace_id` when available in a response and defaults to [`cf-ray` identifier](https://developers.cloudflare.com/fundamentals/reference/cloudflare-ray-id/) if missing.

- Updated dependencies [[`743c4d204`](https://github.com/clerk/javascript/commit/743c4d20423790b554e66923466081c0d3b0d9ed), [`791c49807`](https://github.com/clerk/javascript/commit/791c49807c3c9e19964cbf621c935d237caeecf3), [`a68eb3083`](https://github.com/clerk/javascript/commit/a68eb3083ff68459cd33098e2df190a5ba26c841), [`ef2325dcc`](https://github.com/clerk/javascript/commit/ef2325dcc18729e9ce9ee5823e9a963efa51dbc1), [`71663c568`](https://github.com/clerk/javascript/commit/71663c568926b1d60b97aa7ccc5298d05b618af2), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`7644b7472`](https://github.com/clerk/javascript/commit/7644b74726ba73e615a1256f9ff3fa03b0f8bc30), [`f5d55bb1f`](https://github.com/clerk/javascript/commit/f5d55bb1fc6a87303fb8bf461c3a917ae4da4005), [`6f755addd`](https://github.com/clerk/javascript/commit/6f755addd0886b9ff8b0d5dbe48e37470049acad)]:
  - @clerk/shared@2.0.0-alpha-v5.0

## 0.31.3

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Update imports of `@clerk/shared` to granular entrypoints. This addresses warnings during a Next.js build that are the result of unsupported APIs being included in the module graph of builds for the edge runtime. ([#1924](https://github.com/clerk/javascript/pull/1924)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`3bf64107e`](https://github.com/clerk/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`52f8553d2`](https://github.com/clerk/javascript/commit/52f8553d22f9454ee1194fd162410db15da7a4be), [`92727eec3`](https://github.com/clerk/javascript/commit/92727eec39566278263ffa118a085493f964eb94), [`b09b66eec`](https://github.com/clerk/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerk/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62), [`aa4cd7615`](https://github.com/clerk/javascript/commit/aa4cd761585b888706a36a6eed7436a8f0476dbf)]:
  - @clerk/shared@1.0.0
  - @clerk/types@3.57.0

## 0.31.2

### Patch Changes

- Updated dependencies [[`9ca215702`](https://github.com/clerk/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11)]:
  - @clerk/types@3.56.1

## 0.31.1

### Patch Changes

- Added new function `signJwt(payload, key, options)` for JWT token signing. ([#1786](https://github.com/clerk/javascript/pull/1786)) by [@Nikpolik](https://github.com/Nikpolik)

  Also updated the existing `hasValidSignature` and `verifyJwt` method to handle PEM-formatted keys directly (previously they had to be converted to jwks).
  For key compatibility, support is specifically confined to `RSA` types and formats `jwk, pkcs8, spki`.

- Updated dependencies [[`35be8709d`](https://github.com/clerk/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`e38488c92`](https://github.com/clerk/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerk/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`9b644d799`](https://github.com/clerk/javascript/commit/9b644d7991b8cba4b385e9443f87798cde5c9989), [`a9894b445`](https://github.com/clerk/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`834dadb36`](https://github.com/clerk/javascript/commit/834dadb36c30b2a8f052784de4ad1026b0083b4e), [`70f251007`](https://github.com/clerk/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`a46d6fe99`](https://github.com/clerk/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/types@3.56.0
  - @clerk/shared@0.24.5

## 0.31.0

### Minor Changes

- Add support for LinkedIn OIDC ([#1772](https://github.com/clerk/javascript/pull/1772)) by [@fragoulis](https://github.com/fragoulis)

### Patch Changes

- Throw an error if the `signInUrl` is on the same origin of a satellite application or if it is of invalid format ([#1845](https://github.com/clerk/javascript/pull/1845)) by [@desiprisg](https://github.com/desiprisg)

- Avoid always showing deprecation warnings for `frontendApi` and `apiKey` in `@clerk/clerk-sdk-node` ([#1856](https://github.com/clerk/javascript/pull/1856)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`977336f79`](https://github.com/clerk/javascript/commit/977336f793cd4ce5984f98dac3cedf9f5ec363f5), [`997b8e256`](https://github.com/clerk/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91e9a55f4`](https://github.com/clerk/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`91014880d`](https://github.com/clerk/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`7f4d4b942`](https://github.com/clerk/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b)]:
  - @clerk/shared@0.24.4
  - @clerk/types@3.55.0

## 0.30.3

### Patch Changes

- Apply deprecation warnings for @clerk/types: ([#1823](https://github.com/clerk/javascript/pull/1823)) by [@dimkl](https://github.com/dimkl)
  - `orgs` jwt claims
  - `apiKey`
  - `frontendApi`
  - `redirect_url`
  - `password`
  - `generateSignature`
  - `afterSwitchOrganizationUrl`
  - `profileImageUrl`

- Remove deprecation warning that is logging more than intended and not actionable for users of our SDKs. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Retry the implemented changes from [#1767](https://github.com/clerk/javascript/pull/1767) which were reverted in [#1806](https://github.com/clerk/javascript/pull/1806) due to RSC related errors (not all uses components had the `use client` directive). Restore the original PR and add additional `use client` directives to ensure it works correctly. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1e212c19d`](https://github.com/clerk/javascript/commit/1e212c19d1cbfbcf6bc6718f5aec0a3cb893b96f), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679)]:
  - @clerk/shared@0.24.3

## 0.30.2

### Patch Changes

- Improve the `jwk-remote-missing` error by adding the available JWK IDs to the error message. This way you can understand why the entry was not found and compare the available ones with other keys. ([#1816](https://github.com/clerk/javascript/pull/1816)) by [@LekoArts](https://github.com/LekoArts)

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Update `authenticateRequest()` to respect the `CloudFront-Forwarded-Proto` header when determining the correct `forwardedProto` value. This fixes an issue when Clerk is used in applications that are deployed behind AWS CloudFront, where previously all requests were treated as cross-origin. ([#1817](https://github.com/clerk/javascript/pull/1817)) by [@dimkl](https://github.com/dimkl)

- Remove experimental jsdoc tags from multi-domain types. ([#1819](https://github.com/clerk/javascript/pull/1819)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerk/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`164f3aac7`](https://github.com/clerk/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerk/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerk/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`9514618d6`](https://github.com/clerk/javascript/commit/9514618d65cfdde0ff011eabd41a992b61fc8dc1), [`c7c6912f3`](https://github.com/clerk/javascript/commit/c7c6912f34874467bc74104690fe9f95491cc10d), [`71bb1c7b5`](https://github.com/clerk/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf)]:
  - @clerk/types@3.54.0

## 0.30.1

### Patch Changes

- Temporarily revert internal change to resolve RSC-related errors ([#1806](https://github.com/clerk/javascript/pull/1806)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 0.30.0

### Minor Changes

- Replace utilities with `@clerk/shared` exports ([#1769](https://github.com/clerk/javascript/pull/1769)) by [@dimkl](https://github.com/dimkl)

- Introduce a new getOrganizationInvitationList() method, along with support for filtering by status and the regular limit & offset parameters, which it can be used in order to list the invitations of a specific organization. We also marked the old getPendingOrganizationInvitationList() method as deprecated ([#1796](https://github.com/clerk/javascript/pull/1796)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Apply deprecation warnings for `@clerk/backend`: ([#1777](https://github.com/clerk/javascript/pull/1777)) by [@dimkl](https://github.com/dimkl)
  - backend api return format
  - `clockSkewInSeconds`
  - `pkgVersion`
  - `picture`/`logoUrl`/`profileImageUrl`
  - `InterstitialAPI`
  - `httpOptions`
  - `apiKey`
  - `frontendApi`
  - `__unstable_options`

- Updated dependencies [[`7ffa6fac3`](https://github.com/clerk/javascript/commit/7ffa6fac3762f6fb130ba2f2fcaa28e52b36b3b4), [`5c8754239`](https://github.com/clerk/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81), [`2f6a6ac99`](https://github.com/clerk/javascript/commit/2f6a6ac9991469bf8532019bb22ff50adecdb434), [`753f7bbda`](https://github.com/clerk/javascript/commit/753f7bbda9bbb7444f96222a3b6cae815a09058f), [`55c8ebd39`](https://github.com/clerk/javascript/commit/55c8ebd390dd88036aee06866009be6a50c63138)]:
  - @clerk/shared@0.24.0
  - @clerk/types@3.53.0

## 0.29.3

### Patch Changes

- Updated dependencies [[`c61ddf5bf`](https://github.com/clerk/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerk/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/types@3.52.1

## 0.29.2

### Patch Changes

- Refactor the internal jwt assertions in separate module to improve testability and changed dates to UTC in jwt verification error messages ([#1724](https://github.com/clerk/javascript/pull/1724)) by [@dimkl](https://github.com/dimkl)

- Removing the `__clerk_referrer_primary` that was marked as deprecated. It was introduced to support the multi-domain featured, but was replaced shortly after. ([#1755](https://github.com/clerk/javascript/pull/1755)) by [@panteliselef](https://github.com/panteliselef)

- Fix 1 second flakiness in assertions tests ([#1758](https://github.com/clerk/javascript/pull/1758)) by [@dimkl](https://github.com/dimkl)

- Refactor the internal generation of request URLs to use a shared helper from `@clerk/backend` ([#1532](https://github.com/clerk/javascript/pull/1532)) by [@dimkl](https://github.com/dimkl)

## 0.29.1

### Patch Changes

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- Fix missing members_count property for an Organization ([#1735](https://github.com/clerk/javascript/pull/1735)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`e99df0a0d`](https://github.com/clerk/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerk/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`01b024c57`](https://github.com/clerk/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68)]:
  - @clerk/types@3.52.0

## 0.29.0

### Minor Changes

- Introduce a new getOrganizationInvitation() method with which you can fetch a single organization invitation by providing the ID ([#1682](https://github.com/clerk/javascript/pull/1682)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Updated dependencies [[`463ff84f5`](https://github.com/clerk/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`1426e5eb3`](https://github.com/clerk/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739)]:
  - @clerk/types@3.51.0

## 0.28.1

### Patch Changes

- Improve error messaging when clock skew is detected. ([#1661](https://github.com/clerk/javascript/pull/1661)) by [@BRKalow](https://github.com/BRKalow)

## 0.28.0

### Minor Changes

- Introduce `hasImage` in User / Organization / Session resources ([#1544](https://github.com/clerk/javascript/pull/1544)) by [@dimkl](https://github.com/dimkl)

- Include `signUpUrl`, `afterSignInUrl` and `afterSignUpUrl` to `authenticateRequest` options. ([#1470](https://github.com/clerk/javascript/pull/1470)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Updated dependencies [[`96cc1921c`](https://github.com/clerk/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerk/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerk/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerk/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerk/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerk/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerk/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerk/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerk/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerk/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`86de584dd`](https://github.com/clerk/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e02a1aff2`](https://github.com/clerk/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerk/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerk/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerk/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerk/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerk/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`89bc5de04`](https://github.com/clerk/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/types@3.50.0

## 0.27.0

### Minor Changes

- Add filter by status(pending, accepted, revoked) support for getInvitationList method ([#1533](https://github.com/clerk/javascript/pull/1533)) by [@raptisj](https://github.com/raptisj)

### Patch Changes

- Deprecate usage of old image fields in favor of `imageUrl` ([#1543](https://github.com/clerk/javascript/pull/1543)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`ea95525a4`](https://github.com/clerk/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerk/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`d433b83b9`](https://github.com/clerk/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerk/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`0a59e122d`](https://github.com/clerk/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/types@3.49.0

## 0.26.0

### Minor Changes

- Support hosting NextJs apps on non-Vercel platforms by constructing req.url using host-related headers instead of using on req.url directly. CLERK_TRUST_HOST is now enabled by default. ([#1492](https://github.com/clerk/javascript/pull/1492)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerk/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3)]:
  - @clerk/types@3.48.1

## 0.25.1

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerk/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c)]:
  - @clerk/types@3.48.0

## 0.25.0

### Minor Changes

- Introduce `createIsomorphicRequest` in `@clerk/backend` ([#1393](https://github.com/clerk/javascript/pull/1393)) by [@anagstef](https://github.com/anagstef)

  This utility simplifies the `authenticateRequest` signature, and it makes it easier to integrate with more frameworks.

- Add `updateUserProfileImage` and `updateOrganizationLogo` methods for uploading images to `User` and `Organization` respectively. ([#1456](https://github.com/clerk/javascript/pull/1456)) by [@anagstef](https://github.com/anagstef)

### Patch Changes

- Add missing property 'adminDeleteEnabled' in Organization resource ([#1468](https://github.com/clerk/javascript/pull/1468)) by [@chanioxaris](https://github.com/chanioxaris)

- Fix the headers checked to determine the Response Content-Type ([#1469](https://github.com/clerk/javascript/pull/1469)) by [@anagstef](https://github.com/anagstef)

- Add missing property 'privateMetadata' in OrganizationInvitation resource ([#1468](https://github.com/clerk/javascript/pull/1468)) by [@chanioxaris](https://github.com/chanioxaris)

- Updated dependencies [[`73c9c1d0e`](https://github.com/clerk/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerk/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerk/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`090bab66e`](https://github.com/clerk/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`592911196`](https://github.com/clerk/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8)]:
  - @clerk/types@3.47.0

## 0.24.0

### Minor Changes

- The `clockSkewInSeconds` property is now deprecated from the `verifyJWT` options in favour of the new `clockSkewInMs` property. The old property accepted a value in milliseconds, so this change fixes the property name. ([#1450](https://github.com/clerk/javascript/pull/1450)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Add a more descriptive error when secret key is invalid ([#1446](https://github.com/clerk/javascript/pull/1446)) by [@raptisj](https://github.com/raptisj)

## 0.23.7

### Patch Changes

- Treat expired JWT as signed-out state for requests originated from non-browser clients on satellite apps ([#1433](https://github.com/clerk/javascript/pull/1433)) by [@panteliselef](https://github.com/panteliselef)

- Make all 4 keys (legacy and new) optional in authenticateRequest params ([#1437](https://github.com/clerk/javascript/pull/1437)) by [@anagstef](https://github.com/anagstef)

- Increase the default value for clock skew in `verifyJwt` from 2 to 5 seconds ([#1428](https://github.com/clerk/javascript/pull/1428)) by [@anagstef](https://github.com/anagstef)

## 0.23.6

### Patch Changes

- Updated dependencies [[`30f8ad18a`](https://github.com/clerk/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c)]:
  - @clerk/types@3.46.1

## 0.23.5

### Patch Changes

- Updated dependencies [[`bfb3af28`](https://github.com/clerk/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/types@3.46.0

## 0.23.4

### Patch Changes

- Simplify the signature of the low-level `authenticateRequest` helper. ([#1329](https://github.com/clerk/javascript/pull/1329)) by [@anagstef](https://github.com/anagstef)
  - One pair of legacy or new instance keys are required instead of all 4 of them in `authenticateRequest`
  - `@clerk/backend` now can handle the `"Bearer "` prefix in Authorization header for better DX
  - `host` parameter is now optional in `@clerk/backend`

- Updated dependencies [[`11954816`](https://github.com/clerk/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`32148490`](https://github.com/clerk/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0

## 0.23.3

### Patch Changes

- Updated dependencies [[`17cc14ec`](https://github.com/clerk/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/types@3.44.0

## 0.23.2

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerk/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerk/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/types@3.43.0

## 0.23.1

### Patch Changes

- Allow `clerkJSVersion` to be passed when loading interstitial. Support for ([#1354](https://github.com/clerk/javascript/pull/1354)) by [@panteliselef](https://github.com/panteliselef)
  - Nextjs
  - Remix
  - Node

## 0.23.0

### Minor Changes

- Support `audience` parameter in authentication request ([#1004](https://github.com/clerk/javascript/pull/1004)) by [@dimkl](https://github.com/dimkl)

  The audience parameter is used to verify the aud claim in
  the request matches the value of the parameter or is included
  (when the user provides a list).

  Resolves:
  - [#978](https://github.com/clerk/javascript/pull/978)
  - [#1004](https://github.com/clerk/javascript/pull/1004)

### Patch Changes

- Updated dependencies [[`c42b4ac0`](https://github.com/clerk/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963)]:
  - @clerk/types@3.42.0

## 0.22.0

### Minor Changes

- Add support for NextJS applications hosted on AWS Amplify by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Address npm audit issues for the clerk backend package by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Add support for NextJS applications hosted on Railway by [@nikosdouvlis](https://github.com/nikosdouvlis)

### Patch Changes

- Remove unused `url` prop from `redirectToSignIn` and `redirectToSignUp` helpers by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/types@3.41.1

## [0.21.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.21.0-staging.4...@clerk/backend@0.21.0) (2023-06-03)

**Note:** Version bump only for package @clerk/backend

### [0.20.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.20.1-staging.0...@clerk/backend@0.20.1) (2023-05-26)

**Note:** Version bump only for package @clerk/backend

## [0.20.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.20.0-staging.2...@clerk/backend@0.20.0) (2023-05-23)

**Note:** Version bump only for package @clerk/backend

### [0.19.2](https://github.com/clerk/javascript/compare/@clerk/backend@0.19.2-staging.1...@clerk/backend@0.19.2) (2023-05-18)

**Note:** Version bump only for package @clerk/backend

### [0.19.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.19.1-staging.1...@clerk/backend@0.19.1) (2023-05-17)

**Note:** Version bump only for package @clerk/backend

## [0.19.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.19.0-staging.1...@clerk/backend@0.19.0) (2023-05-15)

**Note:** Version bump only for package @clerk/backend

## [0.18.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.18.0-staging.4...@clerk/backend@0.18.0) (2023-05-04)

**Note:** Version bump only for package @clerk/backend

## [0.18.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/backend@0.18.0-staging.3...@clerk/backend@0.18.0-staging.4) (2023-05-04)

**Note:** Version bump only for package @clerk/backend

## [0.18.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/backend@0.18.0-staging.2...@clerk/backend@0.18.0-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/backend

### [0.17.2](https://github.com/clerk/javascript/compare/@clerk/backend@0.17.2-staging.0...@clerk/backend@0.17.2) (2023-04-19)

**Note:** Version bump only for package @clerk/backend

### [0.17.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.17.0...@clerk/backend@0.17.1) (2023-04-19)

### Bug Fixes

- **backend:** Add missing Webhooks export ([db8d224](https://github.com/clerk/javascript/commit/db8d22433779e39d7b566acf8a5b7b50d57d3738))

## [0.17.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.17.0-staging.0...@clerk/backend@0.17.0) (2023-04-12)

**Note:** Version bump only for package @clerk/backend

### [0.16.2](https://github.com/clerk/javascript/compare/@clerk/backend@0.16.2-staging.3...@clerk/backend@0.16.2) (2023-04-11)

**Note:** Version bump only for package @clerk/backend

### [0.16.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.16.1-staging.0...@clerk/backend@0.16.1) (2023-04-06)

**Note:** Version bump only for package @clerk/backend

## [0.16.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.16.0-staging.2...@clerk/backend@0.16.0) (2023-03-31)

**Note:** Version bump only for package @clerk/backend

## [0.16.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.15.1-staging.0...@clerk/backend@0.16.0-staging.0) (2023-03-31)

### Features

- **backend:** Add signInUrl to buildPublicInterstitialUrl ([2bbbaa6](https://github.com/clerk/javascript/commit/2bbbaa662c6fd8be3e95dc1c4ed3700e47f39f75))
- **backend:** Support multi-domain in dev instances ([2b8eb75](https://github.com/clerk/javascript/commit/2b8eb7542adbc20d7f075603fb5091063faca7e5))

### Bug Fixes

- **backend:** Update interstitial to include signInUrl ([d923618](https://github.com/clerk/javascript/commit/d923618f4b285c53c411cc4a4ba821792c4c33e7))

## [0.15.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.15.0-staging.0...@clerk/backend@0.15.0) (2023-03-29)

**Note:** Version bump only for package @clerk/backend

### [0.13.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.13.1-staging.2...@clerk/backend@0.13.1) (2023-03-10)

**Note:** Version bump only for package @clerk/backend

## [0.13.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.13.0-staging.1...@clerk/backend@0.13.0) (2023-03-09)

**Note:** Version bump only for package @clerk/backend

## [0.12.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.12.0-staging.1...@clerk/backend@0.12.0) (2023-03-07)

**Note:** Version bump only for package @clerk/backend

## [0.11.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.11.0-staging.1...@clerk/backend@0.11.0) (2023-03-03)

**Note:** Version bump only for package @clerk/backend

## [0.10.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.10.0-staging.0...@clerk/backend@0.10.0) (2023-03-01)

**Note:** Version bump only for package @clerk/backend

### [0.9.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.9.1-staging.0...@clerk/backend@0.9.1) (2023-02-25)

**Note:** Version bump only for package @clerk/backend

## [0.9.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.9.0-staging.0...@clerk/backend@0.9.0) (2023-02-24)

**Note:** Version bump only for package @clerk/backend

### [0.8.1-staging.4](https://github.com/clerk/javascript/compare/@clerk/backend@0.8.1-staging.3...@clerk/backend@0.8.1-staging.4) (2023-02-22)

### Bug Fixes

- **backend:** Update user params ([624402f](https://github.com/clerk/javascript/commit/624402fa0e2ff00819254d0fe0e6e7f44bdbe42c))

## [0.8.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.8.0-staging.0...@clerk/backend@0.8.0) (2023-02-17)

**Note:** Version bump only for package @clerk/backend

## [0.7.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.7.0-staging.0...@clerk/backend@0.7.0) (2023-02-15)

**Note:** Version bump only for package @clerk/backend

### [0.6.2](https://github.com/clerk/javascript/compare/@clerk/backend@0.6.2-staging.1...@clerk/backend@0.6.2) (2023-02-10)

**Note:** Version bump only for package @clerk/backend

### [0.6.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.6.1-staging.0...@clerk/backend@0.6.1) (2023-02-07)

**Note:** Version bump only for package @clerk/backend

### [0.6.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.6.0-staging.0...@clerk/backend@0.6.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/backend

## [0.6.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.6.0-staging.0...@clerk/backend@0.6.0) (2023-02-07)

**Note:** Version bump only for package @clerk/backend

### [0.5.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.5.1-staging.4...@clerk/backend@0.5.1) (2023-02-01)

**Note:** Version bump only for package @clerk/backend

## [0.5.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.5.0-staging.2...@clerk/backend@0.5.0) (2023-01-27)

**Note:** Version bump only for package @clerk/backend

### [0.4.3](https://github.com/clerk/javascript/compare/@clerk/backend@0.4.3-staging.1...@clerk/backend@0.4.3) (2023-01-24)

### Bug Fixes

- **backend,clerk-sdk-node,shared:** Drop support for NodeJS 12 ([d9169ab](https://github.com/clerk/javascript/commit/d9169ab4873e1745d7250628f5bf8c8f7da49421))

### [0.4.2](https://github.com/clerk/javascript/compare/@clerk/backend@0.4.1...@clerk/backend@0.4.2) (2023-01-20)

**Note:** Version bump only for package @clerk/backend

### [0.4.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.4.1-staging.0...@clerk/backend@0.4.1) (2023-01-18)

**Note:** Version bump only for package @clerk/backend

## [0.4.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.4.0-staging.7...@clerk/backend@0.4.0) (2023-01-17)

### Bug Fixes

- **backend,clerk-sdk-node,shared:** Support node12 runtimes ([fdcd6b3](https://github.com/clerk/javascript/commit/fdcd6b3f7c61490297a5fdfa80228cbb7787b49b))
- **backend:** Polyfill webcrypto for node14 and node12 ([329bd6d](https://github.com/clerk/javascript/commit/329bd6d3426929e2cee06aeb04fd910b394a920f))

### [0.3.2](https://github.com/clerk/javascript/compare/@clerk/backend@0.3.2-staging.0...@clerk/backend@0.3.2) (2022-12-23)

**Note:** Version bump only for package @clerk/backend

### [0.3.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.3.1-staging.1...@clerk/backend@0.3.1) (2022-12-19)

**Note:** Version bump only for package @clerk/backend

## [0.3.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.3.0-staging.0...@clerk/backend@0.3.0) (2022-12-13)

**Note:** Version bump only for package @clerk/backend

### [0.2.3](https://github.com/clerk/javascript/compare/@clerk/backend@0.2.2...@clerk/backend@0.2.3) (2022-12-12)

**Note:** Version bump only for package @clerk/backend

### [0.2.2](https://github.com/clerk/javascript/compare/@clerk/backend@0.2.2-staging.1...@clerk/backend@0.2.2) (2022-12-09)

**Note:** Version bump only for package @clerk/backend

### [0.2.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.2.0...@clerk/backend@0.2.1) (2022-12-08)

**Note:** Version bump only for package @clerk/backend

## [0.2.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.2.0-staging.0...@clerk/backend@0.2.0) (2022-12-08)

**Note:** Version bump only for package @clerk/backend

### [0.1.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.1.1-staging.0...@clerk/backend@0.1.1) (2022-12-02)

**Note:** Version bump only for package @clerk/backend

## [0.1.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.1.0-staging.4...@clerk/backend@0.1.0) (2022-11-30)

**Note:** Version bump only for package @clerk/backend

## [0.1.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/backend@0.1.0-staging.3...@clerk/backend@0.1.0-staging.4) (2022-11-29)

**Note:** Version bump only for package @clerk/backend
