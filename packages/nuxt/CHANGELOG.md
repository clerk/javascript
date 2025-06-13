# @clerk/nuxt

## 1.7.0

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
  - @clerk/vue@1.8.7

## 1.6.9

### Patch Changes

- Updated dependencies [[`5421421`](https://github.com/clerk/javascript/commit/5421421644b5c017d58ee6583c12d6c253e29c33), [`f897773`](https://github.com/clerk/javascript/commit/f89777379da63cf45039c1570b51ba10a400817c), [`1c97fd0`](https://github.com/clerk/javascript/commit/1c97fd06b28db9fde6c14dbeb0935e13696be539), [`2c6a0cc`](https://github.com/clerk/javascript/commit/2c6a0cca6e824bafc6b0d0501784517a5b1f75ea), [`71e6a1f`](https://github.com/clerk/javascript/commit/71e6a1f1024d65b7a09cdc8fa81ce0164e0a34cb)]:
  - @clerk/backend@1.34.0
  - @clerk/shared@3.9.5
  - @clerk/types@4.59.3
  - @clerk/vue@1.8.6

## 1.6.8

### Patch Changes

- Updated dependencies [[`6ed3dfc`](https://github.com/clerk/javascript/commit/6ed3dfc1bc742ac9d9a2307fe8e4733411cbc0d7), [`22c3363`](https://github.com/clerk/javascript/commit/22c33631f7f54b4f2179bf16f548fee1a237976e), [`ac6b231`](https://github.com/clerk/javascript/commit/ac6b23147e5e0aa21690cc20a109ed9a8c8f6e5b)]:
  - @clerk/types@4.59.2
  - @clerk/backend@1.33.1
  - @clerk/shared@3.9.4
  - @clerk/vue@1.8.5

## 1.6.7

### Patch Changes

- Updated dependencies [[`ced8912`](https://github.com/clerk/javascript/commit/ced8912e8c9fb7eb7846de6ca9a872e794d9e15d), [`f237d76`](https://github.com/clerk/javascript/commit/f237d7617e5398ca0ba981e4336cac2191505b00), [`5f1375b`](https://github.com/clerk/javascript/commit/5f1375ba7cc50cccb11d5aee03bfd4c3d1bf462f)]:
  - @clerk/backend@1.33.0
  - @clerk/shared@3.9.3
  - @clerk/vue@1.8.4

## 1.6.6

### Patch Changes

- Updated dependencies [[`c305b31`](https://github.com/clerk/javascript/commit/c305b310e351e9ce2012f805b35e464c3e43e310), [`b813cbe`](https://github.com/clerk/javascript/commit/b813cbe29252ab9710f355cecd4511172aea3548), [`6bb480e`](https://github.com/clerk/javascript/commit/6bb480ef663a6dfa219bc9546aca087d5d9624d0)]:
  - @clerk/types@4.59.1
  - @clerk/backend@1.32.3
  - @clerk/shared@3.9.2
  - @clerk/vue@1.8.3

## 1.6.5

### Patch Changes

- Updated dependencies [[`b1337df`](https://github.com/clerk/javascript/commit/b1337dfeae8ccf8622efcf095e3201f9bbf1cefa), [`65f0878`](https://github.com/clerk/javascript/commit/65f08788ee5e56242eee2194c73ba90965c75c97), [`df6fefd`](https://github.com/clerk/javascript/commit/df6fefd05fd2df93f5286d97e546b48911adea7c), [`4282bfa`](https://github.com/clerk/javascript/commit/4282bfa09491225bde7d619fe9a3561062703f69), [`5491491`](https://github.com/clerk/javascript/commit/5491491711e0a8ee37828451c1f603a409de32cf)]:
  - @clerk/types@4.59.0
  - @clerk/backend@1.32.2
  - @clerk/shared@3.9.1
  - @clerk/vue@1.8.2

## 1.6.4

### Patch Changes

- Add `isSatellite` prop type in Vue and Nuxt SDKs ([#5911](https://github.com/clerk/javascript/pull/5911)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`1ff6d6e`](https://github.com/clerk/javascript/commit/1ff6d6efbe838b3f7f6977b2b5215c2cafd715f6), [`80bdc58`](https://github.com/clerk/javascript/commit/80bdc5844620414f50d53eb3096211364307dd4c), [`fbf3cf4`](https://github.com/clerk/javascript/commit/fbf3cf4916469c4e118870bf12efca2d0f77d9d8)]:
  - @clerk/shared@3.9.0
  - @clerk/types@4.58.1
  - @clerk/vue@1.8.1
  - @clerk/backend@1.32.1

## 1.6.3

### Patch Changes

- Updated dependencies [[`0769a9b`](https://github.com/clerk/javascript/commit/0769a9b4a44ec7046a3b99a3d58bddd173970990), [`0f5145e`](https://github.com/clerk/javascript/commit/0f5145e164f3d3d5faf57e58162b05e7110d2403), [`4998547`](https://github.com/clerk/javascript/commit/49985471a69cb990dec48359baa4bc2e353be6ea), [`afdfd18`](https://github.com/clerk/javascript/commit/afdfd18d645608dec37e52a291a91ba5f42dcbe7), [`b7c51ba`](https://github.com/clerk/javascript/commit/b7c51baac6df1129b468274c9a7f63ca303f16ce), [`437b53b`](https://github.com/clerk/javascript/commit/437b53b67e281d076b5b3f927e11c1d64666d154), [`5217155`](https://github.com/clerk/javascript/commit/52171554250c5c58f4f497b6d3c7416e79ac77da)]:
  - @clerk/backend@1.32.0
  - @clerk/types@4.58.0
  - @clerk/vue@1.8.0
  - @clerk/shared@3.8.2

## 1.6.2

### Patch Changes

- Updated dependencies [[`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`36fb43f`](https://github.com/clerk/javascript/commit/36fb43f8b35866bdc20680fac58020f036d30d1f), [`e5ac444`](https://github.com/clerk/javascript/commit/e5ac4447f52bb6887ad686feab308fe9daf76e33), [`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`d227805`](https://github.com/clerk/javascript/commit/d22780599a5e29545a3d8309cc411c2e8659beac)]:
  - @clerk/types@4.57.1
  - @clerk/backend@1.31.4
  - @clerk/shared@3.8.1
  - @clerk/vue@1.7.2

## 1.6.1

### Patch Changes

- Set default SDK Metadata. ([#5839](https://github.com/clerk/javascript/pull/5839)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`db0138f`](https://github.com/clerk/javascript/commit/db0138f3f72aea8cb68a5684a90123f733848f63), [`8c1f7c3`](https://github.com/clerk/javascript/commit/8c1f7c3e1ae1b55d790b74b8d1cdad09939b2748), [`aa97231`](https://github.com/clerk/javascript/commit/aa97231962e3f472a46135e376159c6ddcf1157b), [`c792f37`](https://github.com/clerk/javascript/commit/c792f37129fd6475d5af95146e9ef0f1c8eff730), [`3bf08a9`](https://github.com/clerk/javascript/commit/3bf08a9e0a9e65496edac5fc3bb22ad7b561df26), [`74cf3b2`](https://github.com/clerk/javascript/commit/74cf3b28cdf622a942aaf99caabfba74b7e856fd), [`037b113`](https://github.com/clerk/javascript/commit/037b113aaedd53d4647d88f1659eb9c14cf6f275), [`c15a412`](https://github.com/clerk/javascript/commit/c15a412169058e2304a51c9e92ffaa7f6bb2a898), [`7726a03`](https://github.com/clerk/javascript/commit/7726a03a7fec4d292b6de2587b84ed4371984c23), [`ed10566`](https://github.com/clerk/javascript/commit/ed1056637624eec5bfd50333407c1e63e34c193b), [`b846a9a`](https://github.com/clerk/javascript/commit/b846a9ab96db6b1d8344a4b693051618865508a8), [`e66c800`](https://github.com/clerk/javascript/commit/e66c8002b82b2902f77e852e16482f5cfb062d2c), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed), [`9c41091`](https://github.com/clerk/javascript/commit/9c41091eb795bce8ffeeeca0264ae841fe07b426), [`29462b4`](https://github.com/clerk/javascript/commit/29462b433eb411ce614e4768e5844cacd00c1975), [`322c43f`](https://github.com/clerk/javascript/commit/322c43f6807a932c3cfaaef1b587b472c80180d2), [`17397f9`](https://github.com/clerk/javascript/commit/17397f95b715bd4fefd7f63c1d351abcf1c8ee16), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed)]:
  - @clerk/types@4.57.0
  - @clerk/vue@1.7.1
  - @clerk/shared@3.8.0
  - @clerk/backend@1.31.3

## 1.6.0

### Minor Changes

- Introducing `<experimental_PricingTable/>` ([#5769](https://github.com/clerk/javascript/pull/5769)) by [@octoper](https://github.com/octoper)

### Patch Changes

- Updated dependencies [[`9ec0a73`](https://github.com/clerk/javascript/commit/9ec0a7353e9f6ea661c3d7b9542423b6eb1d29e9), [`d9222fc`](https://github.com/clerk/javascript/commit/d9222fc3c21da2bcae30b06f0b1897f526935582), [`56ba4e2`](https://github.com/clerk/javascript/commit/56ba4e271d6f27880486c6479bde7d392922801d)]:
  - @clerk/types@4.56.3
  - @clerk/vue@1.7.0
  - @clerk/backend@1.31.2
  - @clerk/shared@3.7.8

## 1.5.13

### Patch Changes

- Updated dependencies [[`225b9ca`](https://github.com/clerk/javascript/commit/225b9ca21aba44930872a85d6b112ee2a1b606b9)]:
  - @clerk/types@4.56.2
  - @clerk/backend@1.31.1
  - @clerk/shared@3.7.7
  - @clerk/vue@1.6.8

## 1.5.12

### Patch Changes

- Updated dependencies [[`be1c5d6`](https://github.com/clerk/javascript/commit/be1c5d67b27852303dc8148e3be514473ce3e190), [`a122121`](https://github.com/clerk/javascript/commit/a122121e4fe55148963ed85b99ff24ba02a2d170)]:
  - @clerk/backend@1.31.0

## 1.5.11

### Patch Changes

- Fix handshake redirect loop in applications deployed to Netlify with a Clerk development instance. ([#5656](https://github.com/clerk/javascript/pull/5656)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`387bf62`](https://github.com/clerk/javascript/commit/387bf623406306e0c5c08da937f4930a7ec5e4a5), [`2716622`](https://github.com/clerk/javascript/commit/27166224e12af582298460d438bd7f83ea8e04bf), [`294da82`](https://github.com/clerk/javascript/commit/294da82336e7a345900d7ef9b28f56a7c8864c52), [`4a8fe40`](https://github.com/clerk/javascript/commit/4a8fe40dc7c6335d4cf90e2532ceda2c7ad66a3b)]:
  - @clerk/types@4.56.1
  - @clerk/shared@3.7.6
  - @clerk/backend@1.30.2
  - @clerk/vue@1.6.7

## 1.5.10

### Patch Changes

- Updated dependencies [[`b02e766`](https://github.com/clerk/javascript/commit/b02e76627e47aec314573586451fa345a089115a), [`5d78b28`](https://github.com/clerk/javascript/commit/5d78b286b63e35fbcf44aac1f7657cbeaba4d659), [`d7f4438`](https://github.com/clerk/javascript/commit/d7f4438fa4bfd04474d5cdb9212ba908568ad6d2), [`5866855`](https://github.com/clerk/javascript/commit/58668550ec91d5511cf775972c54dc485185cc58), [`0007106`](https://github.com/clerk/javascript/commit/00071065998a3676c51e396b4c0afcbf930a9898), [`462b5b2`](https://github.com/clerk/javascript/commit/462b5b271d4e120d58a85818a358b60a6b3c8100), [`447d7a9`](https://github.com/clerk/javascript/commit/447d7a9e133c2a0e7db014bd5837e6ffff08f572), [`2beea29`](https://github.com/clerk/javascript/commit/2beea2957c67bc62446fe24d36332b0a4e850d7d), [`115601d`](https://github.com/clerk/javascript/commit/115601d12fd65dbf3011c0cda368525a2b95bfeb)]:
  - @clerk/types@4.56.0
  - @clerk/backend@1.30.1
  - @clerk/shared@3.7.5
  - @clerk/vue@1.6.6

## 1.5.9

### Patch Changes

- Updated dependencies [[`ba19465`](https://github.com/clerk/javascript/commit/ba194654b15d326bf0ab1b2bf0cab608042d20ec), [`8b25035`](https://github.com/clerk/javascript/commit/8b25035aa49382fe1cd1c6f30ec80e86bcf9d66e)]:
  - @clerk/backend@1.30.0
  - @clerk/types@4.55.1
  - @clerk/shared@3.7.4
  - @clerk/vue@1.6.5

## 1.5.8

### Patch Changes

- Updated dependencies [[`33201bf`](https://github.com/clerk/javascript/commit/33201bf972d6a980617d47ebd776bef76f871833), [`4334598`](https://github.com/clerk/javascript/commit/4334598108ff2cfa3c25b5a46117c1c9c65b7974), [`0ae0403`](https://github.com/clerk/javascript/commit/0ae040303d239b75a3221436354a2c2ecdb85aae)]:
  - @clerk/types@4.55.0
  - @clerk/backend@1.29.2
  - @clerk/shared@3.7.3
  - @clerk/vue@1.6.4

## 1.5.7

### Patch Changes

- Updated dependencies [[`45486ac`](https://github.com/clerk/javascript/commit/45486acebf4d133efb09a3622a738cdbf4e51d66), [`837692a`](https://github.com/clerk/javascript/commit/837692aa40197b1574783ad36d0d017a771c08e1), [`0c00e59`](https://github.com/clerk/javascript/commit/0c00e59ff4714491650ac9480ae3b327c626d30d), [`6a5f644`](https://github.com/clerk/javascript/commit/6a5f6447a36a635d6201f8bb7619fb844ab21b79)]:
  - @clerk/types@4.54.2
  - @clerk/backend@1.29.1
  - @clerk/shared@3.7.2
  - @clerk/vue@1.6.3

## 1.5.6

### Patch Changes

- Updated dependencies [[`ab939fd`](https://github.com/clerk/javascript/commit/ab939fdb29150c376280b42f861a188a33f57dcc), [`03284da`](https://github.com/clerk/javascript/commit/03284da6a93a790ce3e3ebbd871c06e19f5a8803), [`7389ba3`](https://github.com/clerk/javascript/commit/7389ba3164ca0d848fb0a9de5d7e9716925fadcc), [`00f16e4`](https://github.com/clerk/javascript/commit/00f16e4c62fc9e965c352a4fd199c7fad8704f79), [`bb35660`](https://github.com/clerk/javascript/commit/bb35660884d04c8a426790ed439592e33434c87f), [`efb5d8c`](https://github.com/clerk/javascript/commit/efb5d8c03b14f6c2b5ecaed55a09869abe76ebbc), [`c2712e7`](https://github.com/clerk/javascript/commit/c2712e7f288271c022b5586b8b4718f57c9b6007), [`aa93f7f`](https://github.com/clerk/javascript/commit/aa93f7f94b5e146eb7166244f7e667213fa210ca), [`a7f3ebc`](https://github.com/clerk/javascript/commit/a7f3ebc63adbab274497ca24279862d2788423c7), [`d3fa403`](https://github.com/clerk/javascript/commit/d3fa4036b7768134131c008c087a90a841f225e5), [`f6ef841`](https://github.com/clerk/javascript/commit/f6ef841125ff21ca8cae731d1f47f3a101d887e1), [`6cba4e2`](https://github.com/clerk/javascript/commit/6cba4e28e904779dd448a7c29d761fcf53465dbf), [`fb6aa20`](https://github.com/clerk/javascript/commit/fb6aa20abe1c0c8579ba8f07343474f915bc22c6), [`e634830`](https://github.com/clerk/javascript/commit/e6348301ab56a7868f24c1b9a4dd9e1d60f6027b), [`f8887b2`](https://github.com/clerk/javascript/commit/f8887b2cbd145e8e49bec890e8b6e02e34178d6a)]:
  - @clerk/types@4.54.1
  - @clerk/backend@1.29.0
  - @clerk/shared@3.7.1
  - @clerk/vue@1.6.2

## 1.5.5

### Patch Changes

- Updated dependencies [[`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`950ffed`](https://github.com/clerk/javascript/commit/950ffedd5ce93678274c721400fc7464bb1e2f99), [`d3e6c32`](https://github.com/clerk/javascript/commit/d3e6c32864487bb9c4dec361866ec2cd427b7cd0), [`e4d04ae`](https://github.com/clerk/javascript/commit/e4d04aea490ab67e3431729398d3f4c46fc3e7e7), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`93068ea`](https://github.com/clerk/javascript/commit/93068ea9eb19d8c8b9c7ade35d0cd860e08049fc), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`103bc03`](https://github.com/clerk/javascript/commit/103bc03571c8845df205f4c6fd0c871c3368d1d0), [`a0cc247`](https://github.com/clerk/javascript/commit/a0cc24764cc2229abae97f7c9183b413609febc7), [`85ed003`](https://github.com/clerk/javascript/commit/85ed003e65802ac02d69d7b671848938c9816c45), [`48438b4`](https://github.com/clerk/javascript/commit/48438b409036088701bda7e1e732d6a51bee8cdc), [`e60e3aa`](https://github.com/clerk/javascript/commit/e60e3aa41630b987b6a481643caf67d70584f2e1), [`65712dc`](https://github.com/clerk/javascript/commit/65712dccb3f3f2bc6028e53406e3f7f31622e961), [`9ee0531`](https://github.com/clerk/javascript/commit/9ee0531c81d1bb260ec0f87130d8394d7825b6d4), [`78d22d4`](https://github.com/clerk/javascript/commit/78d22d443446ac1c0d30b1b93aaf5cddde75a9a3), [`196dcb4`](https://github.com/clerk/javascript/commit/196dcb47928bd22a3382197f8594a590f688faee)]:
  - @clerk/backend@1.28.0
  - @clerk/types@4.54.0
  - @clerk/shared@3.7.0
  - @clerk/vue@1.6.1

## 1.5.4

### Patch Changes

- Updated dependencies [[`70c9db9`](https://github.com/clerk/javascript/commit/70c9db9f3b51ba034f76e0cc4cf338e7b406d9b1), [`554242e`](https://github.com/clerk/javascript/commit/554242e16e50c92a6afb6ed74c681b04b9f113b5), [`b422156`](https://github.com/clerk/javascript/commit/b4221566aa88c130ff3e870e5030598f63371803), [`cc1f9a0`](https://github.com/clerk/javascript/commit/cc1f9a0adb7771b615b0f2994a5ac571b59889dd), [`8186cb5`](https://github.com/clerk/javascript/commit/8186cb564575ac3ce97079ec203865bf5deb05ee)]:
  - @clerk/backend@1.27.3
  - @clerk/shared@3.6.0
  - @clerk/types@4.53.0
  - @clerk/vue@1.6.0

## 1.5.3

### Patch Changes

- Updated dependencies [[`3ad3bc8`](https://github.com/clerk/javascript/commit/3ad3bc8380b354b0cd952eb58eb6c07650efa0f2), [`3ad3bc8`](https://github.com/clerk/javascript/commit/3ad3bc8380b354b0cd952eb58eb6c07650efa0f2), [`cfa94b8`](https://github.com/clerk/javascript/commit/cfa94b88476608edf8c2486e8ec0d3f3f82e0bfb), [`2033919`](https://github.com/clerk/javascript/commit/203391964857b98dae11944799d1e6328439e838), [`1b34bcb`](https://github.com/clerk/javascript/commit/1b34bcb17e1a7f22644c0ea073857c528a8f81b7), [`5f3cc46`](https://github.com/clerk/javascript/commit/5f3cc460b6b775b5a74746758b8cff11649a877a)]:
  - @clerk/shared@3.5.0
  - @clerk/types@4.52.0
  - @clerk/backend@1.27.2
  - @clerk/vue@1.5.2

## 1.5.2

### Patch Changes

- Updated dependencies [[`f6f275d`](https://github.com/clerk/javascript/commit/f6f275dac5ae83ac0c2016a85a6a0cee9513f224)]:
  - @clerk/backend@1.27.1
  - @clerk/types@4.51.1
  - @clerk/shared@3.4.1
  - @clerk/vue@1.5.1

## 1.5.1

### Patch Changes

- Updated dependencies [[`a8180ce`](https://github.com/clerk/javascript/commit/a8180ceef447a13d84eac6a64ed7a04d791d8d64), [`e1ec52b`](https://github.com/clerk/javascript/commit/e1ec52b93038c9cb24e030dc06e53825a384a480), [`6112420`](https://github.com/clerk/javascript/commit/6112420889f1577fb16d7bfa706aaffe1090093d), [`bebb6d8`](https://github.com/clerk/javascript/commit/bebb6d8af66b2bb7a4b3bdf96f9d480e65b31ba2), [`d0d5203`](https://github.com/clerk/javascript/commit/d0d5203e4ee9e2e1bed5c00ef0f87f0130f1d298), [`6112420`](https://github.com/clerk/javascript/commit/6112420889f1577fb16d7bfa706aaffe1090093d), [`2cceeba`](https://github.com/clerk/javascript/commit/2cceeba177ecf5a28138da308cbba18015e3a646), [`026ad57`](https://github.com/clerk/javascript/commit/026ad5717cf661182c219fb0ffab4522083065c3), [`9b25e31`](https://github.com/clerk/javascript/commit/9b25e311cf5e15f896c7948faa42ace45df364c5)]:
  - @clerk/vue@1.5.0
  - @clerk/types@4.51.0
  - @clerk/backend@1.27.0
  - @clerk/shared@3.4.0

## 1.5.0

### Minor Changes

- Deprecate `event.context.auth` in favor of `event.context.auth()` as function ([#5513](https://github.com/clerk/javascript/pull/5513)) by [@LauraBeatris](https://github.com/LauraBeatris)

  ```diff
  export default clerkMiddleware((event) => {
  + const { userId } = event.context.auth()
  - const { userId } = event.context.auth
    const isAdminRoute = event.path.startsWith('/api/admin')

    if (!userId && isAdminRoute) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: User not signed in',
      })
    }
  })
  ```

- Introduce a `verifyWebhook()` function to verify incoming Clerk webhook requests and process the payload. This function handles webhook signature verification using `Svix` and is now available across all backend and fullstack SDKs. ([#5468](https://github.com/clerk/javascript/pull/5468)) by [@wobsoriano](https://github.com/wobsoriano)

  To get started, install [`svix`](https://www.npmjs.com/package/svix), which Clerk uses to verify its webhooks:

  ```shell
  npm install svix
  ```

  Then in your webhook route handler, import `verifyWebhook()` from the Nuxt SDK:

  ```ts
  // server/api/webhooks.post.ts
  import { verifyWebhook } from '@clerk/nuxt/webhooks';

  export default eventHandler(async event => {
    try {
      const evt = await verifyWebhook(event);

      // Do something with payload
      const { id } = evt.data;
      const eventType = evt.type;
      console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
      console.log('Webhook payload:', body);

      return 'Webhook received';
    } catch (err) {
      console.error('Error: Could not verify webhook:', err);
      setResponseStatus(event, 400);
      return 'Error: Verification error';
    }
  });
  ```

  For more information on how to sync Clerk data to your app with webhooks, [see our guide](https://clerk.com/docs/webhooks/sync-data).

### Patch Changes

- Remove telemtry event from `clerkMiddleware()`. ([#5501](https://github.com/clerk/javascript/pull/5501)) by [@brkalow](https://github.com/brkalow)

- Updated dependencies [[`60a9a51`](https://github.com/clerk/javascript/commit/60a9a51dff7d59e7397536586cf1cfe029bc021b), [`e984494`](https://github.com/clerk/javascript/commit/e984494416dda9a6f04acaaba61f8c2683090961), [`cd6ee92`](https://github.com/clerk/javascript/commit/cd6ee92d5b427ca548216f429ca4e31c6acd263c), [`ec4521b`](https://github.com/clerk/javascript/commit/ec4521b4fe56602f524a0c6d1b09d21aef5d8bd0), [`38828ae`](https://github.com/clerk/javascript/commit/38828ae58d6d4e8e3c60945284930179b2b6bb40), [`f30fa75`](https://github.com/clerk/javascript/commit/f30fa750754f19030f932a666d2bdbdf0d86743d), [`9c68678`](https://github.com/clerk/javascript/commit/9c68678e87047e6312b708b775ebfb23a3e22f8a), [`fe065a9`](https://github.com/clerk/javascript/commit/fe065a934c583174ad4c140e04dedbe6d88fc3a0), [`619cde8`](https://github.com/clerk/javascript/commit/619cde8c532d635d910ebbc08ad6abcc025694b4)]:
  - @clerk/backend@1.26.0
  - @clerk/shared@3.3.0
  - @clerk/types@4.50.2
  - @clerk/vue@1.4.6

## 1.4.6

### Patch Changes

- Updated dependencies [[`e20fb6b`](https://github.com/clerk/javascript/commit/e20fb6b397fb69c9d5af4e321267b82f12a5f127), [`77e6462`](https://github.com/clerk/javascript/commit/77e64628560cab688af214edb5922e67cd68a951)]:
  - @clerk/shared@3.2.3
  - @clerk/types@4.50.1
  - @clerk/backend@1.25.8
  - @clerk/vue@1.4.5

## 1.4.5

### Patch Changes

- Improved type-safety in Vue plugin installation. ([#5458](https://github.com/clerk/javascript/pull/5458)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`1da28a2`](https://github.com/clerk/javascript/commit/1da28a28bf602069b433c15b92df21f682779294), [`7babfb2`](https://github.com/clerk/javascript/commit/7babfb2e620e6f581a92b526b58d05e6b20acca0), [`a9b618d`](https://github.com/clerk/javascript/commit/a9b618dfa97a0dacc462186c8b2588ad5ddb6902), [`f20dc15`](https://github.com/clerk/javascript/commit/f20dc159f542449e7f5b437b70d3eb3ba04d6975), [`4d9f1ee`](https://github.com/clerk/javascript/commit/4d9f1ee8c22fe1e4a166ff054d0af4d37b829f0a)]:
  - @clerk/types@4.50.0
  - @clerk/vue@1.4.4
  - @clerk/shared@3.2.2
  - @clerk/backend@1.25.7

## 1.4.4

### Patch Changes

- Updated dependencies [[`27d66a5`](https://github.com/clerk/javascript/commit/27d66a5b252afd18a3491b2746ef2f2f05632f2a), [`466ed13`](https://github.com/clerk/javascript/commit/466ed136af73b59b267d92ad3296039d1c3a4fcc)]:
  - @clerk/backend@1.25.6
  - @clerk/types@4.49.2
  - @clerk/shared@3.2.1
  - @clerk/vue@1.4.3

## 1.4.3

### Patch Changes

- Updated dependencies [[`892bc0e`](https://github.com/clerk/javascript/commit/892bc0eee9e0bb04d327eb84b44201fa34806483), [`892bc0e`](https://github.com/clerk/javascript/commit/892bc0eee9e0bb04d327eb84b44201fa34806483)]:
  - @clerk/backend@1.25.5
  - @clerk/shared@3.2.0
  - @clerk/vue@1.4.2

## 1.4.2

### Patch Changes

- Updated dependencies [[`facefaf`](https://github.com/clerk/javascript/commit/facefafdaf6d602de0acee9218c66c61a0a9ba24), [`3910ebe`](https://github.com/clerk/javascript/commit/3910ebea85817273f18fd2f3f142dd1c728e2220), [`e513333`](https://github.com/clerk/javascript/commit/e5133330a196c5c3742634cc9c3d3233ff488b0d)]:
  - @clerk/backend@1.25.4
  - @clerk/types@4.49.1
  - @clerk/shared@3.1.0
  - @clerk/vue@1.4.1

## 1.4.1

### Patch Changes

- Updated dependencies [[`725918d`](https://github.com/clerk/javascript/commit/725918df2e74cea15e9b748aaf103a52df8e8500), [`10247ba`](https://github.com/clerk/javascript/commit/10247ba2d08d98d6c440b254a4b786f4f1e8967a), [`91d0f0b`](https://github.com/clerk/javascript/commit/91d0f0b0dccab7168ad4dc06c8629808938c235f), [`9572bf5`](https://github.com/clerk/javascript/commit/9572bf5bdfb7dc309ec8714989b98ab12174965b), [`39bbc51`](https://github.com/clerk/javascript/commit/39bbc5189a33dc6cebdc269ac2184dc4ffff2534), [`ba2b00c`](https://github.com/clerk/javascript/commit/ba2b00c83fd4a4ffc59d2bb60f5402466650ab94), [`3dddcda`](https://github.com/clerk/javascript/commit/3dddcda191d8f8d6a9b02464f1f6374d3c6aacb9), [`7524943`](https://github.com/clerk/javascript/commit/7524943300d7e693d61cc1820b520abfadec1c64), [`150b5c8`](https://github.com/clerk/javascript/commit/150b5c89477abb0feab15e0a886179473f653cac), [`23c931e`](https://github.com/clerk/javascript/commit/23c931e9e95e6de992549ad499b477aca9a9c344), [`730262f`](https://github.com/clerk/javascript/commit/730262f0f973923c8749b09078c80c2fc966a8ec), [`5601a15`](https://github.com/clerk/javascript/commit/5601a15e69a7d5e2496dcd82541ca3e6d73b0a3f), [`0b18bb1`](https://github.com/clerk/javascript/commit/0b18bb1fe6fa3ded97547bb6b4d2c73030aad329), [`021bc5f`](https://github.com/clerk/javascript/commit/021bc5f40044d34e49956ce3c9b61d833d815b42), [`1a61390`](https://github.com/clerk/javascript/commit/1a61390d3482bd4af58508b972ad89dea56fa224)]:
  - @clerk/types@4.49.0
  - @clerk/backend@1.25.3
  - @clerk/vue@1.4.0
  - @clerk/shared@3.0.2

## 1.4.0

### Minor Changes

- Bump `@nuxt/*` dependencies to 3.16.0 and add proper typing for `event.context.auth` object in event handlers ([#5300](https://github.com/clerk/javascript/pull/5300)) by [@wobsoriano](https://github.com/wobsoriano)

  ```ts
  export default eventHandler(event => {
    const { userId } = event.context.auth; // auth is now typed

    // ...

    return { userId };
  });
  ```

### Patch Changes

- Updated dependencies [[`8182f6711e25cc4a78baa95b023a4158280b31e8`](https://github.com/clerk/javascript/commit/8182f6711e25cc4a78baa95b023a4158280b31e8), [`75879672c5805bfba1caca906ac0729497744164`](https://github.com/clerk/javascript/commit/75879672c5805bfba1caca906ac0729497744164), [`7ec95a7e59033600958aca4b86f3bcd5da947dec`](https://github.com/clerk/javascript/commit/7ec95a7e59033600958aca4b86f3bcd5da947dec), [`3c225d90227141dc62d955e76c7f8e0202524bc7`](https://github.com/clerk/javascript/commit/3c225d90227141dc62d955e76c7f8e0202524bc7), [`2a66c16af08573000bb619607346ac420cd4ce56`](https://github.com/clerk/javascript/commit/2a66c16af08573000bb619607346ac420cd4ce56)]:
  - @clerk/backend@1.25.2
  - @clerk/shared@3.0.1
  - @clerk/types@4.48.0
  - @clerk/vue@1.3.1

## 1.3.2

### Patch Changes

- Updated dependencies [[`67f1743aa1e0705d89ee6b532007f2686929240b`](https://github.com/clerk/javascript/commit/67f1743aa1e0705d89ee6b532007f2686929240b)]:
  - @clerk/backend@1.25.1

## 1.3.1

### Patch Changes

- Updated dependencies [[`4fa5e27e33d229492c77e06ca4b26d552ff3d92f`](https://github.com/clerk/javascript/commit/4fa5e27e33d229492c77e06ca4b26d552ff3d92f), [`29a44b0e5c551e52915f284545699010a87e1a48`](https://github.com/clerk/javascript/commit/29a44b0e5c551e52915f284545699010a87e1a48), [`4d7761a24af5390489653923165e55cbf69a8a6d`](https://github.com/clerk/javascript/commit/4d7761a24af5390489653923165e55cbf69a8a6d)]:
  - @clerk/backend@1.25.0

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

### Patch Changes

- Fixes an issue where duplicated imports caused warnings in the console. ([#5227](https://github.com/clerk/javascript/pull/5227)) by [@wobsoriano](https://github.com/wobsoriano)

- The [`exports` map](https://nodejs.org/api/packages.html#conditional-exports) inside `package.json` has been slightly adjusted to allow for [`require(esm)`](https://joyeecheung.github.io/blog/2024/03/18/require-esm-in-node-js/) to work correctly. The `"import"` conditions have been changed to `"default"`. ([#5188](https://github.com/clerk/javascript/pull/5188)) by [@LekoArts](https://github.com/LekoArts)

  You shouldn't see any change in behavior/functionality on your end.

- Updated dependencies [[`54a3b5b7fbdbbf3655ccabf10370313728d4d7be`](https://github.com/clerk/javascript/commit/54a3b5b7fbdbbf3655ccabf10370313728d4d7be), [`28179323d9891bd13625e32c5682a3276e73cdae`](https://github.com/clerk/javascript/commit/28179323d9891bd13625e32c5682a3276e73cdae), [`7ae77b74326e378bf161e29886ee82e1556d9840`](https://github.com/clerk/javascript/commit/7ae77b74326e378bf161e29886ee82e1556d9840), [`c5c246ce91c01db9f1eaccbd354f646bcd24ec0a`](https://github.com/clerk/javascript/commit/c5c246ce91c01db9f1eaccbd354f646bcd24ec0a), [`de89c4fb319c0a86a6785b344969f542723229f9`](https://github.com/clerk/javascript/commit/de89c4fb319c0a86a6785b344969f542723229f9), [`bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a`](https://github.com/clerk/javascript/commit/bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a), [`382c30240f563e58bc4d4832557c6825da40ce7f`](https://github.com/clerk/javascript/commit/382c30240f563e58bc4d4832557c6825da40ce7f)]:
  - @clerk/vue@1.3.0
  - @clerk/types@4.47.0
  - @clerk/shared@3.0.0
  - @clerk/backend@1.24.3

## 1.2.0

### Minor Changes

- Introduce `getAuth()` helper to retrieve authentication state from the [event](https://h3.unjs.io/guide/event) object. ([#5158](https://github.com/clerk/javascript/pull/5158)) by [@wobsoriano](https://github.com/wobsoriano)

  Example:

  ```ts
  import { getAuth } from '@clerk/nuxt/server';

  export default eventHandler(event => {
    const { userId } = getAuth(event);

    if (!userId) {
      // User is not authenticated
    }
  });
  ```

### Patch Changes

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

- Updated dependencies [[`d76c4699990b8477745c2584b1b98d5c92f9ace6`](https://github.com/clerk/javascript/commit/d76c4699990b8477745c2584b1b98d5c92f9ace6), [`a9b0087fca3f427f65907b358d9b5bc0c95921d8`](https://github.com/clerk/javascript/commit/a9b0087fca3f427f65907b358d9b5bc0c95921d8), [`92d17d7c087470b262fa5407cb6720fe6b17d333`](https://github.com/clerk/javascript/commit/92d17d7c087470b262fa5407cb6720fe6b17d333), [`62200fad4431d625fcb4bf2a521e4650eb615381`](https://github.com/clerk/javascript/commit/62200fad4431d625fcb4bf2a521e4650eb615381)]:
  - @clerk/shared@2.22.0
  - @clerk/types@4.46.1
  - @clerk/vue@1.2.1
  - @clerk/backend@1.24.2

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
