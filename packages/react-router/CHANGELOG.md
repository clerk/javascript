# Change Log

## 1.1.1

### Patch Changes

- The [`exports` map](https://nodejs.org/api/packages.html#conditional-exports) inside `package.json` has been slightly adjusted to allow for [`require(esm)`](https://joyeecheung.github.io/blog/2024/03/18/require-esm-in-node-js/) to work correctly. The `"import"` conditions have been changed to `"default"`. ([#5188](https://github.com/clerk/javascript/pull/5188)) by [@LekoArts](https://github.com/LekoArts)

  You shouldn't see any change in behavior/functionality on your end.

- Updated dependencies [[`28179323d9891bd13625e32c5682a3276e73cdae`](https://github.com/clerk/javascript/commit/28179323d9891bd13625e32c5682a3276e73cdae), [`7ae77b74326e378bf161e29886ee82e1556d9840`](https://github.com/clerk/javascript/commit/7ae77b74326e378bf161e29886ee82e1556d9840), [`c5c246ce91c01db9f1eaccbd354f646bcd24ec0a`](https://github.com/clerk/javascript/commit/c5c246ce91c01db9f1eaccbd354f646bcd24ec0a), [`b707e942bfd434ff8a3b9a9fadf9d1b694d702c8`](https://github.com/clerk/javascript/commit/b707e942bfd434ff8a3b9a9fadf9d1b694d702c8), [`bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a`](https://github.com/clerk/javascript/commit/bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a), [`382c30240f563e58bc4d4832557c6825da40ce7f`](https://github.com/clerk/javascript/commit/382c30240f563e58bc4d4832557c6825da40ce7f)]:
  - @clerk/types@4.47.0
  - @clerk/shared@3.0.0
  - @clerk/clerk-react@5.24.0
  - @clerk/backend@1.24.3

## 1.1.0

### Minor Changes

- Introduce `EmailLinkErrorCodeStatus` to support users in custom flows and mark `EmailLinkErrorCode` as deprecated. ([#5142](https://github.com/clerk/javascript/pull/5142)) by [@alexcarpenter](https://github.com/alexcarpenter)

  ```diff
  - import { EmailLinkErrorCode } from '@clerk/nextjs/errors'
  + import { EmailLinkErrorCodeStatus } from '@clerk/nextjs/errors'
  ```

### Patch Changes

- Updated dependencies [[`d76c4699990b8477745c2584b1b98d5c92f9ace6`](https://github.com/clerk/javascript/commit/d76c4699990b8477745c2584b1b98d5c92f9ace6), [`a9b0087fca3f427f65907b358d9b5bc0c95921d8`](https://github.com/clerk/javascript/commit/a9b0087fca3f427f65907b358d9b5bc0c95921d8), [`92d17d7c087470b262fa5407cb6720fe6b17d333`](https://github.com/clerk/javascript/commit/92d17d7c087470b262fa5407cb6720fe6b17d333), [`30f6f3808e9b3778d5a9eb275780f94f9e9c7651`](https://github.com/clerk/javascript/commit/30f6f3808e9b3778d5a9eb275780f94f9e9c7651)]:
  - @clerk/shared@2.22.0
  - @clerk/clerk-react@5.23.0
  - @clerk/types@4.46.1
  - @clerk/backend@1.24.2

## 1.0.8

### Patch Changes

- Updated dependencies [[`dd2cbfe9f30358b6b298901bb52fa378b0acdca3`](https://github.com/clerk/javascript/commit/dd2cbfe9f30358b6b298901bb52fa378b0acdca3), [`dd2cbfe9f30358b6b298901bb52fa378b0acdca3`](https://github.com/clerk/javascript/commit/dd2cbfe9f30358b6b298901bb52fa378b0acdca3), [`570d8386f6aa596bf7bb1659bdddb8dd4d992b1d`](https://github.com/clerk/javascript/commit/570d8386f6aa596bf7bb1659bdddb8dd4d992b1d), [`570d8386f6aa596bf7bb1659bdddb8dd4d992b1d`](https://github.com/clerk/javascript/commit/570d8386f6aa596bf7bb1659bdddb8dd4d992b1d), [`128fd8909ae083c0d274dee7c6810e8574e1ce33`](https://github.com/clerk/javascript/commit/128fd8909ae083c0d274dee7c6810e8574e1ce33)]:
  - @clerk/clerk-react@5.22.13
  - @clerk/types@4.46.0
  - @clerk/backend@1.24.1
  - @clerk/shared@2.21.1

## 1.0.7

### Patch Changes

- Adds types for organization domain webhook events ([#4819](https://github.com/clerk/javascript/pull/4819)) by [@ijxy](https://github.com/ijxy)

- Internal changes to use new `getEnvVariable` utility from `@clerk/shared` ([#4985](https://github.com/clerk/javascript/pull/4985)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`ce44176efd4f2132001c49b815cbee409463bbea`](https://github.com/clerk/javascript/commit/ce44176efd4f2132001c49b815cbee409463bbea), [`f41081c563ddd2afc05b837358e0de087ae0c895`](https://github.com/clerk/javascript/commit/f41081c563ddd2afc05b837358e0de087ae0c895), [`767ac85fe6ce0ee0594c923e9af701bb05f40a0b`](https://github.com/clerk/javascript/commit/767ac85fe6ce0ee0594c923e9af701bb05f40a0b), [`225b38c7187d31fc755155ea99834ca03894d36b`](https://github.com/clerk/javascript/commit/225b38c7187d31fc755155ea99834ca03894d36b), [`c0f2daebe15642cd0cef16aafa1df1ece8ef771d`](https://github.com/clerk/javascript/commit/c0f2daebe15642cd0cef16aafa1df1ece8ef771d), [`429f1bfe5f7a554ab1fdf265475ba6c8b3f78472`](https://github.com/clerk/javascript/commit/429f1bfe5f7a554ab1fdf265475ba6c8b3f78472), [`5faa60e805ef14d9496a6caf9ff4dd8ec500c7e2`](https://github.com/clerk/javascript/commit/5faa60e805ef14d9496a6caf9ff4dd8ec500c7e2)]:
  - @clerk/backend@1.24.0
  - @clerk/shared@2.21.0
  - @clerk/types@4.45.1
  - @clerk/clerk-react@5.22.12

## 1.0.6

### Patch Changes

- Updated dependencies [[`0fa449cd09c9973297464a14f785895e3ddcab4d`](https://github.com/clerk/javascript/commit/0fa449cd09c9973297464a14f785895e3ddcab4d)]:
  - @clerk/clerk-react@5.22.11

## 1.0.5

### Patch Changes

- Updated dependencies [[`d3152be7f01fbb5ca26aeddc2437021f4b7ecc83`](https://github.com/clerk/javascript/commit/d3152be7f01fbb5ca26aeddc2437021f4b7ecc83), [`f976349243da2b75023e59e802460e6f3592ebbd`](https://github.com/clerk/javascript/commit/f976349243da2b75023e59e802460e6f3592ebbd)]:
  - @clerk/types@4.45.0
  - @clerk/backend@1.23.11
  - @clerk/clerk-react@5.22.10
  - @clerk/shared@2.20.18

## 1.0.4

### Patch Changes

- Updated dependencies [[`26225f2c31a22560f7ece2e02f1d0080b5b89520`](https://github.com/clerk/javascript/commit/26225f2c31a22560f7ece2e02f1d0080b5b89520), [`833693a6792b621e72162d70673e7bdfa84a69b6`](https://github.com/clerk/javascript/commit/833693a6792b621e72162d70673e7bdfa84a69b6)]:
  - @clerk/shared@2.20.17
  - @clerk/clerk-react@5.22.9
  - @clerk/types@4.44.3
  - @clerk/backend@1.23.10

## 1.0.3

### Patch Changes

- Updated dependencies [[`a309be354275b91a7b17d5a67e8ef6aa230a9935`](https://github.com/clerk/javascript/commit/a309be354275b91a7b17d5a67e8ef6aa230a9935), [`4773d0ad4ed27928fa53357906c0f3a349b9f871`](https://github.com/clerk/javascript/commit/4773d0ad4ed27928fa53357906c0f3a349b9f871), [`1345cb487970a7347351897e80dfb829d85c41ea`](https://github.com/clerk/javascript/commit/1345cb487970a7347351897e80dfb829d85c41ea)]:
  - @clerk/shared@2.20.16
  - @clerk/backend@1.23.9
  - @clerk/types@4.44.2
  - @clerk/clerk-react@5.22.8

## 1.0.2

### Patch Changes

- Updated dependencies [[`57c983fdc2b8d883623a2294daae0ac6c02c48f6`](https://github.com/clerk/javascript/commit/57c983fdc2b8d883623a2294daae0ac6c02c48f6), [`a26cf0ff10c76244975c454fdf6c615475d4bcd5`](https://github.com/clerk/javascript/commit/a26cf0ff10c76244975c454fdf6c615475d4bcd5), [`dd58c2507f8a7af4ebfc1241e2672a5678a83eaa`](https://github.com/clerk/javascript/commit/dd58c2507f8a7af4ebfc1241e2672a5678a83eaa)]:
  - @clerk/types@4.44.1
  - @clerk/shared@2.20.15
  - @clerk/backend@1.23.8
  - @clerk/clerk-react@5.22.7

## 1.0.1

### Patch Changes

- Updated dependencies [[`2179690c10a61b117e82fdd566b34939f4d28bc1`](https://github.com/clerk/javascript/commit/2179690c10a61b117e82fdd566b34939f4d28bc1), [`bdb537a9902c0f0ae58ca1d4b7590d929f28fedb`](https://github.com/clerk/javascript/commit/bdb537a9902c0f0ae58ca1d4b7590d929f28fedb)]:
  - @clerk/types@4.44.0
  - @clerk/backend@1.23.7
  - @clerk/clerk-react@5.22.6
  - @clerk/shared@2.20.14

## 1.0.0

### Major Changes

- No changes have been made to the SDK in this update. There are **no breaking changes**. ([#4966](https://github.com/clerk/javascript/pull/4966)) by [@LekoArts](https://github.com/LekoArts)

  This merely bumps the version to a non-zero range and moves the SDK out of beta to a stable release.

### Patch Changes

- Updated dependencies [[`f87ede848265d75ea1e880a3ab80c53a250f42cf`](https://github.com/clerk/javascript/commit/f87ede848265d75ea1e880a3ab80c53a250f42cf), [`e0cea9a9bf8b90858067154cba9c149d1634dc91`](https://github.com/clerk/javascript/commit/e0cea9a9bf8b90858067154cba9c149d1634dc91), [`6126cc98281bca96797fd8a55b6ec6aeda397e46`](https://github.com/clerk/javascript/commit/6126cc98281bca96797fd8a55b6ec6aeda397e46), [`6e096564a459db4eaf953e99e570905b10be6c84`](https://github.com/clerk/javascript/commit/6e096564a459db4eaf953e99e570905b10be6c84)]:
  - @clerk/shared@2.20.13
  - @clerk/backend@1.23.6
  - @clerk/types@4.43.0
  - @clerk/clerk-react@5.22.5

## 0.2.3

### Patch Changes

- Fix incorrect type for `authorizedParties` option ([#4964](https://github.com/clerk/javascript/pull/4964)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`fe3e49f61acefe8d7f1992405f7cb415fea2e5c8`](https://github.com/clerk/javascript/commit/fe3e49f61acefe8d7f1992405f7cb415fea2e5c8), [`4427c4702f64d4f28f7564ce5889d41e260aa519`](https://github.com/clerk/javascript/commit/4427c4702f64d4f28f7564ce5889d41e260aa519)]:
  - @clerk/types@4.42.0
  - @clerk/backend@1.23.5
  - @clerk/clerk-react@5.22.4
  - @clerk/shared@2.20.12

## 0.2.2

### Patch Changes

- Updated dependencies [[`418ec5c62c4eb600566faab07684c068a29007e3`](https://github.com/clerk/javascript/commit/418ec5c62c4eb600566faab07684c068a29007e3)]:
  - @clerk/types@4.41.2
  - @clerk/clerk-react@5.22.3
  - @clerk/backend@1.23.4
  - @clerk/shared@2.20.11

## 0.2.1

### Patch Changes

- Standardizing ambient declaration files for all SDKs ([#4919](https://github.com/clerk/javascript/pull/4919)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`9eef7713212378351e8e01628611eaa18de250e8`](https://github.com/clerk/javascript/commit/9eef7713212378351e8e01628611eaa18de250e8)]:
  - @clerk/shared@2.20.10
  - @clerk/clerk-react@5.22.2
  - @clerk/backend@1.23.3

## 0.2.0

### Minor Changes

- Bump `react-router` peer dependency to `^7.1.2` as this version fixes [React context mismatches](https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#v712) ([#4917](https://github.com/clerk/javascript/pull/4917)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Updated dependencies [[`7ffc99b48977b9f6c74c0c71c500b60cb8aba65e`](https://github.com/clerk/javascript/commit/7ffc99b48977b9f6c74c0c71c500b60cb8aba65e)]:
  - @clerk/types@4.41.1
  - @clerk/backend@1.23.2
  - @clerk/clerk-react@5.22.1
  - @clerk/shared@2.20.9

## 0.1.10

### Patch Changes

- Updated dependencies [[`4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d`](https://github.com/clerk/javascript/commit/4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d), [`aa48b1f9e890b2402e9d05989a4820141076f7bf`](https://github.com/clerk/javascript/commit/aa48b1f9e890b2402e9d05989a4820141076f7bf), [`53bd34fff38b17498edf66cc4bc2d42d707f28dc`](https://github.com/clerk/javascript/commit/53bd34fff38b17498edf66cc4bc2d42d707f28dc)]:
  - @clerk/types@4.41.0
  - @clerk/clerk-react@5.22.0
  - @clerk/backend@1.23.1
  - @clerk/shared@2.20.8

## 0.1.9

### Patch Changes

- Updated dependencies [[`e9e8834f7bfc953c3ae66fedf65b6952689c49da`](https://github.com/clerk/javascript/commit/e9e8834f7bfc953c3ae66fedf65b6952689c49da), [`fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6`](https://github.com/clerk/javascript/commit/fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6), [`7182b93101518a389cc13859f8a0fe8bd6f37a06`](https://github.com/clerk/javascript/commit/7182b93101518a389cc13859f8a0fe8bd6f37a06)]:
  - @clerk/backend@1.23.0
  - @clerk/types@4.40.3
  - @clerk/clerk-react@5.21.3
  - @clerk/shared@2.20.7

## 0.1.8

### Patch Changes

- Updated dependencies [[`72d29538f587934309da96fc1c6d454bb9aad21e`](https://github.com/clerk/javascript/commit/72d29538f587934309da96fc1c6d454bb9aad21e), [`84867be0215d7f74d8be7b4f803e2c3a241e2f89`](https://github.com/clerk/javascript/commit/84867be0215d7f74d8be7b4f803e2c3a241e2f89), [`fa967ce79e1b5f2e8216eb09900879cb825fa528`](https://github.com/clerk/javascript/commit/fa967ce79e1b5f2e8216eb09900879cb825fa528)]:
  - @clerk/backend@1.22.0

## 0.1.7

### Patch Changes

- Previously, when the `data()` utility was used inside the callback of `rootAuthLoader()` type errors were thrown. These issues should be fixed now. ([#4853](https://github.com/clerk/javascript/pull/4853)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`44cab6038af0a4d23869b3b292ece742fbbc4d85`](https://github.com/clerk/javascript/commit/44cab6038af0a4d23869b3b292ece742fbbc4d85)]:
  - @clerk/backend@1.21.6
  - @clerk/types@4.40.2
  - @clerk/clerk-react@5.21.2
  - @clerk/shared@2.20.6

## 0.1.6

### Patch Changes

- Updated dependencies [[`80e1117631d35834705119a79cdcf9e0ed423fdd`](https://github.com/clerk/javascript/commit/80e1117631d35834705119a79cdcf9e0ed423fdd)]:
  - @clerk/types@4.40.1
  - @clerk/clerk-react@5.21.1
  - @clerk/backend@1.21.5
  - @clerk/shared@2.20.5

## 0.1.5

### Patch Changes

- Updated dependencies [[`b5eb15bf81d94456309d6ca44ad423a4175d50b6`](https://github.com/clerk/javascript/commit/b5eb15bf81d94456309d6ca44ad423a4175d50b6), [`b933a2ba8112aefbabd7fe3313b89e083452d2dd`](https://github.com/clerk/javascript/commit/b933a2ba8112aefbabd7fe3313b89e083452d2dd)]:
  - @clerk/clerk-react@5.21.0

## 0.1.4

### Patch Changes

- Updated dependencies [[`b3300c84a42276bd071a37addbd1ca6888ed9d7c`](https://github.com/clerk/javascript/commit/b3300c84a42276bd071a37addbd1ca6888ed9d7c), [`c9da04636ffe1ba804a1ce5e5b79027d3a2344d2`](https://github.com/clerk/javascript/commit/c9da04636ffe1ba804a1ce5e5b79027d3a2344d2)]:
  - @clerk/backend@1.21.4
  - @clerk/types@4.40.0
  - @clerk/clerk-react@5.20.4
  - @clerk/shared@2.20.4

## 0.1.3

### Patch Changes

- Updated dependencies [[`84ccb0049041534f111be65f7c7d4d6120069446`](https://github.com/clerk/javascript/commit/84ccb0049041534f111be65f7c7d4d6120069446)]:
  - @clerk/shared@2.20.3
  - @clerk/backend@1.21.3
  - @clerk/clerk-react@5.20.3

## 0.1.2

### Patch Changes

- Updated dependencies [[`aeafa7c5efd50c893d088ac99199d7eaecc04025`](https://github.com/clerk/javascript/commit/aeafa7c5efd50c893d088ac99199d7eaecc04025), [`acd9326ef2d6942b981b3ee59c4b20ddd303323d`](https://github.com/clerk/javascript/commit/acd9326ef2d6942b981b3ee59c4b20ddd303323d)]:
  - @clerk/types@4.39.4
  - @clerk/clerk-react@5.20.2
  - @clerk/backend@1.21.2
  - @clerk/shared@2.20.2

## 0.1.1

### Patch Changes

- Using the same peerDependencies semver for react and react-dom ([#4758](https://github.com/clerk/javascript/pull/4758)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`66ad299e4b6496ea4a93799de0f1ecfad920ddad`](https://github.com/clerk/javascript/commit/66ad299e4b6496ea4a93799de0f1ecfad920ddad), [`dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d`](https://github.com/clerk/javascript/commit/dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d), [`e1748582d0c89462f48a482a7805871b7065fa19`](https://github.com/clerk/javascript/commit/e1748582d0c89462f48a482a7805871b7065fa19), [`7f7edcaa8228c26d19e9081979100ada7e982095`](https://github.com/clerk/javascript/commit/7f7edcaa8228c26d19e9081979100ada7e982095), [`e1748582d0c89462f48a482a7805871b7065fa19`](https://github.com/clerk/javascript/commit/e1748582d0c89462f48a482a7805871b7065fa19), [`dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d`](https://github.com/clerk/javascript/commit/dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d)]:
  - @clerk/shared@2.20.1
  - @clerk/clerk-react@5.20.1
  - @clerk/types@4.39.3
  - @clerk/backend@1.21.1

## 0.1.0

### Minor Changes

- Switching to use ^ for semver ranges of internal @clerk/ production dependencies. ([#4664](https://github.com/clerk/javascript/pull/4664)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Improve environment variable loading for certain values ([#4747](https://github.com/clerk/javascript/pull/4747)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`9d656c16bc78ac31b59b5edbd25118dfc33c4469`](https://github.com/clerk/javascript/commit/9d656c16bc78ac31b59b5edbd25118dfc33c4469), [`ffa631d2480cfe77bf08c61b1302ace308e5b630`](https://github.com/clerk/javascript/commit/ffa631d2480cfe77bf08c61b1302ace308e5b630), [`0266f6a73fc34748a86603bc89b6125d6bbb679b`](https://github.com/clerk/javascript/commit/0266f6a73fc34748a86603bc89b6125d6bbb679b)]:
  - @clerk/clerk-react@5.20.0
  - @clerk/backend@1.21.0
  - @clerk/shared@2.20.0

## 0.0.2

### Patch Changes

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/types@4.39.2
  - @clerk/backend@1.20.3
  - @clerk/clerk-react@5.19.3
  - @clerk/shared@2.19.4

## 0.0.1

### Patch Changes

- Initial beta release of `@clerk/react-router`. ([#4621](https://github.com/clerk/javascript/pull/4621)) by [@LekoArts](https://github.com/LekoArts)

  [React Router v7](https://remix.run/blog/react-router-v7) was released and Clerk's existing `@clerk/remix` SDK isn't compatible anymore. Thus the need for a brand new SDK came up. `@clerk/react-router` allows you to use React Router v7 + Clerk both in framework/library mode.

  Read the [React Router quickstart](https://clerk.com/docs/quickstarts/react-router) and [reference documenation](https://clerk.com/docs/references/react-router/overview) to learn more.

- Updated dependencies [[`fe75ced8a7d8b8a28839430444588ee173b5230a`](https://github.com/clerk/javascript/commit/fe75ced8a7d8b8a28839430444588ee173b5230a), [`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/backend@1.20.2
  - @clerk/types@4.39.1
  - @clerk/clerk-react@5.19.2
  - @clerk/shared@2.19.3
