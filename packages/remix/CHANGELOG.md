# Change Log

## 2.10.1

### Patch Changes

- Updated dependencies [[`975412ed5`](https://github.com/clerkinc/javascript/commit/975412ed5307ac81128c87289178bd1e6c2fb1af), [`a102c21d4`](https://github.com/clerkinc/javascript/commit/a102c21d4762895a80a1ad846700763cc801b3f3)]:
  - @clerk/backend@0.28.1
  - @clerk/clerk-react@4.24.1

## 2.10.0

### Minor Changes

- Configure sign in/up and afterSignIn/Up paths for remix via env variables. ([#1470](https://github.com/clerkinc/javascript/pull/1470)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Updated dependencies [[`96cc1921c`](https://github.com/clerkinc/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerkinc/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerkinc/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerkinc/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerkinc/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerkinc/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerkinc/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerkinc/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerkinc/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerkinc/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`86de584dd`](https://github.com/clerkinc/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e02a1aff2`](https://github.com/clerkinc/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerkinc/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerkinc/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerkinc/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerkinc/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerkinc/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`30fcdd51a`](https://github.com/clerkinc/javascript/commit/30fcdd51a98dea60da36f2b5152ea22405d2c4f2), [`89bc5de04`](https://github.com/clerkinc/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/shared@0.22.0
  - @clerk/types@3.50.0
  - @clerk/clerk-react@4.24.0
  - @clerk/backend@0.28.0

## 2.9.1

### Patch Changes

- Updated dependencies [[`ea95525a4`](https://github.com/clerkinc/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerkinc/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`d433b83b9`](https://github.com/clerkinc/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerkinc/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`876777cb1`](https://github.com/clerkinc/javascript/commit/876777cb14443917d8e0a04b363327d165ad5580), [`0a59e122d`](https://github.com/clerkinc/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/backend@0.27.0
  - @clerk/types@3.49.0
  - @clerk/shared@0.21.0
  - @clerk/clerk-react@4.23.2

## 2.9.0

### Minor Changes

- Support hosting NextJs apps on non-Vercel platforms by constructing req.url using host-related headers instead of using on req.url directly. CLERK_TRUST_HOST is now enabled by default. ([#1492](https://github.com/clerkinc/javascript/pull/1492)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerkinc/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3), [`4ff4b716f`](https://github.com/clerkinc/javascript/commit/4ff4b716fdb12b18182e506737afafc7dbc05604)]:
  - @clerk/types@3.48.1
  - @clerk/backend@0.26.0
  - @clerk/clerk-react@4.23.1

## 2.8.1

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerkinc/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c)]:
  - @clerk/clerk-react@4.23.0
  - @clerk/types@3.48.0
  - @clerk/backend@0.25.1

## 2.8.0

### Minor Changes

- Introduce `createIsomorphicRequest` in `@clerk/backend` ([#1393](https://github.com/clerkinc/javascript/pull/1393)) by [@anagstef](https://github.com/anagstef)

  This utility simplifies the `authenticateRequest` signature, and it makes it easier to integrate with more frameworks.

### Patch Changes

- Updated dependencies [[`16c3283ec`](https://github.com/clerkinc/javascript/commit/16c3283ec192cb7525312da5e718aa7cac8b8445), [`73c9c1d0e`](https://github.com/clerkinc/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerkinc/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerkinc/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`e3036848d`](https://github.com/clerkinc/javascript/commit/e3036848d19a48935129aec2fe50003518a3aa53), [`fd692af79`](https://github.com/clerkinc/javascript/commit/fd692af791fe206724e38eff647b8562e72c3652), [`090bab66e`](https://github.com/clerkinc/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`5ecbb0a37`](https://github.com/clerkinc/javascript/commit/5ecbb0a37e99fa2099629c573951c7735d5f0810), [`bb0d69b45`](https://github.com/clerkinc/javascript/commit/bb0d69b455fa5fd6ca5b1f45a0f242957521dfbb), [`592911196`](https://github.com/clerkinc/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8), [`dd10ebeae`](https://github.com/clerkinc/javascript/commit/dd10ebeae54d70b84b7c0374cea2876e9cdd6622)]:
  - @clerk/backend@0.25.0
  - @clerk/types@3.47.0
  - @clerk/shared@0.20.0
  - @clerk/clerk-react@4.22.1

## 2.7.0

### Minor Changes

- Introduce `V2_ClerkErrorBoundary` to support `v2_errorBoundary` future flag ([#1444](https://github.com/clerkinc/javascript/pull/1444)) by [@anagstef](https://github.com/anagstef)

## 2.6.17

### Patch Changes

- Updated dependencies [[`2ad7cf390`](https://github.com/clerkinc/javascript/commit/2ad7cf390ba84b8e767ed6fe136800e38356d79c), [`f6b77a1a3`](https://github.com/clerkinc/javascript/commit/f6b77a1a338cddeadb3cc7019171bf9703d7676e), [`f0b044c47`](https://github.com/clerkinc/javascript/commit/f0b044c475546e96a5995ef16198e60e35e8098f)]:
  - @clerk/backend@0.24.0
  - @clerk/clerk-react@4.22.0

## 2.6.16

### Patch Changes

- Updated dependencies [[`3fee736c9`](https://github.com/clerkinc/javascript/commit/3fee736c993b0a8fd157d716890810d04e632962), [`968d9c265`](https://github.com/clerkinc/javascript/commit/968d9c2651ce25f6e03c2e6eecd81f7daf876f03), [`ac4e47274`](https://github.com/clerkinc/javascript/commit/ac4e47274afc2ab3a55a78b388a14bed76600402), [`5957a3da6`](https://github.com/clerkinc/javascript/commit/5957a3da68cde3386c741812e2bc03b5519d00e0)]:
  - @clerk/backend@0.23.7
  - @clerk/clerk-react@4.21.1

## 2.6.15

### Patch Changes

- Updated dependencies [[`1e71b60a2`](https://github.com/clerkinc/javascript/commit/1e71b60a2c6832a5f4f9c75ad4152b82db2b52e1)]:
  - @clerk/clerk-react@4.21.0

## 2.6.14

### Patch Changes

- Updated dependencies [[`30f8ad18a`](https://github.com/clerkinc/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c)]:
  - @clerk/types@3.46.1
  - @clerk/backend@0.23.6
  - @clerk/clerk-react@4.20.6

## 2.6.13

### Patch Changes

- Updated dependencies [[`bfb3af28`](https://github.com/clerkinc/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/types@3.46.0
  - @clerk/backend@0.23.5
  - @clerk/clerk-react@4.20.5

## 2.6.12

### Patch Changes

- Updated dependencies [[`11954816`](https://github.com/clerkinc/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`de2347f9`](https://github.com/clerkinc/javascript/commit/de2347f9efaab4903787a905528a06551a9b7883), [`32148490`](https://github.com/clerkinc/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0
  - @clerk/backend@0.23.4
  - @clerk/clerk-react@4.20.4

## 2.6.11

### Patch Changes

- Updated dependencies [[`17cc14ec`](https://github.com/clerkinc/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/types@3.44.0
  - @clerk/backend@0.23.3
  - @clerk/clerk-react@4.20.3

## 2.6.10

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerkinc/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerkinc/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/types@3.43.0
  - @clerk/backend@0.23.2
  - @clerk/clerk-react@4.20.2

## 2.6.9

### Patch Changes

- Updated dependencies [[`59bc649a`](https://github.com/clerkinc/javascript/commit/59bc649a92316f5d6ade00f3cd52a9b46dcdc401)]:
  - @clerk/shared@0.19.1
  - @clerk/clerk-react@4.20.1

## 2.6.8

### Patch Changes

- Allow `clerkJSVersion` to be passed when loading interstitial. Support for ([#1354](https://github.com/clerkinc/javascript/pull/1354)) by [@panteliselef](https://github.com/panteliselef)

  - Nextjs
  - Remix
  - Node

- Updated dependencies [[`b945c921`](https://github.com/clerkinc/javascript/commit/b945c92100454f00ff4b6b9c769201ca2ceaac93)]:
  - @clerk/backend@0.23.1

## 2.6.7

### Patch Changes

- Support `audience` parameter in authentication request ([#1004](https://github.com/clerkinc/javascript/pull/1004)) by [@dimkl](https://github.com/dimkl)

  The audience parameter is used to verify the the aud claim in
  the request matches the value of the parameter or is included
  (when the user provides a list).

  Resolves:

  - [#978](https://github.com/clerkinc/javascript/pull/978)
  - [#1004](https://github.com/clerkinc/javascript/pull/1004)

- Updated dependencies [[`7af91bc3`](https://github.com/clerkinc/javascript/commit/7af91bc3ecc25cba04968b491e1e3c6ec32c18af), [`c42b4ac0`](https://github.com/clerkinc/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`6f3d4305`](https://github.com/clerkinc/javascript/commit/6f3d43055690db1d69a356503a0a45dc948beaef), [`010484f4`](https://github.com/clerkinc/javascript/commit/010484f4978b9616e8c2ef50986eda742c4967bd)]:
  - @clerk/shared@0.19.0
  - @clerk/clerk-react@4.20.0
  - @clerk/types@3.42.0
  - @clerk/backend@0.23.0

## 2.6.6

### Patch Changes

- ESM/CJS support for `@clerk/clerk-react` by [@nikosdouvlis](https://github.com/nikosdouvlis)

  Changes that should affect users and OS contributors:

  - Better source map support for `@clerk/clerk-react`, `@clerk/shared`. This affects anyone developing in our monorepo or anyone using a debugger with Clerk installed in their app.
  - Easier node_modules debugging as `@clerk/clerk-react`, `@clerk/shared` and `@clerk/nextjs` are no longer getting bundled as a single-file package. This also improves error logging in nextjs a lot, as nextjs usually logs the line that threw the error - a minified, single-file package, usually consists of a very long single-line module, so logging error in NextJS wasn't ideal.
  - Headless clerk-js bundle size reduced by ~10kb, normal clerk-ks by ~6kb
  - A new `clerkJSVersion` prop has been added on ClerkProvider allowing to fetch a specific clerk-js version.

- Updated dependencies [[`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/backend@0.22.0
  - @clerk/types@3.41.1
  - @clerk/shared@0.18.0
  - @clerk/clerk-react@4.19.0

## [2.6.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.6.0-staging.4...@clerk/remix@2.6.0) (2023-05-15)

**Note:** Version bump only for package @clerk/remix

### [2.5.6](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.5.6-staging.5...@clerk/remix@2.5.6) (2023-05-04)

**Note:** Version bump only for package @clerk/remix

### [2.5.6-staging.5](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.5.6-staging.4...@clerk/remix@2.5.6-staging.5) (2023-05-04)

**Note:** Version bump only for package @clerk/remix

### [2.5.6-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.5.6-staging.2...@clerk/remix@2.5.6-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/remix

### [2.5.5](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.5.5-staging.0...@clerk/remix@2.5.5) (2023-04-19)

**Note:** Version bump only for package @clerk/remix

### [2.5.4](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.5.3...@clerk/remix@2.5.4) (2023-04-19)

**Note:** Version bump only for package @clerk/remix

### [2.5.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.5.3-staging.0...@clerk/remix@2.5.3) (2023-04-12)

**Note:** Version bump only for package @clerk/remix

### [2.5.2](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.5.2-staging.3...@clerk/remix@2.5.2) (2023-04-11)

**Note:** Version bump only for package @clerk/remix

### [2.5.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.5.1-staging.0...@clerk/remix@2.5.1) (2023-04-06)

**Note:** Version bump only for package @clerk/remix

## [2.5.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.5.0-staging.3...@clerk/remix@2.5.0) (2023-03-31)

**Note:** Version bump only for package @clerk/remix

## [2.5.0-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.5.0-staging.2...@clerk/remix@2.5.0-staging.3) (2023-03-31)

**Note:** Version bump only for package @clerk/remix

## [2.5.0-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.4.1-staging.0...@clerk/remix@2.5.0-staging.0) (2023-03-31)

### Features

- **remix:** Support new env var CLERK_SIGN_IN_URL ([a64689e](https://github.com/clerkinc/javascript/commit/a64689e2ec3d59e67761df891d67193f0cd161a5))

## [2.4.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.4.0-staging.1...@clerk/remix@2.4.0) (2023-03-29)

**Note:** Version bump only for package @clerk/remix

### [2.2.11](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.2.11-staging.2...@clerk/remix@2.2.11) (2023-03-10)

**Note:** Version bump only for package @clerk/remix

### [2.2.10](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.2.10-staging.1...@clerk/remix@2.2.10) (2023-03-09)

**Note:** Version bump only for package @clerk/remix

### [2.2.9](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.2.9-staging.1...@clerk/remix@2.2.9) (2023-03-07)

**Note:** Version bump only for package @clerk/remix

### [2.2.8](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.2.8-staging.1...@clerk/remix@2.2.8) (2023-03-03)

**Note:** Version bump only for package @clerk/remix

### [2.2.7](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.2.7-staging.0...@clerk/remix@2.2.7) (2023-03-01)

**Note:** Version bump only for package @clerk/remix

### [2.2.6](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.2.6-staging.0...@clerk/remix@2.2.6) (2023-02-25)

**Note:** Version bump only for package @clerk/remix

### [2.2.5](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.2.5-staging.7...@clerk/remix@2.2.5) (2023-02-24)

**Note:** Version bump only for package @clerk/remix

### [2.2.5-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.2.5-staging.3...@clerk/remix@2.2.5-staging.4) (2023-02-22)

**Note:** Version bump only for package @clerk/remix

### [2.2.4](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.2.4-staging.1...@clerk/remix@2.2.4) (2023-02-17)

**Note:** Version bump only for package @clerk/remix

### [2.2.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.2.3-staging.2...@clerk/remix@2.2.3) (2023-02-15)

**Note:** Version bump only for package @clerk/remix

### [2.2.2](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.2.2-staging.1...@clerk/remix@2.2.2) (2023-02-10)

**Note:** Version bump only for package @clerk/remix

### [2.2.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.2.1-staging.0...@clerk/remix@2.2.1) (2023-02-07)

**Note:** Version bump only for package @clerk/remix

### [2.2.1-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.2.0-staging.0...@clerk/remix@2.2.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/remix

## [2.2.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.2.0-staging.0...@clerk/remix@2.2.0) (2023-02-07)

**Note:** Version bump only for package @clerk/remix

## [2.1.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.1.0-staging.1...@clerk/remix@2.1.0) (2023-02-01)

**Note:** Version bump only for package @clerk/remix

### [2.0.6](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.0.6-staging.4...@clerk/remix@2.0.6) (2023-01-27)

**Note:** Version bump only for package @clerk/remix

### [2.0.5](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.0.5-staging.1...@clerk/remix@2.0.5) (2023-01-24)

**Note:** Version bump only for package @clerk/remix

### [2.0.4](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.0.3...@clerk/remix@2.0.4) (2023-01-20)

**Note:** Version bump only for package @clerk/remix

### [2.0.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.0.2...@clerk/remix@2.0.3) (2023-01-19)

**Note:** Version bump only for package @clerk/remix

### [2.0.2](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.0.2-staging.0...@clerk/remix@2.0.2) (2023-01-18)

**Note:** Version bump only for package @clerk/remix

### [2.0.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.0.0...@clerk/remix@2.0.1) (2023-01-17)

**Note:** Version bump only for package @clerk/remix

## [2.0.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@2.0.0-staging.7...@clerk/remix@2.0.0) (2023-01-17)

**Note:** Version bump only for package @clerk/remix

### [1.4.8](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.4.8-staging.0...@clerk/remix@1.4.8) (2022-12-23)

**Note:** Version bump only for package @clerk/remix

### [1.4.7](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.4.7-staging.1...@clerk/remix@1.4.7) (2022-12-19)

**Note:** Version bump only for package @clerk/remix

### [1.4.6](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.4.6-staging.1...@clerk/remix@1.4.6) (2022-12-13)

**Note:** Version bump only for package @clerk/remix

### [1.4.5](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.4.4...@clerk/remix@1.4.5) (2022-12-12)

**Note:** Version bump only for package @clerk/remix

### [1.4.4](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.4.4-staging.1...@clerk/remix@1.4.4) (2022-12-09)

**Note:** Version bump only for package @clerk/remix

### [1.4.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.4.2...@clerk/remix@1.4.3) (2022-12-08)

**Note:** Version bump only for package @clerk/remix

### [1.4.2](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.4.2-staging.0...@clerk/remix@1.4.2) (2022-12-08)

**Note:** Version bump only for package @clerk/remix

### [1.4.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.4.1-staging.0...@clerk/remix@1.4.1) (2022-12-02)

**Note:** Version bump only for package @clerk/remix

## [1.4.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.4.0-staging.5...@clerk/remix@1.4.0) (2022-11-30)

**Note:** Version bump only for package @clerk/remix

## [1.4.0-staging.5](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.4.0-staging.4...@clerk/remix@1.4.0-staging.5) (2022-11-29)

**Note:** Version bump only for package @clerk/remix

### [1.3.18](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.18-staging.0...@clerk/remix@1.3.18) (2022-11-25)

**Note:** Version bump only for package @clerk/remix

### [1.3.17](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.17-staging.0...@clerk/remix@1.3.17) (2022-11-25)

**Note:** Version bump only for package @clerk/remix

### [1.3.16](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.15...@clerk/remix@1.3.16) (2022-11-23)

**Note:** Version bump only for package @clerk/remix

### [1.3.15](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.15-staging.3...@clerk/remix@1.3.15) (2022-11-22)

**Note:** Version bump only for package @clerk/remix

### [1.3.15-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.15-staging.2...@clerk/remix@1.3.15-staging.3) (2022-11-21)

**Note:** Version bump only for package @clerk/remix

### [1.3.15-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.15-staging.1...@clerk/remix@1.3.15-staging.2) (2022-11-21)

**Note:** Version bump only for package @clerk/remix

### [1.3.14](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.14-staging.1...@clerk/remix@1.3.14) (2022-11-18)

**Note:** Version bump only for package @clerk/remix

### [1.3.13](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.13-staging.4...@clerk/remix@1.3.13) (2022-11-15)

**Note:** Version bump only for package @clerk/remix

### [1.3.12](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.12-staging.1...@clerk/remix@1.3.12) (2022-11-10)

**Note:** Version bump only for package @clerk/remix

### [1.3.11](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.11-staging.2...@clerk/remix@1.3.11) (2022-11-05)

**Note:** Version bump only for package @clerk/remix

### [1.3.10](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.10-staging.7...@clerk/remix@1.3.10) (2022-11-03)

**Note:** Version bump only for package @clerk/remix

### [1.3.10-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.10-staging.3...@clerk/remix@1.3.10-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/remix

### [1.3.10-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.10-staging.1...@clerk/remix@1.3.10-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/remix

### [1.3.10-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.10-staging.1...@clerk/remix@1.3.10-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/remix

### [1.3.10-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.9...@clerk/remix@1.3.10-staging.1) (2022-11-02)

**Note:** Version bump only for package @clerk/remix

### [1.3.9](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.9-staging.0...@clerk/remix@1.3.9) (2022-10-24)

**Note:** Version bump only for package @clerk/remix

### [1.3.8](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.7...@clerk/remix@1.3.8) (2022-10-14)

**Note:** Version bump only for package @clerk/remix

### [1.3.7](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.7-staging.2...@clerk/remix@1.3.7) (2022-10-14)

**Note:** Version bump only for package @clerk/remix

### [1.3.7-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.6...@clerk/remix@1.3.7-staging.1) (2022-10-13)

**Note:** Version bump only for package @clerk/remix

### [1.3.6](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.6-staging.0...@clerk/remix@1.3.6) (2022-10-07)

**Note:** Version bump only for package @clerk/remix

### [1.3.5](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.5-staging.0...@clerk/remix@1.3.5) (2022-10-05)

**Note:** Version bump only for package @clerk/remix

### [1.3.4](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.4-staging.5...@clerk/remix@1.3.4) (2022-10-03)

**Note:** Version bump only for package @clerk/remix

### [1.3.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.3-staging.4...@clerk/remix@1.3.3) (2022-09-29)

**Note:** Version bump only for package @clerk/remix

### [1.3.2](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.1...@clerk/remix@1.3.2) (2022-09-25)

**Note:** Version bump only for package @clerk/remix

### [1.3.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.1-staging.2...@clerk/remix@1.3.1) (2022-09-24)

**Note:** Version bump only for package @clerk/remix

### [1.3.1-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.1-staging.0...@clerk/remix@1.3.1-staging.1) (2022-09-24)

**Note:** Version bump only for package @clerk/remix

## [1.3.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.3.0-staging.0...@clerk/remix@1.3.0) (2022-09-22)

**Note:** Version bump only for package @clerk/remix

### [1.2.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.2.0-staging.4...@clerk/remix@1.2.1) (2022-09-19)

**Note:** Version bump only for package @clerk/remix

## [1.2.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.2.0-staging.4...@clerk/remix@1.2.0) (2022-09-16)

**Note:** Version bump only for package @clerk/remix

### [1.1.7](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.1.6...@clerk/remix@1.1.7) (2022-09-08)

**Note:** Version bump only for package @clerk/remix

### [1.1.6](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.1.6-staging.0...@clerk/remix@1.1.6) (2022-09-07)

**Note:** Version bump only for package @clerk/remix

### [1.1.5](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.1.5-staging.0...@clerk/remix@1.1.5) (2022-09-07)

**Note:** Version bump only for package @clerk/remix

### [1.1.4](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.1.3...@clerk/remix@1.1.4) (2022-09-05)

**Note:** Version bump only for package @clerk/remix

### [1.1.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.1.3-staging.0...@clerk/remix@1.1.3) (2022-08-29)

**Note:** Version bump only for package @clerk/remix

### [1.1.2](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.1.2-staging.3...@clerk/remix@1.1.2) (2022-08-29)

**Note:** Version bump only for package @clerk/remix

### [1.1.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.1.1-staging.0...@clerk/remix@1.1.1) (2022-08-24)

**Note:** Version bump only for package @clerk/remix

## [1.1.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.0.5...@clerk/remix@1.1.0) (2022-08-18)

**Note:** Version bump only for package @clerk/remix

### [1.0.5](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.0.4...@clerk/remix@1.0.5) (2022-08-18)

**Note:** Version bump only for package @clerk/remix

### [1.0.4](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.0.4-staging.0...@clerk/remix@1.0.4) (2022-08-18)

**Note:** Version bump only for package @clerk/remix

### [1.0.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.0.2...@clerk/remix@1.0.3) (2022-08-16)

**Note:** Version bump only for package @clerk/remix

### [1.0.2](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.0.2-staging.0...@clerk/remix@1.0.2) (2022-08-09)

**Note:** Version bump only for package @clerk/remix

### [1.0.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.0.0...@clerk/remix@1.0.1) (2022-08-07)

**Note:** Version bump only for package @clerk/remix

## [1.0.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@1.0.0-staging.1...@clerk/remix@1.0.0) (2022-08-05)

**Note:** Version bump only for package @clerk/remix

### [0.5.14](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.13...@clerk/remix@0.5.14) (2022-08-05)

**Note:** Version bump only for package @clerk/remix

### [0.5.13](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.12...@clerk/remix@0.5.13) (2022-08-04)

**Note:** Version bump only for package @clerk/remix

### [0.5.12](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.12-staging.0...@clerk/remix@0.5.12) (2022-07-26)

**Note:** Version bump only for package @clerk/remix

### [0.5.11](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.10...@clerk/remix@0.5.11) (2022-07-13)

**Note:** Version bump only for package @clerk/remix

### [0.5.10](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.10-staging.0...@clerk/remix@0.5.10) (2022-07-11)

**Note:** Version bump only for package @clerk/remix

### [0.5.9](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.8...@clerk/remix@0.5.9) (2022-07-08)

**Note:** Version bump only for package @clerk/remix

### [0.5.8](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.7...@clerk/remix@0.5.8) (2022-07-07)

**Note:** Version bump only for package @clerk/remix

### [0.5.7](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.6...@clerk/remix@0.5.7) (2022-07-06)

**Note:** Version bump only for package @clerk/remix

### [0.5.6](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.5...@clerk/remix@0.5.6) (2022-07-04)

**Note:** Version bump only for package @clerk/remix

### [0.5.5](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.4...@clerk/remix@0.5.5) (2022-07-01)

**Note:** Version bump only for package @clerk/remix

### [0.5.4](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.3...@clerk/remix@0.5.4) (2022-07-01)

**Note:** Version bump only for package @clerk/remix

### [0.5.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.2...@clerk/remix@0.5.3) (2022-06-24)

### Bug Fixes

- **edge,nextjs,remix,clerk-sdk-node,types:** Correct SSR claims typing ([09c147c](https://github.com/clerkinc/javascript/commit/09c147c196c08e64794423f9eae791bfe453b858))

### [0.5.2](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.2-staging.0...@clerk/remix@0.5.2) (2022-06-16)

**Note:** Version bump only for package @clerk/remix

### [0.5.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.1-staging.4...@clerk/remix@0.5.1) (2022-06-06)

**Note:** Version bump only for package @clerk/remix

### [0.5.1-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.1-staging.3...@clerk/remix@0.5.1-staging.4) (2022-06-03)

**Note:** Version bump only for package @clerk/remix

### [0.5.1-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.1-staging.2...@clerk/remix@0.5.1-staging.3) (2022-06-03)

**Note:** Version bump only for package @clerk/remix

### [0.5.1-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.1-staging.1...@clerk/remix@0.5.1-staging.2) (2022-06-02)

**Note:** Version bump only for package @clerk/remix

### [0.5.1-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.1-staging.0...@clerk/remix@0.5.1-staging.1) (2022-06-01)

**Note:** Version bump only for package @clerk/remix

## [0.5.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.0-staging.2...@clerk/remix@0.5.0) (2022-05-20)

**Note:** Version bump only for package @clerk/remix

## [0.5.0-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.0-staging.1...@clerk/remix@0.5.0-staging.2) (2022-05-20)

**Note:** Version bump only for package @clerk/remix

## [0.5.0-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.5.0-staging.0...@clerk/remix@0.5.0-staging.1) (2022-05-19)

**Note:** Version bump only for package @clerk/remix

## [0.5.0-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.4.4...@clerk/remix@0.5.0-staging.0) (2022-05-18)

### Features

- **remix:** Add cross origin anonymous to interstitial ([#246](https://github.com/clerkinc/javascript/issues/246)) ([acd7160](https://github.com/clerkinc/javascript/commit/acd7160a7b209fb65243fecb33b848345876585c))

### [0.4.5-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.4.4...@clerk/remix@0.4.5-staging.1) (2022-05-17)

**Note:** Version bump only for package @clerk/remix

### [0.4.5-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.4.4...@clerk/remix@0.4.5-staging.0) (2022-05-16)

**Note:** Version bump only for package @clerk/remix

### [0.4.4](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.4.1...@clerk/remix@0.4.4) (2022-05-13)

**Note:** Version bump only for package @clerk/remix

### [0.4.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.4.1...@clerk/remix@0.4.3) (2022-05-12)

**Note:** Version bump only for package @clerk/remix

### [0.4.2](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.4.1...@clerk/remix@0.4.2) (2022-05-12)

**Note:** Version bump only for package @clerk/remix

### [0.4.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.4.1-staging.0...@clerk/remix@0.4.1) (2022-05-11)

**Note:** Version bump only for package @clerk/remix

## [0.4.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.16...@clerk/remix@0.4.0) (2022-05-06)

### Features

- **nextjs,clerk-sdk-node,remix:** Add claims attribute to req.auth ([c695529](https://github.com/clerkinc/javascript/commit/c695529089f55baef72b86e3b73b8cd9f4f58e6d))

### [0.3.17-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.16...@clerk/remix@0.3.17-staging.0) (2022-05-05)

**Note:** Version bump only for package @clerk/remix

### [0.3.16](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.16-staging.0...@clerk/remix@0.3.16) (2022-05-05)

**Note:** Version bump only for package @clerk/remix

### [0.3.15](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.15-staging.0...@clerk/remix@0.3.15) (2022-04-28)

### Bug Fixes

- **remix:** Update interstitial logic ([2f4a8ba](https://github.com/clerkinc/javascript/commit/2f4a8babd9e83d3e1dc4c2a75ce1bdc8c3600f6a))

### [0.3.14](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.13...@clerk/remix@0.3.14) (2022-04-27)

**Note:** Version bump only for package @clerk/remix

### [0.3.13](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.12...@clerk/remix@0.3.13) (2022-04-27)

**Note:** Version bump only for package @clerk/remix

### [0.3.12](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.11...@clerk/remix@0.3.12) (2022-04-22)

**Note:** Version bump only for package @clerk/remix

### [0.3.11](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.11-staging.1...@clerk/remix@0.3.11) (2022-04-19)

**Note:** Version bump only for package @clerk/remix

### [0.3.11-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.11-staging.0...@clerk/remix@0.3.11-staging.1) (2022-04-19)

**Note:** Version bump only for package @clerk/remix

### [0.3.10](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.10-alpha.0...@clerk/remix@0.3.10) (2022-04-18)

**Note:** Version bump only for package @clerk/remix

### [0.3.10-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.9...@clerk/remix@0.3.10-alpha.0) (2022-04-15)

### Features

- **gatsby-plugin-clerk:** Introduce basic structure ([a1c215b](https://github.com/clerkinc/javascript/commit/a1c215bba609107233e1596315136d77c491a74e))

### [0.3.9](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.8...@clerk/remix@0.3.9) (2022-04-15)

**Note:** Version bump only for package @clerk/remix

### [0.3.8](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.8-staging.1...@clerk/remix@0.3.8) (2022-04-15)

**Note:** Version bump only for package @clerk/remix

### [0.3.7](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.7-staging.0...@clerk/remix@0.3.7) (2022-04-13)

**Note:** Version bump only for package @clerk/remix

### [0.3.6](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.5...@clerk/remix@0.3.6) (2022-04-07)

### Bug Fixes

- **remix:** Change status for interstitial responses to 401 ([d6de232](https://github.com/clerkinc/javascript/commit/d6de232cc1441c69f240e7fea2f2d59b6fc4f8e6))

### [0.3.5](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.5-staging.0...@clerk/remix@0.3.5) (2022-04-04)

**Note:** Version bump only for package @clerk/remix

### [0.3.4](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.4-staging.0...@clerk/remix@0.3.4) (2022-03-29)

**Note:** Version bump only for package @clerk/remix

### [0.3.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.3-staging.0...@clerk/remix@0.3.3) (2022-03-28)

**Note:** Version bump only for package @clerk/remix

### [0.3.2](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.2-alpha.0...@clerk/remix@0.3.2) (2022-03-24)

**Note:** Version bump only for package @clerk/remix

### [0.3.2-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.2-staging.0...@clerk/remix@0.3.2-staging.1) (2022-03-24)

**Note:** Version bump only for package @clerk/remix

### [0.3.1-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.1-staging.0...@clerk/remix@0.3.1-alpha.0) (2022-03-23)

**Note:** Version bump only for package @clerk/remix

## [0.3.0-alpha.2](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.3.0-alpha.1...@clerk/remix@0.3.0-alpha.2) (2022-03-23)

**Note:** Version bump only for package @clerk/remix

## [0.3.0-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.2.0-alpha.1...@clerk/remix@0.3.0-alpha.1) (2022-03-23)

### Features

- **backend-core,clerk-sdk-node,nextjs,remix:** Add injected jwtKey option ([53e56e7](https://github.com/clerkinc/javascript/commit/53e56e76d59984d4d3f5b7e1e2d276adb8b2dc77))

## [0.3.0-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.2.0-alpha.1...@clerk/remix@0.3.0-alpha.0) (2022-03-22)

**Note:** Version bump only for package @clerk/remix

## [0.2.0-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.2.0-alpha.0...@clerk/remix@0.2.0-alpha.1) (2022-03-22)

**Note:** Version bump only for package @clerk/remix

## [0.2.0-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.1.1-staging.0...@clerk/remix@0.2.0-alpha.0) (2022-03-22)

### Features

- **nextjs,remix:** Refactor remix and nextjs getAuthData to use common utils ([d5f5dba](https://github.com/clerkinc/javascript/commit/d5f5dbace577ae617636841ce51e7cccd5d25b95))

### Bug Fixes

- **nextjs,remix:** Make server getToken throw if called with no session ([f7736c1](https://github.com/clerkinc/javascript/commit/f7736c1f4730d713f3fbcedd73e2ef5a1ceee605))

### [0.1.1-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.1.1-staging.0...@clerk/remix@0.1.1-alpha.1) (2022-03-20)

### Features

- **nextjs,remix:** Refactor remix and nextjs getAuthData to use common utils ([d5f5dba](https://github.com/clerkinc/javascript/commit/d5f5dbace577ae617636841ce51e7cccd5d25b95))

### Bug Fixes

- **nextjs,remix:** Make server getToken throw if called with no session ([f7736c1](https://github.com/clerkinc/javascript/commit/f7736c1f4730d713f3fbcedd73e2ef5a1ceee605))

### [0.1.1-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.1.1-staging.0...@clerk/remix@0.1.1-alpha.0) (2022-03-19)

### Bug Fixes

- **nextjs,remix:** Make server getToken throw if called with no session ([f7736c1](https://github.com/clerkinc/javascript/commit/f7736c1f4730d713f3fbcedd73e2ef5a1ceee605))

## [0.1.0-alpha.6](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.1.0-alpha.5...@clerk/remix@0.1.0-alpha.6) (2022-03-11)

### Features

- **remix:** Better server error handling ([#95](https://github.com/clerkinc/javascript/issues/95)) ([4046b29](https://github.com/clerkinc/javascript/commit/4046b291bb93d0f7471138c067cce8cf84cac265))
- **remix:** Build interstitial locally instead of fetching ([2dd5bb3](https://github.com/clerkinc/javascript/commit/2dd5bb35d532ce6c0d9f19d66d68672e748d4ed8))
- **remix:** Pass frontendApi from rootAuthLoader ([46a6c47](https://github.com/clerkinc/javascript/commit/46a6c47e0a977219c403327416e6f885ce7cfa4e))
- **remix:** Throw the insterstitial from ConnectClerkCatchBoundary ([7b07bf0](https://github.com/clerkinc/javascript/commit/7b07bf02c6d9cad695e184a473ba507271f61fc3))

### Reverts

- Revert "Revert "fix(remix): Make `getAuth` stop loader execution during interstitial"" ([a0935f3](https://github.com/clerkinc/javascript/commit/a0935f355ff403b10a7f9d3e76957ff39f98f779))

## [0.1.0-alpha.5](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.1.0-alpha.4...@clerk/remix@0.1.0-alpha.5) (2022-02-28)

### Reverts

- Revert "fix(remix): Make `getAuth` stop loader execution during interstitial" ([93d3c9b](https://github.com/clerkinc/javascript/commit/93d3c9b13ff225b066fae47f7c15735aef750036))

## 0.1.0-alpha.4 (2022-02-28)

### Features

- **clerk-remix:** Introduce basic clerk-remix structure ([f1ba9bd](https://github.com/clerkinc/javascript/commit/f1ba9bd02c5f107ff9993b120954cc62886d9c04))
- **clerk-remix:** Introduce ClerkProvider for Remix ([edb0cee](https://github.com/clerkinc/javascript/commit/edb0cee6a5eb5124e0fb3a08d8554c6da9b69899))
- **clerk-remix:** Introduce global polyfill ([5236bed](https://github.com/clerkinc/javascript/commit/5236bedd39e3d2fccd9466ac4dae715131293e4d))
- **clerk-remix:** Introduce SSR getAuth for Remix ([bae06b8](https://github.com/clerkinc/javascript/commit/bae06b8846dfafe3b57036efc457435799bfa677))
- **clerk-remix:** Introduce SSR rootAuthLoader for Remix ([23a10c7](https://github.com/clerkinc/javascript/commit/23a10c75c7590660aea7e8b261b0856affd8d01f))
- **clerk-remix:** Remove load options from `getAuth` ([246fe76](https://github.com/clerkinc/javascript/commit/246fe76943aedc07bed8510761a286ef324049ec))
- **clerk-remix:** Rename InferLoaderData to InferRootLoaderData ([e9eb81c](https://github.com/clerkinc/javascript/commit/e9eb81c092999614c1325bc2f196bcbf79f8360c))
- **remix:** Depend on @remix-run/runtime only ([c5c53cd](https://github.com/clerkinc/javascript/commit/c5c53cd2202924a183b2ba77ef136e2aabab32c1))
- **remix:** Introduce `ConnectClerk` HOC ([3f020ca](https://github.com/clerkinc/javascript/commit/3f020ca8f41632a24a7dd56caef3872a7b56c054))
- **remix:** Make `rootAuthLoader` require a Response or object return value ([bf53db5](https://github.com/clerkinc/javascript/commit/bf53db5243542e44db39b6422e3f2ffd6765cd79))
- **remix:** Move Remix dependencies to `peerDependencies` ([0ee115d](https://github.com/clerkinc/javascript/commit/0ee115db783f2ce10db196fdf5d9933481e7872e))

### Bug Fixes

- **remix:** Allow no return from `rootAuthLoader` callback ([4768aa6](https://github.com/clerkinc/javascript/commit/4768aa6bcf19e3a6d1a6d86a26f89b7351927673))
- **remix:** Make `clerkState` required ([677a255](https://github.com/clerkinc/javascript/commit/677a2556846845e52839b5324a6031edc98dc093))
- **remix:** Make `getAuth` stop loader execution during interstitial ([16a1be3](https://github.com/clerkinc/javascript/commit/16a1be34cce5c8a5027d957669e0176540e58d3a))
- **remix:** Make `rootAuthLoader` only throw if a callback exists ([2689f6c](https://github.com/clerkinc/javascript/commit/2689f6ce858cd08365a37678d817e60e889e1acb))

## [0.1.0-alpha.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.1.0-alpha.2...@clerk/remix@0.1.0-alpha.3) (2022-02-25)

### Bug Fixes

- **remix:** Make `rootAuthLoader` only throw if a callback exists ([cec342f](https://github.com/clerkinc/javascript/commit/cec342f36d09d7f829589e145e7f4be60aea5d13))

## 0.1.0-alpha.2 (2022-02-25)

### Features

- **clerk-remix:** Introduce basic clerk-remix structure ([f4f8e06](https://github.com/clerkinc/javascript/commit/f4f8e06385acb8fb5f142808309a95586660d76e))
- **clerk-remix:** Introduce ClerkProvider for Remix ([d63e4bf](https://github.com/clerkinc/javascript/commit/d63e4bff960729977997d7cc0011ad90ea794225))
- **clerk-remix:** Introduce global polyfill ([c3df5af](https://github.com/clerkinc/javascript/commit/c3df5afe5998a4872d7a617a18161c98e6753483))
- **clerk-remix:** Introduce SSR getAuth for Remix ([8ee0eaf](https://github.com/clerkinc/javascript/commit/8ee0eafc8409d1a947daab3c677331fbded24dba))
- **clerk-remix:** Introduce SSR rootAuthLoader for Remix ([693f79b](https://github.com/clerkinc/javascript/commit/693f79beda21108f1f1a67dd612c1eca6506d788))
- **clerk-remix:** Remove load options from `getAuth` ([5c1e23d](https://github.com/clerkinc/javascript/commit/5c1e23db40b7a49b7cec5a1d8206daad160e6361))
- **clerk-remix:** Rename InferLoaderData to InferRootLoaderData ([d753291](https://github.com/clerkinc/javascript/commit/d753291f5f61222dc189fded7341cfcce04de20c))
- **remix:** Depend on @remix-run/runtime only ([c5d4c45](https://github.com/clerkinc/javascript/commit/c5d4c4535f8ff7f2a89ec0cf5e1e941ed40b2238))
- **remix:** Introduce `ConnectClerk` HOC ([ea99273](https://github.com/clerkinc/javascript/commit/ea9927366d9591b2aa4a86b94eb2b1e05b505f6c))
- **remix:** Make `rootAuthLoader` require a Response or object return value ([2aab7db](https://github.com/clerkinc/javascript/commit/2aab7dbcf97facfddc42e1694c859fbae76b95db))
- **remix:** Move Remix dependencies to `peerDependencies` ([1ce0ce3](https://github.com/clerkinc/javascript/commit/1ce0ce38f13bf8b0c4255f97507b42cf8e793fde))

### Bug Fixes

- **remix:** Allow no return from `rootAuthLoader` callback ([5e708fd](https://github.com/clerkinc/javascript/commit/5e708fd798181fd0c3f917cc9f431d97d682b3c6))
- **remix:** Make `clerkState` required ([22d2aff](https://github.com/clerkinc/javascript/commit/22d2affd2801f9623257b905aa0687e7ef43ff59))

## [0.1.0-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.1.0-alpha.0...@clerk/remix@0.1.0-alpha.1) (2022-02-18)

### Bug Fixes

- **remix:** Allow no return from `rootAuthLoader` callback ([55f14e0](https://github.com/clerkinc/javascript/commit/55f14e0706eb45b8e6808e7f33d7b430cf3d2afd))
- **remix:** Make `clerkState` required ([df88977](https://github.com/clerkinc/javascript/commit/df88977531b12d15f245ff2cbc8ce360e4d52b91))

## 0.1.0-alpha.0 (2022-02-18)

### Features

- **clerk-remix:** Introduce basic clerk-remix structure ([ef91121](https://github.com/clerkinc/javascript/commit/ef9112144b47714a5a380bcccab9961f91ec17c9))
- **clerk-remix:** Introduce ClerkProvider for Remix ([07abb99](https://github.com/clerkinc/javascript/commit/07abb99111a884e2e22f55a5101292595c066507))
- **clerk-remix:** Introduce global polyfill ([78435ca](https://github.com/clerkinc/javascript/commit/78435ca008a32aa1c2546bc333a5e28e3d5079df))
- **clerk-remix:** Introduce SSR getAuth for Remix ([e9ca753](https://github.com/clerkinc/javascript/commit/e9ca7534e2df55e5d1928d4a1f3a53eca3397252))
- **clerk-remix:** Introduce SSR rootAuthLoader for Remix ([c7a61aa](https://github.com/clerkinc/javascript/commit/c7a61aab89dad2a1c0cde0d658ce4a50f0eb3cd4))
- **clerk-remix:** Remove load options from `getAuth` ([5f4cedc](https://github.com/clerkinc/javascript/commit/5f4cedc70db8398eb196ca769db41ebadb15ab12))
- **clerk-remix:** Rename InferLoaderData to InferRootLoaderData ([aa0c720](https://github.com/clerkinc/javascript/commit/aa0c7208bf8490f24b5b10527c4bb88cf07b79fc))
- **remix:** Depend on @remix-run/runtime only ([7c014f4](https://github.com/clerkinc/javascript/commit/7c014f4327ce46cc7e74a0f637dd7b100baa672b))
