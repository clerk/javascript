# Change Log

## 4.24.1

### Patch Changes

- Support swapping the Clerk publishableKey at runtime to allow users to toggle the instance being used. ([#1655](https://github.com/clerkinc/javascript/pull/1655)) by [@BRKalow](https://github.com/BRKalow)

## 4.24.0

### Minor Changes

- Introduces userInvitations from `useOrganizationList` ([#1520](https://github.com/clerkinc/javascript/pull/1520)) by [@panteliselef](https://github.com/panteliselef)

  `userInvitations` is a paginated list of data. It can be used to create Paginated tables or Infinite lists.

### Patch Changes

- Updated dependencies [[`96cc1921c`](https://github.com/clerkinc/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerkinc/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerkinc/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerkinc/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerkinc/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerkinc/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerkinc/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerkinc/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerkinc/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerkinc/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`86de584dd`](https://github.com/clerkinc/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e02a1aff2`](https://github.com/clerkinc/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerkinc/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerkinc/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerkinc/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerkinc/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerkinc/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`89bc5de04`](https://github.com/clerkinc/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/shared@0.22.0
  - @clerk/types@3.50.0

## 4.23.2

### Patch Changes

- Updated dependencies [[`ea95525a4`](https://github.com/clerkinc/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerkinc/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`d433b83b9`](https://github.com/clerkinc/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerkinc/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`0a59e122d`](https://github.com/clerkinc/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/types@3.49.0
  - @clerk/shared@0.21.0

## 4.23.1

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerkinc/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3)]:
  - @clerk/types@3.48.1

## 4.23.0

### Minor Changes

- Add unsafeMetadata prop to the SignUp component ([#1464](https://github.com/clerkinc/javascript/pull/1464)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerkinc/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c)]:
  - @clerk/types@3.48.0

## 4.22.1

### Patch Changes

- Mark setSession as deprecated when it is re-exported within hooks ([#1486](https://github.com/clerkinc/javascript/pull/1486)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`73c9c1d0e`](https://github.com/clerkinc/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerkinc/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerkinc/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`090bab66e`](https://github.com/clerkinc/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`5ecbb0a37`](https://github.com/clerkinc/javascript/commit/5ecbb0a37e99fa2099629c573951c7735d5f0810), [`592911196`](https://github.com/clerkinc/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8)]:
  - @clerk/types@3.47.0
  - @clerk/shared@0.20.0

## 4.22.0

### Minor Changes

- Update IsomorphicClerk#addListener to correctly return an unsubscribe method ([#1452](https://github.com/clerkinc/javascript/pull/1452)) by [@dimkl](https://github.com/dimkl)

## 4.21.1

### Patch Changes

- Populate `openCreateOrganization` return from the `useClerk()` hook ([#1435](https://github.com/clerkinc/javascript/pull/1435)) by [@panteliselef](https://github.com/panteliselef)

## 4.21.0

### Minor Changes

- Fix `global is not defined` error when using Vite + React by [@anagstef](https://github.com/anagstef)

## 4.20.6

### Patch Changes

- Updated dependencies [[`30f8ad18a`](https://github.com/clerkinc/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c)]:
  - @clerk/types@3.46.1

## 4.20.5

### Patch Changes

- Updated dependencies [[`bfb3af28`](https://github.com/clerkinc/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/types@3.46.0

## 4.20.4

### Patch Changes

- Updated dependencies [[`11954816`](https://github.com/clerkinc/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`32148490`](https://github.com/clerkinc/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0

## 4.20.3

### Patch Changes

- Updated dependencies [[`17cc14ec`](https://github.com/clerkinc/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/types@3.44.0

## 4.20.2

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerkinc/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerkinc/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/types@3.43.0

## 4.20.1

### Patch Changes

- Updated dependencies [[`59bc649a`](https://github.com/clerkinc/javascript/commit/59bc649a92316f5d6ade00f3cd52a9b46dcdc401)]:
  - @clerk/shared@0.19.1

## 4.20.0

### Minor Changes

- Export error helpers from the shared package to the framework specific packages ([#1308](https://github.com/clerkinc/javascript/pull/1308)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Resolve all reported ESM build issues by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`7af91bc3`](https://github.com/clerkinc/javascript/commit/7af91bc3ecc25cba04968b491e1e3c6ec32c18af), [`c42b4ac0`](https://github.com/clerkinc/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`6f3d4305`](https://github.com/clerkinc/javascript/commit/6f3d43055690db1d69a356503a0a45dc948beaef)]:
  - @clerk/shared@0.19.0
  - @clerk/types@3.42.0

## 4.19.0

### Minor Changes

- ESM/CJS support for `@clerk/clerk-react` by [@nikosdouvlis](https://github.com/nikosdouvlis)

  Changes that should affect users and OS contributors:

  - Better source map support for `@clerk/clerk-react`, `@clerk/shared`. This affects anyone developing in our monorepo or anyone using a debugger with Clerk installed in their app.
  - Easier node_modules debugging as `@clerk/clerk-react`, `@clerk/shared` and `@clerk/nextjs` are no longer getting bundled as a single-file package. This also improves error logging in nextjs a lot, as nextjs usually logs the line that threw the error - a minified, single-file package, usually consists of a very long single-line module, so logging error in NextJS wasn't ideal.
  - Headless clerk-js bundle size reduced by ~10kb, normal clerk-ks by ~6kb
  - A new `clerkJSVersion` prop has been added on ClerkProvider allowing to fetch a specific clerk-js version.

### Patch Changes

- Updated dependencies [[`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/types@3.41.1
  - @clerk/shared@0.18.0

## [4.18.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.18.0-staging.1...@clerk/clerk-react@4.18.0) (2023-06-03)

**Note:** Version bump only for package @clerk/clerk-react

## [4.17.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.17.0-staging.0...@clerk/clerk-react@4.17.0) (2023-05-26)

**Note:** Version bump only for package @clerk/clerk-react

### [4.16.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.16.3-staging.2...@clerk/clerk-react@4.16.3) (2023-05-23)

**Note:** Version bump only for package @clerk/clerk-react

### [4.16.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.16.2-staging.0...@clerk/clerk-react@4.16.2) (2023-05-18)

**Note:** Version bump only for package @clerk/clerk-react

### [4.16.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.16.1-staging.1...@clerk/clerk-react@4.16.1) (2023-05-17)

**Note:** Version bump only for package @clerk/clerk-react

## [4.16.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.16.0-staging.2...@clerk/clerk-react@4.16.0) (2023-05-15)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.15.4-staging.5...@clerk/clerk-react@4.15.4) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.4-staging.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.15.4-staging.4...@clerk/clerk-react@4.15.4-staging.5) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.4-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.15.4-staging.2...@clerk/clerk-react@4.15.4-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.15.3-staging.0...@clerk/clerk-react@4.15.3) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.15.1...@clerk/clerk-react@4.15.2) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.15.1-staging.0...@clerk/clerk-react@4.15.1) (2023-04-12)

**Note:** Version bump only for package @clerk/clerk-react

## [4.15.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.15.0-staging.0...@clerk/clerk-react@4.15.0) (2023-04-11)

**Note:** Version bump only for package @clerk/clerk-react

### [4.14.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.14.2-staging.0...@clerk/clerk-react@4.14.2) (2023-04-06)

**Note:** Version bump only for package @clerk/clerk-react

### [4.14.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.14.1-staging.3...@clerk/clerk-react@4.14.1) (2023-03-31)

**Note:** Version bump only for package @clerk/clerk-react

### [4.14.1-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.14.1-staging.2...@clerk/clerk-react@4.14.1-staging.3) (2023-03-31)

### Bug Fixes

- **clerk-react:** Check for window in isomorphicClerk ([fe82852](https://github.com/clerkinc/javascript/commit/fe828523c2bbdc2f3fc35ad5e30aea52b5438922))

## [4.14.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.14.0-staging.1...@clerk/clerk-react@4.14.0) (2023-03-29)

**Note:** Version bump only for package @clerk/clerk-react

### [4.12.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.12.4-staging.2...@clerk/clerk-react@4.12.4) (2023-03-10)

**Note:** Version bump only for package @clerk/clerk-react

### [4.12.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.12.3-staging.0...@clerk/clerk-react@4.12.3) (2023-03-09)

**Note:** Version bump only for package @clerk/clerk-react

### [4.12.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.12.2-staging.0...@clerk/clerk-react@4.12.2) (2023-03-07)

**Note:** Version bump only for package @clerk/clerk-react

### [4.12.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.12.1-staging.1...@clerk/clerk-react@4.12.1) (2023-03-03)

**Note:** Version bump only for package @clerk/clerk-react

## [4.12.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.12.0-staging.0...@clerk/clerk-react@4.12.0) (2023-03-01)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.11.6-staging.0...@clerk/clerk-react@4.11.6) (2023-02-25)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.11.5-staging.3...@clerk/clerk-react@4.11.5) (2023-02-24)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.5-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.11.5-staging.1...@clerk/clerk-react@4.11.5-staging.2) (2023-02-22)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.11.4-staging.0...@clerk/clerk-react@4.11.4) (2023-02-17)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.11.3-staging.2...@clerk/clerk-react@4.11.3) (2023-02-15)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.11.2-staging.1...@clerk/clerk-react@4.11.2) (2023-02-10)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.11.1-staging.0...@clerk/clerk-react@4.11.1) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.1-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.11.0-staging.1...@clerk/clerk-react@4.11.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-react

## [4.11.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.11.0-staging.1...@clerk/clerk-react@4.11.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-react

## [4.10.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.10.0-staging.0...@clerk/clerk-react@4.10.0) (2023-02-01)

**Note:** Version bump only for package @clerk/clerk-react

## [4.9.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.9.0-staging.1...@clerk/clerk-react@4.9.0) (2023-01-27)

**Note:** Version bump only for package @clerk/clerk-react

### [4.8.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.8.4-staging.1...@clerk/clerk-react@4.8.4) (2023-01-24)

**Note:** Version bump only for package @clerk/clerk-react

### [4.8.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.8.2...@clerk/clerk-react@4.8.3) (2023-01-20)

### Bug Fixes

- **nextjs,types:** Make frontendApi or publishableKey mutually exclusive but optional ([953c276](https://github.com/clerkinc/javascript/commit/953c27622ba24054172d6f4178bd5af50f73fa36))

### [4.8.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.8.1...@clerk/clerk-react@4.8.2) (2023-01-19)

### Bug Fixes

- **clerk-react:** Do not throw missing key error if a Clerk instance is used ([a300016](https://github.com/clerkinc/javascript/commit/a3000164483e7ed947d448f7593e0ce4dd110db3))
- **clerk-react:** Do not throw missing key error in isomorphicClerk.load ([8b3b763](https://github.com/clerkinc/javascript/commit/8b3b763ed67d3af101573627fc7b00fb0a526b9b))

### [4.8.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.8.0...@clerk/clerk-react@4.8.1) (2023-01-17)

### Bug Fixes

- **clerk-react:** Add data-clerk-publishable-key attribute only when PK is available ([8d44f54](https://github.com/clerkinc/javascript/commit/8d44f54434754e2c31b4a77b58a28ae969ce5a09))

## [4.8.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.8.0-staging.4...@clerk/clerk-react@4.8.0) (2023-01-17)

**Note:** Version bump only for package @clerk/clerk-react

## [4.7.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.7.0-staging.1...@clerk/clerk-react@4.7.0) (2022-12-19)

**Note:** Version bump only for package @clerk/clerk-react

### [4.6.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.6.4-staging.0...@clerk/clerk-react@4.6.4) (2022-12-13)

**Note:** Version bump only for package @clerk/clerk-react

### [4.6.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.6.2...@clerk/clerk-react@4.6.3) (2022-12-12)

**Note:** Version bump only for package @clerk/clerk-react

### [4.6.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.6.2-staging.1...@clerk/clerk-react@4.6.2) (2022-12-09)

**Note:** Version bump only for package @clerk/clerk-react

### [4.6.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.6.0...@clerk/clerk-react@4.6.1) (2022-12-08)

### Reverts

- Revert "feat(clerk-js,types): Terse paths parameters (#572)" (#603) ([d535eac](https://github.com/clerkinc/javascript/commit/d535eace3d7733ce3b848bb05f1b0c02e5faf15d)), closes [#572](https://github.com/clerkinc/javascript/issues/572) [#603](https://github.com/clerkinc/javascript/issues/603)

## [4.6.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.6.0-staging.0...@clerk/clerk-react@4.6.0) (2022-12-08)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.5.5-staging.0...@clerk/clerk-react@4.5.5) (2022-12-02)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.5.4-staging.5...@clerk/clerk-react@4.5.4) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.4-staging.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.5.4-staging.4...@clerk/clerk-react@4.5.4-staging.5) (2022-11-29)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.5.3-staging.0...@clerk/clerk-react@4.5.3) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.5.2-staging.0...@clerk/clerk-react@4.5.2) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.5.0...@clerk/clerk-react@4.5.1) (2022-11-23)

**Note:** Version bump only for package @clerk/clerk-react

## [4.5.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.5.0-staging.3...@clerk/clerk-react@4.5.0) (2022-11-22)

**Note:** Version bump only for package @clerk/clerk-react

## [4.5.0-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.5.0-staging.2...@clerk/clerk-react@4.5.0-staging.3) (2022-11-21)

### Bug Fixes

- **clerk-react:** Add HeadlessBrowserClerk ([4236147](https://github.com/clerkinc/javascript/commit/4236147201b32e3f1d60ebbe2c36de8e89e5e2f6))

## [4.5.0-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.5.0-staging.1...@clerk/clerk-react@4.5.0-staging.2) (2022-11-21)

### Features

- **clerk-js:** Improve DX for headless import ([8d64310](https://github.com/clerkinc/javascript/commit/8d64310ab23c6e21f8a687e503521245acad8211))

### [4.4.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.4.3-staging.1...@clerk/clerk-react@4.4.3) (2022-11-18)

**Note:** Version bump only for package @clerk/clerk-react

### [4.4.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.4.2-staging.3...@clerk/clerk-react@4.4.2) (2022-11-15)

**Note:** Version bump only for package @clerk/clerk-react

### [4.4.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.4.1-staging.1...@clerk/clerk-react@4.4.1) (2022-11-10)

**Note:** Version bump only for package @clerk/clerk-react

## [4.4.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.4.0-staging.1...@clerk/clerk-react@4.4.0) (2022-11-05)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.3.3-staging.7...@clerk/clerk-react@4.3.3) (2022-11-03)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.3-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.3.3-staging.3...@clerk/clerk-react@4.3.3-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.3-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.3.3-staging.1...@clerk/clerk-react@4.3.3-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.3-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.3.3-staging.1...@clerk/clerk-react@4.3.3-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.3-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.3.2...@clerk/clerk-react@4.3.3-staging.1) (2022-11-02)

### Bug Fixes

- **clerk-react:** Add frontendAPI on window as a fallback ([06f8b37](https://github.com/clerkinc/javascript/commit/06f8b3755cda83455e301591badaf16e1d59dd33))

### [4.3.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.3.2-staging.0...@clerk/clerk-react@4.3.2) (2022-10-24)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.3.0...@clerk/clerk-react@4.3.1) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-react

## [4.3.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.3.0-staging.2...@clerk/clerk-react@4.3.0) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-react

## [4.3.0-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.2.6...@clerk/clerk-react@4.3.0-staging.1) (2022-10-13)

### Features

- **clerk-js,clerk-react,types:** Wire up `OrganizationSwitcher` and `OrganizationProfile` ([1e34e69](https://github.com/clerkinc/javascript/commit/1e34e6986ee49aeb9ca9f72cdc5d799d6611b53f))

### [4.2.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.2.6-staging.0...@clerk/clerk-react@4.2.6) (2022-10-07)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.2.5-staging.0...@clerk/clerk-react@4.2.5) (2022-10-05)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.2.4-staging.3...@clerk/clerk-react@4.2.4) (2022-10-03)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.2.3-staging.4...@clerk/clerk-react@4.2.3) (2022-09-29)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.2.1...@clerk/clerk-react@4.2.2) (2022-09-25)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.2.1-staging.2...@clerk/clerk-react@4.2.1) (2022-09-24)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.1-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.2.1-staging.0...@clerk/clerk-react@4.2.1-staging.1) (2022-09-24)

**Note:** Version bump only for package @clerk/clerk-react

## [4.2.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.2.0-staging.0...@clerk/clerk-react@4.2.0) (2022-09-22)

**Note:** Version bump only for package @clerk/clerk-react

### [4.1.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.1.0-staging.4...@clerk/clerk-react@4.1.1) (2022-09-19)

**Note:** Version bump only for package @clerk/clerk-react

## [4.1.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.1.0-staging.4...@clerk/clerk-react@4.1.0) (2022-09-16)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.10](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.0.10-staging.0...@clerk/clerk-react@4.0.10) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.9](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.0.9-staging.0...@clerk/clerk-react@4.0.9) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.8](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.0.8-staging.0...@clerk/clerk-react@4.0.8) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.0.7-staging.2...@clerk/clerk-react@4.0.7) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.0.6-staging.0...@clerk/clerk-react@4.0.6) (2022-08-24)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.0.4...@clerk/clerk-react@4.0.5) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.0.4-staging.0...@clerk/clerk-react@4.0.4) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.0.2...@clerk/clerk-react@4.0.3) (2022-08-16)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.0.2-staging.0...@clerk/clerk-react@4.0.2) (2022-08-09)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.0.0...@clerk/clerk-react@4.0.1) (2022-08-07)

**Note:** Version bump only for package @clerk/clerk-react

## [4.0.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@4.0.0-staging.1...@clerk/clerk-react@4.0.0) (2022-08-05)

**Note:** Version bump only for package @clerk/clerk-react

### [3.5.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.5.0...@clerk/clerk-react@3.5.1) (2022-08-04)

**Note:** Version bump only for package @clerk/clerk-react

## [3.5.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.4.5...@clerk/clerk-react@3.5.0) (2022-07-13)

### Features

- **nextjs:** Add req.organization access on gssp ([d064448](https://github.com/clerkinc/javascript/commit/d0644489a71e06df0e751c615b0d03d77967aab2))
- **types,clerk-react,nextjs:** Add loadOrg option for Next.js withServerSideAuth middleware ([0889bde](https://github.com/clerkinc/javascript/commit/0889bde9bc7f9e1a5d4c1e706c49212e1f7b36f4))

### [3.4.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.4.5-staging.0...@clerk/clerk-react@3.4.5) (2022-07-11)

**Note:** Version bump only for package @clerk/clerk-react

### [3.4.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.4.3...@clerk/clerk-react@3.4.4) (2022-07-07)

**Note:** Version bump only for package @clerk/clerk-react

### [3.4.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.4.2...@clerk/clerk-react@3.4.3) (2022-07-06)

**Note:** Version bump only for package @clerk/clerk-react

### [3.4.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.4.1...@clerk/clerk-react@3.4.2) (2022-07-01)

**Note:** Version bump only for package @clerk/clerk-react

### [3.4.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.4.0...@clerk/clerk-react@3.4.1) (2022-06-24)

**Note:** Version bump only for package @clerk/clerk-react

## [3.4.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.4.0-staging.0...@clerk/clerk-react@3.4.0) (2022-06-16)

**Note:** Version bump only for package @clerk/clerk-react

## [3.3.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.3.0-staging.4...@clerk/clerk-react@3.3.0) (2022-06-06)

**Note:** Version bump only for package @clerk/clerk-react

## [3.3.0-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.3.0-staging.3...@clerk/clerk-react@3.3.0-staging.4) (2022-06-03)

### Bug Fixes

- **clerk-react:** Correct annotations in isomorphicClerk for setSession ([56abc04](https://github.com/clerkinc/javascript/commit/56abc04e82ed4adf9f1c366620e08526d52da0f5))

## [3.3.0-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.3.0-staging.2...@clerk/clerk-react@3.3.0-staging.3) (2022-06-03)

**Note:** Version bump only for package @clerk/clerk-react

## [3.3.0-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.3.0-staging.1...@clerk/clerk-react@3.3.0-staging.2) (2022-06-02)

**Note:** Version bump only for package @clerk/clerk-react

## [3.3.0-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.3.0-staging.0...@clerk/clerk-react@3.3.0-staging.1) (2022-06-01)

### Bug Fixes

- **clerk-js:** Emit changes in organization to listeners ([798ee62](https://github.com/clerkinc/javascript/commit/798ee622e7961d3aa7f8842184f5fadbcfed517f))

### [3.2.18](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.18-staging.1...@clerk/clerk-react@3.2.18) (2022-05-20)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.18-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.17...@clerk/clerk-react@3.2.18-staging.1) (2022-05-18)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.18-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.17...@clerk/clerk-react@3.2.18-staging.0) (2022-05-17)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.17](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.14...@clerk/clerk-react@3.2.17) (2022-05-13)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.16](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.14...@clerk/clerk-react@3.2.16) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.15](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.14...@clerk/clerk-react@3.2.15) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.14](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.14-staging.0...@clerk/clerk-react@3.2.14) (2022-05-11)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.13](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.12...@clerk/clerk-react@3.2.13) (2022-05-06)

### Bug Fixes

- **clerk-react:** Make getOrCreateInstance handle both SSR and CSR instantiation ([d22b808](https://github.com/clerkinc/javascript/commit/d22b808cf9eee2570be83f247fd25543a0202fd6))
- **clerk-react:** Make isomorphicClerk loading idempotent ([91b6217](https://github.com/clerkinc/javascript/commit/91b62175cadd82b38747cc6d7a0216f42c89b5fe))
- **clerk-react:** Pass initialState directly to ClerkContextProvider ([9e55b7c](https://github.com/clerkinc/javascript/commit/9e55b7c2cafdcbcf6d8c210e668a22e07580cdb6))

### [3.2.13-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.12...@clerk/clerk-react@3.2.13-staging.0) (2022-05-05)

### Bug Fixes

- **clerk-react:** Make getOrCreateInstance handle both SSR and CSR instantiation ([8f9481c](https://github.com/clerkinc/javascript/commit/8f9481cf088c63b3cd3192cb1396596a98b11980))
- **clerk-react:** Make isomorphicClerk loading idempotent ([221919c](https://github.com/clerkinc/javascript/commit/221919ceab5ad1631073f8ba7564c869ebf7a890))
- **clerk-react:** Pass initialState directly to ClerkContextProvider ([cb777d4](https://github.com/clerkinc/javascript/commit/cb777d4651710fda248036fdc5398e0dac7aa337))

### [3.2.12](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.12-staging.0...@clerk/clerk-react@3.2.12) (2022-05-05)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.11](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.11-staging.0...@clerk/clerk-react@3.2.11) (2022-04-28)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.10](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.9...@clerk/clerk-react@3.2.10) (2022-04-27)

### Bug Fixes

- **clerk-react:** Define global in window if not defined ([48da3ac](https://github.com/clerkinc/javascript/commit/48da3ac087406a97380f28c4c9e1057e04eb106f))

### [3.2.9](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.8...@clerk/clerk-react@3.2.9) (2022-04-27)

### Bug Fixes

- **clerk-react:** Type updates for React 18 ([6d5c0bf](https://github.com/clerkinc/javascript/commit/6d5c0bf33e17885cacd97320c385cf06ca4f5adf))

### [3.2.8](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.8-staging.1...@clerk/clerk-react@3.2.8) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.8-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.8-staging.0...@clerk/clerk-react@3.2.8-staging.1) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.7-alpha.0...@clerk/clerk-react@3.2.7) (2022-04-18)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.7-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.6...@clerk/clerk-react@3.2.7-alpha.0) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.5...@clerk/clerk-react@3.2.6) (2022-04-15)

### Bug Fixes

- **clerk-react:** Explicitly type children for React.FC components ([#199](https://github.com/clerkinc/javascript/issues/199)) ([9fb2ce4](https://github.com/clerkinc/javascript/commit/9fb2ce46e1e7f60fd31deae43fd1afaf5a1abc62))

### [3.2.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.5-staging.0...@clerk/clerk-react@3.2.5) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.4-staging.0...@clerk/clerk-react@3.2.4) (2022-04-13)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.2...@clerk/clerk-react@3.2.3) (2022-04-07)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.2-staging.0...@clerk/clerk-react@3.2.2) (2022-04-04)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.1-staging.0...@clerk/clerk-react@3.2.1) (2022-03-28)

**Note:** Version bump only for package @clerk/clerk-react

## [3.2.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.2.0-alpha.0...@clerk/clerk-react@3.2.0) (2022-03-24)

**Note:** Version bump only for package @clerk/clerk-react

## [3.2.0-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.1.2-staging.0...@clerk/clerk-react@3.2.0-staging.0) (2022-03-24)

### Features

- **types,clerk-js,backend-core,clerk-react:** Replace thrown error with null return in getToken ([d972f93](https://github.com/clerkinc/javascript/commit/d972f93684a39abf3619c335cc012b61d5187100))

### [3.1.1-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.1.1-staging.0...@clerk/clerk-react@3.1.1-alpha.0) (2022-03-23)

**Note:** Version bump only for package @clerk/clerk-react

## [3.1.0-alpha.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.1.0-alpha.1...@clerk/clerk-react@3.1.0-alpha.2) (2022-03-23)

**Note:** Version bump only for package @clerk/clerk-react

## [3.1.0-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.0.1-alpha.3...@clerk/clerk-react@3.1.0-alpha.1) (2022-03-23)

### Features

- **clerk-js,types:** Rename UserButton params to afterSignOutUrl, afterMultiSessionSingleSignOutUrl ([c4cb76a](https://github.com/clerkinc/javascript/commit/c4cb76a1133fd2308b217cacaffb086b175f6347))

## [3.1.0-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.0.1-alpha.3...@clerk/clerk-react@3.1.0-alpha.0) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-react

### [3.0.1-alpha.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.0.1-alpha.2...@clerk/clerk-react@3.0.1-alpha.3) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-react

### [3.0.1-alpha.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.0.1-staging.0...@clerk/clerk-react@3.0.1-alpha.2) (2022-03-22)

### Bug Fixes

- **clerk-js,clerk-react:** Move error to getToken ([d5f6b26](https://github.com/clerkinc/javascript/commit/d5f6b264cf58ce40c68de298b4c7c564d472001f))
- **edge:** Align react getToken ([37a03de](https://github.com/clerkinc/javascript/commit/37a03de81148294909719d4476b0a2ac3642813c))

### [3.0.1-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.0.1-staging.0...@clerk/clerk-react@3.0.1-alpha.1) (2022-03-20)

### Bug Fixes

- **clerk-js,clerk-react:** Move error to getToken ([d5f6b26](https://github.com/clerkinc/javascript/commit/d5f6b264cf58ce40c68de298b4c7c564d472001f))
- **edge:** Align react getToken ([37a03de](https://github.com/clerkinc/javascript/commit/37a03de81148294909719d4476b0a2ac3642813c))

### [3.0.1-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@3.0.1-staging.0...@clerk/clerk-react@3.0.1-alpha.0) (2022-03-19)

### Bug Fixes

- **clerk-js,clerk-react:** Move error to getToken ([84d21ce](https://github.com/clerkinc/javascript/commit/84d21ceac26843a1caa9d9d58f9c10ea2da6395e))
- **edge:** Align react getToken ([37a03de](https://github.com/clerkinc/javascript/commit/37a03de81148294909719d4476b0a2ac3642813c))

## [3.0.0-alpha.10](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.12.3...@clerk/clerk-react@3.0.0-alpha.10) (2022-03-11)

### Features

- **clerk-react:** Add isLoaded to `useOrganizations` hook ([#92](https://github.com/clerkinc/javascript/issues/92)) ([a316c7a](https://github.com/clerkinc/javascript/commit/a316c7a9d66f356639038ce89b5853625e44d4b7))
- **clerk-remix:** Mark clerk-remix as side-effect free to fix Remix bundling ([c57a902](https://github.com/clerkinc/javascript/commit/c57a9024674a61aa3f2b7e359935e42fc034ffdd))

## [3.0.0-alpha.9](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.11.4...@clerk/clerk-react@3.0.0-alpha.9) (2022-02-28)

### Features

- **clerk-remix:** Mark clerk-remix as side-effect free to fix Remix bundling ([c57a902](https://github.com/clerkinc/javascript/commit/c57a9024674a61aa3f2b7e359935e42fc034ffdd))

## [3.0.0-alpha.8](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.11.4...@clerk/clerk-react@3.0.0-alpha.8) (2022-02-25)

### Features

- **clerk-remix:** Mark clerk-remix as side-effect free to fix Remix bundling ([287a438](https://github.com/clerkinc/javascript/commit/287a4381d7ebefdf8704e2e29a75ac93f57794c8))

## [3.0.0-alpha.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.11.1...@clerk/clerk-react@3.0.0-alpha.7) (2022-02-18)

### Features

- **clerk-remix:** Mark clerk-remix as side-effect free to fix Remix bundling ([0d22857](https://github.com/clerkinc/javascript/commit/0d22857197e5d1d2edc4d4df55916009f404dbdd))

### [2.12.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.12.6-staging.1...@clerk/clerk-react@2.12.6) (2022-03-17)

**Note:** Version bump only for package @clerk/clerk-react

### [2.12.6-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.12.6-staging.0...@clerk/clerk-react@2.12.6-staging.1) (2022-03-17)

**Note:** Version bump only for package @clerk/clerk-react

### [2.12.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.12.3...@clerk/clerk-react@2.12.4) (2022-03-11)

**Note:** Version bump only for package @clerk/clerk-react

### [2.12.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.12.3-staging.0...@clerk/clerk-react@2.12.3) (2022-03-09)

**Note:** Version bump only for package @clerk/clerk-react

### [2.12.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.12.0...@clerk/clerk-react@2.12.1) (2022-03-04)

### Bug Fixes

- **clerk-react,clerk-js,types:** Crate of API feedback fixes ([721ce72](https://github.com/clerkinc/javascript/commit/721ce7228c37b012891b2bec8caf290239164d05))

## [2.12.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.11.7...@clerk/clerk-react@2.12.0) (2022-03-04)

### Features

- **clerk-js,clerk-react:** GetOrganization/s hook methods, fetching mechanism alignment ([fc11087](https://github.com/clerkinc/javascript/commit/fc110874f9a3e056cd43c773c267409dd9b318d6))
- **clerk-js:** Add useOrganization hook ([480c422](https://github.com/clerkinc/javascript/commit/480c422774472fc712afdfe6ded2677b458d3ef0))
- **clerk-react,clerk-js:** Add useOrganization hook using \_\_unstable attribute ([1635132](https://github.com/clerkinc/javascript/commit/16351321a99945d167cbf6e6ca0efdbbbf7efe5a))

### [2.11.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.11.6...@clerk/clerk-react@2.11.7) (2022-03-03)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.11.5...@clerk/clerk-react@2.11.6) (2022-03-02)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.11.4...@clerk/clerk-react@2.11.5) (2022-03-01)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.11.4-staging.0...@clerk/clerk-react@2.11.4) (2022-02-24)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.4-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.11.3-staging.0...@clerk/clerk-react@2.11.4-staging.0) (2022-02-24)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.3-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.11.2-staging.0...@clerk/clerk-react@2.11.3-staging.0) (2022-02-17)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.2-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.11.1...@clerk/clerk-react@2.11.2-staging.0) (2022-02-15)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-react@2.11.1-staging.0...@clerk/clerk-react@2.11.1) (2022-02-14)

**Note:** Version bump only for package @clerk/clerk-react

### 2.11.1-staging.0 (2022-02-11)

### Features

- **clerk-sdk-node:** Deprecate Session named middleware, introduce withAuth, requireAuth ([4e69553](https://github.com/clerkinc/javascript/commit/4e695535e41fe7c135cbf303a0d021e7b7d30f7d))
