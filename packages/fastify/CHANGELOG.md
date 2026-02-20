# Change Log

## 2.7.0

### Minor Changes

- Add `/types` subpath export to re-export types from `@clerk/shared/types` along with SDK-specific types. This allows importing Clerk types directly from the SDK package (e.g., `import type { UserResource } from '@clerk/react/types'`) without needing to install `@clerk/types` as a separate dependency. ([#7644](https://github.com/clerk/javascript/pull/7644)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

### Patch Changes

- Updated dependencies [[`0a9cce3`](https://github.com/clerk/javascript/commit/0a9cce375046a7ff5944a7f2a140e787fe66996c), [`e35960f`](https://github.com/clerk/javascript/commit/e35960f5e44ab758d0ab0545691f44dbafd5e7cb), [`c9f0d77`](https://github.com/clerk/javascript/commit/c9f0d777f59673bfe614e1a8502cefe5445ce06f), [`1bd1747`](https://github.com/clerk/javascript/commit/1bd174781b83d3712a07e7dfe1acf73742497349), [`6a2ff9e`](https://github.com/clerk/javascript/commit/6a2ff9e957145124bc3d00bf10f566b613c7c60f), [`d2cee35`](https://github.com/clerk/javascript/commit/d2cee35d73d69130ad8c94650286d3b43dda55e6), [`0a9cce3`](https://github.com/clerk/javascript/commit/0a9cce375046a7ff5944a7f2a140e787fe66996c), [`8c47111`](https://github.com/clerk/javascript/commit/8c4711153552d50c67611fea668f82f7c8fb7f9c), [`00882e8`](https://github.com/clerk/javascript/commit/00882e8993d9aa49feb1106bfe68164b72ba29d9), [`a374c18`](https://github.com/clerk/javascript/commit/a374c18e31793b0872fe193ab7808747749bc56b), [`3abe9ed`](https://github.com/clerk/javascript/commit/3abe9ed4c44166cb95f61e92f7742abb0c6df82a), [`af85739`](https://github.com/clerk/javascript/commit/af85739195f5f4b353ba4395a547bbc8a8b26483), [`10b5bea`](https://github.com/clerk/javascript/commit/10b5bea85c3bb588c59f13628f32a82934f5de5a), [`a05d130`](https://github.com/clerk/javascript/commit/a05d130451226d2c512c9ea1e9a9f1e4cb2e3ba2), [`b193f79`](https://github.com/clerk/javascript/commit/b193f79ee86eb8ce788db4b747d1c64a1c7c6ac5), [`e9d2f2f`](https://github.com/clerk/javascript/commit/e9d2f2fd1ea027f7936353dfcdc905bcb01c3ad7), [`6e90b7f`](https://github.com/clerk/javascript/commit/6e90b7f8033dabac68e594894b30a49596a32625), [`43fc7b7`](https://github.com/clerk/javascript/commit/43fc7b7b40cf7c42cfb0aa8b2e2058243a3f38f5), [`c5ca7f7`](https://github.com/clerk/javascript/commit/c5ca7f7612247b3031c0349c0ddb3c9cab653b66), [`0f1011a`](https://github.com/clerk/javascript/commit/0f1011a062c3705fc1a69593672b96ad03936de1), [`38def4f`](https://github.com/clerk/javascript/commit/38def4fedc99b6be03c88a3737b8bd5940e5bff3), [`7772f45`](https://github.com/clerk/javascript/commit/7772f45ee601787373cf3c9a24eddf3f76c26bee), [`a3e689f`](https://github.com/clerk/javascript/commit/a3e689f3b7f2f3799a263da4b7bb14c0e49e42b7), [`583f7a9`](https://github.com/clerk/javascript/commit/583f7a9a689310f4bdd2c66f5258261f08e47109), [`965e7f1`](https://github.com/clerk/javascript/commit/965e7f1b635cf25ebfe129ec338e05137d1aba9e), [`84483c2`](https://github.com/clerk/javascript/commit/84483c2a710cef9165f9cd016ebccff13b004c78), [`2b76081`](https://github.com/clerk/javascript/commit/2b7608145611c10443a999cae4373a1acfd7cab7), [`f284c3d`](https://github.com/clerk/javascript/commit/f284c3d1d122b725594d0a287d0fb838f6d191f5), [`ac34168`](https://github.com/clerk/javascript/commit/ac3416849954780bd873ed3fe20a173a8aee89aa), [`cf0d0dc`](https://github.com/clerk/javascript/commit/cf0d0dc7f6380d6e0c4e552090345b7943c22b35), [`0aff70e`](https://github.com/clerk/javascript/commit/0aff70eab5353a8a6ea171e6b69d3b600acdd45e), [`690280e`](https://github.com/clerk/javascript/commit/690280e91b0809d8e0fd1e161dd753dc62801244), [`b971d0b`](https://github.com/clerk/javascript/commit/b971d0bb3eed3a6d3d187b4a296bc6e56271014e), [`22d1689`](https://github.com/clerk/javascript/commit/22d1689cb4b789fe48134b08a4e3dc5921ac0e1b), [`e9a1d4d`](https://github.com/clerk/javascript/commit/e9a1d4dcac8a61595739f83a5b9b2bc18a35f59d), [`c088dde`](https://github.com/clerk/javascript/commit/c088dde13004dc16dd37c17572a52efda69843c9), [`8902e21`](https://github.com/clerk/javascript/commit/8902e216bab83fe85a491bdbc2ac8129e83e5a73), [`972f6a0`](https://github.com/clerk/javascript/commit/972f6a015d720c4867aa24b4503db3968187e523), [`a1aaff3`](https://github.com/clerk/javascript/commit/a1aaff33700ed81f31a9f340cf6cb3a82efeef85), [`d85646a`](https://github.com/clerk/javascript/commit/d85646a0b9efc893e2548dc55dbf08954117e8c2), [`ab3dd16`](https://github.com/clerk/javascript/commit/ab3dd160608318363b42f5f46730ed32ee12335b), [`fd195c1`](https://github.com/clerk/javascript/commit/fd195c14086cba7087c74af472d2558d04fe3afd), [`8887fac`](https://github.com/clerk/javascript/commit/8887fac93fccffac7d1612cf5fb773ae614ceb22), [`0b4b481`](https://github.com/clerk/javascript/commit/0b4b4811c99f3261deea9e7bd2215e51ad32d4bf), [`5f88dbb`](https://github.com/clerk/javascript/commit/5f88dbb84620e15d9bdaa5f2e78dc3e975104204), [`8b95393`](https://github.com/clerk/javascript/commit/8b953930536b12bd8ade6ba5c2092f40770ea8df), [`fd195c1`](https://github.com/clerk/javascript/commit/fd195c14086cba7087c74af472d2558d04fe3afd), [`fd69edb`](https://github.com/clerk/javascript/commit/fd69edbcfe2dfca71d1e6d41af9647701dba2823), [`8d91225`](https://github.com/clerk/javascript/commit/8d91225acc67349fd0d35f982dedb0618f3179e9), [`1fc95e2`](https://github.com/clerk/javascript/commit/1fc95e2a0a5a99314b1bb4d59d3f3e3f03accb3d), [`3dac245`](https://github.com/clerk/javascript/commit/3dac245456dae1522ee2546fc9cc29454f1f345f), [`a4c3b47`](https://github.com/clerk/javascript/commit/a4c3b477dad70dd55fe58f433415b7cc9618a225), [`65a236a`](https://github.com/clerk/javascript/commit/65a236aed8b2c4e2f3da266431586c7cfc2aad72), [`7c3c002`](https://github.com/clerk/javascript/commit/7c3c002d6d81305124f934f41025799f4f03103e), [`d8bbc66`](https://github.com/clerk/javascript/commit/d8bbc66d47b476b3405c03e1b0632144afdd716b), [`222202e`](https://github.com/clerk/javascript/commit/222202e6ee5d2bc3ea587bda2bcc8b879a01eed5), [`3983cf8`](https://github.com/clerk/javascript/commit/3983cf85d657c247d46f94403cb121f13f6f01e4), [`f1f1d09`](https://github.com/clerk/javascript/commit/f1f1d09e675cf9005348d2380df0da3f293047a6), [`92599c7`](https://github.com/clerk/javascript/commit/92599c7096cbb3a630cc4ea4ca91dea7b9e3c7c0), [`736314f`](https://github.com/clerk/javascript/commit/736314f8641be005ddeacfccae9135a1b153d6f6), [`2cc7dbb`](https://github.com/clerk/javascript/commit/2cc7dbbb212f92e2889460086b50eb644b8ba69d), [`86d2199`](https://github.com/clerk/javascript/commit/86d219970cdc21d5160f0c8adf2c30fc34f1c7b9), [`da415c8`](https://github.com/clerk/javascript/commit/da415c813332998dafd4ec4690a6731a98ded65f), [`97c9ab3`](https://github.com/clerk/javascript/commit/97c9ab3c2130dbe4500c3feb83232d1ccbbd910e), [`cc63aab`](https://github.com/clerk/javascript/commit/cc63aab479853f0e15947837eff5a4f46c71c9f2), [`6fb0c85`](https://github.com/clerk/javascript/commit/6fb0c85baf813df5b457fa616465ef74eac1dd86), [`a7a38ab`](https://github.com/clerk/javascript/commit/a7a38ab76c66d3f147b8b1169c1ce86ceb0d9384), [`cfa70ce`](https://github.com/clerk/javascript/commit/cfa70ce766b687b781ba984ee3d72ac1081b0c97), [`26254f0`](https://github.com/clerk/javascript/commit/26254f0463312115eca4bc0a396c5acd0703187b), [`c97e6af`](https://github.com/clerk/javascript/commit/c97e6af1d6974270843ce91ce17b0c36ee828aa0), [`5b24266`](https://github.com/clerk/javascript/commit/5b24266bab99b8d4873050d72a59da4884f5619e), [`d98727e`](https://github.com/clerk/javascript/commit/d98727e30b191087abb817acfc29cfccdb3a7047), [`79e2622`](https://github.com/clerk/javascript/commit/79e2622c18917709a351a122846def44c7e22f0c), [`12b3070`](https://github.com/clerk/javascript/commit/12b3070f3f102256f19e6af6acffb05b66d42e0b)]:
  - @clerk/shared@4.0.0
  - @clerk/backend@3.0.0

## 2.6.22

### Patch Changes

- Updated dependencies [[`35bcbd1`](https://github.com/clerk/javascript/commit/35bcbd11f5753ee396cd090d3dd1848f3f2727e0), [`5740640`](https://github.com/clerk/javascript/commit/57406404d516cf0fa8d3bb9b38a0d3d1d69dc88d), [`03c61c1`](https://github.com/clerk/javascript/commit/03c61c122cc1eb2cf35ecdc20586f2fbb0a1e7db)]:
  - @clerk/shared@3.45.0
  - @clerk/backend@2.31.0
  - @clerk/types@4.101.15

## 2.6.21

### Patch Changes

- Updated dependencies [[`a726252`](https://github.com/clerk/javascript/commit/a726252610ea0cbef2d971ec3ce8d0d4be3a3468)]:
  - @clerk/backend@2.30.1

## 2.6.20

### Patch Changes

- Updated dependencies [[`7917ff4`](https://github.com/clerk/javascript/commit/7917ff4214fc9e1001e2698c7241bbfa4b68e5af), [`b0d28c1`](https://github.com/clerk/javascript/commit/b0d28c14815a6136c67a719efb1dc5496ffb5c82)]:
  - @clerk/backend@2.30.0

## 2.6.19

### Patch Changes

- Updated dependencies [[`559cd84`](https://github.com/clerk/javascript/commit/559cd84a320a1d808fb38c404f31437046198123)]:
  - @clerk/backend@2.29.7

## 2.6.18

### Patch Changes

- Updated dependencies [[`64a35f7`](https://github.com/clerk/javascript/commit/64a35f79e9a49dfc140b4c8a8df517b74d46d6c6)]:
  - @clerk/shared@3.44.0
  - @clerk/backend@2.29.6
  - @clerk/types@4.101.14

## 2.6.17

### Patch Changes

- Updated dependencies [[`b7a4e1e`](https://github.com/clerk/javascript/commit/b7a4e1eabe7aa61e7d2cb7f27cbd22671c49f2b1)]:
  - @clerk/shared@3.43.2
  - @clerk/backend@2.29.5
  - @clerk/types@4.101.13

## 2.6.16

### Patch Changes

- Updated dependencies [[`e995cc3`](https://github.com/clerk/javascript/commit/e995cc3572f85aa47bdee8f7b56130a383488a7f)]:
  - @clerk/shared@3.43.1
  - @clerk/backend@2.29.4
  - @clerk/types@4.101.12

## 2.6.15

### Patch Changes

- Updated dependencies [[`c3ff1f8`](https://github.com/clerk/javascript/commit/c3ff1f899098e235ff8651f9e31e2055fc43ba8e), [`271ddeb`](https://github.com/clerk/javascript/commit/271ddeb0b47357f7da316eef389ae46b180c36da)]:
  - @clerk/backend@2.29.3
  - @clerk/shared@3.43.0
  - @clerk/types@4.101.11

## 2.6.14

### Patch Changes

- Updated dependencies [[`6b26afc`](https://github.com/clerk/javascript/commit/6b26afcc784f6e8344cf6ff0b1ef69c14019fe66)]:
  - @clerk/backend@2.29.2

## 2.6.13

### Patch Changes

- Updated dependencies [[`9320c4f`](https://github.com/clerk/javascript/commit/9320c4f9dde7d9a4732cdb3a9ca71e8a720a8dea), [`a4e6932`](https://github.com/clerk/javascript/commit/a4e693262f734bfd3ab08ffac019168c874c2bd8)]:
  - @clerk/backend@2.29.1
  - @clerk/shared@3.42.0
  - @clerk/types@4.101.10

## 2.6.12

### Patch Changes

- Updated dependencies [[`ede3e2a`](https://github.com/clerk/javascript/commit/ede3e2a326c9cbbd4ab09375f4bb291483681892), [`03dd374`](https://github.com/clerk/javascript/commit/03dd37458eedf59198dc3574e12030b217efcb41)]:
  - @clerk/backend@2.29.0
  - @clerk/shared@3.41.1
  - @clerk/types@4.101.9

## 2.6.11

### Patch Changes

- Updated dependencies [[`79eb5af`](https://github.com/clerk/javascript/commit/79eb5afd91d7b002faafd2980850d944acb37917), [`5d25027`](https://github.com/clerk/javascript/commit/5d250277ea389695e82ec9471f1eadadf7cbc4c3), [`b3b02b4`](https://github.com/clerk/javascript/commit/b3b02b46dfa6d194ed12d2e6b9e332796ee73c4a), [`7b3024a`](https://github.com/clerk/javascript/commit/7b3024a71e6e45e926d83f1a9e887216e7c14424), [`2cd4da9`](https://github.com/clerk/javascript/commit/2cd4da9c72bc7385c0c7c71e2a7ca856d79ce630), [`d4e2739`](https://github.com/clerk/javascript/commit/d4e2739422bdeea44f240c9d7637f564dce5320f)]:
  - @clerk/shared@3.41.0
  - @clerk/backend@2.28.0
  - @clerk/types@4.101.8

## 2.6.10

### Patch Changes

- Updated dependencies [[`375a32d`](https://github.com/clerk/javascript/commit/375a32d0f44933605ffb513ff28f522ac5e851d6), [`175883b`](https://github.com/clerk/javascript/commit/175883b05228138c9ff55d0871cc1041bd68d7fe), [`43d3c3e`](https://github.com/clerk/javascript/commit/43d3c3eaff767054ef74fd3655e632caffeaaf33), [`f626046`](https://github.com/clerk/javascript/commit/f626046c589956022b1e1ac70382c986822f4733), [`14342d2`](https://github.com/clerk/javascript/commit/14342d2b34fe0882f7676195aefaaa17f034af70)]:
  - @clerk/shared@3.40.0
  - @clerk/backend@2.27.1
  - @clerk/types@4.101.7

## 2.6.9

### Patch Changes

- Updated dependencies [[`e448757`](https://github.com/clerk/javascript/commit/e448757cd3d24a509a3a312e3a376c235fba32a1)]:
  - @clerk/backend@2.27.0

## 2.6.8

### Patch Changes

- Updated dependencies [[`b117ebc`](https://github.com/clerk/javascript/commit/b117ebc956e1a5d48d5fdb7210de3344a74a524a), [`6dbb02b`](https://github.com/clerk/javascript/commit/6dbb02b13d7099a2ff756c1b4d1a0fca23f4a7c6)]:
  - @clerk/shared@3.39.0
  - @clerk/backend@2.26.0
  - @clerk/types@4.101.6

## 2.6.7

### Patch Changes

- Updated dependencies [[`e31f3d5`](https://github.com/clerk/javascript/commit/e31f3d567302f99d8d073ba75cd934fb3c1eca7f), [`b41c0d5`](https://github.com/clerk/javascript/commit/b41c0d539835a5a43d15e3399bac7cbf046d9345), [`8376789`](https://github.com/clerk/javascript/commit/8376789de2383b52fabc563a9382622627055ecd), [`f917d68`](https://github.com/clerk/javascript/commit/f917d68fc2fc5d317770491e9d4d7185e1985d04), [`818c25a`](https://github.com/clerk/javascript/commit/818c25a9eec256245152725c64419c73e762c1a2), [`b41c0d5`](https://github.com/clerk/javascript/commit/b41c0d539835a5a43d15e3399bac7cbf046d9345)]:
  - @clerk/shared@3.38.0
  - @clerk/backend@2.25.1
  - @clerk/types@4.101.5

## 2.6.6

### Patch Changes

- Updated dependencies [[`40a841d`](https://github.com/clerk/javascript/commit/40a841d56cd8983dce21376c832f1085c43a9518), [`f364924`](https://github.com/clerk/javascript/commit/f364924708f20f0bc7b8b291ea2ae01ce09e2e9f), [`f115e56`](https://github.com/clerk/javascript/commit/f115e56d14b5c49f52b6aca01b434dbe4f6193cf), [`d4aef71`](https://github.com/clerk/javascript/commit/d4aef71961d6d0abf8f1d1142c4e3ae943181c4b), [`3f99742`](https://github.com/clerk/javascript/commit/3f997427e400248502b0977e1b69e109574dfe7d), [`02798f5`](https://github.com/clerk/javascript/commit/02798f571065d8142cf1dade57b42b3e8ce0f818), [`07a30ce`](https://github.com/clerk/javascript/commit/07a30ce52b7d2ba85ce3533879700b9ec129152e), [`d7c336d`](https://github.com/clerk/javascript/commit/d7c336d98b95b56446940c6b7e394933df832403), [`ce8b914`](https://github.com/clerk/javascript/commit/ce8b9149bff27866cdb686f1ab0b56cef8d8c697), [`d4aef71`](https://github.com/clerk/javascript/commit/d4aef71961d6d0abf8f1d1142c4e3ae943181c4b), [`a3e14b1`](https://github.com/clerk/javascript/commit/a3e14b176ade8c39b382873051eebfde42fc029e)]:
  - @clerk/shared@3.37.0
  - @clerk/backend@2.25.0
  - @clerk/types@4.101.4

## 2.6.5

### Patch Changes

- Updated dependencies [[`f85abda`](https://github.com/clerk/javascript/commit/f85abdac03fde4a5109f31931c55b56a365aa748), [`36e43cc`](https://github.com/clerk/javascript/commit/36e43cc614865e52eefbd609a9491c32371cda44), [`337430b`](https://github.com/clerk/javascript/commit/337430bc44ba846e40bff66d72618963d51ee20d)]:
  - @clerk/shared@3.36.0
  - @clerk/backend@2.24.0
  - @clerk/types@4.101.3

## 2.6.4

### Patch Changes

- Updated dependencies [[`d8f59a6`](https://github.com/clerk/javascript/commit/d8f59a66d56d8fb0dfea353ecd86af97d0ec56b7)]:
  - @clerk/shared@3.35.2
  - @clerk/backend@2.23.2
  - @clerk/types@4.101.2

## 2.6.3

### Patch Changes

- Updated dependencies [[`a9c13ca`](https://github.com/clerk/javascript/commit/a9c13cae5a6f46ca753d530878f7e4492ca7938b)]:
  - @clerk/shared@3.35.1
  - @clerk/backend@2.23.1
  - @clerk/types@4.101.1

## 2.6.2

### Patch Changes

- Updated dependencies [[`7be8f45`](https://github.com/clerk/javascript/commit/7be8f458367b2c050b0dc8c0481d7bbe090ea400), [`bdbb0d9`](https://github.com/clerk/javascript/commit/bdbb0d91712a84fc214c534fc47b62b1a2028ac9), [`aa184a4`](https://github.com/clerk/javascript/commit/aa184a46a91f9dec3fd275ec5867a8366d310469), [`1d4e7a7`](https://github.com/clerk/javascript/commit/1d4e7a7769e9efaaa945e4ba6468ad47bd24c807), [`50e630a`](https://github.com/clerk/javascript/commit/50e630a6359e8c8cc7ae0e7fe8d99451ab7344ee), [`42f0d95`](https://github.com/clerk/javascript/commit/42f0d95e943d82960de3f7e5da17d199eff9fddd), [`c63cc8e`](https://github.com/clerk/javascript/commit/c63cc8e9c38ed0521a22ebab43e10111f04f9daf), [`d32d724`](https://github.com/clerk/javascript/commit/d32d724c34a921a176eca159273f270c2af4e787), [`00291bc`](https://github.com/clerk/javascript/commit/00291bc8ae03c06f7154bd937628e8193f6e3ce9)]:
  - @clerk/shared@3.35.0
  - @clerk/backend@2.23.0
  - @clerk/types@4.101.0

## 2.6.1

### Patch Changes

- Updated dependencies [[`b5a7e2f`](https://github.com/clerk/javascript/commit/b5a7e2f8af5514e19e06918632d982be65f4a854), [`a1d10fc`](https://github.com/clerk/javascript/commit/a1d10fc6e231f27ec7eabd0db45b8f7e8c98250e), [`b944ff3`](https://github.com/clerk/javascript/commit/b944ff30494a8275450ca0d5129cdf58f02bea81), [`4011c5e`](https://github.com/clerk/javascript/commit/4011c5e0014ede5e480074b73d064a1bc2a577dd)]:
  - @clerk/types@4.100.0
  - @clerk/shared@3.34.0
  - @clerk/backend@2.22.0

## 2.6.0

### Minor Changes

- Update the supported API version to `2025-11-10`. ([#7095](https://github.com/clerk/javascript/pull/7095)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`613cb97`](https://github.com/clerk/javascript/commit/613cb97cb7b3b33c3865cfe008ef9b1ea624cc8d)]:
  - @clerk/shared@3.33.0
  - @clerk/backend@2.21.0
  - @clerk/types@4.99.0

## 2.5.4

### Patch Changes

- Updated dependencies [[`cc11472`](https://github.com/clerk/javascript/commit/cc11472e7318b806ee43d609cd03fb0446f56146), [`539fad7`](https://github.com/clerk/javascript/commit/539fad7b80ed284a7add6cf8c4c45cf4c6a0a8b2), [`296fb0b`](https://github.com/clerk/javascript/commit/296fb0b8f34aca4f527508a5e6a6bbaad89cfdaa), [`c413433`](https://github.com/clerk/javascript/commit/c413433fee49701f252df574ce6a009d256c0cb9), [`a940c39`](https://github.com/clerk/javascript/commit/a940c39354bd0ee48d2fc9b0f3217ec20b2f32b4)]:
  - @clerk/shared@3.32.0
  - @clerk/types@4.98.0
  - @clerk/backend@2.20.1

## 2.5.3

### Patch Changes

- Updated dependencies [[`a474c59`](https://github.com/clerk/javascript/commit/a474c59e3017358186de15c5b1e5b83002e72527), [`b505755`](https://github.com/clerk/javascript/commit/b505755a8da834186922e2a5db8c82e530434d18), [`5536429`](https://github.com/clerk/javascript/commit/55364291e245ff05ca1e50e614e502d2081b87fb)]:
  - @clerk/shared@3.31.1
  - @clerk/backend@2.20.0
  - @clerk/types@4.97.2

## 2.5.2

### Patch Changes

- Updated dependencies [[`85b5acc`](https://github.com/clerk/javascript/commit/85b5acc5ba192a8247f072fa93d5bc7d42986293), [`ea65d39`](https://github.com/clerk/javascript/commit/ea65d390cd6d3b0fdd35202492e858f8c8370f73), [`b09b29e`](https://github.com/clerk/javascript/commit/b09b29e82323c8fc508c49ffe10c77a737ef0bec)]:
  - @clerk/types@4.97.1
  - @clerk/shared@3.31.0
  - @clerk/backend@2.19.3

## 2.5.1

### Patch Changes

- Updated dependencies [[`3e0ef92`](https://github.com/clerk/javascript/commit/3e0ef9281194714f56dcf656d0caf4f75dcf097c), [`2587aa6`](https://github.com/clerk/javascript/commit/2587aa671dac1ca66711889bf1cd1c2e2ac8d7c8)]:
  - @clerk/shared@3.30.0
  - @clerk/types@4.97.0
  - @clerk/backend@2.19.2

## 2.5.0

### Minor Changes

- Disable minification for static import compatibility ([#7043](https://github.com/clerk/javascript/pull/7043)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Updated dependencies [[`791ff19`](https://github.com/clerk/javascript/commit/791ff19a55ecb39eac20e1533a7d578a30386388), [`439427e`](https://github.com/clerk/javascript/commit/439427e44adef4f43e5f0719adf5654ea58c33e7), [`7dfbf3a`](https://github.com/clerk/javascript/commit/7dfbf3aa1b5269aee2d3af628b02027be9767088), [`d33b7b5`](https://github.com/clerk/javascript/commit/d33b7b5538e9bcbbca1ac23c46793d0cddcef533), [`f2644c2`](https://github.com/clerk/javascript/commit/f2644c2e7ed32012275e8379153e53672475f29f)]:
  - @clerk/shared@3.29.0
  - @clerk/types@4.96.0
  - @clerk/backend@2.19.1

## 2.4.42

### Patch Changes

- Updated dependencies [[`4d46e4e`](https://github.com/clerk/javascript/commit/4d46e4e601a5f2a213f1718af3f9271db4db0911), [`a42a015`](https://github.com/clerk/javascript/commit/a42a0157d3142dca32713f7749ffce7b4e7bb3ac), [`8ebbf1e`](https://github.com/clerk/javascript/commit/8ebbf1e6e31251b7d0c3bb5d54249572adc96b7e)]:
  - @clerk/types@4.95.1
  - @clerk/backend@2.19.0
  - @clerk/shared@3.28.3

## 2.4.41

### Patch Changes

- Updated dependencies [[`a172d51`](https://github.com/clerk/javascript/commit/a172d51df2d7f2e450c983a15ae897624304a764), [`947d0f5`](https://github.com/clerk/javascript/commit/947d0f5480b0151a392966cad2e1a45423f66035)]:
  - @clerk/types@4.95.0
  - @clerk/shared@3.28.2
  - @clerk/backend@2.18.3

## 2.4.40

### Patch Changes

- Updated dependencies [[`d8147fb`](https://github.com/clerk/javascript/commit/d8147fb58bfd6caf9a4f0a36fdc48c630d00387f)]:
  - @clerk/shared@3.28.1
  - @clerk/backend@2.18.2

## 2.4.39

### Patch Changes

- Updated dependencies [[`305f4ee`](https://github.com/clerk/javascript/commit/305f4eeb825086d55d1b0df198a0c43da8d94993), [`53214f9`](https://github.com/clerk/javascript/commit/53214f9a600074affc84d616bbbe7a6b625e7d33), [`1441e68`](https://github.com/clerk/javascript/commit/1441e6851102e9eed5697ad78c695f75b4a20db2), [`1236c74`](https://github.com/clerk/javascript/commit/1236c745fd58020e0972938ca0a9ae697a24af02), [`29201b2`](https://github.com/clerk/javascript/commit/29201b24847b6cdb35a96cb971fa1de958b0410a)]:
  - @clerk/backend@2.18.1
  - @clerk/shared@3.28.0
  - @clerk/types@4.94.0

## 2.4.38

### Patch Changes

- Added internal helper type for `auth` and `getAuth()` functions that don't require a request or context parameter ([#6910](https://github.com/clerk/javascript/pull/6910)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`65b7cc7`](https://github.com/clerk/javascript/commit/65b7cc787a5f02a302b665b6eaf4d4b9a1cae4b0), [`20c2e29`](https://github.com/clerk/javascript/commit/20c2e291fe32f6038ab9e95aec268e3d98c449f1), [`6e09786`](https://github.com/clerk/javascript/commit/6e09786adeb0f481ca8b6d060ae8754b556a3f9a), [`aa7210c`](https://github.com/clerk/javascript/commit/aa7210c7fff34f6c6e2d4ca3cb736bbd35439cb6), [`2cd53cd`](https://github.com/clerk/javascript/commit/2cd53cd8c713dfa7f2e802fe08986411587095fa), [`56a81aa`](https://github.com/clerk/javascript/commit/56a81aaa59e95ee25f8eb49bee78975ee377e1c7), [`1a2eee6`](https://github.com/clerk/javascript/commit/1a2eee6b8b6ead2d0481e93104fcaed6452bd1b9), [`22b8e49`](https://github.com/clerk/javascript/commit/22b8e49f9fb65d55ab737d11f1f57a25bf947511), [`2cd53cd`](https://github.com/clerk/javascript/commit/2cd53cd8c713dfa7f2e802fe08986411587095fa), [`348021d`](https://github.com/clerk/javascript/commit/348021d837ba66fd3f510148213f374ae2e969a8), [`1a2430a`](https://github.com/clerk/javascript/commit/1a2430a166fb1df5fbca76437c63423b18a49ced), [`31a04fc`](https://github.com/clerk/javascript/commit/31a04fc2b783f01cd4848c1e681af3b30e57bb2f), [`9766c4a`](https://github.com/clerk/javascript/commit/9766c4afd26f2841d6f79dbdec2584ef8becd22f), [`fe873dc`](https://github.com/clerk/javascript/commit/fe873dc94c2614e8cc670e3add13e170bcf85338), [`22b8e49`](https://github.com/clerk/javascript/commit/22b8e49f9fb65d55ab737d11f1f57a25bf947511), [`a66357e`](https://github.com/clerk/javascript/commit/a66357e8a5928199aebde408ec7cfaac152c2c42), [`dacc1af`](https://github.com/clerk/javascript/commit/dacc1af22e1d1af0940b2d626b8a47d376c19342)]:
  - @clerk/types@4.93.0
  - @clerk/backend@2.18.0
  - @clerk/shared@3.27.4

## 2.4.37

### Patch Changes

- Updated dependencies [[`fba4781`](https://github.com/clerk/javascript/commit/fba4781ff2a2d16f8934029fa6fb77d70953f2be), [`a1f6714`](https://github.com/clerk/javascript/commit/a1f671480cda6f978db059ba0640d4ed8b08f112)]:
  - @clerk/types@4.92.0
  - @clerk/backend@2.17.2
  - @clerk/shared@3.27.3

## 2.4.36

### Patch Changes

- Updated dependencies [[`04cba7d`](https://github.com/clerk/javascript/commit/04cba7d34f91dc28f9c957bba8231c6942f657e3), [`f737d26`](https://github.com/clerk/javascript/commit/f737d268aa167889a4f3f7aba2658c2ba1fd909a), [`8777f35`](https://github.com/clerk/javascript/commit/8777f350f5fb51413609a53d9de05b2e5d1d7cfe), [`2c0128b`](https://github.com/clerk/javascript/commit/2c0128b05ecf48748f27f10f0b0215a279ba6cc1)]:
  - @clerk/backend@2.17.1
  - @clerk/types@4.91.0
  - @clerk/shared@3.27.2

## 2.4.35

### Patch Changes

- Updated dependencies [[`ea2bc26`](https://github.com/clerk/javascript/commit/ea2bc260fadac8fd7480cd476046f5a06c0d917d), [`37028ca`](https://github.com/clerk/javascript/commit/37028caad59cb0081ac74e70a44e4a419082a999)]:
  - @clerk/backend@2.17.0
  - @clerk/types@4.90.0
  - @clerk/shared@3.27.1

## 2.4.34

### Patch Changes

- Updated dependencies [[`e3e77eb`](https://github.com/clerk/javascript/commit/e3e77eb277c6b36847265db7b863c418e3708ab6), [`9cf89cd`](https://github.com/clerk/javascript/commit/9cf89cd3402c278e8d5bfcd8277cee292bc45333), [`090ca74`](https://github.com/clerk/javascript/commit/090ca742c590bc4f369cf3e1ca2ec9917410ffe4), [`b8fbadd`](https://github.com/clerk/javascript/commit/b8fbadd95652b08ecea23fdbc7e352e3e7297b2d), [`5546352`](https://github.com/clerk/javascript/commit/55463527df9a710ef3215c353bab1ef423d1de62)]:
  - @clerk/backend@2.16.0
  - @clerk/shared@3.27.0
  - @clerk/types@4.89.0

## 2.4.33

### Patch Changes

- Updated dependencies [[`8d1514a`](https://github.com/clerk/javascript/commit/8d1514a99743ec64d2a05de7f01dd9081e02bd0d), [`a8ba926`](https://github.com/clerk/javascript/commit/a8ba926109704e31b097f3545e61910abc76d99a), [`41e0a41`](https://github.com/clerk/javascript/commit/41e0a4190b33dd2c4bdc0d536bbe83fcf99af9b0), [`1aa9e9f`](https://github.com/clerk/javascript/commit/1aa9e9f10c051319e9ff4b1a0ecd71507bd6a6aa), [`1ad3b92`](https://github.com/clerk/javascript/commit/1ad3b92019361bc3350e429a840aa0dd4d0be089), [`a88ee58`](https://github.com/clerk/javascript/commit/a88ee5827adee0cc8a62246d03a3034d8566fe21), [`d6c7bbb`](https://github.com/clerk/javascript/commit/d6c7bbba23f38c0b3ca7edebb53028a05c7b38e6)]:
  - @clerk/backend@2.15.0
  - @clerk/shared@3.26.1
  - @clerk/types@4.88.0

## 2.4.32

### Patch Changes

- Updated dependencies [[`bcf24f2`](https://github.com/clerk/javascript/commit/bcf24f2f91913fa0dd3fbf02b3bbef345c4e1ea9), [`0006c82`](https://github.com/clerk/javascript/commit/0006c82fb023f4fc39e49350b5440940dcf6deba), [`7c976b4`](https://github.com/clerk/javascript/commit/7c976b4da2dc621e872846097723291dab09476f), [`1ceedad`](https://github.com/clerk/javascript/commit/1ceedad4bc5bc3d5f01c95185f82ff0f43983cf5), [`de90ede`](https://github.com/clerk/javascript/commit/de90ede82664b58bef9e294498384cf2c99a331e), [`9d4a95c`](https://github.com/clerk/javascript/commit/9d4a95c766396a0bc327fbf0560228bedb4828eb), [`428cd57`](https://github.com/clerk/javascript/commit/428cd57a8581a58a6a42325ec50eb98000068e97)]:
  - @clerk/types@4.87.0
  - @clerk/backend@2.14.1
  - @clerk/shared@3.26.0

## 2.4.31

### Patch Changes

- Updated dependencies [[`b598581`](https://github.com/clerk/javascript/commit/b598581ae673ca42fac713ee9e1a0f04b56cb8de), [`19f18f8`](https://github.com/clerk/javascript/commit/19f18f818d7c69eb2ecd27b727c403e9b00f4401), [`23948dc`](https://github.com/clerk/javascript/commit/23948dc777ec6a17bafbae59c253a93143b0e105), [`7382e13`](https://github.com/clerk/javascript/commit/7382e1384a67a2648e077d9ce677eb5424987322), [`24d0742`](https://github.com/clerk/javascript/commit/24d0742ec8453ab7ca01e81e7b4b15eed014ab81), [`82b84fe`](https://github.com/clerk/javascript/commit/82b84fed5f207673071ba7354a17f4a76e101201), [`54b4b5a`](https://github.com/clerk/javascript/commit/54b4b5a5f811f612fadf5c47ffda94a750c57a5e), [`50a8622`](https://github.com/clerk/javascript/commit/50a8622c3579306f15e5d40e5ea72b4fe4384ef7), [`939df73`](https://github.com/clerk/javascript/commit/939df73f393eefcf930481ee6f5c7f913e2e26b3), [`23948dc`](https://github.com/clerk/javascript/commit/23948dc777ec6a17bafbae59c253a93143b0e105)]:
  - @clerk/backend@2.14.0
  - @clerk/types@4.86.0
  - @clerk/shared@3.25.0

## 2.4.30

### Patch Changes

- Updated dependencies [[`55490c3`](https://github.com/clerk/javascript/commit/55490c31fadc82bdca6cd5f2b22e5e158aaba0cb), [`e8d21de`](https://github.com/clerk/javascript/commit/e8d21de39b591973dad48fc1d1851c4d28b162fe), [`63fa204`](https://github.com/clerk/javascript/commit/63fa2042b821096d4f962832ff3c10ad1b7ddf0e), [`637f2e8`](https://github.com/clerk/javascript/commit/637f2e8768b76aaf756062b6b5b44bf651f66789)]:
  - @clerk/types@4.85.0
  - @clerk/backend@2.13.0
  - @clerk/shared@3.24.2

## 2.4.29

### Patch Changes

- Updated dependencies [[`fced4fc`](https://github.com/clerk/javascript/commit/fced4fc869bb21c77826dfaf281b6640e0f0c006), [`e6e19d2`](https://github.com/clerk/javascript/commit/e6e19d2d2f3b2c4617b25f53830216a1d550e616), [`1b1e8b1`](https://github.com/clerk/javascript/commit/1b1e8b1fd33b787f956b17b193e5fd0a4cdc6cec)]:
  - @clerk/types@4.84.1
  - @clerk/shared@3.24.1
  - @clerk/backend@2.12.1

## 2.4.28

### Patch Changes

- Updated dependencies [[`c1049f0`](https://github.com/clerk/javascript/commit/c1049f0956b9821a1a177c4be64c748122b0f084), [`5e94f0a`](https://github.com/clerk/javascript/commit/5e94f0a87cfcfb6407b916bd72f15a2d7dcc2406)]:
  - @clerk/backend@2.12.0

## 2.4.27

### Patch Changes

- Updated dependencies [[`2a82737`](https://github.com/clerk/javascript/commit/2a8273705b9764e1a4613d5a0dbb738d0b156c05), [`cda5d7b`](https://github.com/clerk/javascript/commit/cda5d7b79b28dc03ec794ea54e0feb64b148cdd2), [`ba25a5b`](https://github.com/clerk/javascript/commit/ba25a5b5a3fa686a65f52e221d9d1712a389fea9), [`a50cfc8`](https://github.com/clerk/javascript/commit/a50cfc8f1dd168b436499e32fc8b0fc41d28bbff), [`377f67b`](https://github.com/clerk/javascript/commit/377f67b8e552d1a19efbe4530e9306675b7f8eab), [`65b12ee`](https://github.com/clerk/javascript/commit/65b12eeeb57ee80cdd8c36c5949d51f1227a413e), [`263722e`](https://github.com/clerk/javascript/commit/263722e61fd27403b4c8d9794880686771e123f9), [`c19f936`](https://github.com/clerk/javascript/commit/c19f93603d6c52c5f62fe4a36fe53845424fd0ad)]:
  - @clerk/types@4.84.0
  - @clerk/shared@3.24.0
  - @clerk/backend@2.11.0

## 2.4.26

### Patch Changes

- Updated dependencies [[`600c648`](https://github.com/clerk/javascript/commit/600c648d4087a823341041c90018797fbc0033f0)]:
  - @clerk/shared@3.23.0
  - @clerk/types@4.83.0
  - @clerk/backend@2.10.1

## 2.4.25

### Patch Changes

- Updated dependencies [[`f49ec31`](https://github.com/clerk/javascript/commit/f49ec3167df8e85344963c1f952d9b886946f127), [`d52714e`](https://github.com/clerk/javascript/commit/d52714e4cb7f369c74826cd4341c58eb1900abe4), [`822e4a1`](https://github.com/clerk/javascript/commit/822e4a19c1ad29309cf6bf91ca1fbbac4464a62b), [`ce49740`](https://github.com/clerk/javascript/commit/ce49740d474d6dd9da5096982ea4e9f14cf68f09), [`ba7f3fd`](https://github.com/clerk/javascript/commit/ba7f3fd71a0a925dfe0fb3b30648df666714d6b8), [`9036427`](https://github.com/clerk/javascript/commit/903642793ae205c5e5d9e9d22ff3e95665641871), [`2ed539c`](https://github.com/clerk/javascript/commit/2ed539cc7f08ed4d70c33621563ad386ea8becc5), [`deaafe4`](https://github.com/clerk/javascript/commit/deaafe449773632d690aa2f8cafaf959392622b9), [`a26ecae`](https://github.com/clerk/javascript/commit/a26ecae09fd06cd34f094262f038a8eefbb23f7d), [`c16a7a5`](https://github.com/clerk/javascript/commit/c16a7a5837fc15e0e044baf9c809b8da6fbac795), [`05b6d65`](https://github.com/clerk/javascript/commit/05b6d65c0bc5736443325a5defee4c263ef196af), [`453cf86`](https://github.com/clerk/javascript/commit/453cf86381c5df6684b37b003984a6fafc443fb4)]:
  - @clerk/backend@2.10.0
  - @clerk/types@4.82.0
  - @clerk/shared@3.22.1

## 2.4.24

### Patch Changes

- Updated dependencies [[`e52bf8e`](https://github.com/clerk/javascript/commit/e52bf8ebef74a9e123c69b69acde1340c01d32d7), [`c043c19`](https://github.com/clerk/javascript/commit/c043c1919854aaa5b9cf7f6df5bb517f5617f7a1), [`7bb644a`](https://github.com/clerk/javascript/commit/7bb644ad8a7bf28c6010aad6ae0c36f587529fcc), [`c28d29c`](https://github.com/clerk/javascript/commit/c28d29c79bb4f144d782313ca72df7db91a77340), [`172e054`](https://github.com/clerk/javascript/commit/172e054a3511be12d16ba19037db320c2d9838bf)]:
  - @clerk/types@4.81.0
  - @clerk/backend@2.9.4
  - @clerk/shared@3.22.0

## 2.4.23

### Patch Changes

- Updated dependencies [[`8dc6bad`](https://github.com/clerk/javascript/commit/8dc6bad5c7051b59bd8c73e65d497f6a974bb1c3), [`aa6a3c3`](https://github.com/clerk/javascript/commit/aa6a3c3d3ba2de67a468c996cbf0bff43a09ddb8), [`db50c47`](https://github.com/clerk/javascript/commit/db50c4734920ada6002de8c62c994047eb6cb5a0)]:
  - @clerk/types@4.80.0
  - @clerk/backend@2.9.3
  - @clerk/shared@3.21.2

## 2.4.22

### Patch Changes

- Updated dependencies [[`413468c`](https://github.com/clerk/javascript/commit/413468c9b9c8fb7576f8e4cbdccff98784e33fef), [`7b7eb1f`](https://github.com/clerk/javascript/commit/7b7eb1fc0235249c5c179239078294118f2947cd)]:
  - @clerk/shared@3.21.1
  - @clerk/types@4.79.0
  - @clerk/backend@2.9.2

## 2.4.21

### Patch Changes

- Updated dependencies [[`5b24129`](https://github.com/clerk/javascript/commit/5b24129ddcfc2f7dc6eb79d8c818b4ff97c68e9a)]:
  - @clerk/shared@3.21.0
  - @clerk/types@4.78.0
  - @clerk/backend@2.9.1

## 2.4.20

### Patch Changes

- Updated dependencies [[`4db1e58`](https://github.com/clerk/javascript/commit/4db1e58d70b60e1e236709b507666715d571e925), [`d400782`](https://github.com/clerk/javascript/commit/d400782b7016c1232c0aa1e3399c61b61e4f0709), [`69498df`](https://github.com/clerk/javascript/commit/69498dfca3e6bb388eb8c94313eac06347dd5a27), [`307dc3f`](https://github.com/clerk/javascript/commit/307dc3f05ba1bd3b30b491b198d9e65eebcc95f9), [`2db7431`](https://github.com/clerk/javascript/commit/2db743147827fb69fb8fe73a1e26545aeb7be7aa), [`59f1559`](https://github.com/clerk/javascript/commit/59f15593bab708b9e13eebfff6780c2d52b31b0a)]:
  - @clerk/types@4.77.0
  - @clerk/backend@2.9.0
  - @clerk/shared@3.20.1

## 2.4.19

### Patch Changes

- Updated dependencies [[`15fe106`](https://github.com/clerk/javascript/commit/15fe1060f730a6a4391f3d2451d23edd3218e1ae), [`df63e76`](https://github.com/clerk/javascript/commit/df63e76f2382c601d9a3b52a3a6dfaba26c4f36f), [`173837c`](https://github.com/clerk/javascript/commit/173837c2526aa826b7981ee8d6d4f52c00675da5), [`8b52d7a`](https://github.com/clerk/javascript/commit/8b52d7ae19407e8ab5a5451bd7d34b6bc38417de), [`854dde8`](https://github.com/clerk/javascript/commit/854dde88e642c47b5a29ac8f576c8c1976e5d067), [`ae2e2d6`](https://github.com/clerk/javascript/commit/ae2e2d6b336be6b596cc855e549843beb5bfd2a1), [`037f25a`](https://github.com/clerk/javascript/commit/037f25a8171888168913b186b7edf871e0aaf197), [`f8b38b7`](https://github.com/clerk/javascript/commit/f8b38b7059e498fef3ac1271346be0710aa31c76)]:
  - @clerk/types@4.76.0
  - @clerk/backend@2.8.0
  - @clerk/shared@3.20.0

## 2.4.18

### Patch Changes

- Updated dependencies [[`b72a3dd`](https://github.com/clerk/javascript/commit/b72a3dda2467720e5dc8cab3e7e6a110f3beb79b), [`d93b0ed`](https://github.com/clerk/javascript/commit/d93b0edf4adc57d48a26cb08444192887ccec659), [`6459f7d`](https://github.com/clerk/javascript/commit/6459f7dabe5f163f48ed73106bb901d8187da3e2), [`0ff648a`](https://github.com/clerk/javascript/commit/0ff648aeac0e2f5481596a98c8046d9d58a7bf75), [`9084759`](https://github.com/clerk/javascript/commit/90847593300be605e1ee1c06dac147ce68b25dc7)]:
  - @clerk/types@4.75.0
  - @clerk/shared@3.19.0
  - @clerk/backend@2.7.1

## 2.4.17

### Patch Changes

- Add ability to define a machine secret key to Clerk BAPI client function ([#6479](https://github.com/clerk/javascript/pull/6479)) by [@wobsoriano](https://github.com/wobsoriano)

  ```ts
  const clerkClient = createClerkClient({ machineSecretKey: 'ak_xxxxx' })

  clerkClient.m2mTokens.create({...})
  ```

- Updated dependencies [[`1ad16da`](https://github.com/clerk/javascript/commit/1ad16daa49795a861ae277001831230580b6b9f4), [`4edef81`](https://github.com/clerk/javascript/commit/4edef81dd423a0471e3f579dd6b36094aa8546aa), [`6ff416f`](https://github.com/clerk/javascript/commit/6ff416f4b35fc01ba7dca61abe4698d7d1460dee), [`e82f177`](https://github.com/clerk/javascript/commit/e82f1775de889eb9cac444cb26b69fb5de1e2d05), [`696f8e1`](https://github.com/clerk/javascript/commit/696f8e11a3e5391e6b5a97d98e929b8973575b9a), [`f318d22`](https://github.com/clerk/javascript/commit/f318d22cf83caaef272bcf532561a03ca72575e7), [`0d27281`](https://github.com/clerk/javascript/commit/0d272815b216f7a7538b5633cb397d6cd2695b73), [`1cc66ab`](https://github.com/clerk/javascript/commit/1cc66aba1c0adac24323876e4cc3d96be888b07b)]:
  - @clerk/types@4.74.0
  - @clerk/backend@2.7.0
  - @clerk/shared@3.18.1

## 2.4.16

### Patch Changes

- Updated dependencies [[`9368daf`](https://github.com/clerk/javascript/commit/9368dafb119b5a8ec6a9d6d82270e72bab6d8f1e), [`f93965f`](https://github.com/clerk/javascript/commit/f93965f64c81030f9fcf9d1cc4e4984d30cd12ec), [`7b6dcee`](https://github.com/clerk/javascript/commit/7b6dceea5bfd7f1cc1bf24126aa715307e24ae7f), [`ef87617`](https://github.com/clerk/javascript/commit/ef87617ae1fd125c806a33bfcfdf09c885319fa8)]:
  - @clerk/shared@3.18.0
  - @clerk/types@4.73.0
  - @clerk/backend@2.6.3

## 2.4.15

### Patch Changes

- Updated dependencies [[`7a46679`](https://github.com/clerk/javascript/commit/7a46679a004739a7f712097c5779e9f5c068722e), [`05cc5ec`](https://github.com/clerk/javascript/commit/05cc5ecd82ecdbcc9922d3286224737a81813be0), [`22c35ef`](https://github.com/clerk/javascript/commit/22c35efb59226df2efaa2891fa4775c13312f4c6), [`8c7e5bb`](https://github.com/clerk/javascript/commit/8c7e5bb887e95e38a186a18609dd6fc93b6a3cda), [`e8d816a`](https://github.com/clerk/javascript/commit/e8d816a3350e862c3e9e1d4f8c96c047a0a016a2), [`aa9f185`](https://github.com/clerk/javascript/commit/aa9f185e21b58f8a6e03ea44ce29ee09ad2477d9), [`af0e123`](https://github.com/clerk/javascript/commit/af0e12393c9412281626e20dafb1b3a15558f6d9), [`3d1d871`](https://github.com/clerk/javascript/commit/3d1d8711405646cf3c2aabe99e08337a1028703a)]:
  - @clerk/shared@3.17.0
  - @clerk/types@4.72.0
  - @clerk/backend@2.6.2

## 2.4.14

### Patch Changes

- Updated dependencies [[`e404456`](https://github.com/clerk/javascript/commit/e4044566bca81f63c8e9c630fdec0f498ad6fc08), [`2803133`](https://github.com/clerk/javascript/commit/28031330a9810946feb44b93be10c067fb3b63ba), [`f1d9d34`](https://github.com/clerk/javascript/commit/f1d9d3482a796dd5f7796ede14159850e022cba2), [`0bdd0df`](https://github.com/clerk/javascript/commit/0bdd0dfdae49e2548081e68767addf9065b2b8f9), [`d58b959`](https://github.com/clerk/javascript/commit/d58b9594cf65158e87dbaa90d632c45f543373e1), [`232d7d3`](https://github.com/clerk/javascript/commit/232d7d37cd1bc2a4e106f1972dc395373502168d), [`822ba1f`](https://github.com/clerk/javascript/commit/822ba1fd5e7daf665120cf183e4600a227098d53), [`af615b8`](https://github.com/clerk/javascript/commit/af615b89838e46bd441d41da6a6dde29e3edf595), [`d4d2612`](https://github.com/clerk/javascript/commit/d4d2612483baf356c389ef0ba5084059025481f2)]:
  - @clerk/types@4.71.0
  - @clerk/shared@3.16.0
  - @clerk/backend@2.6.1

## 2.4.13

### Patch Changes

- Updated dependencies [[`2bbeaf3`](https://github.com/clerk/javascript/commit/2bbeaf30faa0f961b766c87c17e424ba9ecc4517), [`b0fdc9e`](https://github.com/clerk/javascript/commit/b0fdc9eaf764ca0c17cbe0810b7d240f6d9db0b6)]:
  - @clerk/backend@2.6.0
  - @clerk/types@4.70.1
  - @clerk/shared@3.15.1

## 2.4.12

### Patch Changes

- Updated dependencies [[`cd59c0e`](https://github.com/clerk/javascript/commit/cd59c0e5512a341dd8fb420aca583333c8243aa5), [`cd59c0e`](https://github.com/clerk/javascript/commit/cd59c0e5512a341dd8fb420aca583333c8243aa5)]:
  - @clerk/types@4.70.0
  - @clerk/shared@3.15.0
  - @clerk/backend@2.5.2

## 2.4.11

### Patch Changes

- Updated dependencies [[`fecc99d`](https://github.com/clerk/javascript/commit/fecc99d43cb7db5b99863829acb234cbce0da264), [`959d63d`](https://github.com/clerk/javascript/commit/959d63de27e5bfe27b46699b441dfd4e48616bf8), [`10e1060`](https://github.com/clerk/javascript/commit/10e10605b18a58f33a93caed058159c190678e74), [`92c44dd`](https://github.com/clerk/javascript/commit/92c44dd9d51e771a928a8da7004bdb8f8bdbaf58), [`a04a8f5`](https://github.com/clerk/javascript/commit/a04a8f5f81241ee41d93cd64793beca9d6296abb), [`c61855c`](https://github.com/clerk/javascript/commit/c61855c51d9c129d48c4543da3719939ad82f623), [`43ea069`](https://github.com/clerk/javascript/commit/43ea069c570dc64503fc82356ad28a2e43689d45)]:
  - @clerk/types@4.69.0
  - @clerk/shared@3.14.0
  - @clerk/backend@2.5.1

## 2.4.10

### Patch Changes

- Updated dependencies [[`d2f6f9e`](https://github.com/clerk/javascript/commit/d2f6f9e02036a4288916fcce14f24be5d56561c4), [`a329836`](https://github.com/clerk/javascript/commit/a329836a6c64f0a551a277ccae07043456a70523), [`5fbf8df`](https://github.com/clerk/javascript/commit/5fbf8df84b6d47082a76047451274790b8579b2d), [`6041c39`](https://github.com/clerk/javascript/commit/6041c39a31e787a6065dbc3f21e1c569982a06de), [`3f1270d`](https://github.com/clerk/javascript/commit/3f1270db86a21ead0ed6f0bd4f9986485203e973), [`1d9c409`](https://github.com/clerk/javascript/commit/1d9c409d10cc88667e354664d66c5f74b8bf4ca7), [`df49349`](https://github.com/clerk/javascript/commit/df4934983ee60246cd9df217afd7384aad556387)]:
  - @clerk/types@4.68.0
  - @clerk/shared@3.13.0
  - @clerk/backend@2.5.0

## 2.4.9

### Patch Changes

- Updated dependencies [[`2a90b68`](https://github.com/clerk/javascript/commit/2a90b689550ae960496c9292ca23e0225e3425cd), [`af50905`](https://github.com/clerk/javascript/commit/af50905ea497ed3286c8c4c374498e06ca6ee82b)]:
  - @clerk/types@4.67.0
  - @clerk/shared@3.12.3
  - @clerk/backend@2.4.5

## 2.4.8

### Patch Changes

- Updated dependencies [[`8ee859c`](https://github.com/clerk/javascript/commit/8ee859ce00d1d5747c14a80fe7166303e64a4f1f)]:
  - @clerk/shared@3.12.2
  - @clerk/types@4.66.1
  - @clerk/backend@2.4.4

## 2.4.7

### Patch Changes

- Updated dependencies [[`025e304`](https://github.com/clerk/javascript/commit/025e304c4d6402dfd750ee51ac9c8fc2dea1f353), [`dedf487`](https://github.com/clerk/javascript/commit/dedf48703986d547d5b28155b0182a51030cffeb), [`b96114e`](https://github.com/clerk/javascript/commit/b96114e438638896ba536bb7a17b09cdadcd9407)]:
  - @clerk/types@4.66.0
  - @clerk/backend@2.4.3
  - @clerk/shared@3.12.1

## 2.4.6

### Patch Changes

- Updated dependencies [[`2be6a53`](https://github.com/clerk/javascript/commit/2be6a53959cb8a3127c2eb5d1aeb4248872d2c24), [`f6a1c35`](https://github.com/clerk/javascript/commit/f6a1c35bd5fb4bd2a3cd45bdaf9defe6be59d4a9), [`6826d0b`](https://github.com/clerk/javascript/commit/6826d0bbd03e844d49224565878a4326684f06b4), [`f6a1c35`](https://github.com/clerk/javascript/commit/f6a1c35bd5fb4bd2a3cd45bdaf9defe6be59d4a9), [`8fdb209`](https://github.com/clerk/javascript/commit/8fdb20913b0b0f88244099f6c6a7b979e0f79327), [`97a07f7`](https://github.com/clerk/javascript/commit/97a07f78b4b0c3dc701a2610097ec7d6232f79e7), [`e3da9f4`](https://github.com/clerk/javascript/commit/e3da9f4a17a2a5f71d7e02a81b86d6002c93cc59)]:
  - @clerk/types@4.65.0
  - @clerk/shared@3.12.0
  - @clerk/backend@2.4.2

## 2.4.5

### Patch Changes

- Updated dependencies [[`f42c4fe`](https://github.com/clerk/javascript/commit/f42c4fedfdab873129b876eba38b3677f190b460), [`ec207dc`](https://github.com/clerk/javascript/commit/ec207dcd2a13340cfa4e3b80d3d52d1b4e7d5f23), [`ec207dc`](https://github.com/clerk/javascript/commit/ec207dcd2a13340cfa4e3b80d3d52d1b4e7d5f23), [`0e0cc1f`](https://github.com/clerk/javascript/commit/0e0cc1fa85347d727a4fd3718fe45b0f0244ddd9)]:
  - @clerk/types@4.64.0
  - @clerk/shared@3.11.0
  - @clerk/backend@2.4.1

## 2.4.4

### Patch Changes

- Updated dependencies [[`c2f24da`](https://github.com/clerk/javascript/commit/c2f24dab96c052b2748a210eef45540f788654aa), [`abd8446`](https://github.com/clerk/javascript/commit/abd844609dad263d974da7fbf5e3575afce73abe), [`8387a39`](https://github.com/clerk/javascript/commit/8387a392a04906f0f10d84c61cfee36f23942f85), [`feba23c`](https://github.com/clerk/javascript/commit/feba23c85d1ff94930de61f3b6961e2ebb2f65ce), [`f2a6641`](https://github.com/clerk/javascript/commit/f2a66419b1813abc86ea98fde7475861995a1486), [`de9c01a`](https://github.com/clerk/javascript/commit/de9c01ac683f52c1919e1584faba087f92a0ca22), [`a8638b0`](https://github.com/clerk/javascript/commit/a8638b02f0daff780f3aef038983714db21db558), [`3b4b3cb`](https://github.com/clerk/javascript/commit/3b4b3cb941a1a503ce51e086e7bdd663c2a1ddc2)]:
  - @clerk/backend@2.4.0
  - @clerk/shared@3.10.2
  - @clerk/types@4.63.0

## 2.4.3

### Patch Changes

- Updated dependencies [[`02a1f42`](https://github.com/clerk/javascript/commit/02a1f42dfdb28ea956d6cbd3fbabe10093d2fad8), [`edc0bfd`](https://github.com/clerk/javascript/commit/edc0bfdae929dad78a99dfd6275aad947d9ddd73)]:
  - @clerk/shared@3.10.1
  - @clerk/types@4.62.1
  - @clerk/backend@2.3.1

## 2.4.2

### Patch Changes

- Updated dependencies [[`f1be1fe`](https://github.com/clerk/javascript/commit/f1be1fe3d575c11acd04fc7aadcdec8f89829894), [`8bfdf94`](https://github.com/clerk/javascript/commit/8bfdf94646c54a5e13fcb81ebcb9df0209dbc6a1), [`bffb42a`](https://github.com/clerk/javascript/commit/bffb42aaf266a188b9ae7d16ace3024d468a3bd4), [`084e7cc`](https://github.com/clerk/javascript/commit/084e7cc5f6f6d101059bc8a6d60dc73f3262ef2f)]:
  - @clerk/types@4.62.0
  - @clerk/backend@2.3.0
  - @clerk/shared@3.10.0

## 2.4.1

### Patch Changes

- Updated dependencies [[`b495279`](https://github.com/clerk/javascript/commit/b4952796e3c7dee4ab4726de63a17b7f4265ce37), [`c3fa15d`](https://github.com/clerk/javascript/commit/c3fa15d60642b4fcbcf26e21caaca0fc60975795), [`628583a`](https://github.com/clerk/javascript/commit/628583a27ffd72521475e06f91e6f592ee87ba47), [`52d5e57`](https://github.com/clerk/javascript/commit/52d5e5768d54725b4d20d028135746493e05d44c), [`15a945c`](https://github.com/clerk/javascript/commit/15a945c02a9f6bc8d2f7d1e3534217100bf45936), [`10f3dda`](https://github.com/clerk/javascript/commit/10f3dda2beff0ce71a52c2f15c07094110078be2), [`72629b0`](https://github.com/clerk/javascript/commit/72629b06fb1fe720fa2a61462306a786a913e9a8), [`2692124`](https://github.com/clerk/javascript/commit/2692124a79369a9289ee18009667231d7e27b9ed)]:
  - @clerk/types@4.61.0
  - @clerk/backend@2.2.0
  - @clerk/shared@3.9.8

## 2.4.0

### Minor Changes

- Introduces machine authentication, supporting four token types: `api_key`, `oauth_token`, `machine_token`, and `session_token`. For backwards compatibility, `session_token` remains the default when no token type is specified. This enables machine-to-machine authentication and use cases such as API keys and OAuth integrations. Existing applications continue to work without modification. ([#6067](https://github.com/clerk/javascript/pull/6067)) by [@wobsoriano](https://github.com/wobsoriano)

  You can specify which token types are allowed by using the `acceptsToken` option in the `getAuth()` function. This option can be set to a specific type, an array of types, or `'any'` to accept all supported tokens.

  Example usage:

  ```ts
  import Fastify from 'fastify';
  import { getAuth } from '@clerk/fastify';

  const fastify = Fastify();

  fastify.get('/path', (request, reply) => {
    const authObject = getAuth(req, { acceptsToken: 'any' });

    if (authObject.tokenType === 'session_token') {
      console.log('this is session token from a user');
    } else {
      console.log('this is some other type of machine token');
      console.log('more specifically, a ' + authObject.tokenType);
    }
  });
  ```

### Patch Changes

- Updated dependencies [[`19e9e11`](https://github.com/clerk/javascript/commit/19e9e11af04f13fd12975fbf7016fe0583202056), [`18bcb64`](https://github.com/clerk/javascript/commit/18bcb64a3e8b6d352d7933ed094d68214e6e80fb), [`2148166`](https://github.com/clerk/javascript/commit/214816654850272297056eebad3d846b7f8125c9), [`4319257`](https://github.com/clerk/javascript/commit/4319257dc424f121231a26bef2068cef1e78afd4), [`607d333`](https://github.com/clerk/javascript/commit/607d3331f893bc98d1a8894f57b1cb9021e71b86), [`138f733`](https://github.com/clerk/javascript/commit/138f733f13121487268a4f96e6eb2cffedc6e238), [`4118ed7`](https://github.com/clerk/javascript/commit/4118ed7c8fb13ca602401f8d663e7bcd6f6abee4), [`d832d91`](https://github.com/clerk/javascript/commit/d832d9179ff615f2799c832ec5fd9f3d79c6a940), [`6842ff1`](https://github.com/clerk/javascript/commit/6842ff1c903eaa0db161f533365a2e680995ce83), [`48be55b`](https://github.com/clerk/javascript/commit/48be55b61a86e014dd407414764d24bb43fd26f3), [`183e382`](https://github.com/clerk/javascript/commit/183e3823e4ff70e856b00a347369c38a4264105a), [`2c6f805`](https://github.com/clerk/javascript/commit/2c6f805a9e6e4685990f9a8abc740b2d0859a453), [`97749d5`](https://github.com/clerk/javascript/commit/97749d570bc687c7e05cd800a50e0ae4180a371d)]:
  - @clerk/types@4.60.1
  - @clerk/backend@2.1.0
  - @clerk/shared@3.9.7

## 2.3.0

### Minor Changes

- Machine authentication is now supported for advanced use cases via the backend SDK. You can use `clerkClient.authenticateRequest` to validate machine tokens (such as API keys, OAuth tokens, and machine-to-machine tokens). No new helpers are included in these packages yet. ([#5689](https://github.com/clerk/javascript/pull/5689)) by [@wobsoriano](https://github.com/wobsoriano)

  Example (Astro):

  ```ts
  import { clerkClient } from '@clerk/astro/server';

  export const GET: APIRoute = ({ request }) => {
    const requestState = await clerkClient.authenticateRequest(request, {
      acceptsToken: 'api_key',
    });

    if (!requestState.isAuthenticated) {
      return new Response(401, { message: 'Unauthorized' });
    }

    return new Response(JSON.stringify(requestState.toAuth()));
  };
  ```

- The `svix` dependency is no longer needed when using the `verifyWebhook()` function. `verifyWebhook()` was refactored to not rely on `svix` anymore while keeping the same functionality and behavior. ([#6059](https://github.com/clerk/javascript/pull/6059)) by [@royanger](https://github.com/royanger)

  If you previously installed `svix` to use `verifyWebhook()` you can uninstall it now:

  ```shell
  npm uninstall svix
  ```

### Patch Changes

- Updated dependencies [[`ea622ba`](https://github.com/clerk/javascript/commit/ea622bae90e18ae2ea8dbc6c94cad857557539c9), [`d8fa5d9`](https://github.com/clerk/javascript/commit/d8fa5d9d3d8dc575260d8d2b7c7eeeb0052d0b0d), [`be2e89c`](https://github.com/clerk/javascript/commit/be2e89ca11aa43d48f74c57a5a34e20d85b4003c), [`c656270`](https://github.com/clerk/javascript/commit/c656270f9e05fd1f44fc4c81851be0b1111cb933), [`5644d94`](https://github.com/clerk/javascript/commit/5644d94f711a0733e4970c3f15c24d56cafc8743), [`b578225`](https://github.com/clerk/javascript/commit/b5782258242474c9b0987a3f8349836cd763f24b), [`918e2e0`](https://github.com/clerk/javascript/commit/918e2e085bf88c3cfaa5fcb0f1ae8c31b3f7053e), [`795d09a`](https://github.com/clerk/javascript/commit/795d09a652f791e1e409406e335e0860aceda110), [`4f93634`](https://github.com/clerk/javascript/commit/4f93634ed6bcd45f21bddcb39a33434b1cb560fe), [`8838120`](https://github.com/clerk/javascript/commit/8838120596830b88fec1c6c853371dabfec74a0d)]:
  - @clerk/backend@2.0.0
  - @clerk/types@4.60.0
  - @clerk/shared@3.9.6

## 2.2.23

### Patch Changes

- Updated dependencies [[`5421421`](https://github.com/clerk/javascript/commit/5421421644b5c017d58ee6583c12d6c253e29c33), [`f897773`](https://github.com/clerk/javascript/commit/f89777379da63cf45039c1570b51ba10a400817c), [`1c97fd0`](https://github.com/clerk/javascript/commit/1c97fd06b28db9fde6c14dbeb0935e13696be539), [`2c6a0cc`](https://github.com/clerk/javascript/commit/2c6a0cca6e824bafc6b0d0501784517a5b1f75ea), [`71e6a1f`](https://github.com/clerk/javascript/commit/71e6a1f1024d65b7a09cdc8fa81ce0164e0a34cb)]:
  - @clerk/backend@1.34.0
  - @clerk/shared@3.9.5
  - @clerk/types@4.59.3

## 2.2.22

### Patch Changes

- Updated dependencies [[`6ed3dfc`](https://github.com/clerk/javascript/commit/6ed3dfc1bc742ac9d9a2307fe8e4733411cbc0d7), [`22c3363`](https://github.com/clerk/javascript/commit/22c33631f7f54b4f2179bf16f548fee1a237976e), [`ac6b231`](https://github.com/clerk/javascript/commit/ac6b23147e5e0aa21690cc20a109ed9a8c8f6e5b)]:
  - @clerk/types@4.59.2
  - @clerk/backend@1.33.1
  - @clerk/shared@3.9.4

## 2.2.21

### Patch Changes

- Updated dependencies [[`ced8912`](https://github.com/clerk/javascript/commit/ced8912e8c9fb7eb7846de6ca9a872e794d9e15d), [`f237d76`](https://github.com/clerk/javascript/commit/f237d7617e5398ca0ba981e4336cac2191505b00), [`5f1375b`](https://github.com/clerk/javascript/commit/5f1375ba7cc50cccb11d5aee03bfd4c3d1bf462f)]:
  - @clerk/backend@1.33.0
  - @clerk/shared@3.9.3

## 2.2.20

### Patch Changes

- Updated dependencies [[`c305b31`](https://github.com/clerk/javascript/commit/c305b310e351e9ce2012f805b35e464c3e43e310), [`b813cbe`](https://github.com/clerk/javascript/commit/b813cbe29252ab9710f355cecd4511172aea3548), [`6bb480e`](https://github.com/clerk/javascript/commit/6bb480ef663a6dfa219bc9546aca087d5d9624d0)]:
  - @clerk/types@4.59.1
  - @clerk/backend@1.32.3
  - @clerk/shared@3.9.2

## 2.2.19

### Patch Changes

- Updated dependencies [[`b1337df`](https://github.com/clerk/javascript/commit/b1337dfeae8ccf8622efcf095e3201f9bbf1cefa), [`65f0878`](https://github.com/clerk/javascript/commit/65f08788ee5e56242eee2194c73ba90965c75c97), [`df6fefd`](https://github.com/clerk/javascript/commit/df6fefd05fd2df93f5286d97e546b48911adea7c), [`4282bfa`](https://github.com/clerk/javascript/commit/4282bfa09491225bde7d619fe9a3561062703f69), [`5491491`](https://github.com/clerk/javascript/commit/5491491711e0a8ee37828451c1f603a409de32cf)]:
  - @clerk/types@4.59.0
  - @clerk/backend@1.32.2
  - @clerk/shared@3.9.1

## 2.2.18

### Patch Changes

- Updated dependencies [[`1ff6d6e`](https://github.com/clerk/javascript/commit/1ff6d6efbe838b3f7f6977b2b5215c2cafd715f6), [`fbf3cf4`](https://github.com/clerk/javascript/commit/fbf3cf4916469c4e118870bf12efca2d0f77d9d8)]:
  - @clerk/shared@3.9.0
  - @clerk/types@4.58.1
  - @clerk/backend@1.32.1

## 2.2.17

### Patch Changes

- Updated dependencies [[`0769a9b`](https://github.com/clerk/javascript/commit/0769a9b4a44ec7046a3b99a3d58bddd173970990), [`0f5145e`](https://github.com/clerk/javascript/commit/0f5145e164f3d3d5faf57e58162b05e7110d2403), [`afdfd18`](https://github.com/clerk/javascript/commit/afdfd18d645608dec37e52a291a91ba5f42dcbe7), [`b7c51ba`](https://github.com/clerk/javascript/commit/b7c51baac6df1129b468274c9a7f63ca303f16ce), [`437b53b`](https://github.com/clerk/javascript/commit/437b53b67e281d076b5b3f927e11c1d64666d154), [`5217155`](https://github.com/clerk/javascript/commit/52171554250c5c58f4f497b6d3c7416e79ac77da)]:
  - @clerk/backend@1.32.0
  - @clerk/types@4.58.0
  - @clerk/shared@3.8.2

## 2.2.16

### Patch Changes

- Updated dependencies [[`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`36fb43f`](https://github.com/clerk/javascript/commit/36fb43f8b35866bdc20680fac58020f036d30d1f), [`e5ac444`](https://github.com/clerk/javascript/commit/e5ac4447f52bb6887ad686feab308fe9daf76e33), [`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`d227805`](https://github.com/clerk/javascript/commit/d22780599a5e29545a3d8309cc411c2e8659beac)]:
  - @clerk/types@4.57.1
  - @clerk/backend@1.31.4
  - @clerk/shared@3.8.1

## 2.2.15

### Patch Changes

- Updated dependencies [[`db0138f`](https://github.com/clerk/javascript/commit/db0138f3f72aea8cb68a5684a90123f733848f63), [`aa97231`](https://github.com/clerk/javascript/commit/aa97231962e3f472a46135e376159c6ddcf1157b), [`c792f37`](https://github.com/clerk/javascript/commit/c792f37129fd6475d5af95146e9ef0f1c8eff730), [`3bf08a9`](https://github.com/clerk/javascript/commit/3bf08a9e0a9e65496edac5fc3bb22ad7b561df26), [`74cf3b2`](https://github.com/clerk/javascript/commit/74cf3b28cdf622a942aaf99caabfba74b7e856fd), [`037b113`](https://github.com/clerk/javascript/commit/037b113aaedd53d4647d88f1659eb9c14cf6f275), [`c15a412`](https://github.com/clerk/javascript/commit/c15a412169058e2304a51c9e92ffaa7f6bb2a898), [`7726a03`](https://github.com/clerk/javascript/commit/7726a03a7fec4d292b6de2587b84ed4371984c23), [`ed10566`](https://github.com/clerk/javascript/commit/ed1056637624eec5bfd50333407c1e63e34c193b), [`b846a9a`](https://github.com/clerk/javascript/commit/b846a9ab96db6b1d8344a4b693051618865508a8), [`e66c800`](https://github.com/clerk/javascript/commit/e66c8002b82b2902f77e852e16482f5cfb062d2c), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed), [`9c41091`](https://github.com/clerk/javascript/commit/9c41091eb795bce8ffeeeca0264ae841fe07b426), [`29462b4`](https://github.com/clerk/javascript/commit/29462b433eb411ce614e4768e5844cacd00c1975), [`322c43f`](https://github.com/clerk/javascript/commit/322c43f6807a932c3cfaaef1b587b472c80180d2), [`17397f9`](https://github.com/clerk/javascript/commit/17397f95b715bd4fefd7f63c1d351abcf1c8ee16), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed)]:
  - @clerk/types@4.57.0
  - @clerk/shared@3.8.0
  - @clerk/backend@1.31.3

## 2.2.14

### Patch Changes

- Updated dependencies [[`9ec0a73`](https://github.com/clerk/javascript/commit/9ec0a7353e9f6ea661c3d7b9542423b6eb1d29e9), [`d9222fc`](https://github.com/clerk/javascript/commit/d9222fc3c21da2bcae30b06f0b1897f526935582)]:
  - @clerk/types@4.56.3
  - @clerk/backend@1.31.2
  - @clerk/shared@3.7.8

## 2.2.13

### Patch Changes

- Updated dependencies [[`225b9ca`](https://github.com/clerk/javascript/commit/225b9ca21aba44930872a85d6b112ee2a1b606b9)]:
  - @clerk/types@4.56.2
  - @clerk/backend@1.31.1
  - @clerk/shared@3.7.7

## 2.2.12

### Patch Changes

- Updated dependencies [[`be1c5d6`](https://github.com/clerk/javascript/commit/be1c5d67b27852303dc8148e3be514473ce3e190), [`a122121`](https://github.com/clerk/javascript/commit/a122121e4fe55148963ed85b99ff24ba02a2d170)]:
  - @clerk/backend@1.31.0

## 2.2.11

### Patch Changes

- Updated dependencies [[`387bf62`](https://github.com/clerk/javascript/commit/387bf623406306e0c5c08da937f4930a7ec5e4a5), [`2716622`](https://github.com/clerk/javascript/commit/27166224e12af582298460d438bd7f83ea8e04bf), [`294da82`](https://github.com/clerk/javascript/commit/294da82336e7a345900d7ef9b28f56a7c8864c52), [`4a8fe40`](https://github.com/clerk/javascript/commit/4a8fe40dc7c6335d4cf90e2532ceda2c7ad66a3b)]:
  - @clerk/types@4.56.1
  - @clerk/shared@3.7.6
  - @clerk/backend@1.30.2

## 2.2.10

### Patch Changes

- Updated dependencies [[`b02e766`](https://github.com/clerk/javascript/commit/b02e76627e47aec314573586451fa345a089115a), [`5d78b28`](https://github.com/clerk/javascript/commit/5d78b286b63e35fbcf44aac1f7657cbeaba4d659), [`d7f4438`](https://github.com/clerk/javascript/commit/d7f4438fa4bfd04474d5cdb9212ba908568ad6d2), [`5866855`](https://github.com/clerk/javascript/commit/58668550ec91d5511cf775972c54dc485185cc58), [`0007106`](https://github.com/clerk/javascript/commit/00071065998a3676c51e396b4c0afcbf930a9898), [`462b5b2`](https://github.com/clerk/javascript/commit/462b5b271d4e120d58a85818a358b60a6b3c8100), [`447d7a9`](https://github.com/clerk/javascript/commit/447d7a9e133c2a0e7db014bd5837e6ffff08f572), [`2beea29`](https://github.com/clerk/javascript/commit/2beea2957c67bc62446fe24d36332b0a4e850d7d), [`115601d`](https://github.com/clerk/javascript/commit/115601d12fd65dbf3011c0cda368525a2b95bfeb)]:
  - @clerk/types@4.56.0
  - @clerk/backend@1.30.1
  - @clerk/shared@3.7.5

## 2.2.9

### Patch Changes

- Updated dependencies [[`ba19465`](https://github.com/clerk/javascript/commit/ba194654b15d326bf0ab1b2bf0cab608042d20ec), [`8b25035`](https://github.com/clerk/javascript/commit/8b25035aa49382fe1cd1c6f30ec80e86bcf9d66e)]:
  - @clerk/backend@1.30.0
  - @clerk/types@4.55.1
  - @clerk/shared@3.7.4

## 2.2.8

### Patch Changes

- Updated dependencies [[`33201bf`](https://github.com/clerk/javascript/commit/33201bf972d6a980617d47ebd776bef76f871833), [`4334598`](https://github.com/clerk/javascript/commit/4334598108ff2cfa3c25b5a46117c1c9c65b7974), [`0ae0403`](https://github.com/clerk/javascript/commit/0ae040303d239b75a3221436354a2c2ecdb85aae)]:
  - @clerk/types@4.55.0
  - @clerk/backend@1.29.2
  - @clerk/shared@3.7.3

## 2.2.7

### Patch Changes

- Updated dependencies [[`45486ac`](https://github.com/clerk/javascript/commit/45486acebf4d133efb09a3622a738cdbf4e51d66), [`837692a`](https://github.com/clerk/javascript/commit/837692aa40197b1574783ad36d0d017a771c08e1), [`0c00e59`](https://github.com/clerk/javascript/commit/0c00e59ff4714491650ac9480ae3b327c626d30d), [`6a5f644`](https://github.com/clerk/javascript/commit/6a5f6447a36a635d6201f8bb7619fb844ab21b79)]:
  - @clerk/types@4.54.2
  - @clerk/backend@1.29.1
  - @clerk/shared@3.7.2

## 2.2.6

### Patch Changes

- Updated dependencies [[`ab939fd`](https://github.com/clerk/javascript/commit/ab939fdb29150c376280b42f861a188a33f57dcc), [`03284da`](https://github.com/clerk/javascript/commit/03284da6a93a790ce3e3ebbd871c06e19f5a8803), [`7389ba3`](https://github.com/clerk/javascript/commit/7389ba3164ca0d848fb0a9de5d7e9716925fadcc), [`00f16e4`](https://github.com/clerk/javascript/commit/00f16e4c62fc9e965c352a4fd199c7fad8704f79), [`bb35660`](https://github.com/clerk/javascript/commit/bb35660884d04c8a426790ed439592e33434c87f), [`efb5d8c`](https://github.com/clerk/javascript/commit/efb5d8c03b14f6c2b5ecaed55a09869abe76ebbc), [`c2712e7`](https://github.com/clerk/javascript/commit/c2712e7f288271c022b5586b8b4718f57c9b6007), [`aa93f7f`](https://github.com/clerk/javascript/commit/aa93f7f94b5e146eb7166244f7e667213fa210ca), [`a7f3ebc`](https://github.com/clerk/javascript/commit/a7f3ebc63adbab274497ca24279862d2788423c7), [`d3fa403`](https://github.com/clerk/javascript/commit/d3fa4036b7768134131c008c087a90a841f225e5), [`f6ef841`](https://github.com/clerk/javascript/commit/f6ef841125ff21ca8cae731d1f47f3a101d887e1), [`6cba4e2`](https://github.com/clerk/javascript/commit/6cba4e28e904779dd448a7c29d761fcf53465dbf), [`fb6aa20`](https://github.com/clerk/javascript/commit/fb6aa20abe1c0c8579ba8f07343474f915bc22c6), [`e634830`](https://github.com/clerk/javascript/commit/e6348301ab56a7868f24c1b9a4dd9e1d60f6027b), [`f8887b2`](https://github.com/clerk/javascript/commit/f8887b2cbd145e8e49bec890e8b6e02e34178d6a)]:
  - @clerk/types@4.54.1
  - @clerk/backend@1.29.0
  - @clerk/shared@3.7.1

## 2.2.5

### Patch Changes

- Updated dependencies [[`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`950ffed`](https://github.com/clerk/javascript/commit/950ffedd5ce93678274c721400fc7464bb1e2f99), [`d3e6c32`](https://github.com/clerk/javascript/commit/d3e6c32864487bb9c4dec361866ec2cd427b7cd0), [`e4d04ae`](https://github.com/clerk/javascript/commit/e4d04aea490ab67e3431729398d3f4c46fc3e7e7), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`93068ea`](https://github.com/clerk/javascript/commit/93068ea9eb19d8c8b9c7ade35d0cd860e08049fc), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`103bc03`](https://github.com/clerk/javascript/commit/103bc03571c8845df205f4c6fd0c871c3368d1d0), [`a0cc247`](https://github.com/clerk/javascript/commit/a0cc24764cc2229abae97f7c9183b413609febc7), [`85ed003`](https://github.com/clerk/javascript/commit/85ed003e65802ac02d69d7b671848938c9816c45), [`48438b4`](https://github.com/clerk/javascript/commit/48438b409036088701bda7e1e732d6a51bee8cdc), [`e60e3aa`](https://github.com/clerk/javascript/commit/e60e3aa41630b987b6a481643caf67d70584f2e1), [`65712dc`](https://github.com/clerk/javascript/commit/65712dccb3f3f2bc6028e53406e3f7f31622e961), [`9ee0531`](https://github.com/clerk/javascript/commit/9ee0531c81d1bb260ec0f87130d8394d7825b6d4), [`78d22d4`](https://github.com/clerk/javascript/commit/78d22d443446ac1c0d30b1b93aaf5cddde75a9a3), [`196dcb4`](https://github.com/clerk/javascript/commit/196dcb47928bd22a3382197f8594a590f688faee)]:
  - @clerk/backend@1.28.0
  - @clerk/types@4.54.0
  - @clerk/shared@3.7.0

## 2.2.4

### Patch Changes

- Updated dependencies [[`70c9db9`](https://github.com/clerk/javascript/commit/70c9db9f3b51ba034f76e0cc4cf338e7b406d9b1), [`554242e`](https://github.com/clerk/javascript/commit/554242e16e50c92a6afb6ed74c681b04b9f113b5), [`cc1f9a0`](https://github.com/clerk/javascript/commit/cc1f9a0adb7771b615b0f2994a5ac571b59889dd), [`8186cb5`](https://github.com/clerk/javascript/commit/8186cb564575ac3ce97079ec203865bf5deb05ee)]:
  - @clerk/backend@1.27.3
  - @clerk/shared@3.6.0
  - @clerk/types@4.53.0

## 2.2.3

### Patch Changes

- Updated dependencies [[`3ad3bc8`](https://github.com/clerk/javascript/commit/3ad3bc8380b354b0cd952eb58eb6c07650efa0f2), [`3ad3bc8`](https://github.com/clerk/javascript/commit/3ad3bc8380b354b0cd952eb58eb6c07650efa0f2), [`cfa94b8`](https://github.com/clerk/javascript/commit/cfa94b88476608edf8c2486e8ec0d3f3f82e0bfb), [`2033919`](https://github.com/clerk/javascript/commit/203391964857b98dae11944799d1e6328439e838), [`1b34bcb`](https://github.com/clerk/javascript/commit/1b34bcb17e1a7f22644c0ea073857c528a8f81b7), [`5f3cc46`](https://github.com/clerk/javascript/commit/5f3cc460b6b775b5a74746758b8cff11649a877a)]:
  - @clerk/shared@3.5.0
  - @clerk/types@4.52.0
  - @clerk/backend@1.27.2

## 2.2.2

### Patch Changes

- Updated dependencies [[`f6f275d`](https://github.com/clerk/javascript/commit/f6f275dac5ae83ac0c2016a85a6a0cee9513f224)]:
  - @clerk/backend@1.27.1
  - @clerk/types@4.51.1
  - @clerk/shared@3.4.1

## 2.2.1

### Patch Changes

- Updated dependencies [[`e1ec52b`](https://github.com/clerk/javascript/commit/e1ec52b93038c9cb24e030dc06e53825a384a480), [`bebb6d8`](https://github.com/clerk/javascript/commit/bebb6d8af66b2bb7a4b3bdf96f9d480e65b31ba2), [`d0d5203`](https://github.com/clerk/javascript/commit/d0d5203e4ee9e2e1bed5c00ef0f87f0130f1d298), [`6112420`](https://github.com/clerk/javascript/commit/6112420889f1577fb16d7bfa706aaffe1090093d), [`2cceeba`](https://github.com/clerk/javascript/commit/2cceeba177ecf5a28138da308cbba18015e3a646), [`9b25e31`](https://github.com/clerk/javascript/commit/9b25e311cf5e15f896c7948faa42ace45df364c5)]:
  - @clerk/types@4.51.0
  - @clerk/backend@1.27.0
  - @clerk/shared@3.4.0

## 2.2.0

### Minor Changes

- Introduce a `verifyWebhook()` function to verify incoming Clerk webhook requests and process the payload. This function handles webhook signature verification using `Svix` and is now available across all backend and fullstack SDKs. ([#5468](https://github.com/clerk/javascript/pull/5468)) by [@wobsoriano](https://github.com/wobsoriano)

  To get started, install [`svix`](https://www.npmjs.com/package/svix), which Clerk uses to verify its webhooks:

  ```shell
  npm install svix
  ```

  Then in your webhook route handler, import `verifyWebhook()` from the Fastify SDK:

  ```ts
  import { verifyWebhook } from '@clerk/fastify/webhooks';

  fastify.post('/api/webhooks', async (request, reply) => {
    try {
      const evt = await verifyWebhook(request);

      // Do something with payload
      const { id } = evt.data;
      const eventType = evt.type;
      console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
      console.log('Webhook payload:', evt.data);

      return reply.status(200).send('Webhook received');
    } catch (err) {
      console.log('Error: Could not verify webhook:', err);
      return reply.status(400).send('Error: Verification error');
    }
  });
  ```

  For more information on how to sync Clerk data to your app with webhooks, [see our guide](https://clerk.com/docs/webhooks/sync-data).

### Patch Changes

- Updated dependencies [[`60a9a51`](https://github.com/clerk/javascript/commit/60a9a51dff7d59e7397536586cf1cfe029bc021b), [`e984494`](https://github.com/clerk/javascript/commit/e984494416dda9a6f04acaaba61f8c2683090961), [`cd6ee92`](https://github.com/clerk/javascript/commit/cd6ee92d5b427ca548216f429ca4e31c6acd263c), [`ec4521b`](https://github.com/clerk/javascript/commit/ec4521b4fe56602f524a0c6d1b09d21aef5d8bd0), [`38828ae`](https://github.com/clerk/javascript/commit/38828ae58d6d4e8e3c60945284930179b2b6bb40), [`f30fa75`](https://github.com/clerk/javascript/commit/f30fa750754f19030f932a666d2bdbdf0d86743d), [`9c68678`](https://github.com/clerk/javascript/commit/9c68678e87047e6312b708b775ebfb23a3e22f8a), [`fe065a9`](https://github.com/clerk/javascript/commit/fe065a934c583174ad4c140e04dedbe6d88fc3a0), [`619cde8`](https://github.com/clerk/javascript/commit/619cde8c532d635d910ebbc08ad6abcc025694b4)]:
  - @clerk/backend@1.26.0
  - @clerk/shared@3.3.0
  - @clerk/types@4.50.2

## 2.1.32

### Patch Changes

- Updated dependencies [[`e20fb6b`](https://github.com/clerk/javascript/commit/e20fb6b397fb69c9d5af4e321267b82f12a5f127), [`77e6462`](https://github.com/clerk/javascript/commit/77e64628560cab688af214edb5922e67cd68a951)]:
  - @clerk/shared@3.2.3
  - @clerk/types@4.50.1
  - @clerk/backend@1.25.8

## 2.1.31

### Patch Changes

- Updated dependencies [[`1da28a2`](https://github.com/clerk/javascript/commit/1da28a28bf602069b433c15b92df21f682779294), [`a9b618d`](https://github.com/clerk/javascript/commit/a9b618dfa97a0dacc462186c8b2588ad5ddb6902), [`f20dc15`](https://github.com/clerk/javascript/commit/f20dc159f542449e7f5b437b70d3eb3ba04d6975), [`4d9f1ee`](https://github.com/clerk/javascript/commit/4d9f1ee8c22fe1e4a166ff054d0af4d37b829f0a)]:
  - @clerk/types@4.50.0
  - @clerk/shared@3.2.2
  - @clerk/backend@1.25.7

## 2.1.30

### Patch Changes

- Updated dependencies [[`27d66a5`](https://github.com/clerk/javascript/commit/27d66a5b252afd18a3491b2746ef2f2f05632f2a), [`466ed13`](https://github.com/clerk/javascript/commit/466ed136af73b59b267d92ad3296039d1c3a4fcc)]:
  - @clerk/backend@1.25.6
  - @clerk/types@4.49.2
  - @clerk/shared@3.2.1

## 2.1.29

### Patch Changes

- Updated dependencies [[`892bc0e`](https://github.com/clerk/javascript/commit/892bc0eee9e0bb04d327eb84b44201fa34806483), [`892bc0e`](https://github.com/clerk/javascript/commit/892bc0eee9e0bb04d327eb84b44201fa34806483)]:
  - @clerk/backend@1.25.5
  - @clerk/shared@3.2.0

## 2.1.28

### Patch Changes

- Updated dependencies [[`facefaf`](https://github.com/clerk/javascript/commit/facefafdaf6d602de0acee9218c66c61a0a9ba24), [`3910ebe`](https://github.com/clerk/javascript/commit/3910ebea85817273f18fd2f3f142dd1c728e2220), [`e513333`](https://github.com/clerk/javascript/commit/e5133330a196c5c3742634cc9c3d3233ff488b0d)]:
  - @clerk/backend@1.25.4
  - @clerk/types@4.49.1
  - @clerk/shared@3.1.0

## 2.1.27

### Patch Changes

- Updated dependencies [[`725918d`](https://github.com/clerk/javascript/commit/725918df2e74cea15e9b748aaf103a52df8e8500), [`10247ba`](https://github.com/clerk/javascript/commit/10247ba2d08d98d6c440b254a4b786f4f1e8967a), [`91d0f0b`](https://github.com/clerk/javascript/commit/91d0f0b0dccab7168ad4dc06c8629808938c235f), [`9572bf5`](https://github.com/clerk/javascript/commit/9572bf5bdfb7dc309ec8714989b98ab12174965b), [`39bbc51`](https://github.com/clerk/javascript/commit/39bbc5189a33dc6cebdc269ac2184dc4ffff2534), [`3dddcda`](https://github.com/clerk/javascript/commit/3dddcda191d8f8d6a9b02464f1f6374d3c6aacb9), [`7524943`](https://github.com/clerk/javascript/commit/7524943300d7e693d61cc1820b520abfadec1c64), [`150b5c8`](https://github.com/clerk/javascript/commit/150b5c89477abb0feab15e0a886179473f653cac), [`23c931e`](https://github.com/clerk/javascript/commit/23c931e9e95e6de992549ad499b477aca9a9c344), [`730262f`](https://github.com/clerk/javascript/commit/730262f0f973923c8749b09078c80c2fc966a8ec), [`5601a15`](https://github.com/clerk/javascript/commit/5601a15e69a7d5e2496dcd82541ca3e6d73b0a3f), [`0b18bb1`](https://github.com/clerk/javascript/commit/0b18bb1fe6fa3ded97547bb6b4d2c73030aad329), [`021bc5f`](https://github.com/clerk/javascript/commit/021bc5f40044d34e49956ce3c9b61d833d815b42), [`1a61390`](https://github.com/clerk/javascript/commit/1a61390d3482bd4af58508b972ad89dea56fa224)]:
  - @clerk/types@4.49.0
  - @clerk/backend@1.25.3
  - @clerk/shared@3.0.2

## 2.1.26

### Patch Changes

- Updated dependencies [[`8182f6711e25cc4a78baa95b023a4158280b31e8`](https://github.com/clerk/javascript/commit/8182f6711e25cc4a78baa95b023a4158280b31e8), [`75879672c5805bfba1caca906ac0729497744164`](https://github.com/clerk/javascript/commit/75879672c5805bfba1caca906ac0729497744164), [`7ec95a7e59033600958aca4b86f3bcd5da947dec`](https://github.com/clerk/javascript/commit/7ec95a7e59033600958aca4b86f3bcd5da947dec), [`3c225d90227141dc62d955e76c7f8e0202524bc7`](https://github.com/clerk/javascript/commit/3c225d90227141dc62d955e76c7f8e0202524bc7), [`2a66c16af08573000bb619607346ac420cd4ce56`](https://github.com/clerk/javascript/commit/2a66c16af08573000bb619607346ac420cd4ce56)]:
  - @clerk/backend@1.25.2
  - @clerk/shared@3.0.1
  - @clerk/types@4.48.0

## 2.1.25

### Patch Changes

- Updated dependencies [[`67f1743aa1e0705d89ee6b532007f2686929240b`](https://github.com/clerk/javascript/commit/67f1743aa1e0705d89ee6b532007f2686929240b)]:
  - @clerk/backend@1.25.1

## 2.1.24

### Patch Changes

- Updated dependencies [[`4fa5e27e33d229492c77e06ca4b26d552ff3d92f`](https://github.com/clerk/javascript/commit/4fa5e27e33d229492c77e06ca4b26d552ff3d92f), [`29a44b0e5c551e52915f284545699010a87e1a48`](https://github.com/clerk/javascript/commit/29a44b0e5c551e52915f284545699010a87e1a48), [`4d7761a24af5390489653923165e55cbf69a8a6d`](https://github.com/clerk/javascript/commit/4d7761a24af5390489653923165e55cbf69a8a6d)]:
  - @clerk/backend@1.25.0

## 2.1.23

### Patch Changes

- Updated dependencies [[`28179323d9891bd13625e32c5682a3276e73cdae`](https://github.com/clerk/javascript/commit/28179323d9891bd13625e32c5682a3276e73cdae), [`7ae77b74326e378bf161e29886ee82e1556d9840`](https://github.com/clerk/javascript/commit/7ae77b74326e378bf161e29886ee82e1556d9840), [`c5c246ce91c01db9f1eaccbd354f646bcd24ec0a`](https://github.com/clerk/javascript/commit/c5c246ce91c01db9f1eaccbd354f646bcd24ec0a), [`bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a`](https://github.com/clerk/javascript/commit/bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a), [`382c30240f563e58bc4d4832557c6825da40ce7f`](https://github.com/clerk/javascript/commit/382c30240f563e58bc4d4832557c6825da40ce7f)]:
  - @clerk/types@4.47.0
  - @clerk/shared@3.0.0
  - @clerk/backend@1.24.3

## 2.1.22

### Patch Changes

- Updated dependencies [[`d76c4699990b8477745c2584b1b98d5c92f9ace6`](https://github.com/clerk/javascript/commit/d76c4699990b8477745c2584b1b98d5c92f9ace6), [`a9b0087fca3f427f65907b358d9b5bc0c95921d8`](https://github.com/clerk/javascript/commit/a9b0087fca3f427f65907b358d9b5bc0c95921d8), [`92d17d7c087470b262fa5407cb6720fe6b17d333`](https://github.com/clerk/javascript/commit/92d17d7c087470b262fa5407cb6720fe6b17d333)]:
  - @clerk/shared@2.22.0
  - @clerk/types@4.46.1
  - @clerk/backend@1.24.2

## 2.1.21

### Patch Changes

- Updated dependencies [[`dd2cbfe9f30358b6b298901bb52fa378b0acdca3`](https://github.com/clerk/javascript/commit/dd2cbfe9f30358b6b298901bb52fa378b0acdca3), [`570d8386f6aa596bf7bb1659bdddb8dd4d992b1d`](https://github.com/clerk/javascript/commit/570d8386f6aa596bf7bb1659bdddb8dd4d992b1d), [`128fd8909ae083c0d274dee7c6810e8574e1ce33`](https://github.com/clerk/javascript/commit/128fd8909ae083c0d274dee7c6810e8574e1ce33)]:
  - @clerk/types@4.46.0
  - @clerk/backend@1.24.1
  - @clerk/shared@2.21.1

## 2.1.20

### Patch Changes

- Updated dependencies [[`ce44176efd4f2132001c49b815cbee409463bbea`](https://github.com/clerk/javascript/commit/ce44176efd4f2132001c49b815cbee409463bbea), [`f41081c563ddd2afc05b837358e0de087ae0c895`](https://github.com/clerk/javascript/commit/f41081c563ddd2afc05b837358e0de087ae0c895), [`767ac85fe6ce0ee0594c923e9af701bb05f40a0b`](https://github.com/clerk/javascript/commit/767ac85fe6ce0ee0594c923e9af701bb05f40a0b), [`225b38c7187d31fc755155ea99834ca03894d36b`](https://github.com/clerk/javascript/commit/225b38c7187d31fc755155ea99834ca03894d36b), [`c0f2daebe15642cd0cef16aafa1df1ece8ef771d`](https://github.com/clerk/javascript/commit/c0f2daebe15642cd0cef16aafa1df1ece8ef771d), [`429f1bfe5f7a554ab1fdf265475ba6c8b3f78472`](https://github.com/clerk/javascript/commit/429f1bfe5f7a554ab1fdf265475ba6c8b3f78472), [`5faa60e805ef14d9496a6caf9ff4dd8ec500c7e2`](https://github.com/clerk/javascript/commit/5faa60e805ef14d9496a6caf9ff4dd8ec500c7e2)]:
  - @clerk/backend@1.24.0
  - @clerk/shared@2.21.0
  - @clerk/types@4.45.1

## 2.1.19

### Patch Changes

- Updated dependencies [[`d3152be7f01fbb5ca26aeddc2437021f4b7ecc83`](https://github.com/clerk/javascript/commit/d3152be7f01fbb5ca26aeddc2437021f4b7ecc83), [`f976349243da2b75023e59e802460e6f3592ebbd`](https://github.com/clerk/javascript/commit/f976349243da2b75023e59e802460e6f3592ebbd)]:
  - @clerk/types@4.45.0
  - @clerk/backend@1.23.11
  - @clerk/shared@2.20.18

## 2.1.18

### Patch Changes

- Updated dependencies [[`26225f2c31a22560f7ece2e02f1d0080b5b89520`](https://github.com/clerk/javascript/commit/26225f2c31a22560f7ece2e02f1d0080b5b89520), [`833693a6792b621e72162d70673e7bdfa84a69b6`](https://github.com/clerk/javascript/commit/833693a6792b621e72162d70673e7bdfa84a69b6)]:
  - @clerk/shared@2.20.17
  - @clerk/types@4.44.3
  - @clerk/backend@1.23.10

## 2.1.17

### Patch Changes

- Updated dependencies [[`a309be354275b91a7b17d5a67e8ef6aa230a9935`](https://github.com/clerk/javascript/commit/a309be354275b91a7b17d5a67e8ef6aa230a9935), [`4773d0ad4ed27928fa53357906c0f3a349b9f871`](https://github.com/clerk/javascript/commit/4773d0ad4ed27928fa53357906c0f3a349b9f871), [`1345cb487970a7347351897e80dfb829d85c41ea`](https://github.com/clerk/javascript/commit/1345cb487970a7347351897e80dfb829d85c41ea)]:
  - @clerk/shared@2.20.16
  - @clerk/backend@1.23.9
  - @clerk/types@4.44.2

## 2.1.16

### Patch Changes

- Updated dependencies [[`57c983fdc2b8d883623a2294daae0ac6c02c48f6`](https://github.com/clerk/javascript/commit/57c983fdc2b8d883623a2294daae0ac6c02c48f6), [`a26cf0ff10c76244975c454fdf6c615475d4bcd5`](https://github.com/clerk/javascript/commit/a26cf0ff10c76244975c454fdf6c615475d4bcd5), [`dd58c2507f8a7af4ebfc1241e2672a5678a83eaa`](https://github.com/clerk/javascript/commit/dd58c2507f8a7af4ebfc1241e2672a5678a83eaa)]:
  - @clerk/types@4.44.1
  - @clerk/shared@2.20.15
  - @clerk/backend@1.23.8

## 2.1.15

### Patch Changes

- Updated dependencies [[`2179690c10a61b117e82fdd566b34939f4d28bc1`](https://github.com/clerk/javascript/commit/2179690c10a61b117e82fdd566b34939f4d28bc1), [`bdb537a9902c0f0ae58ca1d4b7590d929f28fedb`](https://github.com/clerk/javascript/commit/bdb537a9902c0f0ae58ca1d4b7590d929f28fedb)]:
  - @clerk/types@4.44.0
  - @clerk/backend@1.23.7
  - @clerk/shared@2.20.14

## 2.1.14

### Patch Changes

- Updated dependencies [[`f87ede848265d75ea1e880a3ab80c53a250f42cf`](https://github.com/clerk/javascript/commit/f87ede848265d75ea1e880a3ab80c53a250f42cf), [`e0cea9a9bf8b90858067154cba9c149d1634dc91`](https://github.com/clerk/javascript/commit/e0cea9a9bf8b90858067154cba9c149d1634dc91), [`6126cc98281bca96797fd8a55b6ec6aeda397e46`](https://github.com/clerk/javascript/commit/6126cc98281bca96797fd8a55b6ec6aeda397e46), [`6e096564a459db4eaf953e99e570905b10be6c84`](https://github.com/clerk/javascript/commit/6e096564a459db4eaf953e99e570905b10be6c84)]:
  - @clerk/shared@2.20.13
  - @clerk/backend@1.23.6
  - @clerk/types@4.43.0

## 2.1.13

### Patch Changes

- Updated dependencies [[`fe3e49f61acefe8d7f1992405f7cb415fea2e5c8`](https://github.com/clerk/javascript/commit/fe3e49f61acefe8d7f1992405f7cb415fea2e5c8), [`4427c4702f64d4f28f7564ce5889d41e260aa519`](https://github.com/clerk/javascript/commit/4427c4702f64d4f28f7564ce5889d41e260aa519)]:
  - @clerk/types@4.42.0
  - @clerk/backend@1.23.5
  - @clerk/shared@2.20.12

## 2.1.12

### Patch Changes

- Updated dependencies [[`418ec5c62c4eb600566faab07684c068a29007e3`](https://github.com/clerk/javascript/commit/418ec5c62c4eb600566faab07684c068a29007e3)]:
  - @clerk/types@4.41.2
  - @clerk/backend@1.23.4
  - @clerk/shared@2.20.11

## 2.1.11

### Patch Changes

- Updated dependencies [[`9eef7713212378351e8e01628611eaa18de250e8`](https://github.com/clerk/javascript/commit/9eef7713212378351e8e01628611eaa18de250e8)]:
  - @clerk/shared@2.20.10
  - @clerk/backend@1.23.3

## 2.1.10

### Patch Changes

- Updated dependencies [[`7ffc99b48977b9f6c74c0c71c500b60cb8aba65e`](https://github.com/clerk/javascript/commit/7ffc99b48977b9f6c74c0c71c500b60cb8aba65e)]:
  - @clerk/types@4.41.1
  - @clerk/backend@1.23.2
  - @clerk/shared@2.20.9

## 2.1.9

### Patch Changes

- Updated dependencies [[`4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d`](https://github.com/clerk/javascript/commit/4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d), [`aa48b1f9e890b2402e9d05989a4820141076f7bf`](https://github.com/clerk/javascript/commit/aa48b1f9e890b2402e9d05989a4820141076f7bf), [`53bd34fff38b17498edf66cc4bc2d42d707f28dc`](https://github.com/clerk/javascript/commit/53bd34fff38b17498edf66cc4bc2d42d707f28dc)]:
  - @clerk/types@4.41.0
  - @clerk/backend@1.23.1
  - @clerk/shared@2.20.8

## 2.1.8

### Patch Changes

- Updated dependencies [[`e9e8834f7bfc953c3ae66fedf65b6952689c49da`](https://github.com/clerk/javascript/commit/e9e8834f7bfc953c3ae66fedf65b6952689c49da), [`fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6`](https://github.com/clerk/javascript/commit/fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6), [`7182b93101518a389cc13859f8a0fe8bd6f37a06`](https://github.com/clerk/javascript/commit/7182b93101518a389cc13859f8a0fe8bd6f37a06)]:
  - @clerk/backend@1.23.0
  - @clerk/types@4.40.3
  - @clerk/shared@2.20.7

## 2.1.7

### Patch Changes

- Updated dependencies [[`72d29538f587934309da96fc1c6d454bb9aad21e`](https://github.com/clerk/javascript/commit/72d29538f587934309da96fc1c6d454bb9aad21e), [`84867be0215d7f74d8be7b4f803e2c3a241e2f89`](https://github.com/clerk/javascript/commit/84867be0215d7f74d8be7b4f803e2c3a241e2f89), [`fa967ce79e1b5f2e8216eb09900879cb825fa528`](https://github.com/clerk/javascript/commit/fa967ce79e1b5f2e8216eb09900879cb825fa528)]:
  - @clerk/backend@1.22.0

## 2.1.6

### Patch Changes

- Updated dependencies [[`44cab6038af0a4d23869b3b292ece742fbbc4d85`](https://github.com/clerk/javascript/commit/44cab6038af0a4d23869b3b292ece742fbbc4d85)]:
  - @clerk/backend@1.21.6
  - @clerk/types@4.40.2
  - @clerk/shared@2.20.6

## 2.1.5

### Patch Changes

- Updated dependencies [[`80e1117631d35834705119a79cdcf9e0ed423fdd`](https://github.com/clerk/javascript/commit/80e1117631d35834705119a79cdcf9e0ed423fdd)]:
  - @clerk/types@4.40.1
  - @clerk/backend@1.21.5
  - @clerk/shared@2.20.5

## 2.1.4

### Patch Changes

- Updated dependencies [[`b3300c84a42276bd071a37addbd1ca6888ed9d7c`](https://github.com/clerk/javascript/commit/b3300c84a42276bd071a37addbd1ca6888ed9d7c), [`c9da04636ffe1ba804a1ce5e5b79027d3a2344d2`](https://github.com/clerk/javascript/commit/c9da04636ffe1ba804a1ce5e5b79027d3a2344d2)]:
  - @clerk/backend@1.21.4
  - @clerk/types@4.40.0
  - @clerk/shared@2.20.4

## 2.1.3

### Patch Changes

- Updated dependencies [[`84ccb0049041534f111be65f7c7d4d6120069446`](https://github.com/clerk/javascript/commit/84ccb0049041534f111be65f7c7d4d6120069446)]:
  - @clerk/shared@2.20.3
  - @clerk/backend@1.21.3

## 2.1.2

### Patch Changes

- Updated dependencies [[`aeafa7c5efd50c893d088ac99199d7eaecc04025`](https://github.com/clerk/javascript/commit/aeafa7c5efd50c893d088ac99199d7eaecc04025), [`acd9326ef2d6942b981b3ee59c4b20ddd303323d`](https://github.com/clerk/javascript/commit/acd9326ef2d6942b981b3ee59c4b20ddd303323d)]:
  - @clerk/types@4.39.4
  - @clerk/backend@1.21.2
  - @clerk/shared@2.20.2

## 2.1.1

### Patch Changes

- Updated dependencies [[`66ad299e4b6496ea4a93799de0f1ecfad920ddad`](https://github.com/clerk/javascript/commit/66ad299e4b6496ea4a93799de0f1ecfad920ddad), [`dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d`](https://github.com/clerk/javascript/commit/dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d), [`e1748582d0c89462f48a482a7805871b7065fa19`](https://github.com/clerk/javascript/commit/e1748582d0c89462f48a482a7805871b7065fa19), [`7f7edcaa8228c26d19e9081979100ada7e982095`](https://github.com/clerk/javascript/commit/7f7edcaa8228c26d19e9081979100ada7e982095), [`e1748582d0c89462f48a482a7805871b7065fa19`](https://github.com/clerk/javascript/commit/e1748582d0c89462f48a482a7805871b7065fa19), [`dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d`](https://github.com/clerk/javascript/commit/dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d)]:
  - @clerk/shared@2.20.1
  - @clerk/types@4.39.3
  - @clerk/backend@1.21.1

## 2.1.0

### Minor Changes

- Switching to use ^ for semver ranges of internal @clerk/ production dependencies. ([#4664](https://github.com/clerk/javascript/pull/4664)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Updated dependencies [[`ffa631d2480cfe77bf08c61b1302ace308e5b630`](https://github.com/clerk/javascript/commit/ffa631d2480cfe77bf08c61b1302ace308e5b630)]:
  - @clerk/backend@1.21.0
  - @clerk/shared@2.20.0

## 2.0.28

### Patch Changes

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/types@4.39.2
  - @clerk/backend@1.20.3
  - @clerk/shared@2.19.4

## 2.0.27

### Patch Changes

- Updated dependencies [[`fe75ced8a7d8b8a28839430444588ee173b5230a`](https://github.com/clerk/javascript/commit/fe75ced8a7d8b8a28839430444588ee173b5230a), [`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/backend@1.20.2
  - @clerk/types@4.39.1
  - @clerk/shared@2.19.3

## 2.0.26

### Patch Changes

- Updated dependencies [[`4cb22548da81dd8b186a6ef1cf120aea99c85c62`](https://github.com/clerk/javascript/commit/4cb22548da81dd8b186a6ef1cf120aea99c85c62)]:
  - @clerk/shared@2.19.2
  - @clerk/backend@1.20.1

## 2.0.25

### Patch Changes

- Updated dependencies [[`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99), [`550c7e9851329688e37be29b83ea0c3b12482af7`](https://github.com/clerk/javascript/commit/550c7e9851329688e37be29b83ea0c3b12482af7), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99)]:
  - @clerk/backend@1.20.0
  - @clerk/types@4.39.0
  - @clerk/shared@2.19.1

## 2.0.24

### Patch Changes

- Updated dependencies [[`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3), [`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3)]:
  - @clerk/shared@2.19.0
  - @clerk/types@4.38.0
  - @clerk/backend@1.19.2

## 2.0.23

### Patch Changes

- Updated dependencies [[`4e5e7f463c12893a21cb3b5f9317fc3f2945879b`](https://github.com/clerk/javascript/commit/4e5e7f463c12893a21cb3b5f9317fc3f2945879b)]:
  - @clerk/types@4.37.0
  - @clerk/backend@1.19.1
  - @clerk/shared@2.18.1

## 2.0.22

### Patch Changes

- Updated dependencies [[`8ee5d84995fa17532491ff96efac5738c9bcd9ef`](https://github.com/clerk/javascript/commit/8ee5d84995fa17532491ff96efac5738c9bcd9ef), [`09fedd1df155d30cc055ce701b133aa6470e9b47`](https://github.com/clerk/javascript/commit/09fedd1df155d30cc055ce701b133aa6470e9b47), [`b6aa589f75be62a89a3853d496176ed2f2c0e2c5`](https://github.com/clerk/javascript/commit/b6aa589f75be62a89a3853d496176ed2f2c0e2c5), [`235eaae4c3c9400492fca47d20a47c7081041565`](https://github.com/clerk/javascript/commit/235eaae4c3c9400492fca47d20a47c7081041565)]:
  - @clerk/types@4.36.0
  - @clerk/backend@1.19.0
  - @clerk/shared@2.18.0

## 2.0.21

### Patch Changes

- Updated dependencies [[`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d), [`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d)]:
  - @clerk/types@4.35.1
  - @clerk/backend@1.18.1
  - @clerk/shared@2.17.1

## 2.0.20

### Patch Changes

- Updated dependencies [[`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`d84d7e31235c5c7da3415981dc76db4473a71a39`](https://github.com/clerk/javascript/commit/d84d7e31235c5c7da3415981dc76db4473a71a39), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`dce4f7ffca7248c0500f0ec9a978672b1f2fad69`](https://github.com/clerk/javascript/commit/dce4f7ffca7248c0500f0ec9a978672b1f2fad69)]:
  - @clerk/shared@2.17.0
  - @clerk/types@4.35.0
  - @clerk/backend@1.18.0

## 2.0.19

### Patch Changes

- Updated dependencies [[`c70994b5b6f92a6550dfe37547f01bbfa810c223`](https://github.com/clerk/javascript/commit/c70994b5b6f92a6550dfe37547f01bbfa810c223), [`7623a99594e7329200b6b374e483152d7679ce66`](https://github.com/clerk/javascript/commit/7623a99594e7329200b6b374e483152d7679ce66)]:
  - @clerk/types@4.34.2
  - @clerk/backend@1.17.2
  - @clerk/shared@2.16.1

## 2.0.18

### Patch Changes

- Updated dependencies [[`e47eb5882a7fd4a8dee25933c6644790d6ea3407`](https://github.com/clerk/javascript/commit/e47eb5882a7fd4a8dee25933c6644790d6ea3407), [`273d16cb0665d4d960838cb294dc356f41814745`](https://github.com/clerk/javascript/commit/273d16cb0665d4d960838cb294dc356f41814745), [`6b0961765e1f3d09679be4b163fa13ac7dd97191`](https://github.com/clerk/javascript/commit/6b0961765e1f3d09679be4b163fa13ac7dd97191)]:
  - @clerk/shared@2.16.0
  - @clerk/types@4.34.1
  - @clerk/backend@1.17.1

## 2.0.17

### Patch Changes

- Updated dependencies [[`536fa996ff84a545678a3036b28409824d1c00dd`](https://github.com/clerk/javascript/commit/536fa996ff84a545678a3036b28409824d1c00dd), [`b28c5e8bc44885bf6b1533df48e872ba90c387da`](https://github.com/clerk/javascript/commit/b28c5e8bc44885bf6b1533df48e872ba90c387da)]:
  - @clerk/backend@1.17.0
  - @clerk/shared@2.15.0

## 2.0.16

### Patch Changes

- Updated dependencies [[`46faeb6f59b19c963fb137c858347525b1cd9e19`](https://github.com/clerk/javascript/commit/46faeb6f59b19c963fb137c858347525b1cd9e19), [`ea6c52dd751abe38b350ee07f148652c24125e22`](https://github.com/clerk/javascript/commit/ea6c52dd751abe38b350ee07f148652c24125e22)]:
  - @clerk/shared@2.14.0
  - @clerk/types@4.34.0
  - @clerk/backend@1.16.4

## 2.0.15

### Patch Changes

- Updated dependencies [[`1c0b5001f7f975a2f3f54ad692526ecf7257847e`](https://github.com/clerk/javascript/commit/1c0b5001f7f975a2f3f54ad692526ecf7257847e), [`6217a3f7c94311d49f873214bd406961e0b8d6f7`](https://github.com/clerk/javascript/commit/6217a3f7c94311d49f873214bd406961e0b8d6f7), [`1783025cdb94c447028704c2121fa0b8af785904`](https://github.com/clerk/javascript/commit/1783025cdb94c447028704c2121fa0b8af785904)]:
  - @clerk/types@4.33.0
  - @clerk/shared@2.13.0
  - @clerk/backend@1.16.3

## 2.0.14

### Patch Changes

- Updated dependencies [[`ff4ebeba6c2a77c247a946070b56bdb2153d1588`](https://github.com/clerk/javascript/commit/ff4ebeba6c2a77c247a946070b56bdb2153d1588)]:
  - @clerk/backend@1.16.2

## 2.0.13

### Patch Changes

- Updated dependencies [[`7dbad4c5abd226d7b10941a626ead5d85b1a3f24`](https://github.com/clerk/javascript/commit/7dbad4c5abd226d7b10941a626ead5d85b1a3f24)]:
  - @clerk/types@4.32.0
  - @clerk/backend@1.16.1
  - @clerk/shared@2.12.1

## 2.0.12

### Patch Changes

- Updated dependencies [[`b185e42e5136de3511a0b37ce9b0030022ba679e`](https://github.com/clerk/javascript/commit/b185e42e5136de3511a0b37ce9b0030022ba679e), [`5a21de1f46df3642828dc27e4862263c9858da2b`](https://github.com/clerk/javascript/commit/5a21de1f46df3642828dc27e4862263c9858da2b), [`f7472e22877f62fc7f3c8d3efe409ff2276fb4a3`](https://github.com/clerk/javascript/commit/f7472e22877f62fc7f3c8d3efe409ff2276fb4a3), [`e10232c56551bf0cffc11246f2ff9aa58ec584d7`](https://github.com/clerk/javascript/commit/e10232c56551bf0cffc11246f2ff9aa58ec584d7), [`e199037b8f484abdeeb9fc24455a1b4b8c31c8dd`](https://github.com/clerk/javascript/commit/e199037b8f484abdeeb9fc24455a1b4b8c31c8dd), [`886e294a8d8c54b39cd5bda88d46b89eace3861e`](https://github.com/clerk/javascript/commit/886e294a8d8c54b39cd5bda88d46b89eace3861e), [`0e443ad7c76643420b50e5b169193e03f6ef79f9`](https://github.com/clerk/javascript/commit/0e443ad7c76643420b50e5b169193e03f6ef79f9), [`cc24c8145f1eea7fb91550f2c3e0bac3993e4320`](https://github.com/clerk/javascript/commit/cc24c8145f1eea7fb91550f2c3e0bac3993e4320)]:
  - @clerk/backend@1.16.0
  - @clerk/shared@2.12.0
  - @clerk/types@4.31.0

## 2.0.11

### Patch Changes

- Updated dependencies [[`8a04ae47b8305f994b348301fd8134d5baf02943`](https://github.com/clerk/javascript/commit/8a04ae47b8305f994b348301fd8134d5baf02943)]:
  - @clerk/shared@2.11.5
  - @clerk/backend@1.15.7

## 2.0.10

### Patch Changes

- Updated dependencies [[`d74a6a7c0f291104c6bba722a8c432814d7b336e`](https://github.com/clerk/javascript/commit/d74a6a7c0f291104c6bba722a8c432814d7b336e), [`1a0c8fe665869e732d3c800bde0f5219fce54301`](https://github.com/clerk/javascript/commit/1a0c8fe665869e732d3c800bde0f5219fce54301), [`0800fc3f1f4e1b6a1d13f5c02557001a283af6e8`](https://github.com/clerk/javascript/commit/0800fc3f1f4e1b6a1d13f5c02557001a283af6e8)]:
  - @clerk/types@4.30.0
  - @clerk/shared@2.11.4
  - @clerk/backend@1.15.6

## 2.0.9

### Patch Changes

- Updated dependencies [[`a7726cc12a824b278f6d2a37cb1901c38c5f70dc`](https://github.com/clerk/javascript/commit/a7726cc12a824b278f6d2a37cb1901c38c5f70dc)]:
  - @clerk/shared@2.11.3
  - @clerk/backend@1.15.5

## 2.0.6

### Patch Changes

- Updated dependencies [[`f875463da`](https://github.com/clerk/javascript/commit/f875463da9692f2d173b6d5388743cf720750ae3), [`5be7ca9fd`](https://github.com/clerk/javascript/commit/5be7ca9fd239c937cc88e20ce8f5bfc9f3b84f22), [`08c5a2add`](https://github.com/clerk/javascript/commit/08c5a2add6872c76e62fc0df06db723e3728452e), [`434b432f8`](https://github.com/clerk/javascript/commit/434b432f8c114825120eef0f2c278b8142ed1563)]:
  - @clerk/types@4.29.0
  - @clerk/shared@2.11.0
  - @clerk/backend@1.15.2

## 2.0.5

### Patch Changes

- Updated dependencies [[`3fdcdbf88`](https://github.com/clerk/javascript/commit/3fdcdbf88c38facf8b82563f634ec1b6604fd8e5), [`1c7e105a3`](https://github.com/clerk/javascript/commit/1c7e105a32fd492cc175ef9fd1c1fa0428c259dc)]:
  - @clerk/types@4.28.0
  - @clerk/backend@1.15.1
  - @clerk/shared@2.10.1

## 2.0.4

### Patch Changes

- Updated dependencies [[`93dfe7a09`](https://github.com/clerk/javascript/commit/93dfe7a09648f414ee3f50bc8fb3f342d24020cd), [`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc), [`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc)]:
  - @clerk/backend@1.15.0
  - @clerk/shared@2.10.0
  - @clerk/types@4.27.0

## 2.0.3

### Patch Changes

- Updated dependencies [[`e1a26547a`](https://github.com/clerk/javascript/commit/e1a26547a9c65f4c79c2bbd4dc386ddf67c2fbee)]:
  - @clerk/backend@1.14.1

## 2.0.2

### Patch Changes

- Updated dependencies [[`e81d45b72`](https://github.com/clerk/javascript/commit/e81d45b72c81403c7c206dac5454de1fef6bec57), [`752ce9bfa`](https://github.com/clerk/javascript/commit/752ce9bfa47a8eebd38cd272eeb58ae26fea3371), [`99cdf9b67`](https://github.com/clerk/javascript/commit/99cdf9b67d1e99e66cc73d8a5bfce1f1f8df1b83), [`ce40ff6f0`](https://github.com/clerk/javascript/commit/ce40ff6f0d3bc79e33375be6dd5e03f140a07000), [`fb7ba1f34`](https://github.com/clerk/javascript/commit/fb7ba1f3485abdeac5e504cce6c2d84d3f3e4ffc), [`2102052c0`](https://github.com/clerk/javascript/commit/2102052c017065ab511339870fcebaa6719f2702)]:
  - @clerk/types@4.26.0
  - @clerk/shared@2.9.2
  - @clerk/backend@1.14.0

## 2.0.1

### Patch Changes

- Updated dependencies [[`d64e54c40`](https://github.com/clerk/javascript/commit/d64e54c40c9cf001b25e45a1b8939c9f7e80c6d6), [`2ba2fd148`](https://github.com/clerk/javascript/commit/2ba2fd1483b7561d7df9a1952ead0ee15e422131)]:
  - @clerk/shared@2.9.1
  - @clerk/types@4.25.1
  - @clerk/backend@1.13.10

## 2.0.0

### Major Changes

- Recently Fastify released its v5 and along with it came some breaking changes. Read their [migration guide](https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/) to learn more. ([#4270](https://github.com/clerk/javascript/pull/4270)) by [@LekoArts](https://github.com/LekoArts)

  In order to support Fastify v5 a new major version of `@clerk/fastify` is required as Fastify's Node.js requirement is now `>=20`. Previously `@clerk/fastify` allowed `>=18.17.0`.

  `@clerk/fastify@2.0.0` only supports Fastify v5 or later, if you want/need to continue using Fastify v4, please stick with your current version. The `@clerk/fastify@2.0.0` upgrade itself doesn't have any required code changes as only internal dependencies and requirements were updated.

### Patch Changes

- Updated dependencies [[`358be296a`](https://github.com/clerk/javascript/commit/358be296a8181bb256fc1e15f878932c741b8743)]:
  - @clerk/backend@1.13.9

## 1.0.51

### Patch Changes

- Updated dependencies [[`fb932e5cf`](https://github.com/clerk/javascript/commit/fb932e5cf21315adf60bee0855b6bd5ee2ff9867)]:
  - @clerk/shared@2.9.0
  - @clerk/types@4.25.0
  - @clerk/backend@1.13.8

## 1.0.50

### Patch Changes

- Updated dependencies [[`f6fb8b53d`](https://github.com/clerk/javascript/commit/f6fb8b53d236863ad7eca576ee7a16cd33f3506b), [`4a8570590`](https://github.com/clerk/javascript/commit/4a857059059a02bb4f20893e08601e1e67babbed)]:
  - @clerk/types@4.24.0
  - @clerk/backend@1.13.7
  - @clerk/shared@2.8.5

## 1.0.49

### Patch Changes

- Updated dependencies [[`3e9160072`](https://github.com/clerk/javascript/commit/3e9160072aea72455a3db9cc710680a0a5359c55), [`748c0bae4`](https://github.com/clerk/javascript/commit/748c0bae4cfa1c2a721267fc9de7c6458200beb4), [`b579c3685`](https://github.com/clerk/javascript/commit/b579c36850126d994a96affa89bb1abc618ec38e)]:
  - @clerk/backend@1.13.6

## 1.0.48

### Patch Changes

- Updated dependencies [[`4749ed4c5`](https://github.com/clerk/javascript/commit/4749ed4c55a5ba5810451b8d436aad0d49829050), [`f1f17eaab`](https://github.com/clerk/javascript/commit/f1f17eaabed0dc4b7de405fb77d85503cf75ad33), [`2e35ac538`](https://github.com/clerk/javascript/commit/2e35ac53885f8008779940d41d1e804fa77ebfa9)]:
  - @clerk/backend@1.13.5
  - @clerk/types@4.23.0
  - @clerk/shared@2.8.4

## 1.0.47

### Patch Changes

- Updated dependencies [[`c9063853e`](https://github.com/clerk/javascript/commit/c9063853e538a4010f5d4e522a3da5abc80098a4), [`19d3808d4`](https://github.com/clerk/javascript/commit/19d3808d4672234944226d6709ec51214e8d6e1d), [`737bcbb0f`](https://github.com/clerk/javascript/commit/737bcbb0ffb5e2dcadbb02e8fc718fe8825c5842)]:
  - @clerk/types@4.22.0
  - @clerk/backend@1.13.4
  - @clerk/shared@2.8.3

## 1.0.46

### Patch Changes

- Updated dependencies [[`cb32aaf59`](https://github.com/clerk/javascript/commit/cb32aaf59d38dcd12e959f542782f71a87adf9c1), [`2e5c550e4`](https://github.com/clerk/javascript/commit/2e5c550e4aec61150c2a17fdcd4a0e1273cb50e7), [`6275c242c`](https://github.com/clerk/javascript/commit/6275c242cd8bcb6f7766934059967e0fe775a0c1), [`418be2fdb`](https://github.com/clerk/javascript/commit/418be2fdb558bb5c85d7be491945935b44cad681), [`c59636a1a`](https://github.com/clerk/javascript/commit/c59636a1aca67be7d6732d281cec307ed456678b), [`5c18671f1`](https://github.com/clerk/javascript/commit/5c18671f158f8077f822877ce5c1fa192199aeda), [`f9faaf031`](https://github.com/clerk/javascript/commit/f9faaf03100baf679c78e6c24877fbf3b60be529), [`e0ca9dc94`](https://github.com/clerk/javascript/commit/e0ca9dc94fa68f3d3db5d2433fa6b85d800d4ca2)]:
  - @clerk/shared@2.8.2
  - @clerk/types@4.21.1
  - @clerk/backend@1.13.3

## 1.0.45

### Patch Changes

- Updated dependencies [[`02babaccb`](https://github.com/clerk/javascript/commit/02babaccb648fa4e22f38cc0f572d44f82b09f78)]:
  - @clerk/backend@1.13.2

## 1.0.44

### Patch Changes

- Updated dependencies [[`3743eb911`](https://github.com/clerk/javascript/commit/3743eb9114733f20ed56a863ab98fa9c363b6723)]:
  - @clerk/shared@2.8.1
  - @clerk/backend@1.13.1

## 1.0.43

### Patch Changes

- Updated dependencies [[`e578b1599`](https://github.com/clerk/javascript/commit/e578b1599451d9f2122f12d835b510b26882e839)]:
  - @clerk/backend@1.13.0

## 1.0.42

### Patch Changes

- Updated dependencies [[`ba19be354`](https://github.com/clerk/javascript/commit/ba19be35461f0e5c76a58d11e4252a16781322c6), [`8cecbe875`](https://github.com/clerk/javascript/commit/8cecbe8756f58879c4b14b799700a25a83c1f00a), [`248142a6d`](https://github.com/clerk/javascript/commit/248142a6ded6ca937d0df7d628197f25228aadec), [`1189f71f8`](https://github.com/clerk/javascript/commit/1189f71f872f2683c12de5add5f154aeb953ca8d), [`a5e95295b`](https://github.com/clerk/javascript/commit/a5e95295b88acc6953d07a22d818e123774aeffa)]:
  - @clerk/shared@2.8.0
  - @clerk/backend@1.12.0
  - @clerk/types@4.21.0

## 1.0.41

### Patch Changes

- Updated dependencies [[`be3b119f8`](https://github.com/clerk/javascript/commit/be3b119f840d2ae74f4b75d717711d53ac0e5f54)]:
  - @clerk/shared@2.7.2
  - @clerk/backend@1.11.1

## 1.0.40

### Patch Changes

- Updated dependencies [[`b97b2c1ca`](https://github.com/clerk/javascript/commit/b97b2c1cae5cb1e569708a8745c13d203beb81d9), [`8c6909d46`](https://github.com/clerk/javascript/commit/8c6909d46328c943f1d464a28f1a324a27d0f3f1)]:
  - @clerk/backend@1.11.0
  - @clerk/types@4.20.1
  - @clerk/shared@2.7.1

## 1.0.39

### Patch Changes

- Updated dependencies [[`c63a5adf0`](https://github.com/clerk/javascript/commit/c63a5adf0ba4b99252146f168318f51b709bb5dd), [`8823c21a2`](https://github.com/clerk/javascript/commit/8823c21a26bc81cbc3ed007908b1a9ea474bd343), [`95ac67a14`](https://github.com/clerk/javascript/commit/95ac67a143c263bef0c1f589728566ab8f95768d), [`a0cb062fa`](https://github.com/clerk/javascript/commit/a0cb062faa4d23bef7a577e5cc486f4c5efe6bfa), [`746b4ed5e`](https://github.com/clerk/javascript/commit/746b4ed5e2007505d5850a2a728484809474d7bf)]:
  - @clerk/backend@1.10.0
  - @clerk/types@4.20.0
  - @clerk/shared@2.7.0

## 1.0.38

### Patch Changes

- Updated dependencies [[`8a3b9f079`](https://github.com/clerk/javascript/commit/8a3b9f0793484b32dd609a5c80a194e62151d6ea), [`e95c28196`](https://github.com/clerk/javascript/commit/e95c2819675cea7963f2404e5f71f37ebed8d5e0), [`1fe744328`](https://github.com/clerk/javascript/commit/1fe744328d126bc597e81770119796ac18e055ed)]:
  - @clerk/types@4.19.0
  - @clerk/backend@1.9.2
  - @clerk/shared@2.6.2

## 1.0.37

### Patch Changes

- Updated dependencies [[`82593173a`](https://github.com/clerk/javascript/commit/82593173aafbf6646e12c5779627cdcb138a1f27), [`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733)]:
  - @clerk/types@4.18.0
  - @clerk/backend@1.9.1
  - @clerk/shared@2.6.1

## 1.0.36

### Patch Changes

- Tidy up and improve README ([#4053](https://github.com/clerk/javascript/pull/4053)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`c9ef59106`](https://github.com/clerk/javascript/commit/c9ef59106c4720af3012586f5656f7b54cf2e336), [`fece72014`](https://github.com/clerk/javascript/commit/fece72014e2d39c8343a7329ae677badcba56d15), [`58e6754ad`](https://github.com/clerk/javascript/commit/58e6754ad9f9a1244b023ce1f5e5f2c1c4eb20e7), [`13693018f`](https://github.com/clerk/javascript/commit/13693018f4f7ac5d224698aa730e20960896f68c), [`3aa63dc5a`](https://github.com/clerk/javascript/commit/3aa63dc5a48161cfe92d94093ef0c32efd401342), [`9d0477781`](https://github.com/clerk/javascript/commit/9d04777814bf6d86d05506838b101e7cfc7c208d), [`3304dcc0b`](https://github.com/clerk/javascript/commit/3304dcc0bc93a92a7f729f585c60ff91d2ae04f6)]:
  - @clerk/backend@1.9.0
  - @clerk/types@4.17.0
  - @clerk/shared@2.6.0

## 1.0.35

### Patch Changes

- Updated dependencies [[`c1389492d`](https://github.com/clerk/javascript/commit/c1389492d8b6a9292ab04889bf776c0f45e66845)]:
  - @clerk/types@4.16.0
  - @clerk/backend@1.8.3
  - @clerk/shared@2.5.5

## 1.0.34

### Patch Changes

- Updated dependencies [[`0158c774a`](https://github.com/clerk/javascript/commit/0158c774af2243a2cd13b55c4d6fae877178c961), [`8be1a7abc`](https://github.com/clerk/javascript/commit/8be1a7abc8849d7d59552011bd6b25bc917d51f5)]:
  - @clerk/types@4.15.1
  - @clerk/backend@1.8.2
  - @clerk/shared@2.5.4

## 1.0.33

### Patch Changes

- Updated dependencies [[`247b3fd75`](https://github.com/clerk/javascript/commit/247b3fd75042365dc9f950db056b76f9fadfdcf6)]:
  - @clerk/types@4.15.0
  - @clerk/backend@1.8.1
  - @clerk/shared@2.5.3

## 1.0.32

### Patch Changes

- Updated dependencies [[`ed7baa048`](https://github.com/clerk/javascript/commit/ed7baa0488df0ee4c48add2aac934ffb47e4a6d2)]:
  - @clerk/backend@1.8.0

## 1.0.31

### Patch Changes

- Updated dependencies [[`dc0e1c33d`](https://github.com/clerk/javascript/commit/dc0e1c33d6844b028cb1ee11c3359b886d609f3c), [`dc94c0834`](https://github.com/clerk/javascript/commit/dc94c08341c883fa5bf891f880fb34c4569ea820)]:
  - @clerk/types@4.14.0
  - @clerk/backend@1.7.0
  - @clerk/shared@2.5.2

## 1.0.30

### Patch Changes

- Updated dependencies [[`7e0ced3da`](https://github.com/clerk/javascript/commit/7e0ced3da94f41056bc4445d163d3b615afb6ab1), [`b6f0613dc`](https://github.com/clerk/javascript/commit/b6f0613dc9d8b0bab41cfabbaa8621b126e3bdf5)]:
  - @clerk/shared@2.5.1
  - @clerk/types@4.13.1
  - @clerk/backend@1.6.3

## 1.0.29

### Patch Changes

- Updated dependencies [[`59d5f19d3`](https://github.com/clerk/javascript/commit/59d5f19d333bf4a35c244886e93b4368e215225c), [`4e6c94e3f`](https://github.com/clerk/javascript/commit/4e6c94e3f4cc92cbba8bddcd2b90fcc9cfb83763)]:
  - @clerk/shared@2.5.0
  - @clerk/types@4.13.0
  - @clerk/backend@1.6.2

## 1.0.28

### Patch Changes

- Internal change: Use `AuthObject` type import from `@clerk/backend`. ([#3844](https://github.com/clerk/javascript/pull/3844)) by [@kduprey](https://github.com/kduprey)

- Updated dependencies [[`d7bf0f87c`](https://github.com/clerk/javascript/commit/d7bf0f87c4c50bc19d2796bca32bd694046a23b0), [`9b2aeacb3`](https://github.com/clerk/javascript/commit/9b2aeacb32fff7c300bda458636a1cc81a42ee7b)]:
  - @clerk/backend@1.6.1
  - @clerk/types@4.12.1
  - @clerk/shared@2.4.5

## 1.0.27

### Patch Changes

- Updated dependencies [[`7e94fcf0f`](https://github.com/clerk/javascript/commit/7e94fcf0fcbee8842a54f7931c45190370aa870d)]:
  - @clerk/backend@1.6.0
  - @clerk/types@4.12.0
  - @clerk/shared@2.4.4

## 1.0.26

### Patch Changes

- Updated dependencies [[`568186cad`](https://github.com/clerk/javascript/commit/568186cad29acaf0b084a9f86ccb9d29bd23fcf4), [`407195270`](https://github.com/clerk/javascript/commit/407195270ed8aab6eef18c64a4918e3870fef471)]:
  - @clerk/types@4.11.0
  - @clerk/backend@1.5.2
  - @clerk/shared@2.4.3

## 1.0.25

### Patch Changes

- Updated dependencies [[`992e5960c`](https://github.com/clerk/javascript/commit/992e5960c785eace83f3bad7c34d589fa313dcaf)]:
  - @clerk/backend@1.5.1

## 1.0.24

### Patch Changes

- Updated dependencies [[`fde5b5e7e`](https://github.com/clerk/javascript/commit/fde5b5e7e6fb5faa4267e06d82a38a176165b4f4), [`aa06f3ba7`](https://github.com/clerk/javascript/commit/aa06f3ba7e725071c90d4a1d6840060236da3c23), [`80e647731`](https://github.com/clerk/javascript/commit/80e64773135865434cf0e6c220e287397aa07937)]:
  - @clerk/backend@1.5.0
  - @clerk/types@4.10.0
  - @clerk/shared@2.4.2

## 1.0.23

### Patch Changes

- Updated dependencies [[`b48689705`](https://github.com/clerk/javascript/commit/b48689705f9fc2251d2f24addec7a0d0b1da0fe1)]:
  - @clerk/types@4.9.1
  - @clerk/backend@1.4.3
  - @clerk/shared@2.4.1

## 1.0.22

### Patch Changes

- Updated dependencies [[`d465d7069`](https://github.com/clerk/javascript/commit/d465d70696bf26270cb2efbf4695ca49016fcb96)]:
  - @clerk/backend@1.4.2

## 1.0.21

### Patch Changes

- Updated dependencies [[`045fb93cb`](https://github.com/clerk/javascript/commit/045fb93cbf577ca84e5b95fc6dfaacde67693be2)]:
  - @clerk/backend@1.4.1

## 1.0.20

### Patch Changes

- Updated dependencies [[`b87f7b9e1`](https://github.com/clerk/javascript/commit/b87f7b9e163756fd43789bc7b7344d2eb24015ec), [`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`86c75e50c`](https://github.com/clerk/javascript/commit/86c75e50cba9c4efb480672f1b8c6a6fff4ef477)]:
  - @clerk/backend@1.4.0
  - @clerk/shared@2.4.0
  - @clerk/types@4.9.0

## 1.0.19

### Patch Changes

- Updated dependencies [[`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7)]:
  - @clerk/types@4.8.0
  - @clerk/backend@1.3.2
  - @clerk/shared@2.3.3

## 1.0.18

### Patch Changes

- Updated dependencies [[`5642b2616`](https://github.com/clerk/javascript/commit/5642b26167a6eb1aca68777d782a9686edacfd37)]:
  - @clerk/backend@1.3.1

## 1.0.17

### Patch Changes

- Updated dependencies [[`f1847b70b`](https://github.com/clerk/javascript/commit/f1847b70b2327bd490faf1f3eed1aa5639d54993)]:
  - @clerk/backend@1.3.0

## 1.0.16

### Patch Changes

- Updated dependencies [[`d6b5006c4`](https://github.com/clerk/javascript/commit/d6b5006c4cc1b6f07bb3a6832b4ec6e65ea15814)]:
  - @clerk/types@4.7.0
  - @clerk/backend@1.2.5
  - @clerk/shared@2.3.2

## 1.0.15

### Patch Changes

- Updated dependencies [[`1273b04ec`](https://github.com/clerk/javascript/commit/1273b04ecf1866b59ef59a74abe31dbcc726da2c)]:
  - @clerk/types@4.6.1
  - @clerk/backend@1.2.4
  - @clerk/shared@2.3.1

## 1.0.14

### Patch Changes

- Updated dependencies [[`4ec3f63e2`](https://github.com/clerk/javascript/commit/4ec3f63e26d8d3725a7ba9bbf988a7776fe893ff)]:
  - @clerk/shared@2.3.0
  - @clerk/backend@1.2.3

## 1.0.13

### Patch Changes

- Updated dependencies [[`86a27f693`](https://github.com/clerk/javascript/commit/86a27f6933de50c99b6bc354bf87ff5c2cfcaf38), [`02bed2e00`](https://github.com/clerk/javascript/commit/02bed2e00d3e0a4e1bb1698b13267faf6aeb31b3), [`73e5d61e2`](https://github.com/clerk/javascript/commit/73e5d61e21ab3f77f3c8343bc63da0626466c7ac), [`b8e46328d`](https://github.com/clerk/javascript/commit/b8e46328da874859c4928f19f924219cd6520b11)]:
  - @clerk/shared@2.2.2
  - @clerk/backend@1.2.2
  - @clerk/types@4.6.0

## 1.0.12

### Patch Changes

- Updated dependencies [[`4beb00672`](https://github.com/clerk/javascript/commit/4beb00672da64bafd67fbc98181c4c2649a9062c)]:
  - @clerk/types@4.5.1

## 1.0.11

### Patch Changes

- Updated dependencies [[`ff31f7255`](https://github.com/clerk/javascript/commit/ff31f725541d82caaa9c13cf42cf15f8ce3992f4), [`0e48fc210`](https://github.com/clerk/javascript/commit/0e48fc210cf0b5852052a21494a05f6e723101f5)]:
  - @clerk/shared@2.2.1
  - @clerk/backend@1.2.1

## 1.0.10

### Patch Changes

- Updated dependencies [[`d6a9b3f5d`](https://github.com/clerk/javascript/commit/d6a9b3f5dd8c64b1bd49f74c3707eb01dcd6aff4), [`456b06849`](https://github.com/clerk/javascript/commit/456b068493b8679e1772819eea24d49aa1bc6556), [`6888594cc`](https://github.com/clerk/javascript/commit/6888594cc5d0f922d166b6d28b7b994d657a5595)]:
  - @clerk/types@4.5.0
  - @clerk/shared@2.2.0
  - @clerk/backend@1.2.0

## 1.0.9

### Patch Changes

- Updated dependencies [[`3d790d5ea`](https://github.com/clerk/javascript/commit/3d790d5ea347a51ef16557c015c901a9f277effe)]:
  - @clerk/types@4.4.0

## 1.0.8

### Patch Changes

- Updated dependencies [[`eae0a32d5`](https://github.com/clerk/javascript/commit/eae0a32d5c9e97ccbfd96e001c2cac6bc753b5b3)]:
  - @clerk/types@4.3.1

## 1.0.7

### Patch Changes

- Updated dependencies [[`4d3dc00fb`](https://github.com/clerk/javascript/commit/4d3dc00fb444c87e3d27f398cd0c1ce4d176f65b), [`ec84d51e7`](https://github.com/clerk/javascript/commit/ec84d51e705370273ffb82a0d7c94d90ba3de874)]:
  - @clerk/backend@1.1.5
  - @clerk/shared@2.1.1

## 1.0.6

### Patch Changes

- Updated dependencies [[`94197710a`](https://github.com/clerk/javascript/commit/94197710a70381c4f1c460948ef02cd2a70b88bb), [`b27ca8366`](https://github.com/clerk/javascript/commit/b27ca8366a1d6ec1d7ce4a5be5005f1b1b017c20)]:
  - @clerk/types@4.3.0
  - @clerk/shared@2.1.0
  - @clerk/backend@1.1.4

## 1.0.5

### Patch Changes

- Updated dependencies [[`b92402258`](https://github.com/clerk/javascript/commit/b924022580569c934a9d33310449b4a50156070a)]:
  - @clerk/backend@1.1.3

## 1.0.4

### Patch Changes

- Updated dependencies [[`4f4375e88`](https://github.com/clerk/javascript/commit/4f4375e88fa2daae4d725c62da5e4cf29302e53c), [`1662aaae9`](https://github.com/clerk/javascript/commit/1662aaae965fcf36b13dba6b148e096ab6a1cd83), [`f70c885f7`](https://github.com/clerk/javascript/commit/f70c885f798f7ff513f6687f87c8a56daf26fa05), [`4ae79af36`](https://github.com/clerk/javascript/commit/4ae79af36552aae1f0284ecc4dfcfc23ef295d26), [`f5804a225`](https://github.com/clerk/javascript/commit/f5804a225e9d67cd315700f0ced0ff17b8b14e53)]:
  - @clerk/backend@1.1.2
  - @clerk/shared@2.0.2
  - @clerk/types@4.2.1

## 1.0.3

### Patch Changes

- Updated dependencies [[`8fbe23857`](https://github.com/clerk/javascript/commit/8fbe23857bc588a4662af78ee33b24123cd8bc2e), [`a78bc447c`](https://github.com/clerk/javascript/commit/a78bc447c1aabaa41bcbaa2a8fe3c48f31275574), [`c7d626292`](https://github.com/clerk/javascript/commit/c7d626292a9fd12ca0f1b31a1035e711b6e99531), [`19cd42434`](https://github.com/clerk/javascript/commit/19cd42434450e568998336bf6d705e475122abbc)]:
  - @clerk/backend@1.1.1
  - @clerk/shared@2.0.1
  - @clerk/types@4.2.0

## 1.0.2

### Patch Changes

- Updated dependencies [[`b3fda50f0`](https://github.com/clerk/javascript/commit/b3fda50f03672106c6858219fc607d226851ec10), [`b3ad7a459`](https://github.com/clerk/javascript/commit/b3ad7a459c46be1f8967faf73c2cdd96406593c8), [`4e5de1164`](https://github.com/clerk/javascript/commit/4e5de1164d956c7dc21f72d25e312296d36504a7)]:
  - @clerk/backend@1.1.0

## 1.0.1

### Patch Changes

- Updated dependencies [[`3c6e5a6f1`](https://github.com/clerk/javascript/commit/3c6e5a6f1dd0ac198e6e48d1b83c6d4846a7f900), [`65503dcb9`](https://github.com/clerk/javascript/commit/65503dcb97acb9538e5c0e3f8199d20ad31c9d7d), [`956d8792f`](https://github.com/clerk/javascript/commit/956d8792fefe9d6a89022f1e938149b25503ec7f)]:
  - @clerk/backend@1.0.1
  - @clerk/types@4.1.0

## 1.0.0

### Major Changes

- c2a090513: Change the minimal Node.js version required by Clerk to `18.17.0`.
- 71663c568: Internal update default apiUrl domain from clerk.dev to clerk.com
- cfb50e1f6: Drop deprecations. Migration steps:
  - use `CLERK_SECRET_KEY` instead of `CLERK_API_KEY` env variable
  - use `secretKey` instead of `apiKey`
  - use `CLERK_PUBLISHABLE_KEY` instead of `CLERK_FRONTEND_API` env variable
  - use `publishableKey` instead of `frontendApi`
- 97407d8aa: Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now.
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
- 02976d494: (Note: This is only relevant if, in the unlikely case, you are using `Clerk` from `@clerk/fastify` directly. If not, you can safely ignore this change.)

  Remove the named `Clerk` import from `@clerk/fastify` and import `createClerkClient` instead. The latter is a factory method to create a Clerk client instance for you. This update aligns usage across our SDKs and will enable us to ship DX improvements better in the future.

  ```js
  import { Clerk } from '@clerk/fastify';
  const clerk = Clerk({ secretKey: '...' });
  ```

  You need to rename the import from `Clerk` to `createClerkClient` and change its usage:

  ```js
  import { createClerkClient } from '@clerk/fastify';
  const clerk = createClerkClient({ secretKey: '...' });
  ```

### Minor Changes

- 4a93c6720: Introduce handshake mechanism and `x-clerk-auth-status` in response
- 629881cba: Re-export everything from `@clerk/backend` in `@clerk/fastify` to support common backend types and functionality without adding `@clerk/backend` as dependency.

  New exports:
  - `verifyToken()`

  New exported types:
  - `ClerkOptions`
  - `ClerkClient`
  - `OrganizationMembershipRole`
  - `VerifyTokenOptions`
  - `WebhookEvent`
  - `WebhookEventType`
  - `AllowlistIdentifier`
  - `Client`
  - `EmailAddress`
  - `ExternalAccount`
  - `Invitation`
  - `OauthAccessToken`
  - `Organization`
  - `OrganizationInvitation`
  - `OrganizationMembership`
  - `OrganizationMembershipPublicUserData`
  - `PhoneNumber`
  - `Session`
  - `SignInToken`
  - `SMSMessage`
  - `Token`
  - `User`

- 2964f8a47: Expose debug headers in response for handshake / signed-out states from SDKs using headers returned from `authenticateRequest()`
- 18c0d015d: Pass environment into `sdkMetadata` in order to detect if production clerk-js is used by other sdks in dev mode. When it is log dev warning from clerk-js.
- b4e79c1b9: Replace the `Clerk-Backend-SDK` header with `User-Agent` in BAPI requests and update it's value to contain both the package name and the package version of the clerk package
  executing the request. Eg request from `@clerk/nextjs` to BAPI with append `User-Agent: @clerk/nextjs@5.0.0-alpha-v5.16` using the latest version.

  Miscellaneous changes: The backend test build changed to use tsup.

### Patch Changes

- 2de442b24: Rename beta-v5 to beta
- 2e77cd737: Set correct information on required Node.js and React versions in README
- 7644b7472: Improve the default value for `CLERK_API_URL` by utilizing the publishable key to differentiate between local, staging and prod environments.
- 40ac4b645: Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry.
- Updated dependencies [3a2f13604]
- Updated dependencies [8c23651b8]
- Updated dependencies [f4f99f18d]
- Updated dependencies [743c4d204]
- Updated dependencies [4b8bedc66]
- Updated dependencies [9272006e7]
- Updated dependencies [1db1f4068]
- Updated dependencies [c2a090513]
- Updated dependencies [966b31205]
- Updated dependencies [0d0b1d89a]
- Updated dependencies [1834a3ee4]
- Updated dependencies [a8901be64]
- Updated dependencies [896cb6104]
- Updated dependencies [64d3763ec]
- Updated dependencies [8350109ab]
- Updated dependencies [7b200af49]
- Updated dependencies [988a299c0]
- Updated dependencies [ecb60da48]
- Updated dependencies [deac67c1c]
- Updated dependencies [b3a3dcdf4]
- Updated dependencies [1dc28ab46]
- Updated dependencies [83e9d0846]
- Updated dependencies [d37d44a68]
- Updated dependencies [244de5ea3]
- Updated dependencies [fe356eebd]
- Updated dependencies [791c49807]
- Updated dependencies [935b0886e]
- Updated dependencies [93d05c868]
- Updated dependencies [ea4933655]
- Updated dependencies [7f6a64f43]
- Updated dependencies [a9fe242be]
- Updated dependencies [448e02e93]
- Updated dependencies [2671e7aa5]
- Updated dependencies [afec17953]
- Updated dependencies [799abc281]
- Updated dependencies [0699fa496]
- Updated dependencies [4aaf5103d]
- Updated dependencies [a68eb3083]
- Updated dependencies [2de442b24]
- Updated dependencies [15af02a83]
- Updated dependencies [0293f29c8]
- Updated dependencies [5f58a2274]
- Updated dependencies [9180c8b80]
- Updated dependencies [db18787c4]
- Updated dependencies [7f833da9e]
- Updated dependencies [de6519daa]
- Updated dependencies [e6ecbaa2f]
- Updated dependencies [ef2325dcc]
- Updated dependencies [6a769771c]
- Updated dependencies [fc3ffd880]
- Updated dependencies [8b6b094b9]
- Updated dependencies [840636a14]
- Updated dependencies [bab2e7e05]
- Updated dependencies [71663c568]
- Updated dependencies [a6b893d28]
- Updated dependencies [02976d494]
- Updated dependencies [492b8a7b1]
- Updated dependencies [8e5c881c4]
- Updated dependencies [9e99eb727]
- Updated dependencies [034c47ccb]
- Updated dependencies [2352149f6]
- Updated dependencies [e5c989a03]
- Updated dependencies [ff08fe237]
- Updated dependencies [7ecd6f6ab]
- Updated dependencies [12f3c5c55]
- Updated dependencies [244de5ea3]
- Updated dependencies [c776f86fb]
- Updated dependencies [90aa2ea9c]
- Updated dependencies [d9f265fcb]
- Updated dependencies [1e98187b4]
- Updated dependencies [7bffc47cb]
- Updated dependencies [a605335e1]
- Updated dependencies [2e77cd737]
- Updated dependencies [9737ef510]
- Updated dependencies [fafa76fb6]
- Updated dependencies [2964f8a47]
- Updated dependencies [1f650f30a]
- Updated dependencies [7af0949ae]
- Updated dependencies [97407d8aa]
- Updated dependencies [2a22aade8]
- Updated dependencies [69ce3e185]
- Updated dependencies [63dfe8dc9]
- Updated dependencies [e921af259]
- Updated dependencies [78fc5eec0]
- Updated dependencies [d08ec6d8f]
- Updated dependencies [dd5703013]
- Updated dependencies [a9fe242be]
- Updated dependencies [5f58a2274]
- Updated dependencies [6a33709cc]
- Updated dependencies [03079579d]
- Updated dependencies [c22cd5214]
- Updated dependencies [52ff8fe6b]
- Updated dependencies [86d52fb5c]
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
- Updated dependencies [7cb1241a9]
- Updated dependencies [9615e6cda]
- Updated dependencies [0ec3a146c]
- Updated dependencies [4bb57057e]
- Updated dependencies [bad4de1a2]
- Updated dependencies [d4ff346dd]
- Updated dependencies [7644b7472]
- Updated dependencies [2ec9f6b09]
- Updated dependencies [2e4a43017]
- Updated dependencies [66b283653]
- Updated dependencies [5aab9f04a]
- Updated dependencies [46040a2f3]
- Updated dependencies [f00fd2dfe]
- Updated dependencies [cace85374]
- Updated dependencies [1ad910eb9]
- Updated dependencies [8daf8451c]
- Updated dependencies [f58a9949b]
- Updated dependencies [4aaf5103d]
- Updated dependencies [75ea300bc]
- Updated dependencies [d22e6164d]
- Updated dependencies [9a1fe3728]
- Updated dependencies [e1f7eae87]
- Updated dependencies [7f751c4ef]
- Updated dependencies [4fced88ac]
- Updated dependencies [f5d55bb1f]
- Updated dependencies [18c0d015d]
- Updated dependencies [0d1052ac2]
- Updated dependencies [d30ea1faa]
- Updated dependencies [e7e2a1eae]
- Updated dependencies [7886ba89d]
- Updated dependencies [1fd2eff38]
- Updated dependencies [9a1fe3728]
- Updated dependencies [5471c7e8d]
- Updated dependencies [a6308c67e]
- Updated dependencies [0ce0edc28]
- Updated dependencies [f540e9843]
- Updated dependencies [477170962]
- Updated dependencies [9b02c1aae]
- Updated dependencies [051833167]
- Updated dependencies [b4e79c1b9]
- Updated dependencies [38d8b3e8a]
- Updated dependencies [be991365e]
- Updated dependencies [8350f73a6]
- Updated dependencies [d6a7ea61a]
- Updated dependencies [e0e79b4fe]
- Updated dependencies [41ae1d2f0]
- Updated dependencies [e602d6c1f]
- Updated dependencies [142ded732]
- Updated dependencies [fb794ce7b]
- Updated dependencies [48ca40af9]
- Updated dependencies [e6fc58ae4]
- Updated dependencies [6fffd3b54]
- Updated dependencies [94519aa33]
- Updated dependencies [ebf9be77f]
- Updated dependencies [a6451aece]
- Updated dependencies [008ac4217]
- Updated dependencies [987994909]
- Updated dependencies [40ac4b645]
- Updated dependencies [1bea9c200]
- Updated dependencies [6f755addd]
- Updated dependencies [429d030f7]
- Updated dependencies [844847e0b]
- Updated dependencies [6eab66050]
- Updated dependencies [c2b982749]
  - @clerk/backend@1.0.0
  - @clerk/shared@2.0.0
  - @clerk/types@4.0.0

## 1.0.0-beta.46

### Patch Changes

- Updated dependencies [[`f00fd2dfe`](https://github.com/clerk/javascript/commit/f00fd2dfe309cfeac82a776cc006f2c21b6d7988)]:
  - @clerk/types@4.0.0-beta.30

## 1.0.0-beta.45

### Patch Changes

- Updated dependencies [[`bab2e7e05`](https://github.com/clerk/javascript/commit/bab2e7e0590d0da1fd7db0680e63e8f2eb836b41)]:
  - @clerk/shared@2.0.0-beta.23
  - @clerk/types@4.0.0-beta.29
  - @clerk/backend@1.0.0-beta.37

## 1.0.0-beta.44

### Patch Changes

- Updated dependencies [[`ff08fe237`](https://github.com/clerk/javascript/commit/ff08fe237fa5a9ded04924b3c5821111836b49b6), [`d9f265fcb`](https://github.com/clerk/javascript/commit/d9f265fcb12b39301b9802e4787dc636ee28444f), [`142ded732`](https://github.com/clerk/javascript/commit/142ded73265b776789b65404d96b6c91cfe15e98), [`fb794ce7b`](https://github.com/clerk/javascript/commit/fb794ce7b88001b98ad4a628bc2cc39a0c8ccfa5), [`e6fc58ae4`](https://github.com/clerk/javascript/commit/e6fc58ae4df5091eff00ba0d9045ce5ff0fff538)]:
  - @clerk/types@4.0.0-beta.28
  - @clerk/backend@1.0.0-beta.36
  - @clerk/shared@2.0.0-beta.22

## 1.0.0-beta.43

### Patch Changes

- Updated dependencies [[`7cb1241a9`](https://github.com/clerk/javascript/commit/7cb1241a9929b3d8a0d2157637734d82dd9fd852), [`94519aa33`](https://github.com/clerk/javascript/commit/94519aa33774c8d6e557ce47a00974ad7b194c5d)]:
  - @clerk/backend@1.0.0-beta.35
  - @clerk/types@4.0.0-beta.27

## 1.0.0-beta.42

### Patch Changes

- Updated dependencies [[`ecb60da48`](https://github.com/clerk/javascript/commit/ecb60da48029b9cb2d17ab9b0a73cb92bc5c924b), [`0699fa496`](https://github.com/clerk/javascript/commit/0699fa49693dc7a8d3de8ba053c4f16a5c8431d0)]:
  - @clerk/backend@1.0.0-beta.34
  - @clerk/types@4.0.0-beta.26

## 1.0.0-beta.41

### Patch Changes

- Updated dependencies [[`2352149f6`](https://github.com/clerk/javascript/commit/2352149f6ba9708095146a3087538faf2d4f161f)]:
  - @clerk/types@4.0.0-beta.25

## 1.0.0-beta.40

### Patch Changes

- Updated dependencies [[`9180c8b80`](https://github.com/clerk/javascript/commit/9180c8b80e0ad95c1a9e490e8201ffd089634a48), [`63dfe8dc9`](https://github.com/clerk/javascript/commit/63dfe8dc92c28213db5c5644782e7d6751fa22a6), [`c6a5e0f5d`](https://github.com/clerk/javascript/commit/c6a5e0f5dbd9ec4a7b5657855e8a31bc8347d0a4), [`d22e6164d`](https://github.com/clerk/javascript/commit/d22e6164ddb765542e0e6335421d2ebf484af059)]:
  - @clerk/types@4.0.0-beta.24
  - @clerk/backend@1.0.0-beta.33

## 1.0.0-beta.39

### Patch Changes

- Updated dependencies [[`fc3ffd880`](https://github.com/clerk/javascript/commit/fc3ffd88064a09ab98877dfba119150390f9296e), [`840636a14`](https://github.com/clerk/javascript/commit/840636a14537d4f6b810832e7662518ef4bd4500), [`1fd2eff38`](https://github.com/clerk/javascript/commit/1fd2eff38dc71e45d2ff95a5b6e5a99cca53c6e7), [`f540e9843`](https://github.com/clerk/javascript/commit/f540e98435c86298415552537e33164471298a5c), [`987994909`](https://github.com/clerk/javascript/commit/987994909b7c462cc2b785f75afe4d621f5c960d), [`1bea9c200`](https://github.com/clerk/javascript/commit/1bea9c20090abdde962c7da1a859933e1cd51660)]:
  - @clerk/shared@2.0.0-beta.21
  - @clerk/types@4.0.0-beta.23
  - @clerk/backend@1.0.0-beta.32

## 1.0.0-beta.38

### Patch Changes

- Updated dependencies [[`988a299c0`](https://github.com/clerk/javascript/commit/988a299c0abf708e905592c29e394f8e4d79968e)]:
  - @clerk/backend@1.0.0-beta.31

## 1.0.0-beta.37

### Patch Changes

- Updated dependencies [[`8350109ab`](https://github.com/clerk/javascript/commit/8350109ab85909e0457199da1db0c9787d94001e)]:
  - @clerk/shared@2.0.0-beta.20
  - @clerk/backend@1.0.0-beta.30

## 1.0.0-beta.36

### Patch Changes

- Updated dependencies [[`afec17953`](https://github.com/clerk/javascript/commit/afec17953d1ae4ba39ee73e4383757694375524d)]:
  - @clerk/types@4.0.0-beta.22

## 1.0.0-beta.35

### Patch Changes

- Updated dependencies [[`8c23651b8`](https://github.com/clerk/javascript/commit/8c23651b8c3ff1474057a7d62e3ddba939cb0b64), [`9272006e7`](https://github.com/clerk/javascript/commit/9272006e744fc906cfdee520d2dc6d7db141cc97), [`0d0b1d89a`](https://github.com/clerk/javascript/commit/0d0b1d89a46d2418cb05a10940f4a399cbd8ffeb), [`2671e7aa5`](https://github.com/clerk/javascript/commit/2671e7aa5081eb9ae38b92ee647f2e3fd824741f), [`1f650f30a`](https://github.com/clerk/javascript/commit/1f650f30a97939817b7b2f3cc6283e22dc431523), [`663243220`](https://github.com/clerk/javascript/commit/6632432208aa6ca507f33fa9ab79abaa40431be6), [`66b283653`](https://github.com/clerk/javascript/commit/66b28365370bcbcdf4e51da39de58c7f8b1fc1b4), [`ebf9be77f`](https://github.com/clerk/javascript/commit/ebf9be77f17f8880541de67f66879324f68cf6bd)]:
  - @clerk/backend@1.0.0-beta.29
  - @clerk/types@4.0.0-beta.21

## 1.0.0-beta.34

### Minor Changes

- Re-export everything from `@clerk/backend` in `@clerk/fastify` to support common backend types and functionality without adding `@clerk/backend` as dependency. ([#2968](https://github.com/clerk/javascript/pull/2968)) by [@dimkl](https://github.com/dimkl)

  New exports:
  - `verifyToken()`

  New exported types:
  - `ClerkOptions`
  - `ClerkClient`
  - `OrganizationMembershipRole`
  - `VerifyTokenOptions`
  - `WebhookEvent`
  - `WebhookEventType`
  - `AllowlistIdentifier`
  - `Client`
  - `EmailAddress`
  - `ExternalAccount`
  - `Invitation`
  - `OauthAccessToken`
  - `Organization`
  - `OrganizationInvitation`
  - `OrganizationMembership`
  - `OrganizationMembershipPublicUserData`
  - `PhoneNumber`
  - `Session`
  - `SignInToken`
  - `SMSMessage`
  - `Token`
  - `User`

- Expose debug headers in response for handshake / signed-out states from SDKs using headers returned from `authenticateRequest()` ([#2898](https://github.com/clerk/javascript/pull/2898)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`2964f8a47`](https://github.com/clerk/javascript/commit/2964f8a47e473fa8457a27104adb4d008613a0e3)]:
  - @clerk/backend@1.0.0-beta.28

## 1.0.0-beta.33

### Patch Changes

- Updated dependencies [[`008ac4217`](https://github.com/clerk/javascript/commit/008ac4217bc648085b3caba92a4524c31cc0925b)]:
  - @clerk/types@4.0.0-beta.20

## 1.0.0-beta.32

### Patch Changes

- Updated dependencies [[`8350f73a6`](https://github.com/clerk/javascript/commit/8350f73a67f8980be78e3bd3343e772f5653d718)]:
  - @clerk/shared@2.0.0-beta.19
  - @clerk/backend@1.0.0-beta.27

## 1.0.0-beta.31

### Patch Changes

- Updated dependencies [[`fafa76fb6`](https://github.com/clerk/javascript/commit/fafa76fb66585b5836cc79985f8bdf1d1b4dca97)]:
  - @clerk/types@4.0.0-beta.19

## 1.0.0-beta.30

### Patch Changes

- Updated dependencies [[`e5c989a03`](https://github.com/clerk/javascript/commit/e5c989a035fa16413414c213febe16fcdbeef9b1), [`2ec9f6b09`](https://github.com/clerk/javascript/commit/2ec9f6b09f98ae276658d6dc705e16df0573d817)]:
  - @clerk/shared@2.0.0-beta.18
  - @clerk/backend@1.0.0-beta.26

## 1.0.0-beta.29

### Minor Changes

- Pass environment into `sdkMetadata` in order to detect if production clerk-js is used by other sdks in dev mode. When it is log dev warning from clerk-js. ([#2802](https://github.com/clerk/javascript/pull/2802)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`18c0d015d`](https://github.com/clerk/javascript/commit/18c0d015d20493e14049fed73a5b6f732372a5cf)]:
  - @clerk/types@4.0.0-beta.18

## 1.0.0-beta.28

### Patch Changes

- Updated dependencies [[`fe356eebd`](https://github.com/clerk/javascript/commit/fe356eebd8ff527133e0818cf664e7def577cccc)]:
  - @clerk/types@4.0.0-beta.17

## 1.0.0-beta.27

### Patch Changes

- Updated dependencies [[`1834a3ee4`](https://github.com/clerk/javascript/commit/1834a3ee496ea27b9f7ceeb32ec5361f9de8ee30), [`15af02a83`](https://github.com/clerk/javascript/commit/15af02a837b0e87ea83f3a86dfacc149adca1345)]:
  - @clerk/shared@2.0.0-beta.17
  - @clerk/backend@1.0.0-beta.25

## 1.0.0-beta.26

### Patch Changes

- Updated dependencies [[`db18787c4`](https://github.com/clerk/javascript/commit/db18787c4d9fa8ee1306db9b65f3b3f5e2fe2dad)]:
  - @clerk/shared@2.0.0-beta.16
  - @clerk/backend@1.0.0-beta.24

## 1.0.0-beta.25

### Patch Changes

- Updated dependencies [[`6eab66050`](https://github.com/clerk/javascript/commit/6eab66050608a1bc5cb9aca6a234b1fea16106e5)]:
  - @clerk/shared@2.0.0-beta.15
  - @clerk/backend@1.0.0-beta.23

## 1.0.0-beta.24

### Patch Changes

- Updated dependencies [[`12f3c5c55`](https://github.com/clerk/javascript/commit/12f3c5c55580f93a81df27851fbc92ce1312107e)]:
  - @clerk/shared@2.0.0-beta.14
  - @clerk/backend@1.0.0-beta.22

## 1.0.0-beta.23

### Patch Changes

- Updated dependencies [[`5c239d973`](https://github.com/clerk/javascript/commit/5c239d97373ad2f2aa91ded1b84670f201f7db8f), [`051833167`](https://github.com/clerk/javascript/commit/0518331675ffb4d6c6830d79a1d61f9e4466773a)]:
  - @clerk/types@4.0.0-beta.16
  - @clerk/backend@1.0.0-beta.21

## 1.0.0-beta.22

### Patch Changes

- Rename beta-v5 to beta by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`2de442b24`](https://github.com/clerk/javascript/commit/2de442b2465cc5d424b8a0b21aa57c557f3aa2e7)]:
  - @clerk/backend@1.0.0-beta.20
  - @clerk/shared@2.0.0-beta.13
  - @clerk/types@4.0.0-beta.15

## 1.0.0-beta-v5.21

### Minor Changes

- Introduce handshake mechanism and `x-clerk-auth-status` in response ([#2774](https://github.com/clerk/javascript/pull/2774)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`966b31205`](https://github.com/clerk/javascript/commit/966b312050b572fbbbc07a6f0581cbec21847375), [`a8901be64`](https://github.com/clerk/javascript/commit/a8901be64fe91125a0d38a3c880ffa73168ccf5c), [`7b200af49`](https://github.com/clerk/javascript/commit/7b200af4908839ea661ddf2a76811057b545cafc), [`244de5ea3`](https://github.com/clerk/javascript/commit/244de5ea3a7641727cd85c544bb79fb04f2c0808), [`034c47ccb`](https://github.com/clerk/javascript/commit/034c47ccbef0129b9be9ff8aef683aa039e52602), [`244de5ea3`](https://github.com/clerk/javascript/commit/244de5ea3a7641727cd85c544bb79fb04f2c0808), [`9737ef510`](https://github.com/clerk/javascript/commit/9737ef5104346821461972d31f3c69e93924f0e0), [`8b466a9ba`](https://github.com/clerk/javascript/commit/8b466a9ba93ca10315b534079b09fa5d76ffa305), [`8daf8451c`](https://github.com/clerk/javascript/commit/8daf8451cb564bc834dd856174ffc2cdfa932e37), [`7f751c4ef`](https://github.com/clerk/javascript/commit/7f751c4ef2d14410058cf65ea984a93b50c0b87e), [`4fced88ac`](https://github.com/clerk/javascript/commit/4fced88acc66a4837779d8bbca359086cddeec56), [`be991365e`](https://github.com/clerk/javascript/commit/be991365e1c78d0f1dfc59bb33dd533b6fad223a), [`c2b982749`](https://github.com/clerk/javascript/commit/c2b98274970bac5af33c9bb2e84c70ad90225180)]:
  - @clerk/backend@1.0.0-beta-v5.19
  - @clerk/types@4.0.0-beta-v5.14
  - @clerk/shared@2.0.0-beta-v5.12

## 1.0.0-beta-v5.20

### Patch Changes

- Updated dependencies [[`8e5c881c4`](https://github.com/clerk/javascript/commit/8e5c881c40d7306c5dbd2e1f1803fbf75127bd71), [`d4ff346dd`](https://github.com/clerk/javascript/commit/d4ff346dd53bb3e1970e80bdc7b188c2dd344f12), [`7886ba89d`](https://github.com/clerk/javascript/commit/7886ba89d76bfea2d6882a46baf64bf98f1148d3), [`a6308c67e`](https://github.com/clerk/javascript/commit/a6308c67e329879e001cee56cccd82e60b804422)]:
  - @clerk/backend@1.0.0-beta-v5.18
  - @clerk/shared@2.0.0-beta-v5.11
  - @clerk/types@4.0.0-beta-v5.13

## 1.0.0-alpha-v5.19

### Patch Changes

- Updated dependencies [[`3a2f13604`](https://github.com/clerk/javascript/commit/3a2f13604e1b8b351a05de26d2c0672503aa67b3), [`9e99eb727`](https://github.com/clerk/javascript/commit/9e99eb7276249c68ef6f930cce418ce0004653b9), [`6fffd3b54`](https://github.com/clerk/javascript/commit/6fffd3b542f3df0bcb49281b7c4f77209a83f7a1)]:
  - @clerk/backend@1.0.0-alpha-v5.17

## 1.0.0-alpha-v5.18

### Patch Changes

- Updated dependencies [[`935b0886e`](https://github.com/clerk/javascript/commit/935b0886e8317445f30c92000a27ed68e1223ff6), [`6a769771c`](https://github.com/clerk/javascript/commit/6a769771c975996d8d52b35b5cfdbae5dcec85d4)]:
  - @clerk/backend@1.0.0-alpha-v5.16

## 1.0.0-alpha-v5.17

### Minor Changes

- Replace the `Clerk-Backend-SDK` header with `User-Agent` in BAPI requests and update it's value to contain both the package name and the package version of the clerk package ([#2558](https://github.com/clerk/javascript/pull/2558)) by [@dimkl](https://github.com/dimkl)

  executing the request. Eg request from `@clerk/nextjs` to BAPI with append `User-Agent: @clerk/nextjs@5.0.0-alpha-v5.16` using the latest version.

  Miscellaneous changes: The backend test build changed to use tsup.

### Patch Changes

- Updated dependencies [[`799abc281`](https://github.com/clerk/javascript/commit/799abc281182efb953dd6637f9db7fc61c71a2cd), [`8cc45d2af`](https://github.com/clerk/javascript/commit/8cc45d2af98320ccced3768fb039b86576e424a5), [`b4e79c1b9`](https://github.com/clerk/javascript/commit/b4e79c1b9ab8e14cbfccaf290f0f596da0416e13)]:
  - @clerk/backend@1.0.0-alpha-v5.15
  - @clerk/shared@2.0.0-alpha-v5.10

## 1.0.0-alpha-v5.16

### Patch Changes

- Updated dependencies [[`448e02e93`](https://github.com/clerk/javascript/commit/448e02e93cf2392878d5891009640c52103d99a8), [`e6ecbaa2f`](https://github.com/clerk/javascript/commit/e6ecbaa2ff7add95bf888cb4ce43457b9fde7a13), [`e921af259`](https://github.com/clerk/javascript/commit/e921af259e9bdc8810a830bed54d71cf8eced1f8)]:
  - @clerk/backend@1.0.0-alpha-v5.14

## 1.0.0-alpha-v5.15

### Patch Changes

- Updated dependencies [[`1dc28ab46`](https://github.com/clerk/javascript/commit/1dc28ab46f6930074334be183c637ce7a81bebf7), [`ea4933655`](https://github.com/clerk/javascript/commit/ea4933655863ce315324aa2a3be7d5f263c2b61f), [`38d8b3e8a`](https://github.com/clerk/javascript/commit/38d8b3e8a0387bcf0b9c8d16e3bbfcfe9b643ca2)]:
  - @clerk/shared@2.0.0-alpha-v5.9
  - @clerk/backend@1.0.0-alpha-v5.13

## 1.0.0-alpha-v5.14

### Patch Changes

- Updated dependencies [[`7ecd6f6ab`](https://github.com/clerk/javascript/commit/7ecd6f6abb0e5bfb1a57c99cc11860de311c3e82)]:
  - @clerk/shared@2.0.0-alpha-v5.8
  - @clerk/backend@1.0.0-alpha-v5.12

## 1.0.0-alpha-v5.13

### Patch Changes

- Updated dependencies [[`f4f99f18d`](https://github.com/clerk/javascript/commit/f4f99f18de0be8afaae9f52599deb2814ab235e7), [`fe2607b6f`](https://github.com/clerk/javascript/commit/fe2607b6fdeed83002db7e4a0c040ac0280e5ff7), [`bad4de1a2`](https://github.com/clerk/javascript/commit/bad4de1a2fd8a3e2643fe26677801166a8305c29), [`2e4a43017`](https://github.com/clerk/javascript/commit/2e4a43017ef33b541949ba90e16bf5311ce8bc60), [`e7e2a1eae`](https://github.com/clerk/javascript/commit/e7e2a1eae2ed726ab49894dd195185c8f4e70acd)]:
  - @clerk/backend@1.0.0-alpha-v5.11
  - @clerk/types@4.0.0-alpha-v5.12

## 1.0.0-alpha-v5.12

### Major Changes

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

### Patch Changes

- Updated dependencies [[`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`1e98187b4`](https://github.com/clerk/javascript/commit/1e98187b4fba0f872576510d7bccf8b75a2579bd), [`d08ec6d8f`](https://github.com/clerk/javascript/commit/d08ec6d8f52a2bc037c0eb586123a9f7816e4b64), [`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7), [`0ec3a146c`](https://github.com/clerk/javascript/commit/0ec3a146cc4cbe4a80d1f990a440431ae4490183), [`1ad910eb9`](https://github.com/clerk/javascript/commit/1ad910eb92dce056731f29df0caaaad74d08bd7f), [`f58a9949b`](https://github.com/clerk/javascript/commit/f58a9949bc78737ca4e096ed5501b4e578a2d493), [`9b02c1aae`](https://github.com/clerk/javascript/commit/9b02c1aae1cae286ea305c5e216ae93cbbbc0f90)]:
  - @clerk/backend@1.0.0-alpha-v5.10
  - @clerk/types@4.0.0-alpha-v5.11
  - @clerk/shared@2.0.0-alpha-v5.7

## 1.0.0-alpha-v5.11

### Patch Changes

- Updated dependencies [[`e602d6c1f`](https://github.com/clerk/javascript/commit/e602d6c1fde7a7757d292f24dfaddecd14ac1623)]:
  - @clerk/backend@1.0.0-alpha-v5.9

## 1.0.0-alpha-v5.10

### Major Changes

- (Note: This is only relevant if, in the unlikely case, you are using `Clerk` from `@clerk/fastify` directly. If not, you can safely ignore this change.) ([#2317](https://github.com/clerk/javascript/pull/2317)) by [@tmilewski](https://github.com/tmilewski)

  Remove the named `Clerk` import from `@clerk/fastify` and import `createClerkClient` instead. The latter is a factory method to create a Clerk client instance for you. This update aligns usage across our SDKs and will enable us to ship DX improvements better in the future.

  ```js
  import { Clerk } from '@clerk/fastify';
  const clerk = Clerk({ secretKey: '...' });
  ```

  You need to rename the import from `Clerk` to `createClerkClient` and change its usage:

  ```js
  import { createClerkClient } from '@clerk/fastify';
  const clerk = createClerkClient({ secretKey: '...' });
  ```

### Patch Changes

- Updated dependencies [[`896cb6104`](https://github.com/clerk/javascript/commit/896cb610409f84c0ff7a4f502f0b4ccee1afc157), [`02976d494`](https://github.com/clerk/javascript/commit/02976d49473958b8c3fea38d4e389dc1bee7e8c4), [`69ce3e185`](https://github.com/clerk/javascript/commit/69ce3e185b89283956cb711629bc61703166b1c9), [`86d52fb5c`](https://github.com/clerk/javascript/commit/86d52fb5cf68f1dc7adf617605b922134e21268f), [`ab4eb56a5`](https://github.com/clerk/javascript/commit/ab4eb56a5c34baf496ebb8ac412ad6171b9bd79c), [`46040a2f3`](https://github.com/clerk/javascript/commit/46040a2f34d0991072fca490e031c1994b2e2296), [`75ea300bc`](https://github.com/clerk/javascript/commit/75ea300bce16a0ce401a225263bb267ad2a217b8), [`844847e0b`](https://github.com/clerk/javascript/commit/844847e0becf20243fba3c659b2b77a238dd270a)]:
  - @clerk/shared@2.0.0-alpha-v5.6
  - @clerk/backend@1.0.0-alpha-v5.8
  - @clerk/types@4.0.0-alpha-v5.10

## 1.0.0-alpha-v5.9

### Patch Changes

- Updated dependencies [[`1db1f4068`](https://github.com/clerk/javascript/commit/1db1f4068466d967df0de39f032a476ca8163651), [`de6519daa`](https://github.com/clerk/javascript/commit/de6519daa84732023bcfd74ad816a2654f457952), [`7bffc47cb`](https://github.com/clerk/javascript/commit/7bffc47cb71a2c3e026df5977c25487bfd5c55d7), [`7af0949ae`](https://github.com/clerk/javascript/commit/7af0949ae7b4072f550dee220f4d41854fe504c6), [`e1f7eae87`](https://github.com/clerk/javascript/commit/e1f7eae87531b483564256f5456a31150caa469e)]:
  - @clerk/types@4.0.0-alpha-v5.9
  - @clerk/backend@1.0.0-alpha-v5.7

## 1.0.0-alpha-v5.8

### Patch Changes

- Set correct information on required Node.js and React versions in README ([#2264](https://github.com/clerk/javascript/pull/2264)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`93d05c868`](https://github.com/clerk/javascript/commit/93d05c8680ed213e594a16d4630a65f8eb244b32), [`a6b893d28`](https://github.com/clerk/javascript/commit/a6b893d281b23dc7b4bd7f3733b33e4cf655bc1b), [`2e77cd737`](https://github.com/clerk/javascript/commit/2e77cd737a333de022533d29cb12e73a907694c8), [`6a33709cc`](https://github.com/clerk/javascript/commit/6a33709ccf48586f1a8b62216688ea300b7b5dfb), [`d30ea1faa`](https://github.com/clerk/javascript/commit/d30ea1faa45074e09c037530e8ba3ca2dbd50654)]:
  - @clerk/backend@1.0.0-alpha-v5.6
  - @clerk/types@4.0.0-alpha-v5.8
  - @clerk/shared@2.0.0-alpha-v5.5

## 1.0.0-alpha-v5.7

### Patch Changes

- Updated dependencies [[`4b8bedc66`](https://github.com/clerk/javascript/commit/4b8bedc66d47dca5c6192148f4b31ae6d49ff733), [`c776f86fb`](https://github.com/clerk/javascript/commit/c776f86fb2a999dcae46fda9abb5005718c354b2), [`d6a7ea61a`](https://github.com/clerk/javascript/commit/d6a7ea61a8ae64c93877ec117e54fc48b1c86f16)]:
  - @clerk/shared@2.0.0-alpha-v5.4
  - @clerk/types@4.0.0-alpha-v5.7
  - @clerk/backend@1.0.0-alpha-v5.5

## 1.0.0-alpha-v5.6

### Patch Changes

- Updated dependencies [[`5aab9f04a`](https://github.com/clerk/javascript/commit/5aab9f04a1eac39e42a03f555075e08a5a8ee02c), [`9a1fe3728`](https://github.com/clerk/javascript/commit/9a1fe37289c7606dc111913cb9f70f2a2efff6b7), [`9a1fe3728`](https://github.com/clerk/javascript/commit/9a1fe37289c7606dc111913cb9f70f2a2efff6b7)]:
  - @clerk/types@4.0.0-alpha-v5.6

## 1.0.0-alpha-v5.5

### Patch Changes

- Updated dependencies [[`03079579d`](https://github.com/clerk/javascript/commit/03079579d2b48a9a6969702814449382098d2cfb), [`12962bc58`](https://github.com/clerk/javascript/commit/12962bc58e2c9caad416ba4e6d52061d00bc2feb)]:
  - @clerk/backend@1.0.0-alpha-v5.4
  - @clerk/types@4.0.0-alpha-v5.5

## 1.0.0-alpha-v5.4

### Patch Changes

- Updated dependencies [[`7f6a64f43`](https://github.com/clerk/javascript/commit/7f6a64f4335832c66ff355f6d2f311f33a313d59)]:
  - @clerk/types@4.0.0-alpha-v5.4

## 1.0.0-alpha-v5.3

### Patch Changes

- Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry. ([#2154](https://github.com/clerk/javascript/pull/2154)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`b3a3dcdf4`](https://github.com/clerk/javascript/commit/b3a3dcdf4a8fa75c0dee4c55ab8fedebd49fdfd4), [`4aaf5103d`](https://github.com/clerk/javascript/commit/4aaf5103d3132f4e1ae76b861fa6ce0aae02ecbe), [`52ff8fe6b`](https://github.com/clerk/javascript/commit/52ff8fe6b6ff88ceb5e1246378b54b0565bede9d), [`4bb57057e`](https://github.com/clerk/javascript/commit/4bb57057e9af20fc433626ed178d97d3ca811362), [`4aaf5103d`](https://github.com/clerk/javascript/commit/4aaf5103d3132f4e1ae76b861fa6ce0aae02ecbe), [`0ce0edc28`](https://github.com/clerk/javascript/commit/0ce0edc283849a88b14b4b0df53b6858ed3a4f80), [`40ac4b645`](https://github.com/clerk/javascript/commit/40ac4b645f449b546dae5b4c0d013c9d9ea6d09c), [`429d030f7`](https://github.com/clerk/javascript/commit/429d030f7b6efe838a1e7fec7f736ba59fcc6b61)]:
  - @clerk/backend@1.0.0-alpha-v5.3
  - @clerk/shared@2.0.0-alpha-v5.3
  - @clerk/types@4.0.0-alpha-v5.3

## 1.0.0-alpha-v5.2

### Major Changes

- Change the minimal Node.js version required by Clerk to `18.17.0`. ([#2162](https://github.com/clerk/javascript/pull/2162)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`c2a090513`](https://github.com/clerk/javascript/commit/c2a0905132684a4a1e8d598b66caddf20062273e)]:
  - @clerk/backend@1.0.0-alpha-v5.2
  - @clerk/shared@2.0.0-alpha-v5.2
  - @clerk/types@4.0.0-alpha-v5.2

## 1.0.0-alpha-v5.1

### Patch Changes

- Updated dependencies [[`64d3763ec`](https://github.com/clerk/javascript/commit/64d3763ec73747ad04c4b47017195cf4114e150c), [`deac67c1c`](https://github.com/clerk/javascript/commit/deac67c1c40d6d3ccc3559746c0c31cc29a93b84), [`83e9d0846`](https://github.com/clerk/javascript/commit/83e9d08469e7c2840f06aa7d86831055e23f67a5), [`7f833da9e`](https://github.com/clerk/javascript/commit/7f833da9ebc1b2ec9c65513628c377d0584e5d72), [`492b8a7b1`](https://github.com/clerk/javascript/commit/492b8a7b12f14658a384566012e5807f0a171710), [`2a22aade8`](https://github.com/clerk/javascript/commit/2a22aade8c9bd1f83a9be085983f96fa87903804), [`dd5703013`](https://github.com/clerk/javascript/commit/dd57030133fb8ce98681ff0bcad7e53ee826bb0e), [`f77e8cdbd`](https://github.com/clerk/javascript/commit/f77e8cdbd24411f7f9dbfdafcab0596c598f66c1), [`9615e6cda`](https://github.com/clerk/javascript/commit/9615e6cda8fb1cbc3c2e464e6e891d56e245fac4), [`cace85374`](https://github.com/clerk/javascript/commit/cace85374cb0bb13578cf63fe1f3e6ee59f7f3c2), [`0d1052ac2`](https://github.com/clerk/javascript/commit/0d1052ac284b909786fd0e4744b02fcf4d1a8be6), [`5471c7e8d`](https://github.com/clerk/javascript/commit/5471c7e8dd0155348748fa90e5ae97093f59efe9), [`477170962`](https://github.com/clerk/javascript/commit/477170962f486fd4e6b0653a64826573f0d8621b), [`e0e79b4fe`](https://github.com/clerk/javascript/commit/e0e79b4fe47f64006718d547c898b9f67fe4d424), [`a6451aece`](https://github.com/clerk/javascript/commit/a6451aecef0bac578b295b524f1246dede3a7598)]:
  - @clerk/shared@2.0.0-alpha-v5.1
  - @clerk/backend@1.0.0-alpha-v5.1
  - @clerk/types@4.0.0-alpha-v5.1

## 1.0.0-alpha-v5.0

### Major Changes

- Internal update default apiUrl domain from clerk.dev to clerk.com ([#1878](https://github.com/clerk/javascript/pull/1878)) by [@dimkl](https://github.com/dimkl)

- Drop deprecations. Migration steps: ([#1976](https://github.com/clerk/javascript/pull/1976)) by [@dimkl](https://github.com/dimkl)
  - use `CLERK_SECRET_KEY` instead of `CLERK_API_KEY` env variable
  - use `secretKey` instead of `apiKey`
  - use `CLERK_PUBLISHABLE_KEY` instead of `CLERK_FRONTEND_API` env variable
  - use `publishableKey` instead of `frontendApi`

- Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Improve the default value for `CLERK_API_URL` by utilizing the publishable key to differentiate between local, staging and prod environments. ([#1955](https://github.com/clerk/javascript/pull/1955)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`743c4d204`](https://github.com/clerk/javascript/commit/743c4d20423790b554e66923466081c0d3b0d9ed), [`d37d44a68`](https://github.com/clerk/javascript/commit/d37d44a68e83b8e895963415f000c1aaef66e87e), [`791c49807`](https://github.com/clerk/javascript/commit/791c49807c3c9e19964cbf621c935d237caeecf3), [`a68eb3083`](https://github.com/clerk/javascript/commit/a68eb3083ff68459cd33098e2df190a5ba26c841), [`0293f29c8`](https://github.com/clerk/javascript/commit/0293f29c855c9415b54867196e8d727d1614e4ca), [`ef2325dcc`](https://github.com/clerk/javascript/commit/ef2325dcc18729e9ce9ee5823e9a963efa51dbc1), [`8b6b094b9`](https://github.com/clerk/javascript/commit/8b6b094b9c7d09eeae90f8bdfac44d53513aa63d), [`71663c568`](https://github.com/clerk/javascript/commit/71663c568926b1d60b97aa7ccc5298d05b618af2), [`90aa2ea9c`](https://github.com/clerk/javascript/commit/90aa2ea9c4675662cee581298b49bd76ec8f8850), [`a605335e1`](https://github.com/clerk/javascript/commit/a605335e1e6f37d9b02170282974b0e1406e3f98), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`78fc5eec0`](https://github.com/clerk/javascript/commit/78fc5eec0d61c14d86204944c6aa9f341ae6ea98), [`c22cd5214`](https://github.com/clerk/javascript/commit/c22cd52147492ba25f3c07bdbe6bbc4eb49a5cf0), [`c7e6d00f5`](https://github.com/clerk/javascript/commit/c7e6d00f56e73df4ed87712e74ad9d5bcaca8924), [`4edb77632`](https://github.com/clerk/javascript/commit/4edb7763271b80d93fcd52ece5f1e408bd75df6f), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`7644b7472`](https://github.com/clerk/javascript/commit/7644b74726ba73e615a1256f9ff3fa03b0f8bc30), [`f5d55bb1f`](https://github.com/clerk/javascript/commit/f5d55bb1fc6a87303fb8bf461c3a917ae4da4005), [`41ae1d2f0`](https://github.com/clerk/javascript/commit/41ae1d2f006a0e4657a97a9c83ae7eb0cc167834), [`48ca40af9`](https://github.com/clerk/javascript/commit/48ca40af97a7fa4f2e41cf0f071028767d1b0075), [`6f755addd`](https://github.com/clerk/javascript/commit/6f755addd0886b9ff8b0d5dbe48e37470049acad)]:
  - @clerk/shared@2.0.0-alpha-v5.0
  - @clerk/types@4.0.0-alpha-v5.0
  - @clerk/backend@1.0.0-alpha-v5.0

## 0.6.17

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`3bf64107e`](https://github.com/clerk/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`52f8553d2`](https://github.com/clerk/javascript/commit/52f8553d22f9454ee1194fd162410db15da7a4be), [`92727eec3`](https://github.com/clerk/javascript/commit/92727eec39566278263ffa118a085493f964eb94), [`b09b66eec`](https://github.com/clerk/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerk/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62), [`aa4cd7615`](https://github.com/clerk/javascript/commit/aa4cd761585b888706a36a6eed7436a8f0476dbf)]:
  - @clerk/backend@0.31.3
  - @clerk/shared@1.0.0
  - @clerk/types@3.57.0

## 0.6.16

### Patch Changes

- Updated dependencies [[`9ca215702`](https://github.com/clerk/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11)]:
  - @clerk/types@3.56.1
  - @clerk/backend@0.31.2

## 0.6.15

### Patch Changes

- Updated dependencies [[`35be8709d`](https://github.com/clerk/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`13e9dfbaa`](https://github.com/clerk/javascript/commit/13e9dfbaa5b7b7e72f63e4b8ecfc1c1918517cd8), [`e38488c92`](https://github.com/clerk/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerk/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`9b644d799`](https://github.com/clerk/javascript/commit/9b644d7991b8cba4b385e9443f87798cde5c9989), [`a9894b445`](https://github.com/clerk/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`834dadb36`](https://github.com/clerk/javascript/commit/834dadb36c30b2a8f052784de4ad1026b0083b4e), [`70f251007`](https://github.com/clerk/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`a46d6fe99`](https://github.com/clerk/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/types@3.56.0
  - @clerk/backend@0.31.1
  - @clerk/shared@0.24.5

## 0.6.14

### Patch Changes

- Introduce a new property on the core Clerk singleton, `sdkMetadata`. This will be populated by each host SDK. This metadata will be used to make logging and debugging easier. ([#1857](https://github.com/clerk/javascript/pull/1857)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`977336f79`](https://github.com/clerk/javascript/commit/977336f793cd4ce5984f98dac3cedf9f5ec363f5), [`997b8e256`](https://github.com/clerk/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91e9a55f4`](https://github.com/clerk/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`c9b17f5a7`](https://github.com/clerk/javascript/commit/c9b17f5a72cb27786cfc7f1fb42be1233fb10d5c), [`91014880d`](https://github.com/clerk/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`3848f8dbe`](https://github.com/clerk/javascript/commit/3848f8dbe094226c6062341405a32a9621042fd6), [`7f4d4b942`](https://github.com/clerk/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b)]:
  - @clerk/shared@0.24.4
  - @clerk/types@3.55.0
  - @clerk/backend@0.31.0

## 0.6.13

### Patch Changes

- Updated dependencies [[`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1e212c19d`](https://github.com/clerk/javascript/commit/1e212c19d1cbfbcf6bc6718f5aec0a3cb893b96f), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679)]:
  - @clerk/shared@0.24.3
  - @clerk/backend@0.30.3

## 0.6.12

### Patch Changes

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerk/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`fed24f1bf`](https://github.com/clerk/javascript/commit/fed24f1bf3e2b8c3f3e3327178f77b57c391c62c), [`164f3aac7`](https://github.com/clerk/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerk/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerk/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`0636ff779`](https://github.com/clerk/javascript/commit/0636ff7799e126d1438d2738ce0e46c3b277f46a), [`9514618d6`](https://github.com/clerk/javascript/commit/9514618d65cfdde0ff011eabd41a992b61fc8dc1), [`bb2ec9373`](https://github.com/clerk/javascript/commit/bb2ec93738f92c89f008c6a275a986593816c4d3), [`c7c6912f3`](https://github.com/clerk/javascript/commit/c7c6912f34874467bc74104690fe9f95491cc10d), [`71bb1c7b5`](https://github.com/clerk/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf)]:
  - @clerk/types@3.54.0
  - @clerk/backend@0.30.2
  - @clerk/shared@0.24.2

## 0.6.11

### Patch Changes

- Updated dependencies [[`cecf74d79`](https://github.com/clerk/javascript/commit/cecf74d79069662d25f73e4745aa01348d398afb)]:
  - @clerk/backend@0.30.1
  - @clerk/shared@0.24.1

## 0.6.10

### Patch Changes

- Updated dependencies [[`7ffa6fac3`](https://github.com/clerk/javascript/commit/7ffa6fac3762f6fb130ba2f2fcaa28e52b36b3b4), [`5c8754239`](https://github.com/clerk/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81), [`2f6a6ac99`](https://github.com/clerk/javascript/commit/2f6a6ac9991469bf8532019bb22ff50adecdb434), [`2f6a6ac99`](https://github.com/clerk/javascript/commit/2f6a6ac9991469bf8532019bb22ff50adecdb434), [`94c36c755`](https://github.com/clerk/javascript/commit/94c36c755b598eb68d22f42eb7f738050f390678), [`753f7bbda`](https://github.com/clerk/javascript/commit/753f7bbda9bbb7444f96222a3b6cae815a09058f), [`7406afe7f`](https://github.com/clerk/javascript/commit/7406afe7f550f702bd91cde9616fd26222833a87), [`55c8ebd39`](https://github.com/clerk/javascript/commit/55c8ebd390dd88036aee06866009be6a50c63138)]:
  - @clerk/shared@0.24.0
  - @clerk/types@3.53.0
  - @clerk/backend@0.30.0

## 0.6.9

### Patch Changes

- Warn about deprecated constants that will be removed in next major version ([#1759](https://github.com/clerk/javascript/pull/1759)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`07ede0f95`](https://github.com/clerk/javascript/commit/07ede0f959f232f6cbecb596eb9352f8cb382cdc), [`0eb666118`](https://github.com/clerk/javascript/commit/0eb66611882e6c460cc6a6c5cfa1d9b086ec6917), [`3b85311c9`](https://github.com/clerk/javascript/commit/3b85311c9eb006f51a8642f193473a250de879fc), [`ffcc78c06`](https://github.com/clerk/javascript/commit/ffcc78c062d067738f617ea9b491c1d45677148c), [`c61ddf5bf`](https://github.com/clerk/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerk/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/shared@0.23.1
  - @clerk/types@3.52.1
  - @clerk/backend@0.29.3

## 0.6.8

### Patch Changes

- Updated dependencies [[`40ea407ad`](https://github.com/clerk/javascript/commit/40ea407ad1042fee6871755f30de544200b1f0d8), [`378a903ac`](https://github.com/clerk/javascript/commit/378a903ac4dc12e6ee708de20f0d9a5aa758bd18), [`27b611e47`](https://github.com/clerk/javascript/commit/27b611e47e4f1ad86e8dff42cb02c98bdc6ff6bd), [`4d0d90238`](https://github.com/clerk/javascript/commit/4d0d9023895c13290d5578ece218c24348c540fc)]:
  - @clerk/backend@0.29.2

## 0.6.7

### Patch Changes

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`e99df0a0d`](https://github.com/clerk/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerk/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`75be1d6b3`](https://github.com/clerk/javascript/commit/75be1d6b3d9bf7b5d71613b3f169a942b1d25e7e), [`01b024c57`](https://github.com/clerk/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68)]:
  - @clerk/types@3.52.0
  - @clerk/backend@0.29.1

## 0.6.6

### Patch Changes

- Updated dependencies [[`463ff84f5`](https://github.com/clerk/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`e6a388946`](https://github.com/clerk/javascript/commit/e6a38894640b6999b90ea44ef66acda34debe2c1), [`1426e5eb3`](https://github.com/clerk/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739)]:
  - @clerk/types@3.51.0
  - @clerk/backend@0.29.0

## 0.6.5

### Patch Changes

- Updated dependencies [[`975412ed5`](https://github.com/clerk/javascript/commit/975412ed5307ac81128c87289178bd1e6c2fb1af)]:
  - @clerk/backend@0.28.1

## 0.6.4

### Patch Changes

- Updated dependencies [[`96cc1921c`](https://github.com/clerk/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerk/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerk/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerk/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerk/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerk/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerk/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerk/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerk/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerk/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`86de584dd`](https://github.com/clerk/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e02a1aff2`](https://github.com/clerk/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerk/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerk/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerk/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerk/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerk/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`30fcdd51a`](https://github.com/clerk/javascript/commit/30fcdd51a98dea60da36f2b5152ea22405d2c4f2), [`89bc5de04`](https://github.com/clerk/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/types@3.50.0
  - @clerk/backend@0.28.0

## 0.6.3

### Patch Changes

- Updated dependencies [[`ea95525a4`](https://github.com/clerk/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerk/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`d433b83b9`](https://github.com/clerk/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerk/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`876777cb1`](https://github.com/clerk/javascript/commit/876777cb14443917d8e0a04b363327d165ad5580), [`0a59e122d`](https://github.com/clerk/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/backend@0.27.0
  - @clerk/types@3.49.0

## 0.6.2

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerk/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3), [`4ff4b716f`](https://github.com/clerk/javascript/commit/4ff4b716fdb12b18182e506737afafc7dbc05604)]:
  - @clerk/types@3.48.1
  - @clerk/backend@0.26.0

## 0.6.1

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerk/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c)]:
  - @clerk/types@3.48.0
  - @clerk/backend@0.25.1

## 0.6.0

### Minor Changes

- Introduce `createIsomorphicRequest` in `@clerk/backend` ([#1393](https://github.com/clerk/javascript/pull/1393)) by [@anagstef](https://github.com/anagstef)

  This utility simplifies the `authenticateRequest` signature, and it makes it easier to integrate with more frameworks.

### Patch Changes

- Pass the `ClerkFastifyOptions` to the exported fastify plugin ([#1488](https://github.com/clerk/javascript/pull/1488)) by [@mikestopcontinues](https://github.com/mikestopcontinues)

- Updated dependencies [[`16c3283ec`](https://github.com/clerk/javascript/commit/16c3283ec192cb7525312da5e718aa7cac8b8445), [`73c9c1d0e`](https://github.com/clerk/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerk/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerk/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`e3036848d`](https://github.com/clerk/javascript/commit/e3036848d19a48935129aec2fe50003518a3aa53), [`fd692af79`](https://github.com/clerk/javascript/commit/fd692af791fe206724e38eff647b8562e72c3652), [`090bab66e`](https://github.com/clerk/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`bb0d69b45`](https://github.com/clerk/javascript/commit/bb0d69b455fa5fd6ca5b1f45a0f242957521dfbb), [`592911196`](https://github.com/clerk/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8)]:
  - @clerk/backend@0.25.0
  - @clerk/types@3.47.0

## 0.5.7

### Patch Changes

- Updated dependencies [[`2ad7cf390`](https://github.com/clerk/javascript/commit/2ad7cf390ba84b8e767ed6fe136800e38356d79c), [`f0b044c47`](https://github.com/clerk/javascript/commit/f0b044c475546e96a5995ef16198e60e35e8098f)]:
  - @clerk/backend@0.24.0

## 0.5.6

### Patch Changes

- Updated dependencies [[`3fee736c9`](https://github.com/clerk/javascript/commit/3fee736c993b0a8fd157d716890810d04e632962), [`ac4e47274`](https://github.com/clerk/javascript/commit/ac4e47274afc2ab3a55a78b388a14bed76600402), [`5957a3da6`](https://github.com/clerk/javascript/commit/5957a3da68cde3386c741812e2bc03b5519d00e0)]:
  - @clerk/backend@0.23.7

## 0.5.5

### Patch Changes

- Updated dependencies [[`30f8ad18a`](https://github.com/clerk/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c)]:
  - @clerk/types@3.46.1
  - @clerk/backend@0.23.6

## 0.5.4

### Patch Changes

- Updated dependencies [[`bfb3af28`](https://github.com/clerk/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/types@3.46.0
  - @clerk/backend@0.23.5

## 0.5.3

### Patch Changes

- Updated dependencies [[`11954816`](https://github.com/clerk/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`de2347f9`](https://github.com/clerk/javascript/commit/de2347f9efaab4903787a905528a06551a9b7883), [`32148490`](https://github.com/clerk/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0
  - @clerk/backend@0.23.4

## 0.5.2

### Patch Changes

- Updated dependencies [[`17cc14ec`](https://github.com/clerk/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/types@3.44.0
  - @clerk/backend@0.23.3

## 0.5.1

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerk/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerk/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/types@3.43.0
  - @clerk/backend@0.23.2

## 0.5.0

### Minor Changes

- Add support for binding middleware to `onRequest` in addition to `preHandler` ([#1356](https://github.com/clerk/javascript/pull/1356)) by [@mikestopcontinues](https://github.com/mikestopcontinues)

## 0.4.8

### Patch Changes

- Updated dependencies [[`b945c921`](https://github.com/clerk/javascript/commit/b945c92100454f00ff4b6b9c769201ca2ceaac93)]:
  - @clerk/backend@0.23.1

## 0.4.7

### Patch Changes

- Updated dependencies [[`c42b4ac0`](https://github.com/clerk/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`010484f4`](https://github.com/clerk/javascript/commit/010484f4978b9616e8c2ef50986eda742c4967bd)]:
  - @clerk/types@3.42.0
  - @clerk/backend@0.23.0

## 0.4.6

### Patch Changes

- Updated dependencies [[`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/backend@0.22.0
  - @clerk/types@3.41.1

## [0.4.0](https://github.com/clerk/javascript/compare/@clerk/fastify@0.3.1-staging.3...@clerk/fastify@0.4.0) (2023-05-15)

**Note:** Version bump only for package @clerk/fastify

## [0.3.0](https://github.com/clerk/javascript/compare/@clerk/fastify@0.3.0-staging.2...@clerk/fastify@0.3.0) (2023-05-04)

**Note:** Version bump only for package @clerk/fastify

## [0.3.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/fastify@0.3.0-staging.1...@clerk/fastify@0.3.0-staging.2) (2023-05-04)

**Note:** Version bump only for package @clerk/fastify

## [0.3.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/fastify@0.3.0-staging.0...@clerk/fastify@0.3.0-staging.1) (2023-05-02)

**Note:** Version bump only for package @clerk/fastify

### [0.2.6](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.6-staging.0...@clerk/fastify@0.2.6) (2023-04-19)

**Note:** Version bump only for package @clerk/fastify

### [0.2.5](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.4...@clerk/fastify@0.2.5) (2023-04-19)

**Note:** Version bump only for package @clerk/fastify

### [0.2.4](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.4-staging.0...@clerk/fastify@0.2.4) (2023-04-12)

**Note:** Version bump only for package @clerk/fastify

### [0.2.3](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.3-staging.3...@clerk/fastify@0.2.3) (2023-04-11)

**Note:** Version bump only for package @clerk/fastify

### [0.2.2](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.2-staging.0...@clerk/fastify@0.2.2) (2023-04-06)

**Note:** Version bump only for package @clerk/fastify

### [0.2.1](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.1-staging.3...@clerk/fastify@0.2.1) (2023-03-31)

**Note:** Version bump only for package @clerk/fastify

### [0.2.1-staging.1](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.1-staging.0...@clerk/fastify@0.2.1-staging.1) (2023-03-31)

**Note:** Version bump only for package @clerk/fastify

## [0.2.0](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.0-staging.0...@clerk/fastify@0.2.0) (2023-03-29)

**Note:** Version bump only for package @clerk/fastify

### [0.1.11](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.11-staging.2...@clerk/fastify@0.1.11) (2023-03-10)

**Note:** Version bump only for package @clerk/fastify

### [0.1.10](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.10-staging.1...@clerk/fastify@0.1.10) (2023-03-09)

**Note:** Version bump only for package @clerk/fastify

### [0.1.9](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.9-staging.1...@clerk/fastify@0.1.9) (2023-03-07)

**Note:** Version bump only for package @clerk/fastify

### [0.1.8](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.8-staging.1...@clerk/fastify@0.1.8) (2023-03-03)

**Note:** Version bump only for package @clerk/fastify

### [0.1.7](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.7-staging.0...@clerk/fastify@0.1.7) (2023-03-01)

**Note:** Version bump only for package @clerk/fastify

### [0.1.6](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.6-staging.0...@clerk/fastify@0.1.6) (2023-02-25)

**Note:** Version bump only for package @clerk/fastify

### [0.1.5](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.5-staging.7...@clerk/fastify@0.1.5) (2023-02-24)

**Note:** Version bump only for package @clerk/fastify

### [0.1.5-staging.4](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.5-staging.3...@clerk/fastify@0.1.5-staging.4) (2023-02-22)

**Note:** Version bump only for package @clerk/fastify

### [0.1.4](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.4-staging.1...@clerk/fastify@0.1.4) (2023-02-17)

**Note:** Version bump only for package @clerk/fastify

### [0.1.3](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.3-staging.2...@clerk/fastify@0.1.3) (2023-02-15)

**Note:** Version bump only for package @clerk/fastify

### [0.1.2](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.2-staging.1...@clerk/fastify@0.1.2) (2023-02-10)

**Note:** Version bump only for package @clerk/fastify

### [0.1.1](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.1-staging.0...@clerk/fastify@0.1.1) (2023-02-07)

**Note:** Version bump only for package @clerk/fastify

### [0.1.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.0...@clerk/fastify@0.1.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/fastify

## [0.1.0](https://github.com/clerk/javascript/compare/@clerk/fastify@0.0.2-staging.0...@clerk/fastify@0.1.0) (2023-02-07)

### Features

- **fastify:** Add @clerk/fastify implementation & use it in @playground/fastify ([6cb4c6a](https://github.com/clerk/javascript/commit/6cb4c6a800710a480958f3e238d535d87fe97de7))
- **fastify:** Export `clerkClient` and `createClerkClient` ([ba7abfa](https://github.com/clerk/javascript/commit/ba7abfaec7be0d1046250edf3658a0a0128f1513))
- **fastify:** Improve code readability and test coverage ([13d4f0f](https://github.com/clerk/javascript/commit/13d4f0f6781c39c5a670cf1c878efe312bef84ca))

### Bug Fixes

- **fastify:** Add deprecation warning for API_KEY & FRONTEND_API ([4957a23](https://github.com/clerk/javascript/commit/4957a23f8ca34d88d2aa63a4551b88ff5b3dcee9))
- **fastify:** Add type to plugin options ([7142f3c](https://github.com/clerk/javascript/commit/7142f3cedf1d6b1c0486763607782a98ce3c7aa8))
- **fastify:** Improve readability ([1162362](https://github.com/clerk/javascript/commit/1162362e3c591c4b422321f9d8fd18d97011f939))
- **fastify:** Introduce error message generator like in remix ([05475c2](https://github.com/clerk/javascript/commit/05475c214d6d48ee0a84fd49369a6b32871a0d87))
- **fastify:** Refactor to drop fastify deprecation warning ([472ab57](https://github.com/clerk/javascript/commit/472ab571a53b71da335ad12ff24866a873f01226))
- **fastify:** Tackle PR comments ([a2c9615](https://github.com/clerk/javascript/commit/a2c9615731610830e04425fd527f2e5cfb518361))
