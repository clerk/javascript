# Change Log

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

- Removes the patch for disabling swr-devtools causing apps with swr and broswers with the devtools extention to break. ([#1794](https://github.com/clerk/javascript/pull/1794)) by [@panteliselef](https://github.com/panteliselef)

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
