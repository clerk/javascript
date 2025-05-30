# @clerk/astro

## 2.8.2

### Patch Changes

- Updated dependencies [[`5421421`](https://github.com/clerk/javascript/commit/5421421644b5c017d58ee6583c12d6c253e29c33), [`f897773`](https://github.com/clerk/javascript/commit/f89777379da63cf45039c1570b51ba10a400817c), [`1c97fd0`](https://github.com/clerk/javascript/commit/1c97fd06b28db9fde6c14dbeb0935e13696be539), [`2c6a0cc`](https://github.com/clerk/javascript/commit/2c6a0cca6e824bafc6b0d0501784517a5b1f75ea), [`71e6a1f`](https://github.com/clerk/javascript/commit/71e6a1f1024d65b7a09cdc8fa81ce0164e0a34cb)]:
  - @clerk/backend@1.34.0
  - @clerk/shared@3.9.5
  - @clerk/types@4.59.3

## 2.8.1

### Patch Changes

- Updated dependencies [[`6ed3dfc`](https://github.com/clerk/javascript/commit/6ed3dfc1bc742ac9d9a2307fe8e4733411cbc0d7), [`22c3363`](https://github.com/clerk/javascript/commit/22c33631f7f54b4f2179bf16f548fee1a237976e), [`ac6b231`](https://github.com/clerk/javascript/commit/ac6b23147e5e0aa21690cc20a109ed9a8c8f6e5b)]:
  - @clerk/types@4.59.2
  - @clerk/backend@1.33.1
  - @clerk/shared@3.9.4

## 2.8.0

### Minor Changes

- Introduce `treatPendingAsSignedOut` option to `getAuth` and `auth` from `clerkMiddleware` ([#5757](https://github.com/clerk/javascript/pull/5757)) by [@LauraBeatris](https://github.com/LauraBeatris)

  By default, `treatPendingAsSignedOut` is set to `true`, which means pending sessions are treated as signed-out. You can set this option to `false` to treat pending sessions as authenticated.

  ```ts
  // `pending` sessions will be treated as signed-out by default
  const { userId } = getAuth(req, locals);
  ```

  ```ts
  // Both `active` and `pending` sessions will be treated as authenticated when `treatPendingAsSignedOut` is false
  const { userId } = getAuth(req, locals, { treatPendingAsSignedOut: false });
  ```

  ```ts
  clerkMiddleware((auth, context) => {
    const { redirectToSignIn, userId } = auth({ treatPendingAsSignedOut: false });

    // Both `active` and `pending` sessions will be treated as authenticated when `treatPendingAsSignedOut` is false
    if (!userId && isProtectedRoute(context.request)) {
      return redirectToSignIn();
    }
  });
  ```

### Patch Changes

- Updated dependencies [[`ced8912`](https://github.com/clerk/javascript/commit/ced8912e8c9fb7eb7846de6ca9a872e794d9e15d), [`f237d76`](https://github.com/clerk/javascript/commit/f237d7617e5398ca0ba981e4336cac2191505b00), [`5f1375b`](https://github.com/clerk/javascript/commit/5f1375ba7cc50cccb11d5aee03bfd4c3d1bf462f)]:
  - @clerk/backend@1.33.0
  - @clerk/shared@3.9.3

## 2.7.5

### Patch Changes

- Updated dependencies [[`c305b31`](https://github.com/clerk/javascript/commit/c305b310e351e9ce2012f805b35e464c3e43e310), [`b813cbe`](https://github.com/clerk/javascript/commit/b813cbe29252ab9710f355cecd4511172aea3548), [`6bb480e`](https://github.com/clerk/javascript/commit/6bb480ef663a6dfa219bc9546aca087d5d9624d0)]:
  - @clerk/types@4.59.1
  - @clerk/backend@1.32.3
  - @clerk/shared@3.9.2

## 2.7.4

### Patch Changes

- Updated dependencies [[`b1337df`](https://github.com/clerk/javascript/commit/b1337dfeae8ccf8622efcf095e3201f9bbf1cefa), [`65f0878`](https://github.com/clerk/javascript/commit/65f08788ee5e56242eee2194c73ba90965c75c97), [`df6fefd`](https://github.com/clerk/javascript/commit/df6fefd05fd2df93f5286d97e546b48911adea7c), [`4282bfa`](https://github.com/clerk/javascript/commit/4282bfa09491225bde7d619fe9a3561062703f69), [`5491491`](https://github.com/clerk/javascript/commit/5491491711e0a8ee37828451c1f603a409de32cf)]:
  - @clerk/types@4.59.0
  - @clerk/backend@1.32.2
  - @clerk/shared@3.9.1

## 2.7.3

### Patch Changes

- Updated dependencies [[`1ff6d6e`](https://github.com/clerk/javascript/commit/1ff6d6efbe838b3f7f6977b2b5215c2cafd715f6), [`fbf3cf4`](https://github.com/clerk/javascript/commit/fbf3cf4916469c4e118870bf12efca2d0f77d9d8)]:
  - @clerk/shared@3.9.0
  - @clerk/types@4.58.1
  - @clerk/backend@1.32.1

## 2.7.2

### Patch Changes

- Export `<CreateOrganization />` Astro component ([#5876](https://github.com/clerk/javascript/pull/5876)) by [@wobsoriano](https://github.com/wobsoriano)

  Usage:

  ```astro
  ---
  import { CreateOrganization } from '@clerk/astro/components'
  ---

  <CreateOrganization />
  ```

- Updated dependencies [[`0769a9b`](https://github.com/clerk/javascript/commit/0769a9b4a44ec7046a3b99a3d58bddd173970990), [`0f5145e`](https://github.com/clerk/javascript/commit/0f5145e164f3d3d5faf57e58162b05e7110d2403), [`afdfd18`](https://github.com/clerk/javascript/commit/afdfd18d645608dec37e52a291a91ba5f42dcbe7), [`b7c51ba`](https://github.com/clerk/javascript/commit/b7c51baac6df1129b468274c9a7f63ca303f16ce), [`437b53b`](https://github.com/clerk/javascript/commit/437b53b67e281d076b5b3f927e11c1d64666d154), [`5217155`](https://github.com/clerk/javascript/commit/52171554250c5c58f4f497b6d3c7416e79ac77da)]:
  - @clerk/backend@1.32.0
  - @clerk/types@4.58.0
  - @clerk/shared@3.8.2

## 2.7.1

### Patch Changes

- Updated dependencies [[`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`36fb43f`](https://github.com/clerk/javascript/commit/36fb43f8b35866bdc20680fac58020f036d30d1f), [`e5ac444`](https://github.com/clerk/javascript/commit/e5ac4447f52bb6887ad686feab308fe9daf76e33), [`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`d227805`](https://github.com/clerk/javascript/commit/d22780599a5e29545a3d8309cc411c2e8659beac)]:
  - @clerk/types@4.57.1
  - @clerk/backend@1.31.4
  - @clerk/shared@3.8.1

## 2.7.0

### Minor Changes

- Add `<PricingTable />` component to the SDK. Learn more about it in the [Clerk Billing guide](https://clerk.com/docs/billing/overview). ([#5774](https://github.com/clerk/javascript/pull/5774)) by [@octoper](https://github.com/octoper)

### Patch Changes

- Updated dependencies [[`db0138f`](https://github.com/clerk/javascript/commit/db0138f3f72aea8cb68a5684a90123f733848f63), [`aa97231`](https://github.com/clerk/javascript/commit/aa97231962e3f472a46135e376159c6ddcf1157b), [`c792f37`](https://github.com/clerk/javascript/commit/c792f37129fd6475d5af95146e9ef0f1c8eff730), [`3bf08a9`](https://github.com/clerk/javascript/commit/3bf08a9e0a9e65496edac5fc3bb22ad7b561df26), [`74cf3b2`](https://github.com/clerk/javascript/commit/74cf3b28cdf622a942aaf99caabfba74b7e856fd), [`037b113`](https://github.com/clerk/javascript/commit/037b113aaedd53d4647d88f1659eb9c14cf6f275), [`c15a412`](https://github.com/clerk/javascript/commit/c15a412169058e2304a51c9e92ffaa7f6bb2a898), [`7726a03`](https://github.com/clerk/javascript/commit/7726a03a7fec4d292b6de2587b84ed4371984c23), [`ed10566`](https://github.com/clerk/javascript/commit/ed1056637624eec5bfd50333407c1e63e34c193b), [`b846a9a`](https://github.com/clerk/javascript/commit/b846a9ab96db6b1d8344a4b693051618865508a8), [`e66c800`](https://github.com/clerk/javascript/commit/e66c8002b82b2902f77e852e16482f5cfb062d2c), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed), [`9c41091`](https://github.com/clerk/javascript/commit/9c41091eb795bce8ffeeeca0264ae841fe07b426), [`29462b4`](https://github.com/clerk/javascript/commit/29462b433eb411ce614e4768e5844cacd00c1975), [`322c43f`](https://github.com/clerk/javascript/commit/322c43f6807a932c3cfaaef1b587b472c80180d2), [`17397f9`](https://github.com/clerk/javascript/commit/17397f95b715bd4fefd7f63c1d351abcf1c8ee16), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed)]:
  - @clerk/types@4.57.0
  - @clerk/shared@3.8.0
  - @clerk/backend@1.31.3

## 2.6.13

### Patch Changes

- Updated dependencies [[`9ec0a73`](https://github.com/clerk/javascript/commit/9ec0a7353e9f6ea661c3d7b9542423b6eb1d29e9), [`d9222fc`](https://github.com/clerk/javascript/commit/d9222fc3c21da2bcae30b06f0b1897f526935582)]:
  - @clerk/types@4.56.3
  - @clerk/backend@1.31.2
  - @clerk/shared@3.7.8

## 2.6.12

### Patch Changes

- Updated dependencies [[`225b9ca`](https://github.com/clerk/javascript/commit/225b9ca21aba44930872a85d6b112ee2a1b606b9)]:
  - @clerk/types@4.56.2
  - @clerk/backend@1.31.1
  - @clerk/shared@3.7.7

## 2.6.11

### Patch Changes

- Updated dependencies [[`be1c5d6`](https://github.com/clerk/javascript/commit/be1c5d67b27852303dc8148e3be514473ce3e190), [`a122121`](https://github.com/clerk/javascript/commit/a122121e4fe55148963ed85b99ff24ba02a2d170)]:
  - @clerk/backend@1.31.0

## 2.6.10

### Patch Changes

- Fix handshake redirect loop in applications deployed to Netlify with a Clerk development instance. ([#5656](https://github.com/clerk/javascript/pull/5656)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`387bf62`](https://github.com/clerk/javascript/commit/387bf623406306e0c5c08da937f4930a7ec5e4a5), [`2716622`](https://github.com/clerk/javascript/commit/27166224e12af582298460d438bd7f83ea8e04bf), [`294da82`](https://github.com/clerk/javascript/commit/294da82336e7a345900d7ef9b28f56a7c8864c52), [`4a8fe40`](https://github.com/clerk/javascript/commit/4a8fe40dc7c6335d4cf90e2532ceda2c7ad66a3b)]:
  - @clerk/types@4.56.1
  - @clerk/shared@3.7.6
  - @clerk/backend@1.30.2

## 2.6.9

### Patch Changes

- Updated dependencies [[`b02e766`](https://github.com/clerk/javascript/commit/b02e76627e47aec314573586451fa345a089115a), [`5d78b28`](https://github.com/clerk/javascript/commit/5d78b286b63e35fbcf44aac1f7657cbeaba4d659), [`d7f4438`](https://github.com/clerk/javascript/commit/d7f4438fa4bfd04474d5cdb9212ba908568ad6d2), [`5866855`](https://github.com/clerk/javascript/commit/58668550ec91d5511cf775972c54dc485185cc58), [`0007106`](https://github.com/clerk/javascript/commit/00071065998a3676c51e396b4c0afcbf930a9898), [`462b5b2`](https://github.com/clerk/javascript/commit/462b5b271d4e120d58a85818a358b60a6b3c8100), [`447d7a9`](https://github.com/clerk/javascript/commit/447d7a9e133c2a0e7db014bd5837e6ffff08f572), [`2beea29`](https://github.com/clerk/javascript/commit/2beea2957c67bc62446fe24d36332b0a4e850d7d), [`115601d`](https://github.com/clerk/javascript/commit/115601d12fd65dbf3011c0cda368525a2b95bfeb)]:
  - @clerk/types@4.56.0
  - @clerk/backend@1.30.1
  - @clerk/shared@3.7.5

## 2.6.8

### Patch Changes

- Updated dependencies [[`ba19465`](https://github.com/clerk/javascript/commit/ba194654b15d326bf0ab1b2bf0cab608042d20ec), [`8b25035`](https://github.com/clerk/javascript/commit/8b25035aa49382fe1cd1c6f30ec80e86bcf9d66e)]:
  - @clerk/backend@1.30.0
  - @clerk/types@4.55.1
  - @clerk/shared@3.7.4

## 2.6.7

### Patch Changes

- Updated dependencies [[`33201bf`](https://github.com/clerk/javascript/commit/33201bf972d6a980617d47ebd776bef76f871833), [`4334598`](https://github.com/clerk/javascript/commit/4334598108ff2cfa3c25b5a46117c1c9c65b7974), [`0ae0403`](https://github.com/clerk/javascript/commit/0ae040303d239b75a3221436354a2c2ecdb85aae)]:
  - @clerk/types@4.55.0
  - @clerk/backend@1.29.2
  - @clerk/shared@3.7.3

## 2.6.6

### Patch Changes

- Updated dependencies [[`45486ac`](https://github.com/clerk/javascript/commit/45486acebf4d133efb09a3622a738cdbf4e51d66), [`837692a`](https://github.com/clerk/javascript/commit/837692aa40197b1574783ad36d0d017a771c08e1), [`0c00e59`](https://github.com/clerk/javascript/commit/0c00e59ff4714491650ac9480ae3b327c626d30d), [`6a5f644`](https://github.com/clerk/javascript/commit/6a5f6447a36a635d6201f8bb7619fb844ab21b79)]:
  - @clerk/types@4.54.2
  - @clerk/backend@1.29.1
  - @clerk/shared@3.7.2

## 2.6.5

### Patch Changes

- Improve JSDoc comments ([#5630](https://github.com/clerk/javascript/pull/5630)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`ab939fd`](https://github.com/clerk/javascript/commit/ab939fdb29150c376280b42f861a188a33f57dcc), [`03284da`](https://github.com/clerk/javascript/commit/03284da6a93a790ce3e3ebbd871c06e19f5a8803), [`7389ba3`](https://github.com/clerk/javascript/commit/7389ba3164ca0d848fb0a9de5d7e9716925fadcc), [`00f16e4`](https://github.com/clerk/javascript/commit/00f16e4c62fc9e965c352a4fd199c7fad8704f79), [`bb35660`](https://github.com/clerk/javascript/commit/bb35660884d04c8a426790ed439592e33434c87f), [`efb5d8c`](https://github.com/clerk/javascript/commit/efb5d8c03b14f6c2b5ecaed55a09869abe76ebbc), [`c2712e7`](https://github.com/clerk/javascript/commit/c2712e7f288271c022b5586b8b4718f57c9b6007), [`aa93f7f`](https://github.com/clerk/javascript/commit/aa93f7f94b5e146eb7166244f7e667213fa210ca), [`a7f3ebc`](https://github.com/clerk/javascript/commit/a7f3ebc63adbab274497ca24279862d2788423c7), [`d3fa403`](https://github.com/clerk/javascript/commit/d3fa4036b7768134131c008c087a90a841f225e5), [`f6ef841`](https://github.com/clerk/javascript/commit/f6ef841125ff21ca8cae731d1f47f3a101d887e1), [`6cba4e2`](https://github.com/clerk/javascript/commit/6cba4e28e904779dd448a7c29d761fcf53465dbf), [`fb6aa20`](https://github.com/clerk/javascript/commit/fb6aa20abe1c0c8579ba8f07343474f915bc22c6), [`e634830`](https://github.com/clerk/javascript/commit/e6348301ab56a7868f24c1b9a4dd9e1d60f6027b), [`f8887b2`](https://github.com/clerk/javascript/commit/f8887b2cbd145e8e49bec890e8b6e02e34178d6a)]:
  - @clerk/types@4.54.1
  - @clerk/backend@1.29.0
  - @clerk/shared@3.7.1

## 2.6.4

### Patch Changes

- Updated dependencies [[`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`950ffed`](https://github.com/clerk/javascript/commit/950ffedd5ce93678274c721400fc7464bb1e2f99), [`d3e6c32`](https://github.com/clerk/javascript/commit/d3e6c32864487bb9c4dec361866ec2cd427b7cd0), [`e4d04ae`](https://github.com/clerk/javascript/commit/e4d04aea490ab67e3431729398d3f4c46fc3e7e7), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`93068ea`](https://github.com/clerk/javascript/commit/93068ea9eb19d8c8b9c7ade35d0cd860e08049fc), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`103bc03`](https://github.com/clerk/javascript/commit/103bc03571c8845df205f4c6fd0c871c3368d1d0), [`a0cc247`](https://github.com/clerk/javascript/commit/a0cc24764cc2229abae97f7c9183b413609febc7), [`85ed003`](https://github.com/clerk/javascript/commit/85ed003e65802ac02d69d7b671848938c9816c45), [`48438b4`](https://github.com/clerk/javascript/commit/48438b409036088701bda7e1e732d6a51bee8cdc), [`e60e3aa`](https://github.com/clerk/javascript/commit/e60e3aa41630b987b6a481643caf67d70584f2e1), [`65712dc`](https://github.com/clerk/javascript/commit/65712dccb3f3f2bc6028e53406e3f7f31622e961), [`9ee0531`](https://github.com/clerk/javascript/commit/9ee0531c81d1bb260ec0f87130d8394d7825b6d4), [`78d22d4`](https://github.com/clerk/javascript/commit/78d22d443446ac1c0d30b1b93aaf5cddde75a9a3), [`196dcb4`](https://github.com/clerk/javascript/commit/196dcb47928bd22a3382197f8594a590f688faee)]:
  - @clerk/backend@1.28.0
  - @clerk/types@4.54.0
  - @clerk/shared@3.7.0

## 2.6.3

### Patch Changes

- Updated dependencies [[`70c9db9`](https://github.com/clerk/javascript/commit/70c9db9f3b51ba034f76e0cc4cf338e7b406d9b1), [`554242e`](https://github.com/clerk/javascript/commit/554242e16e50c92a6afb6ed74c681b04b9f113b5), [`cc1f9a0`](https://github.com/clerk/javascript/commit/cc1f9a0adb7771b615b0f2994a5ac571b59889dd), [`8186cb5`](https://github.com/clerk/javascript/commit/8186cb564575ac3ce97079ec203865bf5deb05ee)]:
  - @clerk/backend@1.27.3
  - @clerk/shared@3.6.0
  - @clerk/types@4.53.0

## 2.6.2

### Patch Changes

- Fixes issue with `useAuth()` erroring due to missing auth context on static output. ([#5567](https://github.com/clerk/javascript/pull/5567)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`3ad3bc8`](https://github.com/clerk/javascript/commit/3ad3bc8380b354b0cd952eb58eb6c07650efa0f2), [`3ad3bc8`](https://github.com/clerk/javascript/commit/3ad3bc8380b354b0cd952eb58eb6c07650efa0f2), [`cfa94b8`](https://github.com/clerk/javascript/commit/cfa94b88476608edf8c2486e8ec0d3f3f82e0bfb), [`2033919`](https://github.com/clerk/javascript/commit/203391964857b98dae11944799d1e6328439e838), [`1b34bcb`](https://github.com/clerk/javascript/commit/1b34bcb17e1a7f22644c0ea073857c528a8f81b7), [`5f3cc46`](https://github.com/clerk/javascript/commit/5f3cc460b6b775b5a74746758b8cff11649a877a)]:
  - @clerk/shared@3.5.0
  - @clerk/types@4.52.0
  - @clerk/backend@1.27.2

## 2.6.1

### Patch Changes

- Updated dependencies [[`f6f275d`](https://github.com/clerk/javascript/commit/f6f275dac5ae83ac0c2016a85a6a0cee9513f224)]:
  - @clerk/backend@1.27.1
  - @clerk/types@4.51.1
  - @clerk/shared@3.4.1

## 2.6.0

### Minor Changes

- Update `useAuth` to handle pending sessions as signed-out by default, with opt-out via `useAuth({ treatPendingAsSignedOut: false })` or `clerk({ treatPendingAsSignedOut: false })` ([#5507](https://github.com/clerk/javascript/pull/5507)) by [@LauraBeatris](https://github.com/LauraBeatris)

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

- Updated dependencies [[`e1ec52b`](https://github.com/clerk/javascript/commit/e1ec52b93038c9cb24e030dc06e53825a384a480), [`bebb6d8`](https://github.com/clerk/javascript/commit/bebb6d8af66b2bb7a4b3bdf96f9d480e65b31ba2), [`d0d5203`](https://github.com/clerk/javascript/commit/d0d5203e4ee9e2e1bed5c00ef0f87f0130f1d298), [`6112420`](https://github.com/clerk/javascript/commit/6112420889f1577fb16d7bfa706aaffe1090093d), [`2cceeba`](https://github.com/clerk/javascript/commit/2cceeba177ecf5a28138da308cbba18015e3a646), [`9b25e31`](https://github.com/clerk/javascript/commit/9b25e311cf5e15f896c7948faa42ace45df364c5)]:
  - @clerk/types@4.51.0
  - @clerk/backend@1.27.0
  - @clerk/shared@3.4.0

## 2.5.0

### Minor Changes

- Introduce a `verifyWebhook()` function to verify incoming Clerk webhook requests and process the payload. This function handles webhook signature verification using `Svix` and is now available across all backend and fullstack SDKs. ([#5468](https://github.com/clerk/javascript/pull/5468)) by [@wobsoriano](https://github.com/wobsoriano)

  To get started, install [`svix`](https://www.npmjs.com/package/svix), which Clerk uses to verify its webhooks:

  ```shell
  npm install svix
  ```

  Then in your webhook route handler, import `verifyWebhook()` from the Astro SDK:

  ```ts
  // pages/api/webhooks.ts
  import { verifyWebhook } from '@clerk/astro/webhooks';

  export const POST = ({ request }) => {
    try {
      const evt = await verifyWebhook(request);

      // Do something with payload
      const { id } = evt.data;
      const eventType = evt.type;
      console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
      console.log('Webhook payload:', body);

      return new Response('Webhook received', { status: 200 });
    } catch (err) {
      console.error('Error: Could not verify webhook:', err);
      return new Response('Error: Verification error', {
        status: 400,
      });
    }
  };
  ```

  For more information on how to sync Clerk data to your app with webhooks, [see our guide](https://clerk.com/docs/webhooks/sync-data).

- Redirect to tasks on `auth.protect` and `auth.redirectToSignIn` ([#5440](https://github.com/clerk/javascript/pull/5440)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Remove telemtry event from `clerkMiddleware()`. ([#5501](https://github.com/clerk/javascript/pull/5501)) by [@brkalow](https://github.com/brkalow)

- Updated dependencies [[`60a9a51`](https://github.com/clerk/javascript/commit/60a9a51dff7d59e7397536586cf1cfe029bc021b), [`e984494`](https://github.com/clerk/javascript/commit/e984494416dda9a6f04acaaba61f8c2683090961), [`cd6ee92`](https://github.com/clerk/javascript/commit/cd6ee92d5b427ca548216f429ca4e31c6acd263c), [`ec4521b`](https://github.com/clerk/javascript/commit/ec4521b4fe56602f524a0c6d1b09d21aef5d8bd0), [`38828ae`](https://github.com/clerk/javascript/commit/38828ae58d6d4e8e3c60945284930179b2b6bb40), [`f30fa75`](https://github.com/clerk/javascript/commit/f30fa750754f19030f932a666d2bdbdf0d86743d), [`9c68678`](https://github.com/clerk/javascript/commit/9c68678e87047e6312b708b775ebfb23a3e22f8a), [`fe065a9`](https://github.com/clerk/javascript/commit/fe065a934c583174ad4c140e04dedbe6d88fc3a0), [`619cde8`](https://github.com/clerk/javascript/commit/619cde8c532d635d910ebbc08ad6abcc025694b4)]:
  - @clerk/backend@1.26.0
  - @clerk/shared@3.3.0
  - @clerk/types@4.50.2

## 2.4.5

### Patch Changes

- Updated dependencies [[`e20fb6b`](https://github.com/clerk/javascript/commit/e20fb6b397fb69c9d5af4e321267b82f12a5f127), [`77e6462`](https://github.com/clerk/javascript/commit/77e64628560cab688af214edb5922e67cd68a951)]:
  - @clerk/shared@3.2.3
  - @clerk/types@4.50.1
  - @clerk/backend@1.25.8

## 2.4.4

### Patch Changes

- Updated dependencies [[`1da28a2`](https://github.com/clerk/javascript/commit/1da28a28bf602069b433c15b92df21f682779294), [`a9b618d`](https://github.com/clerk/javascript/commit/a9b618dfa97a0dacc462186c8b2588ad5ddb6902), [`f20dc15`](https://github.com/clerk/javascript/commit/f20dc159f542449e7f5b437b70d3eb3ba04d6975), [`4d9f1ee`](https://github.com/clerk/javascript/commit/4d9f1ee8c22fe1e4a166ff054d0af4d37b829f0a)]:
  - @clerk/types@4.50.0
  - @clerk/shared@3.2.2
  - @clerk/backend@1.25.7

## 2.4.3

### Patch Changes

- Updated dependencies [[`27d66a5`](https://github.com/clerk/javascript/commit/27d66a5b252afd18a3491b2746ef2f2f05632f2a), [`466ed13`](https://github.com/clerk/javascript/commit/466ed136af73b59b267d92ad3296039d1c3a4fcc)]:
  - @clerk/backend@1.25.6
  - @clerk/types@4.49.2
  - @clerk/shared@3.2.1

## 2.4.2

### Patch Changes

- Updated dependencies [[`892bc0e`](https://github.com/clerk/javascript/commit/892bc0eee9e0bb04d327eb84b44201fa34806483), [`892bc0e`](https://github.com/clerk/javascript/commit/892bc0eee9e0bb04d327eb84b44201fa34806483)]:
  - @clerk/backend@1.25.5
  - @clerk/shared@3.2.0

## 2.4.1

### Patch Changes

- Updated dependencies [[`facefaf`](https://github.com/clerk/javascript/commit/facefafdaf6d602de0acee9218c66c61a0a9ba24), [`3910ebe`](https://github.com/clerk/javascript/commit/3910ebea85817273f18fd2f3f142dd1c728e2220), [`e513333`](https://github.com/clerk/javascript/commit/e5133330a196c5c3742634cc9c3d3233ff488b0d)]:
  - @clerk/backend@1.25.4
  - @clerk/types@4.49.1
  - @clerk/shared@3.1.0

## 2.4.0

### Minor Changes

- Deprecate out of date jwt types in favour of existing that are up-to-date. ([#5354](https://github.com/clerk/javascript/pull/5354)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`725918d`](https://github.com/clerk/javascript/commit/725918df2e74cea15e9b748aaf103a52df8e8500), [`10247ba`](https://github.com/clerk/javascript/commit/10247ba2d08d98d6c440b254a4b786f4f1e8967a), [`91d0f0b`](https://github.com/clerk/javascript/commit/91d0f0b0dccab7168ad4dc06c8629808938c235f), [`9572bf5`](https://github.com/clerk/javascript/commit/9572bf5bdfb7dc309ec8714989b98ab12174965b), [`39bbc51`](https://github.com/clerk/javascript/commit/39bbc5189a33dc6cebdc269ac2184dc4ffff2534), [`3dddcda`](https://github.com/clerk/javascript/commit/3dddcda191d8f8d6a9b02464f1f6374d3c6aacb9), [`7524943`](https://github.com/clerk/javascript/commit/7524943300d7e693d61cc1820b520abfadec1c64), [`150b5c8`](https://github.com/clerk/javascript/commit/150b5c89477abb0feab15e0a886179473f653cac), [`23c931e`](https://github.com/clerk/javascript/commit/23c931e9e95e6de992549ad499b477aca9a9c344), [`730262f`](https://github.com/clerk/javascript/commit/730262f0f973923c8749b09078c80c2fc966a8ec), [`5601a15`](https://github.com/clerk/javascript/commit/5601a15e69a7d5e2496dcd82541ca3e6d73b0a3f), [`0b18bb1`](https://github.com/clerk/javascript/commit/0b18bb1fe6fa3ded97547bb6b4d2c73030aad329), [`021bc5f`](https://github.com/clerk/javascript/commit/021bc5f40044d34e49956ce3c9b61d833d815b42), [`1a61390`](https://github.com/clerk/javascript/commit/1a61390d3482bd4af58508b972ad89dea56fa224)]:
  - @clerk/types@4.49.0
  - @clerk/backend@1.25.3
  - @clerk/shared@3.0.2

## 2.3.3

### Patch Changes

- Updated dependencies [[`8182f6711e25cc4a78baa95b023a4158280b31e8`](https://github.com/clerk/javascript/commit/8182f6711e25cc4a78baa95b023a4158280b31e8), [`75879672c5805bfba1caca906ac0729497744164`](https://github.com/clerk/javascript/commit/75879672c5805bfba1caca906ac0729497744164), [`7ec95a7e59033600958aca4b86f3bcd5da947dec`](https://github.com/clerk/javascript/commit/7ec95a7e59033600958aca4b86f3bcd5da947dec), [`3c225d90227141dc62d955e76c7f8e0202524bc7`](https://github.com/clerk/javascript/commit/3c225d90227141dc62d955e76c7f8e0202524bc7), [`2a66c16af08573000bb619607346ac420cd4ce56`](https://github.com/clerk/javascript/commit/2a66c16af08573000bb619607346ac420cd4ce56)]:
  - @clerk/backend@1.25.2
  - @clerk/shared@3.0.1
  - @clerk/types@4.48.0

## 2.3.2

### Patch Changes

- Updated dependencies [[`67f1743aa1e0705d89ee6b532007f2686929240b`](https://github.com/clerk/javascript/commit/67f1743aa1e0705d89ee6b532007f2686929240b)]:
  - @clerk/backend@1.25.1

## 2.3.1

### Patch Changes

- Updated dependencies [[`4fa5e27e33d229492c77e06ca4b26d552ff3d92f`](https://github.com/clerk/javascript/commit/4fa5e27e33d229492c77e06ca4b26d552ff3d92f), [`29a44b0e5c551e52915f284545699010a87e1a48`](https://github.com/clerk/javascript/commit/29a44b0e5c551e52915f284545699010a87e1a48), [`4d7761a24af5390489653923165e55cbf69a8a6d`](https://github.com/clerk/javascript/commit/4d7761a24af5390489653923165e55cbf69a8a6d)]:
  - @clerk/backend@1.25.0

## 2.3.0

### Minor Changes

- Introduce `protect-fallback` slot to avoid naming conflicts with Astro's server islands [`fallback` slot](https://docs.astro.build/en/guides/server-islands/#server-island-fallback-content). ([#5196](https://github.com/clerk/javascript/pull/5196)) by [@wobsoriano](https://github.com/wobsoriano)

  When using Clerk's `<Protect>` component with `server:defer`, you can now use both slots:

  - `fallback`: Default loading content
  - `protect-fallback`: Shows when a user doesn't have the `role` or `permission` to access the protected content

  Regular usage without server islands:

  ```astro
  <Protect role="admin">
    <p slot="fallback">Not an admin</p>
    <p>You're an admin</p>
  </Protect>
  ```

  Example with server islands:

  ```astro
  <Protect server:defer role="admin">
    <p slot="fallback">Loading...</p>
    <p slot="protect-fallback">Not an admin</p>
    <p>You're an admin</p>
  </Protect>
  ```

- Surface new `pending` session as a signed-in state ([#5136](https://github.com/clerk/javascript/pull/5136)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- The [`exports` map](https://nodejs.org/api/packages.html#conditional-exports) inside `package.json` has been slightly adjusted to allow for [`require(esm)`](https://joyeecheung.github.io/blog/2024/03/18/require-esm-in-node-js/) to work correctly. The `"import"` conditions have been changed to `"default"`. ([#5188](https://github.com/clerk/javascript/pull/5188)) by [@LekoArts](https://github.com/LekoArts)

  You shouldn't see any change in behavior/functionality on your end.

- Updated dependencies [[`28179323d9891bd13625e32c5682a3276e73cdae`](https://github.com/clerk/javascript/commit/28179323d9891bd13625e32c5682a3276e73cdae), [`7ae77b74326e378bf161e29886ee82e1556d9840`](https://github.com/clerk/javascript/commit/7ae77b74326e378bf161e29886ee82e1556d9840), [`c5c246ce91c01db9f1eaccbd354f646bcd24ec0a`](https://github.com/clerk/javascript/commit/c5c246ce91c01db9f1eaccbd354f646bcd24ec0a), [`bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a`](https://github.com/clerk/javascript/commit/bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a), [`382c30240f563e58bc4d4832557c6825da40ce7f`](https://github.com/clerk/javascript/commit/382c30240f563e58bc4d4832557c6825da40ce7f)]:
  - @clerk/types@4.47.0
  - @clerk/shared@3.0.0
  - @clerk/backend@1.24.3

## 2.2.1

### Patch Changes

- Updated dependencies [[`d76c4699990b8477745c2584b1b98d5c92f9ace6`](https://github.com/clerk/javascript/commit/d76c4699990b8477745c2584b1b98d5c92f9ace6), [`a9b0087fca3f427f65907b358d9b5bc0c95921d8`](https://github.com/clerk/javascript/commit/a9b0087fca3f427f65907b358d9b5bc0c95921d8), [`92d17d7c087470b262fa5407cb6720fe6b17d333`](https://github.com/clerk/javascript/commit/92d17d7c087470b262fa5407cb6720fe6b17d333)]:
  - @clerk/shared@2.22.0
  - @clerk/types@4.46.1
  - @clerk/backend@1.24.2

## 2.2.0

### Minor Changes

- Add support for type-safe environment variables using the [`astro:env` API](https://docs.astro.build/en/reference/configuration-reference/#env). ([#5104](https://github.com/clerk/javascript/pull/5104)) by [@wobsoriano](https://github.com/wobsoriano)

  The integration now provides a type-safe schema for all Clerk environment variables by default. You can use the environment variables like so:

  ```js
  import { PUBLIC_CLERK_PUBLISHABLE_KEY } from 'astro:env/client';
  import { CLERK_SECRET_KEY } from 'astro:env/server';
  ```

  To override this behavior, you can disable the feature by setting `enableEnvSchema` to `false`:

  ```js
  export default defineConfig({
    integrations: [clerk({ enableEnvSchema: false })],
  });
  ```

### Patch Changes

- Add the ability to specify an appearance for modal component usages. ([#5125](https://github.com/clerk/javascript/pull/5125)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`dd2cbfe9f30358b6b298901bb52fa378b0acdca3`](https://github.com/clerk/javascript/commit/dd2cbfe9f30358b6b298901bb52fa378b0acdca3), [`570d8386f6aa596bf7bb1659bdddb8dd4d992b1d`](https://github.com/clerk/javascript/commit/570d8386f6aa596bf7bb1659bdddb8dd4d992b1d), [`128fd8909ae083c0d274dee7c6810e8574e1ce33`](https://github.com/clerk/javascript/commit/128fd8909ae083c0d274dee7c6810e8574e1ce33)]:
  - @clerk/types@4.46.0
  - @clerk/backend@1.24.1
  - @clerk/shared@2.21.1

## 2.1.20

### Patch Changes

- Adds types for organization domain webhook events ([#4819](https://github.com/clerk/javascript/pull/4819)) by [@ijxy](https://github.com/ijxy)

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

- Previously the `createPathMatcher()` function was re-implemented both in `@clerk/astro` and `@clerk/nextjs`, this PR moves this logic to `@clerk/shared`. ([#5043](https://github.com/clerk/javascript/pull/5043)) by [@wobsoriano](https://github.com/wobsoriano)

  You can use it like so:

  ```ts
  import { createPathMatcher } from '@clerk/shared/pathMatcher';
  ```

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

- Standardizing ambient declaration files for all SDKs ([#4919](https://github.com/clerk/javascript/pull/4919)) by [@jacekradko](https://github.com/jacekradko)

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

- Fix handshake redirect loop in Netlify deployments ([#4745](https://github.com/clerk/javascript/pull/4745)) by [@wobsoriano](https://github.com/wobsoriano)

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

- Add backwards compatibility for ignoring pre-rendered routes in Astro ([#4694](https://github.com/clerk/javascript/pull/4694)) by [@wobsoriano](https://github.com/wobsoriano)

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

- Simplify submodules and drop the `bundled` variant. by [@nikosdouvlis](https://github.com/nikosdouvlis)

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

- Remove `@nanostores/react` from dependency. by [@nikosdouvlis](https://github.com/nikosdouvlis)

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
