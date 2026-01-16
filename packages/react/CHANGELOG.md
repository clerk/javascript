# Change Log

## 5.59.4

### Patch Changes

- Prevent props from leaking to child elements in SignUpButton & SignInButton ([#7589](https://github.com/clerk/javascript/pull/7589)) by [@tmilewski](https://github.com/tmilewski)

- Updated dependencies [[`271ddeb`](https://github.com/clerk/javascript/commit/271ddeb0b47357f7da316eef389ae46b180c36da)]:
  - @clerk/shared@3.43.0

## 5.59.3

### Patch Changes

- Updated dependencies [[`a4e6932`](https://github.com/clerk/javascript/commit/a4e693262f734bfd3ab08ffac019168c874c2bd8)]:
  - @clerk/shared@3.42.0

## 5.59.2

### Patch Changes

- Fix React peer dependency version ranges to use `~` instead of `^` for React 19 versions, ensuring non-overlapping version constraints. ([#7513](https://github.com/clerk/javascript/pull/7513)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`03dd374`](https://github.com/clerk/javascript/commit/03dd37458eedf59198dc3574e12030b217efcb41)]:
  - @clerk/shared@3.41.1

## 5.59.1

### Patch Changes

- Updated dependencies [[`79eb5af`](https://github.com/clerk/javascript/commit/79eb5afd91d7b002faafd2980850d944acb37917), [`b3b02b4`](https://github.com/clerk/javascript/commit/b3b02b46dfa6d194ed12d2e6b9e332796ee73c4a), [`7b3024a`](https://github.com/clerk/javascript/commit/7b3024a71e6e45e926d83f1a9e887216e7c14424), [`2cd4da9`](https://github.com/clerk/javascript/commit/2cd4da9c72bc7385c0c7c71e2a7ca856d79ce630)]:
  - @clerk/shared@3.41.0

## 5.59.0

### Minor Changes

- Add support for Sign in with Solana. ([#7293](https://github.com/clerk/javascript/pull/7293)) by [@kduprey](https://github.com/kduprey)

### Patch Changes

- Updated dependencies [[`375a32d`](https://github.com/clerk/javascript/commit/375a32d0f44933605ffb513ff28f522ac5e851d6), [`175883b`](https://github.com/clerk/javascript/commit/175883b05228138c9ff55d0871cc1041bd68d7fe), [`f626046`](https://github.com/clerk/javascript/commit/f626046c589956022b1e1ac70382c986822f4733), [`14342d2`](https://github.com/clerk/javascript/commit/14342d2b34fe0882f7676195aefaaa17f034af70)]:
  - @clerk/shared@3.40.0

## 5.58.1

### Patch Changes

- Re-export experimental `useAPIKeys` hook ([#7387](https://github.com/clerk/javascript/pull/7387)) by [@wobsoriano](https://github.com/wobsoriano)

- Allow reordering API Keys and Billing pages in `<UserProfile />` and `<OrganizationProfile />`. ([#7383](https://github.com/clerk/javascript/pull/7383)) by [@wobsoriano](https://github.com/wobsoriano)

  Example:

  ```tsx
  export function CustomUserProfile() {
    return (
      <UserProfile>
        <UserProfile.Page label='apiKeys' />
        <UserProfile.Page label='billing' />
      </UserProfile>
    );
  }
  ```

- Updated dependencies [[`b117ebc`](https://github.com/clerk/javascript/commit/b117ebc956e1a5d48d5fdb7210de3344a74a524a)]:
  - @clerk/shared@3.39.0

## 5.58.0

### Minor Changes

- Introduce new `<TaskResetPassword/>` session task component ([#7314](https://github.com/clerk/javascript/pull/7314)) by [@octoper](https://github.com/octoper)

### Patch Changes

- Updated dependencies [[`e31f3d5`](https://github.com/clerk/javascript/commit/e31f3d567302f99d8d073ba75cd934fb3c1eca7f), [`8376789`](https://github.com/clerk/javascript/commit/8376789de2383b52fabc563a9382622627055ecd), [`f917d68`](https://github.com/clerk/javascript/commit/f917d68fc2fc5d317770491e9d4d7185e1985d04), [`818c25a`](https://github.com/clerk/javascript/commit/818c25a9eec256245152725c64419c73e762c1a2), [`b41c0d5`](https://github.com/clerk/javascript/commit/b41c0d539835a5a43d15e3399bac7cbf046d9345)]:
  - @clerk/shared@3.38.0

## 5.57.1

### Patch Changes

- Fixed an issue where `<APIKeys />` mounted in a custom page caused an application to freeze. ([#7316](https://github.com/clerk/javascript/pull/7316)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`40a841d`](https://github.com/clerk/javascript/commit/40a841d56cd8983dce21376c832f1085c43a9518), [`f364924`](https://github.com/clerk/javascript/commit/f364924708f20f0bc7b8b291ea2ae01ce09e2e9f), [`f115e56`](https://github.com/clerk/javascript/commit/f115e56d14b5c49f52b6aca01b434dbe4f6193cf), [`d4aef71`](https://github.com/clerk/javascript/commit/d4aef71961d6d0abf8f1d1142c4e3ae943181c4b), [`3f99742`](https://github.com/clerk/javascript/commit/3f997427e400248502b0977e1b69e109574dfe7d), [`02798f5`](https://github.com/clerk/javascript/commit/02798f571065d8142cf1dade57b42b3e8ce0f818), [`07a30ce`](https://github.com/clerk/javascript/commit/07a30ce52b7d2ba85ce3533879700b9ec129152e), [`ce8b914`](https://github.com/clerk/javascript/commit/ce8b9149bff27866cdb686f1ab0b56cef8d8c697)]:
  - @clerk/shared@3.37.0

## 5.57.0

### Minor Changes

- Introduce in-app development prompt to enable the Organizations feature ([#7159](https://github.com/clerk/javascript/pull/7159)) by [@LauraBeatris](https://github.com/LauraBeatris)

  In development instances, when using organization components or hooks for the first time, developers will see a prompt to enable the Organizations feature directly in their app, eliminating the need to visit the Clerk Dashboard.

### Patch Changes

- Updated dependencies [[`f85abda`](https://github.com/clerk/javascript/commit/f85abdac03fde4a5109f31931c55b56a365aa748), [`36e43cc`](https://github.com/clerk/javascript/commit/36e43cc614865e52eefbd609a9491c32371cda44)]:
  - @clerk/shared@3.36.0

## 5.56.2

### Patch Changes

- Updated dependencies [[`d8f59a6`](https://github.com/clerk/javascript/commit/d8f59a66d56d8fb0dfea353ecd86af97d0ec56b7)]:
  - @clerk/shared@3.35.2

## 5.56.1

### Patch Changes

- Updated dependencies [[`a9c13ca`](https://github.com/clerk/javascript/commit/a9c13cae5a6f46ca753d530878f7e4492ca7938b)]:
  - @clerk/shared@3.35.1

## 5.56.0

### Minor Changes

- Standardized API keys naming convention ([#7223](https://github.com/clerk/javascript/pull/7223)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Updated dependencies [[`7be8f45`](https://github.com/clerk/javascript/commit/7be8f458367b2c050b0dc8c0481d7bbe090ea400), [`bdbb0d9`](https://github.com/clerk/javascript/commit/bdbb0d91712a84fc214c534fc47b62b1a2028ac9), [`aa184a4`](https://github.com/clerk/javascript/commit/aa184a46a91f9dec3fd275ec5867a8366d310469), [`1d4e7a7`](https://github.com/clerk/javascript/commit/1d4e7a7769e9efaaa945e4ba6468ad47bd24c807), [`42f0d95`](https://github.com/clerk/javascript/commit/42f0d95e943d82960de3f7e5da17d199eff9fddd), [`c63cc8e`](https://github.com/clerk/javascript/commit/c63cc8e9c38ed0521a22ebab43e10111f04f9daf), [`d32d724`](https://github.com/clerk/javascript/commit/d32d724c34a921a176eca159273f270c2af4e787), [`00291bc`](https://github.com/clerk/javascript/commit/00291bc8ae03c06f7154bd937628e8193f6e3ce9)]:
  - @clerk/shared@3.35.0

## 5.55.0

### Minor Changes

- [Experimental] Update `errors` to have specific field types based on whether it's a sign-in or a sign-up. ([#7195](https://github.com/clerk/javascript/pull/7195)) by [@dstaley](https://github.com/dstaley)

### Patch Changes

- Fixed missing API keys props within `<UserButton />` ([#7201](https://github.com/clerk/javascript/pull/7201)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`a1d10fc`](https://github.com/clerk/javascript/commit/a1d10fc6e231f27ec7eabd0db45b8f7e8c98250e), [`b944ff3`](https://github.com/clerk/javascript/commit/b944ff30494a8275450ca0d5129cdf58f02bea81), [`4011c5e`](https://github.com/clerk/javascript/commit/4011c5e0014ede5e480074b73d064a1bc2a577dd)]:
  - @clerk/shared@3.34.0

## 5.54.0

### Minor Changes

- Update the supported API version to `2025-11-10`. ([#7095](https://github.com/clerk/javascript/pull/7095)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`613cb97`](https://github.com/clerk/javascript/commit/613cb97cb7b3b33c3865cfe008ef9b1ea624cc8d)]:
  - @clerk/shared@3.33.0

## 5.53.9

### Patch Changes

- Updated dependencies [[`cc11472`](https://github.com/clerk/javascript/commit/cc11472e7318b806ee43d609cd03fb0446f56146), [`539fad7`](https://github.com/clerk/javascript/commit/539fad7b80ed284a7add6cf8c4c45cf4c6a0a8b2), [`c413433`](https://github.com/clerk/javascript/commit/c413433fee49701f252df574ce6a009d256c0cb9), [`a940c39`](https://github.com/clerk/javascript/commit/a940c39354bd0ee48d2fc9b0f3217ec20b2f32b4)]:
  - @clerk/shared@3.32.0

## 5.53.8

### Patch Changes

- Add sessionClaims to the useCallback dependency array which creates derivedHas in useAuth() ([#7165](https://github.com/clerk/javascript/pull/7165)) by [@jacekradko](https://github.com/jacekradko)

## 5.53.7

### Patch Changes

- Updated dependencies [[`a474c59`](https://github.com/clerk/javascript/commit/a474c59e3017358186de15c5b1e5b83002e72527), [`5536429`](https://github.com/clerk/javascript/commit/55364291e245ff05ca1e50e614e502d2081b87fb)]:
  - @clerk/shared@3.31.1

## 5.53.6

### Patch Changes

- Experimental: Ground work for fixing stale data between hooks and components by sharing a single cache. ([#6913](https://github.com/clerk/javascript/pull/6913)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`ea65d39`](https://github.com/clerk/javascript/commit/ea65d390cd6d3b0fdd35202492e858f8c8370f73), [`b09b29e`](https://github.com/clerk/javascript/commit/b09b29e82323c8fc508c49ffe10c77a737ef0bec)]:
  - @clerk/shared@3.31.0

## 5.53.5

### Patch Changes

- Updated dependencies [[`3e0ef92`](https://github.com/clerk/javascript/commit/3e0ef9281194714f56dcf656d0caf4f75dcf097c), [`2587aa6`](https://github.com/clerk/javascript/commit/2587aa671dac1ca66711889bf1cd1c2e2ac8d7c8)]:
  - @clerk/shared@3.30.0

## 5.53.4

### Patch Changes

- Updated dependencies [[`791ff19`](https://github.com/clerk/javascript/commit/791ff19a55ecb39eac20e1533a7d578a30386388), [`439427e`](https://github.com/clerk/javascript/commit/439427e44adef4f43e5f0719adf5654ea58c33e7), [`7dfbf3a`](https://github.com/clerk/javascript/commit/7dfbf3aa1b5269aee2d3af628b02027be9767088), [`d33b7b5`](https://github.com/clerk/javascript/commit/d33b7b5538e9bcbbca1ac23c46793d0cddcef533)]:
  - @clerk/shared@3.29.0
  - @clerk/types@4.96.0

## 5.53.3

### Patch Changes

- Updated dependencies [[`4d46e4e`](https://github.com/clerk/javascript/commit/4d46e4e601a5f2a213f1718af3f9271db4db0911)]:
  - @clerk/types@4.95.1
  - @clerk/shared@3.28.3

## 5.53.2

### Patch Changes

- Updated dependencies [[`a172d51`](https://github.com/clerk/javascript/commit/a172d51df2d7f2e450c983a15ae897624304a764), [`947d0f5`](https://github.com/clerk/javascript/commit/947d0f5480b0151a392966cad2e1a45423f66035)]:
  - @clerk/types@4.95.0
  - @clerk/shared@3.28.2

## 5.53.1

### Patch Changes

- Updated dependencies [[`d8147fb`](https://github.com/clerk/javascript/commit/d8147fb58bfd6caf9a4f0a36fdc48c630d00387f)]:
  - @clerk/shared@3.28.1

## 5.53.0

### Minor Changes

- [Experimental] Add support for sign-in with passkey to new APIs ([#6997](https://github.com/clerk/javascript/pull/6997)) by [@dstaley](https://github.com/dstaley)

### Patch Changes

- Updated dependencies [[`305f4ee`](https://github.com/clerk/javascript/commit/305f4eeb825086d55d1b0df198a0c43da8d94993), [`53214f9`](https://github.com/clerk/javascript/commit/53214f9a600074affc84d616bbbe7a6b625e7d33), [`1441e68`](https://github.com/clerk/javascript/commit/1441e6851102e9eed5697ad78c695f75b4a20db2), [`1236c74`](https://github.com/clerk/javascript/commit/1236c745fd58020e0972938ca0a9ae697a24af02)]:
  - @clerk/shared@3.28.0
  - @clerk/types@4.94.0

## 5.52.0

### Minor Changes

- Add support for sign up `locale` ([#6915](https://github.com/clerk/javascript/pull/6915)) by [@guilherme6191](https://github.com/guilherme6191)

### Patch Changes

- Updated dependencies [[`65b7cc7`](https://github.com/clerk/javascript/commit/65b7cc787a5f02a302b665b6eaf4d4b9a1cae4b0), [`6e09786`](https://github.com/clerk/javascript/commit/6e09786adeb0f481ca8b6d060ae8754b556a3f9a), [`aa7210c`](https://github.com/clerk/javascript/commit/aa7210c7fff34f6c6e2d4ca3cb736bbd35439cb6), [`2cd53cd`](https://github.com/clerk/javascript/commit/2cd53cd8c713dfa7f2e802fe08986411587095fa), [`1a2eee6`](https://github.com/clerk/javascript/commit/1a2eee6b8b6ead2d0481e93104fcaed6452bd1b9), [`2cd53cd`](https://github.com/clerk/javascript/commit/2cd53cd8c713dfa7f2e802fe08986411587095fa), [`1a2430a`](https://github.com/clerk/javascript/commit/1a2430a166fb1df5fbca76437c63423b18a49ced), [`31a04fc`](https://github.com/clerk/javascript/commit/31a04fc2b783f01cd4848c1e681af3b30e57bb2f), [`9766c4a`](https://github.com/clerk/javascript/commit/9766c4afd26f2841d6f79dbdec2584ef8becd22f), [`22b8e49`](https://github.com/clerk/javascript/commit/22b8e49f9fb65d55ab737d11f1f57a25bf947511), [`a66357e`](https://github.com/clerk/javascript/commit/a66357e8a5928199aebde408ec7cfaac152c2c42), [`dacc1af`](https://github.com/clerk/javascript/commit/dacc1af22e1d1af0940b2d626b8a47d376c19342)]:
  - @clerk/types@4.93.0
  - @clerk/shared@3.27.4

## 5.51.0

### Minor Changes

- [Experimental] Add support for additional properties to Signal SignIn/SignUp ([#6897](https://github.com/clerk/javascript/pull/6897)) by [@dstaley](https://github.com/dstaley)

### Patch Changes

- Updated dependencies [[`fba4781`](https://github.com/clerk/javascript/commit/fba4781ff2a2d16f8934029fa6fb77d70953f2be), [`a1f6714`](https://github.com/clerk/javascript/commit/a1f671480cda6f978db059ba0640d4ed8b08f112)]:
  - @clerk/types@4.92.0
  - @clerk/shared@3.27.3

## 5.50.0

### Minor Changes

- [Experimental] Add Signal support for Web3 APIs ([#6840](https://github.com/clerk/javascript/pull/6840)) by [@dstaley](https://github.com/dstaley)

### Patch Changes

- Updated dependencies [[`f737d26`](https://github.com/clerk/javascript/commit/f737d268aa167889a4f3f7aba2658c2ba1fd909a), [`8777f35`](https://github.com/clerk/javascript/commit/8777f350f5fb51413609a53d9de05b2e5d1d7cfe), [`2c0128b`](https://github.com/clerk/javascript/commit/2c0128b05ecf48748f27f10f0b0215a279ba6cc1)]:
  - @clerk/types@4.91.0
  - @clerk/shared@3.27.2

## 5.49.1

### Patch Changes

- Updated dependencies [[`37028ca`](https://github.com/clerk/javascript/commit/37028caad59cb0081ac74e70a44e4a419082a999)]:
  - @clerk/types@4.90.0
  - @clerk/shared@3.27.1

## 5.49.0

### Minor Changes

- Udpate Tyepdoc links to fix temporary ignore warnings ([#6846](https://github.com/clerk/javascript/pull/6846)) by [@SarahSoutoul](https://github.com/SarahSoutoul)

- Add new <UserAvatar /> component ([#6808](https://github.com/clerk/javascript/pull/6808)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Updated dependencies [[`e3e77eb`](https://github.com/clerk/javascript/commit/e3e77eb277c6b36847265db7b863c418e3708ab6), [`9cf89cd`](https://github.com/clerk/javascript/commit/9cf89cd3402c278e8d5bfcd8277cee292bc45333), [`090ca74`](https://github.com/clerk/javascript/commit/090ca742c590bc4f369cf3e1ca2ec9917410ffe4), [`5546352`](https://github.com/clerk/javascript/commit/55463527df9a710ef3215c353bab1ef423d1de62)]:
  - @clerk/shared@3.27.0
  - @clerk/types@4.89.0

## 5.48.1

### Patch Changes

- Update jsdocs mentions of `@experimental` tag. ([#6651](https://github.com/clerk/javascript/pull/6651)) by [@panteliselef](https://github.com/panteliselef)

- [Billing Beta] Rename types, interfaces and classes that contain `commerce` to use `billing` instead. ([#6757](https://github.com/clerk/javascript/pull/6757)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`41e0a41`](https://github.com/clerk/javascript/commit/41e0a4190b33dd2c4bdc0d536bbe83fcf99af9b0), [`1aa9e9f`](https://github.com/clerk/javascript/commit/1aa9e9f10c051319e9ff4b1a0ecd71507bd6a6aa), [`a88ee58`](https://github.com/clerk/javascript/commit/a88ee5827adee0cc8a62246d03a3034d8566fe21), [`d6c7bbb`](https://github.com/clerk/javascript/commit/d6c7bbba23f38c0b3ca7edebb53028a05c7b38e6)]:
  - @clerk/shared@3.26.1
  - @clerk/types@4.88.0

## 5.48.0

### Minor Changes

- [Experimental] Signal email link support ([#6766](https://github.com/clerk/javascript/pull/6766)) by [@dstaley](https://github.com/dstaley)

### Patch Changes

- Updated dependencies [[`bcf24f2`](https://github.com/clerk/javascript/commit/bcf24f2f91913fa0dd3fbf02b3bbef345c4e1ea9), [`1ceedad`](https://github.com/clerk/javascript/commit/1ceedad4bc5bc3d5f01c95185f82ff0f43983cf5), [`de90ede`](https://github.com/clerk/javascript/commit/de90ede82664b58bef9e294498384cf2c99a331e), [`9d4a95c`](https://github.com/clerk/javascript/commit/9d4a95c766396a0bc327fbf0560228bedb4828eb), [`428cd57`](https://github.com/clerk/javascript/commit/428cd57a8581a58a6a42325ec50eb98000068e97)]:
  - @clerk/types@4.87.0
  - @clerk/shared@3.26.0

## 5.47.0

### Minor Changes

- [Billing Beta] Drop experimental `subscriptions` property from params of `useOrganization()`. Use [`useSubscription()`](https://clerk.com/docs/nextjs/hooks/use-subscription) instead. ([#6738](https://github.com/clerk/javascript/pull/6738)) by [@mauricioabreu](https://github.com/mauricioabreu)

### Patch Changes

- Updated dependencies [[`23948dc`](https://github.com/clerk/javascript/commit/23948dc777ec6a17bafbae59c253a93143b0e105), [`82b84fe`](https://github.com/clerk/javascript/commit/82b84fed5f207673071ba7354a17f4a76e101201), [`54b4b5a`](https://github.com/clerk/javascript/commit/54b4b5a5f811f612fadf5c47ffda94a750c57a5e), [`50a8622`](https://github.com/clerk/javascript/commit/50a8622c3579306f15e5d40e5ea72b4fe4384ef7), [`23948dc`](https://github.com/clerk/javascript/commit/23948dc777ec6a17bafbae59c253a93143b0e105)]:
  - @clerk/types@4.86.0
  - @clerk/shared@3.25.0

## 5.46.2

### Patch Changes

- Removed custom menu item logging from UserButton when asProvider is used. ([#6715](https://github.com/clerk/javascript/pull/6715)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`55490c3`](https://github.com/clerk/javascript/commit/55490c31fadc82bdca6cd5f2b22e5e158aaba0cb), [`e8d21de`](https://github.com/clerk/javascript/commit/e8d21de39b591973dad48fc1d1851c4d28b162fe), [`637f2e8`](https://github.com/clerk/javascript/commit/637f2e8768b76aaf756062b6b5b44bf651f66789)]:
  - @clerk/types@4.85.0
  - @clerk/shared@3.24.2

## 5.46.1

### Patch Changes

- Wait for pricing table data to be ready before hiding its fallback. ([#6644](https://github.com/clerk/javascript/pull/6644)) by [@panteliselef](https://github.com/panteliselef)

- [Experimental] Fix issue with property access for state proxy ([#6700](https://github.com/clerk/javascript/pull/6700)) by [@dstaley](https://github.com/dstaley)

- Updated dependencies [[`fced4fc`](https://github.com/clerk/javascript/commit/fced4fc869bb21c77826dfaf281b6640e0f0c006), [`e6e19d2`](https://github.com/clerk/javascript/commit/e6e19d2d2f3b2c4617b25f53830216a1d550e616), [`1b1e8b1`](https://github.com/clerk/javascript/commit/1b1e8b1fd33b787f956b17b193e5fd0a4cdc6cec)]:
  - @clerk/types@4.84.1
  - @clerk/shared@3.24.1

## 5.46.0

### Minor Changes

- [Experimental] Signal phone code support ([#6650](https://github.com/clerk/javascript/pull/6650)) by [@dstaley](https://github.com/dstaley)

- [Experimental] Signal MFA support ([#6659](https://github.com/clerk/javascript/pull/6659)) by [@dstaley](https://github.com/dstaley)

### Patch Changes

- Updated dependencies [[`2a82737`](https://github.com/clerk/javascript/commit/2a8273705b9764e1a4613d5a0dbb738d0b156c05), [`cda5d7b`](https://github.com/clerk/javascript/commit/cda5d7b79b28dc03ec794ea54e0feb64b148cdd2), [`ba25a5b`](https://github.com/clerk/javascript/commit/ba25a5b5a3fa686a65f52e221d9d1712a389fea9), [`a50cfc8`](https://github.com/clerk/javascript/commit/a50cfc8f1dd168b436499e32fc8b0fc41d28bbff), [`377f67b`](https://github.com/clerk/javascript/commit/377f67b8e552d1a19efbe4530e9306675b7f8eab), [`65b12ee`](https://github.com/clerk/javascript/commit/65b12eeeb57ee80cdd8c36c5949d51f1227a413e), [`263722e`](https://github.com/clerk/javascript/commit/263722e61fd27403b4c8d9794880686771e123f9)]:
  - @clerk/types@4.84.0
  - @clerk/shared@3.24.0

## 5.45.0

### Minor Changes

- Added support for authentication with Base ([#6556](https://github.com/clerk/javascript/pull/6556)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Updated dependencies [[`600c648`](https://github.com/clerk/javascript/commit/600c648d4087a823341041c90018797fbc0033f0)]:
  - @clerk/shared@3.23.0
  - @clerk/types@4.83.0

## 5.44.0

### Minor Changes

- [Experimental] Signal transfer support ([#6614](https://github.com/clerk/javascript/pull/6614)) by [@dstaley](https://github.com/dstaley)

- [Experimental] Signals `isLoaded` removal ([#6605](https://github.com/clerk/javascript/pull/6605)) by [@dstaley](https://github.com/dstaley)

### Patch Changes

- Remove unused `__internal_hasAfterAuthFlows` property ([#6609](https://github.com/clerk/javascript/pull/6609)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Improve assertion error for requiring active organization. ([#6606](https://github.com/clerk/javascript/pull/6606)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`d52714e`](https://github.com/clerk/javascript/commit/d52714e4cb7f369c74826cd4341c58eb1900abe4), [`ce49740`](https://github.com/clerk/javascript/commit/ce49740d474d6dd9da5096982ea4e9f14cf68f09), [`2ed539c`](https://github.com/clerk/javascript/commit/2ed539cc7f08ed4d70c33621563ad386ea8becc5), [`deaafe4`](https://github.com/clerk/javascript/commit/deaafe449773632d690aa2f8cafaf959392622b9), [`a26ecae`](https://github.com/clerk/javascript/commit/a26ecae09fd06cd34f094262f038a8eefbb23f7d), [`c16a7a5`](https://github.com/clerk/javascript/commit/c16a7a5837fc15e0e044baf9c809b8da6fbac795), [`05b6d65`](https://github.com/clerk/javascript/commit/05b6d65c0bc5736443325a5defee4c263ef196af)]:
  - @clerk/types@4.82.0
  - @clerk/shared@3.22.1

## 5.43.1

### Patch Changes

- Fix incorrect redirect when completing session tasks within `SignIn` and `SignUp` components ([#6580](https://github.com/clerk/javascript/pull/6580)) by [@iagodahlem](https://github.com/iagodahlem)

- Updated dependencies [[`e52bf8e`](https://github.com/clerk/javascript/commit/e52bf8ebef74a9e123c69b69acde1340c01d32d7), [`c043c19`](https://github.com/clerk/javascript/commit/c043c1919854aaa5b9cf7f6df5bb517f5617f7a1), [`c28d29c`](https://github.com/clerk/javascript/commit/c28d29c79bb4f144d782313ca72df7db91a77340), [`172e054`](https://github.com/clerk/javascript/commit/172e054a3511be12d16ba19037db320c2d9838bf)]:
  - @clerk/types@4.81.0
  - @clerk/shared@3.22.0

## 5.43.0

### Minor Changes

- [Experimental] Signal implementation for SignUp ([#6568](https://github.com/clerk/javascript/pull/6568)) by [@dstaley](https://github.com/dstaley)

### Patch Changes

- Updated dependencies [[`8dc6bad`](https://github.com/clerk/javascript/commit/8dc6bad5c7051b59bd8c73e65d497f6a974bb1c3), [`aa6a3c3`](https://github.com/clerk/javascript/commit/aa6a3c3d3ba2de67a468c996cbf0bff43a09ddb8), [`db50c47`](https://github.com/clerk/javascript/commit/db50c4734920ada6002de8c62c994047eb6cb5a0)]:
  - @clerk/types@4.80.0
  - @clerk/shared@3.21.2

## 5.42.2

### Patch Changes

- Updated dependencies [[`413468c`](https://github.com/clerk/javascript/commit/413468c9b9c8fb7576f8e4cbdccff98784e33fef), [`7b7eb1f`](https://github.com/clerk/javascript/commit/7b7eb1fc0235249c5c179239078294118f2947cd)]:
  - @clerk/shared@3.21.1
  - @clerk/types@4.79.0

## 5.42.1

### Patch Changes

- Updated dependencies [[`5b24129`](https://github.com/clerk/javascript/commit/5b24129ddcfc2f7dc6eb79d8c818b4ff97c68e9a)]:
  - @clerk/shared@3.21.0
  - @clerk/types@4.78.0

## 5.42.0

### Minor Changes

- Rename `RedirectToTask` control component to `RedirectToTasks` ([#6486](https://github.com/clerk/javascript/pull/6486)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Updated dependencies [[`4db1e58`](https://github.com/clerk/javascript/commit/4db1e58d70b60e1e236709b507666715d571e925), [`69498df`](https://github.com/clerk/javascript/commit/69498dfca3e6bb388eb8c94313eac06347dd5a27), [`59f1559`](https://github.com/clerk/javascript/commit/59f15593bab708b9e13eebfff6780c2d52b31b0a)]:
  - @clerk/types@4.77.0
  - @clerk/shared@3.20.1

## 5.41.1

### Patch Changes

- Updated dependencies [[`15fe106`](https://github.com/clerk/javascript/commit/15fe1060f730a6a4391f3d2451d23edd3218e1ae), [`173837c`](https://github.com/clerk/javascript/commit/173837c2526aa826b7981ee8d6d4f52c00675da5), [`8b52d7a`](https://github.com/clerk/javascript/commit/8b52d7ae19407e8ab5a5451bd7d34b6bc38417de), [`854dde8`](https://github.com/clerk/javascript/commit/854dde88e642c47b5a29ac8f576c8c1976e5d067), [`ae2e2d6`](https://github.com/clerk/javascript/commit/ae2e2d6b336be6b596cc855e549843beb5bfd2a1), [`037f25a`](https://github.com/clerk/javascript/commit/037f25a8171888168913b186b7edf871e0aaf197), [`f8b38b7`](https://github.com/clerk/javascript/commit/f8b38b7059e498fef3ac1271346be0710aa31c76)]:
  - @clerk/types@4.76.0
  - @clerk/shared@3.20.0

## 5.41.0

### Minor Changes

- [Experimental] Signal Errors ([#6495](https://github.com/clerk/javascript/pull/6495)) by [@dstaley](https://github.com/dstaley)

- Remove `treatPendingAsSignedOut` from Clerk options ([#6497](https://github.com/clerk/javascript/pull/6497)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Updated dependencies [[`b72a3dd`](https://github.com/clerk/javascript/commit/b72a3dda2467720e5dc8cab3e7e6a110f3beb79b), [`d93b0ed`](https://github.com/clerk/javascript/commit/d93b0edf4adc57d48a26cb08444192887ccec659), [`6459f7d`](https://github.com/clerk/javascript/commit/6459f7dabe5f163f48ed73106bb901d8187da3e2), [`0ff648a`](https://github.com/clerk/javascript/commit/0ff648aeac0e2f5481596a98c8046d9d58a7bf75), [`9084759`](https://github.com/clerk/javascript/commit/90847593300be605e1ee1c06dac147ce68b25dc7)]:
  - @clerk/types@4.75.0
  - @clerk/shared@3.19.0

## 5.40.0

### Minor Changes

- [Billing Beta] Update `PlanDetailsProps` to reflect that either `planId` or `plan` is allowed. ([#6472](https://github.com/clerk/javascript/pull/6472)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Introduce `TaskChooseOrganization` component which replaces `TaskSelectOrganization` with a new UI that make the experience similar to the previous `SignIn` and `SignUp` steps ([#6446](https://github.com/clerk/javascript/pull/6446)) by [@LauraBeatris](https://github.com/LauraBeatris)

- [Experimental] Signals ([#6450](https://github.com/clerk/javascript/pull/6450)) by [@dstaley](https://github.com/dstaley)

- Updated dependencies [[`1ad16da`](https://github.com/clerk/javascript/commit/1ad16daa49795a861ae277001831230580b6b9f4), [`4edef81`](https://github.com/clerk/javascript/commit/4edef81dd423a0471e3f579dd6b36094aa8546aa), [`696f8e1`](https://github.com/clerk/javascript/commit/696f8e11a3e5391e6b5a97d98e929b8973575b9a), [`f318d22`](https://github.com/clerk/javascript/commit/f318d22cf83caaef272bcf532561a03ca72575e7), [`1cc66ab`](https://github.com/clerk/javascript/commit/1cc66aba1c0adac24323876e4cc3d96be888b07b)]:
  - @clerk/types@4.74.0
  - @clerk/shared@3.18.1

## 5.39.0

### Minor Changes

- [Billing Beta] Stricter return type of `useCheckout` to improve inference of other properties. ([#6473](https://github.com/clerk/javascript/pull/6473)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`9368daf`](https://github.com/clerk/javascript/commit/9368dafb119b5a8ec6a9d6d82270e72bab6d8f1e), [`f93965f`](https://github.com/clerk/javascript/commit/f93965f64c81030f9fcf9d1cc4e4984d30cd12ec), [`7b6dcee`](https://github.com/clerk/javascript/commit/7b6dceea5bfd7f1cc1bf24126aa715307e24ae7f), [`ef87617`](https://github.com/clerk/javascript/commit/ef87617ae1fd125c806a33bfcfdf09c885319fa8)]:
  - @clerk/shared@3.18.0
  - @clerk/types@4.73.0

## 5.38.1

### Patch Changes

- Fixes a bug which cause initialization of a payment method to never fire. ([#6436](https://github.com/clerk/javascript/pull/6436)) by [@panteliselef](https://github.com/panteliselef)

- Resolve dynamic menu items losing icons ([#6443](https://github.com/clerk/javascript/pull/6443)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`7a46679`](https://github.com/clerk/javascript/commit/7a46679a004739a7f712097c5779e9f5c068722e), [`05cc5ec`](https://github.com/clerk/javascript/commit/05cc5ecd82ecdbcc9922d3286224737a81813be0), [`22c35ef`](https://github.com/clerk/javascript/commit/22c35efb59226df2efaa2891fa4775c13312f4c6), [`e8d816a`](https://github.com/clerk/javascript/commit/e8d816a3350e862c3e9e1d4f8c96c047a0a016a2), [`aa9f185`](https://github.com/clerk/javascript/commit/aa9f185e21b58f8a6e03ea44ce29ee09ad2477d9), [`af0e123`](https://github.com/clerk/javascript/commit/af0e12393c9412281626e20dafb1b3a15558f6d9), [`3d1d871`](https://github.com/clerk/javascript/commit/3d1d8711405646cf3c2aabe99e08337a1028703a)]:
  - @clerk/shared@3.17.0
  - @clerk/types@4.72.0

## 5.38.0

### Minor Changes

- Introduce `<RedirectToTask />` component ([#6416](https://github.com/clerk/javascript/pull/6416)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Updated dependencies [[`e404456`](https://github.com/clerk/javascript/commit/e4044566bca81f63c8e9c630fdec0f498ad6fc08), [`2803133`](https://github.com/clerk/javascript/commit/28031330a9810946feb44b93be10c067fb3b63ba), [`f1d9d34`](https://github.com/clerk/javascript/commit/f1d9d3482a796dd5f7796ede14159850e022cba2), [`d58b959`](https://github.com/clerk/javascript/commit/d58b9594cf65158e87dbaa90d632c45f543373e1), [`822ba1f`](https://github.com/clerk/javascript/commit/822ba1fd5e7daf665120cf183e4600a227098d53), [`d4d2612`](https://github.com/clerk/javascript/commit/d4d2612483baf356c389ef0ba5084059025481f2)]:
  - @clerk/types@4.71.0
  - @clerk/shared@3.16.0

## 5.37.0

### Minor Changes

- Expose commerce hooks and components under the experimental module. ([#6383](https://github.com/clerk/javascript/pull/6383)) by [@panteliselef](https://github.com/panteliselef)
  - PaymentElementProvider,
  - usePaymentElement,
  - PaymentElement,
  - usePaymentAttempts,
  - useStatements,
  - usePaymentMethods,
  - usePlans,
  - useSubscription,
  - CheckoutProvider,
  - useCheckout,

### Patch Changes

- Updated dependencies [[`b0fdc9e`](https://github.com/clerk/javascript/commit/b0fdc9eaf764ca0c17cbe0810b7d240f6d9db0b6)]:
  - @clerk/types@4.70.1
  - @clerk/shared@3.15.1

## 5.36.0

### Minor Changes

- Expose `<CheckoutButton/>`, `<SubscriptionDetailsButton/>`, `<PlanDetailsButton/>` from `@clerk/clerk-react/experimental`. ([#6365](https://github.com/clerk/javascript/pull/6365)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`cd59c0e`](https://github.com/clerk/javascript/commit/cd59c0e5512a341dd8fb420aca583333c8243aa5), [`cd59c0e`](https://github.com/clerk/javascript/commit/cd59c0e5512a341dd8fb420aca583333c8243aa5)]:
  - @clerk/types@4.70.0
  - @clerk/shared@3.15.0

## 5.35.4

### Patch Changes

- Introduce `__internal_hasAfterAuthFlows` flag ([#6366](https://github.com/clerk/javascript/pull/6366)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`fecc99d`](https://github.com/clerk/javascript/commit/fecc99d43cb7db5b99863829acb234cbce0da264), [`959d63d`](https://github.com/clerk/javascript/commit/959d63de27e5bfe27b46699b441dfd4e48616bf8), [`10e1060`](https://github.com/clerk/javascript/commit/10e10605b18a58f33a93caed058159c190678e74), [`92c44dd`](https://github.com/clerk/javascript/commit/92c44dd9d51e771a928a8da7004bdb8f8bdbaf58), [`a04a8f5`](https://github.com/clerk/javascript/commit/a04a8f5f81241ee41d93cd64793beca9d6296abb), [`c61855c`](https://github.com/clerk/javascript/commit/c61855c51d9c129d48c4543da3719939ad82f623), [`43ea069`](https://github.com/clerk/javascript/commit/43ea069c570dc64503fc82356ad28a2e43689d45)]:
  - @clerk/types@4.69.0
  - @clerk/shared@3.14.0

## 5.35.3

### Patch Changes

- Ensure proper typing for `SignUpButton` and only allow `unsafeMetadata={...}` when `mode="modal"` ([#6340](https://github.com/clerk/javascript/pull/6340)) by [@tmilewski](https://github.com/tmilewski)

- Updated dependencies [[`d2f6f9e`](https://github.com/clerk/javascript/commit/d2f6f9e02036a4288916fcce14f24be5d56561c4), [`a329836`](https://github.com/clerk/javascript/commit/a329836a6c64f0a551a277ccae07043456a70523), [`6041c39`](https://github.com/clerk/javascript/commit/6041c39a31e787a6065dbc3f21e1c569982a06de), [`3f1270d`](https://github.com/clerk/javascript/commit/3f1270db86a21ead0ed6f0bd4f9986485203e973)]:
  - @clerk/types@4.68.0
  - @clerk/shared@3.13.0

## 5.35.2

### Patch Changes

- Do not trigger after-auth navigation from `useMultisessionActions` ([#6323](https://github.com/clerk/javascript/pull/6323)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`2a90b68`](https://github.com/clerk/javascript/commit/2a90b689550ae960496c9292ca23e0225e3425cd), [`af50905`](https://github.com/clerk/javascript/commit/af50905ea497ed3286c8c4c374498e06ca6ee82b)]:
  - @clerk/types@4.67.0
  - @clerk/shared@3.12.3

## 5.35.1

### Patch Changes

- Updated dependencies [[`8ee859c`](https://github.com/clerk/javascript/commit/8ee859ce00d1d5747c14a80fe7166303e64a4f1f)]:
  - @clerk/shared@3.12.2
  - @clerk/types@4.66.1

## 5.35.0

### Minor Changes

- Extract `SubscriptionDetails`, into its own internal component, out of existing (also internal) `PlanDetails` component. ([#6148](https://github.com/clerk/javascript/pull/6148)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`025e304`](https://github.com/clerk/javascript/commit/025e304c4d6402dfd750ee51ac9c8fc2dea1f353), [`dedf487`](https://github.com/clerk/javascript/commit/dedf48703986d547d5b28155b0182a51030cffeb), [`b96114e`](https://github.com/clerk/javascript/commit/b96114e438638896ba536bb7a17b09cdadcd9407)]:
  - @clerk/types@4.66.0
  - @clerk/shared@3.12.1

## 5.34.0

### Minor Changes

- [Billing Beta]: Introduce experimental `useCheckout()` hook and `<CheckoutProvider/>`. ([#6195](https://github.com/clerk/javascript/pull/6195)) by [@panteliselef](https://github.com/panteliselef)

- [Billing Beta]: Introduce experimental `Clerk.__experimental_checkout()` for managing the state of a checkout session. ([#6195](https://github.com/clerk/javascript/pull/6195)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`2be6a53`](https://github.com/clerk/javascript/commit/2be6a53959cb8a3127c2eb5d1aeb4248872d2c24), [`f6a1c35`](https://github.com/clerk/javascript/commit/f6a1c35bd5fb4bd2a3cd45bdaf9defe6be59d4a9), [`6826d0b`](https://github.com/clerk/javascript/commit/6826d0bbd03e844d49224565878a4326684f06b4), [`f6a1c35`](https://github.com/clerk/javascript/commit/f6a1c35bd5fb4bd2a3cd45bdaf9defe6be59d4a9), [`97a07f7`](https://github.com/clerk/javascript/commit/97a07f78b4b0c3dc701a2610097ec7d6232f79e7)]:
  - @clerk/types@4.65.0
  - @clerk/shared@3.12.0

## 5.33.0

### Minor Changes

- Export experimental hooks and components for PaymentElement ([#6180](https://github.com/clerk/javascript/pull/6180)) by [@panteliselef](https://github.com/panteliselef)
  - `__experimental_usePaymentElement`
  - `__experimental_PaymentElementProvider`
  - `__experimental_PaymentElement`

### Patch Changes

- Updated dependencies [[`f42c4fe`](https://github.com/clerk/javascript/commit/f42c4fedfdab873129b876eba38b3677f190b460), [`ec207dc`](https://github.com/clerk/javascript/commit/ec207dcd2a13340cfa4e3b80d3d52d1b4e7d5f23), [`ec207dc`](https://github.com/clerk/javascript/commit/ec207dcd2a13340cfa4e3b80d3d52d1b4e7d5f23), [`0e0cc1f`](https://github.com/clerk/javascript/commit/0e0cc1fa85347d727a4fd3718fe45b0f0244ddd9)]:
  - @clerk/types@4.64.0
  - @clerk/shared@3.11.0

## 5.32.4

### Patch Changes

- Updated dependencies [[`abd8446`](https://github.com/clerk/javascript/commit/abd844609dad263d974da7fbf5e3575afce73abe), [`8387a39`](https://github.com/clerk/javascript/commit/8387a392a04906f0f10d84c61cfee36f23942f85), [`f2a6641`](https://github.com/clerk/javascript/commit/f2a66419b1813abc86ea98fde7475861995a1486)]:
  - @clerk/shared@3.10.2
  - @clerk/types@4.63.0

## 5.32.3

### Patch Changes

- Extract internal `ProtectProps` type to shared types to eliminate duplication across SDKs ([#6197](https://github.com/clerk/javascript/pull/6197)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`02a1f42`](https://github.com/clerk/javascript/commit/02a1f42dfdb28ea956d6cbd3fbabe10093d2fad8), [`edc0bfd`](https://github.com/clerk/javascript/commit/edc0bfdae929dad78a99dfd6275aad947d9ddd73)]:
  - @clerk/shared@3.10.1
  - @clerk/types@4.62.1

## 5.32.2

### Patch Changes

- Updated dependencies [[`f1be1fe`](https://github.com/clerk/javascript/commit/f1be1fe3d575c11acd04fc7aadcdec8f89829894), [`bffb42a`](https://github.com/clerk/javascript/commit/bffb42aaf266a188b9ae7d16ace3024d468a3bd4)]:
  - @clerk/types@4.62.0
  - @clerk/shared@3.10.0

## 5.32.1

### Patch Changes

- Updated dependencies [[`b495279`](https://github.com/clerk/javascript/commit/b4952796e3c7dee4ab4726de63a17b7f4265ce37), [`c3fa15d`](https://github.com/clerk/javascript/commit/c3fa15d60642b4fcbcf26e21caaca0fc60975795), [`52d5e57`](https://github.com/clerk/javascript/commit/52d5e5768d54725b4d20d028135746493e05d44c), [`15a945c`](https://github.com/clerk/javascript/commit/15a945c02a9f6bc8d2f7d1e3534217100bf45936), [`72629b0`](https://github.com/clerk/javascript/commit/72629b06fb1fe720fa2a61462306a786a913e9a8)]:
  - @clerk/types@4.61.0
  - @clerk/shared@3.9.8

## 5.32.0

### Minor Changes

- Add `<APIKeys />` component. This component will initially be in early access and not recommended for production usage just yet. ([#5858](https://github.com/clerk/javascript/pull/5858)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Updated dependencies [[`19e9e11`](https://github.com/clerk/javascript/commit/19e9e11af04f13fd12975fbf7016fe0583202056), [`18bcb64`](https://github.com/clerk/javascript/commit/18bcb64a3e8b6d352d7933ed094d68214e6e80fb), [`138f733`](https://github.com/clerk/javascript/commit/138f733f13121487268a4f96e6eb2cffedc6e238), [`48be55b`](https://github.com/clerk/javascript/commit/48be55b61a86e014dd407414764d24bb43fd26f3), [`2c6f805`](https://github.com/clerk/javascript/commit/2c6f805a9e6e4685990f9a8abc740b2d0859a453), [`97749d5`](https://github.com/clerk/javascript/commit/97749d570bc687c7e05cd800a50e0ae4180a371d)]:
  - @clerk/types@4.60.1
  - @clerk/shared@3.9.7

## 5.31.9

### Patch Changes

- Initialize isomorphic clerk with `useRef`. Avoid memoizing the singleton, instead use a reference to store it, and then destroy it. ([#6024](https://github.com/clerk/javascript/pull/6024)) by [@panteliselef](https://github.com/panteliselef)

- Introduce internal `<OAuthConsent />` component to be used internally in the machine auth OAuth flow in account portal. ([#6021](https://github.com/clerk/javascript/pull/6021)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`d8fa5d9`](https://github.com/clerk/javascript/commit/d8fa5d9d3d8dc575260d8d2b7c7eeeb0052d0b0d), [`be2e89c`](https://github.com/clerk/javascript/commit/be2e89ca11aa43d48f74c57a5a34e20d85b4003c), [`5644d94`](https://github.com/clerk/javascript/commit/5644d94f711a0733e4970c3f15c24d56cafc8743), [`b578225`](https://github.com/clerk/javascript/commit/b5782258242474c9b0987a3f8349836cd763f24b), [`8838120`](https://github.com/clerk/javascript/commit/8838120596830b88fec1c6c853371dabfec74a0d)]:
  - @clerk/types@4.60.0
  - @clerk/shared@3.9.6

## 5.31.8

### Patch Changes

- Updated dependencies [[`f897773`](https://github.com/clerk/javascript/commit/f89777379da63cf45039c1570b51ba10a400817c), [`2c6a0cc`](https://github.com/clerk/javascript/commit/2c6a0cca6e824bafc6b0d0501784517a5b1f75ea), [`71e6a1f`](https://github.com/clerk/javascript/commit/71e6a1f1024d65b7a09cdc8fa81ce0164e0a34cb)]:
  - @clerk/shared@3.9.5
  - @clerk/types@4.59.3

## 5.31.7

### Patch Changes

- Updated dependencies [[`6ed3dfc`](https://github.com/clerk/javascript/commit/6ed3dfc1bc742ac9d9a2307fe8e4733411cbc0d7)]:
  - @clerk/types@4.59.2
  - @clerk/shared@3.9.4

## 5.31.6

### Patch Changes

- Updated dependencies [[`f237d76`](https://github.com/clerk/javascript/commit/f237d7617e5398ca0ba981e4336cac2191505b00)]:
  - @clerk/shared@3.9.3

## 5.31.5

### Patch Changes

- Updated dependencies [[`c305b31`](https://github.com/clerk/javascript/commit/c305b310e351e9ce2012f805b35e464c3e43e310), [`6bb480e`](https://github.com/clerk/javascript/commit/6bb480ef663a6dfa219bc9546aca087d5d9624d0)]:
  - @clerk/types@4.59.1
  - @clerk/shared@3.9.2

## 5.31.4

### Patch Changes

- Updated dependencies [[`b1337df`](https://github.com/clerk/javascript/commit/b1337dfeae8ccf8622efcf095e3201f9bbf1cefa), [`65f0878`](https://github.com/clerk/javascript/commit/65f08788ee5e56242eee2194c73ba90965c75c97), [`df6fefd`](https://github.com/clerk/javascript/commit/df6fefd05fd2df93f5286d97e546b48911adea7c), [`4282bfa`](https://github.com/clerk/javascript/commit/4282bfa09491225bde7d619fe9a3561062703f69), [`5491491`](https://github.com/clerk/javascript/commit/5491491711e0a8ee37828451c1f603a409de32cf)]:
  - @clerk/types@4.59.0
  - @clerk/shared@3.9.1

## 5.31.3

### Patch Changes

- Updated dependencies [[`1ff6d6e`](https://github.com/clerk/javascript/commit/1ff6d6efbe838b3f7f6977b2b5215c2cafd715f6), [`fbf3cf4`](https://github.com/clerk/javascript/commit/fbf3cf4916469c4e118870bf12efca2d0f77d9d8)]:
  - @clerk/shared@3.9.0
  - @clerk/types@4.58.1

## 5.31.2

### Patch Changes

- Updated dependencies [[`0f5145e`](https://github.com/clerk/javascript/commit/0f5145e164f3d3d5faf57e58162b05e7110d2403), [`afdfd18`](https://github.com/clerk/javascript/commit/afdfd18d645608dec37e52a291a91ba5f42dcbe7), [`b7c51ba`](https://github.com/clerk/javascript/commit/b7c51baac6df1129b468274c9a7f63ca303f16ce), [`437b53b`](https://github.com/clerk/javascript/commit/437b53b67e281d076b5b3f927e11c1d64666d154), [`5217155`](https://github.com/clerk/javascript/commit/52171554250c5c58f4f497b6d3c7416e79ac77da)]:
  - @clerk/types@4.58.0
  - @clerk/shared@3.8.2

## 5.31.1

### Patch Changes

- Updated dependencies [[`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`36fb43f`](https://github.com/clerk/javascript/commit/36fb43f8b35866bdc20680fac58020f036d30d1f), [`e5ac444`](https://github.com/clerk/javascript/commit/e5ac4447f52bb6887ad686feab308fe9daf76e33), [`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`d227805`](https://github.com/clerk/javascript/commit/d22780599a5e29545a3d8309cc411c2e8659beac)]:
  - @clerk/types@4.57.1
  - @clerk/shared@3.8.1

## 5.31.0

### Minor Changes

- Export a new `<PricingTable />` component. This component renders plans for user or organizations and upon selection the end-user is prompted with a checkout form. ([#5833](https://github.com/clerk/javascript/pull/5833)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Mark commerce apis as stable ([#5833](https://github.com/clerk/javascript/pull/5833)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Expose Clerk Billing APIs. ([#5833](https://github.com/clerk/javascript/pull/5833)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  ## Render the pricing table component
  - `Clerk.mountPricingTable`
  - `Clerk.unmountPricingTable`

  ## Manage payment methods
  - `Clerk.[user|organization].initializePaymentSource()`
  - `Clerk.[user|organization].addPaymentSource()`
  - `Clerk.[user|organization].getPaymentSources()`

  ## Billing namespace
  - `Clerk.billing`
    - `Clerk.billing.getPlans()`
    - `Clerk.billing.getSubscriptions()`
    - `Clerk.billing.getInvoices()`
    - `Clerk.billing.startCheckout()`

### Patch Changes

- Rename ` __experimental_nextTask` to `__experimental_navigateToTask` ([#5715](https://github.com/clerk/javascript/pull/5715)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Introduce `checkoutContinueUrl` option. ([#5807](https://github.com/clerk/javascript/pull/5807)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Rename CheckoutProps and PlanDetailsProps to **internal_CheckoutProps and **internal_PlanDetailsProps ([#5838](https://github.com/clerk/javascript/pull/5838)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Rename \_\_experimental_checkoutContinueUrl to checkoutContinueUrl ([#5826](https://github.com/clerk/javascript/pull/5826)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Replace \_\_experimental_PricingTable with PricingTable ([#5828](https://github.com/clerk/javascript/pull/5828)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`db0138f`](https://github.com/clerk/javascript/commit/db0138f3f72aea8cb68a5684a90123f733848f63), [`aa97231`](https://github.com/clerk/javascript/commit/aa97231962e3f472a46135e376159c6ddcf1157b), [`c792f37`](https://github.com/clerk/javascript/commit/c792f37129fd6475d5af95146e9ef0f1c8eff730), [`3bf08a9`](https://github.com/clerk/javascript/commit/3bf08a9e0a9e65496edac5fc3bb22ad7b561df26), [`74cf3b2`](https://github.com/clerk/javascript/commit/74cf3b28cdf622a942aaf99caabfba74b7e856fd), [`037b113`](https://github.com/clerk/javascript/commit/037b113aaedd53d4647d88f1659eb9c14cf6f275), [`c15a412`](https://github.com/clerk/javascript/commit/c15a412169058e2304a51c9e92ffaa7f6bb2a898), [`7726a03`](https://github.com/clerk/javascript/commit/7726a03a7fec4d292b6de2587b84ed4371984c23), [`ed10566`](https://github.com/clerk/javascript/commit/ed1056637624eec5bfd50333407c1e63e34c193b), [`b846a9a`](https://github.com/clerk/javascript/commit/b846a9ab96db6b1d8344a4b693051618865508a8), [`e66c800`](https://github.com/clerk/javascript/commit/e66c8002b82b2902f77e852e16482f5cfb062d2c), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed), [`9c41091`](https://github.com/clerk/javascript/commit/9c41091eb795bce8ffeeeca0264ae841fe07b426), [`29462b4`](https://github.com/clerk/javascript/commit/29462b433eb411ce614e4768e5844cacd00c1975), [`322c43f`](https://github.com/clerk/javascript/commit/322c43f6807a932c3cfaaef1b587b472c80180d2), [`17397f9`](https://github.com/clerk/javascript/commit/17397f95b715bd4fefd7f63c1d351abcf1c8ee16), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed)]:
  - @clerk/types@4.57.0
  - @clerk/shared@3.8.0

## 5.30.4

### Patch Changes

- Updated dependencies [[`9ec0a73`](https://github.com/clerk/javascript/commit/9ec0a7353e9f6ea661c3d7b9542423b6eb1d29e9), [`d9222fc`](https://github.com/clerk/javascript/commit/d9222fc3c21da2bcae30b06f0b1897f526935582)]:
  - @clerk/types@4.56.3
  - @clerk/shared@3.7.8

## 5.30.3

### Patch Changes

- Updated dependencies [[`225b9ca`](https://github.com/clerk/javascript/commit/225b9ca21aba44930872a85d6b112ee2a1b606b9)]:
  - @clerk/types@4.56.2
  - @clerk/shared@3.7.7

## 5.30.2

### Patch Changes

- Updated dependencies [[`387bf62`](https://github.com/clerk/javascript/commit/387bf623406306e0c5c08da937f4930a7ec5e4a5), [`2716622`](https://github.com/clerk/javascript/commit/27166224e12af582298460d438bd7f83ea8e04bf), [`294da82`](https://github.com/clerk/javascript/commit/294da82336e7a345900d7ef9b28f56a7c8864c52)]:
  - @clerk/types@4.56.1
  - @clerk/shared@3.7.6

## 5.30.1

### Patch Changes

- Renames all instances of `SubscriptionDetails` to `PlanDetails` to better reflect the capabilities, use cases, and params of the component. ([#5749](https://github.com/clerk/javascript/pull/5749)) by [@aeliox](https://github.com/aeliox)

- Updated dependencies [[`b02e766`](https://github.com/clerk/javascript/commit/b02e76627e47aec314573586451fa345a089115a), [`5d78b28`](https://github.com/clerk/javascript/commit/5d78b286b63e35fbcf44aac1f7657cbeaba4d659), [`d7f4438`](https://github.com/clerk/javascript/commit/d7f4438fa4bfd04474d5cdb9212ba908568ad6d2), [`5866855`](https://github.com/clerk/javascript/commit/58668550ec91d5511cf775972c54dc485185cc58), [`0007106`](https://github.com/clerk/javascript/commit/00071065998a3676c51e396b4c0afcbf930a9898), [`462b5b2`](https://github.com/clerk/javascript/commit/462b5b271d4e120d58a85818a358b60a6b3c8100), [`447d7a9`](https://github.com/clerk/javascript/commit/447d7a9e133c2a0e7db014bd5837e6ffff08f572), [`2beea29`](https://github.com/clerk/javascript/commit/2beea2957c67bc62446fe24d36332b0a4e850d7d), [`115601d`](https://github.com/clerk/javascript/commit/115601d12fd65dbf3011c0cda368525a2b95bfeb)]:
  - @clerk/types@4.56.0
  - @clerk/shared@3.7.5

## 5.30.0

### Minor Changes

- Export `<__experimental_PricingTable />`. ([#5691](https://github.com/clerk/javascript/pull/5691)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Add details to `<UserButton.*>` error messages indicating that the components must be used within client components. ([#5695](https://github.com/clerk/javascript/pull/5695)) by [@tmilewski](https://github.com/tmilewski)

- Updated dependencies [[`8b25035`](https://github.com/clerk/javascript/commit/8b25035aa49382fe1cd1c6f30ec80e86bcf9d66e)]:
  - @clerk/types@4.55.1
  - @clerk/shared@3.7.4

## 5.29.0

### Minor Changes

- Introduce `useClerk().status` alongside `<ClerkFailed />` and `<ClerkDegraded />`. ([#5476](https://github.com/clerk/javascript/pull/5476)) by [@panteliselef](https://github.com/panteliselef)

  ### `useClerk().status`

  Possible values for `useClerk().status` are:
  - `"loading"`: Set during initialization
  - `"error"`: Set when hotloading clerk-js failed or `Clerk.load()` failed
  - `"ready"`: Set when Clerk is fully operational
  - `"degraded"`: Set when Clerk is partially operational
    The computed value of `useClerk().loaded` is:
  - `true` when `useClerk().status` is either `"ready"` or `"degraded"`.
  - `false` when `useClerk().status` is `"loading"` or `"error"`.

  ### `<ClerkFailed />`

  ```tsx
  <ClerkLoaded>
    <MyCustomSignInForm/>
  </ClerkLoaded>
  <ClerkFailed>
    <ContactSupportBanner/>
  </ClerkFailed>
  ```

  ### `<ClerkDegraded />`

  ```tsx
  <ClerkLoaded>
    <MyCustomPasskeyRegistration />
    <ClerkDegraded>We are experiencing issues, registering a passkey might fail.</ClerkDegraded>
  </ClerkLoaded>
  ```

### Patch Changes

- Add `<SubscriptionsList />` to both UserProfile and OrgProfile components. ([#5658](https://github.com/clerk/javascript/pull/5658)) by [@alexcarpenter](https://github.com/alexcarpenter)

  Introduce experimental method for opening `<SubscriptionDetails />` component.

  ```tsx
  clerk.__experimental_openSubscriptionDetails(...)
  ```

- Updated dependencies [[`33201bf`](https://github.com/clerk/javascript/commit/33201bf972d6a980617d47ebd776bef76f871833), [`4334598`](https://github.com/clerk/javascript/commit/4334598108ff2cfa3c25b5a46117c1c9c65b7974), [`0ae0403`](https://github.com/clerk/javascript/commit/0ae040303d239b75a3221436354a2c2ecdb85aae)]:
  - @clerk/types@4.55.0
  - @clerk/shared@3.7.3

## 5.28.2

### Patch Changes

- Improve JSDoc comments ([#5643](https://github.com/clerk/javascript/pull/5643)) by [@alexisintech](https://github.com/alexisintech)

- Updated dependencies [[`45486ac`](https://github.com/clerk/javascript/commit/45486acebf4d133efb09a3622a738cdbf4e51d66), [`837692a`](https://github.com/clerk/javascript/commit/837692aa40197b1574783ad36d0d017a771c08e1), [`0c00e59`](https://github.com/clerk/javascript/commit/0c00e59ff4714491650ac9480ae3b327c626d30d), [`6a5f644`](https://github.com/clerk/javascript/commit/6a5f6447a36a635d6201f8bb7619fb844ab21b79)]:
  - @clerk/types@4.54.2
  - @clerk/shared@3.7.2

## 5.28.1

### Patch Changes

- Improve JSDoc comments ([#5630](https://github.com/clerk/javascript/pull/5630)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`ab939fd`](https://github.com/clerk/javascript/commit/ab939fdb29150c376280b42f861a188a33f57dcc), [`03284da`](https://github.com/clerk/javascript/commit/03284da6a93a790ce3e3ebbd871c06e19f5a8803), [`7389ba3`](https://github.com/clerk/javascript/commit/7389ba3164ca0d848fb0a9de5d7e9716925fadcc), [`f6ef841`](https://github.com/clerk/javascript/commit/f6ef841125ff21ca8cae731d1f47f3a101d887e1), [`e634830`](https://github.com/clerk/javascript/commit/e6348301ab56a7868f24c1b9a4dd9e1d60f6027b), [`f8887b2`](https://github.com/clerk/javascript/commit/f8887b2cbd145e8e49bec890e8b6e02e34178d6a)]:
  - @clerk/types@4.54.1
  - @clerk/shared@3.7.1

## 5.28.0

### Minor Changes

- Add support for feature or plan based authorization ([#5582](https://github.com/clerk/javascript/pull/5582)) by [@panteliselef](https://github.com/panteliselef)

  ## `useAuth()`

  ### Plan
  - `useAuth().has({ plan: "my-plan" })`

  ### Feature
  - `useAuth().has({ feature: "my-feature" })`

  ### Scoped per user or per org
  - `useAuth().has({ feature: "org:my-feature" })`
  - `useAuth().has({ feature: "user:my-feature" })`
  - `useAuth().has({ plan: "user:my-plan" })`
  - `useAuth().has({ plan: "org:my-plan" })`

  ## `<Protect />`

  ### Plan
  - `<Protect plan="my-plan" />`

  ### Feature
  - `<Protect feature="my-feature" />`

  ### Scoped per user or per org
  - `<Protect feature="org:my-feature" />`
  - `<Protect feature="user:my-feature" />`
  - `<Protect plan="org:my-plan" />`
  - `<Protect plan="user:my-plan" />`

### Patch Changes

- Improve JSDoc comments ([#5578](https://github.com/clerk/javascript/pull/5578)) by [@LekoArts](https://github.com/LekoArts)

- Improve JSDoc comments ([#5596](https://github.com/clerk/javascript/pull/5596)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`e4d04ae`](https://github.com/clerk/javascript/commit/e4d04aea490ab67e3431729398d3f4c46fc3e7e7), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`93068ea`](https://github.com/clerk/javascript/commit/93068ea9eb19d8c8b9c7ade35d0cd860e08049fc), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`103bc03`](https://github.com/clerk/javascript/commit/103bc03571c8845df205f4c6fd0c871c3368d1d0), [`48438b4`](https://github.com/clerk/javascript/commit/48438b409036088701bda7e1e732d6a51bee8cdc), [`196dcb4`](https://github.com/clerk/javascript/commit/196dcb47928bd22a3382197f8594a590f688faee)]:
  - @clerk/types@4.54.0
  - @clerk/shared@3.7.0

## 5.27.0

### Minor Changes

- Introduce `sessionClaims` to useAuth(). ([#5565](https://github.com/clerk/javascript/pull/5565)) by [@panteliselef](https://github.com/panteliselef)
  - thanks to [@ijxy](https://github.com/ijxy) for the [contribution](https://github.com/clerk/javascript/pull/4823)

### Patch Changes

- Updated dependencies [[`70c9db9`](https://github.com/clerk/javascript/commit/70c9db9f3b51ba034f76e0cc4cf338e7b406d9b1), [`554242e`](https://github.com/clerk/javascript/commit/554242e16e50c92a6afb6ed74c681b04b9f113b5), [`cc1f9a0`](https://github.com/clerk/javascript/commit/cc1f9a0adb7771b615b0f2994a5ac571b59889dd), [`8186cb5`](https://github.com/clerk/javascript/commit/8186cb564575ac3ce97079ec203865bf5deb05ee)]:
  - @clerk/shared@3.6.0
  - @clerk/types@4.53.0

## 5.26.2

### Patch Changes

- Updated dependencies [[`3ad3bc8`](https://github.com/clerk/javascript/commit/3ad3bc8380b354b0cd952eb58eb6c07650efa0f2), [`cfa94b8`](https://github.com/clerk/javascript/commit/cfa94b88476608edf8c2486e8ec0d3f3f82e0bfb), [`2033919`](https://github.com/clerk/javascript/commit/203391964857b98dae11944799d1e6328439e838), [`5f3cc46`](https://github.com/clerk/javascript/commit/5f3cc460b6b775b5a74746758b8cff11649a877a)]:
  - @clerk/shared@3.5.0
  - @clerk/types@4.52.0

## 5.26.1

### Patch Changes

- Updated dependencies [[`f6f275d`](https://github.com/clerk/javascript/commit/f6f275dac5ae83ac0c2016a85a6a0cee9513f224)]:
  - @clerk/types@4.51.1
  - @clerk/shared@3.4.1

## 5.26.0

### Minor Changes

- Update `useSession` to handle pending sessions as signed-out by default, with opt-out via `useSession({ treatPendingAsSignedOut: false })` or `<ClerkProvider treatPendingAsSignedOut={false} />` ([#5525](https://github.com/clerk/javascript/pull/5525)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Update `useAuth` to handle pending sessions as signed-out by default, with opt-out via `useAuth({ treatPendingAsSignedOut: false })` or `<ClerkProvider treatPendingAsSignedOut={false} />` ([#5507](https://github.com/clerk/javascript/pull/5507)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Fixes an issue where a race condition was caused by triggering navigations during a call to `setActive`. ([#5515](https://github.com/clerk/javascript/pull/5515)) by [@dstaley](https://github.com/dstaley)

- Introduce `clerk.__internal_openCheckout()` and `clerk.__internal_closeCheckout()` methods and remove `<Checkout />` from within the `<PricingTable />` component. ([#5481](https://github.com/clerk/javascript/pull/5481)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Introduce `treatPendingAsSignedOut` prop to client control components ([#5512](https://github.com/clerk/javascript/pull/5512)) by [@LauraBeatris](https://github.com/LauraBeatris)

  ```tsx
  // Children node only mounts when session is active
  // Example: Organization selection must be completed if enforced
  <SignedIn>
    <p>You have selected an organization!</p>
  </SignedIn>
  ```

  ```tsx
  // Children node mounts for both active and pending session
  <SignedIn treatPendingAsSignedOut={false}>
    <p>You might not have an organization selected</p>
  </SignedIn>
  ```

  ```tsx
  // Children node only mounts when session is active
  // Example: Organization selection must be completed if enforced
  <Protect>
    <p>You have selected an organization!</p>
  </Protect>
  ```

  ```tsx
  // Children node mounts for both active and pending session
  <Protect treatPendingAsSignedOut={false}>
    <p>You might not have an organization selected</p>
  </Protect>
  ```

- Updated dependencies [[`e1ec52b`](https://github.com/clerk/javascript/commit/e1ec52b93038c9cb24e030dc06e53825a384a480), [`bebb6d8`](https://github.com/clerk/javascript/commit/bebb6d8af66b2bb7a4b3bdf96f9d480e65b31ba2), [`d0d5203`](https://github.com/clerk/javascript/commit/d0d5203e4ee9e2e1bed5c00ef0f87f0130f1d298), [`6112420`](https://github.com/clerk/javascript/commit/6112420889f1577fb16d7bfa706aaffe1090093d), [`9b25e31`](https://github.com/clerk/javascript/commit/9b25e311cf5e15f896c7948faa42ace45df364c5)]:
  - @clerk/types@4.51.0
  - @clerk/shared@3.4.0

## 5.25.6

### Patch Changes

- Improve JSDoc comments ([#5457](https://github.com/clerk/javascript/pull/5457)) by [@alexisintech](https://github.com/alexisintech)

- Updated dependencies [[`60a9a51`](https://github.com/clerk/javascript/commit/60a9a51dff7d59e7397536586cf1cfe029bc021b), [`e984494`](https://github.com/clerk/javascript/commit/e984494416dda9a6f04acaaba61f8c2683090961), [`ec4521b`](https://github.com/clerk/javascript/commit/ec4521b4fe56602f524a0c6d1b09d21aef5d8bd0), [`38828ae`](https://github.com/clerk/javascript/commit/38828ae58d6d4e8e3c60945284930179b2b6bb40), [`f30fa75`](https://github.com/clerk/javascript/commit/f30fa750754f19030f932a666d2bdbdf0d86743d), [`9c68678`](https://github.com/clerk/javascript/commit/9c68678e87047e6312b708b775ebfb23a3e22f8a), [`619cde8`](https://github.com/clerk/javascript/commit/619cde8c532d635d910ebbc08ad6abcc025694b4)]:
  - @clerk/shared@3.3.0
  - @clerk/types@4.50.2

## 5.25.5

### Patch Changes

- Updated dependencies [[`e20fb6b`](https://github.com/clerk/javascript/commit/e20fb6b397fb69c9d5af4e321267b82f12a5f127), [`77e6462`](https://github.com/clerk/javascript/commit/77e64628560cab688af214edb5922e67cd68a951)]:
  - @clerk/shared@3.2.3
  - @clerk/types@4.50.1

## 5.25.4

### Patch Changes

- Derive session status from server-side state ([#5447](https://github.com/clerk/javascript/pull/5447)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`1da28a2`](https://github.com/clerk/javascript/commit/1da28a28bf602069b433c15b92df21f682779294), [`a9b618d`](https://github.com/clerk/javascript/commit/a9b618dfa97a0dacc462186c8b2588ad5ddb6902), [`f20dc15`](https://github.com/clerk/javascript/commit/f20dc159f542449e7f5b437b70d3eb3ba04d6975), [`4d9f1ee`](https://github.com/clerk/javascript/commit/4d9f1ee8c22fe1e4a166ff054d0af4d37b829f0a)]:
  - @clerk/types@4.50.0
  - @clerk/shared@3.2.2

## 5.25.3

### Patch Changes

- Updated dependencies [[`466ed13`](https://github.com/clerk/javascript/commit/466ed136af73b59b267d92ad3296039d1c3a4fcc)]:
  - @clerk/types@4.49.2
  - @clerk/shared@3.2.1

## 5.25.2

### Patch Changes

- Updated dependencies [[`892bc0e`](https://github.com/clerk/javascript/commit/892bc0eee9e0bb04d327eb84b44201fa34806483)]:
  - @clerk/shared@3.2.0

## 5.25.1

### Patch Changes

- Export `isReverificationCancelledError` error helper ([#5396](https://github.com/clerk/javascript/pull/5396)) by [@octoper](https://github.com/octoper)

- Introduce `__experimental_nextTask` method for navigating to next tasks on a after-auth flow ([#5377](https://github.com/clerk/javascript/pull/5377)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`3910ebe`](https://github.com/clerk/javascript/commit/3910ebea85817273f18fd2f3f142dd1c728e2220), [`e513333`](https://github.com/clerk/javascript/commit/e5133330a196c5c3742634cc9c3d3233ff488b0d)]:
  - @clerk/types@4.49.1
  - @clerk/shared@3.1.0

## 5.25.0

### Minor Changes

- Navigate to tasks on after sign-in/sign-up ([#5280](https://github.com/clerk/javascript/pull/5280)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Deprecate out of date jwt types in favour of existing that are up-to-date. ([#5354](https://github.com/clerk/javascript/pull/5354)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Improve JSDoc documentation ([#5372](https://github.com/clerk/javascript/pull/5372)) by [@LekoArts](https://github.com/LekoArts)

- Introduce experimental billing APIs and components ([#5248](https://github.com/clerk/javascript/pull/5248)) by [@aeliox](https://github.com/aeliox)

- Updated dependencies [[`725918d`](https://github.com/clerk/javascript/commit/725918df2e74cea15e9b748aaf103a52df8e8500), [`91d0f0b`](https://github.com/clerk/javascript/commit/91d0f0b0dccab7168ad4dc06c8629808938c235f), [`9572bf5`](https://github.com/clerk/javascript/commit/9572bf5bdfb7dc309ec8714989b98ab12174965b), [`39bbc51`](https://github.com/clerk/javascript/commit/39bbc5189a33dc6cebdc269ac2184dc4ffff2534), [`3dddcda`](https://github.com/clerk/javascript/commit/3dddcda191d8f8d6a9b02464f1f6374d3c6aacb9), [`7524943`](https://github.com/clerk/javascript/commit/7524943300d7e693d61cc1820b520abfadec1c64), [`150b5c8`](https://github.com/clerk/javascript/commit/150b5c89477abb0feab15e0a886179473f653cac), [`23c931e`](https://github.com/clerk/javascript/commit/23c931e9e95e6de992549ad499b477aca9a9c344), [`730262f`](https://github.com/clerk/javascript/commit/730262f0f973923c8749b09078c80c2fc966a8ec), [`0b18bb1`](https://github.com/clerk/javascript/commit/0b18bb1fe6fa3ded97547bb6b4d2c73030aad329), [`021bc5f`](https://github.com/clerk/javascript/commit/021bc5f40044d34e49956ce3c9b61d833d815b42), [`1a61390`](https://github.com/clerk/javascript/commit/1a61390d3482bd4af58508b972ad89dea56fa224)]:
  - @clerk/types@4.49.0
  - @clerk/shared@3.0.2

## 5.24.2

### Patch Changes

- Improve JSDoc documentation ([#5296](https://github.com/clerk/javascript/pull/5296)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`75879672c5805bfba1caca906ac0729497744164`](https://github.com/clerk/javascript/commit/75879672c5805bfba1caca906ac0729497744164), [`7ec95a7e59033600958aca4b86f3bcd5da947dec`](https://github.com/clerk/javascript/commit/7ec95a7e59033600958aca4b86f3bcd5da947dec), [`3c225d90227141dc62d955e76c7f8e0202524bc7`](https://github.com/clerk/javascript/commit/3c225d90227141dc62d955e76c7f8e0202524bc7), [`2a66c16af08573000bb619607346ac420cd4ce56`](https://github.com/clerk/javascript/commit/2a66c16af08573000bb619607346ac420cd4ce56)]:
  - @clerk/shared@3.0.1
  - @clerk/types@4.48.0

## 5.24.1

### Patch Changes

- Enhance RedirectToSignIn session check for compatibility with older clerk-js versions ([#5261](https://github.com/clerk/javascript/pull/5261)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 5.24.0

### Minor Changes

- Surface new `pending` session as a signed-in state ([#5136](https://github.com/clerk/javascript/pull/5136)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Refactors `IsomorphicClerk` types to reduce unnecessary duplication between it and `Clerk`. Also relies more on the source types from `Clerk` to ensure `IsomorphicClerk` types match. ([#5197](https://github.com/clerk/javascript/pull/5197)) by [@brkalow](https://github.com/brkalow)

- Updated dependencies [[`28179323d9891bd13625e32c5682a3276e73cdae`](https://github.com/clerk/javascript/commit/28179323d9891bd13625e32c5682a3276e73cdae), [`7ae77b74326e378bf161e29886ee82e1556d9840`](https://github.com/clerk/javascript/commit/7ae77b74326e378bf161e29886ee82e1556d9840), [`c5c246ce91c01db9f1eaccbd354f646bcd24ec0a`](https://github.com/clerk/javascript/commit/c5c246ce91c01db9f1eaccbd354f646bcd24ec0a), [`bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a`](https://github.com/clerk/javascript/commit/bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a), [`382c30240f563e58bc4d4832557c6825da40ce7f`](https://github.com/clerk/javascript/commit/382c30240f563e58bc4d4832557c6825da40ce7f)]:
  - @clerk/types@4.47.0
  - @clerk/shared@3.0.0

## 5.23.0

### Minor Changes

- Introduce `EmailLinkErrorCodeStatus` to support users in custom flows and mark `EmailLinkErrorCode` as deprecated. ([#5142](https://github.com/clerk/javascript/pull/5142)) by [@alexcarpenter](https://github.com/alexcarpenter)

  ```diff
  - import { EmailLinkErrorCode } from '@clerk/nextjs/errors'
  + import { EmailLinkErrorCodeStatus } from '@clerk/nextjs/errors'
  ```

### Patch Changes

- Fix an infinity re-render issue in `UserProfileModal` when we pass `userProfileProps` in `<UserButton />` and we have `customMenuItems` and `customPages` ([#5145](https://github.com/clerk/javascript/pull/5145)) by [@nikospapcom](https://github.com/nikospapcom)

- Updated dependencies [[`d76c4699990b8477745c2584b1b98d5c92f9ace6`](https://github.com/clerk/javascript/commit/d76c4699990b8477745c2584b1b98d5c92f9ace6), [`a9b0087fca3f427f65907b358d9b5bc0c95921d8`](https://github.com/clerk/javascript/commit/a9b0087fca3f427f65907b358d9b5bc0c95921d8), [`92d17d7c087470b262fa5407cb6720fe6b17d333`](https://github.com/clerk/javascript/commit/92d17d7c087470b262fa5407cb6720fe6b17d333)]:
  - @clerk/shared@2.22.0
  - @clerk/types@4.46.1

## 5.22.13

### Patch Changes

- Exclude `__internal_addNavigationListener` from `IsomorphicClerk`. ([#5092](https://github.com/clerk/javascript/pull/5092)) by [@panteliselef](https://github.com/panteliselef)

- Add the ability to specify an appearance for modal component usages. ([#5125](https://github.com/clerk/javascript/pull/5125)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`dd2cbfe9f30358b6b298901bb52fa378b0acdca3`](https://github.com/clerk/javascript/commit/dd2cbfe9f30358b6b298901bb52fa378b0acdca3), [`570d8386f6aa596bf7bb1659bdddb8dd4d992b1d`](https://github.com/clerk/javascript/commit/570d8386f6aa596bf7bb1659bdddb8dd4d992b1d)]:
  - @clerk/types@4.46.0
  - @clerk/shared@2.21.1

## 5.22.12

### Patch Changes

- Updated dependencies [[`f41081c563ddd2afc05b837358e0de087ae0c895`](https://github.com/clerk/javascript/commit/f41081c563ddd2afc05b837358e0de087ae0c895), [`767ac85fe6ce0ee0594c923e9af701bb05f40a0b`](https://github.com/clerk/javascript/commit/767ac85fe6ce0ee0594c923e9af701bb05f40a0b), [`225b38c7187d31fc755155ea99834ca03894d36b`](https://github.com/clerk/javascript/commit/225b38c7187d31fc755155ea99834ca03894d36b), [`429f1bfe5f7a554ab1fdf265475ba6c8b3f78472`](https://github.com/clerk/javascript/commit/429f1bfe5f7a554ab1fdf265475ba6c8b3f78472)]:
  - @clerk/shared@2.21.0
  - @clerk/types@4.45.1

## 5.22.11

### Patch Changes

- Fix an issue where `<UserButton />` wouldn't update when custom menu item props changed ([#5069](https://github.com/clerk/javascript/pull/5069)) by [@nikospapcom](https://github.com/nikospapcom)

## 5.22.10

### Patch Changes

- Updated dependencies [[`d3152be7f01fbb5ca26aeddc2437021f4b7ecc83`](https://github.com/clerk/javascript/commit/d3152be7f01fbb5ca26aeddc2437021f4b7ecc83), [`f976349243da2b75023e59e802460e6f3592ebbd`](https://github.com/clerk/javascript/commit/f976349243da2b75023e59e802460e6f3592ebbd)]:
  - @clerk/types@4.45.0
  - @clerk/shared@2.20.18

## 5.22.9

### Patch Changes

- Improve JSDoc comments to provide better IntelliSense in your IDE ([#5053](https://github.com/clerk/javascript/pull/5053)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`26225f2c31a22560f7ece2e02f1d0080b5b89520`](https://github.com/clerk/javascript/commit/26225f2c31a22560f7ece2e02f1d0080b5b89520), [`833693a6792b621e72162d70673e7bdfa84a69b6`](https://github.com/clerk/javascript/commit/833693a6792b621e72162d70673e7bdfa84a69b6)]:
  - @clerk/shared@2.20.17
  - @clerk/types@4.44.3

## 5.22.8

### Patch Changes

- Updated dependencies [[`a309be354275b91a7b17d5a67e8ef6aa230a9935`](https://github.com/clerk/javascript/commit/a309be354275b91a7b17d5a67e8ef6aa230a9935), [`1345cb487970a7347351897e80dfb829d85c41ea`](https://github.com/clerk/javascript/commit/1345cb487970a7347351897e80dfb829d85c41ea)]:
  - @clerk/shared@2.20.16
  - @clerk/types@4.44.2

## 5.22.7

### Patch Changes

- Updated dependencies [[`57c983fdc2b8d883623a2294daae0ac6c02c48f6`](https://github.com/clerk/javascript/commit/57c983fdc2b8d883623a2294daae0ac6c02c48f6), [`a26cf0ff10c76244975c454fdf6c615475d4bcd5`](https://github.com/clerk/javascript/commit/a26cf0ff10c76244975c454fdf6c615475d4bcd5)]:
  - @clerk/types@4.44.1
  - @clerk/shared@2.20.15

## 5.22.6

### Patch Changes

- Updated dependencies [[`2179690c10a61b117e82fdd566b34939f4d28bc1`](https://github.com/clerk/javascript/commit/2179690c10a61b117e82fdd566b34939f4d28bc1), [`bdb537a9902c0f0ae58ca1d4b7590d929f28fedb`](https://github.com/clerk/javascript/commit/bdb537a9902c0f0ae58ca1d4b7590d929f28fedb)]:
  - @clerk/types@4.44.0
  - @clerk/shared@2.20.14

## 5.22.5

### Patch Changes

- Updated dependencies [[`f87ede848265d75ea1e880a3ab80c53a250f42cf`](https://github.com/clerk/javascript/commit/f87ede848265d75ea1e880a3ab80c53a250f42cf), [`6126cc98281bca96797fd8a55b6ec6aeda397e46`](https://github.com/clerk/javascript/commit/6126cc98281bca96797fd8a55b6ec6aeda397e46), [`6e096564a459db4eaf953e99e570905b10be6c84`](https://github.com/clerk/javascript/commit/6e096564a459db4eaf953e99e570905b10be6c84)]:
  - @clerk/shared@2.20.13
  - @clerk/types@4.43.0

## 5.22.4

### Patch Changes

- Updated dependencies [[`fe3e49f61acefe8d7f1992405f7cb415fea2e5c8`](https://github.com/clerk/javascript/commit/fe3e49f61acefe8d7f1992405f7cb415fea2e5c8), [`4427c4702f64d4f28f7564ce5889d41e260aa519`](https://github.com/clerk/javascript/commit/4427c4702f64d4f28f7564ce5889d41e260aa519)]:
  - @clerk/types@4.42.0
  - @clerk/shared@2.20.12

## 5.22.3

### Patch Changes

- Updated dependencies [[`418ec5c62c4eb600566faab07684c068a29007e3`](https://github.com/clerk/javascript/commit/418ec5c62c4eb600566faab07684c068a29007e3)]:
  - @clerk/types@4.41.2
  - @clerk/shared@2.20.11

## 5.22.2

### Patch Changes

- Standardizing ambient declaration files for all SDKs ([#4919](https://github.com/clerk/javascript/pull/4919)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`9eef7713212378351e8e01628611eaa18de250e8`](https://github.com/clerk/javascript/commit/9eef7713212378351e8e01628611eaa18de250e8)]:
  - @clerk/shared@2.20.10

## 5.22.1

### Patch Changes

- Updated dependencies [[`7ffc99b48977b9f6c74c0c71c500b60cb8aba65e`](https://github.com/clerk/javascript/commit/7ffc99b48977b9f6c74c0c71c500b60cb8aba65e)]:
  - @clerk/types@4.41.1
  - @clerk/shared@2.20.9

## 5.22.0

### Minor Changes

- Introduce sign-in-or-up flow. ([#4788](https://github.com/clerk/javascript/pull/4788)) by [@alexcarpenter](https://github.com/alexcarpenter)

### Patch Changes

- Updated dependencies [[`4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d`](https://github.com/clerk/javascript/commit/4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d), [`aa48b1f9e890b2402e9d05989a4820141076f7bf`](https://github.com/clerk/javascript/commit/aa48b1f9e890b2402e9d05989a4820141076f7bf), [`53bd34fff38b17498edf66cc4bc2d42d707f28dc`](https://github.com/clerk/javascript/commit/53bd34fff38b17498edf66cc4bc2d42d707f28dc)]:
  - @clerk/types@4.41.0
  - @clerk/shared@2.20.8

## 5.21.3

### Patch Changes

- Updated dependencies [[`fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6`](https://github.com/clerk/javascript/commit/fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6)]:
  - @clerk/types@4.40.3
  - @clerk/shared@2.20.7

## 5.21.2

### Patch Changes

- Updated dependencies [[`44cab6038af0a4d23869b3b292ece742fbbc4d85`](https://github.com/clerk/javascript/commit/44cab6038af0a4d23869b3b292ece742fbbc4d85)]:
  - @clerk/types@4.40.2
  - @clerk/shared@2.20.6

## 5.21.1

### Patch Changes

- Updated dependencies [[`80e1117631d35834705119a79cdcf9e0ed423fdd`](https://github.com/clerk/javascript/commit/80e1117631d35834705119a79cdcf9e0ed423fdd)]:
  - @clerk/types@4.40.1
  - @clerk/shared@2.20.5

## 5.21.0

### Minor Changes

- Adds support for a `fallback` prop on Clerk's components. This allows rendering of a placeholder element while Clerk's components are mounting. Use this to help mitigate layout shift when using Clerk's components. Example usage: ([#4723](https://github.com/clerk/javascript/pull/4723)) by [@BRKalow](https://github.com/BRKalow)

  ```tsx
  <SignIn fallback={<LoadingSkeleton />} />
  ```

- Allow `<SignInButton />`, `<SignUpButton />`, `<SignOutButton />`, and `<SignInWithMetamaskButton />` to render while clerk-js is still loading. This reduces any layout shift that might be caused by these components not rendering immediately. ([#4810](https://github.com/clerk/javascript/pull/4810)) by [@BRKalow](https://github.com/BRKalow)

## 5.20.4

### Patch Changes

- Updated dependencies [[`c9da04636ffe1ba804a1ce5e5b79027d3a2344d2`](https://github.com/clerk/javascript/commit/c9da04636ffe1ba804a1ce5e5b79027d3a2344d2)]:
  - @clerk/types@4.40.0
  - @clerk/shared@2.20.4

## 5.20.3

### Patch Changes

- Updated dependencies [[`84ccb0049041534f111be65f7c7d4d6120069446`](https://github.com/clerk/javascript/commit/84ccb0049041534f111be65f7c7d4d6120069446)]:
  - @clerk/shared@2.20.3

## 5.20.2

### Patch Changes

- Updated dependencies [[`aeafa7c5efd50c893d088ac99199d7eaecc04025`](https://github.com/clerk/javascript/commit/aeafa7c5efd50c893d088ac99199d7eaecc04025), [`acd9326ef2d6942b981b3ee59c4b20ddd303323d`](https://github.com/clerk/javascript/commit/acd9326ef2d6942b981b3ee59c4b20ddd303323d)]:
  - @clerk/types@4.39.4
  - @clerk/shared@2.20.2

## 5.20.1

### Patch Changes

- Using the same peerDependencies semver for react and react-dom ([#4758](https://github.com/clerk/javascript/pull/4758)) by [@jacekradko](https://github.com/jacekradko)

- Introduce a `toJSON()` function on resources. ([#4604](https://github.com/clerk/javascript/pull/4604)) by [@anagstef](https://github.com/anagstef)

  This change also introduces two new internal methods on the Clerk resource, to be used by the expo package.
  - `__internal_getCachedResources()`: (Optional) This function is used to load cached Client and Environment resources if Clerk fails to load them from the Frontend API.
  - `__internal_reloadInitialResources()`: This function is used to reload the initial resources (Environment/Client) from the Frontend API.

- Updated dependencies [[`66ad299e4b6496ea4a93799de0f1ecfad920ddad`](https://github.com/clerk/javascript/commit/66ad299e4b6496ea4a93799de0f1ecfad920ddad), [`dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d`](https://github.com/clerk/javascript/commit/dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d), [`e1748582d0c89462f48a482a7805871b7065fa19`](https://github.com/clerk/javascript/commit/e1748582d0c89462f48a482a7805871b7065fa19), [`7f7edcaa8228c26d19e9081979100ada7e982095`](https://github.com/clerk/javascript/commit/7f7edcaa8228c26d19e9081979100ada7e982095), [`dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d`](https://github.com/clerk/javascript/commit/dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d)]:
  - @clerk/shared@2.20.1
  - @clerk/types@4.39.3

## 5.20.0

### Minor Changes

- Switching to use ^ for semver ranges of internal @clerk/ production dependencies. ([#4664](https://github.com/clerk/javascript/pull/4664)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Return components as `React.JSX.Element` instead of `JSX.Element` ([#4740](https://github.com/clerk/javascript/pull/4740)) by [@dstaley](https://github.com/dstaley)

- `useAuth` now uses derived auth state instead of locally stored state ([#4715](https://github.com/clerk/javascript/pull/4715)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`ffa631d2480cfe77bf08c61b1302ace308e5b630`](https://github.com/clerk/javascript/commit/ffa631d2480cfe77bf08c61b1302ace308e5b630)]:
  - @clerk/shared@2.20.0

## 5.19.3

### Patch Changes

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/types@4.39.2
  - @clerk/shared@2.19.4

## 5.19.2

### Patch Changes

- Updated dependencies [[`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/types@4.39.1
  - @clerk/shared@2.19.3

## 5.19.1

### Patch Changes

- Updated dependencies [[`4cb22548da81dd8b186a6ef1cf120aea99c85c62`](https://github.com/clerk/javascript/commit/4cb22548da81dd8b186a6ef1cf120aea99c85c62)]:
  - @clerk/shared@2.19.2

## 5.19.0

### Minor Changes

- Various internal changes have been made to support a new feature called "Keyless mode". You'll be able to use this feature with Next.js and `@clerk/nextjs` initially. Read the `@clerk/nextjs` changelog to learn more. ([#4602](https://github.com/clerk/javascript/pull/4602)) by [@panteliselef](https://github.com/panteliselef)

  List of changes:
  - A new internal prop called `__internal_bypassMissingPublishableKey` has been added. Normally an error is thrown when the publishable key is missing, this disables this behavior.
  - Loading of `clerk-js` won't be attempted when a missing key is present
  - A new instance of `IsomorphicClerk` (an internal Clerk class) is created for each new publishable key

### Patch Changes

- Updated dependencies [[`550c7e9851329688e37be29b83ea0c3b12482af7`](https://github.com/clerk/javascript/commit/550c7e9851329688e37be29b83ea0c3b12482af7), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99)]:
  - @clerk/types@4.39.0
  - @clerk/shared@2.19.1

## 5.18.2

### Patch Changes

- Updated dependencies [[`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3), [`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3)]:
  - @clerk/shared@2.19.0
  - @clerk/types@4.38.0

## 5.18.1

### Patch Changes

- Updated dependencies [[`4e5e7f463c12893a21cb3b5f9317fc3f2945879b`](https://github.com/clerk/javascript/commit/4e5e7f463c12893a21cb3b5f9317fc3f2945879b)]:
  - @clerk/types@4.37.0
  - @clerk/shared@2.18.1

## 5.18.0

### Minor Changes

- Support OKW Wallet Web3 provider and authentication strategy ([#4696](https://github.com/clerk/javascript/pull/4696)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Updated dependencies [[`8ee5d84995fa17532491ff96efac5738c9bcd9ef`](https://github.com/clerk/javascript/commit/8ee5d84995fa17532491ff96efac5738c9bcd9ef), [`09fedd1df155d30cc055ce701b133aa6470e9b47`](https://github.com/clerk/javascript/commit/09fedd1df155d30cc055ce701b133aa6470e9b47), [`235eaae4c3c9400492fca47d20a47c7081041565`](https://github.com/clerk/javascript/commit/235eaae4c3c9400492fca47d20a47c7081041565)]:
  - @clerk/types@4.36.0
  - @clerk/shared@2.18.0

## 5.17.2

### Patch Changes

- Updated dependencies [[`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d)]:
  - @clerk/types@4.35.1
  - @clerk/shared@2.17.1

## 5.17.1

### Patch Changes

- Re-export `isClerkRuntimeError` from `@clerk/clerk-react/errors`. ([#4656](https://github.com/clerk/javascript/pull/4656)) by [@panteliselef](https://github.com/panteliselef)

- Add deprecation notices for the following components: ([#4631](https://github.com/clerk/javascript/pull/4631)) by [@alexcarpenter](https://github.com/alexcarpenter)
  - `RedirectToUserProfile`
  - `RedirectToOrganizationProfile`
  - `RedirectToCreateOrganization`

## 5.17.0

### Minor Changes

- Introduce the `useReverification()` hook that handles the session reverification flow: ([#4536](https://github.com/clerk/javascript/pull/4536)) by [@panteliselef](https://github.com/panteliselef)
  - Replaces `__experimental_useReverification` with `useReverification`

### Patch Changes

- Include **BUILD_DISABLE_RHC** to allow for builds which remove remotely hosted code as it is a requirement for browser extensions. ([#4133](https://github.com/clerk/javascript/pull/4133)) by [@tmilewski](https://github.com/tmilewski)

- Rename userVerification to reverification to align with the feature name. ([#4634](https://github.com/clerk/javascript/pull/4634)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`d84d7e31235c5c7da3415981dc76db4473a71a39`](https://github.com/clerk/javascript/commit/d84d7e31235c5c7da3415981dc76db4473a71a39), [`dce4f7ffca7248c0500f0ec9a978672b1f2fad69`](https://github.com/clerk/javascript/commit/dce4f7ffca7248c0500f0ec9a978672b1f2fad69)]:
  - @clerk/shared@2.17.0
  - @clerk/types@4.35.0

## 5.16.2

### Patch Changes

- Updated dependencies [[`c70994b5b6f92a6550dfe37547f01bbfa810c223`](https://github.com/clerk/javascript/commit/c70994b5b6f92a6550dfe37547f01bbfa810c223), [`7623a99594e7329200b6b374e483152d7679ce66`](https://github.com/clerk/javascript/commit/7623a99594e7329200b6b374e483152d7679ce66)]:
  - @clerk/types@4.34.2
  - @clerk/shared@2.16.1

## 5.16.1

### Patch Changes

- Share hook return types ([#4583](https://github.com/clerk/javascript/pull/4583)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`e47eb5882a7fd4a8dee25933c6644790d6ea3407`](https://github.com/clerk/javascript/commit/e47eb5882a7fd4a8dee25933c6644790d6ea3407), [`273d16cb0665d4d960838cb294dc356f41814745`](https://github.com/clerk/javascript/commit/273d16cb0665d4d960838cb294dc356f41814745), [`6b0961765e1f3d09679be4b163fa13ac7dd97191`](https://github.com/clerk/javascript/commit/6b0961765e1f3d09679be4b163fa13ac7dd97191)]:
  - @clerk/shared@2.16.0
  - @clerk/types@4.34.1

## 5.16.0

### Minor Changes

- Add `initialValues` option to `<SignInButton />` component. ([#4581](https://github.com/clerk/javascript/pull/4581)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Add `initialValues` option to `<SignUpButton />` component. ([#4567](https://github.com/clerk/javascript/pull/4567)) by [@alexcarpenter](https://github.com/alexcarpenter)

### Patch Changes

- Updated dependencies [[`536fa996ff84a545678a3036b28409824d1c00dd`](https://github.com/clerk/javascript/commit/536fa996ff84a545678a3036b28409824d1c00dd), [`b28c5e8bc44885bf6b1533df48e872ba90c387da`](https://github.com/clerk/javascript/commit/b28c5e8bc44885bf6b1533df48e872ba90c387da)]:
  - @clerk/shared@2.15.0

## 5.15.5

### Patch Changes

- Updated dependencies [[`46faeb6f59b19c963fb137c858347525b1cd9e19`](https://github.com/clerk/javascript/commit/46faeb6f59b19c963fb137c858347525b1cd9e19), [`ea6c52dd751abe38b350ee07f148652c24125e22`](https://github.com/clerk/javascript/commit/ea6c52dd751abe38b350ee07f148652c24125e22)]:
  - @clerk/shared@2.14.0
  - @clerk/types@4.34.0

## 5.15.4

### Patch Changes

- Updated dependencies [[`1c0b5001f7f975a2f3f54ad692526ecf7257847e`](https://github.com/clerk/javascript/commit/1c0b5001f7f975a2f3f54ad692526ecf7257847e), [`6217a3f7c94311d49f873214bd406961e0b8d6f7`](https://github.com/clerk/javascript/commit/6217a3f7c94311d49f873214bd406961e0b8d6f7), [`1783025cdb94c447028704c2121fa0b8af785904`](https://github.com/clerk/javascript/commit/1783025cdb94c447028704c2121fa0b8af785904)]:
  - @clerk/types@4.33.0
  - @clerk/shared@2.13.0

## 5.15.3

### Patch Changes

- Updated dependencies [[`7dbad4c5abd226d7b10941a626ead5d85b1a3f24`](https://github.com/clerk/javascript/commit/7dbad4c5abd226d7b10941a626ead5d85b1a3f24)]:
  - @clerk/types@4.32.0
  - @clerk/shared@2.12.1

## 5.15.2

### Patch Changes

- Updated dependencies [[`5a21de1f46df3642828dc27e4862263c9858da2b`](https://github.com/clerk/javascript/commit/5a21de1f46df3642828dc27e4862263c9858da2b), [`f7472e22877f62fc7f3c8d3efe409ff2276fb4a3`](https://github.com/clerk/javascript/commit/f7472e22877f62fc7f3c8d3efe409ff2276fb4a3), [`e199037b8f484abdeeb9fc24455a1b4b8c31c8dd`](https://github.com/clerk/javascript/commit/e199037b8f484abdeeb9fc24455a1b4b8c31c8dd), [`886e294a8d8c54b39cd5bda88d46b89eace3861e`](https://github.com/clerk/javascript/commit/886e294a8d8c54b39cd5bda88d46b89eace3861e), [`0e443ad7c76643420b50e5b169193e03f6ef79f9`](https://github.com/clerk/javascript/commit/0e443ad7c76643420b50e5b169193e03f6ef79f9), [`cc24c8145f1eea7fb91550f2c3e0bac3993e4320`](https://github.com/clerk/javascript/commit/cc24c8145f1eea7fb91550f2c3e0bac3993e4320)]:
  - @clerk/shared@2.12.0
  - @clerk/types@4.31.0

## 5.15.1

### Patch Changes

- Use shared `deriveState` function ([#4490](https://github.com/clerk/javascript/pull/4490)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`8a04ae47b8305f994b348301fd8134d5baf02943`](https://github.com/clerk/javascript/commit/8a04ae47b8305f994b348301fd8134d5baf02943)]:
  - @clerk/shared@2.11.5

## 5.15.0

### Minor Changes

- New Feature: Introduce the `<Waitlist />` component and the `waitlist` sign up mode. ([#4376](https://github.com/clerk/javascript/pull/4376)) by [@nikospapcom](https://github.com/nikospapcom)
  - Allow users to request access with an email address via the new `<Waitlist />` component.
  - Show `Join waitlist` prompt from `<SignIn />` component when mode is `waitlist`.
  - Appropriate the text in the Sign Up component when mode is `waitlist`.
  - Added `joinWaitlist()` method in `Clerk` singleton.
  - Added `redirectToWaitlist()` method in `Clerk` singleton to allow user to redirect to waitlist page.

### Patch Changes

- Expose internal `__internal_getOption` method from Clerk. ([#4456](https://github.com/clerk/javascript/pull/4456)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`d74a6a7c0f291104c6bba722a8c432814d7b336e`](https://github.com/clerk/javascript/commit/d74a6a7c0f291104c6bba722a8c432814d7b336e), [`1a0c8fe665869e732d3c800bde0f5219fce54301`](https://github.com/clerk/javascript/commit/1a0c8fe665869e732d3c800bde0f5219fce54301), [`0800fc3f1f4e1b6a1d13f5c02557001a283af6e8`](https://github.com/clerk/javascript/commit/0800fc3f1f4e1b6a1d13f5c02557001a283af6e8)]:
  - @clerk/types@4.30.0
  - @clerk/shared@2.11.4

## 5.14.3

### Patch Changes

- Updated dependencies [[`a7726cc12a824b278f6d2a37cb1901c38c5f70dc`](https://github.com/clerk/javascript/commit/a7726cc12a824b278f6d2a37cb1901c38c5f70dc)]:
  - @clerk/shared@2.11.3

## 5.14.0

### Minor Changes

- Introduce a new experimental hook called `useReverification` that makes it easy to handle reverification errors. ([#4362](https://github.com/clerk/javascript/pull/4362)) by [@panteliselef](https://github.com/panteliselef)

  It returns a high order function (HOF) and allows developers to wrap any function that triggers a fetch request which might fail due to a user's session verification status.
  When such error is returned, the recommended UX is to offer a way to the user to recover by re-verifying their credentials.
  This helper will automatically handle this flow in the developer's behalf, by displaying a modal the end-user can interact with.
  Upon completion, the original request that previously failed, will be retried (only once).

  Example with clerk-js methods.

  ```tsx
  import { __experimental_useReverification as useReverification } from '@clerk/nextjs';

  function DeleteAccount() {
    const { user } = useUser();
    const [deleteUserAccount] = useReverification(() => {
      if (!user) return;
      return user.delete();
    });

    return (
      <>
        <button
          onClick={async () => {
            await deleteUserAccount();
          }}
        >
          Delete account
        </button>
      </>
    );
  }
  ```

### Patch Changes

- Fix `signOutOptions` prop usage in `<SignOutButton />` component ([#4433](https://github.com/clerk/javascript/pull/4433)) by [@wobsoriano](https://github.com/wobsoriano)

- - Introduce `redirectUrl` property on `setActive` as a replacement for `beforeEmit`. ([#4312](https://github.com/clerk/javascript/pull/4312)) by [@issuedat](https://github.com/issuedat)

  - Deprecates `beforeEmit` property on `setActive`.

- Updates `useDerivedAuth()` to correctly derive `has()` from the available auth data. Fixes an issue when `useAuth()` is called during server-side rendering. ([#4421](https://github.com/clerk/javascript/pull/4421)) by [@BRKalow](https://github.com/BRKalow)

- Updating peerDependencies for correct ranges ([#4436](https://github.com/clerk/javascript/pull/4436)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`f875463da`](https://github.com/clerk/javascript/commit/f875463da9692f2d173b6d5388743cf720750ae3), [`5be7ca9fd`](https://github.com/clerk/javascript/commit/5be7ca9fd239c937cc88e20ce8f5bfc9f3b84f22), [`08c5a2add`](https://github.com/clerk/javascript/commit/08c5a2add6872c76e62fc0df06db723e3728452e), [`434b432f8`](https://github.com/clerk/javascript/commit/434b432f8c114825120eef0f2c278b8142ed1563)]:
  - @clerk/types@4.29.0
  - @clerk/shared@2.11.0

## 5.13.1

### Patch Changes

- Updated dependencies [[`3fdcdbf88`](https://github.com/clerk/javascript/commit/3fdcdbf88c38facf8b82563f634ec1b6604fd8e5)]:
  - @clerk/types@4.28.0
  - @clerk/shared@2.10.1

## 5.13.0

### Minor Changes

- Internal changes to support `<ClerkProvider dynamic>` ([#4366](https://github.com/clerk/javascript/pull/4366)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Updated dependencies [[`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc), [`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc)]:
  - @clerk/shared@2.10.0
  - @clerk/types@4.27.0

## 5.12.0

### Minor Changes

- Introducing experimental `asProvider`, `asStandalone`, and `<X.Outlet />` for `<UserButton />` and `<OrganizationSwitcher />` components. ([#4042](https://github.com/clerk/javascript/pull/4042)) by [@panteliselef](https://github.com/panteliselef)
  - `asProvider` converts `<UserButton />` and `<OrganizationSwitcher />` to a provider that defers rendering until `<Outlet />` is mounted.
  - `<Outlet />` also accepts a `asStandalone` prop. It will skip the trigger of these components and display only the UI which was previously inside the popover. This allows developers to create their own triggers.

  Example usage:

  ```tsx
  <UserButton
    __experimental_asProvider
    afterSignOutUrl='/'
  >
    <UserButton.UserProfilePage
      label='Custom Page'
      url='/custom-page'
    >
      <h1> This is my page available to all children </h1>
    </UserButton.UserProfilePage>
    <UserButton.__experimental_Outlet __experimental_asStandalone />
  </UserButton>
  ```

  ```tsx
  <OrganizationSwitcher
    __experimental_asProvider
    afterSignOutUrl='/'
  >
    <OrganizationSwitcher.OrganizationProfilePage
      label='Custom Page'
      url='/custom-page'
    >
      <h1> This is my page available to all children </h1>
    </OrganizationSwitcher.OrganizationProfilePage>
    <OrganizationSwitcher.__experimental_Outlet __experimental_asStandalone />
  </OrganizationSwitcher>
  ```

### Patch Changes

- Updated dependencies [[`e81d45b72`](https://github.com/clerk/javascript/commit/e81d45b72c81403c7c206dac5454de1fef6bec57), [`752ce9bfa`](https://github.com/clerk/javascript/commit/752ce9bfa47a8eebd38cd272eeb58ae26fea3371), [`99cdf9b67`](https://github.com/clerk/javascript/commit/99cdf9b67d1e99e66cc73d8a5bfce1f1f8df1b83), [`ce40ff6f0`](https://github.com/clerk/javascript/commit/ce40ff6f0d3bc79e33375be6dd5e03f140a07000), [`2102052c0`](https://github.com/clerk/javascript/commit/2102052c017065ab511339870fcebaa6719f2702)]:
  - @clerk/types@4.26.0
  - @clerk/shared@2.9.2

## 5.11.1

### Patch Changes

- Updated dependencies [[`d64e54c40`](https://github.com/clerk/javascript/commit/d64e54c40c9cf001b25e45a1b8939c9f7e80c6d6), [`2ba2fd148`](https://github.com/clerk/javascript/commit/2ba2fd1483b7561d7df9a1952ead0ee15e422131)]:
  - @clerk/shared@2.9.1
  - @clerk/types@4.25.1

## 5.11.0

### Minor Changes

- Rename `__experimental_assurance` to `__experimental_reverification`. ([#4268](https://github.com/clerk/javascript/pull/4268)) by [@panteliselef](https://github.com/panteliselef)
  - Supported levels are now are `firstFactor`, `secondFactor`, `multiFactor`.
  - Support maxAge is now replaced by maxAgeMinutes and afterMinutes depending on usage.
  - Introduced `____experimental_SessionVerificationTypes` that abstracts away the level and maxAge
    - Allowed values 'veryStrict' | 'strict' | 'moderate' | 'lax'

### Patch Changes

- Updated dependencies [[`fb932e5cf`](https://github.com/clerk/javascript/commit/fb932e5cf21315adf60bee0855b6bd5ee2ff9867)]:
  - @clerk/shared@2.9.0
  - @clerk/types@4.25.0

## 5.10.0

### Minor Changes

- Drop the experimental mounted variant of `UserVerification`. ([#4266](https://github.com/clerk/javascript/pull/4266)) by [@panteliselef](https://github.com/panteliselef)

  Removes:
  - `<__experimental_UserVerification/>`
  - `__experimental_mountUserVerification()`
  - `__experimental_unmountUserVerification()`

### Patch Changes

- Updated dependencies [[`f6fb8b53d`](https://github.com/clerk/javascript/commit/f6fb8b53d236863ad7eca576ee7a16cd33f3506b), [`4a8570590`](https://github.com/clerk/javascript/commit/4a857059059a02bb4f20893e08601e1e67babbed)]:
  - @clerk/types@4.24.0
  - @clerk/shared@2.8.5

## 5.9.4

### Patch Changes

- Updated dependencies [[`4749ed4c5`](https://github.com/clerk/javascript/commit/4749ed4c55a5ba5810451b8d436aad0d49829050), [`f1f17eaab`](https://github.com/clerk/javascript/commit/f1f17eaabed0dc4b7de405fb77d85503cf75ad33), [`2e35ac538`](https://github.com/clerk/javascript/commit/2e35ac53885f8008779940d41d1e804fa77ebfa9)]:
  - @clerk/types@4.23.0
  - @clerk/shared@2.8.4

## 5.9.3

### Patch Changes

- Updated dependencies [[`c9063853e`](https://github.com/clerk/javascript/commit/c9063853e538a4010f5d4e522a3da5abc80098a4), [`19d3808d4`](https://github.com/clerk/javascript/commit/19d3808d4672234944226d6709ec51214e8d6e1d), [`737bcbb0f`](https://github.com/clerk/javascript/commit/737bcbb0ffb5e2dcadbb02e8fc718fe8825c5842)]:
  - @clerk/types@4.22.0
  - @clerk/shared@2.8.3

## 5.9.2

### Patch Changes

- Improve JSDoc comments for some public API properties ([#4190](https://github.com/clerk/javascript/pull/4190)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`cb32aaf59`](https://github.com/clerk/javascript/commit/cb32aaf59d38dcd12e959f542782f71a87adf9c1), [`2e5c550e4`](https://github.com/clerk/javascript/commit/2e5c550e4aec61150c2a17fdcd4a0e1273cb50e7), [`6275c242c`](https://github.com/clerk/javascript/commit/6275c242cd8bcb6f7766934059967e0fe775a0c1), [`f9faaf031`](https://github.com/clerk/javascript/commit/f9faaf03100baf679c78e6c24877fbf3b60be529)]:
  - @clerk/shared@2.8.2
  - @clerk/types@4.21.1

## 5.9.1

### Patch Changes

- Updated dependencies [[`3743eb911`](https://github.com/clerk/javascript/commit/3743eb9114733f20ed56a863ab98fa9c363b6723)]:
  - @clerk/shared@2.8.1

## 5.9.0

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

- Updated dependencies [[`ba19be354`](https://github.com/clerk/javascript/commit/ba19be35461f0e5c76a58d11e4252a16781322c6), [`248142a6d`](https://github.com/clerk/javascript/commit/248142a6ded6ca937d0df7d628197f25228aadec), [`1189f71f8`](https://github.com/clerk/javascript/commit/1189f71f872f2683c12de5add5f154aeb953ca8d)]:
  - @clerk/shared@2.8.0
  - @clerk/types@4.21.0

## 5.8.2

### Patch Changes

- Updated dependencies [[`be3b119f8`](https://github.com/clerk/javascript/commit/be3b119f840d2ae74f4b75d717711d53ac0e5f54)]:
  - @clerk/shared@2.7.2

## 5.8.1

### Patch Changes

- Update type of `__experimental_factorVerificationAge` to be `[number, number] | null`. ([#4135](https://github.com/clerk/javascript/pull/4135)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`8c6909d46`](https://github.com/clerk/javascript/commit/8c6909d46328c943f1d464a28f1a324a27d0f3f1)]:
  - @clerk/types@4.20.1
  - @clerk/shared@2.7.1

## 5.8.0

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

- Improve JSDoc comments coverage on `<ClerkProvider>` properties ([#4098](https://github.com/clerk/javascript/pull/4098)) by [@LekoArts](https://github.com/LekoArts)

- Drop support for deprecated Coinbase Web3 provider ([#4092](https://github.com/clerk/javascript/pull/4092)) by [@chanioxaris](https://github.com/chanioxaris)

- Updated dependencies [[`c63a5adf0`](https://github.com/clerk/javascript/commit/c63a5adf0ba4b99252146f168318f51b709bb5dd), [`8823c21a2`](https://github.com/clerk/javascript/commit/8823c21a26bc81cbc3ed007908b1a9ea474bd343), [`95ac67a14`](https://github.com/clerk/javascript/commit/95ac67a143c263bef0c1f589728566ab8f95768d), [`a0cb062fa`](https://github.com/clerk/javascript/commit/a0cb062faa4d23bef7a577e5cc486f4c5efe6bfa), [`746b4ed5e`](https://github.com/clerk/javascript/commit/746b4ed5e2007505d5850a2a728484809474d7bf)]:
  - @clerk/types@4.20.0
  - @clerk/shared@2.7.0

## 5.7.0

### Minor Changes

- Add support for the Coinbase Wallet web3 provider and authentication strategy. The Coinbase Wallet provider handles both Coinbase Wallet extension and Smart Wallet ([#4082](https://github.com/clerk/javascript/pull/4082)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Updated dependencies [[`8a3b9f079`](https://github.com/clerk/javascript/commit/8a3b9f0793484b32dd609a5c80a194e62151d6ea), [`e95c28196`](https://github.com/clerk/javascript/commit/e95c2819675cea7963f2404e5f71f37ebed8d5e0)]:
  - @clerk/types@4.19.0
  - @clerk/shared@2.6.2

## 5.6.0

### Minor Changes

- Add `<__experimental_UserVerification />` component. This is an experimental feature and breaking changes can occur until it's marked as stable. ([#4016](https://github.com/clerk/javascript/pull/4016)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`82593173a`](https://github.com/clerk/javascript/commit/82593173aafbf6646e12c5779627cdcb138a1f27), [`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733)]:
  - @clerk/types@4.18.0
  - @clerk/shared@2.6.1

## 5.5.0

### Minor Changes

- Add support for Coinbase Wallet strategy during sign in/up flows. Users can now authenticate using their Coinbase Wallet browser extension in the same way as MetaMask ([#4052](https://github.com/clerk/javascript/pull/4052)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Tidy up and improve README ([#4053](https://github.com/clerk/javascript/pull/4053)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`58e6754ad`](https://github.com/clerk/javascript/commit/58e6754ad9f9a1244b023ce1f5e5f2c1c4eb20e7), [`13693018f`](https://github.com/clerk/javascript/commit/13693018f4f7ac5d224698aa730e20960896f68c), [`3aa63dc5a`](https://github.com/clerk/javascript/commit/3aa63dc5a48161cfe92d94093ef0c32efd401342), [`3304dcc0b`](https://github.com/clerk/javascript/commit/3304dcc0bc93a92a7f729f585c60ff91d2ae04f6)]:
  - @clerk/types@4.17.0
  - @clerk/shared@2.6.0

## 5.4.5

### Patch Changes

- Updated dependencies [[`c1389492d`](https://github.com/clerk/javascript/commit/c1389492d8b6a9292ab04889bf776c0f45e66845)]:
  - @clerk/types@4.16.0
  - @clerk/shared@2.5.5

## 5.4.4

### Patch Changes

- Updated dependencies [[`0158c774a`](https://github.com/clerk/javascript/commit/0158c774af2243a2cd13b55c4d6fae877178c961), [`8be1a7abc`](https://github.com/clerk/javascript/commit/8be1a7abc8849d7d59552011bd6b25bc917d51f5)]:
  - @clerk/types@4.15.1
  - @clerk/shared@2.5.4

## 5.4.3

### Patch Changes

- Fix multiple `addListener` method calls ([#4010](https://github.com/clerk/javascript/pull/4010)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`247b3fd75`](https://github.com/clerk/javascript/commit/247b3fd75042365dc9f950db056b76f9fadfdcf6)]:
  - @clerk/types@4.15.0
  - @clerk/shared@2.5.3

## 5.4.2

### Patch Changes

- Updated dependencies [[`dc0e1c33d`](https://github.com/clerk/javascript/commit/dc0e1c33d6844b028cb1ee11c3359b886d609f3c)]:
  - @clerk/types@4.14.0
  - @clerk/shared@2.5.2

## 5.4.1

### Patch Changes

- Introduce functions that can be reused across front-end SDKs ([#3849](https://github.com/clerk/javascript/pull/3849)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`7e0ced3da`](https://github.com/clerk/javascript/commit/7e0ced3da94f41056bc4445d163d3b615afb6ab1), [`b6f0613dc`](https://github.com/clerk/javascript/commit/b6f0613dc9d8b0bab41cfabbaa8621b126e3bdf5)]:
  - @clerk/shared@2.5.1
  - @clerk/types@4.13.1

## 5.4.0

### Minor Changes

- Add a `nonce` to clerk-js' script loading options. Also adds a `nonce` prop to `ClerkProvider`. This can be used to thread a nonce value through to the clerk-js script load to support apps using a `strict-dynamic` content security policy. For next.js applications, the nonce will be automatically pulled from the CSP header and threaded through without needing any props so long as the provider is server-rendered. ([#3858](https://github.com/clerk/javascript/pull/3858)) by [@jescalan](https://github.com/jescalan)

- Introduce `transferable` prop for `<SignIn />` to disable the automatic transfer of a sign in attempt to a sign up attempt when attempting to sign in with a social provider when the account does not exist. Also adds a `transferable` option to `Clerk.handleRedirectCallback()` with the same functionality. ([#3845](https://github.com/clerk/javascript/pull/3845)) by [@BRKalow](https://github.com/BRKalow)

### Patch Changes

- Updated dependencies [[`59d5f19d3`](https://github.com/clerk/javascript/commit/59d5f19d333bf4a35c244886e93b4368e215225c), [`4e6c94e3f`](https://github.com/clerk/javascript/commit/4e6c94e3f4cc92cbba8bddcd2b90fcc9cfb83763)]:
  - @clerk/shared@2.5.0
  - @clerk/types@4.13.0

## 5.3.3

### Patch Changes

- Updated dependencies [[`9b2aeacb3`](https://github.com/clerk/javascript/commit/9b2aeacb32fff7c300bda458636a1cc81a42ee7b)]:
  - @clerk/types@4.12.1
  - @clerk/shared@2.4.5

## 5.3.2

### Patch Changes

- Updated dependencies [[`7e94fcf0f`](https://github.com/clerk/javascript/commit/7e94fcf0fcbee8842a54f7931c45190370aa870d)]:
  - @clerk/types@4.12.0
  - @clerk/shared@2.4.4

## 5.3.1

### Patch Changes

- Updated dependencies [[`568186cad`](https://github.com/clerk/javascript/commit/568186cad29acaf0b084a9f86ccb9d29bd23fcf4), [`407195270`](https://github.com/clerk/javascript/commit/407195270ed8aab6eef18c64a4918e3870fef471)]:
  - @clerk/types@4.11.0
  - @clerk/shared@2.4.3

## 5.3.0

### Minor Changes

- Introduce support for custom menu items in `<UserButton/>`. ([#3784](https://github.com/clerk/javascript/pull/3784)) by [@nikospapcom](https://github.com/nikospapcom)
  - Use `<UserButton.MenuItems>` as a child component to wrap custom menu items.
  - Use `<UserButton.Link/>` for creating external or internal links.
  - Use `<UserButton.Action/>` for opening a specific custom page of "UserProfile" or to trigger your own custom logic via `onClick`.
  - If needed, reorder existing items like `manageAccount` and `signOut`

  New usage example:

  ```jsx
  <UserButton>
    <UserButton.MenuItems>
      <UserButton.Link
        label='Terms'
        labelIcon={<Icon />}
        href='/terms'
      />
      <UserButton.Action
        label='Help'
        labelIcon={<Icon />}
        open='help'
      />{' '}
      // Navigate to `/help` page when UserProfile opens as a modal. (Requires a custom page to have been set in
      `/help`)
      <UserButton.Action
        label='manageAccount'
        labelIcon={<Icon />}
      />
      <UserButton.Action
        label='Chat Modal'
        labelIcon={<Icon />}
        onClick={() => setModal(true)}
      />
    </UserButton.MenuItems>
  </UserButton>
  ```

### Patch Changes

- Updated dependencies [[`aa06f3ba7`](https://github.com/clerk/javascript/commit/aa06f3ba7e725071c90d4a1d6840060236da3c23), [`80e647731`](https://github.com/clerk/javascript/commit/80e64773135865434cf0e6c220e287397aa07937)]:
  - @clerk/types@4.10.0
  - @clerk/shared@2.4.2

## 5.2.10

### Patch Changes

- Updated dependencies [[`b48689705`](https://github.com/clerk/javascript/commit/b48689705f9fc2251d2f24addec7a0d0b1da0fe1)]:
  - @clerk/types@4.9.1
  - @clerk/shared@2.4.1

## 5.2.9

### Patch Changes

- Updated dependencies [[`b87f7b9e1`](https://github.com/clerk/javascript/commit/b87f7b9e163756fd43789bc7b7344d2eb24015ec), [`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`86c75e50c`](https://github.com/clerk/javascript/commit/86c75e50cba9c4efb480672f1b8c6a6fff4ef477)]:
  - @clerk/shared@2.4.0
  - @clerk/types@4.9.0

## 5.2.8

### Patch Changes

- Updated dependencies [[`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7)]:
  - @clerk/types@4.8.0
  - @clerk/shared@2.3.3

## 5.2.7

### Patch Changes

- Fix race condition on updating ClerkProvider props before ClerkJS has loaded ([#3655](https://github.com/clerk/javascript/pull/3655)) by [@anagstef](https://github.com/anagstef)

## 5.2.6

### Patch Changes

- Updated dependencies [[`d6b5006c4`](https://github.com/clerk/javascript/commit/d6b5006c4cc1b6f07bb3a6832b4ec6e65ea15814)]:
  - @clerk/types@4.7.0
  - @clerk/shared@2.3.2

## 5.2.5

### Patch Changes

- Updated dependencies [[`1273b04ec`](https://github.com/clerk/javascript/commit/1273b04ecf1866b59ef59a74abe31dbcc726da2c)]:
  - @clerk/types@4.6.1
  - @clerk/shared@2.3.1

## 5.2.4

### Patch Changes

- Updated dependencies [[`4ec3f63e2`](https://github.com/clerk/javascript/commit/4ec3f63e26d8d3725a7ba9bbf988a7776fe893ff)]:
  - @clerk/shared@2.3.0

## 5.2.3

### Patch Changes

- Update `SignUpButton` and `SignInButton` to respect `forceRedirect` and `fallbackRedirect` props. Previously, these were getting ignored and successful completions of the flows would fallback to the default redirect URL. ([#3508](https://github.com/clerk/javascript/pull/3508)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`86a27f693`](https://github.com/clerk/javascript/commit/86a27f6933de50c99b6bc354bf87ff5c2cfcaf38), [`02bed2e00`](https://github.com/clerk/javascript/commit/02bed2e00d3e0a4e1bb1698b13267faf6aeb31b3), [`73e5d61e2`](https://github.com/clerk/javascript/commit/73e5d61e21ab3f77f3c8343bc63da0626466c7ac), [`b8e46328d`](https://github.com/clerk/javascript/commit/b8e46328da874859c4928f19f924219cd6520b11)]:
  - @clerk/shared@2.2.2
  - @clerk/types@4.6.0

## 5.2.2

### Patch Changes

- Updated dependencies [[`4beb00672`](https://github.com/clerk/javascript/commit/4beb00672da64bafd67fbc98181c4c2649a9062c)]:
  - @clerk/types@4.5.1

## 5.2.1

### Patch Changes

- With the next major release, NextJS@15 will depend on `react` and `react-dom` v19, which is still in beta. We are updating our peer dependencies accordingly in order to accept `react` and `react-dom` @ `19.0.0-beta` ([#3428](https://github.com/clerk/javascript/pull/3428)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`ff31f7255`](https://github.com/clerk/javascript/commit/ff31f725541d82caaa9c13cf42cf15f8ce3992f4), [`0e48fc210`](https://github.com/clerk/javascript/commit/0e48fc210cf0b5852052a21494a05f6e723101f5)]:
  - @clerk/shared@2.2.1

## 5.2.0

### Minor Changes

- Add support for GoogleOneTap. New APIs listed: ([#3392](https://github.com/clerk/javascript/pull/3392)) by [@panteliselef](https://github.com/panteliselef)

  ### React component
  - `<GoogleOneTap/>`

  Customize the UX of the prompt

  ```tsx
  <GoogleOneTap
    cancelOnTapOutside={false}
    itpSupport={false}
    fedCmSupport={false}
  />
  ```

  ### Use the component from with Vanilla JS
  - `Clerk.openGoogleOneTap(props: GoogleOneTapProps)`
  - `Clerk.closeGoogleOneTap()`

  ### Low level APIs for custom flows
  - `await Clerk.authenticateWithGoogleOneTap({ token: 'xxxx'})`
  - `await Clerk.handleGoogleOneTapCallback()`

  We recommend using this two methods together in order and let Clerk to perform the correct redirections.

  ```tsx
  google.accounts.id.initialize({
    callback: async response => {
      const signInOrUp = await Clerk.authenticateWithGoogleOneTap({
        token: response.credential,
      });
      await Clerk.handleGoogleOneTapCallback(signInOrUp, {
        signInForceRedirectUrl: window.location.href,
      });
    },
  });
  ```

  In case you want to handle the redirection and session management yourself you can do so like this

  ```tsx
  google.accounts.id.initialize({
    callback: async response => {
      const signInOrUp = await Clerk.authenticateWithGoogleOneTap({
        token: response.credential,
      });
      if (signInOrUp.status === 'complete') {
        await Clerk.setActive({
          session: signInOrUp.createdSessionId,
        });
      }
    },
  });
  ```

### Patch Changes

- Updated dependencies [[`d6a9b3f5d`](https://github.com/clerk/javascript/commit/d6a9b3f5dd8c64b1bd49f74c3707eb01dcd6aff4), [`456b06849`](https://github.com/clerk/javascript/commit/456b068493b8679e1772819eea24d49aa1bc6556)]:
  - @clerk/types@4.5.0
  - @clerk/shared@2.2.0

## 5.1.0

### Minor Changes

- Replace mount with open for GoogleOneTap. New api is `__experimental_openGoogleOneTap`. ([#3379](https://github.com/clerk/javascript/pull/3379)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`3d790d5ea`](https://github.com/clerk/javascript/commit/3d790d5ea347a51ef16557c015c901a9f277effe)]:
  - @clerk/types@4.4.0

## 5.0.7

### Patch Changes

- Updated dependencies [[`eae0a32d5`](https://github.com/clerk/javascript/commit/eae0a32d5c9e97ccbfd96e001c2cac6bc753b5b3)]:
  - @clerk/types@4.3.1

## 5.0.6

### Patch Changes

- Updated dependencies [[`ec84d51e7`](https://github.com/clerk/javascript/commit/ec84d51e705370273ffb82a0d7c94d90ba3de874)]:
  - @clerk/shared@2.1.1

## 5.0.5

### Patch Changes

- Respect the `signInForceRedirectUrl`, `signInFallbackRedirectUrl`, `signUpForceRedirectUrl` and `signUpFallbackRedirectUrl` props passed to `SignInButton`, `SignUpButton` and the low-level `window.Clerk.buildSignInUrl` & `window.Clerk.buildSignUpUrl` methods. These props allow you to control the redirect behavior of the `SignIn` and `SignUp` components. For more information, refer to the [Custom Redirects](https://clerk.com/docs/guides/custom-redirects) guide. ([#3361](https://github.com/clerk/javascript/pull/3361)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`94197710a`](https://github.com/clerk/javascript/commit/94197710a70381c4f1c460948ef02cd2a70b88bb), [`b27ca8366`](https://github.com/clerk/javascript/commit/b27ca8366a1d6ec1d7ce4a5be5005f1b1b017c20)]:
  - @clerk/types@4.3.0
  - @clerk/shared@2.1.0

## 5.0.4

### Patch Changes

- Rename local `eslint-config-custom` package to `@clerk/eslint-config-custom` to avoid conflicts with previously published package. Removes `eslint-config-custom` from `@clerk/clerk-react`'s dependencies, as it should only be a development dependency. ([#3307](https://github.com/clerk/javascript/pull/3307)) by [@BRKalow](https://github.com/BRKalow)

- The following are all internal changes and not relevant to any end-user: ([#3341](https://github.com/clerk/javascript/pull/3341)) by [@LauraBeatris](https://github.com/LauraBeatris)

  Add telemetry events for `useSignIn`, `useSignUp`, `useOrganizations` and `useOrganizationList`

- Updated dependencies [[`1662aaae9`](https://github.com/clerk/javascript/commit/1662aaae965fcf36b13dba6b148e096ab6a1cd83), [`f70c885f7`](https://github.com/clerk/javascript/commit/f70c885f798f7ff513f6687f87c8a56daf26fa05), [`f5804a225`](https://github.com/clerk/javascript/commit/f5804a225e9d67cd315700f0ced0ff17b8b14e53)]:
  - @clerk/shared@2.0.2
  - @clerk/types@4.2.1

## 5.0.3

### Patch Changes

- Remove type from clerkjs script attributes that prevents the satellite apps from function properly. ([#3304](https://github.com/clerk/javascript/pull/3304)) by [@panteliselef](https://github.com/panteliselef)

## 5.0.2

### Patch Changes

- Remove deprecated `__clerk_frontend_api` from `Window` interface ([#3288](https://github.com/clerk/javascript/pull/3288)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`a78bc447c`](https://github.com/clerk/javascript/commit/a78bc447c1aabaa41bcbaa2a8fe3c48f31275574), [`c7d626292`](https://github.com/clerk/javascript/commit/c7d626292a9fd12ca0f1b31a1035e711b6e99531), [`19cd42434`](https://github.com/clerk/javascript/commit/19cd42434450e568998336bf6d705e475122abbc)]:
  - @clerk/shared@2.0.1
  - @clerk/types@4.2.0

## 5.0.1

### Patch Changes

- Updated dependencies [[`956d8792f`](https://github.com/clerk/javascript/commit/956d8792fefe9d6a89022f1e938149b25503ec7f)]:
  - @clerk/types@4.1.0

## 5.0.0

### Major Changes

- 2a67f729d: Replace the `signOutCallback` prop on the `<SignOutButton />` with `redirectUrl`. This aligns the API surface with other UI components provided by `@clerk/clerk-react`.

  If you previously used the `signOutCallback` prop to navigate to another page, you can migrate as shown below.

  Before:

  ```jsx
  import { SignOutButton } from '@clerk/clerk-react';

  export const Signout = () => {
    return (
      <SignOutButton
        signOutCallback={() => {
          window.location.href = '/your-path';
        }}
      >
        <button>Sign Out</button>
      </SignOutButton>
    );
  };
  ```

  After:

  ```jsx
  import { SignOutButton } from '@clerk/clerk-react';

  export const Signout = () => {
    return (
      <SignOutButton redirectUrl='/your-path'>
        <button>Sign Out</button>
      </SignOutButton>
    );
  };
  ```

- c2a090513: Change the minimal Node.js version required by Clerk to `18.17.0`.
- deac67c1c: Drop default exports from all packages. Migration guide:
  - use `import { Clerk } from '@clerk/backend';`
  - use `import { clerkInstance } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-js';`
  - use `import { Clerk } from '@clerk/clerk-js/headless';`
  - use `import { IsomorphicClerk } from '@clerk/clerk-react'`
- 83e9d0846: Drop deprecations. Migration steps:
  - use `EmailLinkError` instead of `MagicLinkError`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`
  - use `buildRequestUrl` from `@clerk/backend` instead of `getRequestUrl` from `@clerk/shared`
  - use `OrganizationProvider` instead of `OrganizationContext`
  - use `userMemberships` instead of `organizationList` from `useOrganizationList`
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
- cfea3d9c0: Path-based routing is now the default routing strategy if the `path` prop is filled. Additionally, if the `path` and `routing` props are not filled, an error will be thrown.

  ```jsx

  // Without path or routing props, an error with be thrown
  <UserProfile />
  <CreateOrganization />
  <OrganizationProfile />
  <SignIn />
  <SignUp />

  // Alternative #1
  <UserProfile path="/whatever"/>
  <CreateOrganization path="/whatever"/>
  <OrganizationProfile path="/whatever"/>
  <SignIn path="/whatever"/>
  <SignUp path="/whatever"/>

  // Alternative #2
  <UserProfile routing="hash_or_virtual"/>
  <CreateOrganization routing="hash_or_virtual"/>
  <OrganizationProfile routing="hash_or_virtual"/>
  <SignIn routing="hash_or_virtual"/>
  <SignUp routing="hash_or_virtual"/>
  ```

- 7bffc47cb: Drop `Clerk.isReady(). Use `Clerk.loaded` instead.`
- 2a22aade8: Drop deprecations. Migration steps:
  - drop `orgs` jwt claim from session token
  - change type of `auth` param of `withServerAuth()` callback to `AuthObject` from `ServerSideAuth` in `gatsby-clerk-plugin`
    - use `auth.sessionClaims` instead of `auth.claims`
    - use `AuthObject` properties from `auth`
  - use `publishableKey` instead of `frontendApi`
  - use `ClerkProviderOptionsWrapper` type instead of `IsomorphicClerkOptions`
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
  - Drop `StructureContext` and related errors to reduce code complexity since it seems that it was not being used.
  - Drop `withUser`, `WithUser`, `withClerk` HOFs and `WithClerk`, `withSession`, `WithSession` HOCs from the `@clerk/clerk-react`
    to reduce the export surface since it's trivial to implement if needed.

  ````

- 5f58a2274: Remove hashing and third-party cookie functionality related to development instance session syncing in favor of URL-based session syncing with query parameters.
- 5f58a2274: - `buildUrlWithAuth` no longer accepts an `options` argument.
- 52ff8fe6b: Upgrade React version to >=18 and add react-dom as peer dependency
  to fix issues with vite & rollup building.
- ab4eb56a5: Drop `redirectToHome` redirect method in favour of `redirectToAfterSignUp` or `redirectToAfterSignIn`.

  When the `<SignIn/>` and `<SignUp/>` components are rendered while a user is already logged in, they will now redirect to the configured `afterSignIn` and `afterSignUp` URLs, respectively. Previously, the redirect URL was set to the home URL configured in the dashboard.

- 97407d8aa: Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now.
- f5fb63cf1: Consolidate `afterSignOutOneUrl` & `afterSignOutAllUrl` to `afterSignOutUrl` and drop usage of Dashboard settings in ClerkJS components. The Dashboard settings should only apply to the Account Portal application.
- 477170962: Drop deprecations. Migration steps:
  - drop `formFieldLabel__emailAddress_phoneNumber` from localization keys
  - drop `formFieldLabel__phoneNumber_username` from localization keys
  - drop `formFieldLabel__emailAddress_phoneNumber_username` from localization keys
  - drop `formFieldInputPlaceholder__emailAddress_phoneNumber` from localization keys
  - drop `formFieldInputPlaceholder__phoneNumber_username` from localization keys
  - drop `formFieldInputPlaceholder__emailAddress_phoneNumber_username` from localization keys
  - use `title__connectionFailed` instead of `title__conectionFailed` from localization keys
  - use `actionLabel__connectionFailed` instead of `actionLabel__conectionFailed` from localization keys
  - use `headerTitle__members` instead of `headerTitle__active` from localization keys
  - use `headerTitle__invitations` instead of `headerTitle__invited` from localization keys
  - drop `createOrganization.subtitle` from localization keys
  - use `deDE` instead of `deDe` localization from `@clerk/localizations`
- 3c4209068: Drop deprecations. Migration steps:
  - use `setActive` instead of `setSession` from `useSessionList | useSignUp | useSignIn` hooks
  - use `publishableKey` instead of `frontendApi`
  - use `handleEmailLinkVerification` instead of `handleMagicLinkVerification` from `IsomorphicClerk`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`
- 844847e0b: Align return types for redirectTo\* methods in ClerkJS [SDK-1037]

  Breaking Changes:
  - `redirectToUserProfile` now returns `Promise<unknown>` instead of `void`
  - `redirectToOrganizationProfile` now returns `Promise<unknown>` instead of `void`
  - `redirectToCreateOrganization` now returns `Promise<unknown>` instead of `void`
  - `redirectToHome` now returns `Promise<unknown>` instead of `void`

### Minor Changes

- 7f6a64f43: - By default, all the components with routing will have the `routing` prop assigned as `'path'` by default when the `path` prop is filled.
  - The `<UserButton />` component will set the default value of the `userProfileMode` prop to `'navigation'` if the `userProfileUrl` prop is provided.
  - The `<OrganizationSwitcher />` component will have the `organizationProfileMode` and `createOrganizationMode` props assigned with `'navigation'` by default if the `organizationProfileUrl` and `createOrganizationUrl` props are filled accordingly.
- ff08fe237: Introduce experimental support for Google One Tap
  - React Component `<__experimental_GoogleOneTap/>`
  - JS `clerk.__experimental_mountGoogleOneTap(node,props)`
- c9e0f68af: Fix `@clerk/clerk-react` bundle output to resolve issues with vite / rollup ESM module imports.
  We have also used the `bundle` output to export a single index.ts and dropped the unnecessary
  published files / folders (eg `__tests__`).
- fe2607b6f: Remove MembershipRole. The type `MembershipRole` would always include the old role keys `admin`, `basic_member`, `guest_member`.
  If developers still depend on them after the introduction of custom roles, the can provide them as their custom types for authorization.

  ```ts
  // clerk.d.ts
  interface ClerkAuthorization {
    permission: '';
    role: 'admin' | 'basic_member' | 'guest_member';
  }
  ```

- c7e6d00f5: Experimental support for `<Gate/>` with role checks.
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

- 2e4a43017: Update `@clerk/clerk-js` and `@clerk/clerk-react` to support the following examples:

  ```typescript
  Clerk.signOut({ redirectUrl: '/' })

  <SignOutButton redirectUrl='/' />
  // uses Clerk.signOut({ redirectUrl: '/' })
  <UserButton afterSignOutUrl='/after' />
  // uses Clerk.signOut({ redirectUrl: '/after' })
  <ClerkProvider afterSignOutUrl='/after' />
  // uses Clerk.signOut({ redirectUrl: '/after' })
  ```

- f98e480b1: Speed up loading of clerk-js by using a `<script/>` tag when html is generated.
  This is supported during SSR, SSG in
  - Next.js Pages Router
  - Next.js App Router
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
- 18c0d015d: Pass environment into `sdkMetadata` in order to detect if production clerk-js is used by other sdks in dev mode. When it is log dev warning from clerk-js.
- d6a7ea61a: Update the TypeScript types of `<ClerkProvider />`. If you use the `routerPush` prop you're now required to also provide the `routerReplace` prop (or other way around). You can also not provide them at all since both props are optional.
- db2d82901: Apply the following changes to components with routing props:
  - default is `routing="path"` and `path` prop is required to be set via env or context
  - when `routing="hash"` or `routing="virtual"` is set the implicit (via env or context) `path` option is ignored
  - when `routing="hash"` or `routing="virtual"` then `path` prop is not allowed to be set

  Examples of components with routing props:
  - `<CreateOrganization />`
  - `<OrganizationProfile />`
  - `<SignIn />`
  - `<SignUp />`
  - `<UserProfile />`

### Patch Changes

- 6ac9e717a: Properly fire onLoad event when clerk-js is already loaded.
- 2de442b24: Rename beta-v5 to beta
- ee57f21ac: Export `EmailLinkErrorCode` from `/errors` module
- 2e77cd737: Set correct information on required Node.js and React versions in README
- ae3a6683a: Ignore `.test.ts` files for the build output. Should result in smaller bundle size.
- 6e54b1b59: Sync IsomorphicClerk with the clerk singleton and the LoadedClerk interface. IsomorphicClerk now extends from LoadedClerk.
- 8cc45d2af: Allow dynamic values components props, even if these values change after the components are rendered. For example, a `SignIn` component with a `redirectUrl` prop passed in will always respect the latest value of `redirectUrl`.
- 797e327e0: Replace internal logic of determining package tag & major version with [semver](https://www.npmjs.com/package/semver) in order to have a more robust solution
- c86f73be3: Introducing stricter types for custom pages for UserProfile and OrganizationProfile.
- 1affbb22a: Replace semver with custom regex in versionSelector
- 75ea300bc: Add `useAssertWrappedByClerkProvider` to internal code. If you use hooks like `useAuth` outside of the `<ClerkProvider />` context an error will be thrown. For example:

  ```shell
  @clerk/clerk-react: useAuth can only be used within the <ClerkProvider /> component
  ```

- e9841dd91: Fixes error thrown for missing path & routing props when path was passed from context.
  This change affects components `<SignIn />`, `<SignUp />` from `@clerk/nextjs` and `@clerk/remix`.
- 59f9a7296: Fixes error when path is passed from context and a routing strategy other than `path` is passed as a prop.
  This change affects components `<SignIn />`, `<SignUp />` from `@clerk/nextjs` and `@clerk/remix`.
- e0e79b4fe: Use the errorThrower shared utility when throwing errors
- fb794ce7b: Support older iOS 13.3 and 13.4 mobile devices
- 40ac4b645: Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry.
- Updated dependencies [743c4d204]
- Updated dependencies [4b8bedc66]
- Updated dependencies [1db1f4068]
- Updated dependencies [c2a090513]
- Updated dependencies [0d0b1d89a]
- Updated dependencies [1834a3ee4]
- Updated dependencies [896cb6104]
- Updated dependencies [64d3763ec]
- Updated dependencies [8350109ab]
- Updated dependencies [1dc28ab46]
- Updated dependencies [83e9d0846]
- Updated dependencies [d37d44a68]
- Updated dependencies [fe356eebd]
- Updated dependencies [791c49807]
- Updated dependencies [ea4933655]
- Updated dependencies [7f6a64f43]
- Updated dependencies [afec17953]
- Updated dependencies [0699fa496]
- Updated dependencies [a68eb3083]
- Updated dependencies [2de442b24]
- Updated dependencies [0293f29c8]
- Updated dependencies [5f58a2274]
- Updated dependencies [9180c8b80]
- Updated dependencies [db18787c4]
- Updated dependencies [7f833da9e]
- Updated dependencies [ef2325dcc]
- Updated dependencies [fc3ffd880]
- Updated dependencies [840636a14]
- Updated dependencies [bab2e7e05]
- Updated dependencies [71663c568]
- Updated dependencies [492b8a7b1]
- Updated dependencies [2352149f6]
- Updated dependencies [e5c989a03]
- Updated dependencies [ff08fe237]
- Updated dependencies [7ecd6f6ab]
- Updated dependencies [12f3c5c55]
- Updated dependencies [244de5ea3]
- Updated dependencies [c776f86fb]
- Updated dependencies [d9f265fcb]
- Updated dependencies [7bffc47cb]
- Updated dependencies [9737ef510]
- Updated dependencies [fafa76fb6]
- Updated dependencies [1f650f30a]
- Updated dependencies [97407d8aa]
- Updated dependencies [2a22aade8]
- Updated dependencies [69ce3e185]
- Updated dependencies [78fc5eec0]
- Updated dependencies [a9fe242be]
- Updated dependencies [5f58a2274]
- Updated dependencies [6a33709cc]
- Updated dependencies [52ff8fe6b]
- Updated dependencies [f77e8cdbd]
- Updated dependencies [8b466a9ba]
- Updated dependencies [fe2607b6f]
- Updated dependencies [c7e6d00f5]
- Updated dependencies [8cc45d2af]
- Updated dependencies [663243220]
- Updated dependencies [c6a5e0f5d]
- Updated dependencies [4edb77632]
- Updated dependencies [ab4eb56a5]
- Updated dependencies [a9fe242be]
- Updated dependencies [5c239d973]
- Updated dependencies [97407d8aa]
- Updated dependencies [12962bc58]
- Updated dependencies [4bb57057e]
- Updated dependencies [d4ff346dd]
- Updated dependencies [7644b7472]
- Updated dependencies [2ec9f6b09]
- Updated dependencies [2e4a43017]
- Updated dependencies [5aab9f04a]
- Updated dependencies [46040a2f3]
- Updated dependencies [f00fd2dfe]
- Updated dependencies [8daf8451c]
- Updated dependencies [75ea300bc]
- Updated dependencies [9a1fe3728]
- Updated dependencies [7f751c4ef]
- Updated dependencies [f5d55bb1f]
- Updated dependencies [18c0d015d]
- Updated dependencies [0d1052ac2]
- Updated dependencies [d30ea1faa]
- Updated dependencies [7886ba89d]
- Updated dependencies [1fd2eff38]
- Updated dependencies [9a1fe3728]
- Updated dependencies [5471c7e8d]
- Updated dependencies [f540e9843]
- Updated dependencies [477170962]
- Updated dependencies [38d8b3e8a]
- Updated dependencies [be991365e]
- Updated dependencies [8350f73a6]
- Updated dependencies [d6a7ea61a]
- Updated dependencies [e0e79b4fe]
- Updated dependencies [41ae1d2f0]
- Updated dependencies [fb794ce7b]
- Updated dependencies [48ca40af9]
- Updated dependencies [94519aa33]
- Updated dependencies [ebf9be77f]
- Updated dependencies [008ac4217]
- Updated dependencies [40ac4b645]
- Updated dependencies [6f755addd]
- Updated dependencies [429d030f7]
- Updated dependencies [844847e0b]
- Updated dependencies [6eab66050]
  - @clerk/shared@2.0.0
  - @clerk/types@4.0.0

## 5.0.0-beta.41

### Patch Changes

- Updated dependencies [[`f00fd2dfe`](https://github.com/clerk/javascript/commit/f00fd2dfe309cfeac82a776cc006f2c21b6d7988)]:
  - @clerk/types@4.0.0-beta.30

## 5.0.0-beta.40

### Patch Changes

- Updated dependencies [[`bab2e7e05`](https://github.com/clerk/javascript/commit/bab2e7e0590d0da1fd7db0680e63e8f2eb836b41)]:
  - @clerk/shared@2.0.0-beta.23
  - @clerk/types@4.0.0-beta.29

## 5.0.0-beta.39

### Minor Changes

- Introduce experimental support for Google One Tap ([#3176](https://github.com/clerk/javascript/pull/3176)) by [@panteliselef](https://github.com/panteliselef)
  - React Component `<__experimental_GoogleOneTap/>`
  - JS `clerk.__experimental_mountGoogleOneTap(node,props)`

- Speed up loading of clerk-js by using a `<script/>` tag when html is generated. ([#3156](https://github.com/clerk/javascript/pull/3156)) by [@panteliselef](https://github.com/panteliselef)

  This is supported during SSR, SSG in
  - Next.js Pages Router
  - Next.js App Router

### Patch Changes

- Support older iOS 13.3 and 13.4 mobile devices ([#3188](https://github.com/clerk/javascript/pull/3188)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`ff08fe237`](https://github.com/clerk/javascript/commit/ff08fe237fa5a9ded04924b3c5821111836b49b6), [`d9f265fcb`](https://github.com/clerk/javascript/commit/d9f265fcb12b39301b9802e4787dc636ee28444f), [`fb794ce7b`](https://github.com/clerk/javascript/commit/fb794ce7b88001b98ad4a628bc2cc39a0c8ccfa5)]:
  - @clerk/types@4.0.0-beta.28
  - @clerk/shared@2.0.0-beta.22

## 5.0.0-beta.38

### Patch Changes

- Updated dependencies [[`94519aa33`](https://github.com/clerk/javascript/commit/94519aa33774c8d6e557ce47a00974ad7b194c5d)]:
  - @clerk/types@4.0.0-beta.27

## 5.0.0-beta.37

### Patch Changes

- Updated dependencies [[`0699fa496`](https://github.com/clerk/javascript/commit/0699fa49693dc7a8d3de8ba053c4f16a5c8431d0)]:
  - @clerk/types@4.0.0-beta.26

## 5.0.0-beta.36

### Patch Changes

- Updated dependencies [[`2352149f6`](https://github.com/clerk/javascript/commit/2352149f6ba9708095146a3087538faf2d4f161f)]:
  - @clerk/types@4.0.0-beta.25

## 5.0.0-beta.35

### Patch Changes

- Updated dependencies [[`9180c8b80`](https://github.com/clerk/javascript/commit/9180c8b80e0ad95c1a9e490e8201ffd089634a48), [`c6a5e0f5d`](https://github.com/clerk/javascript/commit/c6a5e0f5dbd9ec4a7b5657855e8a31bc8347d0a4)]:
  - @clerk/types@4.0.0-beta.24

## 5.0.0-beta.34

### Patch Changes

- Updated dependencies [[`fc3ffd880`](https://github.com/clerk/javascript/commit/fc3ffd88064a09ab98877dfba119150390f9296e), [`840636a14`](https://github.com/clerk/javascript/commit/840636a14537d4f6b810832e7662518ef4bd4500), [`1fd2eff38`](https://github.com/clerk/javascript/commit/1fd2eff38dc71e45d2ff95a5b6e5a99cca53c6e7), [`f540e9843`](https://github.com/clerk/javascript/commit/f540e98435c86298415552537e33164471298a5c)]:
  - @clerk/shared@2.0.0-beta.21
  - @clerk/types@4.0.0-beta.23

## 5.0.0-beta.33

### Patch Changes

- Updated dependencies [[`8350109ab`](https://github.com/clerk/javascript/commit/8350109ab85909e0457199da1db0c9787d94001e)]:
  - @clerk/shared@2.0.0-beta.20

## 5.0.0-beta.32

### Patch Changes

- Updated dependencies [[`afec17953`](https://github.com/clerk/javascript/commit/afec17953d1ae4ba39ee73e4383757694375524d)]:
  - @clerk/types@4.0.0-beta.22

## 5.0.0-beta.31

### Patch Changes

- Updated dependencies [[`0d0b1d89a`](https://github.com/clerk/javascript/commit/0d0b1d89a46d2418cb05a10940f4a399cbd8ffeb), [`1f650f30a`](https://github.com/clerk/javascript/commit/1f650f30a97939817b7b2f3cc6283e22dc431523), [`663243220`](https://github.com/clerk/javascript/commit/6632432208aa6ca507f33fa9ab79abaa40431be6), [`ebf9be77f`](https://github.com/clerk/javascript/commit/ebf9be77f17f8880541de67f66879324f68cf6bd)]:
  - @clerk/types@4.0.0-beta.21

## 5.0.0-beta.30

### Patch Changes

- Introducing stricter types for custom pages for UserProfile and OrganizationProfile. ([#2939](https://github.com/clerk/javascript/pull/2939)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`008ac4217`](https://github.com/clerk/javascript/commit/008ac4217bc648085b3caba92a4524c31cc0925b)]:
  - @clerk/types@4.0.0-beta.20

## 5.0.0-beta.29

### Patch Changes

- Updated dependencies [[`8350f73a6`](https://github.com/clerk/javascript/commit/8350f73a67f8980be78e3bd3343e772f5653d718)]:
  - @clerk/shared@2.0.0-beta.19

## 5.0.0-beta.28

### Patch Changes

- Updated dependencies [[`fafa76fb6`](https://github.com/clerk/javascript/commit/fafa76fb66585b5836cc79985f8bdf1d1b4dca97)]:
  - @clerk/types@4.0.0-beta.19

## 5.0.0-beta.27

### Patch Changes

- Updated dependencies [[`e5c989a03`](https://github.com/clerk/javascript/commit/e5c989a035fa16413414c213febe16fcdbeef9b1), [`2ec9f6b09`](https://github.com/clerk/javascript/commit/2ec9f6b09f98ae276658d6dc705e16df0573d817)]:
  - @clerk/shared@2.0.0-beta.18

## 5.0.0-beta.26

### Minor Changes

- Pass environment into `sdkMetadata` in order to detect if production clerk-js is used by other sdks in dev mode. When it is log dev warning from clerk-js. ([#2802](https://github.com/clerk/javascript/pull/2802)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`18c0d015d`](https://github.com/clerk/javascript/commit/18c0d015d20493e14049fed73a5b6f732372a5cf)]:
  - @clerk/types@4.0.0-beta.18

## 5.0.0-beta.25

### Patch Changes

- Updated dependencies [[`fe356eebd`](https://github.com/clerk/javascript/commit/fe356eebd8ff527133e0818cf664e7def577cccc)]:
  - @clerk/types@4.0.0-beta.17

## 5.0.0-beta.24

### Patch Changes

- Updated dependencies [[`1834a3ee4`](https://github.com/clerk/javascript/commit/1834a3ee496ea27b9f7ceeb32ec5361f9de8ee30)]:
  - @clerk/shared@2.0.0-beta.17

## 5.0.0-beta.23

### Patch Changes

- Updated dependencies [[`db18787c4`](https://github.com/clerk/javascript/commit/db18787c4d9fa8ee1306db9b65f3b3f5e2fe2dad)]:
  - @clerk/shared@2.0.0-beta.16

## 5.0.0-beta.22

### Patch Changes

- Updated dependencies [[`6eab66050`](https://github.com/clerk/javascript/commit/6eab66050608a1bc5cb9aca6a234b1fea16106e5)]:
  - @clerk/shared@2.0.0-beta.15

## 5.0.0-beta.21

### Patch Changes

- Updated dependencies [[`12f3c5c55`](https://github.com/clerk/javascript/commit/12f3c5c55580f93a81df27851fbc92ce1312107e)]:
  - @clerk/shared@2.0.0-beta.14

## 5.0.0-beta.20

### Patch Changes

- Updated dependencies [[`5c239d973`](https://github.com/clerk/javascript/commit/5c239d97373ad2f2aa91ded1b84670f201f7db8f)]:
  - @clerk/types@4.0.0-beta.16

## 5.0.0-beta.19

### Patch Changes

- Rename beta-v5 to beta by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`2de442b24`](https://github.com/clerk/javascript/commit/2de442b2465cc5d424b8a0b21aa57c557f3aa2e7)]:
  - @clerk/shared@2.0.0-beta.13
  - @clerk/types@4.0.0-beta.15

## 5.0.0-beta-v5.18

### Patch Changes

- Properly fire onLoad event when clerk-js is already loaded. ([#2757](https://github.com/clerk/javascript/pull/2757)) by [@panteliselef](https://github.com/panteliselef)

- Export `EmailLinkErrorCode` from `/errors` module ([#2732](https://github.com/clerk/javascript/pull/2732)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Replace semver with custom regex in versionSelector ([#2760](https://github.com/clerk/javascript/pull/2760)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`244de5ea3`](https://github.com/clerk/javascript/commit/244de5ea3a7641727cd85c544bb79fb04f2c0808), [`9737ef510`](https://github.com/clerk/javascript/commit/9737ef5104346821461972d31f3c69e93924f0e0), [`8b466a9ba`](https://github.com/clerk/javascript/commit/8b466a9ba93ca10315b534079b09fa5d76ffa305), [`8daf8451c`](https://github.com/clerk/javascript/commit/8daf8451cb564bc834dd856174ffc2cdfa932e37), [`7f751c4ef`](https://github.com/clerk/javascript/commit/7f751c4ef2d14410058cf65ea984a93b50c0b87e), [`be991365e`](https://github.com/clerk/javascript/commit/be991365e1c78d0f1dfc59bb33dd533b6fad223a)]:
  - @clerk/types@4.0.0-beta-v5.14
  - @clerk/shared@2.0.0-beta-v5.12

## 5.0.0-beta-v5.17

### Patch Changes

- Updated dependencies [[`d4ff346dd`](https://github.com/clerk/javascript/commit/d4ff346dd53bb3e1970e80bdc7b188c2dd344f12), [`7886ba89d`](https://github.com/clerk/javascript/commit/7886ba89d76bfea2d6882a46baf64bf98f1148d3)]:
  - @clerk/shared@2.0.0-beta-v5.11
  - @clerk/types@4.0.0-beta-v5.13

## 5.0.0-alpha-v5.16

### Minor Changes

- Apply the following changes to components with routing props: ([#2543](https://github.com/clerk/javascript/pull/2543)) by [@dimkl](https://github.com/dimkl)
  - default is `routing="path"` and `path` prop is required to be set via env or context
  - when `routing="hash"` or `routing="virtual"` is set the implicit (via env or context) `path` option is ignored
  - when `routing="hash"` or `routing="virtual"` then `path` prop is not allowed to be set

  Examples of components with routing props:
  - `<CreateOrganization />`
  - `<OrganizationProfile />`
  - `<SignIn />`
  - `<SignUp />`
  - `<UserProfile />`

### Patch Changes

- Allow dynamic values components props, even if these values change after the components are rendered. For example, a `SignIn` component with a `redirectUrl` prop passed in will always respect the latest value of `redirectUrl`. ([#2515](https://github.com/clerk/javascript/pull/2515)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`8cc45d2af`](https://github.com/clerk/javascript/commit/8cc45d2af98320ccced3768fb039b86576e424a5)]:
  - @clerk/shared@2.0.0-alpha-v5.10

## 5.0.0-alpha-v5.15

### Patch Changes

- Fixes error thrown for missing path & routing props when path was passed from context. ([#2514](https://github.com/clerk/javascript/pull/2514)) by [@dimkl](https://github.com/dimkl)

  This change affects components `<SignIn />`, `<SignUp />` from `@clerk/nextjs` and `@clerk/remix`.

- Fixes error when path is passed from context and a routing strategy other than `path` is passed as a prop. ([#2530](https://github.com/clerk/javascript/pull/2530)) by [@octoper](https://github.com/octoper)

  This change affects components `<SignIn />`, `<SignUp />` from `@clerk/nextjs` and `@clerk/remix`.

## 5.0.0-alpha-v5.14

### Patch Changes

- Updated dependencies [[`1dc28ab46`](https://github.com/clerk/javascript/commit/1dc28ab46f6930074334be183c637ce7a81bebf7), [`ea4933655`](https://github.com/clerk/javascript/commit/ea4933655863ce315324aa2a3be7d5f263c2b61f), [`38d8b3e8a`](https://github.com/clerk/javascript/commit/38d8b3e8a0387bcf0b9c8d16e3bbfcfe9b643ca2)]:
  - @clerk/shared@2.0.0-alpha-v5.9

## 5.0.0-alpha-v5.13

### Patch Changes

- Updated dependencies [[`7ecd6f6ab`](https://github.com/clerk/javascript/commit/7ecd6f6abb0e5bfb1a57c99cc11860de311c3e82)]:
  - @clerk/shared@2.0.0-alpha-v5.8

## 5.0.0-alpha-v5.12

### Major Changes

- Path-based routing is now the default routing strategy if the `path` prop is filled. Additionally, if the `path` and `routing` props are not filled, an error will be thrown. ([#2338](https://github.com/clerk/javascript/pull/2338)) by [@octoper](https://github.com/octoper)

  ```jsx

  // Without path or routing props, an error with be thrown
  <UserProfile />
  <CreateOrganization />
  <OrganizationProfile />
  <SignIn />
  <SignUp />

  // Alternative #1
  <UserProfile path="/whatever"/>
  <CreateOrganization path="/whatever"/>
  <OrganizationProfile path="/whatever"/>
  <SignIn path="/whatever"/>
  <SignUp path="/whatever"/>

  // Alternative #2
  <UserProfile routing="hash_or_virtual"/>
  <CreateOrganization routing="hash_or_virtual"/>
  <OrganizationProfile routing="hash_or_virtual"/>
  <SignIn routing="hash_or_virtual"/>
  <SignUp routing="hash_or_virtual"/>
  ```

- Consolidate `afterSignOutOneUrl` & `afterSignOutAllUrl` to `afterSignOutUrl` and drop usage of Dashboard settings in ClerkJS components. The Dashboard settings should only apply to the Account Portal application. ([#2414](https://github.com/clerk/javascript/pull/2414)) by [@dimkl](https://github.com/dimkl)

### Minor Changes

- Remove MemberRole Type`MemberRole` would always include the old role keys `admin`, `member`, `guest_member`. ([#2388](https://github.com/clerk/javascript/pull/2388)) by [@panteliselef](https://github.com/panteliselef)

  If developers still depend on them after the introduction of custom roles, the can provide them as their custom types for authorization.

  ```ts
  // clerk.d.ts
  export {};

  interface ClerkAuthorization {
    permission: '';
    role: 'admin' | 'basic_member' | 'guest_member';
  }
  ```

- Update `@clerk/clerk-js` and `@clerk/clerk-react` to support the following examples: ([#2412](https://github.com/clerk/javascript/pull/2412)) by [@dimkl](https://github.com/dimkl)

  ```typescript
  Clerk.signOut({ redirectUrl: '/' })

  <SignOutButton redirectUrl='/' />
  // uses Clerk.signOut({ redirectUrl: '/' })
  <UserButton afterSignOutUrl='/after' />
  // uses Clerk.signOut({ redirectUrl: '/after' })
  <ClerkProvider afterSignOutUrl='/after' />
  // uses Clerk.signOut({ redirectUrl: '/after' })
  ```

### Patch Changes

- Updated dependencies [[`fe2607b6f`](https://github.com/clerk/javascript/commit/fe2607b6fdeed83002db7e4a0c040ac0280e5ff7), [`2e4a43017`](https://github.com/clerk/javascript/commit/2e4a43017ef33b541949ba90e16bf5311ce8bc60)]:
  - @clerk/types@4.0.0-alpha-v5.12

## 5.0.0-alpha-v5.11

### Major Changes

- Replace the `signOutCallback` prop on the `<SignOutButton />` with `redirectUrl`. This aligns the API surface with other UI components provided by `@clerk/clerk-react`. ([#2348](https://github.com/clerk/javascript/pull/2348)) by [@LekoArts](https://github.com/LekoArts)

  If you previously used the `signOutCallback` prop to navigate to another page, you can migrate as shown below.

  Before:

  ```jsx
  import { SignOutButton } from '@clerk/clerk-react';

  export const Signout = () => {
    return (
      <SignOutButton
        signOutCallback={() => {
          window.location.href = '/your-path';
        }}
      >
        <button>Sign Out</button>
      </SignOutButton>
    );
  };
  ```

  After:

  ```jsx
  import { SignOutButton } from '@clerk/clerk-react';

  export const Signout = () => {
    return (
      <SignOutButton redirectUrl='/your-path'>
        <button>Sign Out</button>
      </SignOutButton>
    );
  };
  ```

- Remove hashing and third-party cookie functionality related to development instance session syncing in favor of URL-based session syncing with query parameters. ([#2367](https://github.com/clerk/javascript/pull/2367)) by [@tmilewski](https://github.com/tmilewski)

- - `buildUrlWithAuth` no longer accepts an `options` argument. ([#2367](https://github.com/clerk/javascript/pull/2367)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Updated dependencies [[`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7)]:
  - @clerk/types@4.0.0-alpha-v5.11
  - @clerk/shared@2.0.0-alpha-v5.7

## 5.0.0-alpha-v5.10

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
  - Drop `StructureContext` and related errors to reduce code complexity since it seems that it was not being used.
  - Drop `withUser`, `WithUser`, `withClerk` HOFs and `WithClerk`, `withSession`, `WithSession` HOCs from the `@clerk/clerk-react`
    to reduce the export surface since it's trivial to implement if needed.

- Drop `redirectToHome` redirect method in favour of `redirectToAfterSignUp` or `redirectToAfterSignIn`. ([#2251](https://github.com/clerk/javascript/pull/2251)) by [@octoper](https://github.com/octoper)

  When the `<SignIn/>` and `<SignUp/>` components are rendered while a user is already logged in, they will now redirect to the configured `afterSignIn` and `afterSignUp` URLs, respectively. Previously, the redirect URL was set to the home URL configured in the dashboard.

- Align return types for redirectTo\* methods in ClerkJS [SDK-1037] ([#2316](https://github.com/clerk/javascript/pull/2316)) by [@tmilewski](https://github.com/tmilewski)

  Breaking Changes:
  - `redirectToUserProfile` now returns `Promise<unknown>` instead of `void`
  - `redirectToOrganizationProfile` now returns `Promise<unknown>` instead of `void`
  - `redirectToCreateOrganization` now returns `Promise<unknown>` instead of `void`
  - `redirectToHome` now returns `Promise<unknown>` instead of `void`

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

- Add `useAssertWrappedByClerkProvider` to internal code. If you use hooks like `useAuth` outside of the `<ClerkProvider />` context an error will be thrown. For example: ([#2299](https://github.com/clerk/javascript/pull/2299)) by [@tmilewski](https://github.com/tmilewski)

  ```shell
  @clerk/clerk-react: useAuth can only be used within the <ClerkProvider /> component
  ```

- Updated dependencies [[`896cb6104`](https://github.com/clerk/javascript/commit/896cb610409f84c0ff7a4f502f0b4ccee1afc157), [`69ce3e185`](https://github.com/clerk/javascript/commit/69ce3e185b89283956cb711629bc61703166b1c9), [`ab4eb56a5`](https://github.com/clerk/javascript/commit/ab4eb56a5c34baf496ebb8ac412ad6171b9bd79c), [`46040a2f3`](https://github.com/clerk/javascript/commit/46040a2f34d0991072fca490e031c1994b2e2296), [`75ea300bc`](https://github.com/clerk/javascript/commit/75ea300bce16a0ce401a225263bb267ad2a217b8), [`844847e0b`](https://github.com/clerk/javascript/commit/844847e0becf20243fba3c659b2b77a238dd270a)]:
  - @clerk/shared@2.0.0-alpha-v5.6
  - @clerk/types@4.0.0-alpha-v5.10

## 5.0.0-alpha-v5.9

### Major Changes

- Drop `Clerk.isReady(). Use `Clerk.loaded` instead.` ([#2294](https://github.com/clerk/javascript/pull/2294)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`1db1f4068`](https://github.com/clerk/javascript/commit/1db1f4068466d967df0de39f032a476ca8163651), [`7bffc47cb`](https://github.com/clerk/javascript/commit/7bffc47cb71a2c3e026df5977c25487bfd5c55d7)]:
  - @clerk/types@4.0.0-alpha-v5.9

## 5.0.0-alpha-v5.8

### Patch Changes

- Set correct information on required Node.js and React versions in README ([#2264](https://github.com/clerk/javascript/pull/2264)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`6a33709cc`](https://github.com/clerk/javascript/commit/6a33709ccf48586f1a8b62216688ea300b7b5dfb), [`d30ea1faa`](https://github.com/clerk/javascript/commit/d30ea1faa45074e09c037530e8ba3ca2dbd50654)]:
  - @clerk/types@4.0.0-alpha-v5.8
  - @clerk/shared@2.0.0-alpha-v5.5

## 5.0.0-alpha-v5.7

### Minor Changes

- Fix `@clerk/clerk-react` bundle output to resolve issues with vite / rollup ESM module imports. ([#2216](https://github.com/clerk/javascript/pull/2216)) by [@dimkl](https://github.com/dimkl)

  We have also used the `bundle` output to export a single index.ts and dropped the unnecessary
  published files / folders (eg `__tests__`).

- Update the TypeScript types of `<ClerkProvider />`. If you use the `routerPush` prop you're now required to also provide the `routerReplace` prop (or other way around). You can also not provide them at all since both props are optional. ([#2227](https://github.com/clerk/javascript/pull/2227)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Sync IsomorphicClerk with the clerk singleton and the LoadedClerk interface. IsomorphicClerk now extends from LoadedClerk. ([#2226](https://github.com/clerk/javascript/pull/2226)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`4b8bedc66`](https://github.com/clerk/javascript/commit/4b8bedc66d47dca5c6192148f4b31ae6d49ff733), [`c776f86fb`](https://github.com/clerk/javascript/commit/c776f86fb2a999dcae46fda9abb5005718c354b2), [`d6a7ea61a`](https://github.com/clerk/javascript/commit/d6a7ea61a8ae64c93877ec117e54fc48b1c86f16)]:
  - @clerk/shared@2.0.0-alpha-v5.4
  - @clerk/types@4.0.0-alpha-v5.7

## 5.0.0-alpha-v5.6

### Patch Changes

- Updated dependencies [[`5aab9f04a`](https://github.com/clerk/javascript/commit/5aab9f04a1eac39e42a03f555075e08a5a8ee02c), [`9a1fe3728`](https://github.com/clerk/javascript/commit/9a1fe37289c7606dc111913cb9f70f2a2efff6b7), [`9a1fe3728`](https://github.com/clerk/javascript/commit/9a1fe37289c7606dc111913cb9f70f2a2efff6b7)]:
  - @clerk/types@4.0.0-alpha-v5.6

## 5.0.0-alpha-v5.5

### Patch Changes

- Updated dependencies [[`12962bc58`](https://github.com/clerk/javascript/commit/12962bc58e2c9caad416ba4e6d52061d00bc2feb)]:
  - @clerk/types@4.0.0-alpha-v5.5

## 5.0.0-alpha-v5.4

### Minor Changes

- - By default, all the components with routing will have the `routing` prop assigned as `'path'` by default when the `path` prop is filled. ([#1957](https://github.com/clerk/javascript/pull/1957)) by [@octoper](https://github.com/octoper)

  - The `<UserButton />` component will set the default value of the `userProfileMode` prop to `'navigation'` if the `userProfileUrl` prop is provided.
  - The `<OrganizationSwitcher />` component will have the `organizationProfileMode` and `createOrganizationMode` props assigned with `'navigation'` by default if the `organizationProfileUrl` and `createOrganizationUrl` props are filled accordingly.

### Patch Changes

- Updated dependencies [[`7f6a64f43`](https://github.com/clerk/javascript/commit/7f6a64f4335832c66ff355f6d2f311f33a313d59)]:
  - @clerk/types@4.0.0-alpha-v5.4

## 5.0.0-alpha-v5.3

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

- Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry. ([#2154](https://github.com/clerk/javascript/pull/2154)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`52ff8fe6b`](https://github.com/clerk/javascript/commit/52ff8fe6b6ff88ceb5e1246378b54b0565bede9d), [`4bb57057e`](https://github.com/clerk/javascript/commit/4bb57057e9af20fc433626ed178d97d3ca811362), [`40ac4b645`](https://github.com/clerk/javascript/commit/40ac4b645f449b546dae5b4c0d013c9d9ea6d09c), [`429d030f7`](https://github.com/clerk/javascript/commit/429d030f7b6efe838a1e7fec7f736ba59fcc6b61)]:
  - @clerk/shared@2.0.0-alpha-v5.3
  - @clerk/types@4.0.0-alpha-v5.3

## 5.0.0-alpha-v5.2

### Major Changes

- Change the minimal Node.js version required by Clerk to `18.17.0`. ([#2162](https://github.com/clerk/javascript/pull/2162)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`c2a090513`](https://github.com/clerk/javascript/commit/c2a0905132684a4a1e8d598b66caddf20062273e)]:
  - @clerk/shared@2.0.0-alpha-v5.2
  - @clerk/types@4.0.0-alpha-v5.2

## 5.0.0-alpha-v5.1

### Major Changes

- Drop default exports from all packages. Migration guide: ([#2150](https://github.com/clerk/javascript/pull/2150)) by [@dimkl](https://github.com/dimkl)
  - use `import { Clerk } from '@clerk/backend';`
  - use `import { clerkInstance } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-js';`
  - use `import { Clerk } from '@clerk/clerk-js/headless';`
  - use `import { IsomorphicClerk } from '@clerk/clerk-react'`

- Drop deprecations. Migration steps: ([#2102](https://github.com/clerk/javascript/pull/2102)) by [@dimkl](https://github.com/dimkl)
  - use `EmailLinkError` instead of `MagicLinkError`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`
  - use `buildRequestUrl` from `@clerk/backend` instead of `getRequestUrl` from `@clerk/shared`
  - use `OrganizationProvider` instead of `OrganizationContext`
  - use `userMemberships` instead of `organizationList` from `useOrganizationList`

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

- Drop deprecations. Migration steps: ([#2109](https://github.com/clerk/javascript/pull/2109)) by [@dimkl](https://github.com/dimkl)
  - drop `orgs` jwt claim from session token
  - change type of `auth` param of `withServerAuth()` callback to `AuthObject` from `ServerSideAuth` in `gatsby-clerk-plugin`
    - use `auth.sessionClaims` instead of `auth.claims`
    - use `AuthObject` properties from `auth`
  - use `publishableKey` instead of `frontendApi`
  - use `ClerkProviderOptionsWrapper` type instead of `IsomorphicClerkOptions`

- Drop deprecations. Migration steps: ([#2151](https://github.com/clerk/javascript/pull/2151)) by [@dimkl](https://github.com/dimkl)
  - drop `formFieldLabel__emailAddress_phoneNumber` from localization keys
  - drop `formFieldLabel__phoneNumber_username` from localization keys
  - drop `formFieldLabel__emailAddress_phoneNumber_username` from localization keys
  - drop `formFieldInputPlaceholder__emailAddress_phoneNumber` from localization keys
  - drop `formFieldInputPlaceholder__phoneNumber_username` from localization keys
  - drop `formFieldInputPlaceholder__emailAddress_phoneNumber_username` from localization keys
  - use `title__connectionFailed` instead of `title__conectionFailed` from localization keys
  - use `actionLabel__connectionFailed` instead of `actionLabel__conectionFailed` from localization keys
  - use `headerTitle__members` instead of `headerTitle__active` from localization keys
  - use `headerTitle__invitations` instead of `headerTitle__invited` from localization keys
  - drop `createOrganization.subtitle` from localization keys
  - use `deDE` instead of `deDe` localization from `@clerk/localizations`

- Drop deprecations. Migration steps: ([#1993](https://github.com/clerk/javascript/pull/1993)) by [@dimkl](https://github.com/dimkl)
  - use `setActive` instead of `setSession` from `useSessionList | useSignUp | useSignIn` hooks
  - use `publishableKey` instead of `frontendApi`
  - use `handleEmailLinkVerification` instead of `handleMagicLinkVerification` from `IsomorphicClerk`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`

### Patch Changes

- Use the errorThrower shared utility when throwing errors ([#1999](https://github.com/clerk/javascript/pull/1999)) by [@anagstef](https://github.com/anagstef)

- Updated dependencies [[`64d3763ec`](https://github.com/clerk/javascript/commit/64d3763ec73747ad04c4b47017195cf4114e150c), [`83e9d0846`](https://github.com/clerk/javascript/commit/83e9d08469e7c2840f06aa7d86831055e23f67a5), [`7f833da9e`](https://github.com/clerk/javascript/commit/7f833da9ebc1b2ec9c65513628c377d0584e5d72), [`492b8a7b1`](https://github.com/clerk/javascript/commit/492b8a7b12f14658a384566012e5807f0a171710), [`2a22aade8`](https://github.com/clerk/javascript/commit/2a22aade8c9bd1f83a9be085983f96fa87903804), [`f77e8cdbd`](https://github.com/clerk/javascript/commit/f77e8cdbd24411f7f9dbfdafcab0596c598f66c1), [`0d1052ac2`](https://github.com/clerk/javascript/commit/0d1052ac284b909786fd0e4744b02fcf4d1a8be6), [`5471c7e8d`](https://github.com/clerk/javascript/commit/5471c7e8dd0155348748fa90e5ae97093f59efe9), [`477170962`](https://github.com/clerk/javascript/commit/477170962f486fd4e6b0653a64826573f0d8621b), [`e0e79b4fe`](https://github.com/clerk/javascript/commit/e0e79b4fe47f64006718d547c898b9f67fe4d424)]:
  - @clerk/shared@2.0.0-alpha-v5.1
  - @clerk/types@4.0.0-alpha-v5.1

## 5.0.0-alpha-v5.0

### Major Changes

- Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

### Minor Changes

- Experimental support for `<Gate/>` with role checks. ([#1942](https://github.com/clerk/javascript/pull/1942)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Ignore `.test.ts` files for the build output. Should result in smaller bundle size. ([#2005](https://github.com/clerk/javascript/pull/2005)) by [@LekoArts](https://github.com/LekoArts)

- Replace internal logic of determining package tag & major version with [semver](https://www.npmjs.com/package/semver) in order to have a more robust solution ([#2011](https://github.com/clerk/javascript/pull/2011)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`743c4d204`](https://github.com/clerk/javascript/commit/743c4d20423790b554e66923466081c0d3b0d9ed), [`d37d44a68`](https://github.com/clerk/javascript/commit/d37d44a68e83b8e895963415f000c1aaef66e87e), [`791c49807`](https://github.com/clerk/javascript/commit/791c49807c3c9e19964cbf621c935d237caeecf3), [`a68eb3083`](https://github.com/clerk/javascript/commit/a68eb3083ff68459cd33098e2df190a5ba26c841), [`0293f29c8`](https://github.com/clerk/javascript/commit/0293f29c855c9415b54867196e8d727d1614e4ca), [`ef2325dcc`](https://github.com/clerk/javascript/commit/ef2325dcc18729e9ce9ee5823e9a963efa51dbc1), [`71663c568`](https://github.com/clerk/javascript/commit/71663c568926b1d60b97aa7ccc5298d05b618af2), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`78fc5eec0`](https://github.com/clerk/javascript/commit/78fc5eec0d61c14d86204944c6aa9f341ae6ea98), [`c7e6d00f5`](https://github.com/clerk/javascript/commit/c7e6d00f56e73df4ed87712e74ad9d5bcaca8924), [`4edb77632`](https://github.com/clerk/javascript/commit/4edb7763271b80d93fcd52ece5f1e408bd75df6f), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`7644b7472`](https://github.com/clerk/javascript/commit/7644b74726ba73e615a1256f9ff3fa03b0f8bc30), [`f5d55bb1f`](https://github.com/clerk/javascript/commit/f5d55bb1fc6a87303fb8bf461c3a917ae4da4005), [`41ae1d2f0`](https://github.com/clerk/javascript/commit/41ae1d2f006a0e4657a97a9c83ae7eb0cc167834), [`48ca40af9`](https://github.com/clerk/javascript/commit/48ca40af97a7fa4f2e41cf0f071028767d1b0075), [`6f755addd`](https://github.com/clerk/javascript/commit/6f755addd0886b9ff8b0d5dbe48e37470049acad)]:
  - @clerk/shared@2.0.0-alpha-v5.0
  - @clerk/types@4.0.0-alpha-v5.0

## 4.27.0

### Minor Changes

- Introduce customization in `UserProfile` and `OrganizationProfile` ([#1822](https://github.com/clerk/javascript/pull/1822)) by [@anagstef](https://github.com/anagstef)

  The `<UserProfile />` component now allows the addition of custom pages and external links to the navigation sidebar. Custom pages can be created using the `<UserProfile.Page>` component, and external links can be added using the `<UserProfile.Link>` component. The default routes, such as `Account` and `Security`, can be reordered.

  Example React API usage:

  ```tsx
  <UserProfile>
    <UserProfile.Page
      label='Custom Page'
      url='custom'
      labelIcon={<CustomIcon />}
    >
      <MyCustomPageContent />
    </UserProfile.Page>
    <UserProfile.Link
      label='External'
      url='/home'
      labelIcon={<Icon />}
    />
    <UserProfile.Page label='account' />
    <UserProfile.Page label='security' />
  </UserProfile>
  ```

  Custom pages and links should be provided as children using the `<UserButton.UserProfilePage>` and `<UserButton.UserProfileLink>` components when using the `UserButton` component.

  The `<OrganizationProfile />` component now supports the addition of custom pages and external links to the navigation sidebar. Custom pages can be created using the `<OrganizationProfile.Page>` component, and external links can be added using the `<OrganizationProfile.Link>` component. The default routes, such as `Members` and `Settings`, can be reordered.

  Example React API usage:

  ```tsx
  <OrganizationProfile>
    <OrganizationProfile.Page
      label='Custom Page'
      url='custom'
      labelIcon={<CustomIcon />}
    >
      <MyCustomPageContent />
    </OrganizationProfile.Page>
    <OrganizationProfile.Link
      label='External'
      url='/home'
      labelIcon={<Icon />}
    />
    <OrganizationProfile.Page label='members' />
    <OrganizationProfile.Page label='settings' />
  </OrganizationProfile>
  ```

  Custom pages and links should be provided as children using the `<OrganizationSwitcher.OrganizationProfilePage>` and `<OrganizationSwitcher.OrganizationProfileLink>` components when using the `OrganizationSwitcher` component.

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Update imports of `@clerk/shared` to granular entrypoints. This addresses warnings during a Next.js build that are the result of unsupported APIs being included in the module graph of builds for the edge runtime. ([#1924](https://github.com/clerk/javascript/pull/1924)) by [@BRKalow](https://github.com/BRKalow)

- Consider `Clerk.setActive` as stable. ([#1917](https://github.com/clerk/javascript/pull/1917)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`3bf64107e`](https://github.com/clerk/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`52f8553d2`](https://github.com/clerk/javascript/commit/52f8553d22f9454ee1194fd162410db15da7a4be), [`92727eec3`](https://github.com/clerk/javascript/commit/92727eec39566278263ffa118a085493f964eb94), [`b09b66eec`](https://github.com/clerk/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerk/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62), [`aa4cd7615`](https://github.com/clerk/javascript/commit/aa4cd761585b888706a36a6eed7436a8f0476dbf)]:
  - @clerk/shared@1.0.0
  - @clerk/types@3.57.0

## 4.26.6

### Patch Changes

- Updated dependencies [[`9ca215702`](https://github.com/clerk/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11)]:
  - @clerk/types@3.56.1

## 4.26.5

### Patch Changes

- Fix methods in clerk-js that consumede paginated endpoints in order to retrieve single resources. ([#1871](https://github.com/clerk/javascript/pull/1871)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`35be8709d`](https://github.com/clerk/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`e38488c92`](https://github.com/clerk/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerk/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`9b644d799`](https://github.com/clerk/javascript/commit/9b644d7991b8cba4b385e9443f87798cde5c9989), [`a9894b445`](https://github.com/clerk/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`834dadb36`](https://github.com/clerk/javascript/commit/834dadb36c30b2a8f052784de4ad1026b0083b4e), [`70f251007`](https://github.com/clerk/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`a46d6fe99`](https://github.com/clerk/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/types@3.56.0
  - @clerk/shared@0.24.5

## 4.26.4

### Patch Changes

- Warn about _MagicLink_ deprecations: ([#1836](https://github.com/clerk/javascript/pull/1836)) by [@dimkl](https://github.com/dimkl)
  - `MagicLinkError`
  - `isMagicLinkError`
  - `MagicLinkErrorCode`
  - `handleMagicLinkVerification`
  - `createMagicLinkFlow`
  - `useMagicLink`

- Introduce a new property on the core Clerk singleton, `sdkMetadata`. This will be populated by each host SDK. This metadata will be used to make logging and debugging easier. ([#1857](https://github.com/clerk/javascript/pull/1857)) by [@BRKalow](https://github.com/BRKalow)

- Introduce new `*EmailLink*` helpers that will replace the `*MagicLink*` helpers. ([#1833](https://github.com/clerk/javascript/pull/1833)) by [@dimkl](https://github.com/dimkl)

  Also marked all the `*MagicLink*` as deprecated using JSDocs.

- Updated dependencies [[`977336f79`](https://github.com/clerk/javascript/commit/977336f793cd4ce5984f98dac3cedf9f5ec363f5), [`997b8e256`](https://github.com/clerk/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91e9a55f4`](https://github.com/clerk/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`91014880d`](https://github.com/clerk/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`7f4d4b942`](https://github.com/clerk/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b)]:
  - @clerk/shared@0.24.4
  - @clerk/types@3.55.0

## 4.26.3

### Patch Changes

- Make `types` the first key in all `exports` maps defined in our packages' `package.json`. The [TypeScript docs](https://www.typescriptlang.org/docs/handbook/esm-node.html#packagejson-exports-imports-and-self-referencing) recommends so, as the `exports` map is order-based. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Apply deprecation warnings for @clerk/types: ([#1823](https://github.com/clerk/javascript/pull/1823)) by [@dimkl](https://github.com/dimkl)
  - `orgs` jwt claims
  - `apiKey`
  - `frontendApi`
  - `redirect_url`
  - `password`
  - `generateSignature`
  - `afterSwitchOrganizationUrl`
  - `profileImageUrl`

- Updated dependencies [[`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1e212c19d`](https://github.com/clerk/javascript/commit/1e212c19d1cbfbcf6bc6718f5aec0a3cb893b96f), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679)]:
  - @clerk/shared@0.24.3

## 4.26.2

### Patch Changes

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Fix internal subpath imports by replacing them with top level imports. ([#1804](https://github.com/clerk/javascript/pull/1804)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerk/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`164f3aac7`](https://github.com/clerk/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerk/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerk/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`0636ff779`](https://github.com/clerk/javascript/commit/0636ff7799e126d1438d2738ce0e46c3b277f46a), [`9514618d6`](https://github.com/clerk/javascript/commit/9514618d65cfdde0ff011eabd41a992b61fc8dc1), [`c7c6912f3`](https://github.com/clerk/javascript/commit/c7c6912f34874467bc74104690fe9f95491cc10d), [`71bb1c7b5`](https://github.com/clerk/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf)]:
  - @clerk/types@3.54.0
  - @clerk/shared@0.24.2

## 4.26.1

### Patch Changes

- Refactor our script loading logic to use a `versionSelector` helper function. No change in behavior should occur. This internal change allows versions tagged with `snapshot` and `staging` to use the exact corresponding NPM version of `@clerk/clerk-js`. ([#1780](https://github.com/clerk/javascript/pull/1780)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`cecf74d79`](https://github.com/clerk/javascript/commit/cecf74d79069662d25f73e4745aa01348d398afb)]:
  - @clerk/shared@0.24.1

## 4.26.0

### Minor Changes

- `<SignIn/>`, `<SignUp/>`, `<RedirectToSignin/>`, `<RedirectToSignUp/>`, `clerk.redirectToSignIn()` and `clerk.redirectToSignUp()` now accept the `initialValues` option, which will prefill the appropriate form fields with the values provided. ([#1701](https://github.com/clerk/javascript/pull/1701)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Apply deprecation warnings for `@clerk/clerk-react`: ([#1788](https://github.com/clerk/javascript/pull/1788)) by [@dimkl](https://github.com/dimkl)
  - `setSession`

- Updated dependencies [[`7ffa6fac3`](https://github.com/clerk/javascript/commit/7ffa6fac3762f6fb130ba2f2fcaa28e52b36b3b4), [`5c8754239`](https://github.com/clerk/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81), [`2f6a6ac99`](https://github.com/clerk/javascript/commit/2f6a6ac9991469bf8532019bb22ff50adecdb434), [`753f7bbda`](https://github.com/clerk/javascript/commit/753f7bbda9bbb7444f96222a3b6cae815a09058f), [`55c8ebd39`](https://github.com/clerk/javascript/commit/55c8ebd390dd88036aee06866009be6a50c63138)]:
  - @clerk/shared@0.24.0
  - @clerk/types@3.53.0

## 4.25.2

### Patch Changes

- Remove nested `package.json` files inside `dist/cjs` and `dist/esm` and move `sideEffects` property to top-level `package.json` file. This change won't change behavior. ([#1785](https://github.com/clerk/javascript/pull/1785)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`07ede0f95`](https://github.com/clerk/javascript/commit/07ede0f959f232f6cbecb596eb9352f8cb382cdc), [`0eb666118`](https://github.com/clerk/javascript/commit/0eb66611882e6c460cc6a6c5cfa1d9b086ec6917), [`3b85311c9`](https://github.com/clerk/javascript/commit/3b85311c9eb006f51a8642f193473a250de879fc), [`ffcc78c06`](https://github.com/clerk/javascript/commit/ffcc78c062d067738f617ea9b491c1d45677148c), [`c61ddf5bf`](https://github.com/clerk/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerk/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/shared@0.23.1
  - @clerk/types@3.52.1

## 4.25.1

### Patch Changes

- Updated dependencies [[`6706b154c`](https://github.com/clerk/javascript/commit/6706b154c0b41356c7feeb19c6340160a06466e5), [`086a2e0b7`](https://github.com/clerk/javascript/commit/086a2e0b7e71a9919393ca43efedbf3718ea5fe4)]:
  - @clerk/shared@0.23.0

## 4.25.0

### Minor Changes

- Introduce the new brand-new component OrganizationList ([#1692](https://github.com/clerk/javascript/pull/1692)) by [@panteliselef](https://github.com/panteliselef)
  - Lists all the memberships, invitations or suggestions an active user may have
  - Powered by our `useOrganizationList` react hook

### Patch Changes

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`e99df0a0d`](https://github.com/clerk/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerk/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`8b9a7a360`](https://github.com/clerk/javascript/commit/8b9a7a36003f1b8622f444a139a811f1c35ca813), [`30bb9eccb`](https://github.com/clerk/javascript/commit/30bb9eccb95632fb1de02b756e818118ca6324f7), [`01b024c57`](https://github.com/clerk/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68)]:
  - @clerk/types@3.52.0
  - @clerk/shared@0.22.1

## 4.24.2

### Patch Changes

- Updated dependencies [[`463ff84f5`](https://github.com/clerk/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`1426e5eb3`](https://github.com/clerk/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739)]:
  - @clerk/types@3.51.0

## 4.24.1

### Patch Changes

- Support swapping the Clerk publishableKey at runtime to allow users to toggle the instance being used. ([#1655](https://github.com/clerk/javascript/pull/1655)) by [@BRKalow](https://github.com/BRKalow)

## 4.24.0

### Minor Changes

- Introduces userInvitations from `useOrganizationList` ([#1520](https://github.com/clerk/javascript/pull/1520)) by [@panteliselef](https://github.com/panteliselef)

  `userInvitations` is a paginated list of data. It can be used to create Paginated tables or Infinite lists.

### Patch Changes

- Updated dependencies [[`96cc1921c`](https://github.com/clerk/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerk/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerk/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerk/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerk/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerk/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerk/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerk/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerk/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerk/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`86de584dd`](https://github.com/clerk/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e02a1aff2`](https://github.com/clerk/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerk/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerk/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerk/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerk/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerk/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`89bc5de04`](https://github.com/clerk/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/shared@0.22.0
  - @clerk/types@3.50.0

## 4.23.2

### Patch Changes

- Updated dependencies [[`ea95525a4`](https://github.com/clerk/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerk/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`d433b83b9`](https://github.com/clerk/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerk/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`0a59e122d`](https://github.com/clerk/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/types@3.49.0
  - @clerk/shared@0.21.0

## 4.23.1

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerk/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3)]:
  - @clerk/types@3.48.1

## 4.23.0

### Minor Changes

- Add unsafeMetadata prop to the SignUp component ([#1464](https://github.com/clerk/javascript/pull/1464)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerk/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c)]:
  - @clerk/types@3.48.0

## 4.22.1

### Patch Changes

- Mark setSession as deprecated when it is re-exported within hooks ([#1486](https://github.com/clerk/javascript/pull/1486)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`73c9c1d0e`](https://github.com/clerk/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerk/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerk/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`090bab66e`](https://github.com/clerk/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`5ecbb0a37`](https://github.com/clerk/javascript/commit/5ecbb0a37e99fa2099629c573951c7735d5f0810), [`592911196`](https://github.com/clerk/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8)]:
  - @clerk/types@3.47.0
  - @clerk/shared@0.20.0

## 4.22.0

### Minor Changes

- Update IsomorphicClerk#addListener to correctly return an unsubscribe method ([#1452](https://github.com/clerk/javascript/pull/1452)) by [@dimkl](https://github.com/dimkl)

## 4.21.1

### Patch Changes

- Populate `openCreateOrganization` return from the `useClerk()` hook ([#1435](https://github.com/clerk/javascript/pull/1435)) by [@panteliselef](https://github.com/panteliselef)

## 4.21.0

### Minor Changes

- Fix `global is not defined` error when using Vite + React by [@anagstef](https://github.com/anagstef)

## 4.20.6

### Patch Changes

- Updated dependencies [[`30f8ad18a`](https://github.com/clerk/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c)]:
  - @clerk/types@3.46.1

## 4.20.5

### Patch Changes

- Updated dependencies [[`bfb3af28`](https://github.com/clerk/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/types@3.46.0

## 4.20.4

### Patch Changes

- Updated dependencies [[`11954816`](https://github.com/clerk/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`32148490`](https://github.com/clerk/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0

## 4.20.3

### Patch Changes

- Updated dependencies [[`17cc14ec`](https://github.com/clerk/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/types@3.44.0

## 4.20.2

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerk/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerk/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/types@3.43.0

## 4.20.1

### Patch Changes

- Updated dependencies [[`59bc649a`](https://github.com/clerk/javascript/commit/59bc649a92316f5d6ade00f3cd52a9b46dcdc401)]:
  - @clerk/shared@0.19.1

## 4.20.0

### Minor Changes

- Export error helpers from the shared package to the framework specific packages ([#1308](https://github.com/clerk/javascript/pull/1308)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Resolve all reported ESM build issues by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`7af91bc3`](https://github.com/clerk/javascript/commit/7af91bc3ecc25cba04968b491e1e3c6ec32c18af), [`c42b4ac0`](https://github.com/clerk/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`6f3d4305`](https://github.com/clerk/javascript/commit/6f3d43055690db1d69a356503a0a45dc948beaef)]:
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

- Updated dependencies [[`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/types@3.41.1
  - @clerk/shared@0.18.0

## [4.18.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.18.0-staging.1...@clerk/clerk-react@4.18.0) (2023-06-03)

**Note:** Version bump only for package @clerk/clerk-react

## [4.17.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.17.0-staging.0...@clerk/clerk-react@4.17.0) (2023-05-26)

**Note:** Version bump only for package @clerk/clerk-react

### [4.16.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.16.3-staging.2...@clerk/clerk-react@4.16.3) (2023-05-23)

**Note:** Version bump only for package @clerk/clerk-react

### [4.16.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.16.2-staging.0...@clerk/clerk-react@4.16.2) (2023-05-18)

**Note:** Version bump only for package @clerk/clerk-react

### [4.16.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.16.1-staging.1...@clerk/clerk-react@4.16.1) (2023-05-17)

**Note:** Version bump only for package @clerk/clerk-react

## [4.16.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.16.0-staging.2...@clerk/clerk-react@4.16.0) (2023-05-15)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.15.4-staging.5...@clerk/clerk-react@4.15.4) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.4-staging.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.15.4-staging.4...@clerk/clerk-react@4.15.4-staging.5) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.4-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.15.4-staging.2...@clerk/clerk-react@4.15.4-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.15.3-staging.0...@clerk/clerk-react@4.15.3) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.15.1...@clerk/clerk-react@4.15.2) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.15.1-staging.0...@clerk/clerk-react@4.15.1) (2023-04-12)

**Note:** Version bump only for package @clerk/clerk-react

## [4.15.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.15.0-staging.0...@clerk/clerk-react@4.15.0) (2023-04-11)

**Note:** Version bump only for package @clerk/clerk-react

### [4.14.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.14.2-staging.0...@clerk/clerk-react@4.14.2) (2023-04-06)

**Note:** Version bump only for package @clerk/clerk-react

### [4.14.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.14.1-staging.3...@clerk/clerk-react@4.14.1) (2023-03-31)

**Note:** Version bump only for package @clerk/clerk-react

### [4.14.1-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.14.1-staging.2...@clerk/clerk-react@4.14.1-staging.3) (2023-03-31)

### Bug Fixes

- **clerk-react:** Check for window in isomorphicClerk ([fe82852](https://github.com/clerk/javascript/commit/fe828523c2bbdc2f3fc35ad5e30aea52b5438922))

## [4.14.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.14.0-staging.1...@clerk/clerk-react@4.14.0) (2023-03-29)

**Note:** Version bump only for package @clerk/clerk-react

### [4.12.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.12.4-staging.2...@clerk/clerk-react@4.12.4) (2023-03-10)

**Note:** Version bump only for package @clerk/clerk-react

### [4.12.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.12.3-staging.0...@clerk/clerk-react@4.12.3) (2023-03-09)

**Note:** Version bump only for package @clerk/clerk-react

### [4.12.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.12.2-staging.0...@clerk/clerk-react@4.12.2) (2023-03-07)

**Note:** Version bump only for package @clerk/clerk-react

### [4.12.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.12.1-staging.1...@clerk/clerk-react@4.12.1) (2023-03-03)

**Note:** Version bump only for package @clerk/clerk-react

## [4.12.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.12.0-staging.0...@clerk/clerk-react@4.12.0) (2023-03-01)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.6](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.6-staging.0...@clerk/clerk-react@4.11.6) (2023-02-25)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.5-staging.3...@clerk/clerk-react@4.11.5) (2023-02-24)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.5-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.5-staging.1...@clerk/clerk-react@4.11.5-staging.2) (2023-02-22)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.4-staging.0...@clerk/clerk-react@4.11.4) (2023-02-17)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.3-staging.2...@clerk/clerk-react@4.11.3) (2023-02-15)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.2-staging.1...@clerk/clerk-react@4.11.2) (2023-02-10)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.1-staging.0...@clerk/clerk-react@4.11.1) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.0-staging.1...@clerk/clerk-react@4.11.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-react

## [4.11.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.0-staging.1...@clerk/clerk-react@4.11.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-react

## [4.10.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.10.0-staging.0...@clerk/clerk-react@4.10.0) (2023-02-01)

**Note:** Version bump only for package @clerk/clerk-react

## [4.9.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.9.0-staging.1...@clerk/clerk-react@4.9.0) (2023-01-27)

**Note:** Version bump only for package @clerk/clerk-react

### [4.8.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.8.4-staging.1...@clerk/clerk-react@4.8.4) (2023-01-24)

**Note:** Version bump only for package @clerk/clerk-react

### [4.8.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.8.2...@clerk/clerk-react@4.8.3) (2023-01-20)

### Bug Fixes

- **nextjs,types:** Make frontendApi or publishableKey mutually exclusive but optional ([953c276](https://github.com/clerk/javascript/commit/953c27622ba24054172d6f4178bd5af50f73fa36))

### [4.8.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.8.1...@clerk/clerk-react@4.8.2) (2023-01-19)

### Bug Fixes

- **clerk-react:** Do not throw missing key error if a Clerk instance is used ([a300016](https://github.com/clerk/javascript/commit/a3000164483e7ed947d448f7593e0ce4dd110db3))
- **clerk-react:** Do not throw missing key error in isomorphicClerk.load ([8b3b763](https://github.com/clerk/javascript/commit/8b3b763ed67d3af101573627fc7b00fb0a526b9b))

### [4.8.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.8.0...@clerk/clerk-react@4.8.1) (2023-01-17)

### Bug Fixes

- **clerk-react:** Add data-clerk-publishable-key attribute only when PK is available ([8d44f54](https://github.com/clerk/javascript/commit/8d44f54434754e2c31b4a77b58a28ae969ce5a09))

## [4.8.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.8.0-staging.4...@clerk/clerk-react@4.8.0) (2023-01-17)

**Note:** Version bump only for package @clerk/clerk-react

## [4.7.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.7.0-staging.1...@clerk/clerk-react@4.7.0) (2022-12-19)

**Note:** Version bump only for package @clerk/clerk-react

### [4.6.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.6.4-staging.0...@clerk/clerk-react@4.6.4) (2022-12-13)

**Note:** Version bump only for package @clerk/clerk-react

### [4.6.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.6.2...@clerk/clerk-react@4.6.3) (2022-12-12)

**Note:** Version bump only for package @clerk/clerk-react

### [4.6.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.6.2-staging.1...@clerk/clerk-react@4.6.2) (2022-12-09)

**Note:** Version bump only for package @clerk/clerk-react

### [4.6.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.6.0...@clerk/clerk-react@4.6.1) (2022-12-08)

### Reverts

- Revert "feat(clerk-js,types): Terse paths parameters (#572)" (#603) ([d535eac](https://github.com/clerk/javascript/commit/d535eace3d7733ce3b848bb05f1b0c02e5faf15d)), closes [#572](https://github.com/clerk/javascript/issues/572) [#603](https://github.com/clerk/javascript/issues/603)

## [4.6.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.6.0-staging.0...@clerk/clerk-react@4.6.0) (2022-12-08)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.5-staging.0...@clerk/clerk-react@4.5.5) (2022-12-02)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.4-staging.5...@clerk/clerk-react@4.5.4) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.4-staging.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.4-staging.4...@clerk/clerk-react@4.5.4-staging.5) (2022-11-29)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.3-staging.0...@clerk/clerk-react@4.5.3) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.2-staging.0...@clerk/clerk-react@4.5.2) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.0...@clerk/clerk-react@4.5.1) (2022-11-23)

**Note:** Version bump only for package @clerk/clerk-react

## [4.5.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.0-staging.3...@clerk/clerk-react@4.5.0) (2022-11-22)

**Note:** Version bump only for package @clerk/clerk-react

## [4.5.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.0-staging.2...@clerk/clerk-react@4.5.0-staging.3) (2022-11-21)

### Bug Fixes

- **clerk-react:** Add HeadlessBrowserClerk ([4236147](https://github.com/clerk/javascript/commit/4236147201b32e3f1d60ebbe2c36de8e89e5e2f6))

## [4.5.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.0-staging.1...@clerk/clerk-react@4.5.0-staging.2) (2022-11-21)

### Features

- **clerk-js:** Improve DX for headless import ([8d64310](https://github.com/clerk/javascript/commit/8d64310ab23c6e21f8a687e503521245acad8211))

### [4.4.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.4.3-staging.1...@clerk/clerk-react@4.4.3) (2022-11-18)

**Note:** Version bump only for package @clerk/clerk-react

### [4.4.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.4.2-staging.3...@clerk/clerk-react@4.4.2) (2022-11-15)

**Note:** Version bump only for package @clerk/clerk-react

### [4.4.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.4.1-staging.1...@clerk/clerk-react@4.4.1) (2022-11-10)

**Note:** Version bump only for package @clerk/clerk-react

## [4.4.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.4.0-staging.1...@clerk/clerk-react@4.4.0) (2022-11-05)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.3-staging.7...@clerk/clerk-react@4.3.3) (2022-11-03)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.3-staging.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.3-staging.3...@clerk/clerk-react@4.3.3-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.3-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.3-staging.1...@clerk/clerk-react@4.3.3-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.3-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.3-staging.1...@clerk/clerk-react@4.3.3-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.3-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.2...@clerk/clerk-react@4.3.3-staging.1) (2022-11-02)

### Bug Fixes

- **clerk-react:** Add frontendAPI on window as a fallback ([06f8b37](https://github.com/clerk/javascript/commit/06f8b3755cda83455e301591badaf16e1d59dd33))

### [4.3.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.2-staging.0...@clerk/clerk-react@4.3.2) (2022-10-24)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.0...@clerk/clerk-react@4.3.1) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-react

## [4.3.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.0-staging.2...@clerk/clerk-react@4.3.0) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-react

## [4.3.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.6...@clerk/clerk-react@4.3.0-staging.1) (2022-10-13)

### Features

- **clerk-js,clerk-react,types:** Wire up `OrganizationSwitcher` and `OrganizationProfile` ([1e34e69](https://github.com/clerk/javascript/commit/1e34e6986ee49aeb9ca9f72cdc5d799d6611b53f))

### [4.2.6](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.6-staging.0...@clerk/clerk-react@4.2.6) (2022-10-07)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.5-staging.0...@clerk/clerk-react@4.2.5) (2022-10-05)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.4-staging.3...@clerk/clerk-react@4.2.4) (2022-10-03)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.3-staging.4...@clerk/clerk-react@4.2.3) (2022-09-29)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.1...@clerk/clerk-react@4.2.2) (2022-09-25)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.1-staging.2...@clerk/clerk-react@4.2.1) (2022-09-24)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.1-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.1-staging.0...@clerk/clerk-react@4.2.1-staging.1) (2022-09-24)

**Note:** Version bump only for package @clerk/clerk-react

## [4.2.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.0-staging.0...@clerk/clerk-react@4.2.0) (2022-09-22)

**Note:** Version bump only for package @clerk/clerk-react

### [4.1.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.1.0-staging.4...@clerk/clerk-react@4.1.1) (2022-09-19)

**Note:** Version bump only for package @clerk/clerk-react

## [4.1.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.1.0-staging.4...@clerk/clerk-react@4.1.0) (2022-09-16)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.10](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.10-staging.0...@clerk/clerk-react@4.0.10) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.9](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.9-staging.0...@clerk/clerk-react@4.0.9) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.8](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.8-staging.0...@clerk/clerk-react@4.0.8) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.7](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.7-staging.2...@clerk/clerk-react@4.0.7) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.6](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.6-staging.0...@clerk/clerk-react@4.0.6) (2022-08-24)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.4...@clerk/clerk-react@4.0.5) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.4-staging.0...@clerk/clerk-react@4.0.4) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.2...@clerk/clerk-react@4.0.3) (2022-08-16)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.2-staging.0...@clerk/clerk-react@4.0.2) (2022-08-09)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.0...@clerk/clerk-react@4.0.1) (2022-08-07)

**Note:** Version bump only for package @clerk/clerk-react

## [4.0.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.0-staging.1...@clerk/clerk-react@4.0.0) (2022-08-05)

**Note:** Version bump only for package @clerk/clerk-react

### [3.5.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.5.0...@clerk/clerk-react@3.5.1) (2022-08-04)

**Note:** Version bump only for package @clerk/clerk-react

## [3.5.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.4.5...@clerk/clerk-react@3.5.0) (2022-07-13)

### Features

- **nextjs:** Add req.organization access on gssp ([d064448](https://github.com/clerk/javascript/commit/d0644489a71e06df0e751c615b0d03d77967aab2))
- **types,clerk-react,nextjs:** Add loadOrg option for Next.js withServerSideAuth middleware ([0889bde](https://github.com/clerk/javascript/commit/0889bde9bc7f9e1a5d4c1e706c49212e1f7b36f4))

### [3.4.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.4.5-staging.0...@clerk/clerk-react@3.4.5) (2022-07-11)

**Note:** Version bump only for package @clerk/clerk-react

### [3.4.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.4.3...@clerk/clerk-react@3.4.4) (2022-07-07)

**Note:** Version bump only for package @clerk/clerk-react

### [3.4.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.4.2...@clerk/clerk-react@3.4.3) (2022-07-06)

**Note:** Version bump only for package @clerk/clerk-react

### [3.4.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.4.1...@clerk/clerk-react@3.4.2) (2022-07-01)

**Note:** Version bump only for package @clerk/clerk-react

### [3.4.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.4.0...@clerk/clerk-react@3.4.1) (2022-06-24)

**Note:** Version bump only for package @clerk/clerk-react

## [3.4.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.4.0-staging.0...@clerk/clerk-react@3.4.0) (2022-06-16)

**Note:** Version bump only for package @clerk/clerk-react

## [3.3.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.3.0-staging.4...@clerk/clerk-react@3.3.0) (2022-06-06)

**Note:** Version bump only for package @clerk/clerk-react

## [3.3.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.3.0-staging.3...@clerk/clerk-react@3.3.0-staging.4) (2022-06-03)

### Bug Fixes

- **clerk-react:** Correct annotations in isomorphicClerk for setSession ([56abc04](https://github.com/clerk/javascript/commit/56abc04e82ed4adf9f1c366620e08526d52da0f5))

## [3.3.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.3.0-staging.2...@clerk/clerk-react@3.3.0-staging.3) (2022-06-03)

**Note:** Version bump only for package @clerk/clerk-react

## [3.3.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.3.0-staging.1...@clerk/clerk-react@3.3.0-staging.2) (2022-06-02)

**Note:** Version bump only for package @clerk/clerk-react

## [3.3.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.3.0-staging.0...@clerk/clerk-react@3.3.0-staging.1) (2022-06-01)

### Bug Fixes

- **clerk-js:** Emit changes in organization to listeners ([798ee62](https://github.com/clerk/javascript/commit/798ee622e7961d3aa7f8842184f5fadbcfed517f))

### [3.2.18](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.18-staging.1...@clerk/clerk-react@3.2.18) (2022-05-20)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.18-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.17...@clerk/clerk-react@3.2.18-staging.1) (2022-05-18)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.18-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.17...@clerk/clerk-react@3.2.18-staging.0) (2022-05-17)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.17](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.14...@clerk/clerk-react@3.2.17) (2022-05-13)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.16](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.14...@clerk/clerk-react@3.2.16) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.15](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.14...@clerk/clerk-react@3.2.15) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.14](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.14-staging.0...@clerk/clerk-react@3.2.14) (2022-05-11)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.13](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.12...@clerk/clerk-react@3.2.13) (2022-05-06)

### Bug Fixes

- **clerk-react:** Make getOrCreateInstance handle both SSR and CSR instantiation ([d22b808](https://github.com/clerk/javascript/commit/d22b808cf9eee2570be83f247fd25543a0202fd6))
- **clerk-react:** Make isomorphicClerk loading idempotent ([91b6217](https://github.com/clerk/javascript/commit/91b62175cadd82b38747cc6d7a0216f42c89b5fe))
- **clerk-react:** Pass initialState directly to ClerkContextProvider ([9e55b7c](https://github.com/clerk/javascript/commit/9e55b7c2cafdcbcf6d8c210e668a22e07580cdb6))

### [3.2.13-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.12...@clerk/clerk-react@3.2.13-staging.0) (2022-05-05)

### Bug Fixes

- **clerk-react:** Make getOrCreateInstance handle both SSR and CSR instantiation ([8f9481c](https://github.com/clerk/javascript/commit/8f9481cf088c63b3cd3192cb1396596a98b11980))
- **clerk-react:** Make isomorphicClerk loading idempotent ([221919c](https://github.com/clerk/javascript/commit/221919ceab5ad1631073f8ba7564c869ebf7a890))
- **clerk-react:** Pass initialState directly to ClerkContextProvider ([cb777d4](https://github.com/clerk/javascript/commit/cb777d4651710fda248036fdc5398e0dac7aa337))

### [3.2.12](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.12-staging.0...@clerk/clerk-react@3.2.12) (2022-05-05)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.11](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.11-staging.0...@clerk/clerk-react@3.2.11) (2022-04-28)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.10](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.9...@clerk/clerk-react@3.2.10) (2022-04-27)

### Bug Fixes

- **clerk-react:** Define global in window if not defined ([48da3ac](https://github.com/clerk/javascript/commit/48da3ac087406a97380f28c4c9e1057e04eb106f))

### [3.2.9](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.8...@clerk/clerk-react@3.2.9) (2022-04-27)

### Bug Fixes

- **clerk-react:** Type updates for React 18 ([6d5c0bf](https://github.com/clerk/javascript/commit/6d5c0bf33e17885cacd97320c385cf06ca4f5adf))

### [3.2.8](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.8-staging.1...@clerk/clerk-react@3.2.8) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.8-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.8-staging.0...@clerk/clerk-react@3.2.8-staging.1) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.7](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.7-alpha.0...@clerk/clerk-react@3.2.7) (2022-04-18)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.7-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.6...@clerk/clerk-react@3.2.7-alpha.0) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.6](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.5...@clerk/clerk-react@3.2.6) (2022-04-15)

### Bug Fixes

- **clerk-react:** Explicitly type children for React.FC components ([#199](https://github.com/clerk/javascript/issues/199)) ([9fb2ce4](https://github.com/clerk/javascript/commit/9fb2ce46e1e7f60fd31deae43fd1afaf5a1abc62))

### [3.2.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.5-staging.0...@clerk/clerk-react@3.2.5) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.4-staging.0...@clerk/clerk-react@3.2.4) (2022-04-13)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.2...@clerk/clerk-react@3.2.3) (2022-04-07)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.2-staging.0...@clerk/clerk-react@3.2.2) (2022-04-04)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.1-staging.0...@clerk/clerk-react@3.2.1) (2022-03-28)

**Note:** Version bump only for package @clerk/clerk-react

## [3.2.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.0-alpha.0...@clerk/clerk-react@3.2.0) (2022-03-24)

**Note:** Version bump only for package @clerk/clerk-react

## [3.2.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.1.2-staging.0...@clerk/clerk-react@3.2.0-staging.0) (2022-03-24)

### Features

- **types,clerk-js,backend-core,clerk-react:** Replace thrown error with null return in getToken ([d972f93](https://github.com/clerk/javascript/commit/d972f93684a39abf3619c335cc012b61d5187100))

### [3.1.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.1.1-staging.0...@clerk/clerk-react@3.1.1-alpha.0) (2022-03-23)

**Note:** Version bump only for package @clerk/clerk-react

## [3.1.0-alpha.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.1.0-alpha.1...@clerk/clerk-react@3.1.0-alpha.2) (2022-03-23)

**Note:** Version bump only for package @clerk/clerk-react

## [3.1.0-alpha.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.0.1-alpha.3...@clerk/clerk-react@3.1.0-alpha.1) (2022-03-23)

### Features

- **clerk-js,types:** Rename UserButton params to afterSignOutUrl, afterMultiSessionSingleSignOutUrl ([c4cb76a](https://github.com/clerk/javascript/commit/c4cb76a1133fd2308b217cacaffb086b175f6347))

## [3.1.0-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.0.1-alpha.3...@clerk/clerk-react@3.1.0-alpha.0) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-react

### [3.0.1-alpha.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.0.1-alpha.2...@clerk/clerk-react@3.0.1-alpha.3) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-react

### [3.0.1-alpha.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.0.1-staging.0...@clerk/clerk-react@3.0.1-alpha.2) (2022-03-22)

### Bug Fixes

- **clerk-js,clerk-react:** Move error to getToken ([d5f6b26](https://github.com/clerk/javascript/commit/d5f6b264cf58ce40c68de298b4c7c564d472001f))
- **edge:** Align react getToken ([37a03de](https://github.com/clerk/javascript/commit/37a03de81148294909719d4476b0a2ac3642813c))

### [3.0.1-alpha.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.0.1-staging.0...@clerk/clerk-react@3.0.1-alpha.1) (2022-03-20)

### Bug Fixes

- **clerk-js,clerk-react:** Move error to getToken ([d5f6b26](https://github.com/clerk/javascript/commit/d5f6b264cf58ce40c68de298b4c7c564d472001f))
- **edge:** Align react getToken ([37a03de](https://github.com/clerk/javascript/commit/37a03de81148294909719d4476b0a2ac3642813c))

### [3.0.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.0.1-staging.0...@clerk/clerk-react@3.0.1-alpha.0) (2022-03-19)

### Bug Fixes

- **clerk-js,clerk-react:** Move error to getToken ([84d21ce](https://github.com/clerk/javascript/commit/84d21ceac26843a1caa9d9d58f9c10ea2da6395e))
- **edge:** Align react getToken ([37a03de](https://github.com/clerk/javascript/commit/37a03de81148294909719d4476b0a2ac3642813c))

## [3.0.0-alpha.10](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.12.3...@clerk/clerk-react@3.0.0-alpha.10) (2022-03-11)

### Features

- **clerk-react:** Add isLoaded to `useOrganizations` hook ([#92](https://github.com/clerk/javascript/issues/92)) ([a316c7a](https://github.com/clerk/javascript/commit/a316c7a9d66f356639038ce89b5853625e44d4b7))
- **clerk-remix:** Mark clerk-remix as side-effect free to fix Remix bundling ([c57a902](https://github.com/clerk/javascript/commit/c57a9024674a61aa3f2b7e359935e42fc034ffdd))

## [3.0.0-alpha.9](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.4...@clerk/clerk-react@3.0.0-alpha.9) (2022-02-28)

### Features

- **clerk-remix:** Mark clerk-remix as side-effect free to fix Remix bundling ([c57a902](https://github.com/clerk/javascript/commit/c57a9024674a61aa3f2b7e359935e42fc034ffdd))

## [3.0.0-alpha.8](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.4...@clerk/clerk-react@3.0.0-alpha.8) (2022-02-25)

### Features

- **clerk-remix:** Mark clerk-remix as side-effect free to fix Remix bundling ([287a438](https://github.com/clerk/javascript/commit/287a4381d7ebefdf8704e2e29a75ac93f57794c8))

## [3.0.0-alpha.7](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.1...@clerk/clerk-react@3.0.0-alpha.7) (2022-02-18)

### Features

- **clerk-remix:** Mark clerk-remix as side-effect free to fix Remix bundling ([0d22857](https://github.com/clerk/javascript/commit/0d22857197e5d1d2edc4d4df55916009f404dbdd))

### [2.12.6](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.12.6-staging.1...@clerk/clerk-react@2.12.6) (2022-03-17)

**Note:** Version bump only for package @clerk/clerk-react

### [2.12.6-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.12.6-staging.0...@clerk/clerk-react@2.12.6-staging.1) (2022-03-17)

**Note:** Version bump only for package @clerk/clerk-react

### [2.12.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.12.3...@clerk/clerk-react@2.12.4) (2022-03-11)

**Note:** Version bump only for package @clerk/clerk-react

### [2.12.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.12.3-staging.0...@clerk/clerk-react@2.12.3) (2022-03-09)

**Note:** Version bump only for package @clerk/clerk-react

### [2.12.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.12.0...@clerk/clerk-react@2.12.1) (2022-03-04)

### Bug Fixes

- **clerk-react,clerk-js,types:** Crate of API feedback fixes ([721ce72](https://github.com/clerk/javascript/commit/721ce7228c37b012891b2bec8caf290239164d05))

## [2.12.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.7...@clerk/clerk-react@2.12.0) (2022-03-04)

### Features

- **clerk-js,clerk-react:** GetOrganization/s hook methods, fetching mechanism alignment ([fc11087](https://github.com/clerk/javascript/commit/fc110874f9a3e056cd43c773c267409dd9b318d6))
- **clerk-js:** Add useOrganization hook ([480c422](https://github.com/clerk/javascript/commit/480c422774472fc712afdfe6ded2677b458d3ef0))
- **clerk-react,clerk-js:** Add useOrganization hook using \_\_unstable attribute ([1635132](https://github.com/clerk/javascript/commit/16351321a99945d167cbf6e6ca0efdbbbf7efe5a))

### [2.11.7](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.6...@clerk/clerk-react@2.11.7) (2022-03-03)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.6](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.5...@clerk/clerk-react@2.11.6) (2022-03-02)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.4...@clerk/clerk-react@2.11.5) (2022-03-01)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.4-staging.0...@clerk/clerk-react@2.11.4) (2022-02-24)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.4-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.3-staging.0...@clerk/clerk-react@2.11.4-staging.0) (2022-02-24)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.3-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.2-staging.0...@clerk/clerk-react@2.11.3-staging.0) (2022-02-17)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.2-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.1...@clerk/clerk-react@2.11.2-staging.0) (2022-02-15)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.1-staging.0...@clerk/clerk-react@2.11.1) (2022-02-14)

**Note:** Version bump only for package @clerk/clerk-react

### 2.11.1-staging.0 (2022-02-11)

### Features

- **clerk-sdk-node:** Deprecate Session named middleware, introduce withAuth, requireAuth ([4e69553](https://github.com/clerk/javascript/commit/4e695535e41fe7c135cbf303a0d021e7b7d30f7d))
