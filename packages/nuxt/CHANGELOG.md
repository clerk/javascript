# @clerk/nuxt

## 1.1.4

### Patch Changes

- Updated dependencies [[`dd2cbfe9f30358b6b298901bb52fa378b0acdca3`](https://github.com/clerk/javascript/commit/dd2cbfe9f30358b6b298901bb52fa378b0acdca3), [`570d8386f6aa596bf7bb1659bdddb8dd4d992b1d`](https://github.com/clerk/javascript/commit/570d8386f6aa596bf7bb1659bdddb8dd4d992b1d), [`570d8386f6aa596bf7bb1659bdddb8dd4d992b1d`](https://github.com/clerk/javascript/commit/570d8386f6aa596bf7bb1659bdddb8dd4d992b1d), [`9b6102c551dcd5500e29e3a3de9e6483796f6686`](https://github.com/clerk/javascript/commit/9b6102c551dcd5500e29e3a3de9e6483796f6686), [`128fd8909ae083c0d274dee7c6810e8574e1ce33`](https://github.com/clerk/javascript/commit/128fd8909ae083c0d274dee7c6810e8574e1ce33), [`98436f018fb19170a1b5781401577dcab6ec706a`](https://github.com/clerk/javascript/commit/98436f018fb19170a1b5781401577dcab6ec706a)]:
  - @clerk/types@4.46.0
  - @clerk/vue@1.2.0
  - @clerk/backend@1.24.1
  - @clerk/shared@2.21.1

## 1.1.3

### Patch Changes

- Updated dependencies [[`ce44176efd4f2132001c49b815cbee409463bbea`](https://github.com/clerk/javascript/commit/ce44176efd4f2132001c49b815cbee409463bbea), [`4089ca43c3fea5a2acedc86c6fc8a88e7cbea16b`](https://github.com/clerk/javascript/commit/4089ca43c3fea5a2acedc86c6fc8a88e7cbea16b), [`f41081c563ddd2afc05b837358e0de087ae0c895`](https://github.com/clerk/javascript/commit/f41081c563ddd2afc05b837358e0de087ae0c895), [`767ac85fe6ce0ee0594c923e9af701bb05f40a0b`](https://github.com/clerk/javascript/commit/767ac85fe6ce0ee0594c923e9af701bb05f40a0b), [`225b38c7187d31fc755155ea99834ca03894d36b`](https://github.com/clerk/javascript/commit/225b38c7187d31fc755155ea99834ca03894d36b), [`c0f2daebe15642cd0cef16aafa1df1ece8ef771d`](https://github.com/clerk/javascript/commit/c0f2daebe15642cd0cef16aafa1df1ece8ef771d), [`429f1bfe5f7a554ab1fdf265475ba6c8b3f78472`](https://github.com/clerk/javascript/commit/429f1bfe5f7a554ab1fdf265475ba6c8b3f78472), [`5faa60e805ef14d9496a6caf9ff4dd8ec500c7e2`](https://github.com/clerk/javascript/commit/5faa60e805ef14d9496a6caf9ff4dd8ec500c7e2)]:
  - @clerk/backend@1.24.0
  - @clerk/vue@1.1.11
  - @clerk/shared@2.21.0
  - @clerk/types@4.45.1

## 1.1.2

### Patch Changes

- Add `<Waitlist />` component to the set of auto-imported components ([#5067](https://github.com/clerk/javascript/pull/5067)) by [@davidpattaguan](https://github.com/davidpattaguan)

## 1.1.1

### Patch Changes

- Updated dependencies [[`d3152be7f01fbb5ca26aeddc2437021f4b7ecc83`](https://github.com/clerk/javascript/commit/d3152be7f01fbb5ca26aeddc2437021f4b7ecc83), [`f976349243da2b75023e59e802460e6f3592ebbd`](https://github.com/clerk/javascript/commit/f976349243da2b75023e59e802460e6f3592ebbd)]:
  - @clerk/types@4.45.0
  - @clerk/backend@1.23.11
  - @clerk/shared@2.20.18
  - @clerk/vue@1.1.10

## 1.1.0

### Minor Changes

- Add `createRouteMatcher()` helper function that allows you to protect multiple pages or API routes. ([#5050](https://github.com/clerk/javascript/pull/5050)) by [@wobsoriano](https://github.com/wobsoriano)

  For protecting pages (in a global route middleware):

  ```ts
  // createRouteMatcher is automatically imported
  const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/forum(.*)']);

  export default defineNuxtRouteMiddleware(to => {
    const { userId } = useAuth();

    if (!userId.value && isProtectedRoute(to)) {
      // Add custom logic to run before redirecting
      return navigateTo('/sign-in');
    }
  });
  ```

  For protecting API routes:

  ```ts
  import { clerkMiddleware, createRouteMatcher } from '@clerk/nuxt/server';

  // Unlike pages, you need to import `createRouteMatcher` from `@clerk/nuxt/server`
  const isProtectedRoute = createRouteMatcher(['/api/user(.*)', '/api/projects(.*)']);

  export default clerkMiddleware(event => {
    const { userId } = event.context.auth;

    if (!userId && isProtectedRoute(event)) {
      setResponseStatus(event, 401);
      return 'You are not authorized to access this resource.';
    }
  });
  ```

### Patch Changes

- Updated dependencies [[`26225f2c31a22560f7ece2e02f1d0080b5b89520`](https://github.com/clerk/javascript/commit/26225f2c31a22560f7ece2e02f1d0080b5b89520), [`833693a6792b621e72162d70673e7bdfa84a69b6`](https://github.com/clerk/javascript/commit/833693a6792b621e72162d70673e7bdfa84a69b6)]:
  - @clerk/shared@2.20.17
  - @clerk/types@4.44.3
  - @clerk/backend@1.23.10
  - @clerk/vue@1.1.9

## 1.0.13

### Patch Changes

- Updated dependencies [[`a309be354275b91a7b17d5a67e8ef6aa230a9935`](https://github.com/clerk/javascript/commit/a309be354275b91a7b17d5a67e8ef6aa230a9935), [`83f145621397986c8eca828c0001fba83e3fc941`](https://github.com/clerk/javascript/commit/83f145621397986c8eca828c0001fba83e3fc941), [`4773d0ad4ed27928fa53357906c0f3a349b9f871`](https://github.com/clerk/javascript/commit/4773d0ad4ed27928fa53357906c0f3a349b9f871), [`1345cb487970a7347351897e80dfb829d85c41ea`](https://github.com/clerk/javascript/commit/1345cb487970a7347351897e80dfb829d85c41ea)]:
  - @clerk/shared@2.20.16
  - @clerk/vue@1.1.8
  - @clerk/backend@1.23.9
  - @clerk/types@4.44.2

## 1.0.12

### Patch Changes

- Updated dependencies [[`57c983fdc2b8d883623a2294daae0ac6c02c48f6`](https://github.com/clerk/javascript/commit/57c983fdc2b8d883623a2294daae0ac6c02c48f6), [`a26cf0ff10c76244975c454fdf6c615475d4bcd5`](https://github.com/clerk/javascript/commit/a26cf0ff10c76244975c454fdf6c615475d4bcd5), [`dd58c2507f8a7af4ebfc1241e2672a5678a83eaa`](https://github.com/clerk/javascript/commit/dd58c2507f8a7af4ebfc1241e2672a5678a83eaa)]:
  - @clerk/types@4.44.1
  - @clerk/shared@2.20.15
  - @clerk/backend@1.23.8
  - @clerk/vue@1.1.7

## 1.0.11

### Patch Changes

- Updated dependencies [[`2179690c10a61b117e82fdd566b34939f4d28bc1`](https://github.com/clerk/javascript/commit/2179690c10a61b117e82fdd566b34939f4d28bc1), [`bdb537a9902c0f0ae58ca1d4b7590d929f28fedb`](https://github.com/clerk/javascript/commit/bdb537a9902c0f0ae58ca1d4b7590d929f28fedb)]:
  - @clerk/types@4.44.0
  - @clerk/backend@1.23.7
  - @clerk/shared@2.20.14
  - @clerk/vue@1.1.6

## 1.0.10

### Patch Changes

- Updated dependencies [[`f87ede848265d75ea1e880a3ab80c53a250f42cf`](https://github.com/clerk/javascript/commit/f87ede848265d75ea1e880a3ab80c53a250f42cf), [`e0cea9a9bf8b90858067154cba9c149d1634dc91`](https://github.com/clerk/javascript/commit/e0cea9a9bf8b90858067154cba9c149d1634dc91), [`6126cc98281bca96797fd8a55b6ec6aeda397e46`](https://github.com/clerk/javascript/commit/6126cc98281bca96797fd8a55b6ec6aeda397e46), [`6e096564a459db4eaf953e99e570905b10be6c84`](https://github.com/clerk/javascript/commit/6e096564a459db4eaf953e99e570905b10be6c84)]:
  - @clerk/shared@2.20.13
  - @clerk/backend@1.23.6
  - @clerk/types@4.43.0
  - @clerk/vue@1.1.5

## 1.0.9

### Patch Changes

- Updated dependencies [[`fe3e49f61acefe8d7f1992405f7cb415fea2e5c8`](https://github.com/clerk/javascript/commit/fe3e49f61acefe8d7f1992405f7cb415fea2e5c8), [`4427c4702f64d4f28f7564ce5889d41e260aa519`](https://github.com/clerk/javascript/commit/4427c4702f64d4f28f7564ce5889d41e260aa519)]:
  - @clerk/types@4.42.0
  - @clerk/backend@1.23.5
  - @clerk/shared@2.20.12
  - @clerk/vue@1.1.4

## 1.0.8

### Patch Changes

- Updated dependencies [[`418ec5c62c4eb600566faab07684c068a29007e3`](https://github.com/clerk/javascript/commit/418ec5c62c4eb600566faab07684c068a29007e3)]:
  - @clerk/types@4.41.2
  - @clerk/backend@1.23.4
  - @clerk/shared@2.20.11
  - @clerk/vue@1.1.3

## 1.0.7

### Patch Changes

- Updated dependencies [[`9eef7713212378351e8e01628611eaa18de250e8`](https://github.com/clerk/javascript/commit/9eef7713212378351e8e01628611eaa18de250e8)]:
  - @clerk/shared@2.20.10
  - @clerk/backend@1.23.3
  - @clerk/vue@1.1.2

## 1.0.6

### Patch Changes

- Updated dependencies [[`7ffc99b48977b9f6c74c0c71c500b60cb8aba65e`](https://github.com/clerk/javascript/commit/7ffc99b48977b9f6c74c0c71c500b60cb8aba65e)]:
  - @clerk/types@4.41.1
  - @clerk/backend@1.23.2
  - @clerk/shared@2.20.9
  - @clerk/vue@1.1.1

## 1.0.5

### Patch Changes

- Support async middleware handler ([#4888](https://github.com/clerk/javascript/pull/4888)) by [@IceHugh](https://github.com/IceHugh)

- Updated dependencies [[`4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d`](https://github.com/clerk/javascript/commit/4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d), [`aa48b1f9e890b2402e9d05989a4820141076f7bf`](https://github.com/clerk/javascript/commit/aa48b1f9e890b2402e9d05989a4820141076f7bf), [`53bd34fff38b17498edf66cc4bc2d42d707f28dc`](https://github.com/clerk/javascript/commit/53bd34fff38b17498edf66cc4bc2d42d707f28dc)]:
  - @clerk/types@4.41.0
  - @clerk/vue@1.1.0
  - @clerk/backend@1.23.1
  - @clerk/shared@2.20.8

## 1.0.4

### Patch Changes

- Add quickstart links to Vue and Nuxt SDK READMEs ([#4883](https://github.com/clerk/javascript/pull/4883)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`e9e8834f7bfc953c3ae66fedf65b6952689c49da`](https://github.com/clerk/javascript/commit/e9e8834f7bfc953c3ae66fedf65b6952689c49da), [`e45d455b78fde898720d67637cec52446f5ffc80`](https://github.com/clerk/javascript/commit/e45d455b78fde898720d67637cec52446f5ffc80), [`fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6`](https://github.com/clerk/javascript/commit/fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6), [`7182b93101518a389cc13859f8a0fe8bd6f37a06`](https://github.com/clerk/javascript/commit/7182b93101518a389cc13859f8a0fe8bd6f37a06)]:
  - @clerk/backend@1.23.0
  - @clerk/vue@1.0.3
  - @clerk/types@4.40.3
  - @clerk/shared@2.20.7

## 1.0.3

### Patch Changes

- Updated dependencies [[`72d29538f587934309da96fc1c6d454bb9aad21e`](https://github.com/clerk/javascript/commit/72d29538f587934309da96fc1c6d454bb9aad21e), [`84867be0215d7f74d8be7b4f803e2c3a241e2f89`](https://github.com/clerk/javascript/commit/84867be0215d7f74d8be7b4f803e2c3a241e2f89), [`fa967ce79e1b5f2e8216eb09900879cb825fa528`](https://github.com/clerk/javascript/commit/fa967ce79e1b5f2e8216eb09900879cb825fa528)]:
  - @clerk/backend@1.22.0

## 1.0.2

### Patch Changes

- Updated dependencies [[`44cab6038af0a4d23869b3b292ece742fbbc4d85`](https://github.com/clerk/javascript/commit/44cab6038af0a4d23869b3b292ece742fbbc4d85)]:
  - @clerk/backend@1.21.6
  - @clerk/types@4.40.2
  - @clerk/shared@2.20.6
  - @clerk/vue@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [[`80e1117631d35834705119a79cdcf9e0ed423fdd`](https://github.com/clerk/javascript/commit/80e1117631d35834705119a79cdcf9e0ed423fdd), [`632bde1536753087902917a319a4a8d9fd043923`](https://github.com/clerk/javascript/commit/632bde1536753087902917a319a4a8d9fd043923)]:
  - @clerk/types@4.40.1
  - @clerk/vue@1.0.1
  - @clerk/backend@1.21.5
  - @clerk/shared@2.20.5

## 1.0.0

### Major Changes

- Introduce the official Clerk SDK for Vue and Nuxt. ([#4791](https://github.com/clerk/javascript/pull/4791)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Fix Vite optimization issue that caused duplicate versions of @clerk/vue to be created on first load, resulting in the Vue plugin losing context. ([#4820](https://github.com/clerk/javascript/pull/4820)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`8ad1866264ce5cf60a125d3a270597e8044b04c7`](https://github.com/clerk/javascript/commit/8ad1866264ce5cf60a125d3a270597e8044b04c7)]:
  - @clerk/vue@1.0.0

## 0.1.5

### Patch Changes

- Updated dependencies [[`b3300c84a42276bd071a37addbd1ca6888ed9d7c`](https://github.com/clerk/javascript/commit/b3300c84a42276bd071a37addbd1ca6888ed9d7c), [`c9da04636ffe1ba804a1ce5e5b79027d3a2344d2`](https://github.com/clerk/javascript/commit/c9da04636ffe1ba804a1ce5e5b79027d3a2344d2), [`aeb5855853e5e89a03a1d6ce3d421c3e9870c814`](https://github.com/clerk/javascript/commit/aeb5855853e5e89a03a1d6ce3d421c3e9870c814)]:
  - @clerk/backend@1.21.4
  - @clerk/types@4.40.0
  - @clerk/vue@0.1.5
  - @clerk/shared@2.20.4

## 0.1.4

### Patch Changes

- Updated dependencies [[`84ccb0049041534f111be65f7c7d4d6120069446`](https://github.com/clerk/javascript/commit/84ccb0049041534f111be65f7c7d4d6120069446)]:
  - @clerk/shared@2.20.3
  - @clerk/backend@1.21.3
  - @clerk/vue@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies [[`dfdf23bc9a25ebc13df98d553454a14c765423bb`](https://github.com/clerk/javascript/commit/dfdf23bc9a25ebc13df98d553454a14c765423bb)]:
  - @clerk/vue@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [[`aeafa7c5efd50c893d088ac99199d7eaecc04025`](https://github.com/clerk/javascript/commit/aeafa7c5efd50c893d088ac99199d7eaecc04025), [`acd9326ef2d6942b981b3ee59c4b20ddd303323d`](https://github.com/clerk/javascript/commit/acd9326ef2d6942b981b3ee59c4b20ddd303323d)]:
  - @clerk/types@4.39.4
  - @clerk/backend@1.21.2
  - @clerk/shared@2.20.2
  - @clerk/vue@0.1.2

## 0.1.1

### Patch Changes

- Re-export Vue SDK components and composables to Nuxt SDK to support manual imports ([#4750](https://github.com/clerk/javascript/pull/4750)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`66ad299e4b6496ea4a93799de0f1ecfad920ddad`](https://github.com/clerk/javascript/commit/66ad299e4b6496ea4a93799de0f1ecfad920ddad), [`dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d`](https://github.com/clerk/javascript/commit/dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d), [`e1748582d0c89462f48a482a7805871b7065fa19`](https://github.com/clerk/javascript/commit/e1748582d0c89462f48a482a7805871b7065fa19), [`7f7edcaa8228c26d19e9081979100ada7e982095`](https://github.com/clerk/javascript/commit/7f7edcaa8228c26d19e9081979100ada7e982095), [`e1748582d0c89462f48a482a7805871b7065fa19`](https://github.com/clerk/javascript/commit/e1748582d0c89462f48a482a7805871b7065fa19), [`dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d`](https://github.com/clerk/javascript/commit/dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d)]:
  - @clerk/shared@2.20.1
  - @clerk/types@4.39.3
  - @clerk/backend@1.21.1
  - @clerk/vue@0.1.1

## 0.1.0

### Minor Changes

- Switching to use ^ for semver ranges of internal @clerk/ production dependencies. ([#4664](https://github.com/clerk/javascript/pull/4664)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Updated dependencies [[`ffa631d2480cfe77bf08c61b1302ace308e5b630`](https://github.com/clerk/javascript/commit/ffa631d2480cfe77bf08c61b1302ace308e5b630)]:
  - @clerk/backend@1.21.0
  - @clerk/shared@2.20.0
  - @clerk/vue@0.1.0

## 0.0.13

### Patch Changes

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/types@4.39.2
  - @clerk/backend@1.20.3
  - @clerk/shared@2.19.4
  - @clerk/vue@0.0.17

## 0.0.12

### Patch Changes

- Updated dependencies [[`fe75ced8a7d8b8a28839430444588ee173b5230a`](https://github.com/clerk/javascript/commit/fe75ced8a7d8b8a28839430444588ee173b5230a), [`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/backend@1.20.2
  - @clerk/types@4.39.1
  - @clerk/shared@2.19.3
  - @clerk/vue@0.0.16

## 0.0.11

### Patch Changes

- Updated dependencies [[`4cb22548da81dd8b186a6ef1cf120aea99c85c62`](https://github.com/clerk/javascript/commit/4cb22548da81dd8b186a6ef1cf120aea99c85c62)]:
  - @clerk/shared@2.19.2
  - @clerk/backend@1.20.1
  - @clerk/vue@0.0.15

## 0.0.10

### Patch Changes

- Updated dependencies [[`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99), [`550c7e9851329688e37be29b83ea0c3b12482af7`](https://github.com/clerk/javascript/commit/550c7e9851329688e37be29b83ea0c3b12482af7), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99)]:
  - @clerk/backend@1.20.0
  - @clerk/types@4.39.0
  - @clerk/shared@2.19.1
  - @clerk/vue@0.0.14

## 0.0.9

### Patch Changes

- Updated dependencies [[`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3), [`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3)]:
  - @clerk/shared@2.19.0
  - @clerk/types@4.38.0
  - @clerk/backend@1.19.2
  - @clerk/vue@0.0.13

## 0.0.8

### Patch Changes

- Updated dependencies [[`4e5e7f463c12893a21cb3b5f9317fc3f2945879b`](https://github.com/clerk/javascript/commit/4e5e7f463c12893a21cb3b5f9317fc3f2945879b), [`bca0e772ed176f56cca87884077b49290da0d9a6`](https://github.com/clerk/javascript/commit/bca0e772ed176f56cca87884077b49290da0d9a6), [`1c5104581685a5a3d1d6c0b30dd406ac27ac3653`](https://github.com/clerk/javascript/commit/1c5104581685a5a3d1d6c0b30dd406ac27ac3653)]:
  - @clerk/types@4.37.0
  - @clerk/vue@0.0.12
  - @clerk/backend@1.19.1
  - @clerk/shared@2.18.1

## 0.0.7

### Patch Changes

- Updated dependencies [[`8ee5d84995fa17532491ff96efac5738c9bcd9ef`](https://github.com/clerk/javascript/commit/8ee5d84995fa17532491ff96efac5738c9bcd9ef), [`09fedd1df155d30cc055ce701b133aa6470e9b47`](https://github.com/clerk/javascript/commit/09fedd1df155d30cc055ce701b133aa6470e9b47), [`b6aa589f75be62a89a3853d496176ed2f2c0e2c5`](https://github.com/clerk/javascript/commit/b6aa589f75be62a89a3853d496176ed2f2c0e2c5), [`235eaae4c3c9400492fca47d20a47c7081041565`](https://github.com/clerk/javascript/commit/235eaae4c3c9400492fca47d20a47c7081041565)]:
  - @clerk/types@4.36.0
  - @clerk/backend@1.19.0
  - @clerk/shared@2.18.0
  - @clerk/vue@0.0.11

## 0.0.6

### Patch Changes

- Allow custom middleware with options ([#4655](https://github.com/clerk/javascript/pull/4655)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d), [`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d)]:
  - @clerk/types@4.35.1
  - @clerk/backend@1.18.1
  - @clerk/shared@2.17.1
  - @clerk/vue@0.0.10

## 0.0.5

### Patch Changes

- Updated dependencies [[`0a1807552dcf0501a97f60b4df0280525bca9743`](https://github.com/clerk/javascript/commit/0a1807552dcf0501a97f60b4df0280525bca9743)]:
  - @clerk/vue@0.0.9

## 0.0.4

### Patch Changes

- Updated dependencies [[`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`d84d7e31235c5c7da3415981dc76db4473a71a39`](https://github.com/clerk/javascript/commit/d84d7e31235c5c7da3415981dc76db4473a71a39), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`dce4f7ffca7248c0500f0ec9a978672b1f2fad69`](https://github.com/clerk/javascript/commit/dce4f7ffca7248c0500f0ec9a978672b1f2fad69)]:
  - @clerk/shared@2.17.0
  - @clerk/types@4.35.0
  - @clerk/backend@1.18.0
  - @clerk/vue@0.0.8

## 0.0.3

### Patch Changes

- Updated dependencies [[`c70994b5b6f92a6550dfe37547f01bbfa810c223`](https://github.com/clerk/javascript/commit/c70994b5b6f92a6550dfe37547f01bbfa810c223), [`7623a99594e7329200b6b374e483152d7679ce66`](https://github.com/clerk/javascript/commit/7623a99594e7329200b6b374e483152d7679ce66)]:
  - @clerk/types@4.34.2
  - @clerk/backend@1.17.2
  - @clerk/shared@2.16.1
  - @clerk/vue@0.0.7

## 0.0.2

### Patch Changes

- Updated dependencies [[`e47eb5882a7fd4a8dee25933c6644790d6ea3407`](https://github.com/clerk/javascript/commit/e47eb5882a7fd4a8dee25933c6644790d6ea3407), [`273d16cb0665d4d960838cb294dc356f41814745`](https://github.com/clerk/javascript/commit/273d16cb0665d4d960838cb294dc356f41814745), [`6b0961765e1f3d09679be4b163fa13ac7dd97191`](https://github.com/clerk/javascript/commit/6b0961765e1f3d09679be4b163fa13ac7dd97191)]:
  - @clerk/shared@2.16.0
  - @clerk/types@4.34.1
  - @clerk/vue@0.0.6
  - @clerk/backend@1.17.1

## 0.0.1

### Patch Changes

- Introduce an experimental version of Clerk SDK for [Nuxt](https://nuxt.com) ([#4541](https://github.com/clerk/javascript/pull/4541)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`91f60ca113928a5152efed23ef5eeb9330be5066`](https://github.com/clerk/javascript/commit/91f60ca113928a5152efed23ef5eeb9330be5066), [`536fa996ff84a545678a3036b28409824d1c00dd`](https://github.com/clerk/javascript/commit/536fa996ff84a545678a3036b28409824d1c00dd), [`b28c5e8bc44885bf6b1533df48e872ba90c387da`](https://github.com/clerk/javascript/commit/b28c5e8bc44885bf6b1533df48e872ba90c387da)]:
  - @clerk/vue@0.0.5
  - @clerk/backend@1.17.0
  - @clerk/shared@2.15.0
