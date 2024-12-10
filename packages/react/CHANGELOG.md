# Change Log

## 5.19.3

### Patch Changes

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/types@4.39.2
  - @clerk/shared@2.19.4

## 5.19.2

### Patch Changes

- Updated dependencies [[`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/types@4.39.1
  - @clerk/shared@2.19.3

## 5.19.1

### Patch Changes

- Updated dependencies [[`4cb22548da81dd8b186a6ef1cf120aea99c85c62`](https://github.com/clerk/javascript/commit/4cb22548da81dd8b186a6ef1cf120aea99c85c62)]:
  - @clerk/shared@2.19.2

## 5.19.0

### Minor Changes

- Various internal changes have been made to support a new feature called "Keyless mode". You'll be able to use this feature with Next.js and `@clerk/nextjs` initially. Read the `@clerk/nextjs` changelog to learn more. ([#4602](https://github.com/clerk/javascript/pull/4602)) by [@panteliselef](https://github.com/panteliselef)

  List of changes:

  - A new internal prop called `__internal_bypassMissingPublishableKey` has been added. Normally an error is thrown when the publishable key is missing, this disables this behavior.
  - Loading of `clerk-js` won't be attempted when a missing key is present
  - A new instance of `IsomorphicClerk` (an internal Clerk class) is created for each new publishable key

### Patch Changes

- Updated dependencies [[`550c7e9851329688e37be29b83ea0c3b12482af7`](https://github.com/clerk/javascript/commit/550c7e9851329688e37be29b83ea0c3b12482af7), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99)]:
  - @clerk/types@4.39.0
  - @clerk/shared@2.19.1

## 5.18.2

### Patch Changes

- Updated dependencies [[`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3), [`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3)]:
  - @clerk/shared@2.19.0
  - @clerk/types@4.38.0

## 5.18.1

### Patch Changes

- Updated dependencies [[`4e5e7f463c12893a21cb3b5f9317fc3f2945879b`](https://github.com/clerk/javascript/commit/4e5e7f463c12893a21cb3b5f9317fc3f2945879b)]:
  - @clerk/types@4.37.0
  - @clerk/shared@2.18.1

## 5.18.0

### Minor Changes

- Support OKW Wallet Web3 provider and authentication strategy ([#4696](https://github.com/clerk/javascript/pull/4696)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Updated dependencies [[`8ee5d84995fa17532491ff96efac5738c9bcd9ef`](https://github.com/clerk/javascript/commit/8ee5d84995fa17532491ff96efac5738c9bcd9ef), [`09fedd1df155d30cc055ce701b133aa6470e9b47`](https://github.com/clerk/javascript/commit/09fedd1df155d30cc055ce701b133aa6470e9b47), [`235eaae4c3c9400492fca47d20a47c7081041565`](https://github.com/clerk/javascript/commit/235eaae4c3c9400492fca47d20a47c7081041565)]:
  - @clerk/types@4.36.0
  - @clerk/shared@2.18.0

## 5.17.2

### Patch Changes

- Updated dependencies [[`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d)]:
  - @clerk/types@4.35.1
  - @clerk/shared@2.17.1

## 5.17.1

### Patch Changes

- Re-export `isClerkRuntimeError` from `@clerk/clerk-react/errors`. ([#4656](https://github.com/clerk/javascript/pull/4656)) by [@panteliselef](https://github.com/panteliselef)

- Add deprecation notices for the following components: ([#4631](https://github.com/clerk/javascript/pull/4631)) by [@alexcarpenter](https://github.com/alexcarpenter)

  - `RedirectToUserProfile`
  - `RedirectToOrganizationProfile`
  - `RedirectToCreateOrganization`

## 5.17.0

### Minor Changes

- Introduce the `useReverification()` hook that handles the session reverification flow: ([#4536](https://github.com/clerk/javascript/pull/4536)) by [@panteliselef](https://github.com/panteliselef)

  - Replaces `__experimental_useReverification` with `useReverification`

### Patch Changes

- Include **BUILD_DISABLE_RHC** to allow for builds which remove remotely hosted code as it is a requirement for browser extensions. ([#4133](https://github.com/clerk/javascript/pull/4133)) by [@tmilewski](https://github.com/tmilewski)

- Rename userVerification to reverification to align with the feature name. ([#4634](https://github.com/clerk/javascript/pull/4634)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`d84d7e31235c5c7da3415981dc76db4473a71a39`](https://github.com/clerk/javascript/commit/d84d7e31235c5c7da3415981dc76db4473a71a39), [`dce4f7ffca7248c0500f0ec9a978672b1f2fad69`](https://github.com/clerk/javascript/commit/dce4f7ffca7248c0500f0ec9a978672b1f2fad69)]:
  - @clerk/shared@2.17.0
  - @clerk/types@4.35.0

## 5.16.2

### Patch Changes

- Updated dependencies [[`c70994b5b6f92a6550dfe37547f01bbfa810c223`](https://github.com/clerk/javascript/commit/c70994b5b6f92a6550dfe37547f01bbfa810c223), [`7623a99594e7329200b6b374e483152d7679ce66`](https://github.com/clerk/javascript/commit/7623a99594e7329200b6b374e483152d7679ce66)]:
  - @clerk/types@4.34.2
  - @clerk/shared@2.16.1

## 5.16.1

### Patch Changes

- Share hook return types ([#4583](https://github.com/clerk/javascript/pull/4583)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`e47eb5882a7fd4a8dee25933c6644790d6ea3407`](https://github.com/clerk/javascript/commit/e47eb5882a7fd4a8dee25933c6644790d6ea3407), [`273d16cb0665d4d960838cb294dc356f41814745`](https://github.com/clerk/javascript/commit/273d16cb0665d4d960838cb294dc356f41814745), [`6b0961765e1f3d09679be4b163fa13ac7dd97191`](https://github.com/clerk/javascript/commit/6b0961765e1f3d09679be4b163fa13ac7dd97191)]:
  - @clerk/shared@2.16.0
  - @clerk/types@4.34.1

## 5.16.0

### Minor Changes

- Add `initialValues` option to `<SignInButton />` component. ([#4581](https://github.com/clerk/javascript/pull/4581)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Add `initialValues` option to `<SignUpButton />` component. ([#4567](https://github.com/clerk/javascript/pull/4567)) by [@alexcarpenter](https://github.com/alexcarpenter)

### Patch Changes

- Updated dependencies [[`536fa996ff84a545678a3036b28409824d1c00dd`](https://github.com/clerk/javascript/commit/536fa996ff84a545678a3036b28409824d1c00dd), [`b28c5e8bc44885bf6b1533df48e872ba90c387da`](https://github.com/clerk/javascript/commit/b28c5e8bc44885bf6b1533df48e872ba90c387da)]:
  - @clerk/shared@2.15.0

## 5.15.5

### Patch Changes

- Updated dependencies [[`46faeb6f59b19c963fb137c858347525b1cd9e19`](https://github.com/clerk/javascript/commit/46faeb6f59b19c963fb137c858347525b1cd9e19), [`ea6c52dd751abe38b350ee07f148652c24125e22`](https://github.com/clerk/javascript/commit/ea6c52dd751abe38b350ee07f148652c24125e22)]:
  - @clerk/shared@2.14.0
  - @clerk/types@4.34.0

## 5.15.4

### Patch Changes

- Updated dependencies [[`1c0b5001f7f975a2f3f54ad692526ecf7257847e`](https://github.com/clerk/javascript/commit/1c0b5001f7f975a2f3f54ad692526ecf7257847e), [`6217a3f7c94311d49f873214bd406961e0b8d6f7`](https://github.com/clerk/javascript/commit/6217a3f7c94311d49f873214bd406961e0b8d6f7), [`1783025cdb94c447028704c2121fa0b8af785904`](https://github.com/clerk/javascript/commit/1783025cdb94c447028704c2121fa0b8af785904)]:
  - @clerk/types@4.33.0
  - @clerk/shared@2.13.0

## 5.15.3

### Patch Changes

- Updated dependencies [[`7dbad4c5abd226d7b10941a626ead5d85b1a3f24`](https://github.com/clerk/javascript/commit/7dbad4c5abd226d7b10941a626ead5d85b1a3f24)]:
  - @clerk/types@4.32.0
  - @clerk/shared@2.12.1

## 5.15.2

### Patch Changes

- Updated dependencies [[`5a21de1f46df3642828dc27e4862263c9858da2b`](https://github.com/clerk/javascript/commit/5a21de1f46df3642828dc27e4862263c9858da2b), [`f7472e22877f62fc7f3c8d3efe409ff2276fb4a3`](https://github.com/clerk/javascript/commit/f7472e22877f62fc7f3c8d3efe409ff2276fb4a3), [`e199037b8f484abdeeb9fc24455a1b4b8c31c8dd`](https://github.com/clerk/javascript/commit/e199037b8f484abdeeb9fc24455a1b4b8c31c8dd), [`886e294a8d8c54b39cd5bda88d46b89eace3861e`](https://github.com/clerk/javascript/commit/886e294a8d8c54b39cd5bda88d46b89eace3861e), [`0e443ad7c76643420b50e5b169193e03f6ef79f9`](https://github.com/clerk/javascript/commit/0e443ad7c76643420b50e5b169193e03f6ef79f9), [`cc24c8145f1eea7fb91550f2c3e0bac3993e4320`](https://github.com/clerk/javascript/commit/cc24c8145f1eea7fb91550f2c3e0bac3993e4320)]:
  - @clerk/shared@2.12.0
  - @clerk/types@4.31.0

## 5.15.1

### Patch Changes

- Use shared `deriveState` function ([#4490](https://github.com/clerk/javascript/pull/4490)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`8a04ae47b8305f994b348301fd8134d5baf02943`](https://github.com/clerk/javascript/commit/8a04ae47b8305f994b348301fd8134d5baf02943)]:
  - @clerk/shared@2.11.5

## 5.15.0

### Minor Changes

- New Feature: Introduce the `<Waitlist />` component and the `waitlist` sign up mode. ([#4376](https://github.com/clerk/javascript/pull/4376)) by [@nikospapcom](https://github.com/nikospapcom)

  - Allow users to request access with an email address via the new `<Waitlist />` component.
  - Show `Join waitlist` prompt from `<SignIn />` component when mode is `waitlist`.
  - Appropriate the text in the Sign Up component when mode is `waitlist`.
  - Added `joinWaitlist()` method in `Clerk` singleton.
  - Added `redirectToWaitlist()` method in `Clerk` singleton to allow user to redirect to waitlist page.

### Patch Changes

- Expose internal `__internal_getOption` method from Clerk. ([#4456](https://github.com/clerk/javascript/pull/4456)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`d74a6a7c0f291104c6bba722a8c432814d7b336e`](https://github.com/clerk/javascript/commit/d74a6a7c0f291104c6bba722a8c432814d7b336e), [`1a0c8fe665869e732d3c800bde0f5219fce54301`](https://github.com/clerk/javascript/commit/1a0c8fe665869e732d3c800bde0f5219fce54301), [`0800fc3f1f4e1b6a1d13f5c02557001a283af6e8`](https://github.com/clerk/javascript/commit/0800fc3f1f4e1b6a1d13f5c02557001a283af6e8)]:
  - @clerk/types@4.30.0
  - @clerk/shared@2.11.4

## 5.14.3

### Patch Changes

- Updated dependencies [[`a7726cc12a824b278f6d2a37cb1901c38c5f70dc`](https://github.com/clerk/javascript/commit/a7726cc12a824b278f6d2a37cb1901c38c5f70dc)]:
  - @clerk/shared@2.11.3

## 5.14.0

### Minor Changes

- Introduce a new experimental hook called `useReverification` that makes it easy to handle reverification errors. ([#4362](https://github.com/clerk/javascript/pull/4362)) by [@panteliselef](https://github.com/panteliselef)

  It returns a high order function (HOF) and allows developers to wrap any function that triggers a fetch request which might fail due to a user's session verification status.
  When such error is returned, the recommended UX is to offer a way to the user to recover by re-verifying their credentials.
  This helper will automatically handle this flow in the developer's behalf, by displaying a modal the end-user can interact with.
  Upon completion, the original request that previously failed, will be retried (only once).

  Example with clerk-js methods.

  ```tsx
  import { __experimental_useReverification as useReverification } from '@clerk/nextjs';

  function DeleteAccount() {
    const { user } = useUser();
    const [deleteUserAccount] = useReverification(() => {
      if (!user) return;
      return user.delete();
    });

    return (
      <>
        <button
          onClick={async () => {
            await deleteUserAccount();
          }}
        >
          Delete account
        </button>
      </>
    );
  }
  ```

### Patch Changes

- Fix `signOutOptions` prop usage in `<SignOutButton />` component ([#4433](https://github.com/clerk/javascript/pull/4433)) by [@wobsoriano](https://github.com/wobsoriano)

- - Introduce `redirectUrl` property on `setActive` as a replacement for `beforeEmit`. ([#4312](https://github.com/clerk/javascript/pull/4312)) by [@issuedat](https://github.com/issuedat)

  - Deprecates `beforeEmit` property on `setActive`.

- Updates `useDerivedAuth()` to correctly derive `has()` from the available auth data. Fixes an issue when `useAuth()` is called during server-side rendering. ([#4421](https://github.com/clerk/javascript/pull/4421)) by [@BRKalow](https://github.com/BRKalow)

- Updating peerDependencies for correct ranges ([#4436](https://github.com/clerk/javascript/pull/4436)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`f875463da`](https://github.com/clerk/javascript/commit/f875463da9692f2d173b6d5388743cf720750ae3), [`5be7ca9fd`](https://github.com/clerk/javascript/commit/5be7ca9fd239c937cc88e20ce8f5bfc9f3b84f22), [`08c5a2add`](https://github.com/clerk/javascript/commit/08c5a2add6872c76e62fc0df06db723e3728452e), [`434b432f8`](https://github.com/clerk/javascript/commit/434b432f8c114825120eef0f2c278b8142ed1563)]:
  - @clerk/types@4.29.0
  - @clerk/shared@2.11.0

## 5.13.1

### Patch Changes

- Updated dependencies [[`3fdcdbf88`](https://github.com/clerk/javascript/commit/3fdcdbf88c38facf8b82563f634ec1b6604fd8e5)]:
  - @clerk/types@4.28.0
  - @clerk/shared@2.10.1

## 5.13.0

### Minor Changes

- Internal changes to support `<ClerkProvider dynamic>` ([#4366](https://github.com/clerk/javascript/pull/4366)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Updated dependencies [[`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc), [`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc)]:
  - @clerk/shared@2.10.0
  - @clerk/types@4.27.0

## 5.12.0

### Minor Changes

- Introducing experimental `asProvider`, `asStandalone`, and `<X.Outlet />` for `<UserButton />` and `<OrganizationSwitcher />` components. ([#4042](https://github.com/clerk/javascript/pull/4042)) by [@panteliselef](https://github.com/panteliselef)

  - `asProvider` converts `<UserButton />` and `<OrganizationSwitcher />` to a provider that defers rendering until `<Outlet />` is mounted.
  - `<Outlet />` also accepts a `asStandalone` prop. It will skip the trigger of these components and display only the UI which was previously inside the popover. This allows developers to create their own triggers.

  Example usage:

  ```tsx
  <UserButton
    __experimental_asProvider
    afterSignOutUrl='/'
  >
    <UserButton.UserProfilePage
      label='Custom Page'
      url='/custom-page'
    >
      <h1> This is my page available to all children </h1>
    </UserButton.UserProfilePage>
    <UserButton.__experimental_Outlet __experimental_asStandalone />
  </UserButton>
  ```

  ```tsx
  <OrganizationSwitcher
    __experimental_asProvider
    afterSignOutUrl='/'
  >
    <OrganizationSwitcher.OrganizationProfilePage
      label='Custom Page'
      url='/custom-page'
    >
      <h1> This is my page available to all children </h1>
    </OrganizationSwitcher.OrganizationProfilePage>
    <OrganizationSwitcher.__experimental_Outlet __experimental_asStandalone />
  </OrganizationSwitcher>
  ```

### Patch Changes

- Updated dependencies [[`e81d45b72`](https://github.com/clerk/javascript/commit/e81d45b72c81403c7c206dac5454de1fef6bec57), [`752ce9bfa`](https://github.com/clerk/javascript/commit/752ce9bfa47a8eebd38cd272eeb58ae26fea3371), [`99cdf9b67`](https://github.com/clerk/javascript/commit/99cdf9b67d1e99e66cc73d8a5bfce1f1f8df1b83), [`ce40ff6f0`](https://github.com/clerk/javascript/commit/ce40ff6f0d3bc79e33375be6dd5e03f140a07000), [`2102052c0`](https://github.com/clerk/javascript/commit/2102052c017065ab511339870fcebaa6719f2702)]:
  - @clerk/types@4.26.0
  - @clerk/shared@2.9.2

## 5.11.1

### Patch Changes

- Updated dependencies [[`d64e54c40`](https://github.com/clerk/javascript/commit/d64e54c40c9cf001b25e45a1b8939c9f7e80c6d6), [`2ba2fd148`](https://github.com/clerk/javascript/commit/2ba2fd1483b7561d7df9a1952ead0ee15e422131)]:
  - @clerk/shared@2.9.1
  - @clerk/types@4.25.1

## 5.11.0

### Minor Changes

- Rename `__experimental_assurance` to `__experimental_reverification`. ([#4268](https://github.com/clerk/javascript/pull/4268)) by [@panteliselef](https://github.com/panteliselef)

  - Supported levels are now are `firstFactor`, `secondFactor`, `multiFactor`.
  - Support maxAge is now replaced by maxAgeMinutes and afterMinutes depending on usage.
  - Introduced `____experimental_SessionVerificationTypes` that abstracts away the level and maxAge
    - Allowed values 'veryStrict' | 'strict' | 'moderate' | 'lax'

### Patch Changes

- Updated dependencies [[`fb932e5cf`](https://github.com/clerk/javascript/commit/fb932e5cf21315adf60bee0855b6bd5ee2ff9867)]:
  - @clerk/shared@2.9.0
  - @clerk/types@4.25.0

## 5.10.0

### Minor Changes

- Drop the experimental mounted variant of `UserVerification`. ([#4266](https://github.com/clerk/javascript/pull/4266)) by [@panteliselef](https://github.com/panteliselef)

  Removes:

  - `<__experimental_UserVerification/>`
  - `__experimental_mountUserVerification()`
  - `__experimental_unmountUserVerification()`

### Patch Changes

- Updated dependencies [[`f6fb8b53d`](https://github.com/clerk/javascript/commit/f6fb8b53d236863ad7eca576ee7a16cd33f3506b), [`4a8570590`](https://github.com/clerk/javascript/commit/4a857059059a02bb4f20893e08601e1e67babbed)]:
  - @clerk/types@4.24.0
  - @clerk/shared@2.8.5

## 5.9.4

### Patch Changes

- Updated dependencies [[`4749ed4c5`](https://github.com/clerk/javascript/commit/4749ed4c55a5ba5810451b8d436aad0d49829050), [`f1f17eaab`](https://github.com/clerk/javascript/commit/f1f17eaabed0dc4b7de405fb77d85503cf75ad33), [`2e35ac538`](https://github.com/clerk/javascript/commit/2e35ac53885f8008779940d41d1e804fa77ebfa9)]:
  - @clerk/types@4.23.0
  - @clerk/shared@2.8.4

## 5.9.3

### Patch Changes

- Updated dependencies [[`c9063853e`](https://github.com/clerk/javascript/commit/c9063853e538a4010f5d4e522a3da5abc80098a4), [`19d3808d4`](https://github.com/clerk/javascript/commit/19d3808d4672234944226d6709ec51214e8d6e1d), [`737bcbb0f`](https://github.com/clerk/javascript/commit/737bcbb0ffb5e2dcadbb02e8fc718fe8825c5842)]:
  - @clerk/types@4.22.0
  - @clerk/shared@2.8.3

## 5.9.2

### Patch Changes

- Improve JSDoc comments for some public API properties ([#4190](https://github.com/clerk/javascript/pull/4190)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`cb32aaf59`](https://github.com/clerk/javascript/commit/cb32aaf59d38dcd12e959f542782f71a87adf9c1), [`2e5c550e4`](https://github.com/clerk/javascript/commit/2e5c550e4aec61150c2a17fdcd4a0e1273cb50e7), [`6275c242c`](https://github.com/clerk/javascript/commit/6275c242cd8bcb6f7766934059967e0fe775a0c1), [`f9faaf031`](https://github.com/clerk/javascript/commit/f9faaf03100baf679c78e6c24877fbf3b60be529)]:
  - @clerk/shared@2.8.2
  - @clerk/types@4.21.1

## 5.9.1

### Patch Changes

- Updated dependencies [[`3743eb911`](https://github.com/clerk/javascript/commit/3743eb9114733f20ed56a863ab98fa9c363b6723)]:
  - @clerk/shared@2.8.1

## 5.9.0

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

- Updated dependencies [[`ba19be354`](https://github.com/clerk/javascript/commit/ba19be35461f0e5c76a58d11e4252a16781322c6), [`248142a6d`](https://github.com/clerk/javascript/commit/248142a6ded6ca937d0df7d628197f25228aadec), [`1189f71f8`](https://github.com/clerk/javascript/commit/1189f71f872f2683c12de5add5f154aeb953ca8d)]:
  - @clerk/shared@2.8.0
  - @clerk/types@4.21.0

## 5.8.2

### Patch Changes

- Updated dependencies [[`be3b119f8`](https://github.com/clerk/javascript/commit/be3b119f840d2ae74f4b75d717711d53ac0e5f54)]:
  - @clerk/shared@2.7.2

## 5.8.1

### Patch Changes

- Update type of `__experimental_factorVerificationAge` to be `[number, number] | null`. ([#4135](https://github.com/clerk/javascript/pull/4135)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`8c6909d46`](https://github.com/clerk/javascript/commit/8c6909d46328c943f1d464a28f1a324a27d0f3f1)]:
  - @clerk/types@4.20.1
  - @clerk/shared@2.7.1

## 5.8.0

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

- Improve JSDoc comments coverage on `<ClerkProvider>` properties ([#4098](https://github.com/clerk/javascript/pull/4098)) by [@LekoArts](https://github.com/LekoArts)

- Drop support for deprecated Coinbase Web3 provider ([#4092](https://github.com/clerk/javascript/pull/4092)) by [@chanioxaris](https://github.com/chanioxaris)

- Updated dependencies [[`c63a5adf0`](https://github.com/clerk/javascript/commit/c63a5adf0ba4b99252146f168318f51b709bb5dd), [`8823c21a2`](https://github.com/clerk/javascript/commit/8823c21a26bc81cbc3ed007908b1a9ea474bd343), [`95ac67a14`](https://github.com/clerk/javascript/commit/95ac67a143c263bef0c1f589728566ab8f95768d), [`a0cb062fa`](https://github.com/clerk/javascript/commit/a0cb062faa4d23bef7a577e5cc486f4c5efe6bfa), [`746b4ed5e`](https://github.com/clerk/javascript/commit/746b4ed5e2007505d5850a2a728484809474d7bf)]:
  - @clerk/types@4.20.0
  - @clerk/shared@2.7.0

## 5.7.0

### Minor Changes

- Add support for the Coinbase Wallet web3 provider and authentication strategy. The Coinbase Wallet provider handles both Coinbase Wallet extension and Smart Wallet ([#4082](https://github.com/clerk/javascript/pull/4082)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Updated dependencies [[`8a3b9f079`](https://github.com/clerk/javascript/commit/8a3b9f0793484b32dd609a5c80a194e62151d6ea), [`e95c28196`](https://github.com/clerk/javascript/commit/e95c2819675cea7963f2404e5f71f37ebed8d5e0)]:
  - @clerk/types@4.19.0
  - @clerk/shared@2.6.2

## 5.6.0

### Minor Changes

- Add `<__experimental_UserVerification />` component. This is an experimental feature and breaking changes can occur until it's marked as stable. ([#4016](https://github.com/clerk/javascript/pull/4016)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`82593173a`](https://github.com/clerk/javascript/commit/82593173aafbf6646e12c5779627cdcb138a1f27), [`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733)]:
  - @clerk/types@4.18.0
  - @clerk/shared@2.6.1

## 5.5.0

### Minor Changes

- Add support for Coinbase Wallet strategy during sign in/up flows. Users can now authenticate using their Coinbase Wallet browser extension in the same way as MetaMask ([#4052](https://github.com/clerk/javascript/pull/4052)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Tidy up and improve README ([#4053](https://github.com/clerk/javascript/pull/4053)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`58e6754ad`](https://github.com/clerk/javascript/commit/58e6754ad9f9a1244b023ce1f5e5f2c1c4eb20e7), [`13693018f`](https://github.com/clerk/javascript/commit/13693018f4f7ac5d224698aa730e20960896f68c), [`3aa63dc5a`](https://github.com/clerk/javascript/commit/3aa63dc5a48161cfe92d94093ef0c32efd401342), [`3304dcc0b`](https://github.com/clerk/javascript/commit/3304dcc0bc93a92a7f729f585c60ff91d2ae04f6)]:
  - @clerk/types@4.17.0
  - @clerk/shared@2.6.0

## 5.4.5

### Patch Changes

- Updated dependencies [[`c1389492d`](https://github.com/clerk/javascript/commit/c1389492d8b6a9292ab04889bf776c0f45e66845)]:
  - @clerk/types@4.16.0
  - @clerk/shared@2.5.5

## 5.4.4

### Patch Changes

- Updated dependencies [[`0158c774a`](https://github.com/clerk/javascript/commit/0158c774af2243a2cd13b55c4d6fae877178c961), [`8be1a7abc`](https://github.com/clerk/javascript/commit/8be1a7abc8849d7d59552011bd6b25bc917d51f5)]:
  - @clerk/types@4.15.1
  - @clerk/shared@2.5.4

## 5.4.3

### Patch Changes

- Fix multiple `addListener` method calls ([#4010](https://github.com/clerk/javascript/pull/4010)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`247b3fd75`](https://github.com/clerk/javascript/commit/247b3fd75042365dc9f950db056b76f9fadfdcf6)]:
  - @clerk/types@4.15.0
  - @clerk/shared@2.5.3

## 5.4.2

### Patch Changes

- Updated dependencies [[`dc0e1c33d`](https://github.com/clerk/javascript/commit/dc0e1c33d6844b028cb1ee11c3359b886d609f3c)]:
  - @clerk/types@4.14.0
  - @clerk/shared@2.5.2

## 5.4.1

### Patch Changes

- Introduce functions that can be reused across front-end SDKs ([#3849](https://github.com/clerk/javascript/pull/3849)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`7e0ced3da`](https://github.com/clerk/javascript/commit/7e0ced3da94f41056bc4445d163d3b615afb6ab1), [`b6f0613dc`](https://github.com/clerk/javascript/commit/b6f0613dc9d8b0bab41cfabbaa8621b126e3bdf5)]:
  - @clerk/shared@2.5.1
  - @clerk/types@4.13.1

## 5.4.0

### Minor Changes

- Add a `nonce` to clerk-js' script loading options. Also adds a `nonce` prop to `ClerkProvider`. This can be used to thread a nonce value through to the clerk-js script load to support apps using a `strict-dynamic` content security policy. For next.js applications, the nonce will be automatically pulled from the CSP header and threaded through without needing any props so long as the provider is server-rendered. ([#3858](https://github.com/clerk/javascript/pull/3858)) by [@jescalan](https://github.com/jescalan)

- Introduce `transferable` prop for `<SignIn />` to disable the automatic transfer of a sign in attempt to a sign up attempt when attempting to sign in with a social provider when the account does not exist. Also adds a `transferable` option to `Clerk.handleRedirectCallback()` with the same functionality. ([#3845](https://github.com/clerk/javascript/pull/3845)) by [@BRKalow](https://github.com/BRKalow)

### Patch Changes

- Updated dependencies [[`59d5f19d3`](https://github.com/clerk/javascript/commit/59d5f19d333bf4a35c244886e93b4368e215225c), [`4e6c94e3f`](https://github.com/clerk/javascript/commit/4e6c94e3f4cc92cbba8bddcd2b90fcc9cfb83763)]:
  - @clerk/shared@2.5.0
  - @clerk/types@4.13.0

## 5.3.3

### Patch Changes

- Updated dependencies [[`9b2aeacb3`](https://github.com/clerk/javascript/commit/9b2aeacb32fff7c300bda458636a1cc81a42ee7b)]:
  - @clerk/types@4.12.1
  - @clerk/shared@2.4.5

## 5.3.2

### Patch Changes

- Updated dependencies [[`7e94fcf0f`](https://github.com/clerk/javascript/commit/7e94fcf0fcbee8842a54f7931c45190370aa870d)]:
  - @clerk/types@4.12.0
  - @clerk/shared@2.4.4

## 5.3.1

### Patch Changes

- Updated dependencies [[`568186cad`](https://github.com/clerk/javascript/commit/568186cad29acaf0b084a9f86ccb9d29bd23fcf4), [`407195270`](https://github.com/clerk/javascript/commit/407195270ed8aab6eef18c64a4918e3870fef471)]:
  - @clerk/types@4.11.0
  - @clerk/shared@2.4.3

## 5.3.0

### Minor Changes

- Introduce support for custom menu items in `<UserButton/>`. ([#3784](https://github.com/clerk/javascript/pull/3784)) by [@nikospapcom](https://github.com/nikospapcom)

  - Use `<UserButton.MenuItems>` as a child component to wrap custom menu items.
  - Use `<UserButton.Link/>` for creating external or internal links.
  - Use `<UserButton.Action/>` for opening a specific custom page of "UserProfile" or to trigger your own custom logic via `onClick`.
  - If needed, reorder existing items like `manageAccount` and `signOut`

  New usage example:

  ```jsx
  <UserButton>
    <UserButton.MenuItems>
      <UserButton.Link
        label='Terms'
        labelIcon={<Icon />}
        href='/terms'
      />
      <UserButton.Action
        label='Help'
        labelIcon={<Icon />}
        open='help'
      />{' '}
      // Navigate to `/help` page when UserProfile opens as a modal. (Requires a custom page to have been set in
      `/help`)
      <UserButton.Action
        label='manageAccount'
        labelIcon={<Icon />}
      />
      <UserButton.Action
        label='Chat Modal'
        labelIcon={<Icon />}
        onClick={() => setModal(true)}
      />
    </UserButton.MenuItems>
  </UserButton>
  ```

### Patch Changes

- Updated dependencies [[`aa06f3ba7`](https://github.com/clerk/javascript/commit/aa06f3ba7e725071c90d4a1d6840060236da3c23), [`80e647731`](https://github.com/clerk/javascript/commit/80e64773135865434cf0e6c220e287397aa07937)]:
  - @clerk/types@4.10.0
  - @clerk/shared@2.4.2

## 5.2.10

### Patch Changes

- Updated dependencies [[`b48689705`](https://github.com/clerk/javascript/commit/b48689705f9fc2251d2f24addec7a0d0b1da0fe1)]:
  - @clerk/types@4.9.1
  - @clerk/shared@2.4.1

## 5.2.9

### Patch Changes

- Updated dependencies [[`b87f7b9e1`](https://github.com/clerk/javascript/commit/b87f7b9e163756fd43789bc7b7344d2eb24015ec), [`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`86c75e50c`](https://github.com/clerk/javascript/commit/86c75e50cba9c4efb480672f1b8c6a6fff4ef477)]:
  - @clerk/shared@2.4.0
  - @clerk/types@4.9.0

## 5.2.8

### Patch Changes

- Updated dependencies [[`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7)]:
  - @clerk/types@4.8.0
  - @clerk/shared@2.3.3

## 5.2.7

### Patch Changes

- Fix race condition on updating ClerkProvider props before ClerkJS has loaded ([#3655](https://github.com/clerk/javascript/pull/3655)) by [@anagstef](https://github.com/anagstef)

## 5.2.6

### Patch Changes

- Updated dependencies [[`d6b5006c4`](https://github.com/clerk/javascript/commit/d6b5006c4cc1b6f07bb3a6832b4ec6e65ea15814)]:
  - @clerk/types@4.7.0
  - @clerk/shared@2.3.2

## 5.2.5

### Patch Changes

- Updated dependencies [[`1273b04ec`](https://github.com/clerk/javascript/commit/1273b04ecf1866b59ef59a74abe31dbcc726da2c)]:
  - @clerk/types@4.6.1
  - @clerk/shared@2.3.1

## 5.2.4

### Patch Changes

- Updated dependencies [[`4ec3f63e2`](https://github.com/clerk/javascript/commit/4ec3f63e26d8d3725a7ba9bbf988a7776fe893ff)]:
  - @clerk/shared@2.3.0

## 5.2.3

### Patch Changes

- Update `SignUpButton` and `SignInButton` to respect `forceRedirect` and `fallbackRedirect` props. Previously, these were getting ignored and successful completions of the flows would fallback to the default redirect URL. ([#3508](https://github.com/clerk/javascript/pull/3508)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`86a27f693`](https://github.com/clerk/javascript/commit/86a27f6933de50c99b6bc354bf87ff5c2cfcaf38), [`02bed2e00`](https://github.com/clerk/javascript/commit/02bed2e00d3e0a4e1bb1698b13267faf6aeb31b3), [`73e5d61e2`](https://github.com/clerk/javascript/commit/73e5d61e21ab3f77f3c8343bc63da0626466c7ac), [`b8e46328d`](https://github.com/clerk/javascript/commit/b8e46328da874859c4928f19f924219cd6520b11)]:
  - @clerk/shared@2.2.2
  - @clerk/types@4.6.0

## 5.2.2

### Patch Changes

- Updated dependencies [[`4beb00672`](https://github.com/clerk/javascript/commit/4beb00672da64bafd67fbc98181c4c2649a9062c)]:
  - @clerk/types@4.5.1

## 5.2.1

### Patch Changes

- With the next major release, NextJS@15 will depend on `react` and `react-dom` v19, which is still in beta. We are updating our peer dependencies accordingly in order to accept `react` and `react-dom` @ `19.0.0-beta` ([#3428](https://github.com/clerk/javascript/pull/3428)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`ff31f7255`](https://github.com/clerk/javascript/commit/ff31f725541d82caaa9c13cf42cf15f8ce3992f4), [`0e48fc210`](https://github.com/clerk/javascript/commit/0e48fc210cf0b5852052a21494a05f6e723101f5)]:
  - @clerk/shared@2.2.1

## 5.2.0

### Minor Changes

- Add support for GoogleOneTap. New APIs listed: ([#3392](https://github.com/clerk/javascript/pull/3392)) by [@panteliselef](https://github.com/panteliselef)

  ### React component

  - `<GoogleOneTap/>`

  Customize the UX of the prompt

  ```tsx
  <GoogleOneTap
    cancelOnTapOutside={false}
    itpSupport={false}
    fedCmSupport={false}
  />
  ```

  ### Use the component from with Vanilla JS

  - `Clerk.openGoogleOneTap(props: GoogleOneTapProps)`
  - `Clerk.closeGoogleOneTap()`

  ### Low level APIs for custom flows

  - `await Clerk.authenticateWithGoogleOneTap({ token: 'xxxx'})`
  - `await Clerk.handleGoogleOneTapCallback()`

  We recommend using this two methods together in order and let Clerk to perform the correct redirections.

  ```tsx
  google.accounts.id.initialize({
    callback: async response => {
      const signInOrUp = await Clerk.authenticateWithGoogleOneTap({
        token: response.credential,
      });
      await Clerk.handleGoogleOneTapCallback(signInOrUp, {
        signInForceRedirectUrl: window.location.href,
      });
    },
  });
  ```

  In case you want to handle the redirection and session management yourself you can do so like this

  ```tsx
  google.accounts.id.initialize({
    callback: async response => {
      const signInOrUp = await Clerk.authenticateWithGoogleOneTap({
        token: response.credential,
      });
      if (signInOrUp.status === 'complete') {
        await Clerk.setActive({
          session: signInOrUp.createdSessionId,
        });
      }
    },
  });
  ```

### Patch Changes

- Updated dependencies [[`d6a9b3f5d`](https://github.com/clerk/javascript/commit/d6a9b3f5dd8c64b1bd49f74c3707eb01dcd6aff4), [`456b06849`](https://github.com/clerk/javascript/commit/456b068493b8679e1772819eea24d49aa1bc6556)]:
  - @clerk/types@4.5.0
  - @clerk/shared@2.2.0

## 5.1.0

### Minor Changes

- Replace mount with open for GoogleOneTap. New api is `__experimental_openGoogleOneTap`. ([#3379](https://github.com/clerk/javascript/pull/3379)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`3d790d5ea`](https://github.com/clerk/javascript/commit/3d790d5ea347a51ef16557c015c901a9f277effe)]:
  - @clerk/types@4.4.0

## 5.0.7

### Patch Changes

- Updated dependencies [[`eae0a32d5`](https://github.com/clerk/javascript/commit/eae0a32d5c9e97ccbfd96e001c2cac6bc753b5b3)]:
  - @clerk/types@4.3.1

## 5.0.6

### Patch Changes

- Updated dependencies [[`ec84d51e7`](https://github.com/clerk/javascript/commit/ec84d51e705370273ffb82a0d7c94d90ba3de874)]:
  - @clerk/shared@2.1.1

## 5.0.5

### Patch Changes

- Respect the `signInForceRedirectUrl`, `signInFallbackRedirectUrl`, `signUpForceRedirectUrl` and `signUpFallbackRedirectUrl` props passed to `SignInButton`, `SignUpButton` and the low-level `window.Clerk.buildSignInUrl` & `window.Clerk.buildSignUpUrl` methods. These props allow you to control the redirect behavior of the `SignIn` and `SignUp` components. For more information, refer to the [Custom Redirects](https://clerk.com/docs/guides/custom-redirects) guide. ([#3361](https://github.com/clerk/javascript/pull/3361)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`94197710a`](https://github.com/clerk/javascript/commit/94197710a70381c4f1c460948ef02cd2a70b88bb), [`b27ca8366`](https://github.com/clerk/javascript/commit/b27ca8366a1d6ec1d7ce4a5be5005f1b1b017c20)]:
  - @clerk/types@4.3.0
  - @clerk/shared@2.1.0

## 5.0.4

### Patch Changes

- Rename local `eslint-config-custom` package to `@clerk/eslint-config-custom` to avoid conflicts with previously published package. Removes `eslint-config-custom` from `@clerk/clerk-react`'s dependencies, as it should only be a development dependency. ([#3307](https://github.com/clerk/javascript/pull/3307)) by [@BRKalow](https://github.com/BRKalow)

- The following are all internal changes and not relevant to any end-user: ([#3341](https://github.com/clerk/javascript/pull/3341)) by [@LauraBeatris](https://github.com/LauraBeatris)

  Add telemetry events for `useSignIn`, `useSignUp`, `useOrganizations` and `useOrganizationList`

- Updated dependencies [[`1662aaae9`](https://github.com/clerk/javascript/commit/1662aaae965fcf36b13dba6b148e096ab6a1cd83), [`f70c885f7`](https://github.com/clerk/javascript/commit/f70c885f798f7ff513f6687f87c8a56daf26fa05), [`f5804a225`](https://github.com/clerk/javascript/commit/f5804a225e9d67cd315700f0ced0ff17b8b14e53)]:
  - @clerk/shared@2.0.2
  - @clerk/types@4.2.1

## 5.0.3

### Patch Changes

- Remove type from clerkjs script attributes that prevents the satellite apps from function properly. ([#3304](https://github.com/clerk/javascript/pull/3304)) by [@panteliselef](https://github.com/panteliselef)

## 5.0.2

### Patch Changes

- Remove deprecated `__clerk_frontend_api` from `Window` interface ([#3288](https://github.com/clerk/javascript/pull/3288)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`a78bc447c`](https://github.com/clerk/javascript/commit/a78bc447c1aabaa41bcbaa2a8fe3c48f31275574), [`c7d626292`](https://github.com/clerk/javascript/commit/c7d626292a9fd12ca0f1b31a1035e711b6e99531), [`19cd42434`](https://github.com/clerk/javascript/commit/19cd42434450e568998336bf6d705e475122abbc)]:
  - @clerk/shared@2.0.1
  - @clerk/types@4.2.0

## 5.0.1

### Patch Changes

- Updated dependencies [[`956d8792f`](https://github.com/clerk/javascript/commit/956d8792fefe9d6a89022f1e938149b25503ec7f)]:
  - @clerk/types@4.1.0

## 5.0.0

### Major Changes

- 2a67f729d: Replace the `signOutCallback` prop on the `<SignOutButton />` with `redirectUrl`. This aligns the API surface with other UI components provided by `@clerk/clerk-react`.

  If you previously used the `signOutCallback` prop to navigate to another page, you can migrate as shown below.

  Before:

  ```jsx
  import { SignOutButton } from '@clerk/clerk-react';

  export const Signout = () => {
    return (
      <SignOutButton
        signOutCallback={() => {
          window.location.href = '/your-path';
        }}
      >
        <button>Sign Out</button>
      </SignOutButton>
    );
  };
  ```

  After:

  ```jsx
  import { SignOutButton } from '@clerk/clerk-react';

  export const Signout = () => {
    return (
      <SignOutButton redirectUrl='/your-path'>
        <button>Sign Out</button>
      </SignOutButton>
    );
  };
  ```

- c2a090513: Change the minimal Node.js version required by Clerk to `18.17.0`.
- deac67c1c: Drop default exports from all packages. Migration guide:
  - use `import { Clerk } from '@clerk/backend';`
  - use `import { clerkInstance } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-js';`
  - use `import { Clerk } from '@clerk/clerk-js/headless';`
  - use `import { IsomorphicClerk } from '@clerk/clerk-react'`
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
- cfea3d9c0: Path-based routing is now the default routing strategy if the `path` prop is filled. Additionally, if the `path` and `routing` props are not filled, an error will be thrown.

  ```jsx

  // Without path or routing props, an error with be thrown
  <UserProfile />
  <CreateOrganization />
  <OrganizationProfile />
  <SignIn />
  <SignUp />

  // Alternative #1
  <UserProfile path="/whatever"/>
  <CreateOrganization path="/whatever"/>
  <OrganizationProfile path="/whatever"/>
  <SignIn path="/whatever"/>
  <SignUp path="/whatever"/>

  // Alternative #2
  <UserProfile routing="hash_or_virtual"/>
  <CreateOrganization routing="hash_or_virtual"/>
  <OrganizationProfile routing="hash_or_virtual"/>
  <SignIn routing="hash_or_virtual"/>
  <SignUp routing="hash_or_virtual"/>
  ```

- 7bffc47cb: Drop `Clerk.isReady(). Use `Clerk.loaded` instead.`
- 2a22aade8: Drop deprecations. Migration steps:
  - drop `orgs` jwt claim from session token
  - change type of `auth` param of `withServerAuth()` callback to `AuthObject` from `ServerSideAuth` in `gatsby-clerk-plugin`
    - use `auth.sessionClaims` instead of `auth.claims`
    - use `AuthObject` properties from `auth`
  - use `publishableKey` instead of `frontendApi`
  - use `ClerkProviderOptionsWrapper` type instead of `IsomorphicClerkOptions`
- 8aea39cd6: - Introduce `@clerk/clerk-react/errors` and `@clerk/clerk-react/internal` subpath exports to expose some internal utilities. Eg

  ````typescript
  // Before
  import { **internal**setErrorThrowerOptions } from '@clerk/clerk-react';
  // After
  import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';

      // Before
      import { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react';
      // After
      import { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react/errors';

      // Before
      import { MultisessionAppSupport } from '@clerk/clerk-react';
      // After
      import { MultisessionAppSupport } from '@clerk/clerk-react/internal';
      ```

  - Drop from the `@clerk/clerk-react` and all other clerk-react wrapper packages:
    - `__internal__setErrorThrowerOptions` internal utility (moved to /internal subpath)
    - `WithClerkProp` type
    - `MultisessionAppSupport` component (moved to /internal subpath)
    - `EmailLinkErrorCode` enum
  - Drop `StructureContext` and related errors to reduce to reduce code complexity since it seems that it was not being used.
  - Drop `withUser`, `WithUser`, `withClerk` HOFs and `WithClerk`, `withSession`, `WithSession` HOCs from the `@clerk/clerk-react`
    to reduce the export surface since it's trivial to implement if needed.

  ````

- 5f58a2274: Remove hashing and third-party cookie functionality related to development instance session syncing in favor of URL-based session syncing with query parameters.
- 5f58a2274: - `buildUrlWithAuth` no longer accepts an `options` argument.
- 52ff8fe6b: Upgrade React version to >=18 and add react-dom as peer dependency
  to fix issues with vite & rollup building.
- ab4eb56a5: Drop `redirectToHome` redirect method in favour of `redirectToAfterSignUp` or `redirectToAfterSignIn`.

  When the `<SignIn/>` and `<SignUp/>` components are rendered while a user is already logged in, they will now redirect to the configured `afterSignIn` and `afterSignUp` URLs, respectively. Previously, the redirect URL was set to the home URL configured in the dashboard.

- 97407d8aa: Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now.
- f5fb63cf1: Consolidate `afterSignOutOneUrl` & `afterSignOutAllUrl` to `afterSignOutUrl` and drop usage of Dashboard settings in ClerkJS components. The Dashboard settings should only apply to the Account Portal application.
- 477170962: Drop deprecations. Migration steps:
  - drop `formFieldLabel__emailAddress_phoneNumber` from localization keys
  - drop `formFieldLabel__phoneNumber_username` from localization keys
  - drop `formFieldLabel__emailAddress_phoneNumber_username` from localization keys
  - drop `formFieldInputPlaceholder__emailAddress_phoneNumber` from localization keys
  - drop `formFieldInputPlaceholder__phoneNumber_username` from localization keys
  - drop `formFieldInputPlaceholder__emailAddress_phoneNumber_username` from localization keys
  - use `title__connectionFailed` instead of `title__conectionFailed` from localization keys
  - use `actionLabel__connectionFailed` instead of `actionLabel__conectionFailed` from localization keys
  - use `headerTitle__members` instead of `headerTitle__active` from localization keys
  - use `headerTitle__invitations` instead of `headerTitle__invited` from localization keys
  - drop `createOrganization.subtitle` from localization keys
  - use `deDE` instead of `deDe` localization from `@clerk/localizations`
- 3c4209068: Drop deprecations. Migration steps:
  - use `setActive` instead of `setSession` from `useSessionList | useSignUp | useSignIn` hooks
  - use `publishableKey` instead of `frontendApi`
  - use `handleEmailLinkVerification` instead of `handleMagicLinkVerification` from `IsomorphicClerk`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`
- 844847e0b: Align return types for redirectTo\* methods in ClerkJS [SDK-1037]

  Breaking Changes:

  - `redirectToUserProfile` now returns `Promise<unknown>` instead of `void`
  - `redirectToOrganizationProfile` now returns `Promise<unknown>` instead of `void`
  - `redirectToCreateOrganization` now returns `Promise<unknown>` instead of `void`
  - `redirectToHome` now returns `Promise<unknown>` instead of `void`

### Minor Changes

- 7f6a64f43: - By default, all the components with routing will have the `routing` prop assigned as `'path'` by default when the `path` prop is filled.
  - The `<UserButton />` component will set the default value of the `userProfileMode` prop to `'navigation'` if the `userProfileUrl` prop is provided.
  - The `<OrganizationSwitcher />` component will have the `organizationProfileMode` and `createOrganizationMode` props assigned with `'navigation'` by default if the `organizationProfileUrl` and `createOrganizationUrl` props are filled accordingly.
- ff08fe237: Introduce experimental support for Google One Tap
  - React Component `<__experimental_GoogleOneTap/>`
  - JS `clerk.__experimental_mountGoogleOneTap(node,props)`
- c9e0f68af: Fix `@clerk/clerk-react` bundle output to resolve issues with vite / rollup ESM module imports.
  We have also used the `bundle` output to export a single index.ts and dropped the unnecessary
  published files / folders (eg `__tests__`).
- fe2607b6f: Remove MembershipRole. The type `MembershipRole` would always include the old role keys `admin`, `basic_member`, `guest_member`.
  If developers still depend on them after the introduction of custom roles, the can provide them as their custom types for authorization.

  ```ts
  // clerk.d.ts
  interface ClerkAuthorization {
    permission: '';
    role: 'admin' | 'basic_member' | 'guest_member';
  }
  ```

- c7e6d00f5: Experimental support for `<Gate/>` with role checks.
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

- 2e4a43017: Update `@clerk/clerk-js` and `@clerk/clerk-react` to support the following examples:

  ```typescript
  Clerk.signOut({ redirectUrl: '/' })

  <SignOutButton redirectUrl='/' />
  // uses Clerk.signOut({ redirectUrl: '/' })
  <UserButton afterSignOutUrl='/after' />
  // uses Clerk.signOut({ redirectUrl: '/after' })
  <ClerkProvider afterSignOutUrl='/after' />
  // uses Clerk.signOut({ redirectUrl: '/after' })
  ```

- f98e480b1: Speed up loading of clerk-js by using a `<script/>` tag when html is generated.
  This is supported during SSR, SSG in
  - Next.js Pages Router
  - Next.js App Router
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
- 18c0d015d: Pass environment into `sdkMetadata` in order to detect if production clerk-js is used by other sdks in dev mode. When it is log dev warning from clerk-js.
- d6a7ea61a: Update the TypeScript types of `<ClerkProvider />`. If you use the `routerPush` prop you're now required to also provide the `routerReplace` prop (or other way around). You can also not provide them at all since both props are optional.
- db2d82901: Apply the following changes to components with routing props:

  - default is `routing="path"` and `path` prop is required to be set via env or context
  - when `routing="hash"` or `routing="virtual"` is set the implicit (via env or context) `path` option is ignored
  - when `routing="hash"` or `routing="virtual"` then `path` prop is not allowed to be set

  Examples of components with routing props:

  - `<CreateOrganization />`
  - `<OrganizationProfile />`
  - `<SignIn />`
  - `<SignUp />`
  - `<UserProfile />`

### Patch Changes

- 6ac9e717a: Properly fire onLoad event when clerk-js is already loaded.
- 2de442b24: Rename beta-v5 to beta
- ee57f21ac: Export `EmailLinkErrorCode` from `/errors` module
- 2e77cd737: Set correct information on required Node.js and React versions in README
- ae3a6683a: Ignore `.test.ts` files for the build output. Should result in smaller bundle size.
- 6e54b1b59: Sync IsomorphicClerk with the clerk singleton and the LoadedClerk interface. IsomorphicClerk now extends from LoadedClerk.
- 8cc45d2af: Allow dynamic values components props, even if these values change after the components are rendered. For example, a `SignIn` component with a `redirectUrl` prop passed in will always respect the latest value of `redirectUrl`.
- 797e327e0: Replace internal logic of determining package tag & major version with [semver](https://www.npmjs.com/package/semver) in order to have a more robust solution
- c86f73be3: Introducing stricter types for custom pages for UserProfile and OrganizationProfile.
- 1affbb22a: Replace semver with custom regex in versionSelector
- 75ea300bc: Add `useAssertWrappedByClerkProvider` to internal code. If you use hooks like `useAuth` outside of the `<ClerkProvider />` context an error will be thrown. For example:

  ```shell
  @clerk/clerk-react: useAuth can only be used within the <ClerkProvider /> component
  ```

- e9841dd91: Fixes error thrown for missing path & routing props when path was passed from context.
  This change affects components `<SignIn />`, `<SignUp />` from `@clerk/nextjs` and `@clerk/remix`.
- 59f9a7296: Fixes error when path is passed from context and a routing strategy other than `path` is passed as a prop.
  This change affects components `<SignIn />`, `<SignUp />` from `@clerk/nextjs` and `@clerk/remix`.
- e0e79b4fe: Use the errorThrower shared utility when throwing errors
- fb794ce7b: Support older iOS 13.3 and 13.4 mobile devices
- 40ac4b645: Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry.
- Updated dependencies [743c4d204]
- Updated dependencies [4b8bedc66]
- Updated dependencies [1db1f4068]
- Updated dependencies [c2a090513]
- Updated dependencies [0d0b1d89a]
- Updated dependencies [1834a3ee4]
- Updated dependencies [896cb6104]
- Updated dependencies [64d3763ec]
- Updated dependencies [8350109ab]
- Updated dependencies [1dc28ab46]
- Updated dependencies [83e9d0846]
- Updated dependencies [d37d44a68]
- Updated dependencies [fe356eebd]
- Updated dependencies [791c49807]
- Updated dependencies [ea4933655]
- Updated dependencies [7f6a64f43]
- Updated dependencies [afec17953]
- Updated dependencies [0699fa496]
- Updated dependencies [a68eb3083]
- Updated dependencies [2de442b24]
- Updated dependencies [0293f29c8]
- Updated dependencies [5f58a2274]
- Updated dependencies [9180c8b80]
- Updated dependencies [db18787c4]
- Updated dependencies [7f833da9e]
- Updated dependencies [ef2325dcc]
- Updated dependencies [fc3ffd880]
- Updated dependencies [840636a14]
- Updated dependencies [bab2e7e05]
- Updated dependencies [71663c568]
- Updated dependencies [492b8a7b1]
- Updated dependencies [2352149f6]
- Updated dependencies [e5c989a03]
- Updated dependencies [ff08fe237]
- Updated dependencies [7ecd6f6ab]
- Updated dependencies [12f3c5c55]
- Updated dependencies [244de5ea3]
- Updated dependencies [c776f86fb]
- Updated dependencies [d9f265fcb]
- Updated dependencies [7bffc47cb]
- Updated dependencies [9737ef510]
- Updated dependencies [fafa76fb6]
- Updated dependencies [1f650f30a]
- Updated dependencies [97407d8aa]
- Updated dependencies [2a22aade8]
- Updated dependencies [69ce3e185]
- Updated dependencies [78fc5eec0]
- Updated dependencies [a9fe242be]
- Updated dependencies [5f58a2274]
- Updated dependencies [6a33709cc]
- Updated dependencies [52ff8fe6b]
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
- Updated dependencies [4bb57057e]
- Updated dependencies [d4ff346dd]
- Updated dependencies [7644b7472]
- Updated dependencies [2ec9f6b09]
- Updated dependencies [2e4a43017]
- Updated dependencies [5aab9f04a]
- Updated dependencies [46040a2f3]
- Updated dependencies [f00fd2dfe]
- Updated dependencies [8daf8451c]
- Updated dependencies [75ea300bc]
- Updated dependencies [9a1fe3728]
- Updated dependencies [7f751c4ef]
- Updated dependencies [f5d55bb1f]
- Updated dependencies [18c0d015d]
- Updated dependencies [0d1052ac2]
- Updated dependencies [d30ea1faa]
- Updated dependencies [7886ba89d]
- Updated dependencies [1fd2eff38]
- Updated dependencies [9a1fe3728]
- Updated dependencies [5471c7e8d]
- Updated dependencies [f540e9843]
- Updated dependencies [477170962]
- Updated dependencies [38d8b3e8a]
- Updated dependencies [be991365e]
- Updated dependencies [8350f73a6]
- Updated dependencies [d6a7ea61a]
- Updated dependencies [e0e79b4fe]
- Updated dependencies [41ae1d2f0]
- Updated dependencies [fb794ce7b]
- Updated dependencies [48ca40af9]
- Updated dependencies [94519aa33]
- Updated dependencies [ebf9be77f]
- Updated dependencies [008ac4217]
- Updated dependencies [40ac4b645]
- Updated dependencies [6f755addd]
- Updated dependencies [429d030f7]
- Updated dependencies [844847e0b]
- Updated dependencies [6eab66050]
  - @clerk/shared@2.0.0
  - @clerk/types@4.0.0

## 5.0.0-beta.41

### Patch Changes

- Updated dependencies [[`f00fd2dfe`](https://github.com/clerk/javascript/commit/f00fd2dfe309cfeac82a776cc006f2c21b6d7988)]:
  - @clerk/types@4.0.0-beta.30

## 5.0.0-beta.40

### Patch Changes

- Updated dependencies [[`bab2e7e05`](https://github.com/clerk/javascript/commit/bab2e7e0590d0da1fd7db0680e63e8f2eb836b41)]:
  - @clerk/shared@2.0.0-beta.23
  - @clerk/types@4.0.0-beta.29

## 5.0.0-beta.39

### Minor Changes

- Introduce experimental support for Google One Tap ([#3176](https://github.com/clerk/javascript/pull/3176)) by [@panteliselef](https://github.com/panteliselef)

  - React Component `<__experimental_GoogleOneTap/>`
  - JS `clerk.__experimental_mountGoogleOneTap(node,props)`

- Speed up loading of clerk-js by using a `<script/>` tag when html is generated. ([#3156](https://github.com/clerk/javascript/pull/3156)) by [@panteliselef](https://github.com/panteliselef)

  This is supported during SSR, SSG in

  - Next.js Pages Router
  - Next.js App Router

### Patch Changes

- Support older iOS 13.3 and 13.4 mobile devices ([#3188](https://github.com/clerk/javascript/pull/3188)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`ff08fe237`](https://github.com/clerk/javascript/commit/ff08fe237fa5a9ded04924b3c5821111836b49b6), [`d9f265fcb`](https://github.com/clerk/javascript/commit/d9f265fcb12b39301b9802e4787dc636ee28444f), [`fb794ce7b`](https://github.com/clerk/javascript/commit/fb794ce7b88001b98ad4a628bc2cc39a0c8ccfa5)]:
  - @clerk/types@4.0.0-beta.28
  - @clerk/shared@2.0.0-beta.22

## 5.0.0-beta.38

### Patch Changes

- Updated dependencies [[`94519aa33`](https://github.com/clerk/javascript/commit/94519aa33774c8d6e557ce47a00974ad7b194c5d)]:
  - @clerk/types@4.0.0-beta.27

## 5.0.0-beta.37

### Patch Changes

- Updated dependencies [[`0699fa496`](https://github.com/clerk/javascript/commit/0699fa49693dc7a8d3de8ba053c4f16a5c8431d0)]:
  - @clerk/types@4.0.0-beta.26

## 5.0.0-beta.36

### Patch Changes

- Updated dependencies [[`2352149f6`](https://github.com/clerk/javascript/commit/2352149f6ba9708095146a3087538faf2d4f161f)]:
  - @clerk/types@4.0.0-beta.25

## 5.0.0-beta.35

### Patch Changes

- Updated dependencies [[`9180c8b80`](https://github.com/clerk/javascript/commit/9180c8b80e0ad95c1a9e490e8201ffd089634a48), [`c6a5e0f5d`](https://github.com/clerk/javascript/commit/c6a5e0f5dbd9ec4a7b5657855e8a31bc8347d0a4)]:
  - @clerk/types@4.0.0-beta.24

## 5.0.0-beta.34

### Patch Changes

- Updated dependencies [[`fc3ffd880`](https://github.com/clerk/javascript/commit/fc3ffd88064a09ab98877dfba119150390f9296e), [`840636a14`](https://github.com/clerk/javascript/commit/840636a14537d4f6b810832e7662518ef4bd4500), [`1fd2eff38`](https://github.com/clerk/javascript/commit/1fd2eff38dc71e45d2ff95a5b6e5a99cca53c6e7), [`f540e9843`](https://github.com/clerk/javascript/commit/f540e98435c86298415552537e33164471298a5c)]:
  - @clerk/shared@2.0.0-beta.21
  - @clerk/types@4.0.0-beta.23

## 5.0.0-beta.33

### Patch Changes

- Updated dependencies [[`8350109ab`](https://github.com/clerk/javascript/commit/8350109ab85909e0457199da1db0c9787d94001e)]:
  - @clerk/shared@2.0.0-beta.20

## 5.0.0-beta.32

### Patch Changes

- Updated dependencies [[`afec17953`](https://github.com/clerk/javascript/commit/afec17953d1ae4ba39ee73e4383757694375524d)]:
  - @clerk/types@4.0.0-beta.22

## 5.0.0-beta.31

### Patch Changes

- Updated dependencies [[`0d0b1d89a`](https://github.com/clerk/javascript/commit/0d0b1d89a46d2418cb05a10940f4a399cbd8ffeb), [`1f650f30a`](https://github.com/clerk/javascript/commit/1f650f30a97939817b7b2f3cc6283e22dc431523), [`663243220`](https://github.com/clerk/javascript/commit/6632432208aa6ca507f33fa9ab79abaa40431be6), [`ebf9be77f`](https://github.com/clerk/javascript/commit/ebf9be77f17f8880541de67f66879324f68cf6bd)]:
  - @clerk/types@4.0.0-beta.21

## 5.0.0-beta.30

### Patch Changes

- Introducing stricter types for custom pages for UserProfile and OrganizationProfile. ([#2939](https://github.com/clerk/javascript/pull/2939)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`008ac4217`](https://github.com/clerk/javascript/commit/008ac4217bc648085b3caba92a4524c31cc0925b)]:
  - @clerk/types@4.0.0-beta.20

## 5.0.0-beta.29

### Patch Changes

- Updated dependencies [[`8350f73a6`](https://github.com/clerk/javascript/commit/8350f73a67f8980be78e3bd3343e772f5653d718)]:
  - @clerk/shared@2.0.0-beta.19

## 5.0.0-beta.28

### Patch Changes

- Updated dependencies [[`fafa76fb6`](https://github.com/clerk/javascript/commit/fafa76fb66585b5836cc79985f8bdf1d1b4dca97)]:
  - @clerk/types@4.0.0-beta.19

## 5.0.0-beta.27

### Patch Changes

- Updated dependencies [[`e5c989a03`](https://github.com/clerk/javascript/commit/e5c989a035fa16413414c213febe16fcdbeef9b1), [`2ec9f6b09`](https://github.com/clerk/javascript/commit/2ec9f6b09f98ae276658d6dc705e16df0573d817)]:
  - @clerk/shared@2.0.0-beta.18

## 5.0.0-beta.26

### Minor Changes

- Pass environment into `sdkMetadata` in order to detect if production clerk-js is used by other sdks in dev mode. When it is log dev warning from clerk-js. ([#2802](https://github.com/clerk/javascript/pull/2802)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`18c0d015d`](https://github.com/clerk/javascript/commit/18c0d015d20493e14049fed73a5b6f732372a5cf)]:
  - @clerk/types@4.0.0-beta.18

## 5.0.0-beta.25

### Patch Changes

- Updated dependencies [[`fe356eebd`](https://github.com/clerk/javascript/commit/fe356eebd8ff527133e0818cf664e7def577cccc)]:
  - @clerk/types@4.0.0-beta.17

## 5.0.0-beta.24

### Patch Changes

- Updated dependencies [[`1834a3ee4`](https://github.com/clerk/javascript/commit/1834a3ee496ea27b9f7ceeb32ec5361f9de8ee30)]:
  - @clerk/shared@2.0.0-beta.17

## 5.0.0-beta.23

### Patch Changes

- Updated dependencies [[`db18787c4`](https://github.com/clerk/javascript/commit/db18787c4d9fa8ee1306db9b65f3b3f5e2fe2dad)]:
  - @clerk/shared@2.0.0-beta.16

## 5.0.0-beta.22

### Patch Changes

- Updated dependencies [[`6eab66050`](https://github.com/clerk/javascript/commit/6eab66050608a1bc5cb9aca6a234b1fea16106e5)]:
  - @clerk/shared@2.0.0-beta.15

## 5.0.0-beta.21

### Patch Changes

- Updated dependencies [[`12f3c5c55`](https://github.com/clerk/javascript/commit/12f3c5c55580f93a81df27851fbc92ce1312107e)]:
  - @clerk/shared@2.0.0-beta.14

## 5.0.0-beta.20

### Patch Changes

- Updated dependencies [[`5c239d973`](https://github.com/clerk/javascript/commit/5c239d97373ad2f2aa91ded1b84670f201f7db8f)]:
  - @clerk/types@4.0.0-beta.16

## 5.0.0-beta.19

### Patch Changes

- Rename beta-v5 to beta by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`2de442b24`](https://github.com/clerk/javascript/commit/2de442b2465cc5d424b8a0b21aa57c557f3aa2e7)]:
  - @clerk/shared@2.0.0-beta.13
  - @clerk/types@4.0.0-beta.15

## 5.0.0-beta-v5.18

### Patch Changes

- Properly fire onLoad event when clerk-js is already loaded. ([#2757](https://github.com/clerk/javascript/pull/2757)) by [@panteliselef](https://github.com/panteliselef)

- Export `EmailLinkErrorCode` from `/errors` module ([#2732](https://github.com/clerk/javascript/pull/2732)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Replace semver with custom regex in versionSelector ([#2760](https://github.com/clerk/javascript/pull/2760)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`244de5ea3`](https://github.com/clerk/javascript/commit/244de5ea3a7641727cd85c544bb79fb04f2c0808), [`9737ef510`](https://github.com/clerk/javascript/commit/9737ef5104346821461972d31f3c69e93924f0e0), [`8b466a9ba`](https://github.com/clerk/javascript/commit/8b466a9ba93ca10315b534079b09fa5d76ffa305), [`8daf8451c`](https://github.com/clerk/javascript/commit/8daf8451cb564bc834dd856174ffc2cdfa932e37), [`7f751c4ef`](https://github.com/clerk/javascript/commit/7f751c4ef2d14410058cf65ea984a93b50c0b87e), [`be991365e`](https://github.com/clerk/javascript/commit/be991365e1c78d0f1dfc59bb33dd533b6fad223a)]:
  - @clerk/types@4.0.0-beta-v5.14
  - @clerk/shared@2.0.0-beta-v5.12

## 5.0.0-beta-v5.17

### Patch Changes

- Updated dependencies [[`d4ff346dd`](https://github.com/clerk/javascript/commit/d4ff346dd53bb3e1970e80bdc7b188c2dd344f12), [`7886ba89d`](https://github.com/clerk/javascript/commit/7886ba89d76bfea2d6882a46baf64bf98f1148d3)]:
  - @clerk/shared@2.0.0-beta-v5.11
  - @clerk/types@4.0.0-beta-v5.13

## 5.0.0-alpha-v5.16

### Minor Changes

- Apply the following changes to components with routing props: ([#2543](https://github.com/clerk/javascript/pull/2543)) by [@dimkl](https://github.com/dimkl)

  - default is `routing="path"` and `path` prop is required to be set via env or context
  - when `routing="hash"` or `routing="virtual"` is set the implicit (via env or context) `path` option is ignored
  - when `routing="hash"` or `routing="virtual"` then `path` prop is not allowed to be set

  Examples of components with routing props:

  - `<CreateOrganization />`
  - `<OrganizationProfile />`
  - `<SignIn />`
  - `<SignUp />`
  - `<UserProfile />`

### Patch Changes

- Allow dynamic values components props, even if these values change after the components are rendered. For example, a `SignIn` component with a `redirectUrl` prop passed in will always respect the latest value of `redirectUrl`. ([#2515](https://github.com/clerk/javascript/pull/2515)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`8cc45d2af`](https://github.com/clerk/javascript/commit/8cc45d2af98320ccced3768fb039b86576e424a5)]:
  - @clerk/shared@2.0.0-alpha-v5.10

## 5.0.0-alpha-v5.15

### Patch Changes

- Fixes error thrown for missing path & routing props when path was passed from context. ([#2514](https://github.com/clerk/javascript/pull/2514)) by [@dimkl](https://github.com/dimkl)

  This change affects components `<SignIn />`, `<SignUp />` from `@clerk/nextjs` and `@clerk/remix`.

- Fixes error when path is passed from context and a routing strategy other than `path` is passed as a prop. ([#2530](https://github.com/clerk/javascript/pull/2530)) by [@octoper](https://github.com/octoper)

  This change affects components `<SignIn />`, `<SignUp />` from `@clerk/nextjs` and `@clerk/remix`.

## 5.0.0-alpha-v5.14

### Patch Changes

- Updated dependencies [[`1dc28ab46`](https://github.com/clerk/javascript/commit/1dc28ab46f6930074334be183c637ce7a81bebf7), [`ea4933655`](https://github.com/clerk/javascript/commit/ea4933655863ce315324aa2a3be7d5f263c2b61f), [`38d8b3e8a`](https://github.com/clerk/javascript/commit/38d8b3e8a0387bcf0b9c8d16e3bbfcfe9b643ca2)]:
  - @clerk/shared@2.0.0-alpha-v5.9

## 5.0.0-alpha-v5.13

### Patch Changes

- Updated dependencies [[`7ecd6f6ab`](https://github.com/clerk/javascript/commit/7ecd6f6abb0e5bfb1a57c99cc11860de311c3e82)]:
  - @clerk/shared@2.0.0-alpha-v5.8

## 5.0.0-alpha-v5.12

### Major Changes

- Path-based routing is now the default routing strategy if the `path` prop is filled. Additionally, if the `path` and `routing` props are not filled, an error will be thrown. ([#2338](https://github.com/clerk/javascript/pull/2338)) by [@octoper](https://github.com/octoper)

  ```jsx

  // Without path or routing props, an error with be thrown
  <UserProfile />
  <CreateOrganization />
  <OrganizationProfile />
  <SignIn />
  <SignUp />

  // Alternative #1
  <UserProfile path="/whatever"/>
  <CreateOrganization path="/whatever"/>
  <OrganizationProfile path="/whatever"/>
  <SignIn path="/whatever"/>
  <SignUp path="/whatever"/>

  // Alternative #2
  <UserProfile routing="hash_or_virtual"/>
  <CreateOrganization routing="hash_or_virtual"/>
  <OrganizationProfile routing="hash_or_virtual"/>
  <SignIn routing="hash_or_virtual"/>
  <SignUp routing="hash_or_virtual"/>
  ```

- Consolidate `afterSignOutOneUrl` & `afterSignOutAllUrl` to `afterSignOutUrl` and drop usage of Dashboard settings in ClerkJS components. The Dashboard settings should only apply to the Account Portal application. ([#2414](https://github.com/clerk/javascript/pull/2414)) by [@dimkl](https://github.com/dimkl)

### Minor Changes

- Remove MemberRole Type`MemberRole` would always include the old role keys `admin`, `member`, `guest_member`. ([#2388](https://github.com/clerk/javascript/pull/2388)) by [@panteliselef](https://github.com/panteliselef)

  If developers still depend on them after the introduction of custom roles, the can provide them as their custom types for authorization.

  ```ts
  // clerk.d.ts
  export {};

  interface ClerkAuthorization {
    permission: '';
    role: 'admin' | 'basic_member' | 'guest_member';
  }
  ```

- Update `@clerk/clerk-js` and `@clerk/clerk-react` to support the following examples: ([#2412](https://github.com/clerk/javascript/pull/2412)) by [@dimkl](https://github.com/dimkl)

  ```typescript
  Clerk.signOut({ redirectUrl: '/' })

  <SignOutButton redirectUrl='/' />
  // uses Clerk.signOut({ redirectUrl: '/' })
  <UserButton afterSignOutUrl='/after' />
  // uses Clerk.signOut({ redirectUrl: '/after' })
  <ClerkProvider afterSignOutUrl='/after' />
  // uses Clerk.signOut({ redirectUrl: '/after' })
  ```

### Patch Changes

- Updated dependencies [[`fe2607b6f`](https://github.com/clerk/javascript/commit/fe2607b6fdeed83002db7e4a0c040ac0280e5ff7), [`2e4a43017`](https://github.com/clerk/javascript/commit/2e4a43017ef33b541949ba90e16bf5311ce8bc60)]:
  - @clerk/types@4.0.0-alpha-v5.12

## 5.0.0-alpha-v5.11

### Major Changes

- Replace the `signOutCallback` prop on the `<SignOutButton />` with `redirectUrl`. This aligns the API surface with other UI components provided by `@clerk/clerk-react`. ([#2348](https://github.com/clerk/javascript/pull/2348)) by [@LekoArts](https://github.com/LekoArts)

  If you previously used the `signOutCallback` prop to navigate to another page, you can migrate as shown below.

  Before:

  ```jsx
  import { SignOutButton } from '@clerk/clerk-react';

  export const Signout = () => {
    return (
      <SignOutButton
        signOutCallback={() => {
          window.location.href = '/your-path';
        }}
      >
        <button>Sign Out</button>
      </SignOutButton>
    );
  };
  ```

  After:

  ```jsx
  import { SignOutButton } from '@clerk/clerk-react';

  export const Signout = () => {
    return (
      <SignOutButton redirectUrl='/your-path'>
        <button>Sign Out</button>
      </SignOutButton>
    );
  };
  ```

- Remove hashing and third-party cookie functionality related to development instance session syncing in favor of URL-based session syncing with query parameters. ([#2367](https://github.com/clerk/javascript/pull/2367)) by [@tmilewski](https://github.com/tmilewski)

- - `buildUrlWithAuth` no longer accepts an `options` argument. ([#2367](https://github.com/clerk/javascript/pull/2367)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Updated dependencies [[`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7)]:
  - @clerk/types@4.0.0-alpha-v5.11
  - @clerk/shared@2.0.0-alpha-v5.7

## 5.0.0-alpha-v5.10

### Major Changes

- - Introduce `@clerk/clerk-react/errors` and `@clerk/clerk-react/internal` subpath exports to expose some internal utilities. Eg ([#2328](https://github.com/clerk/javascript/pull/2328)) by [@dimkl](https://github.com/dimkl)

    ```typescript
    // Before
    import { __internal__setErrorThrowerOptions } from '@clerk/clerk-react';
    // After
    import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';

    // Before
    import { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react';
    // After
    import {
      isClerkAPIResponseError,
      isEmailLinkError,
      isKnownError,
      isMetamaskError,
    } from '@clerk/clerk-react/errors';

    // Before
    import { MultisessionAppSupport } from '@clerk/clerk-react';
    // After
    import { MultisessionAppSupport } from '@clerk/clerk-react/internal';
    ```

  - Drop from the `@clerk/clerk-react` and all other clerk-react wrapper packages:
    - `__internal__setErrorThrowerOptions` internal utility (moved to /internal subpath)
    - `WithClerkProp` type
    - `MultisessionAppSupport` component (moved to /internal subpath)
    - `EmailLinkErrorCode` enum
  - Drop `StructureContext` and related errors to reduce to reduce code complexity since it seems that it was not being used.
  - Drop `withUser`, `WithUser`, `withClerk` HOFs and `WithClerk`, `withSession`, `WithSession` HOCs from the `@clerk/clerk-react`
    to reduce the export surface since it's trivial to implement if needed.

- Drop `redirectToHome` redirect method in favour of `redirectToAfterSignUp` or `redirectToAfterSignIn`. ([#2251](https://github.com/clerk/javascript/pull/2251)) by [@octoper](https://github.com/octoper)

  When the `<SignIn/>` and `<SignUp/>` components are rendered while a user is already logged in, they will now redirect to the configured `afterSignIn` and `afterSignUp` URLs, respectively. Previously, the redirect URL was set to the home URL configured in the dashboard.

- Align return types for redirectTo\* methods in ClerkJS [SDK-1037] ([#2316](https://github.com/clerk/javascript/pull/2316)) by [@tmilewski](https://github.com/tmilewski)

  Breaking Changes:

  - `redirectToUserProfile` now returns `Promise<unknown>` instead of `void`
  - `redirectToOrganizationProfile` now returns `Promise<unknown>` instead of `void`
  - `redirectToCreateOrganization` now returns `Promise<unknown>` instead of `void`
  - `redirectToHome` now returns `Promise<unknown>` instead of `void`

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

- Add `useAssertWrappedByClerkProvider` to internal code. If you use hooks like `useAuth` outside of the `<ClerkProvider />` context an error will be thrown. For example: ([#2299](https://github.com/clerk/javascript/pull/2299)) by [@tmilewski](https://github.com/tmilewski)

  ```shell
  @clerk/clerk-react: useAuth can only be used within the <ClerkProvider /> component
  ```

- Updated dependencies [[`896cb6104`](https://github.com/clerk/javascript/commit/896cb610409f84c0ff7a4f502f0b4ccee1afc157), [`69ce3e185`](https://github.com/clerk/javascript/commit/69ce3e185b89283956cb711629bc61703166b1c9), [`ab4eb56a5`](https://github.com/clerk/javascript/commit/ab4eb56a5c34baf496ebb8ac412ad6171b9bd79c), [`46040a2f3`](https://github.com/clerk/javascript/commit/46040a2f34d0991072fca490e031c1994b2e2296), [`75ea300bc`](https://github.com/clerk/javascript/commit/75ea300bce16a0ce401a225263bb267ad2a217b8), [`844847e0b`](https://github.com/clerk/javascript/commit/844847e0becf20243fba3c659b2b77a238dd270a)]:
  - @clerk/shared@2.0.0-alpha-v5.6
  - @clerk/types@4.0.0-alpha-v5.10

## 5.0.0-alpha-v5.9

### Major Changes

- Drop `Clerk.isReady(). Use `Clerk.loaded` instead.` ([#2294](https://github.com/clerk/javascript/pull/2294)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`1db1f4068`](https://github.com/clerk/javascript/commit/1db1f4068466d967df0de39f032a476ca8163651), [`7bffc47cb`](https://github.com/clerk/javascript/commit/7bffc47cb71a2c3e026df5977c25487bfd5c55d7)]:
  - @clerk/types@4.0.0-alpha-v5.9

## 5.0.0-alpha-v5.8

### Patch Changes

- Set correct information on required Node.js and React versions in README ([#2264](https://github.com/clerk/javascript/pull/2264)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`6a33709cc`](https://github.com/clerk/javascript/commit/6a33709ccf48586f1a8b62216688ea300b7b5dfb), [`d30ea1faa`](https://github.com/clerk/javascript/commit/d30ea1faa45074e09c037530e8ba3ca2dbd50654)]:
  - @clerk/types@4.0.0-alpha-v5.8
  - @clerk/shared@2.0.0-alpha-v5.5

## 5.0.0-alpha-v5.7

### Minor Changes

- Fix `@clerk/clerk-react` bundle output to resolve issues with vite / rollup ESM module imports. ([#2216](https://github.com/clerk/javascript/pull/2216)) by [@dimkl](https://github.com/dimkl)

  We have also used the `bundle` output to export a single index.ts and dropped the unnecessary
  published files / folders (eg `__tests__`).

- Update the TypeScript types of `<ClerkProvider />`. If you use the `routerPush` prop you're now required to also provide the `routerReplace` prop (or other way around). You can also not provide them at all since both props are optional. ([#2227](https://github.com/clerk/javascript/pull/2227)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Sync IsomorphicClerk with the clerk singleton and the LoadedClerk interface. IsomorphicClerk now extends from LoadedClerk. ([#2226](https://github.com/clerk/javascript/pull/2226)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`4b8bedc66`](https://github.com/clerk/javascript/commit/4b8bedc66d47dca5c6192148f4b31ae6d49ff733), [`c776f86fb`](https://github.com/clerk/javascript/commit/c776f86fb2a999dcae46fda9abb5005718c354b2), [`d6a7ea61a`](https://github.com/clerk/javascript/commit/d6a7ea61a8ae64c93877ec117e54fc48b1c86f16)]:
  - @clerk/shared@2.0.0-alpha-v5.4
  - @clerk/types@4.0.0-alpha-v5.7

## 5.0.0-alpha-v5.6

### Patch Changes

- Updated dependencies [[`5aab9f04a`](https://github.com/clerk/javascript/commit/5aab9f04a1eac39e42a03f555075e08a5a8ee02c), [`9a1fe3728`](https://github.com/clerk/javascript/commit/9a1fe37289c7606dc111913cb9f70f2a2efff6b7), [`9a1fe3728`](https://github.com/clerk/javascript/commit/9a1fe37289c7606dc111913cb9f70f2a2efff6b7)]:
  - @clerk/types@4.0.0-alpha-v5.6

## 5.0.0-alpha-v5.5

### Patch Changes

- Updated dependencies [[`12962bc58`](https://github.com/clerk/javascript/commit/12962bc58e2c9caad416ba4e6d52061d00bc2feb)]:
  - @clerk/types@4.0.0-alpha-v5.5

## 5.0.0-alpha-v5.4

### Minor Changes

- - By default, all the components with routing will have the `routing` prop assigned as `'path'` by default when the `path` prop is filled. ([#1957](https://github.com/clerk/javascript/pull/1957)) by [@octoper](https://github.com/octoper)

  - The `<UserButton />` component will set the default value of the `userProfileMode` prop to `'navigation'` if the `userProfileUrl` prop is provided.
  - The `<OrganizationSwitcher />` component will have the `organizationProfileMode` and `createOrganizationMode` props assigned with `'navigation'` by default if the `organizationProfileUrl` and `createOrganizationUrl` props are filled accordingly.

### Patch Changes

- Updated dependencies [[`7f6a64f43`](https://github.com/clerk/javascript/commit/7f6a64f4335832c66ff355f6d2f311f33a313d59)]:
  - @clerk/types@4.0.0-alpha-v5.4

## 5.0.0-alpha-v5.3

### Major Changes

- Upgrade React version to >=18 and add react-dom as peer dependency ([#2164](https://github.com/clerk/javascript/pull/2164)) by [@dimkl](https://github.com/dimkl)

  to fix issues with vite & rollup building.

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

- Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry. ([#2154](https://github.com/clerk/javascript/pull/2154)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`52ff8fe6b`](https://github.com/clerk/javascript/commit/52ff8fe6b6ff88ceb5e1246378b54b0565bede9d), [`4bb57057e`](https://github.com/clerk/javascript/commit/4bb57057e9af20fc433626ed178d97d3ca811362), [`40ac4b645`](https://github.com/clerk/javascript/commit/40ac4b645f449b546dae5b4c0d013c9d9ea6d09c), [`429d030f7`](https://github.com/clerk/javascript/commit/429d030f7b6efe838a1e7fec7f736ba59fcc6b61)]:
  - @clerk/shared@2.0.0-alpha-v5.3
  - @clerk/types@4.0.0-alpha-v5.3

## 5.0.0-alpha-v5.2

### Major Changes

- Change the minimal Node.js version required by Clerk to `18.17.0`. ([#2162](https://github.com/clerk/javascript/pull/2162)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`c2a090513`](https://github.com/clerk/javascript/commit/c2a0905132684a4a1e8d598b66caddf20062273e)]:
  - @clerk/shared@2.0.0-alpha-v5.2
  - @clerk/types@4.0.0-alpha-v5.2

## 5.0.0-alpha-v5.1

### Major Changes

- Drop default exports from all packages. Migration guide: ([#2150](https://github.com/clerk/javascript/pull/2150)) by [@dimkl](https://github.com/dimkl)

  - use `import { Clerk } from '@clerk/backend';`
  - use `import { clerkInstance } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-js';`
  - use `import { Clerk } from '@clerk/clerk-js/headless';`
  - use `import { IsomorphicClerk } from '@clerk/clerk-react'`

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

- Drop deprecations. Migration steps: ([#2109](https://github.com/clerk/javascript/pull/2109)) by [@dimkl](https://github.com/dimkl)

  - drop `orgs` jwt claim from session token
  - change type of `auth` param of `withServerAuth()` callback to `AuthObject` from `ServerSideAuth` in `gatsby-clerk-plugin`
    - use `auth.sessionClaims` instead of `auth.claims`
    - use `AuthObject` properties from `auth`
  - use `publishableKey` instead of `frontendApi`
  - use `ClerkProviderOptionsWrapper` type instead of `IsomorphicClerkOptions`

- Drop deprecations. Migration steps: ([#2151](https://github.com/clerk/javascript/pull/2151)) by [@dimkl](https://github.com/dimkl)

  - drop `formFieldLabel__emailAddress_phoneNumber` from localization keys
  - drop `formFieldLabel__phoneNumber_username` from localization keys
  - drop `formFieldLabel__emailAddress_phoneNumber_username` from localization keys
  - drop `formFieldInputPlaceholder__emailAddress_phoneNumber` from localization keys
  - drop `formFieldInputPlaceholder__phoneNumber_username` from localization keys
  - drop `formFieldInputPlaceholder__emailAddress_phoneNumber_username` from localization keys
  - use `title__connectionFailed` instead of `title__conectionFailed` from localization keys
  - use `actionLabel__connectionFailed` instead of `actionLabel__conectionFailed` from localization keys
  - use `headerTitle__members` instead of `headerTitle__active` from localization keys
  - use `headerTitle__invitations` instead of `headerTitle__invited` from localization keys
  - drop `createOrganization.subtitle` from localization keys
  - use `deDE` instead of `deDe` localization from `@clerk/localizations`

- Drop deprecations. Migration steps: ([#1993](https://github.com/clerk/javascript/pull/1993)) by [@dimkl](https://github.com/dimkl)

  - use `setActive` instead of `setSession` from `useSessionList | useSignUp | useSignIn` hooks
  - use `publishableKey` instead of `frontendApi`
  - use `handleEmailLinkVerification` instead of `handleMagicLinkVerification` from `IsomorphicClerk`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`

### Patch Changes

- Use the errorThrower shared utility when throwing errors ([#1999](https://github.com/clerk/javascript/pull/1999)) by [@anagstef](https://github.com/anagstef)

- Updated dependencies [[`64d3763ec`](https://github.com/clerk/javascript/commit/64d3763ec73747ad04c4b47017195cf4114e150c), [`83e9d0846`](https://github.com/clerk/javascript/commit/83e9d08469e7c2840f06aa7d86831055e23f67a5), [`7f833da9e`](https://github.com/clerk/javascript/commit/7f833da9ebc1b2ec9c65513628c377d0584e5d72), [`492b8a7b1`](https://github.com/clerk/javascript/commit/492b8a7b12f14658a384566012e5807f0a171710), [`2a22aade8`](https://github.com/clerk/javascript/commit/2a22aade8c9bd1f83a9be085983f96fa87903804), [`f77e8cdbd`](https://github.com/clerk/javascript/commit/f77e8cdbd24411f7f9dbfdafcab0596c598f66c1), [`0d1052ac2`](https://github.com/clerk/javascript/commit/0d1052ac284b909786fd0e4744b02fcf4d1a8be6), [`5471c7e8d`](https://github.com/clerk/javascript/commit/5471c7e8dd0155348748fa90e5ae97093f59efe9), [`477170962`](https://github.com/clerk/javascript/commit/477170962f486fd4e6b0653a64826573f0d8621b), [`e0e79b4fe`](https://github.com/clerk/javascript/commit/e0e79b4fe47f64006718d547c898b9f67fe4d424)]:
  - @clerk/shared@2.0.0-alpha-v5.1
  - @clerk/types@4.0.0-alpha-v5.1

## 5.0.0-alpha-v5.0

### Major Changes

- Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

### Minor Changes

- Experimental support for `<Gate/>` with role checks. ([#1942](https://github.com/clerk/javascript/pull/1942)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Ignore `.test.ts` files for the build output. Should result in smaller bundle size. ([#2005](https://github.com/clerk/javascript/pull/2005)) by [@LekoArts](https://github.com/LekoArts)

- Replace internal logic of determining package tag & major version with [semver](https://www.npmjs.com/package/semver) in order to have a more robust solution ([#2011](https://github.com/clerk/javascript/pull/2011)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`743c4d204`](https://github.com/clerk/javascript/commit/743c4d20423790b554e66923466081c0d3b0d9ed), [`d37d44a68`](https://github.com/clerk/javascript/commit/d37d44a68e83b8e895963415f000c1aaef66e87e), [`791c49807`](https://github.com/clerk/javascript/commit/791c49807c3c9e19964cbf621c935d237caeecf3), [`a68eb3083`](https://github.com/clerk/javascript/commit/a68eb3083ff68459cd33098e2df190a5ba26c841), [`0293f29c8`](https://github.com/clerk/javascript/commit/0293f29c855c9415b54867196e8d727d1614e4ca), [`ef2325dcc`](https://github.com/clerk/javascript/commit/ef2325dcc18729e9ce9ee5823e9a963efa51dbc1), [`71663c568`](https://github.com/clerk/javascript/commit/71663c568926b1d60b97aa7ccc5298d05b618af2), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`78fc5eec0`](https://github.com/clerk/javascript/commit/78fc5eec0d61c14d86204944c6aa9f341ae6ea98), [`c7e6d00f5`](https://github.com/clerk/javascript/commit/c7e6d00f56e73df4ed87712e74ad9d5bcaca8924), [`4edb77632`](https://github.com/clerk/javascript/commit/4edb7763271b80d93fcd52ece5f1e408bd75df6f), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`7644b7472`](https://github.com/clerk/javascript/commit/7644b74726ba73e615a1256f9ff3fa03b0f8bc30), [`f5d55bb1f`](https://github.com/clerk/javascript/commit/f5d55bb1fc6a87303fb8bf461c3a917ae4da4005), [`41ae1d2f0`](https://github.com/clerk/javascript/commit/41ae1d2f006a0e4657a97a9c83ae7eb0cc167834), [`48ca40af9`](https://github.com/clerk/javascript/commit/48ca40af97a7fa4f2e41cf0f071028767d1b0075), [`6f755addd`](https://github.com/clerk/javascript/commit/6f755addd0886b9ff8b0d5dbe48e37470049acad)]:
  - @clerk/shared@2.0.0-alpha-v5.0
  - @clerk/types@4.0.0-alpha-v5.0

## 4.27.0

### Minor Changes

- Introduce customization in `UserProfile` and `OrganizationProfile` ([#1822](https://github.com/clerk/javascript/pull/1822)) by [@anagstef](https://github.com/anagstef)

  The `<UserProfile />` component now allows the addition of custom pages and external links to the navigation sidebar. Custom pages can be created using the `<UserProfile.Page>` component, and external links can be added using the `<UserProfile.Link>` component. The default routes, such as `Account` and `Security`, can be reordered.

  Example React API usage:

  ```tsx
  <UserProfile>
    <UserProfile.Page
      label='Custom Page'
      url='custom'
      labelIcon={<CustomIcon />}
    >
      <MyCustomPageContent />
    </UserProfile.Page>
    <UserProfile.Link
      label='External'
      url='/home'
      labelIcon={<Icon />}
    />
    <UserProfile.Page label='account' />
    <UserProfile.Page label='security' />
  </UserProfile>
  ```

  Custom pages and links should be provided as children using the `<UserButton.UserProfilePage>` and `<UserButton.UserProfileLink>` components when using the `UserButton` component.

  The `<OrganizationProfile />` component now supports the addition of custom pages and external links to the navigation sidebar. Custom pages can be created using the `<OrganizationProfile.Page>` component, and external links can be added using the `<OrganizationProfile.Link>` component. The default routes, such as `Members` and `Settings`, can be reordered.

  Example React API usage:

  ```tsx
  <OrganizationProfile>
    <OrganizationProfile.Page
      label='Custom Page'
      url='custom'
      labelIcon={<CustomIcon />}
    >
      <MyCustomPageContent />
    </OrganizationProfile.Page>
    <OrganizationProfile.Link
      label='External'
      url='/home'
      labelIcon={<Icon />}
    />
    <OrganizationProfile.Page label='members' />
    <OrganizationProfile.Page label='settings' />
  </OrganizationProfile>
  ```

  Custom pages and links should be provided as children using the `<OrganizationSwitcher.OrganizationProfilePage>` and `<OrganizationSwitcher.OrganizationProfileLink>` components when using the `OrganizationSwitcher` component.

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Update imports of `@clerk/shared` to granular entrypoints. This addresses warnings during a Next.js build that are the result of unsupported APIs being included in the module graph of builds for the edge runtime. ([#1924](https://github.com/clerk/javascript/pull/1924)) by [@BRKalow](https://github.com/BRKalow)

- Consider `Clerk.setActive` as stable. ([#1917](https://github.com/clerk/javascript/pull/1917)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`3bf64107e`](https://github.com/clerk/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`52f8553d2`](https://github.com/clerk/javascript/commit/52f8553d22f9454ee1194fd162410db15da7a4be), [`92727eec3`](https://github.com/clerk/javascript/commit/92727eec39566278263ffa118a085493f964eb94), [`b09b66eec`](https://github.com/clerk/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerk/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62), [`aa4cd7615`](https://github.com/clerk/javascript/commit/aa4cd761585b888706a36a6eed7436a8f0476dbf)]:
  - @clerk/shared@1.0.0
  - @clerk/types@3.57.0

## 4.26.6

### Patch Changes

- Updated dependencies [[`9ca215702`](https://github.com/clerk/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11)]:
  - @clerk/types@3.56.1

## 4.26.5

### Patch Changes

- Fix methods in clerk-js that consumede paginated endpoints in order to retrieve single resources. ([#1871](https://github.com/clerk/javascript/pull/1871)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`35be8709d`](https://github.com/clerk/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`e38488c92`](https://github.com/clerk/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerk/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`9b644d799`](https://github.com/clerk/javascript/commit/9b644d7991b8cba4b385e9443f87798cde5c9989), [`a9894b445`](https://github.com/clerk/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`834dadb36`](https://github.com/clerk/javascript/commit/834dadb36c30b2a8f052784de4ad1026b0083b4e), [`70f251007`](https://github.com/clerk/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`a46d6fe99`](https://github.com/clerk/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/types@3.56.0
  - @clerk/shared@0.24.5

## 4.26.4

### Patch Changes

- Warn about _MagicLink_ deprecations: ([#1836](https://github.com/clerk/javascript/pull/1836)) by [@dimkl](https://github.com/dimkl)

  - `MagicLinkError`
  - `isMagicLinkError`
  - `MagicLinkErrorCode`
  - `handleMagicLinkVerification`
  - `createMagicLinkFlow`
  - `useMagicLink`

- Introduce a new property on the core Clerk singleton, `sdkMetadata`. This will be populated by each host SDK. This metadata will be used to make logging and debugging easier. ([#1857](https://github.com/clerk/javascript/pull/1857)) by [@BRKalow](https://github.com/BRKalow)

- Introduce new `*EmailLink*` helpers that will replace the `*MagicLink*` helpers. ([#1833](https://github.com/clerk/javascript/pull/1833)) by [@dimkl](https://github.com/dimkl)

  Also marked all the `*MagicLink*` as deprecated using JSDocs.

- Updated dependencies [[`977336f79`](https://github.com/clerk/javascript/commit/977336f793cd4ce5984f98dac3cedf9f5ec363f5), [`997b8e256`](https://github.com/clerk/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91e9a55f4`](https://github.com/clerk/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`91014880d`](https://github.com/clerk/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`7f4d4b942`](https://github.com/clerk/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b)]:
  - @clerk/shared@0.24.4
  - @clerk/types@3.55.0

## 4.26.3

### Patch Changes

- Make `types` the first key in all `exports` maps defined in our packages' `package.json`. The [TypeScript docs](https://www.typescriptlang.org/docs/handbook/esm-node.html#packagejson-exports-imports-and-self-referencing) recommends so, as the the `exports` map is order-based. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Apply deprecation warnings for @clerk/types: ([#1823](https://github.com/clerk/javascript/pull/1823)) by [@dimkl](https://github.com/dimkl)

  - `orgs` jwt claims
  - `apiKey`
  - `frontendApi`
  - `redirect_url`
  - `password`
  - `generateSignature`
  - `afterSwitchOrganizationUrl`
  - `profileImageUrl`

- Updated dependencies [[`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1e212c19d`](https://github.com/clerk/javascript/commit/1e212c19d1cbfbcf6bc6718f5aec0a3cb893b96f), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679)]:
  - @clerk/shared@0.24.3

## 4.26.2

### Patch Changes

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Fix internal subpath imports by replacing them with top level imports. ([#1804](https://github.com/clerk/javascript/pull/1804)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerk/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`164f3aac7`](https://github.com/clerk/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerk/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerk/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`0636ff779`](https://github.com/clerk/javascript/commit/0636ff7799e126d1438d2738ce0e46c3b277f46a), [`9514618d6`](https://github.com/clerk/javascript/commit/9514618d65cfdde0ff011eabd41a992b61fc8dc1), [`c7c6912f3`](https://github.com/clerk/javascript/commit/c7c6912f34874467bc74104690fe9f95491cc10d), [`71bb1c7b5`](https://github.com/clerk/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf)]:
  - @clerk/types@3.54.0
  - @clerk/shared@0.24.2

## 4.26.1

### Patch Changes

- Refactor our script loading logic to use a `versionSelector` helper function. No change in behavior should occur. This internal change allows versions tagged with `snapshot` and `staging` to use the exact corresponding NPM version of `@clerk/clerk-js`. ([#1780](https://github.com/clerk/javascript/pull/1780)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`cecf74d79`](https://github.com/clerk/javascript/commit/cecf74d79069662d25f73e4745aa01348d398afb)]:
  - @clerk/shared@0.24.1

## 4.26.0

### Minor Changes

- `<SignIn/>`, `<SignUp/>`, `<RedirectToSignin/>`, `<RedirectToSignUp/>`, `clerk.redirectToSignIn()` and `clerk.redirectToSignUp()` now accept the `initialValues` option, which will prefill the appropriate form fields with the values provided. ([#1701](https://github.com/clerk/javascript/pull/1701)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Apply deprecation warnings for `@clerk/clerk-react`: ([#1788](https://github.com/clerk/javascript/pull/1788)) by [@dimkl](https://github.com/dimkl)

  - `setSession`

- Updated dependencies [[`7ffa6fac3`](https://github.com/clerk/javascript/commit/7ffa6fac3762f6fb130ba2f2fcaa28e52b36b3b4), [`5c8754239`](https://github.com/clerk/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81), [`2f6a6ac99`](https://github.com/clerk/javascript/commit/2f6a6ac9991469bf8532019bb22ff50adecdb434), [`753f7bbda`](https://github.com/clerk/javascript/commit/753f7bbda9bbb7444f96222a3b6cae815a09058f), [`55c8ebd39`](https://github.com/clerk/javascript/commit/55c8ebd390dd88036aee06866009be6a50c63138)]:
  - @clerk/shared@0.24.0
  - @clerk/types@3.53.0

## 4.25.2

### Patch Changes

- Remove nested `package.json` files inside `dist/cjs` and `dist/esm` and move `sideEffects` property to top-level `package.json` file. This change won't change behavior. ([#1785](https://github.com/clerk/javascript/pull/1785)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`07ede0f95`](https://github.com/clerk/javascript/commit/07ede0f959f232f6cbecb596eb9352f8cb382cdc), [`0eb666118`](https://github.com/clerk/javascript/commit/0eb66611882e6c460cc6a6c5cfa1d9b086ec6917), [`3b85311c9`](https://github.com/clerk/javascript/commit/3b85311c9eb006f51a8642f193473a250de879fc), [`ffcc78c06`](https://github.com/clerk/javascript/commit/ffcc78c062d067738f617ea9b491c1d45677148c), [`c61ddf5bf`](https://github.com/clerk/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerk/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/shared@0.23.1
  - @clerk/types@3.52.1

## 4.25.1

### Patch Changes

- Updated dependencies [[`6706b154c`](https://github.com/clerk/javascript/commit/6706b154c0b41356c7feeb19c6340160a06466e5), [`086a2e0b7`](https://github.com/clerk/javascript/commit/086a2e0b7e71a9919393ca43efedbf3718ea5fe4)]:
  - @clerk/shared@0.23.0

## 4.25.0

### Minor Changes

- Introduce the new brand-new component OrganizationList ([#1692](https://github.com/clerk/javascript/pull/1692)) by [@panteliselef](https://github.com/panteliselef)

  - Lists all the memberships, invitations or suggestions an active user may have
  - Powered by our `useOrganizationList` react hook

### Patch Changes

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`e99df0a0d`](https://github.com/clerk/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerk/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`8b9a7a360`](https://github.com/clerk/javascript/commit/8b9a7a36003f1b8622f444a139a811f1c35ca813), [`30bb9eccb`](https://github.com/clerk/javascript/commit/30bb9eccb95632fb1de02b756e818118ca6324f7), [`01b024c57`](https://github.com/clerk/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68)]:
  - @clerk/types@3.52.0
  - @clerk/shared@0.22.1

## 4.24.2

### Patch Changes

- Updated dependencies [[`463ff84f5`](https://github.com/clerk/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`1426e5eb3`](https://github.com/clerk/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739)]:
  - @clerk/types@3.51.0

## 4.24.1

### Patch Changes

- Support swapping the Clerk publishableKey at runtime to allow users to toggle the instance being used. ([#1655](https://github.com/clerk/javascript/pull/1655)) by [@BRKalow](https://github.com/BRKalow)

## 4.24.0

### Minor Changes

- Introduces userInvitations from `useOrganizationList` ([#1520](https://github.com/clerk/javascript/pull/1520)) by [@panteliselef](https://github.com/panteliselef)

  `userInvitations` is a paginated list of data. It can be used to create Paginated tables or Infinite lists.

### Patch Changes

- Updated dependencies [[`96cc1921c`](https://github.com/clerk/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerk/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerk/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerk/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerk/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerk/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerk/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerk/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerk/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerk/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`86de584dd`](https://github.com/clerk/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e02a1aff2`](https://github.com/clerk/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerk/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerk/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerk/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerk/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerk/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`89bc5de04`](https://github.com/clerk/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/shared@0.22.0
  - @clerk/types@3.50.0

## 4.23.2

### Patch Changes

- Updated dependencies [[`ea95525a4`](https://github.com/clerk/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerk/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`d433b83b9`](https://github.com/clerk/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerk/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`0a59e122d`](https://github.com/clerk/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/types@3.49.0
  - @clerk/shared@0.21.0

## 4.23.1

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerk/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3)]:
  - @clerk/types@3.48.1

## 4.23.0

### Minor Changes

- Add unsafeMetadata prop to the SignUp component ([#1464](https://github.com/clerk/javascript/pull/1464)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerk/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c)]:
  - @clerk/types@3.48.0

## 4.22.1

### Patch Changes

- Mark setSession as deprecated when it is re-exported within hooks ([#1486](https://github.com/clerk/javascript/pull/1486)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`73c9c1d0e`](https://github.com/clerk/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerk/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerk/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`090bab66e`](https://github.com/clerk/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`5ecbb0a37`](https://github.com/clerk/javascript/commit/5ecbb0a37e99fa2099629c573951c7735d5f0810), [`592911196`](https://github.com/clerk/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8)]:
  - @clerk/types@3.47.0
  - @clerk/shared@0.20.0

## 4.22.0

### Minor Changes

- Update IsomorphicClerk#addListener to correctly return an unsubscribe method ([#1452](https://github.com/clerk/javascript/pull/1452)) by [@dimkl](https://github.com/dimkl)

## 4.21.1

### Patch Changes

- Populate `openCreateOrganization` return from the `useClerk()` hook ([#1435](https://github.com/clerk/javascript/pull/1435)) by [@panteliselef](https://github.com/panteliselef)

## 4.21.0

### Minor Changes

- Fix `global is not defined` error when using Vite + React by [@anagstef](https://github.com/anagstef)

## 4.20.6

### Patch Changes

- Updated dependencies [[`30f8ad18a`](https://github.com/clerk/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c)]:
  - @clerk/types@3.46.1

## 4.20.5

### Patch Changes

- Updated dependencies [[`bfb3af28`](https://github.com/clerk/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/types@3.46.0

## 4.20.4

### Patch Changes

- Updated dependencies [[`11954816`](https://github.com/clerk/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`32148490`](https://github.com/clerk/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0

## 4.20.3

### Patch Changes

- Updated dependencies [[`17cc14ec`](https://github.com/clerk/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/types@3.44.0

## 4.20.2

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerk/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerk/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/types@3.43.0

## 4.20.1

### Patch Changes

- Updated dependencies [[`59bc649a`](https://github.com/clerk/javascript/commit/59bc649a92316f5d6ade00f3cd52a9b46dcdc401)]:
  - @clerk/shared@0.19.1

## 4.20.0

### Minor Changes

- Export error helpers from the shared package to the framework specific packages ([#1308](https://github.com/clerk/javascript/pull/1308)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Resolve all reported ESM build issues by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`7af91bc3`](https://github.com/clerk/javascript/commit/7af91bc3ecc25cba04968b491e1e3c6ec32c18af), [`c42b4ac0`](https://github.com/clerk/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`6f3d4305`](https://github.com/clerk/javascript/commit/6f3d43055690db1d69a356503a0a45dc948beaef)]:
  - @clerk/shared@0.19.0
  - @clerk/types@3.42.0

## 4.19.0

### Minor Changes

- ESM/CJS support for `@clerk/clerk-react` by [@nikosdouvlis](https://github.com/nikosdouvlis)

  Changes that should affect users and OS contributors:

  - Better source map support for `@clerk/clerk-react`, `@clerk/shared`. This affects anyone developing in our monorepo or anyone using a debugger with Clerk installed in their app.
  - Easier node_modules debugging as `@clerk/clerk-react`, `@clerk/shared` and `@clerk/nextjs` are no longer getting bundled as a single-file package. This also improves error logging in nextjs a lot, as nextjs usually logs the line that threw the error - a minified, single-file package, usually consists of a very long single-line module, so logging error in NextJS wasn't ideal.
  - Headless clerk-js bundle size reduced by ~10kb, normal clerk-ks by ~6kb
  - A new `clerkJSVersion` prop has been added on ClerkProvider allowing to fetch a specific clerk-js version.

### Patch Changes

- Updated dependencies [[`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/types@3.41.1
  - @clerk/shared@0.18.0

## [4.18.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.18.0-staging.1...@clerk/clerk-react@4.18.0) (2023-06-03)

**Note:** Version bump only for package @clerk/clerk-react

## [4.17.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.17.0-staging.0...@clerk/clerk-react@4.17.0) (2023-05-26)

**Note:** Version bump only for package @clerk/clerk-react

### [4.16.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.16.3-staging.2...@clerk/clerk-react@4.16.3) (2023-05-23)

**Note:** Version bump only for package @clerk/clerk-react

### [4.16.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.16.2-staging.0...@clerk/clerk-react@4.16.2) (2023-05-18)

**Note:** Version bump only for package @clerk/clerk-react

### [4.16.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.16.1-staging.1...@clerk/clerk-react@4.16.1) (2023-05-17)

**Note:** Version bump only for package @clerk/clerk-react

## [4.16.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.16.0-staging.2...@clerk/clerk-react@4.16.0) (2023-05-15)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.15.4-staging.5...@clerk/clerk-react@4.15.4) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.4-staging.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.15.4-staging.4...@clerk/clerk-react@4.15.4-staging.5) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.4-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.15.4-staging.2...@clerk/clerk-react@4.15.4-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.15.3-staging.0...@clerk/clerk-react@4.15.3) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.15.1...@clerk/clerk-react@4.15.2) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-react

### [4.15.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.15.1-staging.0...@clerk/clerk-react@4.15.1) (2023-04-12)

**Note:** Version bump only for package @clerk/clerk-react

## [4.15.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.15.0-staging.0...@clerk/clerk-react@4.15.0) (2023-04-11)

**Note:** Version bump only for package @clerk/clerk-react

### [4.14.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.14.2-staging.0...@clerk/clerk-react@4.14.2) (2023-04-06)

**Note:** Version bump only for package @clerk/clerk-react

### [4.14.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.14.1-staging.3...@clerk/clerk-react@4.14.1) (2023-03-31)

**Note:** Version bump only for package @clerk/clerk-react

### [4.14.1-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.14.1-staging.2...@clerk/clerk-react@4.14.1-staging.3) (2023-03-31)

### Bug Fixes

- **clerk-react:** Check for window in isomorphicClerk ([fe82852](https://github.com/clerk/javascript/commit/fe828523c2bbdc2f3fc35ad5e30aea52b5438922))

## [4.14.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.14.0-staging.1...@clerk/clerk-react@4.14.0) (2023-03-29)

**Note:** Version bump only for package @clerk/clerk-react

### [4.12.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.12.4-staging.2...@clerk/clerk-react@4.12.4) (2023-03-10)

**Note:** Version bump only for package @clerk/clerk-react

### [4.12.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.12.3-staging.0...@clerk/clerk-react@4.12.3) (2023-03-09)

**Note:** Version bump only for package @clerk/clerk-react

### [4.12.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.12.2-staging.0...@clerk/clerk-react@4.12.2) (2023-03-07)

**Note:** Version bump only for package @clerk/clerk-react

### [4.12.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.12.1-staging.1...@clerk/clerk-react@4.12.1) (2023-03-03)

**Note:** Version bump only for package @clerk/clerk-react

## [4.12.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.12.0-staging.0...@clerk/clerk-react@4.12.0) (2023-03-01)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.6](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.6-staging.0...@clerk/clerk-react@4.11.6) (2023-02-25)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.5-staging.3...@clerk/clerk-react@4.11.5) (2023-02-24)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.5-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.5-staging.1...@clerk/clerk-react@4.11.5-staging.2) (2023-02-22)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.4-staging.0...@clerk/clerk-react@4.11.4) (2023-02-17)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.3-staging.2...@clerk/clerk-react@4.11.3) (2023-02-15)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.2-staging.1...@clerk/clerk-react@4.11.2) (2023-02-10)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.1-staging.0...@clerk/clerk-react@4.11.1) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-react

### [4.11.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.0-staging.1...@clerk/clerk-react@4.11.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-react

## [4.11.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.11.0-staging.1...@clerk/clerk-react@4.11.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-react

## [4.10.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.10.0-staging.0...@clerk/clerk-react@4.10.0) (2023-02-01)

**Note:** Version bump only for package @clerk/clerk-react

## [4.9.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.9.0-staging.1...@clerk/clerk-react@4.9.0) (2023-01-27)

**Note:** Version bump only for package @clerk/clerk-react

### [4.8.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.8.4-staging.1...@clerk/clerk-react@4.8.4) (2023-01-24)

**Note:** Version bump only for package @clerk/clerk-react

### [4.8.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.8.2...@clerk/clerk-react@4.8.3) (2023-01-20)

### Bug Fixes

- **nextjs,types:** Make frontendApi or publishableKey mutually exclusive but optional ([953c276](https://github.com/clerk/javascript/commit/953c27622ba24054172d6f4178bd5af50f73fa36))

### [4.8.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.8.1...@clerk/clerk-react@4.8.2) (2023-01-19)

### Bug Fixes

- **clerk-react:** Do not throw missing key error if a Clerk instance is used ([a300016](https://github.com/clerk/javascript/commit/a3000164483e7ed947d448f7593e0ce4dd110db3))
- **clerk-react:** Do not throw missing key error in isomorphicClerk.load ([8b3b763](https://github.com/clerk/javascript/commit/8b3b763ed67d3af101573627fc7b00fb0a526b9b))

### [4.8.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.8.0...@clerk/clerk-react@4.8.1) (2023-01-17)

### Bug Fixes

- **clerk-react:** Add data-clerk-publishable-key attribute only when PK is available ([8d44f54](https://github.com/clerk/javascript/commit/8d44f54434754e2c31b4a77b58a28ae969ce5a09))

## [4.8.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.8.0-staging.4...@clerk/clerk-react@4.8.0) (2023-01-17)

**Note:** Version bump only for package @clerk/clerk-react

## [4.7.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.7.0-staging.1...@clerk/clerk-react@4.7.0) (2022-12-19)

**Note:** Version bump only for package @clerk/clerk-react

### [4.6.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.6.4-staging.0...@clerk/clerk-react@4.6.4) (2022-12-13)

**Note:** Version bump only for package @clerk/clerk-react

### [4.6.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.6.2...@clerk/clerk-react@4.6.3) (2022-12-12)

**Note:** Version bump only for package @clerk/clerk-react

### [4.6.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.6.2-staging.1...@clerk/clerk-react@4.6.2) (2022-12-09)

**Note:** Version bump only for package @clerk/clerk-react

### [4.6.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.6.0...@clerk/clerk-react@4.6.1) (2022-12-08)

### Reverts

- Revert "feat(clerk-js,types): Terse paths parameters (#572)" (#603) ([d535eac](https://github.com/clerk/javascript/commit/d535eace3d7733ce3b848bb05f1b0c02e5faf15d)), closes [#572](https://github.com/clerk/javascript/issues/572) [#603](https://github.com/clerk/javascript/issues/603)

## [4.6.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.6.0-staging.0...@clerk/clerk-react@4.6.0) (2022-12-08)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.5-staging.0...@clerk/clerk-react@4.5.5) (2022-12-02)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.4-staging.5...@clerk/clerk-react@4.5.4) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.4-staging.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.4-staging.4...@clerk/clerk-react@4.5.4-staging.5) (2022-11-29)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.3-staging.0...@clerk/clerk-react@4.5.3) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.2-staging.0...@clerk/clerk-react@4.5.2) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-react

### [4.5.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.0...@clerk/clerk-react@4.5.1) (2022-11-23)

**Note:** Version bump only for package @clerk/clerk-react

## [4.5.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.0-staging.3...@clerk/clerk-react@4.5.0) (2022-11-22)

**Note:** Version bump only for package @clerk/clerk-react

## [4.5.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.0-staging.2...@clerk/clerk-react@4.5.0-staging.3) (2022-11-21)

### Bug Fixes

- **clerk-react:** Add HeadlessBrowserClerk ([4236147](https://github.com/clerk/javascript/commit/4236147201b32e3f1d60ebbe2c36de8e89e5e2f6))

## [4.5.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.5.0-staging.1...@clerk/clerk-react@4.5.0-staging.2) (2022-11-21)

### Features

- **clerk-js:** Improve DX for headless import ([8d64310](https://github.com/clerk/javascript/commit/8d64310ab23c6e21f8a687e503521245acad8211))

### [4.4.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.4.3-staging.1...@clerk/clerk-react@4.4.3) (2022-11-18)

**Note:** Version bump only for package @clerk/clerk-react

### [4.4.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.4.2-staging.3...@clerk/clerk-react@4.4.2) (2022-11-15)

**Note:** Version bump only for package @clerk/clerk-react

### [4.4.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.4.1-staging.1...@clerk/clerk-react@4.4.1) (2022-11-10)

**Note:** Version bump only for package @clerk/clerk-react

## [4.4.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.4.0-staging.1...@clerk/clerk-react@4.4.0) (2022-11-05)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.3-staging.7...@clerk/clerk-react@4.3.3) (2022-11-03)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.3-staging.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.3-staging.3...@clerk/clerk-react@4.3.3-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.3-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.3-staging.1...@clerk/clerk-react@4.3.3-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.3-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.3-staging.1...@clerk/clerk-react@4.3.3-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.3-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.2...@clerk/clerk-react@4.3.3-staging.1) (2022-11-02)

### Bug Fixes

- **clerk-react:** Add frontendAPI on window as a fallback ([06f8b37](https://github.com/clerk/javascript/commit/06f8b3755cda83455e301591badaf16e1d59dd33))

### [4.3.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.2-staging.0...@clerk/clerk-react@4.3.2) (2022-10-24)

**Note:** Version bump only for package @clerk/clerk-react

### [4.3.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.0...@clerk/clerk-react@4.3.1) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-react

## [4.3.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.3.0-staging.2...@clerk/clerk-react@4.3.0) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-react

## [4.3.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.6...@clerk/clerk-react@4.3.0-staging.1) (2022-10-13)

### Features

- **clerk-js,clerk-react,types:** Wire up `OrganizationSwitcher` and `OrganizationProfile` ([1e34e69](https://github.com/clerk/javascript/commit/1e34e6986ee49aeb9ca9f72cdc5d799d6611b53f))

### [4.2.6](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.6-staging.0...@clerk/clerk-react@4.2.6) (2022-10-07)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.5-staging.0...@clerk/clerk-react@4.2.5) (2022-10-05)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.4-staging.3...@clerk/clerk-react@4.2.4) (2022-10-03)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.3-staging.4...@clerk/clerk-react@4.2.3) (2022-09-29)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.1...@clerk/clerk-react@4.2.2) (2022-09-25)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.1-staging.2...@clerk/clerk-react@4.2.1) (2022-09-24)

**Note:** Version bump only for package @clerk/clerk-react

### [4.2.1-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.1-staging.0...@clerk/clerk-react@4.2.1-staging.1) (2022-09-24)

**Note:** Version bump only for package @clerk/clerk-react

## [4.2.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.2.0-staging.0...@clerk/clerk-react@4.2.0) (2022-09-22)

**Note:** Version bump only for package @clerk/clerk-react

### [4.1.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.1.0-staging.4...@clerk/clerk-react@4.1.1) (2022-09-19)

**Note:** Version bump only for package @clerk/clerk-react

## [4.1.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.1.0-staging.4...@clerk/clerk-react@4.1.0) (2022-09-16)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.10](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.10-staging.0...@clerk/clerk-react@4.0.10) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.9](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.9-staging.0...@clerk/clerk-react@4.0.9) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.8](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.8-staging.0...@clerk/clerk-react@4.0.8) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.7](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.7-staging.2...@clerk/clerk-react@4.0.7) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.6](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.6-staging.0...@clerk/clerk-react@4.0.6) (2022-08-24)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.4...@clerk/clerk-react@4.0.5) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.4-staging.0...@clerk/clerk-react@4.0.4) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.2...@clerk/clerk-react@4.0.3) (2022-08-16)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.2-staging.0...@clerk/clerk-react@4.0.2) (2022-08-09)

**Note:** Version bump only for package @clerk/clerk-react

### [4.0.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.0...@clerk/clerk-react@4.0.1) (2022-08-07)

**Note:** Version bump only for package @clerk/clerk-react

## [4.0.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@4.0.0-staging.1...@clerk/clerk-react@4.0.0) (2022-08-05)

**Note:** Version bump only for package @clerk/clerk-react

### [3.5.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.5.0...@clerk/clerk-react@3.5.1) (2022-08-04)

**Note:** Version bump only for package @clerk/clerk-react

## [3.5.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.4.5...@clerk/clerk-react@3.5.0) (2022-07-13)

### Features

- **nextjs:** Add req.organization access on gssp ([d064448](https://github.com/clerk/javascript/commit/d0644489a71e06df0e751c615b0d03d77967aab2))
- **types,clerk-react,nextjs:** Add loadOrg option for Next.js withServerSideAuth middleware ([0889bde](https://github.com/clerk/javascript/commit/0889bde9bc7f9e1a5d4c1e706c49212e1f7b36f4))

### [3.4.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.4.5-staging.0...@clerk/clerk-react@3.4.5) (2022-07-11)

**Note:** Version bump only for package @clerk/clerk-react

### [3.4.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.4.3...@clerk/clerk-react@3.4.4) (2022-07-07)

**Note:** Version bump only for package @clerk/clerk-react

### [3.4.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.4.2...@clerk/clerk-react@3.4.3) (2022-07-06)

**Note:** Version bump only for package @clerk/clerk-react

### [3.4.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.4.1...@clerk/clerk-react@3.4.2) (2022-07-01)

**Note:** Version bump only for package @clerk/clerk-react

### [3.4.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.4.0...@clerk/clerk-react@3.4.1) (2022-06-24)

**Note:** Version bump only for package @clerk/clerk-react

## [3.4.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.4.0-staging.0...@clerk/clerk-react@3.4.0) (2022-06-16)

**Note:** Version bump only for package @clerk/clerk-react

## [3.3.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.3.0-staging.4...@clerk/clerk-react@3.3.0) (2022-06-06)

**Note:** Version bump only for package @clerk/clerk-react

## [3.3.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.3.0-staging.3...@clerk/clerk-react@3.3.0-staging.4) (2022-06-03)

### Bug Fixes

- **clerk-react:** Correct annotations in isomorphicClerk for setSession ([56abc04](https://github.com/clerk/javascript/commit/56abc04e82ed4adf9f1c366620e08526d52da0f5))

## [3.3.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.3.0-staging.2...@clerk/clerk-react@3.3.0-staging.3) (2022-06-03)

**Note:** Version bump only for package @clerk/clerk-react

## [3.3.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.3.0-staging.1...@clerk/clerk-react@3.3.0-staging.2) (2022-06-02)

**Note:** Version bump only for package @clerk/clerk-react

## [3.3.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.3.0-staging.0...@clerk/clerk-react@3.3.0-staging.1) (2022-06-01)

### Bug Fixes

- **clerk-js:** Emit changes in organization to listeners ([798ee62](https://github.com/clerk/javascript/commit/798ee622e7961d3aa7f8842184f5fadbcfed517f))

### [3.2.18](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.18-staging.1...@clerk/clerk-react@3.2.18) (2022-05-20)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.18-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.17...@clerk/clerk-react@3.2.18-staging.1) (2022-05-18)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.18-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.17...@clerk/clerk-react@3.2.18-staging.0) (2022-05-17)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.17](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.14...@clerk/clerk-react@3.2.17) (2022-05-13)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.16](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.14...@clerk/clerk-react@3.2.16) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.15](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.14...@clerk/clerk-react@3.2.15) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.14](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.14-staging.0...@clerk/clerk-react@3.2.14) (2022-05-11)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.13](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.12...@clerk/clerk-react@3.2.13) (2022-05-06)

### Bug Fixes

- **clerk-react:** Make getOrCreateInstance handle both SSR and CSR instantiation ([d22b808](https://github.com/clerk/javascript/commit/d22b808cf9eee2570be83f247fd25543a0202fd6))
- **clerk-react:** Make isomorphicClerk loading idempotent ([91b6217](https://github.com/clerk/javascript/commit/91b62175cadd82b38747cc6d7a0216f42c89b5fe))
- **clerk-react:** Pass initialState directly to ClerkContextProvider ([9e55b7c](https://github.com/clerk/javascript/commit/9e55b7c2cafdcbcf6d8c210e668a22e07580cdb6))

### [3.2.13-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.12...@clerk/clerk-react@3.2.13-staging.0) (2022-05-05)

### Bug Fixes

- **clerk-react:** Make getOrCreateInstance handle both SSR and CSR instantiation ([8f9481c](https://github.com/clerk/javascript/commit/8f9481cf088c63b3cd3192cb1396596a98b11980))
- **clerk-react:** Make isomorphicClerk loading idempotent ([221919c](https://github.com/clerk/javascript/commit/221919ceab5ad1631073f8ba7564c869ebf7a890))
- **clerk-react:** Pass initialState directly to ClerkContextProvider ([cb777d4](https://github.com/clerk/javascript/commit/cb777d4651710fda248036fdc5398e0dac7aa337))

### [3.2.12](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.12-staging.0...@clerk/clerk-react@3.2.12) (2022-05-05)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.11](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.11-staging.0...@clerk/clerk-react@3.2.11) (2022-04-28)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.10](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.9...@clerk/clerk-react@3.2.10) (2022-04-27)

### Bug Fixes

- **clerk-react:** Define global in window if not defined ([48da3ac](https://github.com/clerk/javascript/commit/48da3ac087406a97380f28c4c9e1057e04eb106f))

### [3.2.9](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.8...@clerk/clerk-react@3.2.9) (2022-04-27)

### Bug Fixes

- **clerk-react:** Type updates for React 18 ([6d5c0bf](https://github.com/clerk/javascript/commit/6d5c0bf33e17885cacd97320c385cf06ca4f5adf))

### [3.2.8](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.8-staging.1...@clerk/clerk-react@3.2.8) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.8-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.8-staging.0...@clerk/clerk-react@3.2.8-staging.1) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.7](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.7-alpha.0...@clerk/clerk-react@3.2.7) (2022-04-18)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.7-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.6...@clerk/clerk-react@3.2.7-alpha.0) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.6](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.5...@clerk/clerk-react@3.2.6) (2022-04-15)

### Bug Fixes

- **clerk-react:** Explicitly type children for React.FC components ([#199](https://github.com/clerk/javascript/issues/199)) ([9fb2ce4](https://github.com/clerk/javascript/commit/9fb2ce46e1e7f60fd31deae43fd1afaf5a1abc62))

### [3.2.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.5-staging.0...@clerk/clerk-react@3.2.5) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.4-staging.0...@clerk/clerk-react@3.2.4) (2022-04-13)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.2...@clerk/clerk-react@3.2.3) (2022-04-07)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.2-staging.0...@clerk/clerk-react@3.2.2) (2022-04-04)

**Note:** Version bump only for package @clerk/clerk-react

### [3.2.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.1-staging.0...@clerk/clerk-react@3.2.1) (2022-03-28)

**Note:** Version bump only for package @clerk/clerk-react

## [3.2.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.2.0-alpha.0...@clerk/clerk-react@3.2.0) (2022-03-24)

**Note:** Version bump only for package @clerk/clerk-react

## [3.2.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.1.2-staging.0...@clerk/clerk-react@3.2.0-staging.0) (2022-03-24)

### Features

- **types,clerk-js,backend-core,clerk-react:** Replace thrown error with null return in getToken ([d972f93](https://github.com/clerk/javascript/commit/d972f93684a39abf3619c335cc012b61d5187100))

### [3.1.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.1.1-staging.0...@clerk/clerk-react@3.1.1-alpha.0) (2022-03-23)

**Note:** Version bump only for package @clerk/clerk-react

## [3.1.0-alpha.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.1.0-alpha.1...@clerk/clerk-react@3.1.0-alpha.2) (2022-03-23)

**Note:** Version bump only for package @clerk/clerk-react

## [3.1.0-alpha.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.0.1-alpha.3...@clerk/clerk-react@3.1.0-alpha.1) (2022-03-23)

### Features

- **clerk-js,types:** Rename UserButton params to afterSignOutUrl, afterMultiSessionSingleSignOutUrl ([c4cb76a](https://github.com/clerk/javascript/commit/c4cb76a1133fd2308b217cacaffb086b175f6347))

## [3.1.0-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.0.1-alpha.3...@clerk/clerk-react@3.1.0-alpha.0) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-react

### [3.0.1-alpha.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.0.1-alpha.2...@clerk/clerk-react@3.0.1-alpha.3) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-react

### [3.0.1-alpha.2](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.0.1-staging.0...@clerk/clerk-react@3.0.1-alpha.2) (2022-03-22)

### Bug Fixes

- **clerk-js,clerk-react:** Move error to getToken ([d5f6b26](https://github.com/clerk/javascript/commit/d5f6b264cf58ce40c68de298b4c7c564d472001f))
- **edge:** Align react getToken ([37a03de](https://github.com/clerk/javascript/commit/37a03de81148294909719d4476b0a2ac3642813c))

### [3.0.1-alpha.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.0.1-staging.0...@clerk/clerk-react@3.0.1-alpha.1) (2022-03-20)

### Bug Fixes

- **clerk-js,clerk-react:** Move error to getToken ([d5f6b26](https://github.com/clerk/javascript/commit/d5f6b264cf58ce40c68de298b4c7c564d472001f))
- **edge:** Align react getToken ([37a03de](https://github.com/clerk/javascript/commit/37a03de81148294909719d4476b0a2ac3642813c))

### [3.0.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@3.0.1-staging.0...@clerk/clerk-react@3.0.1-alpha.0) (2022-03-19)

### Bug Fixes

- **clerk-js,clerk-react:** Move error to getToken ([84d21ce](https://github.com/clerk/javascript/commit/84d21ceac26843a1caa9d9d58f9c10ea2da6395e))
- **edge:** Align react getToken ([37a03de](https://github.com/clerk/javascript/commit/37a03de81148294909719d4476b0a2ac3642813c))

## [3.0.0-alpha.10](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.12.3...@clerk/clerk-react@3.0.0-alpha.10) (2022-03-11)

### Features

- **clerk-react:** Add isLoaded to `useOrganizations` hook ([#92](https://github.com/clerk/javascript/issues/92)) ([a316c7a](https://github.com/clerk/javascript/commit/a316c7a9d66f356639038ce89b5853625e44d4b7))
- **clerk-remix:** Mark clerk-remix as side-effect free to fix Remix bundling ([c57a902](https://github.com/clerk/javascript/commit/c57a9024674a61aa3f2b7e359935e42fc034ffdd))

## [3.0.0-alpha.9](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.4...@clerk/clerk-react@3.0.0-alpha.9) (2022-02-28)

### Features

- **clerk-remix:** Mark clerk-remix as side-effect free to fix Remix bundling ([c57a902](https://github.com/clerk/javascript/commit/c57a9024674a61aa3f2b7e359935e42fc034ffdd))

## [3.0.0-alpha.8](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.4...@clerk/clerk-react@3.0.0-alpha.8) (2022-02-25)

### Features

- **clerk-remix:** Mark clerk-remix as side-effect free to fix Remix bundling ([287a438](https://github.com/clerk/javascript/commit/287a4381d7ebefdf8704e2e29a75ac93f57794c8))

## [3.0.0-alpha.7](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.1...@clerk/clerk-react@3.0.0-alpha.7) (2022-02-18)

### Features

- **clerk-remix:** Mark clerk-remix as side-effect free to fix Remix bundling ([0d22857](https://github.com/clerk/javascript/commit/0d22857197e5d1d2edc4d4df55916009f404dbdd))

### [2.12.6](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.12.6-staging.1...@clerk/clerk-react@2.12.6) (2022-03-17)

**Note:** Version bump only for package @clerk/clerk-react

### [2.12.6-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.12.6-staging.0...@clerk/clerk-react@2.12.6-staging.1) (2022-03-17)

**Note:** Version bump only for package @clerk/clerk-react

### [2.12.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.12.3...@clerk/clerk-react@2.12.4) (2022-03-11)

**Note:** Version bump only for package @clerk/clerk-react

### [2.12.3](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.12.3-staging.0...@clerk/clerk-react@2.12.3) (2022-03-09)

**Note:** Version bump only for package @clerk/clerk-react

### [2.12.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.12.0...@clerk/clerk-react@2.12.1) (2022-03-04)

### Bug Fixes

- **clerk-react,clerk-js,types:** Crate of API feedback fixes ([721ce72](https://github.com/clerk/javascript/commit/721ce7228c37b012891b2bec8caf290239164d05))

## [2.12.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.7...@clerk/clerk-react@2.12.0) (2022-03-04)

### Features

- **clerk-js,clerk-react:** GetOrganization/s hook methods, fetching mechanism alignment ([fc11087](https://github.com/clerk/javascript/commit/fc110874f9a3e056cd43c773c267409dd9b318d6))
- **clerk-js:** Add useOrganization hook ([480c422](https://github.com/clerk/javascript/commit/480c422774472fc712afdfe6ded2677b458d3ef0))
- **clerk-react,clerk-js:** Add useOrganization hook using \_\_unstable attribute ([1635132](https://github.com/clerk/javascript/commit/16351321a99945d167cbf6e6ca0efdbbbf7efe5a))

### [2.11.7](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.6...@clerk/clerk-react@2.11.7) (2022-03-03)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.6](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.5...@clerk/clerk-react@2.11.6) (2022-03-02)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.5](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.4...@clerk/clerk-react@2.11.5) (2022-03-01)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.4](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.4-staging.0...@clerk/clerk-react@2.11.4) (2022-02-24)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.4-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.3-staging.0...@clerk/clerk-react@2.11.4-staging.0) (2022-02-24)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.3-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.2-staging.0...@clerk/clerk-react@2.11.3-staging.0) (2022-02-17)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.2-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.1...@clerk/clerk-react@2.11.2-staging.0) (2022-02-15)

**Note:** Version bump only for package @clerk/clerk-react

### [2.11.1](https://github.com/clerk/javascript/compare/@clerk/clerk-react@2.11.1-staging.0...@clerk/clerk-react@2.11.1) (2022-02-14)

**Note:** Version bump only for package @clerk/clerk-react

### 2.11.1-staging.0 (2022-02-11)

### Features

- **clerk-sdk-node:** Deprecate Session named middleware, introduce withAuth, requireAuth ([4e69553](https://github.com/clerk/javascript/commit/4e695535e41fe7c135cbf303a0d021e7b7d30f7d))
