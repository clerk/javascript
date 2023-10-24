# Change Log

## 0.19.13

### Patch Changes

- Updated dependencies [[`9e57e94d2`](https://github.com/clerkinc/javascript/commit/9e57e94d25b96c11889f49e7e4d4827e5134927d)]:
  - @clerk/clerk-js@4.64.0

## 0.19.12

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerkinc/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`3bf64107e`](https://github.com/clerkinc/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`52f8553d2`](https://github.com/clerkinc/javascript/commit/52f8553d22f9454ee1194fd162410db15da7a4be), [`89932e1b3`](https://github.com/clerkinc/javascript/commit/89932e1b32723479541ab2ba4cc87e3973b5ef85), [`92727eec3`](https://github.com/clerkinc/javascript/commit/92727eec39566278263ffa118a085493f964eb94), [`b09b66eec`](https://github.com/clerkinc/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerkinc/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62), [`37d8856ba`](https://github.com/clerkinc/javascript/commit/37d8856babb9db8edf763455172c4d22d6035036), [`aa4cd7615`](https://github.com/clerkinc/javascript/commit/aa4cd761585b888706a36a6eed7436a8f0476dbf)]:
  - @clerk/clerk-js@4.63.0
  - @clerk/shared@1.0.0
  - @clerk/clerk-react@4.27.0

## 0.19.11

### Patch Changes

- Updated dependencies [[`d78bd8464`](https://github.com/clerkinc/javascript/commit/d78bd846486b999dd006b85c0ddf0f6695028b20), [`112b90bea`](https://github.com/clerkinc/javascript/commit/112b90bea703a4338970d29532b9119dcaf591a7), [`ec10f673e`](https://github.com/clerkinc/javascript/commit/ec10f673ea220b2635b690ee342e0c3f32cfaf5c), [`9ca215702`](https://github.com/clerkinc/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11), [`21f61ce1d`](https://github.com/clerkinc/javascript/commit/21f61ce1da8cad98ed12a98379a6d6c99c39b5ba)]:
  - @clerk/clerk-js@4.62.1
  - @clerk/clerk-react@4.26.6

## 0.19.10

### Patch Changes

- Updated dependencies [[`da450b5e1`](https://github.com/clerkinc/javascript/commit/da450b5e15326faeb873aa32f42b36afb1092bd1), [`35be8709d`](https://github.com/clerkinc/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`e38488c92`](https://github.com/clerkinc/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerkinc/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`9b644d799`](https://github.com/clerkinc/javascript/commit/9b644d7991b8cba4b385e9443f87798cde5c9989), [`a9894b445`](https://github.com/clerkinc/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`e67fcfe19`](https://github.com/clerkinc/javascript/commit/e67fcfe1984ad619d1cc26654e4b594ba47d02c3), [`81b63e320`](https://github.com/clerkinc/javascript/commit/81b63e320ba5e828e2893e76b041a737a891ed7d), [`834dadb36`](https://github.com/clerkinc/javascript/commit/834dadb36c30b2a8f052784de4ad1026b0083b4e), [`29485ebd8`](https://github.com/clerkinc/javascript/commit/29485ebd8184f4b3b92554c9360998971568e352), [`8000e3a3f`](https://github.com/clerkinc/javascript/commit/8000e3a3f41052e97ceebb5b31222687e158d7e8), [`e1e5d37d4`](https://github.com/clerkinc/javascript/commit/e1e5d37d480d56b8cb2fce8d335db87a127f2130), [`70f251007`](https://github.com/clerkinc/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`8434782c5`](https://github.com/clerkinc/javascript/commit/8434782c53147e4e3333746fd6096212dfcaa51d), [`393115678`](https://github.com/clerkinc/javascript/commit/393115678fa1b659bd6708a0cdc54143e1ec983c), [`a46d6fe99`](https://github.com/clerkinc/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/clerk-js@4.62.0
  - @clerk/shared@0.24.5
  - @clerk/clerk-react@4.26.5

## 0.19.9

### Patch Changes

- Warn about environment variables deprecations: ([#1859](https://github.com/clerkinc/javascript/pull/1859)) by [@dimkl](https://github.com/dimkl)

  - `CLERK_API_KEY`
  - `CLERK_FRONTEND_API`
  - `NEXT_PUBLIC_CLERK_FRONTEND_API`

- Introduce a new property on the core Clerk singleton, `sdkMetadata`. This will be populated by each host SDK. This metadata will be used to make logging and debugging easier. ([#1857](https://github.com/clerkinc/javascript/pull/1857)) by [@BRKalow](https://github.com/BRKalow)

- Introduce new `*EmailLink*` helpers that will replace the `*MagicLink*` helpers. ([#1833](https://github.com/clerkinc/javascript/pull/1833)) by [@dimkl](https://github.com/dimkl)

  Also marked all the `*MagicLink*` as deprecated using JSDocs.

- Updated dependencies [[`977336f79`](https://github.com/clerkinc/javascript/commit/977336f793cd4ce5984f98dac3cedf9f5ec363f5), [`f20adc357`](https://github.com/clerkinc/javascript/commit/f20adc357cd9fd34cedb4cc7aac2df4be77fb8ea), [`c04ad94b1`](https://github.com/clerkinc/javascript/commit/c04ad94b1dd58fe4b59333b76a3988b1811d5cc2), [`997b8e256`](https://github.com/clerkinc/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91e9a55f4`](https://github.com/clerkinc/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`25cfa7ae8`](https://github.com/clerkinc/javascript/commit/25cfa7ae8ad35bad6f3ca18af8ce876ddc0219f9), [`c9b17f5a7`](https://github.com/clerkinc/javascript/commit/c9b17f5a72cb27786cfc7f1fb42be1233fb10d5c), [`997b8e256`](https://github.com/clerkinc/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91014880d`](https://github.com/clerkinc/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`5a3995b38`](https://github.com/clerkinc/javascript/commit/5a3995b38b214f376af95b53959554c80aed7dc4), [`7f4d4b942`](https://github.com/clerkinc/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b), [`f6faf6fda`](https://github.com/clerkinc/javascript/commit/f6faf6fdadef9ca8ce0e98e3da40437f43c411ad)]:
  - @clerk/clerk-js@4.61.0
  - @clerk/shared@0.24.4
  - @clerk/clerk-react@4.26.4

## 0.19.8

### Patch Changes

- Updated dependencies [[`1136c7c15`](https://github.com/clerkinc/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1e212c19d`](https://github.com/clerkinc/javascript/commit/1e212c19d1cbfbcf6bc6718f5aec0a3cb893b96f), [`1136c7c15`](https://github.com/clerkinc/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679)]:
  - @clerk/clerk-react@4.26.3
  - @clerk/clerk-js@4.60.1

## 0.19.7

### Patch Changes

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerkinc/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerkinc/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`164f3aac7`](https://github.com/clerkinc/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerkinc/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerkinc/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`0636ff779`](https://github.com/clerkinc/javascript/commit/0636ff7799e126d1438d2738ce0e46c3b277f46a), [`2e9be8461`](https://github.com/clerkinc/javascript/commit/2e9be8461f65004c920e359abbf69ef516ff0aa6), [`71bb1c7b5`](https://github.com/clerkinc/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf), [`e592565e0`](https://github.com/clerkinc/javascript/commit/e592565e0d7707626587f5e0ae7fb7279c84f050), [`19b3aea45`](https://github.com/clerkinc/javascript/commit/19b3aea451dd57950f80f2d393598d33638f1398)]:
  - @clerk/clerk-js@4.60.0
  - @clerk/clerk-react@4.26.2

## 0.19.6

### Patch Changes

- Updated dependencies [[`a0b25671c`](https://github.com/clerkinc/javascript/commit/a0b25671cdee39cd0c2fca832b8c378fd445ec39), [`d1ad5ac37`](https://github.com/clerkinc/javascript/commit/d1ad5ac373ff2ff66450afc74aeba9b26fc133ce)]:
  - @clerk/clerk-react@4.26.1
  - @clerk/clerk-js@4.59.1

## 0.19.5

### Patch Changes

- Updated dependencies [[`f3f643163`](https://github.com/clerkinc/javascript/commit/f3f643163a6163d89d3e3407358739d49db8b7f7), [`cc8851765`](https://github.com/clerkinc/javascript/commit/cc88517650100b0305e4d7a44db62daec3482a33), [`ea4aa67a3`](https://github.com/clerkinc/javascript/commit/ea4aa67a31675f1ca504cde63eec37a0e351140b), [`5c8754239`](https://github.com/clerkinc/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81), [`b69fad0ce`](https://github.com/clerkinc/javascript/commit/b69fad0ceddc462f9071ee89db40485a0abd8528), [`14895e2dd`](https://github.com/clerkinc/javascript/commit/14895e2dde0fa15b594b1b7d89829d6013f5afc6)]:
  - @clerk/clerk-js@4.59.0
  - @clerk/clerk-react@4.26.0

## 0.19.4

### Patch Changes

- The [issue #1680](https://github.com/clerkinc/javascript/issues/1608) has uncovered that the version `1.3.0` of `react-native-url-polyfill` did not had support for Expo Web. ([#1773](https://github.com/clerkinc/javascript/pull/1773)) by [@octoper](https://github.com/octoper)

  The error was that because we rely on `react-native-url-polyfill/auto`, the would also apply the polyfill if executed on the web, which is not required as the `URL` has support for all modern browsers and there is no need to pollyfill it.

  The version of `react-native-url-polyfill` was upgraded from `1.3.0` to `2.0.0` to fix the error.

- Updated dependencies [[`0eb666118`](https://github.com/clerkinc/javascript/commit/0eb66611882e6c460cc6a6c5cfa1d9b086ec6917), [`53ccb27cf`](https://github.com/clerkinc/javascript/commit/53ccb27cfd195af65adde6694572ed523fc66d6d), [`3ceb2a734`](https://github.com/clerkinc/javascript/commit/3ceb2a734a43f134956164377399fec46e01e0a1), [`c61ddf5bf`](https://github.com/clerkinc/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerkinc/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/clerk-js@4.58.2
  - @clerk/clerk-react@4.25.2

## 0.19.3

### Patch Changes

- Updated dependencies [[`a2c7115dd`](https://github.com/clerkinc/javascript/commit/a2c7115dd3f4574e1970a985360916d954ad36cd), [`378a903ac`](https://github.com/clerkinc/javascript/commit/378a903ac4dc12e6ee708de20f0d9a5aa758bd18)]:
  - @clerk/clerk-js@4.58.1
  - @clerk/clerk-react@4.25.1

## 0.19.2

### Patch Changes

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerkinc/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`30bb9eccb`](https://github.com/clerkinc/javascript/commit/30bb9eccb95632fb1de02b756e818118ca6324f7), [`e99df0a0d`](https://github.com/clerkinc/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerkinc/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`a8eb4351a`](https://github.com/clerkinc/javascript/commit/a8eb4351a623b26a961c6968684e3a1f43ebd10d), [`23c073957`](https://github.com/clerkinc/javascript/commit/23c073957bc61cf27824e9c7e15e89f65c3eab35), [`01b024c57`](https://github.com/clerkinc/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68), [`b0f396bc5`](https://github.com/clerkinc/javascript/commit/b0f396bc5c75c9920df46e26d672c37f3cc3d974), [`16f667275`](https://github.com/clerkinc/javascript/commit/16f667275c7dd6f97ca94b247d72afa92c4ab4ce), [`7fa93644d`](https://github.com/clerkinc/javascript/commit/7fa93644d47252a472000633a939dc15d8d7f292), [`634948fda`](https://github.com/clerkinc/javascript/commit/634948fdaf9276b593f8fabcb2af45f3c3457048), [`43786f8d0`](https://github.com/clerkinc/javascript/commit/43786f8d0d89c3e8a827415aabba4020a928eeed)]:
  - @clerk/clerk-js@4.58.0
  - @clerk/clerk-react@4.25.0

## 0.19.1

### Patch Changes

- Updated dependencies [[`463ff84f5`](https://github.com/clerkinc/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`1426e5eb3`](https://github.com/clerkinc/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739)]:
  - @clerk/clerk-js@4.57.0
  - @clerk/clerk-react@4.24.2

## 0.19.0

### Minor Changes

- Support swapping the Clerk publishableKey at runtime to allow users to toggle the instance being used. ([#1655](https://github.com/clerkinc/javascript/pull/1655)) by [@BRKalow](https://github.com/BRKalow)

### Patch Changes

- Updated dependencies [[`6384ea8da`](https://github.com/clerkinc/javascript/commit/6384ea8dae85b3e1b58b0b70c761c0d2794e3aaa), [`b491dddae`](https://github.com/clerkinc/javascript/commit/b491dddae41030556b0be5c709f128838d4b1196), [`a102c21d4`](https://github.com/clerkinc/javascript/commit/a102c21d4762895a80a1ad846700763cc801b3f3)]:
  - @clerk/clerk-js@4.56.3
  - @clerk/clerk-react@4.24.1

## 0.18.20

### Patch Changes

- Updated dependencies [[`3882e913f`](https://github.com/clerkinc/javascript/commit/3882e913fd9bf4b7d1a9bf71691296d866204e56)]:
  - @clerk/clerk-js@4.56.2

## 0.18.19

### Patch Changes

- Updated dependencies [[`27a70551c`](https://github.com/clerkinc/javascript/commit/27a70551cb1fa3fdcf9878f78f32c6b19a18fea0)]:
  - @clerk/clerk-js@4.56.1

## 0.18.18

### Patch Changes

- Ensure the session token is updated when calling `setActive()` in a non-browser environment. ([#1623](https://github.com/clerkinc/javascript/pull/1623)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`854aa381c`](https://github.com/clerkinc/javascript/commit/854aa381c31b712f264767e16e7025884a5122d7), [`96cc1921c`](https://github.com/clerkinc/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerkinc/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerkinc/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerkinc/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerkinc/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerkinc/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerkinc/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerkinc/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerkinc/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerkinc/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`d39c029a5`](https://github.com/clerkinc/javascript/commit/d39c029a543e861556773bfbc0b208cde3a54521), [`86de584dd`](https://github.com/clerkinc/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`ac5a70059`](https://github.com/clerkinc/javascript/commit/ac5a70059ca142a95b168909c05d488c05d94c3a), [`e02a1aff2`](https://github.com/clerkinc/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`1663aaae7`](https://github.com/clerkinc/javascript/commit/1663aaae704b8a0f62e31acab440584e681666b3), [`09bfb793e`](https://github.com/clerkinc/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerkinc/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerkinc/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerkinc/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerkinc/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`89bc5de04`](https://github.com/clerkinc/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/clerk-js@4.56.0
  - @clerk/clerk-react@4.24.0

## 0.18.17

### Patch Changes

- Updated dependencies [[`ea95525a4`](https://github.com/clerkinc/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerkinc/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`0b9388c01`](https://github.com/clerkinc/javascript/commit/0b9388c01b84557e3b63c1de91ab8b51369b26a7), [`2244f6ab1`](https://github.com/clerkinc/javascript/commit/2244f6ab1015536a929567d0f551f9a933634bab), [`5e1a09df4`](https://github.com/clerkinc/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`0a59e122d`](https://github.com/clerkinc/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/clerk-js@4.55.0
  - @clerk/clerk-react@4.23.2

## 0.18.16

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.54.2

## 0.18.15

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerkinc/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3), [`671561697`](https://github.com/clerkinc/javascript/commit/671561697c205dd984fd4c6b9864055d8fe2fc8b), [`38644778e`](https://github.com/clerkinc/javascript/commit/38644778ee9cc0b4196bd32537c543b8c51775c3), [`808e45dc4`](https://github.com/clerkinc/javascript/commit/808e45dc42cc65c8aec99f034131721d34d32656)]:
  - @clerk/clerk-js@4.54.1
  - @clerk/clerk-react@4.23.1

## 0.18.14

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerkinc/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c), [`a9ca4355d`](https://github.com/clerkinc/javascript/commit/a9ca4355de4375046c79ecbe09bf3998ae94ded1)]:
  - @clerk/clerk-js@4.54.0
  - @clerk/clerk-react@4.23.0

## 0.18.13

### Patch Changes

- Updated dependencies [[`73c9c1d0e`](https://github.com/clerkinc/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerkinc/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerkinc/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`0a7a88995`](https://github.com/clerkinc/javascript/commit/0a7a889956f5e060584b17cdb59d9c9abe5473f9), [`17f963e38`](https://github.com/clerkinc/javascript/commit/17f963e38101733b8c5e500db251a5128f762c8f), [`592911196`](https://github.com/clerkinc/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8), [`dd10ebeae`](https://github.com/clerkinc/javascript/commit/dd10ebeae54d70b84b7c0374cea2876e9cdd6622), [`cf918665c`](https://github.com/clerkinc/javascript/commit/cf918665c55cac911afa17332bcce71435343d9d)]:
  - @clerk/clerk-js@4.53.0
  - @clerk/clerk-react@4.22.1

## 0.18.12

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.52.1

## 0.18.11

### Patch Changes

- Updated dependencies [[`fb426385b`](https://github.com/clerkinc/javascript/commit/fb426385be19b888e311613d830b125c7df152aa), [`f6b77a1a3`](https://github.com/clerkinc/javascript/commit/f6b77a1a338cddeadb3cc7019171bf9703d7676e), [`670a7616d`](https://github.com/clerkinc/javascript/commit/670a7616d8476075eabf8a153d2bf84422a5cbd3)]:
  - @clerk/clerk-js@4.52.0
  - @clerk/clerk-react@4.22.0

## 0.18.10

### Patch Changes

- Updated dependencies [[`968d9c265`](https://github.com/clerkinc/javascript/commit/968d9c2651ce25f6e03c2e6eecd81f7daf876f03)]:
  - @clerk/clerk-react@4.21.1

## 0.18.9

### Patch Changes

- Updated dependencies [[`1e71b60a2`](https://github.com/clerkinc/javascript/commit/1e71b60a2c6832a5f4f9c75ad4152b82db2b52e1)]:
  - @clerk/clerk-react@4.21.0

## 0.18.8

### Patch Changes

- Updated dependencies [[`ac236e8d3`](https://github.com/clerkinc/javascript/commit/ac236e8d3e23111b9b990a32c94358c179812d6a)]:
  - @clerk/clerk-js@4.51.0
  - @clerk/clerk-react@4.20.6

## 0.18.7

### Patch Changes

- Updated dependencies [[`9b79d9b64`](https://github.com/clerkinc/javascript/commit/9b79d9b6465175f966dcecdd750f8904ad44c69e)]:
  - @clerk/clerk-js@4.50.1

## 0.18.6

### Patch Changes

- Updated dependencies [[`32ef3304`](https://github.com/clerkinc/javascript/commit/32ef3304161c2d7b307c02222ffee590bd821e5b), [`bfb3af28`](https://github.com/clerkinc/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/clerk-js@4.50.0
  - @clerk/clerk-react@4.20.5

## 0.18.5

### Patch Changes

- Updated dependencies [[`11954816`](https://github.com/clerkinc/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`32148490`](https://github.com/clerkinc/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/clerk-js@4.49.0
  - @clerk/clerk-react@4.20.4

## 0.18.4

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.48.1
  - @clerk/clerk-react@4.20.3

## 0.18.3

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerkinc/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerkinc/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/clerk-js@4.48.0
  - @clerk/clerk-react@4.20.2

## 0.18.2

### Patch Changes

- Updated dependencies [[`59bc649a`](https://github.com/clerkinc/javascript/commit/59bc649a92316f5d6ade00f3cd52a9b46dcdc401)]:
  - @clerk/clerk-js@4.47.2
  - @clerk/clerk-react@4.20.1

## 0.18.1

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.47.1

## 0.18.0

### Minor Changes

- Export error helpers from the shared package to the framework specific packages ([#1308](https://github.com/clerkinc/javascript/pull/1308)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Updated dependencies [[`7af91bc3`](https://github.com/clerkinc/javascript/commit/7af91bc3ecc25cba04968b491e1e3c6ec32c18af), [`c42b4ac0`](https://github.com/clerkinc/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`6f3d4305`](https://github.com/clerkinc/javascript/commit/6f3d43055690db1d69a356503a0a45dc948beaef), [`846b00b9`](https://github.com/clerkinc/javascript/commit/846b00b90167ab5a77456d32653a221faddd835a)]:
  - @clerk/clerk-react@4.20.0
  - @clerk/clerk-js@4.47.0

## 0.17.8

### Patch Changes

- Updated dependencies [[`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/clerk-js@4.46.0
  - @clerk/clerk-react@4.19.0

## [0.17.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.16.5-staging.4...@clerk/clerk-expo@0.17.0) (2023-05-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.16.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.16.4-staging.6...@clerk/clerk-expo@0.16.4) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.16.4-staging.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.16.4-staging.4...@clerk/clerk-expo@0.16.4-staging.5) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.16.4-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.16.4-staging.2...@clerk/clerk-expo@0.16.4-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.16.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.16.3-staging.0...@clerk/clerk-expo@0.16.3) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.16.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.16.1...@clerk/clerk-expo@0.16.2) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.16.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.16.1-staging.1...@clerk/clerk-expo@0.16.1) (2023-04-12)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.16.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.16.0-staging.3...@clerk/clerk-expo@0.16.0) (2023-04-11)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.15.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.15.0-staging.1...@clerk/clerk-expo@0.15.0) (2023-04-06)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.14.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.14.3-staging.1...@clerk/clerk-expo@0.14.3) (2023-04-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.14.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.14.2-staging.3...@clerk/clerk-expo@0.14.2) (2023-03-31)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.14.2-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.14.2-staging.2...@clerk/clerk-expo@0.14.2-staging.3) (2023-03-31)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.14.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.14.1-staging.0...@clerk/clerk-expo@0.14.1) (2023-03-29)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.14.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.14.0-staging.2...@clerk/clerk-expo@0.14.0) (2023-03-29)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.13](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.13-staging.2...@clerk/clerk-expo@0.12.13) (2023-03-10)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.12](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.12-staging.3...@clerk/clerk-expo@0.12.12) (2023-03-09)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.11](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.10...@clerk/clerk-expo@0.12.11) (2023-03-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.10](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.10-staging.0...@clerk/clerk-expo@0.12.10) (2023-03-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.9](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.9-staging.1...@clerk/clerk-expo@0.12.9) (2023-03-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.8](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.8-staging.1...@clerk/clerk-expo@0.12.8) (2023-03-01)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.7-staging.0...@clerk/clerk-expo@0.12.7) (2023-02-27)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.6-staging.1...@clerk/clerk-expo@0.12.6) (2023-02-25)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.6-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.6-staging.0...@clerk/clerk-expo@0.12.6-staging.1) (2023-02-25)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.5-staging.5...@clerk/clerk-expo@0.12.5) (2023-02-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.5-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.5-staging.2...@clerk/clerk-expo@0.12.5-staging.3) (2023-02-22)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.4-staging.0...@clerk/clerk-expo@0.12.4) (2023-02-17)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.3-staging.2...@clerk/clerk-expo@0.12.3) (2023-02-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.2-staging.1...@clerk/clerk-expo@0.12.2) (2023-02-10)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.1-staging.0...@clerk/clerk-expo@0.12.1) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.12.1-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.12.0...@clerk/clerk-expo@0.12.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.12.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.11.8-staging.1...@clerk/clerk-expo@0.12.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.11.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.11.7-staging.5...@clerk/clerk-expo@0.11.7) (2023-02-01)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.11.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.11.6-staging.5...@clerk/clerk-expo@0.11.6) (2023-01-27)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.11.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.11.5-staging.2...@clerk/clerk-expo@0.11.5) (2023-01-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.11.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.11.3...@clerk/clerk-expo@0.11.4) (2023-01-20)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.11.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.11.2...@clerk/clerk-expo@0.11.3) (2023-01-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.11.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.11.1...@clerk/clerk-expo@0.11.2) (2023-01-17)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.11.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.11.0...@clerk/clerk-expo@0.11.1) (2023-01-17)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.11.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.11.0-staging.5...@clerk/clerk-expo@0.11.0) (2023-01-17)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.16](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.16-staging.0...@clerk/clerk-expo@0.10.16) (2022-12-23)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.15](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.15-staging.1...@clerk/clerk-expo@0.10.15) (2022-12-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.14](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.13...@clerk/clerk-expo@0.10.14) (2022-12-14)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.13](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.13-staging.0...@clerk/clerk-expo@0.10.13) (2022-12-13)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.12](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.11...@clerk/clerk-expo@0.10.12) (2022-12-12)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.11](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.11-staging.0...@clerk/clerk-expo@0.10.11) (2022-12-12)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.10](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.10-staging.2...@clerk/clerk-expo@0.10.10) (2022-12-09)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.9](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.8...@clerk/clerk-expo@0.10.9) (2022-12-08)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.8](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.7...@clerk/clerk-expo@0.10.8) (2022-12-08)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.7-staging.0...@clerk/clerk-expo@0.10.7) (2022-12-08)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.6-staging.1...@clerk/clerk-expo@0.10.6) (2022-12-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.5-staging.2...@clerk/clerk-expo@0.10.5) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.5-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.5-staging.1...@clerk/clerk-expo@0.10.5-staging.2) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.5-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.5-staging.0...@clerk/clerk-expo@0.10.5-staging.1) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.4-staging.8...@clerk/clerk-expo@0.10.4) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.4-staging.8](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.4-staging.7...@clerk/clerk-expo@0.10.4-staging.8) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.4-staging.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.4-staging.6...@clerk/clerk-expo@0.10.4-staging.7) (2022-11-29)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.4-staging.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.4-staging.5...@clerk/clerk-expo@0.10.4-staging.6) (2022-11-29)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.3-staging.1...@clerk/clerk-expo@0.10.3) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.3-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.3-staging.0...@clerk/clerk-expo@0.10.3-staging.1) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.2-staging.0...@clerk/clerk-expo@0.10.2) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.10.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.0...@clerk/clerk-expo@0.10.1) (2022-11-23)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.10.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.0-staging.3...@clerk/clerk-expo@0.10.0) (2022-11-22)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.10.0-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.10.0-staging.0...@clerk/clerk-expo@0.10.0-staging.1) (2022-11-21)

### Bug Fixes

- **clerk-react:** Add HeadlessBrowserClerk ([4236147](https://github.com/clerkinc/javascript/commit/4236147201b32e3f1d60ebbe2c36de8e89e5e2f6))

## [0.10.0-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.74-staging.1...@clerk/clerk-expo@0.10.0-staging.0) (2022-11-21)

### Features

- **clerk-js:** Improve DX for headless import ([8d64310](https://github.com/clerkinc/javascript/commit/8d64310ab23c6e21f8a687e503521245acad8211))

### [0.9.73](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.73-staging.1...@clerk/clerk-expo@0.9.73) (2022-11-18)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.72](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.71...@clerk/clerk-expo@0.9.72) (2022-11-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.71](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.71-staging.5...@clerk/clerk-expo@0.9.71) (2022-11-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.70](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.70-staging.2...@clerk/clerk-expo@0.9.70) (2022-11-10)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.69](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.69-staging.2...@clerk/clerk-expo@0.9.69) (2022-11-05)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.68](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.68-staging.8...@clerk/clerk-expo@0.9.68) (2022-11-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.68-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.68-staging.3...@clerk/clerk-expo@0.9.68-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.68-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.68-staging.1...@clerk/clerk-expo@0.9.68-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.68-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.68-staging.1...@clerk/clerk-expo@0.9.68-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.68-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.67...@clerk/clerk-expo@0.9.68-staging.1) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.67](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.66...@clerk/clerk-expo@0.9.67) (2022-10-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.66](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.66-staging.2...@clerk/clerk-expo@0.9.66) (2022-10-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.65](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.64...@clerk/clerk-expo@0.9.65) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.64](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.63...@clerk/clerk-expo@0.9.64) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.63](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.63-staging.2...@clerk/clerk-expo@0.9.63) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.63-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.62...@clerk/clerk-expo@0.9.63-staging.1) (2022-10-13)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.62](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.62-staging.1...@clerk/clerk-expo@0.9.62) (2022-10-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.61](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.61-staging.0...@clerk/clerk-expo@0.9.61) (2022-10-05)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.60](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.60-staging.4...@clerk/clerk-expo@0.9.60) (2022-10-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.59](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.59-staging.4...@clerk/clerk-expo@0.9.59) (2022-09-29)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.58](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.57...@clerk/clerk-expo@0.9.58) (2022-09-25)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.57](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.57-staging.2...@clerk/clerk-expo@0.9.57) (2022-09-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.57-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.57-staging.0...@clerk/clerk-expo@0.9.57-staging.1) (2022-09-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.56](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.56-staging.2...@clerk/clerk-expo@0.9.56) (2022-09-22)

### Bug Fixes

- **clerk-expo:** Add org hooks to expo ([93ac733](https://github.com/clerkinc/javascript/commit/93ac73329d6c36ffdf269b5ae6f26ec18e0246c0))

### [0.9.55](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.53-staging.4...@clerk/clerk-expo@0.9.55) (2022-09-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.53](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.53-staging.4...@clerk/clerk-expo@0.9.53) (2022-09-16)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.52](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.52-staging.0...@clerk/clerk-expo@0.9.52) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.51](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.51-staging.1...@clerk/clerk-expo@0.9.51) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.50](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.50-staging.0...@clerk/clerk-expo@0.9.50) (2022-09-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.49](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.49-staging.2...@clerk/clerk-expo@0.9.49) (2022-09-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.48](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.48-staging.0...@clerk/clerk-expo@0.9.48) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.47](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.47-staging.2...@clerk/clerk-expo@0.9.47) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.46](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.46-staging.1...@clerk/clerk-expo@0.9.46) (2022-08-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.45](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.44...@clerk/clerk-expo@0.9.45) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.44](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.44-staging.1...@clerk/clerk-expo@0.9.44) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.44-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.44-staging.0...@clerk/clerk-expo@0.9.44-staging.1) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.43](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.42...@clerk/clerk-expo@0.9.43) (2022-08-16)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.42](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.42-staging.1...@clerk/clerk-expo@0.9.42) (2022-08-11)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.41](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.41-staging.0...@clerk/clerk-expo@0.9.41) (2022-08-10)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.40](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.40-staging.0...@clerk/clerk-expo@0.9.40) (2022-08-09)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.39](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.38...@clerk/clerk-expo@0.9.39) (2022-08-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.38](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.38-staging.1...@clerk/clerk-expo@0.9.38) (2022-08-05)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.37](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.36...@clerk/clerk-expo@0.9.37) (2022-08-04)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.36](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.35...@clerk/clerk-expo@0.9.36) (2022-07-13)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.35](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.35-staging.1...@clerk/clerk-expo@0.9.35) (2022-07-12)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.34](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.34-staging.0...@clerk/clerk-expo@0.9.34) (2022-07-11)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.33](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.32...@clerk/clerk-expo@0.9.33) (2022-07-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.32](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.31...@clerk/clerk-expo@0.9.32) (2022-07-06)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.31](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.30...@clerk/clerk-expo@0.9.31) (2022-07-01)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.30](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.29...@clerk/clerk-expo@0.9.30) (2022-06-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.29](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.29-staging.1...@clerk/clerk-expo@0.9.29) (2022-06-16)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.29-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.29-staging.0...@clerk/clerk-expo@0.9.29-staging.1) (2022-06-16)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.28](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.28-staging.0...@clerk/clerk-expo@0.9.28) (2022-06-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.27](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.27-staging.0...@clerk/clerk-expo@0.9.27) (2022-06-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.26](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.25...@clerk/clerk-expo@0.9.26) (2022-06-06)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.25](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.25-staging.5...@clerk/clerk-expo@0.9.25) (2022-06-06)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.25-staging.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.25-staging.4...@clerk/clerk-expo@0.9.25-staging.5) (2022-06-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.25-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.25-staging.3...@clerk/clerk-expo@0.9.25-staging.4) (2022-06-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.25-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.25-staging.2...@clerk/clerk-expo@0.9.25-staging.3) (2022-06-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.25-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.25-staging.1...@clerk/clerk-expo@0.9.25-staging.2) (2022-06-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.25-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.25-staging.0...@clerk/clerk-expo@0.9.25-staging.1) (2022-06-01)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.24](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.24-staging.5...@clerk/clerk-expo@0.9.24) (2022-05-20)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.24-staging.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.24-staging.4...@clerk/clerk-expo@0.9.24-staging.5) (2022-05-20)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.24-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.24-staging.3...@clerk/clerk-expo@0.9.24-staging.4) (2022-05-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.24-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.23...@clerk/clerk-expo@0.9.24-staging.3) (2022-05-18)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.24-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.23...@clerk/clerk-expo@0.9.24-staging.2) (2022-05-17)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.24-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.23...@clerk/clerk-expo@0.9.24-staging.1) (2022-05-16)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.23](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.20...@clerk/clerk-expo@0.9.23) (2022-05-13)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.22](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.20...@clerk/clerk-expo@0.9.22) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.21](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.20...@clerk/clerk-expo@0.9.21) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.20](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.20-staging.1...@clerk/clerk-expo@0.9.20) (2022-05-11)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.20-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.20-staging.0...@clerk/clerk-expo@0.9.20-staging.1) (2022-05-11)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.19](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.18...@clerk/clerk-expo@0.9.19) (2022-05-06)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.19-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.18...@clerk/clerk-expo@0.9.19-staging.0) (2022-05-05)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.18](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.18-staging.0...@clerk/clerk-expo@0.9.18) (2022-05-05)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.17](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.17-staging.0...@clerk/clerk-expo@0.9.17) (2022-04-28)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.16](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.15...@clerk/clerk-expo@0.9.16) (2022-04-27)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.15](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.14...@clerk/clerk-expo@0.9.15) (2022-04-27)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.14](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.14-staging.0...@clerk/clerk-expo@0.9.14) (2022-04-22)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.13](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.13-staging.1...@clerk/clerk-expo@0.9.13) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.13-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.13-staging.0...@clerk/clerk-expo@0.9.13-staging.1) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.12](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.12-alpha.0...@clerk/clerk-expo@0.9.12) (2022-04-18)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.12-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.11...@clerk/clerk-expo@0.9.12-alpha.0) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.11](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.10...@clerk/clerk-expo@0.9.11) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.10](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.10-staging.1...@clerk/clerk-expo@0.9.10) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.9](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.9-staging.0...@clerk/clerk-expo@0.9.9) (2022-04-13)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.8](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.7...@clerk/clerk-expo@0.9.8) (2022-04-11)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.6...@clerk/clerk-expo@0.9.7) (2022-04-07)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.6-staging.0...@clerk/clerk-expo@0.9.6) (2022-04-04)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.4...@clerk/clerk-expo@0.9.5) (2022-03-31)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.4-staging.0...@clerk/clerk-expo@0.9.4) (2022-03-29)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.3-staging.0...@clerk/clerk-expo@0.9.3) (2022-03-28)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.2-alpha.0...@clerk/clerk-expo@0.9.2) (2022-03-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.2-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.2-staging.0...@clerk/clerk-expo@0.9.2-staging.1) (2022-03-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.9.1-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.1-staging.0...@clerk/clerk-expo@0.9.1-alpha.0) (2022-03-23)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.9.0-alpha.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.9.0-alpha.1...@clerk/clerk-expo@0.9.0-alpha.2) (2022-03-23)

**Note:** Version bump only for package @clerk/clerk-expo

## [0.9.0-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.18-alpha.3...@clerk/clerk-expo@0.9.0-alpha.1) (2022-03-23)

### Bug Fixes

- **clerk-expo:** Make Clerk loading smarter ([#136](https://github.com/clerkinc/javascript/issues/136)) ([2405d81](https://github.com/clerkinc/javascript/commit/2405d813b41c1f3c345c894c18e65710891bd710))

## [0.9.0-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.18-alpha.3...@clerk/clerk-expo@0.9.0-alpha.0) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.18-alpha.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.18-alpha.2...@clerk/clerk-expo@0.8.18-alpha.3) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.18-alpha.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.18-staging.0...@clerk/clerk-expo@0.8.18-alpha.2) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.18-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.18-staging.0...@clerk/clerk-expo@0.8.18-alpha.1) (2022-03-20)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.18-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.18-staging.0...@clerk/clerk-expo@0.8.18-alpha.0) (2022-03-19)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.16](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.16-staging.1...@clerk/clerk-expo@0.8.16) (2022-03-17)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.16-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.16-staging.0...@clerk/clerk-expo@0.8.16-staging.1) (2022-03-17)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.13-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.13...@clerk/clerk-expo@0.8.13-alpha.1) (2022-03-11)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.3-alpha.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.6...@clerk/clerk-expo@0.8.3-alpha.2) (2022-02-28)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.3-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.6...@clerk/clerk-expo@0.8.3-alpha.1) (2022-02-25)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.14](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.13...@clerk/clerk-expo@0.8.14) (2022-03-11)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.13](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.13-staging.0...@clerk/clerk-expo@0.8.13) (2022-03-09)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.11](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.10...@clerk/clerk-expo@0.8.11) (2022-03-04)

### Bug Fixes

- **clerk-expo:** Add early return if tokenCache is not provided ([7a69d87](https://github.com/clerkinc/javascript/commit/7a69d870e5a6a73f34d6989643b55d2ff131536e))
- **clerk-expo:** Add guard clause for tokenCache methods ([4c0bd54](https://github.com/clerkinc/javascript/commit/4c0bd54248a7248c844f8255120adadea57b5bee))

### [0.8.10](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.9...@clerk/clerk-expo@0.8.10) (2022-03-04)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.9](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.8...@clerk/clerk-expo@0.8.9) (2022-03-03)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.8](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.7...@clerk/clerk-expo@0.8.8) (2022-03-02)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.6...@clerk/clerk-expo@0.8.7) (2022-03-01)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.6-staging.0...@clerk/clerk-expo@0.8.6) (2022-02-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.6-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.5-staging.0...@clerk/clerk-expo@0.8.6-staging.0) (2022-02-24)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.5-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.4-staging.0...@clerk/clerk-expo@0.8.5-staging.0) (2022-02-22)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.4-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.3-staging.1...@clerk/clerk-expo@0.8.4-staging.0) (2022-02-17)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.3-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.3-staging.0...@clerk/clerk-expo@0.8.3-staging.1) (2022-02-16)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.3-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.2...@clerk/clerk-expo@0.8.3-staging.0) (2022-02-15)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.1...@clerk/clerk-expo@0.8.2) (2022-02-14)

**Note:** Version bump only for package @clerk/clerk-expo

### [0.8.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-expo@0.8.1-staging.0...@clerk/clerk-expo@0.8.1) (2022-02-14)

**Note:** Version bump only for package @clerk/clerk-expo

### 0.8.1-staging.0 (2022-02-11)

**Note:** Version bump only for package @clerk/clerk-expo
