# Change Log

## 5.0.0-alpha-v5.0

### Major Changes

- Drop deprecations. Migration steps: ([#2006](https://github.com/clerk/javascript/pull/2006)) by [@dimkl](https://github.com/dimkl)

  - use `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` instead of `NEXT_PUBLIC_CLERK_FRONTEND_API` env variable
  - use `NEXT_PUBLIC_CLERK_JS_VERSION` instead of `CLERK_JS_VERSION`
  - use `CLERK_SECRET_KEY` instead of `CLERK_API_KEY`
  - use `publishableKey` instead of `frontendApi`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`
  - use `@clerk/nextjs` instead of `@clerk/nextjs/app-beta`
  - use `@clerk/nextjs` instead of `@clerk/nextjs/ssr`
  - use `@clerk/nextjs` instead of `@clerk/nextjs/edge-middleware` or `@clerk/nextjs/edge-middlewarefiles`
  - use `@clerk/nextjs` instead of `@clerk/nextjs/api`
  - use middleware with `authMiddleware` instead of `withClerkMiddleware`
  - avoid using exported constants: `API_URL`, `API_VERSION`, `CLERK_JS_URL`, `CLERK_JS_VERSION`, `DOMAIN`, `IS_SATELLITE`, `PROXY_URL`, `PUBLISHABLE_KEY`, `SECRET_KEY`, `SIGN_IN_URL`, `SIGN_UP_URL`

- Internal update default apiUrl domain from clerk.dev to clerk.com ([#1878](https://github.com/clerk/javascript/pull/1878)) by [@dimkl](https://github.com/dimkl)

- Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

- Drop `user`, `session`, and `organization` resources from the returned value of `auth()`. ([#1947](https://github.com/clerk/javascript/pull/1947)) by [@panteliselef](https://github.com/panteliselef)

### Minor Changes

- Experimental support for `<Gate/>` with role checks. ([#1942](https://github.com/clerk/javascript/pull/1942)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Introduce `isTruthy` helper to better cast environment variables to a boolean. Previously only the string `"true"` was checked, now `true`, `"true"`, `"1"`, and `1` will work. ([#2002](https://github.com/clerk/javascript/pull/2002)) by [@LekoArts](https://github.com/LekoArts)

- Ignore `.test.ts` files for the build output. Should result in smaller bundle size. ([#2005](https://github.com/clerk/javascript/pull/2005)) by [@LekoArts](https://github.com/LekoArts)

- Fix type inferance for auth helper. ([#2047](https://github.com/clerk/javascript/pull/2047)) by [@panteliselef](https://github.com/panteliselef)

- Improve the default value for `CLERK_API_URL` by utilizing the publishable key to differentiate between local, staging and prod environments. ([#1955](https://github.com/clerk/javascript/pull/1955)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`743c4d204`](https://github.com/clerk/javascript/commit/743c4d20423790b554e66923466081c0d3b0d9ed), [`791c49807`](https://github.com/clerk/javascript/commit/791c49807c3c9e19964cbf621c935d237caeecf3), [`a68eb3083`](https://github.com/clerk/javascript/commit/a68eb3083ff68459cd33098e2df190a5ba26c841), [`ef2325dcc`](https://github.com/clerk/javascript/commit/ef2325dcc18729e9ce9ee5823e9a963efa51dbc1), [`8b6b094b9`](https://github.com/clerk/javascript/commit/8b6b094b9c7d09eeae90f8bdfac44d53513aa63d), [`71663c568`](https://github.com/clerk/javascript/commit/71663c568926b1d60b97aa7ccc5298d05b618af2), [`90aa2ea9c`](https://github.com/clerk/javascript/commit/90aa2ea9c4675662cee581298b49bd76ec8f8850), [`a605335e1`](https://github.com/clerk/javascript/commit/a605335e1e6f37d9b02170282974b0e1406e3f98), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`ae3a6683a`](https://github.com/clerk/javascript/commit/ae3a6683aa1a28e5201325463e4211229b641711), [`c22cd5214`](https://github.com/clerk/javascript/commit/c22cd52147492ba25f3c07bdbe6bbc4eb49a5cf0), [`c7e6d00f5`](https://github.com/clerk/javascript/commit/c7e6d00f56e73df4ed87712e74ad9d5bcaca8924), [`797e327e0`](https://github.com/clerk/javascript/commit/797e327e05ce6bd23320555a9e7d6fadbd9d624f), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`7644b7472`](https://github.com/clerk/javascript/commit/7644b74726ba73e615a1256f9ff3fa03b0f8bc30), [`f5d55bb1f`](https://github.com/clerk/javascript/commit/f5d55bb1fc6a87303fb8bf461c3a917ae4da4005), [`6f755addd`](https://github.com/clerk/javascript/commit/6f755addd0886b9ff8b0d5dbe48e37470049acad)]:
  - @clerk/shared@2.0.0-alpha-v5.0
  - @clerk/backend@1.0.0-alpha-v5.0
  - @clerk/clerk-react@5.0.0-alpha-v5.0

## 4.25.7

### Patch Changes

- Fix an issue where only static routes would be allowed by `publicRoutes` prop from `authMiddleware`. ([#1928](https://github.com/clerk/javascript/pull/1928)) by [@desiprisg](https://github.com/desiprisg)

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Update `<ClerkProvider />` to work in client components within the app router. This allows rendering of the provider in client components, previously the pages router provider was being imported and throwing an error. ([#1840](https://github.com/clerk/javascript/pull/1840)) by [@BRKalow](https://github.com/BRKalow)

- Update imports of `@clerk/shared` to granular entrypoints. This addresses warnings during a Next.js build that are the result of unsupported APIs being included in the module graph of builds for the edge runtime. ([#1924](https://github.com/clerk/javascript/pull/1924)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`3bf64107e`](https://github.com/clerk/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`52f8553d2`](https://github.com/clerk/javascript/commit/52f8553d22f9454ee1194fd162410db15da7a4be), [`92727eec3`](https://github.com/clerk/javascript/commit/92727eec39566278263ffa118a085493f964eb94), [`b09b66eec`](https://github.com/clerk/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerk/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62), [`37d8856ba`](https://github.com/clerk/javascript/commit/37d8856babb9db8edf763455172c4d22d6035036), [`aa4cd7615`](https://github.com/clerk/javascript/commit/aa4cd761585b888706a36a6eed7436a8f0476dbf)]:
  - @clerk/clerk-sdk-node@4.12.16
  - @clerk/backend@0.31.3
  - @clerk/shared@1.0.0
  - @clerk/clerk-react@4.27.0
  - @clerk/types@3.57.0

## 4.25.6

### Patch Changes

- Update the error thrown by auth() or getAuth() to indicate that if the /src directory exists, then the middleware.ts file needs to be placed inside it, otherwise the middleware will not run. ([#1908](https://github.com/clerk/javascript/pull/1908)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`9ca215702`](https://github.com/clerk/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11)]:
  - @clerk/types@3.56.1
  - @clerk/backend@0.31.2
  - @clerk/clerk-react@4.26.6
  - @clerk/clerk-sdk-node@4.12.15

## 4.25.5

### Patch Changes

- Improves the debug log output, and changes the internal behavior to use multiple `console.log()` calls. This will help to avoid any platform logging limitations per call. ([#1866](https://github.com/clerk/javascript/pull/1866)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`35be8709d`](https://github.com/clerk/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`13e9dfbaa`](https://github.com/clerk/javascript/commit/13e9dfbaa5b7b7e72f63e4b8ecfc1c1918517cd8), [`e38488c92`](https://github.com/clerk/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerk/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`9b644d799`](https://github.com/clerk/javascript/commit/9b644d7991b8cba4b385e9443f87798cde5c9989), [`a9894b445`](https://github.com/clerk/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`834dadb36`](https://github.com/clerk/javascript/commit/834dadb36c30b2a8f052784de4ad1026b0083b4e), [`70f251007`](https://github.com/clerk/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`a46d6fe99`](https://github.com/clerk/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/types@3.56.0
  - @clerk/backend@0.31.1
  - @clerk/shared@0.24.5
  - @clerk/clerk-react@4.26.5
  - @clerk/clerk-sdk-node@4.12.14

## 4.25.4

### Patch Changes

- Warn about environment variables deprecations: ([#1859](https://github.com/clerk/javascript/pull/1859)) by [@dimkl](https://github.com/dimkl)

  - `CLERK_API_KEY`
  - `CLERK_FRONTEND_API`
  - `NEXT_PUBLIC_CLERK_FRONTEND_API`

- Introduce a new property on the core Clerk singleton, `sdkMetadata`. This will be populated by each host SDK. This metadata will be used to make logging and debugging easier. ([#1857](https://github.com/clerk/javascript/pull/1857)) by [@BRKalow](https://github.com/BRKalow)

- Introduce new `*EmailLink*` helpers that will replace the `*MagicLink*` helpers. ([#1833](https://github.com/clerk/javascript/pull/1833)) by [@dimkl](https://github.com/dimkl)

  Also marked all the `*MagicLink*` as deprecated using JSDocs.

- Updated dependencies [[`977336f79`](https://github.com/clerk/javascript/commit/977336f793cd4ce5984f98dac3cedf9f5ec363f5), [`997b8e256`](https://github.com/clerk/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`d89c09bb0`](https://github.com/clerk/javascript/commit/d89c09bb0ec9d23ea75ca10f208fe23bb124d87b), [`91e9a55f4`](https://github.com/clerk/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`c9b17f5a7`](https://github.com/clerk/javascript/commit/c9b17f5a72cb27786cfc7f1fb42be1233fb10d5c), [`91014880d`](https://github.com/clerk/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`451fc332a`](https://github.com/clerk/javascript/commit/451fc332a06b20482fc1c7345d2f606511144241), [`3848f8dbe`](https://github.com/clerk/javascript/commit/3848f8dbe094226c6062341405a32a9621042fd6), [`7f4d4b942`](https://github.com/clerk/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b)]:
  - @clerk/shared@0.24.4
  - @clerk/clerk-react@4.26.4
  - @clerk/types@3.55.0
  - @clerk/clerk-sdk-node@4.12.13
  - @clerk/backend@0.31.0

## 4.25.3

### Patch Changes

- Add deprecation warning for `@clerk/nextjs/app-beta` export. Use the `@clerk/nextjs` instead. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Retry the implemented changes from [#1767](https://github.com/clerk/javascript/pull/1767) which were reverted in [#1806](https://github.com/clerk/javascript/pull/1806) due to RSC related errors (not all uses components had the `use client` directive). Restore the original PR and add additional `use client` directives to ensure it works correctly. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1e212c19d`](https://github.com/clerk/javascript/commit/1e212c19d1cbfbcf6bc6718f5aec0a3cb893b96f), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679)]:
  - @clerk/clerk-react@4.26.3
  - @clerk/shared@0.24.3
  - @clerk/backend@0.30.3
  - @clerk/clerk-sdk-node@4.12.12

## 4.25.2

### Patch Changes

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerk/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`fed24f1bf`](https://github.com/clerk/javascript/commit/fed24f1bf3e2b8c3f3e3327178f77b57c391c62c), [`164f3aac7`](https://github.com/clerk/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerk/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerk/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`0636ff779`](https://github.com/clerk/javascript/commit/0636ff7799e126d1438d2738ce0e46c3b277f46a), [`9514618d6`](https://github.com/clerk/javascript/commit/9514618d65cfdde0ff011eabd41a992b61fc8dc1), [`bb2ec9373`](https://github.com/clerk/javascript/commit/bb2ec93738f92c89f008c6a275a986593816c4d3), [`c7c6912f3`](https://github.com/clerk/javascript/commit/c7c6912f34874467bc74104690fe9f95491cc10d), [`71bb1c7b5`](https://github.com/clerk/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf), [`e592565e0`](https://github.com/clerk/javascript/commit/e592565e0d7707626587f5e0ae7fb7279c84f050)]:
  - @clerk/types@3.54.0
  - @clerk/backend@0.30.2
  - @clerk/clerk-react@4.26.2
  - @clerk/clerk-sdk-node@4.12.11

## 4.25.1

### Patch Changes

- Temporarily revert internal change to resolve RSC-related errors ([#1806](https://github.com/clerk/javascript/pull/1806)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`cecf74d79`](https://github.com/clerk/javascript/commit/cecf74d79069662d25f73e4745aa01348d398afb), [`a0b25671c`](https://github.com/clerk/javascript/commit/a0b25671cdee39cd0c2fca832b8c378fd445ec39)]:
  - @clerk/backend@0.30.1
  - @clerk/clerk-react@4.26.1
  - @clerk/clerk-sdk-node@4.12.10

## 4.25.0

### Minor Changes

- Add the `use client` directive in `@clerk/shared` to make the package compatible with an RSC environment. ([#1767](https://github.com/clerk/javascript/pull/1767)) by [@dimkl](https://github.com/dimkl)

  Remove several helpers from `@clerk/nextjs` and import them from `@clerk/shared` instead.

### Patch Changes

- Apply deprecation warnings for `@clerk/nextjs`: ([#1767](https://github.com/clerk/javascript/pull/1767)) by [@dimkl](https://github.com/dimkl)

  - `CLERK_JS_VERSION` environment variable
  - `CLERK_API_KEY` environment variable
  - `NEXT_PUBLIC_CLERK_FRONTEND_API` environment variable
  - `withClerkMiddleware`
  - `withServerSideAuth`

- Updated dependencies [[`5c8754239`](https://github.com/clerk/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81), [`14895e2dd`](https://github.com/clerk/javascript/commit/14895e2dde0fa15b594b1b7d89829d6013f5afc6), [`2f6a6ac99`](https://github.com/clerk/javascript/commit/2f6a6ac9991469bf8532019bb22ff50adecdb434), [`94c36c755`](https://github.com/clerk/javascript/commit/94c36c755b598eb68d22f42eb7f738050f390678), [`7406afe7f`](https://github.com/clerk/javascript/commit/7406afe7f550f702bd91cde9616fd26222833a87)]:
  - @clerk/clerk-react@4.26.0
  - @clerk/types@3.53.0
  - @clerk/backend@0.30.0
  - @clerk/clerk-sdk-node@4.12.9

## 4.24.2

### Patch Changes

- Updated dependencies [[`53ccb27cf`](https://github.com/clerk/javascript/commit/53ccb27cfd195af65adde6694572ed523fc66d6d), [`c61ddf5bf`](https://github.com/clerk/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerk/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/clerk-react@4.25.2
  - @clerk/types@3.52.1
  - @clerk/backend@0.29.3
  - @clerk/clerk-sdk-node@4.12.8

## 4.24.1

### Patch Changes

- Updated dependencies [[`40ea407ad`](https://github.com/clerk/javascript/commit/40ea407ad1042fee6871755f30de544200b1f0d8), [`378a903ac`](https://github.com/clerk/javascript/commit/378a903ac4dc12e6ee708de20f0d9a5aa758bd18), [`27b611e47`](https://github.com/clerk/javascript/commit/27b611e47e4f1ad86e8dff42cb02c98bdc6ff6bd), [`4d0d90238`](https://github.com/clerk/javascript/commit/4d0d9023895c13290d5578ece218c24348c540fc)]:
  - @clerk/backend@0.29.2
  - @clerk/clerk-sdk-node@4.12.7
  - @clerk/clerk-react@4.25.1

## 4.24.0

### Minor Changes

- Introduce the new brand-new component OrganizationList ([#1692](https://github.com/clerk/javascript/pull/1692)) by [@panteliselef](https://github.com/panteliselef)

  - Lists all the memberships, invitations or suggestions an active user may have
  - Powered by our `useOrganizationList` react hook

### Patch Changes

- `SignInWithMetamaskButton` is now exported from the `@clerk/nextjs` package ([#1731](https://github.com/clerk/javascript/pull/1731)) by [@octoper](https://github.com/octoper)

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- Updates the default middleware config matcher to be more restrictive in how it detects static files. Paths with `.` in them are now allowed, as long as the `.` is not in the final path segment. ([#1695](https://github.com/clerk/javascript/pull/1695)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`e99df0a0d`](https://github.com/clerk/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerk/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`75be1d6b3`](https://github.com/clerk/javascript/commit/75be1d6b3d9bf7b5d71613b3f169a942b1d25e7e), [`01b024c57`](https://github.com/clerk/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68)]:
  - @clerk/clerk-react@4.25.0
  - @clerk/types@3.52.0
  - @clerk/clerk-sdk-node@4.12.6
  - @clerk/backend@0.29.1

## 4.23.5

### Patch Changes

- Updated dependencies [[`463ff84f5`](https://github.com/clerk/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`e6a388946`](https://github.com/clerk/javascript/commit/e6a38894640b6999b90ea44ef66acda34debe2c1), [`1426e5eb3`](https://github.com/clerk/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739)]:
  - @clerk/types@3.51.0
  - @clerk/backend@0.29.0
  - @clerk/clerk-react@4.24.2
  - @clerk/clerk-sdk-node@4.12.5

## 4.23.4

### Patch Changes

- Improve error messaging when clock skew is detected. ([#1661](https://github.com/clerk/javascript/pull/1661)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`975412ed5`](https://github.com/clerk/javascript/commit/975412ed5307ac81128c87289178bd1e6c2fb1af), [`a102c21d4`](https://github.com/clerk/javascript/commit/a102c21d4762895a80a1ad846700763cc801b3f3)]:
  - @clerk/backend@0.28.1
  - @clerk/clerk-react@4.24.1
  - @clerk/clerk-sdk-node@4.12.4

## 4.23.3

### Patch Changes

- Pass dev_browser to AP via query param, fix AP origin detection util ([#1567](https://github.com/clerk/javascript/pull/1567)) by [@yourtallness](https://github.com/yourtallness)

- Logs that exceed maximum allowed length on Vercel deployments will now be truncated to max length exactly ([#1598](https://github.com/clerk/javascript/pull/1598)) by [@jescalan](https://github.com/jescalan)

- Updated dependencies [[`96cc1921c`](https://github.com/clerk/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerk/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerk/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerk/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerk/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerk/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerk/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerk/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerk/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerk/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`86de584dd`](https://github.com/clerk/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e02a1aff2`](https://github.com/clerk/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerk/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerk/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerk/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerk/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerk/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`30fcdd51a`](https://github.com/clerk/javascript/commit/30fcdd51a98dea60da36f2b5152ea22405d2c4f2), [`89bc5de04`](https://github.com/clerk/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/types@3.50.0
  - @clerk/clerk-react@4.24.0
  - @clerk/backend@0.28.0
  - @clerk/clerk-sdk-node@4.12.3

## 4.23.2

### Patch Changes

- Updated dependencies [[`ea95525a4`](https://github.com/clerk/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerk/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`d433b83b9`](https://github.com/clerk/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerk/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`876777cb1`](https://github.com/clerk/javascript/commit/876777cb14443917d8e0a04b363327d165ad5580), [`0a59e122d`](https://github.com/clerk/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/backend@0.27.0
  - @clerk/types@3.49.0
  - @clerk/clerk-sdk-node@4.12.2
  - @clerk/clerk-react@4.23.2

## 4.23.1

### Patch Changes

- Updated dependencies [[`7c1359474`](https://github.com/clerk/javascript/commit/7c135947428e3e0611b6c860fabd8113c15b2166)]:
  - @clerk/clerk-sdk-node@4.12.1

## 4.23.0

### Minor Changes

- Support hosting NextJs apps on non-Vercel platforms by constructing req.url using host-related headers instead of using on req.url directly. CLERK_TRUST_HOST is now enabled by default. ([#1492](https://github.com/clerk/javascript/pull/1492)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerk/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3), [`4ff4b716f`](https://github.com/clerk/javascript/commit/4ff4b716fdb12b18182e506737afafc7dbc05604)]:
  - @clerk/types@3.48.1
  - @clerk/clerk-sdk-node@4.12.0
  - @clerk/backend@0.26.0
  - @clerk/clerk-react@4.23.1

## 4.22.1

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerk/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c)]:
  - @clerk/clerk-react@4.23.0
  - @clerk/types@3.48.0
  - @clerk/backend@0.25.1
  - @clerk/clerk-sdk-node@4.11.1

## 4.22.0

### Minor Changes

- Introduce `createIsomorphicRequest` in `@clerk/backend` ([#1393](https://github.com/clerk/javascript/pull/1393)) by [@anagstef](https://github.com/anagstef)

  This utility simplifies the `authenticateRequest` signature, and it makes it easier to integrate with more frameworks.

- Improve dev-mode logs for authMiddleware (protectedRoutes and ignoredRoutes) by [@nikosdouvlis](https://github.com/nikosdouvlis)

### Patch Changes

- Updated dependencies [[`16c3283ec`](https://github.com/clerk/javascript/commit/16c3283ec192cb7525312da5e718aa7cac8b8445), [`73c9c1d0e`](https://github.com/clerk/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerk/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerk/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`e3036848d`](https://github.com/clerk/javascript/commit/e3036848d19a48935129aec2fe50003518a3aa53), [`fd692af79`](https://github.com/clerk/javascript/commit/fd692af791fe206724e38eff647b8562e72c3652), [`090bab66e`](https://github.com/clerk/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`bb0d69b45`](https://github.com/clerk/javascript/commit/bb0d69b455fa5fd6ca5b1f45a0f242957521dfbb), [`592911196`](https://github.com/clerk/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8), [`dd10ebeae`](https://github.com/clerk/javascript/commit/dd10ebeae54d70b84b7c0374cea2876e9cdd6622)]:
  - @clerk/backend@0.25.0
  - @clerk/types@3.47.0
  - @clerk/clerk-sdk-node@4.11.0
  - @clerk/clerk-react@4.22.1

## 4.21.14

### Patch Changes

- Updated dependencies [[`2ad7cf390`](https://github.com/clerk/javascript/commit/2ad7cf390ba84b8e767ed6fe136800e38356d79c), [`4eeabbaa3`](https://github.com/clerk/javascript/commit/4eeabbaa36bfd5b277eadd1eaff3d0ed15e4e162), [`f6b77a1a3`](https://github.com/clerk/javascript/commit/f6b77a1a338cddeadb3cc7019171bf9703d7676e), [`f0b044c47`](https://github.com/clerk/javascript/commit/f0b044c475546e96a5995ef16198e60e35e8098f)]:
  - @clerk/backend@0.24.0
  - @clerk/clerk-sdk-node@4.10.15
  - @clerk/clerk-react@4.22.0

## 4.21.13

### Patch Changes

- Updated dependencies [[`3fee736c9`](https://github.com/clerk/javascript/commit/3fee736c993b0a8fd157d716890810d04e632962), [`968d9c265`](https://github.com/clerk/javascript/commit/968d9c2651ce25f6e03c2e6eecd81f7daf876f03), [`ac4e47274`](https://github.com/clerk/javascript/commit/ac4e47274afc2ab3a55a78b388a14bed76600402), [`5957a3da6`](https://github.com/clerk/javascript/commit/5957a3da68cde3386c741812e2bc03b5519d00e0)]:
  - @clerk/backend@0.23.7
  - @clerk/clerk-react@4.21.1
  - @clerk/clerk-sdk-node@4.10.14

## 4.21.12

### Patch Changes

- Updated dependencies [[`1e71b60a2`](https://github.com/clerk/javascript/commit/1e71b60a2c6832a5f4f9c75ad4152b82db2b52e1)]:
  - @clerk/clerk-react@4.21.0

## 4.21.11

### Patch Changes

- Resolve issue of appending :80 in urls when using CLERK_TRUST_HOST ([#1419](https://github.com/clerk/javascript/pull/1419)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`30f8ad18a`](https://github.com/clerk/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c)]:
  - @clerk/types@3.46.1
  - @clerk/backend@0.23.6
  - @clerk/clerk-react@4.20.6
  - @clerk/clerk-sdk-node@4.10.13

## 4.21.10

### Patch Changes

- Support hosting NextJs apps on non-Vercel platforms by constructing req.url using host-related headers instead of using on `req.url` directly. In order to enable this feature, set the `CLERK_TRUST_HOST` env variable to `true` ([#1394](https://github.com/clerk/javascript/pull/1394)) by [@dimkl](https://github.com/dimkl)

## 4.21.9

### Patch Changes

- Add isApiRoute to AfterAuthHandler['auth'] type ([#1397](https://github.com/clerk/javascript/pull/1397)) by [@dimkl](https://github.com/dimkl)

## 4.21.8

### Patch Changes

- Updated dependencies [[`bfb3af28`](https://github.com/clerk/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/types@3.46.0
  - @clerk/backend@0.23.5
  - @clerk/clerk-react@4.20.5
  - @clerk/clerk-sdk-node@4.10.12

## 4.21.7

### Patch Changes

- Updated dependencies [[`11954816`](https://github.com/clerk/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`de2347f9`](https://github.com/clerk/javascript/commit/de2347f9efaab4903787a905528a06551a9b7883), [`32148490`](https://github.com/clerk/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0
  - @clerk/clerk-sdk-node@4.10.11
  - @clerk/backend@0.23.4
  - @clerk/clerk-react@4.20.4

## 4.21.6

### Patch Changes

- Updated dependencies [[`17cc14ec`](https://github.com/clerk/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/types@3.44.0
  - @clerk/backend@0.23.3
  - @clerk/clerk-react@4.20.3
  - @clerk/clerk-sdk-node@4.10.10

## 4.21.5

### Patch Changes

- Updated dependencies [[`e41f848c`](https://github.com/clerk/javascript/commit/e41f848c35f5f284bde918e60bdfd77693e5d7bd)]:
  - @clerk/clerk-sdk-node@4.10.9

## 4.21.4

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerk/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerk/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/types@3.43.0
  - @clerk/backend@0.23.2
  - @clerk/clerk-react@4.20.2
  - @clerk/clerk-sdk-node@4.10.8

## 4.21.3

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-react@4.20.1

## 4.21.2

### Patch Changes

- Detect infinite redirect loops when using `authMiddleware` and inform the user about possible resolution steps. ([#1324](https://github.com/clerk/javascript/pull/1324)) by [@anagstef](https://github.com/anagstef)

- Allow `clerkJSVersion` to be passed when loading interstitial. Support for ([#1354](https://github.com/clerk/javascript/pull/1354)) by [@panteliselef](https://github.com/panteliselef)

  - Nextjs
  - Remix
  - Node

- Updated dependencies [[`f8a334b1`](https://github.com/clerk/javascript/commit/f8a334b1a97b1dab36d3114c42c4ba50ca6d38dc), [`b945c921`](https://github.com/clerk/javascript/commit/b945c92100454f00ff4b6b9c769201ca2ceaac93)]:
  - @clerk/clerk-sdk-node@4.10.7
  - @clerk/backend@0.23.1

## 4.21.1

### Patch Changes

- Resolve build issues affecting apps using App Router ([#1346](https://github.com/clerk/javascript/pull/1346)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`eff4e45e`](https://github.com/clerk/javascript/commit/eff4e45e351f7ab04da3996853d7bca40d642543)]:
  - @clerk/clerk-sdk-node@4.10.6

## 4.21.0

### Minor Changes

- Export error helpers from the shared package to the framework specific packages ([#1308](https://github.com/clerk/javascript/pull/1308)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Support `audience` parameter in authentication request ([#1004](https://github.com/clerk/javascript/pull/1004)) by [@dimkl](https://github.com/dimkl)

  The audience parameter is used to verify the the aud claim in
  the request matches the value of the parameter or is included
  (when the user provides a list).

  Resolves:

  - [#978](https://github.com/clerk/javascript/pull/978)
  - [#1004](https://github.com/clerk/javascript/pull/1004)

- Updated dependencies [[`7af91bc3`](https://github.com/clerk/javascript/commit/7af91bc3ecc25cba04968b491e1e3c6ec32c18af), [`c42b4ac0`](https://github.com/clerk/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`6f3d4305`](https://github.com/clerk/javascript/commit/6f3d43055690db1d69a356503a0a45dc948beaef), [`010484f4`](https://github.com/clerk/javascript/commit/010484f4978b9616e8c2ef50986eda742c4967bd)]:
  - @clerk/clerk-react@4.20.0
  - @clerk/types@3.42.0
  - @clerk/backend@0.23.0
  - @clerk/clerk-sdk-node@4.10.5

## 4.20.0

### Minor Changes

- Add support for NextJS applications hosted on AWS Amplify by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Tweaked the default `authMiddleware` behavior for protected API routes. An unauthenticated request for a protected API route will no longer return a `307 Redirect` - a `401 Unauthorized` response will be returned instead. by [@nikosdouvlis](https://github.com/nikosdouvlis)

  With this change, an API route is considered a request for which the following rules apply:

  - The request url matches the following patterns; `['/api/(.*)', '/trpc/(.*)']`
  - Or, the request has `Content-Type: application/json`
  - Or, the request method is not one of: `GET`, `OPTIONS` ,` HEAD`

  A new `apiRoutes` param has been introduced on `authMiddleware`. It can accept an array of path patterns, `RegexExp` or strings. If `apiRoutes` is passed in explicitly, then it overrides the behavior described above and only the requests matching `apiRoutes` will be considered as API routes requests.
  For more technical details, refer to the PR's description.

- Add support for NextJS applications hosted on Railway by [@nikosdouvlis](https://github.com/nikosdouvlis)

### Patch Changes

- Improve debug logs in NextJS by adding AuthStatusObject.debug data by [@nikosdouvlis](https://github.com/nikosdouvlis)

- The devBrowser JWT is now added to all cross-origin redirects triggered by calling `redirectToSignIn` or `redirectToSignUp`. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Improve debug logging by including `AuthObject.debug()` data when `debug` is `true` in `authMiddleware` by [@nikosdouvlis](https://github.com/nikosdouvlis)

- ESM/CJS support for `@clerk/clerk-react` by [@nikosdouvlis](https://github.com/nikosdouvlis)

  Changes that should affect users and OS contributors:

  - Better source map support for `@clerk/clerk-react`, `@clerk/shared`. This affects anyone developing in our monorepo or anyone using a debugger with Clerk installed in their app.
  - Easier node_modules debugging as `@clerk/clerk-react`, `@clerk/shared` and `@clerk/nextjs` are no longer getting bundled as a single-file package. This also improves error logging in nextjs a lot, as nextjs usually logs the line that threw the error - a minified, single-file package, usually consists of a very long single-line module, so logging error in NextJS wasn't ideal.
  - Headless clerk-js bundle size reduced by ~10kb, normal clerk-ks by ~6kb
  - A new `clerkJSVersion` prop has been added on ClerkProvider allowing to fetch a specific clerk-js version.

- `authMiddleware` handles multi-domain relared properties passed as functions properly by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/backend@0.22.0
  - @clerk/types@3.41.1
  - @clerk/clerk-react@4.19.0
  - @clerk/clerk-sdk-node@4.10.4

## [4.19.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.19.0-staging.1...@clerk/nextjs@4.19.0) (2023-05-26)

**Note:** Version bump only for package @clerk/nextjs

### [4.18.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.18.5-staging.0...@clerk/nextjs@4.18.5) (2023-05-26)

**Note:** Version bump only for package @clerk/nextjs

### [4.18.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.18.3...@clerk/nextjs@4.18.4) (2023-05-23)

**Note:** Version bump only for package @clerk/nextjs

### [4.18.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.18.3-staging.2...@clerk/nextjs@4.18.3) (2023-05-23)

**Note:** Version bump only for package @clerk/nextjs

### [4.18.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.18.2-staging.1...@clerk/nextjs@4.18.2) (2023-05-18)

**Note:** Version bump only for package @clerk/nextjs

### [4.18.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.18.1-staging.1...@clerk/nextjs@4.18.1) (2023-05-17)

**Note:** Version bump only for package @clerk/nextjs

## [4.18.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.18.0-staging.4...@clerk/nextjs@4.18.0) (2023-05-15)

**Note:** Version bump only for package @clerk/nextjs

### [4.17.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.17.0...@clerk/nextjs@4.17.1) (2023-05-04)

### Bug Fixes

- **nextjs:** Use signInUrl and signUpUrl from the env ([#1151](https://github.com/clerk/javascript/issues/1151)) ([0476d79](https://github.com/clerk/javascript/commit/0476d79360f59ecce90d8e69a57225bb0d5b73bb))

## [4.17.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.17.0-staging.6...@clerk/nextjs@4.17.0) (2023-05-04)

**Note:** Version bump only for package @clerk/nextjs

## [4.17.0-staging.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.17.0-staging.4...@clerk/nextjs@4.17.0-staging.5) (2023-05-04)

**Note:** Version bump only for package @clerk/nextjs

## [4.17.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.17.0-staging.0...@clerk/nextjs@4.17.0-staging.1) (2023-05-02)

**Note:** Version bump only for package @clerk/nextjs

### [4.16.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.16.4-staging.0...@clerk/nextjs@4.16.4) (2023-04-19)

**Note:** Version bump only for package @clerk/nextjs

### [4.16.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.16.2...@clerk/nextjs@4.16.3) (2023-04-19)

**Note:** Version bump only for package @clerk/nextjs

### [4.16.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.16.2-staging.0...@clerk/nextjs@4.16.2) (2023-04-12)

**Note:** Version bump only for package @clerk/nextjs

### [4.16.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.16.0...@clerk/nextjs@4.16.1) (2023-04-12)

### Reverts

- Revert "chore(nextjs): Use tsup to bundle and minify package" ([5453456](https://github.com/clerk/javascript/commit/5453456feedb4dbfbeccbc68ecf5cdd5e6b9e501))
- Revert "fix(nextjs): Omit test files from production build" ([392fd28](https://github.com/clerk/javascript/commit/392fd28ad6f0c1bc5968a1a40c57f91cfd57cc05))
- Revert "fix(nextjs): Add edge-middleware and drop client/ & middleware/ from tsup.config entry" ([ba85989](https://github.com/clerk/javascript/commit/ba85989bf91b3f99e015a82fdf748a79d7404f3d))
- Revert "chore(nextjs): Update serializable props GH issue link" ([f16e623](https://github.com/clerk/javascript/commit/f16e623fe2766274d05efa7cfbbe97d03bda6ff3))
- Revert "fix(nextjs): Fix serializable issue when build with tsup & tsup config cleanup" ([347f6df](https://github.com/clerk/javascript/commit/347f6df8dc23fc51a4a07f1c3942b8f749576541))

## [4.16.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.16.0-staging.0...@clerk/nextjs@4.16.0) (2023-04-11)

**Note:** Version bump only for package @clerk/nextjs

## [4.15.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.15.0-staging.1...@clerk/nextjs@4.15.0) (2023-04-06)

**Note:** Version bump only for package @clerk/nextjs

### [4.14.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.14.1-staging.1...@clerk/nextjs@4.14.1) (2023-04-03)

**Note:** Version bump only for package @clerk/nextjs

## [4.14.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.14.0-staging.3...@clerk/nextjs@4.14.0) (2023-03-31)

**Note:** Version bump only for package @clerk/nextjs

## [4.14.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.14.0-staging.2...@clerk/nextjs@4.14.0-staging.3) (2023-03-31)

**Note:** Version bump only for package @clerk/nextjs

## [4.14.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.13.1-staging.0...@clerk/nextjs@4.14.0-staging.0) (2023-03-31)

### Features

- **nextjs:** Add signInUrl to BAPI call for interstitial ([f2003fc](https://github.com/clerk/javascript/commit/f2003fcb337d2ec5b0496aebd030ebeb8b544799))
- **nextjs:** Support new env var NEXT_PUBLIC_CLERK_SIGN_IN_URL ([0d5bd88](https://github.com/clerk/javascript/commit/0d5bd88bba65d5c9d8e091449ddd13a6bc640928))

## [4.13.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.13.0-staging.2...@clerk/nextjs@4.13.0) (2023-03-29)

**Note:** Version bump only for package @clerk/nextjs

### [4.11.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.7-staging.2...@clerk/nextjs@4.11.7) (2023-03-10)

**Note:** Version bump only for package @clerk/nextjs

### [4.11.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.6-staging.1...@clerk/nextjs@4.11.6) (2023-03-09)

**Note:** Version bump only for package @clerk/nextjs

### [4.11.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.4...@clerk/nextjs@4.11.5) (2023-03-07)

### Bug Fixes

- **nextjs:** Stop exporting the /api helpers based on the runtime ([224426a](https://github.com/clerk/javascript/commit/224426aca9fe5fda33e728445d590204a7e99fc9))

### [4.11.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.4-staging.1...@clerk/nextjs@4.11.4) (2023-03-07)

**Note:** Version bump only for package @clerk/nextjs

### [4.11.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.3-staging.1...@clerk/nextjs@4.11.3) (2023-03-03)

**Note:** Version bump only for package @clerk/nextjs

### [4.11.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.2-staging.0...@clerk/nextjs@4.11.2) (2023-03-01)

**Note:** Version bump only for package @clerk/nextjs

### [4.11.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.1-staging.0...@clerk/nextjs@4.11.1) (2023-02-25)

**Note:** Version bump only for package @clerk/nextjs

## [4.11.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.0-staging.0...@clerk/nextjs@4.11.0) (2023-02-24)

**Note:** Version bump only for package @clerk/nextjs

### [4.10.3-staging.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.10.3-staging.4...@clerk/nextjs@4.10.3-staging.5) (2023-02-22)

### Bug Fixes

- **nextjs:** Reintroduce next as a peer dependency ([b1fd299](https://github.com/clerk/javascript/commit/b1fd2990b6091bba5abc1f9cf9b3c15fff980222))

### [4.10.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.10.2-staging.1...@clerk/nextjs@4.10.2) (2023-02-17)

**Note:** Version bump only for package @clerk/nextjs

### [4.10.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.10.1-staging.2...@clerk/nextjs@4.10.1) (2023-02-15)

**Note:** Version bump only for package @clerk/nextjs

## [4.10.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.10.0-staging.0...@clerk/nextjs@4.10.0) (2023-02-10)

**Note:** Version bump only for package @clerk/nextjs

### [4.9.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.9.1-staging.0...@clerk/nextjs@4.9.1) (2023-02-07)

**Note:** Version bump only for package @clerk/nextjs

### [4.9.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.9.0-staging.1...@clerk/nextjs@4.9.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/nextjs

## [4.9.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.9.0-staging.1...@clerk/nextjs@4.9.0) (2023-02-07)

**Note:** Version bump only for package @clerk/nextjs

### [4.8.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.8.1-staging.4...@clerk/nextjs@4.8.1) (2023-02-01)

**Note:** Version bump only for package @clerk/nextjs

## [4.8.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.8.0-staging.1...@clerk/nextjs@4.8.0) (2023-01-27)

**Note:** Version bump only for package @clerk/nextjs

### [4.7.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.7.6-staging.1...@clerk/nextjs@4.7.7) (2023-01-24)

**Note:** Version bump only for package @clerk/nextjs

### [4.7.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.7.4...@clerk/nextjs@4.7.5) (2023-01-20)

### Bug Fixes

- **nextjs,types:** Make frontendApi or publishableKey mutually exclusive but optional ([953c276](https://github.com/clerk/javascript/commit/953c27622ba24054172d6f4178bd5af50f73fa36))

### [4.7.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.7.3...@clerk/nextjs@4.7.4) (2023-01-19)

**Note:** Version bump only for package @clerk/nextjs

### [4.7.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.7.3-staging.0...@clerk/nextjs@4.7.3) (2023-01-18)

**Note:** Version bump only for package @clerk/nextjs

### [4.7.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.7.2-staging.0...@clerk/nextjs@4.7.2) (2023-01-18)

**Note:** Version bump only for package @clerk/nextjs

### [4.7.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.7.0...@clerk/nextjs@4.7.1) (2023-01-17)

**Note:** Version bump only for package @clerk/nextjs

## [4.7.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.7.0-staging.9...@clerk/nextjs@4.7.0) (2023-01-17)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.15](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.15-staging.2...@clerk/nextjs@4.6.15) (2022-12-23)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.14](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.14-staging.1...@clerk/nextjs@4.6.14) (2022-12-19)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.13](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.13-staging.1...@clerk/nextjs@4.6.13) (2022-12-13)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.12](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.11...@clerk/nextjs@4.6.12) (2022-12-12)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.11](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.11-staging.0...@clerk/nextjs@4.6.11) (2022-12-12)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.10](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.10-staging.1...@clerk/nextjs@4.6.10) (2022-12-09)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.9](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.8...@clerk/nextjs@4.6.9) (2022-12-08)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.8](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.8-staging.0...@clerk/nextjs@4.6.8) (2022-12-08)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.7-staging.0...@clerk/nextjs@4.6.7) (2022-12-02)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.6-staging.5...@clerk/nextjs@4.6.6) (2022-11-30)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.6-staging.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.6-staging.4...@clerk/nextjs@4.6.6-staging.5) (2022-11-29)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.5-staging.0...@clerk/nextjs@4.6.5) (2022-11-25)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.4-staging.0...@clerk/nextjs@4.6.4) (2022-11-25)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.2...@clerk/nextjs@4.6.3) (2022-11-23)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.2-staging.3...@clerk/nextjs@4.6.2) (2022-11-22)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.2-staging.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.2-staging.2...@clerk/nextjs@4.6.2-staging.3) (2022-11-21)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.2-staging.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.2-staging.1...@clerk/nextjs@4.6.2-staging.2) (2022-11-21)

### Bug Fixes

- **nextjs:** Remove optional auth violation error from withClerkMiddleware ([1760b90](https://github.com/clerk/javascript/commit/1760b9092ff22e57b24d0475e4ec6b49dd5a7ecd))

### [4.6.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.1-staging.2...@clerk/nextjs@4.6.1) (2022-11-18)

**Note:** Version bump only for package @clerk/nextjs

## [4.6.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.0-staging.5...@clerk/nextjs@4.6.0) (2022-11-15)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.8](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.8-staging.1...@clerk/nextjs@4.5.8) (2022-11-10)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.7-staging.2...@clerk/nextjs@4.5.7) (2022-11-05)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.6-staging.7...@clerk/nextjs@4.5.6) (2022-11-03)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.6-staging.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.6-staging.3...@clerk/nextjs@4.5.6-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.6-staging.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.6-staging.1...@clerk/nextjs@4.5.6-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.6-staging.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.6-staging.1...@clerk/nextjs@4.5.6-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.6-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.5...@clerk/nextjs@4.5.6-staging.1) (2022-11-02)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.5-staging.0...@clerk/nextjs@4.5.5) (2022-10-24)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.3...@clerk/nextjs@4.5.4) (2022-10-14)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.3-staging.2...@clerk/nextjs@4.5.3) (2022-10-14)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.3-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.2...@clerk/nextjs@4.5.3-staging.1) (2022-10-13)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.2-staging.0...@clerk/nextjs@4.5.2) (2022-10-07)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.1-staging.0...@clerk/nextjs@4.5.1) (2022-10-05)

**Note:** Version bump only for package @clerk/nextjs

## [4.5.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.0-staging.6...@clerk/nextjs@4.5.0) (2022-10-03)

**Note:** Version bump only for package @clerk/nextjs

## [4.4.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.4.0-staging.1...@clerk/nextjs@4.4.0) (2022-09-29)

**Note:** Version bump only for package @clerk/nextjs

### [4.3.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.3.1...@clerk/nextjs@4.3.2) (2022-09-25)

**Note:** Version bump only for package @clerk/nextjs

### [4.3.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.3.1-staging.2...@clerk/nextjs@4.3.1) (2022-09-24)

**Note:** Version bump only for package @clerk/nextjs

### [4.3.1-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.3.1-staging.0...@clerk/nextjs@4.3.1-staging.1) (2022-09-24)

**Note:** Version bump only for package @clerk/nextjs

## [4.3.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.3.0-staging.0...@clerk/nextjs@4.3.0) (2022-09-22)

**Note:** Version bump only for package @clerk/nextjs

### [4.2.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.2.0-staging.4...@clerk/nextjs@4.2.1) (2022-09-19)

**Note:** Version bump only for package @clerk/nextjs

## [4.2.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.2.0-staging.4...@clerk/nextjs@4.2.0) (2022-09-16)

**Note:** Version bump only for package @clerk/nextjs

### [4.1.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.1.6...@clerk/nextjs@4.1.7) (2022-09-08)

**Note:** Version bump only for package @clerk/nextjs

### [4.1.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.1.6-staging.0...@clerk/nextjs@4.1.6) (2022-09-07)

**Note:** Version bump only for package @clerk/nextjs

### [4.1.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.1.5-staging.0...@clerk/nextjs@4.1.5) (2022-09-07)

**Note:** Version bump only for package @clerk/nextjs

### [4.1.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.1.3...@clerk/nextjs@4.1.4) (2022-09-05)

**Note:** Version bump only for package @clerk/nextjs

### [4.1.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.1.3-staging.0...@clerk/nextjs@4.1.3) (2022-08-29)

**Note:** Version bump only for package @clerk/nextjs

### [4.1.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.1.2-staging.3...@clerk/nextjs@4.1.2) (2022-08-29)

**Note:** Version bump only for package @clerk/nextjs

### [4.1.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.1.1-staging.0...@clerk/nextjs@4.1.1) (2022-08-24)

**Note:** Version bump only for package @clerk/nextjs

## [4.1.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.0.5...@clerk/nextjs@4.1.0) (2022-08-18)

**Note:** Version bump only for package @clerk/nextjs

### [4.0.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.0.4...@clerk/nextjs@4.0.5) (2022-08-18)

**Note:** Version bump only for package @clerk/nextjs

### [4.0.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.0.4-staging.0...@clerk/nextjs@4.0.4) (2022-08-18)

**Note:** Version bump only for package @clerk/nextjs

### [4.0.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.0.3-staging.0...@clerk/nextjs@4.0.3) (2022-08-16)

**Note:** Version bump only for package @clerk/nextjs

### [4.0.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.0.2-staging.0...@clerk/nextjs@4.0.2) (2022-08-09)

**Note:** Version bump only for package @clerk/nextjs

### [4.0.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.0.0...@clerk/nextjs@4.0.1) (2022-08-07)

**Note:** Version bump only for package @clerk/nextjs

## [4.0.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.0.0-staging.1...@clerk/nextjs@4.0.0) (2022-08-05)

**Note:** Version bump only for package @clerk/nextjs

### [3.8.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.8.2...@clerk/nextjs@3.8.3) (2022-08-05)

**Note:** Version bump only for package @clerk/nextjs

### [3.8.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.8.1...@clerk/nextjs@3.8.2) (2022-08-04)

**Note:** Version bump only for package @clerk/nextjs

### [3.8.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.8.1-staging.0...@clerk/nextjs@3.8.1) (2022-07-26)

**Note:** Version bump only for package @clerk/nextjs

## [3.8.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.7.1...@clerk/nextjs@3.8.0) (2022-07-13)

### Features

- **nextjs:** Add req.organization access on gssp ([d064448](https://github.com/clerk/javascript/commit/d0644489a71e06df0e751c615b0d03d77967aab2))
- **types,clerk-react,nextjs:** Add loadOrg option for Next.js withServerSideAuth middleware ([0889bde](https://github.com/clerk/javascript/commit/0889bde9bc7f9e1a5d4c1e706c49212e1f7b36f4))

### [3.7.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.7.1-staging.0...@clerk/nextjs@3.7.1) (2022-07-11)

**Note:** Version bump only for package @clerk/nextjs

## [3.7.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.13...@clerk/nextjs@3.7.0) (2022-07-08)

### Features

- **backend-core,edge:** Add requireEdgeMiddlewareAuth ([9ce6a4e](https://github.com/clerk/javascript/commit/9ce6a4e3f763f5e75a59439f9e36dc1a2ec368c4))
- **edge,nextjs:** Compatibility with API middleware experimental edge-runtime ([107d70e](https://github.com/clerk/javascript/commit/107d70e2fb0522a89763c4b99f0968aea4e01c2c))

### [3.6.13](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.12...@clerk/nextjs@3.6.13) (2022-07-07)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.12](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.11...@clerk/nextjs@3.6.12) (2022-07-06)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.11](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.10...@clerk/nextjs@3.6.11) (2022-07-04)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.10](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.9...@clerk/nextjs@3.6.10) (2022-07-01)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.9](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.8...@clerk/nextjs@3.6.9) (2022-07-01)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.8](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.7...@clerk/nextjs@3.6.8) (2022-06-24)

### Bug Fixes

- **edge,nextjs,remix,clerk-sdk-node,types:** Correct SSR claims typing ([09c147c](https://github.com/clerk/javascript/commit/09c147c196c08e64794423f9eae791bfe453b858))

### [3.6.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.7-staging.0...@clerk/nextjs@3.6.7) (2022-06-16)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.6-staging.4...@clerk/nextjs@3.6.6) (2022-06-06)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.6-staging.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.6-staging.3...@clerk/nextjs@3.6.6-staging.4) (2022-06-03)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.6-staging.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.6-staging.2...@clerk/nextjs@3.6.6-staging.3) (2022-06-03)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.6-staging.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.6-staging.1...@clerk/nextjs@3.6.6-staging.2) (2022-06-02)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.6-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.6-staging.0...@clerk/nextjs@3.6.6-staging.1) (2022-06-01)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.5-staging.4...@clerk/nextjs@3.6.5) (2022-05-20)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.5-staging.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.5-staging.3...@clerk/nextjs@3.6.5-staging.4) (2022-05-20)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.5-staging.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.5-staging.2...@clerk/nextjs@3.6.5-staging.3) (2022-05-19)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.5-staging.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.4...@clerk/nextjs@3.6.5-staging.2) (2022-05-18)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.5-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.4...@clerk/nextjs@3.6.5-staging.1) (2022-05-17)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.5-staging.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.4...@clerk/nextjs@3.6.5-staging.0) (2022-05-16)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.1...@clerk/nextjs@3.6.4) (2022-05-13)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.1...@clerk/nextjs@3.6.3) (2022-05-12)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.1...@clerk/nextjs@3.6.2) (2022-05-12)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.1-staging.0...@clerk/nextjs@3.6.1) (2022-05-11)

**Note:** Version bump only for package @clerk/nextjs

## [3.6.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.5.1...@clerk/nextjs@3.6.0) (2022-05-06)

### Features

- **nextjs,clerk-sdk-node,remix:** Add claims attribute to req.auth ([c695529](https://github.com/clerk/javascript/commit/c695529089f55baef72b86e3b73b8cd9f4f58e6d))

### [3.5.2-staging.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.5.1...@clerk/nextjs@3.5.2-staging.0) (2022-05-05)

**Note:** Version bump only for package @clerk/nextjs

### [3.5.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.5.1-staging.0...@clerk/nextjs@3.5.1) (2022-05-05)

**Note:** Version bump only for package @clerk/nextjs

## [3.5.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.5.0-staging.0...@clerk/nextjs@3.5.0) (2022-04-28)

**Note:** Version bump only for package @clerk/nextjs

### [3.4.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.4.0...@clerk/nextjs@3.4.1) (2022-04-27)

**Note:** Version bump only for package @clerk/nextjs

## [3.4.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.7...@clerk/nextjs@3.4.0) (2022-04-27)

### Features

- **nextjs:** Fix opts parsing in withServerSideAuth ([1eecb81](https://github.com/clerk/javascript/commit/1eecb81439809fd4536d4b7d2f65d4fed6c6137b))

### [3.3.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.6...@clerk/nextjs@3.3.7) (2022-04-22)

### Bug Fixes

- **nextjs,backend-core:** Fix handleError parsing ([4eb9732](https://github.com/clerk/javascript/commit/4eb97324d9153aa91492982d00bb76b8592947c7))

### [3.3.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.6-staging.1...@clerk/nextjs@3.3.6) (2022-04-19)

**Note:** Version bump only for package @clerk/nextjs

### [3.3.6-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.6-staging.0...@clerk/nextjs@3.3.6-staging.1) (2022-04-19)

**Note:** Version bump only for package @clerk/nextjs

### [3.3.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.5-alpha.0...@clerk/nextjs@3.3.5) (2022-04-18)

**Note:** Version bump only for package @clerk/nextjs

### [3.3.5-alpha.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.4...@clerk/nextjs@3.3.5-alpha.0) (2022-04-15)

**Note:** Version bump only for package @clerk/nextjs

### [3.3.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.3...@clerk/nextjs@3.3.4) (2022-04-15)

**Note:** Version bump only for package @clerk/nextjs

### [3.3.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.3-staging.1...@clerk/nextjs@3.3.3) (2022-04-15)

**Note:** Version bump only for package @clerk/nextjs

### [3.3.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.2-staging.0...@clerk/nextjs@3.3.2) (2022-04-13)

**Note:** Version bump only for package @clerk/nextjs

### [3.3.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.0...@clerk/nextjs@3.3.1) (2022-04-07)

**Note:** Version bump only for package @clerk/nextjs

## [3.3.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.0-staging.0...@clerk/nextjs@3.3.0) (2022-04-04)

**Note:** Version bump only for package @clerk/nextjs

### [3.2.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.2.4-staging.0...@clerk/nextjs@3.2.4) (2022-03-29)

**Note:** Version bump only for package @clerk/nextjs

### [3.2.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.2.3-staging.0...@clerk/nextjs@3.2.3) (2022-03-28)

**Note:** Version bump only for package @clerk/nextjs

### [3.2.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.2.2-alpha.0...@clerk/nextjs@3.2.2) (2022-03-24)

**Note:** Version bump only for package @clerk/nextjs

### [3.2.2-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.2.2-staging.0...@clerk/nextjs@3.2.2-staging.1) (2022-03-24)

**Note:** Version bump only for package @clerk/nextjs

### [3.2.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.2.1-staging.0...@clerk/nextjs@3.2.1-alpha.0) (2022-03-23)

**Note:** Version bump only for package @clerk/nextjs

## [3.2.0-alpha.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.2.0-alpha.1...@clerk/nextjs@3.2.0-alpha.2) (2022-03-23)

**Note:** Version bump only for package @clerk/nextjs

## [3.2.0-alpha.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.1.0-alpha.1...@clerk/nextjs@3.2.0-alpha.1) (2022-03-23)

### Features

- **backend-core,clerk-sdk-node,nextjs,remix:** Add injected jwtKey option ([53e56e7](https://github.com/clerk/javascript/commit/53e56e76d59984d4d3f5b7e1e2d276adb8b2dc77))

## [3.2.0-alpha.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.1.0-alpha.1...@clerk/nextjs@3.2.0-alpha.0) (2022-03-22)

**Note:** Version bump only for package @clerk/nextjs

## [3.1.0-alpha.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.1.0-alpha.0...@clerk/nextjs@3.1.0-alpha.1) (2022-03-22)

**Note:** Version bump only for package @clerk/nextjs

## [3.1.0-alpha.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.0.1-staging.0...@clerk/nextjs@3.1.0-alpha.0) (2022-03-22)

### Features

- **nextjs,remix:** Refactor remix and nextjs getAuthData to use common utils ([d5f5dba](https://github.com/clerk/javascript/commit/d5f5dbace577ae617636841ce51e7cccd5d25b95))

### Bug Fixes

- **nextjs,remix:** Make server getToken throw if called with no session ([f7736c1](https://github.com/clerk/javascript/commit/f7736c1f4730d713f3fbcedd73e2ef5a1ceee605))

### [3.0.1-alpha.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.0.1-alpha.1...@clerk/nextjs@3.0.1-alpha.2) (2022-03-20)

**Note:** Version bump only for package @clerk/nextjs

### [3.0.1-alpha.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.0.1-staging.0...@clerk/nextjs@3.0.1-alpha.1) (2022-03-20)

### Features

- **nextjs,remix:** Refactor remix and nextjs getAuthData to use common utils ([d5f5dba](https://github.com/clerk/javascript/commit/d5f5dbace577ae617636841ce51e7cccd5d25b95))

### Bug Fixes

- **nextjs,remix:** Make server getToken throw if called with no session ([f7736c1](https://github.com/clerk/javascript/commit/f7736c1f4730d713f3fbcedd73e2ef5a1ceee605))

### [3.0.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.0.1-staging.0...@clerk/nextjs@3.0.1-alpha.0) (2022-03-19)

### Bug Fixes

- **nextjs,remix:** Make server getToken throw if called with no session ([f7736c1](https://github.com/clerk/javascript/commit/f7736c1f4730d713f3fbcedd73e2ef5a1ceee605))

# [3.0.0-alpha.9](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.13...@clerk/nextjs@3.0.0-alpha.9) (2022-03-11)

### Features

- **clerk-remix:** Remove load options from `getAuth` ([246fe76](https://github.com/clerk/javascript/commit/246fe76943aedc07bed8510761a286ef324049ec))
- **nextjs:** Enforce withServerSideAuth callback return type ([3766a49](https://github.com/clerk/javascript/commit/3766a4938641de36f953ec49f45d539f971d778c))
- **nextjs:** Fetch user and session in parallel ([#49](https://github.com/clerk/javascript/issues/49)) ([fb89732](https://github.com/clerk/javascript/commit/fb89732952fba2d45fe9ea73820b6264f5e02dbc))
- **nextjs:** Move shared NextJS SSR types to types package ([78d8c7c](https://github.com/clerk/javascript/commit/78d8c7c3e84f3926127e48c655793a0fca3cdc2c))
- **nextjs:** Strictly type all possible withServerSideAuth return value combinations ([beba831](https://github.com/clerk/javascript/commit/beba83195828737ef20ca4450badded92d95d098))

## [3.0.0-alpha.8](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.4...@clerk/nextjs@3.0.0-alpha.8) (2022-02-28)

### Features

- **clerk-remix:** Remove load options from `getAuth` ([246fe76](https://github.com/clerk/javascript/commit/246fe76943aedc07bed8510761a286ef324049ec))
- **nextjs:** Enforce withServerSideAuth callback return type ([3766a49](https://github.com/clerk/javascript/commit/3766a4938641de36f953ec49f45d539f971d778c))
- **nextjs:** Fetch user and session in parallel ([#49](https://github.com/clerk/javascript/issues/49)) ([fb89732](https://github.com/clerk/javascript/commit/fb89732952fba2d45fe9ea73820b6264f5e02dbc))
- **nextjs:** Move shared NextJS SSR types to types package ([78d8c7c](https://github.com/clerk/javascript/commit/78d8c7c3e84f3926127e48c655793a0fca3cdc2c))
- **nextjs:** Strictly type all possible withServerSideAuth return value combinations ([beba831](https://github.com/clerk/javascript/commit/beba83195828737ef20ca4450badded92d95d098))

## [3.0.0-alpha.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.4...@clerk/nextjs@3.0.0-alpha.7) (2022-02-25)

### Features

- **clerk-remix:** Remove load options from `getAuth` ([5c1e23d](https://github.com/clerk/javascript/commit/5c1e23db40b7a49b7cec5a1d8206daad160e6361))
- **nextjs:** Enforce withServerSideAuth callback return type ([260d7cf](https://github.com/clerk/javascript/commit/260d7cfd255d6f6ff8d0dc2d32fb490008146804))
- **nextjs:** Fetch user and session in parallel ([#49](https://github.com/clerk/javascript/issues/49)) ([e5c2620](https://github.com/clerk/javascript/commit/e5c2620695d489b14e3c513d6773c4527c9baf8b))
- **nextjs:** Move shared NextJS SSR types to types package ([8b898a1](https://github.com/clerk/javascript/commit/8b898a1aa503889921180850292fbfa3c8133ef5))
- **nextjs:** Strictly type all possible withServerSideAuth return value combinations ([e99c57a](https://github.com/clerk/javascript/commit/e99c57adc816a42137c781477e43fe4f372d9d1e))

## [3.0.0-alpha.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.1-staging.0...@clerk/nextjs@3.0.0-alpha.6) (2022-02-18)

### Features

- **clerk-remix:** Remove load options from `getAuth` ([5f4cedc](https://github.com/clerk/javascript/commit/5f4cedc70db8398eb196ca769db41ebadb15ab12))
- **nextjs:** Enforce withServerSideAuth callback return type ([a45f28a](https://github.com/clerk/javascript/commit/a45f28ac0bcd357c36759112a73737487499ef3f))
- **nextjs:** Fetch user and session in parallel ([#49](https://github.com/clerk/javascript/issues/49)) ([ef58027](https://github.com/clerk/javascript/commit/ef58027b6d18c880074e1a55d0f2cfe4d83ab614))
- **nextjs:** Move shared NextJS SSR types to types package ([757dc2e](https://github.com/clerk/javascript/commit/757dc2ef1acf32f31bdad8bcab076bb710723781))

### [2.11.17](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.17-staging.1...@clerk/nextjs@2.11.17) (2022-03-17)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.17-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.17-staging.0...@clerk/nextjs@2.11.17-staging.1) (2022-03-17)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.15](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.14...@clerk/nextjs@2.11.15) (2022-03-14)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.14](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.13...@clerk/nextjs@2.11.14) (2022-03-11)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.13](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.12...@clerk/nextjs@2.11.13) (2022-03-09)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.12](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.12-staging.0...@clerk/nextjs@2.11.12) (2022-03-09)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.10](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.9...@clerk/nextjs@2.11.10) (2022-03-04)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.9](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.8...@clerk/nextjs@2.11.9) (2022-03-04)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.8](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.7...@clerk/nextjs@2.11.8) (2022-03-04)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.6...@clerk/nextjs@2.11.7) (2022-03-03)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.5...@clerk/nextjs@2.11.6) (2022-03-02)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.4...@clerk/nextjs@2.11.5) (2022-03-01)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.4-staging.0...@clerk/nextjs@2.11.4) (2022-02-24)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.4-staging.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.3-staging.0...@clerk/nextjs@2.11.4-staging.0) (2022-02-24)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.3-staging.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.2-staging.2...@clerk/nextjs@2.11.3-staging.0) (2022-02-17)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.2-staging.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.2-staging.1...@clerk/nextjs@2.11.2-staging.2) (2022-02-16)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.2-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.2-staging.0...@clerk/nextjs@2.11.2-staging.1) (2022-02-16)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.2-staging.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.1...@clerk/nextjs@2.11.2-staging.0) (2022-02-15)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.1-staging.0...@clerk/nextjs@2.11.1) (2022-02-14)

**Note:** Version bump only for package @clerk/nextjs

### 2.11.1-staging.0 (2022-02-11)

**Note:** Version bump only for package @clerk/nextjs
