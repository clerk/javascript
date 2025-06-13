# Change Log

## 3.9.6

### Patch Changes

- Updated dependencies [[`d8fa5d9`](https://github.com/clerk/javascript/commit/d8fa5d9d3d8dc575260d8d2b7c7eeeb0052d0b0d), [`be2e89c`](https://github.com/clerk/javascript/commit/be2e89ca11aa43d48f74c57a5a34e20d85b4003c), [`5644d94`](https://github.com/clerk/javascript/commit/5644d94f711a0733e4970c3f15c24d56cafc8743), [`b578225`](https://github.com/clerk/javascript/commit/b5782258242474c9b0987a3f8349836cd763f24b), [`8838120`](https://github.com/clerk/javascript/commit/8838120596830b88fec1c6c853371dabfec74a0d)]:
  - @clerk/types@4.60.0

## 3.9.5

### Patch Changes

- Bug fix: In `createCheckAuthorization` allow for old `org_role` format in JWT v1 where `org:` is missing. ([#5988](https://github.com/clerk/javascript/pull/5988)) by [@panteliselef](https://github.com/panteliselef)

  Example session claims:

  ```json
  {
    "org_id": "org_xxxx",
    "org_permissions": [],
    "org_role": "admin",
    "org_slug": "test"
  }
  ```

  Code

  ```ts
  authObject.has({ role: 'org:admin' }); // -> true
  authObject.has({ role: 'admin' }); // -> true
  ```

- Updated dependencies [[`2c6a0cc`](https://github.com/clerk/javascript/commit/2c6a0cca6e824bafc6b0d0501784517a5b1f75ea), [`71e6a1f`](https://github.com/clerk/javascript/commit/71e6a1f1024d65b7a09cdc8fa81ce0164e0a34cb)]:
  - @clerk/types@4.59.3

## 3.9.4

### Patch Changes

- Updated dependencies [[`6ed3dfc`](https://github.com/clerk/javascript/commit/6ed3dfc1bc742ac9d9a2307fe8e4733411cbc0d7)]:
  - @clerk/types@4.59.2

## 3.9.3

### Patch Changes

- Updated `isLoaded` comments for useOrganizationList. ([#5970](https://github.com/clerk/javascript/pull/5970)) by [@royanger](https://github.com/royanger)

## 3.9.2

### Patch Changes

- Use domain in AuthenticateRequest only for satellite domains ([#5919](https://github.com/clerk/javascript/pull/5919)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`c305b31`](https://github.com/clerk/javascript/commit/c305b310e351e9ce2012f805b35e464c3e43e310)]:
  - @clerk/types@4.59.1

## 3.9.1

### Patch Changes

- Updated dependencies [[`b1337df`](https://github.com/clerk/javascript/commit/b1337dfeae8ccf8622efcf095e3201f9bbf1cefa), [`65f0878`](https://github.com/clerk/javascript/commit/65f08788ee5e56242eee2194c73ba90965c75c97), [`df6fefd`](https://github.com/clerk/javascript/commit/df6fefd05fd2df93f5286d97e546b48911adea7c), [`4282bfa`](https://github.com/clerk/javascript/commit/4282bfa09491225bde7d619fe9a3561062703f69), [`5491491`](https://github.com/clerk/javascript/commit/5491491711e0a8ee37828451c1f603a409de32cf)]:
  - @clerk/types@4.59.0

## 3.9.0

### Minor Changes

- Introduce `WhatsApp` as an alternative channel for phone code delivery. ([#5894](https://github.com/clerk/javascript/pull/5894)) by [@anagstef](https://github.com/anagstef)

  The new `channel` property accompanies the `phone_code` strategy. Possible values: `whatsapp` and `sms`.

### Patch Changes

- Updated dependencies [[`1ff6d6e`](https://github.com/clerk/javascript/commit/1ff6d6efbe838b3f7f6977b2b5215c2cafd715f6), [`fbf3cf4`](https://github.com/clerk/javascript/commit/fbf3cf4916469c4e118870bf12efca2d0f77d9d8)]:
  - @clerk/types@4.58.1

## 3.8.2

### Patch Changes

- Updated dependencies [[`0f5145e`](https://github.com/clerk/javascript/commit/0f5145e164f3d3d5faf57e58162b05e7110d2403), [`afdfd18`](https://github.com/clerk/javascript/commit/afdfd18d645608dec37e52a291a91ba5f42dcbe7), [`b7c51ba`](https://github.com/clerk/javascript/commit/b7c51baac6df1129b468274c9a7f63ca303f16ce), [`437b53b`](https://github.com/clerk/javascript/commit/437b53b67e281d076b5b3f927e11c1d64666d154), [`5217155`](https://github.com/clerk/javascript/commit/52171554250c5c58f4f497b6d3c7416e79ac77da)]:
  - @clerk/types@4.58.0

## 3.8.1

### Patch Changes

- Updated dependencies [[`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`36fb43f`](https://github.com/clerk/javascript/commit/36fb43f8b35866bdc20680fac58020f036d30d1f), [`e5ac444`](https://github.com/clerk/javascript/commit/e5ac4447f52bb6887ad686feab308fe9daf76e33), [`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`d227805`](https://github.com/clerk/javascript/commit/d22780599a5e29545a3d8309cc411c2e8659beac)]:
  - @clerk/types@4.57.1

## 3.8.0

### Minor Changes

- Mark commerce apis as stable ([#5833](https://github.com/clerk/javascript/pull/5833)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

### Patch Changes

- Allow for `has({ role | permission})` without scope. ([#5693](https://github.com/clerk/javascript/pull/5693)) by [@panteliselef](https://github.com/panteliselef)

  Examples:

  - `has({role: "admin"})`
  - `has({permission: "friends:add"})`

- Updated dependencies [[`db0138f`](https://github.com/clerk/javascript/commit/db0138f3f72aea8cb68a5684a90123f733848f63), [`aa97231`](https://github.com/clerk/javascript/commit/aa97231962e3f472a46135e376159c6ddcf1157b), [`c792f37`](https://github.com/clerk/javascript/commit/c792f37129fd6475d5af95146e9ef0f1c8eff730), [`3bf08a9`](https://github.com/clerk/javascript/commit/3bf08a9e0a9e65496edac5fc3bb22ad7b561df26), [`74cf3b2`](https://github.com/clerk/javascript/commit/74cf3b28cdf622a942aaf99caabfba74b7e856fd), [`037b113`](https://github.com/clerk/javascript/commit/037b113aaedd53d4647d88f1659eb9c14cf6f275), [`c15a412`](https://github.com/clerk/javascript/commit/c15a412169058e2304a51c9e92ffaa7f6bb2a898), [`7726a03`](https://github.com/clerk/javascript/commit/7726a03a7fec4d292b6de2587b84ed4371984c23), [`b846a9a`](https://github.com/clerk/javascript/commit/b846a9ab96db6b1d8344a4b693051618865508a8), [`e66c800`](https://github.com/clerk/javascript/commit/e66c8002b82b2902f77e852e16482f5cfb062d2c), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed), [`9c41091`](https://github.com/clerk/javascript/commit/9c41091eb795bce8ffeeeca0264ae841fe07b426), [`29462b4`](https://github.com/clerk/javascript/commit/29462b433eb411ce614e4768e5844cacd00c1975), [`322c43f`](https://github.com/clerk/javascript/commit/322c43f6807a932c3cfaaef1b587b472c80180d2), [`17397f9`](https://github.com/clerk/javascript/commit/17397f95b715bd4fefd7f63c1d351abcf1c8ee16), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed)]:
  - @clerk/types@4.57.0

## 3.7.8

### Patch Changes

- Updated dependencies [[`9ec0a73`](https://github.com/clerk/javascript/commit/9ec0a7353e9f6ea661c3d7b9542423b6eb1d29e9), [`d9222fc`](https://github.com/clerk/javascript/commit/d9222fc3c21da2bcae30b06f0b1897f526935582)]:
  - @clerk/types@4.56.3

## 3.7.7

### Patch Changes

- Updated dependencies [[`225b9ca`](https://github.com/clerk/javascript/commit/225b9ca21aba44930872a85d6b112ee2a1b606b9)]:
  - @clerk/types@4.56.2

## 3.7.6

### Patch Changes

- Fix handshake redirect loop in applications deployed to Netlify with a Clerk development instance. ([#5656](https://github.com/clerk/javascript/pull/5656)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`387bf62`](https://github.com/clerk/javascript/commit/387bf623406306e0c5c08da937f4930a7ec5e4a5), [`294da82`](https://github.com/clerk/javascript/commit/294da82336e7a345900d7ef9b28f56a7c8864c52)]:
  - @clerk/types@4.56.1

## 3.7.5

### Patch Changes

- Updated dependencies [[`b02e766`](https://github.com/clerk/javascript/commit/b02e76627e47aec314573586451fa345a089115a), [`5d78b28`](https://github.com/clerk/javascript/commit/5d78b286b63e35fbcf44aac1f7657cbeaba4d659), [`d7f4438`](https://github.com/clerk/javascript/commit/d7f4438fa4bfd04474d5cdb9212ba908568ad6d2), [`5866855`](https://github.com/clerk/javascript/commit/58668550ec91d5511cf775972c54dc485185cc58), [`0007106`](https://github.com/clerk/javascript/commit/00071065998a3676c51e396b4c0afcbf930a9898), [`462b5b2`](https://github.com/clerk/javascript/commit/462b5b271d4e120d58a85818a358b60a6b3c8100), [`447d7a9`](https://github.com/clerk/javascript/commit/447d7a9e133c2a0e7db014bd5837e6ffff08f572), [`2beea29`](https://github.com/clerk/javascript/commit/2beea2957c67bc62446fe24d36332b0a4e850d7d), [`115601d`](https://github.com/clerk/javascript/commit/115601d12fd65dbf3011c0cda368525a2b95bfeb)]:
  - @clerk/types@4.56.0

## 3.7.4

### Patch Changes

- Updated dependencies [[`8b25035`](https://github.com/clerk/javascript/commit/8b25035aa49382fe1cd1c6f30ec80e86bcf9d66e)]:
  - @clerk/types@4.55.1

## 3.7.3

### Patch Changes

- Updated dependencies [[`33201bf`](https://github.com/clerk/javascript/commit/33201bf972d6a980617d47ebd776bef76f871833), [`4334598`](https://github.com/clerk/javascript/commit/4334598108ff2cfa3c25b5a46117c1c9c65b7974), [`0ae0403`](https://github.com/clerk/javascript/commit/0ae040303d239b75a3221436354a2c2ecdb85aae)]:
  - @clerk/types@4.55.0

## 3.7.2

### Patch Changes

- Improve JSDoc comments ([#5643](https://github.com/clerk/javascript/pull/5643)) by [@alexisintech](https://github.com/alexisintech)

- Updated dependencies [[`45486ac`](https://github.com/clerk/javascript/commit/45486acebf4d133efb09a3622a738cdbf4e51d66), [`837692a`](https://github.com/clerk/javascript/commit/837692aa40197b1574783ad36d0d017a771c08e1), [`0c00e59`](https://github.com/clerk/javascript/commit/0c00e59ff4714491650ac9480ae3b327c626d30d), [`6a5f644`](https://github.com/clerk/javascript/commit/6a5f6447a36a635d6201f8bb7619fb844ab21b79)]:
  - @clerk/types@4.54.2

## 3.7.1

### Patch Changes

- Improve JSDoc comments ([#5630](https://github.com/clerk/javascript/pull/5630)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`ab939fd`](https://github.com/clerk/javascript/commit/ab939fdb29150c376280b42f861a188a33f57dcc), [`03284da`](https://github.com/clerk/javascript/commit/03284da6a93a790ce3e3ebbd871c06e19f5a8803), [`7389ba3`](https://github.com/clerk/javascript/commit/7389ba3164ca0d848fb0a9de5d7e9716925fadcc), [`f6ef841`](https://github.com/clerk/javascript/commit/f6ef841125ff21ca8cae731d1f47f3a101d887e1), [`e634830`](https://github.com/clerk/javascript/commit/e6348301ab56a7868f24c1b9a4dd9e1d60f6027b), [`f8887b2`](https://github.com/clerk/javascript/commit/f8887b2cbd145e8e49bec890e8b6e02e34178d6a)]:
  - @clerk/types@4.54.1

## 3.7.0

### Minor Changes

- Replace `parseFeatures` with `splitByScope`. ([#5582](https://github.com/clerk/javascript/pull/5582)) by [@panteliselef](https://github.com/panteliselef)

- Update `createCheckAuthorization` to support authorization based on features and plans. ([#5582](https://github.com/clerk/javascript/pull/5582)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Bug fix: Reverse permissions array on `parsePermissions` to match bitmask correctly. ([#5620](https://github.com/clerk/javascript/pull/5620)) by [@panteliselef](https://github.com/panteliselef)

- Improve JSDoc comments ([#5578](https://github.com/clerk/javascript/pull/5578)) by [@LekoArts](https://github.com/LekoArts)

- Improve JSDoc comments ([#5596](https://github.com/clerk/javascript/pull/5596)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`e4d04ae`](https://github.com/clerk/javascript/commit/e4d04aea490ab67e3431729398d3f4c46fc3e7e7), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`93068ea`](https://github.com/clerk/javascript/commit/93068ea9eb19d8c8b9c7ade35d0cd860e08049fc), [`48438b4`](https://github.com/clerk/javascript/commit/48438b409036088701bda7e1e732d6a51bee8cdc), [`196dcb4`](https://github.com/clerk/javascript/commit/196dcb47928bd22a3382197f8594a590f688faee)]:
  - @clerk/types@4.54.0

## 3.6.0

### Minor Changes

- Export `createEventBus` from `@clerk/shared/eventBus`. ([#5546](https://github.com/clerk/javascript/pull/5546)) by [@panteliselef](https://github.com/panteliselef)

  ```ts
  // Create a type-safe event bus
  const bus = createEventBus<{
    'user:login': { id: string };
    error: Error;
  }>();

  // Subscribe to events
  const onLogin = ({ id }: { id: string }) => console.log('User logged in:', id);
  bus.on('user:login', onLogin);

  // Subscribe with priority (runs before regular handlers)
  bus.onBefore('error', error => console.error('Error occurred:', error));

  // Emit events
  bus.emit('user:login', { id: 'user_123' });

  // Unsubscribe specific handler
  bus.off('user:login', onLogin);

  // Unsubscribe all handlers
  bus.off('error');
  ```

### Patch Changes

- Improve JSDoc comments ([#5575](https://github.com/clerk/javascript/pull/5575)) by [@LekoArts](https://github.com/LekoArts)

- Fix JWT v2 feature parsing ([#5580](https://github.com/clerk/javascript/pull/5580)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`554242e`](https://github.com/clerk/javascript/commit/554242e16e50c92a6afb6ed74c681b04b9f113b5)]:
  - @clerk/types@4.53.0

## 3.5.0

### Minor Changes

- Adding the new `o` claim that contains all organization related info for JWT v2 schema ([#5549](https://github.com/clerk/javascript/pull/5549)) by [@octoper](https://github.com/octoper)

### Patch Changes

- Add Payment Sources to `<OrgProfile />`, hook up all org-related payment source and checkout methods to the org-specific endpoints ([#5554](https://github.com/clerk/javascript/pull/5554)) by [@aeliox](https://github.com/aeliox)

- Updated dependencies [[`3ad3bc8`](https://github.com/clerk/javascript/commit/3ad3bc8380b354b0cd952eb58eb6c07650efa0f2), [`cfa94b8`](https://github.com/clerk/javascript/commit/cfa94b88476608edf8c2486e8ec0d3f3f82e0bfb), [`2033919`](https://github.com/clerk/javascript/commit/203391964857b98dae11944799d1e6328439e838), [`5f3cc46`](https://github.com/clerk/javascript/commit/5f3cc460b6b775b5a74746758b8cff11649a877a)]:
  - @clerk/types@4.52.0

## 3.4.1

### Patch Changes

- Updated dependencies [[`f6f275d`](https://github.com/clerk/javascript/commit/f6f275dac5ae83ac0c2016a85a6a0cee9513f224)]:
  - @clerk/types@4.51.1

## 3.4.0

### Minor Changes

- Update `useAuth` to handle pending sessions as signed-out by default, with opt-out via `useAuth({ treatPendingAsSignedOut: false })` or `<ClerkProvider treatPendingAsSignedOut={false} />` ([#5507](https://github.com/clerk/javascript/pull/5507)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Updated dependencies [[`e1ec52b`](https://github.com/clerk/javascript/commit/e1ec52b93038c9cb24e030dc06e53825a384a480), [`bebb6d8`](https://github.com/clerk/javascript/commit/bebb6d8af66b2bb7a4b3bdf96f9d480e65b31ba2), [`d0d5203`](https://github.com/clerk/javascript/commit/d0d5203e4ee9e2e1bed5c00ef0f87f0130f1d298), [`9b25e31`](https://github.com/clerk/javascript/commit/9b25e311cf5e15f896c7948faa42ace45df364c5)]:
  - @clerk/types@4.51.0

## 3.3.0

### Minor Changes

- Expose `retryAfter` value on `ClerkAPIResponseError` for 429 responses. ([#5480](https://github.com/clerk/javascript/pull/5480)) by [@dstaley](https://github.com/dstaley)

- Set `retryImmediately: false` as the default for `retry()`. ([#5397](https://github.com/clerk/javascript/pull/5397)) by [@panteliselef](https://github.com/panteliselef)

- Bump `swr` to `2.3.3`. ([#5467](https://github.com/clerk/javascript/pull/5467)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Create a utility that implements `Promise.allSettled` with ES6/ES2015 compatibility. ([#5491](https://github.com/clerk/javascript/pull/5491)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`ec4521b`](https://github.com/clerk/javascript/commit/ec4521b4fe56602f524a0c6d1b09d21aef5d8bd0), [`f30fa75`](https://github.com/clerk/javascript/commit/f30fa750754f19030f932a666d2bdbdf0d86743d), [`9c68678`](https://github.com/clerk/javascript/commit/9c68678e87047e6312b708b775ebfb23a3e22f8a)]:
  - @clerk/types@4.50.2

## 3.2.3

### Patch Changes

- Add billing page to `OrgProfile`, use new `usePlans` hook, and adds new subscription methods ([#5423](https://github.com/clerk/javascript/pull/5423)) by [@aeliox](https://github.com/aeliox)

- Updated dependencies [[`e20fb6b`](https://github.com/clerk/javascript/commit/e20fb6b397fb69c9d5af4e321267b82f12a5f127), [`77e6462`](https://github.com/clerk/javascript/commit/77e64628560cab688af214edb5922e67cd68a951)]:
  - @clerk/types@4.50.1

## 3.2.2

### Patch Changes

- Removes the warning comment from `useReverification` ([#5454](https://github.com/clerk/javascript/pull/5454)) by [@octoper](https://github.com/octoper)

- Derive session status from server-side state ([#5447](https://github.com/clerk/javascript/pull/5447)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`1da28a2`](https://github.com/clerk/javascript/commit/1da28a28bf602069b433c15b92df21f682779294), [`f20dc15`](https://github.com/clerk/javascript/commit/f20dc159f542449e7f5b437b70d3eb3ba04d6975), [`4d9f1ee`](https://github.com/clerk/javascript/commit/4d9f1ee8c22fe1e4a166ff054d0af4d37b829f0a)]:
  - @clerk/types@4.50.0

## 3.2.1

### Patch Changes

- Updated dependencies [[`466ed13`](https://github.com/clerk/javascript/commit/466ed136af73b59b267d92ad3296039d1c3a4fcc)]:
  - @clerk/types@4.49.2

## 3.2.0

### Minor Changes

- Add shared `buildAccountsBaseUrl` utility. ([#5416](https://github.com/clerk/javascript/pull/5416)) by [@dstaley](https://github.com/dstaley)

## 3.1.0

### Minor Changes

- This introducing changes to `useReverification`, the changes include removing the array and returning the fetcher directly and also the dropping the options `throwOnCancel` and `onCancel` in favour of always throwing the cancellation error. ([#5396](https://github.com/clerk/javascript/pull/5396)) by [@octoper](https://github.com/octoper)

  ```tsx {{ filename: 'src/components/MyButton.tsx' }}
  import { useReverification } from '@clerk/clerk-react';
  import { isReverificationCancelledError } from '@clerk/clerk-react/error';

  type MyData = {
    balance: number;
  };

  export function MyButton() {
    const fetchMyData = () => fetch('/api/balance').then(res => res.json() as Promise<MyData>);
    const enhancedFetcher = useReverification(fetchMyData);

    const handleClick = async () => {
      try {
        const myData = await enhancedFetcher();
        //     ^ is typed as `MyData`
      } catch (e) {
        // Handle error returned from the fetcher here
        // You can also handle cancellation with the following
        if (isReverificationCancelledError(err)) {
          // Handle the cancellation error here
        }
      }
    };

    return <button onClick={handleClick}>Update User</button>;
  }
  ```

  These changes are also adding a new handler in options called `onNeedsReverification`, which can be used to create a custom UI
  to handle re-verification flow. When the handler is passed the default UI our AIO components provide will not be triggered so you will have to create and handle the re-verification process.

  ```tsx {{ filename: 'src/components/MyButtonCustom.tsx' }}
  import { useReverification } from '@clerk/clerk-react';
  import { isReverificationCancelledError } from '@clerk/clerk-react/error';

  type MyData = {
    balance: number;
  };

  export function MyButton() {
    const fetchMyData = () => fetch('/api/balance').then(res => res.json() as Promise<MyData>);
    const enhancedFetcher = useReverification(fetchMyData, {
      onNeedsReverification: ({ complete, cancel, level }) => {
        // e.g open a modal here and handle the re-verification flow
      },
    });

    const handleClick = async () => {
      try {
        const myData = await enhancedFetcher();
        //     ^ is typed as `MyData`
      } catch (e) {
        // Handle error returned from the fetcher here

        // You can also handle cancellation with the following
        if (isReverificationCancelledError(err)) {
          // Handle the cancellation error here
        }
      }
    };

    return <button onClick={handleClick}>Update User</button>;
  }
  ```

### Patch Changes

- Updated dependencies [[`3910ebe`](https://github.com/clerk/javascript/commit/3910ebea85817273f18fd2f3f142dd1c728e2220)]:
  - @clerk/types@4.49.1

## 3.0.2

### Patch Changes

- Improve JSDoc documentation ([#5372](https://github.com/clerk/javascript/pull/5372)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`725918d`](https://github.com/clerk/javascript/commit/725918df2e74cea15e9b748aaf103a52df8e8500), [`91d0f0b`](https://github.com/clerk/javascript/commit/91d0f0b0dccab7168ad4dc06c8629808938c235f), [`9572bf5`](https://github.com/clerk/javascript/commit/9572bf5bdfb7dc309ec8714989b98ab12174965b), [`39bbc51`](https://github.com/clerk/javascript/commit/39bbc5189a33dc6cebdc269ac2184dc4ffff2534), [`3dddcda`](https://github.com/clerk/javascript/commit/3dddcda191d8f8d6a9b02464f1f6374d3c6aacb9), [`7524943`](https://github.com/clerk/javascript/commit/7524943300d7e693d61cc1820b520abfadec1c64), [`150b5c8`](https://github.com/clerk/javascript/commit/150b5c89477abb0feab15e0a886179473f653cac), [`23c931e`](https://github.com/clerk/javascript/commit/23c931e9e95e6de992549ad499b477aca9a9c344), [`730262f`](https://github.com/clerk/javascript/commit/730262f0f973923c8749b09078c80c2fc966a8ec), [`0b18bb1`](https://github.com/clerk/javascript/commit/0b18bb1fe6fa3ded97547bb6b4d2c73030aad329), [`021bc5f`](https://github.com/clerk/javascript/commit/021bc5f40044d34e49956ce3c9b61d833d815b42), [`1a61390`](https://github.com/clerk/javascript/commit/1a61390d3482bd4af58508b972ad89dea56fa224)]:
  - @clerk/types@4.49.0

## 3.0.1

### Patch Changes

- Improve JSDoc documentation ([#5296](https://github.com/clerk/javascript/pull/5296)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`75879672c5805bfba1caca906ac0729497744164`](https://github.com/clerk/javascript/commit/75879672c5805bfba1caca906ac0729497744164), [`7ec95a7e59033600958aca4b86f3bcd5da947dec`](https://github.com/clerk/javascript/commit/7ec95a7e59033600958aca4b86f3bcd5da947dec), [`3c225d90227141dc62d955e76c7f8e0202524bc7`](https://github.com/clerk/javascript/commit/3c225d90227141dc62d955e76c7f8e0202524bc7), [`2a66c16af08573000bb619607346ac420cd4ce56`](https://github.com/clerk/javascript/commit/2a66c16af08573000bb619607346ac420cd4ce56)]:
  - @clerk/types@4.48.0

## 3.0.0

### Major Changes

- This new version introduces the following breaking changes: ([#5144](https://github.com/clerk/javascript/pull/5144)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  - Introduced a new `retry` utility function to replace the deprecated `callWithRetry`.
  - Removed the `callWithRetry` function and its associated tests.
  - Renamed `runWithExponentialBackOff` to `retry` for consistency.

  Migration steps:

  - Replace any usage of `callWithRetry` with the new `retry` function.
  - Update import statements from:
    ```typescript
    import { callWithRetry } from '@clerk/shared/callWithRetry';
    ```
    to:
    ```typescript
    import { retry } from '@clerk/shared/retry';
    ```
  - Replace any usage of `runWithExponentialBackOff` with `retry`.
  - Update import statements from:
    ```typescript
    import { runWithExponentialBackOff } from '@clerk/shared/utils';
    ```
    to:
    ```typescript
    import { retry } from '@clerk/shared/retry';
    ```

### Minor Changes

- Surface new `pending` session as a signed-in state ([#5136](https://github.com/clerk/javascript/pull/5136)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Update `TelemetryCollector` to throttle events after they've been sampled. ([#5236](https://github.com/clerk/javascript/pull/5236)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`28179323d9891bd13625e32c5682a3276e73cdae`](https://github.com/clerk/javascript/commit/28179323d9891bd13625e32c5682a3276e73cdae), [`c5c246ce91c01db9f1eaccbd354f646bcd24ec0a`](https://github.com/clerk/javascript/commit/c5c246ce91c01db9f1eaccbd354f646bcd24ec0a), [`bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a`](https://github.com/clerk/javascript/commit/bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a)]:
  - @clerk/types@4.47.0

## 2.22.0

### Minor Changes

- Introduce `EmailLinkErrorCodeStatus` to support users in custom flows and mark `EmailLinkErrorCode` as deprecated. ([#5142](https://github.com/clerk/javascript/pull/5142)) by [@alexcarpenter](https://github.com/alexcarpenter)

  ```diff
  - import { EmailLinkErrorCode } from '@clerk/nextjs/errors'
  + import { EmailLinkErrorCodeStatus } from '@clerk/nextjs/errors'
  ```

- Support passing additional properties to `eventPrebuiltComponentMounted()`, and ensure `withSignUp` is collected on `SignIn` mount. ([#5150](https://github.com/clerk/javascript/pull/5150)) by [@brkalow](https://github.com/brkalow)

### Patch Changes

- Previously, the `getCurrentOrganizationMembership()` function was duplicated in both `@clerk/vue` and `@clerk/shared/react`. This change moves the function to `@clerk/shared/organization`. ([#5168](https://github.com/clerk/javascript/pull/5168)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`a9b0087fca3f427f65907b358d9b5bc0c95921d8`](https://github.com/clerk/javascript/commit/a9b0087fca3f427f65907b358d9b5bc0c95921d8)]:
  - @clerk/types@4.46.1

## 2.21.1

### Patch Changes

- Updated dependencies [[`dd2cbfe9f30358b6b298901bb52fa378b0acdca3`](https://github.com/clerk/javascript/commit/dd2cbfe9f30358b6b298901bb52fa378b0acdca3), [`570d8386f6aa596bf7bb1659bdddb8dd4d992b1d`](https://github.com/clerk/javascript/commit/570d8386f6aa596bf7bb1659bdddb8dd4d992b1d)]:
  - @clerk/types@4.46.0

## 2.21.0

### Minor Changes

- Introduce unified environment variable handling across all supported platforms ([#4985](https://github.com/clerk/javascript/pull/4985)) by [@wobsoriano](https://github.com/wobsoriano)

  Usage:

  ```ts
  import { getEnvVariable } from '@clerk/shared/getEnvVariable';

  const publishableKey = getEnvVariable('CLERK_PUBLISHABLE_KEY');
  ```

### Patch Changes

- Small JSDoc and type improvements ([#5099](https://github.com/clerk/javascript/pull/5099)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`767ac85fe6ce0ee0594c923e9af701bb05f40a0b`](https://github.com/clerk/javascript/commit/767ac85fe6ce0ee0594c923e9af701bb05f40a0b), [`225b38c7187d31fc755155ea99834ca03894d36b`](https://github.com/clerk/javascript/commit/225b38c7187d31fc755155ea99834ca03894d36b), [`429f1bfe5f7a554ab1fdf265475ba6c8b3f78472`](https://github.com/clerk/javascript/commit/429f1bfe5f7a554ab1fdf265475ba6c8b3f78472)]:
  - @clerk/types@4.45.1

## 2.20.18

### Patch Changes

- Updated dependencies [[`d3152be7f01fbb5ca26aeddc2437021f4b7ecc83`](https://github.com/clerk/javascript/commit/d3152be7f01fbb5ca26aeddc2437021f4b7ecc83), [`f976349243da2b75023e59e802460e6f3592ebbd`](https://github.com/clerk/javascript/commit/f976349243da2b75023e59e802460e6f3592ebbd)]:
  - @clerk/types@4.45.0

## 2.20.17

### Patch Changes

- Previously the `createPathMatcher()` function was re-implemented both in `@clerk/astro` and `@clerk/nextjs`, this PR moves this logic to `@clerk/shared`. ([#5043](https://github.com/clerk/javascript/pull/5043)) by [@wobsoriano](https://github.com/wobsoriano)

  You can use it like so:

  ```ts
  import { createPathMatcher } from '@clerk/shared/pathMatcher';
  ```

- Improve JSDoc comments to provide better IntelliSense in your IDE ([#5053](https://github.com/clerk/javascript/pull/5053)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`833693a6792b621e72162d70673e7bdfa84a69b6`](https://github.com/clerk/javascript/commit/833693a6792b621e72162d70673e7bdfa84a69b6)]:
  - @clerk/types@4.44.3

## 2.20.16

### Patch Changes

- Catching ATOB errors in isPublishableKey ([#5029](https://github.com/clerk/javascript/pull/5029)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`1345cb487970a7347351897e80dfb829d85c41ea`](https://github.com/clerk/javascript/commit/1345cb487970a7347351897e80dfb829d85c41ea)]:
  - @clerk/types@4.44.2

## 2.20.15

### Patch Changes

- Introduced searching for members list on `OrganizationProfile` ([#4942](https://github.com/clerk/javascript/pull/4942)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`57c983fdc2b8d883623a2294daae0ac6c02c48f6`](https://github.com/clerk/javascript/commit/57c983fdc2b8d883623a2294daae0ac6c02c48f6), [`a26cf0ff10c76244975c454fdf6c615475d4bcd5`](https://github.com/clerk/javascript/commit/a26cf0ff10c76244975c454fdf6c615475d4bcd5)]:
  - @clerk/types@4.44.1

## 2.20.14

### Patch Changes

- Updated dependencies [[`2179690c10a61b117e82fdd566b34939f4d28bc1`](https://github.com/clerk/javascript/commit/2179690c10a61b117e82fdd566b34939f4d28bc1), [`bdb537a9902c0f0ae58ca1d4b7590d929f28fedb`](https://github.com/clerk/javascript/commit/bdb537a9902c0f0ae58ca1d4b7590d929f28fedb)]:
  - @clerk/types@4.44.0

## 2.20.13

### Patch Changes

- Re-add `handleValueOrFn` to subpaths with a deprecation warning. ([#4972](https://github.com/clerk/javascript/pull/4972)) by [@tmilewski](https://github.com/tmilewski)

- Updates error handling check within isEmailLinkError to fix issue where email link errors were not properly returning true. ([#4963](https://github.com/clerk/javascript/pull/4963)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`6e096564a459db4eaf953e99e570905b10be6c84`](https://github.com/clerk/javascript/commit/6e096564a459db4eaf953e99e570905b10be6c84)]:
  - @clerk/types@4.43.0

## 2.20.12

### Patch Changes

- Updated dependencies [[`fe3e49f61acefe8d7f1992405f7cb415fea2e5c8`](https://github.com/clerk/javascript/commit/fe3e49f61acefe8d7f1992405f7cb415fea2e5c8), [`4427c4702f64d4f28f7564ce5889d41e260aa519`](https://github.com/clerk/javascript/commit/4427c4702f64d4f28f7564ce5889d41e260aa519)]:
  - @clerk/types@4.42.0

## 2.20.11

### Patch Changes

- Updated dependencies [[`418ec5c62c4eb600566faab07684c068a29007e3`](https://github.com/clerk/javascript/commit/418ec5c62c4eb600566faab07684c068a29007e3)]:
  - @clerk/types@4.41.2

## 2.20.10

### Patch Changes

- Standardizing ambient declaration files for all SDKs ([#4919](https://github.com/clerk/javascript/pull/4919)) by [@jacekradko](https://github.com/jacekradko)

## 2.20.9

### Patch Changes

- Updated dependencies [[`7ffc99b48977b9f6c74c0c71c500b60cb8aba65e`](https://github.com/clerk/javascript/commit/7ffc99b48977b9f6c74c0c71c500b60cb8aba65e)]:
  - @clerk/types@4.41.1

## 2.20.8

### Patch Changes

- Updated dependencies [[`4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d`](https://github.com/clerk/javascript/commit/4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d), [`aa48b1f9e890b2402e9d05989a4820141076f7bf`](https://github.com/clerk/javascript/commit/aa48b1f9e890b2402e9d05989a4820141076f7bf), [`53bd34fff38b17498edf66cc4bc2d42d707f28dc`](https://github.com/clerk/javascript/commit/53bd34fff38b17498edf66cc4bc2d42d707f28dc)]:
  - @clerk/types@4.41.0

## 2.20.7

### Patch Changes

- Updated dependencies [[`fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6`](https://github.com/clerk/javascript/commit/fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6)]:
  - @clerk/types@4.40.3

## 2.20.6

### Patch Changes

- Updated dependencies [[`44cab6038af0a4d23869b3b292ece742fbbc4d85`](https://github.com/clerk/javascript/commit/44cab6038af0a4d23869b3b292ece742fbbc4d85)]:
  - @clerk/types@4.40.2

## 2.20.5

### Patch Changes

- Updated dependencies [[`80e1117631d35834705119a79cdcf9e0ed423fdd`](https://github.com/clerk/javascript/commit/80e1117631d35834705119a79cdcf9e0ed423fdd)]:
  - @clerk/types@4.40.1

## 2.20.4

### Patch Changes

- Updated dependencies [[`c9da04636ffe1ba804a1ce5e5b79027d3a2344d2`](https://github.com/clerk/javascript/commit/c9da04636ffe1ba804a1ce5e5b79027d3a2344d2)]:
  - @clerk/types@4.40.0

## 2.20.3

### Patch Changes

- Improve error message when Publishable Key is missing when trying to parse it. ([#4785](https://github.com/clerk/javascript/pull/4785)) by [@anagstef](https://github.com/anagstef)

## 2.20.2

### Patch Changes

- Updated dependencies [[`aeafa7c5efd50c893d088ac99199d7eaecc04025`](https://github.com/clerk/javascript/commit/aeafa7c5efd50c893d088ac99199d7eaecc04025), [`acd9326ef2d6942b981b3ee59c4b20ddd303323d`](https://github.com/clerk/javascript/commit/acd9326ef2d6942b981b3ee59c4b20ddd303323d)]:
  - @clerk/types@4.39.4

## 2.20.1

### Patch Changes

- Using the same peerDependencies semver for react and react-dom ([#4758](https://github.com/clerk/javascript/pull/4758)) by [@jacekradko](https://github.com/jacekradko)

- Introduce the `errorToJSON` utility function. ([#4604](https://github.com/clerk/javascript/pull/4604)) by [@anagstef](https://github.com/anagstef)

- Updated dependencies [[`e1748582d0c89462f48a482a7805871b7065fa19`](https://github.com/clerk/javascript/commit/e1748582d0c89462f48a482a7805871b7065fa19), [`7f7edcaa8228c26d19e9081979100ada7e982095`](https://github.com/clerk/javascript/commit/7f7edcaa8228c26d19e9081979100ada7e982095), [`dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d`](https://github.com/clerk/javascript/commit/dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d)]:
  - @clerk/types@4.39.3

## 2.20.0

### Minor Changes

- Switching to use ^ for semver ranges of internal @clerk/ production dependencies. ([#4664](https://github.com/clerk/javascript/pull/4664)) by [@jacekradko](https://github.com/jacekradko)

## 2.19.4

### Patch Changes

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/types@4.39.2

## 2.19.3

### Patch Changes

- Updated dependencies [[`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/types@4.39.1

## 2.19.2

### Patch Changes

- Improving error messaging from `useAssertWrappedByClerkProvider` to point out potential failure scenarios. ([#4719](https://github.com/clerk/javascript/pull/4719)) by [@jacekradko](https://github.com/jacekradko)

## 2.19.1

### Patch Changes

- Updated dependencies [[`550c7e9851329688e37be29b83ea0c3b12482af7`](https://github.com/clerk/javascript/commit/550c7e9851329688e37be29b83ea0c3b12482af7), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99)]:
  - @clerk/types@4.39.0

## 2.19.0

### Minor Changes

- Introduce new submodules: ([#4716](https://github.com/clerk/javascript/pull/4716)) by [@panteliselef](https://github.com/panteliselef)

  - Export `OAUTH_PROVIDERS` from `@clerk/shared/oauth`
  - Export `WEB3_PROVIDERS` from `@clerk/shared/web3`

### Patch Changes

- Updated dependencies [[`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3)]:
  - @clerk/types@4.38.0

## 2.18.1

### Patch Changes

- Updated dependencies [[`4e5e7f463c12893a21cb3b5f9317fc3f2945879b`](https://github.com/clerk/javascript/commit/4e5e7f463c12893a21cb3b5f9317fc3f2945879b)]:
  - @clerk/types@4.37.0

## 2.18.0

### Minor Changes

- Replace `session_step_up_verification_required` with `session_reverification_required` as the Clerk API error code used for reverification. ([#4699](https://github.com/clerk/javascript/pull/4699)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`8ee5d84995fa17532491ff96efac5738c9bcd9ef`](https://github.com/clerk/javascript/commit/8ee5d84995fa17532491ff96efac5738c9bcd9ef), [`09fedd1df155d30cc055ce701b133aa6470e9b47`](https://github.com/clerk/javascript/commit/09fedd1df155d30cc055ce701b133aa6470e9b47)]:
  - @clerk/types@4.36.0

## 2.17.1

### Patch Changes

- Updated dependencies [[`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d)]:
  - @clerk/types@4.35.1

## 2.17.0

### Minor Changes

- Introduce the `useReverification()` hook that handles the session reverification flow: ([#4536](https://github.com/clerk/javascript/pull/4536)) by [@panteliselef](https://github.com/panteliselef)

  - `__experimental_useReverification` -> `useReverification`
    Also replaces the following APIs:
  - `__experimental_reverificationError` -> `reverificationError`
  - `__experimental_reverificationErrorResponse` -> `reverificationErrorResponse`
  - `__experimental_isReverificationHint` -> `isReverificationHint`

### Patch Changes

- Gracefully handle missing reverification error metadata ([#4636](https://github.com/clerk/javascript/pull/4636)) by [@panteliselef](https://github.com/panteliselef)

- Rename userVerification to reverification to align with the feature name. ([#4634](https://github.com/clerk/javascript/pull/4634)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`dce4f7ffca7248c0500f0ec9a978672b1f2fad69`](https://github.com/clerk/javascript/commit/dce4f7ffca7248c0500f0ec9a978672b1f2fad69)]:
  - @clerk/types@4.35.0

## 2.16.1

### Patch Changes

- Updated dependencies [[`c70994b5b6f92a6550dfe37547f01bbfa810c223`](https://github.com/clerk/javascript/commit/c70994b5b6f92a6550dfe37547f01bbfa810c223), [`7623a99594e7329200b6b374e483152d7679ce66`](https://github.com/clerk/javascript/commit/7623a99594e7329200b6b374e483152d7679ce66)]:
  - @clerk/types@4.34.2

## 2.16.0

### Minor Changes

- Change `useReverification` to handle error in a callback, but still allow an error to be thrown via options. ([#4564](https://github.com/clerk/javascript/pull/4564)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Share hook return types ([#4583](https://github.com/clerk/javascript/pull/4583)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`e47eb5882a7fd4a8dee25933c6644790d6ea3407`](https://github.com/clerk/javascript/commit/e47eb5882a7fd4a8dee25933c6644790d6ea3407), [`273d16cb0665d4d960838cb294dc356f41814745`](https://github.com/clerk/javascript/commit/273d16cb0665d4d960838cb294dc356f41814745)]:
  - @clerk/types@4.34.1

## 2.15.0

### Minor Changes

- Rename `reverificationMismatch` to `reverificationError`. ([#4582](https://github.com/clerk/javascript/pull/4582)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Improve formatting of ClerkRuntimeError message to include error code. ([#4574](https://github.com/clerk/javascript/pull/4574)) by [@panteliselef](https://github.com/panteliselef)

## 2.14.0

### Minor Changes

- Update reverification config values to snake_case. ([#4556](https://github.com/clerk/javascript/pull/4556)) by [@panteliselef](https://github.com/panteliselef)

  For `__experimental_ReverificationConfig`

  - `strictMfa` changes to `strict_mfa`

  For `__experimental_SessionVerificationLevel`

  - `firstFactor` changes to `first_factor`
  - - `secondFactor` changes to `second_factor`
  - - `multiFactor` changes to `multi_factor`

### Patch Changes

- Protect /tokens requests by requiring a valid captcha token if the request fails with 401 ([#4559](https://github.com/clerk/javascript/pull/4559)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`46faeb6f59b19c963fb137c858347525b1cd9e19`](https://github.com/clerk/javascript/commit/46faeb6f59b19c963fb137c858347525b1cd9e19)]:
  - @clerk/types@4.34.0

## 2.13.0

### Minor Changes

- Replace `veryStrict` with `strictMfa` configuration for reverification. ([#4545](https://github.com/clerk/javascript/pull/4545)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`1c0b5001f7f975a2f3f54ad692526ecf7257847e`](https://github.com/clerk/javascript/commit/1c0b5001f7f975a2f3f54ad692526ecf7257847e), [`6217a3f7c94311d49f873214bd406961e0b8d6f7`](https://github.com/clerk/javascript/commit/6217a3f7c94311d49f873214bd406961e0b8d6f7), [`1783025cdb94c447028704c2121fa0b8af785904`](https://github.com/clerk/javascript/commit/1783025cdb94c447028704c2121fa0b8af785904)]:
  - @clerk/types@4.33.0

## 2.12.1

### Patch Changes

- Updated dependencies [[`7dbad4c5abd226d7b10941a626ead5d85b1a3f24`](https://github.com/clerk/javascript/commit/7dbad4c5abd226d7b10941a626ead5d85b1a3f24)]:
  - @clerk/types@4.32.0

## 2.12.0

### Minor Changes

- Introduce experimental support for passkeys in Expo (iOS, Android, and Web). ([#4352](https://github.com/clerk/javascript/pull/4352)) by [@AlexNti](https://github.com/AlexNti)

  To use passkeys in Expo projects, pass the `__experimental_passkeys` object, which can be imported from `@clerk/clerk-expo/passkeys`, to the `ClerkProvider` component:

  ```tsx
  import { ClerkProvider } from '@clerk/clerk-expo';
  import { passkeys } from '@clerk/clerk-expo/passkeys';

  <ClerkProvider __experimental_passkeys={passkeys}>{/* Your app here */}</ClerkProvider>;
  ```

  The API for using passkeys in Expo projects is the same as the one used in web apps:

  ```tsx
  // passkey creation
  const { user } = useUser();

  const handleCreatePasskey = async () => {
    if (!user) return;
    try {
      return await user.createPasskey();
    } catch (e: any) {
      // handle error
    }
  };

  // passkey authentication
  const { signIn, setActive } = useSignIn();

  const handlePasskeySignIn = async () => {
    try {
      const signInResponse = await signIn.authenticateWithPasskey();
      await setActive({ session: signInResponse.createdSessionId });
    } catch (err: any) {
      //handle error
    }
  };
  ```

### Patch Changes

- Adding missing dependencies to package.json ([#4522](https://github.com/clerk/javascript/pull/4522)) by [@jacekradko](https://github.com/jacekradko)

- Fixes issues in `ClerkRouter` that were causing inaccurate pathnames within Elements flows. Also fixes a dependency issue where `@clerk/elements` was pulling in the wrong version of `@clerk/shared`. ([#4513](https://github.com/clerk/javascript/pull/4513)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Fixing the peerDependencies for react and react-dom ([#4494](https://github.com/clerk/javascript/pull/4494)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`f7472e22877f62fc7f3c8d3efe409ff2276fb4a3`](https://github.com/clerk/javascript/commit/f7472e22877f62fc7f3c8d3efe409ff2276fb4a3), [`e199037b8f484abdeeb9fc24455a1b4b8c31c8dd`](https://github.com/clerk/javascript/commit/e199037b8f484abdeeb9fc24455a1b4b8c31c8dd), [`0e443ad7c76643420b50e5b169193e03f6ef79f9`](https://github.com/clerk/javascript/commit/0e443ad7c76643420b50e5b169193e03f6ef79f9), [`cc24c8145f1eea7fb91550f2c3e0bac3993e4320`](https://github.com/clerk/javascript/commit/cc24c8145f1eea7fb91550f2c3e0bac3993e4320)]:
  - @clerk/types@4.31.0

## 2.11.5

### Patch Changes

- Use shared `deriveState` function ([#4490](https://github.com/clerk/javascript/pull/4490)) by [@wobsoriano](https://github.com/wobsoriano)

## 2.11.4

### Patch Changes

- Expose internal `__internal_getOption` method from Clerk. ([#4456](https://github.com/clerk/javascript/pull/4456)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Correctly publish shim for `@clerk/shared/object` module as it is required by the metro bundler ([#4475](https://github.com/clerk/javascript/pull/4475)) by [@anagstef](https://github.com/anagstef)

- Updated dependencies [[`d74a6a7c0f291104c6bba722a8c432814d7b336e`](https://github.com/clerk/javascript/commit/d74a6a7c0f291104c6bba722a8c432814d7b336e), [`1a0c8fe665869e732d3c800bde0f5219fce54301`](https://github.com/clerk/javascript/commit/1a0c8fe665869e732d3c800bde0f5219fce54301)]:
  - @clerk/types@4.30.0

## 2.11.3

### Patch Changes

- Refactor imports from @clerk/shared to improve treeshaking support by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.11.0

### Minor Changes

- Introduce experimental reverification error helpers. ([#4362](https://github.com/clerk/javascript/pull/4362)) by [@panteliselef](https://github.com/panteliselef)

  - `reverificationMismatch` returns the error as an object which can later be used as a return value from a React Server Action.
  - `reverificationMismatchResponse` returns a Response with the above object serialized. It can be used in any Backend Javascript frameworks that supports `Response`.

### Patch Changes

- Updated dependencies [[`f875463da`](https://github.com/clerk/javascript/commit/f875463da9692f2d173b6d5388743cf720750ae3), [`5be7ca9fd`](https://github.com/clerk/javascript/commit/5be7ca9fd239c937cc88e20ce8f5bfc9f3b84f22), [`434b432f8`](https://github.com/clerk/javascript/commit/434b432f8c114825120eef0f2c278b8142ed1563)]:
  - @clerk/types@4.29.0

## 2.10.1

### Patch Changes

- Updated dependencies [[`3fdcdbf88`](https://github.com/clerk/javascript/commit/3fdcdbf88c38facf8b82563f634ec1b6604fd8e5)]:
  - @clerk/types@4.28.0

## 2.10.0

### Minor Changes

- Add experimental support for new UI components ([#4114](https://github.com/clerk/javascript/pull/4114)) by [@BRKalow](https://github.com/BRKalow)

### Patch Changes

- Updated dependencies [[`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc), [`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc)]:
  - @clerk/types@4.27.0

## 2.9.2

### Patch Changes

- Retry with exponential backoff if loadScript fails to load the script ([#4349](https://github.com/clerk/javascript/pull/4349)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`e81d45b72`](https://github.com/clerk/javascript/commit/e81d45b72c81403c7c206dac5454de1fef6bec57), [`99cdf9b67`](https://github.com/clerk/javascript/commit/99cdf9b67d1e99e66cc73d8a5bfce1f1f8df1b83), [`ce40ff6f0`](https://github.com/clerk/javascript/commit/ce40ff6f0d3bc79e33375be6dd5e03f140a07000), [`2102052c0`](https://github.com/clerk/javascript/commit/2102052c017065ab511339870fcebaa6719f2702)]:
  - @clerk/types@4.26.0

## 2.9.1

### Patch Changes

- Only retry the OAuth flow if the captcha check failed. ([#4329](https://github.com/clerk/javascript/pull/4329)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`2ba2fd148`](https://github.com/clerk/javascript/commit/2ba2fd1483b7561d7df9a1952ead0ee15e422131)]:
  - @clerk/types@4.25.1

## 2.9.0

### Minor Changes

- Rename `__experimental_assurance` to `__experimental_reverification`. ([#4268](https://github.com/clerk/javascript/pull/4268)) by [@panteliselef](https://github.com/panteliselef)

  - Supported levels are now are `firstFactor`, `secondFactor`, `multiFactor`.
  - Support maxAge is now replaced by maxAgeMinutes and afterMinutes depending on usage.
  - Introduced `____experimental_SessionVerificationTypes` that abstracts away the level and maxAge
    - Allowed values 'veryStrict' | 'strict' | 'moderate' | 'lax'

### Patch Changes

- Updated dependencies [[`fb932e5cf`](https://github.com/clerk/javascript/commit/fb932e5cf21315adf60bee0855b6bd5ee2ff9867)]:
  - @clerk/types@4.25.0

## 2.8.5

### Patch Changes

- Updated dependencies [[`f6fb8b53d`](https://github.com/clerk/javascript/commit/f6fb8b53d236863ad7eca576ee7a16cd33f3506b), [`4a8570590`](https://github.com/clerk/javascript/commit/4a857059059a02bb4f20893e08601e1e67babbed)]:
  - @clerk/types@4.24.0

## 2.8.4

### Patch Changes

- Updated dependencies [[`4749ed4c5`](https://github.com/clerk/javascript/commit/4749ed4c55a5ba5810451b8d436aad0d49829050), [`f1f17eaab`](https://github.com/clerk/javascript/commit/f1f17eaabed0dc4b7de405fb77d85503cf75ad33), [`2e35ac538`](https://github.com/clerk/javascript/commit/2e35ac53885f8008779940d41d1e804fa77ebfa9)]:
  - @clerk/types@4.23.0

## 2.8.3

### Patch Changes

- Updated dependencies [[`c9063853e`](https://github.com/clerk/javascript/commit/c9063853e538a4010f5d4e522a3da5abc80098a4), [`19d3808d4`](https://github.com/clerk/javascript/commit/19d3808d4672234944226d6709ec51214e8d6e1d), [`737bcbb0f`](https://github.com/clerk/javascript/commit/737bcbb0ffb5e2dcadbb02e8fc718fe8825c5842)]:
  - @clerk/types@4.22.0

## 2.8.2

### Patch Changes

- Exports `match` utility from the `path-to-regexp` lib. ([#4187](https://github.com/clerk/javascript/pull/4187)) by [@izaaklauer](https://github.com/izaaklauer)

- Fix issue where class-based routers were unable to access their private members during the `pathname` and `searchParams` methods. ([#4197](https://github.com/clerk/javascript/pull/4197)) by [@dstaley](https://github.com/dstaley)

- Internal change to move `iconImageUrl` util to `shared` package. ([#4188](https://github.com/clerk/javascript/pull/4188)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`2e5c550e4`](https://github.com/clerk/javascript/commit/2e5c550e4aec61150c2a17fdcd4a0e1273cb50e7)]:
  - @clerk/types@4.21.1

## 2.8.1

### Patch Changes

- Set correct "files" property in package.json ([#4172](https://github.com/clerk/javascript/pull/4172)) by [@LekoArts](https://github.com/LekoArts)

## 2.8.0

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

- Moves `fastDeepMerge` utils to `@clerk/shared` package. ([#4056](https://github.com/clerk/javascript/pull/4056)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`248142a6d`](https://github.com/clerk/javascript/commit/248142a6ded6ca937d0df7d628197f25228aadec), [`1189f71f8`](https://github.com/clerk/javascript/commit/1189f71f872f2683c12de5add5f154aeb953ca8d)]:
  - @clerk/types@4.21.0

## 2.7.2

### Patch Changes

- Vendor path-to-regexp ([#4145](https://github.com/clerk/javascript/pull/4145)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.7.1

### Patch Changes

- Updated dependencies [[`8c6909d46`](https://github.com/clerk/javascript/commit/8c6909d46328c943f1d464a28f1a324a27d0f3f1)]:
  - @clerk/types@4.20.1

## 2.7.0

### Minor Changes

- Remove `@clerk/elements` reliance on `next` and `@clerk/clerk-react` directly. The host router is now provided by `@clerk/nextjs`. ([#4064](https://github.com/clerk/javascript/pull/4064)) by [@BRKalow](https://github.com/BRKalow)

### Patch Changes

- Fixes issue where errors were incorrectly being returned as an `any` type. ([#4119](https://github.com/clerk/javascript/pull/4119)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`c63a5adf0`](https://github.com/clerk/javascript/commit/c63a5adf0ba4b99252146f168318f51b709bb5dd), [`8823c21a2`](https://github.com/clerk/javascript/commit/8823c21a26bc81cbc3ed007908b1a9ea474bd343), [`a0cb062fa`](https://github.com/clerk/javascript/commit/a0cb062faa4d23bef7a577e5cc486f4c5efe6bfa)]:
  - @clerk/types@4.20.0

## 2.6.2

### Patch Changes

- Updated dependencies [[`8a3b9f079`](https://github.com/clerk/javascript/commit/8a3b9f0793484b32dd609a5c80a194e62151d6ea), [`e95c28196`](https://github.com/clerk/javascript/commit/e95c2819675cea7963f2404e5f71f37ebed8d5e0)]:
  - @clerk/types@4.19.0

## 2.6.1

### Patch Changes

- Updated dependencies [[`82593173a`](https://github.com/clerk/javascript/commit/82593173aafbf6646e12c5779627cdcb138a1f27), [`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733)]:
  - @clerk/types@4.18.0

## 2.6.0

### Minor Changes

- Moves the common `ClerkRouter` interface into `@clerk/shared/router`. Elements has been refactored internally to import the router from the shared package. ([#4045](https://github.com/clerk/javascript/pull/4045)) by [@BRKalow](https://github.com/BRKalow)

### Patch Changes

- Updated dependencies [[`58e6754ad`](https://github.com/clerk/javascript/commit/58e6754ad9f9a1244b023ce1f5e5f2c1c4eb20e7), [`13693018f`](https://github.com/clerk/javascript/commit/13693018f4f7ac5d224698aa730e20960896f68c), [`3304dcc0b`](https://github.com/clerk/javascript/commit/3304dcc0bc93a92a7f729f585c60ff91d2ae04f6)]:
  - @clerk/types@4.17.0

## 2.5.5

### Patch Changes

- Updated dependencies [[`c1389492d`](https://github.com/clerk/javascript/commit/c1389492d8b6a9292ab04889bf776c0f45e66845)]:
  - @clerk/types@4.16.0

## 2.5.4

### Patch Changes

- Updated dependencies [[`0158c774a`](https://github.com/clerk/javascript/commit/0158c774af2243a2cd13b55c4d6fae877178c961), [`8be1a7abc`](https://github.com/clerk/javascript/commit/8be1a7abc8849d7d59552011bd6b25bc917d51f5)]:
  - @clerk/types@4.15.1

## 2.5.3

### Patch Changes

- Updated dependencies [[`247b3fd75`](https://github.com/clerk/javascript/commit/247b3fd75042365dc9f950db056b76f9fadfdcf6)]:
  - @clerk/types@4.15.0

## 2.5.2

### Patch Changes

- Updated dependencies [[`dc0e1c33d`](https://github.com/clerk/javascript/commit/dc0e1c33d6844b028cb1ee11c3359b886d609f3c)]:
  - @clerk/types@4.14.0

## 2.5.1

### Patch Changes

- Introduce functions that can be reused across front-end SDKs ([#3849](https://github.com/clerk/javascript/pull/3849)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`b6f0613dc`](https://github.com/clerk/javascript/commit/b6f0613dc9d8b0bab41cfabbaa8621b126e3bdf5)]:
  - @clerk/types@4.13.1

## 2.5.0

### Minor Changes

- Add a `nonce` to clerk-js' script loading options. Also adds a `nonce` prop to `ClerkProvider`. This can be used to thread a nonce value through to the clerk-js script load to support apps using a `strict-dynamic` content security policy. For next.js applications, the nonce will be automatically pulled from the CSP header and threaded through without needing any props so long as the provider is server-rendered. ([#3858](https://github.com/clerk/javascript/pull/3858)) by [@jescalan](https://github.com/jescalan)

### Patch Changes

- Updated dependencies [[`4e6c94e3f`](https://github.com/clerk/javascript/commit/4e6c94e3f4cc92cbba8bddcd2b90fcc9cfb83763)]:
  - @clerk/types@4.13.0

## 2.4.5

### Patch Changes

- Updated dependencies [[`9b2aeacb3`](https://github.com/clerk/javascript/commit/9b2aeacb32fff7c300bda458636a1cc81a42ee7b)]:
  - @clerk/types@4.12.1

## 2.4.4

### Patch Changes

- Updated dependencies [[`7e94fcf0f`](https://github.com/clerk/javascript/commit/7e94fcf0fcbee8842a54f7931c45190370aa870d)]:
  - @clerk/types@4.12.0

## 2.4.3

### Patch Changes

- Updated dependencies [[`568186cad`](https://github.com/clerk/javascript/commit/568186cad29acaf0b084a9f86ccb9d29bd23fcf4), [`407195270`](https://github.com/clerk/javascript/commit/407195270ed8aab6eef18c64a4918e3870fef471)]:
  - @clerk/types@4.11.0

## 2.4.2

### Patch Changes

- Updated dependencies [[`aa06f3ba7`](https://github.com/clerk/javascript/commit/aa06f3ba7e725071c90d4a1d6840060236da3c23), [`80e647731`](https://github.com/clerk/javascript/commit/80e64773135865434cf0e6c220e287397aa07937)]:
  - @clerk/types@4.10.0

## 2.4.1

### Patch Changes

- Updated dependencies [[`b48689705`](https://github.com/clerk/javascript/commit/b48689705f9fc2251d2f24addec7a0d0b1da0fe1)]:
  - @clerk/types@4.9.1

## 2.4.0

### Minor Changes

- Support reading / writing / removing suffixed/un-suffixed cookies from `@clerk/clerk-js` and `@clerk/backend`. by [@dimkl](https://github.com/dimkl)

  The `__session`, `__clerk_db_jwt` and `__client_uat` cookies will now include a suffix derived from the instance's publishakeKey. The cookie name suffixes are used to prevent cookie collisions, effectively enabling support for multiple Clerk applications running on the same domain.

### Patch Changes

- Updated dependencies [[`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`86c75e50c`](https://github.com/clerk/javascript/commit/86c75e50cba9c4efb480672f1b8c6a6fff4ef477)]:
  - @clerk/types@4.9.0

## 2.3.3

### Patch Changes

- Updated dependencies [[`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7)]:
  - @clerk/types@4.8.0

## 2.3.2

### Patch Changes

- Updated dependencies [[`d6b5006c4`](https://github.com/clerk/javascript/commit/d6b5006c4cc1b6f07bb3a6832b4ec6e65ea15814)]:
  - @clerk/types@4.7.0

## 2.3.1

### Patch Changes

- Updated dependencies [[`1273b04ec`](https://github.com/clerk/javascript/commit/1273b04ecf1866b59ef59a74abe31dbcc726da2c)]:
  - @clerk/types@4.6.1

## 2.3.0

### Minor Changes

- Move `isWebAuthnSupported`, `isWebAuthnAutofillSupported`, `isWebAuthnPlatformAuthenticatorSupported` to `@clerk/shared/webauthn`. ([#3472](https://github.com/clerk/javascript/pull/3472)) by [@panteliselef](https://github.com/panteliselef)

## 2.2.2

### Patch Changes

- Update `js-cookie` from `3.0.1` to `3.0.5`. Update `swr` from `2.2.0` to `2.2.5`. ([#3493](https://github.com/clerk/javascript/pull/3493)) by [@renovate](https://github.com/apps/renovate)

- Set `@clerk/types` as a dependency for packages that had it as a dev dependency. ([#3450](https://github.com/clerk/javascript/pull/3450)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`73e5d61e2`](https://github.com/clerk/javascript/commit/73e5d61e21ab3f77f3c8343bc63da0626466c7ac), [`b8e46328d`](https://github.com/clerk/javascript/commit/b8e46328da874859c4928f19f924219cd6520b11)]:
  - @clerk/types@4.6.0

## 2.2.1

### Patch Changes

- Add a custom logger to allow logging a message or warning to the console once per session, in order to avoid consecutive identical logs due to component rerenders. ([#3383](https://github.com/clerk/javascript/pull/3383)) by [@desiprisg](https://github.com/desiprisg)

- With the next major release, NextJS@15 will depend on `react` and `react-dom` v19, which is still in beta. We are updating our peer dependencies accordingly in order to accept `react` and `react-dom` @ `19.0.0-beta` ([#3428](https://github.com/clerk/javascript/pull/3428)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.2.0

### Minor Changes

- Unpin the version of swr and allow any minor or patch version. ([#3399](https://github.com/clerk/javascript/pull/3399)) by [@panteliselef](https://github.com/panteliselef)

## 2.1.1

### Patch Changes

- Re-organize cookie codebase into a central place, fix TokenUpdate event to be triggered on sign-out and drop duplicate event on refreshing token. ([#3362](https://github.com/clerk/javascript/pull/3362)) by [@dimkl](https://github.com/dimkl)

## 2.1.0

### Minor Changes

- Introduce new `client_mismatch` verification status for email link sign-in and sign-up. This error (and its message) will be shown if a verification link was opened in another device/browser from which the user initiated the sign-in/sign-up attempt. This functionality needs to be enabled in the Clerk dashboard. ([#3367](https://github.com/clerk/javascript/pull/3367)) by [@mzhong9723](https://github.com/mzhong9723)

## 2.0.2

### Patch Changes

- The following are all internal changes and not relevant to any end-user: ([#3341](https://github.com/clerk/javascript/pull/3341)) by [@LauraBeatris](https://github.com/LauraBeatris)

  Add telemetry events for `useSignIn`, `useSignUp`, `useOrganizations` and `useOrganizationList`

- The following are all internal changes and not relevant to any end-user: ([#3329](https://github.com/clerk/javascript/pull/3329)) by [@LauraBeatris](https://github.com/LauraBeatris)

  Create type interface for `TelemetryCollector` on `@clerk/types`. This allows to assign `telemetry` on the main Clerk SDK object, while inheriting from the actual `TelemetryCollector` implementation.

- Fix detection of legacy publishable keys when determining the default Clerk API URL. Previously, legacy keys would be treated as local. ([#3333](https://github.com/clerk/javascript/pull/3333)) by [@BRKalow](https://github.com/BRKalow)

## 2.0.1

### Patch Changes

- Internal change to add client-side caching to Clerk's telemetry. This prevents event flooding in frequently executed code paths, such as for React hooks or components. Gracefully falls back to the old behavior if e.g. `localStorage` is not available. As such, no public API changes and user changes are required. ([#3287](https://github.com/clerk/javascript/pull/3287)) by [@LauraBeatris](https://github.com/LauraBeatris)

- The following are all internal changes and not relevant to any end-user: ([#3279](https://github.com/clerk/javascript/pull/3279)) by [@LekoArts](https://github.com/LekoArts)

  - Rename the existing `eventComponentMounted` function inside `/telemetry` to `eventPrebuiltComponentMounted`. This better reflects that its `props` argument will be filtered for a relevant list for Clerk's prebuilt/all-in-one components.
  - Reuse the now freed up `eventComponentMounted` name to create a new helper function that accepts a flat object for its `props` but doesn't filter any. This is useful for components that are not prebuilt.

## 2.0.0

### Major Changes

- c2a090513: Change the minimal Node.js version required by Clerk to `18.17.0`.
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
- 71663c568: Internal update default apiUrl domain from clerk.dev to clerk.com
- 5f58a2274: Remove hashing and third-party cookie functionality related to development instance session syncing in favor of URL-based session syncing with query parameters.
- 52ff8fe6b: Upgrade React version to >=18 and add react-dom as peer dependency
  to fix issues with vite & rollup building.
- 97407d8aa: Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now.
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

### Minor Changes

- 743c4d204: Expose `revalidate` and `setData` for paginated lists of data in organization hooks.
  `const {userMemberships:{revalidate, setData}} = useOrganizationList({userMemberships:true})`
- 4b8bedc66: Move usage of internal useCoreX hooks to useX hooks
- fc3ffd880: Support for prompting a user to reset their password if it is found to be compromised during sign-in.
- 492b8a7b1: Increase the duration until data become stale for organization hooks.
- e5c989a03: Add `withoutTrailingSlash()`, `hasLeadingSlash()`, `withoutLeadingSlash()`, `withLeadingSlash()`, and `cleanDoubleSlashes()` to `@clerk/shared/url`.
- 97407d8aa: Introduce isomorphic `isomorphicBtoa` helper in `@clerk/shared`.
- 8cc45d2af: Allow dynamic values components props, even if these values change after the components are rendered. For example, a `SignIn` component with a `redirectUrl` prop passed in will always respect the latest value of `redirectUrl`.
- 8daf8451c: Add `error` for each paginated property return by `useOrganization` and `useOrganizationList` hooks.
- 0d1052ac2: Add a private \_\_navigateWithError util function to clerk for use in User Lockout scenarios
- 1fd2eff38: Allow manually passing a publishable/secret key pair to the `authMiddleware` and `clerkMiddleware` helpers.
- 5471c7e8d: Move and export the following from @clerk/clerk-js and @clerk/nextjs to @clerk/shared: - `DEV_BROWSER_SSO_JWT_PARAMETER` - `DEV_BROWSER_JWT_MARKER` - `DEV_BROWSER_SSO_JWT_KEY` - `setDevBrowserJWTInURL` - `getDevBrowserJWTFromURL` - `getDevBrowserJWTFromResponse`

### Patch Changes

- 1834a3ee4: fix(shared,clerk-js): Do not replace current URL if it does not contain a clerk token
- 896cb6104: Add `react-dom` to `peerDependenciesMeta` key inside `package.json`
- 64d3763ec: Fix incorrect pagination counters in data tables inside `<OrganizationProfile/>`.
- 8350109ab: Fix issue when clearing the hash DB JWT in Webkit
- 1dc28ab46: Do not display telemetry notice in CI
- 791c49807: Rename the @staging tag to @canary. Drop support for @next tag.
- ea4933655: Update TelemetryCollector to consider event-specific sampling rates.
- a68eb3083: Remove `"sideEffects": "false"` since the package has side-effects
- 2de442b24: Rename beta-v5 to beta
- db18787c4: Always drop **clerk_db_jwt and **dev_session params from the URL
- ef2325dcc: Introduce `isTruthy` helper to better cast environment variables to a boolean. Previously only the string `"true"` was checked, now `true`, `"true"`, `"1"`, and `1` will work.
- bab2e7e05: Support but warn when `afterSignInUrl` and `afterSignUpUrl` are used
- 7ecd6f6ab: Disable telemetry collection when window.navigator.webdriver is defined, indicating traffic from an automation tool.
- 12f3c5c55: Update the debBrowser handling logic to remove hash-based devBrowser JWTs from the URL. Even if v5 does not use the hash-based JWT at all, we still need to remove it from the URL in case clerk-js is initialised on a page after a redirect from an older clerk-js version, such as an AccountPortal using the v4 components
- c776f86fb: Add missing `telemetry` entry to `files` array in `package.json`
- d4ff346dd: Version bump to convert `@clerk/shared` from alpha to beta
- 7644b7472: Improve the default value for `CLERK_API_URL` by utilizing the publishable key to differentiate between local, staging and prod environments.
- 2ec9f6b09: Ensure that inside `isValidBrowser()` and `isBrowserOnline()` the existence of `window` is checked before trying to access `window.navigator`
- 75ea300bc: Add `useAssertWrappedByClerkProvider` to internal code. If you use hooks like `useAuth` outside of the `<ClerkProvider />` context an error will be thrown. For example:

  ```shell
  @clerk/clerk-react: useAuth can only be used within the <ClerkProvider /> component
  ```

- f5d55bb1f: Add clerkTraceId to ClerkBackendApiResponse and ClerkAPIResponseError to allow for better tracing and debugging API error responses.
  Uses `clerk_trace_id` when available in a response and defaults to [`cf-ray` identifier](https://developers.cloudflare.com/fundamentals/reference/cloudflare-ray-id/) if missing.
- d30ea1faa: Change the default behavior of `afterSignOutUrl`, `afterSignIn` and `afterSignUp` props to be redirected to `/` instead of the Account Portal defined URL.
- 38d8b3e8a: Fixes a bug where Invitations from `useOrganization` incorrectly depended on options for memberships.
- be991365e: Add `joinURL` helper to `@clerk/shared/url`
- 8350f73a6: Account for legacy frontendApi keys in buildPublishableKey
- e0e79b4fe: Use the errorThrower shared utility when throwing errors
- fb794ce7b: Support older iOS 13.3 and 13.4 mobile devices
- 40ac4b645: Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry.
- 6f755addd: Improve compatibility with Expo
- 6eab66050: Remove legacy \_\_dev_session from URL search params

## 2.0.0-beta.23

### Patch Changes

- Introduce forceRedirectUrl and fallbackRedirectUrl ([#3162](https://github.com/clerk/javascript/pull/3162)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.0.0-beta.22

### Patch Changes

- Support older iOS 13.3 and 13.4 mobile devices ([#3188](https://github.com/clerk/javascript/pull/3188)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.0.0-beta.21

### Minor Changes

- Support for prompting a user to reset their password if it is found to be compromised during sign-in. ([#3034](https://github.com/clerk/javascript/pull/3034)) by [@yourtallness](https://github.com/yourtallness)

- Allow manually passing a publishable/secret key pair to the `authMiddleware` and `clerkMiddleware` helpers. ([#3001](https://github.com/clerk/javascript/pull/3001)) by [@desiprisg](https://github.com/desiprisg)

## 2.0.0-beta.20

### Patch Changes

- Fix issue when clearing the hash DB JWT in Webkit ([#2998](https://github.com/clerk/javascript/pull/2998)) by [@anagstef](https://github.com/anagstef)

## 2.0.0-beta.19

### Patch Changes

- Account for legacy frontendApi keys in buildPublishableKey by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.0.0-beta.18

### Minor Changes

- Add `withoutTrailingSlash()`, `hasLeadingSlash()`, `withoutLeadingSlash()`, `withLeadingSlash()`, and `cleanDoubleSlashes()` to `@clerk/shared/url`. ([#2896](https://github.com/clerk/javascript/pull/2896)) by [@LekoArts](https://github.com/LekoArts)

### Patch Changes

- Ensure that inside `isValidBrowser()` and `isBrowserOnline()` the existence of `window` is checked before trying to access `window.navigator` ([#2913](https://github.com/clerk/javascript/pull/2913)) by [@mario-jerkovic](https://github.com/mario-jerkovic)

## 2.0.0-beta.17

### Patch Changes

- fix(shared,clerk-js): Do not replace current URL if it does not contain a clerk token ([#2879](https://github.com/clerk/javascript/pull/2879)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.0.0-beta.16

### Patch Changes

- Always drop **clerk_db_jwt and **dev_session params from the URL by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.0.0-beta.15

### Patch Changes

- Remove legacy \_\_dev_session from URL search params ([#2867](https://github.com/clerk/javascript/pull/2867)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.0.0-beta.14

### Patch Changes

- Update the debBrowser handling logic to remove hash-based devBrowser JWTs from the URL. Even if v5 does not use the hash-based JWT at all, we still need to remove it from the URL in case clerk-js is initialised on a page after a redirect from an older clerk-js version, such as an AccountPortal using the v4 components ([#2858](https://github.com/clerk/javascript/pull/2858)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.0.0-beta.13

### Patch Changes

- Rename beta-v5 to beta by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.0.0-beta-v5.12

### Minor Changes

- Add `error` for each paginated property return by `useOrganization` and `useOrganizationList` hooks. ([#2743](https://github.com/clerk/javascript/pull/2743)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Add `joinURL` helper to `@clerk/shared/url` ([#2725](https://github.com/clerk/javascript/pull/2725)) by [@LekoArts](https://github.com/LekoArts)

## 2.0.0-beta-v5.11

### Patch Changes

- Version bump to convert `@clerk/shared` from alpha to beta ([#2638](https://github.com/clerk/javascript/pull/2638)) by [@dimkl](https://github.com/dimkl)

## 2.0.0-alpha-v5.10

### Minor Changes

- Allow dynamic values components props, even if these values change after the components are rendered. For example, a `SignIn` component with a `redirectUrl` prop passed in will always respect the latest value of `redirectUrl`. ([#2515](https://github.com/clerk/javascript/pull/2515)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.0.0-alpha-v5.9

### Patch Changes

- Do not display telemetry notice in CI ([#2503](https://github.com/clerk/javascript/pull/2503)) by [@LekoArts](https://github.com/LekoArts)

- Update TelemetryCollector to consider event-specific sampling rates. ([#2487](https://github.com/clerk/javascript/pull/2487)) by [@BRKalow](https://github.com/BRKalow)

- Fixes a bug where Invitations from `useOrganization` incorrectly depended on options for memberships. ([#2472](https://github.com/clerk/javascript/pull/2472)) by [@panteliselef](https://github.com/panteliselef)

## 2.0.0-alpha-v5.8

### Patch Changes

- Disable telemetry collection when window.navigator.webdriver is defined, indicating traffic from an automation tool. ([#2448](https://github.com/clerk/javascript/pull/2448)) by [@BRKalow](https://github.com/BRKalow)

## 2.0.0-alpha-v5.7

### Major Changes

- Remove hashing and third-party cookie functionality related to development instance session syncing in favor of URL-based session syncing with query parameters. ([#2367](https://github.com/clerk/javascript/pull/2367)) by [@tmilewski](https://github.com/tmilewski)

## 2.0.0-alpha-v5.6

### Patch Changes

- Add `react-dom` to `peerDependenciesMeta` key inside `package.json` ([#2322](https://github.com/clerk/javascript/pull/2322)) by [@LekoArts](https://github.com/LekoArts)

- Add `useAssertWrappedByClerkProvider` to internal code. If you use hooks like `useAuth` outside of the `<ClerkProvider />` context an error will be thrown. For example: ([#2299](https://github.com/clerk/javascript/pull/2299)) by [@tmilewski](https://github.com/tmilewski)

  ```shell
  @clerk/clerk-react: useAuth can only be used within the <ClerkProvider /> component
  ```

## 2.0.0-alpha-v5.5

### Patch Changes

- Change the default behavior of `afterSignOutUrl`, `afterSignIn` and `afterSignUp` props to be redirected to `/` instead of the Account Portal defined URL. ([#2020](https://github.com/clerk/javascript/pull/2020)) by [@octoper](https://github.com/octoper)

## 2.0.0-alpha-v5.4

### Minor Changes

- Move usage of internal useCoreX hooks to useX hooks ([#2111](https://github.com/clerk/javascript/pull/2111)) by [@LekoArts](https://github.com/LekoArts)

### Patch Changes

- Add missing `telemetry` entry to `files` array in `package.json` ([#2229](https://github.com/clerk/javascript/pull/2229)) by [@LekoArts](https://github.com/LekoArts)

## 2.0.0-alpha-v5.3

### Major Changes

- Upgrade React version to >=18 and add react-dom as peer dependency ([#2164](https://github.com/clerk/javascript/pull/2164)) by [@dimkl](https://github.com/dimkl)

  to fix issues with vite & rollup building.

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

## 2.0.0-alpha-v5.2

### Major Changes

- Change the minimal Node.js version required by Clerk to `18.17.0`. ([#2162](https://github.com/clerk/javascript/pull/2162)) by [@dimkl](https://github.com/dimkl)

## 2.0.0-alpha-v5.1

### Major Changes

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

### Minor Changes

- Increase the duration until data become stale for organization hooks. ([#2093](https://github.com/clerk/javascript/pull/2093)) by [@panteliselef](https://github.com/panteliselef)

- Add a private \_\_navigateWithError util function to clerk for use in User Lockout scenarios ([#2043](https://github.com/clerk/javascript/pull/2043)) by [@yourtallness](https://github.com/yourtallness)

- Move and export the following from @clerk/clerk-js and @clerk/nextjs to @clerk/shared: ([#2149](https://github.com/clerk/javascript/pull/2149)) by [@dimkl](https://github.com/dimkl)

      - `DEV_BROWSER_SSO_JWT_PARAMETER`
      - `DEV_BROWSER_JWT_MARKER`
      - `DEV_BROWSER_SSO_JWT_KEY`
      - `setDevBrowserJWTInURL`
      - `getDevBrowserJWTFromURL`
      - `getDevBrowserJWTFromResponse`

### Patch Changes

- Fix incorrect pagination counters in data tables inside `<OrganizationProfile/>`. ([#2056](https://github.com/clerk/javascript/pull/2056)) by [@panteliselef](https://github.com/panteliselef)

- Use the errorThrower shared utility when throwing errors ([#1999](https://github.com/clerk/javascript/pull/1999)) by [@anagstef](https://github.com/anagstef)

## 2.0.0-alpha-v5.0

### Major Changes

- Internal update default apiUrl domain from clerk.dev to clerk.com ([#1878](https://github.com/clerk/javascript/pull/1878)) by [@dimkl](https://github.com/dimkl)

- Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

### Minor Changes

- Expose `revalidate` and `setData` for paginated lists of data in organization hooks. ([#1745](https://github.com/clerk/javascript/pull/1745)) by [@panteliselef](https://github.com/panteliselef)

  `const {userMemberships:{revalidate, setData}} = useOrganizationList({userMemberships:true})`

- Introduce isomorphic `isomorphicBtoa` helper in `@clerk/shared`. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Rename the @staging tag to @canary. Drop support for @next tag. ([#2015](https://github.com/clerk/javascript/pull/2015)) by [@anagstef](https://github.com/anagstef)

- Remove `"sideEffects": "false"` since the package has side-effects ([#1974](https://github.com/clerk/javascript/pull/1974)) by [@LekoArts](https://github.com/LekoArts)

- Introduce `isTruthy` helper to better cast environment variables to a boolean. Previously only the string `"true"` was checked, now `true`, `"true"`, `"1"`, and `1` will work. ([#2002](https://github.com/clerk/javascript/pull/2002)) by [@LekoArts](https://github.com/LekoArts)

- Improve the default value for `CLERK_API_URL` by utilizing the publishable key to differentiate between local, staging and prod environments. ([#1955](https://github.com/clerk/javascript/pull/1955)) by [@desiprisg](https://github.com/desiprisg)

- Add clerkTraceId to ClerkBackendApiResponse and ClerkAPIResponseError to allow for better tracing and debugging API error responses. ([#1986](https://github.com/clerk/javascript/pull/1986)) by [@Nikpolik](https://github.com/Nikpolik)

  Uses `clerk_trace_id` when available in a response and defaults to [`cf-ray` identifier](https://developers.cloudflare.com/fundamentals/reference/cloudflare-ray-id/) if missing.

- Improve compatibility with Expo ([#1958](https://github.com/clerk/javascript/pull/1958)) by [@clerk-cookie](https://github.com/clerk-cookie)

## 1.0.0

### Major Changes

- The package was reworked to allow for better isomorphic use cases and ESM support, resulting in some breaking changes. It now allows for [subpath exports](https://nodejs.org/api/packages.html#subpath-exports) and restricts some imports to specific subpaths. ([#1898](https://github.com/clerk/javascript/pull/1898)) by [@LekoArts](https://github.com/LekoArts)

  Instead of importing from the root `@clerk/shared` import you can now use subpaths for most things:

  ```diff
  - import { deprecated, OrganizationProvider } from "@clerk/shared"
  + import { deprecated } from "@clerk/shared/deprecated"
  + import { OrganizationProvider } from "@clerk/shared/react"
  ```

  By using subpaths you can tell bundlers to only bundle specific parts, potentially helping with tree-shaking. It also mitigates issues where e.g. modules only relevant for React where picked up in Node.js-only environments.

  If you're not using `@clerk/shared` directly (only by proxy through e.g. `@clerk/clerk-react`) you don't need to do anything. If you are relying on `@clerk/shared`, please read through the breaking changes below and change your code accordingly. You can rely on your IDE to give you hints on which exports are available at `@clerk/shared` and `@clerk/shared/<name>` subpaths.

  **Breaking Changes**

  - `@clerk/shared` was and still is a dual CJS/ESM package. The ESM files provided by `@clerk/shared` now use `.mjs` file extensions and also define them in their import paths, following the ESM spec. Your bundler should handle this for you.
  - Some imports where moved from the root `@clerk/shared` import to isolated subpaths.

    - Helper utils for cookies and globs:

      ```diff
      - import { createCookieHandler, globs } from "@clerk/shared"
      + import { createCookieHandler } from "@clerk/shared/cookie"
      + import { globs } from "@clerk/shared/globs"
      ```

    - Everything related to React. Below is a small example and the full list of exports:

      ```diff
      - import { useSafeLayoutEffect, ClerkInstanceContext } from "@clerk/shared"
      + import { useSafeLayoutEffect, ClerkInstanceContext } from "@clerk/shared/react"
      ```

      Full list of exports moved to `@clerk/shared/react`:

      ```ts
      export {
        ClerkInstanceContext,
        ClientContext,
        OrganizationContext,
        OrganizationProvider,
        SessionContext,
        UserContext,
        assertContextExists,
        createContextAndHook,
        useClerkInstanceContext,
        useClientContext,
        useOrganization,
        useOrganizationContext,
        useOrganizationList,
        useOrganizations,
        useSafeLayoutEffect,
        useSessionContext,
        useUserContext,
      };
      ```

  If you run into an issues that might be a bug, please [open a bug report](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml) with a minimal reproduction.

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Improve internal test coverage and fix small bug inside `callWithRetry` ([#1925](https://github.com/clerk/javascript/pull/1925)) by [@LekoArts](https://github.com/LekoArts)

- Update imports of `@clerk/shared` to granular entrypoints. This addresses warnings during a Next.js build that are the result of unsupported APIs being included in the module graph of builds for the edge runtime. ([#1924](https://github.com/clerk/javascript/pull/1924)) by [@BRKalow](https://github.com/BRKalow)

## 0.24.5

### Patch Changes

- Add `Clerk - ` prefix to deprecation warnings ([#1890](https://github.com/clerk/javascript/pull/1890)) by [@dimkl](https://github.com/dimkl)

- Deprecate the `organization.__unstable__invitationUpdate` and `organization.__unstable__membershipUpdate` methods. ([#1879](https://github.com/clerk/javascript/pull/1879)) by [@panteliselef](https://github.com/panteliselef)

- Internal updates and improvements, with the only public change that npm should no longer complain about missing `react` peerDependency. ([#1868](https://github.com/clerk/javascript/pull/1868)) by [@LekoArts](https://github.com/LekoArts)

  Updates:

  - Remove `@clerk/shared/testUtils` export (which was only used for internal usage)
  - Add `peerDependenciesMeta` to make `react` peerDep optional

- In invite members screen of the <OrganizationProfile /> component, consume any invalid email addresses as they are returned in the API error and remove them from the input automatically. ([#1869](https://github.com/clerk/javascript/pull/1869)) by [@chanioxaris](https://github.com/chanioxaris)

## 0.24.4

### Patch Changes

- Warn about _MagicLink_ deprecations: ([#1836](https://github.com/clerk/javascript/pull/1836)) by [@dimkl](https://github.com/dimkl)

  - `MagicLinkError`
  - `isMagicLinkError`
  - `MagicLinkErrorCode`
  - `handleMagicLinkVerification`
  - `createMagicLinkFlow`
  - `useMagicLink`

- Introduce new `*EmailLink*` helpers that will replace the `*MagicLink*` helpers. ([#1833](https://github.com/clerk/javascript/pull/1833)) by [@dimkl](https://github.com/dimkl)

  Also marked all the `*MagicLink*` as deprecated using JSDocs.

## 0.24.3

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

- Revert the removal of the `clerkError` property from `ClerkAPIError` class. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Retry the implemented changes from [#1767](https://github.com/clerk/javascript/pull/1767) which were reverted in [#1806](https://github.com/clerk/javascript/pull/1806) due to RSC related errors (not all uses components had the `use client` directive). Restore the original PR and add additional `use client` directives to ensure it works correctly. by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 0.24.2

### Patch Changes

- Introduce ClerkRuntimeError class for localizing error messages in ClerkJS components ([#1813](https://github.com/clerk/javascript/pull/1813)) by [@panteliselef](https://github.com/panteliselef)

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

## 0.24.1

### Patch Changes

- Temporarily revert internal change to resolve RSC-related errors ([#1806](https://github.com/clerk/javascript/pull/1806)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 0.24.0

### Minor Changes

- Introduce `getClerkJsMajorVersionOrTag()`, `getScriptUrl()`, `callWithRetry()` ([#1769](https://github.com/clerk/javascript/pull/1769)) by [@dimkl](https://github.com/dimkl)

- Add the `use client` directive in `@clerk/shared` to make the package compatible with an RSC environment. ([#1767](https://github.com/clerk/javascript/pull/1767)) by [@dimkl](https://github.com/dimkl)

  Remove several helpers from `@clerk/nextjs` and import them from `@clerk/shared` instead.

### Patch Changes

- Apply deprecation warnings for `@clerk/shared`: ([#1789](https://github.com/clerk/javascript/pull/1789)) by [@dimkl](https://github.com/dimkl)

  - `OrganizationContext`
  - `organizationList`
  - `useOrganizations`
  - `getRequestUrl`

- Removes the patch for disabling swr-devtools causing apps with swr and browsers with the devtools extention to break. ([#1794](https://github.com/clerk/javascript/pull/1794)) by [@panteliselef](https://github.com/panteliselef)

## 0.23.1

### Patch Changes

- Introduce `invitations` in useOrganization, which enables to fetch invitations as paginated lists. ([#1766](https://github.com/clerk/javascript/pull/1766)) by [@panteliselef](https://github.com/panteliselef)

  Deprecate `invitationList` in favor of the above introduction.

- Safer usage of `localStorage` by checking if `window` is available in current environment ([#1774](https://github.com/clerk/javascript/pull/1774)) by [@LekoArts](https://github.com/LekoArts)

- Fix SyntaxError on non-module imports by dropping support for import.meta (used in vite) ([#1782](https://github.com/clerk/javascript/pull/1782)) by [@dimkl](https://github.com/dimkl)

- `deprecated()` & `deprecatedProperty` warnings will be hidden in test/production ([#1784](https://github.com/clerk/javascript/pull/1784)) by [@dimkl](https://github.com/dimkl)

  environments and when there is no NODE_ENV environment variable defined.

## 0.23.0

### Minor Changes

- Introduce `deprecated()` and `deprecatedProperty()` helper methods to report deprecation warnings once on console ([#1743](https://github.com/clerk/javascript/pull/1743)) by [@dimkl](https://github.com/dimkl)

- Introduce `isDevelopmentEnvironment()` helper method ([#1752](https://github.com/clerk/javascript/pull/1752)) by [@dimkl](https://github.com/dimkl)

## 0.22.1

### Patch Changes

- Fix: swr devtools breaks applications with clerk ([#1694](https://github.com/clerk/javascript/pull/1694)) by [@panteliselef](https://github.com/panteliselef)

  - Force disable swr devtools for organization hooks
  - Let the swr devtool to pick the correct react version

- Deprecate `membershipList` in favor of `memberships` that supports paginated responses ([#1708](https://github.com/clerk/javascript/pull/1708)) by [@panteliselef](https://github.com/panteliselef)

## 0.22.0

### Minor Changes

- Introduces userInvitations from `useOrganizationList` ([#1520](https://github.com/clerk/javascript/pull/1520)) by [@panteliselef](https://github.com/panteliselef)

  `userInvitations` is a paginated list of data. It can be used to create Paginated tables or Infinite lists.

### Patch Changes

- Introduces a new resource called OrganizationMembership ([#1572](https://github.com/clerk/javascript/pull/1572)) by [@panteliselef](https://github.com/panteliselef)

  - useOrganization has been updated in order to return a list of domain with the above type

- Introduces Membership Requests in <OrganizationProfile /> ([#1576](https://github.com/clerk/javascript/pull/1576)) by [@panteliselef](https://github.com/panteliselef)

  - This is a list of users that have requested to join the active organization

- Updates signature of OrganizationMembership.retrieve to support backwards compatibility while allowing using the new paginated responses. ([#1606](https://github.com/clerk/javascript/pull/1606)) by [@panteliselef](https://github.com/panteliselef)

  - userMemberships is now also part of the returned values of useOrganizationList

- Introduces a new resource called OrganizationDomain ([#1569](https://github.com/clerk/javascript/pull/1569)) by [@panteliselef](https://github.com/panteliselef)

  - useOrganization has been updated in order to return a list of domain with the above type

- Introduces list of suggestions within <OrganizationSwitcher/> ([#1577](https://github.com/clerk/javascript/pull/1577)) by [@panteliselef](https://github.com/panteliselef)

  - Users can request to join a suggested organization

## 0.21.0

### Minor Changes

- Handle the construction of zxcvbn errors with information from FAPI ([#1526](https://github.com/clerk/javascript/pull/1526)) by [@raptisj](https://github.com/raptisj)

## 0.20.0

### Minor Changes

- Deprecate the `useOrganizations` react hook. The hook can be replaced from useClerk, useOrganization, useOrganizationList ([#1466](https://github.com/clerk/javascript/pull/1466)) by [@panteliselef](https://github.com/panteliselef)

## 0.19.1

### Patch Changes

- Optimize all images displayed within the Clerk components, such as Avatars, static OAuth provider assets etc. All images are now resized and compressed. Additionally, all images are automatically converted into more efficient formats (`avif`, `webp`) if they are supported by the user's browser, otherwise all images fall back to `jpeg`. ([#1367](https://github.com/clerk/javascript/pull/1367)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 0.19.0

### Minor Changes

- Export error helpers from the shared package to the framework specific packages ([#1308](https://github.com/clerk/javascript/pull/1308)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Resolve all reported ESM build issues by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 0.18.0

### Minor Changes

- ESM/CJS support for `@clerk/clerk-react` by [@nikosdouvlis](https://github.com/nikosdouvlis)

  Changes that should affect users and OS contributors:

  - Better source map support for `@clerk/clerk-react`, `@clerk/shared`. This affects anyone developing in our monorepo or anyone using a debugger with Clerk installed in their app.
  - Easier node_modules debugging as `@clerk/clerk-react`, `@clerk/shared` and `@clerk/nextjs` are no longer getting bundled as a single-file package. This also improves error logging in nextjs a lot, as nextjs usually logs the line that threw the error - a minified, single-file package, usually consists of a very long single-line module, so logging error in NextJS wasn't ideal.
  - Headless clerk-js bundle size reduced by ~10kb, normal clerk-ks by ~6kb
  - A new `clerkJSVersion` prop has been added on ClerkProvider allowing to fetch a specific clerk-js version.

## [0.17.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.17.0-staging.0...@clerk/shared@0.17.0) (2023-05-23)

**Note:** Version bump only for package @clerk/shared

### [0.16.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.16.2-staging.0...@clerk/shared@0.16.2) (2023-05-18)

**Note:** Version bump only for package @clerk/shared

### [0.16.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.16.1-staging.1...@clerk/shared@0.16.1) (2023-05-17)

**Note:** Version bump only for package @clerk/shared

## [0.16.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.16.0-staging.3...@clerk/shared@0.16.0) (2023-05-15)

**Note:** Version bump only for package @clerk/shared

### [0.15.7](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.7-staging.4...@clerk/shared@0.15.7) (2023-05-04)

**Note:** Version bump only for package @clerk/shared

### [0.15.7-staging.4](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.7-staging.3...@clerk/shared@0.15.7-staging.4) (2023-05-04)

**Note:** Version bump only for package @clerk/shared

### [0.15.7-staging.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.7-staging.2...@clerk/shared@0.15.7-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/shared

### [0.15.6](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.6-staging.0...@clerk/shared@0.15.6) (2023-04-19)

**Note:** Version bump only for package @clerk/shared

### [0.15.5](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.4...@clerk/shared@0.15.5) (2023-04-19)

**Note:** Version bump only for package @clerk/shared

### [0.15.4](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.4-staging.0...@clerk/shared@0.15.4) (2023-04-12)

**Note:** Version bump only for package @clerk/shared

### [0.15.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.3-staging.3...@clerk/shared@0.15.3) (2023-04-11)

**Note:** Version bump only for package @clerk/shared

### [0.15.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.2-staging.0...@clerk/shared@0.15.2) (2023-04-06)

**Note:** Version bump only for package @clerk/shared

### [0.15.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.1-staging.3...@clerk/shared@0.15.1) (2023-03-31)

**Note:** Version bump only for package @clerk/shared

### [0.15.1-staging.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.1-staging.2...@clerk/shared@0.15.1-staging.3) (2023-03-31)

### Bug Fixes

- **shared:** Check if in clientSide only via window ([bef819e](https://github.com/clerk/clerk_docker/commit/bef819e7596337a96f073bb130fbc14244975d8c))

## [0.15.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.0-staging.0...@clerk/shared@0.15.0) (2023-03-29)

**Note:** Version bump only for package @clerk/shared

### [0.13.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.13.1-staging.2...@clerk/shared@0.13.1) (2023-03-10)

**Note:** Version bump only for package @clerk/shared

## [0.13.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.13.0-staging.0...@clerk/shared@0.13.0) (2023-03-09)

**Note:** Version bump only for package @clerk/shared

### [0.12.4](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.12.4-staging.0...@clerk/shared@0.12.4) (2023-03-07)

**Note:** Version bump only for package @clerk/shared

### [0.12.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.12.3-staging.1...@clerk/shared@0.12.3) (2023-03-03)

**Note:** Version bump only for package @clerk/shared

### [0.12.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.12.2-staging.0...@clerk/shared@0.12.2) (2023-03-01)

**Note:** Version bump only for package @clerk/shared

### [0.12.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.12.1-staging.0...@clerk/shared@0.12.1) (2023-02-25)

**Note:** Version bump only for package @clerk/shared

## [0.12.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.12.0-staging.0...@clerk/shared@0.12.0) (2023-02-24)

**Note:** Version bump only for package @clerk/shared

### [0.11.5-staging.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.11.5-staging.1...@clerk/shared@0.11.5-staging.2) (2023-02-22)

**Note:** Version bump only for package @clerk/shared

### [0.11.4](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.11.4-staging.0...@clerk/shared@0.11.4) (2023-02-17)

**Note:** Version bump only for package @clerk/shared

### [0.11.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.11.3-staging.1...@clerk/shared@0.11.3) (2023-02-15)

**Note:** Version bump only for package @clerk/shared

### [0.11.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.11.2-staging.1...@clerk/shared@0.11.2) (2023-02-10)

**Note:** Version bump only for package @clerk/shared

### [0.11.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.11.1-staging.0...@clerk/shared@0.11.1) (2023-02-07)

**Note:** Version bump only for package @clerk/shared

### [0.11.1-staging.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.11.0-staging.0...@clerk/shared@0.11.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/shared

## [0.11.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.11.0-staging.0...@clerk/shared@0.11.0) (2023-02-07)

**Note:** Version bump only for package @clerk/shared

## [0.10.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.10.0-staging.2...@clerk/shared@0.10.0) (2023-02-01)

**Note:** Version bump only for package @clerk/shared

### [0.9.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.9.3-staging.4...@clerk/shared@0.9.3) (2023-01-27)

**Note:** Version bump only for package @clerk/shared

### [0.9.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.9.2-staging.0...@clerk/shared@0.9.2) (2023-01-24)

### Bug Fixes

- **backend,clerk-sdk-node,shared:** Drop support for NodeJS 12 ([d9169ab](https://github.com/clerk/clerk_docker/commit/d9169ab4873e1745d7250628f5bf8c8f7da49421))

### [0.9.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.9.0...@clerk/shared@0.9.1) (2023-01-20)

**Note:** Version bump only for package @clerk/shared

## [0.9.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.9.0-staging.2...@clerk/shared@0.9.0) (2023-01-17)

### Bug Fixes

- **backend,clerk-sdk-node,shared:** Support node12 runtimes ([fdcd6b3](https://github.com/clerk/clerk_docker/commit/fdcd6b3f7c61490297a5fdfa80228cbb7787b49b))
- **shared:** Replace atob with isomorphicAtob ([bfb1825](https://github.com/clerk/clerk_docker/commit/bfb1825e78cdf9970425dc79f3f9610e8a2699f7))

### [0.8.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.8.3-staging.1...@clerk/shared@0.8.3) (2022-12-19)

**Note:** Version bump only for package @clerk/shared

### [0.8.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.8.2-staging.0...@clerk/shared@0.8.2) (2022-12-13)

**Note:** Version bump only for package @clerk/shared

### [0.8.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.8.0...@clerk/shared@0.8.1) (2022-12-12)

**Note:** Version bump only for package @clerk/shared

## [0.8.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.8.0-staging.1...@clerk/shared@0.8.0) (2022-12-09)

**Note:** Version bump only for package @clerk/shared

### [0.7.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.7.1...@clerk/shared@0.7.2) (2022-12-08)

**Note:** Version bump only for package @clerk/shared

### [0.7.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.7.1-staging.0...@clerk/shared@0.7.1) (2022-12-08)

**Note:** Version bump only for package @clerk/shared

## [0.7.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.7.0-staging.0...@clerk/shared@0.7.0) (2022-12-02)

**Note:** Version bump only for package @clerk/shared

## [0.6.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.6.0-staging.5...@clerk/shared@0.6.0) (2022-11-30)

**Note:** Version bump only for package @clerk/shared

## [0.6.0-staging.5](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.6.0-staging.4...@clerk/shared@0.6.0-staging.5) (2022-11-29)

**Note:** Version bump only for package @clerk/shared

### [0.5.7](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.7-staging.0...@clerk/shared@0.5.7) (2022-11-25)

**Note:** Version bump only for package @clerk/shared

### [0.5.6](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.6-staging.0...@clerk/shared@0.5.6) (2022-11-25)

**Note:** Version bump only for package @clerk/shared

### [0.5.5](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.4...@clerk/shared@0.5.5) (2022-11-23)

**Note:** Version bump only for package @clerk/shared

### [0.5.4](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.4-staging.3...@clerk/shared@0.5.4) (2022-11-22)

**Note:** Version bump only for package @clerk/shared

### [0.5.4-staging.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.4-staging.2...@clerk/shared@0.5.4-staging.3) (2022-11-21)

**Note:** Version bump only for package @clerk/shared

### [0.5.4-staging.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.4-staging.1...@clerk/shared@0.5.4-staging.2) (2022-11-21)

### Bug Fixes

- **shared:** Add optional locale param to `formatRelative` ([0582eb7](https://github.com/clerk/clerk_docker/commit/0582eb78de7c1807e1709d038cfda13cb6db589d))
- **shared:** Fix failing tests ([08bff82](https://github.com/clerk/clerk_docker/commit/08bff821466986d9698fd209eca2ae0872fe9147))

### [0.5.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.3-staging.1...@clerk/shared@0.5.3) (2022-11-18)

**Note:** Version bump only for package @clerk/shared

### [0.5.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.2-staging.3...@clerk/shared@0.5.2) (2022-11-15)

**Note:** Version bump only for package @clerk/shared

### [0.5.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.1-staging.1...@clerk/shared@0.5.1) (2022-11-10)

**Note:** Version bump only for package @clerk/shared

## [0.5.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.4.3-staging.2...@clerk/shared@0.5.0) (2022-11-05)

### Features

- **clerk-js,shared:** Introduce private unstable\_\_mutate to force mutate swr state ([2a21dd8](https://github.com/clerk/clerk_docker/commit/2a21dd8ea3935f3889044c063fe7af4bfc03cbfd))

### [0.4.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.4.2-staging.7...@clerk/shared@0.4.2) (2022-11-03)

**Note:** Version bump only for package @clerk/shared

### [0.4.2-staging.4](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.4.2-staging.3...@clerk/shared@0.4.2-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/shared

### [0.4.2-staging.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.4.2-staging.1...@clerk/shared@0.4.2-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/shared

### [0.4.2-staging.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.4.2-staging.1...@clerk/shared@0.4.2-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/shared

### [0.4.2-staging.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.4.1...@clerk/shared@0.4.2-staging.1) (2022-11-02)

**Note:** Version bump only for package @clerk/shared

### [0.4.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.0.4...@clerk/shared@0.4.1) (2022-10-24)

**Note:** Version bump only for package @clerk/shared

### [0.0.6](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.0.4...@clerk/shared@0.0.6) (2022-10-24)

**Note:** Version bump only for package @clerk/shared

### [0.0.5](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.0.4...@clerk/shared@0.0.5) (2022-10-14)

**Note:** Version bump only for package @clerk/shared

### [0.0.4](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.0.2-staging.2...@clerk/shared@0.0.4) (2022-10-14)

### Bug Fixes

- **shared:** Version bump for shared ([c0cebb5](https://github.com/clerk/clerk_docker/commit/c0cebb50bc94fa44e37b96c5a645a8b18ba37df8))

### [0.0.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.0.2-staging.2...@clerk/shared@0.0.2) (2022-10-14)

**Note:** Version bump only for package @clerk/shared

### [0.0.2-staging.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.3.27...@clerk/shared@0.0.2-staging.1) (2022-10-13)

**Note:** Version bump only for package @clerk/shared
