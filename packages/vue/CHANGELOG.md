# @clerk/vue

## 1.11.4

### Patch Changes

- Fixes an issue where deep updates to Clerk component options are not reactive. ([#6588](https://github.com/clerk/javascript/pull/6588)) by [@wobsoriano](https://github.com/wobsoriano)

- Fix incorrect redirect when completing session tasks within `SignIn` and `SignUp` components ([#6580](https://github.com/clerk/javascript/pull/6580)) by [@iagodahlem](https://github.com/iagodahlem)

- Updated dependencies [[`e52bf8e`](https://github.com/clerk/javascript/commit/e52bf8ebef74a9e123c69b69acde1340c01d32d7), [`c043c19`](https://github.com/clerk/javascript/commit/c043c1919854aaa5b9cf7f6df5bb517f5617f7a1), [`c28d29c`](https://github.com/clerk/javascript/commit/c28d29c79bb4f144d782313ca72df7db91a77340), [`172e054`](https://github.com/clerk/javascript/commit/172e054a3511be12d16ba19037db320c2d9838bf)]:
  - @clerk/types@4.81.0
  - @clerk/shared@3.22.0

## 1.11.3

### Patch Changes

- Updated dependencies [[`8dc6bad`](https://github.com/clerk/javascript/commit/8dc6bad5c7051b59bd8c73e65d497f6a974bb1c3), [`aa6a3c3`](https://github.com/clerk/javascript/commit/aa6a3c3d3ba2de67a468c996cbf0bff43a09ddb8), [`db50c47`](https://github.com/clerk/javascript/commit/db50c4734920ada6002de8c62c994047eb6cb5a0)]:
  - @clerk/types@4.80.0
  - @clerk/shared@3.21.2

## 1.11.2

### Patch Changes

- Updated dependencies [[`413468c`](https://github.com/clerk/javascript/commit/413468c9b9c8fb7576f8e4cbdccff98784e33fef), [`7b7eb1f`](https://github.com/clerk/javascript/commit/7b7eb1fc0235249c5c179239078294118f2947cd)]:
  - @clerk/shared@3.21.1
  - @clerk/types@4.79.0

## 1.11.1

### Patch Changes

- Fix export of `RedirectToTasks` control component ([#6546](https://github.com/clerk/javascript/pull/6546)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`5b24129`](https://github.com/clerk/javascript/commit/5b24129ddcfc2f7dc6eb79d8c818b4ff97c68e9a)]:
  - @clerk/shared@3.21.0
  - @clerk/types@4.78.0

## 1.11.0

### Minor Changes

- Rename `RedirectToTask` control component to `RedirectToTasks` ([#6486](https://github.com/clerk/javascript/pull/6486)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Updated dependencies [[`4db1e58`](https://github.com/clerk/javascript/commit/4db1e58d70b60e1e236709b507666715d571e925), [`69498df`](https://github.com/clerk/javascript/commit/69498dfca3e6bb388eb8c94313eac06347dd5a27), [`59f1559`](https://github.com/clerk/javascript/commit/59f15593bab708b9e13eebfff6780c2d52b31b0a)]:
  - @clerk/types@4.77.0
  - @clerk/shared@3.20.1

## 1.10.1

### Patch Changes

- Updated dependencies [[`15fe106`](https://github.com/clerk/javascript/commit/15fe1060f730a6a4391f3d2451d23edd3218e1ae), [`173837c`](https://github.com/clerk/javascript/commit/173837c2526aa826b7981ee8d6d4f52c00675da5), [`8b52d7a`](https://github.com/clerk/javascript/commit/8b52d7ae19407e8ab5a5451bd7d34b6bc38417de), [`854dde8`](https://github.com/clerk/javascript/commit/854dde88e642c47b5a29ac8f576c8c1976e5d067), [`ae2e2d6`](https://github.com/clerk/javascript/commit/ae2e2d6b336be6b596cc855e549843beb5bfd2a1), [`037f25a`](https://github.com/clerk/javascript/commit/037f25a8171888168913b186b7edf871e0aaf197), [`f8b38b7`](https://github.com/clerk/javascript/commit/f8b38b7059e498fef3ac1271346be0710aa31c76)]:
  - @clerk/types@4.76.0
  - @clerk/shared@3.20.0

## 1.10.0

### Minor Changes

- Remove `treatPendingAsSignedOut` from Clerk options ([#6497](https://github.com/clerk/javascript/pull/6497)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Updated dependencies [[`b72a3dd`](https://github.com/clerk/javascript/commit/b72a3dda2467720e5dc8cab3e7e6a110f3beb79b), [`d93b0ed`](https://github.com/clerk/javascript/commit/d93b0edf4adc57d48a26cb08444192887ccec659), [`6459f7d`](https://github.com/clerk/javascript/commit/6459f7dabe5f163f48ed73106bb901d8187da3e2), [`0ff648a`](https://github.com/clerk/javascript/commit/0ff648aeac0e2f5481596a98c8046d9d58a7bf75), [`9084759`](https://github.com/clerk/javascript/commit/90847593300be605e1ee1c06dac147ce68b25dc7)]:
  - @clerk/types@4.75.0
  - @clerk/shared@3.19.0

## 1.9.3

### Patch Changes

- Updated dependencies [[`1ad16da`](https://github.com/clerk/javascript/commit/1ad16daa49795a861ae277001831230580b6b9f4), [`4edef81`](https://github.com/clerk/javascript/commit/4edef81dd423a0471e3f579dd6b36094aa8546aa), [`696f8e1`](https://github.com/clerk/javascript/commit/696f8e11a3e5391e6b5a97d98e929b8973575b9a), [`f318d22`](https://github.com/clerk/javascript/commit/f318d22cf83caaef272bcf532561a03ca72575e7), [`1cc66ab`](https://github.com/clerk/javascript/commit/1cc66aba1c0adac24323876e4cc3d96be888b07b)]:
  - @clerk/types@4.74.0
  - @clerk/shared@3.18.1

## 1.9.2

### Patch Changes

- Remove `treatPendingAsSignedOut` from `useSession` and always return pending session ([#6459](https://github.com/clerk/javascript/pull/6459)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`9368daf`](https://github.com/clerk/javascript/commit/9368dafb119b5a8ec6a9d6d82270e72bab6d8f1e), [`f93965f`](https://github.com/clerk/javascript/commit/f93965f64c81030f9fcf9d1cc4e4984d30cd12ec), [`7b6dcee`](https://github.com/clerk/javascript/commit/7b6dceea5bfd7f1cc1bf24126aa715307e24ae7f), [`ef87617`](https://github.com/clerk/javascript/commit/ef87617ae1fd125c806a33bfcfdf09c885319fa8)]:
  - @clerk/shared@3.18.0
  - @clerk/types@4.73.0

## 1.9.1

### Patch Changes

- Updated dependencies [[`7a46679`](https://github.com/clerk/javascript/commit/7a46679a004739a7f712097c5779e9f5c068722e), [`05cc5ec`](https://github.com/clerk/javascript/commit/05cc5ecd82ecdbcc9922d3286224737a81813be0), [`22c35ef`](https://github.com/clerk/javascript/commit/22c35efb59226df2efaa2891fa4775c13312f4c6), [`e8d816a`](https://github.com/clerk/javascript/commit/e8d816a3350e862c3e9e1d4f8c96c047a0a016a2), [`aa9f185`](https://github.com/clerk/javascript/commit/aa9f185e21b58f8a6e03ea44ce29ee09ad2477d9), [`af0e123`](https://github.com/clerk/javascript/commit/af0e12393c9412281626e20dafb1b3a15558f6d9), [`3d1d871`](https://github.com/clerk/javascript/commit/3d1d8711405646cf3c2aabe99e08337a1028703a)]:
  - @clerk/shared@3.17.0
  - @clerk/types@4.72.0

## 1.9.0

### Minor Changes

- Introduce `<RedirectToTask />` component ([#6416](https://github.com/clerk/javascript/pull/6416)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Updated dependencies [[`e404456`](https://github.com/clerk/javascript/commit/e4044566bca81f63c8e9c630fdec0f498ad6fc08), [`2803133`](https://github.com/clerk/javascript/commit/28031330a9810946feb44b93be10c067fb3b63ba), [`f1d9d34`](https://github.com/clerk/javascript/commit/f1d9d3482a796dd5f7796ede14159850e022cba2), [`d58b959`](https://github.com/clerk/javascript/commit/d58b9594cf65158e87dbaa90d632c45f543373e1), [`822ba1f`](https://github.com/clerk/javascript/commit/822ba1fd5e7daf665120cf183e4600a227098d53), [`d4d2612`](https://github.com/clerk/javascript/commit/d4d2612483baf356c389ef0ba5084059025481f2)]:
  - @clerk/types@4.71.0
  - @clerk/shared@3.16.0

## 1.8.21

### Patch Changes

- Updated dependencies [[`b0fdc9e`](https://github.com/clerk/javascript/commit/b0fdc9eaf764ca0c17cbe0810b7d240f6d9db0b6)]:
  - @clerk/types@4.70.1
  - @clerk/shared@3.15.1

## 1.8.20

### Patch Changes

- Updated dependencies [[`cd59c0e`](https://github.com/clerk/javascript/commit/cd59c0e5512a341dd8fb420aca583333c8243aa5), [`cd59c0e`](https://github.com/clerk/javascript/commit/cd59c0e5512a341dd8fb420aca583333c8243aa5)]:
  - @clerk/types@4.70.0
  - @clerk/shared@3.15.0

## 1.8.19

### Patch Changes

- Updated dependencies [[`fecc99d`](https://github.com/clerk/javascript/commit/fecc99d43cb7db5b99863829acb234cbce0da264), [`959d63d`](https://github.com/clerk/javascript/commit/959d63de27e5bfe27b46699b441dfd4e48616bf8), [`10e1060`](https://github.com/clerk/javascript/commit/10e10605b18a58f33a93caed058159c190678e74), [`92c44dd`](https://github.com/clerk/javascript/commit/92c44dd9d51e771a928a8da7004bdb8f8bdbaf58), [`a04a8f5`](https://github.com/clerk/javascript/commit/a04a8f5f81241ee41d93cd64793beca9d6296abb), [`c61855c`](https://github.com/clerk/javascript/commit/c61855c51d9c129d48c4543da3719939ad82f623), [`43ea069`](https://github.com/clerk/javascript/commit/43ea069c570dc64503fc82356ad28a2e43689d45)]:
  - @clerk/types@4.69.0
  - @clerk/shared@3.14.0

## 1.8.18

### Patch Changes

- Updated dependencies [[`d2f6f9e`](https://github.com/clerk/javascript/commit/d2f6f9e02036a4288916fcce14f24be5d56561c4), [`a329836`](https://github.com/clerk/javascript/commit/a329836a6c64f0a551a277ccae07043456a70523), [`6041c39`](https://github.com/clerk/javascript/commit/6041c39a31e787a6065dbc3f21e1c569982a06de), [`3f1270d`](https://github.com/clerk/javascript/commit/3f1270db86a21ead0ed6f0bd4f9986485203e973)]:
  - @clerk/types@4.68.0
  - @clerk/shared@3.13.0

## 1.8.17

### Patch Changes

- Updated dependencies [[`2a90b68`](https://github.com/clerk/javascript/commit/2a90b689550ae960496c9292ca23e0225e3425cd), [`af50905`](https://github.com/clerk/javascript/commit/af50905ea497ed3286c8c4c374498e06ca6ee82b)]:
  - @clerk/types@4.67.0
  - @clerk/shared@3.12.3

## 1.8.16

### Patch Changes

- Updated dependencies [[`8ee859c`](https://github.com/clerk/javascript/commit/8ee859ce00d1d5747c14a80fe7166303e64a4f1f)]:
  - @clerk/shared@3.12.2
  - @clerk/types@4.66.1

## 1.8.15

### Patch Changes

- Updated dependencies [[`025e304`](https://github.com/clerk/javascript/commit/025e304c4d6402dfd750ee51ac9c8fc2dea1f353), [`dedf487`](https://github.com/clerk/javascript/commit/dedf48703986d547d5b28155b0182a51030cffeb), [`b96114e`](https://github.com/clerk/javascript/commit/b96114e438638896ba536bb7a17b09cdadcd9407)]:
  - @clerk/types@4.66.0
  - @clerk/shared@3.12.1

## 1.8.14

### Patch Changes

- Updated dependencies [[`2be6a53`](https://github.com/clerk/javascript/commit/2be6a53959cb8a3127c2eb5d1aeb4248872d2c24), [`f6a1c35`](https://github.com/clerk/javascript/commit/f6a1c35bd5fb4bd2a3cd45bdaf9defe6be59d4a9), [`6826d0b`](https://github.com/clerk/javascript/commit/6826d0bbd03e844d49224565878a4326684f06b4), [`f6a1c35`](https://github.com/clerk/javascript/commit/f6a1c35bd5fb4bd2a3cd45bdaf9defe6be59d4a9), [`97a07f7`](https://github.com/clerk/javascript/commit/97a07f78b4b0c3dc701a2610097ec7d6232f79e7)]:
  - @clerk/types@4.65.0
  - @clerk/shared@3.12.0

## 1.8.13

### Patch Changes

- Updated dependencies [[`f42c4fe`](https://github.com/clerk/javascript/commit/f42c4fedfdab873129b876eba38b3677f190b460), [`ec207dc`](https://github.com/clerk/javascript/commit/ec207dcd2a13340cfa4e3b80d3d52d1b4e7d5f23), [`ec207dc`](https://github.com/clerk/javascript/commit/ec207dcd2a13340cfa4e3b80d3d52d1b4e7d5f23), [`0e0cc1f`](https://github.com/clerk/javascript/commit/0e0cc1fa85347d727a4fd3718fe45b0f0244ddd9)]:
  - @clerk/types@4.64.0
  - @clerk/shared@3.11.0

## 1.8.12

### Patch Changes

- Updated dependencies [[`abd8446`](https://github.com/clerk/javascript/commit/abd844609dad263d974da7fbf5e3575afce73abe), [`8387a39`](https://github.com/clerk/javascript/commit/8387a392a04906f0f10d84c61cfee36f23942f85), [`f2a6641`](https://github.com/clerk/javascript/commit/f2a66419b1813abc86ea98fde7475861995a1486)]:
  - @clerk/shared@3.10.2
  - @clerk/types@4.63.0

## 1.8.11

### Patch Changes

- Extract internal `ProtectProps` type to shared types to eliminate duplication across SDKs ([#6197](https://github.com/clerk/javascript/pull/6197)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`02a1f42`](https://github.com/clerk/javascript/commit/02a1f42dfdb28ea956d6cbd3fbabe10093d2fad8), [`edc0bfd`](https://github.com/clerk/javascript/commit/edc0bfdae929dad78a99dfd6275aad947d9ddd73)]:
  - @clerk/shared@3.10.1
  - @clerk/types@4.62.1

## 1.8.10

### Patch Changes

- Updated dependencies [[`f1be1fe`](https://github.com/clerk/javascript/commit/f1be1fe3d575c11acd04fc7aadcdec8f89829894), [`bffb42a`](https://github.com/clerk/javascript/commit/bffb42aaf266a188b9ae7d16ace3024d468a3bd4)]:
  - @clerk/types@4.62.0
  - @clerk/shared@3.10.0

## 1.8.9

### Patch Changes

- Make `initialState` prop public and bump `@nuxt/kit` to 3.17.5 ([#6132](https://github.com/clerk/javascript/pull/6132)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`b495279`](https://github.com/clerk/javascript/commit/b4952796e3c7dee4ab4726de63a17b7f4265ce37), [`c3fa15d`](https://github.com/clerk/javascript/commit/c3fa15d60642b4fcbcf26e21caaca0fc60975795), [`52d5e57`](https://github.com/clerk/javascript/commit/52d5e5768d54725b4d20d028135746493e05d44c), [`15a945c`](https://github.com/clerk/javascript/commit/15a945c02a9f6bc8d2f7d1e3534217100bf45936), [`72629b0`](https://github.com/clerk/javascript/commit/72629b06fb1fe720fa2a61462306a786a913e9a8)]:
  - @clerk/types@4.61.0
  - @clerk/shared@3.9.8

## 1.8.8

### Patch Changes

- Updated dependencies [[`19e9e11`](https://github.com/clerk/javascript/commit/19e9e11af04f13fd12975fbf7016fe0583202056), [`18bcb64`](https://github.com/clerk/javascript/commit/18bcb64a3e8b6d352d7933ed094d68214e6e80fb), [`138f733`](https://github.com/clerk/javascript/commit/138f733f13121487268a4f96e6eb2cffedc6e238), [`48be55b`](https://github.com/clerk/javascript/commit/48be55b61a86e014dd407414764d24bb43fd26f3), [`2c6f805`](https://github.com/clerk/javascript/commit/2c6f805a9e6e4685990f9a8abc740b2d0859a453), [`97749d5`](https://github.com/clerk/javascript/commit/97749d570bc687c7e05cd800a50e0ae4180a371d)]:
  - @clerk/types@4.60.1
  - @clerk/shared@3.9.7

## 1.8.7

### Patch Changes

- Updated dependencies [[`d8fa5d9`](https://github.com/clerk/javascript/commit/d8fa5d9d3d8dc575260d8d2b7c7eeeb0052d0b0d), [`be2e89c`](https://github.com/clerk/javascript/commit/be2e89ca11aa43d48f74c57a5a34e20d85b4003c), [`5644d94`](https://github.com/clerk/javascript/commit/5644d94f711a0733e4970c3f15c24d56cafc8743), [`b578225`](https://github.com/clerk/javascript/commit/b5782258242474c9b0987a3f8349836cd763f24b), [`8838120`](https://github.com/clerk/javascript/commit/8838120596830b88fec1c6c853371dabfec74a0d)]:
  - @clerk/types@4.60.0
  - @clerk/shared@3.9.6

## 1.8.6

### Patch Changes

- Updated dependencies [[`f897773`](https://github.com/clerk/javascript/commit/f89777379da63cf45039c1570b51ba10a400817c), [`2c6a0cc`](https://github.com/clerk/javascript/commit/2c6a0cca6e824bafc6b0d0501784517a5b1f75ea), [`71e6a1f`](https://github.com/clerk/javascript/commit/71e6a1f1024d65b7a09cdc8fa81ce0164e0a34cb)]:
  - @clerk/shared@3.9.5
  - @clerk/types@4.59.3

## 1.8.5

### Patch Changes

- Updated dependencies [[`6ed3dfc`](https://github.com/clerk/javascript/commit/6ed3dfc1bc742ac9d9a2307fe8e4733411cbc0d7)]:
  - @clerk/types@4.59.2
  - @clerk/shared@3.9.4

## 1.8.4

### Patch Changes

- Updated dependencies [[`f237d76`](https://github.com/clerk/javascript/commit/f237d7617e5398ca0ba981e4336cac2191505b00)]:
  - @clerk/shared@3.9.3

## 1.8.3

### Patch Changes

- Updated dependencies [[`c305b31`](https://github.com/clerk/javascript/commit/c305b310e351e9ce2012f805b35e464c3e43e310), [`6bb480e`](https://github.com/clerk/javascript/commit/6bb480ef663a6dfa219bc9546aca087d5d9624d0)]:
  - @clerk/types@4.59.1
  - @clerk/shared@3.9.2

## 1.8.2

### Patch Changes

- Updated dependencies [[`b1337df`](https://github.com/clerk/javascript/commit/b1337dfeae8ccf8622efcf095e3201f9bbf1cefa), [`65f0878`](https://github.com/clerk/javascript/commit/65f08788ee5e56242eee2194c73ba90965c75c97), [`df6fefd`](https://github.com/clerk/javascript/commit/df6fefd05fd2df93f5286d97e546b48911adea7c), [`4282bfa`](https://github.com/clerk/javascript/commit/4282bfa09491225bde7d619fe9a3561062703f69), [`5491491`](https://github.com/clerk/javascript/commit/5491491711e0a8ee37828451c1f603a409de32cf)]:
  - @clerk/types@4.59.0
  - @clerk/shared@3.9.1

## 1.8.1

### Patch Changes

- Add `isSatellite` prop type in Vue and Nuxt SDKs ([#5911](https://github.com/clerk/javascript/pull/5911)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`1ff6d6e`](https://github.com/clerk/javascript/commit/1ff6d6efbe838b3f7f6977b2b5215c2cafd715f6), [`fbf3cf4`](https://github.com/clerk/javascript/commit/fbf3cf4916469c4e118870bf12efca2d0f77d9d8)]:
  - @clerk/shared@3.9.0
  - @clerk/types@4.58.1

## 1.8.0

### Minor Changes

- Introduce feature or plan based authorization ([#5890](https://github.com/clerk/javascript/pull/5890)) by [@wobsoriano](https://github.com/wobsoriano)

  ## `useAuth()`

  ### Plan

  ```ts
  const { has } = useAuth();
  has.value({ plan: 'my-plan' });
  ```

  ### Feature

  ```ts
  const { has } = useAuth();
  has.value({ feature: 'my-feature' });
  ```

  ### Scoped per user or per org

  ```ts
  const { has } = useAuth();

  has.value({ feature: 'org:my-feature' });
  has.value({ feature: 'user:my-feature' });
  has.value({ plan: 'user:my-plan' });
  has.value({ plan: 'org:my-plan' });
  ```

  ## `<Protect />`

  ### Plan

  ```html
  <Protect plan="my-plan" />
  ```

  ### Feature

  ```html
  <Protect feature="my-feature" />
  ```

  ### Scoped per user or per org

  ```html
  <Protect feature="org:my-feature" />
  <Protect feature="user:my-feature" />
  <Protect plan="org:my-plan" />
  <Protect plan="user:my-plan" />
  ```

### Patch Changes

- Updated dependencies [[`0f5145e`](https://github.com/clerk/javascript/commit/0f5145e164f3d3d5faf57e58162b05e7110d2403), [`afdfd18`](https://github.com/clerk/javascript/commit/afdfd18d645608dec37e52a291a91ba5f42dcbe7), [`b7c51ba`](https://github.com/clerk/javascript/commit/b7c51baac6df1129b468274c9a7f63ca303f16ce), [`437b53b`](https://github.com/clerk/javascript/commit/437b53b67e281d076b5b3f927e11c1d64666d154), [`5217155`](https://github.com/clerk/javascript/commit/52171554250c5c58f4f497b6d3c7416e79ac77da)]:
  - @clerk/types@4.58.0
  - @clerk/shared@3.8.2

## 1.7.2

### Patch Changes

- Updated dependencies [[`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`36fb43f`](https://github.com/clerk/javascript/commit/36fb43f8b35866bdc20680fac58020f036d30d1f), [`e5ac444`](https://github.com/clerk/javascript/commit/e5ac4447f52bb6887ad686feab308fe9daf76e33), [`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`d227805`](https://github.com/clerk/javascript/commit/d22780599a5e29545a3d8309cc411c2e8659beac)]:
  - @clerk/types@4.57.1
  - @clerk/shared@3.8.1

## 1.7.1

### Patch Changes

- Set default SDK Metadata. ([#5839](https://github.com/clerk/javascript/pull/5839)) by [@wobsoriano](https://github.com/wobsoriano)

- Replace \_\_experimental_PricingTable with PricingTable ([#5828](https://github.com/clerk/javascript/pull/5828)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`db0138f`](https://github.com/clerk/javascript/commit/db0138f3f72aea8cb68a5684a90123f733848f63), [`aa97231`](https://github.com/clerk/javascript/commit/aa97231962e3f472a46135e376159c6ddcf1157b), [`c792f37`](https://github.com/clerk/javascript/commit/c792f37129fd6475d5af95146e9ef0f1c8eff730), [`3bf08a9`](https://github.com/clerk/javascript/commit/3bf08a9e0a9e65496edac5fc3bb22ad7b561df26), [`74cf3b2`](https://github.com/clerk/javascript/commit/74cf3b28cdf622a942aaf99caabfba74b7e856fd), [`037b113`](https://github.com/clerk/javascript/commit/037b113aaedd53d4647d88f1659eb9c14cf6f275), [`c15a412`](https://github.com/clerk/javascript/commit/c15a412169058e2304a51c9e92ffaa7f6bb2a898), [`7726a03`](https://github.com/clerk/javascript/commit/7726a03a7fec4d292b6de2587b84ed4371984c23), [`ed10566`](https://github.com/clerk/javascript/commit/ed1056637624eec5bfd50333407c1e63e34c193b), [`b846a9a`](https://github.com/clerk/javascript/commit/b846a9ab96db6b1d8344a4b693051618865508a8), [`e66c800`](https://github.com/clerk/javascript/commit/e66c8002b82b2902f77e852e16482f5cfb062d2c), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed), [`9c41091`](https://github.com/clerk/javascript/commit/9c41091eb795bce8ffeeeca0264ae841fe07b426), [`29462b4`](https://github.com/clerk/javascript/commit/29462b433eb411ce614e4768e5844cacd00c1975), [`322c43f`](https://github.com/clerk/javascript/commit/322c43f6807a932c3cfaaef1b587b472c80180d2), [`17397f9`](https://github.com/clerk/javascript/commit/17397f95b715bd4fefd7f63c1d351abcf1c8ee16), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed)]:
  - @clerk/types@4.57.0
  - @clerk/shared@3.8.0

## 1.7.0

### Minor Changes

- Introducing `<experimental_PricingTable/>` ([#5769](https://github.com/clerk/javascript/pull/5769)) by [@octoper](https://github.com/octoper)

### Patch Changes

- Updated dependencies [[`9ec0a73`](https://github.com/clerk/javascript/commit/9ec0a7353e9f6ea661c3d7b9542423b6eb1d29e9), [`d9222fc`](https://github.com/clerk/javascript/commit/d9222fc3c21da2bcae30b06f0b1897f526935582)]:
  - @clerk/types@4.56.3
  - @clerk/shared@3.7.8

## 1.6.8

### Patch Changes

- Updated dependencies [[`225b9ca`](https://github.com/clerk/javascript/commit/225b9ca21aba44930872a85d6b112ee2a1b606b9)]:
  - @clerk/types@4.56.2
  - @clerk/shared@3.7.7

## 1.6.7

### Patch Changes

- Updated dependencies [[`387bf62`](https://github.com/clerk/javascript/commit/387bf623406306e0c5c08da937f4930a7ec5e4a5), [`2716622`](https://github.com/clerk/javascript/commit/27166224e12af582298460d438bd7f83ea8e04bf), [`294da82`](https://github.com/clerk/javascript/commit/294da82336e7a345900d7ef9b28f56a7c8864c52)]:
  - @clerk/types@4.56.1
  - @clerk/shared@3.7.6

## 1.6.6

### Patch Changes

- Updated dependencies [[`b02e766`](https://github.com/clerk/javascript/commit/b02e76627e47aec314573586451fa345a089115a), [`5d78b28`](https://github.com/clerk/javascript/commit/5d78b286b63e35fbcf44aac1f7657cbeaba4d659), [`d7f4438`](https://github.com/clerk/javascript/commit/d7f4438fa4bfd04474d5cdb9212ba908568ad6d2), [`5866855`](https://github.com/clerk/javascript/commit/58668550ec91d5511cf775972c54dc485185cc58), [`0007106`](https://github.com/clerk/javascript/commit/00071065998a3676c51e396b4c0afcbf930a9898), [`462b5b2`](https://github.com/clerk/javascript/commit/462b5b271d4e120d58a85818a358b60a6b3c8100), [`447d7a9`](https://github.com/clerk/javascript/commit/447d7a9e133c2a0e7db014bd5837e6ffff08f572), [`2beea29`](https://github.com/clerk/javascript/commit/2beea2957c67bc62446fe24d36332b0a4e850d7d), [`115601d`](https://github.com/clerk/javascript/commit/115601d12fd65dbf3011c0cda368525a2b95bfeb)]:
  - @clerk/types@4.56.0
  - @clerk/shared@3.7.5

## 1.6.5

### Patch Changes

- Updated dependencies [[`8b25035`](https://github.com/clerk/javascript/commit/8b25035aa49382fe1cd1c6f30ec80e86bcf9d66e)]:
  - @clerk/types@4.55.1
  - @clerk/shared@3.7.4

## 1.6.4

### Patch Changes

- Updated dependencies [[`33201bf`](https://github.com/clerk/javascript/commit/33201bf972d6a980617d47ebd776bef76f871833), [`4334598`](https://github.com/clerk/javascript/commit/4334598108ff2cfa3c25b5a46117c1c9c65b7974), [`0ae0403`](https://github.com/clerk/javascript/commit/0ae040303d239b75a3221436354a2c2ecdb85aae)]:
  - @clerk/types@4.55.0
  - @clerk/shared@3.7.3

## 1.6.3

### Patch Changes

- Updated dependencies [[`45486ac`](https://github.com/clerk/javascript/commit/45486acebf4d133efb09a3622a738cdbf4e51d66), [`837692a`](https://github.com/clerk/javascript/commit/837692aa40197b1574783ad36d0d017a771c08e1), [`0c00e59`](https://github.com/clerk/javascript/commit/0c00e59ff4714491650ac9480ae3b327c626d30d), [`6a5f644`](https://github.com/clerk/javascript/commit/6a5f6447a36a635d6201f8bb7619fb844ab21b79)]:
  - @clerk/types@4.54.2
  - @clerk/shared@3.7.2

## 1.6.2

### Patch Changes

- Improve JSDoc comments ([#5630](https://github.com/clerk/javascript/pull/5630)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`ab939fd`](https://github.com/clerk/javascript/commit/ab939fdb29150c376280b42f861a188a33f57dcc), [`03284da`](https://github.com/clerk/javascript/commit/03284da6a93a790ce3e3ebbd871c06e19f5a8803), [`7389ba3`](https://github.com/clerk/javascript/commit/7389ba3164ca0d848fb0a9de5d7e9716925fadcc), [`f6ef841`](https://github.com/clerk/javascript/commit/f6ef841125ff21ca8cae731d1f47f3a101d887e1), [`e634830`](https://github.com/clerk/javascript/commit/e6348301ab56a7868f24c1b9a4dd9e1d60f6027b), [`f8887b2`](https://github.com/clerk/javascript/commit/f8887b2cbd145e8e49bec890e8b6e02e34178d6a)]:
  - @clerk/types@4.54.1
  - @clerk/shared@3.7.1

## 1.6.1

### Patch Changes

- Improve JSDoc comments ([#5596](https://github.com/clerk/javascript/pull/5596)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`e4d04ae`](https://github.com/clerk/javascript/commit/e4d04aea490ab67e3431729398d3f4c46fc3e7e7), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`93068ea`](https://github.com/clerk/javascript/commit/93068ea9eb19d8c8b9c7ade35d0cd860e08049fc), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`103bc03`](https://github.com/clerk/javascript/commit/103bc03571c8845df205f4c6fd0c871c3368d1d0), [`48438b4`](https://github.com/clerk/javascript/commit/48438b409036088701bda7e1e732d6a51bee8cdc), [`196dcb4`](https://github.com/clerk/javascript/commit/196dcb47928bd22a3382197f8594a590f688faee)]:
  - @clerk/types@4.54.0
  - @clerk/shared@3.7.0

## 1.6.0

### Minor Changes

- Introduce `sessionClaims` to useAuth(). ([#5587](https://github.com/clerk/javascript/pull/5587)) by [@panteliselef](https://github.com/panteliselef)

  - thanks to [@ijxy](https://github.com/ijxy) for the [contribution](https://github.com/clerk/javascript/pull/4823)

### Patch Changes

- Updated dependencies [[`70c9db9`](https://github.com/clerk/javascript/commit/70c9db9f3b51ba034f76e0cc4cf338e7b406d9b1), [`554242e`](https://github.com/clerk/javascript/commit/554242e16e50c92a6afb6ed74c681b04b9f113b5), [`cc1f9a0`](https://github.com/clerk/javascript/commit/cc1f9a0adb7771b615b0f2994a5ac571b59889dd), [`8186cb5`](https://github.com/clerk/javascript/commit/8186cb564575ac3ce97079ec203865bf5deb05ee)]:
  - @clerk/shared@3.6.0
  - @clerk/types@4.53.0

## 1.5.2

### Patch Changes

- Updated dependencies [[`3ad3bc8`](https://github.com/clerk/javascript/commit/3ad3bc8380b354b0cd952eb58eb6c07650efa0f2), [`cfa94b8`](https://github.com/clerk/javascript/commit/cfa94b88476608edf8c2486e8ec0d3f3f82e0bfb), [`2033919`](https://github.com/clerk/javascript/commit/203391964857b98dae11944799d1e6328439e838), [`5f3cc46`](https://github.com/clerk/javascript/commit/5f3cc460b6b775b5a74746758b8cff11649a877a)]:
  - @clerk/shared@3.5.0
  - @clerk/types@4.52.0

## 1.5.1

### Patch Changes

- Updated dependencies [[`f6f275d`](https://github.com/clerk/javascript/commit/f6f275dac5ae83ac0c2016a85a6a0cee9513f224)]:
  - @clerk/types@4.51.1
  - @clerk/shared@3.4.1

## 1.5.0

### Minor Changes

- Update `useSession` to handle pending sessions as signed-out by default, with opt-out via `useSession({ treatPendingAsSignedOut: false })` or `app.use(clerkPlugin, { treatPendingAsSignedOut: false })` ([#5525](https://github.com/clerk/javascript/pull/5525)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Update `useAuth` to handle pending sessions as signed-out by default, with opt-out via `useAuth({ treatPendingAsSignedOut: false })` or `app.use(clerkPlugin, { treatPendingAsSignedOut: false })` ([#5507](https://github.com/clerk/javascript/pull/5507)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

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

## 1.4.6

### Patch Changes

- Updated dependencies [[`60a9a51`](https://github.com/clerk/javascript/commit/60a9a51dff7d59e7397536586cf1cfe029bc021b), [`e984494`](https://github.com/clerk/javascript/commit/e984494416dda9a6f04acaaba61f8c2683090961), [`ec4521b`](https://github.com/clerk/javascript/commit/ec4521b4fe56602f524a0c6d1b09d21aef5d8bd0), [`38828ae`](https://github.com/clerk/javascript/commit/38828ae58d6d4e8e3c60945284930179b2b6bb40), [`f30fa75`](https://github.com/clerk/javascript/commit/f30fa750754f19030f932a666d2bdbdf0d86743d), [`9c68678`](https://github.com/clerk/javascript/commit/9c68678e87047e6312b708b775ebfb23a3e22f8a), [`619cde8`](https://github.com/clerk/javascript/commit/619cde8c532d635d910ebbc08ad6abcc025694b4)]:
  - @clerk/shared@3.3.0
  - @clerk/types@4.50.2

## 1.4.5

### Patch Changes

- Updated dependencies [[`e20fb6b`](https://github.com/clerk/javascript/commit/e20fb6b397fb69c9d5af4e321267b82f12a5f127), [`77e6462`](https://github.com/clerk/javascript/commit/77e64628560cab688af214edb5922e67cd68a951)]:
  - @clerk/shared@3.2.3
  - @clerk/types@4.50.1

## 1.4.4

### Patch Changes

- Improved type-safety in Vue plugin installation. ([#5458](https://github.com/clerk/javascript/pull/5458)) by [@wobsoriano](https://github.com/wobsoriano)

- Derive session status from server-side state ([#5447](https://github.com/clerk/javascript/pull/5447)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`1da28a2`](https://github.com/clerk/javascript/commit/1da28a28bf602069b433c15b92df21f682779294), [`a9b618d`](https://github.com/clerk/javascript/commit/a9b618dfa97a0dacc462186c8b2588ad5ddb6902), [`f20dc15`](https://github.com/clerk/javascript/commit/f20dc159f542449e7f5b437b70d3eb3ba04d6975), [`4d9f1ee`](https://github.com/clerk/javascript/commit/4d9f1ee8c22fe1e4a166ff054d0af4d37b829f0a)]:
  - @clerk/types@4.50.0
  - @clerk/shared@3.2.2

## 1.4.3

### Patch Changes

- Updated dependencies [[`466ed13`](https://github.com/clerk/javascript/commit/466ed136af73b59b267d92ad3296039d1c3a4fcc)]:
  - @clerk/types@4.49.2
  - @clerk/shared@3.2.1

## 1.4.2

### Patch Changes

- Updated dependencies [[`892bc0e`](https://github.com/clerk/javascript/commit/892bc0eee9e0bb04d327eb84b44201fa34806483)]:
  - @clerk/shared@3.2.0

## 1.4.1

### Patch Changes

- Updated dependencies [[`3910ebe`](https://github.com/clerk/javascript/commit/3910ebea85817273f18fd2f3f142dd1c728e2220), [`e513333`](https://github.com/clerk/javascript/commit/e5133330a196c5c3742634cc9c3d3233ff488b0d)]:
  - @clerk/types@4.49.1
  - @clerk/shared@3.1.0

## 1.4.0

### Minor Changes

- Deprecate out of date jwt types in favour of existing that are up-to-date. ([#5354](https://github.com/clerk/javascript/pull/5354)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Bug fix: Update the initial value of `clientCtx` to `undefined` to correctly infer that `clerk` is defined.(https://github.com/clerk/javascript/pull/5324#discussion_r1989445357) ([#5324](https://github.com/clerk/javascript/pull/5324)) by [@Dorilama](https://github.com/Dorilama)

- Updated dependencies [[`725918d`](https://github.com/clerk/javascript/commit/725918df2e74cea15e9b748aaf103a52df8e8500), [`91d0f0b`](https://github.com/clerk/javascript/commit/91d0f0b0dccab7168ad4dc06c8629808938c235f), [`9572bf5`](https://github.com/clerk/javascript/commit/9572bf5bdfb7dc309ec8714989b98ab12174965b), [`39bbc51`](https://github.com/clerk/javascript/commit/39bbc5189a33dc6cebdc269ac2184dc4ffff2534), [`3dddcda`](https://github.com/clerk/javascript/commit/3dddcda191d8f8d6a9b02464f1f6374d3c6aacb9), [`7524943`](https://github.com/clerk/javascript/commit/7524943300d7e693d61cc1820b520abfadec1c64), [`150b5c8`](https://github.com/clerk/javascript/commit/150b5c89477abb0feab15e0a886179473f653cac), [`23c931e`](https://github.com/clerk/javascript/commit/23c931e9e95e6de992549ad499b477aca9a9c344), [`730262f`](https://github.com/clerk/javascript/commit/730262f0f973923c8749b09078c80c2fc966a8ec), [`0b18bb1`](https://github.com/clerk/javascript/commit/0b18bb1fe6fa3ded97547bb6b4d2c73030aad329), [`021bc5f`](https://github.com/clerk/javascript/commit/021bc5f40044d34e49956ce3c9b61d833d815b42), [`1a61390`](https://github.com/clerk/javascript/commit/1a61390d3482bd4af58508b972ad89dea56fa224)]:
  - @clerk/types@4.49.0
  - @clerk/shared@3.0.2

## 1.3.1

### Patch Changes

- Updated dependencies [[`75879672c5805bfba1caca906ac0729497744164`](https://github.com/clerk/javascript/commit/75879672c5805bfba1caca906ac0729497744164), [`7ec95a7e59033600958aca4b86f3bcd5da947dec`](https://github.com/clerk/javascript/commit/7ec95a7e59033600958aca4b86f3bcd5da947dec), [`3c225d90227141dc62d955e76c7f8e0202524bc7`](https://github.com/clerk/javascript/commit/3c225d90227141dc62d955e76c7f8e0202524bc7), [`2a66c16af08573000bb619607346ac420cd4ce56`](https://github.com/clerk/javascript/commit/2a66c16af08573000bb619607346ac420cd4ce56)]:
  - @clerk/shared@3.0.1
  - @clerk/types@4.48.0

## 1.3.0

### Minor Changes

- Introduce `updateClerkOptions()` utility function to update Clerk options on the fly. ([#5235](https://github.com/clerk/javascript/pull/5235)) by [@wobsoriano](https://github.com/wobsoriano)

  Usage:

  ```vue
  <script setup>
  import { updateClerkOptions } from '@clerk/vue';
  import { dark } from '@clerk/themes';
  import { frFR } from '@clerk/localizations';

  function enableDarkTheme() {
    updateClerkOptions({
      appearance: {
        baseTheme: dark,
      },
    });
  }

  function changeToFrench() {
    updateClerkOptions({
      localization: frFR,
    });
  }
  </script>

  <template>
    <button @click="enableDarkTheme">Enable Dark Theme</button>
    <button @click="changeToFrench">Change to French</button>
  </template>
  ```

- Surface new `pending` session as a signed-in state ([#5136](https://github.com/clerk/javascript/pull/5136)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- The [`exports` map](https://nodejs.org/api/packages.html#conditional-exports) inside `package.json` has been slightly adjusted to allow for [`require(esm)`](https://joyeecheung.github.io/blog/2024/03/18/require-esm-in-node-js/) to work correctly. The `"import"` conditions have been changed to `"default"`. ([#5188](https://github.com/clerk/javascript/pull/5188)) by [@LekoArts](https://github.com/LekoArts)

  You shouldn't see any change in behavior/functionality on your end.

- Updated dependencies [[`28179323d9891bd13625e32c5682a3276e73cdae`](https://github.com/clerk/javascript/commit/28179323d9891bd13625e32c5682a3276e73cdae), [`7ae77b74326e378bf161e29886ee82e1556d9840`](https://github.com/clerk/javascript/commit/7ae77b74326e378bf161e29886ee82e1556d9840), [`c5c246ce91c01db9f1eaccbd354f646bcd24ec0a`](https://github.com/clerk/javascript/commit/c5c246ce91c01db9f1eaccbd354f646bcd24ec0a), [`bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a`](https://github.com/clerk/javascript/commit/bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a), [`382c30240f563e58bc4d4832557c6825da40ce7f`](https://github.com/clerk/javascript/commit/382c30240f563e58bc4d4832557c6825da40ce7f)]:
  - @clerk/types@4.47.0
  - @clerk/shared@3.0.0

## 1.2.1

### Patch Changes

- Previously, the `getCurrentOrganizationMembership()` function was duplicated in both `@clerk/vue` and `@clerk/shared/react`. This change moves the function to `@clerk/shared/organization`. ([#5168](https://github.com/clerk/javascript/pull/5168)) by [@wobsoriano](https://github.com/wobsoriano)

- Re-export error handling utilities from `@clerk/shared` ([#5155](https://github.com/clerk/javascript/pull/5155)) by [@wobsoriano](https://github.com/wobsoriano)

  Example:

  ```vue
  <script setup lang="ts">
  import { useSignIn } from '@clerk/vue';
  import { isClerkAPIResponseError } from '@clerk/vue/errors';

  // ... form state refs and other setup ...
  const { signIn } = useSignIn();

  const handleSubmit = async () => {
    try {
      const signInAttempt = await signIn.value.create({
        identifier: email.value,
        password: password.value,
      });
      // ... handle successful sign in ...
    } catch (err) {
      // Type guard to safely handle Clerk API errors
      if (isClerkAPIResponseError(err)) {
        errors.value = err.errors; // err.errors is properly typed as ClerkAPIError[]
      }
    }
  };
  </script>

  <template>
    <!-- Form template here -->
  </template>
  ```

- Updated dependencies [[`d76c4699990b8477745c2584b1b98d5c92f9ace6`](https://github.com/clerk/javascript/commit/d76c4699990b8477745c2584b1b98d5c92f9ace6), [`a9b0087fca3f427f65907b358d9b5bc0c95921d8`](https://github.com/clerk/javascript/commit/a9b0087fca3f427f65907b358d9b5bc0c95921d8), [`92d17d7c087470b262fa5407cb6720fe6b17d333`](https://github.com/clerk/javascript/commit/92d17d7c087470b262fa5407cb6720fe6b17d333)]:
  - @clerk/shared@2.22.0
  - @clerk/types@4.46.1

## 1.2.0

### Minor Changes

- Add support for `<OrganizationProfile>` custom pages and links through `<OrganizationSwitcher>` ([#5129](https://github.com/clerk/javascript/pull/5129)) by [@wobsoriano](https://github.com/wobsoriano)

  Example:

  ```vue
  <script setup lang="ts">
  import { OrganizationSwitcher } from '@clerk/vue';
  import Icon from './Icon.vue';
  </script>

  <template>
    <header>
      <OrganizationSwitcher>
        <OrganizationSwitcher.OrganizationProfilePage
          label="Custom Page"
          url="custom"
        >
          <template #labelIcon>
            <Icon />
          </template>
          <div>
            <h1>Custom Organization Profile Page</h1>
            <p>This is the custom organization profile page</p>
          </div>
        </OrganizationSwitcher.OrganizationProfilePage>
        <OrganizationSwitcher.OrganizationProfileLink
          label="Homepage"
          url="/"
        >
          <template #labelIcon>
            <Icon />
          </template>
        </OrganizationSwitcher.OrganizationProfileLink>
      </OrganizationSwitcher>
    </header>
  </template>
  ```

### Patch Changes

- Add the ability to specify an appearance for modal component usages. ([#5125](https://github.com/clerk/javascript/pull/5125)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Adds ability to render custom `<UserProfile>` links inside `<UserButton>` component. ([#5128](https://github.com/clerk/javascript/pull/5128)) by [@wobsoriano](https://github.com/wobsoriano)

  Example:

  ```vue
  <script setup>
  import { UserButton } from '@clerk/vue';
  </script>

  <template>
    <UserButton>
      <UserButton.UserProfileLink
        label="Homepage"
        url="/"
      >
        <template #labelIcon>
          <div>Icon</div>
        </template>
      </UserButton.UserProfileLink>
    </UserButton>
  </template>
  ```

- Updated dependencies [[`dd2cbfe9f30358b6b298901bb52fa378b0acdca3`](https://github.com/clerk/javascript/commit/dd2cbfe9f30358b6b298901bb52fa378b0acdca3), [`570d8386f6aa596bf7bb1659bdddb8dd4d992b1d`](https://github.com/clerk/javascript/commit/570d8386f6aa596bf7bb1659bdddb8dd4d992b1d)]:
  - @clerk/types@4.46.0
  - @clerk/shared@2.21.1

## 1.1.11

### Patch Changes

- Remove `customPages` prop types from `<UserProfile />`, `<OrganizationProfile />` and `<UserButton />` to align with runtime behavior. ([#5101](https://github.com/clerk/javascript/pull/5101)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`f41081c563ddd2afc05b837358e0de087ae0c895`](https://github.com/clerk/javascript/commit/f41081c563ddd2afc05b837358e0de087ae0c895), [`767ac85fe6ce0ee0594c923e9af701bb05f40a0b`](https://github.com/clerk/javascript/commit/767ac85fe6ce0ee0594c923e9af701bb05f40a0b), [`225b38c7187d31fc755155ea99834ca03894d36b`](https://github.com/clerk/javascript/commit/225b38c7187d31fc755155ea99834ca03894d36b), [`429f1bfe5f7a554ab1fdf265475ba6c8b3f78472`](https://github.com/clerk/javascript/commit/429f1bfe5f7a554ab1fdf265475ba6c8b3f78472)]:
  - @clerk/shared@2.21.0
  - @clerk/types@4.45.1

## 1.1.10

### Patch Changes

- Updated dependencies [[`d3152be7f01fbb5ca26aeddc2437021f4b7ecc83`](https://github.com/clerk/javascript/commit/d3152be7f01fbb5ca26aeddc2437021f4b7ecc83), [`f976349243da2b75023e59e802460e6f3592ebbd`](https://github.com/clerk/javascript/commit/f976349243da2b75023e59e802460e6f3592ebbd)]:
  - @clerk/types@4.45.0
  - @clerk/shared@2.20.18

## 1.1.9

### Patch Changes

- Updated dependencies [[`26225f2c31a22560f7ece2e02f1d0080b5b89520`](https://github.com/clerk/javascript/commit/26225f2c31a22560f7ece2e02f1d0080b5b89520), [`833693a6792b621e72162d70673e7bdfa84a69b6`](https://github.com/clerk/javascript/commit/833693a6792b621e72162d70673e7bdfa84a69b6)]:
  - @clerk/shared@2.20.17
  - @clerk/types@4.44.3

## 1.1.8

### Patch Changes

- Improve runtime prop checking of all Vue Clerk components ([#5022](https://github.com/clerk/javascript/pull/5022)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`a309be354275b91a7b17d5a67e8ef6aa230a9935`](https://github.com/clerk/javascript/commit/a309be354275b91a7b17d5a67e8ef6aa230a9935), [`1345cb487970a7347351897e80dfb829d85c41ea`](https://github.com/clerk/javascript/commit/1345cb487970a7347351897e80dfb829d85c41ea)]:
  - @clerk/shared@2.20.16
  - @clerk/types@4.44.2

## 1.1.7

### Patch Changes

- Updated dependencies [[`57c983fdc2b8d883623a2294daae0ac6c02c48f6`](https://github.com/clerk/javascript/commit/57c983fdc2b8d883623a2294daae0ac6c02c48f6), [`a26cf0ff10c76244975c454fdf6c615475d4bcd5`](https://github.com/clerk/javascript/commit/a26cf0ff10c76244975c454fdf6c615475d4bcd5)]:
  - @clerk/types@4.44.1
  - @clerk/shared@2.20.15

## 1.1.6

### Patch Changes

- Updated dependencies [[`2179690c10a61b117e82fdd566b34939f4d28bc1`](https://github.com/clerk/javascript/commit/2179690c10a61b117e82fdd566b34939f4d28bc1), [`bdb537a9902c0f0ae58ca1d4b7590d929f28fedb`](https://github.com/clerk/javascript/commit/bdb537a9902c0f0ae58ca1d4b7590d929f28fedb)]:
  - @clerk/types@4.44.0
  - @clerk/shared@2.20.14

## 1.1.5

### Patch Changes

- Updated dependencies [[`f87ede848265d75ea1e880a3ab80c53a250f42cf`](https://github.com/clerk/javascript/commit/f87ede848265d75ea1e880a3ab80c53a250f42cf), [`6126cc98281bca96797fd8a55b6ec6aeda397e46`](https://github.com/clerk/javascript/commit/6126cc98281bca96797fd8a55b6ec6aeda397e46), [`6e096564a459db4eaf953e99e570905b10be6c84`](https://github.com/clerk/javascript/commit/6e096564a459db4eaf953e99e570905b10be6c84)]:
  - @clerk/shared@2.20.13
  - @clerk/types@4.43.0

## 1.1.4

### Patch Changes

- Updated dependencies [[`fe3e49f61acefe8d7f1992405f7cb415fea2e5c8`](https://github.com/clerk/javascript/commit/fe3e49f61acefe8d7f1992405f7cb415fea2e5c8), [`4427c4702f64d4f28f7564ce5889d41e260aa519`](https://github.com/clerk/javascript/commit/4427c4702f64d4f28f7564ce5889d41e260aa519)]:
  - @clerk/types@4.42.0
  - @clerk/shared@2.20.12

## 1.1.3

### Patch Changes

- Updated dependencies [[`418ec5c62c4eb600566faab07684c068a29007e3`](https://github.com/clerk/javascript/commit/418ec5c62c4eb600566faab07684c068a29007e3)]:
  - @clerk/types@4.41.2
  - @clerk/shared@2.20.11

## 1.1.2

### Patch Changes

- Updated dependencies [[`9eef7713212378351e8e01628611eaa18de250e8`](https://github.com/clerk/javascript/commit/9eef7713212378351e8e01628611eaa18de250e8)]:
  - @clerk/shared@2.20.10

## 1.1.1

### Patch Changes

- Updated dependencies [[`7ffc99b48977b9f6c74c0c71c500b60cb8aba65e`](https://github.com/clerk/javascript/commit/7ffc99b48977b9f6c74c0c71c500b60cb8aba65e)]:
  - @clerk/types@4.41.1
  - @clerk/shared@2.20.9

## 1.1.0

### Minor Changes

- Introduce sign-in-or-up flow. ([#4788](https://github.com/clerk/javascript/pull/4788)) by [@alexcarpenter](https://github.com/alexcarpenter)

### Patch Changes

- Improve runtime prop checking for single-file components ([#4902](https://github.com/clerk/javascript/pull/4902)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d`](https://github.com/clerk/javascript/commit/4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d), [`aa48b1f9e890b2402e9d05989a4820141076f7bf`](https://github.com/clerk/javascript/commit/aa48b1f9e890b2402e9d05989a4820141076f7bf), [`53bd34fff38b17498edf66cc4bc2d42d707f28dc`](https://github.com/clerk/javascript/commit/53bd34fff38b17498edf66cc4bc2d42d707f28dc)]:
  - @clerk/types@4.41.0
  - @clerk/shared@2.20.8

## 1.0.3

### Patch Changes

- Add quickstart links to Vue and Nuxt SDK READMEs ([#4883](https://github.com/clerk/javascript/pull/4883)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6`](https://github.com/clerk/javascript/commit/fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6)]:
  - @clerk/types@4.40.3
  - @clerk/shared@2.20.7

## 1.0.2

### Patch Changes

- Updated dependencies [[`44cab6038af0a4d23869b3b292ece742fbbc4d85`](https://github.com/clerk/javascript/commit/44cab6038af0a4d23869b3b292ece742fbbc4d85)]:
  - @clerk/types@4.40.2
  - @clerk/shared@2.20.6

## 1.0.1

### Patch Changes

- Fix an issue where `getToken()` from `useAuth()` composable returns an empty value ([#4837](https://github.com/clerk/javascript/pull/4837)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`80e1117631d35834705119a79cdcf9e0ed423fdd`](https://github.com/clerk/javascript/commit/80e1117631d35834705119a79cdcf9e0ed423fdd)]:
  - @clerk/types@4.40.1
  - @clerk/shared@2.20.5

## 1.0.0

### Major Changes

- Introduce the official Clerk SDK for Vue and Nuxt. ([#4791](https://github.com/clerk/javascript/pull/4791)) by [@wobsoriano](https://github.com/wobsoriano)

## 0.1.5

### Patch Changes

- Add `initialValues` option to `<SignInButton />` and `<SignUpButton />` components. ([#4801](https://github.com/clerk/javascript/pull/4801)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`c9da04636ffe1ba804a1ce5e5b79027d3a2344d2`](https://github.com/clerk/javascript/commit/c9da04636ffe1ba804a1ce5e5b79027d3a2344d2)]:
  - @clerk/types@4.40.0
  - @clerk/shared@2.20.4

## 0.1.4

### Patch Changes

- Updated dependencies [[`84ccb0049041534f111be65f7c7d4d6120069446`](https://github.com/clerk/javascript/commit/84ccb0049041534f111be65f7c7d4d6120069446)]:
  - @clerk/shared@2.20.3

## 0.1.3

### Patch Changes

- Fixed an issue when accessing Clerk properties inside composables before Clerk is available. ([#4779](https://github.com/clerk/javascript/pull/4779)) by [@wobsoriano](https://github.com/wobsoriano)

## 0.1.2

### Patch Changes

- Updated dependencies [[`aeafa7c5efd50c893d088ac99199d7eaecc04025`](https://github.com/clerk/javascript/commit/aeafa7c5efd50c893d088ac99199d7eaecc04025), [`acd9326ef2d6942b981b3ee59c4b20ddd303323d`](https://github.com/clerk/javascript/commit/acd9326ef2d6942b981b3ee59c4b20ddd303323d)]:
  - @clerk/types@4.39.4
  - @clerk/shared@2.20.2

## 0.1.1

### Patch Changes

- Updated dependencies [[`66ad299e4b6496ea4a93799de0f1ecfad920ddad`](https://github.com/clerk/javascript/commit/66ad299e4b6496ea4a93799de0f1ecfad920ddad), [`dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d`](https://github.com/clerk/javascript/commit/dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d), [`e1748582d0c89462f48a482a7805871b7065fa19`](https://github.com/clerk/javascript/commit/e1748582d0c89462f48a482a7805871b7065fa19), [`7f7edcaa8228c26d19e9081979100ada7e982095`](https://github.com/clerk/javascript/commit/7f7edcaa8228c26d19e9081979100ada7e982095), [`dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d`](https://github.com/clerk/javascript/commit/dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d)]:
  - @clerk/shared@2.20.1
  - @clerk/types@4.39.3

## 0.1.0

### Minor Changes

- Switching to use ^ for semver ranges of internal @clerk/ production dependencies. ([#4664](https://github.com/clerk/javascript/pull/4664)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Updated dependencies [[`ffa631d2480cfe77bf08c61b1302ace308e5b630`](https://github.com/clerk/javascript/commit/ffa631d2480cfe77bf08c61b1302ace308e5b630)]:
  - @clerk/shared@2.20.0

## 0.0.17

### Patch Changes

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/types@4.39.2
  - @clerk/shared@2.19.4

## 0.0.16

### Patch Changes

- Updated dependencies [[`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/types@4.39.1
  - @clerk/shared@2.19.3

## 0.0.15

### Patch Changes

- Updated dependencies [[`4cb22548da81dd8b186a6ef1cf120aea99c85c62`](https://github.com/clerk/javascript/commit/4cb22548da81dd8b186a6ef1cf120aea99c85c62)]:
  - @clerk/shared@2.19.2

## 0.0.14

### Patch Changes

- Updated dependencies [[`550c7e9851329688e37be29b83ea0c3b12482af7`](https://github.com/clerk/javascript/commit/550c7e9851329688e37be29b83ea0c3b12482af7), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99)]:
  - @clerk/types@4.39.0
  - @clerk/shared@2.19.1

## 0.0.13

### Patch Changes

- Updated dependencies [[`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3), [`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3)]:
  - @clerk/shared@2.19.0
  - @clerk/types@4.38.0

## 0.0.12

### Patch Changes

- Add support for custom pages and links ([#4708](https://github.com/clerk/javascript/pull/4708)) by [@wobsoriano](https://github.com/wobsoriano)

- Add support for custom menu items to `<UserButton />` ([#4693](https://github.com/clerk/javascript/pull/4693)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`4e5e7f463c12893a21cb3b5f9317fc3f2945879b`](https://github.com/clerk/javascript/commit/4e5e7f463c12893a21cb3b5f9317fc3f2945879b)]:
  - @clerk/types@4.37.0
  - @clerk/shared@2.18.1

## 0.0.11

### Patch Changes

- Updated dependencies [[`8ee5d84995fa17532491ff96efac5738c9bcd9ef`](https://github.com/clerk/javascript/commit/8ee5d84995fa17532491ff96efac5738c9bcd9ef), [`09fedd1df155d30cc055ce701b133aa6470e9b47`](https://github.com/clerk/javascript/commit/09fedd1df155d30cc055ce701b133aa6470e9b47), [`235eaae4c3c9400492fca47d20a47c7081041565`](https://github.com/clerk/javascript/commit/235eaae4c3c9400492fca47d20a47c7081041565)]:
  - @clerk/types@4.36.0
  - @clerk/shared@2.18.0

## 0.0.10

### Patch Changes

- Updated dependencies [[`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d)]:
  - @clerk/types@4.35.1
  - @clerk/shared@2.17.1

## 0.0.9

### Patch Changes

- Add deprecation notices for the following components: ([#4631](https://github.com/clerk/javascript/pull/4631)) by [@alexcarpenter](https://github.com/alexcarpenter)

  - `RedirectToUserProfile`
  - `RedirectToOrganizationProfile`
  - `RedirectToCreateOrganization`

## 0.0.8

### Patch Changes

- Updated dependencies [[`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`d84d7e31235c5c7da3415981dc76db4473a71a39`](https://github.com/clerk/javascript/commit/d84d7e31235c5c7da3415981dc76db4473a71a39), [`dce4f7ffca7248c0500f0ec9a978672b1f2fad69`](https://github.com/clerk/javascript/commit/dce4f7ffca7248c0500f0ec9a978672b1f2fad69)]:
  - @clerk/shared@2.17.0
  - @clerk/types@4.35.0

## 0.0.7

### Patch Changes

- Updated dependencies [[`c70994b5b6f92a6550dfe37547f01bbfa810c223`](https://github.com/clerk/javascript/commit/c70994b5b6f92a6550dfe37547f01bbfa810c223), [`7623a99594e7329200b6b374e483152d7679ce66`](https://github.com/clerk/javascript/commit/7623a99594e7329200b6b374e483152d7679ce66)]:
  - @clerk/types@4.34.2
  - @clerk/shared@2.16.1

## 0.0.6

### Patch Changes

- Share hook return types ([#4583](https://github.com/clerk/javascript/pull/4583)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`e47eb5882a7fd4a8dee25933c6644790d6ea3407`](https://github.com/clerk/javascript/commit/e47eb5882a7fd4a8dee25933c6644790d6ea3407), [`273d16cb0665d4d960838cb294dc356f41814745`](https://github.com/clerk/javascript/commit/273d16cb0665d4d960838cb294dc356f41814745), [`6b0961765e1f3d09679be4b163fa13ac7dd97191`](https://github.com/clerk/javascript/commit/6b0961765e1f3d09679be4b163fa13ac7dd97191)]:
  - @clerk/shared@2.16.0
  - @clerk/types@4.34.1

## 0.0.5

### Patch Changes

- Introduce an experimental version of Clerk SDK for [Nuxt](https://nuxt.com) ([#4541](https://github.com/clerk/javascript/pull/4541)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`536fa996ff84a545678a3036b28409824d1c00dd`](https://github.com/clerk/javascript/commit/536fa996ff84a545678a3036b28409824d1c00dd), [`b28c5e8bc44885bf6b1533df48e872ba90c387da`](https://github.com/clerk/javascript/commit/b28c5e8bc44885bf6b1533df48e872ba90c387da)]:
  - @clerk/shared@2.15.0

## 0.0.4

### Patch Changes

- Updated dependencies [[`46faeb6f59b19c963fb137c858347525b1cd9e19`](https://github.com/clerk/javascript/commit/46faeb6f59b19c963fb137c858347525b1cd9e19), [`ea6c52dd751abe38b350ee07f148652c24125e22`](https://github.com/clerk/javascript/commit/ea6c52dd751abe38b350ee07f148652c24125e22)]:
  - @clerk/shared@2.14.0
  - @clerk/types@4.34.0

## 0.0.3

### Patch Changes

- Updated dependencies [[`1c0b5001f7f975a2f3f54ad692526ecf7257847e`](https://github.com/clerk/javascript/commit/1c0b5001f7f975a2f3f54ad692526ecf7257847e), [`6217a3f7c94311d49f873214bd406961e0b8d6f7`](https://github.com/clerk/javascript/commit/6217a3f7c94311d49f873214bd406961e0b8d6f7), [`1783025cdb94c447028704c2121fa0b8af785904`](https://github.com/clerk/javascript/commit/1783025cdb94c447028704c2121fa0b8af785904)]:
  - @clerk/types@4.33.0
  - @clerk/shared@2.13.0

## 0.0.2

### Patch Changes

- Updated dependencies [[`7dbad4c5abd226d7b10941a626ead5d85b1a3f24`](https://github.com/clerk/javascript/commit/7dbad4c5abd226d7b10941a626ead5d85b1a3f24)]:
  - @clerk/types@4.32.0
  - @clerk/shared@2.12.1

## 0.0.1

### Patch Changes

- Introduce an experimental version of Clerk SDK for [Vue](https://vuejs.org) ([#4461](https://github.com/clerk/javascript/pull/4461)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`5a21de1f46df3642828dc27e4862263c9858da2b`](https://github.com/clerk/javascript/commit/5a21de1f46df3642828dc27e4862263c9858da2b), [`f7472e22877f62fc7f3c8d3efe409ff2276fb4a3`](https://github.com/clerk/javascript/commit/f7472e22877f62fc7f3c8d3efe409ff2276fb4a3), [`e199037b8f484abdeeb9fc24455a1b4b8c31c8dd`](https://github.com/clerk/javascript/commit/e199037b8f484abdeeb9fc24455a1b4b8c31c8dd), [`886e294a8d8c54b39cd5bda88d46b89eace3861e`](https://github.com/clerk/javascript/commit/886e294a8d8c54b39cd5bda88d46b89eace3861e), [`0e443ad7c76643420b50e5b169193e03f6ef79f9`](https://github.com/clerk/javascript/commit/0e443ad7c76643420b50e5b169193e03f6ef79f9), [`cc24c8145f1eea7fb91550f2c3e0bac3993e4320`](https://github.com/clerk/javascript/commit/cc24c8145f1eea7fb91550f2c3e0bac3993e4320)]:
  - @clerk/shared@2.12.0
  - @clerk/types@4.31.0
