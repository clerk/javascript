# @clerk/hono

## 0.1.0

### Minor Changes

- Add Frontend API proxy support to `@clerk/hono` via the `frontendApiProxy` option on `clerkMiddleware`. When enabled, requests matching the proxy path (default `/__clerk`) are forwarded to Clerk's Frontend API, allowing Clerk to work in environments where direct API access is blocked by ad blockers or firewalls. The `proxyUrl` for auth handshake is automatically derived from the request when `frontendApiProxy` is configured. ([#7994](https://github.com/clerk/javascript/pull/7994)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

### Patch Changes

- Updated dependencies [[`a8c64cc`](https://github.com/clerk/javascript/commit/a8c64cce3735483230d785fbd916859cb630f752), [`776ee1b`](https://github.com/clerk/javascript/commit/776ee1b3f3a576976b43352a93b6988340e83353), [`7fb870d`](https://github.com/clerk/javascript/commit/7fb870d37a8c153e9b0e6313b1d38ff53bc2f49b), [`09cb6d4`](https://github.com/clerk/javascript/commit/09cb6d4d45286cf4e657b880696bf0ff81a8a3e8), [`09088ed`](https://github.com/clerk/javascript/commit/09088edeba8eaa299130f52e6aa26f2b2771e7e3)]:
  - @clerk/backend@3.0.2
  - @clerk/shared@4.1.0

## 0.0.3

### Patch Changes

- Update README prerequisites to match actual `package.json` engine and peer dependency constraints. ([#7972](https://github.com/clerk/javascript/pull/7972)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`55ece85`](https://github.com/clerk/javascript/commit/55ece8518b14c1976fb00bfe45a681981060239d)]:
  - @clerk/backend@3.0.1

## 0.0.2

### Patch Changes

- Initial release of `@clerk/hono` - the official Clerk SDK for Hono. ([#7789](https://github.com/clerk/javascript/pull/7789)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  This package provides:
  - `clerkMiddleware()` - Middleware to authenticate requests and attach auth data to Hono context
  - `getAuth(c)` - Helper to retrieve auth data from Hono context
  - `verifyWebhook(c)` - Webhook verification via `@clerk/hono/webhooks`

  **Usage:**

  ```typescript
  import { Hono } from 'hono';
  import { clerkMiddleware, getAuth } from '@clerk/hono';

  const app = new Hono();

  app.use('*', clerkMiddleware());

  app.get('/protected', c => {
    const { userId } = getAuth(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    return c.json({ userId });
  });
  ```

  Based on the community `@hono/clerk-auth` package. Thank you to Vaggelis Yfantis for the original implementation!

- Updated dependencies [[`0a9cce3`](https://github.com/clerk/javascript/commit/0a9cce375046a7ff5944a7f2a140e787fe66996c), [`e35960f`](https://github.com/clerk/javascript/commit/e35960f5e44ab758d0ab0545691f44dbafd5e7cb), [`c9f0d77`](https://github.com/clerk/javascript/commit/c9f0d777f59673bfe614e1a8502cefe5445ce06f), [`1bd1747`](https://github.com/clerk/javascript/commit/1bd174781b83d3712a07e7dfe1acf73742497349), [`6a2ff9e`](https://github.com/clerk/javascript/commit/6a2ff9e957145124bc3d00bf10f566b613c7c60f), [`d2cee35`](https://github.com/clerk/javascript/commit/d2cee35d73d69130ad8c94650286d3b43dda55e6), [`44d0e5c`](https://github.com/clerk/javascript/commit/44d0e5c94a366e4a35049955c89b9cb3c430a0e9), [`6ec5f08`](https://github.com/clerk/javascript/commit/6ec5f08ae6c0aa4034dcb17c4a148a6baa95a47b), [`0a9cce3`](https://github.com/clerk/javascript/commit/0a9cce375046a7ff5944a7f2a140e787fe66996c), [`8c47111`](https://github.com/clerk/javascript/commit/8c4711153552d50c67611fea668f82f7c8fb7f9c), [`00882e8`](https://github.com/clerk/javascript/commit/00882e8993d9aa49feb1106bfe68164b72ba29d9), [`a374c18`](https://github.com/clerk/javascript/commit/a374c18e31793b0872fe193ab7808747749bc56b), [`466d642`](https://github.com/clerk/javascript/commit/466d642ce332d191e2c03d9cb9ca76b0d3776cc6), [`5ef4a77`](https://github.com/clerk/javascript/commit/5ef4a7791cf2820bb12b038cf3b751252362f6e4), [`3abe9ed`](https://github.com/clerk/javascript/commit/3abe9ed4c44166cb95f61e92f7742abb0c6df82a), [`af85739`](https://github.com/clerk/javascript/commit/af85739195f5f4b353ba4395a547bbc8a8b26483), [`10b5bea`](https://github.com/clerk/javascript/commit/10b5bea85c3bb588c59f13628f32a82934f5de5a), [`a05d130`](https://github.com/clerk/javascript/commit/a05d130451226d2c512c9ea1e9a9f1e4cb2e3ba2), [`b193f79`](https://github.com/clerk/javascript/commit/b193f79ee86eb8ce788db4b747d1c64a1c7c6ac5), [`e9d2f2f`](https://github.com/clerk/javascript/commit/e9d2f2fd1ea027f7936353dfcdc905bcb01c3ad7), [`6e90b7f`](https://github.com/clerk/javascript/commit/6e90b7f8033dabac68e594894b30a49596a32625), [`43fc7b7`](https://github.com/clerk/javascript/commit/43fc7b7b40cf7c42cfb0aa8b2e2058243a3f38f5), [`0f1011a`](https://github.com/clerk/javascript/commit/0f1011a062c3705fc1a69593672b96ad03936de1), [`cbc5618`](https://github.com/clerk/javascript/commit/cbc56181fb28e35c1974cf4de8256a939c3ff029), [`38def4f`](https://github.com/clerk/javascript/commit/38def4fedc99b6be03c88a3737b8bd5940e5bff3), [`7772f45`](https://github.com/clerk/javascript/commit/7772f45ee601787373cf3c9a24eddf3f76c26bee), [`a3e689f`](https://github.com/clerk/javascript/commit/a3e689f3b7f2f3799a263da4b7bb14c0e49e42b7), [`583f7a9`](https://github.com/clerk/javascript/commit/583f7a9a689310f4bdd2c66f5258261f08e47109), [`965e7f1`](https://github.com/clerk/javascript/commit/965e7f1b635cf25ebfe129ec338e05137d1aba9e), [`84483c2`](https://github.com/clerk/javascript/commit/84483c2a710cef9165f9cd016ebccff13b004c78), [`2b76081`](https://github.com/clerk/javascript/commit/2b7608145611c10443a999cae4373a1acfd7cab7), [`f284c3d`](https://github.com/clerk/javascript/commit/f284c3d1d122b725594d0a287d0fb838f6d191f5), [`ac34168`](https://github.com/clerk/javascript/commit/ac3416849954780bd873ed3fe20a173a8aee89aa), [`cf0d0dc`](https://github.com/clerk/javascript/commit/cf0d0dc7f6380d6e0c4e552090345b7943c22b35), [`0aff70e`](https://github.com/clerk/javascript/commit/0aff70eab5353a8a6ea171e6b69d3b600acdd45e), [`690280e`](https://github.com/clerk/javascript/commit/690280e91b0809d8e0fd1e161dd753dc62801244), [`b971d0b`](https://github.com/clerk/javascript/commit/b971d0bb3eed3a6d3d187b4a296bc6e56271014e), [`22d1689`](https://github.com/clerk/javascript/commit/22d1689cb4b789fe48134b08a4e3dc5921ac0e1b), [`e9a1d4d`](https://github.com/clerk/javascript/commit/e9a1d4dcac8a61595739f83a5b9b2bc18a35f59d), [`c088dde`](https://github.com/clerk/javascript/commit/c088dde13004dc16dd37c17572a52efda69843c9), [`8902e21`](https://github.com/clerk/javascript/commit/8902e216bab83fe85a491bdbc2ac8129e83e5a73), [`972f6a0`](https://github.com/clerk/javascript/commit/972f6a015d720c4867aa24b4503db3968187e523), [`a1aaff3`](https://github.com/clerk/javascript/commit/a1aaff33700ed81f31a9f340cf6cb3a82efeef85), [`d85646a`](https://github.com/clerk/javascript/commit/d85646a0b9efc893e2548dc55dbf08954117e8c2), [`ab3dd16`](https://github.com/clerk/javascript/commit/ab3dd160608318363b42f5f46730ed32ee12335b), [`4a8cb10`](https://github.com/clerk/javascript/commit/4a8cb10117bc9b2c9f5efe4f3d243b79dc815251), [`fd195c1`](https://github.com/clerk/javascript/commit/fd195c14086cba7087c74af472d2558d04fe3afd), [`8887fac`](https://github.com/clerk/javascript/commit/8887fac93fccffac7d1612cf5fb773ae614ceb22), [`0b4b481`](https://github.com/clerk/javascript/commit/0b4b4811c99f3261deea9e7bd2215e51ad32d4bf), [`5f88dbb`](https://github.com/clerk/javascript/commit/5f88dbb84620e15d9bdaa5f2e78dc3e975104204), [`dc886a9`](https://github.com/clerk/javascript/commit/dc886a9575a0c7366c57cba59ecde260baeb6dad), [`428629b`](https://github.com/clerk/javascript/commit/428629b46a249f432ab6406a92ff628ab5850773), [`8b95393`](https://github.com/clerk/javascript/commit/8b953930536b12bd8ade6ba5c2092f40770ea8df), [`c438fa5`](https://github.com/clerk/javascript/commit/c438fa529cd410eb237c734c04b583d225e66a07), [`c438fa5`](https://github.com/clerk/javascript/commit/c438fa529cd410eb237c734c04b583d225e66a07), [`fd195c1`](https://github.com/clerk/javascript/commit/fd195c14086cba7087c74af472d2558d04fe3afd), [`fd69edb`](https://github.com/clerk/javascript/commit/fd69edbcfe2dfca71d1e6d41af9647701dba2823), [`8d91225`](https://github.com/clerk/javascript/commit/8d91225acc67349fd0d35f982dedb0618f3179e9), [`1fc95e2`](https://github.com/clerk/javascript/commit/1fc95e2a0a5a99314b1bb4d59d3f3e3f03accb3d), [`3dac245`](https://github.com/clerk/javascript/commit/3dac245456dae1522ee2546fc9cc29454f1f345f), [`a4c3b47`](https://github.com/clerk/javascript/commit/a4c3b477dad70dd55fe58f433415b7cc9618a225), [`7c3c002`](https://github.com/clerk/javascript/commit/7c3c002d6d81305124f934f41025799f4f03103e), [`d8bbc66`](https://github.com/clerk/javascript/commit/d8bbc66d47b476b3405c03e1b0632144afdd716b), [`3983cf8`](https://github.com/clerk/javascript/commit/3983cf85d657c247d46f94403cb121f13f6f01e4), [`f1f1d09`](https://github.com/clerk/javascript/commit/f1f1d09e675cf9005348d2380df0da3f293047a6), [`736314f`](https://github.com/clerk/javascript/commit/736314f8641be005ddeacfccae9135a1b153d6f6), [`2cc7dbb`](https://github.com/clerk/javascript/commit/2cc7dbbb212f92e2889460086b50eb644b8ba69d), [`0af2e6f`](https://github.com/clerk/javascript/commit/0af2e6fc0a1e59af30799faf75cd998ec6072ebf), [`86d2199`](https://github.com/clerk/javascript/commit/86d219970cdc21d5160f0c8adf2c30fc34f1c7b9), [`da415c8`](https://github.com/clerk/javascript/commit/da415c813332998dafd4ec4690a6731a98ded65f), [`97c9ab3`](https://github.com/clerk/javascript/commit/97c9ab3c2130dbe4500c3feb83232d1ccbbd910e), [`cc63aab`](https://github.com/clerk/javascript/commit/cc63aab479853f0e15947837eff5a4f46c71c9f2), [`a7a38ab`](https://github.com/clerk/javascript/commit/a7a38ab76c66d3f147b8b1169c1ce86ceb0d9384), [`cfa70ce`](https://github.com/clerk/javascript/commit/cfa70ce766b687b781ba984ee3d72ac1081b0c97), [`25d37b0`](https://github.com/clerk/javascript/commit/25d37b03605365395d5d7a667ce657ab243a0a68), [`26254f0`](https://github.com/clerk/javascript/commit/26254f0463312115eca4bc0a396c5acd0703187b), [`c97e6af`](https://github.com/clerk/javascript/commit/c97e6af1d6974270843ce91ce17b0c36ee828aa0), [`5b24266`](https://github.com/clerk/javascript/commit/5b24266bab99b8d4873050d72a59da4884f5619e), [`d98727e`](https://github.com/clerk/javascript/commit/d98727e30b191087abb817acfc29cfccdb3a7047), [`79e2622`](https://github.com/clerk/javascript/commit/79e2622c18917709a351a122846def44c7e22f0c), [`12b3070`](https://github.com/clerk/javascript/commit/12b3070f3f102256f19e6af6acffb05b66d42e0b)]:
  - @clerk/shared@4.0.0
  - @clerk/backend@3.0.0
