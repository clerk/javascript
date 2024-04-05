# Change Log

## 5.0.0-beta.26

### Minor Changes

- Pass environment into `sdkMetadata` in order to detect if production clerk-js is used by other sdks in dev mode. When it is log dev warning from clerk-js. ([#2802](https://github.com/clerk/javascript/pull/2802)) by [@panteliselef](https://github.com/panteliselef)

## 5.0.0-beta.25

### Patch Changes

- Updated dependencies [[`1834a3ee4`](https://github.com/clerk/javascript/commit/1834a3ee496ea27b9f7ceeb32ec5361f9de8ee30), [`15af02a83`](https://github.com/clerk/javascript/commit/15af02a837b0e87ea83f3a86dfacc149adca1345)]:
  - @clerk/shared@2.0.0-beta.17
  - @clerk/backend@1.0.0-beta.25

## 5.0.0-beta.24

### Patch Changes

- Updated dependencies [[`db18787c4`](https://github.com/clerk/javascript/commit/db18787c4d9fa8ee1306db9b65f3b3f5e2fe2dad)]:
  - @clerk/shared@2.0.0-beta.16
  - @clerk/backend@1.0.0-beta.24

## 5.0.0-beta.23

### Patch Changes

- Updated dependencies [[`6eab66050`](https://github.com/clerk/javascript/commit/6eab66050608a1bc5cb9aca6a234b1fea16106e5)]:
  - @clerk/shared@2.0.0-beta.15
  - @clerk/backend@1.0.0-beta.23

## 5.0.0-beta.22

### Patch Changes

- Updated dependencies [[`12f3c5c55`](https://github.com/clerk/javascript/commit/12f3c5c55580f93a81df27851fbc92ce1312107e)]:
  - @clerk/shared@2.0.0-beta.14
  - @clerk/backend@1.0.0-beta.22

## 5.0.0-beta.21

### Patch Changes

- Updated dependencies [[`051833167`](https://github.com/clerk/javascript/commit/0518331675ffb4d6c6830d79a1d61f9e4466773a)]:
  - @clerk/backend@1.0.0-beta.21

## 5.0.0-beta.20

### Patch Changes

- Rename beta-v5 to beta by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`2de442b24`](https://github.com/clerk/javascript/commit/2de442b2465cc5d424b8a0b21aa57c557f3aa2e7)]:
  - @clerk/backend@1.0.0-beta.20
  - @clerk/shared@2.0.0-beta.13

## 5.0.0-beta-v5.19

### Patch Changes

- Updated dependencies [[`966b31205`](https://github.com/clerk/javascript/commit/966b312050b572fbbbc07a6f0581cbec21847375), [`a8901be64`](https://github.com/clerk/javascript/commit/a8901be64fe91125a0d38a3c880ffa73168ccf5c), [`7b200af49`](https://github.com/clerk/javascript/commit/7b200af4908839ea661ddf2a76811057b545cafc), [`244de5ea3`](https://github.com/clerk/javascript/commit/244de5ea3a7641727cd85c544bb79fb04f2c0808), [`034c47ccb`](https://github.com/clerk/javascript/commit/034c47ccbef0129b9be9ff8aef683aa039e52602), [`8daf8451c`](https://github.com/clerk/javascript/commit/8daf8451cb564bc834dd856174ffc2cdfa932e37), [`7f751c4ef`](https://github.com/clerk/javascript/commit/7f751c4ef2d14410058cf65ea984a93b50c0b87e), [`4fced88ac`](https://github.com/clerk/javascript/commit/4fced88acc66a4837779d8bbca359086cddeec56), [`be991365e`](https://github.com/clerk/javascript/commit/be991365e1c78d0f1dfc59bb33dd533b6fad223a), [`c2b982749`](https://github.com/clerk/javascript/commit/c2b98274970bac5af33c9bb2e84c70ad90225180)]:
  - @clerk/backend@1.0.0-beta-v5.19
  - @clerk/shared@2.0.0-beta-v5.12

## 5.0.0-beta-v5.18

### Patch Changes

- The following paginated APIs now return `{ data, totalCount }` instead of simple arrays, in order to make building paginated UIs easier: ([#2633](https://github.com/clerk/javascript/pull/2633)) by [@dimkl](https://github.com/dimkl)

  - `clerkClient.users.getOrganizationMembershipList(...)`
  - `clerkClient.organization.getOrganizationList(...)`
  - `clerkClient.organization.getOrganizationInvitationList(...)`

  Revert changing the `{ data, errors }` return value of the following helpers to throw the `errors` or return the `data` (keep v4 format):

  - `import { verifyToken } from '@clerk/backend'`
  - `import { signJwt, hasValidSignature, decodeJwt, verifyJwt } from '@clerk/backend/jwt'`
  - BAPI `clerkClient` methods eg (`clerkClient.users.getUserList(...)`)

- Updated dependencies [[`8e5c881c4`](https://github.com/clerk/javascript/commit/8e5c881c40d7306c5dbd2e1f1803fbf75127bd71), [`d4ff346dd`](https://github.com/clerk/javascript/commit/d4ff346dd53bb3e1970e80bdc7b188c2dd344f12), [`a6308c67e`](https://github.com/clerk/javascript/commit/a6308c67e329879e001cee56cccd82e60b804422)]:
  - @clerk/backend@1.0.0-beta-v5.18
  - @clerk/shared@2.0.0-beta-v5.11

## 5.0.0-alpha-v5.17

### Major Changes

- Changes the `request.auth` type from `LegacyAuthObject` to `AuthObject`. ([#2609](https://github.com/clerk/javascript/pull/2609)) by [@dimkl](https://github.com/dimkl)

  ```typescript
  type LegacyAuthObject = {
    sessionId: string | null;
    actor: ActClaim | undefined | null;
    userId: string | null;
    getToken: ServerGetToken | null;
    debug: AuthObjectDebug | null;
    claims: JwtPayload | null;
  };

  type AuthObject = {
    sessionClaims: JwtPayload | null;
    sessionId: string | null;
    actor: ActClaim | undefined | null;
    userId: string | null;
    orgId: string | undefined | null;
    orgRole: OrganizationCustomRoleKey | undefined | null;
    orgSlug: string | undefined | null;
    orgPermissions: OrganizationCustomPermissionKey[] | undefined | null;
    getToken: ServerGetToken | null;
    has: CheckAuthorizationWithCustomPermissions | null;
    debug: AuthObjectDebug | null;
  };
  ```

### Patch Changes

- Updated dependencies [[`3a2f13604`](https://github.com/clerk/javascript/commit/3a2f13604e1b8b351a05de26d2c0672503aa67b3), [`9e99eb727`](https://github.com/clerk/javascript/commit/9e99eb7276249c68ef6f930cce418ce0004653b9), [`6fffd3b54`](https://github.com/clerk/javascript/commit/6fffd3b542f3df0bcb49281b7c4f77209a83f7a1)]:
  - @clerk/backend@1.0.0-alpha-v5.17

## 5.0.0-alpha-v5.16

### Patch Changes

- Update README for v5 ([#2577](https://github.com/clerk/javascript/pull/2577)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`935b0886e`](https://github.com/clerk/javascript/commit/935b0886e8317445f30c92000a27ed68e1223ff6), [`6a769771c`](https://github.com/clerk/javascript/commit/6a769771c975996d8d52b35b5cfdbae5dcec85d4)]:
  - @clerk/backend@1.0.0-alpha-v5.16

## 5.0.0-alpha-v5.15

### Minor Changes

- Replace the `Clerk-Backend-SDK` header with `User-Agent` in BAPI requests and update it's value to contain both the package name and the package version of the clerk package ([#2558](https://github.com/clerk/javascript/pull/2558)) by [@dimkl](https://github.com/dimkl)

  executing the request. Eg request from `@clerk/nextjs` to BAPI with append `User-Agent: @clerk/nextjs@5.0.0-alpha-v5.16` using the latest version.

  Miscellaneous changes: The backend test build changed to use tsup.

### Patch Changes

- Updated dependencies [[`799abc281`](https://github.com/clerk/javascript/commit/799abc281182efb953dd6637f9db7fc61c71a2cd), [`8cc45d2af`](https://github.com/clerk/javascript/commit/8cc45d2af98320ccced3768fb039b86576e424a5), [`b4e79c1b9`](https://github.com/clerk/javascript/commit/b4e79c1b9ab8e14cbfccaf290f0f596da0416e13)]:
  - @clerk/backend@1.0.0-alpha-v5.15
  - @clerk/shared@2.0.0-alpha-v5.10

## 5.0.0-alpha-v5.14

### Patch Changes

- Updated dependencies [[`448e02e93`](https://github.com/clerk/javascript/commit/448e02e93cf2392878d5891009640c52103d99a8), [`e6ecbaa2f`](https://github.com/clerk/javascript/commit/e6ecbaa2ff7add95bf888cb4ce43457b9fde7a13), [`e921af259`](https://github.com/clerk/javascript/commit/e921af259e9bdc8810a830bed54d71cf8eced1f8)]:
  - @clerk/backend@1.0.0-alpha-v5.14

## 5.0.0-alpha-v5.13

### Patch Changes

- Updated dependencies [[`1dc28ab46`](https://github.com/clerk/javascript/commit/1dc28ab46f6930074334be183c637ce7a81bebf7), [`ea4933655`](https://github.com/clerk/javascript/commit/ea4933655863ce315324aa2a3be7d5f263c2b61f), [`38d8b3e8a`](https://github.com/clerk/javascript/commit/38d8b3e8a0387bcf0b9c8d16e3bbfcfe9b643ca2)]:
  - @clerk/shared@2.0.0-alpha-v5.9
  - @clerk/backend@1.0.0-alpha-v5.13

## 5.0.0-alpha-v5.12

### Patch Changes

- Integrate handshake handling into `ClerkExpressWithAuth()` and `ClerkExpressRequireWith()`. If the `authenticateRequest()` returns a redirect or is in a handshake state, the middlewares will properly handle this and respond accordingly. ([#2447](https://github.com/clerk/javascript/pull/2447)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`7ecd6f6ab`](https://github.com/clerk/javascript/commit/7ecd6f6abb0e5bfb1a57c99cc11860de311c3e82)]:
  - @clerk/shared@2.0.0-alpha-v5.8
  - @clerk/backend@1.0.0-alpha-v5.12

## 5.0.0-alpha-v5.11

### Patch Changes

- Updated dependencies [[`f4f99f18d`](https://github.com/clerk/javascript/commit/f4f99f18de0be8afaae9f52599deb2814ab235e7), [`bad4de1a2`](https://github.com/clerk/javascript/commit/bad4de1a2fd8a3e2643fe26677801166a8305c29), [`e7e2a1eae`](https://github.com/clerk/javascript/commit/e7e2a1eae2ed726ab49894dd195185c8f4e70acd)]:
  - @clerk/backend@1.0.0-alpha-v5.11

## 5.0.0-alpha-v5.10

### Major Changes

- Drop all pre-instantiated Backend API resources (`allowlistIdentifiers`, `clients`, `emailAddresses`, `emails`, `invitations`, `organizations`, `phoneNumbers`, `redirectUrls`, `sessions`, `signInTokens`, `users`, `domains`). Use the `clerkClient` import instead. ([#2362](https://github.com/clerk/javascript/pull/2362)) by [@dimkl](https://github.com/dimkl)

  ```typescript
  // Before
  import { users } from '@clerk/clerk-sdk-node';
  // After
  import { clerkClient } from '@clerk/clerk-sdk-node';
  clerkClient.users;
  ```

- Changes in exports of `@clerk/backend`: ([#2363](https://github.com/clerk/javascript/pull/2363)) by [@dimkl](https://github.com/dimkl)

  - Expose the following helpers and enums from `@clerk/backend/internal`:
    ```typescript
    import {
      AuthStatus,
      buildRequestUrl,
      constants,
      createAuthenticateRequest,
      createIsomorphicRequest,
      debugRequestState,
      makeAuthObjectSerializable,
      prunePrivateMetadata,
      redirect,
      sanitizeAuthObject,
      signedInAuthObject,
      signedOutAuthObject,
    } from '@clerk/backend/internal';
    ```
  - Drop the above exports from the top-level api:
    ```typescript
    // Before
    import { AuthStatus, ... } from '@clerk/backend';
    // After
    import { AuthStatus, ... } from '@clerk/backend/internal';
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.

- Changes in exports of `@clerk/backend`: ([#2365](https://github.com/clerk/javascript/pull/2365)) by [@dimkl](https://github.com/dimkl)

  - Drop the following internal exports from the top-level api:
    ```typescript
    // Before
    import {
      AllowlistIdentifier,
      Client,
      DeletedObject,
      Email,
      EmailAddress,
      ExternalAccount,
      IdentificationLink,
      Invitation,
      OauthAccessToken,
      ObjectType,
      Organization,
      OrganizationInvitation,
      OrganizationMembership,
      OrganizationMembershipPublicUserData,
      PhoneNumber,
      RedirectUrl,
      SMSMessage,
      Session,
      SignInToken,
      Token,
      User,
      Verification,
    } from '@clerk/backend';
    // After : no alternative since there is no need to use those classes
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.
  - Keep those 3 resource related type exports
    ```typescript
    import type { Organization, Session, User, WebhookEvent, WebhookEventType } from '@clerk/backend';
    ```

- Changes in exports of `@clerk/backend`: ([#2364](https://github.com/clerk/javascript/pull/2364)) by [@dimkl](https://github.com/dimkl)

  - Expose the following helpers and enums from `@clerk/backend/jwt`:
    ```typescript
    import { decodeJwt, hasValidSignature, signJwt, verifyJwt } from '@clerk/backend/jwt';
    ```
  - Drop the above exports from the top-level api:
    ```typescript
    // Before
    import { decodeJwt, ... } from '@clerk/backend';
    // After
    import { decodeJwt, ... } from '@clerk/backend/jwt';
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.

- Changes in `@clerk/backend` exports: ([#2362](https://github.com/clerk/javascript/pull/2362)) by [@dimkl](https://github.com/dimkl)

  - Drop Internal `deserialize` helper
  - Introduce `/errors` subpath export, eg:
    ```typescript
    import {
      TokenVerificationError,
      TokenVerificationErrorAction,
      TokenVerificationErrorCode,
      TokenVerificationErrorReason,
    } from '@clerk/backend/errors';
    ```
  - Drop errors from top-level export
    ```typescript
    // Before
    import { TokenVerificationError, TokenVerificationErrorReason } from '@clerk/backend';
    // After
    import { TokenVerificationError, TokenVerificationErrorReason } from '@clerk/backend/errors';
    ```

### Minor Changes

- Fix error thrown for undefined `Clerk` in case of using default clerkClient from `@clerk/clerk-sdk-node` without secretKey caused by replaced import. ([#2368](https://github.com/clerk/javascript/pull/2368)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7), [`1e98187b4`](https://github.com/clerk/javascript/commit/1e98187b4fba0f872576510d7bccf8b75a2579bd), [`d08ec6d8f`](https://github.com/clerk/javascript/commit/d08ec6d8f52a2bc037c0eb586123a9f7816e4b64), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7), [`0ec3a146c`](https://github.com/clerk/javascript/commit/0ec3a146cc4cbe4a80d1f990a440431ae4490183), [`1ad910eb9`](https://github.com/clerk/javascript/commit/1ad910eb92dce056731f29df0caaaad74d08bd7f), [`f58a9949b`](https://github.com/clerk/javascript/commit/f58a9949bc78737ca4e096ed5501b4e578a2d493), [`9b02c1aae`](https://github.com/clerk/javascript/commit/9b02c1aae1cae286ea305c5e216ae93cbbbc0f90)]:
  - @clerk/backend@1.0.0-alpha-v5.10
  - @clerk/shared@2.0.0-alpha-v5.7

## 5.0.0-alpha-v5.9

### Patch Changes

- Updated dependencies [[`e602d6c1f`](https://github.com/clerk/javascript/commit/e602d6c1fde7a7757d292f24dfaddecd14ac1623)]:
  - @clerk/backend@1.0.0-alpha-v5.9

## 5.0.0-alpha-v5.8

### Major Changes

- (Note: This is only relevant if, in the unlikely case, you are using `Clerk` from `@clerk/clerk-sdk-node` directly. If not, you can safely ignore this change.) ([#2317](https://github.com/clerk/javascript/pull/2317)) by [@tmilewski](https://github.com/tmilewski)

  Remove the named `Clerk` import from `@clerk/clerk-sdk-node` and import `createClerkClient` instead. The latter is a factory method to create a Clerk client instance for you. This update aligns usage across our SDKs and will enable us to ship DX improvements better in the future.

  ```js
  import { Clerk } from '@clerk/clerk-sdk-node';
  const clerk = Clerk({ secretKey: '...' });
  ```

  You need to rename the import from `Clerk` to `createClerkClient` and change its usage:

  ```js
  import { createClerkClient } from '@clerk/clerk-sdk-node';
  const clerk = createClerkClient({ secretKey: '...' });
  ```

### Patch Changes

- Updated dependencies [[`896cb6104`](https://github.com/clerk/javascript/commit/896cb610409f84c0ff7a4f502f0b4ccee1afc157), [`02976d494`](https://github.com/clerk/javascript/commit/02976d49473958b8c3fea38d4e389dc1bee7e8c4), [`86d52fb5c`](https://github.com/clerk/javascript/commit/86d52fb5cf68f1dc7adf617605b922134e21268f), [`46040a2f3`](https://github.com/clerk/javascript/commit/46040a2f34d0991072fca490e031c1994b2e2296), [`75ea300bc`](https://github.com/clerk/javascript/commit/75ea300bce16a0ce401a225263bb267ad2a217b8)]:
  - @clerk/shared@2.0.0-alpha-v5.6
  - @clerk/backend@1.0.0-alpha-v5.8

## 5.0.0-alpha-v5.7

### Major Changes

- Limit TokenVerificationError exports to TokenVerificationError and TokenVerificationErrorReason ([#2189](https://github.com/clerk/javascript/pull/2189)) by [@tmilewski](https://github.com/tmilewski)

### Minor Changes

- Add missing `createdAt` param in `User#createUser()` of `@clerk/backend`. ([#2284](https://github.com/clerk/javascript/pull/2284)) by [@dimkl](https://github.com/dimkl)

  Fix `clerkClient.verifyToken()` signature to support a single `token: string` parameter.

### Patch Changes

- Updated dependencies [[`de6519daa`](https://github.com/clerk/javascript/commit/de6519daa84732023bcfd74ad816a2654f457952), [`7af0949ae`](https://github.com/clerk/javascript/commit/7af0949ae7b4072f550dee220f4d41854fe504c6), [`e1f7eae87`](https://github.com/clerk/javascript/commit/e1f7eae87531b483564256f5456a31150caa469e)]:
  - @clerk/backend@1.0.0-alpha-v5.7

## 5.0.0-alpha-v5.6

### Patch Changes

- Drop the introduction of `OrganizationRole` and `OrganizationPermission` resources fro BAPI. ([#2252](https://github.com/clerk/javascript/pull/2252)) by [@panteliselef](https://github.com/panteliselef)

- Set correct information on required Node.js and React versions in README ([#2264](https://github.com/clerk/javascript/pull/2264)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`93d05c868`](https://github.com/clerk/javascript/commit/93d05c8680ed213e594a16d4630a65f8eb244b32), [`a6b893d28`](https://github.com/clerk/javascript/commit/a6b893d281b23dc7b4bd7f3733b33e4cf655bc1b), [`2e77cd737`](https://github.com/clerk/javascript/commit/2e77cd737a333de022533d29cb12e73a907694c8), [`d30ea1faa`](https://github.com/clerk/javascript/commit/d30ea1faa45074e09c037530e8ba3ca2dbd50654)]:
  - @clerk/backend@1.0.0-alpha-v5.6
  - @clerk/shared@2.0.0-alpha-v5.5

## 5.0.0-alpha-v5.5

### Patch Changes

- Updated dependencies [[`4b8bedc66`](https://github.com/clerk/javascript/commit/4b8bedc66d47dca5c6192148f4b31ae6d49ff733), [`c776f86fb`](https://github.com/clerk/javascript/commit/c776f86fb2a999dcae46fda9abb5005718c354b2)]:
  - @clerk/shared@2.0.0-alpha-v5.4
  - @clerk/backend@1.0.0-alpha-v5.5

## 5.0.0-alpha-v5.4

### Patch Changes

- Updated dependencies [[`03079579d`](https://github.com/clerk/javascript/commit/03079579d2b48a9a6969702814449382098d2cfb), [`12962bc58`](https://github.com/clerk/javascript/commit/12962bc58e2c9caad416ba4e6d52061d00bc2feb)]:
  - @clerk/backend@1.0.0-alpha-v5.4

## 5.0.0-alpha-v5.3

### Minor Changes

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

- Remove createSms functions from @clerk/backend and @clerk/sdk-node. ([#2165](https://github.com/clerk/javascript/pull/2165)) by [@Nikpolik](https://github.com/Nikpolik)

  The equivalent /sms_messages Backend API endpoint will also dropped in the future, since this feature will no longer be available for new instances.

  For a brief period it will still be accessible for instances that have used it in the past 7
  days (13-11-2023 to 20-11-2023).

  New instances will get a 403 forbidden response if they try to access it.

- Add OrganizationPermissionAPI for CRUD operations regarding instance level organization permissions. ([#2178](https://github.com/clerk/javascript/pull/2178)) by [@panteliselef](https://github.com/panteliselef)

- Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry. ([#2154](https://github.com/clerk/javascript/pull/2154)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`b3a3dcdf4`](https://github.com/clerk/javascript/commit/b3a3dcdf4a8fa75c0dee4c55ab8fedebd49fdfd4), [`4aaf5103d`](https://github.com/clerk/javascript/commit/4aaf5103d3132f4e1ae76b861fa6ce0aae02ecbe), [`52ff8fe6b`](https://github.com/clerk/javascript/commit/52ff8fe6b6ff88ceb5e1246378b54b0565bede9d), [`4bb57057e`](https://github.com/clerk/javascript/commit/4bb57057e9af20fc433626ed178d97d3ca811362), [`4aaf5103d`](https://github.com/clerk/javascript/commit/4aaf5103d3132f4e1ae76b861fa6ce0aae02ecbe), [`0ce0edc28`](https://github.com/clerk/javascript/commit/0ce0edc283849a88b14b4b0df53b6858ed3a4f80), [`40ac4b645`](https://github.com/clerk/javascript/commit/40ac4b645f449b546dae5b4c0d013c9d9ea6d09c)]:
  - @clerk/backend@1.0.0-alpha-v5.3
  - @clerk/shared@2.0.0-alpha-v5.3

## 5.0.0-alpha-v5.2

### Major Changes

- Change the minimal Node.js version required by Clerk to `18.17.0`. ([#2162](https://github.com/clerk/javascript/pull/2162)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`c2a090513`](https://github.com/clerk/javascript/commit/c2a0905132684a4a1e8d598b66caddf20062273e)]:
  - @clerk/backend@1.0.0-alpha-v5.2
  - @clerk/shared@2.0.0-alpha-v5.2

## 5.0.0-alpha-v5.1

### Major Changes

- Drop default exports from all packages. Migration guide: ([#2150](https://github.com/clerk/javascript/pull/2150)) by [@dimkl](https://github.com/dimkl)

  - use `import { Clerk } from '@clerk/backend';`
  - use `import { clerkInstance } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-js';`
  - use `import { Clerk } from '@clerk/clerk-js/headless';`
  - use `import { IsomorphicClerk } from '@clerk/clerk-react'`

- Change the response payload of Backend API requests to return `{ data, errors }` instead of return the data and throwing on error response. ([#2126](https://github.com/clerk/javascript/pull/2126)) by [@dimkl](https://github.com/dimkl)

  Code example to keep the same behavior:

  ```typescript
  import { users } from '@clerk/backend';
  import { ClerkAPIResponseError } from '@clerk/shared/error';

  const { data, errors, clerkTraceId, status, statusText } = await users.getUser('user_deadbeef');
  if (errors) {
    throw new ClerkAPIResponseError(statusText, { data: errors, status, clerkTraceId });
  }
  ```

- Drop deprecations. Migration steps: ([#2021](https://github.com/clerk/javascript/pull/2021)) by [@dimkl](https://github.com/dimkl)

  - use `CLERK_SECRET_KEY` instead of `CLERK_API_KEY` env variable
  - use `secretKey` instead of `apiKey`
  - use `CLERK_PUBLISHABLE_KEY` instead of `CLERK_FRONTEND_API` env variable
  - use `publishableKey` instead of `frontendApi`
  - drop Redwood hotfix (upgrade to latest version)
  - use `createClerkClient` with options to create a new clerkClient instead of using
    the following setters:
    - `setClerkApiVersion`
    - `setClerkHttpOptions`
    - `setClerkServerApiUrl`
    - `setClerkApiKey`
  - use `@clerk/clerk-sdk-node` instead of `@clerk/clerk-sdk-node/{cjs|esm}/instance`

  Extra:

  - bundle only index.ts and instance.ts

### Patch Changes

- Updated dependencies [[`64d3763ec`](https://github.com/clerk/javascript/commit/64d3763ec73747ad04c4b47017195cf4114e150c), [`deac67c1c`](https://github.com/clerk/javascript/commit/deac67c1c40d6d3ccc3559746c0c31cc29a93b84), [`83e9d0846`](https://github.com/clerk/javascript/commit/83e9d08469e7c2840f06aa7d86831055e23f67a5), [`7f833da9e`](https://github.com/clerk/javascript/commit/7f833da9ebc1b2ec9c65513628c377d0584e5d72), [`492b8a7b1`](https://github.com/clerk/javascript/commit/492b8a7b12f14658a384566012e5807f0a171710), [`dd5703013`](https://github.com/clerk/javascript/commit/dd57030133fb8ce98681ff0bcad7e53ee826bb0e), [`9615e6cda`](https://github.com/clerk/javascript/commit/9615e6cda8fb1cbc3c2e464e6e891d56e245fac4), [`cace85374`](https://github.com/clerk/javascript/commit/cace85374cb0bb13578cf63fe1f3e6ee59f7f3c2), [`0d1052ac2`](https://github.com/clerk/javascript/commit/0d1052ac284b909786fd0e4744b02fcf4d1a8be6), [`5471c7e8d`](https://github.com/clerk/javascript/commit/5471c7e8dd0155348748fa90e5ae97093f59efe9), [`e0e79b4fe`](https://github.com/clerk/javascript/commit/e0e79b4fe47f64006718d547c898b9f67fe4d424), [`a6451aece`](https://github.com/clerk/javascript/commit/a6451aecef0bac578b295b524f1246dede3a7598)]:
  - @clerk/shared@2.0.0-alpha-v5.1
  - @clerk/backend@1.0.0-alpha-v5.1

## 5.0.0-alpha-v5.0

### Major Changes

- Internal update default apiUrl domain from clerk.dev to clerk.com ([#1878](https://github.com/clerk/javascript/pull/1878)) by [@dimkl](https://github.com/dimkl)

- Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Introduce `isTruthy` helper to better cast environment variables to a boolean. Previously only the string `"true"` was checked, now `true`, `"true"`, `"1"`, and `1` will work. ([#2002](https://github.com/clerk/javascript/pull/2002)) by [@LekoArts](https://github.com/LekoArts)

- Fix types of ClerkExpressWithAuth/ClerkExpressRequireAuth args ([#1968](https://github.com/clerk/javascript/pull/1968)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`743c4d204`](https://github.com/clerk/javascript/commit/743c4d20423790b554e66923466081c0d3b0d9ed), [`791c49807`](https://github.com/clerk/javascript/commit/791c49807c3c9e19964cbf621c935d237caeecf3), [`a68eb3083`](https://github.com/clerk/javascript/commit/a68eb3083ff68459cd33098e2df190a5ba26c841), [`ef2325dcc`](https://github.com/clerk/javascript/commit/ef2325dcc18729e9ce9ee5823e9a963efa51dbc1), [`8b6b094b9`](https://github.com/clerk/javascript/commit/8b6b094b9c7d09eeae90f8bdfac44d53513aa63d), [`71663c568`](https://github.com/clerk/javascript/commit/71663c568926b1d60b97aa7ccc5298d05b618af2), [`90aa2ea9c`](https://github.com/clerk/javascript/commit/90aa2ea9c4675662cee581298b49bd76ec8f8850), [`a605335e1`](https://github.com/clerk/javascript/commit/a605335e1e6f37d9b02170282974b0e1406e3f98), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`c22cd5214`](https://github.com/clerk/javascript/commit/c22cd52147492ba25f3c07bdbe6bbc4eb49a5cf0), [`c7e6d00f5`](https://github.com/clerk/javascript/commit/c7e6d00f56e73df4ed87712e74ad9d5bcaca8924), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`7644b7472`](https://github.com/clerk/javascript/commit/7644b74726ba73e615a1256f9ff3fa03b0f8bc30), [`f5d55bb1f`](https://github.com/clerk/javascript/commit/f5d55bb1fc6a87303fb8bf461c3a917ae4da4005), [`6f755addd`](https://github.com/clerk/javascript/commit/6f755addd0886b9ff8b0d5dbe48e37470049acad)]:
  - @clerk/shared@2.0.0-alpha-v5.0
  - @clerk/backend@1.0.0-alpha-v5.0

## 4.12.16

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`3bf64107e`](https://github.com/clerk/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`52f8553d2`](https://github.com/clerk/javascript/commit/52f8553d22f9454ee1194fd162410db15da7a4be), [`92727eec3`](https://github.com/clerk/javascript/commit/92727eec39566278263ffa118a085493f964eb94), [`b09b66eec`](https://github.com/clerk/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerk/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62), [`aa4cd7615`](https://github.com/clerk/javascript/commit/aa4cd761585b888706a36a6eed7436a8f0476dbf)]:
  - @clerk/backend@0.31.3
  - @clerk/shared@1.0.0
  - @clerk/types@3.57.0

## 4.12.15

### Patch Changes

- Updated dependencies [[`9ca215702`](https://github.com/clerk/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11)]:
  - @clerk/types@3.56.1
  - @clerk/backend@0.31.2

## 4.12.14

### Patch Changes

- Updated dependencies [[`35be8709d`](https://github.com/clerk/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`13e9dfbaa`](https://github.com/clerk/javascript/commit/13e9dfbaa5b7b7e72f63e4b8ecfc1c1918517cd8), [`e38488c92`](https://github.com/clerk/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerk/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`9b644d799`](https://github.com/clerk/javascript/commit/9b644d7991b8cba4b385e9443f87798cde5c9989), [`a9894b445`](https://github.com/clerk/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`834dadb36`](https://github.com/clerk/javascript/commit/834dadb36c30b2a8f052784de4ad1026b0083b4e), [`70f251007`](https://github.com/clerk/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`a46d6fe99`](https://github.com/clerk/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/types@3.56.0
  - @clerk/backend@0.31.1
  - @clerk/shared@0.24.5

## 4.12.13

### Patch Changes

- Warn about environment variables deprecations: ([#1859](https://github.com/clerk/javascript/pull/1859)) by [@dimkl](https://github.com/dimkl)

  - `CLERK_API_KEY`
  - `CLERK_FRONTEND_API`
  - `NEXT_PUBLIC_CLERK_FRONTEND_API`

- Avoid always showing `__unstable_options` deprecation warning in all applications and SDKs using `@clerk/clerk-sdk-node` ([#1858](https://github.com/clerk/javascript/pull/1858)) by [@dimkl](https://github.com/dimkl)

- Avoid always showing deprecation warnings for `frontendApi` and `apiKey` in `@clerk/clerk-sdk-node` ([#1856](https://github.com/clerk/javascript/pull/1856)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`977336f79`](https://github.com/clerk/javascript/commit/977336f793cd4ce5984f98dac3cedf9f5ec363f5), [`997b8e256`](https://github.com/clerk/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91e9a55f4`](https://github.com/clerk/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`c9b17f5a7`](https://github.com/clerk/javascript/commit/c9b17f5a72cb27786cfc7f1fb42be1233fb10d5c), [`91014880d`](https://github.com/clerk/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`3848f8dbe`](https://github.com/clerk/javascript/commit/3848f8dbe094226c6062341405a32a9621042fd6), [`7f4d4b942`](https://github.com/clerk/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b)]:
  - @clerk/shared@0.24.4
  - @clerk/types@3.55.0
  - @clerk/backend@0.31.0

## 4.12.12

### Patch Changes

- Updated dependencies [[`1e212c19d`](https://github.com/clerk/javascript/commit/1e212c19d1cbfbcf6bc6718f5aec0a3cb893b96f), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679)]:
  - @clerk/backend@0.30.3

## 4.12.11

### Patch Changes

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerk/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`fed24f1bf`](https://github.com/clerk/javascript/commit/fed24f1bf3e2b8c3f3e3327178f77b57c391c62c), [`164f3aac7`](https://github.com/clerk/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerk/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerk/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`0636ff779`](https://github.com/clerk/javascript/commit/0636ff7799e126d1438d2738ce0e46c3b277f46a), [`9514618d6`](https://github.com/clerk/javascript/commit/9514618d65cfdde0ff011eabd41a992b61fc8dc1), [`bb2ec9373`](https://github.com/clerk/javascript/commit/bb2ec93738f92c89f008c6a275a986593816c4d3), [`c7c6912f3`](https://github.com/clerk/javascript/commit/c7c6912f34874467bc74104690fe9f95491cc10d), [`71bb1c7b5`](https://github.com/clerk/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf)]:
  - @clerk/types@3.54.0
  - @clerk/backend@0.30.2

## 4.12.10

### Patch Changes

- Updated dependencies [[`cecf74d79`](https://github.com/clerk/javascript/commit/cecf74d79069662d25f73e4745aa01348d398afb)]:
  - @clerk/backend@0.30.1

## 4.12.9

### Patch Changes

- Updated dependencies [[`5c8754239`](https://github.com/clerk/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81), [`2f6a6ac99`](https://github.com/clerk/javascript/commit/2f6a6ac9991469bf8532019bb22ff50adecdb434), [`94c36c755`](https://github.com/clerk/javascript/commit/94c36c755b598eb68d22f42eb7f738050f390678), [`7406afe7f`](https://github.com/clerk/javascript/commit/7406afe7f550f702bd91cde9616fd26222833a87)]:
  - @clerk/types@3.53.0
  - @clerk/backend@0.30.0

## 4.12.8

### Patch Changes

- Updated dependencies [[`c61ddf5bf`](https://github.com/clerk/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerk/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/types@3.52.1
  - @clerk/backend@0.29.3

## 4.12.7

### Patch Changes

- Updated dependencies [[`40ea407ad`](https://github.com/clerk/javascript/commit/40ea407ad1042fee6871755f30de544200b1f0d8), [`378a903ac`](https://github.com/clerk/javascript/commit/378a903ac4dc12e6ee708de20f0d9a5aa758bd18), [`27b611e47`](https://github.com/clerk/javascript/commit/27b611e47e4f1ad86e8dff42cb02c98bdc6ff6bd), [`4d0d90238`](https://github.com/clerk/javascript/commit/4d0d9023895c13290d5578ece218c24348c540fc)]:
  - @clerk/backend@0.29.2

## 4.12.6

### Patch Changes

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`e99df0a0d`](https://github.com/clerk/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerk/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`75be1d6b3`](https://github.com/clerk/javascript/commit/75be1d6b3d9bf7b5d71613b3f169a942b1d25e7e), [`01b024c57`](https://github.com/clerk/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68)]:
  - @clerk/types@3.52.0
  - @clerk/backend@0.29.1

## 4.12.5

### Patch Changes

- Updated dependencies [[`463ff84f5`](https://github.com/clerk/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`e6a388946`](https://github.com/clerk/javascript/commit/e6a38894640b6999b90ea44ef66acda34debe2c1), [`1426e5eb3`](https://github.com/clerk/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739)]:
  - @clerk/types@3.51.0
  - @clerk/backend@0.29.0

## 4.12.4

### Patch Changes

- Updated dependencies [[`975412ed5`](https://github.com/clerk/javascript/commit/975412ed5307ac81128c87289178bd1e6c2fb1af)]:
  - @clerk/backend@0.28.1

## 4.12.3

### Patch Changes

- Updated dependencies [[`96cc1921c`](https://github.com/clerk/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerk/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerk/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerk/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerk/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerk/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerk/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerk/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerk/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerk/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`86de584dd`](https://github.com/clerk/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e02a1aff2`](https://github.com/clerk/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerk/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerk/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerk/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerk/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerk/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`30fcdd51a`](https://github.com/clerk/javascript/commit/30fcdd51a98dea60da36f2b5152ea22405d2c4f2), [`89bc5de04`](https://github.com/clerk/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/types@3.50.0
  - @clerk/backend@0.28.0

## 4.12.2

### Patch Changes

- Updated dependencies [[`ea95525a4`](https://github.com/clerk/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerk/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`d433b83b9`](https://github.com/clerk/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerk/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`876777cb1`](https://github.com/clerk/javascript/commit/876777cb14443917d8e0a04b363327d165ad5580), [`0a59e122d`](https://github.com/clerk/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/backend@0.27.0
  - @clerk/types@3.49.0

## 4.12.1

### Patch Changes

- Fix "invalid URL" issue when creating the isomorphicRequest ([#1516](https://github.com/clerk/javascript/pull/1516)) by [@dimkl](https://github.com/dimkl)

## 4.12.0

### Minor Changes

- Support hosting NextJs apps on non-Vercel platforms by constructing req.url using host-related headers instead of using on req.url directly. CLERK_TRUST_HOST is now enabled by default. ([#1492](https://github.com/clerk/javascript/pull/1492)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerk/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3), [`4ff4b716f`](https://github.com/clerk/javascript/commit/4ff4b716fdb12b18182e506737afafc7dbc05604)]:
  - @clerk/types@3.48.1
  - @clerk/backend@0.26.0

## 4.11.1

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerk/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c)]:
  - @clerk/types@3.48.0
  - @clerk/backend@0.25.1

## 4.11.0

### Minor Changes

- Introduce `createIsomorphicRequest` in `@clerk/backend` ([#1393](https://github.com/clerk/javascript/pull/1393)) by [@anagstef](https://github.com/anagstef)

  This utility simplifies the `authenticateRequest` signature, and it makes it easier to integrate with more frameworks.

### Patch Changes

- Updated dependencies [[`16c3283ec`](https://github.com/clerk/javascript/commit/16c3283ec192cb7525312da5e718aa7cac8b8445), [`73c9c1d0e`](https://github.com/clerk/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerk/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerk/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`e3036848d`](https://github.com/clerk/javascript/commit/e3036848d19a48935129aec2fe50003518a3aa53), [`fd692af79`](https://github.com/clerk/javascript/commit/fd692af791fe206724e38eff647b8562e72c3652), [`090bab66e`](https://github.com/clerk/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`bb0d69b45`](https://github.com/clerk/javascript/commit/bb0d69b455fa5fd6ca5b1f45a0f242957521dfbb), [`592911196`](https://github.com/clerk/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8)]:
  - @clerk/backend@0.25.0
  - @clerk/types@3.47.0

## 4.10.15

### Patch Changes

- Load `jwtKey` from `CLERK_JWT_KEY` env variable ([#1443](https://github.com/clerk/javascript/pull/1443)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`2ad7cf390`](https://github.com/clerk/javascript/commit/2ad7cf390ba84b8e767ed6fe136800e38356d79c), [`f0b044c47`](https://github.com/clerk/javascript/commit/f0b044c475546e96a5995ef16198e60e35e8098f)]:
  - @clerk/backend@0.24.0

## 4.10.14

### Patch Changes

- Make all 4 keys (legacy and new) optional in authenticateRequest params ([#1437](https://github.com/clerk/javascript/pull/1437)) by [@anagstef](https://github.com/anagstef)

- Updated dependencies [[`3fee736c9`](https://github.com/clerk/javascript/commit/3fee736c993b0a8fd157d716890810d04e632962), [`ac4e47274`](https://github.com/clerk/javascript/commit/ac4e47274afc2ab3a55a78b388a14bed76600402), [`5957a3da6`](https://github.com/clerk/javascript/commit/5957a3da68cde3386c741812e2bc03b5519d00e0)]:
  - @clerk/backend@0.23.7

## 4.10.13

### Patch Changes

- Updated dependencies [[`30f8ad18a`](https://github.com/clerk/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c)]:
  - @clerk/types@3.46.1
  - @clerk/backend@0.23.6

## 4.10.12

### Patch Changes

- Updated dependencies [[`bfb3af28`](https://github.com/clerk/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/types@3.46.0
  - @clerk/backend@0.23.5

## 4.10.11

### Patch Changes

- Simplify the signature of the low-level `authenticateRequest` helper. ([#1329](https://github.com/clerk/javascript/pull/1329)) by [@anagstef](https://github.com/anagstef)

  - One pair of legacy or new instance keys are required instead of all 4 of them in `authenticateRequest`
  - `@clerk/backend` now can handle the `"Bearer "` prefix in Authorization header for better DX
  - `host` parameter is now optional in `@clerk/backend`

- Updated dependencies [[`11954816`](https://github.com/clerk/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`de2347f9`](https://github.com/clerk/javascript/commit/de2347f9efaab4903787a905528a06551a9b7883), [`32148490`](https://github.com/clerk/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0
  - @clerk/backend@0.23.4

## 4.10.10

### Patch Changes

- Updated dependencies [[`17cc14ec`](https://github.com/clerk/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/types@3.44.0
  - @clerk/backend@0.23.3

## 4.10.9

### Patch Changes

- Fix ESM build issues ([#1377](https://github.com/clerk/javascript/pull/1377)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 4.10.8

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerk/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerk/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/types@3.43.0
  - @clerk/backend@0.23.2

## 4.10.7

### Patch Changes

- Correctly display "Missing Clerk keys" error instead of simply throwing during initialization ([#1365](https://github.com/clerk/javascript/pull/1365)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Allow `clerkJSVersion` to be passed when loading interstitial. Support for ([#1354](https://github.com/clerk/javascript/pull/1354)) by [@panteliselef](https://github.com/panteliselef)

  - Nextjs
  - Remix
  - Node

- Updated dependencies [[`b945c921`](https://github.com/clerk/javascript/commit/b945c92100454f00ff4b6b9c769201ca2ceaac93)]:
  - @clerk/backend@0.23.1

## 4.10.6

### Patch Changes

- Load env variables upon first usage of middlewares or clerkClient ([#1230](https://github.com/clerk/javascript/pull/1230)) by [@dimkl](https://github.com/dimkl)

## 4.10.5

### Patch Changes

- Support `audience` parameter in authentication request ([#1004](https://github.com/clerk/javascript/pull/1004)) by [@dimkl](https://github.com/dimkl)

  The audience parameter is used to verify the the aud claim in
  the request matches the value of the parameter or is included
  (when the user provides a list).

  Resolves:

  - [#978](https://github.com/clerk/javascript/pull/978)
  - [#1004](https://github.com/clerk/javascript/pull/1004)

- Updated dependencies [[`c42b4ac0`](https://github.com/clerk/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`010484f4`](https://github.com/clerk/javascript/commit/010484f4978b9616e8c2ef50986eda742c4967bd)]:
  - @clerk/types@3.42.0
  - @clerk/backend@0.23.0

## 4.10.4

### Patch Changes

- Updated dependencies [[`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/backend@0.22.0
  - @clerk/types@3.41.1

## [4.10.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.10.0-staging.2...@clerk/clerk-sdk-node@4.10.0) (2023-05-23)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.9.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.9.2-staging.1...@clerk/clerk-sdk-node@4.9.2) (2023-05-18)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.9.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.9.1-staging.1...@clerk/clerk-sdk-node@4.9.1) (2023-05-17)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.9.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.8.8-staging.3...@clerk/clerk-sdk-node@4.9.0) (2023-05-15)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.7](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.8.7-staging.4...@clerk/clerk-sdk-node@4.8.7) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.7-staging.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.8.7-staging.3...@clerk/clerk-sdk-node@4.8.7-staging.4) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.7-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.8.7-staging.2...@clerk/clerk-sdk-node@4.8.7-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.6](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.8.6-staging.0...@clerk/clerk-sdk-node@4.8.6) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.5](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.8.4...@clerk/clerk-sdk-node@4.8.5) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.8.4-staging.0...@clerk/clerk-sdk-node@4.8.4) (2023-04-12)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.8.3-staging.3...@clerk/clerk-sdk-node@4.8.3) (2023-04-11)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.8.2-staging.0...@clerk/clerk-sdk-node@4.8.2) (2023-04-06)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.8.1-staging.3...@clerk/clerk-sdk-node@4.8.1) (2023-03-31)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.1-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.8.1-staging.0...@clerk/clerk-sdk-node@4.8.1-staging.1) (2023-03-31)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.8.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.8.0-staging.0...@clerk/clerk-sdk-node@4.8.0) (2023-03-29)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.11](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.7.11-staging.2...@clerk/clerk-sdk-node@4.7.11) (2023-03-10)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.10](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.7.10-staging.1...@clerk/clerk-sdk-node@4.7.10) (2023-03-09)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.9](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.7.9-staging.1...@clerk/clerk-sdk-node@4.7.9) (2023-03-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.8](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.7.8-staging.1...@clerk/clerk-sdk-node@4.7.8) (2023-03-03)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.7](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.7.7-staging.0...@clerk/clerk-sdk-node@4.7.7) (2023-03-01)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.6](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.7.6-staging.0...@clerk/clerk-sdk-node@4.7.6) (2023-02-25)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.5](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.7.5-staging.7...@clerk/clerk-sdk-node@4.7.5) (2023-02-24)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.5-staging.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.7.5-staging.3...@clerk/clerk-sdk-node@4.7.5-staging.4) (2023-02-22)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.7.4-staging.1...@clerk/clerk-sdk-node@4.7.4) (2023-02-17)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.7.3-staging.2...@clerk/clerk-sdk-node@4.7.3) (2023-02-15)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.7.2-staging.1...@clerk/clerk-sdk-node@4.7.2) (2023-02-10)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.7.1-staging.0...@clerk/clerk-sdk-node@4.7.1) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.7.0-staging.1...@clerk/clerk-sdk-node@4.7.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.7.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.7.0-staging.1...@clerk/clerk-sdk-node@4.7.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.6.5](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.6.5-staging.4...@clerk/clerk-sdk-node@4.6.5) (2023-02-01)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.6.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.6.4-staging.4...@clerk/clerk-sdk-node@4.6.4) (2023-01-27)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.6.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.6.3-staging.1...@clerk/clerk-sdk-node@4.6.3) (2023-01-24)

### Bug Fixes

- **backend,clerk-sdk-node,shared:** Drop support for NodeJS 12 ([d9169ab](https://github.com/clerk/javascript/commit/d9169ab4873e1745d7250628f5bf8c8f7da49421))

### [4.6.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.6.1...@clerk/clerk-sdk-node@4.6.2) (2023-01-20)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.6.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.6.1-staging.0...@clerk/clerk-sdk-node@4.6.1) (2023-01-18)

### Bug Fixes

- **clerk-sdk-node:** Remove unused jsonwebtoken dependency ([6af3d9e](https://github.com/clerk/javascript/commit/6af3d9ea7e2d47f07f65c1133e634986b048bf74))

## [4.6.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.6.0-staging.8...@clerk/clerk-sdk-node@4.6.0) (2023-01-17)

### Bug Fixes

- **backend,clerk-sdk-node,shared:** Support node12 runtimes ([fdcd6b3](https://github.com/clerk/javascript/commit/fdcd6b3f7c61490297a5fdfa80228cbb7787b49b))

### [4.5.14](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.14-staging.1...@clerk/clerk-sdk-node@4.5.14) (2022-12-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.13](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.13-staging.1...@clerk/clerk-sdk-node@4.5.13) (2022-12-13)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.12](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.11...@clerk/clerk-sdk-node@4.5.12) (2022-12-12)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.11](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.11-staging.1...@clerk/clerk-sdk-node@4.5.11) (2022-12-09)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.10](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.9...@clerk/clerk-sdk-node@4.5.10) (2022-12-08)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.9](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.9-staging.0...@clerk/clerk-sdk-node@4.5.9) (2022-12-08)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.8](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.8-staging.0...@clerk/clerk-sdk-node@4.5.8) (2022-12-02)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.7](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.7-staging.4...@clerk/clerk-sdk-node@4.5.7) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.7-staging.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.7-staging.3...@clerk/clerk-sdk-node@4.5.7-staging.4) (2022-11-29)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.6](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.6-staging.0...@clerk/clerk-sdk-node@4.5.6) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.5](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.5-staging.0...@clerk/clerk-sdk-node@4.5.5) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.3...@clerk/clerk-sdk-node@4.5.4) (2022-11-23)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.3-staging.2...@clerk/clerk-sdk-node@4.5.3) (2022-11-22)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.3-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.3-staging.1...@clerk/clerk-sdk-node@4.5.3-staging.2) (2022-11-21)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.2-staging.1...@clerk/clerk-sdk-node@4.5.2) (2022-11-18)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.1-staging.3...@clerk/clerk-sdk-node@4.5.1) (2022-11-15)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.5.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.5.0-staging.1...@clerk/clerk-sdk-node@4.5.0) (2022-11-10)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.7](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.4.7-staging.2...@clerk/clerk-sdk-node@4.4.7) (2022-11-05)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.6](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.4.6-staging.7...@clerk/clerk-sdk-node@4.4.6) (2022-11-03)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.6-staging.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.4.6-staging.3...@clerk/clerk-sdk-node@4.4.6-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.6-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.4.6-staging.1...@clerk/clerk-sdk-node@4.4.6-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.6-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.4.6-staging.1...@clerk/clerk-sdk-node@4.4.6-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.6-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.4.5...@clerk/clerk-sdk-node@4.4.6-staging.1) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.5](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.4.5-staging.0...@clerk/clerk-sdk-node@4.4.5) (2022-10-24)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.4.3...@clerk/clerk-sdk-node@4.4.4) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.4.3-staging.2...@clerk/clerk-sdk-node@4.4.3) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.3-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.4.2...@clerk/clerk-sdk-node@4.4.3-staging.1) (2022-10-13)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.4.2-staging.0...@clerk/clerk-sdk-node@4.4.2) (2022-10-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.4.1-staging.0...@clerk/clerk-sdk-node@4.4.1) (2022-10-05)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.4.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.4.0-staging.5...@clerk/clerk-sdk-node@4.4.0) (2022-10-03)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.3.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.3.3-staging.4...@clerk/clerk-sdk-node@4.3.3) (2022-09-29)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.3.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.3.1...@clerk/clerk-sdk-node@4.3.2) (2022-09-25)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.3.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.3.1-staging.1...@clerk/clerk-sdk-node@4.3.1) (2022-09-24)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.3.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.3.0-staging.0...@clerk/clerk-sdk-node@4.3.0) (2022-09-22)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.2.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.2.0-staging.4...@clerk/clerk-sdk-node@4.2.1) (2022-09-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.2.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.2.0-staging.4...@clerk/clerk-sdk-node@4.2.0) (2022-09-16)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.1.7](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.1.6...@clerk/clerk-sdk-node@4.1.7) (2022-09-08)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.1.6](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.1.6-staging.0...@clerk/clerk-sdk-node@4.1.6) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.1.5](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.1.5-staging.0...@clerk/clerk-sdk-node@4.1.5) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.1.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.1.3...@clerk/clerk-sdk-node@4.1.4) (2022-09-05)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.1.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.1.3-staging.0...@clerk/clerk-sdk-node@4.1.3) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.1.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.1.2-staging.3...@clerk/clerk-sdk-node@4.1.2) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.1.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.1.1-staging.0...@clerk/clerk-sdk-node@4.1.1) (2022-08-24)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.1.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.0.5...@clerk/clerk-sdk-node@4.1.0) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.0.5](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.0.4...@clerk/clerk-sdk-node@4.0.5) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.0.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.0.4-staging.0...@clerk/clerk-sdk-node@4.0.4) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.0.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.0.2...@clerk/clerk-sdk-node@4.0.3) (2022-08-16)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.0.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.0.2-staging.0...@clerk/clerk-sdk-node@4.0.2) (2022-08-09)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.0.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.0.0...@clerk/clerk-sdk-node@4.0.1) (2022-08-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.0.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@4.0.0-staging.1...@clerk/clerk-sdk-node@4.0.0) (2022-08-05)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.9.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.9.1...@clerk/clerk-sdk-node@3.9.2) (2022-08-05)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.9.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.9.0...@clerk/clerk-sdk-node@3.9.1) (2022-08-04)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.9.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.9.0-staging.0...@clerk/clerk-sdk-node@3.9.0) (2022-07-26)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.8.6](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.8.5...@clerk/clerk-sdk-node@3.8.6) (2022-07-13)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.8.5](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.8.4...@clerk/clerk-sdk-node@3.8.5) (2022-07-08)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.8.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.8.3...@clerk/clerk-sdk-node@3.8.4) (2022-07-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.8.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.8.2...@clerk/clerk-sdk-node@3.8.3) (2022-07-06)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.8.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.8.1...@clerk/clerk-sdk-node@3.8.2) (2022-07-04)

### Bug Fixes

- **backend-core,clerk-sdk-node:** Fix parsing issue and defensively check for errors body ([f2f6fe9](https://github.com/clerk/javascript/commit/f2f6fe9b093ff3a34ca31c4ff3179841a44355cf))

### [3.8.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.8.0...@clerk/clerk-sdk-node@3.8.1) (2022-07-01)

### Bug Fixes

- **clerk-sdk-node:** Temporarily disable exports test on release ([da3c5df](https://github.com/clerk/javascript/commit/da3c5df7e6bfc57133ea811d37f4da5b006cc3e7))

## [3.8.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.7.0...@clerk/clerk-sdk-node@3.8.0) (2022-07-01)

### Features

- **clerk-sdk-node:** Add module exports testing ([ad01d27](https://github.com/clerk/javascript/commit/ad01d27f6259c1938d4d27df01c9af0a01a34ebf))

## [3.7.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.6.2...@clerk/clerk-sdk-node@3.7.0) (2022-06-24)

### Features

- **types,backend-core:** Consolidate Clerk issued JWT claims under ClerkJWTClaims ([e6bc9fb](https://github.com/clerk/javascript/commit/e6bc9fb380d38d7f89cc2059e0211b0ad55bd1a5))

### Bug Fixes

- **edge,nextjs,remix,clerk-sdk-node,types:** Correct SSR claims typing ([09c147c](https://github.com/clerk/javascript/commit/09c147c196c08e64794423f9eae791bfe453b858))

### [3.6.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.6.2-staging.0...@clerk/clerk-sdk-node@3.6.2) (2022-06-16)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.6.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.6.1-staging.3...@clerk/clerk-sdk-node@3.6.1) (2022-06-06)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.6.1-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.6.1-staging.2...@clerk/clerk-sdk-node@3.6.1-staging.3) (2022-06-03)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.6.1-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.6.1-staging.1...@clerk/clerk-sdk-node@3.6.1-staging.2) (2022-06-02)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.6.1-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.6.1-staging.0...@clerk/clerk-sdk-node@3.6.1-staging.1) (2022-06-01)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.6.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.6.0-staging.4...@clerk/clerk-sdk-node@3.6.0) (2022-05-20)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.6.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.6.0-staging.3...@clerk/clerk-sdk-node@3.6.0-staging.4) (2022-05-20)

### Features

- **backend-core:** New Resource class structure ([fd84550](https://github.com/clerk/javascript/commit/fd845509d70f67ed11bdfae998c9a727ab8c6a8d))

## [3.6.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.6.0-staging.2...@clerk/clerk-sdk-node@3.6.0-staging.3) (2022-05-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.6.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.5.0...@clerk/clerk-sdk-node@3.6.0-staging.2) (2022-05-18)

### Features

- **backend-core:** Retrieve instance organizations ([a24c4d3](https://github.com/clerk/javascript/commit/a24c4d3b1459d28cd7f950864d7347a8875d9c9c))
- **clerk-sdk-node:** Export organization invitation ([07ac214](https://github.com/clerk/javascript/commit/07ac214ce8604859b359e073ae19e0d713650c22))

## [3.6.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.5.0...@clerk/clerk-sdk-node@3.6.0-staging.1) (2022-05-17)

### Features

- **backend-core:** Retrieve instance organizations ([a24c4d3](https://github.com/clerk/javascript/commit/a24c4d3b1459d28cd7f950864d7347a8875d9c9c))
- **clerk-sdk-node:** Export organization invitation ([07ac214](https://github.com/clerk/javascript/commit/07ac214ce8604859b359e073ae19e0d713650c22))

## [3.6.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.5.0...@clerk/clerk-sdk-node@3.6.0-staging.0) (2022-05-16)

### Features

- **backend-core:** Retrieve instance organizations ([a24c4d3](https://github.com/clerk/javascript/commit/a24c4d3b1459d28cd7f950864d7347a8875d9c9c))
- **clerk-sdk-node:** Export organization invitation ([07ac214](https://github.com/clerk/javascript/commit/07ac214ce8604859b359e073ae19e0d713650c22))

## [3.5.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.4.1...@clerk/clerk-sdk-node@3.5.0) (2022-05-13)

### Features

- **clerk-sdk-node:** Organizations operations ([339ecdb](https://github.com/clerk/javascript/commit/339ecdbf472df2930ecdddd440cee1b26b32c9bf))

### [3.4.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.4.1...@clerk/clerk-sdk-node@3.4.3) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.4.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.4.1...@clerk/clerk-sdk-node@3.4.2) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.4.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.4.1-staging.0...@clerk/clerk-sdk-node@3.4.1) (2022-05-11)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.4.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.3.11...@clerk/clerk-sdk-node@3.4.0) (2022-05-06)

### Features

- **nextjs,clerk-sdk-node,remix:** Add claims attribute to req.auth ([c695529](https://github.com/clerk/javascript/commit/c695529089f55baef72b86e3b73b8cd9f4f58e6d))

### [3.3.11](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.3.11-staging.0...@clerk/clerk-sdk-node@3.3.11) (2022-05-05)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.10](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.3.10-staging.0...@clerk/clerk-sdk-node@3.3.10) (2022-04-28)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.9](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.3.8...@clerk/clerk-sdk-node@3.3.9) (2022-04-27)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.8](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.3.7...@clerk/clerk-sdk-node@3.3.8) (2022-04-27)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.7](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.3.6...@clerk/clerk-sdk-node@3.3.7) (2022-04-22)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.6](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.3.6-staging.1...@clerk/clerk-sdk-node@3.3.6) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.6-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.3.6-staging.0...@clerk/clerk-sdk-node@3.3.6-staging.1) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.5](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.3.5-alpha.0...@clerk/clerk-sdk-node@3.3.5) (2022-04-18)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.5-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.3.4...@clerk/clerk-sdk-node@3.3.5-alpha.0) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.3.3...@clerk/clerk-sdk-node@3.3.4) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.3.3-staging.0...@clerk/clerk-sdk-node@3.3.3) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.3.2-staging.0...@clerk/clerk-sdk-node@3.3.2) (2022-04-13)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.3.0...@clerk/clerk-sdk-node@3.3.1) (2022-04-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.3.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.3.0-staging.0...@clerk/clerk-sdk-node@3.3.0) (2022-04-04)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.2.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.2.4-staging.0...@clerk/clerk-sdk-node@3.2.4) (2022-03-29)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.2.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.2.3-staging.0...@clerk/clerk-sdk-node@3.2.3) (2022-03-28)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.2.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.2.2-alpha.0...@clerk/clerk-sdk-node@3.2.2) (2022-03-24)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.2.2-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.2.2-staging.0...@clerk/clerk-sdk-node@3.2.2-staging.1) (2022-03-24)

### Bug Fixes

- **clerk-sdk-node:** Add ServerGetToken on AuthProp enhancers ([8af677c](https://github.com/clerk/javascript/commit/8af677c615488aa07f807e2cb0706fb210473e6b))

### [3.2.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.2.1-staging.0...@clerk/clerk-sdk-node@3.2.1-alpha.0) (2022-03-23)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.2.0-alpha.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.2.0-alpha.1...@clerk/clerk-sdk-node@3.2.0-alpha.2) (2022-03-23)

### Features

- **clerk-sdk-node,backend-core:** Add getCount method and correctly document UserListParams ([1a7a398](https://github.com/clerk/javascript/commit/1a7a398b2e881f8d3676d62725f3b67eec6d78b4))

## [3.2.0-alpha.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.1.0-alpha.1...@clerk/clerk-sdk-node@3.2.0-alpha.1) (2022-03-23)

### Features

- **backend-core,clerk-sdk-node,nextjs,remix:** Add injected jwtKey option ([53e56e7](https://github.com/clerk/javascript/commit/53e56e76d59984d4d3f5b7e1e2d276adb8b2dc77))

## [3.2.0-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.1.0-alpha.1...@clerk/clerk-sdk-node@3.2.0-alpha.0) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.1.0-alpha.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.1.0-alpha.0...@clerk/clerk-sdk-node@3.1.0-alpha.1) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.1.0-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.0.1-staging.0...@clerk/clerk-sdk-node@3.1.0-alpha.0) (2022-03-22)

### Features

- **clerk-sdk-node:** Add getToken to sdk-node `auth` ([445def1](https://github.com/clerk/javascript/commit/445def148eeaa731dc0b74428d0b9f078e8b9240))
- **clerk-sdk-node:** Enable CLERK_JWT_KEY usage from clerk-sdk-node ([6151101](https://github.com/clerk/javascript/commit/61511019e123f7e9eaa9b44f35fa04ef643090be))

### [3.0.1-alpha.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.0.1-staging.0...@clerk/clerk-sdk-node@3.0.1-alpha.1) (2022-03-20)

### Features

- **clerk-sdk-node:** Add getToken to sdk-node `auth` ([445def1](https://github.com/clerk/javascript/commit/445def148eeaa731dc0b74428d0b9f078e8b9240))

### [3.0.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@3.0.1-staging.0...@clerk/clerk-sdk-node@3.0.1-alpha.0) (2022-03-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.10](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.9.9...@clerk/clerk-sdk-node@2.9.10) (2022-03-14)

### Bug Fixes

- **clerk-sdk-node:** Properly stringify metadata params in InvitationsAPI ([5fde7cb](https://github.com/clerk/javascript/commit/5fde7cbfe2f439d7531a937651351f29523b0dd7))

### [2.9.9-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.9.8...@clerk/clerk-sdk-node@2.9.9-alpha.0) (2022-03-11)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.9](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.9.8...@clerk/clerk-sdk-node@2.9.9) (2022-03-11)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.8](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.9.7...@clerk/clerk-sdk-node@2.9.8) (2022-03-09)

### Bug Fixes

- **clerk-sdk-node:** Correct initialization params override on custom instance ([4feb7eb](https://github.com/clerk/javascript/commit/4feb7eb8be87b2a03c6f5cdd1499982ce7020961))

### [2.9.7](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.9.7-staging.0...@clerk/clerk-sdk-node@2.9.7) (2022-03-09)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.6](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.9.5...@clerk/clerk-sdk-node@2.9.6) (2022-03-04)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.5](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.9.4...@clerk/clerk-sdk-node@2.9.5) (2022-03-04)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.9.4-staging.0...@clerk/clerk-sdk-node@2.9.4) (2022-02-24)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.4-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.9.3...@clerk/clerk-sdk-node@2.9.4-staging.0) (2022-02-17)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.9.2...@clerk/clerk-sdk-node@2.9.3) (2022-02-16)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.9.1...@clerk/clerk-sdk-node@2.9.2) (2022-02-16)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.9.1-staging.0...@clerk/clerk-sdk-node@2.9.1) (2022-02-14)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.9.0...@clerk/clerk-sdk-node@2.9.1-staging.0) (2022-02-11)

### Features

- **clerk-sdk-node:** Deprecate Session named middleware, introduce withAuth, requireAuth ([4e69553](https://github.com/clerk/javascript/commit/4e695535e41fe7c135cbf303a0d021e7b7d30f7d))

## [2.9.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.8.1...@clerk/clerk-sdk-node@2.9.0) (2022-02-04)

### Features

- **clerk-sdk-node:** Add custom header X-Clerk-SDK in request for SDK version ([84986d8](https://github.com/clerk/javascript/commit/84986d8522c00da3671a19dec7b914f99c3cc133))

### [2.8.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.8.0...@clerk/clerk-sdk-node@2.8.1) (2022-02-03)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [2.8.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.7.5...@clerk/clerk-sdk-node@2.8.0) (2022-02-02)

### Features

- **backend-core,clerk-sdk-node,edge:** Add support to verify azp session token claim ([eab1c8c](https://github.com/clerk/javascript/commit/eab1c8c8a43960fee2da9c10a52c3915cd37f45c))

### [2.7.5](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.7.4...@clerk/clerk-sdk-node@2.7.5) (2022-01-28)

### Bug Fixes

- **clerk-sdk-node:** Restore the setClerkHttpOptions capability ([ff9f518](https://github.com/clerk/javascript/commit/ff9f51860895033f5fe8a4fc12a18b0b204ad472))

### [2.7.4](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.7.3...@clerk/clerk-sdk-node@2.7.4) (2022-01-26)

### Reverts

- Revert "chore(release): Publish" ([df705e0](https://github.com/clerk/javascript/commit/df705e011f025e044c61aad2983e90afd94d5662))

### [2.7.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.7.2...@clerk/clerk-sdk-node@2.7.3) (2022-01-25)

### Bug Fixes

- **clerk-sdk-node:** Correctly pass responseType on got options for interstitial logic ([6fd58bb](https://github.com/clerk/javascript/commit/6fd58bb31083fd28bba06b7224e1d5f30df68bbb))

### Reverts

- Revert "chore(release): Publish" ([df705e0](https://github.com/clerk/javascript/commit/df705e011f025e044c61aad2983e90afd94d5662))

### [2.7.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.7.1...@clerk/clerk-sdk-node@2.7.2) (2022-01-20)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.7.1](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.7.0...@clerk/clerk-sdk-node@2.7.1) (2022-01-20)

### Bug Fixes

- **clerk-sdk-node:** Restore verifyToken utility ([e22ef8a](https://github.com/clerk/javascript/commit/e22ef8aa3f4db1e14391f88bb924a82f6b17ba6a))

## [2.7.0](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.7.0-alpha.3...@clerk/clerk-sdk-node@2.7.0) (2022-01-20)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [2.7.0-alpha.3](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.7.0-alpha.2...@clerk/clerk-sdk-node@2.7.0-alpha.3) (2022-01-20)

### Bug Fixes

- **backend-core:** Fix build issue ([2b60c40](https://github.com/clerk/javascript/commit/2b60c409fc450c77aa9585e96131de11f5924f50))

## [2.7.0-alpha.2](https://github.com/clerk/javascript/compare/@clerk/clerk-sdk-node@2.7.0-alpha.1...@clerk/clerk-sdk-node@2.7.0-alpha.2) (2022-01-20)

### Bug Fixes

- **backend-core:** Add Readme links ([12509e3](https://github.com/clerk/javascript/commit/12509e32f6da37902cce94949459edffa4a63718))

## 2.7.0-alpha.1 (2022-01-20)

### Features

- Add injectable loadCryptoKeyFunction ([637b854](https://github.com/clerk/javascript/commit/637b8547447bdfb5f1cac8718d007e665b433f70))
- Consistent imports rule ([fb81176](https://github.com/clerk/javascript/commit/fb81176b9db0a95a84d19f61e15a9c65a12fc98e))
- npm workspaces and lerna setup ([cfbfebf](https://github.com/clerk/javascript/commit/cfbfebfd0d5f88a96b4715e4be52bff7f37cc3db))
- SDK Node resource and APIs from @clerk/backend-core ([6a32317](https://github.com/clerk/javascript/commit/6a323175f9361c32192a4a6be4139b88945a857c))
- Update READMEs, API reference for @clerk/backend-core, minor fixes ([529c2f6](https://github.com/clerk/javascript/commit/529c2f629ec02895f9f049d29b5775f16ef5c6e9))

### Bug Fixes

- **backend-core:** Fix cross-origin detection algorithm ([fd99eae](https://github.com/clerk/javascript/commit/fd99eae111469c5d0028fd46b8bcbf1c5a8325b0))
- **clerk-sdk-node:** Correctly apply body deserialization ([fefc084](https://github.com/clerk/javascript/commit/fefc084a3680c071a62dfe573cd5e6e2d5d769f3))
- **clerk-sdk-node:** Fix string minor typing ([219c1a1](https://github.com/clerk/javascript/commit/219c1a1b9c4cf49cc02c132986db5f08088fafdd))
- **clerk-sdk-node:** Fix version file ([88b4897](https://github.com/clerk/javascript/commit/88b4897d74a30cb67b0e39c72eac9e263030f3b2))
- **clerk-sdk-node:** Properly import key from jwk ([e982fd0](https://github.com/clerk/javascript/commit/e982fd07bfd3354c108efc14775d03087e816651))
- Remove coverage folder ([e009e7d](https://github.com/clerk/javascript/commit/e009e7d794db052cbf74433fb0cf01203cecce4d))

## 2.7.0-alpha.0 (2022-01-20)

### Features

- Add injectable loadCryptoKeyFunction ([637b854](https://github.com/clerk/clerk-sdk-node/commit/637b8547447bdfb5f1cac8718d007e665b433f70))
- Consistent imports rule ([fb81176](https://github.com/clerk/clerk-sdk-node/commit/fb81176b9db0a95a84d19f61e15a9c65a12fc98e))
- npm workspaces and lerna setup ([cfbfebf](https://github.com/clerk/clerk-sdk-node/commit/cfbfebfd0d5f88a96b4715e4be52bff7f37cc3db))
- SDK Node resource and APIs from @clerk/backend-core ([6a32317](https://github.com/clerk/clerk-sdk-node/commit/6a323175f9361c32192a4a6be4139b88945a857c))
- Update READMEs, API reference for @clerk/backend-core, minor fixes ([529c2f6](https://github.com/clerk/clerk-sdk-node/commit/529c2f629ec02895f9f049d29b5775f16ef5c6e9))

### Bug Fixes

- **clerk-sdk-node:** Correctly apply body deserialization ([fefc084](https://github.com/clerk/clerk-sdk-node/commit/fefc084a3680c071a62dfe573cd5e6e2d5d769f3))
- **clerk-sdk-node:** Fix string minor typing ([219c1a1](https://github.com/clerk/clerk-sdk-node/commit/219c1a1b9c4cf49cc02c132986db5f08088fafdd))
- **clerk-sdk-node:** Fix version file ([88b4897](https://github.com/clerk/clerk-sdk-node/commit/88b4897d74a30cb67b0e39c72eac9e263030f3b2))
- **clerk-sdk-node:** Properly import key from jwk ([e982fd0](https://github.com/clerk/clerk-sdk-node/commit/e982fd07bfd3354c108efc14775d03087e816651))
- Remove coverage folder ([e009e7d](https://github.com/clerk/clerk-sdk-node/commit/e009e7d794db052cbf74433fb0cf01203cecce4d))

## 2.6.3 (2022-01-20)

### Features

- Switch repo from [https://github.com/clerk/clerk-sdk-node/](https://github.com/clerk/clerk-sdk-node/) 🎊
