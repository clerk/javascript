# Change Log

## 4.20.0

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

## 4.19.0

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

## 4.18.0

### Minor Changes

- Move SessionVerification methods from UserResource to SessionResource: ([#4073](https://github.com/clerk/javascript/pull/4073)) by [@panteliselef](https://github.com/panteliselef)

  - `user.__experimental_verifySession` -> `session.__experimental_startVerification`
  - `user.__experimental_verifySessionPrepareFirstFactor` -> `session.__experimental_prepareFirstFactorVerification`
  - `user.__experimental_verifySessionAttemptFirstFactor` -> `session.__experimental_attemptFirstFactorVerification`
  - `user.__experimental_verifySessionPrepareSecondFactor` -> `session.__experimental_prepareSecondFactorVerification`
  - `user.__experimental_verifySessionAttemptSecondFactor` -> `session.__experimental_attemptSecondFactorVerification`

- Add types for newly introduced `<__experimental_UserVerification />` component (experimental feature). New types: ([#4016](https://github.com/clerk/javascript/pull/4016)) by [@panteliselef](https://github.com/panteliselef)

  - `Appearance` has a new `userVerification` property
  - `__experimental_UserVerificationProps` and `__experimental_UserVerificationModalProps`
  - `__experimental_openUserVerification` method under the `Clerk` interface
  - `__experimental_closeUserVerification` method under the `Clerk` interface
  - `__experimental_mountUserVerification` method under the `Clerk` interface
  - `__experimental_unmountUserVerification` method under the `Clerk` interface
  - `__experimental_userVerification` property under `LocalizationResource`

## 4.17.0

### Minor Changes

- Add support for Coinbase Wallet strategy during sign in/up flows. Users can now authenticate using their Coinbase Wallet browser extension in the same way as MetaMask ([#4052](https://github.com/clerk/javascript/pull/4052)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Tidy up and improve README ([#4053](https://github.com/clerk/javascript/pull/4053)) by [@LekoArts](https://github.com/LekoArts)

- Update `SAML_IDPS` constant to refer to Microsoft Entra ID instead of the deprecated Azure AD ([#4041](https://github.com/clerk/javascript/pull/4041)) by [@LauraBeatris](https://github.com/LauraBeatris)

## 4.16.0

### Minor Changes

- Support connecting Coinbase Wallet via <UserProfile /> ([#4030](https://github.com/clerk/javascript/pull/4030)) by [@chanioxaris](https://github.com/chanioxaris)

## 4.15.1

### Patch Changes

- Introduce Coinbase Wallet Web3 provider types ([#4028](https://github.com/clerk/javascript/pull/4028)) by [@chanioxaris](https://github.com/chanioxaris)

- Introduce support for the Hugging Face OAuth Provider. ([#4021](https://github.com/clerk/javascript/pull/4021)) by [@Nikpolik](https://github.com/Nikpolik)

## 4.15.0

### Minor Changes

- Expose `SessionVerification` as an experimental resource. ([#4011](https://github.com/clerk/javascript/pull/4011)) by [@panteliselef](https://github.com/panteliselef)

  Update `UserResource` with 5 new experimental methods:

  - `experimental_verifySession` for creating a new SessionVerification record and initiating a new flow.
  - `experimental_verifySessionPrepareFirstFactor` for preparing a supported first factor like `phone_code`
  - `experimental_verifySessionAttemptFirstFactor` for attempting a supported first factor like `password`
  - `experimental_verifySessionPrepareSecondFactor` for preparing a supported second factor like `phone_code`
  - `experimental_verifySessionAttemptSecondFactor` for attempting a supported second factor like `totp`

## 4.14.0

### Minor Changes

- Inject `windowNavigate` through router functions. ([#3922](https://github.com/clerk/javascript/pull/3922)) by [@panteliselef](https://github.com/panteliselef)

## 4.13.1

### Patch Changes

- In certain situations the Frontend API response contains [`supported_first_factors`](https://clerk.com/docs/reference/frontend-api/tag/Sign-Ins#operation/createSignIn!c=200&path=response/supported_first_factors&t=response) with a `null` value while the current code always assumed to receive an array. `SignInResource['supportedFirstFactors']` has been updated to account for that and any code accessing this value has been made more resilient against `null` values. ([#3938](https://github.com/clerk/javascript/pull/3938)) by [@dstaley](https://github.com/dstaley)

## 4.13.0

### Minor Changes

- Introduce `transferable` prop for `<SignIn />` to disable the automatic transfer of a sign in attempt to a sign up attempt when attempting to sign in with a social provider when the account does not exist. Also adds a `transferable` option to `Clerk.handleRedirectCallback()` with the same functionality. ([#3845](https://github.com/clerk/javascript/pull/3845)) by [@BRKalow](https://github.com/BRKalow)

## 4.12.1

### Patch Changes

- Add option to hide the slug field in the `<CreateOrganization />`, `<OrganizationSwitcher />`, and `<OrganizationList />` components ([#3882](https://github.com/clerk/javascript/pull/3882)) by [@wobsoriano](https://github.com/wobsoriano)

## 4.12.0

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

## 4.11.0

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

## 4.10.0

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
      <UserButton.Link label="Terms" labelIcon={<Icon />} href="/terms" />
      <UserButton.Action label="Help" labelIcon={<Icon />} open="help" /> //
      Navigate to `/help` page when UserProfile opens as a modal. (Requires a
      custom page to have been set in `/help`)
      <UserButton.Action label="manageAccount" labelIcon={<Icon />} />
      <UserButton.Action
        label="Chat Modal"
        labelIcon={<Icon />}
        onClick={() => setModal(true)}
      />
    </UserButton.MenuItems>
  </UserButton>
  ```

### Patch Changes

- Introduce ability to set an active organization by slug ([#3825](https://github.com/clerk/javascript/pull/3825)) by [@wobsoriano](https://github.com/wobsoriano)

## 4.9.1

### Patch Changes

- Add support for opening the `UserProfileModal` and `OrganizationProfileModal` to specific navigation items through the `UserButton` and `OrganizationSwitcher`. ([#3732](https://github.com/clerk/javascript/pull/3732)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

## 4.9.0

### Minor Changes

- - Introduced `subtitle__disconnected` under `userProfile.start.connectedAccountsSection` ([#3723](https://github.com/clerk/javascript/pull/3723)) by [@panteliselef](https://github.com/panteliselef)

  - Deprecated `userProfile.start.connectedAccountsSection.actionLabel__reauthorize` and `userProfile.start.connectedAccountsSection.subtitle__reauthorize`

### Patch Changes

- Update types to account for null second factors ([#3780](https://github.com/clerk/javascript/pull/3780)) by [@dstaley](https://github.com/dstaley)

## 4.8.0

### Minor Changes

- Added support for Custom OAuth providers by [@nikosdouvlis](https://github.com/nikosdouvlis)

  - Updated strategy types to include `CustomOAuthStrategy`:
    - Added the `CustomOAuthStrategy` type with the value `oauth_custom_${string}`
    - Modified `OAuthStrategy` to include `CustomOAuthStrategy`:
      `export type OAuthStrategy = `oauth\_${OAuthProvider}` | CustomOAuthStrategy;`
  - Added the `CustomOauthProvider` type with value `custom_${string}` and extended `OAuthProvider` type to include `CustomOauthProvider`
  - Added support for displaying provider initials when `logo_url` is null for custom OAuth providers
  - Created new `ProviderInitialIcon` internal component in order to display custom oauth provider initials if provider `logo_url` is null

## 4.7.0

### Minor Changes

- Deprecate `afterSignOutUrl` and `afterMultiSessionSingleSignOutUrl` from UserButton. ([#3544](https://github.com/clerk/javascript/pull/3544)) by [@panteliselef](https://github.com/panteliselef)

  Developers can now configure these directly in `ClerkProvider` and have them work properly without in UserButton, UserProfile and in impersonation mode.

## 4.6.1

### Patch Changes

- Add `organizationAvatarUploaderContainer` descriptor which is used e.g. for the logo upload box inside "Create Organization" flow ([#3596](https://github.com/clerk/javascript/pull/3596)) by [@LekoArts](https://github.com/LekoArts)

## 4.6.0

### Minor Changes

- Add descriptor for formatted dates in tables. Those elements can be identified by the `cl-formattedDate__tableCell` css class. ([#3465](https://github.com/clerk/javascript/pull/3465)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Add support for Enstall OAuth provider ([#3466](https://github.com/clerk/javascript/pull/3466)) by [@Nikpolik](https://github.com/Nikpolik)

## 4.5.1

### Patch Changes

- Add experimental support for hCaptcha captcha provider ([#3422](https://github.com/clerk/javascript/pull/3422)) by [@anagstef](https://github.com/anagstef)

## 4.5.0

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
    callback: async (response) => {
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
    callback: async (response) => {
      const signInOrUp = await Clerk.authenticateWithGoogleOneTap({
        token: response.credential,
      });
      if (signInOrUp.status === "complete") {
        await Clerk.setActive({
          session: signInOrUp.createdSessionId,
        });
      }
    },
  });
  ```

## 4.4.0

### Minor Changes

- Replace mount with open for GoogleOneTap. New api is `__experimental_openGoogleOneTap`. ([#3379](https://github.com/clerk/javascript/pull/3379)) by [@panteliselef](https://github.com/panteliselef)

## 4.3.1

### Patch Changes

- Add a descriptor for Invitation previews in <OrganizationSwitcher/> ([#3376](https://github.com/clerk/javascript/pull/3376)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

## 4.3.0

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
    signInForceRedirectUrl=""
    signUpForceRedirectUrl=""
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

## 4.2.1

### Patch Changes

- The following are all internal changes and not relevant to any end-user: ([#3329](https://github.com/clerk/javascript/pull/3329)) by [@LauraBeatris](https://github.com/LauraBeatris)

  Create type interface for `TelemetryCollector` on `@clerk/types`. This allows to assign `telemetry` on the main Clerk SDK object, while inheriting from the actual `TelemetryCollector` implementation.

## 4.2.0

### Minor Changes

- Allow localization of text in social buttons when many are listed. ([#3282](https://github.com/clerk/javascript/pull/3282)) by [@panteliselef](https://github.com/panteliselef)

## 4.1.0

### Minor Changes

- Remove experimental Passkeys APIs. This includes any API that is marked as experimental or has the `__experimental_` prefix. ([#3233](https://github.com/clerk/javascript/pull/3233)) by [@panteliselef](https://github.com/panteliselef)

  This prepares the Passkeys release to move further along towards a beta release and eventual stable release.

## 4.0.0

### Major Changes

- c2a090513: Change the minimal Node.js version required by Clerk to `18.17.0`.
- 5f58a2274: - Remove `BuildUrlWithAuthParams` type
  - `AuthConfigResource` no longer has a `urlBasedSessionSyncing` property
  - `buildUrlWithAuth` no longer accepts an `options` argument of `BuildUrlWithAuthParams`.
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
- 7bffc47cb: Drop `Clerk.isReady(). Use `Clerk.loaded` instead.`
- 2a22aade8: Drop deprecations. Migration steps:
  - drop `orgs` jwt claim from session token
  - change type of `auth` param of `withServerAuth()` callback to `AuthObject` from `ServerSideAuth` in `gatsby-clerk-plugin`
    - use `auth.sessionClaims` instead of `auth.claims`
    - use `AuthObject` properties from `auth`
  - use `publishableKey` instead of `frontendApi`
  - use `ClerkProviderOptionsWrapper` type instead of `IsomorphicClerkOptions`
- 5f58a2274: Remove hashing and third-party cookie functionality related to development instance session syncing in favor of URL-based session syncing with query parameters.
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
- 9a1fe3728: Use the new `routerPush` and `routerReplace` props for `<ClerkProvider />` instead of `navigate`.
- 7886ba89d: Refresh the look and feel of the Clerk UI components

  For more info, refer to the [upgrade guide from v4 to v5 in Clerk docs](https://clerk.com/docs/upgrade-guides/upgrading-from-v4-to-v5).

- 9a1fe3728: Introduces two new props for `<ClerkProvider />`, `push` and `replace`. These props replace the `navigate` prop. Passing both `push` and `replace` will allow Clerk to correctly handle navigations without causing issues with the host application's router.
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
- 41ae1d2f0: Avatar Shimmer will be enabled by default for `<UserButton/>` and `<OrganizationSwitcher/>`.
- 844847e0b: Align return types for redirectTo\* methods in ClerkJS [SDK-1037]

  Breaking Changes:

  - `redirectToUserProfile` now returns `Promise<unknown>` instead of `void`
  - `redirectToOrganizationProfile` now returns `Promise<unknown>` instead of `void`
  - `redirectToCreateOrganization` now returns `Promise<unknown>` instead of `void`
  - `redirectToHome` now returns `Promise<unknown>` instead of `void`

### Minor Changes

- 0d0b1d89a: List passkeys under security in UserProfile.
  - Supports renaming a passkey.
  - Supports deleting a passkey.
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
- fc3ffd880: Support for prompting a user to reset their password if it is found to be compromised during sign-in.
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

- ff08fe237: Introduce experimental support for Google One Tap
  - React Component `<__experimental_GoogleOneTap/>`
  - JS `clerk.__experimental_mountGoogleOneTap(node,props)`
- 9737ef510: Accept `skipInvitationScreen` as a prop from OrganizationSwitcher.

  `skipInvitationScreen` hides the screen for sending invitations after an organization is created.
  By default, Clerk will automatically hide the screen if the number of max allowed members is equal to 1

- fafa76fb6: Experimental support for a user to register a passkey for their account.
  Usage: `await clerk.user.__experimental__createPasskey()`
- 1f650f30a: Experimental support for authenticating with a passkey.
  Example usage: `await signIn.authenticateWithPasskey()`.
- a9fe242be: Introduce new `ResultWithError` type in `@clerk/types`
- fe2607b6f: Remove MembershipRole. The type `MembershipRole` would always include the old role keys `admin`, `basic_member`, `guest_member`.
  If developers still depend on them after the introduction of custom roles, the can provide them as their custom types for authorization.

  ```ts
  // clerk.d.ts
  interface ClerkAuthorization {
    permission: "";
    role: "admin" | "basic_member" | "guest_member";
  }
  ```

- c7e6d00f5: Experimental support for `<Gate/>` with role checks.
- 663243220: Remove the unused appearance keys for accordion and breadcrumb elements.
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
- 7f751c4ef: Add support for X/Twitter v2 OAuth provider
- 18c0d015d: Pass environment into `sdkMetadata` in order to detect if production clerk-js is used by other sdks in dev mode. When it is log dev warning from clerk-js.
- d6a7ea61a: Update the TypeScript types of `<ClerkProvider />`. If you use the `routerPush` prop you're now required to also provide the `routerReplace` prop (or other way around). You can also not provide them at all since both props are optional.
- ebf9be77f: Allow users to authenticate with passkeys via the `<SignIn/>`.
- 008ac4217: Experimental support for reading, updating, and deleting a user's registered passkeys.
  - Get the user's passkeys
    `clerk.user.__experimental__passkeys`
  - Update the name of a passkey
    `clerk.user.__experimental__passkeys?.[0].update({name:'work laptop passkey'})`
  - Delete a passkey
    `clerk.user.__experimental__passkeys?.[0].delete()`

### Patch Changes

- 1db1f4068: Add `permissions` to `meta` field of fapi error.
- d37d44a68: Shows list of domains if member has the `org:sys_domain:read` permission.
- fe356eebd: Fix the appearance.baseTheme type to accept array of BaseTheme
- 7f6a64f43: - By default, all the components with routing will have the `routing` prop assigned as `'path'` by default when the `path` prop is filled.
  - The `<UserButton />` component will set the default value of the `userProfileMode` prop to `'navigation'` if the `userProfileUrl` prop is provided.
  - The `<OrganizationSwitcher />` component will have the `organizationProfileMode` and `createOrganizationMode` props assigned with `'navigation'` by default if the `organizationProfileUrl` and `createOrganizationUrl` props are filled accordingly.
- 2de442b24: Rename beta-v5 to beta
- 840636a14: Adds translation keys to be able to customize error messages when an identifier already exists:

  - form_identifier_exists\_\_email_address
  - form_identifier_exists\_\_username
  - form_identifier_exists\_\_phone_number

- bab2e7e05: Support but warn when `afterSignInUrl` and `afterSignUpUrl` are used
- 244de5ea3: Fix using `ClerkPaginationRequest` type without passing a generic.

  Before the fix the `ClerkPaginationRequest = any` and after the fix the `ClerkPaginationRequest = { limit, offset }`.

- d9f265fcb: Fallback to invisible CAPTCHA if the element to render to is not found in the DOM
- 69ce3e185: Adjust `ZxcvbnResult` interface to use current `feedback.warning` type as used in the upstream `@zxcvbn-ts/core` library.
- 78fc5eec0: Introduces new element appearance descriptors:

  - `activeDeviceListItem` allows you to customize the appearance of the active device list (accordion) item
    - `activeDeviceListItem__current` allows you to customize the appearance of the _current_ active device list (accordion) item
  - `activeDevice` allows you to customize the appearance of the active device item
    - `activeDevice__current` allows you to customize the appearance of the _current_ active device item

- 6a33709cc: Drop `org:sys_domains:delete` and `org:sys_memberships:delete` as those have now been merged with the respective `manage` ones.
- f77e8cdbd: Add Autocomplete TS generic for union literals
- 8b466a9ba: Prevent Clerk component flickering when mounted in a Next.js app using App Router
- c6a5e0f5d: Add maintenance mode banner to the SignIn and SignUp components. The text can be customized by updating the maintenanceMode localization key.
- 4edb77632: Localize placeholder of confirmation field when deleting a user account from `<UserProfile/>`.
- ab4eb56a5: Drop `redirectToHome` redirect method in favour of `redirectToAfterSignUp` or `redirectToAfterSignIn`.

  When the `<SignIn/>` and `<SignUp/>` components are rendered while a user is already logged in, they will now redirect to the configured `afterSignIn` and `afterSignUp` URLs, respectively. Previously, the redirect URL was set to the home URL configured in the dashboard.

- 5c239d973: Update social provider `docsUrl` entries to point to new URLs
- f00fd2dfe: Support legacy redirectUrl prop on SignIn and SignUp
- f540e9843: Return to localhost when SSO callback fails on SignIn or SignUp
- 48ca40af9: Simplify the WithOptions generic type
- 94519aa33: Renaming `passkeys_pa_not_supported` to `passkey_pa_not_supported` to align with the rest passkey error codes.
- 40ac4b645: Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry.
- 429d030f7: Introducing some changes and some addition for the appearence descriptors for the organization preview in `<OrganizationSwitcher/>`:
  - `.cl-organizationPreview__organizationSwitcher` has been renamed to `.cl-organizationPreview__organizationSwitcherTrigger`.
  - `.cl-organizationPreview__organizationSwitcherListedOrganization` was added to allow you to customize the appearance of all the listed organization previews.
  - `.cl-organizationPreview__organizationSwitcherActiveOrganizationn` was added to allow you to customize the appearance of the active organization.

## 4.0.0-beta.30

### Patch Changes

- Support legacy redirectUrl prop on SignIn and SignUp by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 4.0.0-beta.29

### Patch Changes

- Introduce forceRedirectUrl and fallbackRedirectUrl ([#3162](https://github.com/clerk/javascript/pull/3162)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 4.0.0-beta.28

### Minor Changes

- Introduce experimental support for Google One Tap ([#3176](https://github.com/clerk/javascript/pull/3176)) by [@panteliselef](https://github.com/panteliselef)

  - React Component `<__experimental_GoogleOneTap/>`
  - JS `clerk.__experimental_mountGoogleOneTap(node,props)`

### Patch Changes

- Fallback to invisible CAPTCHA if the element to render to is not found in the DOM ([#3191](https://github.com/clerk/javascript/pull/3191)) by [@anagstef](https://github.com/anagstef)

## 4.0.0-beta.27

### Patch Changes

- Renaming `passkeys_pa_not_supported` to `passkey_pa_not_supported` to align with the rest passkey error codes. ([#3173](https://github.com/clerk/javascript/pull/3173)) by [@panteliselef](https://github.com/panteliselef)

## 4.0.0-beta.26

### Minor Changes

- Add support for different CAPTCHA widget types ([#3154](https://github.com/clerk/javascript/pull/3154)) by [@anagstef](https://github.com/anagstef)

## 4.0.0-beta.25

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

## 4.0.0-beta.24

### Minor Changes

- Deprecate `supported_identifiers` and remove `supported_external_accounts`. ([#3089](https://github.com/clerk/javascript/pull/3089)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Add maintenance mode banner to the SignIn and SignUp components. The text can be customized by updating the maintenanceMode localization key. by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 4.0.0-beta.23

### Minor Changes

- Support for prompting a user to reset their password if it is found to be compromised during sign-in. ([#3034](https://github.com/clerk/javascript/pull/3034)) by [@yourtallness](https://github.com/yourtallness)

### Patch Changes

- Adds translation keys to be able to customize error messages when an identifier already exists: ([#3073](https://github.com/clerk/javascript/pull/3073)) by [@octoper](https://github.com/octoper)

  - form_identifier_exists\_\_email_address
  - form_identifier_exists\_\_username
  - form_identifier_exists\_\_phone_number

- Return to localhost when SSO callback fails on SignIn or SignUp ([#2955](https://github.com/clerk/javascript/pull/2955)) by [@anagstef](https://github.com/anagstef)

## 4.0.0-beta.22

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

## 4.0.0-beta.21

### Minor Changes

- List passkeys under security in UserProfile. ([#2958](https://github.com/clerk/javascript/pull/2958)) by [@panteliselef](https://github.com/panteliselef)

  - Supports renaming a passkey.
  - Supports deleting a passkey.

- Experimental support for authenticating with a passkey. ([#2970](https://github.com/clerk/javascript/pull/2970)) by [@panteliselef](https://github.com/panteliselef)

  Example usage: `await signIn.authenticateWithPasskey()`.

- Remove the unused appearance keys for accordion and breadcrumb elements. ([#2956](https://github.com/clerk/javascript/pull/2956)) by [@desiprisg](https://github.com/desiprisg)

- Allow users to authenticate with passkeys via the `<SignIn/>`. ([#3000](https://github.com/clerk/javascript/pull/3000)) by [@panteliselef](https://github.com/panteliselef)

## 4.0.0-beta.20

### Minor Changes

- Experimental support for reading, updating, and deleting a user's registered passkeys. ([#2926](https://github.com/clerk/javascript/pull/2926)) by [@panteliselef](https://github.com/panteliselef)

  - Get the user's passkeys
    `clerk.user.__experimental__passkeys`
  - Update the name of a passkey
    `clerk.user.__experimental__passkeys?.[0].update({name:'work laptop passkey'})`
  - Delete a passkey
    `clerk.user.__experimental__passkeys?.[0].delete()`

## 4.0.0-beta.19

### Minor Changes

- Experimental support for a user to register a passkey for their account. ([#2884](https://github.com/clerk/javascript/pull/2884)) by [@panteliselef](https://github.com/panteliselef)

  Usage: `await clerk.user.__experimental__createPasskey()`

## 4.0.0-beta.18

### Minor Changes

- Pass environment into `sdkMetadata` in order to detect if production clerk-js is used by other sdks in dev mode. When it is log dev warning from clerk-js. ([#2802](https://github.com/clerk/javascript/pull/2802)) by [@panteliselef](https://github.com/panteliselef)

## 4.0.0-beta.17

### Patch Changes

- Fix the appearance.baseTheme type to accept array of BaseTheme ([#2887](https://github.com/clerk/javascript/pull/2887)) by [@anagstef](https://github.com/anagstef)

## 4.0.0-beta.16

### Patch Changes

- Update social provider `docsUrl` entries to point to new URLs ([#2817](https://github.com/clerk/javascript/pull/2817)) by [@kylemac](https://github.com/kylemac)

## 4.0.0-beta.15

### Patch Changes

- Rename beta-v5 to beta by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 4.0.0-beta-v5.14

### Minor Changes

- Accept `skipInvitationScreen` as a prop from OrganizationSwitcher. ([#2713](https://github.com/clerk/javascript/pull/2713)) by [@panteliselef](https://github.com/panteliselef)

  `skipInvitationScreen` hides the screen for sending invitations after an organization is created.
  By default, Clerk will automatically hide the screen if the number of max allowed members is equal to 1

- Add support for X/Twitter v2 OAuth provider ([#2690](https://github.com/clerk/javascript/pull/2690)) by [@kostaspt](https://github.com/kostaspt)

### Patch Changes

- Fix using `ClerkPaginationRequest` type without passing a generic. ([#2714](https://github.com/clerk/javascript/pull/2714)) by [@dimkl](https://github.com/dimkl)

  Before the fix the `ClerkPaginationRequest = any` and after the fix the `ClerkPaginationRequest = { limit, offset }`.

- Prevent Clerk component flickering when mounted in a Next.js app using App Router ([#2765](https://github.com/clerk/javascript/pull/2765)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 4.0.0-beta-v5.13

### Major Changes

- Refresh the look and feel of the Clerk UI components ([#2622](https://github.com/clerk/javascript/pull/2622)) by [@anagstef](https://github.com/anagstef)

  For more info, refer to the [upgrade guide from v4 to v5 in Clerk docs](https://clerk.com/docs/upgrade-guides/upgrading-from-v4-to-v5).

## 4.0.0-alpha-v5.12

### Minor Changes

- Remove MemberRole Type`MemberRole` would always include the old role keys `admin`, `member`, `guest_member`. ([#2388](https://github.com/clerk/javascript/pull/2388)) by [@panteliselef](https://github.com/panteliselef)

  If developers still depend on them after the introduction of custom roles, the can provide them as their custom types for authorization.

  ```ts
  // clerk.d.ts
  export {};

  interface ClerkAuthorization {
    permission: "";
    role: "admin" | "basic_member" | "guest_member";
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

## 4.0.0-alpha-v5.11

### Major Changes

- - Remove `BuildUrlWithAuthParams` type ([#2367](https://github.com/clerk/javascript/pull/2367)) by [@tmilewski](https://github.com/tmilewski)

  - `AuthConfigResource` no longer has a `urlBasedSessionSyncing` property
  - `buildUrlWithAuth` no longer accepts an `options` argument of `BuildUrlWithAuthParams`.

- Remove hashing and third-party cookie functionality related to development instance session syncing in favor of URL-based session syncing with query parameters. ([#2367](https://github.com/clerk/javascript/pull/2367)) by [@tmilewski](https://github.com/tmilewski)

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

### Minor Changes

- Introduce new `ResultWithError` type in `@clerk/types` ([#2377](https://github.com/clerk/javascript/pull/2377)) by [@dimkl](https://github.com/dimkl)

## 4.0.0-alpha-v5.10

### Major Changes

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

- Adjust `ZxcvbnResult` interface to use current `feedback.warning` type as used in the upstream `@zxcvbn-ts/core` library. ([#2326](https://github.com/clerk/javascript/pull/2326)) by [@LekoArts](https://github.com/LekoArts)

- Drop `redirectToHome` redirect method in favour of `redirectToAfterSignUp` or `redirectToAfterSignIn`. ([#2251](https://github.com/clerk/javascript/pull/2251)) by [@octoper](https://github.com/octoper)

  When the `<SignIn/>` and `<SignUp/>` components are rendered while a user is already logged in, they will now redirect to the configured `afterSignIn` and `afterSignUp` URLs, respectively. Previously, the redirect URL was set to the home URL configured in the dashboard.

## 4.0.0-alpha-v5.9

### Major Changes

- Drop `Clerk.isReady(). Use `Clerk.loaded` instead.` ([#2294](https://github.com/clerk/javascript/pull/2294)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Add `permissions` to `meta` field of fapi error. ([#2282](https://github.com/clerk/javascript/pull/2282)) by [@panteliselef](https://github.com/panteliselef)

## 4.0.0-alpha-v5.8

### Patch Changes

- Drop `org:sys_domains:delete` and `org:sys_memberships:delete` as those have now been merged with the respective `manage` ones. ([#2256](https://github.com/clerk/javascript/pull/2256)) by [@panteliselef](https://github.com/panteliselef)

## 4.0.0-alpha-v5.7

### Minor Changes

- Update the TypeScript types of `<ClerkProvider />`. If you use the `routerPush` prop you're now required to also provide the `routerReplace` prop (or other way around). You can also not provide them at all since both props are optional. ([#2227](https://github.com/clerk/javascript/pull/2227)) by [@dimkl](https://github.com/dimkl)

## 4.0.0-alpha-v5.6

### Major Changes

- Use the new `routerPush` and `routerReplace` props for `<ClerkProvider />` instead of `navigate`. ([#1304](https://github.com/clerk/javascript/pull/1304)) by [@desiprisg](https://github.com/desiprisg)

- Introduces two new props for `<ClerkProvider />`, `push` and `replace`. These props replace the `navigate` prop. Passing both `push` and `replace` will allow Clerk to correctly handle navigations without causing issues with the host application's router. ([#1304](https://github.com/clerk/javascript/pull/1304)) by [@desiprisg](https://github.com/desiprisg)

### Minor Changes

- Add `routerDebug` option in `Clerk.load()` to log the destination URLs when navigating ([#2223](https://github.com/clerk/javascript/pull/2223)) by [@dimkl](https://github.com/dimkl)

## 4.0.0-alpha-v5.5

### Minor Changes

- Re-use common pagination types for consistency across types. ([#2210](https://github.com/clerk/javascript/pull/2210)) by [@dimkl](https://github.com/dimkl)

  Types introduced in `@clerk/types`:

  - `ClerkPaginationRequest` : describes pagination related props in request payload
  - `ClerkPaginatedResponse` : describes pagination related props in response body
  - `ClerkPaginationParams` : describes pagination related props in api client method params

## 4.0.0-alpha-v5.4

### Patch Changes

- - By default, all the components with routing will have the `routing` prop assigned as `'path'` by default when the `path` prop is filled. ([#1957](https://github.com/clerk/javascript/pull/1957)) by [@octoper](https://github.com/octoper)

  - The `<UserButton />` component will set the default value of the `userProfileMode` prop to `'navigation'` if the `userProfileUrl` prop is provided.
  - The `<OrganizationSwitcher />` component will have the `organizationProfileMode` and `createOrganizationMode` props assigned with `'navigation'` by default if the `organizationProfileUrl` and `createOrganizationUrl` props are filled accordingly.

## 4.0.0-alpha-v5.3

### Patch Changes

- Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry. ([#2154](https://github.com/clerk/javascript/pull/2154)) by [@BRKalow](https://github.com/BRKalow)

- Introducing some changes and some addition for the appearence descriptors for the organization preview in `<OrganizationSwitcher/>`: ([#2158](https://github.com/clerk/javascript/pull/2158)) by [@octoper](https://github.com/octoper)

  - `.cl-organizationPreview__organizationSwitcher` has been renamed to `.cl-organizationPreview__organizationSwitcherTrigger`.
  - `.cl-organizationPreview__organizationSwitcherListedOrganization` was added to allow you to customize the appearance of all the listed organization previews.
  - `.cl-organizationPreview__organizationSwitcherActiveOrganizationn` was added to allow you to customize the appearance of the active organization.

## 4.0.0-alpha-v5.2

### Major Changes

- Change the minimal Node.js version required by Clerk to `18.17.0`. ([#2162](https://github.com/clerk/javascript/pull/2162)) by [@dimkl](https://github.com/dimkl)

## 4.0.0-alpha-v5.1

### Major Changes

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

### Patch Changes

- Add Autocomplete TS generic for union literals ([#2132](https://github.com/clerk/javascript/pull/2132)) by [@tmilewski](https://github.com/tmilewski)

## 4.0.0-alpha-v5.0

### Major Changes

- Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

- Avatar Shimmer will be enabled by default for `<UserButton/>` and `<OrganizationSwitcher/>`. ([#1972](https://github.com/clerk/javascript/pull/1972)) by [@octoper](https://github.com/octoper)

### Minor Changes

- Add support for custom roles in `<OrganizationProfile/>`. ([#2004](https://github.com/clerk/javascript/pull/2004)) by [@panteliselef](https://github.com/panteliselef)

  The previous roles (`admin` and `basic_member`), are still kept as a fallback.

- Experimental support for `<Gate/>` with role checks. ([#1942](https://github.com/clerk/javascript/pull/1942)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Shows list of domains if member has the `org:sys_domain:read` permission. ([#1988](https://github.com/clerk/javascript/pull/1988)) by [@panteliselef](https://github.com/panteliselef)

- Introduces new element appearance descriptors: ([#1994](https://github.com/clerk/javascript/pull/1994)) by [@tmilewski](https://github.com/tmilewski)

  - `activeDeviceListItem` allows you to customize the appearance of the active device list (accordion) item
    - `activeDeviceListItem__current` allows you to customize the appearance of the _current_ active device list (accordion) item
  - `activeDevice` allows you to customize the appearance of the active device item
    - `activeDevice__current` allows you to customize the appearance of the _current_ active device item

- Localize placeholder of confirmation field when deleting a user account from `<UserProfile/>`. ([#2036](https://github.com/clerk/javascript/pull/2036)) by [@panteliselef](https://github.com/panteliselef)

- Simplify the WithOptions generic type ([#1995](https://github.com/clerk/javascript/pull/1995)) by [@tmilewski](https://github.com/tmilewski)

## 3.57.0

### Minor Changes

- Introduce customization in `UserProfile` and `OrganizationProfile` ([#1822](https://github.com/clerk/javascript/pull/1822)) by [@anagstef](https://github.com/anagstef)

  The `<UserProfile />` component now allows the addition of custom pages and external links to the navigation sidebar. Custom pages can be created using the `<UserProfile.Page>` component, and external links can be added using the `<UserProfile.Link>` component. The default routes, such as `Account` and `Security`, can be reordered.

  Example React API usage:

  ```tsx
  <UserProfile>
    <UserProfile.Page
      label="Custom Page"
      url="custom"
      labelIcon={<CustomIcon />}
    >
      <MyCustomPageContent />
    </UserProfile.Page>
    <UserProfile.Link label="External" url="/home" labelIcon={<Icon />} />
    <UserProfile.Page label="account" />
    <UserProfile.Page label="security" />
  </UserProfile>
  ```

  Custom pages and links should be provided as children using the `<UserButton.UserProfilePage>` and `<UserButton.UserProfileLink>` components when using the `UserButton` component.

  The `<OrganizationProfile />` component now supports the addition of custom pages and external links to the navigation sidebar. Custom pages can be created using the `<OrganizationProfile.Page>` component, and external links can be added using the `<OrganizationProfile.Link>` component. The default routes, such as `Members` and `Settings`, can be reordered.

  Example React API usage:

  ```tsx
  <OrganizationProfile>
    <OrganizationProfile.Page
      label="Custom Page"
      url="custom"
      labelIcon={<CustomIcon />}
    >
      <MyCustomPageContent />
    </OrganizationProfile.Page>
    <OrganizationProfile.Link
      label="External"
      url="/home"
      labelIcon={<Icon />}
    />
    <OrganizationProfile.Page label="members" />
    <OrganizationProfile.Page label="settings" />
  </OrganizationProfile>
  ```

  Custom pages and links should be provided as children using the `<OrganizationSwitcher.OrganizationProfilePage>` and `<OrganizationSwitcher.OrganizationProfileLink>` components when using the `OrganizationSwitcher` component.

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Drop `experimental_force_oauth_first` & `experimental__forceOauthFirst` from `DisplayConfig` ([#1918](https://github.com/clerk/javascript/pull/1918)) by [@dimkl](https://github.com/dimkl)

## 3.56.1

### Patch Changes

- Deprecate experimental captcha from Clerk singleton. ([#1905](https://github.com/clerk/javascript/pull/1905)) by [@panteliselef](https://github.com/panteliselef)

## 3.56.0

### Minor Changes

- Introduces three new element appearence descriptors: ([#1803](https://github.com/clerk/javascript/pull/1803)) by [@octoper](https://github.com/octoper)

  - `tableHead` let's you customize the tables head styles.
  - `paginationButton` let's you customize the pagination buttons.
  - `paginationRowText` let's you customize the pagination text.

### Patch Changes

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

- Fix methods in clerk-js that consumede paginated endpoints in order to retrieve single resources. ([#1871](https://github.com/clerk/javascript/pull/1871)) by [@panteliselef](https://github.com/panteliselef)

- In invite members screen of the <OrganizationProfile /> component, consume any invalid email addresses as they are returned in the API error and remove them from the input automatically. ([#1869](https://github.com/clerk/javascript/pull/1869)) by [@chanioxaris](https://github.com/chanioxaris)

## 3.55.0

### Minor Changes

- Add support for LinkedIn OIDC ([#1772](https://github.com/clerk/javascript/pull/1772)) by [@fragoulis](https://github.com/fragoulis)

### Patch Changes

- Introduces a new `isAuthorized()` method in the `Session` class. Returns a promise and checks whether the active user is allowed to perform an action based on the passed (required) permission and the ones attached to the membership. ([#1834](https://github.com/clerk/javascript/pull/1834)) by [@panteliselef](https://github.com/panteliselef)

- Introduce a new property on the core Clerk singleton, `sdkMetadata`. This will be populated by each host SDK. This metadata will be used to make logging and debugging easier. ([#1857](https://github.com/clerk/javascript/pull/1857)) by [@BRKalow](https://github.com/BRKalow)

- Introduce new `*EmailLink*` helpers that will replace the `*MagicLink*` helpers. ([#1833](https://github.com/clerk/javascript/pull/1833)) by [@dimkl](https://github.com/dimkl)

  Also marked all the `*MagicLink*` as deprecated using JSDocs.

## 3.54.0

### Minor Changes

- Introduce a new user resource method to leave an organization. You can now call 'user.leaveOrganization(<org_id>)' when a user chooses to leave an organization instead of 'organization.removeMember(<user_id>)' which is mostly meant for organization based actions. ([#1809](https://github.com/clerk/javascript/pull/1809)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- - Introduce organizationProfileProps as prop in `<OrganizationSwitcher/>`. ([#1801](https://github.com/clerk/javascript/pull/1801)) by [@panteliselef](https://github.com/panteliselef)

  - Introduce appearance in userProfileProps in `<UserButton/>`.
  - Deprecate the usage of `appearance.userProfile` in `<UserButton/>`.

- Introduce ClerkRuntimeError class for localizing error messages in ClerkJS components ([#1813](https://github.com/clerk/javascript/pull/1813)) by [@panteliselef](https://github.com/panteliselef)

- Enables you to translate the tooltip hint while creating an organization through the `formFieldHintText__slug` key ([#1811](https://github.com/clerk/javascript/pull/1811)) by [@LekoArts](https://github.com/LekoArts)

- Drop `password` property from `UserJSON` since it's not being returned by the Frontend API ([#1805](https://github.com/clerk/javascript/pull/1805)) by [@dimkl](https://github.com/dimkl)

- Remove experimenta jsdoc tags from multi-domain types. ([#1819](https://github.com/clerk/javascript/pull/1819)) by [@panteliselef](https://github.com/panteliselef)

- Warn about `publicUserData.profileImageUrl` nested property deprecation in `OrganizationMembership` & `OrganizationMembershipRequest` resources. ([#1812](https://github.com/clerk/javascript/pull/1812)) by [@dimkl](https://github.com/dimkl)

## 3.53.0

### Minor Changes

- `<SignIn/>`, `<SignUp/>`, `<RedirectToSignin/>`, `<RedirectToSignUp/>`, `clerk.redirectToSignIn()` and `clerk.redirectToSignUp()` now accept the `initialValues` option, which will prefill the appropriate form fields with the values provided. ([#1701](https://github.com/clerk/javascript/pull/1701)) by [@desiprisg](https://github.com/desiprisg)

## 3.52.1

### Patch Changes

- Introduces a new method for fetching organization invitations called `Organization.getInvitations`. ([#1766](https://github.com/clerk/javascript/pull/1766)) by [@panteliselef](https://github.com/panteliselef)

  Deprecate `Organization.getPendingInvitations`

- Adds the ability to force users to reset their password. ([#1757](https://github.com/clerk/javascript/pull/1757)) by [@kostaspt](https://github.com/kostaspt)

## 3.52.0

### Minor Changes

- Introduce the new brand-new component OrganizationList ([#1692](https://github.com/clerk/javascript/pull/1692)) by [@panteliselef](https://github.com/panteliselef)

  - Lists all the memberships, invitations or suggestions an active user may have
  - Powered by our `useOrganizationList` react hook

### Patch Changes

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- This PR replaces `The verification link expired. Please resend it.` message with the localization key `formFieldError__verificationLinkExpired`. The english message was also adjust to `The verification link expired. Please request a new link.` to make the second sentence clearer. ([#1738](https://github.com/clerk/javascript/pull/1738)) by [@LekoArts](https://github.com/LekoArts)

## 3.51.0

### Minor Changes

- Introduced a new `firstFactorUrl` property in sign-in callback to handle unverified emails. ([#1629](https://github.com/clerk/javascript/pull/1629)) by [@kostaspt](https://github.com/kostaspt)

### Patch Changes

- Organization Switcher now diplays organization invitations and suggestions in a more compact form. ([#1675](https://github.com/clerk/javascript/pull/1675)) by [@panteliselef](https://github.com/panteliselef)

## 3.50.0

### Minor Changes

- Introducing validatePassword for SignIn and SignUp resources ([#1445](https://github.com/clerk/javascript/pull/1445)) by [@panteliselef](https://github.com/panteliselef)

  - Validate a password based on the instance's configuration set in Password Policies in Dashboard

- Introduce a new resource called OrganizationSuggestion along with retrieve() & accept() methods ([#1574](https://github.com/clerk/javascript/pull/1574)) by [@chanioxaris](https://github.com/chanioxaris)

  Also make available the user's suggestions from the useOrganizationList hook

- Introduces userInvitations from `useOrganizationList` ([#1520](https://github.com/clerk/javascript/pull/1520)) by [@panteliselef](https://github.com/panteliselef)

  `userInvitations` is a paginated list of data. It can be used to create Paginated tables or Infinite lists.

- Introduce `hasImage` in User / Organization / Session resources ([#1544](https://github.com/clerk/javascript/pull/1544)) by [@dimkl](https://github.com/dimkl)

- Improve redirects on OAuth callback. Now, if you try to sign up with a provider that allows unverified accounts, it will ([#1563](https://github.com/clerk/javascript/pull/1563)) by [@kostaspt](https://github.com/kostaspt)

  navigate to the appropriate change when needed, fixing the broken flow.

- Introduce `logoLinkUrl` prop in `appearance.layout` ([#1449](https://github.com/clerk/javascript/pull/1449)) by [@nikospapcom](https://github.com/nikospapcom)

  A new `logoLinkUrl` prop has been added to `appearance.layout` and used in `ApplicationLogo` to change the `href` of the link.
  By default, the logo link url will be the Home URL you've set in the Clerk Dashboard.

### Patch Changes

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

- A OrganizationMembershipRequest can now be rejected ([#1612](https://github.com/clerk/javascript/pull/1612)) by [@panteliselef](https://github.com/panteliselef)

  - New `OrganizationMembershipRequest.reject` method alongside `accept`
  - As an organization admin, navigate to `Organization Profile` > `Members` > `Requests`. You can now reject a request from the table.

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

## 3.49.0

### Minor Changes

- Handle the construction of zxcvbn errors with information from FAPI ([#1526](https://github.com/clerk/javascript/pull/1526)) by [@raptisj](https://github.com/raptisj)

### Patch Changes

- Deprecate usage of old image fields in favor of `imageUrl` ([#1543](https://github.com/clerk/javascript/pull/1543)) by [@dimkl](https://github.com/dimkl)

- New localization keys for max length exceeded validation: ([#1521](https://github.com/clerk/javascript/pull/1521)) by [@nikospapcom](https://github.com/nikospapcom)

  - Organization name (form_param_max_length_exceeded\_\_name)
  - First name (form_param_max_length_exceeded\_\_first_name)
  - Last name (form_param_max_length_exceeded\_\_last_name)

- Introduces a new internal class `UserOrganizationInvitation` that represents and invitation to join an organization with the organization data populated ([#1527](https://github.com/clerk/javascript/pull/1527)) by [@panteliselef](https://github.com/panteliselef)

  Additions to support the above

  - UserOrganizationInvitationResource
  - UserOrganizationInvitationJSON
  - ClerkPaginatedResponse

  ClerkPaginatedResponse represents a paginated FAPI response

- Introduce Clerk.client.clearCache() method ([#1545](https://github.com/clerk/javascript/pull/1545)) by [@SokratisVidros](https://github.com/SokratisVidros)

## 3.48.1

### Patch Changes

- Introduce the `skipInvitationScreen` prop on `<CreateOrganization />` component ([#1501](https://github.com/clerk/javascript/pull/1501)) by [@panteliselef](https://github.com/panteliselef)

## 3.48.0

### Minor Changes

- Add unsafeMetadata prop to the SignUp component ([#1464](https://github.com/clerk/javascript/pull/1464)) by [@tmilewski](https://github.com/tmilewski)

## 3.47.0

### Minor Changes

- Add a confirmation input as an additional check when doing destructive actions such as: ([#1454](https://github.com/clerk/javascript/pull/1454)) by [@raptisj](https://github.com/raptisj)

  - delete an organization
  - delete a user account
  - leave an organization

  Νew localization keys were introduced to support the above

### Patch Changes

- Add missing property 'maxAllowedMemberships' in Organization resource ([#1468](https://github.com/clerk/javascript/pull/1468)) by [@chanioxaris](https://github.com/chanioxaris)

- Add `form_username_invalid_character` unstable error localization key. ([#1475](https://github.com/clerk/javascript/pull/1475)) by [@desiprisg](https://github.com/desiprisg)

- Add missing property 'privateMetadata' in OrganizationInvitation resource ([#1468](https://github.com/clerk/javascript/pull/1468)) by [@chanioxaris](https://github.com/chanioxaris)

- Enable the ability to target the avatar upload and remove action buttons ([#1455](https://github.com/clerk/javascript/pull/1455)) by [@tmilewski](https://github.com/tmilewski)

## 3.46.1

### Patch Changes

- Add missing `create` method to `PhoneNumberResource`, `EmailAddressResource`, `Web3WalletResource` interfaces ([#1411](https://github.com/clerk/javascript/pull/1411)) by [@crutchcorn](https://github.com/crutchcorn)

## 3.46.0

### Minor Changes

- Add ability for organization admins to delete an organization if they have permission to do so ([#1368](https://github.com/clerk/javascript/pull/1368)) by [@jescalan](https://github.com/jescalan)

## 3.45.0

### Minor Changes

- If user does not have permission to create an org, create org button will not display in the OrganizationSwitcher UI ([#1373](https://github.com/clerk/javascript/pull/1373)) by [@jescalan](https://github.com/jescalan)

### Patch Changes

- Fix to pull from the correct permissions set when displaying user delete self UI ([#1372](https://github.com/clerk/javascript/pull/1372)) by [@jescalan](https://github.com/jescalan)

## 3.44.0

### Minor Changes

- Add localization keys for when the phone number exists and the last identification is deleted ([#1383](https://github.com/clerk/javascript/pull/1383)) by [@raptisj](https://github.com/raptisj)

## 3.43.0

### Minor Changes

- Adds the ability for users to delete their own accounts, as long as they have permission to do so ([#1307](https://github.com/clerk/javascript/pull/1307)) by [@jescalan](https://github.com/jescalan)

### Patch Changes

- Password, first name & last name fields will be disabled if there are active SAML accounts. ([#1326](https://github.com/clerk/javascript/pull/1326)) by [@yourtallness](https://github.com/yourtallness)

## 3.42.0

### Minor Changes

- Add base64 string support in Organization.setLogo ([#1309](https://github.com/clerk/javascript/pull/1309)) by [@raptisj](https://github.com/raptisj)

## 3.41.1

### Patch Changes

- fix(types,localizations): Improve invalid form email_address param error message by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Make first name, last name & password readonly for users with active SAML accounts by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Add support for dataURLs in User.setProfileImage by [@nikosdouvlis](https://github.com/nikosdouvlis)

## [3.41.0](https://github.com/clerk/javascript/compare/@clerk/types@3.41.0-staging.1...@clerk/types@3.41.0) (2023-06-03)

**Note:** Version bump only for package @clerk/types

## [3.40.0](https://github.com/clerk/javascript/compare/@clerk/types@3.40.0-staging.0...@clerk/types@3.40.0) (2023-05-26)

**Note:** Version bump only for package @clerk/types

## [3.39.0](https://github.com/clerk/javascript/compare/@clerk/types@3.39.0-staging.1...@clerk/types@3.39.0) (2023-05-23)

**Note:** Version bump only for package @clerk/types

### [3.38.1](https://github.com/clerk/javascript/compare/@clerk/types@3.38.1-staging.0...@clerk/types@3.38.1) (2023-05-18)

**Note:** Version bump only for package @clerk/types

## [3.38.0](https://github.com/clerk/javascript/compare/@clerk/types@3.38.0-staging.1...@clerk/types@3.38.0) (2023-05-17)

**Note:** Version bump only for package @clerk/types

## [3.37.0](https://github.com/clerk/javascript/compare/@clerk/types@3.37.0-staging.3...@clerk/types@3.37.0) (2023-05-15)

**Note:** Version bump only for package @clerk/types

## [3.36.0](https://github.com/clerk/javascript/compare/@clerk/types@3.36.0-staging.4...@clerk/types@3.36.0) (2023-05-04)

**Note:** Version bump only for package @clerk/types

## [3.36.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/types@3.36.0-staging.3...@clerk/types@3.36.0-staging.4) (2023-05-04)

### Features

- **clerk-js,types:** Support sign in with SAML strategy ([6da395f](https://github.com/clerk/javascript/commit/6da395fd785467aa934896942408bdb5f64aa887))
- **clerk-js,types:** Support sign up with SAML strategy ([6d9c93e](https://github.com/clerk/javascript/commit/6d9c93e9d782f17bbddde1e68c2ce977415b45db))
- **clerk-js:** Use allowed special characters for password from environment ([dec0512](https://github.com/clerk/javascript/commit/dec05120c180e53595e87817a2f44ef62af0f4f1))

## [3.36.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/types@3.36.0-staging.2...@clerk/types@3.36.0-staging.3) (2023-05-02)

### Features

- **clerk-js:** Add resetPasswordFlow to SignIn resource ([6155f5b](https://github.com/clerk/javascript/commit/6155f5bde6fe0a140bffb7d8087c2246716abf7e))
- **clerk-js:** Create <ResetPasswordSuccess /> page ([3fbf8e7](https://github.com/clerk/javascript/commit/3fbf8e7157774412096ff432e622540ae2d96ef4))
- **clerk-js:** Introduce Reset Password flow ([e903c4f](https://github.com/clerk/javascript/commit/e903c4f430ae629625177637bb14f965a37596e1))
- **clerk-js:** Localize "Password don't match" field error ([c573599](https://github.com/clerk/javascript/commit/c573599a370d4f3925d0e8a87b37f28f157bb62b))
- **clerk-js:** Reset password for first factor ([280b5df](https://github.com/clerk/javascript/commit/280b5df2428b790e679a04004461aadb2717ae2b))
- **clerk-js:** Reset password MFA ([5978756](https://github.com/clerk/javascript/commit/5978756640bc5f5bb4726f72ca2e53ba43f009d6))

### Bug Fixes

- **clerk-js,types:** Remove after_sign_out_url as it not returned by FAPI ([#1121](https://github.com/clerk/javascript/issues/1121)) ([d87493d](https://github.com/clerk/javascript/commit/d87493d13e2c7a3ffbf37ba728e6cde7f6f14682))
- **clerk-js:** Reset Password missing localization keys ([b1df074](https://github.com/clerk/javascript/commit/b1df074ad203e07b55b0051c9f97d4fd26e0fde5))
- **clerk-js:** Update type of resetPasswordFlow in SignInResource ([637b791](https://github.com/clerk/javascript/commit/637b791b0086be35a67e7d8a6a0e7c42989296b5))

### [3.35.3](https://github.com/clerk/javascript/compare/@clerk/types@3.35.3-staging.0...@clerk/types@3.35.3) (2023-04-19)

**Note:** Version bump only for package @clerk/types

### [3.35.2](https://github.com/clerk/javascript/compare/@clerk/types@3.35.1...@clerk/types@3.35.2) (2023-04-19)

### Bug Fixes

- **clerk-js:** Add resetPassword method as a core resource ([fa70749](https://github.com/clerk/javascript/commit/fa70749c3bc0e37433b314ea9e12c5153bf60e0e))
- **clerk-js:** Refactor types for resetPassword ([fd53901](https://github.com/clerk/javascript/commit/fd53901c0fd4ce7c7c81a9239d4818002b83f58c))

### [3.35.1](https://github.com/clerk/javascript/compare/@clerk/types@3.35.1-staging.0...@clerk/types@3.35.1) (2023-04-12)

**Note:** Version bump only for package @clerk/types

## [3.35.0](https://github.com/clerk/javascript/compare/@clerk/types@3.35.0-staging.3...@clerk/types@3.35.0) (2023-04-11)

**Note:** Version bump only for package @clerk/types

## [3.34.0](https://github.com/clerk/javascript/compare/@clerk/types@3.34.0-staging.0...@clerk/types@3.34.0) (2023-04-06)

**Note:** Version bump only for package @clerk/types

## [3.33.0](https://github.com/clerk/javascript/compare/@clerk/types@3.33.0-staging.2...@clerk/types@3.33.0) (2023-03-31)

**Note:** Version bump only for package @clerk/types

## [3.32.0](https://github.com/clerk/javascript/compare/@clerk/types@3.32.0-staging.0...@clerk/types@3.32.0) (2023-03-29)

**Note:** Version bump only for package @clerk/types

### [3.30.1](https://github.com/clerk/javascript/compare/@clerk/types@3.30.1-staging.2...@clerk/types@3.30.1) (2023-03-10)

**Note:** Version bump only for package @clerk/types

## [3.30.0](https://github.com/clerk/javascript/compare/@clerk/types@3.30.0-staging.0...@clerk/types@3.30.0) (2023-03-09)

**Note:** Version bump only for package @clerk/types

## [3.29.0](https://github.com/clerk/javascript/compare/@clerk/types@3.29.0-staging.0...@clerk/types@3.29.0) (2023-03-07)

**Note:** Version bump only for package @clerk/types

### [3.28.5](https://github.com/clerk/javascript/compare/@clerk/types@3.28.5-staging.1...@clerk/types@3.28.5) (2023-03-03)

**Note:** Version bump only for package @clerk/types

### [3.28.4](https://github.com/clerk/javascript/compare/@clerk/types@3.28.4-staging.0...@clerk/types@3.28.4) (2023-03-01)

**Note:** Version bump only for package @clerk/types

### [3.28.3](https://github.com/clerk/javascript/compare/@clerk/types@3.28.3-staging.0...@clerk/types@3.28.3) (2023-02-25)

**Note:** Version bump only for package @clerk/types

### [3.28.2](https://github.com/clerk/javascript/compare/@clerk/types@3.28.2-staging.3...@clerk/types@3.28.2) (2023-02-24)

**Note:** Version bump only for package @clerk/types

### [3.28.2-staging.2](https://github.com/clerk/javascript/compare/@clerk/types@3.28.2-staging.1...@clerk/types@3.28.2-staging.2) (2023-02-22)

### Bug Fixes

- **clerk-js:** Pass unsafe metadata to sign up methods ([e2510e6](https://github.com/clerk/javascript/commit/e2510e65b726c113de977fb8252cdcd708ad9bb7))

### [3.28.1](https://github.com/clerk/javascript/compare/@clerk/types@3.28.1-staging.0...@clerk/types@3.28.1) (2023-02-17)

**Note:** Version bump only for package @clerk/types

## [3.28.0](https://github.com/clerk/javascript/compare/@clerk/types@3.28.0-staging.0...@clerk/types@3.28.0) (2023-02-15)

**Note:** Version bump only for package @clerk/types

## [3.27.0](https://github.com/clerk/javascript/compare/@clerk/types@3.27.0-staging.1...@clerk/types@3.27.0) (2023-02-10)

**Note:** Version bump only for package @clerk/types

### [3.26.1](https://github.com/clerk/javascript/compare/@clerk/types@3.26.1-staging.0...@clerk/types@3.26.1) (2023-02-07)

**Note:** Version bump only for package @clerk/types

### [3.26.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/types@3.26.0...@clerk/types@3.26.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/types

## [3.26.0](https://github.com/clerk/javascript/compare/@clerk/types@3.26.0-staging.1...@clerk/types@3.26.0) (2023-02-07)

**Note:** Version bump only for package @clerk/types

### [3.25.1](https://github.com/clerk/javascript/compare/@clerk/types@3.25.1-staging.0...@clerk/types@3.25.1) (2023-02-01)

**Note:** Version bump only for package @clerk/types

## [3.25.0](https://github.com/clerk/javascript/compare/@clerk/types@3.25.0-staging.1...@clerk/types@3.25.0) (2023-01-27)

**Note:** Version bump only for package @clerk/types

### [3.24.1](https://github.com/clerk/javascript/compare/@clerk/types@3.24.0...@clerk/types@3.24.1) (2023-01-20)

### Bug Fixes

- **nextjs,types:** Make frontendApi or publishableKey mutually exclusive but optional ([953c276](https://github.com/clerk/javascript/commit/953c27622ba24054172d6f4178bd5af50f73fa36))

## [3.24.0](https://github.com/clerk/javascript/compare/@clerk/types@3.24.0-staging.1...@clerk/types@3.24.0) (2023-01-17)

**Note:** Version bump only for package @clerk/types

## [3.23.0](https://github.com/clerk/javascript/compare/@clerk/types@3.23.0-staging.1...@clerk/types@3.23.0) (2022-12-19)

**Note:** Version bump only for package @clerk/types

### [3.22.2](https://github.com/clerk/javascript/compare/@clerk/types@3.22.2-staging.0...@clerk/types@3.22.2) (2022-12-13)

**Note:** Version bump only for package @clerk/types

### [3.22.1](https://github.com/clerk/javascript/compare/@clerk/types@3.22.0...@clerk/types@3.22.1) (2022-12-12)

**Note:** Version bump only for package @clerk/types

## [3.22.0](https://github.com/clerk/javascript/compare/@clerk/types@3.22.0-staging.1...@clerk/types@3.22.0) (2022-12-09)

**Note:** Version bump only for package @clerk/types

### [3.21.1](https://github.com/clerk/javascript/compare/@clerk/types@3.21.0...@clerk/types@3.21.1) (2022-12-08)

### Reverts

- Revert "feat(clerk-js,types): Terse paths parameters (#572)" (#603) ([d535eac](https://github.com/clerk/javascript/commit/d535eace3d7733ce3b848bb05f1b0c02e5faf15d)), closes [#572](https://github.com/clerk/javascript/issues/572) [#603](https://github.com/clerk/javascript/issues/603)

## [3.21.0](https://github.com/clerk/javascript/compare/@clerk/types@3.21.0-staging.0...@clerk/types@3.21.0) (2022-12-08)

**Note:** Version bump only for package @clerk/types

## [3.20.0](https://github.com/clerk/javascript/compare/@clerk/types@3.20.0-staging.0...@clerk/types@3.20.0) (2022-12-02)

**Note:** Version bump only for package @clerk/types

## [3.19.0](https://github.com/clerk/javascript/compare/@clerk/types@3.19.0-staging.4...@clerk/types@3.19.0) (2022-11-30)

**Note:** Version bump only for package @clerk/types

## [3.19.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/types@3.19.0-staging.3...@clerk/types@3.19.0-staging.4) (2022-11-29)

**Note:** Version bump only for package @clerk/types

## [3.18.0](https://github.com/clerk/javascript/compare/@clerk/types@3.18.0-staging.0...@clerk/types@3.18.0) (2022-11-25)

**Note:** Version bump only for package @clerk/types

### [3.17.2](https://github.com/clerk/javascript/compare/@clerk/types@3.17.2-staging.0...@clerk/types@3.17.2) (2022-11-25)

**Note:** Version bump only for package @clerk/types

### [3.17.1](https://github.com/clerk/javascript/compare/@clerk/types@3.17.0...@clerk/types@3.17.1) (2022-11-23)

**Note:** Version bump only for package @clerk/types

## [3.17.0](https://github.com/clerk/javascript/compare/@clerk/types@3.17.0-staging.2...@clerk/types@3.17.0) (2022-11-22)

**Note:** Version bump only for package @clerk/types

## [3.17.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/types@3.17.0-staging.1...@clerk/types@3.17.0-staging.2) (2022-11-21)

### Features

- **types:** Introduce Xero & Box OAuth provider types ([d7da1f2](https://github.com/clerk/javascript/commit/d7da1f2cbefef2841781202ac2853402c0b8eb2b))

### [3.16.1](https://github.com/clerk/javascript/compare/@clerk/types@3.16.1-staging.1...@clerk/types@3.16.1) (2022-11-18)

**Note:** Version bump only for package @clerk/types

## [3.16.0](https://github.com/clerk/javascript/compare/@clerk/types@3.16.0-staging.0...@clerk/types@3.16.0) (2022-11-15)

**Note:** Version bump only for package @clerk/types

### [3.15.1](https://github.com/clerk/javascript/compare/@clerk/types@3.15.1-staging.1...@clerk/types@3.15.1) (2022-11-10)

**Note:** Version bump only for package @clerk/types

## [3.15.0](https://github.com/clerk/javascript/compare/@clerk/types@3.15.0-staging.1...@clerk/types@3.15.0) (2022-11-05)

### Features

- **types,clerk-js:** Introduce OrganizationSettings resource ([455911f](https://github.com/clerk/javascript/commit/455911f4166e4bea00aa62b32a05bef297983c61))

## [3.14.0](https://github.com/clerk/javascript/compare/@clerk/types@3.14.0-staging.7...@clerk/types@3.14.0) (2022-11-03)

**Note:** Version bump only for package @clerk/types

## [3.14.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/types@3.14.0-staging.3...@clerk/types@3.14.0-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/types

## [3.14.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/types@3.14.0-staging.1...@clerk/types@3.14.0-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/types

## [3.14.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/types@3.14.0-staging.1...@clerk/types@3.14.0-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/types

## [3.14.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/types@3.13.0...@clerk/types@3.14.0-staging.1) (2022-11-02)

### Features

- **clerk-js,types:** Organization invitation metadata ([87764b8](https://github.com/clerk/javascript/commit/87764b839cc65455347e1c19b15f4a17603201b8))
- **clerk-js:** Add `loaded` to core Clerk instance ([7c08a91](https://github.com/clerk/javascript/commit/7c08a914d674f05608503898542b907886465b7e))

## [3.13.0](https://github.com/clerk/javascript/compare/@clerk/types@3.13.0-staging.0...@clerk/types@3.13.0) (2022-10-24)

**Note:** Version bump only for package @clerk/types

## [3.12.0](https://github.com/clerk/javascript/compare/@clerk/types@3.11.0...@clerk/types@3.12.0) (2022-10-14)

### Features

- **types,clerk-js:** List only authenticatable OAuth providers in Sign in/up components ([4b3f1e6](https://github.com/clerk/javascript/commit/4b3f1e67d655dfb3e818ce9015b68b369d7a1bd4))

## [3.11.0](https://github.com/clerk/javascript/compare/@clerk/types@3.11.0-staging.2...@clerk/types@3.11.0) (2022-10-14)

**Note:** Version bump only for package @clerk/types

## [3.11.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/types@3.10.1...@clerk/types@3.11.0-staging.1) (2022-10-13)

### Features

- **clerk-js,clerk-react,types:** Wire up `OrganizationSwitcher` and `OrganizationProfile` ([1e34e69](https://github.com/clerk/javascript/commit/1e34e6986ee49aeb9ca9f72cdc5d799d6611b53f))
- **clerk-js:** Add table and pagination elements ([cb56f5c](https://github.com/clerk/javascript/commit/cb56f5c0313ba6f1fce50eae6fc3e3d596cf1b16))

### Bug Fixes

- **clerk-js:** Add appearance customization support for avatar gradient ([96cde45](https://github.com/clerk/javascript/commit/96cde45b4f1db5ff074289b57ff58c40bf80f6e1))
- **clerk-js:** Add global not_allowed_access error to localization prop ([0313fe5](https://github.com/clerk/javascript/commit/0313fe5ce4e0afca20865ad1b6d0503502ea6e4d))
- **types:** Remove unused hideNavigation prop from UserProfile ([21cafcb](https://github.com/clerk/javascript/commit/21cafcb488d66f90a3b0a13a2079d9b0473ecf7e))

### [3.10.1](https://github.com/clerk/javascript/compare/@clerk/types@3.10.1-staging.0...@clerk/types@3.10.1) (2022-10-07)

**Note:** Version bump only for package @clerk/types

## [3.10.0](https://github.com/clerk/javascript/compare/@clerk/types@3.10.0-staging.0...@clerk/types@3.10.0) (2022-10-05)

**Note:** Version bump only for package @clerk/types

## [3.9.0](https://github.com/clerk/javascript/compare/@clerk/types@3.9.0-staging.2...@clerk/types@3.9.0) (2022-10-03)

### Features

- **clerk-js:** Add open prop in user button ([6ae7f42](https://github.com/clerk/javascript/commit/6ae7f4226f4db5760e04ee812a494beb66ab2502))

### Bug Fixes

- **clerk-js:** Refactor defaultOpen prop ([1d7b0a9](https://github.com/clerk/javascript/commit/1d7b0a997a86686644d28ac58d0bd7143af9023f))
- **clerk-js:** Refactor isOpen prop ([044860f](https://github.com/clerk/javascript/commit/044860f7204988876b258141108d0e1741204bc1))

## [3.8.0](https://github.com/clerk/javascript/compare/@clerk/types@3.8.0-staging.4...@clerk/types@3.8.0) (2022-09-29)

**Note:** Version bump only for package @clerk/types

### [3.7.1](https://github.com/clerk/javascript/compare/@clerk/types@3.7.0...@clerk/types@3.7.1) (2022-09-25)

**Note:** Version bump only for package @clerk/types

## [3.7.0](https://github.com/clerk/javascript/compare/@clerk/types@3.7.0-staging.1...@clerk/types@3.7.0) (2022-09-24)

**Note:** Version bump only for package @clerk/types

## [3.6.0](https://github.com/clerk/javascript/compare/@clerk/types@3.6.0-staging.0...@clerk/types@3.6.0) (2022-09-22)

**Note:** Version bump only for package @clerk/types

### [3.5.1](https://github.com/clerk/javascript/compare/@clerk/types@3.5.0-staging.4...@clerk/types@3.5.1) (2022-09-19)

### Bug Fixes

- **types:** Completely remove totp2Fa.resendButton key ([434fae5](https://github.com/clerk/javascript/commit/434fae5803122c825ce6da8ca2dccad13889605b))

## [3.5.0](https://github.com/clerk/javascript/compare/@clerk/types@3.5.0-staging.4...@clerk/types@3.5.0) (2022-09-16)

### Bug Fixes

- **types:** Completely remove totp2Fa.resendButton key ([434fae5](https://github.com/clerk/javascript/commit/434fae5803122c825ce6da8ca2dccad13889605b))

### [3.4.2](https://github.com/clerk/javascript/compare/@clerk/types@3.4.2-staging.0...@clerk/types@3.4.2) (2022-09-07)

**Note:** Version bump only for package @clerk/types

### [3.4.1](https://github.com/clerk/javascript/compare/@clerk/types@3.4.1-staging.0...@clerk/types@3.4.1) (2022-08-29)

**Note:** Version bump only for package @clerk/types

## [3.4.0](https://github.com/clerk/javascript/compare/@clerk/types@3.4.0-staging.0...@clerk/types@3.4.0) (2022-08-29)

**Note:** Version bump only for package @clerk/types

### [3.3.1](https://github.com/clerk/javascript/compare/@clerk/types@3.3.1-staging.0...@clerk/types@3.3.1) (2022-08-24)

**Note:** Version bump only for package @clerk/types

## [3.3.0](https://github.com/clerk/javascript/compare/@clerk/types@3.2.0...@clerk/types@3.3.0) (2022-08-18)

### Features

- **types:** Introduce Instagram OAuth ([2991b01](https://github.com/clerk/javascript/commit/2991b011bf8002ed9a9c88fbe4cb911665201245))

## [3.2.0](https://github.com/clerk/javascript/compare/@clerk/types@3.2.0-staging.0...@clerk/types@3.2.0) (2022-08-18)

**Note:** Version bump only for package @clerk/types

### [3.1.1](https://github.com/clerk/javascript/compare/@clerk/types@3.1.0...@clerk/types@3.1.1) (2022-08-16)

### Bug Fixes

- **types:** Deprecate orgs session token claim, add org_slug for active organization ([4175040](https://github.com/clerk/javascript/commit/4175040ca2257265cc0b8c12389056933765040b))

## [3.1.0](https://github.com/clerk/javascript/compare/@clerk/types@3.1.0-staging.0...@clerk/types@3.1.0) (2022-08-09)

### Bug Fixes

- **clerk-js:** Introduce more selectors ([bf4c3b3](https://github.com/clerk/javascript/commit/bf4c3b372c7e74b1b42ce53cb7254e54b67c7815))

### [3.0.1](https://github.com/clerk/javascript/compare/@clerk/types@3.0.0...@clerk/types@3.0.1) (2022-08-07)

**Note:** Version bump only for package @clerk/types

## [3.0.0](https://github.com/clerk/javascript/compare/@clerk/types@3.0.0-staging.1...@clerk/types@3.0.0) (2022-08-05)

**Note:** Version bump only for package @clerk/types

## [2.21.0](https://github.com/clerk/javascript/compare/@clerk/types@2.20.0...@clerk/types@2.21.0) (2022-08-04)

### Features

- **clerk-js:** Get support email from FAPI /v1/environment if exists ([c9bb8d7](https://github.com/clerk/javascript/commit/c9bb8d7aaf3958207d4799bdd30e3b15b2890a5d))

## [2.20.0](https://github.com/clerk/javascript/compare/@clerk/types@2.19.1...@clerk/types@2.20.0) (2022-07-13)

### Features

- **types,clerk-react,nextjs:** Add loadOrg option for Next.js withServerSideAuth middleware ([0889bde](https://github.com/clerk/javascript/commit/0889bde9bc7f9e1a5d4c1e706c49212e1f7b36f4))

### Bug Fixes

- **types:** Typo rename Line to LINE ([79b3dd5](https://github.com/clerk/javascript/commit/79b3dd581e9750ac943d9a7a1091a37a48647538))

### [2.19.1](https://github.com/clerk/javascript/compare/@clerk/types@2.19.0...@clerk/types@2.19.1) (2022-07-07)

### Bug Fixes

- **types:** Proper documentation url for OAuth providers ([4398cb2](https://github.com/clerk/javascript/commit/4398cb2ce0914ecd4850b1e3ccbbe64d3d25b031))

## [2.19.0](https://github.com/clerk/javascript/compare/@clerk/types@2.18.0...@clerk/types@2.19.0) (2022-07-06)

### Features

- **types:** Introduce Line OAuth ([e9d429d](https://github.com/clerk/javascript/commit/e9d429d63fcfacd3d393fa9e104e8a1b46f41a67))

## [2.18.0](https://github.com/clerk/javascript/compare/@clerk/types@2.17.0...@clerk/types@2.18.0) (2022-07-01)

### Features

- **types,clerk-js:** Introduce user hasVerifiedEmailAddress & hasVerifiedPhoneNumber attributes ([ea68447](https://github.com/clerk/javascript/commit/ea684473697c33b7b5d8930fe24b7667f6edeaad))

## [2.17.0](https://github.com/clerk/javascript/compare/@clerk/types@2.16.0...@clerk/types@2.17.0) (2022-06-24)

### Features

- **clerk-js:** Add supportEmail property option ([71eff74](https://github.com/clerk/javascript/commit/71eff74383bcd1c3044cfd42ceae70de5b246e68))
- **types,backend-core:** Add org_role, org_id claims ([03da4cf](https://github.com/clerk/javascript/commit/03da4cffee2e5c493d0219d417842a13e066ffe6))
- **types,backend-core:** Consolidate Clerk issued JWT claims under ClerkJWTClaims ([e6bc9fb](https://github.com/clerk/javascript/commit/e6bc9fb380d38d7f89cc2059e0211b0ad55bd1a5))

### Bug Fixes

- **edge,nextjs,remix,clerk-sdk-node,types:** Correct SSR claims typing ([09c147c](https://github.com/clerk/javascript/commit/09c147c196c08e64794423f9eae791bfe453b858))

## [2.16.0](https://github.com/clerk/javascript/compare/@clerk/types@2.16.0-staging.0...@clerk/types@2.16.0) (2022-06-16)

**Note:** Version bump only for package @clerk/types

## [2.15.0](https://github.com/clerk/javascript/compare/@clerk/types@2.15.0-staging.3...@clerk/types@2.15.0) (2022-06-06)

**Note:** Version bump only for package @clerk/types

## [2.15.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/types@2.15.0-staging.2...@clerk/types@2.15.0-staging.3) (2022-06-03)

### Bug Fixes

- **clerk-js,types:** Typo for MetaMask web3 provider name ([922dcb5](https://github.com/clerk/javascript/commit/922dcb52f406a17da8038cafaf10353b15aab2bf))

## [2.15.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/types@2.15.0-staging.1...@clerk/types@2.15.0-staging.2) (2022-06-02)

### Features

- **types,clerk-js:** Support required/optional email/phone for Progressive sign up instances ([13da457](https://github.com/clerk/javascript/commit/13da4576a08e4e396fa48605ecf61accc06057d5))

## [2.15.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/types@2.15.0-staging.0...@clerk/types@2.15.0-staging.1) (2022-06-01)

### Features

- **types,clerk-js:** Introduce web3 wallet operations in UserProfile ([6570a87](https://github.com/clerk/javascript/commit/6570a87439d92a59057b2df50ec482511428495e))

### Bug Fixes

- **clerk-js:** Emit changes in organization to listeners ([798ee62](https://github.com/clerk/javascript/commit/798ee622e7961d3aa7f8842184f5fadbcfed517f))
- **types,clerk-js:** Same component navigate after OAuth flow with missing requirements ([39ca6ce](https://github.com/clerk/javascript/commit/39ca6cee3a8a160fdf0ca95a713707afee55f1fc))

## [2.14.0](https://github.com/clerk/javascript/compare/@clerk/types@2.14.0-staging.1...@clerk/types@2.14.0) (2022-05-20)

**Note:** Version bump only for package @clerk/types

## [2.14.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/types@2.13.0...@clerk/types@2.14.0-staging.1) (2022-05-18)

### Features

- **types,clerk-js:** Enhance Web3 wallet resource with relevant operations ([a166716](https://github.com/clerk/javascript/commit/a166716db44db8e765e67c154093c9d3c3f24c75))
- **types:** Include new organization role `guest_member` ([ba7f27b](https://github.com/clerk/javascript/commit/ba7f27b42be283f9b7b4126cecc8d93ab9a6f04e))

### Bug Fixes

- **clerk-js:** Navigate to sign up continue in web3 ([460ba1c](https://github.com/clerk/javascript/commit/460ba1cc82bbad6197224ca71ad39302564408b4))

## [2.14.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/types@2.13.0...@clerk/types@2.14.0-staging.0) (2022-05-17)

### Features

- **types:** Include new organization role `guest_member` ([ba7f27b](https://github.com/clerk/javascript/commit/ba7f27b42be283f9b7b4126cecc8d93ab9a6f04e))

### Bug Fixes

- **clerk-js:** Navigate to sign up continue in web3 ([460ba1c](https://github.com/clerk/javascript/commit/460ba1cc82bbad6197224ca71ad39302564408b4))

## [2.13.0](https://github.com/clerk/javascript/compare/@clerk/types@2.10.1...@clerk/types@2.13.0) (2022-05-13)

### Features

- **clerk-js:** Add shortcut to active org in Clerk singleton ([03e68d4](https://github.com/clerk/javascript/commit/03e68d4667e7abcd006c4a3a2a2fe7f65bfca417))
- **types:** Introduce Web3 provider types and helpers ([8291d75](https://github.com/clerk/javascript/commit/8291d75a7f3172d05f76c0f9aeb08aab98e7d81c))

## [2.12.0](https://github.com/clerk/javascript/compare/@clerk/types@2.10.1...@clerk/types@2.12.0) (2022-05-12)

### Features

- **types:** Introduce Web3 provider types and helpers ([8291d75](https://github.com/clerk/javascript/commit/8291d75a7f3172d05f76c0f9aeb08aab98e7d81c))

## [2.11.0](https://github.com/clerk/javascript/compare/@clerk/types@2.10.1...@clerk/types@2.11.0) (2022-05-12)

### Features

- **types:** Introduce Web3 provider types and helpers ([8291d75](https://github.com/clerk/javascript/commit/8291d75a7f3172d05f76c0f9aeb08aab98e7d81c))

### [2.10.1](https://github.com/clerk/javascript/compare/@clerk/types@2.10.1-staging.0...@clerk/types@2.10.1) (2022-05-11)

**Note:** Version bump only for package @clerk/types

## [2.10.0](https://github.com/clerk/javascript/compare/@clerk/types@2.9.0...@clerk/types@2.10.0) (2022-05-06)

### Features

- **nextjs,clerk-sdk-node,remix:** Add claims attribute to req.auth ([c695529](https://github.com/clerk/javascript/commit/c695529089f55baef72b86e3b73b8cd9f4f58e6d))

## [2.9.0](https://github.com/clerk/javascript/compare/@clerk/types@2.9.0-staging.0...@clerk/types@2.9.0) (2022-05-05)

**Note:** Version bump only for package @clerk/types

## [2.8.0](https://github.com/clerk/javascript/compare/@clerk/types@2.7.1...@clerk/types@2.8.0) (2022-04-28)

### Features

- **clerk-js:** Add members to organizations ([d6787b6](https://github.com/clerk/javascript/commit/d6787b659744ea2ca178d6cf7df488be265d7a69))
- **clerk-js:** Delete organizations ([7cb1bea](https://github.com/clerk/javascript/commit/7cb1beaf12b293b9fde541855eb2cda81e0d6be4))

### [2.7.1](https://github.com/clerk/javascript/compare/@clerk/types@2.7.1-staging.1...@clerk/types@2.7.1) (2022-04-19)

**Note:** Version bump only for package @clerk/types

### [2.7.1-staging.1](https://github.com/clerk/javascript/compare/@clerk/types@2.7.1-staging.0...@clerk/types@2.7.1-staging.1) (2022-04-19)

### Bug Fixes

- **clerk-js:** Pass rotating_token_nonce correctly to FAPIClient ([370cb0e](https://github.com/clerk/javascript/commit/370cb0e26bccd524c44b9e7fc0e15521193f514f))

## [2.7.0](https://github.com/clerk/javascript/compare/@clerk/types@2.6.1-alpha.0...@clerk/types@2.7.0) (2022-04-18)

### Features

- **clerk-js:** Organization slugs ([7f0e771](https://github.com/clerk/javascript/commit/7f0e771036815885b01da095979cf39da212503f))

### [2.6.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/types@2.6.0...@clerk/types@2.6.1-alpha.0) (2022-04-15)

**Note:** Version bump only for package @clerk/types

## [2.6.0](https://github.com/clerk/javascript/compare/@clerk/types@2.6.0-staging.0...@clerk/types@2.6.0) (2022-04-15)

**Note:** Version bump only for package @clerk/types

## [2.5.0](https://github.com/clerk/javascript/compare/@clerk/types@2.5.0-staging.0...@clerk/types@2.5.0) (2022-04-13)

**Note:** Version bump only for package @clerk/types

## [2.4.0](https://github.com/clerk/javascript/compare/@clerk/types@2.3.0...@clerk/types@2.4.0) (2022-04-07)

### Features

- **types:** Introduce global UserPublicMetadata and UserUnsafeMetadata interfaces ([b1220ae](https://github.com/clerk/javascript/commit/b1220ae83afac53edac5f09ce2c332f188952ed4))

## [2.3.0](https://github.com/clerk/javascript/compare/@clerk/types@2.3.0-staging.0...@clerk/types@2.3.0) (2022-04-04)

**Note:** Version bump only for package @clerk/types

### [2.2.1](https://github.com/clerk/javascript/compare/@clerk/types@2.2.1-staging.0...@clerk/types@2.2.1) (2022-03-28)

**Note:** Version bump only for package @clerk/types

## [2.2.0](https://github.com/clerk/javascript/compare/@clerk/types@2.2.0-alpha.0...@clerk/types@2.2.0) (2022-03-24)

**Note:** Version bump only for package @clerk/types

## [2.2.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/types@2.1.2-staging.0...@clerk/types@2.2.0-staging.0) (2022-03-24)

### Features

- **types,clerk-js,backend-core,clerk-react:** Replace thrown error with null return in getToken ([d972f93](https://github.com/clerk/javascript/commit/d972f93684a39abf3619c335cc012b61d5187100))

### [2.1.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/types@2.1.1-staging.0...@clerk/types@2.1.1-alpha.0) (2022-03-23)

**Note:** Version bump only for package @clerk/types

## [2.1.0-alpha.1](https://github.com/clerk/javascript/compare/@clerk/types@2.1.0-alpha.0...@clerk/types@2.1.0-alpha.1) (2022-03-23)

### Features

- **types,clerk-js:** Allow connecting external accounts from the user profile page ([180961b](https://github.com/clerk/javascript/commit/180961b61d5f6b75b5bc373f5d644cd0576831a8))

## [2.1.0-alpha.0](https://github.com/clerk/javascript/compare/@clerk/types@2.0.1-alpha.3...@clerk/types@2.1.0-alpha.0) (2022-03-23)

### Features

- **clerk-js,types:** Rename UserButton params to afterSignOutUrl, afterMultiSessionSingleSignOutUrl ([c4cb76a](https://github.com/clerk/javascript/commit/c4cb76a1133fd2308b217cacaffb086b175f6347))

### [2.0.1-alpha.3](https://github.com/clerk/javascript/compare/@clerk/types@2.0.1-alpha.2...@clerk/types@2.0.1-alpha.3) (2022-03-22)

### Bug Fixes

- **clerk-js:** Add createdUserId attribute to SignUp ([#132](https://github.com/clerk/javascript/issues/132)) ([b1884bd](https://github.com/clerk/javascript/commit/b1884bd950d9fcb27505269a09038dd571072a4e))

### [2.0.1-alpha.2](https://github.com/clerk/javascript/compare/@clerk/types@2.0.1-staging.0...@clerk/types@2.0.1-alpha.2) (2022-03-22)

### Bug Fixes

- **clerk-js:** Fix signIn.prepareFirstFactor params ([e435245](https://github.com/clerk/javascript/commit/e4352454028099f0973203aa79e548890c6327bd))
- **clerk-js:** Make getToken use /user endpoint for integration tokens ([b61213b](https://github.com/clerk/javascript/commit/b61213b4c94952e6f21dd8e036aa6815c5c38c06))

### [2.0.1-alpha.1](https://github.com/clerk/javascript/compare/@clerk/types@2.0.1-staging.0...@clerk/types@2.0.1-alpha.1) (2022-03-20)

### Bug Fixes

- **clerk-js:** Fix signIn.prepareFirstFactor params ([e435245](https://github.com/clerk/javascript/commit/e4352454028099f0973203aa79e548890c6327bd))
- **clerk-js:** Make getToken use /user endpoint for integration tokens ([b61213b](https://github.com/clerk/javascript/commit/b61213b4c94952e6f21dd8e036aa6815c5c38c06))

### [2.0.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/types@2.0.1-staging.0...@clerk/types@2.0.1-alpha.0) (2022-03-19)

### Bug Fixes

- **clerk-js:** Fix signIn.prepareFirstFactor params ([e435245](https://github.com/clerk/javascript/commit/e4352454028099f0973203aa79e548890c6327bd))
- **clerk-js:** Make getToken use /user endpoint for integration tokens ([b61213b](https://github.com/clerk/javascript/commit/b61213b4c94952e6f21dd8e036aa6815c5c38c06))

## [2.0.0-alpha.9](https://github.com/clerk/javascript/compare/@clerk/types@1.28.3...@clerk/types@2.0.0-alpha.9) (2022-03-11)

### Features

- **nextjs:** Move shared NextJS SSR types to types package ([78d8c7c](https://github.com/clerk/javascript/commit/78d8c7c3e84f3926127e48c655793a0fca3cdc2c))
- **types:** Support for oauth_apple ([57b675c](https://github.com/clerk/javascript/commit/57b675c762187d1f16cde6d2577bac71f7993438))

## [2.0.0-alpha.8](https://github.com/clerk/javascript/compare/@clerk/types@1.25.4...@clerk/types@2.0.0-alpha.8) (2022-02-28)

### Features

- **nextjs:** Move shared NextJS SSR types to types package ([78d8c7c](https://github.com/clerk/javascript/commit/78d8c7c3e84f3926127e48c655793a0fca3cdc2c))
- **types:** Add support for oauth_microsoft ([96c1cc6](https://github.com/clerk/javascript/commit/96c1cc6817b9bbc6917ea2773498299c1ff9b951))

## [2.0.0-alpha.7](https://github.com/clerk/javascript/compare/@clerk/types@1.25.4...@clerk/types@2.0.0-alpha.7) (2022-02-25)

### Features

- **nextjs:** Move shared NextJS SSR types to types package ([8b898a1](https://github.com/clerk/javascript/commit/8b898a1aa503889921180850292fbfa3c8133ef5))

## [2.0.0-alpha.6](https://github.com/clerk/javascript/compare/@clerk/types@1.25.1-staging.0...@clerk/types@2.0.0-alpha.6) (2022-02-18)

### Features

- **nextjs:** Move shared NextJS SSR types to types package ([757dc2e](https://github.com/clerk/javascript/commit/757dc2ef1acf32f31bdad8bcab076bb710723781))

### [1.29.2](https://github.com/clerk/javascript/compare/@clerk/types@1.29.2-staging.1...@clerk/types@1.29.2) (2022-03-17)

**Note:** Version bump only for package @clerk/types

### [1.29.2-staging.1](https://github.com/clerk/javascript/compare/@clerk/types@1.29.2-staging.0...@clerk/types@1.29.2-staging.1) (2022-03-17)

**Note:** Version bump only for package @clerk/types

## [1.29.0](https://github.com/clerk/javascript/compare/@clerk/types@1.28.3...@clerk/types@1.29.0) (2022-03-11)

### Features

- **types:** Support for oauth_apple ([57b675c](https://github.com/clerk/javascript/commit/57b675c762187d1f16cde6d2577bac71f7993438))

### [1.28.3](https://github.com/clerk/javascript/compare/@clerk/types@1.28.3-staging.0...@clerk/types@1.28.3) (2022-03-09)

**Note:** Version bump only for package @clerk/types

### [1.28.1](https://github.com/clerk/javascript/compare/@clerk/types@1.28.0...@clerk/types@1.28.1) (2022-03-04)

### Bug Fixes

- **clerk-react,clerk-js,types:** Crate of API feedback fixes ([721ce72](https://github.com/clerk/javascript/commit/721ce7228c37b012891b2bec8caf290239164d05))
- **types:** Add OrganizationMembership methods on types ([8bac04c](https://github.com/clerk/javascript/commit/8bac04c90ab79c6fb2e319f5c566f421e5984fa7))
- **types:** Change type import from dot ([a1cdb79](https://github.com/clerk/javascript/commit/a1cdb79f9abde74b92911394b50e7d75107a9cfd))

## [1.28.0](https://github.com/clerk/javascript/compare/@clerk/types@1.27.1...@clerk/types@1.28.0) (2022-03-04)

### Features

- **clerk-js,clerk-react:** GetOrganization/s hook methods, fetching mechanism alignment ([fc11087](https://github.com/clerk/javascript/commit/fc110874f9a3e056cd43c773c267409dd9b318d6))
- **clerk-js:** Add more attributes on organization models ([af010ba](https://github.com/clerk/javascript/commit/af010bac4b6e0519eff42d210049c7b3a6bda203))
- **clerk-js:** Add organization basic resources ([09f9012](https://github.com/clerk/javascript/commit/09f90126282f757cee6f97e7eae8747abc641bb0))
- **clerk-js:** Basic organization data shape tests ([0ca9a31](https://github.com/clerk/javascript/commit/0ca9a3114b34bfaa338e6e90f1b0d57e02b7dd58))
- **clerk-js:** Invitation flow draft ([d6faaab](https://github.com/clerk/javascript/commit/d6faaabb7efec09a699c7e83ba24fd4bad199d6b))
- **clerk-js:** Sign up next draft and fixes ([e2eef78](https://github.com/clerk/javascript/commit/e2eef782d644f7fd1925fee67ee81d27473255fc))
- **clerk-js:** SignUp with organization invitation flow draft ([2a9edbd](https://github.com/clerk/javascript/commit/2a9edbd52916f9bc037f266d1f96269cf54023cb))
- **clerk-react,clerk-js:** Add useOrganization hook using \_\_unstable attribute ([1635132](https://github.com/clerk/javascript/commit/16351321a99945d167cbf6e6ca0efdbbbf7efe5a))

### Bug Fixes

- **types:** Guarantee elements not in oauth sorting array will be sorted last ([f3c2869](https://github.com/clerk/javascript/commit/f3c2869bc244fc594522ef8f889055f82d31463f))

### [1.27.1](https://github.com/clerk/javascript/compare/@clerk/types@1.27.0...@clerk/types@1.27.1) (2022-03-03)

### Bug Fixes

- **types:** Consolidate oauth provider types ([bce9ef5](https://github.com/clerk/javascript/commit/bce9ef5cbfe02e11fe71db3e34dbf4fd9be9c3ed))

## [1.27.0](https://github.com/clerk/javascript/compare/@clerk/types@1.26.0...@clerk/types@1.27.0) (2022-03-02)

### Features

- **types,clerk-js:** Introduce Notion OAuth ([#72](https://github.com/clerk/javascript/issues/72)) ([9e556d0](https://github.com/clerk/javascript/commit/9e556d00fb41dedbbd05de59947d00c720bb3d95))

## [1.26.0](https://github.com/clerk/javascript/compare/@clerk/types@1.25.4...@clerk/types@1.26.0) (2022-03-01)

### Features

- **types:** Add support for oauth_microsoft ([96c1cc6](https://github.com/clerk/javascript/commit/96c1cc6817b9bbc6917ea2773498299c1ff9b951))

### [1.25.4](https://github.com/clerk/javascript/compare/@clerk/types@1.25.4-staging.0...@clerk/types@1.25.4) (2022-02-24)

**Note:** Version bump only for package @clerk/types

### [1.25.4-staging.0](https://github.com/clerk/javascript/compare/@clerk/types@1.25.3-staging.0...@clerk/types@1.25.4-staging.0) (2022-02-24)

### Features

- **clerk-js:** Introduce `UserSettings.instanceIsPasswordBased` ([f72a555](https://github.com/clerk/javascript/commit/f72a555f6adb38870539e9bab63cb638c04517d6))

### Bug Fixes

- **clerk-js,clerk-react:** Revert user settings work ([9a70576](https://github.com/clerk/javascript/commit/9a70576d1a47f01e6dbbfd8704f321daddcfe590))

### [1.25.3-staging.0](https://github.com/clerk/javascript/compare/@clerk/types@1.25.2-staging.0...@clerk/types@1.25.3-staging.0) (2022-02-17)

**Note:** Version bump only for package @clerk/types

### [1.25.2-staging.0](https://github.com/clerk/javascript/compare/@clerk/types@1.25.1...@clerk/types@1.25.2-staging.0) (2022-02-15)

### Features

- **clerk-js:** Refactor signUp utils to work with userSettings ([0eb3352](https://github.com/clerk/javascript/commit/0eb3352cf93c35eb5de162822802124248cef840))
- **types:** Introduce 'UserSettingsResource' ([32fcf04](https://github.com/clerk/javascript/commit/32fcf0477e6db4851f4de50904c02868ba1790ee))

### [1.25.1](https://github.com/clerk/javascript/compare/@clerk/types@1.25.1-staging.0...@clerk/types@1.25.1) (2022-02-14)

**Note:** Version bump only for package @clerk/types

### 1.25.1-staging.0 (2022-02-11)

**Note:** Version bump only for package @clerk/types
