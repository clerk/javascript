# Change Log

## 2.4.38

### Patch Changes

- Updated dependencies [[`a9c13ca`](https://github.com/clerk/javascript/commit/a9c13cae5a6f46ca753d530878f7e4492ca7938b)]:
  - @clerk/shared@3.35.1

## 2.4.37

### Patch Changes

- Updated dependencies [[`7be8f45`](https://github.com/clerk/javascript/commit/7be8f458367b2c050b0dc8c0481d7bbe090ea400), [`bdbb0d9`](https://github.com/clerk/javascript/commit/bdbb0d91712a84fc214c534fc47b62b1a2028ac9), [`aa184a4`](https://github.com/clerk/javascript/commit/aa184a46a91f9dec3fd275ec5867a8366d310469), [`1d4e7a7`](https://github.com/clerk/javascript/commit/1d4e7a7769e9efaaa945e4ba6468ad47bd24c807), [`42f0d95`](https://github.com/clerk/javascript/commit/42f0d95e943d82960de3f7e5da17d199eff9fddd), [`c63cc8e`](https://github.com/clerk/javascript/commit/c63cc8e9c38ed0521a22ebab43e10111f04f9daf), [`d32d724`](https://github.com/clerk/javascript/commit/d32d724c34a921a176eca159273f270c2af4e787), [`00291bc`](https://github.com/clerk/javascript/commit/00291bc8ae03c06f7154bd937628e8193f6e3ce9)]:
  - @clerk/shared@3.35.0

## 2.4.36

### Patch Changes

- Updated dependencies [[`a1d10fc`](https://github.com/clerk/javascript/commit/a1d10fc6e231f27ec7eabd0db45b8f7e8c98250e), [`b944ff3`](https://github.com/clerk/javascript/commit/b944ff30494a8275450ca0d5129cdf58f02bea81), [`4011c5e`](https://github.com/clerk/javascript/commit/4011c5e0014ede5e480074b73d064a1bc2a577dd)]:
  - @clerk/shared@3.34.0

## 2.4.35

### Patch Changes

- Updated dependencies [[`613cb97`](https://github.com/clerk/javascript/commit/613cb97cb7b3b33c3865cfe008ef9b1ea624cc8d)]:
  - @clerk/shared@3.33.0

## 2.4.34

### Patch Changes

- Updated dependencies [[`cc11472`](https://github.com/clerk/javascript/commit/cc11472e7318b806ee43d609cd03fb0446f56146), [`539fad7`](https://github.com/clerk/javascript/commit/539fad7b80ed284a7add6cf8c4c45cf4c6a0a8b2), [`c413433`](https://github.com/clerk/javascript/commit/c413433fee49701f252df574ce6a009d256c0cb9), [`a940c39`](https://github.com/clerk/javascript/commit/a940c39354bd0ee48d2fc9b0f3217ec20b2f32b4)]:
  - @clerk/shared@3.32.0

## 2.4.33

### Patch Changes

- Updated dependencies [[`a474c59`](https://github.com/clerk/javascript/commit/a474c59e3017358186de15c5b1e5b83002e72527), [`5536429`](https://github.com/clerk/javascript/commit/55364291e245ff05ca1e50e614e502d2081b87fb)]:
  - @clerk/shared@3.31.1

## 2.4.32

### Patch Changes

- Updated dependencies [[`ea65d39`](https://github.com/clerk/javascript/commit/ea65d390cd6d3b0fdd35202492e858f8c8370f73), [`b09b29e`](https://github.com/clerk/javascript/commit/b09b29e82323c8fc508c49ffe10c77a737ef0bec)]:
  - @clerk/shared@3.31.0

## 2.4.31

### Patch Changes

- Deprecate `@clerk/types` in favor of `@clerk/shared/types` ([#7022](https://github.com/clerk/javascript/pull/7022)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  The `@clerk/types` package is now deprecated. All type definitions have been consolidated and moved to `@clerk/shared/types` to improve consistency across the Clerk ecosystem.

  **Backward Compatibility:**

  The `@clerk/types` package will remain available and will continue to re-export all types from `@clerk/shared/types` to ensure backward compatibility. Existing applications will continue to work without any immediate breaking changes. However, we strongly recommend migrating to `@clerk/shared/types` as new type definitions and updates will only be added to `@clerk/shared/types` starting with the next major release.

  **Migration Steps:**

  Please update your imports from `@clerk/types` to `@clerk/shared/types`:

  ```typescript
  // Before
  import type { ClerkResource, UserResource } from '@clerk/types';

  // After
  import type { ClerkResource, UserResource } from '@clerk/shared/types';
  ```

  **What Changed:**

  All type definitions including:
  - Resource types (User, Organization, Session, etc.)
  - API response types
  - Configuration types
  - Authentication types
  - Error types
  - And all other shared types

  Have been moved from `packages/types/src` to `packages/shared/src/types` and are now exported via `@clerk/shared/types`.

- Updated dependencies [[`3e0ef92`](https://github.com/clerk/javascript/commit/3e0ef9281194714f56dcf656d0caf4f75dcf097c), [`2587aa6`](https://github.com/clerk/javascript/commit/2587aa671dac1ca66711889bf1cd1c2e2ac8d7c8)]:
  - @clerk/shared@3.30.0

## 2.4.30

### Patch Changes

- Updated dependencies [[`439427e`](https://github.com/clerk/javascript/commit/439427e44adef4f43e5f0719adf5654ea58c33e7), [`7dfbf3a`](https://github.com/clerk/javascript/commit/7dfbf3aa1b5269aee2d3af628b02027be9767088), [`d33b7b5`](https://github.com/clerk/javascript/commit/d33b7b5538e9bcbbca1ac23c46793d0cddcef533)]:
  - @clerk/types@4.96.0

## 2.4.29

### Patch Changes

- Updated dependencies [[`4d46e4e`](https://github.com/clerk/javascript/commit/4d46e4e601a5f2a213f1718af3f9271db4db0911)]:
  - @clerk/types@4.95.1

## 2.4.28

### Patch Changes

- Updated dependencies [[`a172d51`](https://github.com/clerk/javascript/commit/a172d51df2d7f2e450c983a15ae897624304a764)]:
  - @clerk/types@4.95.0

## 2.4.27

### Patch Changes

- Updated dependencies [[`53214f9`](https://github.com/clerk/javascript/commit/53214f9a600074affc84d616bbbe7a6b625e7d33), [`1441e68`](https://github.com/clerk/javascript/commit/1441e6851102e9eed5697ad78c695f75b4a20db2)]:
  - @clerk/types@4.94.0

## 2.4.26

### Patch Changes

- Updated dependencies [[`65b7cc7`](https://github.com/clerk/javascript/commit/65b7cc787a5f02a302b665b6eaf4d4b9a1cae4b0), [`6e09786`](https://github.com/clerk/javascript/commit/6e09786adeb0f481ca8b6d060ae8754b556a3f9a), [`aa7210c`](https://github.com/clerk/javascript/commit/aa7210c7fff34f6c6e2d4ca3cb736bbd35439cb6), [`2cd53cd`](https://github.com/clerk/javascript/commit/2cd53cd8c713dfa7f2e802fe08986411587095fa), [`1a2eee6`](https://github.com/clerk/javascript/commit/1a2eee6b8b6ead2d0481e93104fcaed6452bd1b9), [`2cd53cd`](https://github.com/clerk/javascript/commit/2cd53cd8c713dfa7f2e802fe08986411587095fa), [`1a2430a`](https://github.com/clerk/javascript/commit/1a2430a166fb1df5fbca76437c63423b18a49ced), [`31a04fc`](https://github.com/clerk/javascript/commit/31a04fc2b783f01cd4848c1e681af3b30e57bb2f), [`22b8e49`](https://github.com/clerk/javascript/commit/22b8e49f9fb65d55ab737d11f1f57a25bf947511), [`a66357e`](https://github.com/clerk/javascript/commit/a66357e8a5928199aebde408ec7cfaac152c2c42), [`dacc1af`](https://github.com/clerk/javascript/commit/dacc1af22e1d1af0940b2d626b8a47d376c19342)]:
  - @clerk/types@4.93.0

## 2.4.25

### Patch Changes

- Updated dependencies [[`fba4781`](https://github.com/clerk/javascript/commit/fba4781ff2a2d16f8934029fa6fb77d70953f2be), [`a1f6714`](https://github.com/clerk/javascript/commit/a1f671480cda6f978db059ba0640d4ed8b08f112)]:
  - @clerk/types@4.92.0

## 2.4.24

### Patch Changes

- Updated dependencies [[`f737d26`](https://github.com/clerk/javascript/commit/f737d268aa167889a4f3f7aba2658c2ba1fd909a)]:
  - @clerk/types@4.91.0

## 2.4.23

### Patch Changes

- Updated dependencies [[`37028ca`](https://github.com/clerk/javascript/commit/37028caad59cb0081ac74e70a44e4a419082a999)]:
  - @clerk/types@4.90.0

## 2.4.22

### Patch Changes

- Updated dependencies [[`e3e77eb`](https://github.com/clerk/javascript/commit/e3e77eb277c6b36847265db7b863c418e3708ab6), [`090ca74`](https://github.com/clerk/javascript/commit/090ca742c590bc4f369cf3e1ca2ec9917410ffe4)]:
  - @clerk/types@4.89.0

## 2.4.21

### Patch Changes

- Updated dependencies [[`41e0a41`](https://github.com/clerk/javascript/commit/41e0a4190b33dd2c4bdc0d536bbe83fcf99af9b0), [`1aa9e9f`](https://github.com/clerk/javascript/commit/1aa9e9f10c051319e9ff4b1a0ecd71507bd6a6aa), [`a88ee58`](https://github.com/clerk/javascript/commit/a88ee5827adee0cc8a62246d03a3034d8566fe21), [`d6c7bbb`](https://github.com/clerk/javascript/commit/d6c7bbba23f38c0b3ca7edebb53028a05c7b38e6)]:
  - @clerk/types@4.88.0

## 2.4.20

### Patch Changes

- Improve return type of createTheme ([#6778](https://github.com/clerk/javascript/pull/6778)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`bcf24f2`](https://github.com/clerk/javascript/commit/bcf24f2f91913fa0dd3fbf02b3bbef345c4e1ea9), [`de90ede`](https://github.com/clerk/javascript/commit/de90ede82664b58bef9e294498384cf2c99a331e), [`9d4a95c`](https://github.com/clerk/javascript/commit/9d4a95c766396a0bc327fbf0560228bedb4828eb)]:
  - @clerk/types@4.87.0

## 2.4.19

### Patch Changes

- Add theme-usage telemetry ([#6529](https://github.com/clerk/javascript/pull/6529)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`23948dc`](https://github.com/clerk/javascript/commit/23948dc777ec6a17bafbae59c253a93143b0e105), [`50a8622`](https://github.com/clerk/javascript/commit/50a8622c3579306f15e5d40e5ea72b4fe4384ef7)]:
  - @clerk/types@4.86.0

## 2.4.18

### Patch Changes

- Updated dependencies [[`55490c3`](https://github.com/clerk/javascript/commit/55490c31fadc82bdca6cd5f2b22e5e158aaba0cb), [`e8d21de`](https://github.com/clerk/javascript/commit/e8d21de39b591973dad48fc1d1851c4d28b162fe), [`637f2e8`](https://github.com/clerk/javascript/commit/637f2e8768b76aaf756062b6b5b44bf651f66789)]:
  - @clerk/types@4.85.0

## 2.4.17

### Patch Changes

- Updated dependencies [[`fced4fc`](https://github.com/clerk/javascript/commit/fced4fc869bb21c77826dfaf281b6640e0f0c006), [`1b1e8b1`](https://github.com/clerk/javascript/commit/1b1e8b1fd33b787f956b17b193e5fd0a4cdc6cec)]:
  - @clerk/types@4.84.1

## 2.4.16

### Patch Changes

- Updated dependencies [[`2a82737`](https://github.com/clerk/javascript/commit/2a8273705b9764e1a4613d5a0dbb738d0b156c05), [`cda5d7b`](https://github.com/clerk/javascript/commit/cda5d7b79b28dc03ec794ea54e0feb64b148cdd2), [`ba25a5b`](https://github.com/clerk/javascript/commit/ba25a5b5a3fa686a65f52e221d9d1712a389fea9), [`a50cfc8`](https://github.com/clerk/javascript/commit/a50cfc8f1dd168b436499e32fc8b0fc41d28bbff), [`377f67b`](https://github.com/clerk/javascript/commit/377f67b8e552d1a19efbe4530e9306675b7f8eab), [`65b12ee`](https://github.com/clerk/javascript/commit/65b12eeeb57ee80cdd8c36c5949d51f1227a413e), [`263722e`](https://github.com/clerk/javascript/commit/263722e61fd27403b4c8d9794880686771e123f9)]:
  - @clerk/types@4.84.0

## 2.4.15

### Patch Changes

- Updated dependencies [[`600c648`](https://github.com/clerk/javascript/commit/600c648d4087a823341041c90018797fbc0033f0)]:
  - @clerk/types@4.83.0

## 2.4.14

### Patch Changes

- Updated dependencies [[`d52714e`](https://github.com/clerk/javascript/commit/d52714e4cb7f369c74826cd4341c58eb1900abe4), [`2ed539c`](https://github.com/clerk/javascript/commit/2ed539cc7f08ed4d70c33621563ad386ea8becc5), [`c16a7a5`](https://github.com/clerk/javascript/commit/c16a7a5837fc15e0e044baf9c809b8da6fbac795)]:
  - @clerk/types@4.82.0

## 2.4.13

### Patch Changes

- Updated dependencies [[`e52bf8e`](https://github.com/clerk/javascript/commit/e52bf8ebef74a9e123c69b69acde1340c01d32d7), [`c043c19`](https://github.com/clerk/javascript/commit/c043c1919854aaa5b9cf7f6df5bb517f5617f7a1), [`c28d29c`](https://github.com/clerk/javascript/commit/c28d29c79bb4f144d782313ca72df7db91a77340), [`172e054`](https://github.com/clerk/javascript/commit/172e054a3511be12d16ba19037db320c2d9838bf)]:
  - @clerk/types@4.81.0

## 2.4.12

### Patch Changes

- Updated dependencies [[`8dc6bad`](https://github.com/clerk/javascript/commit/8dc6bad5c7051b59bd8c73e65d497f6a974bb1c3), [`aa6a3c3`](https://github.com/clerk/javascript/commit/aa6a3c3d3ba2de67a468c996cbf0bff43a09ddb8), [`db50c47`](https://github.com/clerk/javascript/commit/db50c4734920ada6002de8c62c994047eb6cb5a0)]:
  - @clerk/types@4.80.0

## 2.4.11

### Patch Changes

- Updated dependencies [[`413468c`](https://github.com/clerk/javascript/commit/413468c9b9c8fb7576f8e4cbdccff98784e33fef), [`7b7eb1f`](https://github.com/clerk/javascript/commit/7b7eb1fc0235249c5c179239078294118f2947cd)]:
  - @clerk/types@4.79.0

## 2.4.10

### Patch Changes

- Updated dependencies [[`5b24129`](https://github.com/clerk/javascript/commit/5b24129ddcfc2f7dc6eb79d8c818b4ff97c68e9a)]:
  - @clerk/types@4.78.0

## 2.4.9

### Patch Changes

- Updated dependencies [[`4db1e58`](https://github.com/clerk/javascript/commit/4db1e58d70b60e1e236709b507666715d571e925), [`69498df`](https://github.com/clerk/javascript/commit/69498dfca3e6bb388eb8c94313eac06347dd5a27)]:
  - @clerk/types@4.77.0

## 2.4.8

### Patch Changes

- Updated dependencies [[`15fe106`](https://github.com/clerk/javascript/commit/15fe1060f730a6a4391f3d2451d23edd3218e1ae), [`173837c`](https://github.com/clerk/javascript/commit/173837c2526aa826b7981ee8d6d4f52c00675da5), [`8b52d7a`](https://github.com/clerk/javascript/commit/8b52d7ae19407e8ab5a5451bd7d34b6bc38417de), [`854dde8`](https://github.com/clerk/javascript/commit/854dde88e642c47b5a29ac8f576c8c1976e5d067), [`ae2e2d6`](https://github.com/clerk/javascript/commit/ae2e2d6b336be6b596cc855e549843beb5bfd2a1), [`037f25a`](https://github.com/clerk/javascript/commit/037f25a8171888168913b186b7edf871e0aaf197), [`f8b38b7`](https://github.com/clerk/javascript/commit/f8b38b7059e498fef3ac1271346be0710aa31c76)]:
  - @clerk/types@4.76.0

## 2.4.7

### Patch Changes

- Updated dependencies [[`b72a3dd`](https://github.com/clerk/javascript/commit/b72a3dda2467720e5dc8cab3e7e6a110f3beb79b), [`d93b0ed`](https://github.com/clerk/javascript/commit/d93b0edf4adc57d48a26cb08444192887ccec659), [`6459f7d`](https://github.com/clerk/javascript/commit/6459f7dabe5f163f48ed73106bb901d8187da3e2), [`9084759`](https://github.com/clerk/javascript/commit/90847593300be605e1ee1c06dac147ce68b25dc7)]:
  - @clerk/types@4.75.0

## 2.4.6

### Patch Changes

- Updated dependencies [[`1ad16da`](https://github.com/clerk/javascript/commit/1ad16daa49795a861ae277001831230580b6b9f4), [`4edef81`](https://github.com/clerk/javascript/commit/4edef81dd423a0471e3f579dd6b36094aa8546aa), [`696f8e1`](https://github.com/clerk/javascript/commit/696f8e11a3e5391e6b5a97d98e929b8973575b9a), [`f318d22`](https://github.com/clerk/javascript/commit/f318d22cf83caaef272bcf532561a03ca72575e7)]:
  - @clerk/types@4.74.0

## 2.4.5

### Patch Changes

- Updated dependencies [[`f93965f`](https://github.com/clerk/javascript/commit/f93965f64c81030f9fcf9d1cc4e4984d30cd12ec), [`7b6dcee`](https://github.com/clerk/javascript/commit/7b6dceea5bfd7f1cc1bf24126aa715307e24ae7f)]:
  - @clerk/types@4.73.0

## 2.4.4

### Patch Changes

- Add `shadcn.css` export for importing within stylesheets to resolve Tailwind not picking up the elements class names used within the shadcn theme. ([#6415](https://github.com/clerk/javascript/pull/6415)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`22c35ef`](https://github.com/clerk/javascript/commit/22c35efb59226df2efaa2891fa4775c13312f4c6), [`e8d816a`](https://github.com/clerk/javascript/commit/e8d816a3350e862c3e9e1d4f8c96c047a0a016a2), [`aa9f185`](https://github.com/clerk/javascript/commit/aa9f185e21b58f8a6e03ea44ce29ee09ad2477d9), [`af0e123`](https://github.com/clerk/javascript/commit/af0e12393c9412281626e20dafb1b3a15558f6d9), [`3d1d871`](https://github.com/clerk/javascript/commit/3d1d8711405646cf3c2aabe99e08337a1028703a)]:
  - @clerk/types@4.72.0

## 2.4.3

### Patch Changes

- Updated dependencies [[`e404456`](https://github.com/clerk/javascript/commit/e4044566bca81f63c8e9c630fdec0f498ad6fc08), [`d58b959`](https://github.com/clerk/javascript/commit/d58b9594cf65158e87dbaa90d632c45f543373e1), [`822ba1f`](https://github.com/clerk/javascript/commit/822ba1fd5e7daf665120cf183e4600a227098d53), [`d4d2612`](https://github.com/clerk/javascript/commit/d4d2612483baf356c389ef0ba5084059025481f2)]:
  - @clerk/types@4.71.0

## 2.4.2

### Patch Changes

- Updated dependencies [[`b0fdc9e`](https://github.com/clerk/javascript/commit/b0fdc9eaf764ca0c17cbe0810b7d240f6d9db0b6)]:
  - @clerk/types@4.70.1

## 2.4.1

### Patch Changes

- Updated dependencies [[`cd59c0e`](https://github.com/clerk/javascript/commit/cd59c0e5512a341dd8fb420aca583333c8243aa5)]:
  - @clerk/types@4.70.0

## 2.4.0

### Minor Changes

- Add shadcn theme to @clerk/themes ([#6322](https://github.com/clerk/javascript/pull/6322)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Add optional `cssLayerName` to `BaseTheme` object ([#6322](https://github.com/clerk/javascript/pull/6322)) by [@alexcarpenter](https://github.com/alexcarpenter)

### Patch Changes

- Fix shadcn theme provider icon rendering in dark mode for Apple, GitHub, and OKX Wallet. ([#6375](https://github.com/clerk/javascript/pull/6375)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`fecc99d`](https://github.com/clerk/javascript/commit/fecc99d43cb7db5b99863829acb234cbce0da264), [`10e1060`](https://github.com/clerk/javascript/commit/10e10605b18a58f33a93caed058159c190678e74), [`92c44dd`](https://github.com/clerk/javascript/commit/92c44dd9d51e771a928a8da7004bdb8f8bdbaf58), [`a04a8f5`](https://github.com/clerk/javascript/commit/a04a8f5f81241ee41d93cd64793beca9d6296abb), [`c61855c`](https://github.com/clerk/javascript/commit/c61855c51d9c129d48c4543da3719939ad82f623), [`43ea069`](https://github.com/clerk/javascript/commit/43ea069c570dc64503fc82356ad28a2e43689d45)]:
  - @clerk/types@4.69.0

## 2.3.3

### Patch Changes

- Updated dependencies [[`d2f6f9e`](https://github.com/clerk/javascript/commit/d2f6f9e02036a4288916fcce14f24be5d56561c4), [`a329836`](https://github.com/clerk/javascript/commit/a329836a6c64f0a551a277ccae07043456a70523), [`6041c39`](https://github.com/clerk/javascript/commit/6041c39a31e787a6065dbc3f21e1c569982a06de), [`3f1270d`](https://github.com/clerk/javascript/commit/3f1270db86a21ead0ed6f0bd4f9986485203e973)]:
  - @clerk/types@4.68.0

## 2.3.2

### Patch Changes

- Updated dependencies [[`2a90b68`](https://github.com/clerk/javascript/commit/2a90b689550ae960496c9292ca23e0225e3425cd)]:
  - @clerk/types@4.67.0

## 2.3.1

### Patch Changes

- Updated dependencies [[`8ee859c`](https://github.com/clerk/javascript/commit/8ee859ce00d1d5747c14a80fe7166303e64a4f1f)]:
  - @clerk/types@4.66.1

## 2.3.0

### Minor Changes

- Expose Clerk CSS variables as an option for theming Clerk's components. This change introduces CSS custom properties that allow developers to customize Clerk's appearance using standard CSS variables, providing a more flexible theming approach. ([#6275](https://github.com/clerk/javascript/pull/6275)) by [@alexcarpenter](https://github.com/alexcarpenter)

  ```css
  :root {
    --clerk-color-primary: #6d47ff;
    --clerk-color-primary-foreground: #ffffff;
  }
  ```

  ## Deprecated variables

  | Deprecated                     | New                      |
  | ------------------------------ | ------------------------ |
  | `colorText`                    | `colorForeground`        |
  | `colorTextOnPrimaryBackground` | `colorPrimaryForeground` |
  | `colorTextSecondary`           | `colorMutedForeground`   |
  | `spacingUnit`                  | `spacing`                |
  | `colorInputText`               | `colorInputForeground`   |
  | `colorInputBackground`         | `colorInput`             |

  Deprecated variables will continue to work but will be removed in the next major version.

  ## New variables
  - `colorRing` - The color of the ring when an interactive element is focused.
  - `colorMuted` - The background color for elements of lower importance, eg: a muted background.
  - `colorShadow` - The base shadow color used in the components.
  - `colorBorder` - The base border color used in the components.
  - `colorModalBackdrop` - The background color of the modal backdrop.

### Patch Changes

- Updated dependencies [[`025e304`](https://github.com/clerk/javascript/commit/025e304c4d6402dfd750ee51ac9c8fc2dea1f353), [`dedf487`](https://github.com/clerk/javascript/commit/dedf48703986d547d5b28155b0182a51030cffeb), [`b96114e`](https://github.com/clerk/javascript/commit/b96114e438638896ba536bb7a17b09cdadcd9407)]:
  - @clerk/types@4.66.0

## 2.2.56

### Patch Changes

- Updated dependencies [[`2be6a53`](https://github.com/clerk/javascript/commit/2be6a53959cb8a3127c2eb5d1aeb4248872d2c24), [`6826d0b`](https://github.com/clerk/javascript/commit/6826d0bbd03e844d49224565878a4326684f06b4), [`f6a1c35`](https://github.com/clerk/javascript/commit/f6a1c35bd5fb4bd2a3cd45bdaf9defe6be59d4a9)]:
  - @clerk/types@4.65.0

## 2.2.55

### Patch Changes

- Updated dependencies [[`f42c4fe`](https://github.com/clerk/javascript/commit/f42c4fedfdab873129b876eba38b3677f190b460), [`ec207dc`](https://github.com/clerk/javascript/commit/ec207dcd2a13340cfa4e3b80d3d52d1b4e7d5f23)]:
  - @clerk/types@4.64.0

## 2.2.54

### Patch Changes

- Updated dependencies [[`8387a39`](https://github.com/clerk/javascript/commit/8387a392a04906f0f10d84c61cfee36f23942f85), [`f2a6641`](https://github.com/clerk/javascript/commit/f2a66419b1813abc86ea98fde7475861995a1486)]:
  - @clerk/types@4.63.0

## 2.2.53

### Patch Changes

- Updated dependencies [[`edc0bfd`](https://github.com/clerk/javascript/commit/edc0bfdae929dad78a99dfd6275aad947d9ddd73)]:
  - @clerk/types@4.62.1

## 2.2.52

### Patch Changes

- Updated dependencies [[`f1be1fe`](https://github.com/clerk/javascript/commit/f1be1fe3d575c11acd04fc7aadcdec8f89829894), [`bffb42a`](https://github.com/clerk/javascript/commit/bffb42aaf266a188b9ae7d16ace3024d468a3bd4)]:
  - @clerk/types@4.62.0

## 2.2.51

### Patch Changes

- Updated dependencies [[`b495279`](https://github.com/clerk/javascript/commit/b4952796e3c7dee4ab4726de63a17b7f4265ce37), [`c3fa15d`](https://github.com/clerk/javascript/commit/c3fa15d60642b4fcbcf26e21caaca0fc60975795), [`52d5e57`](https://github.com/clerk/javascript/commit/52d5e5768d54725b4d20d028135746493e05d44c), [`15a945c`](https://github.com/clerk/javascript/commit/15a945c02a9f6bc8d2f7d1e3534217100bf45936)]:
  - @clerk/types@4.61.0

## 2.2.50

### Patch Changes

- Updated dependencies [[`19e9e11`](https://github.com/clerk/javascript/commit/19e9e11af04f13fd12975fbf7016fe0583202056), [`18bcb64`](https://github.com/clerk/javascript/commit/18bcb64a3e8b6d352d7933ed094d68214e6e80fb), [`138f733`](https://github.com/clerk/javascript/commit/138f733f13121487268a4f96e6eb2cffedc6e238), [`48be55b`](https://github.com/clerk/javascript/commit/48be55b61a86e014dd407414764d24bb43fd26f3), [`2c6f805`](https://github.com/clerk/javascript/commit/2c6f805a9e6e4685990f9a8abc740b2d0859a453), [`97749d5`](https://github.com/clerk/javascript/commit/97749d570bc687c7e05cd800a50e0ae4180a371d)]:
  - @clerk/types@4.60.1

## 2.2.49

### Patch Changes

- Updated dependencies [[`d8fa5d9`](https://github.com/clerk/javascript/commit/d8fa5d9d3d8dc575260d8d2b7c7eeeb0052d0b0d), [`be2e89c`](https://github.com/clerk/javascript/commit/be2e89ca11aa43d48f74c57a5a34e20d85b4003c), [`5644d94`](https://github.com/clerk/javascript/commit/5644d94f711a0733e4970c3f15c24d56cafc8743), [`b578225`](https://github.com/clerk/javascript/commit/b5782258242474c9b0987a3f8349836cd763f24b), [`8838120`](https://github.com/clerk/javascript/commit/8838120596830b88fec1c6c853371dabfec74a0d)]:
  - @clerk/types@4.60.0

## 2.2.48

### Patch Changes

- Updated dependencies [[`2c6a0cc`](https://github.com/clerk/javascript/commit/2c6a0cca6e824bafc6b0d0501784517a5b1f75ea), [`71e6a1f`](https://github.com/clerk/javascript/commit/71e6a1f1024d65b7a09cdc8fa81ce0164e0a34cb)]:
  - @clerk/types@4.59.3

## 2.2.47

### Patch Changes

- Updated dependencies [[`6ed3dfc`](https://github.com/clerk/javascript/commit/6ed3dfc1bc742ac9d9a2307fe8e4733411cbc0d7)]:
  - @clerk/types@4.59.2

## 2.2.46

### Patch Changes

- Updated dependencies [[`c305b31`](https://github.com/clerk/javascript/commit/c305b310e351e9ce2012f805b35e464c3e43e310)]:
  - @clerk/types@4.59.1

## 2.2.45

### Patch Changes

- Updated dependencies [[`b1337df`](https://github.com/clerk/javascript/commit/b1337dfeae8ccf8622efcf095e3201f9bbf1cefa), [`65f0878`](https://github.com/clerk/javascript/commit/65f08788ee5e56242eee2194c73ba90965c75c97), [`df6fefd`](https://github.com/clerk/javascript/commit/df6fefd05fd2df93f5286d97e546b48911adea7c), [`4282bfa`](https://github.com/clerk/javascript/commit/4282bfa09491225bde7d619fe9a3561062703f69), [`5491491`](https://github.com/clerk/javascript/commit/5491491711e0a8ee37828451c1f603a409de32cf)]:
  - @clerk/types@4.59.0

## 2.2.44

### Patch Changes

- Updated dependencies [[`1ff6d6e`](https://github.com/clerk/javascript/commit/1ff6d6efbe838b3f7f6977b2b5215c2cafd715f6), [`fbf3cf4`](https://github.com/clerk/javascript/commit/fbf3cf4916469c4e118870bf12efca2d0f77d9d8)]:
  - @clerk/types@4.58.1

## 2.2.43

### Patch Changes

- Updated dependencies [[`0f5145e`](https://github.com/clerk/javascript/commit/0f5145e164f3d3d5faf57e58162b05e7110d2403), [`afdfd18`](https://github.com/clerk/javascript/commit/afdfd18d645608dec37e52a291a91ba5f42dcbe7), [`b7c51ba`](https://github.com/clerk/javascript/commit/b7c51baac6df1129b468274c9a7f63ca303f16ce), [`437b53b`](https://github.com/clerk/javascript/commit/437b53b67e281d076b5b3f927e11c1d64666d154), [`5217155`](https://github.com/clerk/javascript/commit/52171554250c5c58f4f497b6d3c7416e79ac77da)]:
  - @clerk/types@4.58.0

## 2.2.42

### Patch Changes

- Updated dependencies [[`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`36fb43f`](https://github.com/clerk/javascript/commit/36fb43f8b35866bdc20680fac58020f036d30d1f), [`e5ac444`](https://github.com/clerk/javascript/commit/e5ac4447f52bb6887ad686feab308fe9daf76e33), [`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`d227805`](https://github.com/clerk/javascript/commit/d22780599a5e29545a3d8309cc411c2e8659beac)]:
  - @clerk/types@4.57.1

## 2.2.41

### Patch Changes

- Updated dependencies [[`db0138f`](https://github.com/clerk/javascript/commit/db0138f3f72aea8cb68a5684a90123f733848f63), [`aa97231`](https://github.com/clerk/javascript/commit/aa97231962e3f472a46135e376159c6ddcf1157b), [`c792f37`](https://github.com/clerk/javascript/commit/c792f37129fd6475d5af95146e9ef0f1c8eff730), [`3bf08a9`](https://github.com/clerk/javascript/commit/3bf08a9e0a9e65496edac5fc3bb22ad7b561df26), [`74cf3b2`](https://github.com/clerk/javascript/commit/74cf3b28cdf622a942aaf99caabfba74b7e856fd), [`037b113`](https://github.com/clerk/javascript/commit/037b113aaedd53d4647d88f1659eb9c14cf6f275), [`c15a412`](https://github.com/clerk/javascript/commit/c15a412169058e2304a51c9e92ffaa7f6bb2a898), [`7726a03`](https://github.com/clerk/javascript/commit/7726a03a7fec4d292b6de2587b84ed4371984c23), [`b846a9a`](https://github.com/clerk/javascript/commit/b846a9ab96db6b1d8344a4b693051618865508a8), [`e66c800`](https://github.com/clerk/javascript/commit/e66c8002b82b2902f77e852e16482f5cfb062d2c), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed), [`9c41091`](https://github.com/clerk/javascript/commit/9c41091eb795bce8ffeeeca0264ae841fe07b426), [`29462b4`](https://github.com/clerk/javascript/commit/29462b433eb411ce614e4768e5844cacd00c1975), [`322c43f`](https://github.com/clerk/javascript/commit/322c43f6807a932c3cfaaef1b587b472c80180d2), [`17397f9`](https://github.com/clerk/javascript/commit/17397f95b715bd4fefd7f63c1d351abcf1c8ee16), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed)]:
  - @clerk/types@4.57.0

## 2.2.40

### Patch Changes

- Updated dependencies [[`9ec0a73`](https://github.com/clerk/javascript/commit/9ec0a7353e9f6ea661c3d7b9542423b6eb1d29e9), [`d9222fc`](https://github.com/clerk/javascript/commit/d9222fc3c21da2bcae30b06f0b1897f526935582)]:
  - @clerk/types@4.56.3

## 2.2.39

### Patch Changes

- Updated dependencies [[`225b9ca`](https://github.com/clerk/javascript/commit/225b9ca21aba44930872a85d6b112ee2a1b606b9)]:
  - @clerk/types@4.56.2

## 2.2.38

### Patch Changes

- Updated dependencies [[`387bf62`](https://github.com/clerk/javascript/commit/387bf623406306e0c5c08da937f4930a7ec5e4a5), [`294da82`](https://github.com/clerk/javascript/commit/294da82336e7a345900d7ef9b28f56a7c8864c52)]:
  - @clerk/types@4.56.1

## 2.2.37

### Patch Changes

- Updated dependencies [[`b02e766`](https://github.com/clerk/javascript/commit/b02e76627e47aec314573586451fa345a089115a), [`5d78b28`](https://github.com/clerk/javascript/commit/5d78b286b63e35fbcf44aac1f7657cbeaba4d659), [`d7f4438`](https://github.com/clerk/javascript/commit/d7f4438fa4bfd04474d5cdb9212ba908568ad6d2), [`5866855`](https://github.com/clerk/javascript/commit/58668550ec91d5511cf775972c54dc485185cc58), [`0007106`](https://github.com/clerk/javascript/commit/00071065998a3676c51e396b4c0afcbf930a9898), [`462b5b2`](https://github.com/clerk/javascript/commit/462b5b271d4e120d58a85818a358b60a6b3c8100), [`447d7a9`](https://github.com/clerk/javascript/commit/447d7a9e133c2a0e7db014bd5837e6ffff08f572), [`2beea29`](https://github.com/clerk/javascript/commit/2beea2957c67bc62446fe24d36332b0a4e850d7d), [`115601d`](https://github.com/clerk/javascript/commit/115601d12fd65dbf3011c0cda368525a2b95bfeb)]:
  - @clerk/types@4.56.0

## 2.2.36

### Patch Changes

- Updated dependencies [[`8b25035`](https://github.com/clerk/javascript/commit/8b25035aa49382fe1cd1c6f30ec80e86bcf9d66e)]:
  - @clerk/types@4.55.1

## 2.2.35

### Patch Changes

- Updated dependencies [[`33201bf`](https://github.com/clerk/javascript/commit/33201bf972d6a980617d47ebd776bef76f871833), [`4334598`](https://github.com/clerk/javascript/commit/4334598108ff2cfa3c25b5a46117c1c9c65b7974), [`0ae0403`](https://github.com/clerk/javascript/commit/0ae040303d239b75a3221436354a2c2ecdb85aae)]:
  - @clerk/types@4.55.0

## 2.2.34

### Patch Changes

- Updated dependencies [[`45486ac`](https://github.com/clerk/javascript/commit/45486acebf4d133efb09a3622a738cdbf4e51d66), [`837692a`](https://github.com/clerk/javascript/commit/837692aa40197b1574783ad36d0d017a771c08e1), [`0c00e59`](https://github.com/clerk/javascript/commit/0c00e59ff4714491650ac9480ae3b327c626d30d), [`6a5f644`](https://github.com/clerk/javascript/commit/6a5f6447a36a635d6201f8bb7619fb844ab21b79)]:
  - @clerk/types@4.54.2

## 2.2.33

### Patch Changes

- Updated dependencies [[`ab939fd`](https://github.com/clerk/javascript/commit/ab939fdb29150c376280b42f861a188a33f57dcc), [`03284da`](https://github.com/clerk/javascript/commit/03284da6a93a790ce3e3ebbd871c06e19f5a8803), [`7389ba3`](https://github.com/clerk/javascript/commit/7389ba3164ca0d848fb0a9de5d7e9716925fadcc), [`f6ef841`](https://github.com/clerk/javascript/commit/f6ef841125ff21ca8cae731d1f47f3a101d887e1), [`e634830`](https://github.com/clerk/javascript/commit/e6348301ab56a7868f24c1b9a4dd9e1d60f6027b), [`f8887b2`](https://github.com/clerk/javascript/commit/f8887b2cbd145e8e49bec890e8b6e02e34178d6a)]:
  - @clerk/types@4.54.1

## 2.2.32

### Patch Changes

- Updated dependencies [[`e4d04ae`](https://github.com/clerk/javascript/commit/e4d04aea490ab67e3431729398d3f4c46fc3e7e7), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`93068ea`](https://github.com/clerk/javascript/commit/93068ea9eb19d8c8b9c7ade35d0cd860e08049fc), [`48438b4`](https://github.com/clerk/javascript/commit/48438b409036088701bda7e1e732d6a51bee8cdc), [`196dcb4`](https://github.com/clerk/javascript/commit/196dcb47928bd22a3382197f8594a590f688faee)]:
  - @clerk/types@4.54.0

## 2.2.31

### Patch Changes

- Updated dependencies [[`554242e`](https://github.com/clerk/javascript/commit/554242e16e50c92a6afb6ed74c681b04b9f113b5)]:
  - @clerk/types@4.53.0

## 2.2.30

### Patch Changes

- Updated dependencies [[`3ad3bc8`](https://github.com/clerk/javascript/commit/3ad3bc8380b354b0cd952eb58eb6c07650efa0f2), [`cfa94b8`](https://github.com/clerk/javascript/commit/cfa94b88476608edf8c2486e8ec0d3f3f82e0bfb), [`2033919`](https://github.com/clerk/javascript/commit/203391964857b98dae11944799d1e6328439e838), [`5f3cc46`](https://github.com/clerk/javascript/commit/5f3cc460b6b775b5a74746758b8cff11649a877a)]:
  - @clerk/types@4.52.0

## 2.2.29

### Patch Changes

- Updated dependencies [[`f6f275d`](https://github.com/clerk/javascript/commit/f6f275dac5ae83ac0c2016a85a6a0cee9513f224)]:
  - @clerk/types@4.51.1

## 2.2.28

### Patch Changes

- Updated dependencies [[`e1ec52b`](https://github.com/clerk/javascript/commit/e1ec52b93038c9cb24e030dc06e53825a384a480), [`bebb6d8`](https://github.com/clerk/javascript/commit/bebb6d8af66b2bb7a4b3bdf96f9d480e65b31ba2), [`d0d5203`](https://github.com/clerk/javascript/commit/d0d5203e4ee9e2e1bed5c00ef0f87f0130f1d298), [`9b25e31`](https://github.com/clerk/javascript/commit/9b25e311cf5e15f896c7948faa42ace45df364c5)]:
  - @clerk/types@4.51.0

## 2.2.27

### Patch Changes

- Updated dependencies [[`ec4521b`](https://github.com/clerk/javascript/commit/ec4521b4fe56602f524a0c6d1b09d21aef5d8bd0), [`f30fa75`](https://github.com/clerk/javascript/commit/f30fa750754f19030f932a666d2bdbdf0d86743d), [`9c68678`](https://github.com/clerk/javascript/commit/9c68678e87047e6312b708b775ebfb23a3e22f8a)]:
  - @clerk/types@4.50.2

## 2.2.26

### Patch Changes

- Updated dependencies [[`e20fb6b`](https://github.com/clerk/javascript/commit/e20fb6b397fb69c9d5af4e321267b82f12a5f127), [`77e6462`](https://github.com/clerk/javascript/commit/77e64628560cab688af214edb5922e67cd68a951)]:
  - @clerk/types@4.50.1

## 2.2.25

### Patch Changes

- Updated dependencies [[`1da28a2`](https://github.com/clerk/javascript/commit/1da28a28bf602069b433c15b92df21f682779294), [`f20dc15`](https://github.com/clerk/javascript/commit/f20dc159f542449e7f5b437b70d3eb3ba04d6975), [`4d9f1ee`](https://github.com/clerk/javascript/commit/4d9f1ee8c22fe1e4a166ff054d0af4d37b829f0a)]:
  - @clerk/types@4.50.0

## 2.2.24

### Patch Changes

- Updated dependencies [[`466ed13`](https://github.com/clerk/javascript/commit/466ed136af73b59b267d92ad3296039d1c3a4fcc)]:
  - @clerk/types@4.49.2

## 2.2.23

### Patch Changes

- Updated dependencies [[`3910ebe`](https://github.com/clerk/javascript/commit/3910ebea85817273f18fd2f3f142dd1c728e2220)]:
  - @clerk/types@4.49.1

## 2.2.22

### Patch Changes

- Updated dependencies [[`725918d`](https://github.com/clerk/javascript/commit/725918df2e74cea15e9b748aaf103a52df8e8500), [`91d0f0b`](https://github.com/clerk/javascript/commit/91d0f0b0dccab7168ad4dc06c8629808938c235f), [`9572bf5`](https://github.com/clerk/javascript/commit/9572bf5bdfb7dc309ec8714989b98ab12174965b), [`39bbc51`](https://github.com/clerk/javascript/commit/39bbc5189a33dc6cebdc269ac2184dc4ffff2534), [`3dddcda`](https://github.com/clerk/javascript/commit/3dddcda191d8f8d6a9b02464f1f6374d3c6aacb9), [`7524943`](https://github.com/clerk/javascript/commit/7524943300d7e693d61cc1820b520abfadec1c64), [`150b5c8`](https://github.com/clerk/javascript/commit/150b5c89477abb0feab15e0a886179473f653cac), [`23c931e`](https://github.com/clerk/javascript/commit/23c931e9e95e6de992549ad499b477aca9a9c344), [`730262f`](https://github.com/clerk/javascript/commit/730262f0f973923c8749b09078c80c2fc966a8ec), [`0b18bb1`](https://github.com/clerk/javascript/commit/0b18bb1fe6fa3ded97547bb6b4d2c73030aad329), [`021bc5f`](https://github.com/clerk/javascript/commit/021bc5f40044d34e49956ce3c9b61d833d815b42), [`1a61390`](https://github.com/clerk/javascript/commit/1a61390d3482bd4af58508b972ad89dea56fa224)]:
  - @clerk/types@4.49.0

## 2.2.21

### Patch Changes

- Updated dependencies [[`75879672c5805bfba1caca906ac0729497744164`](https://github.com/clerk/javascript/commit/75879672c5805bfba1caca906ac0729497744164), [`7ec95a7e59033600958aca4b86f3bcd5da947dec`](https://github.com/clerk/javascript/commit/7ec95a7e59033600958aca4b86f3bcd5da947dec), [`3c225d90227141dc62d955e76c7f8e0202524bc7`](https://github.com/clerk/javascript/commit/3c225d90227141dc62d955e76c7f8e0202524bc7), [`2a66c16af08573000bb619607346ac420cd4ce56`](https://github.com/clerk/javascript/commit/2a66c16af08573000bb619607346ac420cd4ce56)]:
  - @clerk/types@4.48.0

## 2.2.20

### Patch Changes

- Updated dependencies [[`28179323d9891bd13625e32c5682a3276e73cdae`](https://github.com/clerk/javascript/commit/28179323d9891bd13625e32c5682a3276e73cdae), [`c5c246ce91c01db9f1eaccbd354f646bcd24ec0a`](https://github.com/clerk/javascript/commit/c5c246ce91c01db9f1eaccbd354f646bcd24ec0a), [`bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a`](https://github.com/clerk/javascript/commit/bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a)]:
  - @clerk/types@4.47.0

## 2.2.19

### Patch Changes

- Updated dependencies [[`a9b0087fca3f427f65907b358d9b5bc0c95921d8`](https://github.com/clerk/javascript/commit/a9b0087fca3f427f65907b358d9b5bc0c95921d8)]:
  - @clerk/types@4.46.1

## 2.2.18

### Patch Changes

- Updated dependencies [[`dd2cbfe9f30358b6b298901bb52fa378b0acdca3`](https://github.com/clerk/javascript/commit/dd2cbfe9f30358b6b298901bb52fa378b0acdca3), [`570d8386f6aa596bf7bb1659bdddb8dd4d992b1d`](https://github.com/clerk/javascript/commit/570d8386f6aa596bf7bb1659bdddb8dd4d992b1d)]:
  - @clerk/types@4.46.0

## 2.2.17

### Patch Changes

- Invert OKX Wallet icon in dark theme. ([#5100](https://github.com/clerk/javascript/pull/5100)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`767ac85fe6ce0ee0594c923e9af701bb05f40a0b`](https://github.com/clerk/javascript/commit/767ac85fe6ce0ee0594c923e9af701bb05f40a0b), [`225b38c7187d31fc755155ea99834ca03894d36b`](https://github.com/clerk/javascript/commit/225b38c7187d31fc755155ea99834ca03894d36b), [`429f1bfe5f7a554ab1fdf265475ba6c8b3f78472`](https://github.com/clerk/javascript/commit/429f1bfe5f7a554ab1fdf265475ba6c8b3f78472)]:
  - @clerk/types@4.45.1

## 2.2.16

### Patch Changes

- Updated dependencies [[`d3152be7f01fbb5ca26aeddc2437021f4b7ecc83`](https://github.com/clerk/javascript/commit/d3152be7f01fbb5ca26aeddc2437021f4b7ecc83), [`f976349243da2b75023e59e802460e6f3592ebbd`](https://github.com/clerk/javascript/commit/f976349243da2b75023e59e802460e6f3592ebbd)]:
  - @clerk/types@4.45.0

## 2.2.15

### Patch Changes

- Updated dependencies [[`833693a6792b621e72162d70673e7bdfa84a69b6`](https://github.com/clerk/javascript/commit/833693a6792b621e72162d70673e7bdfa84a69b6)]:
  - @clerk/types@4.44.3

## 2.2.14

### Patch Changes

- Updated dependencies [[`1345cb487970a7347351897e80dfb829d85c41ea`](https://github.com/clerk/javascript/commit/1345cb487970a7347351897e80dfb829d85c41ea)]:
  - @clerk/types@4.44.2

## 2.2.13

### Patch Changes

- Updated dependencies [[`57c983fdc2b8d883623a2294daae0ac6c02c48f6`](https://github.com/clerk/javascript/commit/57c983fdc2b8d883623a2294daae0ac6c02c48f6), [`a26cf0ff10c76244975c454fdf6c615475d4bcd5`](https://github.com/clerk/javascript/commit/a26cf0ff10c76244975c454fdf6c615475d4bcd5)]:
  - @clerk/types@4.44.1

## 2.2.12

### Patch Changes

- Updated dependencies [[`2179690c10a61b117e82fdd566b34939f4d28bc1`](https://github.com/clerk/javascript/commit/2179690c10a61b117e82fdd566b34939f4d28bc1), [`bdb537a9902c0f0ae58ca1d4b7590d929f28fedb`](https://github.com/clerk/javascript/commit/bdb537a9902c0f0ae58ca1d4b7590d929f28fedb)]:
  - @clerk/types@4.44.0

## 2.2.11

### Patch Changes

- Updated dependencies [[`6e096564a459db4eaf953e99e570905b10be6c84`](https://github.com/clerk/javascript/commit/6e096564a459db4eaf953e99e570905b10be6c84)]:
  - @clerk/types@4.43.0

## 2.2.10

### Patch Changes

- Updated dependencies [[`fe3e49f61acefe8d7f1992405f7cb415fea2e5c8`](https://github.com/clerk/javascript/commit/fe3e49f61acefe8d7f1992405f7cb415fea2e5c8), [`4427c4702f64d4f28f7564ce5889d41e260aa519`](https://github.com/clerk/javascript/commit/4427c4702f64d4f28f7564ce5889d41e260aa519)]:
  - @clerk/types@4.42.0

## 2.2.9

### Patch Changes

- Updated dependencies [[`418ec5c62c4eb600566faab07684c068a29007e3`](https://github.com/clerk/javascript/commit/418ec5c62c4eb600566faab07684c068a29007e3)]:
  - @clerk/types@4.41.2

## 2.2.8

### Patch Changes

- Updated dependencies [[`7ffc99b48977b9f6c74c0c71c500b60cb8aba65e`](https://github.com/clerk/javascript/commit/7ffc99b48977b9f6c74c0c71c500b60cb8aba65e)]:
  - @clerk/types@4.41.1

## 2.2.7

### Patch Changes

- Updated dependencies [[`4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d`](https://github.com/clerk/javascript/commit/4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d), [`aa48b1f9e890b2402e9d05989a4820141076f7bf`](https://github.com/clerk/javascript/commit/aa48b1f9e890b2402e9d05989a4820141076f7bf), [`53bd34fff38b17498edf66cc4bc2d42d707f28dc`](https://github.com/clerk/javascript/commit/53bd34fff38b17498edf66cc4bc2d42d707f28dc)]:
  - @clerk/types@4.41.0

## 2.2.6

### Patch Changes

- Updated dependencies [[`fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6`](https://github.com/clerk/javascript/commit/fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6)]:
  - @clerk/types@4.40.3

## 2.2.5

### Patch Changes

- Updated dependencies [[`44cab6038af0a4d23869b3b292ece742fbbc4d85`](https://github.com/clerk/javascript/commit/44cab6038af0a4d23869b3b292ece742fbbc4d85)]:
  - @clerk/types@4.40.2

## 2.2.4

### Patch Changes

- Updated dependencies [[`80e1117631d35834705119a79cdcf9e0ed423fdd`](https://github.com/clerk/javascript/commit/80e1117631d35834705119a79cdcf9e0ed423fdd)]:
  - @clerk/types@4.40.1

## 2.2.3

### Patch Changes

- Updated dependencies [[`c9da04636ffe1ba804a1ce5e5b79027d3a2344d2`](https://github.com/clerk/javascript/commit/c9da04636ffe1ba804a1ce5e5b79027d3a2344d2)]:
  - @clerk/types@4.40.0

## 2.2.2

### Patch Changes

- Updated dependencies [[`aeafa7c5efd50c893d088ac99199d7eaecc04025`](https://github.com/clerk/javascript/commit/aeafa7c5efd50c893d088ac99199d7eaecc04025), [`acd9326ef2d6942b981b3ee59c4b20ddd303323d`](https://github.com/clerk/javascript/commit/acd9326ef2d6942b981b3ee59c4b20ddd303323d)]:
  - @clerk/types@4.39.4

## 2.2.1

### Patch Changes

- Updated dependencies [[`e1748582d0c89462f48a482a7805871b7065fa19`](https://github.com/clerk/javascript/commit/e1748582d0c89462f48a482a7805871b7065fa19), [`7f7edcaa8228c26d19e9081979100ada7e982095`](https://github.com/clerk/javascript/commit/7f7edcaa8228c26d19e9081979100ada7e982095), [`dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d`](https://github.com/clerk/javascript/commit/dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d)]:
  - @clerk/types@4.39.3

## 2.2.0

### Minor Changes

- Switching to use ^ for semver ranges of internal @clerk/ production dependencies. ([#4664](https://github.com/clerk/javascript/pull/4664)) by [@jacekradko](https://github.com/jacekradko)

## 2.1.55

### Patch Changes

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/types@4.39.2

## 2.1.54

### Patch Changes

- Updated dependencies [[`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/types@4.39.1

## 2.1.53

### Patch Changes

- Updated dependencies [[`550c7e9851329688e37be29b83ea0c3b12482af7`](https://github.com/clerk/javascript/commit/550c7e9851329688e37be29b83ea0c3b12482af7), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99)]:
  - @clerk/types@4.39.0

## 2.1.52

### Patch Changes

- Updated dependencies [[`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3)]:
  - @clerk/types@4.38.0

## 2.1.51

### Patch Changes

- Updated dependencies [[`4e5e7f463c12893a21cb3b5f9317fc3f2945879b`](https://github.com/clerk/javascript/commit/4e5e7f463c12893a21cb3b5f9317fc3f2945879b)]:
  - @clerk/types@4.37.0

## 2.1.50

### Patch Changes

- Updated dependencies [[`8ee5d84995fa17532491ff96efac5738c9bcd9ef`](https://github.com/clerk/javascript/commit/8ee5d84995fa17532491ff96efac5738c9bcd9ef), [`09fedd1df155d30cc055ce701b133aa6470e9b47`](https://github.com/clerk/javascript/commit/09fedd1df155d30cc055ce701b133aa6470e9b47)]:
  - @clerk/types@4.36.0

## 2.1.49

### Patch Changes

- Updated dependencies [[`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d)]:
  - @clerk/types@4.35.1

## 2.1.48

### Patch Changes

- Updated dependencies [[`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`dce4f7ffca7248c0500f0ec9a978672b1f2fad69`](https://github.com/clerk/javascript/commit/dce4f7ffca7248c0500f0ec9a978672b1f2fad69)]:
  - @clerk/types@4.35.0

## 2.1.47

### Patch Changes

- Updated dependencies [[`c70994b5b6f92a6550dfe37547f01bbfa810c223`](https://github.com/clerk/javascript/commit/c70994b5b6f92a6550dfe37547f01bbfa810c223), [`7623a99594e7329200b6b374e483152d7679ce66`](https://github.com/clerk/javascript/commit/7623a99594e7329200b6b374e483152d7679ce66)]:
  - @clerk/types@4.34.2

## 2.1.46

### Patch Changes

- Updated dependencies [[`e47eb5882a7fd4a8dee25933c6644790d6ea3407`](https://github.com/clerk/javascript/commit/e47eb5882a7fd4a8dee25933c6644790d6ea3407), [`273d16cb0665d4d960838cb294dc356f41814745`](https://github.com/clerk/javascript/commit/273d16cb0665d4d960838cb294dc356f41814745)]:
  - @clerk/types@4.34.1

## 2.1.45

### Patch Changes

- Updated dependencies [[`46faeb6f59b19c963fb137c858347525b1cd9e19`](https://github.com/clerk/javascript/commit/46faeb6f59b19c963fb137c858347525b1cd9e19)]:
  - @clerk/types@4.34.0

## 2.1.44

### Patch Changes

- Updated dependencies [[`1c0b5001f7f975a2f3f54ad692526ecf7257847e`](https://github.com/clerk/javascript/commit/1c0b5001f7f975a2f3f54ad692526ecf7257847e), [`6217a3f7c94311d49f873214bd406961e0b8d6f7`](https://github.com/clerk/javascript/commit/6217a3f7c94311d49f873214bd406961e0b8d6f7), [`1783025cdb94c447028704c2121fa0b8af785904`](https://github.com/clerk/javascript/commit/1783025cdb94c447028704c2121fa0b8af785904)]:
  - @clerk/types@4.33.0

## 2.1.43

### Patch Changes

- Updated dependencies [[`7dbad4c5abd226d7b10941a626ead5d85b1a3f24`](https://github.com/clerk/javascript/commit/7dbad4c5abd226d7b10941a626ead5d85b1a3f24)]:
  - @clerk/types@4.32.0

## 2.1.42

### Patch Changes

- Updated dependencies [[`f7472e22877f62fc7f3c8d3efe409ff2276fb4a3`](https://github.com/clerk/javascript/commit/f7472e22877f62fc7f3c8d3efe409ff2276fb4a3), [`e199037b8f484abdeeb9fc24455a1b4b8c31c8dd`](https://github.com/clerk/javascript/commit/e199037b8f484abdeeb9fc24455a1b4b8c31c8dd), [`0e443ad7c76643420b50e5b169193e03f6ef79f9`](https://github.com/clerk/javascript/commit/0e443ad7c76643420b50e5b169193e03f6ef79f9), [`cc24c8145f1eea7fb91550f2c3e0bac3993e4320`](https://github.com/clerk/javascript/commit/cc24c8145f1eea7fb91550f2c3e0bac3993e4320)]:
  - @clerk/types@4.31.0

## 2.1.41

### Patch Changes

- Updated dependencies [[`d74a6a7c0f291104c6bba722a8c432814d7b336e`](https://github.com/clerk/javascript/commit/d74a6a7c0f291104c6bba722a8c432814d7b336e), [`1a0c8fe665869e732d3c800bde0f5219fce54301`](https://github.com/clerk/javascript/commit/1a0c8fe665869e732d3c800bde0f5219fce54301)]:
  - @clerk/types@4.30.0

## 2.1.40

### Patch Changes

- Updated dependencies [[`f875463da`](https://github.com/clerk/javascript/commit/f875463da9692f2d173b6d5388743cf720750ae3), [`5be7ca9fd`](https://github.com/clerk/javascript/commit/5be7ca9fd239c937cc88e20ce8f5bfc9f3b84f22), [`434b432f8`](https://github.com/clerk/javascript/commit/434b432f8c114825120eef0f2c278b8142ed1563)]:
  - @clerk/types@4.29.0

## 2.1.39

### Patch Changes

- Updated dependencies [[`3fdcdbf88`](https://github.com/clerk/javascript/commit/3fdcdbf88c38facf8b82563f634ec1b6604fd8e5)]:
  - @clerk/types@4.28.0

## 2.1.38

### Patch Changes

- Updated dependencies [[`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc), [`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc)]:
  - @clerk/types@4.27.0

## 2.1.37

### Patch Changes

- Updated dependencies [[`e81d45b72`](https://github.com/clerk/javascript/commit/e81d45b72c81403c7c206dac5454de1fef6bec57), [`99cdf9b67`](https://github.com/clerk/javascript/commit/99cdf9b67d1e99e66cc73d8a5bfce1f1f8df1b83), [`ce40ff6f0`](https://github.com/clerk/javascript/commit/ce40ff6f0d3bc79e33375be6dd5e03f140a07000), [`2102052c0`](https://github.com/clerk/javascript/commit/2102052c017065ab511339870fcebaa6719f2702)]:
  - @clerk/types@4.26.0

## 2.1.36

### Patch Changes

- Updated dependencies [[`2ba2fd148`](https://github.com/clerk/javascript/commit/2ba2fd1483b7561d7df9a1952ead0ee15e422131)]:
  - @clerk/types@4.25.1

## 2.1.35

### Patch Changes

- Updated dependencies [[`fb932e5cf`](https://github.com/clerk/javascript/commit/fb932e5cf21315adf60bee0855b6bd5ee2ff9867)]:
  - @clerk/types@4.25.0

## 2.1.34

### Patch Changes

- Updated dependencies [[`f6fb8b53d`](https://github.com/clerk/javascript/commit/f6fb8b53d236863ad7eca576ee7a16cd33f3506b), [`4a8570590`](https://github.com/clerk/javascript/commit/4a857059059a02bb4f20893e08601e1e67babbed)]:
  - @clerk/types@4.24.0

## 2.1.33

### Patch Changes

- Updated dependencies [[`4749ed4c5`](https://github.com/clerk/javascript/commit/4749ed4c55a5ba5810451b8d436aad0d49829050), [`f1f17eaab`](https://github.com/clerk/javascript/commit/f1f17eaabed0dc4b7de405fb77d85503cf75ad33), [`2e35ac538`](https://github.com/clerk/javascript/commit/2e35ac53885f8008779940d41d1e804fa77ebfa9)]:
  - @clerk/types@4.23.0

## 2.1.32

### Patch Changes

- Updated dependencies [[`c9063853e`](https://github.com/clerk/javascript/commit/c9063853e538a4010f5d4e522a3da5abc80098a4), [`19d3808d4`](https://github.com/clerk/javascript/commit/19d3808d4672234944226d6709ec51214e8d6e1d), [`737bcbb0f`](https://github.com/clerk/javascript/commit/737bcbb0ffb5e2dcadbb02e8fc718fe8825c5842)]:
  - @clerk/types@4.22.0

## 2.1.31

### Patch Changes

- Updated dependencies [[`2e5c550e4`](https://github.com/clerk/javascript/commit/2e5c550e4aec61150c2a17fdcd4a0e1273cb50e7)]:
  - @clerk/types@4.21.1

## 2.1.30

### Patch Changes

- Updated dependencies [[`248142a6d`](https://github.com/clerk/javascript/commit/248142a6ded6ca937d0df7d628197f25228aadec), [`1189f71f8`](https://github.com/clerk/javascript/commit/1189f71f872f2683c12de5add5f154aeb953ca8d)]:
  - @clerk/types@4.21.0

## 2.1.29

### Patch Changes

- Updated dependencies [[`8c6909d46`](https://github.com/clerk/javascript/commit/8c6909d46328c943f1d464a28f1a324a27d0f3f1)]:
  - @clerk/types@4.20.1

## 2.1.28

### Patch Changes

- Updated dependencies [[`c63a5adf0`](https://github.com/clerk/javascript/commit/c63a5adf0ba4b99252146f168318f51b709bb5dd), [`8823c21a2`](https://github.com/clerk/javascript/commit/8823c21a26bc81cbc3ed007908b1a9ea474bd343), [`a0cb062fa`](https://github.com/clerk/javascript/commit/a0cb062faa4d23bef7a577e5cc486f4c5efe6bfa)]:
  - @clerk/types@4.20.0

## 2.1.27

### Patch Changes

- Updated dependencies [[`8a3b9f079`](https://github.com/clerk/javascript/commit/8a3b9f0793484b32dd609a5c80a194e62151d6ea), [`e95c28196`](https://github.com/clerk/javascript/commit/e95c2819675cea7963f2404e5f71f37ebed8d5e0)]:
  - @clerk/types@4.19.0

## 2.1.26

### Patch Changes

- Updated dependencies [[`82593173a`](https://github.com/clerk/javascript/commit/82593173aafbf6646e12c5779627cdcb138a1f27), [`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733)]:
  - @clerk/types@4.18.0

## 2.1.25

### Patch Changes

- Tidy up and improve README ([#4053](https://github.com/clerk/javascript/pull/4053)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`58e6754ad`](https://github.com/clerk/javascript/commit/58e6754ad9f9a1244b023ce1f5e5f2c1c4eb20e7), [`13693018f`](https://github.com/clerk/javascript/commit/13693018f4f7ac5d224698aa730e20960896f68c), [`3304dcc0b`](https://github.com/clerk/javascript/commit/3304dcc0bc93a92a7f729f585c60ff91d2ae04f6)]:
  - @clerk/types@4.17.0

## 2.1.24

### Patch Changes

- Updated dependencies [[`c1389492d`](https://github.com/clerk/javascript/commit/c1389492d8b6a9292ab04889bf776c0f45e66845)]:
  - @clerk/types@4.16.0

## 2.1.23

### Patch Changes

- Updated dependencies [[`0158c774a`](https://github.com/clerk/javascript/commit/0158c774af2243a2cd13b55c4d6fae877178c961), [`8be1a7abc`](https://github.com/clerk/javascript/commit/8be1a7abc8849d7d59552011bd6b25bc917d51f5)]:
  - @clerk/types@4.15.1

## 2.1.22

### Patch Changes

- Updated dependencies [[`247b3fd75`](https://github.com/clerk/javascript/commit/247b3fd75042365dc9f950db056b76f9fadfdcf6)]:
  - @clerk/types@4.15.0

## 2.1.21

### Patch Changes

- Updated dependencies [[`dc0e1c33d`](https://github.com/clerk/javascript/commit/dc0e1c33d6844b028cb1ee11c3359b886d609f3c)]:
  - @clerk/types@4.14.0

## 2.1.20

### Patch Changes

- Updated dependencies [[`b6f0613dc`](https://github.com/clerk/javascript/commit/b6f0613dc9d8b0bab41cfabbaa8621b126e3bdf5)]:
  - @clerk/types@4.13.1

## 2.1.19

### Patch Changes

- Updated dependencies [[`4e6c94e3f`](https://github.com/clerk/javascript/commit/4e6c94e3f4cc92cbba8bddcd2b90fcc9cfb83763)]:
  - @clerk/types@4.13.0

## 2.1.18

### Patch Changes

- Updated dependencies [[`9b2aeacb3`](https://github.com/clerk/javascript/commit/9b2aeacb32fff7c300bda458636a1cc81a42ee7b)]:
  - @clerk/types@4.12.1

## 2.1.17

### Patch Changes

- Updated dependencies [[`7e94fcf0f`](https://github.com/clerk/javascript/commit/7e94fcf0fcbee8842a54f7931c45190370aa870d)]:
  - @clerk/types@4.12.0

## 2.1.16

### Patch Changes

- Updated dependencies [[`568186cad`](https://github.com/clerk/javascript/commit/568186cad29acaf0b084a9f86ccb9d29bd23fcf4), [`407195270`](https://github.com/clerk/javascript/commit/407195270ed8aab6eef18c64a4918e3870fef471)]:
  - @clerk/types@4.11.0

## 2.1.15

### Patch Changes

- Updated dependencies [[`aa06f3ba7`](https://github.com/clerk/javascript/commit/aa06f3ba7e725071c90d4a1d6840060236da3c23), [`80e647731`](https://github.com/clerk/javascript/commit/80e64773135865434cf0e6c220e287397aa07937)]:
  - @clerk/types@4.10.0

## 2.1.14

### Patch Changes

- Updated dependencies [[`b48689705`](https://github.com/clerk/javascript/commit/b48689705f9fc2251d2f24addec7a0d0b1da0fe1)]:
  - @clerk/types@4.9.1

## 2.1.13

### Patch Changes

- Updated dependencies [[`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`86c75e50c`](https://github.com/clerk/javascript/commit/86c75e50cba9c4efb480672f1b8c6a6fff4ef477)]:
  - @clerk/types@4.9.0

## 2.1.12

### Patch Changes

- Updated dependencies [[`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7)]:
  - @clerk/types@4.8.0

## 2.1.11

### Patch Changes

- Updated dependencies [[`d6b5006c4`](https://github.com/clerk/javascript/commit/d6b5006c4cc1b6f07bb3a6832b4ec6e65ea15814)]:
  - @clerk/types@4.7.0

## 2.1.10

### Patch Changes

- Updated dependencies [[`1273b04ec`](https://github.com/clerk/javascript/commit/1273b04ecf1866b59ef59a74abe31dbcc726da2c)]:
  - @clerk/types@4.6.1

## 2.1.9

### Patch Changes

- Updated dependencies [[`73e5d61e2`](https://github.com/clerk/javascript/commit/73e5d61e21ab3f77f3c8343bc63da0626466c7ac), [`b8e46328d`](https://github.com/clerk/javascript/commit/b8e46328da874859c4928f19f924219cd6520b11)]:
  - @clerk/types@4.6.0

## 2.1.8

### Patch Changes

- Updated dependencies [[`4beb00672`](https://github.com/clerk/javascript/commit/4beb00672da64bafd67fbc98181c4c2649a9062c)]:
  - @clerk/types@4.5.1

## 2.1.7

### Patch Changes

- Updated dependencies [[`d6a9b3f5d`](https://github.com/clerk/javascript/commit/d6a9b3f5dd8c64b1bd49f74c3707eb01dcd6aff4)]:
  - @clerk/types@4.5.0

## 2.1.6

### Patch Changes

- Updated dependencies [[`3d790d5ea`](https://github.com/clerk/javascript/commit/3d790d5ea347a51ef16557c015c901a9f277effe)]:
  - @clerk/types@4.4.0

## 2.1.5

### Patch Changes

- Updated dependencies [[`eae0a32d5`](https://github.com/clerk/javascript/commit/eae0a32d5c9e97ccbfd96e001c2cac6bc753b5b3)]:
  - @clerk/types@4.3.1

## 2.1.4

### Patch Changes

- Updated dependencies [[`94197710a`](https://github.com/clerk/javascript/commit/94197710a70381c4f1c460948ef02cd2a70b88bb), [`b27ca8366`](https://github.com/clerk/javascript/commit/b27ca8366a1d6ec1d7ce4a5be5005f1b1b017c20)]:
  - @clerk/types@4.3.0

## 2.1.3

### Patch Changes

- Updated dependencies [[`f70c885f7`](https://github.com/clerk/javascript/commit/f70c885f798f7ff513f6687f87c8a56daf26fa05)]:
  - @clerk/types@4.2.1

## 2.1.2

### Patch Changes

- Update the `neobrutalism` to make it compatible with the new Core 2 components ([#3310](https://github.com/clerk/javascript/pull/3310)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

## 2.1.1

### Patch Changes

- Updated dependencies [[`c7d626292`](https://github.com/clerk/javascript/commit/c7d626292a9fd12ca0f1b31a1035e711b6e99531)]:
  - @clerk/types@4.2.0

## 2.1.0

### Minor Changes

- Drop `react` and `react-dom` as peer dependencies since they are not necessary for this package. ([#3273](https://github.com/clerk/javascript/pull/3273)) by [@panteliselef](https://github.com/panteliselef)

## 2.0.1

### Patch Changes

- Updated dependencies [[`956d8792f`](https://github.com/clerk/javascript/commit/956d8792fefe9d6a89022f1e938149b25503ec7f)]:
  - @clerk/types@4.1.0

## 2.0.0

### Major Changes

- c2a090513: Change the minimal Node.js version required by Clerk to `18.17.0`.
- 52ff8fe6b: Upgrade React version to >=18 and add react-dom as peer dependency
  to fix issues with vite & rollup building.
- 97407d8aa: Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now.
- 7886ba89d: Refresh the look and feel of the Clerk UI components

  For more info, refer to the [upgrade guide from v4 to v5 in Clerk docs](https://clerk.com/docs/upgrade-guides/upgrading-from-v4-to-v5).

### Patch Changes

- 2ae9fd601: Release the latest beta changes of the `@clerk/themes` package
- 2de442b24: Rename beta-v5 to beta
- be5bc7b4b: Rename `unstable_createTheme` to `experimental_createTheme`
- Updated dependencies [1db1f4068]
- Updated dependencies [c2a090513]
- Updated dependencies [0d0b1d89a]
- Updated dependencies [d37d44a68]
- Updated dependencies [fe356eebd]
- Updated dependencies [7f6a64f43]
- Updated dependencies [afec17953]
- Updated dependencies [0699fa496]
- Updated dependencies [2de442b24]
- Updated dependencies [0293f29c8]
- Updated dependencies [5f58a2274]
- Updated dependencies [9180c8b80]
- Updated dependencies [7f833da9e]
- Updated dependencies [fc3ffd880]
- Updated dependencies [840636a14]
- Updated dependencies [bab2e7e05]
- Updated dependencies [2352149f6]
- Updated dependencies [ff08fe237]
- Updated dependencies [244de5ea3]
- Updated dependencies [d9f265fcb]
- Updated dependencies [7bffc47cb]
- Updated dependencies [9737ef510]
- Updated dependencies [fafa76fb6]
- Updated dependencies [1f650f30a]
- Updated dependencies [2a22aade8]
- Updated dependencies [69ce3e185]
- Updated dependencies [78fc5eec0]
- Updated dependencies [a9fe242be]
- Updated dependencies [5f58a2274]
- Updated dependencies [6a33709cc]
- Updated dependencies [f77e8cdbd]
- Updated dependencies [8b466a9ba]
- Updated dependencies [fe2607b6f]
- Updated dependencies [c7e6d00f5]
- Updated dependencies [663243220]
- Updated dependencies [c6a5e0f5d]
- Updated dependencies [4edb77632]
- Updated dependencies [ab4eb56a5]
- Updated dependencies [a9fe242be]
- Updated dependencies [5c239d973]
- Updated dependencies [97407d8aa]
- Updated dependencies [12962bc58]
- Updated dependencies [2e4a43017]
- Updated dependencies [5aab9f04a]
- Updated dependencies [46040a2f3]
- Updated dependencies [f00fd2dfe]
- Updated dependencies [9a1fe3728]
- Updated dependencies [7f751c4ef]
- Updated dependencies [18c0d015d]
- Updated dependencies [7886ba89d]
- Updated dependencies [9a1fe3728]
- Updated dependencies [f540e9843]
- Updated dependencies [477170962]
- Updated dependencies [d6a7ea61a]
- Updated dependencies [41ae1d2f0]
- Updated dependencies [48ca40af9]
- Updated dependencies [94519aa33]
- Updated dependencies [ebf9be77f]
- Updated dependencies [008ac4217]
- Updated dependencies [40ac4b645]
- Updated dependencies [429d030f7]
- Updated dependencies [844847e0b]
  - @clerk/types@4.0.0

## 2.0.0-beta.15

### Patch Changes

- Updated dependencies [[`f00fd2dfe`](https://github.com/clerk/javascript/commit/f00fd2dfe309cfeac82a776cc006f2c21b6d7988)]:
  - @clerk/types@4.0.0-beta.30

## 2.0.0-beta.14

### Patch Changes

- Updated dependencies [[`bab2e7e05`](https://github.com/clerk/javascript/commit/bab2e7e0590d0da1fd7db0680e63e8f2eb836b41)]:
  - @clerk/types@4.0.0-beta.29

## 2.0.0-beta.13

### Patch Changes

- Updated dependencies [[`ff08fe237`](https://github.com/clerk/javascript/commit/ff08fe237fa5a9ded04924b3c5821111836b49b6), [`d9f265fcb`](https://github.com/clerk/javascript/commit/d9f265fcb12b39301b9802e4787dc636ee28444f)]:
  - @clerk/types@4.0.0-beta.28

## 2.0.0-beta.12

### Patch Changes

- Updated dependencies [[`94519aa33`](https://github.com/clerk/javascript/commit/94519aa33774c8d6e557ce47a00974ad7b194c5d)]:
  - @clerk/types@4.0.0-beta.27

## 2.0.0-beta.11

### Patch Changes

- Updated dependencies [[`0699fa496`](https://github.com/clerk/javascript/commit/0699fa49693dc7a8d3de8ba053c4f16a5c8431d0)]:
  - @clerk/types@4.0.0-beta.26

## 2.0.0-beta.10

### Patch Changes

- Updated dependencies [[`2352149f6`](https://github.com/clerk/javascript/commit/2352149f6ba9708095146a3087538faf2d4f161f)]:
  - @clerk/types@4.0.0-beta.25

## 2.0.0-beta.9

### Patch Changes

- Updated dependencies [[`9180c8b80`](https://github.com/clerk/javascript/commit/9180c8b80e0ad95c1a9e490e8201ffd089634a48), [`c6a5e0f5d`](https://github.com/clerk/javascript/commit/c6a5e0f5dbd9ec4a7b5657855e8a31bc8347d0a4)]:
  - @clerk/types@4.0.0-beta.24

## 2.0.0-beta.8

### Patch Changes

- Updated dependencies [[`fc3ffd880`](https://github.com/clerk/javascript/commit/fc3ffd88064a09ab98877dfba119150390f9296e), [`840636a14`](https://github.com/clerk/javascript/commit/840636a14537d4f6b810832e7662518ef4bd4500), [`f540e9843`](https://github.com/clerk/javascript/commit/f540e98435c86298415552537e33164471298a5c)]:
  - @clerk/types@4.0.0-beta.23

## 2.0.0-beta.7

### Patch Changes

- Updated dependencies [[`afec17953`](https://github.com/clerk/javascript/commit/afec17953d1ae4ba39ee73e4383757694375524d)]:
  - @clerk/types@4.0.0-beta.22

## 2.0.0-beta.6

### Patch Changes

- Updated dependencies [[`0d0b1d89a`](https://github.com/clerk/javascript/commit/0d0b1d89a46d2418cb05a10940f4a399cbd8ffeb), [`1f650f30a`](https://github.com/clerk/javascript/commit/1f650f30a97939817b7b2f3cc6283e22dc431523), [`663243220`](https://github.com/clerk/javascript/commit/6632432208aa6ca507f33fa9ab79abaa40431be6), [`ebf9be77f`](https://github.com/clerk/javascript/commit/ebf9be77f17f8880541de67f66879324f68cf6bd)]:
  - @clerk/types@4.0.0-beta.21

## 2.0.0-beta.5

### Patch Changes

- Release the latest beta changes of the `@clerk/themes` package ([#2947](https://github.com/clerk/javascript/pull/2947)) by [@anagstef](https://github.com/anagstef)

## 2.0.0-beta.4

### Patch Changes

- Rename beta-v5 to beta by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.0.0-beta-v5.3

### Major Changes

- Refresh the look and feel of the Clerk UI components ([#2622](https://github.com/clerk/javascript/pull/2622)) by [@anagstef](https://github.com/anagstef)

  For more info, refer to the [upgrade guide from v4 to v5 in Clerk docs](https://clerk.com/docs/upgrade-guides/upgrading-from-v4-to-v5).

## 2.0.0-alpha-v5.2

### Major Changes

- Upgrade React version to >=18 and add react-dom as peer dependency ([#2164](https://github.com/clerk/javascript/pull/2164)) by [@dimkl](https://github.com/dimkl)

  to fix issues with vite & rollup building.

### Patch Changes

- Rename `unstable_createTheme` to `experimental_createTheme` ([#2174](https://github.com/clerk/javascript/pull/2174)) by [@royanger](https://github.com/royanger)

## 2.0.0-alpha-v5.1

### Major Changes

- Change the minimal Node.js version required by Clerk to `18.17.0`. ([#2162](https://github.com/clerk/javascript/pull/2162)) by [@dimkl](https://github.com/dimkl)

## 2.0.0-alpha-v5.0

### Major Changes

- Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

## 1.7.9

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

## 1.7.8

### Patch Changes

- Introduces three new element appearance descriptors: ([#1803](https://github.com/clerk/javascript/pull/1803)) by [@octoper](https://github.com/octoper)
  - `tableHead` let's you customize the tables head styles.
  - `paginationButton` let's you customize the pagination buttons.
  - `paginationRowText` let's you customize the pagination text.

## 1.7.7

### Patch Changes

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

## 1.7.6

### Patch Changes

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

### [1.7.5](https://github.com/clerk/javascript/compare/@clerk/themes@1.7.5-staging.1...@clerk/themes@1.7.5) (2023-06-03)

**Note:** Version bump only for package @clerk/themes

### [1.7.4](https://github.com/clerk/javascript/compare/@clerk/themes@1.7.4-staging.0...@clerk/themes@1.7.4) (2023-05-26)

**Note:** Version bump only for package @clerk/themes

### [1.7.3](https://github.com/clerk/javascript/compare/@clerk/themes@1.7.3-staging.2...@clerk/themes@1.7.3) (2023-05-23)

**Note:** Version bump only for package @clerk/themes

### [1.7.2](https://github.com/clerk/javascript/compare/@clerk/themes@1.7.2-staging.0...@clerk/themes@1.7.2) (2023-05-18)

**Note:** Version bump only for package @clerk/themes

### [1.7.1](https://github.com/clerk/javascript/compare/@clerk/themes@1.7.1-staging.1...@clerk/themes@1.7.1) (2023-05-17)

**Note:** Version bump only for package @clerk/themes

## [1.7.0](https://github.com/clerk/javascript/compare/@clerk/themes@1.6.5-staging.3...@clerk/themes@1.7.0) (2023-05-15)

**Note:** Version bump only for package @clerk/themes

### [1.6.4](https://github.com/clerk/javascript/compare/@clerk/themes@1.6.4-staging.4...@clerk/themes@1.6.4) (2023-05-04)

**Note:** Version bump only for package @clerk/themes

### [1.6.4-staging.4](https://github.com/clerk/javascript/compare/@clerk/themes@1.6.4-staging.3...@clerk/themes@1.6.4-staging.4) (2023-05-04)

**Note:** Version bump only for package @clerk/themes

### [1.6.4-staging.3](https://github.com/clerk/javascript/compare/@clerk/themes@1.6.4-staging.2...@clerk/themes@1.6.4-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/themes

### [1.6.3](https://github.com/clerk/javascript/compare/@clerk/themes@1.6.3-staging.0...@clerk/themes@1.6.3) (2023-04-19)

**Note:** Version bump only for package @clerk/themes

### [1.6.2](https://github.com/clerk/javascript/compare/@clerk/themes@1.6.1...@clerk/themes@1.6.2) (2023-04-19)

**Note:** Version bump only for package @clerk/themes

### [1.6.1](https://github.com/clerk/javascript/compare/@clerk/themes@1.6.1-staging.0...@clerk/themes@1.6.1) (2023-04-12)

**Note:** Version bump only for package @clerk/themes

## [1.6.0](https://github.com/clerk/javascript/compare/@clerk/themes@1.6.0-staging.3...@clerk/themes@1.6.0) (2023-04-11)

**Note:** Version bump only for package @clerk/themes

### [1.5.2](https://github.com/clerk/javascript/compare/@clerk/themes@1.5.2-staging.0...@clerk/themes@1.5.2) (2023-04-06)

**Note:** Version bump only for package @clerk/themes

### [1.5.1](https://github.com/clerk/javascript/compare/@clerk/themes@1.5.1-staging.2...@clerk/themes@1.5.1) (2023-03-31)

**Note:** Version bump only for package @clerk/themes

## [1.5.0](https://github.com/clerk/javascript/compare/@clerk/themes@1.5.0-staging.0...@clerk/themes@1.5.0) (2023-03-29)

**Note:** Version bump only for package @clerk/themes

### [1.4.6](https://github.com/clerk/javascript/compare/@clerk/themes@1.4.6-staging.2...@clerk/themes@1.4.6) (2023-03-10)

**Note:** Version bump only for package @clerk/themes

### [1.4.5](https://github.com/clerk/javascript/compare/@clerk/themes@1.4.5-staging.0...@clerk/themes@1.4.5) (2023-03-09)

**Note:** Version bump only for package @clerk/themes

### [1.4.4](https://github.com/clerk/javascript/compare/@clerk/themes@1.4.4-staging.0...@clerk/themes@1.4.4) (2023-03-07)

**Note:** Version bump only for package @clerk/themes

### [1.4.3](https://github.com/clerk/javascript/compare/@clerk/themes@1.4.3-staging.1...@clerk/themes@1.4.3) (2023-03-03)

**Note:** Version bump only for package @clerk/themes

### [1.4.2](https://github.com/clerk/javascript/compare/@clerk/themes@1.4.2-staging.0...@clerk/themes@1.4.2) (2023-03-01)

**Note:** Version bump only for package @clerk/themes

### [1.4.1](https://github.com/clerk/javascript/compare/@clerk/themes@1.4.1-staging.0...@clerk/themes@1.4.1) (2023-02-25)

**Note:** Version bump only for package @clerk/themes

## [1.4.0](https://github.com/clerk/javascript/compare/@clerk/themes@1.4.0-staging.0...@clerk/themes@1.4.0) (2023-02-24)

**Note:** Version bump only for package @clerk/themes

### [1.3.5-staging.2](https://github.com/clerk/javascript/compare/@clerk/themes@1.3.5-staging.1...@clerk/themes@1.3.5-staging.2) (2023-02-22)

**Note:** Version bump only for package @clerk/themes

### [1.3.4](https://github.com/clerk/javascript/compare/@clerk/themes@1.3.4-staging.0...@clerk/themes@1.3.4) (2023-02-17)

**Note:** Version bump only for package @clerk/themes

### [1.3.3](https://github.com/clerk/javascript/compare/@clerk/themes@1.3.3-staging.1...@clerk/themes@1.3.3) (2023-02-15)

**Note:** Version bump only for package @clerk/themes

### [1.3.2](https://github.com/clerk/javascript/compare/@clerk/themes@1.3.2-staging.1...@clerk/themes@1.3.2) (2023-02-10)

**Note:** Version bump only for package @clerk/themes

### [1.3.1](https://github.com/clerk/javascript/compare/@clerk/themes@1.3.1-staging.0...@clerk/themes@1.3.1) (2023-02-07)

**Note:** Version bump only for package @clerk/themes

### [1.3.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/themes@1.3.0...@clerk/themes@1.3.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/themes

## [1.3.0](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.42-staging.1...@clerk/themes@1.3.0) (2023-02-07)

**Note:** Version bump only for package @clerk/themes

### [1.2.41](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.41-staging.0...@clerk/themes@1.2.41) (2023-02-01)

**Note:** Version bump only for package @clerk/themes

### [1.2.40](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.40-staging.3...@clerk/themes@1.2.40) (2023-01-27)

**Note:** Version bump only for package @clerk/themes

### [1.2.39](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.38...@clerk/themes@1.2.39) (2023-01-20)

**Note:** Version bump only for package @clerk/themes

### [1.2.38](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.38-staging.1...@clerk/themes@1.2.38) (2023-01-17)

**Note:** Version bump only for package @clerk/themes

### [1.2.37](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.37-staging.1...@clerk/themes@1.2.37) (2022-12-19)

**Note:** Version bump only for package @clerk/themes

### [1.2.36](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.36-staging.0...@clerk/themes@1.2.36) (2022-12-13)

**Note:** Version bump only for package @clerk/themes

### [1.2.35](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.34...@clerk/themes@1.2.35) (2022-12-12)

**Note:** Version bump only for package @clerk/themes

### [1.2.34](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.34-staging.1...@clerk/themes@1.2.34) (2022-12-09)

**Note:** Version bump only for package @clerk/themes

### [1.2.33](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.32...@clerk/themes@1.2.33) (2022-12-08)

**Note:** Version bump only for package @clerk/themes

### [1.2.32](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.32-staging.0...@clerk/themes@1.2.32) (2022-12-08)

**Note:** Version bump only for package @clerk/themes

### [1.2.31](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.31-staging.0...@clerk/themes@1.2.31) (2022-12-02)

**Note:** Version bump only for package @clerk/themes

### [1.2.30](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.30-staging.4...@clerk/themes@1.2.30) (2022-11-30)

**Note:** Version bump only for package @clerk/themes

### [1.2.30-staging.4](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.30-staging.3...@clerk/themes@1.2.30-staging.4) (2022-11-29)

**Note:** Version bump only for package @clerk/themes

### [1.2.29](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.29-staging.0...@clerk/themes@1.2.29) (2022-11-25)

**Note:** Version bump only for package @clerk/themes

### [1.2.28](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.28-staging.0...@clerk/themes@1.2.28) (2022-11-25)

**Note:** Version bump only for package @clerk/themes

### [1.2.27](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.26...@clerk/themes@1.2.27) (2022-11-23)

**Note:** Version bump only for package @clerk/themes

### [1.2.26](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.26-staging.2...@clerk/themes@1.2.26) (2022-11-22)

**Note:** Version bump only for package @clerk/themes

### [1.2.26-staging.2](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.26-staging.1...@clerk/themes@1.2.26-staging.2) (2022-11-21)

**Note:** Version bump only for package @clerk/themes

### [1.2.25](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.25-staging.1...@clerk/themes@1.2.25) (2022-11-18)

**Note:** Version bump only for package @clerk/themes

### [1.2.24](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.24-staging.2...@clerk/themes@1.2.24) (2022-11-15)

**Note:** Version bump only for package @clerk/themes

### [1.2.23](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.23-staging.1...@clerk/themes@1.2.23) (2022-11-10)

**Note:** Version bump only for package @clerk/themes

### [1.2.22](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.22-staging.2...@clerk/themes@1.2.22) (2022-11-05)

**Note:** Version bump only for package @clerk/themes

### [1.2.21](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.21-staging.7...@clerk/themes@1.2.21) (2022-11-03)

**Note:** Version bump only for package @clerk/themes

### [1.2.21-staging.4](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.21-staging.3...@clerk/themes@1.2.21-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/themes

### [1.2.21-staging.3](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.21-staging.1...@clerk/themes@1.2.21-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/themes

### [1.2.21-staging.2](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.21-staging.1...@clerk/themes@1.2.21-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/themes

### [1.2.21-staging.1](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.20...@clerk/themes@1.2.21-staging.1) (2022-11-02)

**Note:** Version bump only for package @clerk/themes

### [1.2.20](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.20-staging.0...@clerk/themes@1.2.20) (2022-10-24)

**Note:** Version bump only for package @clerk/themes

### [1.2.19](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.18...@clerk/themes@1.2.19) (2022-10-14)

**Note:** Version bump only for package @clerk/themes

### [1.2.18](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.18-staging.2...@clerk/themes@1.2.18) (2022-10-14)

**Note:** Version bump only for package @clerk/themes

### [1.2.18-staging.1](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.17...@clerk/themes@1.2.18-staging.1) (2022-10-13)

**Note:** Version bump only for package @clerk/themes

### [1.2.17](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.17-staging.0...@clerk/themes@1.2.17) (2022-10-07)

**Note:** Version bump only for package @clerk/themes

### [1.2.16](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.16-staging.0...@clerk/themes@1.2.16) (2022-10-05)

**Note:** Version bump only for package @clerk/themes

### [1.2.15](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.15-staging.3...@clerk/themes@1.2.15) (2022-10-03)

**Note:** Version bump only for package @clerk/themes

### [1.2.14](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.14-staging.4...@clerk/themes@1.2.14) (2022-09-29)

**Note:** Version bump only for package @clerk/themes

### [1.2.13](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.12...@clerk/themes@1.2.13) (2022-09-25)

**Note:** Version bump only for package @clerk/themes

### [1.2.12](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.12-staging.1...@clerk/themes@1.2.12) (2022-09-24)

**Note:** Version bump only for package @clerk/themes

### [1.2.11](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.11-staging.0...@clerk/themes@1.2.11) (2022-09-22)

**Note:** Version bump only for package @clerk/themes

### [1.2.10](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.9-staging.4...@clerk/themes@1.2.10) (2022-09-19)

**Note:** Version bump only for package @clerk/themes

### [1.2.9](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.9-staging.4...@clerk/themes@1.2.9) (2022-09-16)

**Note:** Version bump only for package @clerk/themes

### [1.2.8](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.8-staging.0...@clerk/themes@1.2.8) (2022-09-07)

**Note:** Version bump only for package @clerk/themes

### [1.2.7](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.7-staging.0...@clerk/themes@1.2.7) (2022-09-02)

**Note:** Version bump only for package @clerk/themes

### [1.2.6](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.6-staging.0...@clerk/themes@1.2.6) (2022-08-29)

**Note:** Version bump only for package @clerk/themes

### [1.2.5](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.5-staging.2...@clerk/themes@1.2.5) (2022-08-29)

**Note:** Version bump only for package @clerk/themes

### [1.2.4](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.4-staging.0...@clerk/themes@1.2.4) (2022-08-24)

**Note:** Version bump only for package @clerk/themes

### [1.2.3](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.2...@clerk/themes@1.2.3) (2022-08-18)

**Note:** Version bump only for package @clerk/themes

### [1.2.2](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.2-staging.0...@clerk/themes@1.2.2) (2022-08-18)

**Note:** Version bump only for package @clerk/themes

### [1.2.1](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.0...@clerk/themes@1.2.1) (2022-08-16)

**Note:** Version bump only for package @clerk/themes

## [1.2.0](https://github.com/clerk/javascript/compare/@clerk/themes@1.2.0-staging.0...@clerk/themes@1.2.0) (2022-08-11)

**Note:** Version bump only for package @clerk/themes

## [1.1.0](https://github.com/clerk/javascript/compare/@clerk/themes@1.1.0-staging.0...@clerk/themes@1.1.0) (2022-08-09)

**Note:** Version bump only for package @clerk/themes
