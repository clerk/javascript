# Change Log

## 0.4.11

### Patch Changes

- Updated dependencies [[`9e57e94d2`](https://github.com/clerkinc/javascript/commit/9e57e94d25b96c11889f49e7e4d4827e5134927d)]:
  - @clerk/clerk-js@4.64.0

## 0.4.10

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerkinc/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`3bf64107e`](https://github.com/clerkinc/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`89932e1b3`](https://github.com/clerkinc/javascript/commit/89932e1b32723479541ab2ba4cc87e3973b5ef85), [`92727eec3`](https://github.com/clerkinc/javascript/commit/92727eec39566278263ffa118a085493f964eb94), [`b09b66eec`](https://github.com/clerkinc/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerkinc/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62), [`37d8856ba`](https://github.com/clerkinc/javascript/commit/37d8856babb9db8edf763455172c4d22d6035036)]:
  - @clerk/clerk-js@4.63.0
  - @clerk/clerk-react@4.27.0

## 0.4.9

### Patch Changes

- Updated dependencies [[`d78bd8464`](https://github.com/clerkinc/javascript/commit/d78bd846486b999dd006b85c0ddf0f6695028b20), [`112b90bea`](https://github.com/clerkinc/javascript/commit/112b90bea703a4338970d29532b9119dcaf591a7), [`ec10f673e`](https://github.com/clerkinc/javascript/commit/ec10f673ea220b2635b690ee342e0c3f32cfaf5c), [`9ca215702`](https://github.com/clerkinc/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11), [`21f61ce1d`](https://github.com/clerkinc/javascript/commit/21f61ce1da8cad98ed12a98379a6d6c99c39b5ba)]:
  - @clerk/clerk-js@4.62.1
  - @clerk/clerk-react@4.26.6

## 0.4.8

### Patch Changes

- Updated dependencies [[`da450b5e1`](https://github.com/clerkinc/javascript/commit/da450b5e15326faeb873aa32f42b36afb1092bd1), [`35be8709d`](https://github.com/clerkinc/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`e38488c92`](https://github.com/clerkinc/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerkinc/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`a9894b445`](https://github.com/clerkinc/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`e67fcfe19`](https://github.com/clerkinc/javascript/commit/e67fcfe1984ad619d1cc26654e4b594ba47d02c3), [`81b63e320`](https://github.com/clerkinc/javascript/commit/81b63e320ba5e828e2893e76b041a737a891ed7d), [`29485ebd8`](https://github.com/clerkinc/javascript/commit/29485ebd8184f4b3b92554c9360998971568e352), [`8000e3a3f`](https://github.com/clerkinc/javascript/commit/8000e3a3f41052e97ceebb5b31222687e158d7e8), [`e1e5d37d4`](https://github.com/clerkinc/javascript/commit/e1e5d37d480d56b8cb2fce8d335db87a127f2130), [`70f251007`](https://github.com/clerkinc/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`8434782c5`](https://github.com/clerkinc/javascript/commit/8434782c53147e4e3333746fd6096212dfcaa51d), [`393115678`](https://github.com/clerkinc/javascript/commit/393115678fa1b659bd6708a0cdc54143e1ec983c), [`a46d6fe99`](https://github.com/clerkinc/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/clerk-js@4.62.0
  - @clerk/clerk-react@4.26.5

## 0.4.7

### Patch Changes

- Introduce a new property on the core Clerk singleton, `sdkMetadata`. This will be populated by each host SDK. This metadata will be used to make logging and debugging easier. ([#1857](https://github.com/clerkinc/javascript/pull/1857)) by [@BRKalow](https://github.com/BRKalow)

- Introduce new `*EmailLink*` helpers that will replace the `*MagicLink*` helpers. ([#1833](https://github.com/clerkinc/javascript/pull/1833)) by [@dimkl](https://github.com/dimkl)

  Also marked all the `*MagicLink*` as deprecated using JSDocs.

- Updated dependencies [[`977336f79`](https://github.com/clerkinc/javascript/commit/977336f793cd4ce5984f98dac3cedf9f5ec363f5), [`f20adc357`](https://github.com/clerkinc/javascript/commit/f20adc357cd9fd34cedb4cc7aac2df4be77fb8ea), [`c04ad94b1`](https://github.com/clerkinc/javascript/commit/c04ad94b1dd58fe4b59333b76a3988b1811d5cc2), [`997b8e256`](https://github.com/clerkinc/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91e9a55f4`](https://github.com/clerkinc/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`25cfa7ae8`](https://github.com/clerkinc/javascript/commit/25cfa7ae8ad35bad6f3ca18af8ce876ddc0219f9), [`c9b17f5a7`](https://github.com/clerkinc/javascript/commit/c9b17f5a72cb27786cfc7f1fb42be1233fb10d5c), [`997b8e256`](https://github.com/clerkinc/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91014880d`](https://github.com/clerkinc/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`5a3995b38`](https://github.com/clerkinc/javascript/commit/5a3995b38b214f376af95b53959554c80aed7dc4), [`7f4d4b942`](https://github.com/clerkinc/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b), [`f6faf6fda`](https://github.com/clerkinc/javascript/commit/f6faf6fdadef9ca8ce0e98e3da40437f43c411ad)]:
  - @clerk/clerk-js@4.61.0
  - @clerk/clerk-react@4.26.4

## 0.4.6

### Patch Changes

- Updated dependencies [[`1136c7c15`](https://github.com/clerkinc/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1e212c19d`](https://github.com/clerkinc/javascript/commit/1e212c19d1cbfbcf6bc6718f5aec0a3cb893b96f), [`1136c7c15`](https://github.com/clerkinc/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679)]:
  - @clerk/clerk-react@4.26.3
  - @clerk/clerk-js@4.60.1

## 0.4.5

### Patch Changes

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerkinc/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerkinc/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`164f3aac7`](https://github.com/clerkinc/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerkinc/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerkinc/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`0636ff779`](https://github.com/clerkinc/javascript/commit/0636ff7799e126d1438d2738ce0e46c3b277f46a), [`2e9be8461`](https://github.com/clerkinc/javascript/commit/2e9be8461f65004c920e359abbf69ef516ff0aa6), [`71bb1c7b5`](https://github.com/clerkinc/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf), [`e592565e0`](https://github.com/clerkinc/javascript/commit/e592565e0d7707626587f5e0ae7fb7279c84f050), [`19b3aea45`](https://github.com/clerkinc/javascript/commit/19b3aea451dd57950f80f2d393598d33638f1398)]:
  - @clerk/clerk-js@4.60.0
  - @clerk/clerk-react@4.26.2

## 0.4.4

### Patch Changes

- Updated dependencies [[`a0b25671c`](https://github.com/clerkinc/javascript/commit/a0b25671cdee39cd0c2fca832b8c378fd445ec39), [`d1ad5ac37`](https://github.com/clerkinc/javascript/commit/d1ad5ac373ff2ff66450afc74aeba9b26fc133ce)]:
  - @clerk/clerk-react@4.26.1
  - @clerk/clerk-js@4.59.1

## 0.4.3

### Patch Changes

- Updated dependencies [[`f3f643163`](https://github.com/clerkinc/javascript/commit/f3f643163a6163d89d3e3407358739d49db8b7f7), [`cc8851765`](https://github.com/clerkinc/javascript/commit/cc88517650100b0305e4d7a44db62daec3482a33), [`ea4aa67a3`](https://github.com/clerkinc/javascript/commit/ea4aa67a31675f1ca504cde63eec37a0e351140b), [`5c8754239`](https://github.com/clerkinc/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81), [`b69fad0ce`](https://github.com/clerkinc/javascript/commit/b69fad0ceddc462f9071ee89db40485a0abd8528), [`14895e2dd`](https://github.com/clerkinc/javascript/commit/14895e2dde0fa15b594b1b7d89829d6013f5afc6)]:
  - @clerk/clerk-js@4.59.0
  - @clerk/clerk-react@4.26.0

## 0.4.2

### Patch Changes

- Updated dependencies [[`0eb666118`](https://github.com/clerkinc/javascript/commit/0eb66611882e6c460cc6a6c5cfa1d9b086ec6917), [`53ccb27cf`](https://github.com/clerkinc/javascript/commit/53ccb27cfd195af65adde6694572ed523fc66d6d), [`3ceb2a734`](https://github.com/clerkinc/javascript/commit/3ceb2a734a43f134956164377399fec46e01e0a1), [`c61ddf5bf`](https://github.com/clerkinc/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerkinc/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/clerk-js@4.58.2
  - @clerk/clerk-react@4.25.2

## 0.4.1

### Patch Changes

- Updated dependencies [[`a2c7115dd`](https://github.com/clerkinc/javascript/commit/a2c7115dd3f4574e1970a985360916d954ad36cd), [`378a903ac`](https://github.com/clerkinc/javascript/commit/378a903ac4dc12e6ee708de20f0d9a5aa758bd18)]:
  - @clerk/clerk-js@4.58.1
  - @clerk/clerk-react@4.25.1

## 0.4.0

### Minor Changes

- Introduce the new brand-new component OrganizationList ([#1692](https://github.com/clerkinc/javascript/pull/1692)) by [@panteliselef](https://github.com/panteliselef)

  - Lists all the memberships, invitations or suggestions an active user may have
  - Powered by our `useOrganizationList` react hook

### Patch Changes

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerkinc/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`30bb9eccb`](https://github.com/clerkinc/javascript/commit/30bb9eccb95632fb1de02b756e818118ca6324f7), [`e99df0a0d`](https://github.com/clerkinc/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerkinc/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`a8eb4351a`](https://github.com/clerkinc/javascript/commit/a8eb4351a623b26a961c6968684e3a1f43ebd10d), [`23c073957`](https://github.com/clerkinc/javascript/commit/23c073957bc61cf27824e9c7e15e89f65c3eab35), [`01b024c57`](https://github.com/clerkinc/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68), [`b0f396bc5`](https://github.com/clerkinc/javascript/commit/b0f396bc5c75c9920df46e26d672c37f3cc3d974), [`16f667275`](https://github.com/clerkinc/javascript/commit/16f667275c7dd6f97ca94b247d72afa92c4ab4ce), [`7fa93644d`](https://github.com/clerkinc/javascript/commit/7fa93644d47252a472000633a939dc15d8d7f292), [`634948fda`](https://github.com/clerkinc/javascript/commit/634948fdaf9276b593f8fabcb2af45f3c3457048), [`43786f8d0`](https://github.com/clerkinc/javascript/commit/43786f8d0d89c3e8a827415aabba4020a928eeed)]:
  - @clerk/clerk-js@4.58.0
  - @clerk/clerk-react@4.25.0

## 0.3.31

### Patch Changes

- Updated dependencies [[`463ff84f5`](https://github.com/clerkinc/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`1426e5eb3`](https://github.com/clerkinc/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739)]:
  - @clerk/clerk-js@4.57.0
  - @clerk/clerk-react@4.24.2

## 0.3.30

### Patch Changes

- Updated dependencies [[`6384ea8da`](https://github.com/clerkinc/javascript/commit/6384ea8dae85b3e1b58b0b70c761c0d2794e3aaa), [`b491dddae`](https://github.com/clerkinc/javascript/commit/b491dddae41030556b0be5c709f128838d4b1196), [`a102c21d4`](https://github.com/clerkinc/javascript/commit/a102c21d4762895a80a1ad846700763cc801b3f3)]:
  - @clerk/clerk-js@4.56.3
  - @clerk/clerk-react@4.24.1

## 0.3.29

### Patch Changes

- Updated dependencies [[`3882e913f`](https://github.com/clerkinc/javascript/commit/3882e913fd9bf4b7d1a9bf71691296d866204e56)]:
  - @clerk/clerk-js@4.56.2

## 0.3.28

### Patch Changes

- Updated dependencies [[`27a70551c`](https://github.com/clerkinc/javascript/commit/27a70551cb1fa3fdcf9878f78f32c6b19a18fea0)]:
  - @clerk/clerk-js@4.56.1

## 0.3.27

### Patch Changes

- Updated dependencies [[`854aa381c`](https://github.com/clerkinc/javascript/commit/854aa381c31b712f264767e16e7025884a5122d7), [`96cc1921c`](https://github.com/clerkinc/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerkinc/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerkinc/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerkinc/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerkinc/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerkinc/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerkinc/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerkinc/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerkinc/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerkinc/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`d39c029a5`](https://github.com/clerkinc/javascript/commit/d39c029a543e861556773bfbc0b208cde3a54521), [`86de584dd`](https://github.com/clerkinc/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`ac5a70059`](https://github.com/clerkinc/javascript/commit/ac5a70059ca142a95b168909c05d488c05d94c3a), [`e02a1aff2`](https://github.com/clerkinc/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`1663aaae7`](https://github.com/clerkinc/javascript/commit/1663aaae704b8a0f62e31acab440584e681666b3), [`09bfb793e`](https://github.com/clerkinc/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerkinc/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerkinc/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerkinc/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerkinc/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`89bc5de04`](https://github.com/clerkinc/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/clerk-js@4.56.0
  - @clerk/clerk-react@4.24.0

## 0.3.26

### Patch Changes

- Updated dependencies [[`ea95525a4`](https://github.com/clerkinc/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerkinc/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`0b9388c01`](https://github.com/clerkinc/javascript/commit/0b9388c01b84557e3b63c1de91ab8b51369b26a7), [`2244f6ab1`](https://github.com/clerkinc/javascript/commit/2244f6ab1015536a929567d0f551f9a933634bab), [`5e1a09df4`](https://github.com/clerkinc/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`0a59e122d`](https://github.com/clerkinc/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/clerk-js@4.55.0
  - @clerk/clerk-react@4.23.2

## 0.3.25

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.54.2

## 0.3.24

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerkinc/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3), [`671561697`](https://github.com/clerkinc/javascript/commit/671561697c205dd984fd4c6b9864055d8fe2fc8b), [`38644778e`](https://github.com/clerkinc/javascript/commit/38644778ee9cc0b4196bd32537c543b8c51775c3), [`808e45dc4`](https://github.com/clerkinc/javascript/commit/808e45dc42cc65c8aec99f034131721d34d32656)]:
  - @clerk/clerk-js@4.54.1
  - @clerk/clerk-react@4.23.1

## 0.3.23

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerkinc/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c), [`a9ca4355d`](https://github.com/clerkinc/javascript/commit/a9ca4355de4375046c79ecbe09bf3998ae94ded1)]:
  - @clerk/clerk-js@4.54.0
  - @clerk/clerk-react@4.23.0

## 0.3.22

### Patch Changes

- Updated dependencies [[`73c9c1d0e`](https://github.com/clerkinc/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerkinc/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerkinc/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`0a7a88995`](https://github.com/clerkinc/javascript/commit/0a7a889956f5e060584b17cdb59d9c9abe5473f9), [`17f963e38`](https://github.com/clerkinc/javascript/commit/17f963e38101733b8c5e500db251a5128f762c8f), [`592911196`](https://github.com/clerkinc/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8), [`dd10ebeae`](https://github.com/clerkinc/javascript/commit/dd10ebeae54d70b84b7c0374cea2876e9cdd6622), [`cf918665c`](https://github.com/clerkinc/javascript/commit/cf918665c55cac911afa17332bcce71435343d9d)]:
  - @clerk/clerk-js@4.53.0
  - @clerk/clerk-react@4.22.1

## 0.3.21

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.52.1

## 0.3.20

### Patch Changes

- Updated dependencies [[`fb426385b`](https://github.com/clerkinc/javascript/commit/fb426385be19b888e311613d830b125c7df152aa), [`f6b77a1a3`](https://github.com/clerkinc/javascript/commit/f6b77a1a338cddeadb3cc7019171bf9703d7676e), [`670a7616d`](https://github.com/clerkinc/javascript/commit/670a7616d8476075eabf8a153d2bf84422a5cbd3)]:
  - @clerk/clerk-js@4.52.0
  - @clerk/clerk-react@4.22.0

## 0.3.19

### Patch Changes

- Updated dependencies [[`968d9c265`](https://github.com/clerkinc/javascript/commit/968d9c2651ce25f6e03c2e6eecd81f7daf876f03)]:
  - @clerk/clerk-react@4.21.1

## 0.3.18

### Patch Changes

- Updated dependencies [[`1e71b60a2`](https://github.com/clerkinc/javascript/commit/1e71b60a2c6832a5f4f9c75ad4152b82db2b52e1)]:
  - @clerk/clerk-react@4.21.0

## 0.3.17

### Patch Changes

- Updated dependencies [[`ac236e8d3`](https://github.com/clerkinc/javascript/commit/ac236e8d3e23111b9b990a32c94358c179812d6a)]:
  - @clerk/clerk-js@4.51.0
  - @clerk/clerk-react@4.20.6

## 0.3.16

### Patch Changes

- Updated dependencies [[`9b79d9b64`](https://github.com/clerkinc/javascript/commit/9b79d9b6465175f966dcecdd750f8904ad44c69e)]:
  - @clerk/clerk-js@4.50.1

## 0.3.15

### Patch Changes

- Updated dependencies [[`32ef3304`](https://github.com/clerkinc/javascript/commit/32ef3304161c2d7b307c02222ffee590bd821e5b), [`bfb3af28`](https://github.com/clerkinc/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/clerk-js@4.50.0
  - @clerk/clerk-react@4.20.5

## 0.3.14

### Patch Changes

- Updated dependencies [[`11954816`](https://github.com/clerkinc/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`32148490`](https://github.com/clerkinc/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/clerk-js@4.49.0
  - @clerk/clerk-react@4.20.4

## 0.3.13

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.48.1
  - @clerk/clerk-react@4.20.3

## 0.3.12

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerkinc/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerkinc/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/clerk-js@4.48.0
  - @clerk/clerk-react@4.20.2

## 0.3.11

### Patch Changes

- Updated dependencies [[`59bc649a`](https://github.com/clerkinc/javascript/commit/59bc649a92316f5d6ade00f3cd52a9b46dcdc401)]:
  - @clerk/clerk-js@4.47.2
  - @clerk/clerk-react@4.20.1

## 0.3.10

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.47.1

## 0.3.9

### Patch Changes

- Updated dependencies [[`7af91bc3`](https://github.com/clerkinc/javascript/commit/7af91bc3ecc25cba04968b491e1e3c6ec32c18af), [`c42b4ac0`](https://github.com/clerkinc/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`6f3d4305`](https://github.com/clerkinc/javascript/commit/6f3d43055690db1d69a356503a0a45dc948beaef), [`846b00b9`](https://github.com/clerkinc/javascript/commit/846b00b90167ab5a77456d32653a221faddd835a)]:
  - @clerk/clerk-react@4.20.0
  - @clerk/clerk-js@4.47.0

## 0.3.8

### Patch Changes

- Updated dependencies [[`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/clerk-js@4.46.0
  - @clerk/clerk-react@4.19.0

## [0.3.0](https://github.com/clerkinc/javascript/compare/@clerk/chrome-extension@0.2.8-staging.4...@clerk/chrome-extension@0.3.0) (2023-05-15)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.7](https://github.com/clerkinc/javascript/compare/@clerk/chrome-extension@0.2.7-staging.6...@clerk/chrome-extension@0.2.7) (2023-05-04)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.7-staging.5](https://github.com/clerkinc/javascript/compare/@clerk/chrome-extension@0.2.7-staging.4...@clerk/chrome-extension@0.2.7-staging.5) (2023-05-04)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.7-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/chrome-extension@0.2.7-staging.2...@clerk/chrome-extension@0.2.7-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.6](https://github.com/clerkinc/javascript/compare/@clerk/chrome-extension@0.2.6-staging.0...@clerk/chrome-extension@0.2.6) (2023-04-19)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.5](https://github.com/clerkinc/javascript/compare/@clerk/chrome-extension@0.2.4...@clerk/chrome-extension@0.2.5) (2023-04-19)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.4](https://github.com/clerkinc/javascript/compare/@clerk/chrome-extension@0.2.4-staging.1...@clerk/chrome-extension@0.2.4) (2023-04-12)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.3](https://github.com/clerkinc/javascript/compare/@clerk/chrome-extension@0.2.3-staging.5...@clerk/chrome-extension@0.2.3) (2023-04-11)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.2](https://github.com/clerkinc/javascript/compare/@clerk/chrome-extension@0.2.2-staging.1...@clerk/chrome-extension@0.2.2) (2023-04-06)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.1](https://github.com/clerkinc/javascript/compare/@clerk/chrome-extension@0.2.1-staging.1...@clerk/chrome-extension@0.2.1) (2023-04-03)

**Note:** Version bump only for package @clerk/chrome-extension

## [0.2.0](https://github.com/clerkinc/javascript/compare/@clerk/chrome-extension@0.2.0-staging.2...@clerk/chrome-extension@0.2.0) (2023-03-31)

**Note:** Version bump only for package @clerk/chrome-extension

## [0.2.0-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/chrome-extension@0.2.0-staging.1...@clerk/chrome-extension@0.2.0-staging.2) (2023-03-31)

**Note:** Version bump only for package @clerk/chrome-extension
