# @clerk/astro

## 2.0.1

### Patch Changes

- Addresses: CVE-2024-55565i ([#4744](https://github.com/clerk/javascript/pull/4744)) by [@renovate](https://github.com/apps/renovate)

  nanoid (aka Nano ID) before 5.0.9 mishandles non-integer values. 3.3.8 is also a fixed version.

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/types@4.39.2
  - @clerk/backend@1.20.3
  - @clerk/shared@2.19.4

## 2.0.0

### Major Changes

- Recently Astro released its v5. Read their [migration guide](https://docs.astro.build/en/guides/upgrade-to/v5/) to learn more. ([#4721](https://github.com/clerk/javascript/pull/4721)) by [@wobsoriano](https://github.com/wobsoriano)

  `@clerk/astro@2.0.0` supports Astro v4.15.0 and above, including v5. If you're using Astro v3, you'll need to upgrade your Astro version as v3 support has been removed. If you need to stay on Astro v3, stick with your current version.

  The `@clerk/astro@2.0.0` upgrade itself doesn't have any required code changes as only internal dependencies and requirements were updated.

### Patch Changes

- Updated dependencies [[`fe75ced8a7d8b8a28839430444588ee173b5230a`](https://github.com/clerk/javascript/commit/fe75ced8a7d8b8a28839430444588ee173b5230a), [`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/backend@1.20.2
  - @clerk/types@4.39.1
  - @clerk/shared@2.19.3

## 1.5.6

### Patch Changes

- Updated dependencies [[`4cb22548da81dd8b186a6ef1cf120aea99c85c62`](https://github.com/clerk/javascript/commit/4cb22548da81dd8b186a6ef1cf120aea99c85c62)]:
  - @clerk/shared@2.19.2
  - @clerk/backend@1.20.1

## 1.5.5

### Patch Changes

- Updated dependencies [[`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99), [`550c7e9851329688e37be29b83ea0c3b12482af7`](https://github.com/clerk/javascript/commit/550c7e9851329688e37be29b83ea0c3b12482af7), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99)]:
  - @clerk/backend@1.20.0
  - @clerk/types@4.39.0
  - @clerk/shared@2.19.1

## 1.5.4

### Patch Changes

- Updated dependencies [[`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3), [`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3)]:
  - @clerk/shared@2.19.0
  - @clerk/types@4.38.0
  - @clerk/backend@1.19.2

## 1.5.3

### Patch Changes

- Using LICENSE file name that is consistent with other @clerk/\* modules ([#4712](https://github.com/clerk/javascript/pull/4712)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`4e5e7f463c12893a21cb3b5f9317fc3f2945879b`](https://github.com/clerk/javascript/commit/4e5e7f463c12893a21cb3b5f9317fc3f2945879b)]:
  - @clerk/types@4.37.0
  - @clerk/backend@1.19.1
  - @clerk/shared@2.18.1

## 1.5.2

### Patch Changes

- Add backwards compatibility for ignoring prerendered routes in Astro ([#4694](https://github.com/clerk/javascript/pull/4694)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`8ee5d84995fa17532491ff96efac5738c9bcd9ef`](https://github.com/clerk/javascript/commit/8ee5d84995fa17532491ff96efac5738c9bcd9ef), [`09fedd1df155d30cc055ce701b133aa6470e9b47`](https://github.com/clerk/javascript/commit/09fedd1df155d30cc055ce701b133aa6470e9b47), [`b6aa589f75be62a89a3853d496176ed2f2c0e2c5`](https://github.com/clerk/javascript/commit/b6aa589f75be62a89a3853d496176ed2f2c0e2c5), [`235eaae4c3c9400492fca47d20a47c7081041565`](https://github.com/clerk/javascript/commit/235eaae4c3c9400492fca47d20a47c7081041565)]:
  - @clerk/types@4.36.0
  - @clerk/backend@1.19.0
  - @clerk/shared@2.18.0

## 1.5.1

### Patch Changes

- Updated dependencies [[`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d), [`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d)]:
  - @clerk/types@4.35.1
  - @clerk/backend@1.18.1
  - @clerk/shared@2.17.1

## 1.5.0

### Minor Changes

- Introduce `<Waitlist />` component for Astro ([#4650](https://github.com/clerk/javascript/pull/4650)) by [@nikospapcom](https://github.com/nikospapcom)

## 1.4.17

### Patch Changes

- Ignore pre-rendered files in Clerk Middleware ([#4640](https://github.com/clerk/javascript/pull/4640)) by [@jlengstorf](https://github.com/jlengstorf)

## 1.4.16

### Patch Changes

- Updated dependencies [[`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`d84d7e31235c5c7da3415981dc76db4473a71a39`](https://github.com/clerk/javascript/commit/d84d7e31235c5c7da3415981dc76db4473a71a39), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`dce4f7ffca7248c0500f0ec9a978672b1f2fad69`](https://github.com/clerk/javascript/commit/dce4f7ffca7248c0500f0ec9a978672b1f2fad69)]:
  - @clerk/shared@2.17.0
  - @clerk/types@4.35.0
  - @clerk/backend@1.18.0

## 1.4.15

### Patch Changes

- Updated dependencies [[`c70994b5b6f92a6550dfe37547f01bbfa810c223`](https://github.com/clerk/javascript/commit/c70994b5b6f92a6550dfe37547f01bbfa810c223), [`7623a99594e7329200b6b374e483152d7679ce66`](https://github.com/clerk/javascript/commit/7623a99594e7329200b6b374e483152d7679ce66)]:
  - @clerk/types@4.34.2
  - @clerk/backend@1.17.2
  - @clerk/shared@2.16.1

## 1.4.14

### Patch Changes

- Updated dependencies [[`e47eb5882a7fd4a8dee25933c6644790d6ea3407`](https://github.com/clerk/javascript/commit/e47eb5882a7fd4a8dee25933c6644790d6ea3407), [`273d16cb0665d4d960838cb294dc356f41814745`](https://github.com/clerk/javascript/commit/273d16cb0665d4d960838cb294dc356f41814745), [`6b0961765e1f3d09679be4b163fa13ac7dd97191`](https://github.com/clerk/javascript/commit/6b0961765e1f3d09679be4b163fa13ac7dd97191)]:
  - @clerk/shared@2.16.0
  - @clerk/types@4.34.1
  - @clerk/backend@1.17.1

## 1.4.13

### Patch Changes

- Updated dependencies [[`536fa996ff84a545678a3036b28409824d1c00dd`](https://github.com/clerk/javascript/commit/536fa996ff84a545678a3036b28409824d1c00dd), [`b28c5e8bc44885bf6b1533df48e872ba90c387da`](https://github.com/clerk/javascript/commit/b28c5e8bc44885bf6b1533df48e872ba90c387da)]:
  - @clerk/backend@1.17.0
  - @clerk/shared@2.15.0

## 1.4.12

### Patch Changes

- Updated dependencies [[`46faeb6f59b19c963fb137c858347525b1cd9e19`](https://github.com/clerk/javascript/commit/46faeb6f59b19c963fb137c858347525b1cd9e19), [`ea6c52dd751abe38b350ee07f148652c24125e22`](https://github.com/clerk/javascript/commit/ea6c52dd751abe38b350ee07f148652c24125e22)]:
  - @clerk/shared@2.14.0
  - @clerk/types@4.34.0
  - @clerk/backend@1.16.4

## 1.4.11

### Patch Changes

- Updated dependencies [[`1c0b5001f7f975a2f3f54ad692526ecf7257847e`](https://github.com/clerk/javascript/commit/1c0b5001f7f975a2f3f54ad692526ecf7257847e), [`6217a3f7c94311d49f873214bd406961e0b8d6f7`](https://github.com/clerk/javascript/commit/6217a3f7c94311d49f873214bd406961e0b8d6f7), [`1783025cdb94c447028704c2121fa0b8af785904`](https://github.com/clerk/javascript/commit/1783025cdb94c447028704c2121fa0b8af785904)]:
  - @clerk/types@4.33.0
  - @clerk/shared@2.13.0
  - @clerk/backend@1.16.3

## 1.4.10

### Patch Changes

- Updated dependencies [[`ff4ebeba6c2a77c247a946070b56bdb2153d1588`](https://github.com/clerk/javascript/commit/ff4ebeba6c2a77c247a946070b56bdb2153d1588)]:
  - @clerk/backend@1.16.2

## 1.4.9

### Patch Changes

- Updated dependencies [[`7dbad4c5abd226d7b10941a626ead5d85b1a3f24`](https://github.com/clerk/javascript/commit/7dbad4c5abd226d7b10941a626ead5d85b1a3f24)]:
  - @clerk/types@4.32.0
  - @clerk/backend@1.16.1
  - @clerk/shared@2.12.1

## 1.4.8

### Patch Changes

- Fix an issue where custom client-side routing breaks when `<ViewTransitions />` is disabled ([#4521](https://github.com/clerk/javascript/pull/4521)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`b185e42e5136de3511a0b37ce9b0030022ba679e`](https://github.com/clerk/javascript/commit/b185e42e5136de3511a0b37ce9b0030022ba679e), [`5a21de1f46df3642828dc27e4862263c9858da2b`](https://github.com/clerk/javascript/commit/5a21de1f46df3642828dc27e4862263c9858da2b), [`f7472e22877f62fc7f3c8d3efe409ff2276fb4a3`](https://github.com/clerk/javascript/commit/f7472e22877f62fc7f3c8d3efe409ff2276fb4a3), [`e10232c56551bf0cffc11246f2ff9aa58ec584d7`](https://github.com/clerk/javascript/commit/e10232c56551bf0cffc11246f2ff9aa58ec584d7), [`e199037b8f484abdeeb9fc24455a1b4b8c31c8dd`](https://github.com/clerk/javascript/commit/e199037b8f484abdeeb9fc24455a1b4b8c31c8dd), [`886e294a8d8c54b39cd5bda88d46b89eace3861e`](https://github.com/clerk/javascript/commit/886e294a8d8c54b39cd5bda88d46b89eace3861e), [`0e443ad7c76643420b50e5b169193e03f6ef79f9`](https://github.com/clerk/javascript/commit/0e443ad7c76643420b50e5b169193e03f6ef79f9), [`cc24c8145f1eea7fb91550f2c3e0bac3993e4320`](https://github.com/clerk/javascript/commit/cc24c8145f1eea7fb91550f2c3e0bac3993e4320)]:
  - @clerk/backend@1.16.0
  - @clerk/shared@2.12.0
  - @clerk/types@4.31.0

## 1.4.7

### Patch Changes

- Updated dependencies [[`8a04ae47b8305f994b348301fd8134d5baf02943`](https://github.com/clerk/javascript/commit/8a04ae47b8305f994b348301fd8134d5baf02943)]:
  - @clerk/shared@2.11.5
  - @clerk/backend@1.15.7

## 1.4.6

### Patch Changes

- Updated dependencies [[`d74a6a7c0f291104c6bba722a8c432814d7b336e`](https://github.com/clerk/javascript/commit/d74a6a7c0f291104c6bba722a8c432814d7b336e), [`1a0c8fe665869e732d3c800bde0f5219fce54301`](https://github.com/clerk/javascript/commit/1a0c8fe665869e732d3c800bde0f5219fce54301), [`0800fc3f1f4e1b6a1d13f5c02557001a283af6e8`](https://github.com/clerk/javascript/commit/0800fc3f1f4e1b6a1d13f5c02557001a283af6e8)]:
  - @clerk/types@4.30.0
  - @clerk/shared@2.11.4
  - @clerk/backend@1.15.6

## 1.4.5

### Patch Changes

- Refactor imports from @clerk/shared to improve treeshaking support by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`a7726cc12a824b278f6d2a37cb1901c38c5f70dc`](https://github.com/clerk/javascript/commit/a7726cc12a824b278f6d2a37cb1901c38c5f70dc)]:
  - @clerk/shared@2.11.3
  - @clerk/backend@1.15.5

## 1.4.2

### Patch Changes

- Updated dependencies [[`f875463da`](https://github.com/clerk/javascript/commit/f875463da9692f2d173b6d5388743cf720750ae3), [`5be7ca9fd`](https://github.com/clerk/javascript/commit/5be7ca9fd239c937cc88e20ce8f5bfc9f3b84f22), [`08c5a2add`](https://github.com/clerk/javascript/commit/08c5a2add6872c76e62fc0df06db723e3728452e), [`434b432f8`](https://github.com/clerk/javascript/commit/434b432f8c114825120eef0f2c278b8142ed1563)]:
  - @clerk/types@4.29.0
  - @clerk/shared@2.11.0
  - @clerk/backend@1.15.2

## 1.4.1

### Patch Changes

- Updated dependencies [[`3fdcdbf88`](https://github.com/clerk/javascript/commit/3fdcdbf88c38facf8b82563f634ec1b6604fd8e5), [`1c7e105a3`](https://github.com/clerk/javascript/commit/1c7e105a32fd492cc175ef9fd1c1fa0428c259dc)]:
  - @clerk/types@4.28.0
  - @clerk/backend@1.15.1
  - @clerk/shared@2.10.1

## 1.4.0

### Minor Changes

- Add support for Astro View Transitions ([#4354](https://github.com/clerk/javascript/pull/4354)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Updated dependencies [[`93dfe7a09`](https://github.com/clerk/javascript/commit/93dfe7a09648f414ee3f50bc8fb3f342d24020cd), [`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc), [`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc)]:
  - @clerk/backend@1.15.0
  - @clerk/shared@2.10.0
  - @clerk/types@4.27.0

## 1.3.16

### Patch Changes

- Updated dependencies [[`e1a26547a`](https://github.com/clerk/javascript/commit/e1a26547a9c65f4c79c2bbd4dc386ddf67c2fbee)]:
  - @clerk/backend@1.14.1

## 1.3.15

### Patch Changes

- Updated dependencies [[`e81d45b72`](https://github.com/clerk/javascript/commit/e81d45b72c81403c7c206dac5454de1fef6bec57), [`752ce9bfa`](https://github.com/clerk/javascript/commit/752ce9bfa47a8eebd38cd272eeb58ae26fea3371), [`99cdf9b67`](https://github.com/clerk/javascript/commit/99cdf9b67d1e99e66cc73d8a5bfce1f1f8df1b83), [`ce40ff6f0`](https://github.com/clerk/javascript/commit/ce40ff6f0d3bc79e33375be6dd5e03f140a07000), [`fb7ba1f34`](https://github.com/clerk/javascript/commit/fb7ba1f3485abdeac5e504cce6c2d84d3f3e4ffc), [`2102052c0`](https://github.com/clerk/javascript/commit/2102052c017065ab511339870fcebaa6719f2702)]:
  - @clerk/types@4.26.0
  - @clerk/shared@2.9.2
  - @clerk/backend@1.14.0

## 1.3.14

### Patch Changes

- Updated dependencies [[`d64e54c40`](https://github.com/clerk/javascript/commit/d64e54c40c9cf001b25e45a1b8939c9f7e80c6d6), [`2ba2fd148`](https://github.com/clerk/javascript/commit/2ba2fd1483b7561d7df9a1952ead0ee15e422131)]:
  - @clerk/shared@2.9.1
  - @clerk/types@4.25.1
  - @clerk/backend@1.13.10

## 1.3.13

### Patch Changes

- Updated dependencies [[`358be296a`](https://github.com/clerk/javascript/commit/358be296a8181bb256fc1e15f878932c741b8743)]:
  - @clerk/backend@1.13.9

## 1.3.12

### Patch Changes

- Updated dependencies [[`fb932e5cf`](https://github.com/clerk/javascript/commit/fb932e5cf21315adf60bee0855b6bd5ee2ff9867)]:
  - @clerk/shared@2.9.0
  - @clerk/types@4.25.0
  - @clerk/backend@1.13.8

## 1.3.11

### Patch Changes

- Updated dependencies [[`f6fb8b53d`](https://github.com/clerk/javascript/commit/f6fb8b53d236863ad7eca576ee7a16cd33f3506b), [`4a8570590`](https://github.com/clerk/javascript/commit/4a857059059a02bb4f20893e08601e1e67babbed)]:
  - @clerk/types@4.24.0
  - @clerk/backend@1.13.7
  - @clerk/shared@2.8.5

## 1.3.10

### Patch Changes

- Updated dependencies [[`3e9160072`](https://github.com/clerk/javascript/commit/3e9160072aea72455a3db9cc710680a0a5359c55), [`748c0bae4`](https://github.com/clerk/javascript/commit/748c0bae4cfa1c2a721267fc9de7c6458200beb4), [`b579c3685`](https://github.com/clerk/javascript/commit/b579c36850126d994a96affa89bb1abc618ec38e)]:
  - @clerk/backend@1.13.6

## 1.3.9

### Patch Changes

- Updated dependencies [[`4749ed4c5`](https://github.com/clerk/javascript/commit/4749ed4c55a5ba5810451b8d436aad0d49829050), [`f1f17eaab`](https://github.com/clerk/javascript/commit/f1f17eaabed0dc4b7de405fb77d85503cf75ad33), [`2e35ac538`](https://github.com/clerk/javascript/commit/2e35ac53885f8008779940d41d1e804fa77ebfa9)]:
  - @clerk/backend@1.13.5
  - @clerk/types@4.23.0
  - @clerk/shared@2.8.4

## 1.3.8

### Patch Changes

- Updated dependencies [[`c9063853e`](https://github.com/clerk/javascript/commit/c9063853e538a4010f5d4e522a3da5abc80098a4), [`19d3808d4`](https://github.com/clerk/javascript/commit/19d3808d4672234944226d6709ec51214e8d6e1d), [`737bcbb0f`](https://github.com/clerk/javascript/commit/737bcbb0ffb5e2dcadbb02e8fc718fe8825c5842)]:
  - @clerk/types@4.22.0
  - @clerk/backend@1.13.4
  - @clerk/shared@2.8.3

## 1.3.7

### Patch Changes

- Add `@clerk/astro` to Astro integrations list page ([#4194](https://github.com/clerk/javascript/pull/4194)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`cb32aaf59`](https://github.com/clerk/javascript/commit/cb32aaf59d38dcd12e959f542782f71a87adf9c1), [`2e5c550e4`](https://github.com/clerk/javascript/commit/2e5c550e4aec61150c2a17fdcd4a0e1273cb50e7), [`6275c242c`](https://github.com/clerk/javascript/commit/6275c242cd8bcb6f7766934059967e0fe775a0c1), [`418be2fdb`](https://github.com/clerk/javascript/commit/418be2fdb558bb5c85d7be491945935b44cad681), [`c59636a1a`](https://github.com/clerk/javascript/commit/c59636a1aca67be7d6732d281cec307ed456678b), [`5c18671f1`](https://github.com/clerk/javascript/commit/5c18671f158f8077f822877ce5c1fa192199aeda), [`f9faaf031`](https://github.com/clerk/javascript/commit/f9faaf03100baf679c78e6c24877fbf3b60be529), [`e0ca9dc94`](https://github.com/clerk/javascript/commit/e0ca9dc94fa68f3d3db5d2433fa6b85d800d4ca2)]:
  - @clerk/shared@2.8.2
  - @clerk/types@4.21.1
  - @clerk/backend@1.13.3

## 1.3.6

### Patch Changes

- Updated dependencies [[`02babaccb`](https://github.com/clerk/javascript/commit/02babaccb648fa4e22f38cc0f572d44f82b09f78)]:
  - @clerk/backend@1.13.2

## 1.3.5

### Patch Changes

- Updated dependencies [[`3743eb911`](https://github.com/clerk/javascript/commit/3743eb9114733f20ed56a863ab98fa9c363b6723)]:
  - @clerk/shared@2.8.1
  - @clerk/backend@1.13.1

## 1.3.4

### Patch Changes

- Updated dependencies [[`e578b1599`](https://github.com/clerk/javascript/commit/e578b1599451d9f2122f12d835b510b26882e839)]:
  - @clerk/backend@1.13.0

## 1.3.3

### Patch Changes

- Fixes an issue where complex Astro configs caused circular reference JSON errors ([#4163](https://github.com/clerk/javascript/pull/4163)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`ba19be354`](https://github.com/clerk/javascript/commit/ba19be35461f0e5c76a58d11e4252a16781322c6), [`8cecbe875`](https://github.com/clerk/javascript/commit/8cecbe8756f58879c4b14b799700a25a83c1f00a), [`248142a6d`](https://github.com/clerk/javascript/commit/248142a6ded6ca937d0df7d628197f25228aadec), [`1189f71f8`](https://github.com/clerk/javascript/commit/1189f71f872f2683c12de5add5f154aeb953ca8d), [`a5e95295b`](https://github.com/clerk/javascript/commit/a5e95295b88acc6953d07a22d818e123774aeffa)]:
  - @clerk/shared@2.8.0
  - @clerk/backend@1.12.0
  - @clerk/types@4.21.0

## 1.3.2

### Patch Changes

- Vendor path-to-regexp ([#4145](https://github.com/clerk/javascript/pull/4145)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`be3b119f8`](https://github.com/clerk/javascript/commit/be3b119f840d2ae74f4b75d717711d53ac0e5f54)]:
  - @clerk/shared@2.7.2
  - @clerk/backend@1.11.1

## 1.3.1

### Patch Changes

- Allow child elements in unstyled Astro components. ([#4122](https://github.com/clerk/javascript/pull/4122)) by [@wobsoriano](https://github.com/wobsoriano)

  Usage:

  ```astro
  ---
  import { SignInButton } from '@clerk/components/astro'
  ---

  <SignInButton asChild>
    <button>Sign in with Clerk</button>
  </SignInButton>
  ```

- Fixes an issue where control components in client-side rendered apps are always hidden. ([#4131](https://github.com/clerk/javascript/pull/4131)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`b97b2c1ca`](https://github.com/clerk/javascript/commit/b97b2c1cae5cb1e569708a8745c13d203beb81d9), [`8c6909d46`](https://github.com/clerk/javascript/commit/8c6909d46328c943f1d464a28f1a324a27d0f3f1)]:
  - @clerk/backend@1.11.0
  - @clerk/types@4.20.1
  - @clerk/shared@2.7.1

## 1.3.0

### Minor Changes

- Add support for custom pages and links in the `<OrganizationProfile />` Astro component. ([#4096](https://github.com/clerk/javascript/pull/4096)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Updated dependencies [[`c63a5adf0`](https://github.com/clerk/javascript/commit/c63a5adf0ba4b99252146f168318f51b709bb5dd), [`8823c21a2`](https://github.com/clerk/javascript/commit/8823c21a26bc81cbc3ed007908b1a9ea474bd343), [`95ac67a14`](https://github.com/clerk/javascript/commit/95ac67a143c263bef0c1f589728566ab8f95768d), [`a0cb062fa`](https://github.com/clerk/javascript/commit/a0cb062faa4d23bef7a577e5cc486f4c5efe6bfa), [`746b4ed5e`](https://github.com/clerk/javascript/commit/746b4ed5e2007505d5850a2a728484809474d7bf)]:
  - @clerk/backend@1.10.0
  - @clerk/types@4.20.0
  - @clerk/shared@2.7.0

## 1.2.6

### Patch Changes

- Updated dependencies [[`8a3b9f079`](https://github.com/clerk/javascript/commit/8a3b9f0793484b32dd609a5c80a194e62151d6ea), [`e95c28196`](https://github.com/clerk/javascript/commit/e95c2819675cea7963f2404e5f71f37ebed8d5e0), [`1fe744328`](https://github.com/clerk/javascript/commit/1fe744328d126bc597e81770119796ac18e055ed)]:
  - @clerk/types@4.19.0
  - @clerk/backend@1.9.2
  - @clerk/shared@2.6.2

## 1.2.5

### Patch Changes

- Fixes an issue where not setting an element in an unstyled component causes a TypeScript error. ([#4057](https://github.com/clerk/javascript/pull/4057)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`82593173a`](https://github.com/clerk/javascript/commit/82593173aafbf6646e12c5779627cdcb138a1f27), [`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733)]:
  - @clerk/types@4.18.0
  - @clerk/backend@1.9.1
  - @clerk/shared@2.6.1

## 1.2.4

### Patch Changes

- Tidy up and improve README ([#4053](https://github.com/clerk/javascript/pull/4053)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`c9ef59106`](https://github.com/clerk/javascript/commit/c9ef59106c4720af3012586f5656f7b54cf2e336), [`fece72014`](https://github.com/clerk/javascript/commit/fece72014e2d39c8343a7329ae677badcba56d15), [`58e6754ad`](https://github.com/clerk/javascript/commit/58e6754ad9f9a1244b023ce1f5e5f2c1c4eb20e7), [`13693018f`](https://github.com/clerk/javascript/commit/13693018f4f7ac5d224698aa730e20960896f68c), [`3aa63dc5a`](https://github.com/clerk/javascript/commit/3aa63dc5a48161cfe92d94093ef0c32efd401342), [`9d0477781`](https://github.com/clerk/javascript/commit/9d04777814bf6d86d05506838b101e7cfc7c208d), [`3304dcc0b`](https://github.com/clerk/javascript/commit/3304dcc0bc93a92a7f729f585c60ff91d2ae04f6)]:
  - @clerk/backend@1.9.0
  - @clerk/types@4.17.0
  - @clerk/shared@2.6.0

## 1.2.3

### Patch Changes

- Updated dependencies [[`c1389492d`](https://github.com/clerk/javascript/commit/c1389492d8b6a9292ab04889bf776c0f45e66845)]:
  - @clerk/types@4.16.0
  - @clerk/backend@1.8.3
  - @clerk/shared@2.5.5

## 1.2.2

### Patch Changes

- Updated dependencies [[`0158c774a`](https://github.com/clerk/javascript/commit/0158c774af2243a2cd13b55c4d6fae877178c961), [`8be1a7abc`](https://github.com/clerk/javascript/commit/8be1a7abc8849d7d59552011bd6b25bc917d51f5)]:
  - @clerk/types@4.15.1
  - @clerk/backend@1.8.2
  - @clerk/shared@2.5.4

## 1.2.1

### Patch Changes

- Fixes a bug where subscribing to the `$clerkStore` nanostore would give incorrect values. ([#4008](https://github.com/clerk/javascript/pull/4008)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`247b3fd75`](https://github.com/clerk/javascript/commit/247b3fd75042365dc9f950db056b76f9fadfdcf6)]:
  - @clerk/types@4.15.0
  - @clerk/backend@1.8.1
  - @clerk/shared@2.5.3

## 1.2.0

### Minor Changes

- Add support for custom pages and links in the `<UserProfile />` Astro component. ([#3987](https://github.com/clerk/javascript/pull/3987)) by [@wobsoriano](https://github.com/wobsoriano)

- Add support for Astro `static` and `hybrid` outputs. ([#3911](https://github.com/clerk/javascript/pull/3911)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Fix incorrect authentication state when subscribing to client stores. ([#4000](https://github.com/clerk/javascript/pull/4000)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`ed7baa048`](https://github.com/clerk/javascript/commit/ed7baa0488df0ee4c48add2aac934ffb47e4a6d2)]:
  - @clerk/backend@1.8.0

## 1.1.0

### Minor Changes

- Add support for custom menu items in the `<UserButton />` Astro component. ([#3969](https://github.com/clerk/javascript/pull/3969)) by [@wobsoriano](https://github.com/wobsoriano)

- Inject `windowNavigate` through router functions. ([#3922](https://github.com/clerk/javascript/pull/3922)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Remove dependency `@clerk/clerk-js`. ([#3965](https://github.com/clerk/javascript/pull/3965)) by [@panteliselef](https://github.com/panteliselef)

  Since clerk-js is being hotloaded it is unnecessary to keep the npm package as a dependency.

- Remove duplicate headers set in Clerk middleware ([#3948](https://github.com/clerk/javascript/pull/3948)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`dc0e1c33d`](https://github.com/clerk/javascript/commit/dc0e1c33d6844b028cb1ee11c3359b886d609f3c), [`dc94c0834`](https://github.com/clerk/javascript/commit/dc94c08341c883fa5bf891f880fb34c4569ea820)]:
  - @clerk/types@4.14.0
  - @clerk/backend@1.7.0
  - @clerk/shared@2.5.2

## 1.0.12

### Patch Changes

- Introduce functions that can be reused across front-end SDKs ([#3849](https://github.com/clerk/javascript/pull/3849)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`1305967bf`](https://github.com/clerk/javascript/commit/1305967bfefe7da48a586c3f65cf53f751044eb6), [`7e0ced3da`](https://github.com/clerk/javascript/commit/7e0ced3da94f41056bc4445d163d3b615afb6ab1), [`def3a3894`](https://github.com/clerk/javascript/commit/def3a38948969bddc94a0b5a045ad63e2a97b8f3), [`b6f0613dc`](https://github.com/clerk/javascript/commit/b6f0613dc9d8b0bab41cfabbaa8621b126e3bdf5)]:
  - @clerk/clerk-js@5.14.1
  - @clerk/shared@2.5.1
  - @clerk/types@4.13.1
  - @clerk/backend@1.6.3

## 1.0.11

### Patch Changes

- Updated dependencies [[`59d5f19d3`](https://github.com/clerk/javascript/commit/59d5f19d333bf4a35c244886e93b4368e215225c), [`4e6c94e3f`](https://github.com/clerk/javascript/commit/4e6c94e3f4cc92cbba8bddcd2b90fcc9cfb83763)]:
  - @clerk/shared@2.5.0
  - @clerk/clerk-js@5.14.0
  - @clerk/types@4.13.0
  - @clerk/backend@1.6.2

## 1.0.10

### Patch Changes

- Internal change: Use `AuthObject` type import from `@clerk/backend`. ([#3844](https://github.com/clerk/javascript/pull/3844)) by [@kduprey](https://github.com/kduprey)

- Updated dependencies [[`d7bf0f87c`](https://github.com/clerk/javascript/commit/d7bf0f87c4c50bc19d2796bca32bd694046a23b0), [`9b2aeacb3`](https://github.com/clerk/javascript/commit/9b2aeacb32fff7c300bda458636a1cc81a42ee7b)]:
  - @clerk/backend@1.6.1
  - @clerk/clerk-js@5.13.2
  - @clerk/types@4.12.1
  - @clerk/shared@2.4.5

## 1.0.9

### Patch Changes

- Updated dependencies [[`069103c8f`](https://github.com/clerk/javascript/commit/069103c8fbdf25a03e0992dc5478ebeaeaf122ea)]:
  - @clerk/clerk-js@5.13.1

## 1.0.8

### Patch Changes

- Updated dependencies [[`7e94fcf0f`](https://github.com/clerk/javascript/commit/7e94fcf0fcbee8842a54f7931c45190370aa870d)]:
  - @clerk/backend@1.6.0
  - @clerk/clerk-js@5.13.0
  - @clerk/types@4.12.0
  - @clerk/shared@2.4.4

## 1.0.7

### Patch Changes

- Updated dependencies [[`568186cad`](https://github.com/clerk/javascript/commit/568186cad29acaf0b084a9f86ccb9d29bd23fcf4), [`407195270`](https://github.com/clerk/javascript/commit/407195270ed8aab6eef18c64a4918e3870fef471)]:
  - @clerk/clerk-js@5.12.0
  - @clerk/types@4.11.0
  - @clerk/backend@1.5.2
  - @clerk/shared@2.4.3

## 1.0.6

### Patch Changes

- Updated dependencies [[`992e5960c`](https://github.com/clerk/javascript/commit/992e5960c785eace83f3bad7c34d589fa313dcaf)]:
  - @clerk/backend@1.5.1

## 1.0.5

### Patch Changes

- Fixed a bug where the `<Protect />` component would not validate any properties passed ([#3846](https://github.com/clerk/javascript/pull/3846)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`fde5b5e7e`](https://github.com/clerk/javascript/commit/fde5b5e7e6fb5faa4267e06d82a38a176165b4f4), [`aa06f3ba7`](https://github.com/clerk/javascript/commit/aa06f3ba7e725071c90d4a1d6840060236da3c23), [`80e647731`](https://github.com/clerk/javascript/commit/80e64773135865434cf0e6c220e287397aa07937)]:
  - @clerk/backend@1.5.0
  - @clerk/clerk-js@5.11.0
  - @clerk/types@4.10.0
  - @clerk/shared@2.4.2

## 1.0.4

### Patch Changes

- Introduce option to opt-out of telemetry data collection ([#3808](https://github.com/clerk/javascript/pull/3808)) by [@wobsoriano](https://github.com/wobsoriano)

- Allow the handler of `clerkMiddleware` to return undefined. When undefined is returned, `clerkMiddleware` implicitly calls `await next()`. ([#3792](https://github.com/clerk/javascript/pull/3792)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`b48689705`](https://github.com/clerk/javascript/commit/b48689705f9fc2251d2f24addec7a0d0b1da0fe1), [`17bbe0199`](https://github.com/clerk/javascript/commit/17bbe01994beb9c5e53355cc692a5d71ddf4cc8c), [`4e61f8d27`](https://github.com/clerk/javascript/commit/4e61f8d2770907f48a53d530187a7b6de09f107e)]:
  - @clerk/clerk-js@5.10.2
  - @clerk/types@4.9.1
  - @clerk/backend@1.4.3
  - @clerk/shared@2.4.1

## 1.0.3

### Patch Changes

- Updated dependencies [[`d465d7069`](https://github.com/clerk/javascript/commit/d465d70696bf26270cb2efbf4695ca49016fcb96)]:
  - @clerk/backend@1.4.2

## 1.0.2

### Patch Changes

- Updated dependencies [[`045fb93cb`](https://github.com/clerk/javascript/commit/045fb93cbf577ca84e5b95fc6dfaacde67693be2)]:
  - @clerk/backend@1.4.1
  - @clerk/clerk-js@5.10.1

## 1.0.1

### Patch Changes

- Updated dependencies [[`b87f7b9e1`](https://github.com/clerk/javascript/commit/b87f7b9e163756fd43789bc7b7344d2eb24015ec), [`e1a8666b3`](https://github.com/clerk/javascript/commit/e1a8666b3e6dbd8d37905fbfeff2e65a17b0769d), [`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`c5d01525d`](https://github.com/clerk/javascript/commit/c5d01525d72f2b131441bfef90d1145b03be3d13), [`86c75e50c`](https://github.com/clerk/javascript/commit/86c75e50cba9c4efb480672f1b8c6a6fff4ef477)]:
  - @clerk/clerk-js@5.10.0
  - @clerk/backend@1.4.0
  - @clerk/shared@2.4.0
  - @clerk/types@4.9.0

## 1.0.0

### Major Changes

- Introduce the official Clerk SDK for Astro. ([#3743](https://github.com/clerk/javascript/pull/3743)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Allow for client side navigation inside UI components and improves the UX while navigating in components with path routing. ([#3734](https://github.com/clerk/javascript/pull/3734)) by [@panteliselef](https://github.com/panteliselef)

## 0.0.4

### Patch Changes

- Introduce `<ClerkLoaded/>` and `<ClerkLoading/>` React components ([#3724](https://github.com/clerk/javascript/pull/3724)) by [@wobsoriano](https://github.com/wobsoriano)

## 0.0.3

### Patch Changes

- Update existing env variables that is still using `PUBLIC_ASTRO_APP` prefix to `PUBLIC_`. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Move `@clerk/astro/components/*` to `@clerk/astro/components` by [@nikosdouvlis](https://github.com/nikosdouvlis)

  ```diff
  - import { UserProfile } from "@clerk/astro/components/interactive"
  + import { UserProfile } from "@clerk/astro/components"

  - import { Protect } from "@clerk/astro/components/control"
  + import { Protect } from "@clerk/astro/components"

  - import { SignInButton } from "@clerk/astro/components/unstyled"
  + import { SignInButton } from "@clerk/astro/components"
  ```

- Simplify submodules and drop the `bunlded` variant. by [@nikosdouvlis](https://github.com/nikosdouvlis)

  Moved

  - `@clerk/astro/client/react` to `@clerk/astro/react`
  - `@clerk/astro/client/stores` to `@clerk/astro/client`
    Dropped
  - `@clerk/astro/bundled`
  - `@clerk/astro/client/bundled`
  - `@clerk/astro/internal/bundled`
  - `@clerk/astro/integration`
  - `@clerk/astro/integration/bundled`

- Support `Astro.locals.auth().redirectToSignIn()` by [@nikosdouvlis](https://github.com/nikosdouvlis)

  This allows for redirectingToSignIn at the page level

- Add a reusable ID generation function by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Remove `@nanostores/react` from depedency. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Introduce `<AuthenticateWithRedirectCallback/>` as an Astro and as a React component by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7), [`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7)]:
  - @clerk/clerk-js@5.9.0
  - @clerk/types@4.8.0
  - @clerk/backend@1.3.2
  - @clerk/shared@2.3.3

## 0.0.2

### Patch Changes

- Add an Astro component and a React UI Component for Google One Tap. ([#3676](https://github.com/clerk/javascript/pull/3676)) by [@panteliselef](https://github.com/panteliselef)

- Add unstyled authentication button components for Astro and React integration ([#3656](https://github.com/clerk/javascript/pull/3656)) by [@wobsoriano](https://github.com/wobsoriano)

- Introduce a shared component for interactive components that handles UI mounting ([#3664](https://github.com/clerk/javascript/pull/3664)) by [@wobsoriano](https://github.com/wobsoriano)

- Improve stream processing performance ([#3673](https://github.com/clerk/javascript/pull/3673)) by [@wobsoriano](https://github.com/wobsoriano)

- Drop convenience Astro wrappers for React components ([#3682](https://github.com/clerk/javascript/pull/3682)) by [@wobsoriano](https://github.com/wobsoriano)

- Change prefix for public env variables to `PUBLIC_`. The previous prefix was `PUBLIC_ASTRO_APP_`. ([#3669](https://github.com/clerk/javascript/pull/3669)) by [@panteliselef](https://github.com/panteliselef)

  - After this change the publishable key from should be set as `PUBLIC_CLERK_PUBLISHABLE_KEY=xxxxx`

- Implement telemetry for nanostores and middleware usage; include SDK metadata. ([#3662](https://github.com/clerk/javascript/pull/3662)) by [@wobsoriano](https://github.com/wobsoriano)

- Bug fix: Removed import.meta from integration to avoid breaking app during build. ([#3675](https://github.com/clerk/javascript/pull/3675)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`09f905a89`](https://github.com/clerk/javascript/commit/09f905a8915a39179cbffb2149342ca138bedb77), [`6a98c084e`](https://github.com/clerk/javascript/commit/6a98c084e89afb3800edb3d0136c396e020be6b7), [`5642b2616`](https://github.com/clerk/javascript/commit/5642b26167a6eb1aca68777d782a9686edacfd37)]:
  - @clerk/clerk-js@5.8.1
  - @clerk/backend@1.3.1

## 0.0.1

### Patch Changes

- Introduce an experimental version of the official [Astro](https://astro.build/) SDK called `@clerk/astro` ([#3646](https://github.com/clerk/javascript/pull/3646)) by [@panteliselef](https://github.com/panteliselef)
