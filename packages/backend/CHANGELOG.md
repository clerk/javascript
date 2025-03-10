# Change Log

## 0.38.15

### Patch Changes

- Updated dependencies [[`7805d5ec2`](https://github.com/clerk/javascript/commit/7805d5ec2f30527185221776a4391a0b23ac1d64)]:
  - @clerk/types@3.65.5

## 0.38.14

### Patch Changes

- Updated dependencies [[`c5df11382`](https://github.com/clerk/javascript/commit/c5df1138244b784f0400d2607565368a10f05bae), [`c5df11382`](https://github.com/clerk/javascript/commit/c5df1138244b784f0400d2607565368a10f05bae)]:
  - @clerk/shared@1.4.2
  - @clerk/types@3.65.4

## 0.38.13

### Patch Changes

- Updated dependencies [[`f18ca132d`](https://github.com/clerk/javascript/commit/f18ca132d745b0b2bdeff0ea9ab4f8e586cf8a84)]:
  - @clerk/types@3.65.3

## 0.38.12

### Patch Changes

- Fix bug in JWKS cache logic that caused a race condition resulting in no JWK being available. ([#3332](https://github.com/clerk/javascript/pull/3332)) by [@BRKalow](https://github.com/BRKalow)

## 0.38.11

### Patch Changes

- Updated dependencies [[`76a1087c3`](https://github.com/clerk/javascript/commit/76a1087c372d16dd2ab3b6f0b6f4961c00448a52)]:
  - @clerk/types@3.65.2

## 0.38.10

### Patch Changes

- Updated dependencies [[`a8c0128be`](https://github.com/clerk/javascript/commit/a8c0128beb404d6c6e707b0735b439af6efdd076)]:
  - @clerk/types@3.65.1

## 0.38.9

### Patch Changes

- Updated dependencies [[`fcc349cb5`](https://github.com/clerk/javascript/commit/fcc349cb59e4bfdf82165144ca5509a8c73d1325)]:
  - @clerk/types@3.65.0

## 0.38.8

### Patch Changes

- Updated dependencies [[`7cd9dd668`](https://github.com/clerk/javascript/commit/7cd9dd668a76be42ad37bb78b1bd805bac4768f6)]:
  - @clerk/types@3.64.1

## 0.38.7

### Patch Changes

- Deprecate `organization.members_count`. Use `organization.membersCount` instead. ([#3192](https://github.com/clerk/javascript/pull/3192)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`220b813d5`](https://github.com/clerk/javascript/commit/220b813d536618837b8082cf776ad77fe8f239a9), [`4cf2a2198`](https://github.com/clerk/javascript/commit/4cf2a2198ed418adbcd5c04a1b2cbf95335696f6), [`c8ba96b86`](https://github.com/clerk/javascript/commit/c8ba96b865b3d112c8e0ee92f1426e927807ad05)]:
  - @clerk/types@3.64.0

## 0.38.6

### Patch Changes

- Updated dependencies [[`222acd810`](https://github.com/clerk/javascript/commit/222acd8103ed6f26641a46ef2a5b96c4aef4ebbc)]:
  - @clerk/types@3.63.1

## 0.38.5

### Patch Changes

- Updated dependencies [[`d9612801c`](https://github.com/clerk/javascript/commit/d9612801cff947be8fd991c0ff50c819873daf57)]:
  - @clerk/shared@1.4.1

## 0.38.4

### Patch Changes

- Add support for `scrypt_werkzeug` in `UserAPI` `PasswordHasher`. ([#3069](https://github.com/clerk/javascript/pull/3069)) by [@Nikpolik](https://github.com/Nikpolik)

- Updated dependencies [[`cd2bf9dce`](https://github.com/clerk/javascript/commit/cd2bf9dce3626d9abcd67453d2d809e164d1af4c), [`b47264367`](https://github.com/clerk/javascript/commit/b47264367bb9d09a39379600aca74e6a8de8ece3)]:
  - @clerk/types@3.63.0
  - @clerk/shared@1.4.0

## 0.38.3

### Patch Changes

- Updated dependencies [[`f44ce8b76`](https://github.com/clerk/javascript/commit/f44ce8b762e6cb7dc81d475fa65cbc9f7a943d19)]:
  - @clerk/shared@1.3.3

## 0.38.2

### Patch Changes

- Updated dependencies [[`228096446`](https://github.com/clerk/javascript/commit/22809644642170260e342c96937df8ef6fdd3647)]:
  - @clerk/shared@1.3.2
  - @clerk/types@3.62.1

## 0.38.1

### Patch Changes

- Preserve url protocol when joining paths. ([#2754](https://github.com/clerk/javascript/pull/2754)) by [@clerk-cookie](https://github.com/clerk-cookie)

- Updated dependencies [[`cd00175cb`](https://github.com/clerk/javascript/commit/cd00175cbbf902e8c0a0a1ff3875c173e03259a7)]:
  - @clerk/types@3.62.0

## 0.38.0

### Minor Changes

- Add support for X/Twitter v2 OAuth provider ([#2697](https://github.com/clerk/javascript/pull/2697)) by [@clerk-cookie](https://github.com/clerk-cookie)

### Patch Changes

- Updated dependencies [[`38f0f862b`](https://github.com/clerk/javascript/commit/38f0f862bfc5eb697625131a753f4127ff262895)]:
  - @clerk/types@3.61.0

## 0.37.3

### Patch Changes

- Add the following properties to `users.updateUser(userId, params)` params: ([#2628](https://github.com/clerk/javascript/pull/2628)) by [@dimkl](https://github.com/dimkl)

  - `password_hasher`
  - `password_digest`
  - `publicMetadata`
  - `privateMetadata`
  - `unsafeMetadata`

## 0.37.2

### Patch Changes

- Replace the `Clerk-Backend-SDK` header with `User-Agent` in BAPI requests and update it's value to contain both the package name and the package version of the clerk package ([#2579](https://github.com/clerk/javascript/pull/2579)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  executing the request. Eg request from `@clerk/nextjs` to BAPI with append `User-Agent: @clerk/nextjs@5.0.0-alpha-v5.16` using the latest version.

  Miscellaneous changes: The backend test build changed to use tsup.

- Add deprecation warning for `EmailAPI.createEmail`. ([#2555](https://github.com/clerk/javascript/pull/2555)) by [@Nikpolik](https://github.com/Nikpolik)

  This endpoint is no longer available and the function will be removed in the next major version.

## 0.37.1

### Patch Changes

- Fixed a bug where backend API responses where missing error details. This was caused by parsing the errors twice once in the response error handling code and again when initializing the ClerkAPIResponseError. ([#2421](https://github.com/clerk/javascript/pull/2421)) by [@Nikpolik](https://github.com/Nikpolik)

- Updated dependencies [[`65332d744`](https://github.com/clerk/javascript/commit/65332d7440419e275e76ffde104b7d0fe98ceeda)]:
  - @clerk/shared@1.3.1

## 0.37.0

### Minor Changes

- Add `createOrganizationEnabled` param in `@clerk/backend` method `User.updateUser()` ([#2432](https://github.com/clerk/javascript/pull/2432)) by [@dimkl](https://github.com/dimkl)

  Example:

  ```typescript
      import { createClerkClient }  from '@clerk/backend';

      const clerkClient = createClerkClient({...});
      await clerkClient.users.updateUser('user_...', { createOrganizationEnabled: true })
  ```

### Patch Changes

- Updated dependencies [[`0bf0bdd56`](https://github.com/clerk/javascript/commit/0bf0bdd56268f53aa8b27f5d136c288afb10944b)]:
  - @clerk/shared@1.3.0

## 0.36.1

### Patch Changes

- `OrganizationMembershipRole` should respect authorization types provided by the developer if those exist. ([#2405](https://github.com/clerk/javascript/pull/2405)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`df40705d3`](https://github.com/clerk/javascript/commit/df40705d3fbb22b8b4d6fd8ee0a52b100146d88a)]:
  - @clerk/shared@1.2.0

## 0.36.0

### Minor Changes

- Introduce Protect for authorization. ([#2309](https://github.com/clerk/javascript/pull/2309)) by [@panteliselef](https://github.com/panteliselef)

  Changes in public APIs:

  - Rename Gate to Protect
  - Support for permission checks. (Previously only roles could be used)
  - Remove the `experimental` tags and prefixes
  - Drop `some` from the `has` utility and Protect. Protect now accepts a `condition` prop where a function is expected with the `has` being exposed as the param.
  - Protect can now be used without required props. In this case behaves as `<SignedIn>`, if no authorization props are passed.
  - `has` will throw an error if neither `permission` or `role` is passed.
  - `auth().protect()` for Nextjs App Router. Allow per page protection in app router. This utility will automatically throw a 404 error if user is not authorized or authenticated.
    - inside a page or layout file it will render the nearest `not-found` component set by the developer
    - inside a route handler it will return empty response body with a 404 status code

### Patch Changes

- Updated dependencies [[`b4868ab8f`](https://github.com/clerk/javascript/commit/b4868ab8fdb84144d2016b49e67e7fdd2c348316), [`2dc93d4d8`](https://github.com/clerk/javascript/commit/2dc93d4d8dcdc5f83c21576400ae6d6f43705847)]:
  - @clerk/types@3.60.0

## 0.35.1

### Patch Changes

- Updated dependencies [[`a62479810`](https://github.com/clerk/javascript/commit/a624798102236f77a667d8da13363b77486640f8)]:
  - @clerk/types@3.59.0

## 0.35.0

### Minor Changes

- Add missing `createdAt` param in `User#createUser()` of `@clerk/backend`. ([#2288](https://github.com/clerk/javascript/pull/2288)) by [@dimkl](https://github.com/dimkl)

  Fix `clerkClient.verifyToken()` signature to support a single `token: string` parameter.

### Patch Changes

- Added missing types for `clerkClient.invitations.createInvitation` ([#2287](https://github.com/clerk/javascript/pull/2287)) by [@clerk-cookie](https://github.com/clerk-cookie)

- Updated dependencies [[`31ee1438a`](https://github.com/clerk/javascript/commit/31ee1438aa848aff50889c31a2f2bb8098eb1424), [`12b362923`](https://github.com/clerk/javascript/commit/12b362923366a913a455b516a262455e0a40d723)]:
  - @clerk/types@3.58.1

## 0.34.3

### Patch Changes

- Drop the introduction of `OrganizationRole` and `OrganizationPermission` resources fro BAPI. ([#2257](https://github.com/clerk/javascript/pull/2257)) by [@panteliselef](https://github.com/panteliselef)

## 0.34.2

### Patch Changes

- Add OrganizationRoleAPI for CRUD operations regarding instance level organization roles. ([#2187](https://github.com/clerk/javascript/pull/2187)) by [@panteliselef](https://github.com/panteliselef)

- Deprecate `createSMSMessage` and `SMSMessageApi` from `clerkClient`. ([#2184](https://github.com/clerk/javascript/pull/2184)) by [@Nikpolik](https://github.com/Nikpolik)

  The `/sms_messages` Backend API endpoint will also be dropped in the future since this feature will no longer be available for new Clerk instances.

  For a brief period it will still be accessible for instances that have used it in the past 7
  days (13-11-2023 to 20-11-2023).

  New instances will get a 403 forbidden response if they try to access it.

- Add OrganizationPermissionAPI for CRUD operations regarding instance level organization permissions. ([#2185](https://github.com/clerk/javascript/pull/2185)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`e41374abf`](https://github.com/clerk/javascript/commit/e41374abf96ae62410ac63c03c5055d4f9af363e), [`e41374abf`](https://github.com/clerk/javascript/commit/e41374abf96ae62410ac63c03c5055d4f9af363e)]:
  - @clerk/shared@1.1.1

## 0.34.1

### Patch Changes

- Strip `experimental__has` from the auth object in `makeAuthObjectSerializable()`. This fixes an issue in Next.js where an error is being thrown when this function is passed to a client component as a prop. ([#2103](https://github.com/clerk/javascript/pull/2103)) by [@BRKalow](https://github.com/BRKalow)

## 0.34.0

### Minor Changes

- Experimental support for `<Gate/>` with role checks. ([#2051](https://github.com/clerk/javascript/pull/2051)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Fix type inferance for auth helper. ([#2049](https://github.com/clerk/javascript/pull/2049)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`7fa8fbcf2`](https://github.com/clerk/javascript/commit/7fa8fbcf21df0d52d49168eae511c580c5c82977), [`068a9025c`](https://github.com/clerk/javascript/commit/068a9025c7d7fb7e7207674d4d43844964053ca3), [`4c3429010`](https://github.com/clerk/javascript/commit/4c342901072ec37c4f77916ccdf964c6eaf04e81), [`d7fe11ede`](https://github.com/clerk/javascript/commit/d7fe11ede1b23bacc5d811c50587bac251d560b8), [`f9d1bc758`](https://github.com/clerk/javascript/commit/f9d1bc758972328be7ddb7d61f66baea2aaf2c96), [`f652a5618`](https://github.com/clerk/javascript/commit/f652a5618b7019c916000f78ea3c1e4abf9a6c1b)]:
  - @clerk/shared@1.1.0
  - @clerk/types@3.58.0

## 0.33.0

### Minor Changes

- Added prefers-color-scheme to interstitial ([#1985](https://github.com/clerk/javascript/pull/1985)) by [@clerk-cookie](https://github.com/clerk-cookie)

### Patch Changes

- Add clerkTraceId to ClerkBackendApiResponse and ClerkAPIResponseError to allow for better tracing and debugging API error responses. ([#1894](https://github.com/clerk/javascript/pull/1894)) by [@Nikpolik](https://github.com/Nikpolik)

  Uses `clerk_trace_id` when available in a response and defaults to [`cf-ray` identifier](https://developers.cloudflare.com/fundamentals/reference/cloudflare-ray-id/) if missing.

- Updated dependencies [[`f6f67f9ab`](https://github.com/clerk/javascript/commit/f6f67f9abb858aa2d12aa5a6afcc0091fa89225f), [`a8d7a687e`](https://github.com/clerk/javascript/commit/a8d7a687e7771f24735ca6ff05da86441193a591), [`0f8aedd62`](https://github.com/clerk/javascript/commit/0f8aedd621dde78d6304b51668a9b06272c5d540), [`bc19fe025`](https://github.com/clerk/javascript/commit/bc19fe025d8b1ee9339dcffdb1dd785d00c4e766), [`60ea712fa`](https://github.com/clerk/javascript/commit/60ea712fa389dd43ffe72454c1fa9b7784bca2c4)]:
  - @clerk/types@3.57.1
  - @clerk/shared@1.0.2

## 0.32.1

### Patch Changes

- Updated dependencies [[`29a5f5641`](https://github.com/clerk/javascript/commit/29a5f56416db5e802ee38512205e5092d9b0b420)]:
  - @clerk/shared@1.0.1

## 0.32.0

### Minor Changes

- Add support for NextJS 14 ([#1948](https://github.com/clerk/javascript/pull/1948)) by [@desiprisg](https://github.com/desiprisg)

## 0.31.3

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Update imports of `@clerk/shared` to granular entrypoints. This addresses warnings during a Next.js build that are the result of unsupported APIs being included in the module graph of builds for the edge runtime. ([#1924](https://github.com/clerk/javascript/pull/1924)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`3bf64107e`](https://github.com/clerk/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`52f8553d2`](https://github.com/clerk/javascript/commit/52f8553d22f9454ee1194fd162410db15da7a4be), [`92727eec3`](https://github.com/clerk/javascript/commit/92727eec39566278263ffa118a085493f964eb94), [`b09b66eec`](https://github.com/clerk/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerk/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62), [`aa4cd7615`](https://github.com/clerk/javascript/commit/aa4cd761585b888706a36a6eed7436a8f0476dbf)]:
  - @clerk/shared@1.0.0
  - @clerk/types@3.57.0

## 0.31.2

### Patch Changes

- Updated dependencies [[`9ca215702`](https://github.com/clerk/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11)]:
  - @clerk/types@3.56.1

## 0.31.1

### Patch Changes

- Added new function `signJwt(payload, key, options)` for JWT token signing. ([#1786](https://github.com/clerk/javascript/pull/1786)) by [@Nikpolik](https://github.com/Nikpolik)

  Also updated the existing `hasValidSignature` and `verifyJwt` method to handle PEM-formatted keys directly (previously they had to be converted to jwks).
  For key compatibility, support is specifically confined to `RSA` types and formats `jwk, pkcs8, spki`.

- Updated dependencies [[`35be8709d`](https://github.com/clerk/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`e38488c92`](https://github.com/clerk/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerk/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`9b644d799`](https://github.com/clerk/javascript/commit/9b644d7991b8cba4b385e9443f87798cde5c9989), [`a9894b445`](https://github.com/clerk/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`834dadb36`](https://github.com/clerk/javascript/commit/834dadb36c30b2a8f052784de4ad1026b0083b4e), [`70f251007`](https://github.com/clerk/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`a46d6fe99`](https://github.com/clerk/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/types@3.56.0
  - @clerk/shared@0.24.5

## 0.31.0

### Minor Changes

- Add support for LinkedIn OIDC ([#1772](https://github.com/clerk/javascript/pull/1772)) by [@fragoulis](https://github.com/fragoulis)

### Patch Changes

- Throw an error if the `signInUrl` is on the same origin of a satellite application or if it is of invalid format ([#1845](https://github.com/clerk/javascript/pull/1845)) by [@desiprisg](https://github.com/desiprisg)

- Avoid always showing deprecation warnings for `frontendApi` and `apiKey` in `@clerk/clerk-sdk-node` ([#1856](https://github.com/clerk/javascript/pull/1856)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`977336f79`](https://github.com/clerk/javascript/commit/977336f793cd4ce5984f98dac3cedf9f5ec363f5), [`997b8e256`](https://github.com/clerk/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91e9a55f4`](https://github.com/clerk/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`91014880d`](https://github.com/clerk/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`7f4d4b942`](https://github.com/clerk/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b)]:
  - @clerk/shared@0.24.4
  - @clerk/types@3.55.0

## 0.30.3

### Patch Changes

- Apply deprecation warnings for @clerk/types: ([#1823](https://github.com/clerk/javascript/pull/1823)) by [@dimkl](https://github.com/dimkl)

  - `orgs` jwt claims
  - `apiKey`
  - `frontendApi`
  - `redirect_url`
  - `password`
  - `generateSignature`
  - `afterSwitchOrganizationUrl`
  - `profileImageUrl`

- Remove deprecation warning that is logging more than intended and not actionable for users of our SDKs. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Retry the implemented changes from [#1767](https://github.com/clerk/javascript/pull/1767) which were reverted in [#1806](https://github.com/clerk/javascript/pull/1806) due to RSC related errors (not all uses components had the `use client` directive). Restore the original PR and add additional `use client` directives to ensure it works correctly. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1e212c19d`](https://github.com/clerk/javascript/commit/1e212c19d1cbfbcf6bc6718f5aec0a3cb893b96f), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679)]:
  - @clerk/shared@0.24.3

## 0.30.2

### Patch Changes

- Improve the `jwk-remote-missing` error by adding the available JWK IDs to the error message. This way you can understand why the entry was not found and compare the available ones with other keys. ([#1816](https://github.com/clerk/javascript/pull/1816)) by [@LekoArts](https://github.com/LekoArts)

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Update `authenticateRequest()` to respect the `CloudFront-Forwarded-Proto` header when determining the correct `forwardedProto` value. This fixes an issue when Clerk is used in applications that are deployed behind AWS CloudFront, where previously all requests were treated as cross-origin. ([#1817](https://github.com/clerk/javascript/pull/1817)) by [@dimkl](https://github.com/dimkl)

- Remove experimenta jsdoc tags from multi-domain types. ([#1819](https://github.com/clerk/javascript/pull/1819)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerk/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`164f3aac7`](https://github.com/clerk/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerk/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerk/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`9514618d6`](https://github.com/clerk/javascript/commit/9514618d65cfdde0ff011eabd41a992b61fc8dc1), [`c7c6912f3`](https://github.com/clerk/javascript/commit/c7c6912f34874467bc74104690fe9f95491cc10d), [`71bb1c7b5`](https://github.com/clerk/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf)]:
  - @clerk/types@3.54.0

## 0.30.1

### Patch Changes

- Temporarily revert internal change to resolve RSC-related errors ([#1806](https://github.com/clerk/javascript/pull/1806)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 0.30.0

### Minor Changes

- Replace utilities with `@clerk/shared` exports ([#1769](https://github.com/clerk/javascript/pull/1769)) by [@dimkl](https://github.com/dimkl)

- Introduce a new getOrganizationInvitationList() method, along with support for filtering by status and the regular limit & offset parameters, which it can be used in order to list the invitations of a specific organization. We also marked the old getPendingOrganizationInvitationList() method as deprecated ([#1796](https://github.com/clerk/javascript/pull/1796)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Apply deprecation warnings for `@clerk/backend`: ([#1777](https://github.com/clerk/javascript/pull/1777)) by [@dimkl](https://github.com/dimkl)

  - backend api return format
  - `clockSkewInSeconds`
  - `pkgVersion`
  - `picture`/`logoUrl`/`profileImageUrl`
  - `InterstitialAPI`
  - `httpOptions`
  - `apiKey`
  - `frontendApi`
  - `__unstable_options`

- Updated dependencies [[`7ffa6fac3`](https://github.com/clerk/javascript/commit/7ffa6fac3762f6fb130ba2f2fcaa28e52b36b3b4), [`5c8754239`](https://github.com/clerk/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81), [`2f6a6ac99`](https://github.com/clerk/javascript/commit/2f6a6ac9991469bf8532019bb22ff50adecdb434), [`753f7bbda`](https://github.com/clerk/javascript/commit/753f7bbda9bbb7444f96222a3b6cae815a09058f), [`55c8ebd39`](https://github.com/clerk/javascript/commit/55c8ebd390dd88036aee06866009be6a50c63138)]:
  - @clerk/shared@0.24.0
  - @clerk/types@3.53.0

## 0.29.3

### Patch Changes

- Updated dependencies [[`c61ddf5bf`](https://github.com/clerk/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerk/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/types@3.52.1

## 0.29.2

### Patch Changes

- Refactor the internal jwt assertions in separate module to improve testability and changed dates to UTC in jwt verification error messages ([#1724](https://github.com/clerk/javascript/pull/1724)) by [@dimkl](https://github.com/dimkl)

- Removing the `__clerk_referrer_primary` that was marked as deprecated. It was introduced to support the multi-domain featured, but was replaced shortly after. ([#1755](https://github.com/clerk/javascript/pull/1755)) by [@panteliselef](https://github.com/panteliselef)

- Fix 1 second flakiness in assertions tests ([#1758](https://github.com/clerk/javascript/pull/1758)) by [@dimkl](https://github.com/dimkl)

- Refactor the internal generation of request URLs to use a shared helper from `@clerk/backend` ([#1532](https://github.com/clerk/javascript/pull/1532)) by [@dimkl](https://github.com/dimkl)

## 0.29.1

### Patch Changes

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- Fix missing members_count property for an Organization ([#1735](https://github.com/clerk/javascript/pull/1735)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`e99df0a0d`](https://github.com/clerk/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerk/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`01b024c57`](https://github.com/clerk/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68)]:
  - @clerk/types@3.52.0

## 0.29.0

### Minor Changes

- Introduce a new getOrganizationInvitation() method with which you can fetch a single organization invitation by providing the ID ([#1682](https://github.com/clerk/javascript/pull/1682)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Updated dependencies [[`463ff84f5`](https://github.com/clerk/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`1426e5eb3`](https://github.com/clerk/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739)]:
  - @clerk/types@3.51.0

## 0.28.1

### Patch Changes

- Improve error messaging when clock skew is detected. ([#1661](https://github.com/clerk/javascript/pull/1661)) by [@BRKalow](https://github.com/BRKalow)

## 0.28.0

### Minor Changes

- Introduce `hasImage` in User / Organization / Session resources ([#1544](https://github.com/clerk/javascript/pull/1544)) by [@dimkl](https://github.com/dimkl)

- Include `signUpUrl`, `afterSignInUrl` and `afterSignUpUrl` to `authenticateRequest` options. ([#1470](https://github.com/clerk/javascript/pull/1470)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Updated dependencies [[`96cc1921c`](https://github.com/clerk/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerk/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerk/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerk/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerk/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerk/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerk/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerk/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerk/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerk/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`86de584dd`](https://github.com/clerk/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e02a1aff2`](https://github.com/clerk/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerk/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerk/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerk/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerk/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerk/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`89bc5de04`](https://github.com/clerk/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/types@3.50.0

## 0.27.0

### Minor Changes

- Add filter by status(pending, accepted, revoked) support for getInvitationList method ([#1533](https://github.com/clerk/javascript/pull/1533)) by [@raptisj](https://github.com/raptisj)

### Patch Changes

- Deprecate usage of old image fields in favor of `imageUrl` ([#1543](https://github.com/clerk/javascript/pull/1543)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`ea95525a4`](https://github.com/clerk/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerk/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`d433b83b9`](https://github.com/clerk/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerk/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`0a59e122d`](https://github.com/clerk/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/types@3.49.0

## 0.26.0

### Minor Changes

- Support hosting NextJs apps on non-Vercel platforms by constructing req.url using host-related headers instead of using on req.url directly. CLERK_TRUST_HOST is now enabled by default. ([#1492](https://github.com/clerk/javascript/pull/1492)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerk/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3)]:
  - @clerk/types@3.48.1

## 0.25.1

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerk/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c)]:
  - @clerk/types@3.48.0

## 0.25.0

### Minor Changes

- Introduce `createIsomorphicRequest` in `@clerk/backend` ([#1393](https://github.com/clerk/javascript/pull/1393)) by [@anagstef](https://github.com/anagstef)

  This utility simplifies the `authenticateRequest` signature, and it makes it easier to integrate with more frameworks.

- Add `updateUserProfileImage` and `updateOrganizationLogo` methods for uploading images to `User` and `Organization` respectively. ([#1456](https://github.com/clerk/javascript/pull/1456)) by [@anagstef](https://github.com/anagstef)

### Patch Changes

- Add missing property 'adminDeleteEnabled' in Organization resource ([#1468](https://github.com/clerk/javascript/pull/1468)) by [@chanioxaris](https://github.com/chanioxaris)

- Fix the headers checked to determine the Response Content-Type ([#1469](https://github.com/clerk/javascript/pull/1469)) by [@anagstef](https://github.com/anagstef)

- Add missing property 'privateMetadata' in OrganizationInvitation resource ([#1468](https://github.com/clerk/javascript/pull/1468)) by [@chanioxaris](https://github.com/chanioxaris)

- Updated dependencies [[`73c9c1d0e`](https://github.com/clerk/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerk/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerk/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`090bab66e`](https://github.com/clerk/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`592911196`](https://github.com/clerk/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8)]:
  - @clerk/types@3.47.0

## 0.24.0

### Minor Changes

- The `clockSkewInSeconds` property is now deprecated from the `verifyJWT` options in favour of the new `clockSkewInMs` property. The old property accepted a value in milliseconds, so this change fixes the property name. ([#1450](https://github.com/clerk/javascript/pull/1450)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Add a more descriptive error when secret key is invalid ([#1446](https://github.com/clerk/javascript/pull/1446)) by [@raptisj](https://github.com/raptisj)

## 0.23.7

### Patch Changes

- Treat expired JWT as signed-out state for requests originated from non-browser clients on satellite apps ([#1433](https://github.com/clerk/javascript/pull/1433)) by [@panteliselef](https://github.com/panteliselef)

- Make all 4 keys (legacy and new) optional in authenticateRequest params ([#1437](https://github.com/clerk/javascript/pull/1437)) by [@anagstef](https://github.com/anagstef)

- Increase the default value for clock skew in `verifyJwt` from 2 to 5 seconds ([#1428](https://github.com/clerk/javascript/pull/1428)) by [@anagstef](https://github.com/anagstef)

## 0.23.6

### Patch Changes

- Updated dependencies [[`30f8ad18a`](https://github.com/clerk/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c)]:
  - @clerk/types@3.46.1

## 0.23.5

### Patch Changes

- Updated dependencies [[`bfb3af28`](https://github.com/clerk/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/types@3.46.0

## 0.23.4

### Patch Changes

- Simplify the signature of the low-level `authenticateRequest` helper. ([#1329](https://github.com/clerk/javascript/pull/1329)) by [@anagstef](https://github.com/anagstef)

  - One pair of legacy or new instance keys are required instead of all 4 of them in `authenticateRequest`
  - `@clerk/backend` now can handle the `"Bearer "` prefix in Authorization header for better DX
  - `host` parameter is now optional in `@clerk/backend`

- Updated dependencies [[`11954816`](https://github.com/clerk/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`32148490`](https://github.com/clerk/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0

## 0.23.3

### Patch Changes

- Updated dependencies [[`17cc14ec`](https://github.com/clerk/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/types@3.44.0

## 0.23.2

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerk/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerk/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/types@3.43.0

## 0.23.1

### Patch Changes

- Allow `clerkJSVersion` to be passed when loading interstitial. Support for ([#1354](https://github.com/clerk/javascript/pull/1354)) by [@panteliselef](https://github.com/panteliselef)

  - Nextjs
  - Remix
  - Node

## 0.23.0

### Minor Changes

- Support `audience` parameter in authentication request ([#1004](https://github.com/clerk/javascript/pull/1004)) by [@dimkl](https://github.com/dimkl)

  The audience parameter is used to verify the the aud claim in
  the request matches the value of the parameter or is included
  (when the user provides a list).

  Resolves:

  - [#978](https://github.com/clerk/javascript/pull/978)
  - [#1004](https://github.com/clerk/javascript/pull/1004)

### Patch Changes

- Updated dependencies [[`c42b4ac0`](https://github.com/clerk/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963)]:
  - @clerk/types@3.42.0

## 0.22.0

### Minor Changes

- Add support for NextJS applications hosted on AWS Amplify by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Address npm audit issues for the clerk backend package by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Add support for NextJS applications hosted on Railway by [@nikosdouvlis](https://github.com/nikosdouvlis)

### Patch Changes

- Remove unused `url` prop from `redirectToSignIn` and `redirectToSignUp` helpers by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/types@3.41.1

## [0.21.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.21.0-staging.4...@clerk/backend@0.21.0) (2023-06-03)

**Note:** Version bump only for package @clerk/backend

### [0.20.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.20.1-staging.0...@clerk/backend@0.20.1) (2023-05-26)

**Note:** Version bump only for package @clerk/backend

## [0.20.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.20.0-staging.2...@clerk/backend@0.20.0) (2023-05-23)

**Note:** Version bump only for package @clerk/backend

### [0.19.2](https://github.com/clerk/javascript/compare/@clerk/backend@0.19.2-staging.1...@clerk/backend@0.19.2) (2023-05-18)

**Note:** Version bump only for package @clerk/backend

### [0.19.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.19.1-staging.1...@clerk/backend@0.19.1) (2023-05-17)

**Note:** Version bump only for package @clerk/backend

## [0.19.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.19.0-staging.1...@clerk/backend@0.19.0) (2023-05-15)

**Note:** Version bump only for package @clerk/backend

## [0.18.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.18.0-staging.4...@clerk/backend@0.18.0) (2023-05-04)

**Note:** Version bump only for package @clerk/backend

## [0.18.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/backend@0.18.0-staging.3...@clerk/backend@0.18.0-staging.4) (2023-05-04)

**Note:** Version bump only for package @clerk/backend

## [0.18.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/backend@0.18.0-staging.2...@clerk/backend@0.18.0-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/backend

### [0.17.2](https://github.com/clerk/javascript/compare/@clerk/backend@0.17.2-staging.0...@clerk/backend@0.17.2) (2023-04-19)

**Note:** Version bump only for package @clerk/backend

### [0.17.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.17.0...@clerk/backend@0.17.1) (2023-04-19)

### Bug Fixes

- **backend:** Add missing Webhooks export ([db8d224](https://github.com/clerk/javascript/commit/db8d22433779e39d7b566acf8a5b7b50d57d3738))

## [0.17.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.17.0-staging.0...@clerk/backend@0.17.0) (2023-04-12)

**Note:** Version bump only for package @clerk/backend

### [0.16.2](https://github.com/clerk/javascript/compare/@clerk/backend@0.16.2-staging.3...@clerk/backend@0.16.2) (2023-04-11)

**Note:** Version bump only for package @clerk/backend

### [0.16.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.16.1-staging.0...@clerk/backend@0.16.1) (2023-04-06)

**Note:** Version bump only for package @clerk/backend

## [0.16.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.16.0-staging.2...@clerk/backend@0.16.0) (2023-03-31)

**Note:** Version bump only for package @clerk/backend

## [0.16.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.15.1-staging.0...@clerk/backend@0.16.0-staging.0) (2023-03-31)

### Features

- **backend:** Add signInUrl to buildPublicInterstitialUrl ([2bbbaa6](https://github.com/clerk/javascript/commit/2bbbaa662c6fd8be3e95dc1c4ed3700e47f39f75))
- **backend:** Support multi-domain in dev instances ([2b8eb75](https://github.com/clerk/javascript/commit/2b8eb7542adbc20d7f075603fb5091063faca7e5))

### Bug Fixes

- **backend:** Update interstitial to include signInUrl ([d923618](https://github.com/clerk/javascript/commit/d923618f4b285c53c411cc4a4ba821792c4c33e7))

## [0.15.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.15.0-staging.0...@clerk/backend@0.15.0) (2023-03-29)

**Note:** Version bump only for package @clerk/backend

### [0.13.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.13.1-staging.2...@clerk/backend@0.13.1) (2023-03-10)

**Note:** Version bump only for package @clerk/backend

## [0.13.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.13.0-staging.1...@clerk/backend@0.13.0) (2023-03-09)

**Note:** Version bump only for package @clerk/backend

## [0.12.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.12.0-staging.1...@clerk/backend@0.12.0) (2023-03-07)

**Note:** Version bump only for package @clerk/backend

## [0.11.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.11.0-staging.1...@clerk/backend@0.11.0) (2023-03-03)

**Note:** Version bump only for package @clerk/backend

## [0.10.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.10.0-staging.0...@clerk/backend@0.10.0) (2023-03-01)

**Note:** Version bump only for package @clerk/backend

### [0.9.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.9.1-staging.0...@clerk/backend@0.9.1) (2023-02-25)

**Note:** Version bump only for package @clerk/backend

## [0.9.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.9.0-staging.0...@clerk/backend@0.9.0) (2023-02-24)

**Note:** Version bump only for package @clerk/backend

### [0.8.1-staging.4](https://github.com/clerk/javascript/compare/@clerk/backend@0.8.1-staging.3...@clerk/backend@0.8.1-staging.4) (2023-02-22)

### Bug Fixes

- **backend:** Update user params ([624402f](https://github.com/clerk/javascript/commit/624402fa0e2ff00819254d0fe0e6e7f44bdbe42c))

## [0.8.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.8.0-staging.0...@clerk/backend@0.8.0) (2023-02-17)

**Note:** Version bump only for package @clerk/backend

## [0.7.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.7.0-staging.0...@clerk/backend@0.7.0) (2023-02-15)

**Note:** Version bump only for package @clerk/backend

### [0.6.2](https://github.com/clerk/javascript/compare/@clerk/backend@0.6.2-staging.1...@clerk/backend@0.6.2) (2023-02-10)

**Note:** Version bump only for package @clerk/backend

### [0.6.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.6.1-staging.0...@clerk/backend@0.6.1) (2023-02-07)

**Note:** Version bump only for package @clerk/backend

### [0.6.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.6.0-staging.0...@clerk/backend@0.6.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/backend

## [0.6.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.6.0-staging.0...@clerk/backend@0.6.0) (2023-02-07)

**Note:** Version bump only for package @clerk/backend

### [0.5.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.5.1-staging.4...@clerk/backend@0.5.1) (2023-02-01)

**Note:** Version bump only for package @clerk/backend

## [0.5.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.5.0-staging.2...@clerk/backend@0.5.0) (2023-01-27)

**Note:** Version bump only for package @clerk/backend

### [0.4.3](https://github.com/clerk/javascript/compare/@clerk/backend@0.4.3-staging.1...@clerk/backend@0.4.3) (2023-01-24)

### Bug Fixes

- **backend,clerk-sdk-node,shared:** Drop support for NodeJS 12 ([d9169ab](https://github.com/clerk/javascript/commit/d9169ab4873e1745d7250628f5bf8c8f7da49421))

### [0.4.2](https://github.com/clerk/javascript/compare/@clerk/backend@0.4.1...@clerk/backend@0.4.2) (2023-01-20)

**Note:** Version bump only for package @clerk/backend

### [0.4.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.4.1-staging.0...@clerk/backend@0.4.1) (2023-01-18)

**Note:** Version bump only for package @clerk/backend

## [0.4.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.4.0-staging.7...@clerk/backend@0.4.0) (2023-01-17)

### Bug Fixes

- **backend,clerk-sdk-node,shared:** Support node12 runtimes ([fdcd6b3](https://github.com/clerk/javascript/commit/fdcd6b3f7c61490297a5fdfa80228cbb7787b49b))
- **backend:** Polyfill webcrypto for node14 and node12 ([329bd6d](https://github.com/clerk/javascript/commit/329bd6d3426929e2cee06aeb04fd910b394a920f))

### [0.3.2](https://github.com/clerk/javascript/compare/@clerk/backend@0.3.2-staging.0...@clerk/backend@0.3.2) (2022-12-23)

**Note:** Version bump only for package @clerk/backend

### [0.3.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.3.1-staging.1...@clerk/backend@0.3.1) (2022-12-19)

**Note:** Version bump only for package @clerk/backend

## [0.3.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.3.0-staging.0...@clerk/backend@0.3.0) (2022-12-13)

**Note:** Version bump only for package @clerk/backend

### [0.2.3](https://github.com/clerk/javascript/compare/@clerk/backend@0.2.2...@clerk/backend@0.2.3) (2022-12-12)

**Note:** Version bump only for package @clerk/backend

### [0.2.2](https://github.com/clerk/javascript/compare/@clerk/backend@0.2.2-staging.1...@clerk/backend@0.2.2) (2022-12-09)

**Note:** Version bump only for package @clerk/backend

### [0.2.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.2.0...@clerk/backend@0.2.1) (2022-12-08)

**Note:** Version bump only for package @clerk/backend

## [0.2.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.2.0-staging.0...@clerk/backend@0.2.0) (2022-12-08)

**Note:** Version bump only for package @clerk/backend

### [0.1.1](https://github.com/clerk/javascript/compare/@clerk/backend@0.1.1-staging.0...@clerk/backend@0.1.1) (2022-12-02)

**Note:** Version bump only for package @clerk/backend

## [0.1.0](https://github.com/clerk/javascript/compare/@clerk/backend@0.1.0-staging.4...@clerk/backend@0.1.0) (2022-11-30)

**Note:** Version bump only for package @clerk/backend

## [0.1.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/backend@0.1.0-staging.3...@clerk/backend@0.1.0-staging.4) (2022-11-29)

**Note:** Version bump only for package @clerk/backend
