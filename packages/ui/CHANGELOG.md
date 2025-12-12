# @clerk/ui

## 1.0.0

### Major Changes

- Align experimental/unstable prefixes to use consistent naming: ([#7361](https://github.com/clerk/javascript/pull/7361)) by [@brkalow](https://github.com/brkalow)
  - Renamed all `__unstable_*` methods to `__internal_*` (for internal APIs)
  - Renamed all `experimental__*` and `experimental_*` methods to `__experimental_*` (for beta features)
  - Removed deprecated billing-related props and `experimental__forceOauthFirst`
  - Moved `createTheme` and `simple` to `@clerk/ui/themes/experimental` export path (removed `__experimental_` prefix since they're now in the experimental export)

  **Breaking Changes:**

  ### @clerk/clerk-js
  - `__unstable__environment` → `__internal_environment`
  - `__unstable__updateProps` → `__internal_updateProps`
  - `__unstable__setEnvironment` → `__internal_setEnvironment`
  - `__unstable__onBeforeRequest` → `__internal_onBeforeRequest`
  - `__unstable__onAfterResponse` → `__internal_onAfterResponse`
  - `__unstable__onBeforeSetActive` → `__internal_onBeforeSetActive` (window global)
  - `__unstable__onAfterSetActive` → `__internal_onAfterSetActive` (window global)

  ### @clerk/nextjs
  - `__unstable_invokeMiddlewareOnAuthStateChange` → `__internal_invokeMiddlewareOnAuthStateChange`

  ### @clerk/ui
  - `experimental_createTheme` / `__experimental_createTheme` → `createTheme` (now exported from `@clerk/ui/themes/experimental`)
  - `experimental__simple` / `__experimental_simple` → `simple` (now exported from `@clerk/ui/themes/experimental`)

  ### @clerk/chrome-extension
  - `__unstable__createClerkClient` → `createClerkClient` (exported from `@clerk/chrome-extension/background`)

  ### Removed (multiple packages)
  - `__unstable_manageBillingUrl` (removed)
  - `__unstable_manageBillingLabel` (removed)
  - `__unstable_manageBillingMembersLimit` (removed)
  - `experimental__forceOauthFirst` (removed)

- Updates both `colorRing` and `colorModalBackdrop` to render at full opacity when modified via the appearance prop or CSS variables. Previously we'd render the provided color at 15% opacity, which made it difficult to dial in a specific ring or backdrop color. ([#7333](https://github.com/clerk/javascript/pull/7333)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Remove deprecated `samlAccount` in favor of `enterpriseAccount` ([#7258](https://github.com/clerk/javascript/pull/7258)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Hide "Create organization" action when user reaches organization membership limit ([#7327](https://github.com/clerk/javascript/pull/7327)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Remove deprecated `hideSlug` in favor of `organizationSettings.slug.disabled` setting ([#7283](https://github.com/clerk/javascript/pull/7283)) by [@LauraBeatris](https://github.com/LauraBeatris)

  Slugs can now be enabled directly from the Organization Settings page in the Clerk Dashboard

- Removes `simple` theme export from UI package in favor of using the `simple` theme via the appearance prop: ([#7381](https://github.com/clerk/javascript/pull/7381)) by [@alexcarpenter](https://github.com/alexcarpenter)

  ```tsx
  <ClerkProvider appearance={{ theme: 'simple' }} />
  ```

- Remove all previously deprecated UI props across the Next.js, React and clerk-js SDKs. The legacy `afterSign(In|Up)Url`/`redirectUrl` props, `UserButton` sign-out overrides, organization `hideSlug` flags, `OrganizationSwitcher`'s `afterSwitchOrganizationUrl`, `Client.activeSessions`, `setActive({ beforeEmit })`, and the `ClerkMiddlewareAuthObject` type alias are no longer exported. Components now rely solely on the new redirect options and server-side configuration. ([#7243](https://github.com/clerk/javascript/pull/7243)) by [@jacekradko](https://github.com/jacekradko)

- Renamed `appearance.layout` to `appearance.options` across all appearance configurations. This is a breaking change - update all instances of `appearance.layout` to `appearance.options` in your codebase. ([#7366](https://github.com/clerk/javascript/pull/7366)) by [@brkalow](https://github.com/brkalow)

- Remove deprecated `saml` strategy in favor of `enterprise_sso` ([#7326](https://github.com/clerk/javascript/pull/7326)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Minor Changes

- Adds `SignInClientTrust` component for discretely handling flows where client trust is required. ([#7430](https://github.com/clerk/javascript/pull/7430)) by [@tmilewski](https://github.com/tmilewski)

- Changed the default value of `appearance.layout.showOptionalFields` from `true` to `false`. Optional fields are now hidden by default during sign up. Users can still explicitly set `showOptionalFields: true` to show optional fields. ([#7365](https://github.com/clerk/javascript/pull/7365)) by [@brkalow](https://github.com/brkalow)

### Patch Changes

- Fix issue where the reset password form could be submitted via the enter key even when the confirmation password didn't match. ([#7432](https://github.com/clerk/javascript/pull/7432)) by [@dstaley](https://github.com/dstaley)

- Fix UI package serving in CI/CD integration tests ([#7129](https://github.com/clerk/javascript/pull/7129)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`e35960f`](https://github.com/clerk/javascript/commit/e35960f5e44ab758d0ab0545691f44dbafd5e7cb), [`a3e689f`](https://github.com/clerk/javascript/commit/a3e689f3b7f2f3799a263da4b7bb14c0e49e42b7), [`965e7f1`](https://github.com/clerk/javascript/commit/965e7f1b635cf25ebfe129ec338e05137d1aba9e), [`ac34168`](https://github.com/clerk/javascript/commit/ac3416849954780bd873ed3fe20a173a8aee89aa), [`cf0d0dc`](https://github.com/clerk/javascript/commit/cf0d0dc7f6380d6e0c4e552090345b7943c22b35), [`cc3b220`](https://github.com/clerk/javascript/commit/cc3b2201213055dc010f4525a467e8b4e49b792b), [`a1aaff3`](https://github.com/clerk/javascript/commit/a1aaff33700ed81f31a9f340cf6cb3a82efeef85), [`8b95393`](https://github.com/clerk/javascript/commit/8b953930536b12bd8ade6ba5c2092f40770ea8df), [`3dac245`](https://github.com/clerk/javascript/commit/3dac245456dae1522ee2546fc9cc29454f1f345f), [`65a236a`](https://github.com/clerk/javascript/commit/65a236aed8b2c4e2f3da266431586c7cfc2aad72), [`26254f0`](https://github.com/clerk/javascript/commit/26254f0463312115eca4bc0a396c5acd0703187b)]:
  - @clerk/shared@4.0.0
  - @clerk/localizations@4.0.0
