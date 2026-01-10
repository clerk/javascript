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

- Add legacy browser variant build support for older browsers ([#7472](https://github.com/clerk/javascript/pull/7472)) by [@jacekradko](https://github.com/jacekradko)

- Add support for Sign in with Solana. ([#7450](https://github.com/clerk/javascript/pull/7450)) by [@kduprey](https://github.com/kduprey)

- Disable role selection in `OrganizationProfile` during role set migration ([#7534](https://github.com/clerk/javascript/pull/7534)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Display message in `TaskChooseOrganization` when user is not allowed to create organizations ([#7486](https://github.com/clerk/javascript/pull/7486)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Fix issue where the reset password form could be submitted via the enter key even when the confirmation password didn't match. ([#7432](https://github.com/clerk/javascript/pull/7432)) by [@dstaley](https://github.com/dstaley)

- Fix React peer dependency version ranges to use `~` instead of `^` for React 19 versions, ensuring non-overlapping version constraints. ([#7512](https://github.com/clerk/javascript/pull/7512)) by [@jacekradko](https://github.com/jacekradko)

- Fix redirect conflicts when SignIn and SignUp components are used together on the same page. Added missing dependency arrays to useEffect hooks in redirect functions to prevent unwanted redirects during other component flows. ([#7529](https://github.com/clerk/javascript/pull/7529)) by [@Ayush2k02](https://github.com/Ayush2k02)

- Fix UI package serving in CI/CD integration tests ([#7129](https://github.com/clerk/javascript/pull/7129)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Remove opacity from `Select` placeholder ([#7574](https://github.com/clerk/javascript/pull/7574)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Remove `virtual` from the `routing` option. The `virtual` value is only used internally and should not be part of the public API. ([#7466](https://github.com/clerk/javascript/pull/7466)) by [@jacekradko](https://github.com/jacekradko)

- ([#7496](https://github.com/clerk/javascript/pull/7496)) by [@brkalow](https://github.com/brkalow)

- Fix role select being disabled on `OrganizationProfile` invite members page when default role is not in roles list ([#7567](https://github.com/clerk/javascript/pull/7567)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Allow creating additional memberships on unlimited `environment.organizationSettings.maxAllowedMemberships` ([#7555](https://github.com/clerk/javascript/pull/7555)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Update shadcn theme ring and modalBackdrop variables to match the opacity defined in shadcn components. ([#7495](https://github.com/clerk/javascript/pull/7495)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Fix "You must belong to an organization" screen showing when user has existing memberships, invitations or suggestions ([#7553](https://github.com/clerk/javascript/pull/7553)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Introduce radio group for `EnableOrganizationsPrompt` ([#7444](https://github.com/clerk/javascript/pull/7444)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Add `subtitle__createOrganizationDisabled` localization key shown in the choose organization task when users cannot create organizations ([#7561](https://github.com/clerk/javascript/pull/7561)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Fix: await navigation after password sign-in completes to ensure redirects finish before continuing. ([#7443](https://github.com/clerk/javascript/pull/7443)) by [@octoper](https://github.com/octoper)

- Fix personal account display in `OrganizationSwitcher` and `OrganizationList` to exclude `primaryWeb3Wallet` from user identifiers ([#7531](https://github.com/clerk/javascript/pull/7531)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`db6b18e`](https://github.com/clerk/javascript/commit/db6b18e03860e3ef371ba86e72331dbef2dd4af0), [`e35960f`](https://github.com/clerk/javascript/commit/e35960f5e44ab758d0ab0545691f44dbafd5e7cb), [`c9f0d77`](https://github.com/clerk/javascript/commit/c9f0d777f59673bfe614e1a8502cefe5445ce06f), [`af85739`](https://github.com/clerk/javascript/commit/af85739195f5f4b353ba4395a547bbc8a8b26483), [`e9be68d`](https://github.com/clerk/javascript/commit/e9be68db7eddec9c537f1def49326f3de1058bf2), [`0f1011a`](https://github.com/clerk/javascript/commit/0f1011a062c3705fc1a69593672b96ad03936de1), [`a3e689f`](https://github.com/clerk/javascript/commit/a3e689f3b7f2f3799a263da4b7bb14c0e49e42b7), [`965e7f1`](https://github.com/clerk/javascript/commit/965e7f1b635cf25ebfe129ec338e05137d1aba9e), [`ac34168`](https://github.com/clerk/javascript/commit/ac3416849954780bd873ed3fe20a173a8aee89aa), [`cf0d0dc`](https://github.com/clerk/javascript/commit/cf0d0dc7f6380d6e0c4e552090345b7943c22b35), [`db6b18e`](https://github.com/clerk/javascript/commit/db6b18e03860e3ef371ba86e72331dbef2dd4af0), [`22d1689`](https://github.com/clerk/javascript/commit/22d1689cb4b789fe48134b08a4e3dc5921ac0e1b), [`cc3b220`](https://github.com/clerk/javascript/commit/cc3b2201213055dc010f4525a467e8b4e49b792b), [`a70084c`](https://github.com/clerk/javascript/commit/a70084cc727e721fb79828b83f3018f1a8502625), [`a1aaff3`](https://github.com/clerk/javascript/commit/a1aaff33700ed81f31a9f340cf6cb3a82efeef85), [`d85646a`](https://github.com/clerk/javascript/commit/d85646a0b9efc893e2548dc55dbf08954117e8c2), [`8887fac`](https://github.com/clerk/javascript/commit/8887fac93fccffac7d1612cf5fb773ae614ceb22), [`0d06078`](https://github.com/clerk/javascript/commit/0d06078cb79d5adcf74fedf28ed70a302855b0e7), [`8b95393`](https://github.com/clerk/javascript/commit/8b953930536b12bd8ade6ba5c2092f40770ea8df), [`3dac245`](https://github.com/clerk/javascript/commit/3dac245456dae1522ee2546fc9cc29454f1f345f), [`65a236a`](https://github.com/clerk/javascript/commit/65a236aed8b2c4e2f3da266431586c7cfc2aad72), [`f1f1d09`](https://github.com/clerk/javascript/commit/f1f1d09e675cf9005348d2380df0da3f293047a6), [`f7780c8`](https://github.com/clerk/javascript/commit/f7780c8dbb64b84c182418e0550de114eb10d99d), [`da415c8`](https://github.com/clerk/javascript/commit/da415c813332998dafd4ec4690a6731a98ded65f), [`97c9ab3`](https://github.com/clerk/javascript/commit/97c9ab3c2130dbe4500c3feb83232d1ccbbd910e), [`97c9ab3`](https://github.com/clerk/javascript/commit/97c9ab3c2130dbe4500c3feb83232d1ccbbd910e), [`a7a38ab`](https://github.com/clerk/javascript/commit/a7a38ab76c66d3f147b8b1169c1ce86ceb0d9384), [`26254f0`](https://github.com/clerk/javascript/commit/26254f0463312115eca4bc0a396c5acd0703187b), [`12b3070`](https://github.com/clerk/javascript/commit/12b3070f3f102256f19e6af6acffb05b66d42e0b)]:
  - @clerk/localizations@4.0.0
  - @clerk/shared@4.0.0
