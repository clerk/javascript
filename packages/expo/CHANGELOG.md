# Change Log

## 1.1.0

### Minor Changes

- This removes headers that were added for internal observability purposes. (see #2528) ([#3326](https://github.com/clerk/javascript/pull/3326)) by [@thiskevinwang](https://github.com/thiskevinwang)

  ```diff
  - x-expo-execution-environment
  - x-expo-native-application-version
  ```

  This aims to resolve reported CORS errors. (see #2266)

  This removes `expo-application` & `expo-constants` as peer and development dependencies.

### Patch Changes

- Use a polyfill for the `atob` function to prevent errors when using the Hermes JS engine, since the engine's `atob` implementation is stricter than it should be. ([#3354](https://github.com/clerk/javascript/pull/3354)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`56c8562eb`](https://github.com/clerk/javascript/commit/56c8562eb4b05308aed2a9f10162cbf5819ad937), [`7b213d5a4`](https://github.com/clerk/javascript/commit/7b213d5a426de16e854f5d3316a24579f698ba38)]:
  - @clerk/clerk-js@5.2.4

## 1.0.7

### Patch Changes

- Updated dependencies [[`996828741`](https://github.com/clerk/javascript/commit/9968287418ba7e9fe3de1d65bc973d0035697257)]:
  - @clerk/clerk-js@5.2.3

## 1.0.6

### Patch Changes

- Updated dependencies [[`39265d909`](https://github.com/clerk/javascript/commit/39265d90941c850fd1b24295b19b904a5f3eaba6), [`1662aaae9`](https://github.com/clerk/javascript/commit/1662aaae965fcf36b13dba6b148e096ab6a1cd83), [`f70c885f7`](https://github.com/clerk/javascript/commit/f70c885f798f7ff513f6687f87c8a56daf26fa05), [`f5804a225`](https://github.com/clerk/javascript/commit/f5804a225e9d67cd315700f0ced0ff17b8b14e53), [`12f78491d`](https://github.com/clerk/javascript/commit/12f78491d6b10f2be63891f8a7f76fc6acf37c00), [`27d612663`](https://github.com/clerk/javascript/commit/27d61266357166413ee421114df175ea283ca9c1)]:
  - @clerk/clerk-react@5.0.4
  - @clerk/shared@2.0.2
  - @clerk/clerk-js@5.2.2

## 1.0.5

### Patch Changes

- Updated dependencies [[`e93b5777b`](https://github.com/clerk/javascript/commit/e93b5777b4f8578e6a6f81566e2601ab0e65590a)]:
  - @clerk/clerk-react@5.0.3

## 1.0.4

### Patch Changes

- Updated dependencies [[`c8f907a5a`](https://github.com/clerk/javascript/commit/c8f907a5ac8ba1d01bd6f2a9b027d8fa050d2082)]:
  - @clerk/clerk-js@5.2.1

## 1.0.3

### Patch Changes

- Updated dependencies [[`d1b75fa84`](https://github.com/clerk/javascript/commit/d1b75fa84ea6ad04604db58c18ef71efabb004c8), [`377bff929`](https://github.com/clerk/javascript/commit/377bff929a7e668368611482044dd9fad0c98b58), [`4678caf4b`](https://github.com/clerk/javascript/commit/4678caf4b88f524ee638b944c683af126d6e5f90), [`a78bc447c`](https://github.com/clerk/javascript/commit/a78bc447c1aabaa41bcbaa2a8fe3c48f31275574), [`c7d626292`](https://github.com/clerk/javascript/commit/c7d626292a9fd12ca0f1b31a1035e711b6e99531), [`19cd42434`](https://github.com/clerk/javascript/commit/19cd42434450e568998336bf6d705e475122abbc), [`e79d2e3d3`](https://github.com/clerk/javascript/commit/e79d2e3d3be02eb1cf8b2647ac179cc5d4aa2de2)]:
  - @clerk/clerk-js@5.2.0
  - @clerk/shared@2.0.1
  - @clerk/clerk-react@5.0.2

## 1.0.2

### Patch Changes

- Updated dependencies [[`3d659e4d6`](https://github.com/clerk/javascript/commit/3d659e4d69efb7dd1d2e33d8c6e1950e074d5467), [`8688ad73f`](https://github.com/clerk/javascript/commit/8688ad73f458af2bf7560c1c8204f67304e4ac71), [`dafdad2f8`](https://github.com/clerk/javascript/commit/dafdad2f8ddb1ea29a2db7755390e060991ae356)]:
  - @clerk/clerk-js@5.1.1

## 1.0.1

### Patch Changes

- Updated dependencies [[`e79610344`](https://github.com/clerk/javascript/commit/e79610344ee8f48c742f2ffe2ef31d43d63cdf5a), [`6a67bc96b`](https://github.com/clerk/javascript/commit/6a67bc96ba38dfcf8fbd9a098613f50e62e5be7a), [`956d8792f`](https://github.com/clerk/javascript/commit/956d8792fefe9d6a89022f1e938149b25503ec7f), [`6f3c11de6`](https://github.com/clerk/javascript/commit/6f3c11de638b360597ca5d2141e5f4bee12f604d)]:
  - @clerk/clerk-js@5.1.0
  - @clerk/clerk-react@5.0.1

## 1.0.0

### Major Changes

- c2a090513: Change the minimal Node.js version required by Clerk to `18.17.0`.
- deac67c1c: Drop default exports from all packages. Migration guide:
  - use `import { Clerk } from '@clerk/backend';`
  - use `import { clerkInstance } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-js';`
  - use `import { Clerk } from '@clerk/clerk-js/headless';`
  - use `import { IsomorphicClerk } from '@clerk/clerk-react'`
- 7f833da9e: Drop deprecations. Migration steps:
  - use `publishableKey` instead of `frontendApi`
  - use `Clerk.handleEmailLinkVerification()` instead of `Clerk.handleMagicLinkVerification()`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`
  - drop `orgs` jwt claim from session token
  - use `ExternalAccount.imageUrl` instead of `ExternalAccount.avatarUrl`
  - use `Organization.imageUrl` instead of `Organization.logoUrl`
  - use `User.imageUrl` instead of `User.profileImageUrl`
  - use `OrganizationMembershipPublicUserData.imageUrl` instead of `OrganizationMembershipPublicUserData.profileImageUrl`
  - use `useOrganizationList` instead of `useOrganizations`
  - use `userProfileProps` instead of `userProfile` in `Appearance`
  - use `Clerk.setActive()` instead of `Clerk.setSession()`
  - drop `password` param in `User.update()`
  - use `afterSelectOrganizationUrl` instead of `afterSwitchOrganizationUrl` in `OrganizationSwitcher`
  - drop `Clerk.experimental_canUseCaptcha` / `Clerk.Clerk.experimental_captchaSiteKey` / `Clerk.experimental_captchaURL` (were meant for internal use)
  - use `User.getOrganizationMemberships()` instead of `Clerk.getOrganizationMemberships()`
  - drop `lastOrganizationInvitation` / `lastOrganizationMember` from Clerk emitted events
  - drop `Clerk.__unstable__invitationUpdate` / `Clerk.__unstable__membershipUpdate`
  - drop support for string param in `Organization.create()`
  - use `Organization.getInvitations()` instead of `Organization.getPendingInvitations()`
  - use `pageSize` instead of `limit` in `OrganizationMembership.retrieve()`
  - use `initialPage` instead of `offset` in `OrganizationMembership.retrieve()`
  - drop `lastOrganizationInvitation` / `lastOrganizationMember` from ClerkProvider
  - use `invitations` instead of `invitationList` in `useOrganization`
  - use `memberships` instead of `membershipList` in `useOrganization`
  - use `redirectUrl` instead of `redirect_url` in `User.createExternalAccount()`
  - use `signature` instead of `generatedSignature` in `Signup.attemptWeb3WalletVerification()`
- 71663c568: Internal update default apiUrl domain from clerk.dev to clerk.com
- abb921b44: Drop deprecations. Migration steps:
  - use `CLERK_PUBLISHABLE_KEY` instead of `CLERK_FRONTEND_API` env variable
  - use `publishableKey` instead of `frontendApi`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`
- 8aea39cd6: - Introduce `@clerk/clerk-react/errors` and `@clerk/clerk-react/internal` subpath exports to expose some internal utilities. Eg

  ````typescript
  // Before
  import { **internal**setErrorThrowerOptions } from '@clerk/clerk-react';
  // After
  import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';

      // Before
      import { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react';
      // After
      import { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react/errors';

      // Before
      import { MultisessionAppSupport } from '@clerk/clerk-react';
      // After
      import { MultisessionAppSupport } from '@clerk/clerk-react/internal';
      ```

  - Drop from the `@clerk/clerk-react` and all other clerk-react wrapper packages:
    - `__internal__setErrorThrowerOptions` internal utility (moved to /internal subpath)
    - `WithClerkProp` type
    - `MultisessionAppSupport` component (moved to /internal subpath)
    - `EmailLinkErrorCode` enum
  - Drop `StructureContext` and related errors to reduce to reduce code complexity since it seems that it was not being used.
  - Drop `withUser`, `WithUser`, `withClerk` HOFs and `WithClerk`, `withSession`, `WithSession` HOCs from the `@clerk/clerk-react`
    to reduce the export surface since it's trivial to implement if needed.

  ````

- 52ff8fe6b: Upgrade React version to >=18 and add react-dom as peer dependency
  to fix issues with vite & rollup building.
- 97407d8aa: Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now.

### Minor Changes

- 2b1d76752: Use `base-64` package for Expo instead of the isomorphic from `@clerk/shared` due to errors about `Maximum call stack size exceeded` on `global.Buffer`
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

- 33996351d: Include new headers in requests;

  Added `expo-application >=5` & `expo-constants >=14` peer deps

### Patch Changes

- ee207545f: Update `expo-auth-session` dependency from 5.0.2 to 5.4.0 and `expo-web-browser` from 12.3.2 to 12.8.2
- 2de442b24: Rename beta-v5 to beta
- 2e77cd737: Set correct information on required Node.js and React versions in README
- Updated dependencies [3daa937a7]
- Updated dependencies [69ce3e185]
- Updated dependencies [743c4d204]
- Updated dependencies [4b8bedc66]
- Updated dependencies [043801f2a]
- Updated dependencies [2a67f729d]
- Updated dependencies [c2a090513]
- Updated dependencies [3ba3f383b]
- Updated dependencies [1ddffb67e]
- Updated dependencies [6ac9e717a]
- Updated dependencies [0d0b1d89a]
- Updated dependencies [1834a3ee4]
- Updated dependencies [896cb6104]
- Updated dependencies [64d3763ec]
- Updated dependencies [8350109ab]
- Updated dependencies [0a108ae3b]
- Updated dependencies [e214450e9]
- Updated dependencies [deac67c1c]
- Updated dependencies [034abeb76]
- Updated dependencies [d08d96971]
- Updated dependencies [17a6158e8]
- Updated dependencies [1dc28ab46]
- Updated dependencies [9dc46b2c1]
- Updated dependencies [83e9d0846]
- Updated dependencies [d422dae67]
- Updated dependencies [a2ab0d300]
- Updated dependencies [6c2d88ee8]
- Updated dependencies [d37d44a68]
- Updated dependencies [434a96ebe]
- Updated dependencies [791c49807]
- Updated dependencies [ea4933655]
- Updated dependencies [7f6a64f43]
- Updated dependencies [08dd88c4a]
- Updated dependencies [5f49568f6]
- Updated dependencies [8b40dc7a3]
- Updated dependencies [dd49f93da]
- Updated dependencies [afec17953]
- Updated dependencies [0699fa496]
- Updated dependencies [7466fa505]
- Updated dependencies [a68eb3083]
- Updated dependencies [2de442b24]
- Updated dependencies [0293f29c8]
- Updated dependencies [9180c8b80]
- Updated dependencies [db18787c4]
- Updated dependencies [e400fa9e3]
- Updated dependencies [7f833da9e]
- Updated dependencies [ef2325dcc]
- Updated dependencies [6a769771c]
- Updated dependencies [6d3b422c8]
- Updated dependencies [23ebc89e9]
- Updated dependencies [9e10d577e]
- Updated dependencies [fc3ffd880]
- Updated dependencies [2684f1d5c]
- Updated dependencies [beac05f39]
- Updated dependencies [097ec4872]
- Updated dependencies [31570f138]
- Updated dependencies [06d2b4fca]
- Updated dependencies [bab2e7e05]
- Updated dependencies [27052469e]
- Updated dependencies [71663c568]
- Updated dependencies [492b8a7b1]
- Updated dependencies [9e99eb727]
- Updated dependencies [846a4c24d]
- Updated dependencies [491fba5ad]
- Updated dependencies [cfea3d9c0]
- Updated dependencies [d65d36fc6]
- Updated dependencies [2352149f6]
- Updated dependencies [e5c989a03]
- Updated dependencies [94bbdf7df]
- Updated dependencies [ff803ff20]
- Updated dependencies [98b194b2a]
- Updated dependencies [1c199d1d2]
- Updated dependencies [ff08fe237]
- Updated dependencies [676d23a59]
- Updated dependencies [7ecd6f6ab]
- Updated dependencies [d18cae5fd]
- Updated dependencies [12f3c5c55]
- Updated dependencies [c776f86fb]
- Updated dependencies [73849836f]
- Updated dependencies [394cecc6b]
- Updated dependencies [ee57f21ac]
- Updated dependencies [d9f265fcb]
- Updated dependencies [7bffc47cb]
- Updated dependencies [d005992e0]
- Updated dependencies [2e77cd737]
- Updated dependencies [9737ef510]
- Updated dependencies [fafa76fb6]
- Updated dependencies [d1dc44cc7]
- Updated dependencies [141f09fdc]
- Updated dependencies [1f650f30a]
- Updated dependencies [b6c4e1cfe]
- Updated dependencies [d941b902f]
- Updated dependencies [97407d8aa]
- Updated dependencies [2a22aade8]
- Updated dependencies [7d3aa44d7]
- Updated dependencies [fbbb1afc2]
- Updated dependencies [e7414cb3f]
- Updated dependencies [ae3a6683a]
- Updated dependencies [63373bf21]
- Updated dependencies [0ee1777e0]
- Updated dependencies [78fc5eec0]
- Updated dependencies [6e54b1b59]
- Updated dependencies [4edb77632]
- Updated dependencies [8aea39cd6]
- Updated dependencies [4aff3d936]
- Updated dependencies [5f58a2274]
- Updated dependencies [976c6a07e]
- Updated dependencies [5f58a2274]
- Updated dependencies [57e0972bb]
- Updated dependencies [6a33709cc]
- Updated dependencies [45c92006c]
- Updated dependencies [52ff8fe6b]
- Updated dependencies [c9e0f68af]
- Updated dependencies [d9bd2b4ea]
- Updated dependencies [f77e8cdbd]
- Updated dependencies [8b466a9ba]
- Updated dependencies [4063bd8e9]
- Updated dependencies [fe2607b6f]
- Updated dependencies [c7e6d00f5]
- Updated dependencies [8cc45d2af]
- Updated dependencies [ef72c0ae6]
- Updated dependencies [663243220]
- Updated dependencies [797e327e0]
- Updated dependencies [fe6215dea]
- Updated dependencies [c6a5e0f5d]
- Updated dependencies [4edb77632]
- Updated dependencies [ab4eb56a5]
- Updated dependencies [b0ca7b801]
- Updated dependencies [97407d8aa]
- Updated dependencies [d1b524ffb]
- Updated dependencies [12962bc58]
- Updated dependencies [30dfdf2aa]
- Updated dependencies [8b261add2]
- Updated dependencies [4bb57057e]
- Updated dependencies [9955938d6]
- Updated dependencies [c86f73be3]
- Updated dependencies [d4ff346dd]
- Updated dependencies [7644b7472]
- Updated dependencies [2ec9f6b09]
- Updated dependencies [2e4a43017]
- Updated dependencies [f98e480b1]
- Updated dependencies [5aab9f04a]
- Updated dependencies [1affbb22a]
- Updated dependencies [46040a2f3]
- Updated dependencies [8ca8517bf]
- Updated dependencies [f00fd2dfe]
- Updated dependencies [046224177]
- Updated dependencies [f5fb63cf1]
- Updated dependencies [e4c0ae028]
- Updated dependencies [8daf8451c]
- Updated dependencies [9e57e94d2]
- Updated dependencies [75ea300bc]
- Updated dependencies [db3eefe8c]
- Updated dependencies [9a1fe3728]
- Updated dependencies [7f751c4ef]
- Updated dependencies [93a611570]
- Updated dependencies [f5d55bb1f]
- Updated dependencies [18c0d015d]
- Updated dependencies [0d1052ac2]
- Updated dependencies [d30ea1faa]
- Updated dependencies [e9841dd91]
- Updated dependencies [aaa457097]
- Updated dependencies [7886ba89d]
- Updated dependencies [fc36e2e54]
- Updated dependencies [920c9e1b5]
- Updated dependencies [1fd2eff38]
- Updated dependencies [5471c7e8d]
- Updated dependencies [e7ae9c36a]
- Updated dependencies [ebf9f165f]
- Updated dependencies [445026ab7]
- Updated dependencies [f540e9843]
- Updated dependencies [477170962]
- Updated dependencies [4705d63a8]
- Updated dependencies [59f9a7296]
- Updated dependencies [7b40924e4]
- Updated dependencies [bf09d18d6]
- Updated dependencies [38d8b3e8a]
- Updated dependencies [59336d3d4]
- Updated dependencies [be991365e]
- Updated dependencies [5dea004b1]
- Updated dependencies [8350f73a6]
- Updated dependencies [5d6937c9f]
- Updated dependencies [d6a7ea61a]
- Updated dependencies [c3dccfc34]
- Updated dependencies [2f6306fd3]
- Updated dependencies [6fd303b99]
- Updated dependencies [e0e79b4fe]
- Updated dependencies [41ae1d2f0]
- Updated dependencies [750337633]
- Updated dependencies [859b5495f]
- Updated dependencies [9040549d6]
- Updated dependencies [f02482bb5]
- Updated dependencies [8fbe8ba2f]
- Updated dependencies [3c4209068]
- Updated dependencies [fb794ce7b]
- Updated dependencies [b9dd8e7c0]
- Updated dependencies [94519aa33]
- Updated dependencies [d11aa60eb]
- Updated dependencies [ebf9be77f]
- Updated dependencies [79040966f]
- Updated dependencies [008ac4217]
- Updated dependencies [63ef35ec5]
- Updated dependencies [40ac4b645]
- Updated dependencies [9c6411aa8]
- Updated dependencies [22f19d3bf]
- Updated dependencies [6f755addd]
- Updated dependencies [429d030f7]
- Updated dependencies [11fbfdeec]
- Updated dependencies [844847e0b]
- Updated dependencies [6eab66050]
- Updated dependencies [5db6dbb90]
- Updated dependencies [db2d82901]
- Updated dependencies [6d89f2687]
- Updated dependencies [0551488fb]
  - @clerk/clerk-js@5.0.0
  - @clerk/shared@2.0.0
  - @clerk/clerk-react@5.0.0

## 1.0.0-beta.49

### Patch Changes

- Updated dependencies [[`f00fd2dfe`](https://github.com/clerk/javascript/commit/f00fd2dfe309cfeac82a776cc006f2c21b6d7988)]:
  - @clerk/clerk-js@5.0.0-beta.49
  - @clerk/clerk-react@5.0.0-beta.41

## 1.0.0-beta.48

### Patch Changes

- Updated dependencies [[`17a6158e8`](https://github.com/clerk/javascript/commit/17a6158e86bdf78013ea129bfccac57998bf074e)]:
  - @clerk/clerk-js@5.0.0-beta.48

## 1.0.0-beta.47

### Patch Changes

- Updated dependencies [[`8ca8517bf`](https://github.com/clerk/javascript/commit/8ca8517bf6f8b89aadb4ccc2c759e40fae09ab63)]:
  - @clerk/clerk-js@5.0.0-beta.47

## 1.0.0-beta.46

### Patch Changes

- Updated dependencies [[`3daa937a7`](https://github.com/clerk/javascript/commit/3daa937a7a64949ec986542b57df36eba26fd10e), [`bab2e7e05`](https://github.com/clerk/javascript/commit/bab2e7e0590d0da1fd7db0680e63e8f2eb836b41)]:
  - @clerk/clerk-js@5.0.0-beta.46
  - @clerk/shared@2.0.0-beta.23
  - @clerk/clerk-react@5.0.0-beta.40

## 1.0.0-beta.45

### Patch Changes

- Updated dependencies [[`a2ab0d300`](https://github.com/clerk/javascript/commit/a2ab0d3001bfe4752ed1aaa6f3399ece19a93dc7), [`beac05f39`](https://github.com/clerk/javascript/commit/beac05f391fe7f426d8334cd3558cd2405cccf04), [`ff08fe237`](https://github.com/clerk/javascript/commit/ff08fe237fa5a9ded04924b3c5821111836b49b6), [`d9f265fcb`](https://github.com/clerk/javascript/commit/d9f265fcb12b39301b9802e4787dc636ee28444f), [`f98e480b1`](https://github.com/clerk/javascript/commit/f98e480b1a9e41f5370efcd53aa6887af2ad6816), [`ebf9f165f`](https://github.com/clerk/javascript/commit/ebf9f165f8947e822db4d1d4a68807cd07729a27), [`859b5495f`](https://github.com/clerk/javascript/commit/859b5495f2835e3df418d5a79fc608830dcea68b), [`8fbe8ba2f`](https://github.com/clerk/javascript/commit/8fbe8ba2f749e0f43cdb8950ce87eb4cc21022af), [`fb794ce7b`](https://github.com/clerk/javascript/commit/fb794ce7b88001b98ad4a628bc2cc39a0c8ccfa5), [`d11aa60eb`](https://github.com/clerk/javascript/commit/d11aa60ebc0316457c5f28ccf69ddd8c4e769785), [`22f19d3bf`](https://github.com/clerk/javascript/commit/22f19d3bfa987268610e93d2028815d12b374110)]:
  - @clerk/clerk-js@5.0.0-beta.45
  - @clerk/clerk-react@5.0.0-beta.39
  - @clerk/shared@2.0.0-beta.22

## 1.0.0-beta.44

### Patch Changes

- Updated dependencies [[`4aff3d936`](https://github.com/clerk/javascript/commit/4aff3d9369ca6bcf07480cda6491dfc410302b3d), [`94519aa33`](https://github.com/clerk/javascript/commit/94519aa33774c8d6e557ce47a00974ad7b194c5d)]:
  - @clerk/clerk-js@5.0.0-beta.44
  - @clerk/clerk-react@5.0.0-beta.38

## 1.0.0-beta.43

### Patch Changes

- Updated dependencies [[`0699fa496`](https://github.com/clerk/javascript/commit/0699fa49693dc7a8d3de8ba053c4f16a5c8431d0)]:
  - @clerk/clerk-js@5.0.0-beta.43
  - @clerk/clerk-react@5.0.0-beta.37

## 1.0.0-beta.42

### Patch Changes

- Updated dependencies [[`06d2b4fca`](https://github.com/clerk/javascript/commit/06d2b4fca43b764b2432c40ce3f2d03cf448d5e1), [`2352149f6`](https://github.com/clerk/javascript/commit/2352149f6ba9708095146a3087538faf2d4f161f)]:
  - @clerk/clerk-js@5.0.0-beta.42
  - @clerk/clerk-react@5.0.0-beta.36

## 1.0.0-beta.41

### Patch Changes

- Updated dependencies [[`6d89f2687`](https://github.com/clerk/javascript/commit/6d89f26879dcdad81194f48695016715950003f9)]:
  - @clerk/clerk-js@5.0.0-beta.41

## 1.0.0-beta.40

### Patch Changes

- Updated dependencies [[`d422dae67`](https://github.com/clerk/javascript/commit/d422dae67a5204c702de269008515d7622568142), [`9180c8b80`](https://github.com/clerk/javascript/commit/9180c8b80e0ad95c1a9e490e8201ffd089634a48), [`6d3b422c8`](https://github.com/clerk/javascript/commit/6d3b422c8ac2fb2df66d20f4a5ca55c5e20a5f5d), [`976c6a07e`](https://github.com/clerk/javascript/commit/976c6a07e480b47f4abe326ab282bd87833ad6c3), [`c6a5e0f5d`](https://github.com/clerk/javascript/commit/c6a5e0f5dbd9ec4a7b5657855e8a31bc8347d0a4), [`4705d63a8`](https://github.com/clerk/javascript/commit/4705d63a87c46f5820cd304301edef74d9261ff5)]:
  - @clerk/clerk-js@5.0.0-beta.40
  - @clerk/clerk-react@5.0.0-beta.35

## 1.0.0-beta.39

### Patch Changes

- Updated dependencies [[`fc3ffd880`](https://github.com/clerk/javascript/commit/fc3ffd88064a09ab98877dfba119150390f9296e), [`d1dc44cc7`](https://github.com/clerk/javascript/commit/d1dc44cc771c27c95fac96e6ffa805cd6d36c3f7), [`1fd2eff38`](https://github.com/clerk/javascript/commit/1fd2eff38dc71e45d2ff95a5b6e5a99cca53c6e7), [`f540e9843`](https://github.com/clerk/javascript/commit/f540e98435c86298415552537e33164471298a5c), [`c3dccfc34`](https://github.com/clerk/javascript/commit/c3dccfc3461aafb93c45e38b5f8edad717ec1092), [`b9dd8e7c0`](https://github.com/clerk/javascript/commit/b9dd8e7c027ef2a435503aad42f7c3ac66366838), [`63ef35ec5`](https://github.com/clerk/javascript/commit/63ef35ec5d396642b64b64d77a7747758d567203)]:
  - @clerk/clerk-js@5.0.0-beta.39
  - @clerk/shared@2.0.0-beta.21
  - @clerk/clerk-react@5.0.0-beta.34

## 1.0.0-beta.38

### Patch Changes

- Updated dependencies [[`fc36e2e54`](https://github.com/clerk/javascript/commit/fc36e2e5425f52cd31e11813a6a50666149ca7ee)]:
  - @clerk/clerk-js@5.0.0-beta.38

## 1.0.0-beta.37

### Patch Changes

- Updated dependencies [[`8350109ab`](https://github.com/clerk/javascript/commit/8350109ab85909e0457199da1db0c9787d94001e)]:
  - @clerk/shared@2.0.0-beta.20
  - @clerk/clerk-js@5.0.0-beta.37
  - @clerk/clerk-react@5.0.0-beta.33

## 1.0.0-beta.36

### Patch Changes

- Updated dependencies [[`afec17953`](https://github.com/clerk/javascript/commit/afec17953d1ae4ba39ee73e4383757694375524d)]:
  - @clerk/clerk-js@5.0.0-beta.36
  - @clerk/clerk-react@5.0.0-beta.32

## 1.0.0-beta.35

### Patch Changes

- Updated dependencies [[`0d0b1d89a`](https://github.com/clerk/javascript/commit/0d0b1d89a46d2418cb05a10940f4a399cbd8ffeb), [`2684f1d5c`](https://github.com/clerk/javascript/commit/2684f1d5c9bc6067abc3dce24d5632dd8e2dc664), [`31570f138`](https://github.com/clerk/javascript/commit/31570f13888530cf55556aad032a0028b5740193), [`94bbdf7df`](https://github.com/clerk/javascript/commit/94bbdf7dfd4fad83b7c511b7e90f37aab92ab30d), [`ff803ff20`](https://github.com/clerk/javascript/commit/ff803ff206e3db40854fe6da341041125bb82226), [`1c199d1d2`](https://github.com/clerk/javascript/commit/1c199d1d2f78ee78c3b42d461b6598269f1f9ba2), [`1f650f30a`](https://github.com/clerk/javascript/commit/1f650f30a97939817b7b2f3cc6283e22dc431523), [`7d3aa44d7`](https://github.com/clerk/javascript/commit/7d3aa44d7fd6c615ab5052656ff0b63e39ee04ba), [`d9bd2b4ea`](https://github.com/clerk/javascript/commit/d9bd2b4eaaa1840daa0f310e2c6e42f4f59a4c2b), [`ef72c0ae6`](https://github.com/clerk/javascript/commit/ef72c0ae6e9194fbcb3ef8a3c8226f5a61209655), [`663243220`](https://github.com/clerk/javascript/commit/6632432208aa6ca507f33fa9ab79abaa40431be6), [`e4c0ae028`](https://github.com/clerk/javascript/commit/e4c0ae028f126185ba2a2449db563e0d59b55a09), [`ebf9be77f`](https://github.com/clerk/javascript/commit/ebf9be77f17f8880541de67f66879324f68cf6bd)]:
  - @clerk/clerk-js@5.0.0-beta.35
  - @clerk/clerk-react@5.0.0-beta.31

## 1.0.0-beta.34

### Patch Changes

- Update `expo-auth-session` dependency from 5.0.2 to 5.4.0 and `expo-web-browser` from 12.3.2 to 12.8.2 ([#2938](https://github.com/clerk/javascript/pull/2938)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`141f09fdc`](https://github.com/clerk/javascript/commit/141f09fdc897f94f3fbcdf8d10442489307e032c), [`fe6215dea`](https://github.com/clerk/javascript/commit/fe6215deaf44d35a31f760283fc6cfa451845e98), [`5db6dbb90`](https://github.com/clerk/javascript/commit/5db6dbb90dc0e5a5836ad6279787525d66eefb02)]:
  - @clerk/clerk-js@5.0.0-beta.34

## 1.0.0-beta.33

### Patch Changes

- Updated dependencies [[`097ec4872`](https://github.com/clerk/javascript/commit/097ec48722f3c909374d0754f162e9137b43213f), [`63373bf21`](https://github.com/clerk/javascript/commit/63373bf218d7e20932728f8908f90316d34dec07), [`c86f73be3`](https://github.com/clerk/javascript/commit/c86f73be382d01ec5f0ff5922ad907f429e63a58), [`e7ae9c36a`](https://github.com/clerk/javascript/commit/e7ae9c36ae66babdad79ce0185b1c6458c08a7b4), [`5dea004b1`](https://github.com/clerk/javascript/commit/5dea004b13883f3dee97ada34a744f7e536941a7), [`008ac4217`](https://github.com/clerk/javascript/commit/008ac4217bc648085b3caba92a4524c31cc0925b)]:
  - @clerk/clerk-js@5.0.0-beta.33
  - @clerk/clerk-react@5.0.0-beta.30

## 1.0.0-beta.32

### Patch Changes

- Updated dependencies [[`8350f73a6`](https://github.com/clerk/javascript/commit/8350f73a67f8980be78e3bd3343e772f5653d718)]:
  - @clerk/shared@2.0.0-beta.19
  - @clerk/clerk-js@5.0.0-beta.32
  - @clerk/clerk-react@5.0.0-beta.29

## 1.0.0-beta.31

### Patch Changes

- Updated dependencies [[`fafa76fb6`](https://github.com/clerk/javascript/commit/fafa76fb66585b5836cc79985f8bdf1d1b4dca97)]:
  - @clerk/clerk-js@5.0.0-beta.31
  - @clerk/clerk-react@5.0.0-beta.28

## 1.0.0-beta.30

### Patch Changes

- Updated dependencies [[`e5c989a03`](https://github.com/clerk/javascript/commit/e5c989a035fa16413414c213febe16fcdbeef9b1), [`98b194b2a`](https://github.com/clerk/javascript/commit/98b194b2a9ac08e7633d320e1d933b94dcb11295), [`2ec9f6b09`](https://github.com/clerk/javascript/commit/2ec9f6b09f98ae276658d6dc705e16df0573d817), [`2f6306fd3`](https://github.com/clerk/javascript/commit/2f6306fd365e0f0166ed137b314814333f43e67f), [`f02482bb5`](https://github.com/clerk/javascript/commit/f02482bb570cc7e32102d3e696bf10c01054ce04)]:
  - @clerk/shared@2.0.0-beta.18
  - @clerk/clerk-js@5.0.0-beta.30
  - @clerk/clerk-react@5.0.0-beta.27

## 1.0.0-beta.29

### Patch Changes

- Updated dependencies [[`18c0d015d`](https://github.com/clerk/javascript/commit/18c0d015d20493e14049fed73a5b6f732372a5cf)]:
  - @clerk/clerk-js@5.0.0-beta.29
  - @clerk/clerk-react@5.0.0-beta.26

## 1.0.0-beta.28

### Patch Changes

- Updated dependencies [[`9dc46b2c1`](https://github.com/clerk/javascript/commit/9dc46b2c1e0c6046bd3f1c840d63bf59aa91d14e), [`046224177`](https://github.com/clerk/javascript/commit/046224177ef36a7951356c1c0e5808b5c8387727), [`79040966f`](https://github.com/clerk/javascript/commit/79040966f22508581e28f53a6c9e6698fe40c390)]:
  - @clerk/clerk-js@5.0.0-beta.28
  - @clerk/clerk-react@5.0.0-beta.25

## 1.0.0-beta.27

### Patch Changes

- Updated dependencies [[`1834a3ee4`](https://github.com/clerk/javascript/commit/1834a3ee496ea27b9f7ceeb32ec5361f9de8ee30)]:
  - @clerk/shared@2.0.0-beta.17
  - @clerk/clerk-js@5.0.0-beta.27
  - @clerk/clerk-react@5.0.0-beta.24

## 1.0.0-beta.26

### Patch Changes

- Updated dependencies [[`db18787c4`](https://github.com/clerk/javascript/commit/db18787c4d9fa8ee1306db9b65f3b3f5e2fe2dad)]:
  - @clerk/shared@2.0.0-beta.16
  - @clerk/clerk-js@5.0.0-beta.26
  - @clerk/clerk-react@5.0.0-beta.23

## 1.0.0-beta.25

### Patch Changes

- Updated dependencies [[`6eab66050`](https://github.com/clerk/javascript/commit/6eab66050608a1bc5cb9aca6a234b1fea16106e5)]:
  - @clerk/shared@2.0.0-beta.15
  - @clerk/clerk-js@5.0.0-beta.25
  - @clerk/clerk-react@5.0.0-beta.22

## 1.0.0-beta.24

### Patch Changes

- Updated dependencies [[`12f3c5c55`](https://github.com/clerk/javascript/commit/12f3c5c55580f93a81df27851fbc92ce1312107e)]:
  - @clerk/clerk-js@5.0.0-beta.24
  - @clerk/shared@2.0.0-beta.14
  - @clerk/clerk-react@5.0.0-beta.21

## 1.0.0-beta.23

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@5.0.0-beta.23
  - @clerk/clerk-react@5.0.0-beta.20

## 1.0.0-beta.22

### Patch Changes

- Rename beta-v5 to beta by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`2de442b24`](https://github.com/clerk/javascript/commit/2de442b2465cc5d424b8a0b21aa57c557f3aa2e7), [`73849836f`](https://github.com/clerk/javascript/commit/73849836f2df88a44fbc0ad7ac994498b9709ed5), [`45c92006c`](https://github.com/clerk/javascript/commit/45c92006cbc7f55810fd1ba9b3c30a1743de57dd)]:
  - @clerk/clerk-js@5.0.0-beta.22
  - @clerk/clerk-react@5.0.0-beta.19
  - @clerk/shared@2.0.0-beta.13

## 1.0.0-beta-v5.21

### Patch Changes

- Updated dependencies [[`6ac9e717a`](https://github.com/clerk/javascript/commit/6ac9e717a7ce8f09c1604f324add5e7e02041c07), [`6c2d88ee8`](https://github.com/clerk/javascript/commit/6c2d88ee8412aaa73ee78dd47d32ddaca2c9bb67), [`7466fa505`](https://github.com/clerk/javascript/commit/7466fa505a1dde91d28bd41d6456304d68a7c472), [`ee57f21ac`](https://github.com/clerk/javascript/commit/ee57f21ac62fc2dd0d9d68b965f35081b538c85e), [`9737ef510`](https://github.com/clerk/javascript/commit/9737ef5104346821461972d31f3c69e93924f0e0), [`0ee1777e0`](https://github.com/clerk/javascript/commit/0ee1777e030916ad5111f0f817c71ff5a78a8ed6), [`8b466a9ba`](https://github.com/clerk/javascript/commit/8b466a9ba93ca10315b534079b09fa5d76ffa305), [`1affbb22a`](https://github.com/clerk/javascript/commit/1affbb22a040e210cfce8f72d52b7961057c02d1), [`8daf8451c`](https://github.com/clerk/javascript/commit/8daf8451cb564bc834dd856174ffc2cdfa932e37), [`7f751c4ef`](https://github.com/clerk/javascript/commit/7f751c4ef2d14410058cf65ea984a93b50c0b87e), [`aaa457097`](https://github.com/clerk/javascript/commit/aaa457097da641d9ad7b3d086217f9fb4f5d42c5), [`be991365e`](https://github.com/clerk/javascript/commit/be991365e1c78d0f1dfc59bb33dd533b6fad223a), [`5d6937c9f`](https://github.com/clerk/javascript/commit/5d6937c9f952f5dc586439b7fcf053abc9fcf320), [`750337633`](https://github.com/clerk/javascript/commit/750337633a07bf3bb92d015f558ead2bfdca8613), [`11fbfdeec`](https://github.com/clerk/javascript/commit/11fbfdeec6aa609d02d23d997b319c94793e452f)]:
  - @clerk/clerk-react@5.0.0-beta-v5.18
  - @clerk/clerk-js@5.0.0-beta-v5.21
  - @clerk/shared@2.0.0-beta-v5.12

## 1.0.0-beta-v5.20

### Patch Changes

- Updated dependencies [[`4063bd8e9`](https://github.com/clerk/javascript/commit/4063bd8e97b1cd3583473cd718627685fc187206)]:
  - @clerk/clerk-js@5.0.0-beta-v5.20

## 1.0.0-beta-v5.19

### Patch Changes

- Updated dependencies [[`0a108ae3b`](https://github.com/clerk/javascript/commit/0a108ae3ba9bb7eaef9b9b681b98ab02880d9df3), [`b6c4e1cfe`](https://github.com/clerk/javascript/commit/b6c4e1cfe37c7bfb084c232c4920201922cbc04f), [`d4ff346dd`](https://github.com/clerk/javascript/commit/d4ff346dd53bb3e1970e80bdc7b188c2dd344f12), [`7886ba89d`](https://github.com/clerk/javascript/commit/7886ba89d76bfea2d6882a46baf64bf98f1148d3), [`7b40924e4`](https://github.com/clerk/javascript/commit/7b40924e4c8d66532cbcdc4c399f81dcfa9dd566)]:
  - @clerk/clerk-js@5.0.0-beta-v5.19
  - @clerk/shared@2.0.0-beta-v5.11
  - @clerk/clerk-react@5.0.0-beta-v5.17

## 1.0.0-alpha-v5.18

### Patch Changes

- Updated dependencies [[`9e99eb727`](https://github.com/clerk/javascript/commit/9e99eb7276249c68ef6f930cce418ce0004653b9), [`491fba5ad`](https://github.com/clerk/javascript/commit/491fba5adc4dad131c2cd709faa5024f767f3e9d), [`8b261add2`](https://github.com/clerk/javascript/commit/8b261add294bd4de80e7138c9ff58708cf6cd908), [`6fd303b99`](https://github.com/clerk/javascript/commit/6fd303b99b068d2458efd0616b2c5334248acc3f)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.18

## 1.0.0-alpha-v5.17

### Patch Changes

- Updated dependencies [[`434a96ebe`](https://github.com/clerk/javascript/commit/434a96ebefc550b726b417788b7bae9e41791408), [`6a769771c`](https://github.com/clerk/javascript/commit/6a769771c975996d8d52b35b5cfdbae5dcec85d4)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.17

## 1.0.0-alpha-v5.16

### Patch Changes

- Updated dependencies [[`8cc45d2af`](https://github.com/clerk/javascript/commit/8cc45d2af98320ccced3768fb039b86576e424a5), [`db2d82901`](https://github.com/clerk/javascript/commit/db2d829013722957332bcf03928685a4771f9a3c)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.16
  - @clerk/clerk-react@5.0.0-alpha-v5.16
  - @clerk/shared@2.0.0-alpha-v5.10

## 1.0.0-alpha-v5.15

### Minor Changes

- Include new headers in requests; ([#2528](https://github.com/clerk/javascript/pull/2528)) by [@thiskevinwang](https://github.com/thiskevinwang)

  Added `expo-application >=5` & `expo-constants >=14` peer deps

### Patch Changes

- Updated dependencies [[`fbbb1afc2`](https://github.com/clerk/javascript/commit/fbbb1afc20a96aa7e5b7e8adf1f2be8a08b094cc), [`57e0972bb`](https://github.com/clerk/javascript/commit/57e0972bbffdb60bbc620d6efcfbff028105a740), [`e9841dd91`](https://github.com/clerk/javascript/commit/e9841dd91897a7ebb468b14e272ce06154795389), [`59f9a7296`](https://github.com/clerk/javascript/commit/59f9a72968fb49add6d9031158c791ac60a161b9)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.15
  - @clerk/clerk-react@5.0.0-alpha-v5.15

## 1.0.0-alpha-v5.14

### Patch Changes

- Updated dependencies [[`1dc28ab46`](https://github.com/clerk/javascript/commit/1dc28ab46f6930074334be183c637ce7a81bebf7), [`ea4933655`](https://github.com/clerk/javascript/commit/ea4933655863ce315324aa2a3be7d5f263c2b61f), [`846a4c24d`](https://github.com/clerk/javascript/commit/846a4c24d6bf6a88356ce44677aa79ddbe0e02e4), [`38d8b3e8a`](https://github.com/clerk/javascript/commit/38d8b3e8a0387bcf0b9c8d16e3bbfcfe9b643ca2)]:
  - @clerk/shared@2.0.0-alpha-v5.9
  - @clerk/clerk-js@5.0.0-alpha-v5.14
  - @clerk/clerk-react@5.0.0-alpha-v5.14

## 1.0.0-alpha-v5.13

### Patch Changes

- Updated dependencies [[`23ebc89e9`](https://github.com/clerk/javascript/commit/23ebc89e95f99639985a1336c9c04d09cc7cf47c), [`7ecd6f6ab`](https://github.com/clerk/javascript/commit/7ecd6f6abb0e5bfb1a57c99cc11860de311c3e82), [`9040549d6`](https://github.com/clerk/javascript/commit/9040549d6a86b07f5d2f7a2c494358b8dccf4e78)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.13
  - @clerk/shared@2.0.0-alpha-v5.8
  - @clerk/clerk-react@5.0.0-alpha-v5.13

## 1.0.0-alpha-v5.12

### Patch Changes

- Updated dependencies [[`cfea3d9c0`](https://github.com/clerk/javascript/commit/cfea3d9c00950eee8d7e942d88bee1a56a5f842b), [`d18cae5fd`](https://github.com/clerk/javascript/commit/d18cae5fd9ba80d9e396b433ea5e21b27bfdaf59), [`394cecc6b`](https://github.com/clerk/javascript/commit/394cecc6b9a753f9eb7cce9a5d8b2d86a3c671df), [`fe2607b6f`](https://github.com/clerk/javascript/commit/fe2607b6fdeed83002db7e4a0c040ac0280e5ff7), [`2e4a43017`](https://github.com/clerk/javascript/commit/2e4a43017ef33b541949ba90e16bf5311ce8bc60), [`f5fb63cf1`](https://github.com/clerk/javascript/commit/f5fb63cf1dd51cd6cd0dba4d9eef871695ef06c3), [`bf09d18d6`](https://github.com/clerk/javascript/commit/bf09d18d6408ac89f8b9207d05e0f3660d27a6cf)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.12
  - @clerk/clerk-react@5.0.0-alpha-v5.12

## 1.0.0-alpha-v5.11

### Patch Changes

- Updated dependencies [[`2a67f729d`](https://github.com/clerk/javascript/commit/2a67f729da58b3400df24da634fc4bf786065f25), [`e7414cb3f`](https://github.com/clerk/javascript/commit/e7414cb3f34c76b785ff3147fc5f609a48466111), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e)]:
  - @clerk/clerk-react@5.0.0-alpha-v5.11
  - @clerk/clerk-js@5.0.0-alpha-v5.11
  - @clerk/shared@2.0.0-alpha-v5.7

## 1.0.0-alpha-v5.10

### Major Changes

- - Introduce `@clerk/clerk-react/errors` and `@clerk/clerk-react/internal` subpath exports to expose some internal utilities. Eg ([#2328](https://github.com/clerk/javascript/pull/2328)) by [@dimkl](https://github.com/dimkl)

    ```typescript
    // Before
    import { __internal__setErrorThrowerOptions } from '@clerk/clerk-react';
    // After
    import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';

    // Before
    import { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react';
    // After
    import {
      isClerkAPIResponseError,
      isEmailLinkError,
      isKnownError,
      isMetamaskError,
    } from '@clerk/clerk-react/errors';

    // Before
    import { MultisessionAppSupport } from '@clerk/clerk-react';
    // After
    import { MultisessionAppSupport } from '@clerk/clerk-react/internal';
    ```

  - Drop from the `@clerk/clerk-react` and all other clerk-react wrapper packages:
    - `__internal__setErrorThrowerOptions` internal utility (moved to /internal subpath)
    - `WithClerkProp` type
    - `MultisessionAppSupport` component (moved to /internal subpath)
    - `EmailLinkErrorCode` enum
  - Drop `StructureContext` and related errors to reduce to reduce code complexity since it seems that it was not being used.
  - Drop `withUser`, `WithUser`, `withClerk` HOFs and `WithClerk`, `withSession`, `WithSession` HOCs from the `@clerk/clerk-react`
    to reduce the export surface since it's trivial to implement if needed.

### Patch Changes

- Updated dependencies [[`69ce3e185`](https://github.com/clerk/javascript/commit/69ce3e185b89283956cb711629bc61703166b1c9), [`896cb6104`](https://github.com/clerk/javascript/commit/896cb610409f84c0ff7a4f502f0b4ccee1afc157), [`8aea39cd6`](https://github.com/clerk/javascript/commit/8aea39cd6907e3a8ac01091aa6df64ebd6a42ed2), [`ab4eb56a5`](https://github.com/clerk/javascript/commit/ab4eb56a5c34baf496ebb8ac412ad6171b9bd79c), [`46040a2f3`](https://github.com/clerk/javascript/commit/46040a2f34d0991072fca490e031c1994b2e2296), [`75ea300bc`](https://github.com/clerk/javascript/commit/75ea300bce16a0ce401a225263bb267ad2a217b8), [`844847e0b`](https://github.com/clerk/javascript/commit/844847e0becf20243fba3c659b2b77a238dd270a)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.10
  - @clerk/shared@2.0.0-alpha-v5.6
  - @clerk/clerk-react@5.0.0-alpha-v5.10

## 1.0.0-alpha-v5.9

### Patch Changes

- Updated dependencies [[`d08d96971`](https://github.com/clerk/javascript/commit/d08d9697120508737c7026b21f61a9d9b16fbb1f), [`7bffc47cb`](https://github.com/clerk/javascript/commit/7bffc47cb71a2c3e026df5977c25487bfd5c55d7), [`30dfdf2aa`](https://github.com/clerk/javascript/commit/30dfdf2aac9167c7d65298595291e4a53459555e), [`445026ab7`](https://github.com/clerk/javascript/commit/445026ab7ab4a31e331c30e2fb251d0db0e6064b)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.9
  - @clerk/clerk-react@5.0.0-alpha-v5.9

## 1.0.0-alpha-v5.8

### Patch Changes

- Set correct information on required Node.js and React versions in README ([#2264](https://github.com/clerk/javascript/pull/2264)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`2e77cd737`](https://github.com/clerk/javascript/commit/2e77cd737a333de022533d29cb12e73a907694c8), [`6a33709cc`](https://github.com/clerk/javascript/commit/6a33709ccf48586f1a8b62216688ea300b7b5dfb), [`d30ea1faa`](https://github.com/clerk/javascript/commit/d30ea1faa45074e09c037530e8ba3ca2dbd50654), [`920c9e1b5`](https://github.com/clerk/javascript/commit/920c9e1b5d091472bce0ff00e410b3d79c88d930), [`0551488fb`](https://github.com/clerk/javascript/commit/0551488fb67fc6ec117e8d19796094c4601013d2)]:
  - @clerk/clerk-react@5.0.0-alpha-v5.8
  - @clerk/clerk-js@5.0.0-alpha-v5.8
  - @clerk/shared@2.0.0-alpha-v5.5

## 1.0.0-alpha-v5.7

### Minor Changes

- Use `base-64` package for Expo instead of the isomorphic from `@clerk/shared` due to errors about `Maximum call stack size exceeded` on `global.Buffer` ([#2230](https://github.com/clerk/javascript/pull/2230)) by [@octoper](https://github.com/octoper)

### Patch Changes

- Updated dependencies [[`4b8bedc66`](https://github.com/clerk/javascript/commit/4b8bedc66d47dca5c6192148f4b31ae6d49ff733), [`c776f86fb`](https://github.com/clerk/javascript/commit/c776f86fb2a999dcae46fda9abb5005718c354b2), [`6e54b1b59`](https://github.com/clerk/javascript/commit/6e54b1b590ccdbc7002bde151093d78c217de391), [`c9e0f68af`](https://github.com/clerk/javascript/commit/c9e0f68af1a5cf07dc373ff45999c72d3d86f8f9), [`d6a7ea61a`](https://github.com/clerk/javascript/commit/d6a7ea61a8ae64c93877ec117e54fc48b1c86f16)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.7
  - @clerk/shared@2.0.0-alpha-v5.4
  - @clerk/clerk-react@5.0.0-alpha-v5.7

## 1.0.0-alpha-v5.6

### Patch Changes

- Updated dependencies [[`5aab9f04a`](https://github.com/clerk/javascript/commit/5aab9f04a1eac39e42a03f555075e08a5a8ee02c), [`9a1fe3728`](https://github.com/clerk/javascript/commit/9a1fe37289c7606dc111913cb9f70f2a2efff6b7)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.6
  - @clerk/clerk-react@5.0.0-alpha-v5.6

## 1.0.0-alpha-v5.5

### Patch Changes

- Updated dependencies [[`043801f2a`](https://github.com/clerk/javascript/commit/043801f2ae9447fb1bb8c9bb08869d3c59cd8419), [`12962bc58`](https://github.com/clerk/javascript/commit/12962bc58e2c9caad416ba4e6d52061d00bc2feb)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.5
  - @clerk/clerk-react@5.0.0-alpha-v5.5

## 1.0.0-alpha-v5.4

### Patch Changes

- Updated dependencies [[`e214450e9`](https://github.com/clerk/javascript/commit/e214450e9a35c2006fa6b1cbe4c8df24f4a44959), [`7f6a64f43`](https://github.com/clerk/javascript/commit/7f6a64f4335832c66ff355f6d2f311f33a313d59), [`dd49f93da`](https://github.com/clerk/javascript/commit/dd49f93dadd65924c48b48de57c4b40e84203aea), [`676d23a59`](https://github.com/clerk/javascript/commit/676d23a5924f020812574c3c1df57645f659ce0e), [`d941b902f`](https://github.com/clerk/javascript/commit/d941b902f8c8230d1795eb44c7564498ee840a66)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.4
  - @clerk/clerk-react@5.0.0-alpha-v5.4

## 1.0.0-alpha-v5.3

### Major Changes

- Upgrade React version to >=18 and add react-dom as peer dependency ([#2164](https://github.com/clerk/javascript/pull/2164)) by [@dimkl](https://github.com/dimkl)

  to fix issues with vite & rollup building.

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

### Patch Changes

- Updated dependencies [[`52ff8fe6b`](https://github.com/clerk/javascript/commit/52ff8fe6b6ff88ceb5e1246378b54b0565bede9d), [`4bb57057e`](https://github.com/clerk/javascript/commit/4bb57057e9af20fc433626ed178d97d3ca811362), [`9955938d6`](https://github.com/clerk/javascript/commit/9955938d63e6c9a6fd0488060d587a059768388a), [`40ac4b645`](https://github.com/clerk/javascript/commit/40ac4b645f449b546dae5b4c0d013c9d9ea6d09c), [`429d030f7`](https://github.com/clerk/javascript/commit/429d030f7b6efe838a1e7fec7f736ba59fcc6b61)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.3
  - @clerk/shared@2.0.0-alpha-v5.3
  - @clerk/clerk-react@5.0.0-alpha-v5.3

## 1.0.0-alpha-v5.2

### Major Changes

- Change the minimal Node.js version required by Clerk to `18.17.0`. ([#2162](https://github.com/clerk/javascript/pull/2162)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`c2a090513`](https://github.com/clerk/javascript/commit/c2a0905132684a4a1e8d598b66caddf20062273e)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.2
  - @clerk/shared@2.0.0-alpha-v5.2
  - @clerk/clerk-react@5.0.0-alpha-v5.2

## 1.0.0-alpha-v5.1

### Major Changes

- Drop default exports from all packages. Migration guide: ([#2150](https://github.com/clerk/javascript/pull/2150)) by [@dimkl](https://github.com/dimkl)

  - use `import { Clerk } from '@clerk/backend';`
  - use `import { clerkInstance } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-js';`
  - use `import { Clerk } from '@clerk/clerk-js/headless';`
  - use `import { IsomorphicClerk } from '@clerk/clerk-react'`

- Drop deprecations. Migration steps: ([#2082](https://github.com/clerk/javascript/pull/2082)) by [@dimkl](https://github.com/dimkl)

  - use `publishableKey` instead of `frontendApi`
  - use `Clerk.handleEmailLinkVerification()` instead of `Clerk.handleMagicLinkVerification()`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`
  - drop `orgs` jwt claim from session token
  - use `ExternalAccount.imageUrl` instead of `ExternalAccount.avatarUrl`
  - use `Organization.imageUrl` instead of `Organization.logoUrl`
  - use `User.imageUrl` instead of `User.profileImageUrl`
  - use `OrganizationMembershipPublicUserData.imageUrl` instead of `OrganizationMembershipPublicUserData.profileImageUrl`
  - use `useOrganizationList` instead of `useOrganizations`
  - use `userProfileProps` instead of `userProfile` in `Appearance`
  - use `Clerk.setActive()` instead of `Clerk.setSession()`
  - drop `password` param in `User.update()`
  - use `afterSelectOrganizationUrl` instead of `afterSwitchOrganizationUrl` in `OrganizationSwitcher`
  - drop `Clerk.experimental_canUseCaptcha` / `Clerk.Clerk.experimental_captchaSiteKey` / `Clerk.experimental_captchaURL` (were meant for internal use)
  - use `User.getOrganizationMemberships()` instead of `Clerk.getOrganizationMemberships()`
  - drop `lastOrganizationInvitation` / `lastOrganizationMember` from Clerk emitted events
  - drop `Clerk.__unstable__invitationUpdate` / `Clerk.__unstable__membershipUpdate`
  - drop support for string param in `Organization.create()`
  - use `Organization.getInvitations()` instead of `Organization.getPendingInvitations()`
  - use `pageSize` instead of `limit` in `OrganizationMembership.retrieve()`
  - use `initialPage` instead of `offset` in `OrganizationMembership.retrieve()`
  - drop `lastOrganizationInvitation` / `lastOrganizationMember` from ClerkProvider
  - use `invitations` instead of `invitationList` in `useOrganization`
  - use `memberships` instead of `membershipList` in `useOrganization`
  - use `redirectUrl` instead of `redirect_url` in `User.createExternalAccount()`
  - use `signature` instead of `generatedSignature` in `Signup.attemptWeb3WalletVerification()`

### Patch Changes

- Updated dependencies [[`1ddffb67e`](https://github.com/clerk/javascript/commit/1ddffb67e90c3a784d1616814d86f43d2c8b7de0), [`64d3763ec`](https://github.com/clerk/javascript/commit/64d3763ec73747ad04c4b47017195cf4114e150c), [`deac67c1c`](https://github.com/clerk/javascript/commit/deac67c1c40d6d3ccc3559746c0c31cc29a93b84), [`034abeb76`](https://github.com/clerk/javascript/commit/034abeb762744c4948ef6600b21cd9dd68d165a8), [`83e9d0846`](https://github.com/clerk/javascript/commit/83e9d08469e7c2840f06aa7d86831055e23f67a5), [`08dd88c4a`](https://github.com/clerk/javascript/commit/08dd88c4a829afd8c4fee48b9a31a39162381761), [`5f49568f6`](https://github.com/clerk/javascript/commit/5f49568f6e345ce63b15a4c301fc81c3af30211a), [`e400fa9e3`](https://github.com/clerk/javascript/commit/e400fa9e33b44e28a18bee416267a75cdc3ae3cb), [`7f833da9e`](https://github.com/clerk/javascript/commit/7f833da9ebc1b2ec9c65513628c377d0584e5d72), [`9e10d577e`](https://github.com/clerk/javascript/commit/9e10d577e2a4b9b2cbf8b3272d6e58f4627ae922), [`27052469e`](https://github.com/clerk/javascript/commit/27052469e89558c57bfd19466a11b47bdb3a4d38), [`492b8a7b1`](https://github.com/clerk/javascript/commit/492b8a7b12f14658a384566012e5807f0a171710), [`d005992e0`](https://github.com/clerk/javascript/commit/d005992e0514970730d2f516a99bf20fcfac47f7), [`2a22aade8`](https://github.com/clerk/javascript/commit/2a22aade8c9bd1f83a9be085983f96fa87903804), [`f77e8cdbd`](https://github.com/clerk/javascript/commit/f77e8cdbd24411f7f9dbfdafcab0596c598f66c1), [`b0ca7b801`](https://github.com/clerk/javascript/commit/b0ca7b801f77210e78a33e7023fb671120f1cfc3), [`d1b524ffb`](https://github.com/clerk/javascript/commit/d1b524ffba0be0cd683e6ace85b91b382ad442bb), [`db3eefe8c`](https://github.com/clerk/javascript/commit/db3eefe8c0fc04ce1de47610dc23769a18f1629c), [`0d1052ac2`](https://github.com/clerk/javascript/commit/0d1052ac284b909786fd0e4744b02fcf4d1a8be6), [`5471c7e8d`](https://github.com/clerk/javascript/commit/5471c7e8dd0155348748fa90e5ae97093f59efe9), [`477170962`](https://github.com/clerk/javascript/commit/477170962f486fd4e6b0653a64826573f0d8621b), [`59336d3d4`](https://github.com/clerk/javascript/commit/59336d3d468edd205c0e5501b7d5046611ee217d), [`e0e79b4fe`](https://github.com/clerk/javascript/commit/e0e79b4fe47f64006718d547c898b9f67fe4d424), [`3c4209068`](https://github.com/clerk/javascript/commit/3c42090688166b74badfdefc7ed8c428601a0ba7)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.1
  - @clerk/shared@2.0.0-alpha-v5.1
  - @clerk/clerk-react@5.0.0-alpha-v5.1

## 1.0.0-alpha-v5.0

### Major Changes

- Internal update default apiUrl domain from clerk.dev to clerk.com ([#1878](https://github.com/clerk/javascript/pull/1878)) by [@dimkl](https://github.com/dimkl)

- Drop deprecations. Migration steps: ([#1991](https://github.com/clerk/javascript/pull/1991)) by [@dimkl](https://github.com/dimkl)

  - use `CLERK_PUBLISHABLE_KEY` instead of `CLERK_FRONTEND_API` env variable
  - use `publishableKey` instead of `frontendApi`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`

- Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`743c4d204`](https://github.com/clerk/javascript/commit/743c4d20423790b554e66923466081c0d3b0d9ed), [`3ba3f383b`](https://github.com/clerk/javascript/commit/3ba3f383bbe12d26de51118608e9e932e58479e7), [`d37d44a68`](https://github.com/clerk/javascript/commit/d37d44a68e83b8e895963415f000c1aaef66e87e), [`791c49807`](https://github.com/clerk/javascript/commit/791c49807c3c9e19964cbf621c935d237caeecf3), [`8b40dc7a3`](https://github.com/clerk/javascript/commit/8b40dc7a328d790b443a9a64401f895093d6b24b), [`a68eb3083`](https://github.com/clerk/javascript/commit/a68eb3083ff68459cd33098e2df190a5ba26c841), [`0293f29c8`](https://github.com/clerk/javascript/commit/0293f29c855c9415b54867196e8d727d1614e4ca), [`ef2325dcc`](https://github.com/clerk/javascript/commit/ef2325dcc18729e9ce9ee5823e9a963efa51dbc1), [`71663c568`](https://github.com/clerk/javascript/commit/71663c568926b1d60b97aa7ccc5298d05b618af2), [`d65d36fc6`](https://github.com/clerk/javascript/commit/d65d36fc6d51f33994c4430270db0a4c0e699f4d), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`ae3a6683a`](https://github.com/clerk/javascript/commit/ae3a6683aa1a28e5201325463e4211229b641711), [`78fc5eec0`](https://github.com/clerk/javascript/commit/78fc5eec0d61c14d86204944c6aa9f341ae6ea98), [`4edb77632`](https://github.com/clerk/javascript/commit/4edb7763271b80d93fcd52ece5f1e408bd75df6f), [`c7e6d00f5`](https://github.com/clerk/javascript/commit/c7e6d00f56e73df4ed87712e74ad9d5bcaca8924), [`797e327e0`](https://github.com/clerk/javascript/commit/797e327e05ce6bd23320555a9e7d6fadbd9d624f), [`4edb77632`](https://github.com/clerk/javascript/commit/4edb7763271b80d93fcd52ece5f1e408bd75df6f), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`7644b7472`](https://github.com/clerk/javascript/commit/7644b74726ba73e615a1256f9ff3fa03b0f8bc30), [`9e57e94d2`](https://github.com/clerk/javascript/commit/9e57e94d25b96c11889f49e7e4d4827e5134927d), [`93a611570`](https://github.com/clerk/javascript/commit/93a611570b836fc9bd50eed973e76cf8d413963d), [`f5d55bb1f`](https://github.com/clerk/javascript/commit/f5d55bb1fc6a87303fb8bf461c3a917ae4da4005), [`41ae1d2f0`](https://github.com/clerk/javascript/commit/41ae1d2f006a0e4657a97a9c83ae7eb0cc167834), [`9c6411aa8`](https://github.com/clerk/javascript/commit/9c6411aa8a551079ee3f15b36868a65e0c76f87f), [`6f755addd`](https://github.com/clerk/javascript/commit/6f755addd0886b9ff8b0d5dbe48e37470049acad)]:
  - @clerk/shared@2.0.0-alpha-v5.0
  - @clerk/clerk-js@5.0.0-alpha-v5.0
  - @clerk/clerk-react@5.0.0-alpha-v5.0

## 0.19.12

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`3bf64107e`](https://github.com/clerk/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`52f8553d2`](https://github.com/clerk/javascript/commit/52f8553d22f9454ee1194fd162410db15da7a4be), [`89932e1b3`](https://github.com/clerk/javascript/commit/89932e1b32723479541ab2ba4cc87e3973b5ef85), [`92727eec3`](https://github.com/clerk/javascript/commit/92727eec39566278263ffa118a085493f964eb94), [`b09b66eec`](https://github.com/clerk/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerk/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62), [`37d8856ba`](https://github.com/clerk/javascript/commit/37d8856babb9db8edf763455172c4d22d6035036), [`aa4cd7615`](https://github.com/clerk/javascript/commit/aa4cd761585b888706a36a6eed7436a8f0476dbf)]:
  - @clerk/clerk-js@4.63.0
  - @clerk/shared@1.0.0
  - @clerk/clerk-react@4.27.0

## 0.19.11

### Patch Changes

- Updated dependencies [[`d78bd8464`](https://github.com/clerk/javascript/commit/d78bd846486b999dd006b85c0ddf0f6695028b20), [`112b90bea`](https://github.com/clerk/javascript/commit/112b90bea703a4338970d29532b9119dcaf591a7), [`ec10f673e`](https://github.com/clerk/javascript/commit/ec10f673ea220b2635b690ee342e0c3f32cfaf5c), [`9ca215702`](https://github.com/clerk/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11), [`21f61ce1d`](https://github.com/clerk/javascript/commit/21f61ce1da8cad98ed12a98379a6d6c99c39b5ba)]:
  - @clerk/clerk-js@4.62.1
  - @clerk/clerk-react@4.26.6

## 0.19.10

### Patch Changes

- Updated dependencies [[`da450b5e1`](https://github.com/clerk/javascript/commit/da450b5e15326faeb873aa32f42b36afb1092bd1), [`35be8709d`](https://github.com/clerk/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`e38488c92`](https://github.com/clerk/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerk/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`9b644d799`](https://github.com/clerk/javascript/commit/9b644d7991b8cba4b385e9443f87798cde5c9989), [`a9894b445`](https://github.com/clerk/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`e67fcfe19`](https://github.com/clerk/javascript/commit/e67fcfe1984ad619d1cc26654e4b594ba47d02c3), [`81b63e320`](https://github.com/clerk/javascript/commit/81b63e320ba5e828e2893e76b041a737a891ed7d), [`834dadb36`](https://github.com/clerk/javascript/commit/834dadb36c30b2a8f052784de4ad1026b0083b4e), [`29485ebd8`](https://github.com/clerk/javascript/commit/29485ebd8184f4b3b92554c9360998971568e352), [`8000e3a3f`](https://github.com/clerk/javascript/commit/8000e3a3f41052e97ceebb5b31222687e158d7e8), [`e1e5d37d4`](https://github.com/clerk/javascript/commit/e1e5d37d480d56b8cb2fce8d335db87a127f2130), [`70f251007`](https://github.com/clerk/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`8434782c5`](https://github.com/clerk/javascript/commit/8434782c53147e4e3333746fd6096212dfcaa51d), [`393115678`](https://github.com/clerk/javascript/commit/393115678fa1b659bd6708a0cdc54143e1ec983c), [`a46d6fe99`](https://github.com/clerk/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/clerk-js@4.62.0
  - @clerk/shared@0.24.5
  - @clerk/clerk-react@4.26.5

## 0.19.9

### Patch Changes

- Warn about environment variables deprecations: ([#1859](https://github.com/clerk/javascript/pull/1859)) by [@dimkl](https://github.com/dimkl)

  - `CLERK_API_KEY`
  - `CLERK_FRONTEND_API`
  - `NEXT_PUBLIC_CLERK_FRONTEND_API`

- Introduce a new property on the core Clerk singleton, `sdkMetadata`. This will be populated by each host SDK. This metadata will be used to make logging and debugging easier. ([#1857](https://github.com/clerk/javascript/pull/1857)) by [@BRKalow](https://github.com/BRKalow)

- Introduce new `*EmailLink*` helpers that will replace the `*MagicLink*` helpers. ([#1833](https://github.com/clerk/javascript/pull/1833)) by [@dimkl](https://github.com/dimkl)

  Also marked all the `*MagicLink*` as deprecated using JSDocs.

- Updated dependencies [[`977336f79`](https://github.com/clerk/javascript/commit/977336f793cd4ce5984f98dac3cedf9f5ec363f5), [`f20adc357`](https://github.com/clerk/javascript/commit/f20adc357cd9fd34cedb4cc7aac2df4be77fb8ea), [`c04ad94b1`](https://github.com/clerk/javascript/commit/c04ad94b1dd58fe4b59333b76a3988b1811d5cc2), [`997b8e256`](https://github.com/clerk/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91e9a55f4`](https://github.com/clerk/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`25cfa7ae8`](https://github.com/clerk/javascript/commit/25cfa7ae8ad35bad6f3ca18af8ce876ddc0219f9), [`c9b17f5a7`](https://github.com/clerk/javascript/commit/c9b17f5a72cb27786cfc7f1fb42be1233fb10d5c), [`997b8e256`](https://github.com/clerk/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91014880d`](https://github.com/clerk/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`5a3995b38`](https://github.com/clerk/javascript/commit/5a3995b38b214f376af95b53959554c80aed7dc4), [`7f4d4b942`](https://github.com/clerk/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b), [`f6faf6fda`](https://github.com/clerk/javascript/commit/f6faf6fdadef9ca8ce0e98e3da40437f43c411ad)]:
  - @clerk/clerk-js@4.61.0
  - @clerk/shared@0.24.4
  - @clerk/clerk-react@4.26.4

## 0.19.8

### Patch Changes

- Updated dependencies [[`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1e212c19d`](https://github.com/clerk/javascript/commit/1e212c19d1cbfbcf6bc6718f5aec0a3cb893b96f), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679)]:
  - @clerk/clerk-react@4.26.3
  - @clerk/clerk-js@4.60.1

## 0.19.7

### Patch Changes

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerk/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`164f3aac7`](https://github.com/clerk/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerk/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerk/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`0636ff779`](https://github.com/clerk/javascript/commit/0636ff7799e126d1438d2738ce0e46c3b277f46a), [`2e9be8461`](https://github.com/clerk/javascript/commit/2e9be8461f65004c920e359abbf69ef516ff0aa6), [`71bb1c7b5`](https://github.com/clerk/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf), [`e592565e0`](https://github.com/clerk/javascript/commit/e592565e0d7707626587f5e0ae7fb7279c84f050), [`19b3aea45`](https://github.com/clerk/javascript/commit/19b3aea451dd57950f80f2d393598d33638f1398)]:
  - @clerk/clerk-js@4.60.0
  - @clerk/clerk-react@4.26.2

## 0.19.6

### Patch Changes

- Updated dependencies [[`a0b25671c`](https://github.com/clerk/javascript/commit/a0b25671cdee39cd0c2fca832b8c378fd445ec39), [`d1ad5ac37`](https://github.com/clerk/javascript/commit/d1ad5ac373ff2ff66450afc74aeba9b26fc133ce)]:
  - @clerk/clerk-react@4.26.1
  - @clerk/clerk-js@4.59.1

## 0.19.5

### Patch Changes

- Updated dependencies [[`f3f643163`](https://github.com/clerk/javascript/commit/f3f643163a6163d89d3e3407358739d49db8b7f7), [`cc8851765`](https://github.com/clerk/javascript/commit/cc88517650100b0305e4d7a44db62daec3482a33), [`ea4aa67a3`](https://github.com/clerk/javascript/commit/ea4aa67a31675f1ca504cde63eec37a0e351140b), [`5c8754239`](https://github.com/clerk/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81), [`b69fad0ce`](https://github.com/clerk/javascript/commit/b69fad0ceddc462f9071ee89db40485a0abd8528), [`14895e2dd`](https://github.com/clerk/javascript/commit/14895e2dde0fa15b594b1b7d89829d6013f5afc6)]:
  - @clerk/clerk-js@4.59.0
  - @clerk/clerk-react@4.26.0

## 0.19.4

### Patch Changes

- The [issue #1680](https://github.com/clerk/javascript/issues/1608) has uncovered that the version `1.3.0` of `react-native-url-polyfill` did not had support for Expo Web. ([#1773](https://github.com/clerk/javascript/pull/1773)) by [@octoper](https://github.com/octoper)

  The error was that because we rely on `react-native-url-polyfill/auto`, the would also apply the polyfill if executed on the web, which is not required as the `URL` has support for all modern browsers and there is no need to pollyfill it.

  The version of `react-native-url-polyfill` was upgraded from `1.3.0` to `2.0.0` to fix the error.

- Updated dependencies [[`0eb666118`](https://github.com/clerk/javascript/commit/0eb66611882e6c460cc6a6c5cfa1d9b086ec6917), [`53ccb27cf`](https://github.com/clerk/javascript/commit/53ccb27cfd195af65adde6694572ed523fc66d6d), [`3ceb2a734`](https://github.com/clerk/javascript/commit/3ceb2a734a43f134956164377399fec46e01e0a1), [`c61ddf5bf`](https://github.com/clerk/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerk/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/clerk-js@4.58.2
  - @clerk/clerk-react@4.25.2

## 0.19.3

### Patch Changes

- Updated dependencies [[`a2c7115dd`](https://github.com/clerk/javascript/commit/a2c7115dd3f4574e1970a985360916d954ad36cd), [`378a903ac`](https://github.com/clerk/javascript/commit/378a903ac4dc12e6ee708de20f0d9a5aa758bd18)]:
  - @clerk/clerk-js@4.58.1
  - @clerk/clerk-react@4.25.1

## 0.19.2

### Patch Changes

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`30bb9eccb`](https://github.com/clerk/javascript/commit/30bb9eccb95632fb1de02b756e818118ca6324f7), [`e99df0a0d`](https://github.com/clerk/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerk/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`a8eb4351a`](https://github.com/clerk/javascript/commit/a8eb4351a623b26a961c6968684e3a1f43ebd10d), [`23c073957`](https://github.com/clerk/javascript/commit/23c073957bc61cf27824e9c7e15e89f65c3eab35), [`01b024c57`](https://github.com/clerk/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68), [`b0f396bc5`](https://github.com/clerk/javascript/commit/b0f396bc5c75c9920df46e26d672c37f3cc3d974), [`16f667275`](https://github.com/clerk/javascript/commit/16f667275c7dd6f97ca94b247d72afa92c4ab4ce), [`7fa93644d`](https://github.com/clerk/javascript/commit/7fa93644d47252a472000633a939dc15d8d7f292), [`634948fda`](https://github.com/clerk/javascript/commit/634948fdaf9276b593f8fabcb2af45f3c3457048), [`43786f8d0`](https://github.com/clerk/javascript/commit/43786f8d0d89c3e8a827415aabba4020a928eeed)]:
  - @clerk/clerk-js@4.58.0
  - @clerk/clerk-react@4.25.0

## 0.19.1

### Patch Changes

- Updated dependencies [[`463ff84f5`](https://github.com/clerk/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`1426e5eb3`](https://github.com/clerk/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739)]:
  - @clerk/clerk-js@4.57.0
  - @clerk/clerk-react@4.24.2

## 0.19.0

### Minor Changes

- Support swapping the Clerk publishableKey at runtime to allow users to toggle the instance being used. ([#1655](https://github.com/clerk/javascript/pull/1655)) by [@BRKalow](https://github.com/BRKalow)

### Patch Changes

- Updated dependencies [[`6384ea8da`](https://github.com/clerk/javascript/commit/6384ea8dae85b3e1b58b0b70c761c0d2794e3aaa), [`b491dddae`](https://github.com/clerk/javascript/commit/b491dddae41030556b0be5c709f128838d4b1196), [`a102c21d4`](https://github.com/clerk/javascript/commit/a102c21d4762895a80a1ad846700763cc801b3f3)]:
  - @clerk/clerk-js@4.56.3
  - @clerk/clerk-react@4.24.1

## 0.18.20

### Patch Changes

- Updated dependencies [[`3882e913f`](https://github.com/clerk/javascript/commit/3882e913fd9bf4b7d1a9bf71691296d866204e56)]:
  - @clerk/clerk-js@4.56.2

## 0.18.19

### Patch Changes

- Updated dependencies [[`27a70551c`](https://github.com/clerk/javascript/commit/27a70551cb1fa3fdcf9878f78f32c6b19a18fea0)]:
  - @clerk/clerk-js@4.56.1

## 0.18.18

### Patch Changes

- Ensure the session token is updated when calling `setActive()` in a non-browser environment. ([#1623](https://github.com/clerk/javascript/pull/1623)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`854aa381c`](https://github.com/clerk/javascript/commit/854aa381c31b712f264767e16e7025884a5122d7), [`96cc1921c`](https://github.com/clerk/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerk/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerk/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerk/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerk/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerk/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerk/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerk/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerk/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerk/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`d39c029a5`](https://github.com/clerk/javascript/commit/d39c029a543e861556773bfbc0b208cde3a54521), [`86de584dd`](https://github.com/clerk/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`ac5a70059`](https://github.com/clerk/javascript/commit/ac5a70059ca142a95b168909c05d488c05d94c3a), [`e02a1aff2`](https://github.com/clerk/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`1663aaae7`](https://github.com/clerk/javascript/commit/1663aaae704b8a0f62e31acab440584e681666b3), [`09bfb793e`](https://github.com/clerk/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerk/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerk/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerk/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerk/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`89bc5de04`](https://github.com/clerk/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/clerk-js@4.56.0
  - @clerk/clerk-react@4.24.0

## 0.18.17

### Patch Changes

- Updated dependencies [[`ea95525a4`](https://github.com/clerk/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerk/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`0b9388c01`](https://github.com/clerk/javascript/commit/0b9388c01b84557e3b63c1de91ab8b51369b26a7), [`2244f6ab1`](https://github.com/clerk/javascript/commit/2244f6ab1015536a929567d0f551f9a933634bab), [`5e1a09df4`](https://github.com/clerk/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`0a59e122d`](https://github.com/clerk/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/clerk-js@4.55.0
  - @clerk/clerk-react@4.23.2

## 0.18.16

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.54.2

## 0.18.15

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerk/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3), [`671561697`](https://github.com/clerk/javascript/commit/671561697c205dd984fd4c6b9864055d8fe2fc8b), [`38644778e`](https://github.com/clerk/javascript/commit/38644778ee9cc0b4196bd32537c543b8c51775c3), [`808e45dc4`](https://github.com/clerk/javascript/commit/808e45dc42cc65c8aec99f034131721d34d32656)]:
  - @clerk/clerk-js@4.54.1
  - @clerk/clerk-react@4.23.1

## 0.18.14

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerk/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c), [`a9ca4355d`](https://github.com/clerk/javascript/commit/a9ca4355de4375046c79ecbe09bf3998ae94ded1)]:
  - @clerk/clerk-js@4.54.0
  - @clerk/clerk-react@4.23.0

## 0.18.13

### Patch Changes

- Updated dependencies [[`73c9c1d0e`](https://github.com/clerk/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerk/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerk/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`0a7a88995`](https://github.com/clerk/javascript/commit/0a7a889956f5e060584b17cdb59d9c9abe5473f9), [`17f963e38`](https://github.com/clerk/javascript/commit/17f963e38101733b8c5e500db251a5128f762c8f), [`592911196`](https://github.com/clerk/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8), [`dd10ebeae`](https://github.com/clerk/javascript/commit/dd10ebeae54d70b84b7c0374cea2876e9cdd6622), [`cf918665c`](https://github.com/clerk/javascript/commit/cf918665c55cac911afa17332bcce71435343d9d)]:
  - @clerk/clerk-js@4.53.0
  - @clerk/clerk-react@4.22.1

## 0.18.12

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.52.1

## 0.18.11

### Patch Changes

- Updated dependencies [[`fb426385b`](https://github.com/clerk/javascript/commit/fb426385be19b888e311613d830b125c7df152aa), [`f6b77a1a3`](https://github.com/clerk/javascript/commit/f6b77a1a338cddeadb3cc7019171bf9703d7676e), [`670a7616d`](https://github.com/clerk/javascript/commit/670a7616d8476075eabf8a153d2bf84422a5cbd3)]:
  - @clerk/clerk-js@4.52.0
  - @clerk/clerk-react@4.22.0

## 0.18.10

### Patch Changes

- Updated dependencies [[`968d9c265`](https://github.com/clerk/javascript/commit/968d9c2651ce25f6e03c2e6eecd81f7daf876f03)]:
  - @clerk/clerk-react@4.21.1

## 0.18.9

### Patch Changes

- Updated dependencies [[`1e71b60a2`](https://github.com/clerk/javascript/commit/1e71b60a2c6832a5f4f9c75ad4152b82db2b52e1)]:
  - @clerk/clerk-react@4.21.0

## 0.18.8

### Patch Changes

- Updated dependencies [[`ac236e8d3`](https://github.com/clerk/javascript/commit/ac236e8d3e23111b9b990a32c94358c179812d6a)]:
  - @clerk/clerk-js@4.51.0
  - @clerk/clerk-react@4.20.6

## 0.18.7

### Patch Changes

- Updated dependencies [[`9b79d9b64`](https://github.com/clerk/javascript/commit/9b79d9b6465175f966dcecdd750f8904ad44c69e)]:
  - @clerk/clerk-js@4.50.1

## 0.18.6

### Patch Changes

- Updated dependencies [[`32ef3304`](https://github.com/clerk/javascript/commit/32ef3304161c2d7b307c02222ffee590bd821e5b), [`bfb3af28`](https://github.com/clerk/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/clerk-js@4.50.0
  - @clerk/clerk-react@4.20.5

## 0.18.5

### Patch Changes

- Updated dependencies [[`11954816`](https://github.com/clerk/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`32148490`](https://github.com/clerk/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/clerk-js@4.49.0
  - @clerk/clerk-react@4.20.4

## 0.18.4

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.48.1
  - @clerk/clerk-react@4.20.3

## 0.18.3

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerk/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerk/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/clerk-js@4.48.0
  - @clerk/clerk-react@4.20.2

## 0.18.2

### Patch Changes

- Updated dependencies [[`59bc649a`](https://github.com/clerk/javascript/commit/59bc649a92316f5d6ade00f3cd52a9b46dcdc401)]:
  - @clerk/clerk-js@4.47.2
  - @clerk/clerk-react@4.20.1

## 0.18.1

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.47.1

## 0.18.0

### Minor Changes

- Export error helpers from the shared package to the framework specific packages ([#1308](https://github.com/clerk/javascript/pull/1308)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Updated dependencies [[`7af91bc3`](https://github.com/clerk/javascript/commit/7af91bc3ecc25cba04968b491e1e3c6ec32c18af), [`c42b4ac0`](https://github.com/clerk/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`6f3d4305`](https://github.com/clerk/javascript/commit/6f3d43055690db1d69a356503a0a45dc948beaef), [`846b00b9`](https://github.com/clerk/javascript/commit/846b00b90167ab5a77456d32653a221faddd835a)]:
  - @clerk/clerk-react@4.20.0
  - @clerk/clerk-js@4.47.0

## 0.17.8

### Patch Changes

- Updated dependencies [[`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/clerk-js@4.46.0
  - @clerk/clerk-react@4.19.0

## [0.17.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.16.5-staging.4...@clerk/clerk-expo@0.17.0) (2023-05-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.16.4](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.16.4-staging.6...@clerk/clerk-expo@0.16.4) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.16.4-staging.5](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.16.4-staging.4...@clerk/clerk-expo@0.16.4-staging.5) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.16.4-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.16.4-staging.2...@clerk/clerk-expo@0.16.4-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.16.3](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.16.3-staging.0...@clerk/clerk-expo@0.16.3) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.16.2](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.16.1...@clerk/clerk-expo@0.16.2) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.16.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.16.1-staging.1...@clerk/clerk-expo@0.16.1) (2023-04-12)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.16.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.16.0-staging.3...@clerk/clerk-expo@0.16.0) (2023-04-11)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.15.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.15.0-staging.1...@clerk/clerk-expo@0.15.0) (2023-04-06)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.14.3](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.14.3-staging.1...@clerk/clerk-expo@0.14.3) (2023-04-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.14.2](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.14.2-staging.3...@clerk/clerk-expo@0.14.2) (2023-03-31)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.14.2-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.14.2-staging.2...@clerk/clerk-expo@0.14.2-staging.3) (2023-03-31)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.14.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.14.1-staging.0...@clerk/clerk-expo@0.14.1) (2023-03-29)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.14.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.14.0-staging.2...@clerk/clerk-expo@0.14.0) (2023-03-29)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.13](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.13-staging.2...@clerk/clerk-expo@0.12.13) (2023-03-10)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.12](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.12-staging.3...@clerk/clerk-expo@0.12.12) (2023-03-09)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.11](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.10...@clerk/clerk-expo@0.12.11) (2023-03-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.10](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.10-staging.0...@clerk/clerk-expo@0.12.10) (2023-03-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.9](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.9-staging.1...@clerk/clerk-expo@0.12.9) (2023-03-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.8](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.8-staging.1...@clerk/clerk-expo@0.12.8) (2023-03-01)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.7](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.7-staging.0...@clerk/clerk-expo@0.12.7) (2023-02-27)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.6](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.6-staging.1...@clerk/clerk-expo@0.12.6) (2023-02-25)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.6-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.6-staging.0...@clerk/clerk-expo@0.12.6-staging.1) (2023-02-25)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.5](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.5-staging.5...@clerk/clerk-expo@0.12.5) (2023-02-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.5-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.5-staging.2...@clerk/clerk-expo@0.12.5-staging.3) (2023-02-22)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.4](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.4-staging.0...@clerk/clerk-expo@0.12.4) (2023-02-17)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.3](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.3-staging.2...@clerk/clerk-expo@0.12.3) (2023-02-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.2](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.2-staging.1...@clerk/clerk-expo@0.12.2) (2023-02-10)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.1-staging.0...@clerk/clerk-expo@0.12.1) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.12.0...@clerk/clerk-expo@0.12.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.12.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.11.8-staging.1...@clerk/clerk-expo@0.12.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.11.7](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.11.7-staging.5...@clerk/clerk-expo@0.11.7) (2023-02-01)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.11.6](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.11.6-staging.5...@clerk/clerk-expo@0.11.6) (2023-01-27)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.11.5](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.11.5-staging.2...@clerk/clerk-expo@0.11.5) (2023-01-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.11.4](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.11.3...@clerk/clerk-expo@0.11.4) (2023-01-20)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.11.3](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.11.2...@clerk/clerk-expo@0.11.3) (2023-01-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.11.2](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.11.1...@clerk/clerk-expo@0.11.2) (2023-01-17)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.11.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.11.0...@clerk/clerk-expo@0.11.1) (2023-01-17)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.11.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.11.0-staging.5...@clerk/clerk-expo@0.11.0) (2023-01-17)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.16](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.16-staging.0...@clerk/clerk-expo@0.10.16) (2022-12-23)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.15](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.15-staging.1...@clerk/clerk-expo@0.10.15) (2022-12-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.14](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.13...@clerk/clerk-expo@0.10.14) (2022-12-14)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.13](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.13-staging.0...@clerk/clerk-expo@0.10.13) (2022-12-13)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.12](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.11...@clerk/clerk-expo@0.10.12) (2022-12-12)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.11](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.11-staging.0...@clerk/clerk-expo@0.10.11) (2022-12-12)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.10](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.10-staging.2...@clerk/clerk-expo@0.10.10) (2022-12-09)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.9](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.8...@clerk/clerk-expo@0.10.9) (2022-12-08)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.8](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.7...@clerk/clerk-expo@0.10.8) (2022-12-08)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.7](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.7-staging.0...@clerk/clerk-expo@0.10.7) (2022-12-08)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.6](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.6-staging.1...@clerk/clerk-expo@0.10.6) (2022-12-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.5](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.5-staging.2...@clerk/clerk-expo@0.10.5) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.5-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.5-staging.1...@clerk/clerk-expo@0.10.5-staging.2) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.5-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.5-staging.0...@clerk/clerk-expo@0.10.5-staging.1) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.4](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.4-staging.8...@clerk/clerk-expo@0.10.4) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.4-staging.8](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.4-staging.7...@clerk/clerk-expo@0.10.4-staging.8) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.4-staging.7](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.4-staging.6...@clerk/clerk-expo@0.10.4-staging.7) (2022-11-29)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.4-staging.6](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.4-staging.5...@clerk/clerk-expo@0.10.4-staging.6) (2022-11-29)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.3](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.3-staging.1...@clerk/clerk-expo@0.10.3) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.3-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.3-staging.0...@clerk/clerk-expo@0.10.3-staging.1) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.2](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.2-staging.0...@clerk/clerk-expo@0.10.2) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.0...@clerk/clerk-expo@0.10.1) (2022-11-23)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.10.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.0-staging.3...@clerk/clerk-expo@0.10.0) (2022-11-22)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.10.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.10.0-staging.0...@clerk/clerk-expo@0.10.0-staging.1) (2022-11-21)

### Bug Fixes

- **clerk-react:** Add HeadlessBrowserClerk ([4236147](https://github.com/clerk/javascript/commit/4236147201b32e3f1d60ebbe2c36de8e89e5e2f6))

## [0.10.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.74-staging.1...@clerk/clerk-expo@0.10.0-staging.0) (2022-11-21)

### Features

- **clerk-js:** Improve DX for headless import ([8d64310](https://github.com/clerk/javascript/commit/8d64310ab23c6e21f8a687e503521245acad8211))

### [0.9.73](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.73-staging.1...@clerk/clerk-expo@0.9.73) (2022-11-18)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.72](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.71...@clerk/clerk-expo@0.9.72) (2022-11-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.71](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.71-staging.5...@clerk/clerk-expo@0.9.71) (2022-11-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.70](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.70-staging.2...@clerk/clerk-expo@0.9.70) (2022-11-10)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.69](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.69-staging.2...@clerk/clerk-expo@0.9.69) (2022-11-05)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.68](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.68-staging.8...@clerk/clerk-expo@0.9.68) (2022-11-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.68-staging.4](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.68-staging.3...@clerk/clerk-expo@0.9.68-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.68-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.68-staging.1...@clerk/clerk-expo@0.9.68-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.68-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.68-staging.1...@clerk/clerk-expo@0.9.68-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.68-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.67...@clerk/clerk-expo@0.9.68-staging.1) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.67](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.66...@clerk/clerk-expo@0.9.67) (2022-10-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.66](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.66-staging.2...@clerk/clerk-expo@0.9.66) (2022-10-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.65](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.64...@clerk/clerk-expo@0.9.65) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.64](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.63...@clerk/clerk-expo@0.9.64) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.63](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.63-staging.2...@clerk/clerk-expo@0.9.63) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.63-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.62...@clerk/clerk-expo@0.9.63-staging.1) (2022-10-13)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.62](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.62-staging.1...@clerk/clerk-expo@0.9.62) (2022-10-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.61](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.61-staging.0...@clerk/clerk-expo@0.9.61) (2022-10-05)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.60](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.60-staging.4...@clerk/clerk-expo@0.9.60) (2022-10-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.59](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.59-staging.4...@clerk/clerk-expo@0.9.59) (2022-09-29)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.58](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.57...@clerk/clerk-expo@0.9.58) (2022-09-25)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.57](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.57-staging.2...@clerk/clerk-expo@0.9.57) (2022-09-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.57-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.57-staging.0...@clerk/clerk-expo@0.9.57-staging.1) (2022-09-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.56](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.56-staging.2...@clerk/clerk-expo@0.9.56) (2022-09-22)

### Bug Fixes

- **clerk-expo:** Add org hooks to expo ([93ac733](https://github.com/clerk/javascript/commit/93ac73329d6c36ffdf269b5ae6f26ec18e0246c0))

### [0.9.55](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.53-staging.4...@clerk/clerk-expo@0.9.55) (2022-09-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.53](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.53-staging.4...@clerk/clerk-expo@0.9.53) (2022-09-16)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.52](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.52-staging.0...@clerk/clerk-expo@0.9.52) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.51](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.51-staging.1...@clerk/clerk-expo@0.9.51) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.50](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.50-staging.0...@clerk/clerk-expo@0.9.50) (2022-09-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.49](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.49-staging.2...@clerk/clerk-expo@0.9.49) (2022-09-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.48](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.48-staging.0...@clerk/clerk-expo@0.9.48) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.47](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.47-staging.2...@clerk/clerk-expo@0.9.47) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.46](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.46-staging.1...@clerk/clerk-expo@0.9.46) (2022-08-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.45](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.44...@clerk/clerk-expo@0.9.45) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.44](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.44-staging.1...@clerk/clerk-expo@0.9.44) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.44-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.44-staging.0...@clerk/clerk-expo@0.9.44-staging.1) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.43](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.42...@clerk/clerk-expo@0.9.43) (2022-08-16)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.42](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.42-staging.1...@clerk/clerk-expo@0.9.42) (2022-08-11)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.41](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.41-staging.0...@clerk/clerk-expo@0.9.41) (2022-08-10)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.40](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.40-staging.0...@clerk/clerk-expo@0.9.40) (2022-08-09)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.39](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.38...@clerk/clerk-expo@0.9.39) (2022-08-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.38](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.38-staging.1...@clerk/clerk-expo@0.9.38) (2022-08-05)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.37](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.36...@clerk/clerk-expo@0.9.37) (2022-08-04)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.36](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.35...@clerk/clerk-expo@0.9.36) (2022-07-13)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.35](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.35-staging.1...@clerk/clerk-expo@0.9.35) (2022-07-12)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.34](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.34-staging.0...@clerk/clerk-expo@0.9.34) (2022-07-11)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.33](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.32...@clerk/clerk-expo@0.9.33) (2022-07-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.32](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.31...@clerk/clerk-expo@0.9.32) (2022-07-06)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.31](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.30...@clerk/clerk-expo@0.9.31) (2022-07-01)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.30](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.29...@clerk/clerk-expo@0.9.30) (2022-06-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.29](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.29-staging.1...@clerk/clerk-expo@0.9.29) (2022-06-16)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.29-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.29-staging.0...@clerk/clerk-expo@0.9.29-staging.1) (2022-06-16)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.28](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.28-staging.0...@clerk/clerk-expo@0.9.28) (2022-06-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.27](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.27-staging.0...@clerk/clerk-expo@0.9.27) (2022-06-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.26](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.25...@clerk/clerk-expo@0.9.26) (2022-06-06)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.25](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.25-staging.5...@clerk/clerk-expo@0.9.25) (2022-06-06)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.25-staging.5](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.25-staging.4...@clerk/clerk-expo@0.9.25-staging.5) (2022-06-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.25-staging.4](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.25-staging.3...@clerk/clerk-expo@0.9.25-staging.4) (2022-06-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.25-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.25-staging.2...@clerk/clerk-expo@0.9.25-staging.3) (2022-06-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.25-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.25-staging.1...@clerk/clerk-expo@0.9.25-staging.2) (2022-06-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.25-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.25-staging.0...@clerk/clerk-expo@0.9.25-staging.1) (2022-06-01)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.24](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.24-staging.5...@clerk/clerk-expo@0.9.24) (2022-05-20)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.24-staging.5](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.24-staging.4...@clerk/clerk-expo@0.9.24-staging.5) (2022-05-20)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.24-staging.4](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.24-staging.3...@clerk/clerk-expo@0.9.24-staging.4) (2022-05-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.24-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.23...@clerk/clerk-expo@0.9.24-staging.3) (2022-05-18)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.24-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.23...@clerk/clerk-expo@0.9.24-staging.2) (2022-05-17)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.24-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.23...@clerk/clerk-expo@0.9.24-staging.1) (2022-05-16)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.23](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.20...@clerk/clerk-expo@0.9.23) (2022-05-13)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.22](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.20...@clerk/clerk-expo@0.9.22) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.21](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.20...@clerk/clerk-expo@0.9.21) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.20](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.20-staging.1...@clerk/clerk-expo@0.9.20) (2022-05-11)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.20-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.20-staging.0...@clerk/clerk-expo@0.9.20-staging.1) (2022-05-11)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.19](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.18...@clerk/clerk-expo@0.9.19) (2022-05-06)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.19-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.18...@clerk/clerk-expo@0.9.19-staging.0) (2022-05-05)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.18](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.18-staging.0...@clerk/clerk-expo@0.9.18) (2022-05-05)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.17](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.17-staging.0...@clerk/clerk-expo@0.9.17) (2022-04-28)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.16](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.15...@clerk/clerk-expo@0.9.16) (2022-04-27)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.15](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.14...@clerk/clerk-expo@0.9.15) (2022-04-27)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.14](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.14-staging.0...@clerk/clerk-expo@0.9.14) (2022-04-22)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.13](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.13-staging.1...@clerk/clerk-expo@0.9.13) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.13-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.13-staging.0...@clerk/clerk-expo@0.9.13-staging.1) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.12](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.12-alpha.0...@clerk/clerk-expo@0.9.12) (2022-04-18)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.12-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.11...@clerk/clerk-expo@0.9.12-alpha.0) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.11](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.10...@clerk/clerk-expo@0.9.11) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.10](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.10-staging.1...@clerk/clerk-expo@0.9.10) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.9](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.9-staging.0...@clerk/clerk-expo@0.9.9) (2022-04-13)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.8](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.7...@clerk/clerk-expo@0.9.8) (2022-04-11)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.7](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.6...@clerk/clerk-expo@0.9.7) (2022-04-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.6](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.6-staging.0...@clerk/clerk-expo@0.9.6) (2022-04-04)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.5](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.4...@clerk/clerk-expo@0.9.5) (2022-03-31)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.4](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.4-staging.0...@clerk/clerk-expo@0.9.4) (2022-03-29)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.3](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.3-staging.0...@clerk/clerk-expo@0.9.3) (2022-03-28)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.2](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.2-alpha.0...@clerk/clerk-expo@0.9.2) (2022-03-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.2-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.2-staging.0...@clerk/clerk-expo@0.9.2-staging.1) (2022-03-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.1-staging.0...@clerk/clerk-expo@0.9.1-alpha.0) (2022-03-23)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.9.0-alpha.2](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.9.0-alpha.1...@clerk/clerk-expo@0.9.0-alpha.2) (2022-03-23)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.9.0-alpha.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.18-alpha.3...@clerk/clerk-expo@0.9.0-alpha.1) (2022-03-23)

### Bug Fixes

- **clerk-expo:** Make Clerk loading smarter ([#136](https://github.com/clerk/javascript/issues/136)) ([2405d81](https://github.com/clerk/javascript/commit/2405d813b41c1f3c345c894c18e65710891bd710))

## [0.9.0-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.18-alpha.3...@clerk/clerk-expo@0.9.0-alpha.0) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.18-alpha.3](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.18-alpha.2...@clerk/clerk-expo@0.8.18-alpha.3) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.18-alpha.2](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.18-staging.0...@clerk/clerk-expo@0.8.18-alpha.2) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.18-alpha.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.18-staging.0...@clerk/clerk-expo@0.8.18-alpha.1) (2022-03-20)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.18-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.18-staging.0...@clerk/clerk-expo@0.8.18-alpha.0) (2022-03-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.16](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.16-staging.1...@clerk/clerk-expo@0.8.16) (2022-03-17)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.16-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.16-staging.0...@clerk/clerk-expo@0.8.16-staging.1) (2022-03-17)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.13-alpha.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.13...@clerk/clerk-expo@0.8.13-alpha.1) (2022-03-11)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.3-alpha.2](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.6...@clerk/clerk-expo@0.8.3-alpha.2) (2022-02-28)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.3-alpha.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.6...@clerk/clerk-expo@0.8.3-alpha.1) (2022-02-25)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.14](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.13...@clerk/clerk-expo@0.8.14) (2022-03-11)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.13](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.13-staging.0...@clerk/clerk-expo@0.8.13) (2022-03-09)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.11](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.10...@clerk/clerk-expo@0.8.11) (2022-03-04)

### Bug Fixes

- **clerk-expo:** Add early return if tokenCache is not provided ([7a69d87](https://github.com/clerk/javascript/commit/7a69d870e5a6a73f34d6989643b55d2ff131536e))
- **clerk-expo:** Add guard clause for tokenCache methods ([4c0bd54](https://github.com/clerk/javascript/commit/4c0bd54248a7248c844f8255120adadea57b5bee))

### [0.8.10](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.9...@clerk/clerk-expo@0.8.10) (2022-03-04)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.9](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.8...@clerk/clerk-expo@0.8.9) (2022-03-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.8](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.7...@clerk/clerk-expo@0.8.8) (2022-03-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.7](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.6...@clerk/clerk-expo@0.8.7) (2022-03-01)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.6](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.6-staging.0...@clerk/clerk-expo@0.8.6) (2022-02-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.6-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.5-staging.0...@clerk/clerk-expo@0.8.6-staging.0) (2022-02-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.5-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.4-staging.0...@clerk/clerk-expo@0.8.5-staging.0) (2022-02-22)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.4-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.3-staging.1...@clerk/clerk-expo@0.8.4-staging.0) (2022-02-17)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.3-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.3-staging.0...@clerk/clerk-expo@0.8.3-staging.1) (2022-02-16)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.3-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.2...@clerk/clerk-expo@0.8.3-staging.0) (2022-02-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.2](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.1...@clerk/clerk-expo@0.8.2) (2022-02-14)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.1](https://github.com/clerk/javascript/compare/@clerk/clerk-expo@0.8.1-staging.0...@clerk/clerk-expo@0.8.1) (2022-02-14)

**Note:** Version bump only for package @clerk/clerk-expo

### 0.8.1-staging.0 (2022-02-11)

**Note:** Version bump only for package @clerk/clerk-expo
