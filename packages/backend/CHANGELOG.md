# Change Log

## 0.28.1

### Patch Changes

- Improve error messaging when clock skew is detected. ([#1661](https://github.com/clerkinc/javascript/pull/1661)) by [@BRKalow](https://github.com/BRKalow)

## 0.28.0

### Minor Changes

- Introduce `hasImage` in User / Organization / Session resources ([#1544](https://github.com/clerkinc/javascript/pull/1544)) by [@dimkl](https://github.com/dimkl)

- Include `signUpUrl`, `afterSignInUrl` and `afterSignUpUrl` to `authenticateRequest` options. ([#1470](https://github.com/clerkinc/javascript/pull/1470)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Updated dependencies [[`96cc1921c`](https://github.com/clerkinc/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerkinc/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerkinc/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerkinc/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerkinc/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerkinc/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerkinc/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerkinc/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerkinc/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerkinc/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`86de584dd`](https://github.com/clerkinc/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e02a1aff2`](https://github.com/clerkinc/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerkinc/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerkinc/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerkinc/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerkinc/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerkinc/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`89bc5de04`](https://github.com/clerkinc/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/types@3.50.0

## 0.27.0

### Minor Changes

- Add filter by status(pending, accepted, revoked) support for getInvitationList method ([#1533](https://github.com/clerkinc/javascript/pull/1533)) by [@raptisj](https://github.com/raptisj)

### Patch Changes

- Deprecate usage of old image fields in favor of `imageUrl` ([#1543](https://github.com/clerkinc/javascript/pull/1543)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`ea95525a4`](https://github.com/clerkinc/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerkinc/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`d433b83b9`](https://github.com/clerkinc/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerkinc/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`0a59e122d`](https://github.com/clerkinc/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/types@3.49.0

## 0.26.0

### Minor Changes

- Support hosting NextJs apps on non-Vercel platforms by constructing req.url using host-related headers instead of using on req.url directly. CLERK_TRUST_HOST is now enabled by default. ([#1492](https://github.com/clerkinc/javascript/pull/1492)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerkinc/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3)]:
  - @clerk/types@3.48.1

## 0.25.1

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerkinc/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c)]:
  - @clerk/types@3.48.0

## 0.25.0

### Minor Changes

- Introduce `createIsomorphicRequest` in `@clerk/backend` ([#1393](https://github.com/clerkinc/javascript/pull/1393)) by [@anagstef](https://github.com/anagstef)

  This utility simplifies the `authenticateRequest` signature, and it makes it easier to integrate with more frameworks.

- Add `updateUserProfileImage` and `updateOrganizationLogo` methods for uploading images to `User` and `Organization` respectively. ([#1456](https://github.com/clerkinc/javascript/pull/1456)) by [@anagstef](https://github.com/anagstef)

### Patch Changes

- Add missing property 'adminDeleteEnabled' in Organization resource ([#1468](https://github.com/clerkinc/javascript/pull/1468)) by [@chanioxaris](https://github.com/chanioxaris)

- Fix the headers checked to determine the Response Content-Type ([#1469](https://github.com/clerkinc/javascript/pull/1469)) by [@anagstef](https://github.com/anagstef)

- Add missing property 'privateMetadata' in OrganizationInvitation resource ([#1468](https://github.com/clerkinc/javascript/pull/1468)) by [@chanioxaris](https://github.com/chanioxaris)

- Updated dependencies [[`73c9c1d0e`](https://github.com/clerkinc/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerkinc/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerkinc/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`090bab66e`](https://github.com/clerkinc/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`592911196`](https://github.com/clerkinc/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8)]:
  - @clerk/types@3.47.0

## 0.24.0

### Minor Changes

- The `clockSkewInSeconds` property is now deprecated from the `verifyJWT` options in favour of the new `clockSkewInMs` property. The old property accepted a value in milliseconds, so this change fixes the property name. ([#1450](https://github.com/clerkinc/javascript/pull/1450)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Add a more descriptive error when secret key is invalid ([#1446](https://github.com/clerkinc/javascript/pull/1446)) by [@raptisj](https://github.com/raptisj)

## 0.23.7

### Patch Changes

- Treat expired JWT as signed-out state for requests originated from non-browser clients on satellite apps ([#1433](https://github.com/clerkinc/javascript/pull/1433)) by [@panteliselef](https://github.com/panteliselef)

- Make all 4 keys (legacy and new) optional in authenticateRequest params ([#1437](https://github.com/clerkinc/javascript/pull/1437)) by [@anagstef](https://github.com/anagstef)

- Increase the default value for clock skew in `verifyJwt` from 2 to 5 seconds ([#1428](https://github.com/clerkinc/javascript/pull/1428)) by [@anagstef](https://github.com/anagstef)

## 0.23.6

### Patch Changes

- Updated dependencies [[`30f8ad18a`](https://github.com/clerkinc/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c)]:
  - @clerk/types@3.46.1

## 0.23.5

### Patch Changes

- Updated dependencies [[`bfb3af28`](https://github.com/clerkinc/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/types@3.46.0

## 0.23.4

### Patch Changes

- Simplify the signature of the low-level `authenticateRequest` helper. ([#1329](https://github.com/clerkinc/javascript/pull/1329)) by [@anagstef](https://github.com/anagstef)

  - One pair of legacy or new instance keys are required instead of all 4 of them in `authenticateRequest`
  - `@clerk/backend` now can handle the `"Bearer "` prefix in Authorization header for better DX
  - `host` parameter is now optional in `@clerk/backend`

- Updated dependencies [[`11954816`](https://github.com/clerkinc/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`32148490`](https://github.com/clerkinc/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0

## 0.23.3

### Patch Changes

- Updated dependencies [[`17cc14ec`](https://github.com/clerkinc/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/types@3.44.0

## 0.23.2

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerkinc/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerkinc/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/types@3.43.0

## 0.23.1

### Patch Changes

- Allow `clerkJSVersion` to be passed when loading interstitial. Support for ([#1354](https://github.com/clerkinc/javascript/pull/1354)) by [@panteliselef](https://github.com/panteliselef)

  - Nextjs
  - Remix
  - Node

## 0.23.0

### Minor Changes

- Support `audience` parameter in authentication request ([#1004](https://github.com/clerkinc/javascript/pull/1004)) by [@dimkl](https://github.com/dimkl)

  The audience parameter is used to verify the the aud claim in
  the request matches the value of the parameter or is included
  (when the user provides a list).

  Resolves:

  - [#978](https://github.com/clerkinc/javascript/pull/978)
  - [#1004](https://github.com/clerkinc/javascript/pull/1004)

### Patch Changes

- Updated dependencies [[`c42b4ac0`](https://github.com/clerkinc/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963)]:
  - @clerk/types@3.42.0

## 0.22.0

### Minor Changes

- Add support for NextJS applications hosted on AWS Amplify by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Address npm audit issues for the clerk backend package by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Add support for NextJS applications hosted on Railway by [@nikosdouvlis](https://github.com/nikosdouvlis)

### Patch Changes

- Remove unused `url` prop from `redirectToSignIn` and `redirectToSignUp` helpers by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/types@3.41.1

## [0.21.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.21.0-staging.4...@clerk/backend@0.21.0) (2023-06-03)

**Note:** Version bump only for package @clerk/backend

### [0.20.1](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.20.1-staging.0...@clerk/backend@0.20.1) (2023-05-26)

**Note:** Version bump only for package @clerk/backend

## [0.20.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.20.0-staging.2...@clerk/backend@0.20.0) (2023-05-23)

**Note:** Version bump only for package @clerk/backend

### [0.19.2](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.19.2-staging.1...@clerk/backend@0.19.2) (2023-05-18)

**Note:** Version bump only for package @clerk/backend

### [0.19.1](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.19.1-staging.1...@clerk/backend@0.19.1) (2023-05-17)

**Note:** Version bump only for package @clerk/backend

## [0.19.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.19.0-staging.1...@clerk/backend@0.19.0) (2023-05-15)

**Note:** Version bump only for package @clerk/backend

## [0.18.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.18.0-staging.4...@clerk/backend@0.18.0) (2023-05-04)

**Note:** Version bump only for package @clerk/backend

## [0.18.0-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.18.0-staging.3...@clerk/backend@0.18.0-staging.4) (2023-05-04)

**Note:** Version bump only for package @clerk/backend

## [0.18.0-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.18.0-staging.2...@clerk/backend@0.18.0-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/backend

### [0.17.2](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.17.2-staging.0...@clerk/backend@0.17.2) (2023-04-19)

**Note:** Version bump only for package @clerk/backend

### [0.17.1](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.17.0...@clerk/backend@0.17.1) (2023-04-19)

### Bug Fixes

- **backend:** Add missing Webhooks export ([db8d224](https://github.com/clerkinc/javascript/commit/db8d22433779e39d7b566acf8a5b7b50d57d3738))

## [0.17.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.17.0-staging.0...@clerk/backend@0.17.0) (2023-04-12)

**Note:** Version bump only for package @clerk/backend

### [0.16.2](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.16.2-staging.3...@clerk/backend@0.16.2) (2023-04-11)

**Note:** Version bump only for package @clerk/backend

### [0.16.1](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.16.1-staging.0...@clerk/backend@0.16.1) (2023-04-06)

**Note:** Version bump only for package @clerk/backend

## [0.16.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.16.0-staging.2...@clerk/backend@0.16.0) (2023-03-31)

**Note:** Version bump only for package @clerk/backend

## [0.16.0-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.15.1-staging.0...@clerk/backend@0.16.0-staging.0) (2023-03-31)

### Features

- **backend:** Add signInUrl to buildPublicInterstitialUrl ([2bbbaa6](https://github.com/clerkinc/javascript/commit/2bbbaa662c6fd8be3e95dc1c4ed3700e47f39f75))
- **backend:** Support multi-domain in dev instances ([2b8eb75](https://github.com/clerkinc/javascript/commit/2b8eb7542adbc20d7f075603fb5091063faca7e5))

### Bug Fixes

- **backend:** Update interstitial to include signInUrl ([d923618](https://github.com/clerkinc/javascript/commit/d923618f4b285c53c411cc4a4ba821792c4c33e7))

## [0.15.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.15.0-staging.0...@clerk/backend@0.15.0) (2023-03-29)

**Note:** Version bump only for package @clerk/backend

### [0.13.1](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.13.1-staging.2...@clerk/backend@0.13.1) (2023-03-10)

**Note:** Version bump only for package @clerk/backend

## [0.13.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.13.0-staging.1...@clerk/backend@0.13.0) (2023-03-09)

**Note:** Version bump only for package @clerk/backend

## [0.12.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.12.0-staging.1...@clerk/backend@0.12.0) (2023-03-07)

**Note:** Version bump only for package @clerk/backend

## [0.11.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.11.0-staging.1...@clerk/backend@0.11.0) (2023-03-03)

**Note:** Version bump only for package @clerk/backend

## [0.10.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.10.0-staging.0...@clerk/backend@0.10.0) (2023-03-01)

**Note:** Version bump only for package @clerk/backend

### [0.9.1](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.9.1-staging.0...@clerk/backend@0.9.1) (2023-02-25)

**Note:** Version bump only for package @clerk/backend

## [0.9.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.9.0-staging.0...@clerk/backend@0.9.0) (2023-02-24)

**Note:** Version bump only for package @clerk/backend

### [0.8.1-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.8.1-staging.3...@clerk/backend@0.8.1-staging.4) (2023-02-22)

### Bug Fixes

- **backend:** Update user params ([624402f](https://github.com/clerkinc/javascript/commit/624402fa0e2ff00819254d0fe0e6e7f44bdbe42c))

## [0.8.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.8.0-staging.0...@clerk/backend@0.8.0) (2023-02-17)

**Note:** Version bump only for package @clerk/backend

## [0.7.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.7.0-staging.0...@clerk/backend@0.7.0) (2023-02-15)

**Note:** Version bump only for package @clerk/backend

### [0.6.2](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.6.2-staging.1...@clerk/backend@0.6.2) (2023-02-10)

**Note:** Version bump only for package @clerk/backend

### [0.6.1](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.6.1-staging.0...@clerk/backend@0.6.1) (2023-02-07)

**Note:** Version bump only for package @clerk/backend

### [0.6.1-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.6.0-staging.0...@clerk/backend@0.6.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/backend

## [0.6.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.6.0-staging.0...@clerk/backend@0.6.0) (2023-02-07)

**Note:** Version bump only for package @clerk/backend

### [0.5.1](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.5.1-staging.4...@clerk/backend@0.5.1) (2023-02-01)

**Note:** Version bump only for package @clerk/backend

## [0.5.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.5.0-staging.2...@clerk/backend@0.5.0) (2023-01-27)

**Note:** Version bump only for package @clerk/backend

### [0.4.3](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.4.3-staging.1...@clerk/backend@0.4.3) (2023-01-24)

### Bug Fixes

- **backend,clerk-sdk-node,shared:** Drop support for NodeJS 12 ([d9169ab](https://github.com/clerkinc/javascript/commit/d9169ab4873e1745d7250628f5bf8c8f7da49421))

### [0.4.2](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.4.1...@clerk/backend@0.4.2) (2023-01-20)

**Note:** Version bump only for package @clerk/backend

### [0.4.1](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.4.1-staging.0...@clerk/backend@0.4.1) (2023-01-18)

**Note:** Version bump only for package @clerk/backend

## [0.4.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.4.0-staging.7...@clerk/backend@0.4.0) (2023-01-17)

### Bug Fixes

- **backend,clerk-sdk-node,shared:** Support node12 runtimes ([fdcd6b3](https://github.com/clerkinc/javascript/commit/fdcd6b3f7c61490297a5fdfa80228cbb7787b49b))
- **backend:** Polyfill webcrypto for node14 and node12 ([329bd6d](https://github.com/clerkinc/javascript/commit/329bd6d3426929e2cee06aeb04fd910b394a920f))

### [0.3.2](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.3.2-staging.0...@clerk/backend@0.3.2) (2022-12-23)

**Note:** Version bump only for package @clerk/backend

### [0.3.1](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.3.1-staging.1...@clerk/backend@0.3.1) (2022-12-19)

**Note:** Version bump only for package @clerk/backend

## [0.3.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.3.0-staging.0...@clerk/backend@0.3.0) (2022-12-13)

**Note:** Version bump only for package @clerk/backend

### [0.2.3](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.2.2...@clerk/backend@0.2.3) (2022-12-12)

**Note:** Version bump only for package @clerk/backend

### [0.2.2](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.2.2-staging.1...@clerk/backend@0.2.2) (2022-12-09)

**Note:** Version bump only for package @clerk/backend

### [0.2.1](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.2.0...@clerk/backend@0.2.1) (2022-12-08)

**Note:** Version bump only for package @clerk/backend

## [0.2.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.2.0-staging.0...@clerk/backend@0.2.0) (2022-12-08)

**Note:** Version bump only for package @clerk/backend

### [0.1.1](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.1.1-staging.0...@clerk/backend@0.1.1) (2022-12-02)

**Note:** Version bump only for package @clerk/backend

## [0.1.0](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.1.0-staging.4...@clerk/backend@0.1.0) (2022-11-30)

**Note:** Version bump only for package @clerk/backend

## [0.1.0-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/backend@0.1.0-staging.3...@clerk/backend@0.1.0-staging.4) (2022-11-29)

**Note:** Version bump only for package @clerk/backend
