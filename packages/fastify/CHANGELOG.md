# Change Log

## 1.0.5

### Patch Changes

- Updated dependencies [[`b92402258`](https://github.com/clerk/javascript/commit/b924022580569c934a9d33310449b4a50156070a)]:
  - @clerk/backend@1.1.3

## 1.0.4

### Patch Changes

- Updated dependencies [[`4f4375e88`](https://github.com/clerk/javascript/commit/4f4375e88fa2daae4d725c62da5e4cf29302e53c), [`1662aaae9`](https://github.com/clerk/javascript/commit/1662aaae965fcf36b13dba6b148e096ab6a1cd83), [`f70c885f7`](https://github.com/clerk/javascript/commit/f70c885f798f7ff513f6687f87c8a56daf26fa05), [`4ae79af36`](https://github.com/clerk/javascript/commit/4ae79af36552aae1f0284ecc4dfcfc23ef295d26), [`f5804a225`](https://github.com/clerk/javascript/commit/f5804a225e9d67cd315700f0ced0ff17b8b14e53)]:
  - @clerk/backend@1.1.2
  - @clerk/shared@2.0.2
  - @clerk/types@4.2.1

## 1.0.3

### Patch Changes

- Updated dependencies [[`8fbe23857`](https://github.com/clerk/javascript/commit/8fbe23857bc588a4662af78ee33b24123cd8bc2e), [`a78bc447c`](https://github.com/clerk/javascript/commit/a78bc447c1aabaa41bcbaa2a8fe3c48f31275574), [`c7d626292`](https://github.com/clerk/javascript/commit/c7d626292a9fd12ca0f1b31a1035e711b6e99531), [`19cd42434`](https://github.com/clerk/javascript/commit/19cd42434450e568998336bf6d705e475122abbc)]:
  - @clerk/backend@1.1.1
  - @clerk/shared@2.0.1
  - @clerk/types@4.2.0

## 1.0.2

### Patch Changes

- Updated dependencies [[`b3fda50f0`](https://github.com/clerk/javascript/commit/b3fda50f03672106c6858219fc607d226851ec10), [`b3ad7a459`](https://github.com/clerk/javascript/commit/b3ad7a459c46be1f8967faf73c2cdd96406593c8), [`4e5de1164`](https://github.com/clerk/javascript/commit/4e5de1164d956c7dc21f72d25e312296d36504a7)]:
  - @clerk/backend@1.1.0

## 1.0.1

### Patch Changes

- Updated dependencies [[`3c6e5a6f1`](https://github.com/clerk/javascript/commit/3c6e5a6f1dd0ac198e6e48d1b83c6d4846a7f900), [`65503dcb9`](https://github.com/clerk/javascript/commit/65503dcb97acb9538e5c0e3f8199d20ad31c9d7d), [`956d8792f`](https://github.com/clerk/javascript/commit/956d8792fefe9d6a89022f1e938149b25503ec7f)]:
  - @clerk/backend@1.0.1
  - @clerk/types@4.1.0

## 1.0.0

### Major Changes

- c2a090513: Change the minimal Node.js version required by Clerk to `18.17.0`.
- 71663c568: Internal update default apiUrl domain from clerk.dev to clerk.com
- cfb50e1f6: Drop deprecations. Migration steps:
  - use `CLERK_SECRET_KEY` instead of `CLERK_API_KEY` env variable
  - use `secretKey` instead of `apiKey`
  - use `CLERK_PUBLISHABLE_KEY` instead of `CLERK_FRONTEND_API` env variable
  - use `publishableKey` instead of `frontendApi`
- 97407d8aa: Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now.
- 0ec3a146c: Changes in exports of `@clerk/backend`:
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
- 1ad910eb9: Changes in exports of `@clerk/backend`:
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
- 02976d494: (Note: This is only relevant if, in the unlikely case, you are using `Clerk` from `@clerk/fastify` directly. If not, you can safely ignore this change.)

  Remove the named `Clerk` import from `@clerk/fastify` and import `createClerkClient` instead. The latter is a factory method to create a Clerk client instance for you. This update aligns usage across our SDKs and will enable us to ship DX improvements better in the future.

  ```js
  import { Clerk } from '@clerk/fastify';
  const clerk = Clerk({ secretKey: '...' });
  ```

  You need to rename the import from `Clerk` to `createClerkClient` and change its usage:

  ```js
  import { createClerkClient } from '@clerk/fastify';
  const clerk = createClerkClient({ secretKey: '...' });
  ```

### Minor Changes

- 4a93c6720: Introduce handshake mechanism and `x-clerk-auth-status` in response
- 629881cba: Re-export everything from `@clerk/backend` in `@clerk/fastify` to support common backend types and functionality without adding `@clerk/backend` as dependency.

  New exports:

  - `verifyToken()`

  New exported types:

  - `ClerkOptions`
  - `ClerkClient`
  - `OrganizationMembershipRole`
  - `VerifyTokenOptions`
  - `WebhookEvent`
  - `WebhookEventType`
  - `AllowlistIdentifier`
  - `Client`
  - `EmailAddress`
  - `ExternalAccount`
  - `Invitation`
  - `OauthAccessToken`
  - `Organization`
  - `OrganizationInvitation`
  - `OrganizationMembership`
  - `OrganizationMembershipPublicUserData`
  - `PhoneNumber`
  - `Session`
  - `SignInToken`
  - `SMSMessage`
  - `Token`
  - `User`

- 2964f8a47: Expose debug headers in response for handshake / signed-out states from SDKs using headers returned from `authenticateRequest()`
- 18c0d015d: Pass environment into `sdkMetadata` in order to detect if production clerk-js is used by other sdks in dev mode. When it is log dev warning from clerk-js.
- b4e79c1b9: Replace the `Clerk-Backend-SDK` header with `User-Agent` in BAPI requests and update it's value to contain both the package name and the package version of the clerk package
  executing the request. Eg request from `@clerk/nextjs` to BAPI with append `User-Agent: @clerk/nextjs@5.0.0-alpha-v5.16` using the latest version.

  Miscellaneous changes: The backend test build changed to use tsup.

### Patch Changes

- 2de442b24: Rename beta-v5 to beta
- 2e77cd737: Set correct information on required Node.js and React versions in README
- 7644b7472: Improve the default value for `CLERK_API_URL` by utilizing the publishable key to differentiate between local, staging and prod environments.
- 40ac4b645: Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry.
- Updated dependencies [3a2f13604]
- Updated dependencies [8c23651b8]
- Updated dependencies [f4f99f18d]
- Updated dependencies [743c4d204]
- Updated dependencies [4b8bedc66]
- Updated dependencies [9272006e7]
- Updated dependencies [1db1f4068]
- Updated dependencies [c2a090513]
- Updated dependencies [966b31205]
- Updated dependencies [0d0b1d89a]
- Updated dependencies [1834a3ee4]
- Updated dependencies [a8901be64]
- Updated dependencies [896cb6104]
- Updated dependencies [64d3763ec]
- Updated dependencies [8350109ab]
- Updated dependencies [7b200af49]
- Updated dependencies [988a299c0]
- Updated dependencies [ecb60da48]
- Updated dependencies [deac67c1c]
- Updated dependencies [b3a3dcdf4]
- Updated dependencies [1dc28ab46]
- Updated dependencies [83e9d0846]
- Updated dependencies [d37d44a68]
- Updated dependencies [244de5ea3]
- Updated dependencies [fe356eebd]
- Updated dependencies [791c49807]
- Updated dependencies [935b0886e]
- Updated dependencies [93d05c868]
- Updated dependencies [ea4933655]
- Updated dependencies [7f6a64f43]
- Updated dependencies [a9fe242be]
- Updated dependencies [448e02e93]
- Updated dependencies [2671e7aa5]
- Updated dependencies [afec17953]
- Updated dependencies [799abc281]
- Updated dependencies [0699fa496]
- Updated dependencies [4aaf5103d]
- Updated dependencies [a68eb3083]
- Updated dependencies [2de442b24]
- Updated dependencies [15af02a83]
- Updated dependencies [0293f29c8]
- Updated dependencies [5f58a2274]
- Updated dependencies [9180c8b80]
- Updated dependencies [db18787c4]
- Updated dependencies [7f833da9e]
- Updated dependencies [de6519daa]
- Updated dependencies [e6ecbaa2f]
- Updated dependencies [ef2325dcc]
- Updated dependencies [6a769771c]
- Updated dependencies [fc3ffd880]
- Updated dependencies [8b6b094b9]
- Updated dependencies [840636a14]
- Updated dependencies [bab2e7e05]
- Updated dependencies [71663c568]
- Updated dependencies [a6b893d28]
- Updated dependencies [02976d494]
- Updated dependencies [492b8a7b1]
- Updated dependencies [8e5c881c4]
- Updated dependencies [9e99eb727]
- Updated dependencies [034c47ccb]
- Updated dependencies [2352149f6]
- Updated dependencies [e5c989a03]
- Updated dependencies [ff08fe237]
- Updated dependencies [7ecd6f6ab]
- Updated dependencies [12f3c5c55]
- Updated dependencies [244de5ea3]
- Updated dependencies [c776f86fb]
- Updated dependencies [90aa2ea9c]
- Updated dependencies [d9f265fcb]
- Updated dependencies [1e98187b4]
- Updated dependencies [7bffc47cb]
- Updated dependencies [a605335e1]
- Updated dependencies [2e77cd737]
- Updated dependencies [9737ef510]
- Updated dependencies [fafa76fb6]
- Updated dependencies [2964f8a47]
- Updated dependencies [1f650f30a]
- Updated dependencies [7af0949ae]
- Updated dependencies [97407d8aa]
- Updated dependencies [2a22aade8]
- Updated dependencies [69ce3e185]
- Updated dependencies [63dfe8dc9]
- Updated dependencies [e921af259]
- Updated dependencies [78fc5eec0]
- Updated dependencies [d08ec6d8f]
- Updated dependencies [dd5703013]
- Updated dependencies [a9fe242be]
- Updated dependencies [5f58a2274]
- Updated dependencies [6a33709cc]
- Updated dependencies [03079579d]
- Updated dependencies [c22cd5214]
- Updated dependencies [52ff8fe6b]
- Updated dependencies [86d52fb5c]
- Updated dependencies [f77e8cdbd]
- Updated dependencies [8b466a9ba]
- Updated dependencies [fe2607b6f]
- Updated dependencies [c7e6d00f5]
- Updated dependencies [8cc45d2af]
- Updated dependencies [663243220]
- Updated dependencies [c6a5e0f5d]
- Updated dependencies [4edb77632]
- Updated dependencies [ab4eb56a5]
- Updated dependencies [a9fe242be]
- Updated dependencies [5c239d973]
- Updated dependencies [97407d8aa]
- Updated dependencies [12962bc58]
- Updated dependencies [7cb1241a9]
- Updated dependencies [9615e6cda]
- Updated dependencies [0ec3a146c]
- Updated dependencies [4bb57057e]
- Updated dependencies [bad4de1a2]
- Updated dependencies [d4ff346dd]
- Updated dependencies [7644b7472]
- Updated dependencies [2ec9f6b09]
- Updated dependencies [2e4a43017]
- Updated dependencies [66b283653]
- Updated dependencies [5aab9f04a]
- Updated dependencies [46040a2f3]
- Updated dependencies [f00fd2dfe]
- Updated dependencies [cace85374]
- Updated dependencies [1ad910eb9]
- Updated dependencies [8daf8451c]
- Updated dependencies [f58a9949b]
- Updated dependencies [4aaf5103d]
- Updated dependencies [75ea300bc]
- Updated dependencies [d22e6164d]
- Updated dependencies [9a1fe3728]
- Updated dependencies [e1f7eae87]
- Updated dependencies [7f751c4ef]
- Updated dependencies [4fced88ac]
- Updated dependencies [f5d55bb1f]
- Updated dependencies [18c0d015d]
- Updated dependencies [0d1052ac2]
- Updated dependencies [d30ea1faa]
- Updated dependencies [e7e2a1eae]
- Updated dependencies [7886ba89d]
- Updated dependencies [1fd2eff38]
- Updated dependencies [9a1fe3728]
- Updated dependencies [5471c7e8d]
- Updated dependencies [a6308c67e]
- Updated dependencies [0ce0edc28]
- Updated dependencies [f540e9843]
- Updated dependencies [477170962]
- Updated dependencies [9b02c1aae]
- Updated dependencies [051833167]
- Updated dependencies [b4e79c1b9]
- Updated dependencies [38d8b3e8a]
- Updated dependencies [be991365e]
- Updated dependencies [8350f73a6]
- Updated dependencies [d6a7ea61a]
- Updated dependencies [e0e79b4fe]
- Updated dependencies [41ae1d2f0]
- Updated dependencies [e602d6c1f]
- Updated dependencies [142ded732]
- Updated dependencies [fb794ce7b]
- Updated dependencies [48ca40af9]
- Updated dependencies [e6fc58ae4]
- Updated dependencies [6fffd3b54]
- Updated dependencies [94519aa33]
- Updated dependencies [ebf9be77f]
- Updated dependencies [a6451aece]
- Updated dependencies [008ac4217]
- Updated dependencies [987994909]
- Updated dependencies [40ac4b645]
- Updated dependencies [1bea9c200]
- Updated dependencies [6f755addd]
- Updated dependencies [429d030f7]
- Updated dependencies [844847e0b]
- Updated dependencies [6eab66050]
- Updated dependencies [c2b982749]
  - @clerk/backend@1.0.0
  - @clerk/shared@2.0.0
  - @clerk/types@4.0.0

## 1.0.0-beta.46

### Patch Changes

- Updated dependencies [[`f00fd2dfe`](https://github.com/clerk/javascript/commit/f00fd2dfe309cfeac82a776cc006f2c21b6d7988)]:
  - @clerk/types@4.0.0-beta.30

## 1.0.0-beta.45

### Patch Changes

- Updated dependencies [[`bab2e7e05`](https://github.com/clerk/javascript/commit/bab2e7e0590d0da1fd7db0680e63e8f2eb836b41)]:
  - @clerk/shared@2.0.0-beta.23
  - @clerk/types@4.0.0-beta.29
  - @clerk/backend@1.0.0-beta.37

## 1.0.0-beta.44

### Patch Changes

- Updated dependencies [[`ff08fe237`](https://github.com/clerk/javascript/commit/ff08fe237fa5a9ded04924b3c5821111836b49b6), [`d9f265fcb`](https://github.com/clerk/javascript/commit/d9f265fcb12b39301b9802e4787dc636ee28444f), [`142ded732`](https://github.com/clerk/javascript/commit/142ded73265b776789b65404d96b6c91cfe15e98), [`fb794ce7b`](https://github.com/clerk/javascript/commit/fb794ce7b88001b98ad4a628bc2cc39a0c8ccfa5), [`e6fc58ae4`](https://github.com/clerk/javascript/commit/e6fc58ae4df5091eff00ba0d9045ce5ff0fff538)]:
  - @clerk/types@4.0.0-beta.28
  - @clerk/backend@1.0.0-beta.36
  - @clerk/shared@2.0.0-beta.22

## 1.0.0-beta.43

### Patch Changes

- Updated dependencies [[`7cb1241a9`](https://github.com/clerk/javascript/commit/7cb1241a9929b3d8a0d2157637734d82dd9fd852), [`94519aa33`](https://github.com/clerk/javascript/commit/94519aa33774c8d6e557ce47a00974ad7b194c5d)]:
  - @clerk/backend@1.0.0-beta.35
  - @clerk/types@4.0.0-beta.27

## 1.0.0-beta.42

### Patch Changes

- Updated dependencies [[`ecb60da48`](https://github.com/clerk/javascript/commit/ecb60da48029b9cb2d17ab9b0a73cb92bc5c924b), [`0699fa496`](https://github.com/clerk/javascript/commit/0699fa49693dc7a8d3de8ba053c4f16a5c8431d0)]:
  - @clerk/backend@1.0.0-beta.34
  - @clerk/types@4.0.0-beta.26

## 1.0.0-beta.41

### Patch Changes

- Updated dependencies [[`2352149f6`](https://github.com/clerk/javascript/commit/2352149f6ba9708095146a3087538faf2d4f161f)]:
  - @clerk/types@4.0.0-beta.25

## 1.0.0-beta.40

### Patch Changes

- Updated dependencies [[`9180c8b80`](https://github.com/clerk/javascript/commit/9180c8b80e0ad95c1a9e490e8201ffd089634a48), [`63dfe8dc9`](https://github.com/clerk/javascript/commit/63dfe8dc92c28213db5c5644782e7d6751fa22a6), [`c6a5e0f5d`](https://github.com/clerk/javascript/commit/c6a5e0f5dbd9ec4a7b5657855e8a31bc8347d0a4), [`d22e6164d`](https://github.com/clerk/javascript/commit/d22e6164ddb765542e0e6335421d2ebf484af059)]:
  - @clerk/types@4.0.0-beta.24
  - @clerk/backend@1.0.0-beta.33

## 1.0.0-beta.39

### Patch Changes

- Updated dependencies [[`fc3ffd880`](https://github.com/clerk/javascript/commit/fc3ffd88064a09ab98877dfba119150390f9296e), [`840636a14`](https://github.com/clerk/javascript/commit/840636a14537d4f6b810832e7662518ef4bd4500), [`1fd2eff38`](https://github.com/clerk/javascript/commit/1fd2eff38dc71e45d2ff95a5b6e5a99cca53c6e7), [`f540e9843`](https://github.com/clerk/javascript/commit/f540e98435c86298415552537e33164471298a5c), [`987994909`](https://github.com/clerk/javascript/commit/987994909b7c462cc2b785f75afe4d621f5c960d), [`1bea9c200`](https://github.com/clerk/javascript/commit/1bea9c20090abdde962c7da1a859933e1cd51660)]:
  - @clerk/shared@2.0.0-beta.21
  - @clerk/types@4.0.0-beta.23
  - @clerk/backend@1.0.0-beta.32

## 1.0.0-beta.38

### Patch Changes

- Updated dependencies [[`988a299c0`](https://github.com/clerk/javascript/commit/988a299c0abf708e905592c29e394f8e4d79968e)]:
  - @clerk/backend@1.0.0-beta.31

## 1.0.0-beta.37

### Patch Changes

- Updated dependencies [[`8350109ab`](https://github.com/clerk/javascript/commit/8350109ab85909e0457199da1db0c9787d94001e)]:
  - @clerk/shared@2.0.0-beta.20
  - @clerk/backend@1.0.0-beta.30

## 1.0.0-beta.36

### Patch Changes

- Updated dependencies [[`afec17953`](https://github.com/clerk/javascript/commit/afec17953d1ae4ba39ee73e4383757694375524d)]:
  - @clerk/types@4.0.0-beta.22

## 1.0.0-beta.35

### Patch Changes

- Updated dependencies [[`8c23651b8`](https://github.com/clerk/javascript/commit/8c23651b8c3ff1474057a7d62e3ddba939cb0b64), [`9272006e7`](https://github.com/clerk/javascript/commit/9272006e744fc906cfdee520d2dc6d7db141cc97), [`0d0b1d89a`](https://github.com/clerk/javascript/commit/0d0b1d89a46d2418cb05a10940f4a399cbd8ffeb), [`2671e7aa5`](https://github.com/clerk/javascript/commit/2671e7aa5081eb9ae38b92ee647f2e3fd824741f), [`1f650f30a`](https://github.com/clerk/javascript/commit/1f650f30a97939817b7b2f3cc6283e22dc431523), [`663243220`](https://github.com/clerk/javascript/commit/6632432208aa6ca507f33fa9ab79abaa40431be6), [`66b283653`](https://github.com/clerk/javascript/commit/66b28365370bcbcdf4e51da39de58c7f8b1fc1b4), [`ebf9be77f`](https://github.com/clerk/javascript/commit/ebf9be77f17f8880541de67f66879324f68cf6bd)]:
  - @clerk/backend@1.0.0-beta.29
  - @clerk/types@4.0.0-beta.21

## 1.0.0-beta.34

### Minor Changes

- Re-export everything from `@clerk/backend` in `@clerk/fastify` to support common backend types and functionality without adding `@clerk/backend` as dependency. ([#2968](https://github.com/clerk/javascript/pull/2968)) by [@dimkl](https://github.com/dimkl)

  New exports:

  - `verifyToken()`

  New exported types:

  - `ClerkOptions`
  - `ClerkClient`
  - `OrganizationMembershipRole`
  - `VerifyTokenOptions`
  - `WebhookEvent`
  - `WebhookEventType`
  - `AllowlistIdentifier`
  - `Client`
  - `EmailAddress`
  - `ExternalAccount`
  - `Invitation`
  - `OauthAccessToken`
  - `Organization`
  - `OrganizationInvitation`
  - `OrganizationMembership`
  - `OrganizationMembershipPublicUserData`
  - `PhoneNumber`
  - `Session`
  - `SignInToken`
  - `SMSMessage`
  - `Token`
  - `User`

- Expose debug headers in response for handshake / signed-out states from SDKs using headers returned from `authenticateRequest()` ([#2898](https://github.com/clerk/javascript/pull/2898)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`2964f8a47`](https://github.com/clerk/javascript/commit/2964f8a47e473fa8457a27104adb4d008613a0e3)]:
  - @clerk/backend@1.0.0-beta.28

## 1.0.0-beta.33

### Patch Changes

- Updated dependencies [[`008ac4217`](https://github.com/clerk/javascript/commit/008ac4217bc648085b3caba92a4524c31cc0925b)]:
  - @clerk/types@4.0.0-beta.20

## 1.0.0-beta.32

### Patch Changes

- Updated dependencies [[`8350f73a6`](https://github.com/clerk/javascript/commit/8350f73a67f8980be78e3bd3343e772f5653d718)]:
  - @clerk/shared@2.0.0-beta.19
  - @clerk/backend@1.0.0-beta.27

## 1.0.0-beta.31

### Patch Changes

- Updated dependencies [[`fafa76fb6`](https://github.com/clerk/javascript/commit/fafa76fb66585b5836cc79985f8bdf1d1b4dca97)]:
  - @clerk/types@4.0.0-beta.19

## 1.0.0-beta.30

### Patch Changes

- Updated dependencies [[`e5c989a03`](https://github.com/clerk/javascript/commit/e5c989a035fa16413414c213febe16fcdbeef9b1), [`2ec9f6b09`](https://github.com/clerk/javascript/commit/2ec9f6b09f98ae276658d6dc705e16df0573d817)]:
  - @clerk/shared@2.0.0-beta.18
  - @clerk/backend@1.0.0-beta.26

## 1.0.0-beta.29

### Minor Changes

- Pass environment into `sdkMetadata` in order to detect if production clerk-js is used by other sdks in dev mode. When it is log dev warning from clerk-js. ([#2802](https://github.com/clerk/javascript/pull/2802)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`18c0d015d`](https://github.com/clerk/javascript/commit/18c0d015d20493e14049fed73a5b6f732372a5cf)]:
  - @clerk/types@4.0.0-beta.18

## 1.0.0-beta.28

### Patch Changes

- Updated dependencies [[`fe356eebd`](https://github.com/clerk/javascript/commit/fe356eebd8ff527133e0818cf664e7def577cccc)]:
  - @clerk/types@4.0.0-beta.17

## 1.0.0-beta.27

### Patch Changes

- Updated dependencies [[`1834a3ee4`](https://github.com/clerk/javascript/commit/1834a3ee496ea27b9f7ceeb32ec5361f9de8ee30), [`15af02a83`](https://github.com/clerk/javascript/commit/15af02a837b0e87ea83f3a86dfacc149adca1345)]:
  - @clerk/shared@2.0.0-beta.17
  - @clerk/backend@1.0.0-beta.25

## 1.0.0-beta.26

### Patch Changes

- Updated dependencies [[`db18787c4`](https://github.com/clerk/javascript/commit/db18787c4d9fa8ee1306db9b65f3b3f5e2fe2dad)]:
  - @clerk/shared@2.0.0-beta.16
  - @clerk/backend@1.0.0-beta.24

## 1.0.0-beta.25

### Patch Changes

- Updated dependencies [[`6eab66050`](https://github.com/clerk/javascript/commit/6eab66050608a1bc5cb9aca6a234b1fea16106e5)]:
  - @clerk/shared@2.0.0-beta.15
  - @clerk/backend@1.0.0-beta.23

## 1.0.0-beta.24

### Patch Changes

- Updated dependencies [[`12f3c5c55`](https://github.com/clerk/javascript/commit/12f3c5c55580f93a81df27851fbc92ce1312107e)]:
  - @clerk/shared@2.0.0-beta.14
  - @clerk/backend@1.0.0-beta.22

## 1.0.0-beta.23

### Patch Changes

- Updated dependencies [[`5c239d973`](https://github.com/clerk/javascript/commit/5c239d97373ad2f2aa91ded1b84670f201f7db8f), [`051833167`](https://github.com/clerk/javascript/commit/0518331675ffb4d6c6830d79a1d61f9e4466773a)]:
  - @clerk/types@4.0.0-beta.16
  - @clerk/backend@1.0.0-beta.21

## 1.0.0-beta.22

### Patch Changes

- Rename beta-v5 to beta by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`2de442b24`](https://github.com/clerk/javascript/commit/2de442b2465cc5d424b8a0b21aa57c557f3aa2e7)]:
  - @clerk/backend@1.0.0-beta.20
  - @clerk/shared@2.0.0-beta.13
  - @clerk/types@4.0.0-beta.15

## 1.0.0-beta-v5.21

### Minor Changes

- Introduce handshake mechanism and `x-clerk-auth-status` in response ([#2774](https://github.com/clerk/javascript/pull/2774)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`966b31205`](https://github.com/clerk/javascript/commit/966b312050b572fbbbc07a6f0581cbec21847375), [`a8901be64`](https://github.com/clerk/javascript/commit/a8901be64fe91125a0d38a3c880ffa73168ccf5c), [`7b200af49`](https://github.com/clerk/javascript/commit/7b200af4908839ea661ddf2a76811057b545cafc), [`244de5ea3`](https://github.com/clerk/javascript/commit/244de5ea3a7641727cd85c544bb79fb04f2c0808), [`034c47ccb`](https://github.com/clerk/javascript/commit/034c47ccbef0129b9be9ff8aef683aa039e52602), [`244de5ea3`](https://github.com/clerk/javascript/commit/244de5ea3a7641727cd85c544bb79fb04f2c0808), [`9737ef510`](https://github.com/clerk/javascript/commit/9737ef5104346821461972d31f3c69e93924f0e0), [`8b466a9ba`](https://github.com/clerk/javascript/commit/8b466a9ba93ca10315b534079b09fa5d76ffa305), [`8daf8451c`](https://github.com/clerk/javascript/commit/8daf8451cb564bc834dd856174ffc2cdfa932e37), [`7f751c4ef`](https://github.com/clerk/javascript/commit/7f751c4ef2d14410058cf65ea984a93b50c0b87e), [`4fced88ac`](https://github.com/clerk/javascript/commit/4fced88acc66a4837779d8bbca359086cddeec56), [`be991365e`](https://github.com/clerk/javascript/commit/be991365e1c78d0f1dfc59bb33dd533b6fad223a), [`c2b982749`](https://github.com/clerk/javascript/commit/c2b98274970bac5af33c9bb2e84c70ad90225180)]:
  - @clerk/backend@1.0.0-beta-v5.19
  - @clerk/types@4.0.0-beta-v5.14
  - @clerk/shared@2.0.0-beta-v5.12

## 1.0.0-beta-v5.20

### Patch Changes

- Updated dependencies [[`8e5c881c4`](https://github.com/clerk/javascript/commit/8e5c881c40d7306c5dbd2e1f1803fbf75127bd71), [`d4ff346dd`](https://github.com/clerk/javascript/commit/d4ff346dd53bb3e1970e80bdc7b188c2dd344f12), [`7886ba89d`](https://github.com/clerk/javascript/commit/7886ba89d76bfea2d6882a46baf64bf98f1148d3), [`a6308c67e`](https://github.com/clerk/javascript/commit/a6308c67e329879e001cee56cccd82e60b804422)]:
  - @clerk/backend@1.0.0-beta-v5.18
  - @clerk/shared@2.0.0-beta-v5.11
  - @clerk/types@4.0.0-beta-v5.13

## 1.0.0-alpha-v5.19

### Patch Changes

- Updated dependencies [[`3a2f13604`](https://github.com/clerk/javascript/commit/3a2f13604e1b8b351a05de26d2c0672503aa67b3), [`9e99eb727`](https://github.com/clerk/javascript/commit/9e99eb7276249c68ef6f930cce418ce0004653b9), [`6fffd3b54`](https://github.com/clerk/javascript/commit/6fffd3b542f3df0bcb49281b7c4f77209a83f7a1)]:
  - @clerk/backend@1.0.0-alpha-v5.17

## 1.0.0-alpha-v5.18

### Patch Changes

- Updated dependencies [[`935b0886e`](https://github.com/clerk/javascript/commit/935b0886e8317445f30c92000a27ed68e1223ff6), [`6a769771c`](https://github.com/clerk/javascript/commit/6a769771c975996d8d52b35b5cfdbae5dcec85d4)]:
  - @clerk/backend@1.0.0-alpha-v5.16

## 1.0.0-alpha-v5.17

### Minor Changes

- Replace the `Clerk-Backend-SDK` header with `User-Agent` in BAPI requests and update it's value to contain both the package name and the package version of the clerk package ([#2558](https://github.com/clerk/javascript/pull/2558)) by [@dimkl](https://github.com/dimkl)

  executing the request. Eg request from `@clerk/nextjs` to BAPI with append `User-Agent: @clerk/nextjs@5.0.0-alpha-v5.16` using the latest version.

  Miscellaneous changes: The backend test build changed to use tsup.

### Patch Changes

- Updated dependencies [[`799abc281`](https://github.com/clerk/javascript/commit/799abc281182efb953dd6637f9db7fc61c71a2cd), [`8cc45d2af`](https://github.com/clerk/javascript/commit/8cc45d2af98320ccced3768fb039b86576e424a5), [`b4e79c1b9`](https://github.com/clerk/javascript/commit/b4e79c1b9ab8e14cbfccaf290f0f596da0416e13)]:
  - @clerk/backend@1.0.0-alpha-v5.15
  - @clerk/shared@2.0.0-alpha-v5.10

## 1.0.0-alpha-v5.16

### Patch Changes

- Updated dependencies [[`448e02e93`](https://github.com/clerk/javascript/commit/448e02e93cf2392878d5891009640c52103d99a8), [`e6ecbaa2f`](https://github.com/clerk/javascript/commit/e6ecbaa2ff7add95bf888cb4ce43457b9fde7a13), [`e921af259`](https://github.com/clerk/javascript/commit/e921af259e9bdc8810a830bed54d71cf8eced1f8)]:
  - @clerk/backend@1.0.0-alpha-v5.14

## 1.0.0-alpha-v5.15

### Patch Changes

- Updated dependencies [[`1dc28ab46`](https://github.com/clerk/javascript/commit/1dc28ab46f6930074334be183c637ce7a81bebf7), [`ea4933655`](https://github.com/clerk/javascript/commit/ea4933655863ce315324aa2a3be7d5f263c2b61f), [`38d8b3e8a`](https://github.com/clerk/javascript/commit/38d8b3e8a0387bcf0b9c8d16e3bbfcfe9b643ca2)]:
  - @clerk/shared@2.0.0-alpha-v5.9
  - @clerk/backend@1.0.0-alpha-v5.13

## 1.0.0-alpha-v5.14

### Patch Changes

- Updated dependencies [[`7ecd6f6ab`](https://github.com/clerk/javascript/commit/7ecd6f6abb0e5bfb1a57c99cc11860de311c3e82)]:
  - @clerk/shared@2.0.0-alpha-v5.8
  - @clerk/backend@1.0.0-alpha-v5.12

## 1.0.0-alpha-v5.13

### Patch Changes

- Updated dependencies [[`f4f99f18d`](https://github.com/clerk/javascript/commit/f4f99f18de0be8afaae9f52599deb2814ab235e7), [`fe2607b6f`](https://github.com/clerk/javascript/commit/fe2607b6fdeed83002db7e4a0c040ac0280e5ff7), [`bad4de1a2`](https://github.com/clerk/javascript/commit/bad4de1a2fd8a3e2643fe26677801166a8305c29), [`2e4a43017`](https://github.com/clerk/javascript/commit/2e4a43017ef33b541949ba90e16bf5311ce8bc60), [`e7e2a1eae`](https://github.com/clerk/javascript/commit/e7e2a1eae2ed726ab49894dd195185c8f4e70acd)]:
  - @clerk/backend@1.0.0-alpha-v5.11
  - @clerk/types@4.0.0-alpha-v5.12

## 1.0.0-alpha-v5.12

### Major Changes

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

### Patch Changes

- Updated dependencies [[`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`1e98187b4`](https://github.com/clerk/javascript/commit/1e98187b4fba0f872576510d7bccf8b75a2579bd), [`d08ec6d8f`](https://github.com/clerk/javascript/commit/d08ec6d8f52a2bc037c0eb586123a9f7816e4b64), [`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7), [`0ec3a146c`](https://github.com/clerk/javascript/commit/0ec3a146cc4cbe4a80d1f990a440431ae4490183), [`1ad910eb9`](https://github.com/clerk/javascript/commit/1ad910eb92dce056731f29df0caaaad74d08bd7f), [`f58a9949b`](https://github.com/clerk/javascript/commit/f58a9949bc78737ca4e096ed5501b4e578a2d493), [`9b02c1aae`](https://github.com/clerk/javascript/commit/9b02c1aae1cae286ea305c5e216ae93cbbbc0f90)]:
  - @clerk/backend@1.0.0-alpha-v5.10
  - @clerk/types@4.0.0-alpha-v5.11
  - @clerk/shared@2.0.0-alpha-v5.7

## 1.0.0-alpha-v5.11

### Patch Changes

- Updated dependencies [[`e602d6c1f`](https://github.com/clerk/javascript/commit/e602d6c1fde7a7757d292f24dfaddecd14ac1623)]:
  - @clerk/backend@1.0.0-alpha-v5.9

## 1.0.0-alpha-v5.10

### Major Changes

- (Note: This is only relevant if, in the unlikely case, you are using `Clerk` from `@clerk/fastify` directly. If not, you can safely ignore this change.) ([#2317](https://github.com/clerk/javascript/pull/2317)) by [@tmilewski](https://github.com/tmilewski)

  Remove the named `Clerk` import from `@clerk/fastify` and import `createClerkClient` instead. The latter is a factory method to create a Clerk client instance for you. This update aligns usage across our SDKs and will enable us to ship DX improvements better in the future.

  ```js
  import { Clerk } from '@clerk/fastify';
  const clerk = Clerk({ secretKey: '...' });
  ```

  You need to rename the import from `Clerk` to `createClerkClient` and change its usage:

  ```js
  import { createClerkClient } from '@clerk/fastify';
  const clerk = createClerkClient({ secretKey: '...' });
  ```

### Patch Changes

- Updated dependencies [[`896cb6104`](https://github.com/clerk/javascript/commit/896cb610409f84c0ff7a4f502f0b4ccee1afc157), [`02976d494`](https://github.com/clerk/javascript/commit/02976d49473958b8c3fea38d4e389dc1bee7e8c4), [`69ce3e185`](https://github.com/clerk/javascript/commit/69ce3e185b89283956cb711629bc61703166b1c9), [`86d52fb5c`](https://github.com/clerk/javascript/commit/86d52fb5cf68f1dc7adf617605b922134e21268f), [`ab4eb56a5`](https://github.com/clerk/javascript/commit/ab4eb56a5c34baf496ebb8ac412ad6171b9bd79c), [`46040a2f3`](https://github.com/clerk/javascript/commit/46040a2f34d0991072fca490e031c1994b2e2296), [`75ea300bc`](https://github.com/clerk/javascript/commit/75ea300bce16a0ce401a225263bb267ad2a217b8), [`844847e0b`](https://github.com/clerk/javascript/commit/844847e0becf20243fba3c659b2b77a238dd270a)]:
  - @clerk/shared@2.0.0-alpha-v5.6
  - @clerk/backend@1.0.0-alpha-v5.8
  - @clerk/types@4.0.0-alpha-v5.10

## 1.0.0-alpha-v5.9

### Patch Changes

- Updated dependencies [[`1db1f4068`](https://github.com/clerk/javascript/commit/1db1f4068466d967df0de39f032a476ca8163651), [`de6519daa`](https://github.com/clerk/javascript/commit/de6519daa84732023bcfd74ad816a2654f457952), [`7bffc47cb`](https://github.com/clerk/javascript/commit/7bffc47cb71a2c3e026df5977c25487bfd5c55d7), [`7af0949ae`](https://github.com/clerk/javascript/commit/7af0949ae7b4072f550dee220f4d41854fe504c6), [`e1f7eae87`](https://github.com/clerk/javascript/commit/e1f7eae87531b483564256f5456a31150caa469e)]:
  - @clerk/types@4.0.0-alpha-v5.9
  - @clerk/backend@1.0.0-alpha-v5.7

## 1.0.0-alpha-v5.8

### Patch Changes

- Set correct information on required Node.js and React versions in README ([#2264](https://github.com/clerk/javascript/pull/2264)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`93d05c868`](https://github.com/clerk/javascript/commit/93d05c8680ed213e594a16d4630a65f8eb244b32), [`a6b893d28`](https://github.com/clerk/javascript/commit/a6b893d281b23dc7b4bd7f3733b33e4cf655bc1b), [`2e77cd737`](https://github.com/clerk/javascript/commit/2e77cd737a333de022533d29cb12e73a907694c8), [`6a33709cc`](https://github.com/clerk/javascript/commit/6a33709ccf48586f1a8b62216688ea300b7b5dfb), [`d30ea1faa`](https://github.com/clerk/javascript/commit/d30ea1faa45074e09c037530e8ba3ca2dbd50654)]:
  - @clerk/backend@1.0.0-alpha-v5.6
  - @clerk/types@4.0.0-alpha-v5.8
  - @clerk/shared@2.0.0-alpha-v5.5

## 1.0.0-alpha-v5.7

### Patch Changes

- Updated dependencies [[`4b8bedc66`](https://github.com/clerk/javascript/commit/4b8bedc66d47dca5c6192148f4b31ae6d49ff733), [`c776f86fb`](https://github.com/clerk/javascript/commit/c776f86fb2a999dcae46fda9abb5005718c354b2), [`d6a7ea61a`](https://github.com/clerk/javascript/commit/d6a7ea61a8ae64c93877ec117e54fc48b1c86f16)]:
  - @clerk/shared@2.0.0-alpha-v5.4
  - @clerk/types@4.0.0-alpha-v5.7
  - @clerk/backend@1.0.0-alpha-v5.5

## 1.0.0-alpha-v5.6

### Patch Changes

- Updated dependencies [[`5aab9f04a`](https://github.com/clerk/javascript/commit/5aab9f04a1eac39e42a03f555075e08a5a8ee02c), [`9a1fe3728`](https://github.com/clerk/javascript/commit/9a1fe37289c7606dc111913cb9f70f2a2efff6b7), [`9a1fe3728`](https://github.com/clerk/javascript/commit/9a1fe37289c7606dc111913cb9f70f2a2efff6b7)]:
  - @clerk/types@4.0.0-alpha-v5.6

## 1.0.0-alpha-v5.5

### Patch Changes

- Updated dependencies [[`03079579d`](https://github.com/clerk/javascript/commit/03079579d2b48a9a6969702814449382098d2cfb), [`12962bc58`](https://github.com/clerk/javascript/commit/12962bc58e2c9caad416ba4e6d52061d00bc2feb)]:
  - @clerk/backend@1.0.0-alpha-v5.4
  - @clerk/types@4.0.0-alpha-v5.5

## 1.0.0-alpha-v5.4

### Patch Changes

- Updated dependencies [[`7f6a64f43`](https://github.com/clerk/javascript/commit/7f6a64f4335832c66ff355f6d2f311f33a313d59)]:
  - @clerk/types@4.0.0-alpha-v5.4

## 1.0.0-alpha-v5.3

### Patch Changes

- Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry. ([#2154](https://github.com/clerk/javascript/pull/2154)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`b3a3dcdf4`](https://github.com/clerk/javascript/commit/b3a3dcdf4a8fa75c0dee4c55ab8fedebd49fdfd4), [`4aaf5103d`](https://github.com/clerk/javascript/commit/4aaf5103d3132f4e1ae76b861fa6ce0aae02ecbe), [`52ff8fe6b`](https://github.com/clerk/javascript/commit/52ff8fe6b6ff88ceb5e1246378b54b0565bede9d), [`4bb57057e`](https://github.com/clerk/javascript/commit/4bb57057e9af20fc433626ed178d97d3ca811362), [`4aaf5103d`](https://github.com/clerk/javascript/commit/4aaf5103d3132f4e1ae76b861fa6ce0aae02ecbe), [`0ce0edc28`](https://github.com/clerk/javascript/commit/0ce0edc283849a88b14b4b0df53b6858ed3a4f80), [`40ac4b645`](https://github.com/clerk/javascript/commit/40ac4b645f449b546dae5b4c0d013c9d9ea6d09c), [`429d030f7`](https://github.com/clerk/javascript/commit/429d030f7b6efe838a1e7fec7f736ba59fcc6b61)]:
  - @clerk/backend@1.0.0-alpha-v5.3
  - @clerk/shared@2.0.0-alpha-v5.3
  - @clerk/types@4.0.0-alpha-v5.3

## 1.0.0-alpha-v5.2

### Major Changes

- Change the minimal Node.js version required by Clerk to `18.17.0`. ([#2162](https://github.com/clerk/javascript/pull/2162)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`c2a090513`](https://github.com/clerk/javascript/commit/c2a0905132684a4a1e8d598b66caddf20062273e)]:
  - @clerk/backend@1.0.0-alpha-v5.2
  - @clerk/shared@2.0.0-alpha-v5.2
  - @clerk/types@4.0.0-alpha-v5.2

## 1.0.0-alpha-v5.1

### Patch Changes

- Updated dependencies [[`64d3763ec`](https://github.com/clerk/javascript/commit/64d3763ec73747ad04c4b47017195cf4114e150c), [`deac67c1c`](https://github.com/clerk/javascript/commit/deac67c1c40d6d3ccc3559746c0c31cc29a93b84), [`83e9d0846`](https://github.com/clerk/javascript/commit/83e9d08469e7c2840f06aa7d86831055e23f67a5), [`7f833da9e`](https://github.com/clerk/javascript/commit/7f833da9ebc1b2ec9c65513628c377d0584e5d72), [`492b8a7b1`](https://github.com/clerk/javascript/commit/492b8a7b12f14658a384566012e5807f0a171710), [`2a22aade8`](https://github.com/clerk/javascript/commit/2a22aade8c9bd1f83a9be085983f96fa87903804), [`dd5703013`](https://github.com/clerk/javascript/commit/dd57030133fb8ce98681ff0bcad7e53ee826bb0e), [`f77e8cdbd`](https://github.com/clerk/javascript/commit/f77e8cdbd24411f7f9dbfdafcab0596c598f66c1), [`9615e6cda`](https://github.com/clerk/javascript/commit/9615e6cda8fb1cbc3c2e464e6e891d56e245fac4), [`cace85374`](https://github.com/clerk/javascript/commit/cace85374cb0bb13578cf63fe1f3e6ee59f7f3c2), [`0d1052ac2`](https://github.com/clerk/javascript/commit/0d1052ac284b909786fd0e4744b02fcf4d1a8be6), [`5471c7e8d`](https://github.com/clerk/javascript/commit/5471c7e8dd0155348748fa90e5ae97093f59efe9), [`477170962`](https://github.com/clerk/javascript/commit/477170962f486fd4e6b0653a64826573f0d8621b), [`e0e79b4fe`](https://github.com/clerk/javascript/commit/e0e79b4fe47f64006718d547c898b9f67fe4d424), [`a6451aece`](https://github.com/clerk/javascript/commit/a6451aecef0bac578b295b524f1246dede3a7598)]:
  - @clerk/shared@2.0.0-alpha-v5.1
  - @clerk/backend@1.0.0-alpha-v5.1
  - @clerk/types@4.0.0-alpha-v5.1

## 1.0.0-alpha-v5.0

### Major Changes

- Internal update default apiUrl domain from clerk.dev to clerk.com ([#1878](https://github.com/clerk/javascript/pull/1878)) by [@dimkl](https://github.com/dimkl)

- Drop deprecations. Migration steps: ([#1976](https://github.com/clerk/javascript/pull/1976)) by [@dimkl](https://github.com/dimkl)

  - use `CLERK_SECRET_KEY` instead of `CLERK_API_KEY` env variable
  - use `secretKey` instead of `apiKey`
  - use `CLERK_PUBLISHABLE_KEY` instead of `CLERK_FRONTEND_API` env variable
  - use `publishableKey` instead of `frontendApi`

- Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Improve the default value for `CLERK_API_URL` by utilizing the publishable key to differentiate between local, staging and prod environments. ([#1955](https://github.com/clerk/javascript/pull/1955)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`743c4d204`](https://github.com/clerk/javascript/commit/743c4d20423790b554e66923466081c0d3b0d9ed), [`d37d44a68`](https://github.com/clerk/javascript/commit/d37d44a68e83b8e895963415f000c1aaef66e87e), [`791c49807`](https://github.com/clerk/javascript/commit/791c49807c3c9e19964cbf621c935d237caeecf3), [`a68eb3083`](https://github.com/clerk/javascript/commit/a68eb3083ff68459cd33098e2df190a5ba26c841), [`0293f29c8`](https://github.com/clerk/javascript/commit/0293f29c855c9415b54867196e8d727d1614e4ca), [`ef2325dcc`](https://github.com/clerk/javascript/commit/ef2325dcc18729e9ce9ee5823e9a963efa51dbc1), [`8b6b094b9`](https://github.com/clerk/javascript/commit/8b6b094b9c7d09eeae90f8bdfac44d53513aa63d), [`71663c568`](https://github.com/clerk/javascript/commit/71663c568926b1d60b97aa7ccc5298d05b618af2), [`90aa2ea9c`](https://github.com/clerk/javascript/commit/90aa2ea9c4675662cee581298b49bd76ec8f8850), [`a605335e1`](https://github.com/clerk/javascript/commit/a605335e1e6f37d9b02170282974b0e1406e3f98), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`78fc5eec0`](https://github.com/clerk/javascript/commit/78fc5eec0d61c14d86204944c6aa9f341ae6ea98), [`c22cd5214`](https://github.com/clerk/javascript/commit/c22cd52147492ba25f3c07bdbe6bbc4eb49a5cf0), [`c7e6d00f5`](https://github.com/clerk/javascript/commit/c7e6d00f56e73df4ed87712e74ad9d5bcaca8924), [`4edb77632`](https://github.com/clerk/javascript/commit/4edb7763271b80d93fcd52ece5f1e408bd75df6f), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`7644b7472`](https://github.com/clerk/javascript/commit/7644b74726ba73e615a1256f9ff3fa03b0f8bc30), [`f5d55bb1f`](https://github.com/clerk/javascript/commit/f5d55bb1fc6a87303fb8bf461c3a917ae4da4005), [`41ae1d2f0`](https://github.com/clerk/javascript/commit/41ae1d2f006a0e4657a97a9c83ae7eb0cc167834), [`48ca40af9`](https://github.com/clerk/javascript/commit/48ca40af97a7fa4f2e41cf0f071028767d1b0075), [`6f755addd`](https://github.com/clerk/javascript/commit/6f755addd0886b9ff8b0d5dbe48e37470049acad)]:
  - @clerk/shared@2.0.0-alpha-v5.0
  - @clerk/types@4.0.0-alpha-v5.0
  - @clerk/backend@1.0.0-alpha-v5.0

## 0.6.17

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`3bf64107e`](https://github.com/clerk/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`52f8553d2`](https://github.com/clerk/javascript/commit/52f8553d22f9454ee1194fd162410db15da7a4be), [`92727eec3`](https://github.com/clerk/javascript/commit/92727eec39566278263ffa118a085493f964eb94), [`b09b66eec`](https://github.com/clerk/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerk/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62), [`aa4cd7615`](https://github.com/clerk/javascript/commit/aa4cd761585b888706a36a6eed7436a8f0476dbf)]:
  - @clerk/backend@0.31.3
  - @clerk/shared@1.0.0
  - @clerk/types@3.57.0

## 0.6.16

### Patch Changes

- Updated dependencies [[`9ca215702`](https://github.com/clerk/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11)]:
  - @clerk/types@3.56.1
  - @clerk/backend@0.31.2

## 0.6.15

### Patch Changes

- Updated dependencies [[`35be8709d`](https://github.com/clerk/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`13e9dfbaa`](https://github.com/clerk/javascript/commit/13e9dfbaa5b7b7e72f63e4b8ecfc1c1918517cd8), [`e38488c92`](https://github.com/clerk/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerk/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`9b644d799`](https://github.com/clerk/javascript/commit/9b644d7991b8cba4b385e9443f87798cde5c9989), [`a9894b445`](https://github.com/clerk/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`834dadb36`](https://github.com/clerk/javascript/commit/834dadb36c30b2a8f052784de4ad1026b0083b4e), [`70f251007`](https://github.com/clerk/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`a46d6fe99`](https://github.com/clerk/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/types@3.56.0
  - @clerk/backend@0.31.1
  - @clerk/shared@0.24.5

## 0.6.14

### Patch Changes

- Introduce a new property on the core Clerk singleton, `sdkMetadata`. This will be populated by each host SDK. This metadata will be used to make logging and debugging easier. ([#1857](https://github.com/clerk/javascript/pull/1857)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`977336f79`](https://github.com/clerk/javascript/commit/977336f793cd4ce5984f98dac3cedf9f5ec363f5), [`997b8e256`](https://github.com/clerk/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91e9a55f4`](https://github.com/clerk/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`c9b17f5a7`](https://github.com/clerk/javascript/commit/c9b17f5a72cb27786cfc7f1fb42be1233fb10d5c), [`91014880d`](https://github.com/clerk/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`3848f8dbe`](https://github.com/clerk/javascript/commit/3848f8dbe094226c6062341405a32a9621042fd6), [`7f4d4b942`](https://github.com/clerk/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b)]:
  - @clerk/shared@0.24.4
  - @clerk/types@3.55.0
  - @clerk/backend@0.31.0

## 0.6.13

### Patch Changes

- Updated dependencies [[`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1e212c19d`](https://github.com/clerk/javascript/commit/1e212c19d1cbfbcf6bc6718f5aec0a3cb893b96f), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679)]:
  - @clerk/shared@0.24.3
  - @clerk/backend@0.30.3

## 0.6.12

### Patch Changes

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerk/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`fed24f1bf`](https://github.com/clerk/javascript/commit/fed24f1bf3e2b8c3f3e3327178f77b57c391c62c), [`164f3aac7`](https://github.com/clerk/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerk/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerk/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`0636ff779`](https://github.com/clerk/javascript/commit/0636ff7799e126d1438d2738ce0e46c3b277f46a), [`9514618d6`](https://github.com/clerk/javascript/commit/9514618d65cfdde0ff011eabd41a992b61fc8dc1), [`bb2ec9373`](https://github.com/clerk/javascript/commit/bb2ec93738f92c89f008c6a275a986593816c4d3), [`c7c6912f3`](https://github.com/clerk/javascript/commit/c7c6912f34874467bc74104690fe9f95491cc10d), [`71bb1c7b5`](https://github.com/clerk/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf)]:
  - @clerk/types@3.54.0
  - @clerk/backend@0.30.2
  - @clerk/shared@0.24.2

## 0.6.11

### Patch Changes

- Updated dependencies [[`cecf74d79`](https://github.com/clerk/javascript/commit/cecf74d79069662d25f73e4745aa01348d398afb)]:
  - @clerk/backend@0.30.1
  - @clerk/shared@0.24.1

## 0.6.10

### Patch Changes

- Updated dependencies [[`7ffa6fac3`](https://github.com/clerk/javascript/commit/7ffa6fac3762f6fb130ba2f2fcaa28e52b36b3b4), [`5c8754239`](https://github.com/clerk/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81), [`2f6a6ac99`](https://github.com/clerk/javascript/commit/2f6a6ac9991469bf8532019bb22ff50adecdb434), [`2f6a6ac99`](https://github.com/clerk/javascript/commit/2f6a6ac9991469bf8532019bb22ff50adecdb434), [`94c36c755`](https://github.com/clerk/javascript/commit/94c36c755b598eb68d22f42eb7f738050f390678), [`753f7bbda`](https://github.com/clerk/javascript/commit/753f7bbda9bbb7444f96222a3b6cae815a09058f), [`7406afe7f`](https://github.com/clerk/javascript/commit/7406afe7f550f702bd91cde9616fd26222833a87), [`55c8ebd39`](https://github.com/clerk/javascript/commit/55c8ebd390dd88036aee06866009be6a50c63138)]:
  - @clerk/shared@0.24.0
  - @clerk/types@3.53.0
  - @clerk/backend@0.30.0

## 0.6.9

### Patch Changes

- Warn about deprecated constants that will be removed in next major version ([#1759](https://github.com/clerk/javascript/pull/1759)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`07ede0f95`](https://github.com/clerk/javascript/commit/07ede0f959f232f6cbecb596eb9352f8cb382cdc), [`0eb666118`](https://github.com/clerk/javascript/commit/0eb66611882e6c460cc6a6c5cfa1d9b086ec6917), [`3b85311c9`](https://github.com/clerk/javascript/commit/3b85311c9eb006f51a8642f193473a250de879fc), [`ffcc78c06`](https://github.com/clerk/javascript/commit/ffcc78c062d067738f617ea9b491c1d45677148c), [`c61ddf5bf`](https://github.com/clerk/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerk/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/shared@0.23.1
  - @clerk/types@3.52.1
  - @clerk/backend@0.29.3

## 0.6.8

### Patch Changes

- Updated dependencies [[`40ea407ad`](https://github.com/clerk/javascript/commit/40ea407ad1042fee6871755f30de544200b1f0d8), [`378a903ac`](https://github.com/clerk/javascript/commit/378a903ac4dc12e6ee708de20f0d9a5aa758bd18), [`27b611e47`](https://github.com/clerk/javascript/commit/27b611e47e4f1ad86e8dff42cb02c98bdc6ff6bd), [`4d0d90238`](https://github.com/clerk/javascript/commit/4d0d9023895c13290d5578ece218c24348c540fc)]:
  - @clerk/backend@0.29.2

## 0.6.7

### Patch Changes

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`e99df0a0d`](https://github.com/clerk/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerk/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`75be1d6b3`](https://github.com/clerk/javascript/commit/75be1d6b3d9bf7b5d71613b3f169a942b1d25e7e), [`01b024c57`](https://github.com/clerk/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68)]:
  - @clerk/types@3.52.0
  - @clerk/backend@0.29.1

## 0.6.6

### Patch Changes

- Updated dependencies [[`463ff84f5`](https://github.com/clerk/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`e6a388946`](https://github.com/clerk/javascript/commit/e6a38894640b6999b90ea44ef66acda34debe2c1), [`1426e5eb3`](https://github.com/clerk/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739)]:
  - @clerk/types@3.51.0
  - @clerk/backend@0.29.0

## 0.6.5

### Patch Changes

- Updated dependencies [[`975412ed5`](https://github.com/clerk/javascript/commit/975412ed5307ac81128c87289178bd1e6c2fb1af)]:
  - @clerk/backend@0.28.1

## 0.6.4

### Patch Changes

- Updated dependencies [[`96cc1921c`](https://github.com/clerk/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerk/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerk/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerk/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerk/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerk/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerk/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerk/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerk/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerk/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`86de584dd`](https://github.com/clerk/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e02a1aff2`](https://github.com/clerk/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerk/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerk/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerk/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerk/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerk/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`30fcdd51a`](https://github.com/clerk/javascript/commit/30fcdd51a98dea60da36f2b5152ea22405d2c4f2), [`89bc5de04`](https://github.com/clerk/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/types@3.50.0
  - @clerk/backend@0.28.0

## 0.6.3

### Patch Changes

- Updated dependencies [[`ea95525a4`](https://github.com/clerk/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerk/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`d433b83b9`](https://github.com/clerk/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerk/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`876777cb1`](https://github.com/clerk/javascript/commit/876777cb14443917d8e0a04b363327d165ad5580), [`0a59e122d`](https://github.com/clerk/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/backend@0.27.0
  - @clerk/types@3.49.0

## 0.6.2

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerk/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3), [`4ff4b716f`](https://github.com/clerk/javascript/commit/4ff4b716fdb12b18182e506737afafc7dbc05604)]:
  - @clerk/types@3.48.1
  - @clerk/backend@0.26.0

## 0.6.1

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerk/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c)]:
  - @clerk/types@3.48.0
  - @clerk/backend@0.25.1

## 0.6.0

### Minor Changes

- Introduce `createIsomorphicRequest` in `@clerk/backend` ([#1393](https://github.com/clerk/javascript/pull/1393)) by [@anagstef](https://github.com/anagstef)

  This utility simplifies the `authenticateRequest` signature, and it makes it easier to integrate with more frameworks.

### Patch Changes

- Pass the `ClerkFastifyOptions` to the exported fastify plugin ([#1488](https://github.com/clerk/javascript/pull/1488)) by [@mikestopcontinues](https://github.com/mikestopcontinues)

- Updated dependencies [[`16c3283ec`](https://github.com/clerk/javascript/commit/16c3283ec192cb7525312da5e718aa7cac8b8445), [`73c9c1d0e`](https://github.com/clerk/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerk/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerk/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`e3036848d`](https://github.com/clerk/javascript/commit/e3036848d19a48935129aec2fe50003518a3aa53), [`fd692af79`](https://github.com/clerk/javascript/commit/fd692af791fe206724e38eff647b8562e72c3652), [`090bab66e`](https://github.com/clerk/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`bb0d69b45`](https://github.com/clerk/javascript/commit/bb0d69b455fa5fd6ca5b1f45a0f242957521dfbb), [`592911196`](https://github.com/clerk/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8)]:
  - @clerk/backend@0.25.0
  - @clerk/types@3.47.0

## 0.5.7

### Patch Changes

- Updated dependencies [[`2ad7cf390`](https://github.com/clerk/javascript/commit/2ad7cf390ba84b8e767ed6fe136800e38356d79c), [`f0b044c47`](https://github.com/clerk/javascript/commit/f0b044c475546e96a5995ef16198e60e35e8098f)]:
  - @clerk/backend@0.24.0

## 0.5.6

### Patch Changes

- Updated dependencies [[`3fee736c9`](https://github.com/clerk/javascript/commit/3fee736c993b0a8fd157d716890810d04e632962), [`ac4e47274`](https://github.com/clerk/javascript/commit/ac4e47274afc2ab3a55a78b388a14bed76600402), [`5957a3da6`](https://github.com/clerk/javascript/commit/5957a3da68cde3386c741812e2bc03b5519d00e0)]:
  - @clerk/backend@0.23.7

## 0.5.5

### Patch Changes

- Updated dependencies [[`30f8ad18a`](https://github.com/clerk/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c)]:
  - @clerk/types@3.46.1
  - @clerk/backend@0.23.6

## 0.5.4

### Patch Changes

- Updated dependencies [[`bfb3af28`](https://github.com/clerk/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/types@3.46.0
  - @clerk/backend@0.23.5

## 0.5.3

### Patch Changes

- Updated dependencies [[`11954816`](https://github.com/clerk/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`de2347f9`](https://github.com/clerk/javascript/commit/de2347f9efaab4903787a905528a06551a9b7883), [`32148490`](https://github.com/clerk/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0
  - @clerk/backend@0.23.4

## 0.5.2

### Patch Changes

- Updated dependencies [[`17cc14ec`](https://github.com/clerk/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/types@3.44.0
  - @clerk/backend@0.23.3

## 0.5.1

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerk/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerk/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/types@3.43.0
  - @clerk/backend@0.23.2

## 0.5.0

### Minor Changes

- Add support for binding middleware to `onRequest` in addition to `preHandler` ([#1356](https://github.com/clerk/javascript/pull/1356)) by [@mikestopcontinues](https://github.com/mikestopcontinues)

## 0.4.8

### Patch Changes

- Updated dependencies [[`b945c921`](https://github.com/clerk/javascript/commit/b945c92100454f00ff4b6b9c769201ca2ceaac93)]:
  - @clerk/backend@0.23.1

## 0.4.7

### Patch Changes

- Updated dependencies [[`c42b4ac0`](https://github.com/clerk/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`010484f4`](https://github.com/clerk/javascript/commit/010484f4978b9616e8c2ef50986eda742c4967bd)]:
  - @clerk/types@3.42.0
  - @clerk/backend@0.23.0

## 0.4.6

### Patch Changes

- Updated dependencies [[`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/backend@0.22.0
  - @clerk/types@3.41.1

## [0.4.0](https://github.com/clerk/javascript/compare/@clerk/fastify@0.3.1-staging.3...@clerk/fastify@0.4.0) (2023-05-15)

**Note:** Version bump only for package @clerk/fastify

## [0.3.0](https://github.com/clerk/javascript/compare/@clerk/fastify@0.3.0-staging.2...@clerk/fastify@0.3.0) (2023-05-04)

**Note:** Version bump only for package @clerk/fastify

## [0.3.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/fastify@0.3.0-staging.1...@clerk/fastify@0.3.0-staging.2) (2023-05-04)

**Note:** Version bump only for package @clerk/fastify

## [0.3.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/fastify@0.3.0-staging.0...@clerk/fastify@0.3.0-staging.1) (2023-05-02)

**Note:** Version bump only for package @clerk/fastify

### [0.2.6](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.6-staging.0...@clerk/fastify@0.2.6) (2023-04-19)

**Note:** Version bump only for package @clerk/fastify

### [0.2.5](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.4...@clerk/fastify@0.2.5) (2023-04-19)

**Note:** Version bump only for package @clerk/fastify

### [0.2.4](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.4-staging.0...@clerk/fastify@0.2.4) (2023-04-12)

**Note:** Version bump only for package @clerk/fastify

### [0.2.3](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.3-staging.3...@clerk/fastify@0.2.3) (2023-04-11)

**Note:** Version bump only for package @clerk/fastify

### [0.2.2](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.2-staging.0...@clerk/fastify@0.2.2) (2023-04-06)

**Note:** Version bump only for package @clerk/fastify

### [0.2.1](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.1-staging.3...@clerk/fastify@0.2.1) (2023-03-31)

**Note:** Version bump only for package @clerk/fastify

### [0.2.1-staging.1](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.1-staging.0...@clerk/fastify@0.2.1-staging.1) (2023-03-31)

**Note:** Version bump only for package @clerk/fastify

## [0.2.0](https://github.com/clerk/javascript/compare/@clerk/fastify@0.2.0-staging.0...@clerk/fastify@0.2.0) (2023-03-29)

**Note:** Version bump only for package @clerk/fastify

### [0.1.11](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.11-staging.2...@clerk/fastify@0.1.11) (2023-03-10)

**Note:** Version bump only for package @clerk/fastify

### [0.1.10](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.10-staging.1...@clerk/fastify@0.1.10) (2023-03-09)

**Note:** Version bump only for package @clerk/fastify

### [0.1.9](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.9-staging.1...@clerk/fastify@0.1.9) (2023-03-07)

**Note:** Version bump only for package @clerk/fastify

### [0.1.8](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.8-staging.1...@clerk/fastify@0.1.8) (2023-03-03)

**Note:** Version bump only for package @clerk/fastify

### [0.1.7](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.7-staging.0...@clerk/fastify@0.1.7) (2023-03-01)

**Note:** Version bump only for package @clerk/fastify

### [0.1.6](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.6-staging.0...@clerk/fastify@0.1.6) (2023-02-25)

**Note:** Version bump only for package @clerk/fastify

### [0.1.5](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.5-staging.7...@clerk/fastify@0.1.5) (2023-02-24)

**Note:** Version bump only for package @clerk/fastify

### [0.1.5-staging.4](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.5-staging.3...@clerk/fastify@0.1.5-staging.4) (2023-02-22)

**Note:** Version bump only for package @clerk/fastify

### [0.1.4](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.4-staging.1...@clerk/fastify@0.1.4) (2023-02-17)

**Note:** Version bump only for package @clerk/fastify

### [0.1.3](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.3-staging.2...@clerk/fastify@0.1.3) (2023-02-15)

**Note:** Version bump only for package @clerk/fastify

### [0.1.2](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.2-staging.1...@clerk/fastify@0.1.2) (2023-02-10)

**Note:** Version bump only for package @clerk/fastify

### [0.1.1](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.1-staging.0...@clerk/fastify@0.1.1) (2023-02-07)

**Note:** Version bump only for package @clerk/fastify

### [0.1.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/fastify@0.1.0...@clerk/fastify@0.1.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/fastify

## [0.1.0](https://github.com/clerk/javascript/compare/@clerk/fastify@0.0.2-staging.0...@clerk/fastify@0.1.0) (2023-02-07)

### Features

- **fastify:** Add @clerk/fastify implementation & use it in @playground/fastify ([6cb4c6a](https://github.com/clerk/javascript/commit/6cb4c6a800710a480958f3e238d535d87fe97de7))
- **fastify:** Export `clerkClient` and `createClerkClient` ([ba7abfa](https://github.com/clerk/javascript/commit/ba7abfaec7be0d1046250edf3658a0a0128f1513))
- **fastify:** Improve code readability and test coverage ([13d4f0f](https://github.com/clerk/javascript/commit/13d4f0f6781c39c5a670cf1c878efe312bef84ca))

### Bug Fixes

- **fastify:** Add deprecation warning for API_KEY & FRONTEND_API ([4957a23](https://github.com/clerk/javascript/commit/4957a23f8ca34d88d2aa63a4551b88ff5b3dcee9))
- **fastify:** Add type to plugin options ([7142f3c](https://github.com/clerk/javascript/commit/7142f3cedf1d6b1c0486763607782a98ce3c7aa8))
- **fastify:** Improve readability ([1162362](https://github.com/clerk/javascript/commit/1162362e3c591c4b422321f9d8fd18d97011f939))
- **fastify:** Introduce error message generator like in remix ([05475c2](https://github.com/clerk/javascript/commit/05475c214d6d48ee0a84fd49369a6b32871a0d87))
- **fastify:** Refactor to drop fastify deprecation warning ([472ab57](https://github.com/clerk/javascript/commit/472ab571a53b71da335ad12ff24866a873f01226))
- **fastify:** Tackle PR comments ([a2c9615](https://github.com/clerk/javascript/commit/a2c9615731610830e04425fd527f2e5cfb518361))
