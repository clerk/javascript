# Change Log

## 1.20.3

### Patch Changes

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/types@4.39.2
  - @clerk/shared@2.19.4

## 1.20.2

### Patch Changes

- Add missing `reservedForSecondFactor` property to `CreatePhoneNumberParams` and `UpdatePhoneNumberParams` types. ([#4730](https://github.com/clerk/javascript/pull/4730)) by [@tmoran-stenoa](https://github.com/tmoran-stenoa)

- Updated dependencies [[`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/types@4.39.1
  - @clerk/shared@2.19.3

## 1.20.1

### Patch Changes

- Updated dependencies [[`4cb22548da81dd8b186a6ef1cf120aea99c85c62`](https://github.com/clerk/javascript/commit/4cb22548da81dd8b186a6ef1cf120aea99c85c62)]:
  - @clerk/shared@2.19.2

## 1.20.0

### Minor Changes

- New **experimental** API: `AccountlessApplicationAPI` ([#4602](https://github.com/clerk/javascript/pull/4602)) by [@panteliselef](https://github.com/panteliselef)

  Inside `clerkClient` you can activate this new API through `__experimental_accountlessApplications`. It allows you to generate an "accountless" application and the API returns the publishable key, secret key, and an URL as a response. The URL allows a user to claim this application with their account. Hence the name "accountless" because in its initial state the application is not attached to any account yet.

### Patch Changes

- Updated dependencies [[`550c7e9851329688e37be29b83ea0c3b12482af7`](https://github.com/clerk/javascript/commit/550c7e9851329688e37be29b83ea0c3b12482af7), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99)]:
  - @clerk/types@4.39.0
  - @clerk/shared@2.19.1

## 1.19.2

### Patch Changes

- Updated dependencies [[`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3), [`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3)]:
  - @clerk/shared@2.19.0
  - @clerk/types@4.38.0

## 1.19.1

### Patch Changes

- Updated dependencies [[`4e5e7f463c12893a21cb3b5f9317fc3f2945879b`](https://github.com/clerk/javascript/commit/4e5e7f463c12893a21cb3b5f9317fc3f2945879b)]:
  - @clerk/types@4.37.0
  - @clerk/shared@2.18.1

## 1.19.0

### Minor Changes

- Allow creating organizations without an initial owner to facilitate B2B onboarding flows ([#4670](https://github.com/clerk/javascript/pull/4670)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Updated dependencies [[`8ee5d84995fa17532491ff96efac5738c9bcd9ef`](https://github.com/clerk/javascript/commit/8ee5d84995fa17532491ff96efac5738c9bcd9ef), [`09fedd1df155d30cc055ce701b133aa6470e9b47`](https://github.com/clerk/javascript/commit/09fedd1df155d30cc055ce701b133aa6470e9b47), [`235eaae4c3c9400492fca47d20a47c7081041565`](https://github.com/clerk/javascript/commit/235eaae4c3c9400492fca47d20a47c7081041565)]:
  - @clerk/types@4.36.0
  - @clerk/shared@2.18.0

## 1.18.1

### Patch Changes

- Update the supported API version to `2024-10-01` that includes the following changes ([#4596](https://github.com/clerk/javascript/pull/4596)) by [@Nikpolik](https://github.com/Nikpolik)

  No changes affecting the Backend API have been made in this version.

  Read more in the [API Version docs](https://clerk.com/docs/backend-requests/versioning/available-versions#2024-10-01)

- Updated dependencies [[`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d)]:
  - @clerk/types@4.35.1
  - @clerk/shared@2.17.1

## 1.18.0

### Minor Changes

- Update AuthObject property from `__experimental_factorVerificationAge` to `factorVerificationAge`. ([#4536](https://github.com/clerk/javascript/pull/4536)) by [@panteliselef](https://github.com/panteliselef)

  Also replaces the following APIs:

  - `__experimental_reverificationError` -> `__reverificationError`
  - `__experimental_reverificationErrorResponse` -> `reverificationErrorResponse`

### Patch Changes

- Updated dependencies [[`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`d84d7e31235c5c7da3415981dc76db4473a71a39`](https://github.com/clerk/javascript/commit/d84d7e31235c5c7da3415981dc76db4473a71a39), [`dce4f7ffca7248c0500f0ec9a978672b1f2fad69`](https://github.com/clerk/javascript/commit/dce4f7ffca7248c0500f0ec9a978672b1f2fad69)]:
  - @clerk/shared@2.17.0
  - @clerk/types@4.35.0

## 1.17.2

### Patch Changes

- Updated dependencies [[`c70994b5b6f92a6550dfe37547f01bbfa810c223`](https://github.com/clerk/javascript/commit/c70994b5b6f92a6550dfe37547f01bbfa810c223), [`7623a99594e7329200b6b374e483152d7679ce66`](https://github.com/clerk/javascript/commit/7623a99594e7329200b6b374e483152d7679ce66)]:
  - @clerk/types@4.34.2
  - @clerk/shared@2.16.1

## 1.17.1

### Patch Changes

- Updated dependencies [[`e47eb5882a7fd4a8dee25933c6644790d6ea3407`](https://github.com/clerk/javascript/commit/e47eb5882a7fd4a8dee25933c6644790d6ea3407), [`273d16cb0665d4d960838cb294dc356f41814745`](https://github.com/clerk/javascript/commit/273d16cb0665d4d960838cb294dc356f41814745), [`6b0961765e1f3d09679be4b163fa13ac7dd97191`](https://github.com/clerk/javascript/commit/6b0961765e1f3d09679be4b163fa13ac7dd97191)]:
  - @clerk/shared@2.16.0
  - @clerk/types@4.34.1

## 1.17.0

### Minor Changes

- Rename `reverificationMismatch` to `reverificationError`. ([#4582](https://github.com/clerk/javascript/pull/4582)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`536fa996ff84a545678a3036b28409824d1c00dd`](https://github.com/clerk/javascript/commit/536fa996ff84a545678a3036b28409824d1c00dd), [`b28c5e8bc44885bf6b1533df48e872ba90c387da`](https://github.com/clerk/javascript/commit/b28c5e8bc44885bf6b1533df48e872ba90c387da)]:
  - @clerk/shared@2.15.0

## 1.16.4

### Patch Changes

- Updated dependencies [[`46faeb6f59b19c963fb137c858347525b1cd9e19`](https://github.com/clerk/javascript/commit/46faeb6f59b19c963fb137c858347525b1cd9e19), [`ea6c52dd751abe38b350ee07f148652c24125e22`](https://github.com/clerk/javascript/commit/ea6c52dd751abe38b350ee07f148652c24125e22)]:
  - @clerk/shared@2.14.0
  - @clerk/types@4.34.0

## 1.16.3

### Patch Changes

- Updated dependencies [[`1c0b5001f7f975a2f3f54ad692526ecf7257847e`](https://github.com/clerk/javascript/commit/1c0b5001f7f975a2f3f54ad692526ecf7257847e), [`6217a3f7c94311d49f873214bd406961e0b8d6f7`](https://github.com/clerk/javascript/commit/6217a3f7c94311d49f873214bd406961e0b8d6f7), [`1783025cdb94c447028704c2121fa0b8af785904`](https://github.com/clerk/javascript/commit/1783025cdb94c447028704c2121fa0b8af785904)]:
  - @clerk/types@4.33.0
  - @clerk/shared@2.13.0

## 1.16.2

### Patch Changes

- Fixes satellite syncing when both the satellite and the primary apps use server-side enabled frameworks like NextJS ([#4516](https://github.com/clerk/javascript/pull/4516)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.16.1

### Patch Changes

- Updated dependencies [[`7dbad4c5abd226d7b10941a626ead5d85b1a3f24`](https://github.com/clerk/javascript/commit/7dbad4c5abd226d7b10941a626ead5d85b1a3f24)]:
  - @clerk/types@4.32.0
  - @clerk/shared@2.12.1

## 1.16.0

### Minor Changes

- Send API version through request headers. ([#4458](https://github.com/clerk/javascript/pull/4458)) by [@jacekradko](https://github.com/jacekradko)

- Introduce experimental verification helpers exported from `@clerk/backend/internal` ([#4480](https://github.com/clerk/javascript/pull/4480)) by [@panteliselef](https://github.com/panteliselef)

  - \_\_experimental_reverificationMismatch
  - \_\_experimental_reverificationMismatchResponse

### Patch Changes

- Updated dependencies [[`5a21de1f46df3642828dc27e4862263c9858da2b`](https://github.com/clerk/javascript/commit/5a21de1f46df3642828dc27e4862263c9858da2b), [`f7472e22877f62fc7f3c8d3efe409ff2276fb4a3`](https://github.com/clerk/javascript/commit/f7472e22877f62fc7f3c8d3efe409ff2276fb4a3), [`e199037b8f484abdeeb9fc24455a1b4b8c31c8dd`](https://github.com/clerk/javascript/commit/e199037b8f484abdeeb9fc24455a1b4b8c31c8dd), [`886e294a8d8c54b39cd5bda88d46b89eace3861e`](https://github.com/clerk/javascript/commit/886e294a8d8c54b39cd5bda88d46b89eace3861e), [`0e443ad7c76643420b50e5b169193e03f6ef79f9`](https://github.com/clerk/javascript/commit/0e443ad7c76643420b50e5b169193e03f6ef79f9), [`cc24c8145f1eea7fb91550f2c3e0bac3993e4320`](https://github.com/clerk/javascript/commit/cc24c8145f1eea7fb91550f2c3e0bac3993e4320)]:
  - @clerk/shared@2.12.0
  - @clerk/types@4.31.0

## 1.15.7

### Patch Changes

- Updated dependencies [[`8a04ae47b8305f994b348301fd8134d5baf02943`](https://github.com/clerk/javascript/commit/8a04ae47b8305f994b348301fd8134d5baf02943)]:
  - @clerk/shared@2.11.5

## 1.15.6

### Patch Changes

- Updated dependencies [[`d74a6a7c0f291104c6bba722a8c432814d7b336e`](https://github.com/clerk/javascript/commit/d74a6a7c0f291104c6bba722a8c432814d7b336e), [`1a0c8fe665869e732d3c800bde0f5219fce54301`](https://github.com/clerk/javascript/commit/1a0c8fe665869e732d3c800bde0f5219fce54301), [`0800fc3f1f4e1b6a1d13f5c02557001a283af6e8`](https://github.com/clerk/javascript/commit/0800fc3f1f4e1b6a1d13f5c02557001a283af6e8)]:
  - @clerk/types@4.30.0
  - @clerk/shared@2.11.4

## 1.15.5

### Patch Changes

- Updated dependencies [[`a7726cc12a824b278f6d2a37cb1901c38c5f70dc`](https://github.com/clerk/javascript/commit/a7726cc12a824b278f6d2a37cb1901c38c5f70dc)]:
  - @clerk/shared@2.11.3

## 1.15.2

### Patch Changes

- Updated dependencies [[`f875463da`](https://github.com/clerk/javascript/commit/f875463da9692f2d173b6d5388743cf720750ae3), [`5be7ca9fd`](https://github.com/clerk/javascript/commit/5be7ca9fd239c937cc88e20ce8f5bfc9f3b84f22), [`08c5a2add`](https://github.com/clerk/javascript/commit/08c5a2add6872c76e62fc0df06db723e3728452e), [`434b432f8`](https://github.com/clerk/javascript/commit/434b432f8c114825120eef0f2c278b8142ed1563)]:
  - @clerk/types@4.29.0
  - @clerk/shared@2.11.0

## 1.15.1

### Patch Changes

- Add the 'session-token-expired-refresh-unexpected-bapi-error' debug handshake reason. ([#4363](https://github.com/clerk/javascript/pull/4363)) by [@anagstef](https://github.com/anagstef)

- Updated dependencies [[`3fdcdbf88`](https://github.com/clerk/javascript/commit/3fdcdbf88c38facf8b82563f634ec1b6604fd8e5)]:
  - @clerk/types@4.28.0
  - @clerk/shared@2.10.1

## 1.15.0

### Minor Changes

- - Added `legalAcceptedAt` on `User` ([#4367](https://github.com/clerk/javascript/pull/4367)) by [@octoper](https://github.com/octoper)

  - Added `legalAcceptedAt` and `skipLegalChecks` on `CreateUserParams` and `UpdateUserParams`
  - Added `legal_accepted_at` on `UserJSON`

### Patch Changes

- Updated dependencies [[`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc), [`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc)]:
  - @clerk/shared@2.10.0
  - @clerk/types@4.27.0

## 1.14.1

### Patch Changes

- Remove console error message from refresh token flow failures. ([#4351](https://github.com/clerk/javascript/pull/4351)) by [@anagstef](https://github.com/anagstef)

## 1.14.0

### Minor Changes

- Updates `organizationPatterns` to take precedence over `personalAccountPatterns` in `organizationSyncOptions` ([#4320](https://github.com/clerk/javascript/pull/4320)) by [@izaaklauer](https://github.com/izaaklauer)

- Use EIP-4361 message spec for Web3 wallets sign in signature requests ([#4334](https://github.com/clerk/javascript/pull/4334)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Updated dependencies [[`e81d45b72`](https://github.com/clerk/javascript/commit/e81d45b72c81403c7c206dac5454de1fef6bec57), [`752ce9bfa`](https://github.com/clerk/javascript/commit/752ce9bfa47a8eebd38cd272eeb58ae26fea3371), [`99cdf9b67`](https://github.com/clerk/javascript/commit/99cdf9b67d1e99e66cc73d8a5bfce1f1f8df1b83), [`ce40ff6f0`](https://github.com/clerk/javascript/commit/ce40ff6f0d3bc79e33375be6dd5e03f140a07000), [`2102052c0`](https://github.com/clerk/javascript/commit/2102052c017065ab511339870fcebaa6719f2702)]:
  - @clerk/types@4.26.0
  - @clerk/shared@2.9.2

## 1.13.10

### Patch Changes

- Updated dependencies [[`d64e54c40`](https://github.com/clerk/javascript/commit/d64e54c40c9cf001b25e45a1b8939c9f7e80c6d6), [`2ba2fd148`](https://github.com/clerk/javascript/commit/2ba2fd1483b7561d7df9a1952ead0ee15e422131)]:
  - @clerk/shared@2.9.1
  - @clerk/types@4.25.1

## 1.13.9

### Patch Changes

- Expose `permissions` field for `OrganizationMembership` resource ([#4310](https://github.com/clerk/javascript/pull/4310)) by [@dstaley](https://github.com/dstaley)

- Introduces organizationSyncOptions option to clerkMiddleware, which syncs an active organization or personal account from a URL to the Clerk session. (https://github.com/clerk/javascript/pull/3977) by [@izaaklauer](https://github.com/izaaklauer)

## 1.13.8

### Patch Changes

- Updated dependencies [[`fb932e5cf`](https://github.com/clerk/javascript/commit/fb932e5cf21315adf60bee0855b6bd5ee2ff9867)]:
  - @clerk/shared@2.9.0
  - @clerk/types@4.25.0

## 1.13.7

### Patch Changes

- Updated dependencies [[`f6fb8b53d`](https://github.com/clerk/javascript/commit/f6fb8b53d236863ad7eca576ee7a16cd33f3506b), [`4a8570590`](https://github.com/clerk/javascript/commit/4a857059059a02bb4f20893e08601e1e67babbed)]:
  - @clerk/types@4.24.0
  - @clerk/shared@2.8.5

## 1.13.6

### Patch Changes

- Add the 'session-token-expired-refresh-expired-session-token-missing-sid-claim' handshake reason for debugging purposes ([#4237](https://github.com/clerk/javascript/pull/4237)) by [@anagstef](https://github.com/anagstef)

- Update `uploaderUserId` parameter on `updateOrganizationLogo` to be optional. ([#4236](https://github.com/clerk/javascript/pull/4236)) by [@izaaklauer](https://github.com/izaaklauer)

- Handle "Cannot convert argument to a ByteString" errors ([#4244](https://github.com/clerk/javascript/pull/4244)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.13.5

### Patch Changes

- Conditionally renders identification sections on `UserProfile` based on the SAML connection configuration for disabling additional identifiers. ([#4211](https://github.com/clerk/javascript/pull/4211)) by [@NicolasLopes7](https://github.com/NicolasLopes7)

- Introduces the CRUD of organization domains under the `organizations` API. ([#4224](https://github.com/clerk/javascript/pull/4224)) by [@NicolasLopes7](https://github.com/NicolasLopes7)

- Updated dependencies [[`4749ed4c5`](https://github.com/clerk/javascript/commit/4749ed4c55a5ba5810451b8d436aad0d49829050), [`f1f17eaab`](https://github.com/clerk/javascript/commit/f1f17eaabed0dc4b7de405fb77d85503cf75ad33), [`2e35ac538`](https://github.com/clerk/javascript/commit/2e35ac53885f8008779940d41d1e804fa77ebfa9)]:
  - @clerk/types@4.23.0
  - @clerk/shared@2.8.4

## 1.13.4

### Patch Changes

- Updated dependencies [[`c9063853e`](https://github.com/clerk/javascript/commit/c9063853e538a4010f5d4e522a3da5abc80098a4), [`19d3808d4`](https://github.com/clerk/javascript/commit/19d3808d4672234944226d6709ec51214e8d6e1d), [`737bcbb0f`](https://github.com/clerk/javascript/commit/737bcbb0ffb5e2dcadbb02e8fc718fe8825c5842)]:
  - @clerk/types@4.22.0
  - @clerk/shared@2.8.3

## 1.13.3

### Patch Changes

- Introduce `includeMembersCount` parameter to `getOrganization`, allowing to retrieve an organization with `membersCount`. ([#4196](https://github.com/clerk/javascript/pull/4196)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Improve debugging error reasons. ([#4205](https://github.com/clerk/javascript/pull/4205)) by [@anagstef](https://github.com/anagstef)

- Drop the `__clerk_refresh` debugging query param and use only the `__clerk_hs_reason` param for all scenarios. ([#4213](https://github.com/clerk/javascript/pull/4213)) by [@anagstef](https://github.com/anagstef)

- Introduce more refresh token error reasons. ([#4193](https://github.com/clerk/javascript/pull/4193)) by [@anagstef](https://github.com/anagstef)

- Updated dependencies [[`cb32aaf59`](https://github.com/clerk/javascript/commit/cb32aaf59d38dcd12e959f542782f71a87adf9c1), [`2e5c550e4`](https://github.com/clerk/javascript/commit/2e5c550e4aec61150c2a17fdcd4a0e1273cb50e7), [`6275c242c`](https://github.com/clerk/javascript/commit/6275c242cd8bcb6f7766934059967e0fe775a0c1), [`f9faaf031`](https://github.com/clerk/javascript/commit/f9faaf03100baf679c78e6c24877fbf3b60be529)]:
  - @clerk/shared@2.8.2
  - @clerk/types@4.21.1

## 1.13.2

### Patch Changes

- Add the handshake reason as a query param for observability. ([#4184](https://github.com/clerk/javascript/pull/4184)) by [@anagstef](https://github.com/anagstef)

## 1.13.1

### Patch Changes

- Updated dependencies [[`3743eb911`](https://github.com/clerk/javascript/commit/3743eb9114733f20ed56a863ab98fa9c363b6723)]:
  - @clerk/shared@2.8.1

## 1.13.0

### Minor Changes

- Add new refresh token flow to reduce errors arising from too many redirects ([#4154](https://github.com/clerk/javascript/pull/4154)) by [@dstaley](https://github.com/dstaley)

## 1.12.0

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

- Add webhook event types for roles and permissions ([#4153](https://github.com/clerk/javascript/pull/4153)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Fix Chrome caching 307 redirects when a handshake is triggered. ([#4171](https://github.com/clerk/javascript/pull/4171)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`ba19be354`](https://github.com/clerk/javascript/commit/ba19be35461f0e5c76a58d11e4252a16781322c6), [`248142a6d`](https://github.com/clerk/javascript/commit/248142a6ded6ca937d0df7d628197f25228aadec), [`1189f71f8`](https://github.com/clerk/javascript/commit/1189f71f872f2683c12de5add5f154aeb953ca8d)]:
  - @clerk/shared@2.8.0
  - @clerk/types@4.21.0

## 1.11.1

### Patch Changes

- Updated dependencies [[`be3b119f8`](https://github.com/clerk/javascript/commit/be3b119f840d2ae74f4b75d717711d53ac0e5f54)]:
  - @clerk/shared@2.7.2

## 1.11.0

### Minor Changes

- Bug fix: Introducing missing `deleteSelfEnabled` from User. ([#4139](https://github.com/clerk/javascript/pull/4139)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Update type of `__experimental_factorVerificationAge` to be `[number, number] | null`. ([#4135](https://github.com/clerk/javascript/pull/4135)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`8c6909d46`](https://github.com/clerk/javascript/commit/8c6909d46328c943f1d464a28f1a324a27d0f3f1)]:
  - @clerk/types@4.20.1
  - @clerk/shared@2.7.1

## 1.10.0

### Minor Changes

- Experimental support: Expect a new sessionClaim called `fva` that tracks the age of verified factor groups. ([#4061](https://github.com/clerk/javascript/pull/4061)) by [@panteliselef](https://github.com/panteliselef)

  ### Server side

  This can be applied to any helper that returns the auth object

  **Nextjs example**

  ```ts
  auth().__experimental_factorVerificationAge;
  ```

  ### Client side

  **React example**

  ```ts
  const { session } = useSession();
  session?.__experimental_factorVerificationAge;
  ```

### Patch Changes

- Updated dependencies [[`c63a5adf0`](https://github.com/clerk/javascript/commit/c63a5adf0ba4b99252146f168318f51b709bb5dd), [`8823c21a2`](https://github.com/clerk/javascript/commit/8823c21a26bc81cbc3ed007908b1a9ea474bd343), [`95ac67a14`](https://github.com/clerk/javascript/commit/95ac67a143c263bef0c1f589728566ab8f95768d), [`a0cb062fa`](https://github.com/clerk/javascript/commit/a0cb062faa4d23bef7a577e5cc486f4c5efe6bfa), [`746b4ed5e`](https://github.com/clerk/javascript/commit/746b4ed5e2007505d5850a2a728484809474d7bf)]:
  - @clerk/types@4.20.0
  - @clerk/shared@2.7.0

## 1.9.2

### Patch Changes

- Add url property to the Invitation object ([#4076](https://github.com/clerk/javascript/pull/4076)) by [@issuedat](https://github.com/issuedat)

- Updated dependencies [[`8a3b9f079`](https://github.com/clerk/javascript/commit/8a3b9f0793484b32dd609a5c80a194e62151d6ea), [`e95c28196`](https://github.com/clerk/javascript/commit/e95c2819675cea7963f2404e5f71f37ebed8d5e0)]:
  - @clerk/types@4.19.0
  - @clerk/shared@2.6.2

## 1.9.1

### Patch Changes

- Updated dependencies [[`82593173a`](https://github.com/clerk/javascript/commit/82593173aafbf6646e12c5779627cdcb138a1f27), [`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733)]:
  - @clerk/types@4.18.0
  - @clerk/shared@2.6.1

## 1.9.0

### Minor Changes

- Add missing `deleteSelfEnabled` property in `UpdateUserParams`. ([#4044](https://github.com/clerk/javascript/pull/4044)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Fix error from duplicate leading slashes in URL path on Cloudflare Pages ([#3982](https://github.com/clerk/javascript/pull/3982)) by [@mlafeldt](https://github.com/mlafeldt)

- Add missing `slug` property in TS type declaration for SMS webhook events ([#4024](https://github.com/clerk/javascript/pull/4024)) by [@tmoran-stenoa](https://github.com/tmoran-stenoa)

- Tidy up and improve README ([#4053](https://github.com/clerk/javascript/pull/4053)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`58e6754ad`](https://github.com/clerk/javascript/commit/58e6754ad9f9a1244b023ce1f5e5f2c1c4eb20e7), [`13693018f`](https://github.com/clerk/javascript/commit/13693018f4f7ac5d224698aa730e20960896f68c), [`3aa63dc5a`](https://github.com/clerk/javascript/commit/3aa63dc5a48161cfe92d94093ef0c32efd401342), [`3304dcc0b`](https://github.com/clerk/javascript/commit/3304dcc0bc93a92a7f729f585c60ff91d2ae04f6)]:
  - @clerk/types@4.17.0
  - @clerk/shared@2.6.0

## 1.8.3

### Patch Changes

- Updated dependencies [[`c1389492d`](https://github.com/clerk/javascript/commit/c1389492d8b6a9292ab04889bf776c0f45e66845)]:
  - @clerk/types@4.16.0
  - @clerk/shared@2.5.5

## 1.8.2

### Patch Changes

- Updated dependencies [[`0158c774a`](https://github.com/clerk/javascript/commit/0158c774af2243a2cd13b55c4d6fae877178c961), [`8be1a7abc`](https://github.com/clerk/javascript/commit/8be1a7abc8849d7d59552011bd6b25bc917d51f5)]:
  - @clerk/types@4.15.1
  - @clerk/shared@2.5.4

## 1.8.1

### Patch Changes

- Updated dependencies [[`247b3fd75`](https://github.com/clerk/javascript/commit/247b3fd75042365dc9f950db056b76f9fadfdcf6)]:
  - @clerk/types@4.15.0
  - @clerk/shared@2.5.3

## 1.8.0

### Minor Changes

- Add `deleteUserProfileImage` method to the UserAPI class. ([#3991](https://github.com/clerk/javascript/pull/3991)) by [@octoper](https://github.com/octoper)

## 1.7.0

### Minor Changes

- Adds `awscognito` to backend `PasswordHasher` type ([#3943](https://github.com/clerk/javascript/pull/3943)) by [@thiskevinwang](https://github.com/thiskevinwang)

### Patch Changes

- Updated dependencies [[`dc0e1c33d`](https://github.com/clerk/javascript/commit/dc0e1c33d6844b028cb1ee11c3359b886d609f3c)]:
  - @clerk/types@4.14.0
  - @clerk/shared@2.5.2

## 1.6.3

### Patch Changes

- Updated dependencies [[`7e0ced3da`](https://github.com/clerk/javascript/commit/7e0ced3da94f41056bc4445d163d3b615afb6ab1), [`b6f0613dc`](https://github.com/clerk/javascript/commit/b6f0613dc9d8b0bab41cfabbaa8621b126e3bdf5)]:
  - @clerk/shared@2.5.1
  - @clerk/types@4.13.1

## 1.6.2

### Patch Changes

- Updated dependencies [[`59d5f19d3`](https://github.com/clerk/javascript/commit/59d5f19d333bf4a35c244886e93b4368e215225c), [`4e6c94e3f`](https://github.com/clerk/javascript/commit/4e6c94e3f4cc92cbba8bddcd2b90fcc9cfb83763)]:
  - @clerk/shared@2.5.0
  - @clerk/types@4.13.0

## 1.6.1

### Patch Changes

- Export the type `AuthObject`. You can now use it like so: ([#3844](https://github.com/clerk/javascript/pull/3844)) by [@kduprey](https://github.com/kduprey)

  ```ts
  import type { AuthObject } from '@clerk/backend';
  ```

- Updated dependencies [[`9b2aeacb3`](https://github.com/clerk/javascript/commit/9b2aeacb32fff7c300bda458636a1cc81a42ee7b)]:
  - @clerk/types@4.12.1
  - @clerk/shared@2.4.5

## 1.6.0

### Minor Changes

- Add `createOrganizationsLimit` param in `@clerk/backend` method `User.updateUser()` ([#3823](https://github.com/clerk/javascript/pull/3823)) by [@NicolasLopes7](https://github.com/NicolasLopes7)

  Example:

  ```typescript
      import { createClerkClient }  from '@clerk/backend';

      const clerkClient = createClerkClient({...});
      // Update user with createOrganizationsLimit equals 10
      await clerkClient.users.updateUser('user_...', { createOrganizationsLimit: 10 })

      // Remove createOrganizationsLimit
      await clerkClient.users.updateUser('user_...', { createOrganizationsLimit: 0 })
  ```

### Patch Changes

- Updated dependencies [[`7e94fcf0f`](https://github.com/clerk/javascript/commit/7e94fcf0fcbee8842a54f7931c45190370aa870d)]:
  - @clerk/types@4.12.0
  - @clerk/shared@2.4.4

## 1.5.2

### Patch Changes

- Updated dependencies [[`568186cad`](https://github.com/clerk/javascript/commit/568186cad29acaf0b084a9f86ccb9d29bd23fcf4), [`407195270`](https://github.com/clerk/javascript/commit/407195270ed8aab6eef18c64a4918e3870fef471)]:
  - @clerk/types@4.11.0
  - @clerk/shared@2.4.3

## 1.5.1

### Patch Changes

- Retry handshake in case of handshake cookie collision in order to support multiple apps on same-level subdomains ([#3848](https://github.com/clerk/javascript/pull/3848)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.5.0

### Minor Changes

- Added a `locked` property to the User object in the SDK ([#3748](https://github.com/clerk/javascript/pull/3748)) by [@iamjameswalters](https://github.com/iamjameswalters)

### Patch Changes

- Updated dependencies [[`aa06f3ba7`](https://github.com/clerk/javascript/commit/aa06f3ba7e725071c90d4a1d6840060236da3c23), [`80e647731`](https://github.com/clerk/javascript/commit/80e64773135865434cf0e6c220e287397aa07937)]:
  - @clerk/types@4.10.0
  - @clerk/shared@2.4.2

## 1.4.3

### Patch Changes

- Updated dependencies [[`b48689705`](https://github.com/clerk/javascript/commit/b48689705f9fc2251d2f24addec7a0d0b1da0fe1)]:
  - @clerk/types@4.9.1
  - @clerk/shared@2.4.1

## 1.4.2

### Patch Changes

- Fix `getToken` returning `null` when signing in. ([#3764](https://github.com/clerk/javascript/pull/3764)) by [@anagstef](https://github.com/anagstef)

## 1.4.1

### Patch Changes

- Handle the scenario where FAPI returns unsuffixed cookies without throwing a handshake ([#3789](https://github.com/clerk/javascript/pull/3789)) by [@dimkl](https://github.com/dimkl)

## 1.4.0

### Minor Changes

- Support reading / writing / removing suffixed/un-suffixed cookies from `@clerk/clerk-js` and `@clerk/backend`. by [@dimkl](https://github.com/dimkl)

  The `__session`, `__clerk_db_jwt` and `__client_uat` cookies will now include a suffix derived from the instance's publishakeKey. The cookie name suffixes are used to prevent cookie collisions, effectively enabling support for multiple Clerk applications running on the same domain.

### Patch Changes

- Updated dependencies [[`b87f7b9e1`](https://github.com/clerk/javascript/commit/b87f7b9e163756fd43789bc7b7344d2eb24015ec), [`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`86c75e50c`](https://github.com/clerk/javascript/commit/86c75e50cba9c4efb480672f1b8c6a6fff4ef477)]:
  - @clerk/shared@2.4.0
  - @clerk/types@4.9.0

## 1.3.2

### Patch Changes

- Updated dependencies [[`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7)]:
  - @clerk/types@4.8.0
  - @clerk/shared@2.3.3

## 1.3.1

### Patch Changes

- Fixes a bug where Clerk's Handshake mechanism would not run when an application is rendered in an iframe. ([#3555](https://github.com/clerk/javascript/pull/3555)) by [@anagstef](https://github.com/anagstef)

## 1.3.0

### Minor Changes

- Introduces dynamic keys from `clerkMiddleware`, allowing access by server-side helpers like `auth`. Keys such as `signUpUrl`, `signInUrl`, `publishableKey` and `secretKey` are securely encrypted using AES algorithm. ([#3525](https://github.com/clerk/javascript/pull/3525)) by [@LauraBeatris](https://github.com/LauraBeatris)

  - When providing `secretKey`, `CLERK_ENCRYPTION_KEY` is required as the encryption key. If `secretKey` is not provided, `CLERK_SECRET_KEY` is used by default.
  - `clerkClient` from `@clerk/nextjs` should now be called as a function, and its singleton form is deprecated. This change allows the Clerk backend client to read keys from the current request, which is necessary to support dynamic keys.

  For more information, refer to the documentation: https://clerk.com/docs/references/nextjs/clerk-middleware#dynamic-keys

## 1.2.5

### Patch Changes

- Updated dependencies [[`d6b5006c4`](https://github.com/clerk/javascript/commit/d6b5006c4cc1b6f07bb3a6832b4ec6e65ea15814)]:
  - @clerk/types@4.7.0
  - @clerk/shared@2.3.2

## 1.2.4

### Patch Changes

- Updated dependencies [[`1273b04ec`](https://github.com/clerk/javascript/commit/1273b04ecf1866b59ef59a74abe31dbcc726da2c)]:
  - @clerk/types@4.6.1
  - @clerk/shared@2.3.1

## 1.2.3

### Patch Changes

- Updated dependencies [[`4ec3f63e2`](https://github.com/clerk/javascript/commit/4ec3f63e26d8d3725a7ba9bbf988a7776fe893ff)]:
  - @clerk/shared@2.3.0

## 1.2.2

### Patch Changes

- Set `@clerk/types` as a dependency for packages that had it as a dev dependency. ([#3450](https://github.com/clerk/javascript/pull/3450)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`86a27f693`](https://github.com/clerk/javascript/commit/86a27f6933de50c99b6bc354bf87ff5c2cfcaf38), [`02bed2e00`](https://github.com/clerk/javascript/commit/02bed2e00d3e0a4e1bb1698b13267faf6aeb31b3), [`73e5d61e2`](https://github.com/clerk/javascript/commit/73e5d61e21ab3f77f3c8343bc63da0626466c7ac), [`b8e46328d`](https://github.com/clerk/javascript/commit/b8e46328da874859c4928f19f924219cd6520b11)]:
  - @clerk/shared@2.2.2
  - @clerk/types@4.6.0

## 1.2.1

### Patch Changes

- Updated dependencies [[`ff31f7255`](https://github.com/clerk/javascript/commit/ff31f725541d82caaa9c13cf42cf15f8ce3992f4), [`0e48fc210`](https://github.com/clerk/javascript/commit/0e48fc210cf0b5852052a21494a05f6e723101f5)]:
  - @clerk/shared@2.2.1

## 1.2.0

### Minor Changes

- Consume and expose the 'saml_accounts' property of the user resource ([#3405](https://github.com/clerk/javascript/pull/3405)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Updated dependencies [[`456b06849`](https://github.com/clerk/javascript/commit/456b068493b8679e1772819eea24d49aa1bc6556)]:
  - @clerk/shared@2.2.0

## 1.1.5

### Patch Changes

- Added missing phpass and bcrypt_sha256_django hashers to PasswordHasher type ([#3380](https://github.com/clerk/javascript/pull/3380)) by [@royanger](https://github.com/royanger)

- Updated dependencies [[`ec84d51e7`](https://github.com/clerk/javascript/commit/ec84d51e705370273ffb82a0d7c94d90ba3de874)]:
  - @clerk/shared@2.1.1

## 1.1.4

### Patch Changes

- Updated dependencies [[`b27ca8366`](https://github.com/clerk/javascript/commit/b27ca8366a1d6ec1d7ce4a5be5005f1b1b017c20)]:
  - @clerk/shared@2.1.0

## 1.1.3

### Patch Changes

- Inherit verifyToken options from clerkClient. ([#3296](https://github.com/clerk/javascript/pull/3296)) by [@panteliselef](https://github.com/panteliselef)

  The below code now works as expected: (requires CLERK_SECRET_KEY env var to have been set)

  ```ts
  import { clerkClient } from '@clerk/clerk-sdk-node';

  // Use the default settings from the already instanciated clerkClient
  clerkClient.verifyToken(token);
  // or provide overrides the options
  clerkClient.verifyToken(token, {
    secretKey: 'xxxx',
  });
  ```

## 1.1.2

### Patch Changes

- Fix bug in JWKS cache logic that caused a race condition resulting in no JWK being available. ([#3321](https://github.com/clerk/javascript/pull/3321)) by [@BRKalow](https://github.com/BRKalow)

- Pass `devBrowserToken` to `createRedirect()` to ensure methods from `auth()` that trigger redirects correctly pass the dev browser token for URL-based session syncing. ([#3334](https://github.com/clerk/javascript/pull/3334)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`1662aaae9`](https://github.com/clerk/javascript/commit/1662aaae965fcf36b13dba6b148e096ab6a1cd83), [`f70c885f7`](https://github.com/clerk/javascript/commit/f70c885f798f7ff513f6687f87c8a56daf26fa05), [`f5804a225`](https://github.com/clerk/javascript/commit/f5804a225e9d67cd315700f0ced0ff17b8b14e53)]:
  - @clerk/shared@2.0.2

## 1.1.1

### Patch Changes

- Fix the following `@clerk/backend` methods to populate their paginated responses: ([#3276](https://github.com/clerk/javascript/pull/3276)) by [@dimkl](https://github.com/dimkl)

  - `clerkClient.allowListIndentifiers.getAllowlistIdentifierList()`
  - `clerkClient.clients.getClientList()`
  - `clerkClient.invitations.getInvitationList`
  - `clerkClient.redirectUrls.getRedirectUrlList()`
  - `clerkClient.sessions.getSessionList()`
  - `clerkClient.users.getUserOauthAccessToken()`

- Updated dependencies [[`a78bc447c`](https://github.com/clerk/javascript/commit/a78bc447c1aabaa41bcbaa2a8fe3c48f31275574), [`19cd42434`](https://github.com/clerk/javascript/commit/19cd42434450e568998336bf6d705e475122abbc)]:
  - @clerk/shared@2.0.1

## 1.1.0

### Minor Changes

- Updated types for `orderBy` in OrganizationApi and UserApi ([#3266](https://github.com/clerk/javascript/pull/3266)) by [@panteliselef](https://github.com/panteliselef)

  - `OrganizationAPI.getOrganizationMembershipList` now accepts `orderBy`
    - Acceptable values `phone_number`, `+phone_number`, `-phone_number`, `email_address`, `+email_address`, `-email_address`, `created_at`, `+created_at`, `-created_at`, `first_name`, `+first_name`, `-first_name`
  - `UserAPI.getUserList` expands the acceptable values of the `orderBy` to:
    - `email_address`, `+email_address`, `-email_address`, `web3wallet`, `+web3wallet`, `-web3wallet`, `first_name`, `+first_name`, `-first_name`, `last_name`, `+last_name`, `-last_name`, `phone_number`, `+phone_number`, `-phone_number`, `username`, `+username`, `-username`

- Add support for the Testing Tokens API ([#3258](https://github.com/clerk/javascript/pull/3258)) by [@anagstef](https://github.com/anagstef)

### Patch Changes

- Fix infinite redirect loops for production instances with incorrect secret keys ([#3259](https://github.com/clerk/javascript/pull/3259)) by [@dimkl](https://github.com/dimkl)

## 1.0.1

### Patch Changes

- Export all Webhook event types and related JSON types. The newly exported types are: `DeletedObjectJSON`, `EmailJSON`, `OrganizationInvitationJSON`, `OrganizationJSON`, `OrganizationMembershipJSON`, `SessionJSON`, `SMSMessageJSON`, `UserJSON`, `UserWebhookEvent`, `EmailWebhookEvent`, `SMSWebhookEvent`, `SessionWebhookEvent`, `OrganizationWebhookEvent`, `OrganizationMembershipWebhookEvent`, `OrganizationInvitationWebhookEvent` ([#3248](https://github.com/clerk/javascript/pull/3248)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Added missing 'organizationId' parameter to UserListParams ([#3240](https://github.com/clerk/javascript/pull/3240)) by [@royanger](https://github.com/royanger)

  Moved last_active_at_since from UserCountParams to UserListParams

## 1.0.0

### Major Changes

- 3a2f13604: Drop `user` / `organization` / `session` from auth object on **signed-out** state (current value was `null`). Eg

  ```diff
      // Backend
      import { createClerkClient } from '@clerk/backend';

      const clerkClient = createClerkClient({...});
      const requestState = clerkClient.authenticateRequest(request, {...});

      - const { user, organization, session } = requestState.toAuth();
      + const { userId, organizationId, sessionId } = requestState.toAuth();

      // Remix
      import { getAuth } from '@clerk/remix/ssr.server';

      - const { user, organization, session } = await getAuth(args);
      + const { userId, organizationId, sessionId } = await getAuth(args);

      // or
      rootAuthLoader(
          args,
          ({ request }) => {
              - const { user, organization, session } = request.auth;
              + const { userId, organizationId, sessionId } = request.auth;
              // ...
          },
          { loadUser: true },
      );

      // NextJS
      import { getAuth } from '@clerk/nextjs/server';

      - const { user, organization, session } = getAuth(args);
      + const { userId, organizationId, sessionId } = getAuth(req, opts);

      // Gatsby
      import { withServerAuth } from 'gatsby-plugin-clerk';

      export const getServerData: GetServerData<any> = withServerAuth(
          async props => {
              - const { user, organization, session } =  props;
              + const { userId, organizationId, sessionId } = props;
              return { props: { data: '1', auth: props.auth, userId, organizationId, sessionId } };
          },
          { loadUser: true },
      );
  ```

- c2a090513: Change the minimal Node.js version required by Clerk to `18.17.0`.
- deac67c1c: Drop default exports from all packages. Migration guide:
  - use `import { Clerk } from '@clerk/backend';`
  - use `import { clerkInstance } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-js';`
  - use `import { Clerk } from '@clerk/clerk-js/headless';`
  - use `import { IsomorphicClerk } from '@clerk/clerk-react'`
- 244de5ea3: Make all listing API requests to return consistent `{ data: Resource[], totalCount: number }`.

  Support pagination request params `{ limit, offset }` to:

  - `sessions.getSessionList({ limit, offset })`
  - `clients.getClientList({ limit, offset })`

  Since the `users.getUserList()` does not return the `total_count` as a temporary solution that
  method will perform 2 BAPI requests:

  1. retrieve the data
  2. retrieve the total count (invokes `users.getCount()` internally)

- a9fe242be: Change return value of `verifyToken()` from `@clerk/backend` to `{ data, error}`.
  To replicate the current behaviour use this:

  ```typescript
  import { verifyToken } from '@clerk/backend'

  const { data, error }  = await verifyToken(...);
  if(error){
      throw error;
  }
  ```

- 799abc281: Change `SessionApi.getToken()` to return consistent `{ data, errors }` return value
  and fix the `getToken()` from requestState to have the same return behavior as v4
  (return Promise<string> or throw error).
  This change fixes issues with `getToken()` in `@clerk/nextjs` / `@clerk/remix` / `@clerk/fastify` / `@clerk/sdk-node` / `gatsby-plugin-clerk`:

  Example:

  ```typescript
  import { getAuth } from '@clerk/nextjs/server';

  const { getToken } = await getAuth(...);
  const jwtString = await getToken(...);
  ```

  The change in `SessionApi.getToken()` return value is a breaking change, to keep the existing behavior use the following:

  ```typescript
  import { ClerkAPIResponseError } from '@clerk/shared/error';

  const response = await clerkClient.sessions.getToken(...);

  if (response.errors) {
      const { status, statusText, clerkTraceId } = response;
      const error = new ClerkAPIResponseError(statusText || '', {
          data: [],
          status: Number(status || ''),
          clerkTraceId,
      });
      error.errors = response.errors;

      throw error;
  }

  // the value of the v4 `clerkClient.sessions.getToken(...)`
  const jwtString = response.data.jwt;
  ```

- 71663c568: Internal update default apiUrl domain from clerk.dev to clerk.com
- 02976d494: Remove the named `Clerk` import from `@clerk/backend` and import `createClerkClient` instead. The latter is a factory method that will create a Clerk client instance for you. This aligns usage across our SDKs and will enable us to better ship DX improvements in the future.

  Inside your code, search for occurrences like these:

  ```js
  import { Clerk } from '@clerk/backend';
  const clerk = Clerk({ secretKey: '...' });
  ```

  You need to rename the import from `Clerk` to `createClerkClient` and change its usage:

  ```js
  import { createClerkClient } from '@clerk/backend';
  const clerk = createClerkClient({ secretKey: '...' });
  ```

- 8e5c881c4: The following paginated APIs now return `{ data, totalCount }` instead of simple arrays, in order to make building paginated UIs easier:

  - `clerkClient.users.getOrganizationMembershipList(...)`
  - `clerkClient.organization.getOrganizationList(...)`
  - `clerkClient.organization.getOrganizationInvitationList(...)`

  Revert changing the `{ data, errors }` return value of the following helpers to throw the `errors` or return the `data` (keep v4 format):

  - `import { verifyToken } from '@clerk/backend'`
  - `import { signJwt, hasValidSignature, decodeJwt, verifyJwt } from '@clerk/backend/jwt'`
  - BAPI `clerkClient` methods eg (`clerkClient.users.getUserList(...)`)

- dd5703013: Change the response payload of Backend API requests to return `{ data, errors }` instead of return the data and throwing on error response.
  Code example to keep the same behavior:

  ```typescript
  import { users } from '@clerk/backend';
  import { ClerkAPIResponseError } from '@clerk/shared/error';

  const { data, errors, clerkTraceId, status, statusText } = await users.getUser('user_deadbeef');
  if (errors) {
    throw new ClerkAPIResponseError(statusText, {
      data: errors,
      status,
      clerkTraceId,
    });
  }
  ```

- 86d52fb5c: - Refactor the `authenticateRequest()` flow to use the new client handshake endpoint. This replaces the previous "interstitial"-based flow. This should improve performance and overall reliability of Clerk's server-side request authentication functionality.
  - `authenticateRequest()` now accepts two arguments, a `Request` object to authenticate and options:
    ```ts
    authenticateRequest(new Request(...), { secretKey: '...' })
    ```
- a9fe242be: Change return values of `signJwt`, `hasValidSignature`, `decodeJwt`, `verifyJwt`
  to return `{ data, error }`. Example of keeping the same behavior using those utilities:

  ```typescript
  import { signJwt, hasValidSignature, decodeJwt, verifyJwt } from '@clerk/backend/jwt';

  const { data, error } = await signJwt(...)
  if (error) throw error;

  const { data, error } = await hasValidSignature(...)
  if (error) throw error;

  const { data, error } = decodeJwt(...)
  if (error) throw error;

  const { data, error } = await verifyJwt(...)
  if (error) throw error;
  ```

- 97407d8aa: Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now.
- 9615e6cda: Enforce passing `request` param to `authenticateRequest` method of `@clerk/backend`
  instead of passing each header or cookie related option that is used internally to
  determine the request state.

  Migration guide:

  - use `request` param in `clerkClient.authenticateRequest()` instead of:
    - `origin`
    - `host`
    - `forwardedHost`
    - `forwardedProto`
    - `referrer`
    - `userAgent`
    - `cookieToken`
    - `clientUat`
    - `headerToken`
    - `searchParams`

  Example

  ```typescript
  //
  // current
  //
  import { clerkClient } from '@clerk/backend'

  const requestState = await clerkClient.authenticateRequest({
      secretKey: 'sk_....'
      publishableKey: 'pk_....'
      origin: req.headers.get('origin'),
      host: req.headers.get('host'),
      forwardedHost: req.headers.get('x-forwarded-host'),
      forwardedProto: req.headers.get('x-forwarded-proto'),
      referrer: req.headers.get('referer'),
      userAgent: req.headers.get('user-agent'),
      clientUat: req.cookies.get('__client_uat'),
      cookieToken: req.cookies.get('__session'),
      headerToken: req.headers.get('authorization'),
      searchParams: req.searchParams
  });

  //
  // new
  //
  import { clerkClient,  } from '@clerk/backend'

  // use req (if it's a fetch#Request instance) or use `createIsomorphicRequest` from `@clerk/backend`
  // to re-construct fetch#Request instance
  const requestState = await clerkClient.authenticateRequest({
      secretKey: 'sk_....'
      publishableKey: 'pk_....'
      request: req
  });

  ```

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
- cace85374: Drop deprecated properties. Migration steps:

  - use `createClerkClient` instead of `__unstable_options`
  - use `publishableKey` instead of `frontendApi`
  - use `clockSkewInMs` instead of `clockSkewInSeconds`
  - use `apiKey` instead of `secretKey`
  - drop `httpOptions`
  - use `*.image` instead of
    - `ExternalAccount.picture`
    - `ExternalAccountJSON.avatar_url`
    - `Organization.logoUrl`
    - `OrganizationJSON.logo_url`
    - `User.profileImageUrl`
    - `UserJSON.profile_image_url`
    - `OrganizationMembershipPublicUserData.profileImageUrl`
    - `OrganizationMembershipPublicUserDataJSON.profile_image_url`
  - drop `pkgVersion`
  - use `Organization.getOrganizationInvitationList` with `status` instead of `getPendingOrganizationInvitationList`
  - drop `orgs` claim (if required, can be manually added by using `user.organizations` in a jwt template)
  - use `localInterstitial` instead of `remotePublicInterstitial` / `remotePublicInterstitialUrl`

  Internal changes:

  - replaced error enum (and it's) `SetClerkSecretKeyOrAPIKey` with `SetClerkSecretKey`

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
- f58a9949b: Changes in exports of `@clerk/backend`:
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
- d22e6164d: Rename property `members_count` to `membersCount` for `Organization` resource
- e1f7eae87: Limit TokenVerificationError exports to TokenVerificationError and TokenVerificationErrorReason
- 9b02c1aae: Changes in `@clerk/backend` exports:
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
- e602d6c1f: Drop unused SearchParams.AuthStatus constant
- 6fffd3b54: Replace return the value of the following jwt helpers to match the format of backend API client return values (for consistency).

  ```diff
  import { signJwt } from '@clerk/backend/jwt';

  - const { data, error } = await signJwt(...);
  + const { data, errors: [error] = [] } = await signJwt(...);
  ```

  ```diff
  import { verifyJwt } from '@clerk/backend/jwt';

  - const { data, error } = await verifyJwt(...);
  + const { data, errors: [error] = [] } = await verifyJwt(...);
  ```

  ```diff
  import { hasValidSignature } from '@clerk/backend/jwt';

  - const { data, error } = await hasValidSignature(...);
  + const { data, errors: [error] = [] } = await hasValidSignature(...);
  ```

  ```diff
  import { decodeJwt } from '@clerk/backend/jwt';

  - const { data, error } = await decodeJwt(...);
  + const { data, errors: [error] = [] } = await decodeJwt(...);
  ```

  ```diff
  import { verifyToken } from '@clerk/backend';

  - const { data, error } = await verifyToken(...);
  + const { data, errors: [error] = [] } = await verifyToken(...);
  ```

### Minor Changes

- 966b31205: Add `unbanUser`, `lockUser`, and `unlockUser` methods to the UserAPI class.
- ecb60da48: Implement token signature verification when passing verified token from Next.js middleware to the application origin.
- 448e02e93: Add fullName, primaryEmailAddress, primaryPhoneNumber, primaryWeb3Wallet to User class.
- 2671e7aa5: Add `external_account_id` to OAuth access token response
- 8b6b094b9: Added prefers-color-scheme to interstitial
- a6b893d28: - Added the `User.last_active_at` timestamp field which stores the latest date of session activity, with day precision. For further details, please consult the [Backend API documentation](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUser).
  - Added the `last_active_at_since` filtering parameter for the Users listing request. The new parameter can be used to retrieve users that have displayed session activity since the given date. For further details, please consult the [Backend API documentation](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUserList).
  - Added the `last_active_at` available options for the `orderBy` parameter of the Users listing request. For further details, please consult the [Backend API documentation](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUserList).
- a605335e1: Add support for NextJS 14
- 2964f8a47: Expose debug headers in response for handshake / signed-out states from SDKs using headers returned from `authenticateRequest()`
- 7af0949ae: Add missing `createdAt` param in `User#createUser()` of `@clerk/backend`.
  Fix `clerkClient.verifyToken()` signature to support a single `token: string` parameter.
- d08ec6d8f: Improve ESM support in `@clerk/backend` for Node by using .mjs for #crypto subpath import
- 03079579d: Expose `totalCount` from `@clerk/backend` client responses for responses
  containing pagination information or for responses with type `{ data: object[] }`.

  Example:

  ```typescript
  import { Clerk } from '@clerk/backend';

  const clerkClient = Clerk({ secretKey: '...' });

  // current
  const { data } = await clerkClient.organizations.getOrganizationList();
  console.log('totalCount: ', data.length);

  // new
  const { data, totalCount } = await clerkClient.organizations.getOrganizationList();
  console.log('totalCount: ', totalCount);
  ```

- c7e6d00f5: Experimental support for `<Gate/>` with role checks.
- 12962bc58: Re-use common pagination types for consistency across types.

  Types introduced in `@clerk/types`:

  - `ClerkPaginationRequest` : describes pagination related props in request payload
  - `ClerkPaginatedResponse` : describes pagination related props in response body
  - `ClerkPaginationParams` : describes pagination related props in api client method params

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

- 46040a2f3: Introduce Protect for authorization.
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
- 4aaf5103d: Deprecate `createSMSMessage` and `SMSMessageApi` from `clerkClient`.

  The equivalent `/sms_messages` Backend API endpoint will also be dropped in the future, since this feature will no longer be available for new instances.

  For a brief period it will still be accessible for instances that have used it in the past 7
  days (13-11-2023 to 20-11-2023).

  New instances will get a 403 forbidden response if they try to access it.

- 7f751c4ef: Add support for X/Twitter v2 OAuth provider
- 4fced88ac: Add `banUser` method to the User operations (accessible under `clerkClient.users`). Executes the [Ban a user](https://clerk.com/docs/reference/backend-api/tag/Users#operation/BanUser) backend API call.
- e7e2a1eae: Add `createOrganizationEnabled` param in `@clerk/backend` method `User.updateUser()`
  Example:

  ```typescript
      import { createClerkClient }  from '@clerk/backend';

      const clerkClient = createClerkClient({...});
      await clerkClient.users.updateUser('user_...', { createOrganizationEnabled: true })
  ```

- b4e79c1b9: Replace the `Clerk-Backend-SDK` header with `User-Agent` in BAPI requests and update it's value to contain both the package name and the package version of the clerk package
  executing the request. Eg request from `@clerk/nextjs` to BAPI with append `User-Agent: @clerk/nextjs@5.0.0-alpha-v5.16` using the latest version.

  Miscellaneous changes: The backend test build changed to use tsup.

- 142ded732: Add support for the `orderBy` parameter to the `getOrganizationList()` function

### Patch Changes

- 8c23651b8: Introduce `clerkClient.samlConnections` to expose `getSamlConnectionList`, `createSamlConnection`, `getSamlConnection`, `updateSamlConnection` and `deleteSamlConnection` endpoints. Introduce `SamlConnection` resource for BAPI.

  Example:

  ```
  import { clerkClient } from '@clerk/nextjs/server';
  const samlConnection = await clerkClient.samlConnections.getSamlConnectionList();
  ```

- f4f99f18d: `OrganizationMembershipRole` should respect authorization types provided by the developer if those exist.
- 9272006e7: Export the JSON types for clerk resources.
- a8901be64: Expose resources types
- 7b200af49: The `auth().redirectToSignIn()` helper no longer needs to be explicitly returned when called within the middleware. The following examples are now equivalent:

  ```js
  // Before
  export default clerkMiddleware(auth => {
    if (protectedRoute && !auth.user) {
      return auth().redirectToSignIn()
    }
  })

  // After
  export default clerkMiddleware(auth => {
    if (protectedRoute && !auth.user) {
      auth().redirectToSignIn()
    }
  })
  ```

  Calling `auth().protect()` from a page will now automatically redirect back to the same page by setting `redirect_url` to the request url before the redirect to the sign-in URL takes place.

- 988a299c0: Fix typo in `jwk-remote-missing` error message
- b3a3dcdf4: Add OrganizationRoleAPI for CRUD operations regarding instance level organization roles.
- 935b0886e: The `emails` endpoint helper and the corresponding `createEmail` method have been removed from the `@clerk/backend` SDK and `apiClint.emails.createEmail` will no longer be available.

  We will not be providing an alternative method for creating and sending emails directly from our JavaScript SDKs with this release. If you are currently using `createEmail` and you wish to update to the latest SDK version, please reach out to our support team (https://clerk.com/support) so we can assist you.

- 93d05c868: Drop the introduction of `OrganizationRole` and `OrganizationPermission` resources fro BAPI.
- 4aaf5103d: Remove createSms functions from @clerk/backend and @clerk/sdk-node.

  The equivalent /sms_messages Backend API endpoint will also dropped in the future, since this feature will no longer be available for new instances.

  For a brief period it will still be accessible for instances that have used it in the past 7
  days (13-11-2023 to 20-11-2023).

  New instances will get a 403 forbidden response if they try to access it.

- 2de442b24: Rename beta-v5 to beta
- 15af02a83: Remove `__dev_session` legacy query param used to pass the Dev Browser token in previous major version.
  This param will be visible only when using Account Portal with "Core 1" version.
- de6519daa: Added missing types for `clerkClient.invitations.createInvitation`
- e6ecbaa2f: Fix an error in the handshake flow where the request would throw an unhandled error when verification of the handshake payload fails.
- 6a769771c: Update README for v5
- 9e99eb727: Update `@clerk/nextjs` error messages to refer to `clerkMiddleware()` and deprecated `authMiddleware()` and fix a typo in `cannotRenderSignUpComponentWhenSessionExists` error message.
- 034c47ccb: Fix `clerkClient.organizations.getOrganizationMembershipList()` return type to be `{ data, totalCount }`
- 90aa2ea9c: Add `sha256` hasher support to PasswordHasher as described in [`Users#CreateUser`](https://clerk.com/docs/reference/backend-api/tag/Users#operation/CreateUser!path=password_hasher)
- 1e98187b4: Update the handshake flow to only trigger for document requests.
- 2e77cd737: Set correct information on required Node.js and React versions in README
- 63dfe8dc9: Resolve Vercel edge-runtime "TypeError: Failed to parse URL" when `@clerk/remix` is used
- e921af259: Replace enums with `as const` objects so `@clerk/backend` is consistent with the other packages
- c22cd5214: Fix type inferance for auth helper.
- 7cb1241a9: Trigger the handshake when no dev browser token exists in development.
- bad4de1a2: Fixed an issue where errors returned from backend api requests are not converted to camelCase.
- 66b283653: Fix infinite redirect loops for production instances with incorrect secret keys'
- f5d55bb1f: Add clerkTraceId to ClerkBackendApiResponse and ClerkAPIResponseError to allow for better tracing and debugging API error responses.
  Uses `clerk_trace_id` when available in a response and defaults to [`cf-ray` identifier](https://developers.cloudflare.com/fundamentals/reference/cloudflare-ray-id/) if missing.
- a6308c67e: Add the following properties to `users.updateUser(userId, params)` params:

  - `password_hasher`
  - `password_digest`
  - `publicMetadata`
  - `privateMetadata`
  - `unsafeMetadata`

- 0ce0edc28: Add OrganizationPermissionAPI for CRUD operations regarding instance level organization permissions.
- 051833167: fix(backend): Align types based on FAPI/BAPI structs
- e6fc58ae4: Introduce `debug: true` option for the `clerkMiddleware` helper
- a6451aece: Strip `experimental__has` from the auth object in `makeAuthObjectSerializable()`. This fixes an issue in Next.js where an error is being thrown when this function is passed to a client component as a prop.
- 987994909: Add support for `scrypt_werkzeug` in `UserAPI` `PasswordHasher`.
- 40ac4b645: Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry.
- 1bea9c200: Add missing pagination params types for `clerkClient.invitations.getInvitationList()`
- c2b982749: Preserve url protocol when joining paths.
- Updated dependencies [743c4d204]
- Updated dependencies [4b8bedc66]
- Updated dependencies [c2a090513]
- Updated dependencies [1834a3ee4]
- Updated dependencies [896cb6104]
- Updated dependencies [64d3763ec]
- Updated dependencies [8350109ab]
- Updated dependencies [1dc28ab46]
- Updated dependencies [83e9d0846]
- Updated dependencies [791c49807]
- Updated dependencies [ea4933655]
- Updated dependencies [a68eb3083]
- Updated dependencies [2de442b24]
- Updated dependencies [db18787c4]
- Updated dependencies [7f833da9e]
- Updated dependencies [ef2325dcc]
- Updated dependencies [fc3ffd880]
- Updated dependencies [bab2e7e05]
- Updated dependencies [71663c568]
- Updated dependencies [492b8a7b1]
- Updated dependencies [e5c989a03]
- Updated dependencies [7ecd6f6ab]
- Updated dependencies [12f3c5c55]
- Updated dependencies [c776f86fb]
- Updated dependencies [97407d8aa]
- Updated dependencies [5f58a2274]
- Updated dependencies [52ff8fe6b]
- Updated dependencies [8cc45d2af]
- Updated dependencies [97407d8aa]
- Updated dependencies [4bb57057e]
- Updated dependencies [d4ff346dd]
- Updated dependencies [7644b7472]
- Updated dependencies [2ec9f6b09]
- Updated dependencies [8daf8451c]
- Updated dependencies [75ea300bc]
- Updated dependencies [f5d55bb1f]
- Updated dependencies [0d1052ac2]
- Updated dependencies [d30ea1faa]
- Updated dependencies [1fd2eff38]
- Updated dependencies [5471c7e8d]
- Updated dependencies [38d8b3e8a]
- Updated dependencies [be991365e]
- Updated dependencies [8350f73a6]
- Updated dependencies [e0e79b4fe]
- Updated dependencies [fb794ce7b]
- Updated dependencies [40ac4b645]
- Updated dependencies [6f755addd]
- Updated dependencies [6eab66050]
  - @clerk/shared@2.0.0

## 1.0.0-beta.37

### Patch Changes

- Updated dependencies [[`bab2e7e05`](https://github.com/clerk/javascript/commit/bab2e7e0590d0da1fd7db0680e63e8f2eb836b41)]:
  - @clerk/shared@2.0.0-beta.23

## 1.0.0-beta.36

### Minor Changes

- Add support for the `orderBy` parameter to the `getOrganizationList()` function ([#3164](https://github.com/clerk/javascript/pull/3164)) by [@IGassmann](https://github.com/IGassmann)

### Patch Changes

- Introduce `debug: true` option for the `clerkMiddleware` helper ([#3189](https://github.com/clerk/javascript/pull/3189)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`fb794ce7b`](https://github.com/clerk/javascript/commit/fb794ce7b88001b98ad4a628bc2cc39a0c8ccfa5)]:
  - @clerk/shared@2.0.0-beta.22

## 1.0.0-beta.35

### Patch Changes

- Trigger the handshake when no dev browser token exists in development. ([#3175](https://github.com/clerk/javascript/pull/3175)) by [@BRKalow](https://github.com/BRKalow)

## 1.0.0-beta.34

### Minor Changes

- Implement token signature verification when passing verified token from Next.js middleware to the application origin. ([#3121](https://github.com/clerk/javascript/pull/3121)) by [@BRKalow](https://github.com/BRKalow)

## 1.0.0-beta.33

### Major Changes

- Rename property `members_count` to `membersCount` for `Organization` resource ([#3094](https://github.com/clerk/javascript/pull/3094)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Resolve Vercel edge-runtime "TypeError: Failed to parse URL" when `@clerk/remix` is used ([#3129](https://github.com/clerk/javascript/pull/3129)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.0.0-beta.32

### Patch Changes

- Add support for `scrypt_werkzeug` in `UserAPI` `PasswordHasher`. ([#3060](https://github.com/clerk/javascript/pull/3060)) by [@Nikpolik](https://github.com/Nikpolik)

- Add missing pagination params types for `clerkClient.invitations.getInvitationList()` ([#3079](https://github.com/clerk/javascript/pull/3079)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`fc3ffd880`](https://github.com/clerk/javascript/commit/fc3ffd88064a09ab98877dfba119150390f9296e), [`1fd2eff38`](https://github.com/clerk/javascript/commit/1fd2eff38dc71e45d2ff95a5b6e5a99cca53c6e7)]:
  - @clerk/shared@2.0.0-beta.21

## 1.0.0-beta.31

### Patch Changes

- Fix typo in `jwk-remote-missing` error message ([#3057](https://github.com/clerk/javascript/pull/3057)) by [@dimkl](https://github.com/dimkl)

## 1.0.0-beta.30

### Patch Changes

- Updated dependencies [[`8350109ab`](https://github.com/clerk/javascript/commit/8350109ab85909e0457199da1db0c9787d94001e)]:
  - @clerk/shared@2.0.0-beta.20

## 1.0.0-beta.29

### Minor Changes

- Add `external_account_id` to OAuth access token response ([#2982](https://github.com/clerk/javascript/pull/2982)) by [@kostaspt](https://github.com/kostaspt)

### Patch Changes

- Introduce `clerkClient.samlConnections` to expose `getSamlConnectionList`, `createSamlConnection`, `getSamlConnection`, `updateSamlConnection` and `deleteSamlConnection` endpoints. Introduce `SamlConnection` resource for BAPI. ([#2980](https://github.com/clerk/javascript/pull/2980)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

  Example:

  ```
  import { clerkClient } from '@clerk/nextjs/server';
  const samlConnection = await clerkClient.samlConnections.getSamlConnectionList();
  ```

- Export the JSON types for clerk resources. ([#2965](https://github.com/clerk/javascript/pull/2965)) by [@desiprisg](https://github.com/desiprisg)

- Fix infinite redirect loops for production instances with incorrect secret keys' ([#2994](https://github.com/clerk/javascript/pull/2994)) by [@dimkl](https://github.com/dimkl)

## 1.0.0-beta.28

### Minor Changes

- Expose debug headers in response for handshake / signed-out states from SDKs using headers returned from `authenticateRequest()` ([#2898](https://github.com/clerk/javascript/pull/2898)) by [@dimkl](https://github.com/dimkl)

## 1.0.0-beta.27

### Patch Changes

- Updated dependencies [[`8350f73a6`](https://github.com/clerk/javascript/commit/8350f73a67f8980be78e3bd3343e772f5653d718)]:
  - @clerk/shared@2.0.0-beta.19

## 1.0.0-beta.26

### Patch Changes

- Updated dependencies [[`e5c989a03`](https://github.com/clerk/javascript/commit/e5c989a035fa16413414c213febe16fcdbeef9b1), [`2ec9f6b09`](https://github.com/clerk/javascript/commit/2ec9f6b09f98ae276658d6dc705e16df0573d817)]:
  - @clerk/shared@2.0.0-beta.18

## 1.0.0-beta.25

### Patch Changes

- Remove `__dev_session` legacy query param used to pass the Dev Browser token in previous major version. ([#2883](https://github.com/clerk/javascript/pull/2883)) by [@dimkl](https://github.com/dimkl)

  This param will be visible only when using Account Portal with "Core 1" version.

- Updated dependencies [[`1834a3ee4`](https://github.com/clerk/javascript/commit/1834a3ee496ea27b9f7ceeb32ec5361f9de8ee30)]:
  - @clerk/shared@2.0.0-beta.17

## 1.0.0-beta.24

### Patch Changes

- Updated dependencies [[`db18787c4`](https://github.com/clerk/javascript/commit/db18787c4d9fa8ee1306db9b65f3b3f5e2fe2dad)]:
  - @clerk/shared@2.0.0-beta.16

## 1.0.0-beta.23

### Patch Changes

- Updated dependencies [[`6eab66050`](https://github.com/clerk/javascript/commit/6eab66050608a1bc5cb9aca6a234b1fea16106e5)]:
  - @clerk/shared@2.0.0-beta.15

## 1.0.0-beta.22

### Patch Changes

- Updated dependencies [[`12f3c5c55`](https://github.com/clerk/javascript/commit/12f3c5c55580f93a81df27851fbc92ce1312107e)]:
  - @clerk/shared@2.0.0-beta.14

## 1.0.0-beta.21

### Patch Changes

- fix(backend): Align types based on FAPI/BAPI structs ([#2818](https://github.com/clerk/javascript/pull/2818)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.0.0-beta.20

### Patch Changes

- Rename beta-v5 to beta by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`2de442b24`](https://github.com/clerk/javascript/commit/2de442b2465cc5d424b8a0b21aa57c557f3aa2e7)]:
  - @clerk/shared@2.0.0-beta.13

## 1.0.0-beta-v5.19

### Major Changes

- Make all listing API requests to return consistent `{ data: Resource[], totalCount: number }`. ([#2714](https://github.com/clerk/javascript/pull/2714)) by [@dimkl](https://github.com/dimkl)

  Support pagination request params `{ limit, offset }` to:

  - `sessions.getSessionList({ limit, offset })`
  - `clients.getClientList({ limit, offset })`

  Since the `users.getUserList()` does not return the `total_count` as a temporary solution that
  method will perform 2 BAPI requests:

  1. retrieve the data
  2. retrieve the total count (invokes `users.getCount()` internally)

### Minor Changes

- Add `unbanUser`, `lockUser`, and `unlockUser` methods to the UserAPI class. ([#2780](https://github.com/clerk/javascript/pull/2780)) by [@panteliselef](https://github.com/panteliselef)

- Add support for X/Twitter v2 OAuth provider ([#2690](https://github.com/clerk/javascript/pull/2690)) by [@kostaspt](https://github.com/kostaspt)

- Add `banUser` method to the User operations (accessible under `clerkClient.users`). Executes the [Ban a user](https://clerk.com/docs/reference/backend-api/tag/Users#operation/BanUser) backend API call. ([#2766](https://github.com/clerk/javascript/pull/2766)) by [@bartlenaerts](https://github.com/bartlenaerts)

### Patch Changes

- Expose resources types ([#2660](https://github.com/clerk/javascript/pull/2660)) by [@panteliselef](https://github.com/panteliselef)

- The `auth().redirectToSignIn()` helper no longer needs to be explicitly returned when called within the middleware. The following examples are now equivalent: ([#2691](https://github.com/clerk/javascript/pull/2691)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  ```js
  // Before
  export default clerkMiddleware(auth => {
    if (protectedRoute && !auth.user) {
      return auth().redirectToSignIn()
    }
  })

  // After
  export default clerkMiddleware(auth => {
    if (protectedRoute && !auth.user) {
      auth().redirectToSignIn()
    }
  })
  ```

  Calling `auth().protect()` from a page will now automatically redirect back to the same page by setting `redirect_url` to the request url before the redirect to the sign-in URL takes place.

- Fix `clerkClient.organizations.getOrganizationMembershipList()` return type to be `{ data, totalCount }` ([#2681](https://github.com/clerk/javascript/pull/2681)) by [@dimkl](https://github.com/dimkl)

- Preserve url protocol when joining paths. ([#2745](https://github.com/clerk/javascript/pull/2745)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`8daf8451c`](https://github.com/clerk/javascript/commit/8daf8451cb564bc834dd856174ffc2cdfa932e37), [`be991365e`](https://github.com/clerk/javascript/commit/be991365e1c78d0f1dfc59bb33dd533b6fad223a)]:
  - @clerk/shared@2.0.0-beta-v5.12

## 1.0.0-beta-v5.18

### Major Changes

- The following paginated APIs now return `{ data, totalCount }` instead of simple arrays, in order to make building paginated UIs easier: ([#2633](https://github.com/clerk/javascript/pull/2633)) by [@dimkl](https://github.com/dimkl)

  - `clerkClient.users.getOrganizationMembershipList(...)`
  - `clerkClient.organization.getOrganizationList(...)`
  - `clerkClient.organization.getOrganizationInvitationList(...)`

  Revert changing the `{ data, errors }` return value of the following helpers to throw the `errors` or return the `data` (keep v4 format):

  - `import { verifyToken } from '@clerk/backend'`
  - `import { signJwt, hasValidSignature, decodeJwt, verifyJwt } from '@clerk/backend/jwt'`
  - BAPI `clerkClient` methods eg (`clerkClient.users.getUserList(...)`)

### Patch Changes

- Add the following properties to `users.updateUser(userId, params)` params: ([#2619](https://github.com/clerk/javascript/pull/2619)) by [@SokratisVidros](https://github.com/SokratisVidros)

  - `password_hasher`
  - `password_digest`
  - `publicMetadata`
  - `privateMetadata`
  - `unsafeMetadata`

- Updated dependencies [[`d4ff346dd`](https://github.com/clerk/javascript/commit/d4ff346dd53bb3e1970e80bdc7b188c2dd344f12)]:
  - @clerk/shared@2.0.0-beta-v5.11

## 1.0.0-alpha-v5.17

### Major Changes

- Drop `user` / `organization` / `session` from auth object on **signed-out** state (current value was `null`). Eg ([#2598](https://github.com/clerk/javascript/pull/2598)) by [@dimkl](https://github.com/dimkl)

  ```diff
      // Backend
      import { createClerkClient } from '@clerk/backend';

      const clerkClient = createClerkClient({...});
      const requestState = clerkClient.authenticateRequest(request, {...});

      - const { user, organization, session } = requestState.toAuth();
      + const { userId, organizationId, sessionId } = requestState.toAuth();

      // Remix
      import { getAuth } from '@clerk/remix/ssr.server';

      - const { user, organization, session } = await getAuth(args);
      + const { userId, organizationId, sessionId } = await getAuth(args);

      // or
      rootAuthLoader(
          args,
          ({ request }) => {
              - const { user, organization, session } = request.auth;
              + const { userId, organizationId, sessionId } = request.auth;
              // ...
          },
          { loadUser: true },
      );

      // NextJS
      import { getAuth } from '@clerk/nextjs/server';

      - const { user, organization, session } = getAuth(args);
      + const { userId, organizationId, sessionId } = getAuth(req, opts);

      // Gatsby
      import { withServerAuth } from 'gatsby-plugin-clerk';

      export const getServerData: GetServerData<any> = withServerAuth(
          async props => {
              - const { user, organization, session } =  props;
              + const { userId, organizationId, sessionId } = props;
              return { props: { data: '1', auth: props.auth, userId, organizationId, sessionId } };
          },
          { loadUser: true },
      );
  ```

- Replace return the value of the following jwt helpers to match the format of backend API client return values (for consistency). ([#2596](https://github.com/clerk/javascript/pull/2596)) by [@dimkl](https://github.com/dimkl)

  ```diff
  import { signJwt } from '@clerk/backend/jwt';

  - const { data, error } = await signJwt(...);
  + const { data, errors: [error] = [] } = await signJwt(...);
  ```

  ```diff
  import { verifyJwt } from '@clerk/backend/jwt';

  - const { data, error } = await verifyJwt(...);
  + const { data, errors: [error] = [] } = await verifyJwt(...);
  ```

  ```diff
  import { hasValidSignature } from '@clerk/backend/jwt';

  - const { data, error } = await hasValidSignature(...);
  + const { data, errors: [error] = [] } = await hasValidSignature(...);
  ```

  ```diff
  import { decodeJwt } from '@clerk/backend/jwt';

  - const { data, error } = await decodeJwt(...);
  + const { data, errors: [error] = [] } = await decodeJwt(...);
  ```

  ```diff
  import { verifyToken } from '@clerk/backend';

  - const { data, error } = await verifyToken(...);
  + const { data, errors: [error] = [] } = await verifyToken(...);
  ```

### Patch Changes

- Update `@clerk/nextjs` error messages to refer to `clerkMiddleware()` and deprecated `authMiddleware()` and fix a typo in `cannotRenderSignUpComponentWhenSessionExists` error message. ([#2589](https://github.com/clerk/javascript/pull/2589)) by [@dimkl](https://github.com/dimkl)

## 1.0.0-alpha-v5.16

### Patch Changes

- The `emails` endpoint helper and the corresponding `createEmail` method have been removed from the `@clerk/backend` SDK and `apiClint.emails.createEmail` will no longer be available. ([#2548](https://github.com/clerk/javascript/pull/2548)) by [@Nikpolik](https://github.com/Nikpolik)

  We will not be providing an alternative method for creating and sending emails directly from our JavaScript SDKs with this release. If you are currently using `createEmail` and you wish to update to the latest SDK version, please reach out to our support team (https://clerk.com/support) so we can assist you.

- Update README for v5 ([#2577](https://github.com/clerk/javascript/pull/2577)) by [@LekoArts](https://github.com/LekoArts)

## 1.0.0-alpha-v5.15

### Major Changes

- Change `SessionApi.getToken()` to return consistent `{ data, errors }` return value ([#2539](https://github.com/clerk/javascript/pull/2539)) by [@dimkl](https://github.com/dimkl)

  and fix the `getToken()` from requestState to have the same return behavior as v4
  (return Promise<string> or throw error).
  This change fixes issues with `getToken()` in `@clerk/nextjs` / `@clerk/remix` / `@clerk/fastify` / `@clerk/sdk-node` / `gatsby-plugin-clerk`:

  Example:

  ```typescript
  import { getAuth } from '@clerk/nextjs/server';

  const { getToken } = await getAuth(...);
  const jwtString = await getToken(...);
  ```

  The change in `SessionApi.getToken()` return value is a breaking change, to keep the existing behavior use the following:

  ```typescript
  import { ClerkAPIResponseError } from '@clerk/shared/error';

  const response = await clerkClient.sessions.getToken(...);

  if (response.errors) {
      const { status, statusText, clerkTraceId } = response;
      const error = new ClerkAPIResponseError(statusText || '', {
          data: [],
          status: Number(status || ''),
          clerkTraceId,
      });
      error.errors = response.errors;

      throw error;
  }

  // the value of the v4 `clerkClient.sessions.getToken(...)`
  const jwtString = response.data.jwt;
  ```

### Minor Changes

- Replace the `Clerk-Backend-SDK` header with `User-Agent` in BAPI requests and update it's value to contain both the package name and the package version of the clerk package ([#2558](https://github.com/clerk/javascript/pull/2558)) by [@dimkl](https://github.com/dimkl)

  executing the request. Eg request from `@clerk/nextjs` to BAPI with append `User-Agent: @clerk/nextjs@5.0.0-alpha-v5.16` using the latest version.

  Miscellaneous changes: The backend test build changed to use tsup.

### Patch Changes

- Updated dependencies [[`8cc45d2af`](https://github.com/clerk/javascript/commit/8cc45d2af98320ccced3768fb039b86576e424a5)]:
  - @clerk/shared@2.0.0-alpha-v5.10

## 1.0.0-alpha-v5.14

### Minor Changes

- Add fullName, primaryEmailAddress, primaryPhoneNumber, primaryWeb3Wallet to User class. ([#2493](https://github.com/clerk/javascript/pull/2493)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Fix an error in the handshake flow where the request would throw an unhandled error when verification of the handshake payload fails. ([#2541](https://github.com/clerk/javascript/pull/2541)) by [@BRKalow](https://github.com/BRKalow)

- Replace enums with `as const` objects so `@clerk/backend` is consistent with the other packages ([#2516](https://github.com/clerk/javascript/pull/2516)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.0.0-alpha-v5.13

### Patch Changes

- Updated dependencies [[`1dc28ab46`](https://github.com/clerk/javascript/commit/1dc28ab46f6930074334be183c637ce7a81bebf7), [`ea4933655`](https://github.com/clerk/javascript/commit/ea4933655863ce315324aa2a3be7d5f263c2b61f), [`38d8b3e8a`](https://github.com/clerk/javascript/commit/38d8b3e8a0387bcf0b9c8d16e3bbfcfe9b643ca2)]:
  - @clerk/shared@2.0.0-alpha-v5.9

## 1.0.0-alpha-v5.12

### Patch Changes

- Updated dependencies [[`7ecd6f6ab`](https://github.com/clerk/javascript/commit/7ecd6f6abb0e5bfb1a57c99cc11860de311c3e82)]:
  - @clerk/shared@2.0.0-alpha-v5.8

## 1.0.0-alpha-v5.11

### Minor Changes

- Add `createOrganizationEnabled` param in `@clerk/backend` method `User.updateUser()` ([#2415](https://github.com/clerk/javascript/pull/2415)) by [@dimkl](https://github.com/dimkl)

  Example:

  ```typescript
      import { createClerkClient }  from '@clerk/backend';

      const clerkClient = createClerkClient({...});
      await clerkClient.users.updateUser('user_...', { createOrganizationEnabled: true })
  ```

### Patch Changes

- `OrganizationMembershipRole` should respect authorization types provided by the developer if those exist. ([#2408](https://github.com/clerk/javascript/pull/2408)) by [@panteliselef](https://github.com/panteliselef)

- Fixed an issue where errors returned from backend api requests are not converted to camelCase. ([#2423](https://github.com/clerk/javascript/pull/2423)) by [@Nikpolik](https://github.com/Nikpolik)

## 1.0.0-alpha-v5.10

### Major Changes

- Change return value of `verifyToken()` from `@clerk/backend` to `{ data, error}`. ([#2377](https://github.com/clerk/javascript/pull/2377)) by [@dimkl](https://github.com/dimkl)

  To replicate the current behaviour use this:

  ```typescript
  import { verifyToken } from '@clerk/backend'

  const { data, error }  = await verifyToken(...);
  if(error){
      throw error;
  }
  ```

- Change return values of `signJwt`, `hasValidSignature`, `decodeJwt`, `verifyJwt` ([#2377](https://github.com/clerk/javascript/pull/2377)) by [@dimkl](https://github.com/dimkl)

  to return `{ data, error }`. Example of keeping the same behavior using those utilities:

  ```typescript
  import { signJwt, hasValidSignature, decodeJwt, verifyJwt } from '@clerk/backend/jwt';

  const { data, error } = await signJwt(...)
  if (error) throw error;

  const { data, error } = await hasValidSignature(...)
  if (error) throw error;

  const { data, error } = decodeJwt(...)
  if (error) throw error;

  const { data, error } = await verifyJwt(...)
  if (error) throw error;
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

- Improve ESM support in `@clerk/backend` for Node by using .mjs for #crypto subpath import ([#2360](https://github.com/clerk/javascript/pull/2360)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Update the handshake flow to only trigger for document requests. ([#2352](https://github.com/clerk/javascript/pull/2352)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e)]:
  - @clerk/shared@2.0.0-alpha-v5.7

## 1.0.0-alpha-v5.9

### Major Changes

- Drop unused SearchParams.AuthStatus constant ([#2347](https://github.com/clerk/javascript/pull/2347)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.0.0-alpha-v5.8

### Major Changes

- Remove the named `Clerk` import from `@clerk/backend` and import `createClerkClient` instead. The latter is a factory method that will create a Clerk client instance for you. This aligns usage across our SDKs and will enable us to better ship DX improvements in the future. ([#2317](https://github.com/clerk/javascript/pull/2317)) by [@tmilewski](https://github.com/tmilewski)

  Inside your code, search for occurrences like these:

  ```js
  import { Clerk } from '@clerk/backend';
  const clerk = Clerk({ secretKey: '...' });
  ```

  You need to rename the import from `Clerk` to `createClerkClient` and change its usage:

  ```js
  import { createClerkClient } from '@clerk/backend';
  const clerk = createClerkClient({ secretKey: '...' });
  ```

- - Refactor the `authenticateRequest()` flow to use the new client handshake endpoint. This replaces the previous "interstitial"-based flow. This should improve performance and overall reliability of Clerk's server-side request authentication functionality. ([#2300](https://github.com/clerk/javascript/pull/2300)) by [@BRKalow](https://github.com/BRKalow)

  - `authenticateRequest()` now accepts two arguments, a `Request` object to authenticate and options:
    ```ts
    authenticateRequest(new Request(...), { secretKey: '...' })
    ```

### Minor Changes

- Introduce Protect for authorization. ([#2170](https://github.com/clerk/javascript/pull/2170)) by [@panteliselef](https://github.com/panteliselef)

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

- Updated dependencies [[`896cb6104`](https://github.com/clerk/javascript/commit/896cb610409f84c0ff7a4f502f0b4ccee1afc157), [`75ea300bc`](https://github.com/clerk/javascript/commit/75ea300bce16a0ce401a225263bb267ad2a217b8)]:
  - @clerk/shared@2.0.0-alpha-v5.6

## 1.0.0-alpha-v5.7

### Major Changes

- Limit TokenVerificationError exports to TokenVerificationError and TokenVerificationErrorReason ([#2189](https://github.com/clerk/javascript/pull/2189)) by [@tmilewski](https://github.com/tmilewski)

### Minor Changes

- Add missing `createdAt` param in `User#createUser()` of `@clerk/backend`. ([#2284](https://github.com/clerk/javascript/pull/2284)) by [@dimkl](https://github.com/dimkl)

  Fix `clerkClient.verifyToken()` signature to support a single `token: string` parameter.

### Patch Changes

- Added missing types for `clerkClient.invitations.createInvitation` ([#2268](https://github.com/clerk/javascript/pull/2268)) by [@royanger](https://github.com/royanger)

## 1.0.0-alpha-v5.6

### Minor Changes

- - Added the `User.last_active_at` timestamp field which stores the latest date of session activity, with day precision. For further details, please consult the [Backend API documentation](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUser). ([#2261](https://github.com/clerk/javascript/pull/2261)) by [@georgepsarakis](https://github.com/georgepsarakis)

  - Added the `last_active_at_since` filtering parameter for the Users listing request. The new parameter can be used to retrieve users that have displayed session activity since the given date. For further details, please consult the [Backend API documentation](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUserList).
  - Added the `last_active_at` available options for the `orderBy` parameter of the Users listing request. For further details, please consult the [Backend API documentation](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUserList).

### Patch Changes

- Drop the introduction of `OrganizationRole` and `OrganizationPermission` resources fro BAPI. ([#2252](https://github.com/clerk/javascript/pull/2252)) by [@panteliselef](https://github.com/panteliselef)

- Set correct information on required Node.js and React versions in README ([#2264](https://github.com/clerk/javascript/pull/2264)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`d30ea1faa`](https://github.com/clerk/javascript/commit/d30ea1faa45074e09c037530e8ba3ca2dbd50654)]:
  - @clerk/shared@2.0.0-alpha-v5.5

## 1.0.0-alpha-v5.5

### Patch Changes

- Updated dependencies [[`4b8bedc66`](https://github.com/clerk/javascript/commit/4b8bedc66d47dca5c6192148f4b31ae6d49ff733), [`c776f86fb`](https://github.com/clerk/javascript/commit/c776f86fb2a999dcae46fda9abb5005718c354b2)]:
  - @clerk/shared@2.0.0-alpha-v5.4

## 1.0.0-alpha-v5.4

### Minor Changes

- Expose `totalCount` from `@clerk/backend` client responses for responses ([#2199](https://github.com/clerk/javascript/pull/2199)) by [@dimkl](https://github.com/dimkl)

  containing pagination information or for responses with type `{ data: object[] }`.

  Example:

  ```typescript
  import { Clerk } from '@clerk/backend';

  const clerkClient = Clerk({ secretKey: '...' });

  // current
  const { data } = await clerkClient.organizations.getOrganizationList();
  console.log('totalCount: ', data.length);

  // new
  const { data, totalCount } = await clerkClient.organizations.getOrganizationList();
  console.log('totalCount: ', totalCount);
  ```

- Re-use common pagination types for consistency across types. ([#2210](https://github.com/clerk/javascript/pull/2210)) by [@dimkl](https://github.com/dimkl)

  Types introduced in `@clerk/types`:

  - `ClerkPaginationRequest` : describes pagination related props in request payload
  - `ClerkPaginatedResponse` : describes pagination related props in response body
  - `ClerkPaginationParams` : describes pagination related props in api client method params

## 1.0.0-alpha-v5.3

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

- Deprecate `createSMSMessage` and `SMSMessageApi` from `clerkClient`. ([#2165](https://github.com/clerk/javascript/pull/2165)) by [@Nikpolik](https://github.com/Nikpolik)

  The equivalent `/sms_messages` Backend API endpoint will also be dropped in the future, since this feature will no longer be available for new instances.

  For a brief period it will still be accessible for instances that have used it in the past 7
  days (13-11-2023 to 20-11-2023).

  New instances will get a 403 forbidden response if they try to access it.

### Patch Changes

- Add OrganizationRoleAPI for CRUD operations regarding instance level organization roles. ([#2177](https://github.com/clerk/javascript/pull/2177)) by [@panteliselef](https://github.com/panteliselef)

- Remove createSms functions from @clerk/backend and @clerk/sdk-node. ([#2165](https://github.com/clerk/javascript/pull/2165)) by [@Nikpolik](https://github.com/Nikpolik)

  The equivalent /sms_messages Backend API endpoint will also dropped in the future, since this feature will no longer be available for new instances.

  For a brief period it will still be accessible for instances that have used it in the past 7
  days (13-11-2023 to 20-11-2023).

  New instances will get a 403 forbidden response if they try to access it.

- Add OrganizationPermissionAPI for CRUD operations regarding instance level organization permissions. ([#2178](https://github.com/clerk/javascript/pull/2178)) by [@panteliselef](https://github.com/panteliselef)

- Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry. ([#2154](https://github.com/clerk/javascript/pull/2154)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`52ff8fe6b`](https://github.com/clerk/javascript/commit/52ff8fe6b6ff88ceb5e1246378b54b0565bede9d), [`4bb57057e`](https://github.com/clerk/javascript/commit/4bb57057e9af20fc433626ed178d97d3ca811362), [`40ac4b645`](https://github.com/clerk/javascript/commit/40ac4b645f449b546dae5b4c0d013c9d9ea6d09c)]:
  - @clerk/shared@2.0.0-alpha-v5.3

## 1.0.0-alpha-v5.2

### Major Changes

- Change the minimal Node.js version required by Clerk to `18.17.0`. ([#2162](https://github.com/clerk/javascript/pull/2162)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`c2a090513`](https://github.com/clerk/javascript/commit/c2a0905132684a4a1e8d598b66caddf20062273e)]:
  - @clerk/shared@2.0.0-alpha-v5.2

## 1.0.0-alpha-v5.1

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
    throw new ClerkAPIResponseError(statusText, {
      data: errors,
      status,
      clerkTraceId,
    });
  }
  ```

- Enforce passing `request` param to `authenticateRequest` method of `@clerk/backend` ([#2122](https://github.com/clerk/javascript/pull/2122)) by [@dimkl](https://github.com/dimkl)

  instead of passing each header or cookie related option that is used internally to
  determine the request state.

  Migration guide:

  - use `request` param in `clerkClient.authenticateRequest()` instead of:
    - `origin`
    - `host`
    - `forwardedHost`
    - `forwardedProto`
    - `referrer`
    - `userAgent`
    - `cookieToken`
    - `clientUat`
    - `headerToken`
    - `searchParams`

  Example

  ```typescript
  //
  // current
  //
  import { clerkClient } from '@clerk/backend'

  const requestState = await clerkClient.authenticateRequest({
      secretKey: 'sk_....'
      publishableKey: 'pk_....'
      origin: req.headers.get('origin'),
      host: req.headers.get('host'),
      forwardedHost: req.headers.get('x-forwarded-host'),
      forwardedProto: req.headers.get('x-forwarded-proto'),
      referrer: req.headers.get('referer'),
      userAgent: req.headers.get('user-agent'),
      clientUat: req.cookies.get('__client_uat'),
      cookieToken: req.cookies.get('__session'),
      headerToken: req.headers.get('authorization'),
      searchParams: req.searchParams
  });

  //
  // new
  //
  import { clerkClient,  } from '@clerk/backend'

  // use req (if it's a fetch#Request instance) or use `createIsomorphicRequest` from `@clerk/backend`
  // to re-construct fetch#Request instance
  const requestState = await clerkClient.authenticateRequest({
      secretKey: 'sk_....'
      publishableKey: 'pk_....'
      request: req
  });

  ```

- Drop deprecated properties. Migration steps: ([#1899](https://github.com/clerk/javascript/pull/1899)) by [@dimkl](https://github.com/dimkl)

  - use `createClerkClient` instead of `__unstable_options`
  - use `publishableKey` instead of `frontendApi`
  - use `clockSkewInMs` instead of `clockSkewInSeconds`
  - use `apiKey` instead of `secretKey`
  - drop `httpOptions`
  - use `*.image` instead of
    - `ExternalAccount.picture`
    - `ExternalAccountJSON.avatar_url`
    - `Organization.logoUrl`
    - `OrganizationJSON.logo_url`
    - `User.profileImageUrl`
    - `UserJSON.profile_image_url`
    - `OrganizationMembershipPublicUserData.profileImageUrl`
    - `OrganizationMembershipPublicUserDataJSON.profile_image_url`
  - drop `pkgVersion`
  - use `Organization.getOrganizationInvitationList` with `status` instead of `getPendingOrganizationInvitationList`
  - drop `orgs` claim (if required, can be manually added by using `user.organizations` in a jwt template)
  - use `localInterstitial` instead of `remotePublicInterstitial` / `remotePublicInterstitialUrl`

  Internal changes:

  - replaced error enum (and it's) `SetClerkSecretKeyOrAPIKey` with `SetClerkSecretKey`

### Patch Changes

- Strip `experimental__has` from the auth object in `makeAuthObjectSerializable()`. This fixes an issue in Next.js where an error is being thrown when this function is passed to a client component as a prop. ([#2101](https://github.com/clerk/javascript/pull/2101)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`64d3763ec`](https://github.com/clerk/javascript/commit/64d3763ec73747ad04c4b47017195cf4114e150c), [`83e9d0846`](https://github.com/clerk/javascript/commit/83e9d08469e7c2840f06aa7d86831055e23f67a5), [`7f833da9e`](https://github.com/clerk/javascript/commit/7f833da9ebc1b2ec9c65513628c377d0584e5d72), [`492b8a7b1`](https://github.com/clerk/javascript/commit/492b8a7b12f14658a384566012e5807f0a171710), [`0d1052ac2`](https://github.com/clerk/javascript/commit/0d1052ac284b909786fd0e4744b02fcf4d1a8be6), [`5471c7e8d`](https://github.com/clerk/javascript/commit/5471c7e8dd0155348748fa90e5ae97093f59efe9), [`e0e79b4fe`](https://github.com/clerk/javascript/commit/e0e79b4fe47f64006718d547c898b9f67fe4d424)]:
  - @clerk/shared@2.0.0-alpha-v5.1

## 1.0.0-alpha-v5.0

### Major Changes

- Internal update default apiUrl domain from clerk.dev to clerk.com ([#1878](https://github.com/clerk/javascript/pull/1878)) by [@dimkl](https://github.com/dimkl)

- Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

### Minor Changes

- Added prefers-color-scheme to interstitial ([#1935](https://github.com/clerk/javascript/pull/1935)) by [@royanger](https://github.com/royanger)

- Add support for NextJS 14 ([#1968](https://github.com/clerk/javascript/pull/1968)) by [@dimkl](https://github.com/dimkl)

- Experimental support for `<Gate/>` with role checks. ([#1942](https://github.com/clerk/javascript/pull/1942)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Add `sha256` hasher support to PasswordHasher as described in [`Users#CreateUser`](https://clerk.com/docs/reference/backend-api/tag/Users#operation/CreateUser!path=password_hasher) ([#1941](https://github.com/clerk/javascript/pull/1941)) by [@MathieuNls](https://github.com/MathieuNls)

- Fix type inferance for auth helper. ([#2047](https://github.com/clerk/javascript/pull/2047)) by [@panteliselef](https://github.com/panteliselef)

- Add clerkTraceId to ClerkBackendApiResponse and ClerkAPIResponseError to allow for better tracing and debugging API error responses. ([#1986](https://github.com/clerk/javascript/pull/1986)) by [@Nikpolik](https://github.com/Nikpolik)

  Uses `clerk_trace_id` when available in a response and defaults to [`cf-ray` identifier](https://developers.cloudflare.com/fundamentals/reference/cloudflare-ray-id/) if missing.

- Updated dependencies [[`743c4d204`](https://github.com/clerk/javascript/commit/743c4d20423790b554e66923466081c0d3b0d9ed), [`791c49807`](https://github.com/clerk/javascript/commit/791c49807c3c9e19964cbf621c935d237caeecf3), [`a68eb3083`](https://github.com/clerk/javascript/commit/a68eb3083ff68459cd33098e2df190a5ba26c841), [`ef2325dcc`](https://github.com/clerk/javascript/commit/ef2325dcc18729e9ce9ee5823e9a963efa51dbc1), [`71663c568`](https://github.com/clerk/javascript/commit/71663c568926b1d60b97aa7ccc5298d05b618af2), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`7644b7472`](https://github.com/clerk/javascript/commit/7644b74726ba73e615a1256f9ff3fa03b0f8bc30), [`f5d55bb1f`](https://github.com/clerk/javascript/commit/f5d55bb1fc6a87303fb8bf461c3a917ae4da4005), [`6f755addd`](https://github.com/clerk/javascript/commit/6f755addd0886b9ff8b0d5dbe48e37470049acad)]:
  - @clerk/shared@2.0.0-alpha-v5.0

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
