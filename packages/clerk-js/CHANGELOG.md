# Change Log

## 5.40.3

### Patch Changes

- Introduce the `navbarButtonText` element descriptor. ([#4635](https://github.com/clerk/javascript/pull/4635)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/types@4.39.2
  - @clerk/localizations@3.8.2
  - @clerk/shared@2.19.4

## 5.40.2

### Patch Changes

- Add `socialButtonsRoot` descriptor. ([#4729](https://github.com/clerk/javascript/pull/4729)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`6ea3d39510297b005cde3cd561f56b2e0ea7c61b`](https://github.com/clerk/javascript/commit/6ea3d39510297b005cde3cd561f56b2e0ea7c61b), [`08b3e4042370937b79d4b4167155d6aad1fa9356`](https://github.com/clerk/javascript/commit/08b3e4042370937b79d4b4167155d6aad1fa9356), [`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/localizations@3.8.1
  - @clerk/types@4.39.1
  - @clerk/shared@2.19.3

## 5.40.1

### Patch Changes

- Apply fraud protection logic to all requests ([#4709](https://github.com/clerk/javascript/pull/4709)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`4cb22548da81dd8b186a6ef1cf120aea99c85c62`](https://github.com/clerk/javascript/commit/4cb22548da81dd8b186a6ef1cf120aea99c85c62)]:
  - @clerk/shared@2.19.2

## 5.40.0

### Minor Changes

- Replace `__internal_claimAccountlessKeysUrl` with `__internal_claimKeylessApplicationUrl`. ([#4602](https://github.com/clerk/javascript/pull/4602)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Fixes an issue during sign-up flow where a user lands on the continue step, and proceeds successfully through the sign-up process and gets redirected to AP sign-up due to signUp.id being undefined. ([#4711](https://github.com/clerk/javascript/pull/4711)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Introduce experimental sign-in combined flow. ([#4607](https://github.com/clerk/javascript/pull/4607)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`6fdffaf41f6b79c56dc017e058a670ddbaaf9f42`](https://github.com/clerk/javascript/commit/6fdffaf41f6b79c56dc017e058a670ddbaaf9f42), [`550c7e9851329688e37be29b83ea0c3b12482af7`](https://github.com/clerk/javascript/commit/550c7e9851329688e37be29b83ea0c3b12482af7), [`9393a90eeecd7a8e441a85682a7defa5cc5aa4f2`](https://github.com/clerk/javascript/commit/9393a90eeecd7a8e441a85682a7defa5cc5aa4f2), [`965cb6a8aa47ad57b08dd1c8859117e12ed2eaa7`](https://github.com/clerk/javascript/commit/965cb6a8aa47ad57b08dd1c8859117e12ed2eaa7), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99), [`b9a5bea404cb09d7e328d48b41bd2669feb4e518`](https://github.com/clerk/javascript/commit/b9a5bea404cb09d7e328d48b41bd2669feb4e518), [`e7abe51a9e8baa378c6ad588b4766a60bc2c4433`](https://github.com/clerk/javascript/commit/e7abe51a9e8baa378c6ad588b4766a60bc2c4433)]:
  - @clerk/localizations@3.8.0
  - @clerk/types@4.39.0
  - @clerk/shared@2.19.1

## 5.39.0

### Minor Changes

- Replace usage of `OAUTH_PROVIDERS` and `WEB3_PROVIDERS` from `@clerk/types` to `@clerk/shared`. ([#4716](https://github.com/clerk/javascript/pull/4716)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3), [`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3)]:
  - @clerk/shared@2.19.0
  - @clerk/types@4.38.0
  - @clerk/localizations@3.7.4

## 5.38.0

### Minor Changes

- Introduce a new `allowedRedirectProtocols` option to pass additional allowed protocols for user-provided redirect validation. ([#4705](https://github.com/clerk/javascript/pull/4705)) by [@BRKalow](https://github.com/BRKalow)

### Patch Changes

- Fixes an issue in `UserProfile` where email and username forms could retain stale values from the previous render, leading to incorrect data being sent to FAPI ([#4713](https://github.com/clerk/javascript/pull/4713)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Remove side-effect from `Session` resource initialization that triggered a session cookie update. This cookie update is now explicitly part of the `Clerk.load()` flow. ([#4555](https://github.com/clerk/javascript/pull/4555)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`4e5e7f463c12893a21cb3b5f9317fc3f2945879b`](https://github.com/clerk/javascript/commit/4e5e7f463c12893a21cb3b5f9317fc3f2945879b)]:
  - @clerk/types@4.37.0
  - @clerk/localizations@3.7.3
  - @clerk/shared@2.18.1

## 5.37.0

### Minor Changes

- Support OKW Wallet Web3 provider and authentication strategy ([#4696](https://github.com/clerk/javascript/pull/4696)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Updated dependencies [[`8ee5d84995fa17532491ff96efac5738c9bcd9ef`](https://github.com/clerk/javascript/commit/8ee5d84995fa17532491ff96efac5738c9bcd9ef), [`09fedd1df155d30cc055ce701b133aa6470e9b47`](https://github.com/clerk/javascript/commit/09fedd1df155d30cc055ce701b133aa6470e9b47), [`235eaae4c3c9400492fca47d20a47c7081041565`](https://github.com/clerk/javascript/commit/235eaae4c3c9400492fca47d20a47c7081041565)]:
  - @clerk/localizations@3.7.2
  - @clerk/types@4.36.0
  - @clerk/shared@2.18.0

## 5.36.0

### Minor Changes

- - Update the supported API version to `2024-10-01` that includes the following changes ([#4596](https://github.com/clerk/javascript/pull/4596)) by [@Nikpolik](https://github.com/Nikpolik)

    - Notification for new sign ins to users' accounts feature becomes available.
    - The response for Sign Ins with an email address that matches a **SAML connection** is updated. Instead of responding with a status of `needs_identifier` the API will now return a status of `needs_first_factor` and the email address that matched will be returned in the identifier field. the only strategy that will be included in supported first factors is `enterprise_sso`

    Read more in the [API Version docs](https://clerk.com/docs/backend-requests/versioning/available-versions#2024-10-01)

  - Update components to use the new `enterprise_sso` strategy for sign ins / sign ups that match an enterprise connection and handle the new API response.

    This strategy supersedes SAML to provide a single strategy as the entry point for Enterprise SSO regardless of the underlying protocol used to authenticate the user.

    For now there are two new types of connections that are supported in addition to SAML, Custom OAuth and EASIE (multi-tenant OAuth).

### Patch Changes

- Fix a memory leak in email link flow polling. ([#4515](https://github.com/clerk/javascript/pull/4515)) by [@myandrienko](https://github.com/myandrienko)

- Updated dependencies [[`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d)]:
  - @clerk/types@4.35.1
  - @clerk/localizations@3.7.1
  - @clerk/shared@2.17.1

## 5.35.1

### Patch Changes

- Fix a bug where the the Clerk event listener was not emitting updates when a Session's user data changes. ([#4661](https://github.com/clerk/javascript/pull/4661)) by [@BRKalow](https://github.com/BRKalow)

- Bug fix: Being able to revoke a session from UserProfile. ([#4653](https://github.com/clerk/javascript/pull/4653)) by [@panteliselef](https://github.com/panteliselef)

## 5.35.0

### Minor Changes

- Drop experimental tag related to reverification. ([#4536](https://github.com/clerk/javascript/pull/4536)) by [@panteliselef](https://github.com/panteliselef)

  Properties of Clerk class:

  - `__experimental_openUserVerification` -> `__internal_openReverification`
  - `__experimental_closeUserVerification` -> `__internal_closeReverification`
  - `__experimental_UserVerificationProps` -> `__internal_ReverificationProps`
  - `__experimental_UserVerificationModalProps` -> `__internal_ReverificationModalProps`

  Properties of `Session`:

  - `__experimental_factorVerificationAge` -> `factorVerificationAge`
  - `__experimental_startVerification` -> `startVerification`
  - `__experimental_prepareFirstFactorVerification` -> `prepareFirstFactorVerification`
  - `__experimental_attemptFirstFactorVerification` -> `attemptFirstFactorVerification`
  - `__experimental_prepareSecondFactorVerification` -> `prepareSecondFactorVerification`
  - `__experimental_attemptSecondFactorVerification` -> `attemptSecondFactorVerification`

- If a nonce is provided, it is now made available to Clerk's internal components. This allows the nonce to be passed in to style-src in CSPs and work correctly. ([#4509](https://github.com/clerk/javascript/pull/4509)) by [@jescalan](https://github.com/jescalan)

### Patch Changes

- Include **BUILD_DISABLE_RHC** to allow for builds which remove remotely hosted code as it is a requirement for browser extensions. ([#4133](https://github.com/clerk/javascript/pull/4133)) by [@tmilewski](https://github.com/tmilewski)

- Rename userVerification to reverification to align with the feature name. ([#4634](https://github.com/clerk/javascript/pull/4634)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`d84d7e31235c5c7da3415981dc76db4473a71a39`](https://github.com/clerk/javascript/commit/d84d7e31235c5c7da3415981dc76db4473a71a39), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`dce4f7ffca7248c0500f0ec9a978672b1f2fad69`](https://github.com/clerk/javascript/commit/dce4f7ffca7248c0500f0ec9a978672b1f2fad69)]:
  - @clerk/shared@2.17.0
  - @clerk/types@4.35.0
  - @clerk/localizations@3.7.0

## 5.34.6

### Patch Changes

- Catch and ignore any captcha errors during heartbeat ([#4629](https://github.com/clerk/javascript/pull/4629)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Enable captcha for development instances ([#4620](https://github.com/clerk/javascript/pull/4620)) by [@issuedat](https://github.com/issuedat)

- Add new internal UI component for accountless. ([#4625](https://github.com/clerk/javascript/pull/4625)) by [@panteliselef](https://github.com/panteliselef)

- Decouple captcha heartbeat from token refresh mechanism ([#4630](https://github.com/clerk/javascript/pull/4630)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`c70994b5b6f92a6550dfe37547f01bbfa810c223`](https://github.com/clerk/javascript/commit/c70994b5b6f92a6550dfe37547f01bbfa810c223), [`7623a99594e7329200b6b374e483152d7679ce66`](https://github.com/clerk/javascript/commit/7623a99594e7329200b6b374e483152d7679ce66)]:
  - @clerk/types@4.34.2
  - @clerk/localizations@3.6.6
  - @clerk/shared@2.16.1

## 5.34.5

### Patch Changes

- Collect captcha token on load ([#4623](https://github.com/clerk/javascript/pull/4623)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 5.34.4

### Patch Changes

- Fixes issue where `FormFeedback` was rendering two elements with the same `id` attribute leading to invalid markup. ([#4552](https://github.com/clerk/javascript/pull/4552)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Handle `sign_up_restricted_waitlist` error encountered in an oauth flow ([#4603](https://github.com/clerk/javascript/pull/4603)) by [@nikospapcom](https://github.com/nikospapcom)

- Exclude `_clerk_session_id` query param from `/waitlist` endpoint ([#4594](https://github.com/clerk/javascript/pull/4594)) by [@nikospapcom](https://github.com/nikospapcom)

- Inject captcha token into every X heartbeats ([#4614](https://github.com/clerk/javascript/pull/4614)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`e47eb5882a7fd4a8dee25933c6644790d6ea3407`](https://github.com/clerk/javascript/commit/e47eb5882a7fd4a8dee25933c6644790d6ea3407), [`7510d5cf0ac4d2994849931de8dda75cf605f840`](https://github.com/clerk/javascript/commit/7510d5cf0ac4d2994849931de8dda75cf605f840), [`273d16cb0665d4d960838cb294dc356f41814745`](https://github.com/clerk/javascript/commit/273d16cb0665d4d960838cb294dc356f41814745), [`6b0961765e1f3d09679be4b163fa13ac7dd97191`](https://github.com/clerk/javascript/commit/6b0961765e1f3d09679be4b163fa13ac7dd97191)]:
  - @clerk/shared@2.16.0
  - @clerk/types@4.34.1
  - @clerk/localizations@3.6.5

## 5.34.3

### Patch Changes

- Block /tokens requests until fraud detection completes by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Enforce uppercase rendering for `<ProviderInitialIcon />`. ([#4578](https://github.com/clerk/javascript/pull/4578)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Fixes an issue where the password field would not render during autofill event until the user interacted with the screen. ([#4560](https://github.com/clerk/javascript/pull/4560)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`536fa996ff84a545678a3036b28409824d1c00dd`](https://github.com/clerk/javascript/commit/536fa996ff84a545678a3036b28409824d1c00dd), [`b28c5e8bc44885bf6b1533df48e872ba90c387da`](https://github.com/clerk/javascript/commit/b28c5e8bc44885bf6b1533df48e872ba90c387da)]:
  - @clerk/shared@2.15.0

## 5.34.2

### Patch Changes

- Display logo in `<Waitlist />` component ([#4561](https://github.com/clerk/javascript/pull/4561)) by [@nikospapcom](https://github.com/nikospapcom)

- Correctly handle async requires_captcha error by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 5.34.1

### Patch Changes

- Protect /tokens requests by requiring a valid captcha token if the request fails with 401 ([#4559](https://github.com/clerk/javascript/pull/4559)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`46faeb6f59b19c963fb137c858347525b1cd9e19`](https://github.com/clerk/javascript/commit/46faeb6f59b19c963fb137c858347525b1cd9e19), [`ea6c52dd751abe38b350ee07f148652c24125e22`](https://github.com/clerk/javascript/commit/ea6c52dd751abe38b350ee07f148652c24125e22)]:
  - @clerk/shared@2.14.0
  - @clerk/types@4.34.0
  - @clerk/localizations@3.6.4

## 5.34.0

### Minor Changes

- Surface enterprise accounts in `UserProfile`, allowing to display more protocols besides SAML ([#4518](https://github.com/clerk/javascript/pull/4518)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Introduce the `experimental.rethrowOfflineNetworkErrors` option to the `ClerkProvider` component. ([#4525](https://github.com/clerk/javascript/pull/4525)) by [@anagstef](https://github.com/anagstef)

  When set to `true`, Clerk will rethrow network errors that occur while the user is offline.

### Patch Changes

- Display additional errors from enterprise SSO ([#4553](https://github.com/clerk/javascript/pull/4553)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`1c0b5001f7f975a2f3f54ad692526ecf7257847e`](https://github.com/clerk/javascript/commit/1c0b5001f7f975a2f3f54ad692526ecf7257847e), [`6217a3f7c94311d49f873214bd406961e0b8d6f7`](https://github.com/clerk/javascript/commit/6217a3f7c94311d49f873214bd406961e0b8d6f7), [`1783025cdb94c447028704c2121fa0b8af785904`](https://github.com/clerk/javascript/commit/1783025cdb94c447028704c2121fa0b8af785904)]:
  - @clerk/types@4.33.0
  - @clerk/shared@2.13.0
  - @clerk/localizations@3.6.3

## 5.33.1

### Patch Changes

- Use fapi error long message instead of statusText when throwing API errors. ([#4511](https://github.com/clerk/javascript/pull/4511)) by [@panteliselef](https://github.com/panteliselef)

- Fixes satellite syncing when both the satellite and the primary apps use server-side enabled frameworks like NextJS ([#4516](https://github.com/clerk/javascript/pull/4516)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`cc741adf26d983ae199ad8e7faa6551a80999f16`](https://github.com/clerk/javascript/commit/cc741adf26d983ae199ad8e7faa6551a80999f16)]:
  - @clerk/localizations@3.6.2

## 5.33.0

### Minor Changes

- Replace `redirectUrl` with `afterJoinWaitlistUrl` in `<Waitlist />` component ([#4532](https://github.com/clerk/javascript/pull/4532)) by [@nikospapcom](https://github.com/nikospapcom)

### Patch Changes

- Updated dependencies [[`7dbad4c5abd226d7b10941a626ead5d85b1a3f24`](https://github.com/clerk/javascript/commit/7dbad4c5abd226d7b10941a626ead5d85b1a3f24)]:
  - @clerk/types@4.32.0
  - @clerk/localizations@3.6.1
  - @clerk/shared@2.12.1

## 5.32.0

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

- The Legal consent feature is now stable. ([#4487](https://github.com/clerk/javascript/pull/4487)) by [@octoper](https://github.com/octoper)

  Removed the `__experimental_` preffix.

- Now sending the Frontend API version through query string params ([#4457](https://github.com/clerk/javascript/pull/4457)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Fixes issues in `ClerkRouter` that were causing inaccurate pathnames within Elements flows. Also fixes a dependency issue where `@clerk/elements` was pulling in the wrong version of `@clerk/shared`. ([#4513](https://github.com/clerk/javascript/pull/4513)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Internal change to use component-specific context providers. This change does not impact consumers. ([#4486](https://github.com/clerk/javascript/pull/4486)) by [@dstaley](https://github.com/dstaley)

- Add afterJoinWaitlistUrl to DisplayConfig resource ([#4524](https://github.com/clerk/javascript/pull/4524)) by [@nikospapcom](https://github.com/nikospapcom)

- Updated dependencies [[`75b2fa0ab30f48e8b575adf31ff9ca0e6901f885`](https://github.com/clerk/javascript/commit/75b2fa0ab30f48e8b575adf31ff9ca0e6901f885), [`5a21de1f46df3642828dc27e4862263c9858da2b`](https://github.com/clerk/javascript/commit/5a21de1f46df3642828dc27e4862263c9858da2b), [`f7472e22877f62fc7f3c8d3efe409ff2276fb4a3`](https://github.com/clerk/javascript/commit/f7472e22877f62fc7f3c8d3efe409ff2276fb4a3), [`e199037b8f484abdeeb9fc24455a1b4b8c31c8dd`](https://github.com/clerk/javascript/commit/e199037b8f484abdeeb9fc24455a1b4b8c31c8dd), [`886e294a8d8c54b39cd5bda88d46b89eace3861e`](https://github.com/clerk/javascript/commit/886e294a8d8c54b39cd5bda88d46b89eace3861e), [`0e443ad7c76643420b50e5b169193e03f6ef79f9`](https://github.com/clerk/javascript/commit/0e443ad7c76643420b50e5b169193e03f6ef79f9), [`cc24c8145f1eea7fb91550f2c3e0bac3993e4320`](https://github.com/clerk/javascript/commit/cc24c8145f1eea7fb91550f2c3e0bac3993e4320)]:
  - @clerk/localizations@3.6.0
  - @clerk/shared@2.12.0
  - @clerk/types@4.31.0

## 5.31.2

### Patch Changes

- Re-init window.Clerk options when `ClerkProvider` props change in `@clerk/clerk-react` ([#4498](https://github.com/clerk/javascript/pull/4498)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 5.31.1

### Patch Changes

- Fix an issue where protocol relative URLs were not properly detected as non-relative. ([#4483](https://github.com/clerk/javascript/pull/4483)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`8a04ae47b8305f994b348301fd8134d5baf02943`](https://github.com/clerk/javascript/commit/8a04ae47b8305f994b348301fd8134d5baf02943)]:
  - @clerk/shared@2.11.5

## 5.31.0

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
  - @clerk/localizations@3.5.0
  - @clerk/types@4.30.0
  - @clerk/shared@2.11.4

## 5.30.3

### Patch Changes

- `clerk-js` is now built with [Rspack](https://rspack.dev) instead of Webpack. This is an internal tooling change that shouldn't affect consumers. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Refactor imports from @clerk/shared to improve treeshaking support by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`a7726cc12a824b278f6d2a37cb1901c38c5f70dc`](https://github.com/clerk/javascript/commit/a7726cc12a824b278f6d2a37cb1901c38c5f70dc), [`a7726cc12a824b278f6d2a37cb1901c38c5f70dc`](https://github.com/clerk/javascript/commit/a7726cc12a824b278f6d2a37cb1901c38c5f70dc)]:
  - @clerk/shared@2.11.3
  - @clerk/localizations@3.4.4

## 5.30.0

### Minor Changes

- - Introduce `redirectUrl` property on `setActive` as a replacement for `beforeEmit`. ([#4312](https://github.com/clerk/javascript/pull/4312)) by [@issuedat](https://github.com/issuedat)

  - Deprecates `beforeEmit` property on `setActive`.

### Patch Changes

- Experimental: `asStandalone` now accepts a callback that notifies if the standalone popover needs to unmount. ([#4423](https://github.com/clerk/javascript/pull/4423)) by [@panteliselef](https://github.com/panteliselef)

- Improve checkbox label alignment to account for wrapping labels. ([#4426](https://github.com/clerk/javascript/pull/4426)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Remove unused `fitTextInOneLine` and `textWidthForCurrentSize` ([#4407](https://github.com/clerk/javascript/pull/4407)) by [@zythosec](https://github.com/zythosec)

- Chore: Replace beforeEmit with an explicit call after `setActive`, inside the experimental UserVerification. ([#4362](https://github.com/clerk/javascript/pull/4362)) by [@panteliselef](https://github.com/panteliselef)

- - Changed `__experimental_legalAccepted` checkbox Indicator element descriptor and element id ([#4427](https://github.com/clerk/javascript/pull/4427)) by [@octoper](https://github.com/octoper)

  - Changed `__experimental_legalAccepted` checkbox Label element descriptor and element id
  - Added two new element descriptors `formFieldCheckboxInput`, `formFieldCheckboxLabel`.

- Updated dependencies [[`f875463da`](https://github.com/clerk/javascript/commit/f875463da9692f2d173b6d5388743cf720750ae3), [`5be7ca9fd`](https://github.com/clerk/javascript/commit/5be7ca9fd239c937cc88e20ce8f5bfc9f3b84f22), [`c2f5071be`](https://github.com/clerk/javascript/commit/c2f5071be151130a62340eb35f19cec64313645e), [`08c5a2add`](https://github.com/clerk/javascript/commit/08c5a2add6872c76e62fc0df06db723e3728452e), [`ae0621972`](https://github.com/clerk/javascript/commit/ae0621972fcb4b8039b723436eac3f45e81487bc), [`cd2189ac8`](https://github.com/clerk/javascript/commit/cd2189ac89653e5dad8732d7f592f222962737e9), [`159877be0`](https://github.com/clerk/javascript/commit/159877be0f4aaed89d17d864cfe7ce633a4531e0), [`434b432f8`](https://github.com/clerk/javascript/commit/434b432f8c114825120eef0f2c278b8142ed1563)]:
  - @clerk/types@4.29.0
  - @clerk/localizations@3.4.1
  - @clerk/shared@2.11.0

## 5.29.1

### Patch Changes

- Move `@clerk/ui` to `devDependencies` ([#4399](https://github.com/clerk/javascript/pull/4399)) by [@dstaley](https://github.com/dstaley)

- Show an error on `<UserProfile />` if the Web3 wallet is already claimed. ([#4389](https://github.com/clerk/javascript/pull/4389)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

- Fix for legal consent rendered on the <SignUp/> component when only social sign up is enabled ([#4403](https://github.com/clerk/javascript/pull/4403)) by [@octoper](https://github.com/octoper)

## 5.29.0

### Minor Changes

- Adding experimental support for legal consent for `<SignUp/>` component ([#4337](https://github.com/clerk/javascript/pull/4337)) by [@octoper](https://github.com/octoper)

### Patch Changes

- Updated dependencies [[`3fdcdbf88`](https://github.com/clerk/javascript/commit/3fdcdbf88c38facf8b82563f634ec1b6604fd8e5), [`f9d53fe34`](https://github.com/clerk/javascript/commit/f9d53fe3444db5154dba47270a06c6a76dbea69f)]:
  - @clerk/localizations@3.4.0
  - @clerk/types@4.28.0
  - @clerk/ui@0.1.10
  - @clerk/shared@2.10.1

## 5.28.0

### Minor Changes

- Add experimental support for new UI components ([#4114](https://github.com/clerk/javascript/pull/4114)) by [@BRKalow](https://github.com/BRKalow)

### Patch Changes

- Bug fix: Always receive a new session verification object when UserVerification component mounts. ([#4359](https://github.com/clerk/javascript/pull/4359)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc), [`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc)]:
  - @clerk/shared@2.10.0
  - @clerk/types@4.27.0
  - @clerk/localizations@3.3.1

## 5.27.0

### Minor Changes

- Drop `maxAgeMinutes` from `__experimental_startVerification`. ([#4338](https://github.com/clerk/javascript/pull/4338)) by [@panteliselef](https://github.com/panteliselef)

  Drop types `__experimental_SessionVerificationConfig` and `__experimental_SessionVerificationMaxAgeMinutes`.

- The "Restricted access" screen has been improved for visual consistency and the ability to contact support. The displayed texts have been made more clear and the sign-in button has been moved to the bottom. ([#4335](https://github.com/clerk/javascript/pull/4335)) by [@nikospapcom](https://github.com/nikospapcom)

- Add experimental standalone mode for `<UserButton />` and `<OrganizationSwitcher />`. ([#4042](https://github.com/clerk/javascript/pull/4042)) by [@panteliselef](https://github.com/panteliselef)

  When `__experimental_asStandalone: true` the component will not render its trigger, and instead it will render only the contents of the popover in place.

  APIs that changed:

  - (For internal usage) Added `__experimental_prefetchOrganizationSwitcher` as a way to mount an internal component that will render the `useOrganizationList()` hook and prefetch the necessary data for the popover of `<OrganizationSwitcher />`. This enhances the UX since no loading state will be visible and keeps CLS to the minimum.
  - New property for `mountOrganizationSwitcher(node, { __experimental_asStandalone: true })`
  - New property for `mountUserButton(node, { __experimental_asStandalone: true })`

- Use EIP-4361 message spec for Web3 wallets sign in signature requests ([#4334](https://github.com/clerk/javascript/pull/4334)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Retry with exponential backoff if loadScript fails to load the script ([#4349](https://github.com/clerk/javascript/pull/4349)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Add the `?render=explicit` query parameter to the Turnstile script. ([#4332](https://github.com/clerk/javascript/pull/4332)) by [@anagstef](https://github.com/anagstef)

- Updated dependencies [[`e81d45b72`](https://github.com/clerk/javascript/commit/e81d45b72c81403c7c206dac5454de1fef6bec57), [`752ce9bfa`](https://github.com/clerk/javascript/commit/752ce9bfa47a8eebd38cd272eeb58ae26fea3371), [`0a9bf8ef4`](https://github.com/clerk/javascript/commit/0a9bf8ef4902606f06b371e11c7ae84d493eda6c), [`99cdf9b67`](https://github.com/clerk/javascript/commit/99cdf9b67d1e99e66cc73d8a5bfce1f1f8df1b83), [`ce40ff6f0`](https://github.com/clerk/javascript/commit/ce40ff6f0d3bc79e33375be6dd5e03f140a07000), [`2102052c0`](https://github.com/clerk/javascript/commit/2102052c017065ab511339870fcebaa6719f2702)]:
  - @clerk/types@4.26.0
  - @clerk/shared@2.9.2
  - @clerk/localizations@3.3.0

## 5.26.5

### Patch Changes

- Only retry the OAuth flow if the captcha check failed. ([#4329](https://github.com/clerk/javascript/pull/4329)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Improve bot detection by loading the Turnstile SDK directly from CloudFlare. ([#4321](https://github.com/clerk/javascript/pull/4321)) by [@anagstef](https://github.com/anagstef)

  If loading fails due to CSP rules, load it through FAPI instead.

- Bypass captcha for providers dynamically provided in environment ([#4322](https://github.com/clerk/javascript/pull/4322)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`d64e54c40`](https://github.com/clerk/javascript/commit/d64e54c40c9cf001b25e45a1b8939c9f7e80c6d6), [`2ba2fd148`](https://github.com/clerk/javascript/commit/2ba2fd1483b7561d7df9a1952ead0ee15e422131)]:
  - @clerk/shared@2.9.1
  - @clerk/types@4.25.1
  - @clerk/localizations@3.2.1

## 5.26.4

### Patch Changes

- Correctly handle malformed or protocol-relative URLs before navigating to cross-origin URLs ([#4317](https://github.com/clerk/javascript/pull/4317)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 5.26.3

### Patch Changes

- Update `OrganizationSwitcher` popover action to include label ([#4304](https://github.com/clerk/javascript/pull/4304)) by [@LauraBeatris](https://github.com/LauraBeatris)

## 5.26.2

### Patch Changes

- Handle gracefully Coinbase Wallet use of existing Passkey ([#4302](https://github.com/clerk/javascript/pull/4302)) by [@chanioxaris](https://github.com/chanioxaris)

- Updates webpack to address CVE-2024-43788. ([#4287](https://github.com/clerk/javascript/pull/4287)) by [@dependabot](https://github.com/apps/dependabot)

- Updated dependencies [[`e29a8061d`](https://github.com/clerk/javascript/commit/e29a8061d4106b9192837056e5f505c05f3c3a64), [`00a9ddb5b`](https://github.com/clerk/javascript/commit/00a9ddb5bd566fea7f22182047ae2c02e28e2ddc)]:
  - @clerk/localizations@3.2.0

## 5.26.1

### Patch Changes

- Enable "Send invitation" button when default role is loaded ([#4281](https://github.com/clerk/javascript/pull/4281)) by [@LauraBeatris](https://github.com/LauraBeatris)

## 5.26.0

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
  - @clerk/localizations@3.1.2

## 5.25.0

### Minor Changes

- Drop the experimental mounted variant of `UserVerification`. ([#4266](https://github.com/clerk/javascript/pull/4266)) by [@panteliselef](https://github.com/panteliselef)

  Removes:

  - `<__experimental_UserVerification/>`
  - `__experimental_mountUserVerification()`
  - `__experimental_unmountUserVerification()`

- _Experimental Feature_: `<UserProfile/>` allows users to update their information. Mostly of this information is considered sensitive data. ([#4127](https://github.com/clerk/javascript/pull/4127)) by [@panteliselef](https://github.com/panteliselef)

  We want to ensure that only the users themselves can alter any sensitive data.

  To increase security we are now, require users to re-verify their credentials when they are about to perform these actions:

  | Operation                        | Reverification | Strategy            | Timeframe |
  | -------------------------------- | -------------- | ------------------- | --------- |
  | Update account (first/last name) | ❌             |                     |           |
  | Update username                  | ✅             | Strongest available | 10m       |
  | Delete account                   | ✅             | Strongest available | 10m       |
  | Create/Remove profile image      | ❌             |                     |           |
  | Update password                  | ✅             | Strongest available | 10m       |
  | Remove password                  | ❌             |                     |           |
  | Revoke session                   | ✅             | Strongest available | 10m       |
  | Create identification            | ✅             | Strongest available | 10m       |
  | Remove identification            | ✅             | Strongest available | 10m       |
  | Change primary identification    | ✅             | Strongest available | 10m       |
  | Update Passkey name              | ❌             |                     |           |
  | Enable MFA (TOTP, Phone number)  | ✅             | Strongest available | 10m       |
  | Disable MFA (TOΤP, Phone number) | ✅             | Strongest available | 10m       |
  | Create/Regenerate Backup Codes   | ✅             | Strongest available | 10m       |
  | Connect External Account         | ✅             | Strongest available | 10m       |
  | Re-authorize External Account    | ❌             |                     |           |
  | Remove External Account          | ✅             | Strongest available | 10m       |
  | Leave organization               | ❌             |                     |           |

- We recently shipped an experimental feature to persist the Clerk client (under `persistClient` flag) as an opt-in. This allows for matching a user's device with a client. We want to test this behavior with more users, so we're making it opt-out as the next step. After more successful testing we'll remove the experimental flag and enable it by default. ([#4250](https://github.com/clerk/javascript/pull/4250)) by [@panteliselef](https://github.com/panteliselef)

  If you're encountering issues, please open an issue. You can disable this new behavior like so:

  ```js
  // React
  <ClerkProvider experimental={{ persistClient: false }} />;

  // Vanilla JS
  await clerk.load({ experimental: { persistClient: false } });
  ```

### Patch Changes

- Allow single-character usernames in `<UserProfile />` validation ([#4243](https://github.com/clerk/javascript/pull/4243)) by [@nikospapcom](https://github.com/nikospapcom)

- Handle gracefully yet unknown to our components Web3 providers ([#4263](https://github.com/clerk/javascript/pull/4263)) by [@chanioxaris](https://github.com/chanioxaris)

- Navigate to `/choose` when signing out during multi session. ([#4203](https://github.com/clerk/javascript/pull/4203)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`f6fb8b53d`](https://github.com/clerk/javascript/commit/f6fb8b53d236863ad7eca576ee7a16cd33f3506b), [`4a8570590`](https://github.com/clerk/javascript/commit/4a857059059a02bb4f20893e08601e1e67babbed)]:
  - @clerk/types@4.24.0
  - @clerk/localizations@3.1.1
  - @clerk/shared@2.8.5

## 5.24.1

### Patch Changes

- Maintain focus on password input after error during sign in flow. ([#4240](https://github.com/clerk/javascript/pull/4240)) by [@alexcarpenter](https://github.com/alexcarpenter)

## 5.24.0

### Minor Changes

- Handle `sign_up_mode_restricted` error encountered in an oauth flow ([#4232](https://github.com/clerk/javascript/pull/4232)) by [@nikospapcom](https://github.com/nikospapcom)

- Render "Restricted access" screen in `<SignUp />` component when `signup.mode` in `userSettings` is `restricted` ([#4220](https://github.com/clerk/javascript/pull/4220)) by [@nikospapcom](https://github.com/nikospapcom)

### Patch Changes

- Correctly pass `defaultOpen` prop to `OrganizationSwitcher` popover instance. ([#4233](https://github.com/clerk/javascript/pull/4233)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Conditionally renders identification sections on `UserProfile` based on the SAML connection configuration for disabling additional identifiers. ([#4211](https://github.com/clerk/javascript/pull/4211)) by [@NicolasLopes7](https://github.com/NicolasLopes7)

- Updated dependencies [[`4749ed4c5`](https://github.com/clerk/javascript/commit/4749ed4c55a5ba5810451b8d436aad0d49829050), [`f1f17eaab`](https://github.com/clerk/javascript/commit/f1f17eaabed0dc4b7de405fb77d85503cf75ad33), [`2e35ac538`](https://github.com/clerk/javascript/commit/2e35ac53885f8008779940d41d1e804fa77ebfa9)]:
  - @clerk/types@4.23.0
  - @clerk/localizations@3.1.0
  - @clerk/shared@2.8.4

## 5.23.0

### Minor Changes

- Hide sign up url from `<SignIn />` component when mode is `restricted` ([#4206](https://github.com/clerk/javascript/pull/4206)) by [@nikospapcom](https://github.com/nikospapcom)

### Patch Changes

- Handle gracefully Coinbase Wallet initial configuration ([#4218](https://github.com/clerk/javascript/pull/4218)) by [@chanioxaris](https://github.com/chanioxaris)

- Supports default role on `OrganizationProfile` invitations. When inviting a member, the default role will be automatically selected, otherwise it falls back to the only available role. ([#4210](https://github.com/clerk/javascript/pull/4210)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Add type for \_\_internal_country ([#4215](https://github.com/clerk/javascript/pull/4215)) by [@dstaley](https://github.com/dstaley)

- Updated dependencies [[`c9063853e`](https://github.com/clerk/javascript/commit/c9063853e538a4010f5d4e522a3da5abc80098a4), [`19d3808d4`](https://github.com/clerk/javascript/commit/19d3808d4672234944226d6709ec51214e8d6e1d), [`737bcbb0f`](https://github.com/clerk/javascript/commit/737bcbb0ffb5e2dcadbb02e8fc718fe8825c5842)]:
  - @clerk/types@4.22.0
  - @clerk/localizations@3.0.6
  - @clerk/shared@2.8.3

## 5.22.4

### Patch Changes

- Fix UserProfile and OrganizationProfile wrong padding on footer for small screens when Development notice is enabled ([#4191](https://github.com/clerk/javascript/pull/4191)) by [@octoper](https://github.com/octoper)

- Internal change to move `iconImageUrl` util to `shared` package. ([#4188](https://github.com/clerk/javascript/pull/4188)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Only render the Sign out of all accounts action within `<UserButton />` when there are multiple sessions. ([#4200](https://github.com/clerk/javascript/pull/4200)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`cb32aaf59`](https://github.com/clerk/javascript/commit/cb32aaf59d38dcd12e959f542782f71a87adf9c1), [`2e5c550e4`](https://github.com/clerk/javascript/commit/2e5c550e4aec61150c2a17fdcd4a0e1273cb50e7), [`6275c242c`](https://github.com/clerk/javascript/commit/6275c242cd8bcb6f7766934059967e0fe775a0c1), [`f9faaf031`](https://github.com/clerk/javascript/commit/f9faaf03100baf679c78e6c24877fbf3b60be529)]:
  - @clerk/shared@2.8.2
  - @clerk/types@4.21.1
  - @clerk/localizations@3.0.5

## 5.22.3

### Patch Changes

- Restore behavior of MetaMask compatible Web3 wallets. Before, even if a user didn't use the MetaMask browser extension but a compatible one, such as Rabby Wallet, it was possible to use it as they share the same API to authenticate themselves. This behavior stopped working when we added support for EIP6963 regarding handling multiple injected providers. This commit restores the previous behavior by using the existing injected provider if there is a single one ([#4185](https://github.com/clerk/javascript/pull/4185)) by [@chanioxaris](https://github.com/chanioxaris)

- Updated dependencies [[`5dde18f6b`](https://github.com/clerk/javascript/commit/5dde18f6b55ed4d5c2a6a5246ee3b3ba0d077df3)]:
  - @clerk/localizations@3.0.4

## 5.22.2

### Patch Changes

- Add color to phone input select options to fix rendering within dark and shadesOfPurple themes. ([#4176](https://github.com/clerk/javascript/pull/4176)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`3743eb911`](https://github.com/clerk/javascript/commit/3743eb9114733f20ed56a863ab98fa9c363b6723)]:
  - @clerk/shared@2.8.1

## 5.22.1

### Patch Changes

- Updated dependencies [[`2d8e6e9d0`](https://github.com/clerk/javascript/commit/2d8e6e9d00ce3568bceb4cb79421eb61c0cf8715), [`bcc5eba39`](https://github.com/clerk/javascript/commit/bcc5eba39260ec1f99c0e0bd95e8ea13ce73e921)]:
  - @clerk/localizations@3.0.3

## 5.22.0

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

- Adds translation keys for error messages from the [organizations API](https://clerk.com/docs/references/api/organizations#errors). ([#4123](https://github.com/clerk/javascript/pull/4123)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`23b850f5f`](https://github.com/clerk/javascript/commit/23b850f5f8a8316ab5cadbefffedf6ca88eaa6fe), [`ace56babd`](https://github.com/clerk/javascript/commit/ace56babdc3739e4c34497a44a324709a7ea688f), [`ba19be354`](https://github.com/clerk/javascript/commit/ba19be35461f0e5c76a58d11e4252a16781322c6), [`248142a6d`](https://github.com/clerk/javascript/commit/248142a6ded6ca937d0df7d628197f25228aadec), [`1189f71f8`](https://github.com/clerk/javascript/commit/1189f71f872f2683c12de5add5f154aeb953ca8d), [`de1ba10b4`](https://github.com/clerk/javascript/commit/de1ba10b4deabd2f8b21a54908e2b054f1cfd71c)]:
  - @clerk/localizations@3.0.2
  - @clerk/shared@2.8.0
  - @clerk/types@4.21.0

## 5.21.2

### Patch Changes

- Updated dependencies [[`be3b119f8`](https://github.com/clerk/javascript/commit/be3b119f840d2ae74f4b75d717711d53ac0e5f54)]:
  - @clerk/shared@2.7.2

## 5.21.1

### Patch Changes

- Update type of `__experimental_factorVerificationAge` to be `[number, number] | null`. ([#4135](https://github.com/clerk/javascript/pull/4135)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`8c6909d46`](https://github.com/clerk/javascript/commit/8c6909d46328c943f1d464a28f1a324a27d0f3f1)]:
  - @clerk/types@4.20.1
  - @clerk/localizations@3.0.1
  - @clerk/shared@2.7.1

## 5.21.0

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

- Fix bug where session.getToken() was reading a stale organization ID. ([#4112](https://github.com/clerk/javascript/pull/4112)) by [@BRKalow](https://github.com/BRKalow)

- Drop support for deprecated Coinbase Web3 provider ([#4092](https://github.com/clerk/javascript/pull/4092)) by [@chanioxaris](https://github.com/chanioxaris)

- Ensure we don't access `window.addEventListener()` and `window.dispatchEvent` in non-browser environments. ([#4095](https://github.com/clerk/javascript/pull/4095)) by [@wobsoriano](https://github.com/wobsoriano)

- Support `phone_code` as first factor for the experimental UserVerification component. ([#4085](https://github.com/clerk/javascript/pull/4085)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`c63a5adf0`](https://github.com/clerk/javascript/commit/c63a5adf0ba4b99252146f168318f51b709bb5dd), [`8823c21a2`](https://github.com/clerk/javascript/commit/8823c21a26bc81cbc3ed007908b1a9ea474bd343), [`95ac67a14`](https://github.com/clerk/javascript/commit/95ac67a143c263bef0c1f589728566ab8f95768d), [`a0cb062fa`](https://github.com/clerk/javascript/commit/a0cb062faa4d23bef7a577e5cc486f4c5efe6bfa), [`746b4ed5e`](https://github.com/clerk/javascript/commit/746b4ed5e2007505d5850a2a728484809474d7bf), [`feb9e14d4`](https://github.com/clerk/javascript/commit/feb9e14d4ae7d4dd197f23cdb9dd1fea3ec4856f)]:
  - @clerk/types@4.20.0
  - @clerk/shared@2.7.0
  - @clerk/localizations@3.0.0

## 5.20.0

### Minor Changes

- Add support for the Coinbase Wallet web3 provider and authentication strategy. The Coinbase Wallet provider handles both Coinbase Wallet extension and Smart Wallet ([#4082](https://github.com/clerk/javascript/pull/4082)) by [@chanioxaris](https://github.com/chanioxaris)

- **Experimental:** Persist the Clerk client after signing out a user. ([#3941](https://github.com/clerk/javascript/pull/3941)) by [@panteliselef](https://github.com/panteliselef)

  This allows for matching a user's device with a client. To try out this new feature, enable it in your `<ClerkProvider />` or `clerk.load()` call.

  ```js
  // React
  <ClerkProvider experimental={{ persistClient: true }} />;

  // Vanilla JS
  await clerk.load({ experimental: { persistClient: true } });
  ```

### Patch Changes

- Updated dependencies [[`8a3b9f079`](https://github.com/clerk/javascript/commit/8a3b9f0793484b32dd609a5c80a194e62151d6ea), [`e95c28196`](https://github.com/clerk/javascript/commit/e95c2819675cea7963f2404e5f71f37ebed8d5e0)]:
  - @clerk/types@4.19.0
  - @clerk/localizations@2.8.1
  - @clerk/shared@2.6.2

## 5.19.0

### Minor Changes

- Add new `UserVerification` component (experimental feature). This UI component allows for a user to "re-enter" their credentials (first factor and/or second factor) which results in them being re-verified. ([#4016](https://github.com/clerk/javascript/pull/4016)) by [@panteliselef](https://github.com/panteliselef)

  New methods have been added:

  - `__experimental_openUserVerification()`
  - `__experimental_closeUserVerification()`
  - `__experimental_mountUserVerification(targetNode: HTMLDivElement)`
  - `__experimental_unmountUserVerification(targetNode: HTMLDivElement)`

- Move SessionVerification methods from UserResource to SessionResource: ([#4073](https://github.com/clerk/javascript/pull/4073)) by [@panteliselef](https://github.com/panteliselef)

  - `user.__experimental_verifySession` -> `session.__experimental_startVerification`
  - `user.__experimental_verifySessionPrepareFirstFactor` -> `session.__experimental_prepareFirstFactorVerification`
  - `user.__experimental_verifySessionAttemptFirstFactor` -> `session.__experimental_attemptFirstFactorVerification`
  - `user.__experimental_verifySessionPrepareSecondFactor` -> `session.__experimental_prepareSecondFactorVerification`
  - `user.__experimental_verifySessionAttemptSecondFactor` -> `session.__experimental_attemptSecondFactorVerification`

### Patch Changes

- Bug fix: Use the EIP-6963 standard to get a Web3 provider when more than one provider is injected. ([#4059](https://github.com/clerk/javascript/pull/4059)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

- chore(clerk-js): Display shortened web3 wallet address on user profile ([#4074](https://github.com/clerk/javascript/pull/4074)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

- chore(clerk-js): Add 'Unverified' or 'Primary' tag next to the Web3 wallet address on the user profile. ([#4077](https://github.com/clerk/javascript/pull/4077)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

- Updated dependencies [[`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733), [`82593173a`](https://github.com/clerk/javascript/commit/82593173aafbf6646e12c5779627cdcb138a1f27), [`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733)]:
  - @clerk/localizations@2.8.0
  - @clerk/types@4.18.0
  - @clerk/shared@2.6.1

## 5.18.0

### Minor Changes

- Add support for Coinbase Wallet strategy during sign in/up flows. Users can now authenticate using their Coinbase Wallet browser extension in the same way as MetaMask ([#4052](https://github.com/clerk/javascript/pull/4052)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Tidy up and improve README ([#4053](https://github.com/clerk/javascript/pull/4053)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`58e6754ad`](https://github.com/clerk/javascript/commit/58e6754ad9f9a1244b023ce1f5e5f2c1c4eb20e7), [`13693018f`](https://github.com/clerk/javascript/commit/13693018f4f7ac5d224698aa730e20960896f68c), [`3aa63dc5a`](https://github.com/clerk/javascript/commit/3aa63dc5a48161cfe92d94093ef0c32efd401342), [`3304dcc0b`](https://github.com/clerk/javascript/commit/3304dcc0bc93a92a7f729f585c60ff91d2ae04f6)]:
  - @clerk/localizations@2.7.1
  - @clerk/types@4.17.0
  - @clerk/shared@2.6.0

## 5.17.0

### Minor Changes

- Support connecting Coinbase Wallet via <UserProfile /> ([#4030](https://github.com/clerk/javascript/pull/4030)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Fix 404s after signing out in NextJS apps by keeping the session cookie while cache is being invalidated ([#4001](https://github.com/clerk/javascript/pull/4001)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`7ca43acae`](https://github.com/clerk/javascript/commit/7ca43acaeb8d0b5dc842d20f78c53dec554e4829), [`c1389492d`](https://github.com/clerk/javascript/commit/c1389492d8b6a9292ab04889bf776c0f45e66845)]:
  - @clerk/localizations@2.7.0
  - @clerk/types@4.16.0
  - @clerk/shared@2.5.5

## 5.16.1

### Patch Changes

- Remove sessionId parameter from all **experimental** verify session methods. ([#4026](https://github.com/clerk/javascript/pull/4026)) by [@panteliselef](https://github.com/panteliselef)

- Introduce Coinbase Wallet Web3 provider types ([#4028](https://github.com/clerk/javascript/pull/4028)) by [@chanioxaris](https://github.com/chanioxaris)

- Change the webpackChunkName of GoogleOneTap from `"oneTap"` to `"onetap"` for consistency. ([#4036](https://github.com/clerk/javascript/pull/4036)) by [@panteliselef](https://github.com/panteliselef)

- Fixes issue where `createFlexGapPropertyIosCompat` was incorrectly detecting a modern Chrome for iOS user agent. ([#4034](https://github.com/clerk/javascript/pull/4034)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Introduce support for the Hugging Face OAuth Provider. ([#4021](https://github.com/clerk/javascript/pull/4021)) by [@Nikpolik](https://github.com/Nikpolik)

- Updated dependencies [[`0158c774a`](https://github.com/clerk/javascript/commit/0158c774af2243a2cd13b55c4d6fae877178c961), [`8be1a7abc`](https://github.com/clerk/javascript/commit/8be1a7abc8849d7d59552011bd6b25bc917d51f5)]:
  - @clerk/types@4.15.1
  - @clerk/localizations@2.6.3
  - @clerk/shared@2.5.4

## 5.16.0

### Minor Changes

- Expose `SessionVerification` as an experimental resource. ([#4011](https://github.com/clerk/javascript/pull/4011)) by [@panteliselef](https://github.com/panteliselef)

  Update `UserResource` with 5 new experimental methods:

  - `experimental_verifySession` for creating a new SessionVerification record and initiating a new flow.
  - `experimental_verifySessionPrepareFirstFactor` for preparing a supported first factor like `phone_code`
  - `experimental_verifySessionAttemptFirstFactor` for attempting a supported first factor like `password`
  - `experimental_verifySessionPrepareSecondFactor` for preparing a supported second factor like `phone_code`
  - `experimental_verifySessionAttemptSecondFactor` for attempting a supported second factor like `totp`

- Fixes a bug where multiple tabs with different active organizations would not always respect the selected organization. Going forward, when a tab is focused the active organization will immediately be updated to the tab's last active organization. ([#3786](https://github.com/clerk/javascript/pull/3786)) by [@BRKalow](https://github.com/BRKalow)

  Additionally, `Clerk.session.getToken()` now accepts an `organizationId` option. The provided organization ID will be used to set organization-related claims in the generated session token.

### Patch Changes

- - Fixes an issue in Connected Accounts menu that was related to Custom OAuth Providers: ([#4014](https://github.com/clerk/javascript/pull/4014)) by [@nikospapcom](https://github.com/nikospapcom)

  - Resolves undefined properties error that occurred when a Custom OAuth Provider was `enabled` but `authenticatable` was set to `false`.

- Fix issue where MFA two-factor UI was incorrectly rendering set default action in SMS code when TOTP strategy was defined. ([#4003](https://github.com/clerk/javascript/pull/4003)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`247b3fd75`](https://github.com/clerk/javascript/commit/247b3fd75042365dc9f950db056b76f9fadfdcf6)]:
  - @clerk/types@4.15.0
  - @clerk/localizations@2.6.2
  - @clerk/shared@2.5.3

## 5.15.1

### Patch Changes

- Improve the Smart CAPTCHA widget console error. ([#3989](https://github.com/clerk/javascript/pull/3989)) by [@agis](https://github.com/agis)

- Updated dependencies [[`c81785972`](https://github.com/clerk/javascript/commit/c81785972c1b6fdf76b7765a4c48d1a4ca1a776b), [`05198fd17`](https://github.com/clerk/javascript/commit/05198fd1791f81b4fc36d0f7d4cec750205d8ab9), [`5818ca8bd`](https://github.com/clerk/javascript/commit/5818ca8bd0f24c29bac0876c2aa88b0fe919b418)]:
  - @clerk/localizations@2.6.1

## 5.15.0

### Minor Changes

- Inject `windowNavigate` through router functions. ([#3922](https://github.com/clerk/javascript/pull/3922)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Fixes an issue where the application logo would render smaller then intended ([#3959](https://github.com/clerk/javascript/pull/3959)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`77cdf7611`](https://github.com/clerk/javascript/commit/77cdf7611869c023ff5263a0198b926f37a8289c), [`3de0a1b7e`](https://github.com/clerk/javascript/commit/3de0a1b7e3d2ba7e90eea0492e56f29ab10a24a1), [`ec6bfb5b1`](https://github.com/clerk/javascript/commit/ec6bfb5b16581e3521ff11494b288d76c875974b), [`dc0e1c33d`](https://github.com/clerk/javascript/commit/dc0e1c33d6844b028cb1ee11c3359b886d609f3c), [`e5491facc`](https://github.com/clerk/javascript/commit/e5491facc6a88c1bd9236a88e3b909f0b0b9d1d3), [`072667043`](https://github.com/clerk/javascript/commit/07266704348c3cafb19f81b7d7a28a03058e2ea1)]:
  - @clerk/localizations@2.6.0
  - @clerk/types@4.14.0
  - @clerk/shared@2.5.2

## 5.14.1

### Patch Changes

- Add development mode warning in the browser console when `load()` happens. Companion PR for [Add dev mode warning to components](https://github.com/clerk/javascript/pull/3870). ([#3930](https://github.com/clerk/javascript/pull/3930)) by [@LekoArts](https://github.com/LekoArts)

- Fix unresponsive behavior when clicking placeholder logo in the `<CreateOrganization />` component ([#3921](https://github.com/clerk/javascript/pull/3921)) by [@wobsoriano](https://github.com/wobsoriano)

- In certain situations the Frontend API response contains [`supported_first_factors`](https://clerk.com/docs/reference/frontend-api/tag/Sign-Ins#operation/createSignIn!c=200&path=response/supported_first_factors&t=response) with a `null` value while the current code always assumed to receive an array. `SignInResource['supportedFirstFactors']` has been updated to account for that and any code accessing this value has been made more resilient against `null` values. ([#3938](https://github.com/clerk/javascript/pull/3938)) by [@dstaley](https://github.com/dstaley)

- Updated dependencies [[`7e0ced3da`](https://github.com/clerk/javascript/commit/7e0ced3da94f41056bc4445d163d3b615afb6ab1), [`b6f0613dc`](https://github.com/clerk/javascript/commit/b6f0613dc9d8b0bab41cfabbaa8621b126e3bdf5)]:
  - @clerk/shared@2.5.1
  - @clerk/types@4.13.1
  - @clerk/localizations@2.5.8

## 5.14.0

### Minor Changes

- Add a `nonce` to clerk-js' script loading options. Also adds a `nonce` prop to `ClerkProvider`. This can be used to thread a nonce value through to the clerk-js script load to support apps using a `strict-dynamic` content security policy. For next.js applications, the nonce will be automatically pulled from the CSP header and threaded through without needing any props so long as the provider is server-rendered. ([#3858](https://github.com/clerk/javascript/pull/3858)) by [@jescalan](https://github.com/jescalan)

- Introduce `transferable` prop for `<SignIn />` to disable the automatic transfer of a sign in attempt to a sign up attempt when attempting to sign in with a social provider when the account does not exist. Also adds a `transferable` option to `Clerk.handleRedirectCallback()` with the same functionality. ([#3845](https://github.com/clerk/javascript/pull/3845)) by [@BRKalow](https://github.com/BRKalow)

### Patch Changes

- Updated dependencies [[`59d5f19d3`](https://github.com/clerk/javascript/commit/59d5f19d333bf4a35c244886e93b4368e215225c), [`4e6c94e3f`](https://github.com/clerk/javascript/commit/4e6c94e3f4cc92cbba8bddcd2b90fcc9cfb83763)]:
  - @clerk/shared@2.5.0
  - @clerk/types@4.13.0
  - @clerk/localizations@2.5.7

## 5.13.2

### Patch Changes

- Add option to hide the slug field in the `<CreateOrganization />`, `<OrganizationSwitcher />`, and `<OrganizationList />` components ([#3882](https://github.com/clerk/javascript/pull/3882)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`9b2aeacb3`](https://github.com/clerk/javascript/commit/9b2aeacb32fff7c300bda458636a1cc81a42ee7b)]:
  - @clerk/types@4.12.1
  - @clerk/localizations@2.5.6
  - @clerk/shared@2.4.5

## 5.13.1

### Patch Changes

- Fix missing horizonatal padding when page urls are used within `<UserButton />`. ([#3903](https://github.com/clerk/javascript/pull/3903)) by [@alexcarpenter](https://github.com/alexcarpenter)

## 5.13.0

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
  - @clerk/localizations@2.5.5
  - @clerk/shared@2.4.4

## 5.12.0

### Minor Changes

- Introducing a development mode warning when in development mode in order to mitigate going to production with development keys. ([#3870](https://github.com/clerk/javascript/pull/3870)) by [@octoper](https://github.com/octoper)

  In case need to deactivate this UI change temporarily to simulate how components will look in production, you can do so by adding the `unsafe_disableDevelopmentModeWarnings` layout appearance prop to `<ClerkProvider>`

  Example:

  ```tsx
  <ClerkProvider
    appearance={{
      layout: {
        unsafe_disableDevelopmentModeWarnings: true,
      },
    }}
  />
  ```

- Removed `__experimental_startPath` from `OrganizationProfileProps` in `@clerk/clerk-js` and `@clerk/types`. ([#3888](https://github.com/clerk/javascript/pull/3888)) by [@nikospapcom](https://github.com/nikospapcom)

### Patch Changes

- Updated dependencies [[`568186cad`](https://github.com/clerk/javascript/commit/568186cad29acaf0b084a9f86ccb9d29bd23fcf4), [`407195270`](https://github.com/clerk/javascript/commit/407195270ed8aab6eef18c64a4918e3870fef471)]:
  - @clerk/types@4.11.0
  - @clerk/localizations@2.5.4
  - @clerk/shared@2.4.3

## 5.11.0

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

- Introduce ability to set an active organization by slug ([#3825](https://github.com/clerk/javascript/pull/3825)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`d3d38e206`](https://github.com/clerk/javascript/commit/d3d38e2061fdbdfcc8a24b58f180ecbed3f1145a), [`a3e9c2fb8`](https://github.com/clerk/javascript/commit/a3e9c2fb8d71d4c80402ceb87c8ed8a6e2e6e98a), [`fb302bb64`](https://github.com/clerk/javascript/commit/fb302bb64608d5f06c9a53c8e20c9d0ec61d99ec), [`aa06f3ba7`](https://github.com/clerk/javascript/commit/aa06f3ba7e725071c90d4a1d6840060236da3c23), [`80e647731`](https://github.com/clerk/javascript/commit/80e64773135865434cf0e6c220e287397aa07937)]:
  - @clerk/localizations@2.5.3
  - @clerk/types@4.10.0
  - @clerk/shared@2.4.2

## 5.10.2

### Patch Changes

- Add support for opening the `UserProfileModal` and `OrganizationProfileModal` to specific navigation items through the `UserButton` and `OrganizationSwitcher`. ([#3732](https://github.com/clerk/javascript/pull/3732)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

- Adjust how we pass captcha tokens to the Clerk API when signing in with Google, Microsoft, and Apple ([#3806](https://github.com/clerk/javascript/pull/3806)) by [@BRKalow](https://github.com/BRKalow)

- Add `signUp.start.actionLink__use_email` and `signUp.start.actionLink__use_phone` localization keys. ([#3826](https://github.com/clerk/javascript/pull/3826)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`b48689705`](https://github.com/clerk/javascript/commit/b48689705f9fc2251d2f24addec7a0d0b1da0fe1), [`4e61f8d27`](https://github.com/clerk/javascript/commit/4e61f8d2770907f48a53d530187a7b6de09f107e)]:
  - @clerk/types@4.9.1
  - @clerk/localizations@2.5.2
  - @clerk/shared@2.4.1

## 5.10.1

### Patch Changes

- Updated dependencies [[`24465035c`](https://github.com/clerk/javascript/commit/24465035c6f044ec76c31deeedc2fce0a19cad88)]:
  - @clerk/localizations@2.5.1

## 5.10.0

### Minor Changes

- Support reading / writing / removing suffixed/un-suffixed cookies from `@clerk/clerk-js` and `@clerk/backend`. by [@dimkl](https://github.com/dimkl)

  The `__session`, `__clerk_db_jwt` and `__client_uat` cookies will now include a suffix derived from the instance's publishakeKey. The cookie name suffixes are used to prevent cookie collisions, effectively enabling support for multiple Clerk applications running on the same domain.

- Improve UX in ConnectedAccounts by converting the error into a useful, user-friendly message with a visible way to take action. ([#3723](https://github.com/clerk/javascript/pull/3723)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Update the image alt attribute to fix accessibility issues reported by Lighthouse. ([#3775](https://github.com/clerk/javascript/pull/3775)) by [@vignesh-gupta](https://github.com/vignesh-gupta)

- Set `session` and `client_uat` before invalidating cache during `setActive()` flow ([#3774](https://github.com/clerk/javascript/pull/3774)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Update types to account for null second factors ([#3780](https://github.com/clerk/javascript/pull/3780)) by [@dstaley](https://github.com/dstaley)

- Updated dependencies [[`b87f7b9e1`](https://github.com/clerk/javascript/commit/b87f7b9e163756fd43789bc7b7344d2eb24015ec), [`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`6e8a5037c`](https://github.com/clerk/javascript/commit/6e8a5037cd4265d579afa1fa6bda282721fc2ece), [`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`5fa7208cf`](https://github.com/clerk/javascript/commit/5fa7208cfb13fd88f38ef0a987a536caa559c1db), [`86c75e50c`](https://github.com/clerk/javascript/commit/86c75e50cba9c4efb480672f1b8c6a6fff4ef477)]:
  - @clerk/shared@2.4.0
  - @clerk/localizations@2.5.0
  - @clerk/types@4.9.0

## 5.9.0

### Minor Changes

- Added support for Custom OAuth providers by [@nikosdouvlis](https://github.com/nikosdouvlis)

  - Updated strategy types to include `CustomOAuthStrategy`:
    - Added the `CustomOAuthStrategy` type with the value `oauth_custom_${string}`
    - Modified `OAuthStrategy` to include `CustomOAuthStrategy`:
      `export type OAuthStrategy = `oauth\_${OAuthProvider}` | CustomOAuthStrategy;`
  - Added the `CustomOauthProvider` type with value `custom_${string}` and extended `OAuthProvider` type to include `CustomOauthProvider`
  - Added support for displaying provider initials when `logo_url` is null for custom OAuth providers
  - Created new `ProviderInitialIcon` internal component in order to display custom oauth provider initials if provider `logo_url` is null

### Patch Changes

- Bug Fix: Navigation during signing out requires a router which was missing from the ImpersonationFab by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7)]:
  - @clerk/types@4.8.0
  - @clerk/localizations@2.4.8
  - @clerk/shared@2.3.3

## 5.8.1

### Patch Changes

- Bug fix: Clear session cookie after a user deletes their account ([#3628](https://github.com/clerk/javascript/pull/3628)) by [@octoper](https://github.com/octoper)

- Set the localhost cookies with the Secure attribute ([#3604](https://github.com/clerk/javascript/pull/3604)) by [@anagstef](https://github.com/anagstef)

## 5.8.0

### Minor Changes

- Deprecate `afterSignOutUrl` and `afterMultiSessionSingleSignOutUrl` from UserButton. ([#3544](https://github.com/clerk/javascript/pull/3544)) by [@panteliselef](https://github.com/panteliselef)

  Developers can now configure these directly in `ClerkProvider` and have them work properly without in UserButton, UserProfile and in impersonation mode.

### Patch Changes

- Bug fix: Requests failing due to incorrect parsing of value `false` when content type is `x-www-form-urlencoded` ([#3630](https://github.com/clerk/javascript/pull/3630)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

- When organization changes, display/fetch the corresponding organization roles. ([#3624](https://github.com/clerk/javascript/pull/3624)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`d6b5006c4`](https://github.com/clerk/javascript/commit/d6b5006c4cc1b6f07bb3a6832b4ec6e65ea15814)]:
  - @clerk/types@4.7.0
  - @clerk/localizations@2.4.7
  - @clerk/shared@2.3.2

## 5.7.2

### Patch Changes

- Correctly use updated protocol verification in all code paths ([#3605](https://github.com/clerk/javascript/pull/3605)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`72888323b`](https://github.com/clerk/javascript/commit/72888323ba5effb53bbd50456dc9bfb5895c5b5a)]:
  - @clerk/localizations@2.4.6

## 5.7.1

### Patch Changes

- Bug fix: Skip password strategy for users who authenticate with SAML. ([#3578](https://github.com/clerk/javascript/pull/3578)) by [@panteliselef](https://github.com/panteliselef)

- Add `organizationAvatarUploaderContainer` descriptor which is used e.g. for the logo upload box inside "Create Organization" flow ([#3596](https://github.com/clerk/javascript/pull/3596)) by [@LekoArts](https://github.com/LekoArts)

- Remove the qs library and use the native URLSearchParams API instead. ([#3430](https://github.com/clerk/javascript/pull/3430)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

- Allow chrome-extension: protocol in validation ([#3584](https://github.com/clerk/javascript/pull/3584)) by [@LekoArts](https://github.com/LekoArts)

- In a previous release the protocol validation for window navigation was added ([ref](https://github.com/clerk/javascript/commit/b91e0ef4036d215da09d144f85b0a5ef2afe6cba)). Since then only `http:` and `https:` were allowed. ([#3564](https://github.com/clerk/javascript/pull/3564)) by [@LekoArts](https://github.com/LekoArts)

  With this release `wails:` is also supported again. If you think that the mentioned commit introduced a regression for you and your protocol should be supported, please open an issue.

- Add the `title` attribute to `<OrganizationPreview>` component so that truncated organization names can be previewed e.g. through hovering ([#3522](https://github.com/clerk/javascript/pull/3522)) by [@davemo](https://github.com/davemo)

- Updated dependencies [[`1273b04ec`](https://github.com/clerk/javascript/commit/1273b04ecf1866b59ef59a74abe31dbcc726da2c)]:
  - @clerk/types@4.6.1
  - @clerk/localizations@2.4.5
  - @clerk/shared@2.3.1

## 5.7.0

### Minor Changes

- Move `isWebAuthnSupported`, `isWebAuthnAutofillSupported`, `isWebAuthnPlatformAuthenticatorSupported` to `@clerk/shared/webauthn`. ([#3472](https://github.com/clerk/javascript/pull/3472)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`4ec3f63e2`](https://github.com/clerk/javascript/commit/4ec3f63e26d8d3725a7ba9bbf988a7776fe893ff)]:
  - @clerk/shared@2.3.0

## 5.6.0

### Minor Changes

- Add descriptor for formatted dates in tables. Those elements can be identified by the `cl-formattedDate__tableCell` css class. ([#3465](https://github.com/clerk/javascript/pull/3465)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- In some instances your application logo (shown at the top of the sign-in/sign-up form of the prebuilt components) might have been distorted in browsers like Firefox. By applying `object-fit: contain` to the image's CSS the logo now fills its bounding box without being distorted. ([#3501](https://github.com/clerk/javascript/pull/3501)) by [@LekoArts](https://github.com/LekoArts)

- Support remounting ClerkProvider multiple times by making sure that the `updateProps` call during the loading phase does not override any defaults set by `Clerk.load()` for values that are missing ([#3455](https://github.com/clerk/javascript/pull/3455)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Sms phone code verification lists available phone numbers on cancel. ([#3479](https://github.com/clerk/javascript/pull/3479)) by [@panteliselef](https://github.com/panteliselef)

- Only render active sessions in the active devices section. Fixes the bug where a device with no information would render upon revoking. ([#3497](https://github.com/clerk/javascript/pull/3497)) by [@desiprisg](https://github.com/desiprisg)

- Fixed a bug where Clerk components rendered in modals were wrapped with `aria-hidden`. ([#3508](https://github.com/clerk/javascript/pull/3508)) by [@BRKalow](https://github.com/BRKalow)

- Bug fix: statically loading a resource would result in an increase in bundle size for `clerk.browser.js`. ([#3519](https://github.com/clerk/javascript/pull/3519)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`86a27f693`](https://github.com/clerk/javascript/commit/86a27f6933de50c99b6bc354bf87ff5c2cfcaf38), [`478c49b41`](https://github.com/clerk/javascript/commit/478c49b41f4fc7ef37b73b81c42dfbf99eef8aec), [`02bed2e00`](https://github.com/clerk/javascript/commit/02bed2e00d3e0a4e1bb1698b13267faf6aeb31b3), [`cd424c590`](https://github.com/clerk/javascript/commit/cd424c5902ba7d3b215272b11b58187752c7a78d), [`73e5d61e2`](https://github.com/clerk/javascript/commit/73e5d61e21ab3f77f3c8343bc63da0626466c7ac), [`68f247444`](https://github.com/clerk/javascript/commit/68f247444e757aae642500b35263bbeaad541472), [`b8e46328d`](https://github.com/clerk/javascript/commit/b8e46328da874859c4928f19f924219cd6520b11)]:
  - @clerk/shared@2.2.2
  - @clerk/localizations@2.4.4
  - @clerk/types@4.6.0

## 5.5.3

### Patch Changes

- Bug fix: Use the correct returnBack url when GoogleOneTap remains open across navigations. ([#3410](https://github.com/clerk/javascript/pull/3410)) by [@panteliselef](https://github.com/panteliselef)

  Previously it will only use the url that existed in the browser url bar at the time the component was initially rendered.

- Add `aria-label` and `aria-expanded` in menu trigger to improve accessibility ([#3446](https://github.com/clerk/javascript/pull/3446)) by [@panteliselef](https://github.com/panteliselef)

- Add experimental support for hCaptcha captcha provider ([#3422](https://github.com/clerk/javascript/pull/3422)) by [@anagstef](https://github.com/anagstef)

- Updated dependencies [[`4beb00672`](https://github.com/clerk/javascript/commit/4beb00672da64bafd67fbc98181c4c2649a9062c)]:
  - @clerk/types@4.5.1

## 5.5.2

### Patch Changes

- Validate protocol on window navigation by [@tmilewski](https://github.com/tmilewski)

## 5.5.1

### Patch Changes

- Add a custom logger to allow logging a message or warning to the console once per session, in order to avoid consecutive identical logs due to component rerenders. ([#3383](https://github.com/clerk/javascript/pull/3383)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`ff31f7255`](https://github.com/clerk/javascript/commit/ff31f725541d82caaa9c13cf42cf15f8ce3992f4), [`8e5969d82`](https://github.com/clerk/javascript/commit/8e5969d82818c333d5459e5c70eb626d0968eb66), [`0e48fc210`](https://github.com/clerk/javascript/commit/0e48fc210cf0b5852052a21494a05f6e723101f5)]:
  - @clerk/shared@2.2.1
  - @clerk/localizations@2.4.3

## 5.5.0

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

- A bug was fixed to not override the existing sign-up state on the OAuth callback. ([#3401](https://github.com/clerk/javascript/pull/3401)) by [@LauraBeatris](https://github.com/LauraBeatris)

  When continuing a sign-up flow with social connections, `@clerk/clerk-js` was creating a new `SignUpResource` object, instead of patching the existing one.

  This was affecting Web3 sign-up flows, since the wallet ID was being overridden on the browser redirect.

- Updated dependencies [[`d6a9b3f5d`](https://github.com/clerk/javascript/commit/d6a9b3f5dd8c64b1bd49f74c3707eb01dcd6aff4), [`456b06849`](https://github.com/clerk/javascript/commit/456b068493b8679e1772819eea24d49aa1bc6556)]:
  - @clerk/types@4.5.0
  - @clerk/shared@2.2.0

## 5.4.0

### Minor Changes

- Replace mount with open for GoogleOneTap. New api is `__experimental_openGoogleOneTap`. ([#3379](https://github.com/clerk/javascript/pull/3379)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Remove cookie when signing out before running `onBeforeSetActive` to resolve issues where we do navigations in `onBeforeSetActive`. ([#3371](https://github.com/clerk/javascript/pull/3371)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`3d790d5ea`](https://github.com/clerk/javascript/commit/3d790d5ea347a51ef16557c015c901a9f277effe), [`e84090db0`](https://github.com/clerk/javascript/commit/e84090db0d9a61a5e3dfea645e7c9cc6dad214a9)]:
  - @clerk/types@4.4.0
  - @clerk/localizations@2.4.2

## 5.3.2

### Patch Changes

- Add a descriptor for Invitation previews in <OrganizationSwitcher/> ([#3376](https://github.com/clerk/javascript/pull/3376)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

- Updated dependencies [[`eae0a32d5`](https://github.com/clerk/javascript/commit/eae0a32d5c9e97ccbfd96e001c2cac6bc753b5b3)]:
  - @clerk/types@4.3.1

## 5.3.1

### Patch Changes

- Re-organize cookie codebase into a central place, fix TokenUpdate event to be triggered on sign-out and drop duplicate event on refreshing token. ([#3362](https://github.com/clerk/javascript/pull/3362)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`9d02df655`](https://github.com/clerk/javascript/commit/9d02df65507f579e970b33a600e6c83f6d5bfd45), [`ec84d51e7`](https://github.com/clerk/javascript/commit/ec84d51e705370273ffb82a0d7c94d90ba3de874)]:
  - @clerk/localizations@2.4.1
  - @clerk/shared@2.1.1

## 5.3.0

### Minor Changes

- Updates related to experimental Google One Tap support ([#3250](https://github.com/clerk/javascript/pull/3250)) by [@panteliselef](https://github.com/panteliselef)

  - By default we are returning back to the location where the flow started.
    To accomplish that internally we will use the redirect_url query parameter to build the url.

  ```tsx
  <__experimental_GoogleOneTap />
  ```

  - In the above example if there is a SIGN_UP_FORCE_REDIRECT_URL or SIGN_IN_FORCE_REDIRECT_URL set then the developer would need to pass new values as props like this

  ```tsx
  <__experimental_GoogleOneTap
    signInForceRedirectUrl=''
    signUpForceRedirectUrl=''
  />
  ```

  - Let the developer configure the experience they want to offer. (All these values are true by default)

  ```tsx
  <__experimental_GoogleOneTap
    cancelOnTapOutside={false}
    itpSupport={false}
    fedCmSupport={false}
  />
  ```

  - Moved authenticateWithGoogleOneTap to Clerk singleton

  ```ts
  Clerk.__experimental_authenticateWithGoogleOneTap;
  ```

  - Created the handleGoogleOneTapCallback in Clerk singleton

  ```ts
  Clerk.__experimental_handleGoogleOneTapCallback;
  ```

- Introduce new `client_mismatch` verification status for email link sign-in and sign-up. This error (and its message) will be shown if a verification link was opened in another device/browser from which the user initiated the sign-in/sign-up attempt. This functionality needs to be enabled in the Clerk dashboard. ([#3367](https://github.com/clerk/javascript/pull/3367)) by [@mzhong9723](https://github.com/mzhong9723)

### Patch Changes

- Improve logging for CAPTCHA script loading errors ([#3374](https://github.com/clerk/javascript/pull/3374)) by [@anagstef](https://github.com/anagstef)

- Respect the `signInForceRedirectUrl`, `signInFallbackRedirectUrl`, `signUpForceRedirectUrl` and `signUpFallbackRedirectUrl` props passed to `SignInButton`, `SignUpButton` and the low-level `window.Clerk.buildSignInUrl` & `window.Clerk.buildSignUpUrl` methods. These props allow you to control the redirect behavior of the `SignIn` and `SignUp` components. For more information, refer to the [Custom Redirects](https://clerk.com/docs/guides/custom-redirects) guide. ([#3361](https://github.com/clerk/javascript/pull/3361)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`6f61130e3`](https://github.com/clerk/javascript/commit/6f61130e35a08298a715c170d2ee14d29d15bb58), [`94197710a`](https://github.com/clerk/javascript/commit/94197710a70381c4f1c460948ef02cd2a70b88bb), [`b27ca8366`](https://github.com/clerk/javascript/commit/b27ca8366a1d6ec1d7ce4a5be5005f1b1b017c20), [`201b28d37`](https://github.com/clerk/javascript/commit/201b28d37852b5a2681f8115d1898905e7956bc2), [`b27ca8366`](https://github.com/clerk/javascript/commit/b27ca8366a1d6ec1d7ce4a5be5005f1b1b017c20)]:
  - @clerk/localizations@2.4.0
  - @clerk/types@4.3.0
  - @clerk/shared@2.1.0

## 5.2.4

### Patch Changes

- Fix a bug where client_uat domain detection would not handle hostnames with a single part. This impacts locally defined custom hostnames used as aliases. ([#3357](https://github.com/clerk/javascript/pull/3357)) by [@BRKalow](https://github.com/BRKalow)

- Fix Cypress setting cookies as third-party ([#3245](https://github.com/clerk/javascript/pull/3245)) by [@anagstef](https://github.com/anagstef)

## 5.2.3

### Patch Changes

- Fix Smart CAPTCHA on ticket flow ([#3351](https://github.com/clerk/javascript/pull/3351)) by [@anagstef](https://github.com/anagstef)

## 5.2.2

### Patch Changes

- Fix UI for Phone Input and OTP inputs ([#3302](https://github.com/clerk/javascript/pull/3302)) by [@octoper](https://github.com/octoper)

- Specify an explicit domain when setting the client_uat cookie. This ensures there are no duplicate cookie issues when also receiving cookies from the API. ([#3318](https://github.com/clerk/javascript/pull/3318)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`df4525f87`](https://github.com/clerk/javascript/commit/df4525f878012f2bb03c3714cfb813740c95050c), [`1662aaae9`](https://github.com/clerk/javascript/commit/1662aaae965fcf36b13dba6b148e096ab6a1cd83), [`9d7a79841`](https://github.com/clerk/javascript/commit/9d7a79841c4832b34f5e6b968961fe8f5320c4d4), [`f70c885f7`](https://github.com/clerk/javascript/commit/f70c885f798f7ff513f6687f87c8a56daf26fa05), [`f5804a225`](https://github.com/clerk/javascript/commit/f5804a225e9d67cd315700f0ced0ff17b8b14e53)]:
  - @clerk/localizations@2.3.1
  - @clerk/shared@2.0.2
  - @clerk/types@4.2.1

## 5.2.1

### Patch Changes

- Fixes issue where email field is required but is not shown after user tries to edit email, when already tried another email before when trying to sign up with a method that not provides and email (e.g Metamask) ([#3291](https://github.com/clerk/javascript/pull/3291)) by [@octoper](https://github.com/octoper)

## 5.2.0

### Minor Changes

- Allow localization of text in social buttons when many are listed. ([#3282](https://github.com/clerk/javascript/pull/3282)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Allow users to display the email address field after selecting to input a phone number. Previously that was not possible when passkeys were enabled. ([#3286](https://github.com/clerk/javascript/pull/3286)) by [@panteliselef](https://github.com/panteliselef)

- Avoid throwing error for missing an active organization when no user is signed in ([#3290](https://github.com/clerk/javascript/pull/3290)) by [@panteliselef](https://github.com/panteliselef)

- Use default value for `signIn.userData`. This will prevent the SignIn modal from breaking when an appearance prop is used in Next.js App Router. ([#3280](https://github.com/clerk/javascript/pull/3280)) by [@panteliselef](https://github.com/panteliselef)

- Remove deprecated `__clerk_frontend_api` from `Window` interface ([#3288](https://github.com/clerk/javascript/pull/3288)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`a78bc447c`](https://github.com/clerk/javascript/commit/a78bc447c1aabaa41bcbaa2a8fe3c48f31275574), [`c7d626292`](https://github.com/clerk/javascript/commit/c7d626292a9fd12ca0f1b31a1035e711b6e99531), [`19cd42434`](https://github.com/clerk/javascript/commit/19cd42434450e568998336bf6d705e475122abbc)]:
  - @clerk/shared@2.0.1
  - @clerk/localizations@2.3.0
  - @clerk/types@4.2.0

## 5.1.1

### Patch Changes

- Default to text type for all inputs. This resolved inconsistencies with `@tailwindcss/forms`. ([#3260](https://github.com/clerk/javascript/pull/3260)) by [@desiprisg](https://github.com/desiprisg)

- Prevent form submission for deleting user account when confirmation value is incorrect but submisssion is triggered via an "Enter" keystroke. ([#3265](https://github.com/clerk/javascript/pull/3265)) by [@panteliselef](https://github.com/panteliselef)

- Set the card error when encountering an error on preparing verification via code for email or phone on sign up. ([#3256](https://github.com/clerk/javascript/pull/3256)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`0a825dcc4`](https://github.com/clerk/javascript/commit/0a825dcc4ec5743819503afed20bf3d8229f6d6f)]:
  - @clerk/localizations@2.2.0

## 5.1.0

### Minor Changes

- Remove experimental Passkeys APIs. This includes any API that is marked as experimental or has the `__experimental_` prefix. ([#3233](https://github.com/clerk/javascript/pull/3233)) by [@panteliselef](https://github.com/panteliselef)

  This prepares the Passkeys release to move further along towards a beta release and eventual stable release.

### Patch Changes

- Check if any legacy properties have value before displaying a warning ([#3254](https://github.com/clerk/javascript/pull/3254)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

- Hide "Create Organization" in <OrganizationList/> when it's disabled for user ([#3249](https://github.com/clerk/javascript/pull/3249)) by [@dimkl](https://github.com/dimkl)

- Warn when a legacy redirect prop is being shadowed by "fallbackRedirectUrl" or "forceRedirectUrl" by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`de1d75d1a`](https://github.com/clerk/javascript/commit/de1d75d1acab452ad2b7c533053f45d2e0ec66cc), [`956d8792f`](https://github.com/clerk/javascript/commit/956d8792fefe9d6a89022f1e938149b25503ec7f)]:
  - @clerk/localizations@2.1.0
  - @clerk/types@4.1.0

## 5.0.0

### Major Changes

- 043801f2a: All the components that using routing will throw a runtime error if the a path property is provided with a routing strategy other than path.

  Example that will throw an error:

  ```tsx
  <SignIn
    routing='hash'
    path='/sign-in'
  />
  ```

- c2a090513: Change the minimal Node.js version required by Clerk to `18.17.0`.
- deac67c1c: Drop default exports from all packages. Migration guide:
  - use `import { Clerk } from '@clerk/backend';`
  - use `import { clerkInstance } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-js';`
  - use `import { Clerk } from '@clerk/clerk-js/headless';`
  - use `import { IsomorphicClerk } from '@clerk/clerk-react'`
- 7f6a64f43: - By default, all the components with routing will have the `routing` prop assigned as `'path'` by default when the `path` prop is filled.
  - The `<UserButton />` component will set the default value of the `userProfileMode` prop to `'navigation'` if the `userProfileUrl` prop is provided.
  - The `<OrganizationSwitcher />` component will have the `organizationProfileMode` and `createOrganizationMode` props assigned with `'navigation'` by default if the `organizationProfileUrl` and `createOrganizationUrl` props are filled accordingly.
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

- d18cae5fd: Make the user name on <UserButton showName /> clickable, i.e. part of the button's trigger.
  This change inverts the positions of `cl-userButtonTrigger` and `cl-userButtonBox`, the latter now being a child of the former.
- 7bffc47cb: Drop `Clerk.isReady(). Use `Clerk.loaded` instead.`
- 5f58a2274: Remove hashing and third-party cookie functionality related to development instance session syncing in favor of URL-based session syncing with query parameters.
- 5f58a2274: - `buildUrlWithAuth` no longer accepts an `options` argument.
- 52ff8fe6b: Upgrade React version to >=18 and add react-dom as peer dependency
  to fix issues with vite & rollup building.
- ab4eb56a5: Drop `redirectToHome` redirect method in favour of `redirectToAfterSignUp` or `redirectToAfterSignIn`.

  When the `<SignIn/>` and `<SignUp/>` components are rendered while a user is already logged in, they will now redirect to the configured `afterSignIn` and `afterSignUp` URLs, respectively. Previously, the redirect URL was set to the home URL configured in the dashboard.

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

- f5fb63cf1: Consolidate `afterSignOutOneUrl` & `afterSignOutAllUrl` to `afterSignOutUrl` and drop usage of Dashboard settings in ClerkJS components. The Dashboard settings should only apply to the Account Portal application.
- 9a1fe3728: Use the new `routerPush` and `routerReplace` props for `<ClerkProvider />` instead of `navigate`.
- d30ea1faa: Change the default behavior of `afterSignOutUrl`, `afterSignIn` and `afterSignUp` props to be redirected to `/` instead of the Account Portal defined URL.
- 7886ba89d: Refresh the look and feel of the Clerk UI components

  For more info, refer to the [upgrade guide from v4 to v5 in Clerk docs](https://clerk.com/docs/upgrade-guides/upgrading-from-v4-to-v5).

- 41ae1d2f0: Avatar Shimmer will be enabled by default for `<UserButton/>` and `<OrganizationSwitcher/>`.
- 429d030f7: Introducing some changes and some addition for the appearence descriptors for the organization preview in `<OrganizationSwitcher/>`:
  - `.cl-organizationPreview__organizationSwitcher` has been renamed to `.cl-organizationPreview__organizationSwitcherTrigger`.
  - `.cl-organizationPreview__organizationSwitcherListedOrganization` was added to allow you to customize the appearance of all the listed organization previews.
  - `.cl-organizationPreview__organizationSwitcherActiveOrganizationn` was added to allow you to customize the appearance of the active organization.

### Minor Changes

- 4b8bedc66: Move usage of internal useCoreX hooks to useX hooks
- 0d0b1d89a: List passkeys under security in UserProfile.
  - Supports renaming a passkey.
  - Supports deleting a passkey.
- 08dd88c4a: Introducing sign out from all open tabs at once.
- afec17953: Improved error handling for registration and retrieval of passkeys.
  ClerkRuntimeError codes introduced:

  - `passkey_not_supported`
  - `passkeys_pa_not_supported`
  - `passkey_invalid_rpID_or_domain`
  - `passkey_already_exists`
  - `passkey_operation_aborted`
  - `passkey_retrieval_cancelled`
  - `passkey_retrieval_failed`
  - `passkey_registration_cancelled`
  - `passkey_registration_failed`

  Example usage:

  ```ts
  try {
    await __experimental_authenticateWithPasskey(...args);
  }catch (e) {
    if (isClerkRuntimeError(e)) {
        if (err.code === 'passkey_operation_aborted') {
            ...
        }
    }
  }


  ```

- 0699fa496: Add support for different CAPTCHA widget types
- 0293f29c8: Add support for custom roles in `<OrganizationProfile/>`.

  The previous roles (`admin` and `basic_member`), are still kept as a fallback.

- 9180c8b80: Deprecate `supported_identifiers` and remove `supported_external_accounts`.
- e400fa9e3: Introducing default values for `allowedRedirectOrigins`. If no value is provided, default values similar to the example below will apply.

  Let's assume the host of the application is `test.host`, the origins will be

  - `https://test.host/`
  - `https://yourawesomeapp.clerk.accounts.dev/`
  - `https://*.yourawesomeapp.clerk.accounts.dev/`

- fc3ffd880: Support for prompting a user to reset their password if it is found to be compromised during sign-in.
- 31570f138: During sign in, navigate to the `reset-password` route if the user needs a new password. This happens when you enforce password usage during sign-in in your dashboard. Previously this case wasn't handled in the password form.

  The `signIn.resetPassword.requiredMessage` localization was updated to `'For security reasons, it is required to reset your password.'`.

- 492b8a7b1: Increase the duration until data become stale for organization hooks.
- 2352149f6: Move passkey related apis to stable:

  - Register passkey for a user
    Usage: `await clerk.user.createPasskey()`
  - Authenticate with passkey
    Usage: `await clerk.client.signIn.authenticateWithPasskey()`
    ```ts
    try {
      await clerk.client.signIn.authenticateWithPasskey(...args);
    }catch (e) {
      if (isClerkRuntimeError(e)) {
          if (err.code === 'passkey_operation_aborted') {
              ...
          }
      }
    }
    ```
  - ClerkRuntimeError codes introduced:

    - `passkey_not_supported`
    - `passkeys_pa_not_supported`
    - `passkey_invalid_rpID_or_domain`
    - `passkey_already_exists`
    - `passkey_operation_aborted`
    - `passkey_retrieval_cancelled`
    - `passkey_retrieval_failed`
    - `passkey_registration_cancelled`
    - `passkey_registration_failed`

  - Get the user's passkeys
    `clerk.user.passkeys`
  - Update the name of a passkey
    `clerk.user.passkeys?.[0].update({name:'Company issued passkey'})`
  - Delete a passkey
    `clerk.user.passkeys?.[0].delete()`

- ff803ff20: Throw an error in development when there is an invalid mount or modal open. This includes mounting a component when the resource is not available (i.e. `mountUserProfile()` when the user does not exist) as well as mounting a component without the feature being enabled via the clerk dashboard (i.e. `mountOrganizationProfile()` without having organizations enabled).
- ff08fe237: Introduce experimental support for Google One Tap
  - React Component `<__experimental_GoogleOneTap/>`
  - JS `clerk.__experimental_mountGoogleOneTap(node,props)`
- 73849836f: Use sigUpUrl from props / context / repo-level to construct a redirectUrl in sign-in from email-link flow.
- 9737ef510: Accept `skipInvitationScreen` as a prop from OrganizationSwitcher.

  `skipInvitationScreen` hides the screen for sending invitations after an organization is created.
  By default, Clerk will automatically hide the screen if the number of max allowed members is equal to 1

- fafa76fb6: Experimental support for a user to register a passkey for their account.
  Usage: `await clerk.user.__experimental__createPasskey()`
- 1f650f30a: Experimental support for authenticating with a passkey.
  Example usage: `await signIn.authenticateWithPasskey()`.
- d941b902f: Drop firebase legacy integration code and start using sessions/:sid/tokens/:template endpoint for the firebase tokens.
- 57e0972bb: Remove fallback data and allow promise to throw for paginated endpoint methods.
  Affected methods:
  - Organization.getDomains
  - Organization.getInvitations
  - Organization.getMembershipRequests
  - Organization.getMemberships
  - User.getOrganizationInvitations
  - User.getOrganizationSuggestions
  - User.getOrganizationMemberships
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
- ef72c0ae6: Remove unused error helpers.
  - clerkErrorInvalidColor()
  - clerkCoreErrorUserIsNotDefined()
  - clerkCoreErrorSessionIsNotDefined()
  - clerkCoreErrorOrganizationIsNotDefined()
- 663243220: Remove the unused appearance keys for accordion and breadcrumb elements.
- d1b524ffb: Handle user_locked error encountered in an oauth flow by redirecting to /sign-up or /sign-in
- 12962bc58: Re-use common pagination types for consistency across types.

  Types introduced in `@clerk/types`:

  - `ClerkPaginationRequest` : describes pagination related props in request payload
  - `ClerkPaginatedResponse` : describes pagination related props in response body
  - `ClerkPaginationParams` : describes pagination related props in api client method params

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

- 5aab9f04a: Add `routerDebug` option in `Clerk.load()` to log the destination URLs when navigating
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
- 9e57e94d2: Greatly improve the UX when users are creating their passwords. The hints below the input fields now have smoother animations and show more types of feedback based on different conditions. Additionally, the password validation is now debounced.
- 7f751c4ef: Add support for X/Twitter v2 OAuth provider
- 18c0d015d: Pass environment into `sdkMetadata` in order to detect if production clerk-js is used by other sdks in dev mode. When it is log dev warning from clerk-js.
- 0d1052ac2: Add a private \_\_navigateWithError util function to clerk for use in User Lockout scenarios
- 5471c7e8d: Move and export the following from @clerk/clerk-js and @clerk/nextjs to @clerk/shared: - `DEV_BROWSER_SSO_JWT_PARAMETER` - `DEV_BROWSER_JWT_MARKER` - `DEV_BROWSER_SSO_JWT_KEY` - `setDevBrowserJWTInURL` - `getDevBrowserJWTFromURL` - `getDevBrowserJWTFromResponse`
- 5d6937c9f: Use signInUrl from props / context / repo-level to construct a redirectUrl in sign-up from email-link flow.
- ebf9be77f: Allow users to authenticate with passkeys via the `<SignIn/>`.
- 008ac4217: Experimental support for reading, updating, and deleting a user's registered passkeys.
  - Get the user's passkeys
    `clerk.user.__experimental__passkeys`
  - Update the name of a passkey
    `clerk.user.__experimental__passkeys?.[0].update({name:'work laptop passkey'})`
  - Delete a passkey
    `clerk.user.__experimental__passkeys?.[0].delete()`

### Patch Changes

- 3daa937a7: Bug fix: Respect `navigateAfterCreateOrganization` in `<OrganizationList/>`.
- 69ce3e185: Update `@zxcvbn-ts/core` from `2.2.1` to `3.0.4`. Update `@zxcvbn-ts/language-common` from `3.0.2` to `3.0.4`.
- 3ba3f383b: Internal refactoring of form fields, deprecation of Form.Control and introduction of Form.PlainInput.
- 1ddffb67e: A bug fix for prefetching data for OrganizationSwitcher and correctly displaying a notification count in the switcher as well.
- 1834a3ee4: fix(shared,clerk-js): Do not replace current URL if it does not contain a clerk token
- 64d3763ec: Fix incorrect pagination counters in data tables inside `<OrganizationProfile/>`.
- 0a108ae3b: Inform developers who are using legacy Clerk development instances that in V5 URL Based Session Syncing must be enabled. For more information refer to https://clerk.com/docs/upgrade-guides/url-based-session-syncing.
- e214450e9: Reset OTP field when pressing "Cancel" in VerifyDomainPage inside `<OrganziatoinProfile/>`.
- 034abeb76: Use strict equality operator to check for lockout errors in handleRedirectCallback
- d08d96971: Fixes errant `act` output from unit tests
- 17a6158e8: Warn about legacy redirect search params
- 9dc46b2c1: Fix the PhoneInput country ISO text color
- d422dae67: Fixes memebership count in `<OrganizationProfile/>` Members page for members with `org:sys_memberships:read` permission
- a2ab0d300: Align country code position with phone number input.
- 6c2d88ee8: Add data-1p-ignore to input fields that do not benefit from password manager suggestions.
- d37d44a68: Shows list of domains if member has the `org:sys_domain:read` permission.
- 434a96ebe: Hide backup codes when adding `phone_code` mfa and instance setting is off.
- 791c49807: Rename the @staging tag to @canary. Drop support for @next tag.
- 5f49568f6: Emit session when permissions or role of the active memberships change.
- 8b40dc7a3: Enhance `CreateOrganizationForm` by replacing `AvatarPreview` with an upload button to prevent layout shifts
- dd49f93da: Fallback to custom role name if localization is not provided.
- 7466fa505: Update cookie setting to ensure cookies can be set to be read when an application is embedded in an iframe.
- 2de442b24: Rename beta-v5 to beta
- db18787c4: Always drop **clerk_db_jwt and **dev_session params from the URL
- 6a769771c: Update README for v5
- 6d3b422c8: Avoid depending on `count` as it can be zero but invitations may still exist.
- 23ebc89e9: Bug fix: Avoid triggering prepare verification twice. (Affects only dev mode)
- 9e10d577e: Return reject(err) in factor one & two code forms
- 2684f1d5c: Fix checkbox styling issues
- beac05f39: Fix SSO callback Turnstile widget alignment
- 097ec4872: The organizationPreviewSecondaryIdentifier element will no longer be rendered empty inside the organization switcher's list.
- 06d2b4fca: Resolve type issues when importing `@clerk/clerk-js` directly
- bab2e7e05: Support but warn when `afterSignInUrl` and `afterSignUpUrl` are used
- 27052469e: Use `userMemberships` instead of `organizationList` inside `<OrganizationSwitcher/>`.
- 9e99eb727: Update `@clerk/nextjs` error messages to refer to `clerkMiddleware()` and deprecated `authMiddleware()` and fix a typo in `cannotRenderSignUpComponentWhenSessionExists` error message.
- 846a4c24d: Update user memberships when user creates, leaves or deletes an organization.
- 491fba5ad: Throw error for unsupported method `OrganizationMembership.reload`
- d65d36fc6: Tests for internal PlainInput component.
- 94bbdf7df: Fix font size inconsistencies when selecting method to sign in.
- 98b194b2a: Fix badge misalignment on members list when title is empty
- 1c199d1d2: Fix for input group components with prefix or suffix to match the rest of the design
- 676d23a59: Revalidate invitations table after invitation screen submit.
- 12f3c5c55: Update the debBrowser handling logic to remove hash-based devBrowser JWTs from the URL. Even if v5 does not use the hash-based JWT at all, we still need to remove it from the URL in case clerk-js is initialised on a page after a redirect from an older clerk-js version, such as an AccountPortal using the v4 components
- 394cecc6b: Prevent submitting on enter in Organization Profile form when submit button is disabled.
- d9f265fcb: Fallback to invisible CAPTCHA if the element to render to is not found in the DOM
- d005992e0: Require role to be selected before sending organization invite, affects `<OrganizationProfile/>` and <CreateOrganization/>`.
- d1dc44cc7: Correct chunk loading logic in `clerk.headless.browser` variant
- 141f09fdc: Fix the input box-shadow on iOS 16 devices
- b6c4e1cfe: Display a warning in the browser's console when organization components are mounted but the "Organizations" feature is disabled for the instance.
- 7d3aa44d7: Disable emailAdress field in SignUp if fields.emailAddress.disabled is true
- fbbb1afc2: Exclude external custom links from route matching. Previously adding external links to custom pages would cause all pages that are defined below it to throw an error.
- e7414cb3f: Remove legacy roles fallback
  After the release of Custom Roles, roles should always be dynamically fetched.
- 63373bf21: Correct the HTML structure of the UI components to ensure validity
- 0ee1777e0: Allow retries for all 300xxx error codes for CF Turnstile.
- 78fc5eec0: Introduces new element appearance descriptors:

  - `activeDeviceListItem` allows you to customize the appearance of the active device list (accordion) item
    - `activeDeviceListItem__current` allows you to customize the appearance of the _current_ active device list (accordion) item
  - `activeDevice` allows you to customize the appearance of the active device item
    - `activeDevice__current` allows you to customize the appearance of the _current_ active device item

- 6e54b1b59: Sync IsomorphicClerk with the clerk singleton and the LoadedClerk interface. IsomorphicClerk now extends from LoadedClerk.
- 4edb77632: Replace Form.Control with Form.PlainInput for text and email inputs.
- 4aff3d936: Bug Fix: When authenticating with a passkey and user was looked out an error was thrown for accessing an undefined variable
- 976c6a07e: Fixes an icon misalignment in account switcher.
- 6a33709cc: Drop `org:sys_domains:delete` and `org:sys_memberships:delete` as those have now been merged with the respective `manage` ones.
- 45c92006c: Ensure the token returned from `getToken()` and the token in the session cookie remain in sync.
- d9bd2b4ea: Fix: fallback to other first factors when preferred strategy is passkey but the user has not registered a passkey yet.
- f77e8cdbd: Add Autocomplete TS generic for union literals
- 8b466a9ba: Prevent Clerk component flickering when mounted in a Next.js app using App Router
- 4063bd8e9: Introduce more component animations
- 8cc45d2af: Allow dynamic values components props, even if these values change after the components are rendered. For example, a `SignIn` component with a `redirectUrl` prop passed in will always respect the latest value of `redirectUrl`.
- fe6215dea: Fix the OAuth errors coming from the server to use localizations
- c6a5e0f5d: Add maintenance mode banner to the SignIn and SignUp components. The text can be customized by updating the maintenanceMode localization key.
- 4edb77632: Localize placeholder of confirmation field when deleting a user account from `<UserProfile/>`.
- b0ca7b801: Refactor of internal input group, password field, and checkbox inputs in forms.
- 30dfdf2aa: Fallback to the API error message when the password is pwned and there is no translation available.
- 8b261add2: Use pattern for email input fields.
- 9955938d6: Hide members page of <OrganizationProfile/> if user doesn't have any membership related permissions.
- 1affbb22a: Replace semver with custom regex in versionSelector
- 8ca8517bf: Warn instead of erroring when a legacy redirect prop ('redirectUrl', 'afterSignInUrl', 'afterSignUpUrl') is used
- f00fd2dfe: Support legacy redirectUrl prop on SignIn and SignUp
- 046224177: Make useAwaitableNavigate handle navigations between pages reliably
- e4c0ae028: Users will no longer see an error the SignIn component when they try to close popups due to passkey autofill.
- 75ea300bc: Add `useAssertWrappedByClerkProvider` to internal code. If you use hooks like `useAuth` outside of the `<ClerkProvider />` context an error will be thrown. For example:

  ```shell
  @clerk/clerk-react: useAuth can only be used within the <ClerkProvider /> component
  ```

- db3eefe8c: Refactor of internal radio input in forms.
- 93a611570: Re-initialize the Client to default values when is destroyed
- aaa457097: Escape characters in pattern for inputs of [type="email"]
- fc36e2e54: We are rolling back support for password complexity / strength checks during sign-in. Feature will be limited to HIBP for now. Hence, the password form need not expect a sign_in status of `needs_new_password`.
- 920c9e1b5: Hide "Add domain" button inside `<OrganizationProfile/>` when user is missing the `org:sys_domains:manage` permission.
- e7ae9c36a: Show counter of members/invitations/requests even if it is 0.
- ebf9f165f: Fix transfer flow when having the Smart Bot Protection enabled
- 445026ab7: Make the instant password field focusable if it is autofilled.
- f540e9843: Return to localhost when SSO callback fails on SignIn or SignUp
- 4705d63a8: Ensures we don't attempt to access `window.addEventListener()` in non-browser environments.
- 7b40924e4: Remove handshake-related query parameters on load of clerk-js. It's possible that these parameters will be returned from Clerk's API, but they are only applicable for SSR-compatible frameworks and so on the client they are unused.
- bf09d18d6: Bug fix: Clear feedback of input field if `setError` is called with undefined.
- 59336d3d4: Refresh invited members upon revocation
- 5dea004b1: Fix invite members to an Organization form to show error when invalid email addresses are submitted.
- c3dccfc34: Update token refresh mechanism to handle network failures without raising an error
- 2f6306fd3: Fix Custom Pages freeze error by using useMemo for when creating the custom pages
- 6fd303b99: Take account custom pages when redirecting inside OrganizationProfile.
- 750337633: Fix redirect flow for OAuth2 IDP flow with email_link verification.
- 859b5495f: Removed hoverable state from no-interactive sections in `<UserProfile/>`
- 9040549d6: Bug fix: fetch custom roles in OrganizationSwitcher
- f02482bb5: Add spacing between `Add domain` button and it's subtitle that's under the Verified Domains section in `<OrganizationProfile/>` component.
- 8fbe8ba2f: Make UI-triggered redirects default to hash-based routing. If a routing strategy is not provided, default to hash routing. All routing strategies know how to convert a hash-based url to their own format.
- fb794ce7b: Support older iOS 13.3 and 13.4 mobile devices
- b9dd8e7c0: Height misalignment fixes for Password section in `<UserProfile/>`
- 94519aa33: Renaming `passkeys_pa_not_supported` to `passkey_pa_not_supported` to align with the rest passkey error codes.
- d11aa60eb: Align action buttons with user preview in `<UserButton/>`
- 79040966f: Inputs will now trim usernames and email addresses since whitespace as a prefix or suffix is invalid in these fields.
- 63ef35ec5: Hide "Add passkey" button in UP when app is satellite.
- 40ac4b645: Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry.
- 9c6411aa8: Avoid passing some of the new feedback properties down to the HTML basic elements to avoid react warnings in the console.
- 22f19d3bf: Fixed issue that prevented backup codes showing up for TOTP
- 11fbfdeec: Give application logo correct CSS width to prevent incorrect widths
- 6eab66050: Remove legacy \_\_dev_session from URL search params
- 5db6dbb90: Remove the `__clerk_ticket` and `__clerk_invitation_token` query params after they are consumed.
- 6d89f2687: Hide maintenance banner when card has global error
- 0551488fb: Add setter for sdkMetadata on Clerk to address issues arising from older versions of the SDK.
- Updated dependencies [178907ff6]
- Updated dependencies [08118edfa]
- Updated dependencies [743c4d204]
- Updated dependencies [4b8bedc66]
- Updated dependencies [78ed58da4]
- Updated dependencies [1db1f4068]
- Updated dependencies [c2a090513]
- Updated dependencies [0d0b1d89a]
- Updated dependencies [1834a3ee4]
- Updated dependencies [896cb6104]
- Updated dependencies [64d3763ec]
- Updated dependencies [af80d7074]
- Updated dependencies [8350109ab]
- Updated dependencies [f8328deb9]
- Updated dependencies [88d5d2ca0]
- Updated dependencies [1dc28ab46]
- Updated dependencies [83e9d0846]
- Updated dependencies [d37d44a68]
- Updated dependencies [fe356eebd]
- Updated dependencies [791c49807]
- Updated dependencies [164ca116c]
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
- Updated dependencies [9f5491357]
- Updated dependencies [fc3ffd880]
- Updated dependencies [840636a14]
- Updated dependencies [13ed9ac54]
- Updated dependencies [31570f138]
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
- Updated dependencies [4e31fca12]
- Updated dependencies [9737ef510]
- Updated dependencies [fafa76fb6]
- Updated dependencies [75d6bf9ad]
- Updated dependencies [2b8fe238a]
- Updated dependencies [27fb9b728]
- Updated dependencies [b473ad862]
- Updated dependencies [1f650f30a]
- Updated dependencies [97407d8aa]
- Updated dependencies [2a22aade8]
- Updated dependencies [69ce3e185]
- Updated dependencies [5b8d85886]
- Updated dependencies [78fc5eec0]
- Updated dependencies [a9fe242be]
- Updated dependencies [5f58a2274]
- Updated dependencies [6a33709cc]
- Updated dependencies [eb796dd9e]
- Updated dependencies [52ff8fe6b]
- Updated dependencies [f77e8cdbd]
- Updated dependencies [8b466a9ba]
- Updated dependencies [fe2607b6f]
- Updated dependencies [c7e6d00f5]
- Updated dependencies [8cc45d2af]
- Updated dependencies [390a70732]
- Updated dependencies [663243220]
- Updated dependencies [b8599d700]
- Updated dependencies [c6a5e0f5d]
- Updated dependencies [4edb77632]
- Updated dependencies [ab4eb56a5]
- Updated dependencies [a9fe242be]
- Updated dependencies [5c239d973]
- Updated dependencies [97407d8aa]
- Updated dependencies [12962bc58]
- Updated dependencies [e6f8928f1]
- Updated dependencies [4bb57057e]
- Updated dependencies [d4ff346dd]
- Updated dependencies [7644b7472]
- Updated dependencies [2ec9f6b09]
- Updated dependencies [2e4a43017]
- Updated dependencies [2d383e413]
- Updated dependencies [6b316611f]
- Updated dependencies [f3b6f32b3]
- Updated dependencies [5aab9f04a]
- Updated dependencies [46040a2f3]
- Updated dependencies [f00fd2dfe]
- Updated dependencies [8daf8451c]
- Updated dependencies [75ea300bc]
- Updated dependencies [9a1fe3728]
- Updated dependencies [7f751c4ef]
- Updated dependencies [370b17b12]
- Updated dependencies [f5d55bb1f]
- Updated dependencies [18c0d015d]
- Updated dependencies [1a0268509]
- Updated dependencies [0d1052ac2]
- Updated dependencies [d30ea1faa]
- Updated dependencies [7886ba89d]
- Updated dependencies [1fd2eff38]
- Updated dependencies [9a1fe3728]
- Updated dependencies [5471c7e8d]
- Updated dependencies [f540e9843]
- Updated dependencies [477170962]
- Updated dependencies [1078e8c58]
- Updated dependencies [38d8b3e8a]
- Updated dependencies [be991365e]
- Updated dependencies [8350f73a6]
- Updated dependencies [34fe88f73]
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
  - @clerk/localizations@2.0.0
  - @clerk/shared@2.0.0
  - @clerk/types@4.0.0

## 5.0.0-beta.49

### Patch Changes

- Support legacy redirectUrl prop on SignIn and SignUp by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`f00fd2dfe`](https://github.com/clerk/javascript/commit/f00fd2dfe309cfeac82a776cc006f2c21b6d7988)]:
  - @clerk/types@4.0.0-beta.30

## 5.0.0-beta.48

### Patch Changes

- Warn about legacy redirect search params ([#3224](https://github.com/clerk/javascript/pull/3224)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 5.0.0-beta.47

### Patch Changes

- Warn instead of erroring when a legacy redirect prop ('redirectUrl', 'afterSignInUrl', 'afterSignUpUrl') is used by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 5.0.0-beta.46

### Patch Changes

- Bug fix: Respect `navigateAfterCreateOrganization` in `<OrganizationList/>`. ([#3209](https://github.com/clerk/javascript/pull/3209)) by [@panteliselef](https://github.com/panteliselef)

- Introduce forceRedirectUrl and fallbackRedirectUrl ([#3162](https://github.com/clerk/javascript/pull/3162)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`bab2e7e05`](https://github.com/clerk/javascript/commit/bab2e7e0590d0da1fd7db0680e63e8f2eb836b41)]:
  - @clerk/shared@2.0.0-beta.23
  - @clerk/types@4.0.0-beta.29

## 5.0.0-beta.45

### Minor Changes

- Introduce experimental support for Google One Tap ([#3176](https://github.com/clerk/javascript/pull/3176)) by [@panteliselef](https://github.com/panteliselef)

  - React Component `<__experimental_GoogleOneTap/>`
  - JS `clerk.__experimental_mountGoogleOneTap(node,props)`

### Patch Changes

- Align country code position with phone number input. ([#3199](https://github.com/clerk/javascript/pull/3199)) by [@octoper](https://github.com/octoper)

- Fix SSO callback Turnstile widget alignment ([#3205](https://github.com/clerk/javascript/pull/3205)) by [@anagstef](https://github.com/anagstef)

- Fallback to invisible CAPTCHA if the element to render to is not found in the DOM ([#3191](https://github.com/clerk/javascript/pull/3191)) by [@anagstef](https://github.com/anagstef)

- Fix transfer flow when having the Smart Bot Protection enabled ([#3202](https://github.com/clerk/javascript/pull/3202)) by [@anagstef](https://github.com/anagstef)

- Removed hoverable state from no-interactive sections in `<UserProfile/>` ([#3201](https://github.com/clerk/javascript/pull/3201)) by [@octoper](https://github.com/octoper)

- Make UI-triggered redirects default to hash-based routing. If a routing strategy is not provided, default to hash routing. All routing strategies know how to convert a hash-based url to their own format. ([#3061](https://github.com/clerk/javascript/pull/3061)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Support older iOS 13.3 and 13.4 mobile devices ([#3188](https://github.com/clerk/javascript/pull/3188)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Align action buttons with user preview in `<UserButton/>` ([#3200](https://github.com/clerk/javascript/pull/3200)) by [@octoper](https://github.com/octoper)

- Fixed issue that prevented backup codes showing up for TOTP ([#3194](https://github.com/clerk/javascript/pull/3194)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`ff08fe237`](https://github.com/clerk/javascript/commit/ff08fe237fa5a9ded04924b3c5821111836b49b6), [`d9f265fcb`](https://github.com/clerk/javascript/commit/d9f265fcb12b39301b9802e4787dc636ee28444f), [`2b8fe238a`](https://github.com/clerk/javascript/commit/2b8fe238a114f4c21bc2068bf6f1871280da7fae), [`1078e8c58`](https://github.com/clerk/javascript/commit/1078e8c5896f5e3364bf89ec5312c81d8f1a3be8), [`fb794ce7b`](https://github.com/clerk/javascript/commit/fb794ce7b88001b98ad4a628bc2cc39a0c8ccfa5)]:
  - @clerk/types@4.0.0-beta.28
  - @clerk/localizations@2.0.0-beta.24
  - @clerk/shared@2.0.0-beta.22

## 5.0.0-beta.44

### Patch Changes

- Bug Fix: When authenticating with a passkey and user was looked out an error was thrown for accessing an undefined variable ([#3172](https://github.com/clerk/javascript/pull/3172)) by [@panteliselef](https://github.com/panteliselef)

- Renaming `passkeys_pa_not_supported` to `passkey_pa_not_supported` to align with the rest passkey error codes. ([#3173](https://github.com/clerk/javascript/pull/3173)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`94519aa33`](https://github.com/clerk/javascript/commit/94519aa33774c8d6e557ce47a00974ad7b194c5d)]:
  - @clerk/localizations@2.0.0-beta.23
  - @clerk/types@4.0.0-beta.27

## 5.0.0-beta.43

### Minor Changes

- Add support for different CAPTCHA widget types ([#3154](https://github.com/clerk/javascript/pull/3154)) by [@anagstef](https://github.com/anagstef)

### Patch Changes

- Updated dependencies [[`0699fa496`](https://github.com/clerk/javascript/commit/0699fa49693dc7a8d3de8ba053c4f16a5c8431d0)]:
  - @clerk/types@4.0.0-beta.26

## 5.0.0-beta.42

### Minor Changes

- Move passkey related apis to stable: ([#3134](https://github.com/clerk/javascript/pull/3134)) by [@panteliselef](https://github.com/panteliselef)

  - Register passkey for a user
    Usage: `await clerk.user.createPasskey()`
  - Authenticate with passkey
    Usage: `await clerk.client.signIn.authenticateWithPasskey()`
    ```ts
    try {
      await clerk.client.signIn.authenticateWithPasskey(...args);
    }catch (e) {
      if (isClerkRuntimeError(e)) {
          if (err.code === 'passkey_operation_aborted') {
              ...
          }
      }
    }
    ```
  - ClerkRuntimeError codes introduced:

    - `passkey_not_supported`
    - `passkeys_pa_not_supported`
    - `passkey_invalid_rpID_or_domain`
    - `passkey_already_exists`
    - `passkey_operation_aborted`
    - `passkey_retrieval_cancelled`
    - `passkey_retrieval_failed`
    - `passkey_registration_cancelled`
    - `passkey_registration_failed`

  - Get the user's passkeys
    `clerk.user.passkeys`
  - Update the name of a passkey
    `clerk.user.passkeys?.[0].update({name:'Company issued passkey'})`
  - Delete a passkey
    `clerk.user.passkeys?.[0].delete()`

### Patch Changes

- Resolve type issues when importing `@clerk/clerk-js` directly ([#3142](https://github.com/clerk/javascript/pull/3142)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`2352149f6`](https://github.com/clerk/javascript/commit/2352149f6ba9708095146a3087538faf2d4f161f)]:
  - @clerk/localizations@2.0.0-beta.22
  - @clerk/types@4.0.0-beta.25

## 5.0.0-beta.41

### Patch Changes

- Hide maintenance banner when card has global error by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 5.0.0-beta.40

### Minor Changes

- Deprecate `supported_identifiers` and remove `supported_external_accounts`. ([#3089](https://github.com/clerk/javascript/pull/3089)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Fixes memebership count in `<OrganizationProfile/>` Members page for members with `org:sys_memberships:read` permission ([#3093](https://github.com/clerk/javascript/pull/3093)) by [@octoper](https://github.com/octoper)

- Avoid depending on `count` as it can be zero but invitations may still exist. ([#3092](https://github.com/clerk/javascript/pull/3092)) by [@panteliselef](https://github.com/panteliselef)

- Fixes an icon misalignment in account switcher. ([#3108](https://github.com/clerk/javascript/pull/3108)) by [@octoper](https://github.com/octoper)

- Add maintenance mode banner to the SignIn and SignUp components. The text can be customized by updating the maintenanceMode localization key. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Ensures we don't attempt to access `window.addEventListener()` in non-browser environments. ([#3097](https://github.com/clerk/javascript/pull/3097)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`88d5d2ca0`](https://github.com/clerk/javascript/commit/88d5d2ca0255b1e5d589881e42e433d5238420ab), [`9180c8b80`](https://github.com/clerk/javascript/commit/9180c8b80e0ad95c1a9e490e8201ffd089634a48), [`c6a5e0f5d`](https://github.com/clerk/javascript/commit/c6a5e0f5dbd9ec4a7b5657855e8a31bc8347d0a4), [`e6f8928f1`](https://github.com/clerk/javascript/commit/e6f8928f1578710f7cbc45520cd510f3aaf80510), [`f3b6f32b3`](https://github.com/clerk/javascript/commit/f3b6f32b3f0d018db3a7624f030795fffa950f8c)]:
  - @clerk/localizations@2.0.0-beta.21
  - @clerk/types@4.0.0-beta.24

## 5.0.0-beta.39

### Minor Changes

- Support for prompting a user to reset their password if it is found to be compromised during sign-in. ([#3034](https://github.com/clerk/javascript/pull/3034)) by [@yourtallness](https://github.com/yourtallness)

### Patch Changes

- Correct chunk loading logic in `clerk.headless.browser` variant ([#3062](https://github.com/clerk/javascript/pull/3062)) by [@LekoArts](https://github.com/LekoArts)

- Return to localhost when SSO callback fails on SignIn or SignUp ([#2955](https://github.com/clerk/javascript/pull/2955)) by [@anagstef](https://github.com/anagstef)

- Update token refresh mechanism to handle network failures without raising an error ([#3035](https://github.com/clerk/javascript/pull/3035)) by [@dimkl](https://github.com/dimkl)

- Height misalignment fixes for Password section in `<UserProfile/>` ([#3081](https://github.com/clerk/javascript/pull/3081)) by [@octoper](https://github.com/octoper)

- Hide "Add passkey" button in UP when app is satellite. ([#3070](https://github.com/clerk/javascript/pull/3070)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`fc3ffd880`](https://github.com/clerk/javascript/commit/fc3ffd88064a09ab98877dfba119150390f9296e), [`840636a14`](https://github.com/clerk/javascript/commit/840636a14537d4f6b810832e7662518ef4bd4500), [`1fd2eff38`](https://github.com/clerk/javascript/commit/1fd2eff38dc71e45d2ff95a5b6e5a99cca53c6e7), [`f540e9843`](https://github.com/clerk/javascript/commit/f540e98435c86298415552537e33164471298a5c)]:
  - @clerk/localizations@2.0.0-beta.20
  - @clerk/shared@2.0.0-beta.21
  - @clerk/types@4.0.0-beta.23

## 5.0.0-beta.38

### Patch Changes

- We are rolling back support for password complexity / strength checks during sign-in. Feature will be limited to HIBP for now. Hence, the password form need not expect a sign_in status of `needs_new_password`. ([#3050](https://github.com/clerk/javascript/pull/3050)) by [@yourtallness](https://github.com/yourtallness)

## 5.0.0-beta.37

### Patch Changes

- Updated dependencies [[`8350109ab`](https://github.com/clerk/javascript/commit/8350109ab85909e0457199da1db0c9787d94001e)]:
  - @clerk/shared@2.0.0-beta.20

## 5.0.0-beta.36

### Minor Changes

- Improved error handling for registration and retrieval of passkeys. ([#3025](https://github.com/clerk/javascript/pull/3025)) by [@panteliselef](https://github.com/panteliselef)

  ClerkRuntimeError codes introduced:

  - `passkey_not_supported`
  - `passkeys_pa_not_supported`
  - `passkey_invalid_rpID_or_domain`
  - `passkey_already_exists`
  - `passkey_operation_aborted`
  - `passkey_retrieval_cancelled`
  - `passkey_retrieval_failed`
  - `passkey_registration_cancelled`
  - `passkey_registration_failed`

  Example usage:

  ```ts
  try {
    await __experimental_authenticateWithPasskey(...args);
  }catch (e) {
    if (isClerkRuntimeError(e)) {
        if (err.code === 'passkey_operation_aborted') {
            ...
        }
    }
  }


  ```

### Patch Changes

- Updated dependencies [[`78ed58da4`](https://github.com/clerk/javascript/commit/78ed58da4b75a6324edb884b55b5c573b121e750), [`afec17953`](https://github.com/clerk/javascript/commit/afec17953d1ae4ba39ee73e4383757694375524d), [`75d6bf9ad`](https://github.com/clerk/javascript/commit/75d6bf9ade57f1b4d8d68d070fd4c20c0a40d066)]:
  - @clerk/localizations@2.0.0-beta.19
  - @clerk/types@4.0.0-beta.22

## 5.0.0-beta.35

### Minor Changes

- List passkeys under security in UserProfile. ([#2958](https://github.com/clerk/javascript/pull/2958)) by [@panteliselef](https://github.com/panteliselef)

  - Supports renaming a passkey.
  - Supports deleting a passkey.

- During sign in, navigate to the `reset-password` route if the user needs a new password. This happens when you enforce password usage during sign-in in your dashboard. Previously this case wasn't handled in the password form. ([#2984](https://github.com/clerk/javascript/pull/2984)) by [@yourtallness](https://github.com/yourtallness)

  The `signIn.resetPassword.requiredMessage` localization was updated to `'For security reasons, it is required to reset your password.'`.

- Throw an error in development when there is an invalid mount or modal open. This includes mounting a component when the resource is not available (i.e. `mountUserProfile()` when the user does not exist) as well as mounting a component without the feature being enabled via the clerk dashboard (i.e. `mountOrganizationProfile()` without having organizations enabled). ([#2976](https://github.com/clerk/javascript/pull/2976)) by [@desiprisg](https://github.com/desiprisg)

- Experimental support for authenticating with a passkey. ([#2970](https://github.com/clerk/javascript/pull/2970)) by [@panteliselef](https://github.com/panteliselef)

  Example usage: `await signIn.authenticateWithPasskey()`.

- Remove unused error helpers. ([#2978](https://github.com/clerk/javascript/pull/2978)) by [@panteliselef](https://github.com/panteliselef)

  - clerkErrorInvalidColor()
  - clerkCoreErrorUserIsNotDefined()
  - clerkCoreErrorSessionIsNotDefined()
  - clerkCoreErrorOrganizationIsNotDefined()

- Remove the unused appearance keys for accordion and breadcrumb elements. ([#2956](https://github.com/clerk/javascript/pull/2956)) by [@desiprisg](https://github.com/desiprisg)

- Allow users to authenticate with passkeys via the `<SignIn/>`. ([#3000](https://github.com/clerk/javascript/pull/3000)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Fix checkbox styling issues ([#2995](https://github.com/clerk/javascript/pull/2995)) by [@octoper](https://github.com/octoper)

- Fix font size inconsistencies when selecting method to sign in. ([#2997](https://github.com/clerk/javascript/pull/2997)) by [@octoper](https://github.com/octoper)

- Fix for input group components with prefix or suffix to match the rest of the design ([#2996](https://github.com/clerk/javascript/pull/2996)) by [@octoper](https://github.com/octoper)

- Disable emailAdress field in SignUp if fields.emailAddress.disabled is true ([#2990](https://github.com/clerk/javascript/pull/2990)) by [@nikospapcom](https://github.com/nikospapcom)

- Fix: fallback to other first factors when preferred strategy is passkey but the user has not registered a passkey yet. ([#3013](https://github.com/clerk/javascript/pull/3013)) by [@panteliselef](https://github.com/panteliselef)

- Users will no longer see an error the SignIn component when they try to close popups due to passkey autofill. ([#3015](https://github.com/clerk/javascript/pull/3015)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`08118edfa`](https://github.com/clerk/javascript/commit/08118edfa7b885c8b9be9e17ae510481bf282686), [`0d0b1d89a`](https://github.com/clerk/javascript/commit/0d0b1d89a46d2418cb05a10940f4a399cbd8ffeb), [`13ed9ac54`](https://github.com/clerk/javascript/commit/13ed9ac54b6cf948560261ccf4471036eb02b4cd), [`31570f138`](https://github.com/clerk/javascript/commit/31570f13888530cf55556aad032a0028b5740193), [`4e31fca12`](https://github.com/clerk/javascript/commit/4e31fca122762a407d196d4eaffcdcc4cb34b39c), [`1f650f30a`](https://github.com/clerk/javascript/commit/1f650f30a97939817b7b2f3cc6283e22dc431523), [`663243220`](https://github.com/clerk/javascript/commit/6632432208aa6ca507f33fa9ab79abaa40431be6), [`1a0268509`](https://github.com/clerk/javascript/commit/1a02685095fe82ac8bb8f7b6d43b3f7b330c4bd5), [`ebf9be77f`](https://github.com/clerk/javascript/commit/ebf9be77f17f8880541de67f66879324f68cf6bd)]:
  - @clerk/localizations@2.0.0-beta.18
  - @clerk/types@4.0.0-beta.21

## 5.0.0-beta.34

### Patch Changes

- Fix the input box-shadow on iOS 16 devices ([#2946](https://github.com/clerk/javascript/pull/2946)) by [@anagstef](https://github.com/anagstef)

- Fix the OAuth errors coming from the server to use localizations ([#2957](https://github.com/clerk/javascript/pull/2957)) by [@anagstef](https://github.com/anagstef)

- Remove the `__clerk_ticket` and `__clerk_invitation_token` query params after they are consumed. ([#2949](https://github.com/clerk/javascript/pull/2949)) by [@desiprisg](https://github.com/desiprisg)

## 5.0.0-beta.33

### Minor Changes

- Experimental support for reading, updating, and deleting a user's registered passkeys. ([#2926](https://github.com/clerk/javascript/pull/2926)) by [@panteliselef](https://github.com/panteliselef)

  - Get the user's passkeys
    `clerk.user.__experimental__passkeys`
  - Update the name of a passkey
    `clerk.user.__experimental__passkeys?.[0].update({name:'work laptop passkey'})`
  - Delete a passkey
    `clerk.user.__experimental__passkeys?.[0].delete()`

### Patch Changes

- The organizationPreviewSecondaryIdentifier element will no longer be rendered empty inside the organization switcher's list. ([#2936](https://github.com/clerk/javascript/pull/2936)) by [@desiprisg](https://github.com/desiprisg)

- Correct the HTML structure of the UI components to ensure validity ([#2894](https://github.com/clerk/javascript/pull/2894)) by [@anagstef](https://github.com/anagstef)

- Show counter of members/invitations/requests even if it is 0. ([#2935](https://github.com/clerk/javascript/pull/2935)) by [@desiprisg](https://github.com/desiprisg)

- Fix invite members to an Organization form to show error when invalid email addresses are submitted. ([#2928](https://github.com/clerk/javascript/pull/2928)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`178907ff6`](https://github.com/clerk/javascript/commit/178907ff69869169e065cff54f2bf4331ad3e493), [`008ac4217`](https://github.com/clerk/javascript/commit/008ac4217bc648085b3caba92a4524c31cc0925b)]:
  - @clerk/localizations@2.0.0-beta.17
  - @clerk/types@4.0.0-beta.20

## 5.0.0-beta.32

### Patch Changes

- Updated dependencies [[`8350f73a6`](https://github.com/clerk/javascript/commit/8350f73a67f8980be78e3bd3343e772f5653d718)]:
  - @clerk/shared@2.0.0-beta.19

## 5.0.0-beta.31

### Minor Changes

- Experimental support for a user to register a passkey for their account. ([#2884](https://github.com/clerk/javascript/pull/2884)) by [@panteliselef](https://github.com/panteliselef)

  Usage: `await clerk.user.__experimental__createPasskey()`

### Patch Changes

- Updated dependencies [[`fafa76fb6`](https://github.com/clerk/javascript/commit/fafa76fb66585b5836cc79985f8bdf1d1b4dca97)]:
  - @clerk/types@4.0.0-beta.19

## 5.0.0-beta.30

### Patch Changes

- Fix badge misalignment on members list when title is empty ([#2908](https://github.com/clerk/javascript/pull/2908)) by [@octoper](https://github.com/octoper)

- Fix Custom Pages freeze error by using useMemo for when creating the custom pages ([#2897](https://github.com/clerk/javascript/pull/2897)) by [@desiprisg](https://github.com/desiprisg)

- Add spacing between `Add domain` button and it's subtitle that's under the Verified Domains section in `<OrganizationProfile/>` component. ([#2910](https://github.com/clerk/javascript/pull/2910)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`e5c989a03`](https://github.com/clerk/javascript/commit/e5c989a035fa16413414c213febe16fcdbeef9b1), [`2ec9f6b09`](https://github.com/clerk/javascript/commit/2ec9f6b09f98ae276658d6dc705e16df0573d817)]:
  - @clerk/shared@2.0.0-beta.18

## 5.0.0-beta.29

### Minor Changes

- Pass environment into `sdkMetadata` in order to detect if production clerk-js is used by other sdks in dev mode. When it is log dev warning from clerk-js. ([#2802](https://github.com/clerk/javascript/pull/2802)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`af80d7074`](https://github.com/clerk/javascript/commit/af80d70746fb74b038d9799738483e5cbc3ecf85), [`18c0d015d`](https://github.com/clerk/javascript/commit/18c0d015d20493e14049fed73a5b6f732372a5cf)]:
  - @clerk/localizations@2.0.0-beta.16
  - @clerk/types@4.0.0-beta.18

## 5.0.0-beta.28

### Patch Changes

- Fix the PhoneInput country ISO text color ([#2893](https://github.com/clerk/javascript/pull/2893)) by [@anagstef](https://github.com/anagstef)

- Make useAwaitableNavigate handle navigations between pages reliably ([#2899](https://github.com/clerk/javascript/pull/2899)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Inputs will now trim usernames and email addresses since whitespace as a prefix or suffix is invalid in these fields. ([#2881](https://github.com/clerk/javascript/pull/2881)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`fe356eebd`](https://github.com/clerk/javascript/commit/fe356eebd8ff527133e0818cf664e7def577cccc)]:
  - @clerk/types@4.0.0-beta.17

## 5.0.0-beta.27

### Patch Changes

- fix(shared,clerk-js): Do not replace current URL if it does not contain a clerk token ([#2879](https://github.com/clerk/javascript/pull/2879)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`1834a3ee4`](https://github.com/clerk/javascript/commit/1834a3ee496ea27b9f7ceeb32ec5361f9de8ee30), [`f8328deb9`](https://github.com/clerk/javascript/commit/f8328deb96725d1a8c2cf4f86f2ce451faf96de3)]:
  - @clerk/shared@2.0.0-beta.17
  - @clerk/localizations@2.0.0-beta.15

## 5.0.0-beta.26

### Patch Changes

- Always drop **clerk_db_jwt and **dev_session params from the URL by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`db18787c4`](https://github.com/clerk/javascript/commit/db18787c4d9fa8ee1306db9b65f3b3f5e2fe2dad)]:
  - @clerk/shared@2.0.0-beta.16

## 5.0.0-beta.25

### Patch Changes

- Remove legacy \_\_dev_session from URL search params ([#2867](https://github.com/clerk/javascript/pull/2867)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`6eab66050`](https://github.com/clerk/javascript/commit/6eab66050608a1bc5cb9aca6a234b1fea16106e5)]:
  - @clerk/shared@2.0.0-beta.15

## 5.0.0-beta.24

### Patch Changes

- Update the debBrowser handling logic to remove hash-based devBrowser JWTs from the URL. Even if v5 does not use the hash-based JWT at all, we still need to remove it from the URL in case clerk-js is initialised on a page after a redirect from an older clerk-js version, such as an AccountPortal using the v4 components ([#2858](https://github.com/clerk/javascript/pull/2858)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`12f3c5c55`](https://github.com/clerk/javascript/commit/12f3c5c55580f93a81df27851fbc92ce1312107e)]:
  - @clerk/shared@2.0.0-beta.14

## 5.0.0-beta.23

### Patch Changes

- Updated dependencies [[`5c239d973`](https://github.com/clerk/javascript/commit/5c239d97373ad2f2aa91ded1b84670f201f7db8f)]:
  - @clerk/types@4.0.0-beta.16

## 5.0.0-beta.22

### Minor Changes

- Use sigUpUrl from props / context / repo-level to construct a redirectUrl in sign-in from email-link flow. ([#2756](https://github.com/clerk/javascript/pull/2756)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Rename beta-v5 to beta by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Ensure the token returned from `getToken()` and the token in the session cookie remain in sync. ([#2809](https://github.com/clerk/javascript/pull/2809)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`2de442b24`](https://github.com/clerk/javascript/commit/2de442b2465cc5d424b8a0b21aa57c557f3aa2e7)]:
  - @clerk/localizations@2.0.0-beta.14
  - @clerk/shared@2.0.0-beta.13
  - @clerk/types@4.0.0-beta.15

## 5.0.0-beta-v5.21

### Minor Changes

- Accept `skipInvitationScreen` as a prop from OrganizationSwitcher. ([#2713](https://github.com/clerk/javascript/pull/2713)) by [@panteliselef](https://github.com/panteliselef)

  `skipInvitationScreen` hides the screen for sending invitations after an organization is created.
  By default, Clerk will automatically hide the screen if the number of max allowed members is equal to 1

- Add support for X/Twitter v2 OAuth provider ([#2690](https://github.com/clerk/javascript/pull/2690)) by [@kostaspt](https://github.com/kostaspt)

- Use signInUrl from props/ context / repo-level to construct a redirectUrl in email-link flow. ([#2727](https://github.com/clerk/javascript/pull/2727)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Add data-1p-ignore to input fields that do not benefit from password manager suggestions. ([#2731](https://github.com/clerk/javascript/pull/2731)) by [@panteliselef](https://github.com/panteliselef)

- Update cookie setting to ensure cookies can be set to be read when an application is embedded in an iframe. ([#2688](https://github.com/clerk/javascript/pull/2688)) by [@SokratisVidros](https://github.com/SokratisVidros)

- Allow retries for all 300xxx error codes for CF Turnstile. ([#2738](https://github.com/clerk/javascript/pull/2738)) by [@mzhong9723](https://github.com/mzhong9723)

- Prevent Clerk component flickering when mounted in a Next.js app using App Router ([#2765](https://github.com/clerk/javascript/pull/2765)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Replace semver with custom regex in versionSelector ([#2760](https://github.com/clerk/javascript/pull/2760)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Escape characters in pattern for inputs of [type="email"] ([#2712](https://github.com/clerk/javascript/pull/2712)) by [@panteliselef](https://github.com/panteliselef)

- Fix redirect flow for OAuth2 IDP flow with email_link verification. ([#2677](https://github.com/clerk/javascript/pull/2677)) by [@mzhong9723](https://github.com/mzhong9723)

- Give application logo correct CSS width to prevent incorrect widths ([#2735](https://github.com/clerk/javascript/pull/2735)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`244de5ea3`](https://github.com/clerk/javascript/commit/244de5ea3a7641727cd85c544bb79fb04f2c0808), [`9737ef510`](https://github.com/clerk/javascript/commit/9737ef5104346821461972d31f3c69e93924f0e0), [`5b8d85886`](https://github.com/clerk/javascript/commit/5b8d85886843fe20c06527b9f015b8c9a03e6b1b), [`8b466a9ba`](https://github.com/clerk/javascript/commit/8b466a9ba93ca10315b534079b09fa5d76ffa305), [`8daf8451c`](https://github.com/clerk/javascript/commit/8daf8451cb564bc834dd856174ffc2cdfa932e37), [`7f751c4ef`](https://github.com/clerk/javascript/commit/7f751c4ef2d14410058cf65ea984a93b50c0b87e), [`be991365e`](https://github.com/clerk/javascript/commit/be991365e1c78d0f1dfc59bb33dd533b6fad223a)]:
  - @clerk/types@4.0.0-beta-v5.14
  - @clerk/localizations@2.0.0-beta-v5.13
  - @clerk/shared@2.0.0-beta-v5.12

## 5.0.0-beta-v5.20

### Patch Changes

- Introduce more component animations by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 5.0.0-beta-v5.19

### Major Changes

- Refresh the look and feel of the Clerk UI components ([#2622](https://github.com/clerk/javascript/pull/2622)) by [@anagstef](https://github.com/anagstef)

  For more info, refer to the [upgrade guide from v4 to v5 in Clerk docs](https://clerk.com/docs/upgrade-guides/upgrading-from-v4-to-v5).

### Patch Changes

- Inform developers who are using legacy Clerk development instances that in V5 URL Based Session Syncing must be enabled. For more information refer to https://clerk.com/docs/upgrade-guides/url-based-session-syncing. ([#2614](https://github.com/clerk/javascript/pull/2614)) by [@SokratisVidros](https://github.com/SokratisVidros)

- Display a warning in the browser's console when organization components are mounted but the "Organizations" feature is disabled for the instance. ([#2603](https://github.com/clerk/javascript/pull/2603)) by [@panteliselef](https://github.com/panteliselef)

- Remove handshake-related query parameters on load of clerk-js. It's possible that these parameters will be returned from Clerk's API, but they are only applicable for SSR-compatible frameworks and so on the client they are unused. ([#2624](https://github.com/clerk/javascript/pull/2624)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`d4ff346dd`](https://github.com/clerk/javascript/commit/d4ff346dd53bb3e1970e80bdc7b188c2dd344f12), [`7886ba89d`](https://github.com/clerk/javascript/commit/7886ba89d76bfea2d6882a46baf64bf98f1148d3)]:
  - @clerk/shared@2.0.0-beta-v5.11
  - @clerk/localizations@2.0.0-beta-v5.12
  - @clerk/types@4.0.0-beta-v5.13

## 5.0.0-alpha-v5.18

### Patch Changes

- Update `@clerk/nextjs` error messages to refer to `clerkMiddleware()` and deprecated `authMiddleware()` and fix a typo in `cannotRenderSignUpComponentWhenSessionExists` error message. ([#2589](https://github.com/clerk/javascript/pull/2589)) by [@dimkl](https://github.com/dimkl)

- Throw error for unsupported method `OrganizationMembership.reload` ([#2604](https://github.com/clerk/javascript/pull/2604)) by [@panteliselef](https://github.com/panteliselef)

- Use pattern for email input fields. ([#2575](https://github.com/clerk/javascript/pull/2575)) by [@panteliselef](https://github.com/panteliselef)

- Take account custom pages when redirecting inside OrganizationProfile. ([#2600](https://github.com/clerk/javascript/pull/2600)) by [@panteliselef](https://github.com/panteliselef)

## 5.0.0-alpha-v5.17

### Patch Changes

- Hide backup codes when adding `phone_code` mfa and instance setting is off. ([#2583](https://github.com/clerk/javascript/pull/2583)) by [@panteliselef](https://github.com/panteliselef)

- Update README for v5 ([#2577](https://github.com/clerk/javascript/pull/2577)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`34fe88f73`](https://github.com/clerk/javascript/commit/34fe88f73f12a0ee569b3e8c8c956f05a8bdc3dc)]:
  - @clerk/localizations@2.0.0-alpha-v5.11

## 5.0.0-alpha-v5.16

### Patch Changes

- Allow dynamic values components props, even if these values change after the components are rendered. For example, a `SignIn` component with a `redirectUrl` prop passed in will always respect the latest value of `redirectUrl`. ([#2515](https://github.com/clerk/javascript/pull/2515)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`8cc45d2af`](https://github.com/clerk/javascript/commit/8cc45d2af98320ccced3768fb039b86576e424a5)]:
  - @clerk/shared@2.0.0-alpha-v5.10

## 5.0.0-alpha-v5.15

### Minor Changes

- Remove fallback data and allow promise to throw for paginated endpoint methods. ([#2491](https://github.com/clerk/javascript/pull/2491)) by [@panteliselef](https://github.com/panteliselef)

  Affected methods:

  - Organization.getDomains
  - Organization.getInvitations
  - Organization.getMembershipRequests
  - Organization.getMemberships
  - User.getOrganizationInvitations
  - User.getOrganizationSuggestions
  - User.getOrganizationMemberships

### Patch Changes

- Exclude external custom links from route matching. Previously adding external links to custom pages would cause all pages that are defined below it to throw an error. ([#2519](https://github.com/clerk/javascript/pull/2519)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`6b316611f`](https://github.com/clerk/javascript/commit/6b316611fb9d647bd75e9ead1858492255339449)]:
  - @clerk/localizations@2.0.0-alpha-v5.10

## 5.0.0-alpha-v5.14

### Patch Changes

- Update user memberships when user creates, leaves or deletes an organization. ([#2473](https://github.com/clerk/javascript/pull/2473)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`1dc28ab46`](https://github.com/clerk/javascript/commit/1dc28ab46f6930074334be183c637ce7a81bebf7), [`ea4933655`](https://github.com/clerk/javascript/commit/ea4933655863ce315324aa2a3be7d5f263c2b61f), [`eb796dd9e`](https://github.com/clerk/javascript/commit/eb796dd9e5329e066ab5f0040a15c1f939d66888), [`38d8b3e8a`](https://github.com/clerk/javascript/commit/38d8b3e8a0387bcf0b9c8d16e3bbfcfe9b643ca2)]:
  - @clerk/shared@2.0.0-alpha-v5.9
  - @clerk/localizations@2.0.0-alpha-v5.9

## 5.0.0-alpha-v5.13

### Patch Changes

- Bug fix: Avoid triggering prepare verification twice. (Affects only dev mode) ([#2459](https://github.com/clerk/javascript/pull/2459)) by [@panteliselef](https://github.com/panteliselef)

- Bug fix: fetch custom roles in OrganizationSwitcher ([#2430](https://github.com/clerk/javascript/pull/2430)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`7ecd6f6ab`](https://github.com/clerk/javascript/commit/7ecd6f6abb0e5bfb1a57c99cc11860de311c3e82), [`390a70732`](https://github.com/clerk/javascript/commit/390a707323fe35cecb55f7c4592ee9d18e7c56be)]:
  - @clerk/shared@2.0.0-alpha-v5.8
  - @clerk/localizations@2.0.0-alpha-v5.8

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

- Make the user name on <UserButton showName /> clickable, i.e. part of the button's trigger. ([#2411](https://github.com/clerk/javascript/pull/2411)) by [@marcelscruz](https://github.com/marcelscruz)

  This change inverts the positions of `cl-userButtonTrigger` and `cl-userButtonBox`, the latter now being a child of the former.

- Consolidate `afterSignOutOneUrl` & `afterSignOutAllUrl` to `afterSignOutUrl` and drop usage of Dashboard settings in ClerkJS components. The Dashboard settings should only apply to the Account Portal application. ([#2414](https://github.com/clerk/javascript/pull/2414)) by [@dimkl](https://github.com/dimkl)

### Minor Changes

- Remove MembershipRole. The type `MembershipRole` would always include the old role keys `admin`, `basic_member`, `guest_member`. ([#2388](https://github.com/clerk/javascript/pull/2388)) by [@panteliselef](https://github.com/panteliselef)

  If developers still depend on them after the introduction of custom roles, the can provide them as their custom types for authorization.

  ```ts
  // clerk.d.ts
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

- Prevent submitting on enter in Organization Profile form when submit button is disabled. ([#2400](https://github.com/clerk/javascript/pull/2400)) by [@panteliselef](https://github.com/panteliselef)

- Bug fix: Clear feedback of input field if `setError` is called with undefined. ([#2399](https://github.com/clerk/javascript/pull/2399)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`fe2607b6f`](https://github.com/clerk/javascript/commit/fe2607b6fdeed83002db7e4a0c040ac0280e5ff7), [`2e4a43017`](https://github.com/clerk/javascript/commit/2e4a43017ef33b541949ba90e16bf5311ce8bc60)]:
  - @clerk/types@4.0.0-alpha-v5.12

## 5.0.0-alpha-v5.11

### Major Changes

- Remove hashing and third-party cookie functionality related to development instance session syncing in favor of URL-based session syncing with query parameters. ([#2367](https://github.com/clerk/javascript/pull/2367)) by [@tmilewski](https://github.com/tmilewski)

- - `buildUrlWithAuth` no longer accepts an `options` argument. ([#2367](https://github.com/clerk/javascript/pull/2367)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Remove legacy roles fallback ([#2385](https://github.com/clerk/javascript/pull/2385)) by [@panteliselef](https://github.com/panteliselef)

  After the release of Custom Roles, roles should always be dynamically fetched.

- Updated dependencies [[`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7)]:
  - @clerk/types@4.0.0-alpha-v5.11
  - @clerk/shared@2.0.0-alpha-v5.7

## 5.0.0-alpha-v5.10

### Major Changes

- Drop `redirectToHome` redirect method in favour of `redirectToAfterSignUp` or `redirectToAfterSignIn`. ([#2251](https://github.com/clerk/javascript/pull/2251)) by [@octoper](https://github.com/octoper)

  When the `<SignIn/>` and `<SignUp/>` components are rendered while a user is already logged in, they will now redirect to the configured `afterSignIn` and `afterSignUp` URLs, respectively. Previously, the redirect URL was set to the home URL configured in the dashboard.

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

- Update `@zxcvbn-ts/core` from `2.2.1` to `3.0.4`. Update `@zxcvbn-ts/language-common` from `3.0.2` to `3.0.4`. ([#2326](https://github.com/clerk/javascript/pull/2326)) by [@LekoArts](https://github.com/LekoArts)

- Add `useAssertWrappedByClerkProvider` to internal code. If you use hooks like `useAuth` outside of the `<ClerkProvider />` context an error will be thrown. For example: ([#2299](https://github.com/clerk/javascript/pull/2299)) by [@tmilewski](https://github.com/tmilewski)

  ```shell
  @clerk/clerk-react: useAuth can only be used within the <ClerkProvider /> component
  ```

- Updated dependencies [[`896cb6104`](https://github.com/clerk/javascript/commit/896cb610409f84c0ff7a4f502f0b4ccee1afc157), [`69ce3e185`](https://github.com/clerk/javascript/commit/69ce3e185b89283956cb711629bc61703166b1c9), [`ab4eb56a5`](https://github.com/clerk/javascript/commit/ab4eb56a5c34baf496ebb8ac412ad6171b9bd79c), [`46040a2f3`](https://github.com/clerk/javascript/commit/46040a2f34d0991072fca490e031c1994b2e2296), [`75ea300bc`](https://github.com/clerk/javascript/commit/75ea300bce16a0ce401a225263bb267ad2a217b8), [`370b17b12`](https://github.com/clerk/javascript/commit/370b17b123c22aab2915207aad8cbc37c06cfa26), [`844847e0b`](https://github.com/clerk/javascript/commit/844847e0becf20243fba3c659b2b77a238dd270a)]:
  - @clerk/shared@2.0.0-alpha-v5.6
  - @clerk/types@4.0.0-alpha-v5.10
  - @clerk/localizations@2.0.0-alpha-v5.7

## 5.0.0-alpha-v5.9

### Major Changes

- Drop `Clerk.isReady(). Use `Clerk.loaded` instead.` ([#2294](https://github.com/clerk/javascript/pull/2294)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Fixes errant `act` output from unit tests ([#2289](https://github.com/clerk/javascript/pull/2289)) by [@tmilewski](https://github.com/tmilewski)

- Fallback to the API error message when the password is pwned and there is no translation available. ([#2273](https://github.com/clerk/javascript/pull/2273)) by [@desiprisg](https://github.com/desiprisg)

- Make the instant password field focusable if it is autofilled. ([#2283](https://github.com/clerk/javascript/pull/2283)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`1db1f4068`](https://github.com/clerk/javascript/commit/1db1f4068466d967df0de39f032a476ca8163651), [`7bffc47cb`](https://github.com/clerk/javascript/commit/7bffc47cb71a2c3e026df5977c25487bfd5c55d7)]:
  - @clerk/types@4.0.0-alpha-v5.9

## 5.0.0-alpha-v5.8

### Major Changes

- Change the default behavior of `afterSignOutUrl`, `afterSignIn` and `afterSignUp` props to be redirected to `/` instead of the Account Portal defined URL. ([#2020](https://github.com/clerk/javascript/pull/2020)) by [@octoper](https://github.com/octoper)

### Patch Changes

- Drop `org:sys_domains:delete` and `org:sys_memberships:delete` as those have now been merged with the respective `manage` ones. ([#2256](https://github.com/clerk/javascript/pull/2256)) by [@panteliselef](https://github.com/panteliselef)

- Hide "Add domain" button inside `<OrganizationProfile/>` when user is missing the `org:sys_domains:manage` permission. ([#2240](https://github.com/clerk/javascript/pull/2240)) by [@panteliselef](https://github.com/panteliselef)

- Add setter for sdkMetadata on Clerk to address issues arising from older versions of the SDK. ([#2237](https://github.com/clerk/javascript/pull/2237)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`6a33709cc`](https://github.com/clerk/javascript/commit/6a33709ccf48586f1a8b62216688ea300b7b5dfb), [`2d383e413`](https://github.com/clerk/javascript/commit/2d383e413920fae1d1b303a669ca165035658639), [`d30ea1faa`](https://github.com/clerk/javascript/commit/d30ea1faa45074e09c037530e8ba3ca2dbd50654)]:
  - @clerk/types@4.0.0-alpha-v5.8
  - @clerk/localizations@2.0.0-alpha-v5.6
  - @clerk/shared@2.0.0-alpha-v5.5

## 5.0.0-alpha-v5.7

### Minor Changes

- Move usage of internal useCoreX hooks to useX hooks ([#2111](https://github.com/clerk/javascript/pull/2111)) by [@LekoArts](https://github.com/LekoArts)

### Patch Changes

- Sync IsomorphicClerk with the clerk singleton and the LoadedClerk interface. IsomorphicClerk now extends from LoadedClerk. ([#2226](https://github.com/clerk/javascript/pull/2226)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`4b8bedc66`](https://github.com/clerk/javascript/commit/4b8bedc66d47dca5c6192148f4b31ae6d49ff733), [`c776f86fb`](https://github.com/clerk/javascript/commit/c776f86fb2a999dcae46fda9abb5005718c354b2), [`d6a7ea61a`](https://github.com/clerk/javascript/commit/d6a7ea61a8ae64c93877ec117e54fc48b1c86f16)]:
  - @clerk/shared@2.0.0-alpha-v5.4
  - @clerk/types@4.0.0-alpha-v5.7

## 5.0.0-alpha-v5.6

### Major Changes

- Use the new `routerPush` and `routerReplace` props for `<ClerkProvider />` instead of `navigate`. ([#1304](https://github.com/clerk/javascript/pull/1304)) by [@desiprisg](https://github.com/desiprisg)

### Minor Changes

- Add `routerDebug` option in `Clerk.load()` to log the destination URLs when navigating ([#2223](https://github.com/clerk/javascript/pull/2223)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`5aab9f04a`](https://github.com/clerk/javascript/commit/5aab9f04a1eac39e42a03f555075e08a5a8ee02c), [`9a1fe3728`](https://github.com/clerk/javascript/commit/9a1fe37289c7606dc111913cb9f70f2a2efff6b7), [`9a1fe3728`](https://github.com/clerk/javascript/commit/9a1fe37289c7606dc111913cb9f70f2a2efff6b7)]:
  - @clerk/types@4.0.0-alpha-v5.6

## 5.0.0-alpha-v5.5

### Major Changes

- All the components that using routing will throw a runtime error if the a path property is provided with a routing strategy other than path. ([#2208](https://github.com/clerk/javascript/pull/2208)) by [@octoper](https://github.com/octoper)

  Example that will throw an error:

  ```tsx
  <SignIn
    routing='hash'
    path='/sign-in'
  />
  ```

### Minor Changes

- Re-use common pagination types for consistency across types. ([#2210](https://github.com/clerk/javascript/pull/2210)) by [@dimkl](https://github.com/dimkl)

  Types introduced in `@clerk/types`:

  - `ClerkPaginationRequest` : describes pagination related props in request payload
  - `ClerkPaginatedResponse` : describes pagination related props in response body
  - `ClerkPaginationParams` : describes pagination related props in api client method params

### Patch Changes

- Updated dependencies [[`b8599d700`](https://github.com/clerk/javascript/commit/b8599d700c38c995183a783c505d0805fda8f5fa), [`12962bc58`](https://github.com/clerk/javascript/commit/12962bc58e2c9caad416ba4e6d52061d00bc2feb)]:
  - @clerk/localizations@2.0.0-alpha-v5.5
  - @clerk/types@4.0.0-alpha-v5.5

## 5.0.0-alpha-v5.4

### Major Changes

- - By default, all the components with routing will have the `routing` prop assigned as `'path'` by default when the `path` prop is filled. ([#1957](https://github.com/clerk/javascript/pull/1957)) by [@octoper](https://github.com/octoper)

  - The `<UserButton />` component will set the default value of the `userProfileMode` prop to `'navigation'` if the `userProfileUrl` prop is provided.
  - The `<OrganizationSwitcher />` component will have the `organizationProfileMode` and `createOrganizationMode` props assigned with `'navigation'` by default if the `organizationProfileUrl` and `createOrganizationUrl` props are filled accordingly.

### Minor Changes

- Drop firebase legacy integration code and start using sessions/:sid/tokens/:template endpoint for the firebase tokens. ([#2190](https://github.com/clerk/javascript/pull/2190)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Reset OTP field when pressing "Cancel" in VerifyDomainPage inside `<OrganziatoinProfile/>`. ([#2200](https://github.com/clerk/javascript/pull/2200)) by [@panteliselef](https://github.com/panteliselef)

- Fallback to custom role name if localization is not provided. ([#2194](https://github.com/clerk/javascript/pull/2194)) by [@panteliselef](https://github.com/panteliselef)

- Revalidate invitations table after invitation screen submit. ([#2195](https://github.com/clerk/javascript/pull/2195)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`164ca116c`](https://github.com/clerk/javascript/commit/164ca116ca717859e5593c333ab65f9d1eb794d0), [`7f6a64f43`](https://github.com/clerk/javascript/commit/7f6a64f4335832c66ff355f6d2f311f33a313d59)]:
  - @clerk/localizations@2.0.0-alpha-v5.4
  - @clerk/types@4.0.0-alpha-v5.4

## 5.0.0-alpha-v5.3

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

- Introducing some changes and some addition for the appearence descriptors for the organization preview in `<OrganizationSwitcher/>`: ([#2158](https://github.com/clerk/javascript/pull/2158)) by [@octoper](https://github.com/octoper)

  - `.cl-organizationPreview__organizationSwitcher` has been renamed to `.cl-organizationPreview__organizationSwitcherTrigger`.
  - `.cl-organizationPreview__organizationSwitcherListedOrganization` was added to allow you to customize the appearance of all the listed organization previews.
  - `.cl-organizationPreview__organizationSwitcherActiveOrganizationn` was added to allow you to customize the appearance of the active organization.

### Patch Changes

- Hide members page of <OrganizationProfile/> if user doesn't have any membership related permissions. ([#2138](https://github.com/clerk/javascript/pull/2138)) by [@panteliselef](https://github.com/panteliselef)

- Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry. ([#2154](https://github.com/clerk/javascript/pull/2154)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`9f5491357`](https://github.com/clerk/javascript/commit/9f5491357defddaa64bf6ab45688d262fcc6fb54), [`27fb9b728`](https://github.com/clerk/javascript/commit/27fb9b7281bc5e6f16e81ed1cd07aa17c44de970), [`52ff8fe6b`](https://github.com/clerk/javascript/commit/52ff8fe6b6ff88ceb5e1246378b54b0565bede9d), [`4bb57057e`](https://github.com/clerk/javascript/commit/4bb57057e9af20fc433626ed178d97d3ca811362), [`40ac4b645`](https://github.com/clerk/javascript/commit/40ac4b645f449b546dae5b4c0d013c9d9ea6d09c), [`429d030f7`](https://github.com/clerk/javascript/commit/429d030f7b6efe838a1e7fec7f736ba59fcc6b61)]:
  - @clerk/localizations@2.0.0-alpha-v5.3
  - @clerk/shared@2.0.0-alpha-v5.3
  - @clerk/types@4.0.0-alpha-v5.3

## 5.0.0-alpha-v5.2

### Major Changes

- Change the minimal Node.js version required by Clerk to `18.17.0`. ([#2162](https://github.com/clerk/javascript/pull/2162)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`c2a090513`](https://github.com/clerk/javascript/commit/c2a0905132684a4a1e8d598b66caddf20062273e)]:
  - @clerk/localizations@2.0.0-alpha-v5.2
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

- Introducing sign out from all open tabs at once. ([#2094](https://github.com/clerk/javascript/pull/2094)) by [@octoper](https://github.com/octoper)

- Introducing default values for `allowedRedirectOrigins`. If no value is provided, default values similar to the example below will apply. ([#2128](https://github.com/clerk/javascript/pull/2128)) by [@octoper](https://github.com/octoper)

  Let's assume the host of the application is `test.host`, the origins will be

  - `https://test.host/`
  - `https://yourawesomeapp.clerk.accounts.dev/`
  - `https://*.yourawesomeapp.clerk.accounts.dev/`

- Increase the duration until data become stale for organization hooks. ([#2093](https://github.com/clerk/javascript/pull/2093)) by [@panteliselef](https://github.com/panteliselef)

- Handle user_locked error encountered in an oauth flow by redirecting to /sign-up or /sign-in ([#2019](https://github.com/clerk/javascript/pull/2019)) by [@yourtallness](https://github.com/yourtallness)

- Add a private \_\_navigateWithError util function to clerk for use in User Lockout scenarios ([#2043](https://github.com/clerk/javascript/pull/2043)) by [@yourtallness](https://github.com/yourtallness)

- Move and export the following from @clerk/clerk-js and @clerk/nextjs to @clerk/shared: ([#2149](https://github.com/clerk/javascript/pull/2149)) by [@dimkl](https://github.com/dimkl)

      - `DEV_BROWSER_SSO_JWT_PARAMETER`
      - `DEV_BROWSER_JWT_MARKER`
      - `DEV_BROWSER_SSO_JWT_KEY`
      - `setDevBrowserJWTInURL`
      - `getDevBrowserJWTFromURL`
      - `getDevBrowserJWTFromResponse`

### Patch Changes

- A bug fix for prefetching data for OrganizationSwitcher and correctly displaying a notification count in the switcher as well. ([#2147](https://github.com/clerk/javascript/pull/2147)) by [@panteliselef](https://github.com/panteliselef)

- Fix incorrect pagination counters in data tables inside `<OrganizationProfile/>`. ([#2056](https://github.com/clerk/javascript/pull/2056)) by [@panteliselef](https://github.com/panteliselef)

- Use strict equality operator to check for lockout errors in handleRedirectCallback ([#2072](https://github.com/clerk/javascript/pull/2072)) by [@yourtallness](https://github.com/yourtallness)

- Emit session when permissions or role of the active memberships change. ([#2073](https://github.com/clerk/javascript/pull/2073)) by [@panteliselef](https://github.com/panteliselef)

- Return reject(err) in factor one & two code forms ([#2080](https://github.com/clerk/javascript/pull/2080)) by [@yourtallness](https://github.com/yourtallness)

- Use `userMemberships` instead of `organizationList` inside `<OrganizationSwitcher/>`. ([#2118](https://github.com/clerk/javascript/pull/2118)) by [@panteliselef](https://github.com/panteliselef)

- Require role to be selected before sending organization invite, affects `<OrganizationProfile/>` and <CreateOrganization/>`. ([#2129](https://github.com/clerk/javascript/pull/2129)) by [@panteliselef](https://github.com/panteliselef)

- Add Autocomplete TS generic for union literals ([#2132](https://github.com/clerk/javascript/pull/2132)) by [@tmilewski](https://github.com/tmilewski)

- Refactor of internal input group, password field, and checkbox inputs in forms. ([#2087](https://github.com/clerk/javascript/pull/2087)) by [@panteliselef](https://github.com/panteliselef)

- Refactor of internal radio input in forms. ([#2034](https://github.com/clerk/javascript/pull/2034)) by [@panteliselef](https://github.com/panteliselef)

- Refresh invited members upon revocation ([#2058](https://github.com/clerk/javascript/pull/2058)) by [@tmilewski](https://github.com/tmilewski)

- Updated dependencies [[`64d3763ec`](https://github.com/clerk/javascript/commit/64d3763ec73747ad04c4b47017195cf4114e150c), [`83e9d0846`](https://github.com/clerk/javascript/commit/83e9d08469e7c2840f06aa7d86831055e23f67a5), [`7f833da9e`](https://github.com/clerk/javascript/commit/7f833da9ebc1b2ec9c65513628c377d0584e5d72), [`492b8a7b1`](https://github.com/clerk/javascript/commit/492b8a7b12f14658a384566012e5807f0a171710), [`b473ad862`](https://github.com/clerk/javascript/commit/b473ad8622b370f140e023759136cc30a84276a2), [`2a22aade8`](https://github.com/clerk/javascript/commit/2a22aade8c9bd1f83a9be085983f96fa87903804), [`f77e8cdbd`](https://github.com/clerk/javascript/commit/f77e8cdbd24411f7f9dbfdafcab0596c598f66c1), [`0d1052ac2`](https://github.com/clerk/javascript/commit/0d1052ac284b909786fd0e4744b02fcf4d1a8be6), [`5471c7e8d`](https://github.com/clerk/javascript/commit/5471c7e8dd0155348748fa90e5ae97093f59efe9), [`477170962`](https://github.com/clerk/javascript/commit/477170962f486fd4e6b0653a64826573f0d8621b), [`e0e79b4fe`](https://github.com/clerk/javascript/commit/e0e79b4fe47f64006718d547c898b9f67fe4d424)]:
  - @clerk/shared@2.0.0-alpha-v5.1
  - @clerk/types@4.0.0-alpha-v5.1
  - @clerk/localizations@2.0.0-alpha-v5.1

## 5.0.0-alpha-v5.0

### Major Changes

- Internal update default apiUrl domain from clerk.dev to clerk.com ([#1878](https://github.com/clerk/javascript/pull/1878)) by [@dimkl](https://github.com/dimkl)

- Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

- Avatar Shimmer will be enabled by default for `<UserButton/>` and `<OrganizationSwitcher/>`. ([#1972](https://github.com/clerk/javascript/pull/1972)) by [@octoper](https://github.com/octoper)

### Minor Changes

- Add support for custom roles in `<OrganizationProfile/>`. ([#2004](https://github.com/clerk/javascript/pull/2004)) by [@panteliselef](https://github.com/panteliselef)

  The previous roles (`admin` and `basic_member`), are still kept as a fallback.

- Experimental support for `<Gate/>` with role checks. ([#1942](https://github.com/clerk/javascript/pull/1942)) by [@panteliselef](https://github.com/panteliselef)

- Greatly improve the UX when users are creating their passwords. The hints below the input fields now have smoother animations and show more types of feedback based on different conditions. Additionally, the password validation is now debounced. ([#1776](https://github.com/clerk/javascript/pull/1776)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Internal refactoring of form fields, deprecation of Form.Control and introduction of Form.PlainInput. ([#1912](https://github.com/clerk/javascript/pull/1912)) by [@panteliselef](https://github.com/panteliselef)

- Shows list of domains if member has the `org:sys_domain:read` permission. ([#1988](https://github.com/clerk/javascript/pull/1988)) by [@panteliselef](https://github.com/panteliselef)

- Rename the @staging tag to @canary. Drop support for @next tag. ([#2015](https://github.com/clerk/javascript/pull/2015)) by [@anagstef](https://github.com/anagstef)

- Enhance `CreateOrganizationForm` by replacing `AvatarPreview` with an upload button to prevent layout shifts ([#2014](https://github.com/clerk/javascript/pull/2014)) by [@nikospapcom](https://github.com/nikospapcom)

- Tests for internal PlainInput component. ([#2029](https://github.com/clerk/javascript/pull/2029)) by [@panteliselef](https://github.com/panteliselef)

- Introduces new element appearance descriptors: ([#1994](https://github.com/clerk/javascript/pull/1994)) by [@tmilewski](https://github.com/tmilewski)

  - `activeDeviceListItem` allows you to customize the appearance of the active device list (accordion) item
    - `activeDeviceListItem__current` allows you to customize the appearance of the _current_ active device list (accordion) item
  - `activeDevice` allows you to customize the appearance of the active device item
    - `activeDevice__current` allows you to customize the appearance of the _current_ active device item

- Replace Form.Control with Form.PlainInput for text and email inputs. ([#2036](https://github.com/clerk/javascript/pull/2036)) by [@panteliselef](https://github.com/panteliselef)

- Localize placeholder of confirmation field when deleting a user account from `<UserProfile/>`. ([#2036](https://github.com/clerk/javascript/pull/2036)) by [@panteliselef](https://github.com/panteliselef)

- Re-initialize the Client to default values when is destroyed ([#1913](https://github.com/clerk/javascript/pull/1913)) by [@octoper](https://github.com/octoper)

- Avoid passing some of the new feedback properties down to the HTML basic elements to avoid react warnings in the console. ([#1977](https://github.com/clerk/javascript/pull/1977)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`743c4d204`](https://github.com/clerk/javascript/commit/743c4d20423790b554e66923466081c0d3b0d9ed), [`d37d44a68`](https://github.com/clerk/javascript/commit/d37d44a68e83b8e895963415f000c1aaef66e87e), [`791c49807`](https://github.com/clerk/javascript/commit/791c49807c3c9e19964cbf621c935d237caeecf3), [`a68eb3083`](https://github.com/clerk/javascript/commit/a68eb3083ff68459cd33098e2df190a5ba26c841), [`0293f29c8`](https://github.com/clerk/javascript/commit/0293f29c855c9415b54867196e8d727d1614e4ca), [`ef2325dcc`](https://github.com/clerk/javascript/commit/ef2325dcc18729e9ce9ee5823e9a963efa51dbc1), [`71663c568`](https://github.com/clerk/javascript/commit/71663c568926b1d60b97aa7ccc5298d05b618af2), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`78fc5eec0`](https://github.com/clerk/javascript/commit/78fc5eec0d61c14d86204944c6aa9f341ae6ea98), [`c7e6d00f5`](https://github.com/clerk/javascript/commit/c7e6d00f56e73df4ed87712e74ad9d5bcaca8924), [`4edb77632`](https://github.com/clerk/javascript/commit/4edb7763271b80d93fcd52ece5f1e408bd75df6f), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`7644b7472`](https://github.com/clerk/javascript/commit/7644b74726ba73e615a1256f9ff3fa03b0f8bc30), [`f5d55bb1f`](https://github.com/clerk/javascript/commit/f5d55bb1fc6a87303fb8bf461c3a917ae4da4005), [`41ae1d2f0`](https://github.com/clerk/javascript/commit/41ae1d2f006a0e4657a97a9c83ae7eb0cc167834), [`48ca40af9`](https://github.com/clerk/javascript/commit/48ca40af97a7fa4f2e41cf0f071028767d1b0075), [`6f755addd`](https://github.com/clerk/javascript/commit/6f755addd0886b9ff8b0d5dbe48e37470049acad)]:
  - @clerk/shared@2.0.0-alpha-v5.0
  - @clerk/types@4.0.0-alpha-v5.0
  - @clerk/localizations@1.26.8-alpha-v5.0

## 4.63.0

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

- Keep `CreateOrganizationForm` disabled in case of an uploaded avatar and organization name is empty. ([#1910](https://github.com/clerk/javascript/pull/1910)) by [@nikospapcom](https://github.com/nikospapcom)

- Drop `experimental_force_oauth_first` & `experimental__forceOauthFirst` from `DisplayConfig` ([#1918](https://github.com/clerk/javascript/pull/1918)) by [@dimkl](https://github.com/dimkl)

- Consider `Clerk.setActive` as stable. ([#1917](https://github.com/clerk/javascript/pull/1917)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`3bf64107e`](https://github.com/clerk/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`734dc52af`](https://github.com/clerk/javascript/commit/734dc52af2ea8c214d617aa5c4065a66471c9f48), [`52f8553d2`](https://github.com/clerk/javascript/commit/52f8553d22f9454ee1194fd162410db15da7a4be), [`92727eec3`](https://github.com/clerk/javascript/commit/92727eec39566278263ffa118a085493f964eb94), [`b09b66eec`](https://github.com/clerk/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerk/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62), [`aa4cd7615`](https://github.com/clerk/javascript/commit/aa4cd761585b888706a36a6eed7436a8f0476dbf)]:
  - @clerk/localizations@1.26.7
  - @clerk/shared@1.0.0
  - @clerk/types@3.57.0

## 4.62.1

### Patch Changes

- Added `formFieldInputPlaceholder__password` to the placeholder of the password input in the `<SignInFactorOnePasswordCard/>` component ([#1909](https://github.com/clerk/javascript/pull/1909)) by [@octoper](https://github.com/octoper)

- Internal fix for deprecation warning when using limi & offset. ([#1904](https://github.com/clerk/javascript/pull/1904)) by [@panteliselef](https://github.com/panteliselef)

- Remove custom Alert from invitation page and display it as a global error instead (at the top of the component). ([#1903](https://github.com/clerk/javascript/pull/1903)) by [@panteliselef](https://github.com/panteliselef)

- Deprecate experimental captcha from Clerk singleton. ([#1905](https://github.com/clerk/javascript/pull/1905)) by [@panteliselef](https://github.com/panteliselef)

- Append query params for sign-in and sign-up initial values after the hash in order to be readable via hash routing. ([#1855](https://github.com/clerk/javascript/pull/1855)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`ccfb0e8ed`](https://github.com/clerk/javascript/commit/ccfb0e8ed43c7857bfd5cb4dcb732fe6cf2d40d5), [`9ca215702`](https://github.com/clerk/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11)]:
  - @clerk/localizations@1.26.6
  - @clerk/types@3.56.1

## 4.62.0

### Minor Changes

- Introduces three new element appearence descriptors: ([#1803](https://github.com/clerk/javascript/pull/1803)) by [@octoper](https://github.com/octoper)

  - `tableHead` let's you customize the tables head styles.
  - `paginationButton` let's you customize the pagination buttons.
  - `paginationRowText` let's you customize the pagination text.

- Add new `/sign-up/continue/verify-phone-number` and `/sign-up/continue/verify-email-address` routes in order to allow navigating back to the `/sign-up/continue` step when editing the extra identifier that is provided in the `/sign-up/continue` step. ([#1870](https://github.com/clerk/javascript/pull/1870)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Improve accessibility of `<UserButton />` and `<OrganizationSwitcher />` by using `aria-*` attributes (where appropriate) and roles like `menu` and `menuitem`. ([#1826](https://github.com/clerk/javascript/pull/1826)) by [@panteliselef](https://github.com/panteliselef)

- Update default organization permissions with a `sys_` prefix as part of the entitlement. This changes makes it easy to distinguish between clerk reserved permissions and custom permissions created by developers. ([#1865](https://github.com/clerk/javascript/pull/1865)) by [@mzhong9723](https://github.com/mzhong9723)

- Mark the following SAML related types as stable: ([#1876](https://github.com/clerk/javascript/pull/1876)) by [@dimkl](https://github.com/dimkl)

  - `User.samlAccounts`
  - `SamlAccount`
  - `UserSettingsResource.saml`
  - `UserSettingsJSON.saml`
  - `SamlSettings`
  - `UserResource.samlAccounts`
  - `SamlAccountResource`
  - `SamlStrategy`
  - `UserJSON.saml_accounts`
  - `SamlAccountJSON`
  - `SamlConfig`
  - `SamlFactor`
  - `HandleSamlCallbackParams`

- Deprecate the `organization.__unstable__invitationUpdate` and `organization.__unstable__membershipUpdate` methods. ([#1879](https://github.com/clerk/javascript/pull/1879)) by [@panteliselef](https://github.com/panteliselef)

- Enforce LTR direction in code inputs ([#1873](https://github.com/clerk/javascript/pull/1873)) by [@desiprisg](https://github.com/desiprisg)

- Replace role based check with permission based checks inside the OrganizationSwitcher component. ([#1851](https://github.com/clerk/javascript/pull/1851)) by [@panteliselef](https://github.com/panteliselef)

- Update `@emotion/react` from `11.10.5` to `11.11.1` to allow internal usage of TypeScript v5 ([Emotion commit](https://github.com/emotion-js/emotion/commit/9357f337200ef38f9c6df5d4dd7c20772478ea42)) ([#1877](https://github.com/clerk/javascript/pull/1877)) by [@LekoArts](https://github.com/LekoArts)

- Replace role based check with permission based checks inside the OrganizationSettings component. ([#1850](https://github.com/clerk/javascript/pull/1850)) by [@panteliselef](https://github.com/panteliselef)

- Fix methods in clerk-js that consumede paginated endpoints in order to retrieve single resources. ([#1871](https://github.com/clerk/javascript/pull/1871)) by [@panteliselef](https://github.com/panteliselef)

- Fix incorrect deprecation message for `__unstable__membershipUpdate`. ([#1889](https://github.com/clerk/javascript/pull/1889)) by [@panteliselef](https://github.com/panteliselef)

- Replace role based check with permission based checks inside the OrganizationMembers component. ([#1849](https://github.com/clerk/javascript/pull/1849)) by [@panteliselef](https://github.com/panteliselef)

- In invite members screen of the <OrganizationProfile /> component, consume any invalid email addresses as they are returned in the API error and remove them from the input automatically. ([#1869](https://github.com/clerk/javascript/pull/1869)) by [@chanioxaris](https://github.com/chanioxaris)

- Updated dependencies [[`35be8709d`](https://github.com/clerk/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`e38488c92`](https://github.com/clerk/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerk/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`9b644d799`](https://github.com/clerk/javascript/commit/9b644d7991b8cba4b385e9443f87798cde5c9989), [`a9894b445`](https://github.com/clerk/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`834dadb36`](https://github.com/clerk/javascript/commit/834dadb36c30b2a8f052784de4ad1026b0083b4e), [`70f251007`](https://github.com/clerk/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`a46d6fe99`](https://github.com/clerk/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/types@3.56.0
  - @clerk/shared@0.24.5
  - @clerk/localizations@1.26.5

## 4.61.0

### Minor Changes

- The sign-in form will now switch to the phone input if the only initial value provided was that of the phone number. ([#1861](https://github.com/clerk/javascript/pull/1861)) by [@desiprisg](https://github.com/desiprisg)

- Add support for LinkedIn OIDC ([#1772](https://github.com/clerk/javascript/pull/1772)) by [@fragoulis](https://github.com/fragoulis)

### Patch Changes

- Warn about _MagicLink_ deprecations: ([#1836](https://github.com/clerk/javascript/pull/1836)) by [@dimkl](https://github.com/dimkl)

  - `MagicLinkError`
  - `isMagicLinkError`
  - `MagicLinkErrorCode`
  - `handleMagicLinkVerification`
  - `createMagicLinkFlow`
  - `useMagicLink`

- Updated the OAuth buttons in the SignIn and SignUp components to prevent layout shifts while loading. ([#1838](https://github.com/clerk/javascript/pull/1838)) by [@octoper](https://github.com/octoper)

- Introduces a new `isAuthorized()` method in the `Session` class. Returns a promise and checks whether the active user is allowed to perform an action based on the passed (required) permission and the ones attached to the membership. ([#1834](https://github.com/clerk/javascript/pull/1834)) by [@panteliselef](https://github.com/panteliselef)

- Introduce a new property on the core Clerk singleton, `sdkMetadata`. This will be populated by each host SDK. This metadata will be used to make logging and debugging easier. ([#1857](https://github.com/clerk/javascript/pull/1857)) by [@BRKalow](https://github.com/BRKalow)

- Fix incorrect path of types for the clerk-js headless variant. ([#1848](https://github.com/clerk/javascript/pull/1848)) by [@panteliselef](https://github.com/panteliselef)

- Throw an error if the `signInUrl` is on the same origin of a satellite application or if it is of invalid format ([#1845](https://github.com/clerk/javascript/pull/1845)) by [@desiprisg](https://github.com/desiprisg)

- Introduces an internal `<Gate/>` component (supporting hook and HOC) which enables us to conditionally render parts of our components based on a users permissions. ([#1834](https://github.com/clerk/javascript/pull/1834)) by [@panteliselef](https://github.com/panteliselef)

- Correctly set idle card state when an error occurs during the MFA set up phase. ([#1825](https://github.com/clerk/javascript/pull/1825)) by [@desiprisg](https://github.com/desiprisg)

- Introduce new `*EmailLink*` helpers that will replace the `*MagicLink*` helpers. ([#1833](https://github.com/clerk/javascript/pull/1833)) by [@dimkl](https://github.com/dimkl)

  Also marked all the `*MagicLink*` as deprecated using JSDocs.

- Disable country picker button when form is submitted ([#1853](https://github.com/clerk/javascript/pull/1853)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`977336f79`](https://github.com/clerk/javascript/commit/977336f793cd4ce5984f98dac3cedf9f5ec363f5), [`997b8e256`](https://github.com/clerk/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`7fb229688`](https://github.com/clerk/javascript/commit/7fb229688020d51c9b6d1721a9b0d039abe4c59d), [`91e9a55f4`](https://github.com/clerk/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`91014880d`](https://github.com/clerk/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`7f4d4b942`](https://github.com/clerk/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b)]:
  - @clerk/shared@0.24.4
  - @clerk/types@3.55.0
  - @clerk/localizations@1.26.4

## 4.60.1

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

- Fixes an issue where the phone number value was not properly copied onto the input when pasting on the email or username field in the `<SignIn/>` component after autoswitching to the phone number field. The issue was introduced with the changes for the Prefill `<SignIn/>` and `<SignUp/>` feature. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1e212c19d`](https://github.com/clerk/javascript/commit/1e212c19d1cbfbcf6bc6718f5aec0a3cb893b96f), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679)]:
  - @clerk/shared@0.24.3

## 4.60.0

### Minor Changes

- Introduce a new user resource method to leave an organization. You can now call 'user.leaveOrganization(<org_id>)' when a user chooses to leave an organization instead of 'organization.removeMember(<user_id>)' which is mostly meant for organization based actions. ([#1809](https://github.com/clerk/javascript/pull/1809)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- - Introduce organizationProfileProps as prop in `<OrganizationSwitcher/>`. ([#1801](https://github.com/clerk/javascript/pull/1801)) by [@panteliselef](https://github.com/panteliselef)

  - Introduce appearance in userProfileProps in `<UserButton/>`.
  - Deprecate the usage of `appearance.userProfile` in `<UserButton/>`.

- Introduce ClerkRuntimeError class for localizing error messages in ClerkJS components ([#1813](https://github.com/clerk/javascript/pull/1813)) by [@panteliselef](https://github.com/panteliselef)

- Enables you to translate the tooltip hint while creating an organization through the `formFieldHintText__slug` key ([#1811](https://github.com/clerk/javascript/pull/1811)) by [@LekoArts](https://github.com/LekoArts)

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Fixes a UI bug on Safari, that was causing the border of tables to be displayed incorrectly ([#1814](https://github.com/clerk/javascript/pull/1814)) by [@panteliselef](https://github.com/panteliselef)

- Warn about `publicUserData.profileImageUrl` nested property deprecation in `OrganizationMembership` & `OrganizationMembershipRequest` resources. ([#1812](https://github.com/clerk/javascript/pull/1812)) by [@dimkl](https://github.com/dimkl)

- Fix internal subpath imports by replacing them with top level imports. ([#1804](https://github.com/clerk/javascript/pull/1804)) by [@dimkl](https://github.com/dimkl)

- Removes `it.skip` from the LeaveOrganizationPage tests. ([#1820](https://github.com/clerk/javascript/pull/1820)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerk/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`164f3aac7`](https://github.com/clerk/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerk/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerk/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`0636ff779`](https://github.com/clerk/javascript/commit/0636ff7799e126d1438d2738ce0e46c3b277f46a), [`9514618d6`](https://github.com/clerk/javascript/commit/9514618d65cfdde0ff011eabd41a992b61fc8dc1), [`ccf42105b`](https://github.com/clerk/javascript/commit/ccf42105bf20ae55ac03cdaf4e7b3d33913033db), [`c7c6912f3`](https://github.com/clerk/javascript/commit/c7c6912f34874467bc74104690fe9f95491cc10d), [`e3451443e`](https://github.com/clerk/javascript/commit/e3451443e5adad2b53e445e990e4ce84170686ab), [`71bb1c7b5`](https://github.com/clerk/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf)]:
  - @clerk/types@3.54.0
  - @clerk/localizations@1.26.3
  - @clerk/shared@0.24.2

## 4.59.1

### Patch Changes

- Apply deprecation warnings for `@clerk/clerk-js`: ([#1800](https://github.com/clerk/javascript/pull/1800)) by [@dimkl](https://github.com/dimkl)

  - `Clerk.setSession`

- Updated dependencies [[`cecf74d79`](https://github.com/clerk/javascript/commit/cecf74d79069662d25f73e4745aa01348d398afb)]:
  - @clerk/shared@0.24.1

## 4.59.0

### Minor Changes

- `<SignIn/>`, `<SignUp/>`, `<RedirectToSignin/>`, `<RedirectToSignUp/>`, `clerk.redirectToSignIn()` and `clerk.redirectToSignUp()` now accept the `initialValues` option, which will prefill the appropriate form fields with the values provided. ([#1701](https://github.com/clerk/javascript/pull/1701)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Use our deprecate utility to log warnings about deprecated usage of Organization.getMemberships ([#1779](https://github.com/clerk/javascript/pull/1779)) by [@dimkl](https://github.com/dimkl)

- Fix: localized key for invalid email addreses in InviteMembers form. ([#1781](https://github.com/clerk/javascript/pull/1781)) by [@panteliselef](https://github.com/panteliselef)

- Apply deprecation warnings clerk-js package for: ([#1779](https://github.com/clerk/javascript/pull/1779)) by [@dimkl](https://github.com/dimkl)

  - Organization.create() using string parameter
  - Organization.retrieve() `limit` & `offset`
  - Clerk.getOrganizationMemberships()
  - `svgUrl`
  - `avatarUrl`/`logoUrl`/`faviconUrl`/`profileImageUrl`

- Updated the OAuth buttons in the SignIn and SignUp components to prevent layout shifts while loading. ([#1728](https://github.com/clerk/javascript/pull/1728)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`7ffa6fac3`](https://github.com/clerk/javascript/commit/7ffa6fac3762f6fb130ba2f2fcaa28e52b36b3b4), [`cc8851765`](https://github.com/clerk/javascript/commit/cc88517650100b0305e4d7a44db62daec3482a33), [`5c8754239`](https://github.com/clerk/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81), [`2f6a6ac99`](https://github.com/clerk/javascript/commit/2f6a6ac9991469bf8532019bb22ff50adecdb434), [`753f7bbda`](https://github.com/clerk/javascript/commit/753f7bbda9bbb7444f96222a3b6cae815a09058f), [`55c8ebd39`](https://github.com/clerk/javascript/commit/55c8ebd390dd88036aee06866009be6a50c63138)]:
  - @clerk/shared@0.24.0
  - @clerk/localizations@1.26.2
  - @clerk/types@3.53.0

## 4.58.2

### Patch Changes

- Safer usage of `localStorage` by checking if `window` is available in current environment ([#1774](https://github.com/clerk/javascript/pull/1774)) by [@LekoArts](https://github.com/LekoArts)

- Some minor TypeScript type fixes to internal components. Also applying some ESLint recommendations. ([#1756](https://github.com/clerk/javascript/pull/1756)) by [@LekoArts](https://github.com/LekoArts)

- Introduces a new method for fetching organization invitations called `Organization.getInvitations`. ([#1766](https://github.com/clerk/javascript/pull/1766)) by [@panteliselef](https://github.com/panteliselef)

  Deprecate `Organization.getPendingInvitations`

- Adds the ability to force users to reset their password. ([#1757](https://github.com/clerk/javascript/pull/1757)) by [@kostaspt](https://github.com/kostaspt)

- Updated dependencies [[`07ede0f95`](https://github.com/clerk/javascript/commit/07ede0f959f232f6cbecb596eb9352f8cb382cdc), [`0eb666118`](https://github.com/clerk/javascript/commit/0eb66611882e6c460cc6a6c5cfa1d9b086ec6917), [`3b85311c9`](https://github.com/clerk/javascript/commit/3b85311c9eb006f51a8642f193473a250de879fc), [`ffcc78c06`](https://github.com/clerk/javascript/commit/ffcc78c062d067738f617ea9b491c1d45677148c), [`c61ddf5bf`](https://github.com/clerk/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerk/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/shared@0.23.1
  - @clerk/types@3.52.1
  - @clerk/localizations@1.26.1

## 4.58.1

### Patch Changes

- Fixed a bug where the "Unverified" badge was missing on email or phone number fields when those where marked as "Primary" ([#1749](https://github.com/clerk/javascript/pull/1749)) by [@panteliselef](https://github.com/panteliselef)

- Removing the `__clerk_referrer_primary` that was marked as deprecated. It was introduced to support the multi-domain featured, but was replaced shortly after. ([#1755](https://github.com/clerk/javascript/pull/1755)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`6706b154c`](https://github.com/clerk/javascript/commit/6706b154c0b41356c7feeb19c6340160a06466e5), [`086a2e0b7`](https://github.com/clerk/javascript/commit/086a2e0b7e71a9919393ca43efedbf3718ea5fe4)]:
  - @clerk/shared@0.23.0

## 4.58.0

### Minor Changes

- Introduce the new brand-new component OrganizationList ([#1692](https://github.com/clerk/javascript/pull/1692)) by [@panteliselef](https://github.com/panteliselef)

  - Lists all the memberships, invitations or suggestions an active user may have
  - Powered by our `useOrganizationList` react hook

### Patch Changes

- Organization.getMemberships now supports paginated responses by passing `{paginated:true}` ([#1708](https://github.com/clerk/javascript/pull/1708)) by [@panteliselef](https://github.com/panteliselef)

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- Add support for redirecting to "factor-one" during account transfer flow. ([#1696](https://github.com/clerk/javascript/pull/1696)) by [@kostaspt](https://github.com/kostaspt)

- Disable role selection for the last admin in OrganizationProfile ([#1721](https://github.com/clerk/javascript/pull/1721)) by [@panteliselef](https://github.com/panteliselef)

- This PR replaces `The verification link expired. Please resend it.` message with the localization key `formFieldError__verificationLinkExpired`. The english message was also adjust to `The verification link expired. Please request a new link.` to make the second sentence clearer. ([#1738](https://github.com/clerk/javascript/pull/1738)) by [@LekoArts](https://github.com/LekoArts)

- Improve color contrast in Badges ([#1716](https://github.com/clerk/javascript/pull/1716)) by [@panteliselef](https://github.com/panteliselef)

- The [issue #1557](https://github.com/clerk/javascript/issues/1557) uncovered that when using `@clerk/nextjs` together with `next-intl` the error `"Failed to execute 'removeChild' on 'Node'"` was thrown. ([#1726](https://github.com/clerk/javascript/pull/1726)) by [@LekoArts](https://github.com/LekoArts)

  That error came from `@floating-ui/react` which `@clerk/clerk-js` used under the hood. Its version was upgraded from `0.19.0` to `0.25.4` to fix this error.

  This error is probably not isolated to `next-intl` so if you encountered a similar error in the past, try upgrading.

- Fix bug with missing or incorrect breadcrumbs in Organization and User profiles ([#1722](https://github.com/clerk/javascript/pull/1722)) by [@panteliselef](https://github.com/panteliselef)

- Fixes minor bug in UI of a success page ([#1725](https://github.com/clerk/javascript/pull/1725)) by [@panteliselef](https://github.com/panteliselef)

- Improve spacing consistency OrganizationList ([#1717](https://github.com/clerk/javascript/pull/1717)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`e6b52ae34`](https://github.com/clerk/javascript/commit/e6b52ae34fcfaf3266dde1334a8e95bc00624ee2), [`e99df0a0d`](https://github.com/clerk/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerk/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`4e16d39f3`](https://github.com/clerk/javascript/commit/4e16d39f3e7a10442753d280abf1b9175784f623), [`8b9a7a360`](https://github.com/clerk/javascript/commit/8b9a7a36003f1b8622f444a139a811f1c35ca813), [`30bb9eccb`](https://github.com/clerk/javascript/commit/30bb9eccb95632fb1de02b756e818118ca6324f7), [`01b024c57`](https://github.com/clerk/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68), [`b0f396bc5`](https://github.com/clerk/javascript/commit/b0f396bc5c75c9920df46e26d672c37f3cc3d974)]:
  - @clerk/localizations@1.26.0
  - @clerk/types@3.52.0
  - @clerk/shared@0.22.1

## 4.57.0

### Minor Changes

- Introduced a new `firstFactorUrl` property in sign-in callback to handle unverified emails. ([#1629](https://github.com/clerk/javascript/pull/1629)) by [@kostaspt](https://github.com/kostaspt)

### Patch Changes

- Organization Switcher now diplays organization invitations and suggestions in a more compact form. ([#1675](https://github.com/clerk/javascript/pull/1675)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`463ff84f5`](https://github.com/clerk/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`1426e5eb3`](https://github.com/clerk/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739), [`060b2bd6b`](https://github.com/clerk/javascript/commit/060b2bd6b18ff534736e2abb8a599f2a51308050)]:
  - @clerk/types@3.51.0
  - @clerk/localizations@1.25.2

## 4.56.3

### Patch Changes

- Display a notification counter for admins with pending request in the active organization. The counter is it visible in OrganizationSwitcher and OrganizationProfile ("Requests" tab) ([#1670](https://github.com/clerk/javascript/pull/1670)) by [@panteliselef](https://github.com/panteliselef)

- Previously users could leave or delete an organization by submiting the form without the macthing organization name ([#1677](https://github.com/clerk/javascript/pull/1677)) by [@panteliselef](https://github.com/panteliselef)

- Support swapping the Clerk publishableKey at runtime to allow users to toggle the instance being used. ([#1655](https://github.com/clerk/javascript/pull/1655)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`169bc3d26`](https://github.com/clerk/javascript/commit/169bc3d26a0b5422183af07f57da742861225985)]:
  - @clerk/localizations@1.25.1

## 4.56.2

### Patch Changes

- Set SameSite=Lax for dev browser cookie, instead of Strict, so that it can be read from the server after redirects ([#1638](https://github.com/clerk/javascript/pull/1638)) by [@yourtallness](https://github.com/yourtallness)

## 4.56.1

### Patch Changes

- Disable chunking for `@clerk/clerk-js/headless` to ensure the library doesn't attempt to dynamically load chunks in a non-browser environment. ([#1654](https://github.com/clerk/javascript/pull/1654)) by [@BRKalow](https://github.com/BRKalow)

## 4.56.0

### Minor Changes

- Introducing validatePassword for SignIn and SignUp resources ([#1445](https://github.com/clerk/javascript/pull/1445)) by [@panteliselef](https://github.com/panteliselef)

  - Validate a password based on the instance's configuration set in Password Policies in Dashboard

- Introduce a new resource called OrganizationSuggestion along with retrieve() & accept() methods ([#1574](https://github.com/clerk/javascript/pull/1574)) by [@chanioxaris](https://github.com/chanioxaris)

  Also make available the user's suggestions from the useOrganizationList hook

- Introduces userInvitations from `useOrganizationList` ([#1520](https://github.com/clerk/javascript/pull/1520)) by [@panteliselef](https://github.com/panteliselef)

  `userInvitations` is a paginated list of data. It can be used to create Paginated tables or Infinite lists.

- Implement Resend OTP functionality as part of the Organization Domain verification flow ([#1583](https://github.com/clerk/javascript/pull/1583)) by [@chanioxaris](https://github.com/chanioxaris)

- Introduce `hasImage` in User / Organization / Session resources ([#1544](https://github.com/clerk/javascript/pull/1544)) by [@dimkl](https://github.com/dimkl)

- Improve redirects on OAuth callback. Now, if you try to sign up with a provider that allows unverified accounts, it will ([#1563](https://github.com/clerk/javascript/pull/1563)) by [@kostaspt](https://github.com/kostaspt)

  navigate to the appropriate change when needed, fixing the broken flow.

- Introduce `logoLinkUrl` prop in `appearance.layout` ([#1449](https://github.com/clerk/javascript/pull/1449)) by [@nikospapcom](https://github.com/nikospapcom)

  A new `logoLinkUrl` prop has been added to `appearance.layout` and used in `ApplicationLogo` to change the `href` of the link.
  By default, the logo link url will be the Home URL you've set in the Clerk Dashboard.

### Patch Changes

- Pass dev_browser to AP via query param, fix AP origin detection util ([#1567](https://github.com/clerk/javascript/pull/1567)) by [@yourtallness](https://github.com/yourtallness)

- Introduces a new resource called OrganizationMembership ([#1572](https://github.com/clerk/javascript/pull/1572)) by [@panteliselef](https://github.com/panteliselef)

  - useOrganization has been updated in order to return a list of domain with the above type

- Introduces Membership Requests in <OrganizationProfile /> ([#1576](https://github.com/clerk/javascript/pull/1576)) by [@panteliselef](https://github.com/panteliselef)

  - This is a list of users that have requested to join the active organization

- Updates signature of OrganizationMembership.retrieve to support backwards compatibility while allowing using the new paginated responses. ([#1606](https://github.com/clerk/javascript/pull/1606)) by [@panteliselef](https://github.com/panteliselef)

  - userMemberships is now also part of the returned values of useOrganizationList

- Introduces the accept method in UserOrganizationInvitation class ([#1550](https://github.com/clerk/javascript/pull/1550)) by [@panteliselef](https://github.com/panteliselef)

- Display a notification counter for organization invitations in OrganizationSwitcher ([#1627](https://github.com/clerk/javascript/pull/1627)) by [@panteliselef](https://github.com/panteliselef)

- Introduces a new resource called OrganizationDomain ([#1569](https://github.com/clerk/javascript/pull/1569)) by [@panteliselef](https://github.com/panteliselef)

  - useOrganization has been updated in order to return a list of domain with the above type

- Introduces domains and invitations in <OrganizationProfile /> ([#1560](https://github.com/clerk/javascript/pull/1560)) by [@panteliselef](https://github.com/panteliselef)

  - The "Members" page now accommodates Domain and Individual invitations
  - The "Settings" page allows for the addition, edit and removal of a domain

- Fix a bug where it was not possible to delete the username if it was optional. ([#1580](https://github.com/clerk/javascript/pull/1580)) by [@raptisj](https://github.com/raptisj)

- A OrganizationMembershipRequest can now be rejected ([#1612](https://github.com/clerk/javascript/pull/1612)) by [@panteliselef](https://github.com/panteliselef)

  - New `OrganizationMembershipRequest.reject` method alongside `accept`
  - As an organization admin, navigate to `Organization Profile` > `Members` > `Requests`. You can now reject a request from the table.

- Ensure the session token is updated when calling `setActive()` in a non-browser environment. ([#1623](https://github.com/clerk/javascript/pull/1623)) by [@BRKalow](https://github.com/BRKalow)

- Introduces an invitation list within <OrganizationSwitcher/> ([#1554](https://github.com/clerk/javascript/pull/1554)) by [@panteliselef](https://github.com/panteliselef)

  - Users can accept the invitation that is sent to them

- When updating enrollment mode of a domain uses can now delete any pending invitations or suggestions. ([#1632](https://github.com/clerk/javascript/pull/1632)) by [@panteliselef](https://github.com/panteliselef)

- Construct urls based on context in <OrganizationSwitcher/> ([#1503](https://github.com/clerk/javascript/pull/1503)) by [@panteliselef](https://github.com/panteliselef)

  - Deprecate `afterSwitchOrganizationUrl`
  - Introduce `afterSelectOrganizationUrl` & `afterSelectPersonalUrl`

  `afterSelectOrganizationUrl` accepts

  - Full URL -> 'https://clerk.com/'
  - relative path -> '/organizations'
  - relative path -> with param '/organizations/:id'
  - function that returns a string -> (org) => `/org/${org.slug}`
    `afterSelectPersonalUrl` accepts
  - Full URL -> 'https://clerk.com/'
  - relative path -> '/users'
  - relative path -> with param '/users/:username'
  - function that returns a string -> (user) => `/users/${user.id}`

- Introduces list of suggestions within <OrganizationSwitcher/> ([#1577](https://github.com/clerk/javascript/pull/1577)) by [@panteliselef](https://github.com/panteliselef)

  - Users can request to join a suggested organization

- Updated dependencies [[`96cc1921c`](https://github.com/clerk/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerk/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerk/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerk/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerk/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerk/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerk/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerk/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerk/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerk/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`17b3de961`](https://github.com/clerk/javascript/commit/17b3de961096446b66853ef2a0a75dc276d89b16), [`86de584dd`](https://github.com/clerk/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e404b98f7`](https://github.com/clerk/javascript/commit/e404b98f7339f2f8167684e664153b7d5ac4400e), [`e02a1aff2`](https://github.com/clerk/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerk/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerk/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`dcabc22c5`](https://github.com/clerk/javascript/commit/dcabc22c5ed71094683ac7e1691c1cfa34f59783), [`52ce79108`](https://github.com/clerk/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerk/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerk/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`89bc5de04`](https://github.com/clerk/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/shared@0.22.0
  - @clerk/types@3.50.0
  - @clerk/localizations@1.25.0

## 4.55.0

### Minor Changes

- Handle the construction of zxcvbn errors with information from FAPI ([#1526](https://github.com/clerk/javascript/pull/1526)) by [@raptisj](https://github.com/raptisj)

- Eliminate pre/post onBlur states for password field and prioritize minimum character count error message over other complexity errors. ([#1531](https://github.com/clerk/javascript/pull/1531)) by [@raptisj](https://github.com/raptisj)

- Introduce Clerk.client.clearCache() method ([#1545](https://github.com/clerk/javascript/pull/1545)) by [@SokratisVidros](https://github.com/SokratisVidros)

### Patch Changes

- Deprecate usage of old image fields in favor of `imageUrl` ([#1543](https://github.com/clerk/javascript/pull/1543)) by [@dimkl](https://github.com/dimkl)

- Introduce the ability to read multiple errors. Used for password complexity errors coming from BE. ([#1505](https://github.com/clerk/javascript/pull/1505)) by [@raptisj](https://github.com/raptisj)

- Introduces a new internal class `UserOrganizationInvitation` that represents and invitation to join an organization with the organization data populated ([#1527](https://github.com/clerk/javascript/pull/1527)) by [@panteliselef](https://github.com/panteliselef)

  Additions to support the above

  - UserOrganizationInvitationResource
  - UserOrganizationInvitationJSON
  - ClerkPaginatedResponse

  ClerkPaginatedResponse represents a paginated FAPI response

- Updated dependencies [[`ea95525a4`](https://github.com/clerk/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerk/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`be7a18cc0`](https://github.com/clerk/javascript/commit/be7a18cc0eff8c31fe17152a9e9efdab9946da72), [`d433b83b9`](https://github.com/clerk/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerk/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`0a59e122d`](https://github.com/clerk/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/types@3.49.0
  - @clerk/shared@0.21.0
  - @clerk/localizations@1.24.1

## 4.54.2

### Patch Changes

- Updated dependencies [[`30cf15c10`](https://github.com/clerk/javascript/commit/30cf15c10c9b47c2b3ba3975bc86856846cf4129)]:
  - @clerk/localizations@1.24.0

## 4.54.1

### Patch Changes

- Introduce the `skipInvitationScreen` prop on `<CreateOrganization />` component ([#1501](https://github.com/clerk/javascript/pull/1501)) by [@panteliselef](https://github.com/panteliselef)

- Removes identifier from Personal Workspace in the OrganizationSwitcher list (UI) ([#1502](https://github.com/clerk/javascript/pull/1502)) by [@panteliselef](https://github.com/panteliselef)

- - Address spacing issues when password feedback message changes ([#1482](https://github.com/clerk/javascript/pull/1482)) by [@raptisj](https://github.com/raptisj)

  - Add a full stop in form feedback(errors and warnings) when needed

- In `<OrganizationProfile />` component, allow an admin to leave the current organization if there are more admins present. ([#1498](https://github.com/clerk/javascript/pull/1498)) by [@chanioxaris](https://github.com/chanioxaris)

- Updated dependencies [[`6fa4768dc`](https://github.com/clerk/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3)]:
  - @clerk/types@3.48.1
  - @clerk/localizations@1.23.2

## 4.54.0

### Minor Changes

- Add unsafeMetadata prop to the SignUp component ([#1464](https://github.com/clerk/javascript/pull/1464)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Experimental support for ESM and CJS for clerk-js ([#1485](https://github.com/clerk/javascript/pull/1485)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`2a9d83280`](https://github.com/clerk/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c), [`73c0f9a29`](https://github.com/clerk/javascript/commit/73c0f9a29499f4fea590aae9c4bf4026395f0c12)]:
  - @clerk/types@3.48.0
  - @clerk/localizations@1.23.1

## 4.53.0

### Minor Changes

- Add a confirmation input as an additional check when doing destructive actions such as: ([#1454](https://github.com/clerk/javascript/pull/1454)) by [@raptisj](https://github.com/raptisj)

  - delete an organization
  - delete a user account
  - leave an organization

  Νew localization keys were introduced to support the above

### Patch Changes

- Add missing property 'maxAllowedMemberships' in Organization resource ([#1468](https://github.com/clerk/javascript/pull/1468)) by [@chanioxaris](https://github.com/chanioxaris)

- Add `form_username_invalid_character` unstable error localization key. ([#1475](https://github.com/clerk/javascript/pull/1475)) by [@desiprisg](https://github.com/desiprisg)

- Fixed a bug where overriding some localization values in the sign in/up start pages with an empty string would result in showing the english translation. ([#1474](https://github.com/clerk/javascript/pull/1474)) by [@desiprisg](https://github.com/desiprisg)

- Changes to OrganizationSwitcher ([#1462](https://github.com/clerk/javascript/pull/1462)) by [@panteliselef](https://github.com/panteliselef)

  - Removal of user identifier from the trigger & popover
  - Hidden avatar of active user when `hidePersonal` is true

- Enable the ability to target the avatar upload and remove action buttons ([#1455](https://github.com/clerk/javascript/pull/1455)) by [@tmilewski](https://github.com/tmilewski)

- In the <CreateOrganization /> component, if the newly created organization has max allowed membership equal to 1, skip the invitation page ([#1471](https://github.com/clerk/javascript/pull/1471)) by [@chanioxaris](https://github.com/chanioxaris)

- Updated dependencies [[`73c9c1d0e`](https://github.com/clerk/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerk/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerk/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`090bab66e`](https://github.com/clerk/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`8bd5b3d38`](https://github.com/clerk/javascript/commit/8bd5b3d386cbcdf460bf347b76a87f0306934bfd), [`5ecbb0a37`](https://github.com/clerk/javascript/commit/5ecbb0a37e99fa2099629c573951c7735d5f0810), [`592911196`](https://github.com/clerk/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8), [`cd361e169`](https://github.com/clerk/javascript/commit/cd361e1698abd58a7eb81290bc86a784333421f1)]:
  - @clerk/types@3.47.0
  - @clerk/localizations@1.23.0
  - @clerk/shared@0.20.0

## 4.52.1

### Patch Changes

- Updated dependencies [[`561a78bd7`](https://github.com/clerk/javascript/commit/561a78bd725ba893c229ddcc312573fb52fbd916)]:
  - @clerk/localizations@1.22.1

## 4.52.0

### Minor Changes

- The password field will now autofocus on the sign in factor one page. ([#1447](https://github.com/clerk/javascript/pull/1447)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Move UI for deleting account to bottom of user profile component in the security section ([#1407](https://github.com/clerk/javascript/pull/1407)) by [@jescalan](https://github.com/jescalan)

## 4.51.0

### Minor Changes

- Navigate to the signUp url if user visits the verify-email-address/verify-phone-number route without the proper identifier present ([#1405](https://github.com/clerk/javascript/pull/1405)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Updated dependencies [[`30f8ad18a`](https://github.com/clerk/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c), [`1ce885065`](https://github.com/clerk/javascript/commit/1ce885065e7ca548a3306d5f03edeaf7ec709850), [`9ce3cbe41`](https://github.com/clerk/javascript/commit/9ce3cbe41f7ce7cb9cd102b45a3626da77062b7d)]:
  - @clerk/types@3.46.1
  - @clerk/localizations@1.22.0

## 4.50.1

### Patch Changes

- Set the `__session` cookie with `samesite:none` for secure iframes only ([#1403](https://github.com/clerk/javascript/pull/1403)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`137322862`](https://github.com/clerk/javascript/commit/137322862f346f0515ff78090b1c19cadc487d3e), [`741012544`](https://github.com/clerk/javascript/commit/741012544a12d34c4e4204626a00f7b1d6a88a05), [`0b55cdf27`](https://github.com/clerk/javascript/commit/0b55cdf2766ea2a0eb2dfe7c42c589816d77e077)]:
  - @clerk/localizations@1.21.1

## 4.50.0

### Minor Changes

- Add ability for organization admins to delete an organization if they have permission to do so ([#1368](https://github.com/clerk/javascript/pull/1368)) by [@jescalan](https://github.com/jescalan)

### Patch Changes

- Support cross-origin iframe to use session cookie ([#1389](https://github.com/clerk/javascript/pull/1389)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`bfb3af28`](https://github.com/clerk/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/localizations@1.21.0
  - @clerk/types@3.46.0

## 4.49.0

### Minor Changes

- If user does not have permission to create an org, create org button will not display in the OrganizationSwitcher UI ([#1373](https://github.com/clerk/javascript/pull/1373)) by [@jescalan](https://github.com/jescalan)

### Patch Changes

- Fix to pull from the correct permissions set when displaying user delete self UI ([#1372](https://github.com/clerk/javascript/pull/1372)) by [@jescalan](https://github.com/jescalan)

- Updated dependencies [[`11954816`](https://github.com/clerk/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`32148490`](https://github.com/clerk/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0
  - @clerk/localizations@1.20.1

## 4.48.1

### Patch Changes

- Updated dependencies [[`e67e0fb2`](https://github.com/clerk/javascript/commit/e67e0fb29bc850938a17bf981427a7e328fe07ea), [`17cc14ec`](https://github.com/clerk/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/localizations@1.20.0
  - @clerk/types@3.44.0

## 4.48.0

### Minor Changes

- Adds the ability for users to delete their own accounts, as long as they have permission to do so ([#1307](https://github.com/clerk/javascript/pull/1307)) by [@jescalan](https://github.com/jescalan)

### Patch Changes

- Password, first name & last name fields will be disabled if there are active SAML accounts. ([#1326](https://github.com/clerk/javascript/pull/1326)) by [@yourtallness](https://github.com/yourtallness)

- Updated dependencies [[`9651658c`](https://github.com/clerk/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerk/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6), [`eed73021`](https://github.com/clerk/javascript/commit/eed73021b0e3d8fd25f7e58828460d9013e0e689), [`a23a3cc8`](https://github.com/clerk/javascript/commit/a23a3cc8dc9ecc3d01188dbd763dc68a74ea06f9)]:
  - @clerk/types@3.43.0
  - @clerk/localizations@1.19.0

## 4.47.2

### Patch Changes

- Optimize all images displayed within the Clerk components, such as Avatars, static OAuth provider assets etc. All images are now resized and compressed. Additionally, all images are automatically converted into more efficient formats (`avif`, `webp`) if they are supported by the user's browser, otherwise all images fall back to `jpeg`. ([#1367](https://github.com/clerk/javascript/pull/1367)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`59bc649a`](https://github.com/clerk/javascript/commit/59bc649a92316f5d6ade00f3cd52a9b46dcdc401)]:
  - @clerk/shared@0.19.1

## 4.47.1

### Patch Changes

- Updated dependencies [[`0d5caa84`](https://github.com/clerk/javascript/commit/0d5caa84a2808dbd260259a4359d7339b99cfb39)]:
  - @clerk/localizations@1.18.1

## 4.47.0

### Minor Changes

- Add base64 string support in Organization.setLogo ([#1309](https://github.com/clerk/javascript/pull/1309)) by [@raptisj](https://github.com/raptisj)

- Fix magic link flows for development instances when url-based session syncing is used. ([#1343](https://github.com/clerk/javascript/pull/1343)) by [@alex-ntousias](https://github.com/alex-ntousias)

### Patch Changes

- Updated dependencies [[`7af91bc3`](https://github.com/clerk/javascript/commit/7af91bc3ecc25cba04968b491e1e3c6ec32c18af), [`c42b4ac0`](https://github.com/clerk/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`5cde6d80`](https://github.com/clerk/javascript/commit/5cde6d8094c7e03dcf4cd4507d815ddb5951f819), [`6f3d4305`](https://github.com/clerk/javascript/commit/6f3d43055690db1d69a356503a0a45dc948beaef)]:
  - @clerk/shared@0.19.0
  - @clerk/types@3.42.0
  - @clerk/localizations@1.18.0

## 4.46.0

### Minor Changes

- Add missing appearance keys for the "Manage Organization" button within `<OrganizationSwitcher/>` by [@nikosdouvlis](https://github.com/nikosdouvlis)

### Patch Changes

- Make first name, last name & password readonly for users with active SAML accounts by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Load CF turnstile from FAPI by [@nikosdouvlis](https://github.com/nikosdouvlis)

- ESM/CJS support for `@clerk/clerk-react` by [@nikosdouvlis](https://github.com/nikosdouvlis)

  Changes that should affect users and OS contributors:

  - Better source map support for `@clerk/clerk-react`, `@clerk/shared`. This affects anyone developing in our monorepo or anyone using a debugger with Clerk installed in their app.
  - Easier node_modules debugging as `@clerk/clerk-react`, `@clerk/shared` and `@clerk/nextjs` are no longer getting bundled as a single-file package. This also improves error logging in nextjs a lot, as nextjs usually logs the line that threw the error - a minified, single-file package, usually consists of a very long single-line module, so logging error in NextJS wasn't ideal.
  - Headless clerk-js bundle size reduced by ~10kb, normal clerk-ks by ~6kb
  - A new `clerkJSVersion` prop has been added on ClerkProvider allowing to fetch a specific clerk-js version.

- Add support for dataURLs in User.setProfileImage by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Support OTP autofill for Chrome on iOS by [@nikosdouvlis](https://github.com/nikosdouvlis)

  - Fixes a bug preventing OTP being correctly autofilled when received via SMS

- Preview known SAML error messages during failed Sign in/up flows by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/localizations@1.17.1
  - @clerk/types@3.41.1
  - @clerk/shared@0.18.0

## [4.45.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.45.0-staging.4...@clerk/clerk-js@4.45.0) (2023-06-03)

**Note:** Version bump only for package @clerk/clerk-js

## [4.44.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.44.0-staging.0...@clerk/clerk-js@4.44.0) (2023-05-26)

**Note:** Version bump only for package @clerk/clerk-js

### [4.43.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.43.2-staging.0...@clerk/clerk-js@4.43.2) (2023-05-23)

**Note:** Version bump only for package @clerk/clerk-js

### [4.43.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.43.0...@clerk/clerk-js@4.43.1) (2023-05-23)

**Note:** Version bump only for package @clerk/clerk-js

## [4.43.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.43.0-staging.1...@clerk/clerk-js@4.43.0) (2023-05-23)

**Note:** Version bump only for package @clerk/clerk-js

## [4.42.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.42.0-staging.1...@clerk/clerk-js@4.42.0) (2023-05-18)

**Note:** Version bump only for package @clerk/clerk-js

## [4.41.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.41.0-staging.2...@clerk/clerk-js@4.41.0) (2023-05-17)

**Note:** Version bump only for package @clerk/clerk-js

## [4.40.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.40.0-staging.4...@clerk/clerk-js@4.40.0) (2023-05-15)

**Note:** Version bump only for package @clerk/clerk-js

## [4.39.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.39.0-staging.6...@clerk/clerk-js@4.39.0) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-js

## [4.39.0-staging.5](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.39.0-staging.4...@clerk/clerk-js@4.39.0-staging.5) (2023-05-04)

### Features

- **clerk-js,types:** Support sign in with SAML strategy ([6da395f](https://github.com/clerk/javascript/commit/6da395fd785467aa934896942408bdb5f64aa887))
- **clerk-js,types:** Support sign up with SAML strategy ([6d9c93e](https://github.com/clerk/javascript/commit/6d9c93e9d782f17bbddde1e68c2ce977415b45db))
- **clerk-js:** Use allowed special characters for password from environment ([dec0512](https://github.com/clerk/javascript/commit/dec05120c180e53595e87817a2f44ef62af0f4f1))

### Bug Fixes

- **clerk-js:** Escape `allowed_special_characters` from FAPI ([da6b683](https://github.com/clerk/javascript/commit/da6b6833d1351a529f40640e821adbc73d121d13))

## [4.39.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.39.0-staging.2...@clerk/clerk-js@4.39.0-staging.3) (2023-05-02)

### Features

- **clerk-js:** Add resetPasswordFlow to SignIn resource ([6155f5b](https://github.com/clerk/javascript/commit/6155f5bde6fe0a140bffb7d8087c2246716abf7e))
- **clerk-js:** Create <ResetPasswordSuccess /> page ([3fbf8e7](https://github.com/clerk/javascript/commit/3fbf8e7157774412096ff432e622540ae2d96ef4))
- **clerk-js:** Introduce Reset Password flow ([e903c4f](https://github.com/clerk/javascript/commit/e903c4f430ae629625177637bb14f965a37596e1))
- **clerk-js:** Localize "Password don't match" field error ([c573599](https://github.com/clerk/javascript/commit/c573599a370d4f3925d0e8a87b37f28f157bb62b))
- **clerk-js:** Prepare Reset password field for complexity and strength ([9736d94](https://github.com/clerk/javascript/commit/9736d94409593a26546b8a7b1a2dec7c023e61b1))
- **clerk-js:** Reset password for first factor ([280b5df](https://github.com/clerk/javascript/commit/280b5df2428b790e679a04004461aadb2717ae2b))
- **clerk-js:** Reset password MFA ([5978756](https://github.com/clerk/javascript/commit/5978756640bc5f5bb4726f72ca2e53ba43f009d6))

### Bug Fixes

- **clerk-js,types:** Remove after_sign_out_url as it not returned by FAPI ([#1121](https://github.com/clerk/javascript/issues/1121)) ([d87493d](https://github.com/clerk/javascript/commit/d87493d13e2c7a3ffbf37ba728e6cde7f6f14682))
- **clerk-js:** Add error when preparing for reset_password_code ([7ac766e](https://github.com/clerk/javascript/commit/7ac766eacf5199944c271a87f81c045709ec3aa7))
- **clerk-js:** Allow children to be passed in VerificationCodeCard ([eb556f8](https://github.com/clerk/javascript/commit/eb556f8a557c5371a56b0b0b72162fd63e85263f))
- **clerk-js:** Password settings maximum allowed length ([bfcb799](https://github.com/clerk/javascript/commit/bfcb7993d156d548f35ee7274e7e023c866c01af))
- **clerk-js:** Remove forgotten console.log ([823a0c0](https://github.com/clerk/javascript/commit/823a0c0c2e83cff1e4c2793994c6a4069881b568))
- **clerk-js:** Update type of resetPasswordFlow in SignInResource ([637b791](https://github.com/clerk/javascript/commit/637b791b0086be35a67e7d8a6a0e7c42989296b5))
- **clerk-js:** Use redirectWithAuth after multi session signOut ([928a206](https://github.com/clerk/javascript/commit/928a2067c10129b6d561473df062fabdee22e2d7))

### [4.38.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.38.3-staging.0...@clerk/clerk-js@4.38.3) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-js

### [4.38.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.38.1...@clerk/clerk-js@4.38.2) (2023-04-19)

### Bug Fixes

- **clerk-js:** Add resetPassword method as a core resource ([fa70749](https://github.com/clerk/javascript/commit/fa70749c3bc0e37433b314ea9e12c5153bf60e0e))
- **clerk-js:** Do not append \_\_clerk_db_jwt if it already exists ([2c9082a](https://github.com/clerk/javascript/commit/2c9082a15f24d360d67620908a36e5f011985392))
- **clerk-js:** Refactor types for resetPassword ([fd53901](https://github.com/clerk/javascript/commit/fd53901c0fd4ce7c7c81a9239d4818002b83f58c))

### [4.38.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.38.1-staging.1...@clerk/clerk-js@4.38.1) (2023-04-12)

**Note:** Version bump only for package @clerk/clerk-js

## [4.38.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.38.0-staging.5...@clerk/clerk-js@4.38.0) (2023-04-11)

**Note:** Version bump only for package @clerk/clerk-js

## [4.37.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.37.0-staging.1...@clerk/clerk-js@4.37.0) (2023-04-06)

**Note:** Version bump only for package @clerk/clerk-js

## [4.36.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.36.0-staging.1...@clerk/clerk-js@4.36.0) (2023-04-03)

**Note:** Version bump only for package @clerk/clerk-js

## [4.35.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.35.0-staging.3...@clerk/clerk-js@4.35.0) (2023-03-31)

**Note:** Version bump only for package @clerk/clerk-js

## [4.35.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.35.0-staging.2...@clerk/clerk-js@4.35.0-staging.3) (2023-03-31)

### Bug Fixes

- **clerk-js:** Run multidomain getters only in browser ([ad10705](https://github.com/clerk/javascript/commit/ad1070506d1b529e6b19483234e5137c539b353c))

### [4.34.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.34.1-staging.0...@clerk/clerk-js@4.34.1) (2023-03-29)

**Note:** Version bump only for package @clerk/clerk-js

## [4.34.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.34.0-staging.1...@clerk/clerk-js@4.34.0) (2023-03-29)

### Bug Fixes

- **clerk-js:** Bring back error for missing proxyUrlAndDomain ([f1ebfd8](https://github.com/clerk/javascript/commit/f1ebfd8526906c32d4a40f00985a6b2303fd39a4))

## [4.32.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.32.0-staging.2...@clerk/clerk-js@4.32.0) (2023-03-10)

**Note:** Version bump only for package @clerk/clerk-js

## [4.31.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.31.0-staging.3...@clerk/clerk-js@4.31.0) (2023-03-09)

**Note:** Version bump only for package @clerk/clerk-js

### [4.30.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.30.0...@clerk/clerk-js@4.30.1) (2023-03-07)

**Note:** Version bump only for package @clerk/clerk-js

## [4.30.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.30.0-staging.0...@clerk/clerk-js@4.30.0) (2023-03-07)

**Note:** Version bump only for package @clerk/clerk-js

### [4.29.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.29.1-staging.1...@clerk/clerk-js@4.29.1) (2023-03-03)

**Note:** Version bump only for package @clerk/clerk-js

## [4.29.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.29.0-staging.0...@clerk/clerk-js@4.29.0) (2023-03-01)

**Note:** Version bump only for package @clerk/clerk-js

### [4.28.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.28.1-staging.1...@clerk/clerk-js@4.28.1) (2023-02-25)

**Note:** Version bump only for package @clerk/clerk-js

### [4.28.1-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.28.1-staging.0...@clerk/clerk-js@4.28.1-staging.1) (2023-02-25)

### Bug Fixes

- **clerk-js:** Dispatch token update only for session token ([fc6837b](https://github.com/clerk/javascript/commit/fc6837b3e9b5fae018b51f4814f3b1f8281f00cc))

## [4.28.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.28.0-staging.0...@clerk/clerk-js@4.28.0) (2023-02-24)

**Note:** Version bump only for package @clerk/clerk-js

### [4.27.3-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.27.3-staging.2...@clerk/clerk-js@4.27.3-staging.3) (2023-02-22)

### Bug Fixes

- **clerk-js:** Pass unsafe metadata to sign up methods ([e2510e6](https://github.com/clerk/javascript/commit/e2510e65b726c113de977fb8252cdcd708ad9bb7))

### [4.27.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.27.2-staging.0...@clerk/clerk-js@4.27.2) (2023-02-17)

**Note:** Version bump only for package @clerk/clerk-js

### [4.27.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.27.1-staging.2...@clerk/clerk-js@4.27.1) (2023-02-15)

**Note:** Version bump only for package @clerk/clerk-js

## [4.27.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.27.0-staging.1...@clerk/clerk-js@4.27.0) (2023-02-10)

**Note:** Version bump only for package @clerk/clerk-js

### [4.26.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.26.1-staging.0...@clerk/clerk-js@4.26.1) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-js

### [4.26.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.26.0-staging.1...@clerk/clerk-js@4.26.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-js

## [4.26.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.26.0-staging.1...@clerk/clerk-js@4.26.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-js

## [4.25.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.25.0-staging.5...@clerk/clerk-js@4.25.0) (2023-02-01)

### Bug Fixes

- **clerk-js:** Do not discard relative redirect urls ([#754](https://github.com/clerk/javascript/issues/754)) ([6b227ff](https://github.com/clerk/javascript/commit/6b227ffac5ded2ef30f5f586891c2985c7569805))

## [4.24.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.24.0-staging.2...@clerk/clerk-js@4.24.0) (2023-01-27)

**Note:** Version bump only for package @clerk/clerk-js

### [4.23.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.23.3-staging.2...@clerk/clerk-js@4.23.3) (2023-01-24)

**Note:** Version bump only for package @clerk/clerk-js

### [4.23.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.23.1...@clerk/clerk-js@4.23.2) (2023-01-20)

**Note:** Version bump only for package @clerk/clerk-js

### [4.23.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.23.0...@clerk/clerk-js@4.23.1) (2023-01-17)

### Bug Fixes

- **clerk-js:** Add missing dev instance suffix for new accounts.dev urls ([cb2e516](https://github.com/clerk/javascript/commit/cb2e516fb8c45c7438a867083a641b9ee4cab2f9))

## [4.23.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.23.0-staging.3...@clerk/clerk-js@4.23.0) (2023-01-17)

**Note:** Version bump only for package @clerk/clerk-js

### [4.22.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.22.1-staging.0...@clerk/clerk-js@4.22.1) (2022-12-23)

**Note:** Version bump only for package @clerk/clerk-js

## [4.22.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.22.0-staging.0...@clerk/clerk-js@4.22.0) (2022-12-19)

**Note:** Version bump only for package @clerk/clerk-js

### [4.21.7](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.21.6...@clerk/clerk-js@4.21.7) (2022-12-14)

### Bug Fixes

- **clerk-js:** Fix spacing between membership widget and members table ([255d495](https://github.com/clerk/javascript/commit/255d49568c687a4b8cc44f4c88bfc44f3bf5d049))

### [4.21.6](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.21.6-staging.0...@clerk/clerk-js@4.21.6) (2022-12-13)

**Note:** Version bump only for package @clerk/clerk-js

### [4.21.5](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.21.4...@clerk/clerk-js@4.21.5) (2022-12-12)

**Note:** Version bump only for package @clerk/clerk-js

### [4.21.4](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.21.4-staging.0...@clerk/clerk-js@4.21.4) (2022-12-12)

**Note:** Version bump only for package @clerk/clerk-js

### [4.21.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.21.3-staging.2...@clerk/clerk-js@4.21.3) (2022-12-09)

**Note:** Version bump only for package @clerk/clerk-js

### [4.21.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.21.1...@clerk/clerk-js@4.21.2) (2022-12-08)

### Reverts

- Revert "feat(clerk-js,types): Terse paths parameters (#572)" ([93bdff8](https://github.com/clerk/javascript/commit/93bdff8362a7e0cbe4bfe44c22b9039d4fb47fb8)), closes [#572](https://github.com/clerk/javascript/issues/572)

### [4.21.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.21.0...@clerk/clerk-js@4.21.1) (2022-12-08)

**Note:** Version bump only for package @clerk/clerk-js

## [4.21.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.21.0-staging.0...@clerk/clerk-js@4.21.0) (2022-12-08)

### Bug Fixes

- **clerk-js:** Tweak options spacing in organization switcher ([b43dac2](https://github.com/clerk/javascript/commit/b43dac25265e4ba6b59969b3c98609a64ff5a9a8))
- **clerk-js:** Tweak options spacing in organization switcher ([c1f1a7c](https://github.com/clerk/javascript/commit/c1f1a7c994951bb6a2162e08772c59d4a640debc))

## [4.20.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.20.0-staging.1...@clerk/clerk-js@4.20.0) (2022-12-02)

**Note:** Version bump only for package @clerk/clerk-js

## [4.19.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.19.0-staging.2...@clerk/clerk-js@4.19.0) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-js

## [4.19.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.19.0-staging.1...@clerk/clerk-js@4.19.0-staging.2) (2022-11-30)

### Bug Fixes

- **clerk-js:** Update typo ([4278a9e](https://github.com/clerk/javascript/commit/4278a9e5ceb92de5a53d6ee938b59e08bd1ecb39))

## [4.19.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.19.0-staging.0...@clerk/clerk-js@4.19.0-staging.1) (2022-11-30)

### Bug Fixes

- **clerk-js:** Treat **unstable**billing props as functions or strings ([3c8bf9c](https://github.com/clerk/javascript/commit/3c8bf9c0a5a9c5e2c2fc73276e90c229e13dc348))

## [4.18.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.18.0-staging.8...@clerk/clerk-js@4.18.0) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-js

## [4.18.0-staging.8](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.18.0-staging.7...@clerk/clerk-js@4.18.0-staging.8) (2022-11-30)

### Bug Fixes

- **clerk-js:** Rename billing widget ([61a1a6a](https://github.com/clerk/javascript/commit/61a1a6acfa90db24e1288f793217ec2315e7f8fb))
- **clerk-js:** Rename memberships widget ([20cf1e4](https://github.com/clerk/javascript/commit/20cf1e4fe42d11b0f2f10551c4060f4282e7eb5b))

## [4.18.0-staging.7](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.18.0-staging.6...@clerk/clerk-js@4.18.0-staging.7) (2022-11-29)

**Note:** Version bump only for package @clerk/clerk-js

## [4.18.0-staging.6](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.18.0-staging.5...@clerk/clerk-js@4.18.0-staging.6) (2022-11-29)

### Bug Fixes

- **clerk-js:** Fix cookieless logic ([698740e](https://github.com/clerk/javascript/commit/698740e41108ba24ba39a64997fdafdce58d0f8e))

## [4.17.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.17.0-staging.1...@clerk/clerk-js@4.17.0) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-js

## [4.17.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.17.0-staging.0...@clerk/clerk-js@4.17.0-staging.1) (2022-11-25)

### Bug Fixes

- **clerk-js:** Ensure #/ prefix for hashes ([0243403](https://github.com/clerk/javascript/commit/0243403f9ff71bf1da164b1a4f5019d63445fdde))

### [4.16.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.16.2-staging.0...@clerk/clerk-js@4.16.2) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-js

### [4.16.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.16.0...@clerk/clerk-js@4.16.1) (2022-11-23)

### Bug Fixes

- **clerk-js:** Add headless folder to final package ([b22d6f9](https://github.com/clerk/javascript/commit/b22d6f93d35254a679086d790509757b4b589f11))

## [4.16.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.16.0-staging.5...@clerk/clerk-js@4.16.0) (2022-11-22)

### Bug Fixes

- **clerk-js:** Adjust picker text size in PhoneInput ([5f6ec69](https://github.com/clerk/javascript/commit/5f6ec691ee8225a187214e748ceb2997fa75d26a))

## [4.16.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.16.0-staging.2...@clerk/clerk-js@4.16.0-staging.3) (2022-11-21)

**Note:** Version bump only for package @clerk/clerk-js

## [4.16.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.16.0-staging.1...@clerk/clerk-js@4.16.0-staging.2) (2022-11-21)

### Features

- **clerk-js:** Export all ClerkJS error utilities ([c225288](https://github.com/clerk/javascript/commit/c2252881516da07d7ccac288ebfb3ba9e86cee5c))
- **clerk-js:** Improve DX for headless import ([8d64310](https://github.com/clerk/javascript/commit/8d64310ab23c6e21f8a687e503521245acad8211))

### [4.15.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.15.2-staging.1...@clerk/clerk-js@4.15.2) (2022-11-18)

**Note:** Version bump only for package @clerk/clerk-js

### [4.15.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.15.0...@clerk/clerk-js@4.15.1) (2022-11-15)

### Bug Fixes

- **clerk-js:** Correct role change check in ActiveMembersList ([3cf8b5e](https://github.com/clerk/javascript/commit/3cf8b5e14669ef78d99a4d4975b7be709a6f3c8f))

## [4.15.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.15.0-staging.1...@clerk/clerk-js@4.15.0) (2022-11-15)

**Note:** Version bump only for package @clerk/clerk-js

### [4.14.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.14.1-staging.2...@clerk/clerk-js@4.14.1) (2022-11-10)

**Note:** Version bump only for package @clerk/clerk-js

## [4.14.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.14.0-staging.1...@clerk/clerk-js@4.14.0) (2022-11-05)

### Features

- **clerk-js,shared:** Introduce private unstable\_\_mutate to force mutate swr state ([2a21dd8](https://github.com/clerk/javascript/commit/2a21dd8ea3935f3889044c063fe7af4bfc03cbfd))
- **clerk-js:** Introduce withOrganizationsEnabledGuard ([00fc621](https://github.com/clerk/javascript/commit/00fc6212c4f9153a1a823198dfb70b7e3134befa))
- **clerk-js:** Reset card error when navigating in OrganizationMembers ([6a1e873](https://github.com/clerk/javascript/commit/6a1e8730c7678ab89b9ea244fe022f7002e050d9))
- **clerk-js:** Update avatar background color ([7874110](https://github.com/clerk/javascript/commit/7874110622cee6a83ce5d1d20544136c0d73447e))
- **types,clerk-js:** Introduce OrganizationSettings resource ([455911f](https://github.com/clerk/javascript/commit/455911f4166e4bea00aa62b32a05bef297983c61))

## [4.13.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.13.0-staging.8...@clerk/clerk-js@4.13.0) (2022-11-03)

**Note:** Version bump only for package @clerk/clerk-js

## [4.13.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.13.0-staging.3...@clerk/clerk-js@4.13.0-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-js

## [4.13.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.13.0-staging.1...@clerk/clerk-js@4.13.0-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-js

## [4.13.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.13.0-staging.1...@clerk/clerk-js@4.13.0-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-js

## [4.13.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.12.1...@clerk/clerk-js@4.13.0-staging.1) (2022-11-02)

### Features

- **clerk-js,types:** Organization invitation metadata ([87764b8](https://github.com/clerk/javascript/commit/87764b839cc65455347e1c19b15f4a17603201b8))
- **clerk-js:** Add `loaded` to core Clerk instance ([7c08a91](https://github.com/clerk/javascript/commit/7c08a914d674f05608503898542b907886465b7e))
- **clerk-js:** Set up the InviteMembersPage for OrganizationProfile ([882727f](https://github.com/clerk/javascript/commit/882727f72accecb4c084656d9233b9c265278a45))

### Bug Fixes

- **clerk-js:** Add TabPanel tabIndex and remove outline ([262499e](https://github.com/clerk/javascript/commit/262499eb17afe3838f1d4fd7a68e688ebe9aea36))
- **clerk-js:** Correctly truncate the name in the OrganizationProfile Navbar ([fc06ec7](https://github.com/clerk/javascript/commit/fc06ec79339d9a9ad8d8d5a650c7c24097808c30))
- **clerk-js:** Fallback to Default Gravatar when not provided an imageUrl ([580a423](https://github.com/clerk/javascript/commit/580a4232817e7a35cfb8f197dfbfda9a16776cce))
- **clerk-js:** Fix globalObject for UMD packaging ([7499207](https://github.com/clerk/javascript/commit/749920780ca1f82c6f1548e7aaa4244c7516bc6f))
- **clerk-js:** Prioritize focus of tabs when keyboard navigating ([3f90c38](https://github.com/clerk/javascript/commit/3f90c38b079d81662a763b276fb5dda326106cc7))
- **clerk-js:** Take into account enabled attributes and not first factors for Sign Up form ([d3fdb1d](https://github.com/clerk/javascript/commit/d3fdb1d9804025084a15006c925a3a3a1f2d36df))
- **clerk-js:** Update the OrgSwitcher trigger when hidePersonal is true ([8a0d8cd](https://github.com/clerk/javascript/commit/8a0d8cdc94d26d5f415ca5db60867b15a7c3ec2f))
- **clerk-js:** Wrap ImpersonationFab with `withCoreSessionSwitchGuard` ([1d7cea9](https://github.com/clerk/javascript/commit/1d7cea9f4bc7325f61b789601b62441240681c60))
- **clerk-js:** Wrap ImpersonationFab with withCoreUserGuard ([7405f34](https://github.com/clerk/javascript/commit/7405f34fd722b2f111e7d3842a05460697e6dddb))
- **clerk-react:** Add frontendAPI on window as a fallback ([06f8b37](https://github.com/clerk/javascript/commit/06f8b3755cda83455e301591badaf16e1d59dd33))

### [4.12.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.12.0...@clerk/clerk-js@4.12.1) (2022-10-24)

### Bug Fixes

- **clerk-js:** Add missing localizationKey import ([fb17eca](https://github.com/clerk/javascript/commit/fb17ecac5a054027078ce1a7d8700cb497c526fa))

## [4.12.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.12.0-staging.1...@clerk/clerk-js@4.12.0) (2022-10-24)

**Note:** Version bump only for package @clerk/clerk-js

## [4.11.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.10.1...@clerk/clerk-js@4.11.0) (2022-10-14)

### Features

- **types,clerk-js:** List only authenticatable OAuth providers in Sign in/up components ([4b3f1e6](https://github.com/clerk/javascript/commit/4b3f1e67d655dfb3e818ce9015b68b369d7a1bd4))

### Bug Fixes

- **clerk-js:** Replace `avatar` descriptor with `avatarBox` ([65cab1f](https://github.com/clerk/javascript/commit/65cab1f4581ea40244c139a59e27f2dac7407d97))

### [4.10.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.10.0...@clerk/clerk-js@4.10.1) (2022-10-14)

### Bug Fixes

- **shared:** Version bump for shared ([c0cebb5](https://github.com/clerk/javascript/commit/c0cebb50bc94fa44e37b96c5a645a8b18ba37df8))

## [4.10.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.10.0-staging.2...@clerk/clerk-js@4.10.0) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-js

## [4.10.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.9.0...@clerk/clerk-js@4.10.0-staging.1) (2022-10-13)

### Features

- **clerk-js,clerk-react,types:** Wire up `OrganizationSwitcher` and `OrganizationProfile` ([1e34e69](https://github.com/clerk/javascript/commit/1e34e6986ee49aeb9ca9f72cdc5d799d6611b53f))
- **clerk-js:** Add table and pagination elements ([cb56f5c](https://github.com/clerk/javascript/commit/cb56f5c0313ba6f1fce50eae6fc3e3d596cf1b16))
- **clerk-js:** Fade in text for ImpersonationFab ([25c24b2](https://github.com/clerk/javascript/commit/25c24b29564ea14e933ca6bfeb108b5fbeee0405))
- **clerk-js:** Introduce Menu element ([f4b4586](https://github.com/clerk/javascript/commit/f4b4586816734a97a06bc7a9ee1c12f728973daa))
- **clerk-js:** Introduce Select element and use it in PhoneInput ([9619bfe](https://github.com/clerk/javascript/commit/9619bfe6da4fb876f2ba6279f2c08d6a8c2d263c))
- **clerk-js:** Make the whole ImpersonationFab draggable ([85d65f8](https://github.com/clerk/javascript/commit/85d65f8ae962cb16b14ddf9b77b4bf42cb1423da))
- **clerk-js:** Replace Switch Account text with icon ([1262f1b](https://github.com/clerk/javascript/commit/1262f1bfacd10df0a292fe0250b8843729aa1162))

### Bug Fixes

- **clerk-js:** Add appearance customization support for avatar gradient ([96cde45](https://github.com/clerk/javascript/commit/96cde45b4f1db5ff074289b57ff58c40bf80f6e1))
- **clerk-js:** Add default colors for avatar ([703fbd9](https://github.com/clerk/javascript/commit/703fbd9922c25b4e34fc8b443020e77d54a11afe))
- **clerk-js:** Add global not_allowed_access error to localization prop ([0313fe5](https://github.com/clerk/javascript/commit/0313fe5ce4e0afca20865ad1b6d0503502ea6e4d))
- **clerk-js:** Consistent ImpersonationFab drag behaviour in mobile ([b53d0a8](https://github.com/clerk/javascript/commit/b53d0a88b898e9aa8161906b671e0cd70c5ba2e9))
- **clerk-js:** Extract BoringAvatar library module ([ca5420b](https://github.com/clerk/javascript/commit/ca5420b4dd6a6ddb26086c1f1641e9b2b44ea7b2))
- **clerk-js:** Fix useSupportEmail.test.tsx ([52bb1cb](https://github.com/clerk/javascript/commit/52bb1cb950edc88b53c8ea05c88b3cfd6b1d377e))
- **clerk-js:** Implement tabs components ([d9428cd](https://github.com/clerk/javascript/commit/d9428cdf21889318a181310f32ea77fe1f627e7e))
- **clerk-js:** Improve keyboard nav and handle disabled tabs order of focus ([ae87f00](https://github.com/clerk/javascript/commit/ae87f0025b457ac64a60bd5176406bb46b1d532f))
- **clerk-js:** Introduce FullHeightLoader element and replace Spinner in UserProfile ([121d697](https://github.com/clerk/javascript/commit/121d6972889fe8ecc3d534e12e40273766b2ba41))
- **clerk-js:** Make global errors localizable ([e674272](https://github.com/clerk/javascript/commit/e674272bfe61d8eae24db3c10436f92eaf98a5da))
- **clerk-js:** Make translateError fallback to longMessage first ([78627ca](https://github.com/clerk/javascript/commit/78627ca84f96627c3b5ccd77e4fbbcb52f5df784))
- **clerk-js:** Minor refactor in naming and types ([8e1d32b](https://github.com/clerk/javascript/commit/8e1d32b660e33c2131642de0e9d0435e40544362))
- **clerk-js:** Remove redundant code ([49c97e2](https://github.com/clerk/javascript/commit/49c97e2165eb54a430c22a74e86649e298205644))
- **clerk-js:** Replace gravatar with Boring avatar ([7f2e2b6](https://github.com/clerk/javascript/commit/7f2e2b600fb746cc36c8464629d63ca3aa1a430b))

## [4.9.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.9.0-staging.1...@clerk/clerk-js@4.9.0) (2022-10-07)

**Note:** Version bump only for package @clerk/clerk-js

### [4.8.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.8.1-staging.0...@clerk/clerk-js@4.8.1) (2022-10-05)

**Note:** Version bump only for package @clerk/clerk-js

## [4.8.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.8.0-staging.3...@clerk/clerk-js@4.8.0) (2022-10-03)

### Features

- **clerk-js:** Add open prop in user button ([6ae7f42](https://github.com/clerk/javascript/commit/6ae7f4226f4db5760e04ee812a494beb66ab2502))

### Bug Fixes

- **clerk-js:** Refactor defaultOpen prop ([1d7b0a9](https://github.com/clerk/javascript/commit/1d7b0a997a86686644d28ac58d0bd7143af9023f))
- **clerk-js:** Refactor isOpen prop ([044860f](https://github.com/clerk/javascript/commit/044860f7204988876b258141108d0e1741204bc1))

## [4.7.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.7.0-staging.4...@clerk/clerk-js@4.7.0) (2022-09-29)

**Note:** Version bump only for package @clerk/clerk-js

### [4.6.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.6.0...@clerk/clerk-js@4.6.1) (2022-09-25)

**Note:** Version bump only for package @clerk/clerk-js

## [4.6.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.6.0-staging.1...@clerk/clerk-js@4.6.0) (2022-09-24)

**Note:** Version bump only for package @clerk/clerk-js

## [4.5.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.5.0-staging.2...@clerk/clerk-js@4.5.0) (2022-09-22)

**Note:** Version bump only for package @clerk/clerk-js

### [4.4.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.4.0-staging.4...@clerk/clerk-js@4.4.1) (2022-09-19)

### Bug Fixes

- **clerk-js:** Add missing applicationName param to `signUp.continue.subtitle` ([1a41709](https://github.com/clerk/javascript/commit/1a41709965d58925ea43f26593c9cbf13405b694))
- **clerk-js:** Add missing applicationName param to `signUp.emailLink.subtitle` ([bd5c8f2](https://github.com/clerk/javascript/commit/bd5c8f2b9b7eb6eae7d3a2a47be40c86b046ef38))
- **clerk-js:** Stop infinite TOTP re-renders by removing user from the dep array ([dc935bb](https://github.com/clerk/javascript/commit/dc935bba64561a485a7670f0f4994150c7938b07))
- **clerk-js:** Typo on remove phone number page ([5fa86a4](https://github.com/clerk/javascript/commit/5fa86a43edb391b8649c431b8dac8d5ca4f6edca))

## [4.4.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.4.0-staging.4...@clerk/clerk-js@4.4.0) (2022-09-16)

### Bug Fixes

- **clerk-js:** Add missing applicationName param to `signUp.continue.subtitle` ([1a41709](https://github.com/clerk/javascript/commit/1a41709965d58925ea43f26593c9cbf13405b694))
- **clerk-js:** Stop infinite TOTP re-renders by removing user from the dep array ([dc935bb](https://github.com/clerk/javascript/commit/dc935bba64561a485a7670f0f4994150c7938b07))

### [4.3.5](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.3.5-staging.0...@clerk/clerk-js@4.3.5) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-js

### [4.3.4](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.3.4-staging.1...@clerk/clerk-js@4.3.4) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-js

### [4.3.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.3.3-staging.0...@clerk/clerk-js@4.3.3) (2022-09-03)

**Note:** Version bump only for package @clerk/clerk-js

### [4.3.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.3.2-staging.2...@clerk/clerk-js@4.3.2) (2022-09-02)

**Note:** Version bump only for package @clerk/clerk-js

### [4.3.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.3.1-staging.0...@clerk/clerk-js@4.3.1) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-js

## [4.3.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.3.0-staging.0...@clerk/clerk-js@4.3.0) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-js

### [4.2.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.2.2-staging.1...@clerk/clerk-js@4.2.2) (2022-08-24)

**Note:** Version bump only for package @clerk/clerk-js

### [4.2.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.2.0...@clerk/clerk-js@4.2.1) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-js

## [4.2.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.2.0-staging.1...@clerk/clerk-js@4.2.0) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-js

## [4.2.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.2.0-staging.0...@clerk/clerk-js@4.2.0-staging.1) (2022-08-18)

### Bug Fixes

- **clerk-js:** Minor cleanup ([d44a8a9](https://github.com/clerk/javascript/commit/d44a8a910a419bb72a873c34e2e4d0421d8eacfc))

### [4.1.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.1.0...@clerk/clerk-js@4.1.1) (2022-08-16)

**Note:** Version bump only for package @clerk/clerk-js

## [4.1.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.1.0-staging.1...@clerk/clerk-js@4.1.0) (2022-08-11)

**Note:** Version bump only for package @clerk/clerk-js

### [4.0.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.0.2-staging.0...@clerk/clerk-js@4.0.2) (2022-08-09)

### Bug Fixes

- **clerk-js:** Improve invalid color error ([715d21c](https://github.com/clerk/javascript/commit/715d21ca1bd3461f3a8221582e1dc2ca656bb89b))
- **clerk-js:** Introduce more selectors ([bf4c3b3](https://github.com/clerk/javascript/commit/bf4c3b372c7e74b1b42ce53cb7254e54b67c7815))

### [4.0.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.0.0...@clerk/clerk-js@4.0.1) (2022-08-07)

**Note:** Version bump only for package @clerk/clerk-js

## [4.0.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@4.0.0-staging.1...@clerk/clerk-js@4.0.0) (2022-08-05)

**Note:** Version bump only for package @clerk/clerk-js

## [3.17.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.16.4...@clerk/clerk-js@3.17.0) (2022-08-04)

### Features

- **clerk-js:** Get support email from FAPI /v1/environment if exists ([c9bb8d7](https://github.com/clerk/javascript/commit/c9bb8d7aaf3958207d4799bdd30e3b15b2890a5d))

### [3.16.4](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.16.3...@clerk/clerk-js@3.16.4) (2022-07-13)

**Note:** Version bump only for package @clerk/clerk-js

### [3.16.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.16.3-staging.1...@clerk/clerk-js@3.16.3) (2022-07-12)

**Note:** Version bump only for package @clerk/clerk-js

### [3.16.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.16.1...@clerk/clerk-js@3.16.2) (2022-07-07)

**Note:** Version bump only for package @clerk/clerk-js

### [3.16.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.16.0...@clerk/clerk-js@3.16.1) (2022-07-06)

**Note:** Version bump only for package @clerk/clerk-js

## [3.16.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.15.0...@clerk/clerk-js@3.16.0) (2022-07-01)

### Features

- **types,clerk-js:** Introduce user hasVerifiedEmailAddress & hasVerifiedPhoneNumber attributes ([ea68447](https://github.com/clerk/javascript/commit/ea684473697c33b7b5d8930fe24b7667f6edeaad))

## [3.15.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.14.0...@clerk/clerk-js@3.15.0) (2022-06-24)

### Features

- **clerk-js:** Add supportEmail property option ([71eff74](https://github.com/clerk/javascript/commit/71eff74383bcd1c3044cfd42ceae70de5b246e68))

## [3.14.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.14.0-staging.1...@clerk/clerk-js@3.14.0) (2022-06-16)

**Note:** Version bump only for package @clerk/clerk-js

## [3.14.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.14.0-staging.0...@clerk/clerk-js@3.14.0-staging.1) (2022-06-16)

### Bug Fixes

- **clerk-js:** Default verification status to unverified if verification is missing ([cac67a0](https://github.com/clerk/javascript/commit/cac67a0199c0058ba23a7b74834dfa55915a42ae))

### [3.13.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.13.3-staging.0...@clerk/clerk-js@3.13.3) (2022-06-15)

**Note:** Version bump only for package @clerk/clerk-js

### [3.13.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.13.2-staging.0...@clerk/clerk-js@3.13.2) (2022-06-07)

**Note:** Version bump only for package @clerk/clerk-js

### [3.13.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.13.0...@clerk/clerk-js@3.13.1) (2022-06-06)

### Bug Fixes

- **clerk-js:** Fix new URL constructor ([d0cc743](https://github.com/clerk/javascript/commit/d0cc74330bfbf277fa5529e9e537cad384875653))

## [3.13.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.12.0-staging.11...@clerk/clerk-js@3.13.0) (2022-06-06)

**Note:** Version bump only for package @clerk/clerk-js

## [3.12.0-staging.11](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.12.0-staging.10...@clerk/clerk-js@3.12.0-staging.11) (2022-06-03)

### Bug Fixes

- **clerk-js:** Teach ClerkJS to work in expo again ([5492b69](https://github.com/clerk/javascript/commit/5492b691f4e865223487e86585d8539bbf99dcf3))

## [3.12.0-staging.10](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.12.0-staging.9...@clerk/clerk-js@3.12.0-staging.10) (2022-06-03)

### Bug Fixes

- **clerk-js:** Apply minor copywriting fixes ([4a1dab4](https://github.com/clerk/javascript/commit/4a1dab454908cc90276a67e0f3d43bb625679ee8))
- **clerk-js:** Apply minor copywriting fixes - pt2 ([49c128b](https://github.com/clerk/javascript/commit/49c128b80d0282d0e687470990b36080544dc176))

## [3.12.0-staging.9](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.12.0-staging.8...@clerk/clerk-js@3.12.0-staging.9) (2022-06-03)

### Bug Fixes

- **clerk-js:** If organization is `null`, set the active org as null ([f7bff5c](https://github.com/clerk/javascript/commit/f7bff5c586a33e2b45258912924ab27b4ecf6da9))
- **clerk-js:** Render SignUp form input errors if missing ([bec968c](https://github.com/clerk/javascript/commit/bec968c79a34b77ca62d74985e4647d556248644))

## [3.12.0-staging.8](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.12.0-staging.7...@clerk/clerk-js@3.12.0-staging.8) (2022-06-03)

### Bug Fixes

- **clerk-js,types:** Typo for MetaMask web3 provider name ([922dcb5](https://github.com/clerk/javascript/commit/922dcb52f406a17da8038cafaf10353b15aab2bf))
- **clerk-js:** Improve removal page copyright for connected account and web3 wallet ([bfdfbba](https://github.com/clerk/javascript/commit/bfdfbba20fdfcdb86f451902ed12133ee54bd3fe))
- **clerk-js:** Render UserProfile connected account section only if at least one provider is enabled ([23a127f](https://github.com/clerk/javascript/commit/23a127f60b08b7551df05d5ec88980f404e527d0))

## [3.12.0-staging.7](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.12.0-staging.6...@clerk/clerk-js@3.12.0-staging.7) (2022-06-02)

### Features

- **clerk-js:** Support multiple unverified identifiers during Sign up flow ([3ec9dd5](https://github.com/clerk/javascript/commit/3ec9dd58379b9e56eccde9ecad1081a69bb7bf6b))
- **types,clerk-js:** Support required/optional email/phone for Progressive sign up instances ([13da457](https://github.com/clerk/javascript/commit/13da4576a08e4e396fa48605ecf61accc06057d5))

## [3.12.0-staging.6](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.12.0-staging.5...@clerk/clerk-js@3.12.0-staging.6) (2022-06-01)

### Features

- **types,clerk-js:** Introduce web3 wallet operations in UserProfile ([6570a87](https://github.com/clerk/javascript/commit/6570a87439d92a59057b2df50ec482511428495e))

### Bug Fixes

- **clerk-js:** Do not show verification status badges for ext accnts on the user profile page ([0fa4f46](https://github.com/clerk/javascript/commit/0fa4f462931ca91560d8dc0d16259b910555c741))
- **clerk-js:** Emit changes in organization to listeners ([798ee62](https://github.com/clerk/javascript/commit/798ee622e7961d3aa7f8842184f5fadbcfed517f))
- **clerk-js:** Fixed bugs in `setActive` caused by new conditions on session ([37f4010](https://github.com/clerk/javascript/commit/37f4010362e8af4ea8aa62f8bf925df4527906ef))
- **types,clerk-js:** Same component navigate after OAuth flow with missing requirements ([39ca6ce](https://github.com/clerk/javascript/commit/39ca6cee3a8a160fdf0ca95a713707afee55f1fc))

## [3.12.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.12.0-staging.4...@clerk/clerk-js@3.12.0) (2022-05-20)

**Note:** Version bump only for package @clerk/clerk-js

## [3.12.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.12.0-staging.3...@clerk/clerk-js@3.12.0-staging.4) (2022-05-20)

### Bug Fixes

- **clerk-js:** Refactor imports to stop bundling shared when not used ([b0d5e73](https://github.com/clerk/javascript/commit/b0d5e73ff718c43382cbf6f2ad23ae9627a8eb9a))

## [3.12.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.12.0-staging.2...@clerk/clerk-js@3.12.0-staging.3) (2022-05-19)

### Bug Fixes

- **clerk-js:** Fix password field display logic, fix margin between oauth & web3 providers ([fe601a4](https://github.com/clerk/javascript/commit/fe601a495f4bead1dc7dd8b37bdb8aa45566d143))

## [3.12.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.11.0...@clerk/clerk-js@3.12.0-staging.2) (2022-05-18)

### Features

- **clerk-js:** Make sign up flow resumable ([bfe0d8c](https://github.com/clerk/javascript/commit/bfe0d8cb917d9be3441b7f8a9473e905310fe6e4))
- **clerk-js:** Make sign up flow resumable for Web3 providers ([cf49066](https://github.com/clerk/javascript/commit/cf4906692cb1ae4eb41ac44a6d2dae64aba97fea))
- **clerk-js:** Replace Error & Info component with a single Alert component ([8c34d21](https://github.com/clerk/javascript/commit/8c34d2176fcc9eca346b6be91ff5dd1987929c28))
- **clerk-js:** Session touch should include the active organization ([664030c](https://github.com/clerk/javascript/commit/664030c3f4aedbd5e886d8ada906b64ac2ed06b5))
- **types,clerk-js:** Enhance Web3 wallet resource with relevant operations ([a166716](https://github.com/clerk/javascript/commit/a166716db44db8e765e67c154093c9d3c3f24c75))

### Bug Fixes

- **clerk-js:** Navigate to sign up continue in web3 ([460ba1c](https://github.com/clerk/javascript/commit/460ba1cc82bbad6197224ca71ad39302564408b4))

## [3.12.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.11.0...@clerk/clerk-js@3.12.0-staging.1) (2022-05-17)

### Features

- **clerk-js:** Make sign up flow resumable ([bfe0d8c](https://github.com/clerk/javascript/commit/bfe0d8cb917d9be3441b7f8a9473e905310fe6e4))
- **clerk-js:** Make sign up flow resumable for Web3 providers ([cf49066](https://github.com/clerk/javascript/commit/cf4906692cb1ae4eb41ac44a6d2dae64aba97fea))
- **clerk-js:** Replace Error & Info component with a single Alert component ([8c34d21](https://github.com/clerk/javascript/commit/8c34d2176fcc9eca346b6be91ff5dd1987929c28))
- **clerk-js:** Session touch should include the active organization ([664030c](https://github.com/clerk/javascript/commit/664030c3f4aedbd5e886d8ada906b64ac2ed06b5))

### Bug Fixes

- **clerk-js:** Navigate to sign up continue in web3 ([460ba1c](https://github.com/clerk/javascript/commit/460ba1cc82bbad6197224ca71ad39302564408b4))

## [3.12.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.11.0...@clerk/clerk-js@3.12.0-staging.0) (2022-05-16)

### Features

- **clerk-js:** Session touch should include the active organization ([664030c](https://github.com/clerk/javascript/commit/664030c3f4aedbd5e886d8ada906b64ac2ed06b5))

## [3.11.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.10.2...@clerk/clerk-js@3.11.0) (2022-05-13)

### Features

- **clerk-js:** Add shortcut to active org in Clerk singleton ([03e68d4](https://github.com/clerk/javascript/commit/03e68d4667e7abcd006c4a3a2a2fe7f65bfca417))

### [3.10.4](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.10.2...@clerk/clerk-js@3.10.4) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-js

### [3.10.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.10.2...@clerk/clerk-js@3.10.3) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-js

### [3.10.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.10.2-staging.1...@clerk/clerk-js@3.10.2) (2022-05-11)

**Note:** Version bump only for package @clerk/clerk-js

### [3.10.2-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.10.2-staging.0...@clerk/clerk-js@3.10.2-staging.1) (2022-05-11)

### Bug Fixes

- **clerk-js:** Use redirect_url across all auth flows ([#229](https://github.com/clerk/javascript/issues/229)) ([5dfdc2d](https://github.com/clerk/javascript/commit/5dfdc2dd395728ec8b6afaddb13d2ca9bb6d48fb))

### [3.10.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.10.0...@clerk/clerk-js@3.10.1) (2022-05-06)

**Note:** Version bump only for package @clerk/clerk-js

## [3.10.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.10.0-staging.0...@clerk/clerk-js@3.10.0) (2022-05-05)

**Note:** Version bump only for package @clerk/clerk-js

## [3.9.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.8.1-staging.0...@clerk/clerk-js@3.9.0) (2022-04-28)

### Features

- **clerk-js:** Add members to organizations ([d6787b6](https://github.com/clerk/javascript/commit/d6787b659744ea2ca178d6cf7df488be265d7a69))
- **clerk-js:** Delete organizations ([7cb1bea](https://github.com/clerk/javascript/commit/7cb1beaf12b293b9fde541855eb2cda81e0d6be4))

## [3.8.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.8.0-staging.0...@clerk/clerk-js@3.8.0) (2022-04-22)

**Note:** Version bump only for package @clerk/clerk-js

### [3.7.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.7.1-staging.1...@clerk/clerk-js@3.7.1) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-js

### [3.7.1-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.7.1-staging.0...@clerk/clerk-js@3.7.1-staging.1) (2022-04-19)

### Bug Fixes

- **clerk-js:** Pass rotating_token_nonce correctly to FAPIClient ([370cb0e](https://github.com/clerk/javascript/commit/370cb0e26bccd524c44b9e7fc0e15521193f514f))

## [3.7.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.6.1-alpha.0...@clerk/clerk-js@3.7.0) (2022-04-18)

### Features

- **clerk-js:** Organization slugs ([7f0e771](https://github.com/clerk/javascript/commit/7f0e771036815885b01da095979cf39da212503f))

### [3.6.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.6.0...@clerk/clerk-js@3.6.1-alpha.0) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-js

## [3.6.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.6.0-staging.0...@clerk/clerk-js@3.6.0) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-js

## [3.5.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.5.0-staging.0...@clerk/clerk-js@3.5.0) (2022-04-13)

**Note:** Version bump only for package @clerk/clerk-js

### [3.4.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.4.1...@clerk/clerk-js@3.4.2) (2022-04-11)

### Bug Fixes

- **clerk-js:** Set provider as busy when initiating oauth connection & prevent further clicks ([a2faf0f](https://github.com/clerk/javascript/commit/a2faf0f032d23e1733460eb94ac8fed20f1dc9bb))

### [3.4.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.4.0...@clerk/clerk-js@3.4.1) (2022-04-07)

### Bug Fixes

- **clerk-js:** Hide unverified accts from profile, skip unverified accts w/o known error from list ([ac28d0d](https://github.com/clerk/javascript/commit/ac28d0dcac55ac39ac10dc3a7600c0abd5d65b3c))

## [3.4.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.4.0-staging.0...@clerk/clerk-js@3.4.0) (2022-04-04)

**Note:** Version bump only for package @clerk/clerk-js

## [3.3.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.2.2...@clerk/clerk-js@3.3.0) (2022-03-31)

### Features

- **clerk-react:** Allow usernames to be optional ([ea4583a](https://github.com/clerk/javascript/commit/ea4583a0a86cd1a73fb8408a0b599f31d06adcc8))

### [3.2.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.2.2-staging.0...@clerk/clerk-js@3.2.2) (2022-03-29)

**Note:** Version bump only for package @clerk/clerk-js

### [3.2.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.2.1-staging.0...@clerk/clerk-js@3.2.1) (2022-03-28)

**Note:** Version bump only for package @clerk/clerk-js

## [3.2.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.2.0-alpha.0...@clerk/clerk-js@3.2.0) (2022-03-24)

**Note:** Version bump only for package @clerk/clerk-js

## [3.2.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.1.2-staging.0...@clerk/clerk-js@3.2.0-staging.0) (2022-03-24)

### Features

- **types,clerk-js,backend-core,clerk-react:** Replace thrown error with null return in getToken ([d972f93](https://github.com/clerk/javascript/commit/d972f93684a39abf3619c335cc012b61d5187100))

### Bug Fixes

- **clerk-js:** Force client update on resource reload ([#143](https://github.com/clerk/javascript/issues/143)) ([1dd0af2](https://github.com/clerk/javascript/commit/1dd0af253466c49dca988f47a6bf30482d4ddcaa))

### [3.1.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.1.1-staging.0...@clerk/clerk-js@3.1.1-alpha.0) (2022-03-23)

**Note:** Version bump only for package @clerk/clerk-js

## [3.1.0-alpha.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.1.0-alpha.0...@clerk/clerk-js@3.1.0-alpha.1) (2022-03-23)

### Features

- **types,clerk-js:** Allow connecting external accounts from the user profile page ([180961b](https://github.com/clerk/javascript/commit/180961b61d5f6b75b5bc373f5d644cd0576831a8))

## [3.1.0-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.0.1-alpha.3...@clerk/clerk-js@3.1.0-alpha.0) (2022-03-23)

### Features

- **clerk-js,types:** Rename UserButton params to afterSignOutUrl, afterMultiSessionSingleSignOutUrl ([c4cb76a](https://github.com/clerk/javascript/commit/c4cb76a1133fd2308b217cacaffb086b175f6347))

### Bug Fixes

- **clerk-js:** Stop parsing deprecated params from query strings ([8280d96](https://github.com/clerk/javascript/commit/8280d96f3cc99290687a551627c675e2b6a1edf0))

### [3.0.1-alpha.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.0.1-alpha.2...@clerk/clerk-js@3.0.1-alpha.3) (2022-03-22)

### Bug Fixes

- **clerk-expo:** Setup createPageLifecycle only in browser environment ([#133](https://github.com/clerk/javascript/issues/133)) ([75bd5a1](https://github.com/clerk/javascript/commit/75bd5a1ee73d60fe5ed48fe96e2823054376ffd2))
- **clerk-js:** Add createdUserId attribute to SignUp ([#132](https://github.com/clerk/javascript/issues/132)) ([b1884bd](https://github.com/clerk/javascript/commit/b1884bd950d9fcb27505269a09038dd571072a4e))

### [3.0.1-alpha.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.0.1-staging.0...@clerk/clerk-js@3.0.1-alpha.2) (2022-03-22)

### Bug Fixes

- **clerk-js,clerk-react:** Move error to getToken ([d5f6b26](https://github.com/clerk/javascript/commit/d5f6b264cf58ce40c68de298b4c7c564d472001f))
- **clerk-js:** Fix signIn.prepareFirstFactor params ([e435245](https://github.com/clerk/javascript/commit/e4352454028099f0973203aa79e548890c6327bd))
- **clerk-js:** Make getToken use /user endpoint for integration tokens ([b61213b](https://github.com/clerk/javascript/commit/b61213b4c94952e6f21dd8e036aa6815c5c38c06))
- **clerk-js:** Show password only if required ([cc687ea](https://github.com/clerk/javascript/commit/cc687eace1d55dec878d81240d2d629e61debb27))

### [3.0.1-alpha.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.0.1-staging.0...@clerk/clerk-js@3.0.1-alpha.1) (2022-03-20)

### Bug Fixes

- **clerk-js,clerk-react:** Move error to getToken ([d5f6b26](https://github.com/clerk/javascript/commit/d5f6b264cf58ce40c68de298b4c7c564d472001f))
- **clerk-js:** Fix signIn.prepareFirstFactor params ([e435245](https://github.com/clerk/javascript/commit/e4352454028099f0973203aa79e548890c6327bd))
- **clerk-js:** Make getToken use /user endpoint for integration tokens ([b61213b](https://github.com/clerk/javascript/commit/b61213b4c94952e6f21dd8e036aa6815c5c38c06))

### [3.0.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@3.0.1-staging.0...@clerk/clerk-js@3.0.1-alpha.0) (2022-03-19)

### Bug Fixes

- **clerk-js,clerk-react:** Move error to getToken ([84d21ce](https://github.com/clerk/javascript/commit/84d21ceac26843a1caa9d9d58f9c10ea2da6395e))
- **clerk-js:** Fix signIn.prepareFirstFactor params ([e435245](https://github.com/clerk/javascript/commit/e4352454028099f0973203aa79e548890c6327bd))
- **clerk-js:** Make getToken use /user endpoint for integration tokens ([b61213b](https://github.com/clerk/javascript/commit/b61213b4c94952e6f21dd8e036aa6815c5c38c06))

## [3.0.0-alpha.9](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.17.3...@clerk/clerk-js@3.0.0-alpha.9) (2022-03-11)

**Note:** Version bump only for package @clerk/clerk-js

## [3.0.0-alpha.8](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.14.3...@clerk/clerk-js@3.0.0-alpha.8) (2022-02-28)

### Features

- **types:** Add support for oauth_microsoft ([96c1cc6](https://github.com/clerk/javascript/commit/96c1cc6817b9bbc6917ea2773498299c1ff9b951))

## [3.0.0-alpha.7](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.14.3...@clerk/clerk-js@3.0.0-alpha.7) (2022-02-25)

**Note:** Version bump only for package @clerk/clerk-js

## [3.0.0-alpha.6](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.13.2...@clerk/clerk-js@3.0.0-alpha.6) (2022-02-18)

**Note:** Version bump only for package @clerk/clerk-js

### [2.17.6](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.17.6-staging.1...@clerk/clerk-js@2.17.6) (2022-03-17)

**Note:** Version bump only for package @clerk/clerk-js

### [2.17.6-staging.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.17.6-staging.0...@clerk/clerk-js@2.17.6-staging.1) (2022-03-17)

**Note:** Version bump only for package @clerk/clerk-js

### [2.17.4](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.17.3...@clerk/clerk-js@2.17.4) (2022-03-11)

**Note:** Version bump only for package @clerk/clerk-js

### [2.17.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.17.3-staging.0...@clerk/clerk-js@2.17.3) (2022-03-09)

**Note:** Version bump only for package @clerk/clerk-js

### [2.17.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.17.0...@clerk/clerk-js@2.17.1) (2022-03-04)

### Bug Fixes

- **clerk-react,clerk-js,types:** Crate of API feedback fixes ([721ce72](https://github.com/clerk/javascript/commit/721ce7228c37b012891b2bec8caf290239164d05))

## [2.17.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.16.1...@clerk/clerk-js@2.17.0) (2022-03-04)

### Features

- **clerk-js,clerk-react:** GetOrganization/s hook methods, fetching mechanism alignment ([fc11087](https://github.com/clerk/javascript/commit/fc110874f9a3e056cd43c773c267409dd9b318d6))
- **clerk-js:** Add more attributes on organization models ([af010ba](https://github.com/clerk/javascript/commit/af010bac4b6e0519eff42d210049c7b3a6bda203))
- **clerk-js:** Add organization basic resources ([09f9012](https://github.com/clerk/javascript/commit/09f90126282f757cee6f97e7eae8747abc641bb0))
- **clerk-js:** Add useOrganization hook ([480c422](https://github.com/clerk/javascript/commit/480c422774472fc712afdfe6ded2677b458d3ef0))
- **clerk-js:** Basic organization data shape tests ([0ca9a31](https://github.com/clerk/javascript/commit/0ca9a3114b34bfaa338e6e90f1b0d57e02b7dd58))
- **clerk-js:** Invitation flow draft ([d6faaab](https://github.com/clerk/javascript/commit/d6faaabb7efec09a699c7e83ba24fd4bad199d6b))
- **clerk-js:** Sign up next draft and fixes ([e2eef78](https://github.com/clerk/javascript/commit/e2eef782d644f7fd1925fee67ee81d27473255fc))
- **clerk-js:** SignUp with organization invitation flow draft ([2a9edbd](https://github.com/clerk/javascript/commit/2a9edbd52916f9bc037f266d1f96269cf54023cb))
- **clerk-react,clerk-js:** Add useOrganization hook using \_\_unstable attribute ([1635132](https://github.com/clerk/javascript/commit/16351321a99945d167cbf6e6ca0efdbbbf7efe5a))

### Bug Fixes

- **clerk-js:** Don't use ResizeObserver on old browsers ([581c5cd](https://github.com/clerk/javascript/commit/581c5cde9df542b7dcb6d69f61feaf480f7a0075))
- **types:** Guarantee elements not in oauth sorting array will be sorted last ([f3c2869](https://github.com/clerk/javascript/commit/f3c2869bc244fc594522ef8f889055f82d31463f))

### [2.16.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.16.0...@clerk/clerk-js@2.16.1) (2022-03-03)

### Bug Fixes

- **types:** Consolidate oauth provider types ([bce9ef5](https://github.com/clerk/javascript/commit/bce9ef5cbfe02e11fe71db3e34dbf4fd9be9c3ed))

## [2.16.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.15.0...@clerk/clerk-js@2.16.0) (2022-03-02)

### Features

- **types,clerk-js:** Introduce Notion OAuth ([#72](https://github.com/clerk/javascript/issues/72)) ([9e556d0](https://github.com/clerk/javascript/commit/9e556d00fb41dedbbd05de59947d00c720bb3d95))

### Bug Fixes

- **clerk-js:** Clear invalid invitation token value ([0c5dc85](https://github.com/clerk/javascript/commit/0c5dc85bd69b1050bf36e7108b38868e22022e61))

## [2.15.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.14.3...@clerk/clerk-js@2.15.0) (2022-03-01)

### Features

- **types:** Add support for oauth_microsoft ([96c1cc6](https://github.com/clerk/javascript/commit/96c1cc6817b9bbc6917ea2773498299c1ff9b951))

### [2.14.3](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.14.3-staging.0...@clerk/clerk-js@2.14.3) (2022-02-24)

**Note:** Version bump only for package @clerk/clerk-js

### [2.14.3-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.14.2-staging.0...@clerk/clerk-js@2.14.3-staging.0) (2022-02-24)

### Features

- **clerk-js:** Introduce `UserSettings.instanceIsPasswordBased` ([f72a555](https://github.com/clerk/javascript/commit/f72a555f6adb38870539e9bab63cb638c04517d6))

### Bug Fixes

- **clerk-js,clerk-react:** Revert user settings work ([9a70576](https://github.com/clerk/javascript/commit/9a70576d1a47f01e6dbbfd8704f321daddcfe590))
- **clerk-js:** Helpful error message for sign in without factors ([9d8a050](https://github.com/clerk/javascript/commit/9d8a050d975fddb3e3163781d010138a888b7bf2))
- **clerk-js:** Import Clerk CSS after shared css modules/ components ([dde2f3b](https://github.com/clerk/javascript/commit/dde2f3b87a0e177967ce13f087806ebff2084ff5))
- **clerk-js:** Render instant password field for password-based instances only ([586437f](https://github.com/clerk/javascript/commit/586437f238723da6f03119e2069989eaabe48ddd))
- **clerk-js:** Render instant password field for password-based instances only ([a9eefc9](https://github.com/clerk/javascript/commit/a9eefc967d4745a54aee0c917ce707b1a51df1be))

### [2.14.2-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.14.1-staging.0...@clerk/clerk-js@2.14.2-staging.0) (2022-02-22)

### Features

- **clerk-js:** Allow passing of object style search params on fapiclient ([8144779](https://github.com/clerk/javascript/commit/8144779e37ca4b0a61ac1d452ddd0ab7ccf40f27))

### [2.14.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.14.0-staging.0...@clerk/clerk-js@2.14.1-staging.0) (2022-02-17)

**Note:** Version bump only for package @clerk/clerk-js

## [2.14.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.13.3-staging.0...@clerk/clerk-js@2.14.0-staging.0) (2022-02-16)

### Features

- **clerk-js:** Import all resources from internal.ts ([#44](https://github.com/clerk/javascript/issues/44)) ([5b8f6f8](https://github.com/clerk/javascript/commit/5b8f6f81ed3d823840a0c4d3edcbd3c8298d7d42))

### [2.13.3-staging.0](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.13.2...@clerk/clerk-js@2.13.3-staging.0) (2022-02-15)

### Features

- **clerk-js:** Introduce with `userSettings` in `SignIn` ([adccb35](https://github.com/clerk/javascript/commit/adccb35377b6455285dc11cbfabe0710c9035c3f))
- **clerk-js:** Introduce with `userSettings` in `UserProfile` ([62dff26](https://github.com/clerk/javascript/commit/62dff26d56c7a699d0db074e863a89ddf2ee86a7))
- **clerk-js:** Refactor signUp utils to work with userSettings ([0eb3352](https://github.com/clerk/javascript/commit/0eb3352cf93c35eb5de162822802124248cef840))
- **types:** Introduce 'UserSettingsResource' ([32fcf04](https://github.com/clerk/javascript/commit/32fcf0477e6db4851f4de50904c02868ba1790ee))

### [2.13.2](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.13.1...@clerk/clerk-js@2.13.2) (2022-02-14)

### Bug Fixes

- **clerk-js:** Remove unnecessary type assertions ([f580d4a](https://github.com/clerk/javascript/commit/f580d4aebfc3938ca152e7cbc529a8c948e0c311))

### [2.13.1](https://github.com/clerk/javascript/compare/@clerk/clerk-js@2.13.1-staging.0...@clerk/clerk-js@2.13.1) (2022-02-14)

**Note:** Version bump only for package @clerk/clerk-js

### 2.13.1-staging.0 (2022-02-11)

### Bug Fixes

- **clerk-js:** Prevent post auth redirects in Metamask flow ([#31](https://github.com/clerk/javascript/issues/31)) ([052ff1e](https://github.com/clerk/javascript/commit/052ff1e74ad76fd97010e6d899e0eb2acb1d717c))
