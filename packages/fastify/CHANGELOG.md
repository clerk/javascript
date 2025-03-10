# Change Log

## 0.6.48

### Patch Changes

- Updated dependencies [[`7805d5ec2`](https://github.com/clerk/javascript/commit/7805d5ec2f30527185221776a4391a0b23ac1d64)]:
  - @clerk/types@3.65.5
  - @clerk/backend@0.38.15

## 0.6.47

### Patch Changes

- Updated dependencies [[`c5df11382`](https://github.com/clerk/javascript/commit/c5df1138244b784f0400d2607565368a10f05bae), [`c5df11382`](https://github.com/clerk/javascript/commit/c5df1138244b784f0400d2607565368a10f05bae)]:
  - @clerk/shared@1.4.2
  - @clerk/types@3.65.4
  - @clerk/backend@0.38.14

## 0.6.46

### Patch Changes

- Updated dependencies [[`f18ca132d`](https://github.com/clerk/javascript/commit/f18ca132d745b0b2bdeff0ea9ab4f8e586cf8a84)]:
  - @clerk/types@3.65.3
  - @clerk/backend@0.38.13

## 0.6.45

### Patch Changes

- Updated dependencies [[`9cd588d77`](https://github.com/clerk/javascript/commit/9cd588d779055b6bb5fd8f6d698a38586ce69485)]:
  - @clerk/backend@0.38.12

## 0.6.44

### Patch Changes

- Updated dependencies [[`76a1087c3`](https://github.com/clerk/javascript/commit/76a1087c372d16dd2ab3b6f0b6f4961c00448a52)]:
  - @clerk/types@3.65.2
  - @clerk/backend@0.38.11

## 0.6.43

### Patch Changes

- Updated dependencies [[`a8c0128be`](https://github.com/clerk/javascript/commit/a8c0128beb404d6c6e707b0735b439af6efdd076)]:
  - @clerk/types@3.65.1
  - @clerk/backend@0.38.10

## 0.6.42

### Patch Changes

- Updated dependencies [[`fcc349cb5`](https://github.com/clerk/javascript/commit/fcc349cb59e4bfdf82165144ca5509a8c73d1325)]:
  - @clerk/types@3.65.0
  - @clerk/backend@0.38.9

## 0.6.41

### Patch Changes

- Updated dependencies [[`7cd9dd668`](https://github.com/clerk/javascript/commit/7cd9dd668a76be42ad37bb78b1bd805bac4768f6)]:
  - @clerk/types@3.64.1
  - @clerk/backend@0.38.8

## 0.6.40

### Patch Changes

- Updated dependencies [[`220b813d5`](https://github.com/clerk/javascript/commit/220b813d536618837b8082cf776ad77fe8f239a9), [`4cf2a2198`](https://github.com/clerk/javascript/commit/4cf2a2198ed418adbcd5c04a1b2cbf95335696f6), [`c8ba96b86`](https://github.com/clerk/javascript/commit/c8ba96b865b3d112c8e0ee92f1426e927807ad05), [`07e73f21d`](https://github.com/clerk/javascript/commit/07e73f21db704e7878f05cba8aeaf0dfb02e9d14)]:
  - @clerk/types@3.64.0
  - @clerk/backend@0.38.7

## 0.6.39

### Patch Changes

- Updated dependencies [[`222acd810`](https://github.com/clerk/javascript/commit/222acd8103ed6f26641a46ef2a5b96c4aef4ebbc)]:
  - @clerk/types@3.63.1
  - @clerk/backend@0.38.6

## 0.6.38

### Patch Changes

- Updated dependencies [[`d9612801c`](https://github.com/clerk/javascript/commit/d9612801cff947be8fd991c0ff50c819873daf57)]:
  - @clerk/shared@1.4.1
  - @clerk/backend@0.38.5

## 0.6.37

### Patch Changes

- Updated dependencies [[`cd2bf9dce`](https://github.com/clerk/javascript/commit/cd2bf9dce3626d9abcd67453d2d809e164d1af4c), [`b47264367`](https://github.com/clerk/javascript/commit/b47264367bb9d09a39379600aca74e6a8de8ece3), [`089eee519`](https://github.com/clerk/javascript/commit/089eee519b20e8f03f310e76a25d4f05294322cc)]:
  - @clerk/types@3.63.0
  - @clerk/shared@1.4.0
  - @clerk/backend@0.38.4

## 0.6.36

### Patch Changes

- Updated dependencies [[`f44ce8b76`](https://github.com/clerk/javascript/commit/f44ce8b762e6cb7dc81d475fa65cbc9f7a943d19)]:
  - @clerk/shared@1.3.3
  - @clerk/backend@0.38.3

## 0.6.35

### Patch Changes

- Updated dependencies [[`228096446`](https://github.com/clerk/javascript/commit/22809644642170260e342c96937df8ef6fdd3647)]:
  - @clerk/shared@1.3.2
  - @clerk/types@3.62.1
  - @clerk/backend@0.38.2

## 0.6.34

### Patch Changes

- Updated dependencies [[`cd00175cb`](https://github.com/clerk/javascript/commit/cd00175cbbf902e8c0a0a1ff3875c173e03259a7), [`229996036`](https://github.com/clerk/javascript/commit/2299960369e63de58d18b4bbee54f174e50a6c81)]:
  - @clerk/types@3.62.0
  - @clerk/backend@0.38.1

## 0.6.33

### Patch Changes

- Updated dependencies [[`38f0f862b`](https://github.com/clerk/javascript/commit/38f0f862bfc5eb697625131a753f4127ff262895)]:
  - @clerk/backend@0.38.0
  - @clerk/types@3.61.0

## 0.6.32

### Patch Changes

- Updated dependencies [[`fee77c8a8`](https://github.com/clerk/javascript/commit/fee77c8a82e27ce0222efd3256111898e3388558)]:
  - @clerk/backend@0.37.3

## 0.6.31

### Patch Changes

- Replace the `Clerk-Backend-SDK` header with `User-Agent` in BAPI requests and update it's value to contain both the package name and the package version of the clerk package ([#2579](https://github.com/clerk/javascript/pull/2579)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  executing the request. Eg request from `@clerk/nextjs` to BAPI with append `User-Agent: @clerk/nextjs@5.0.0-alpha-v5.16` using the latest version.

  Miscellaneous changes: The backend test build changed to use tsup.

- Updated dependencies [[`c59a2d4a2`](https://github.com/clerk/javascript/commit/c59a2d4a22166076340b3c5c5e20c112a138acbe), [`2a615bf98`](https://github.com/clerk/javascript/commit/2a615bf98a22250c9105671ce72bf5374602802f)]:
  - @clerk/backend@0.37.2

## 0.6.30

### Patch Changes

- Updated dependencies [[`71b4b9ca2`](https://github.com/clerk/javascript/commit/71b4b9ca26db9b4f3b74b0de3eaa1584b656847a), [`65332d744`](https://github.com/clerk/javascript/commit/65332d7440419e275e76ffde104b7d0fe98ceeda)]:
  - @clerk/backend@0.37.1
  - @clerk/shared@1.3.1

## 0.6.29

### Patch Changes

- Updated dependencies [[`3ece3f80f`](https://github.com/clerk/javascript/commit/3ece3f80fbcfc4066796248f72f3a82fb261e23d), [`0bf0bdd56`](https://github.com/clerk/javascript/commit/0bf0bdd56268f53aa8b27f5d136c288afb10944b)]:
  - @clerk/backend@0.37.0
  - @clerk/shared@1.3.0

## 0.6.28

### Patch Changes

- Updated dependencies [[`df40705d3`](https://github.com/clerk/javascript/commit/df40705d3fbb22b8b4d6fd8ee0a52b100146d88a), [`a8feab74a`](https://github.com/clerk/javascript/commit/a8feab74ade1521df091cfc15295942e418034df)]:
  - @clerk/shared@1.2.0
  - @clerk/backend@0.36.1

## 0.6.27

### Patch Changes

- Updated dependencies [[`b4868ab8f`](https://github.com/clerk/javascript/commit/b4868ab8fdb84144d2016b49e67e7fdd2c348316), [`2dc93d4d8`](https://github.com/clerk/javascript/commit/2dc93d4d8dcdc5f83c21576400ae6d6f43705847)]:
  - @clerk/types@3.60.0
  - @clerk/backend@0.36.0

## 0.6.26

### Patch Changes

- Updated dependencies [[`a62479810`](https://github.com/clerk/javascript/commit/a624798102236f77a667d8da13363b77486640f8)]:
  - @clerk/types@3.59.0
  - @clerk/backend@0.35.1

## 0.6.25

### Patch Changes

- Updated dependencies [[`31ee1438a`](https://github.com/clerk/javascript/commit/31ee1438aa848aff50889c31a2f2bb8098eb1424), [`7ef3414ba`](https://github.com/clerk/javascript/commit/7ef3414ba2318e14f7d7ed1721515f518bbb5956), [`c7763fa60`](https://github.com/clerk/javascript/commit/c7763fa60e975d0c48b461447b0425ead3d734df), [`12b362923`](https://github.com/clerk/javascript/commit/12b362923366a913a455b516a262455e0a40d723)]:
  - @clerk/types@3.58.1
  - @clerk/backend@0.35.0

## 0.6.24

### Patch Changes

- Updated dependencies [[`11fdbcb39`](https://github.com/clerk/javascript/commit/11fdbcb39ba155fcada663897c24911d84ff3654)]:
  - @clerk/backend@0.34.3

## 0.6.23

### Patch Changes

- Updated dependencies [[`aaaf24a55`](https://github.com/clerk/javascript/commit/aaaf24a55a51acd501c956fb2a42e0af6230955a), [`e41374abf`](https://github.com/clerk/javascript/commit/e41374abf96ae62410ac63c03c5055d4f9af363e), [`e41374abf`](https://github.com/clerk/javascript/commit/e41374abf96ae62410ac63c03c5055d4f9af363e), [`e61df051c`](https://github.com/clerk/javascript/commit/e61df051cf849b5372f5b8b2ac7e16210056c52c), [`9d8a29b8e`](https://github.com/clerk/javascript/commit/9d8a29b8e4ad42edf30dbceece8053f23578246f)]:
  - @clerk/backend@0.34.2
  - @clerk/shared@1.1.1

## 0.6.22

### Patch Changes

- Updated dependencies [[`1df2ffe77`](https://github.com/clerk/javascript/commit/1df2ffe777838ecdbc1c47164398ed1f4521e3e2)]:
  - @clerk/backend@0.34.1

## 0.6.21

### Patch Changes

- Updated dependencies [[`7fa8fbcf2`](https://github.com/clerk/javascript/commit/7fa8fbcf21df0d52d49168eae511c580c5c82977), [`068a9025c`](https://github.com/clerk/javascript/commit/068a9025c7d7fb7e7207674d4d43844964053ca3), [`4c3429010`](https://github.com/clerk/javascript/commit/4c342901072ec37c4f77916ccdf964c6eaf04e81), [`d7fe11ede`](https://github.com/clerk/javascript/commit/d7fe11ede1b23bacc5d811c50587bac251d560b8), [`20eab8365`](https://github.com/clerk/javascript/commit/20eab836569bba99bbc058d1dd599c5fcfc005de), [`f9d1bc758`](https://github.com/clerk/javascript/commit/f9d1bc758972328be7ddb7d61f66baea2aaf2c96), [`f652a5618`](https://github.com/clerk/javascript/commit/f652a5618b7019c916000f78ea3c1e4abf9a6c1b)]:
  - @clerk/shared@1.1.0
  - @clerk/types@3.58.0
  - @clerk/backend@0.34.0

## 0.6.20

### Patch Changes

- Updated dependencies [[`f6f67f9ab`](https://github.com/clerk/javascript/commit/f6f67f9abb858aa2d12aa5a6afcc0091fa89225f), [`a8d7a687e`](https://github.com/clerk/javascript/commit/a8d7a687e7771f24735ca6ff05da86441193a591), [`7b91aca54`](https://github.com/clerk/javascript/commit/7b91aca548f323891888180c0ac9b54d3143151c), [`0f8aedd62`](https://github.com/clerk/javascript/commit/0f8aedd621dde78d6304b51668a9b06272c5d540), [`bc19fe025`](https://github.com/clerk/javascript/commit/bc19fe025d8b1ee9339dcffdb1dd785d00c4e766), [`60ea712fa`](https://github.com/clerk/javascript/commit/60ea712fa389dd43ffe72454c1fa9b7784bca2c4)]:
  - @clerk/types@3.57.1
  - @clerk/shared@1.0.2
  - @clerk/backend@0.33.0

## 0.6.19

### Patch Changes

- Updated dependencies [[`29a5f5641`](https://github.com/clerk/javascript/commit/29a5f56416db5e802ee38512205e5092d9b0b420)]:
  - @clerk/shared@1.0.1
  - @clerk/backend@0.32.1

## 0.6.18

### Patch Changes

- Updated dependencies [[`088724324`](https://github.com/clerk/javascript/commit/088724324403dbbb06f28ba6538b8bec1fd7ae9f)]:
  - @clerk/backend@0.32.0

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
