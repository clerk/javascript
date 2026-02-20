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

- Changes provider icon rendering from `<Image>` to `<Span>` elements to support customizable icon fills via CSS variables. ([#7560](https://github.com/clerk/javascript/pull/7560)) by [@alexcarpenter](https://github.com/alexcarpenter)

  Provider icons for Apple, GitHub, OKX Wallet, and Vercel now use CSS `mask-image` technique with a customizable `--cl-icon-fill` CSS variable, allowing themes to control icon colors. Other provider icons (like Google) continue to render as full-color images using `background-image`.

  You can customize the icon fill color in your theme:

  ```tsx
  import { createTheme } from '@clerk/ui/themes';

  const myTheme = createTheme({
    name: 'myTheme',
    elements: {
      providerIcon__apple: {
        '--cl-icon-fill': '#000000', // Custom fill color
      },
      providerIcon__github: {
        '--cl-icon-fill': 'light-dark(#000000, #ffffff)', // Theme-aware fill
      },
    },
  });
  ```

  This change enables better theme customization for monochrome provider icons while maintaining full-color support for providers that require it.

### Minor Changes

- Surface organization creation defaults with prefilled form fields and advisory warnings ([#7488](https://github.com/clerk/javascript/pull/7488)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Improve RTL support by converting physical CSS properties (margins, padding, text alignment, borders) to logical equivalents and adding direction-aware arrow icons ([#7718](https://github.com/clerk/javascript/pull/7718)) by [@alexcarpenter](https://github.com/alexcarpenter)

  The changes included:
  - Positioning (left → insetInlineStart)
  - Margins (marginLeft/Right → marginInlineStart/End)
  - Padding (paddingLeft/Right → paddingInlineStart/End)
  - Text alignment (left/right → start/end)
  - Border radius (borderTopLeftRadius → borderStartStartRadius)
  - Arrow icon flipping with scaleX(-1) in RTL
  - Animation direction adjustments

- Hide the "Remove" action from the last available 2nd factor strategy when MFA is required ([#7729](https://github.com/clerk/javascript/pull/7729)) by [@octoper](https://github.com/octoper)

- Adds `SignInClientTrust` component for discretely handling flows where client trust is required. ([#7430](https://github.com/clerk/javascript/pull/7430)) by [@tmilewski](https://github.com/tmilewski)

- Introducing `setup_mfa` session task ([#7626](https://github.com/clerk/javascript/pull/7626)) by [@octoper](https://github.com/octoper)

- Changed the default value of `appearance.layout.showOptionalFields` from `true` to `false`. Optional fields are now hidden by default during sign up. Users can still explicitly set `showOptionalFields: true` to show optional fields. ([#7365](https://github.com/clerk/javascript/pull/7365)) by [@brkalow](https://github.com/brkalow)

- Add legacy browser variant build support for older browsers ([#7472](https://github.com/clerk/javascript/pull/7472)) by [@jacekradko](https://github.com/jacekradko)

- Disable role selection in `OrganizationProfile` during role set migration ([#7534](https://github.com/clerk/javascript/pull/7534)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Display message in `TaskChooseOrganization` when user is not allowed to create organizations ([#7486](https://github.com/clerk/javascript/pull/7486)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Add runtime version check in ClerkUi constructor to detect incompatible @clerk/clerk-js versions ([#7667](https://github.com/clerk/javascript/pull/7667)) by [@bratsos](https://github.com/bratsos)

- Add Safari ITP (Intelligent Tracking Prevention) cookie refresh support. ([#7623](https://github.com/clerk/javascript/pull/7623)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  Safari's ITP limits cookies set via JavaScript to 7 days. When a session cookie is close to expiring (within 8 days), Clerk now automatically routes navigations through a `/v1/client/touch` endpoint to refresh the cookie via a full-page navigation, bypassing the 7-day cap.

  For developers using a custom `navigate` callback in `setActive()`, a new `decorateUrl` function is passed to the callback. Use it to wrap your destination URL:

  ```ts
  await clerk.setActive({
    session: newSession,
    navigate: ({ decorateUrl }) => {
      const url = decorateUrl('/dashboard');
      window.location.href = url;
    },
  });
  ```

  The `decorateUrl` function returns the original URL unchanged when the Safari ITP fix is not needed, so it's safe to always use it.

- Add shared React variant to reduce bundle size when using `@clerk/react`. ([#7601](https://github.com/clerk/javascript/pull/7601)) by [@brkalow](https://github.com/brkalow)

  Introduces a new `ui.shared.browser.js` build variant that externalizes React dependencies, allowing the host application's React to be reused instead of bundling a separate copy. This can significantly reduce bundle size for applications using `@clerk/react`.

  **New features:**
  - `@clerk/ui/register` module: Import this to register React on `globalThis.__clerkSharedModules` for sharing with `@clerk/ui`
  - `clerkUIVariant` option: Set to `'shared'` to use the shared variant (automatically detected and enabled for compatible React versions in `@clerk/react`)

  **For `@clerk/react` users:** No action required. The shared variant is automatically used when your React version is compatible.

  **For custom integrations:** Import `@clerk/ui/register` before loading the UI bundle, then set `clerkUIVariant: 'shared'` in your configuration.

- Add support for displaying proration and account credits on payment attempts and statements. ([#7880](https://github.com/clerk/javascript/pull/7880)) by [@dstaley](https://github.com/dstaley)

- Add `ui` prop to `ClerkProvider` for passing `@clerk/ui` ([#7664](https://github.com/clerk/javascript/pull/7664)) by [@jacekradko](https://github.com/jacekradko)

- Add support for account credits in checkout. ([#7776](https://github.com/clerk/javascript/pull/7776)) by [@dstaley](https://github.com/dstaley)

- Adds new `lightDark` theme. ([#7560](https://github.com/clerk/javascript/pull/7560)) by [@alexcarpenter](https://github.com/alexcarpenter)

  This theme uses the `light-dark()` CSS function to automatically adapt colors based on the user's system color scheme preference, eliminating the need to manually switch between light and dark themes.

  To enable it, within your project, you can do the following:

  ```tsx
  import { lightDark } from '@clerk/ui/themes';
  import { ClerkProvider } from '@clerk/nextjs';

  export default function MyApp({ Component, pageProps }: AppProps) {
    return (
      <ClerkProvider appearance={{ theme: lightDark }}>
        <Component {...pageProps} />
      </ClerkProvider>
    );
  }
  ```

  and within your CSS file, add the following to enable automatic light/dark mode switching:

  ```css
  :root {
    color-scheme: light dark;
  }
  ```

  This will automatically switch between light and dark modes based on the user's system preference. Alternatively, you can use a class-based approach:

  ```css
  :root {
    color-scheme: light;
  }

  .dark {
    color-scheme: dark;
  }
  ```

  **Note:** The `light-dark()` CSS function requires modern browser support (Chrome 123+, Firefox 120+, Safari 17.4+). For older browsers, consider using the `dark` theme with manual switching.

- Extract `<ProviderIcon />` component to ensure consistency is usage across the UI components. ([#7633](https://github.com/clerk/javascript/pull/7633)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Introduce `<Collapsible />` component and update `<CardAlert />` implementation to fix enter/exit animations. ([#7716](https://github.com/clerk/javascript/pull/7716)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Export `useOrganizationCreationDefaults` hook to fetch suggested organization name and logo from default naming rules ([#7694](https://github.com/clerk/javascript/pull/7694)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Introduce `<UNSAFE_PortalProvider>` component which allows you to specify a custom container for Clerk floating UI elements (popovers, modals, tooltips, etc.) that use portals. Only Clerk components within the provider will be affected, components outside the provider will continue to use the default document.body for portals. ([#7310](https://github.com/clerk/javascript/pull/7310)) by [@alexcarpenter](https://github.com/alexcarpenter)

  This is particularly useful when using Clerk components inside external UI libraries like [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) or [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html), where portaled elements need to render within the dialog's container to remain interact-able.

  ```tsx
  'use client';

  import { useRef } from 'react';
  import * as Dialog from '@radix-ui/react-dialog';
  import { UNSAFE_PortalProvider, UserButton } from '@clerk/nextjs';

  export function UserDialog() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
      <Dialog.Root>
        <Dialog.Trigger>Open Dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content ref={containerRef}>
            <UNSAFE_PortalProvider getContainer={() => containerRef.current}>
              <UserButton />
            </UNSAFE_PortalProvider>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
  ```

### Patch Changes

- Fix issue where the reset password form could be submitted via the enter key even when the confirmation password didn't match. ([#7432](https://github.com/clerk/javascript/pull/7432)) by [@dstaley](https://github.com/dstaley)

- Add development-mode warning when users customize Clerk components using structural CSS patterns (combinators, positional pseudo-selectors, etc.) without pinning their `@clerk/ui` version. This helps users avoid breakages when internal DOM structure changes between versions. ([#7590](https://github.com/clerk/javascript/pull/7590)) by [@brkalow](https://github.com/brkalow)

- Fix `TaskChooseOrganization` to complete organization activation when logo upload fails ([#7638](https://github.com/clerk/javascript/pull/7638)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Right align table actions. ([#7701](https://github.com/clerk/javascript/pull/7701)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Display actual organization membership name in in-app enable organization prompt success message ([#7581](https://github.com/clerk/javascript/pull/7581)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Fix issue where SVG elements had unexpected width/height attributes ([#7821](https://github.com/clerk/javascript/pull/7821)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Export `Appearance` type from `@clerk/ui` root entry ([#7836](https://github.com/clerk/javascript/pull/7836)) by [@jacekradko](https://github.com/jacekradko)

- Redirect signed-in users forward to afterSignInUrl when landing on factor-two without a pending 2FA session, instead of redirecting back to sign-in start ([#7788](https://github.com/clerk/javascript/pull/7788)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updates keyless prompt content. ([#7630](https://github.com/clerk/javascript/pull/7630)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Fix BaseRouter state not syncing after popup OAuth by observing `pushState`/`replaceState` changes in addition to `popstate` ([#7840](https://github.com/clerk/javascript/pull/7840)) by [@brkalow](https://github.com/brkalow)

- Set `SameSite=None` on cookies for `.replit.dev` origins and consolidate third-party domain list ([#7846](https://github.com/clerk/javascript/pull/7846)) by [@brkalow](https://github.com/brkalow)

- Fix UI package serving in CI/CD integration tests ([#7129](https://github.com/clerk/javascript/pull/7129)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Fix MIN_CLERK_JS_VERSION to match current clerk-js version until major release ([#7747](https://github.com/clerk/javascript/pull/7747)) by [@jacekradko](https://github.com/jacekradko)

- Fix `@clerk/ui/entry` bare specifier failing in browser when using `ui` prop with RSC ([#7809](https://github.com/clerk/javascript/pull/7809)) by [@jacekradko](https://github.com/jacekradko)

- Remove `useUserContext`, `useOrganizationContext`, `useSessionContext` and `useClientContext` from the `shared/react` package. ([#7772](https://github.com/clerk/javascript/pull/7772)) by [@Ephem](https://github.com/Ephem)

  These hooks have never been meant for public use and have been replaced with internal hooks that do not rely on context.

  If you need access to these resources, use the `useUser`, `useOrganization` and `useSession` hooks instead.

  If you are building a React SDK and need direct access to the `client`, get in touch with us to discuss!

- Remove opacity from `Select` placeholder ([#7574](https://github.com/clerk/javascript/pull/7574)) by [@LauraBeatris](https://github.com/LauraBeatris)

- - Removes logos from reverification steps ([#7692](https://github.com/clerk/javascript/pull/7692)) by [@alexcarpenter](https://github.com/alexcarpenter)

  - Removes fingerprint icon from passkey sign-in step

- Improve custom scrollbar styling and consistency across browsers. ([#7719](https://github.com/clerk/javascript/pull/7719)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Add drag to corner functionality to the KeylessPrompt ([#7845](https://github.com/clerk/javascript/pull/7845)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Display message for `user_deactivated` error code on `SignIn` and `SignUp` ([#7810](https://github.com/clerk/javascript/pull/7810)) by [@NicolasLopes7](https://github.com/NicolasLopes7)

- Skip the strategy selection screen if only one MFA strategy is available for the setup MFA session task ([#7760](https://github.com/clerk/javascript/pull/7760)) by [@octoper](https://github.com/octoper)

- ([#7496](https://github.com/clerk/javascript/pull/7496)) by [@brkalow](https://github.com/brkalow)

- Fix incorrect guard for hiding "Create organization" action. The `maxAllowedMemberships` setting limits seats per organization, not the number of organizations a user can create. ([#7677](https://github.com/clerk/javascript/pull/7677)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Fix role select being disabled on `OrganizationProfile` invite members page when default role is not in roles list ([#7567](https://github.com/clerk/javascript/pull/7567)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Allow creating additional memberships on unlimited `environment.organizationSettings.maxAllowedMemberships` ([#7555](https://github.com/clerk/javascript/pull/7555)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Update shadcn theme ring and modalBackdrop variables to match the opacity defined in shadcn components. ([#7495](https://github.com/clerk/javascript/pull/7495)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Removes provider icon filter invert from elements for both `dark` and `shadcn` themes. ([#7560](https://github.com/clerk/javascript/pull/7560)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Fix "You must belong to an organization" screen showing when user has existing memberships, invitations or suggestions ([#7553](https://github.com/clerk/javascript/pull/7553)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Introduce radio group for `EnableOrganizationsPrompt` ([#7444](https://github.com/clerk/javascript/pull/7444)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Fixed an issue where primary identifier in OAuth consent screen shows undefined when signing in with phone number only ([#7799](https://github.com/clerk/javascript/pull/7799)) by [@wobsoriano](https://github.com/wobsoriano)

- Add `subtitle__createOrganizationDisabled` localization key shown in the choose organization task when users cannot create organizations ([#7561](https://github.com/clerk/javascript/pull/7561)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Fix: await navigation after password sign-in completes to ensure redirects finish before continuing. ([#7443](https://github.com/clerk/javascript/pull/7443)) by [@octoper](https://github.com/octoper)

- Fix personal account display in `OrganizationSwitcher` and `OrganizationList` to exclude `primaryWeb3Wallet` from user identifiers ([#7531](https://github.com/clerk/javascript/pull/7531)) by [@jacekradko](https://github.com/jacekradko)

- Fix Safari sign-in redirect not completing when using OTP or impersonation. ([#7877](https://github.com/clerk/javascript/pull/7877)) by [@Ephem](https://github.com/Ephem)

- Updated dependencies [[`0a9cce3`](https://github.com/clerk/javascript/commit/0a9cce375046a7ff5944a7f2a140e787fe66996c), [`e35960f`](https://github.com/clerk/javascript/commit/e35960f5e44ab758d0ab0545691f44dbafd5e7cb), [`c9f0d77`](https://github.com/clerk/javascript/commit/c9f0d777f59673bfe614e1a8502cefe5445ce06f), [`1bd1747`](https://github.com/clerk/javascript/commit/1bd174781b83d3712a07e7dfe1acf73742497349), [`6a2ff9e`](https://github.com/clerk/javascript/commit/6a2ff9e957145124bc3d00bf10f566b613c7c60f), [`d2cee35`](https://github.com/clerk/javascript/commit/d2cee35d73d69130ad8c94650286d3b43dda55e6), [`0a9cce3`](https://github.com/clerk/javascript/commit/0a9cce375046a7ff5944a7f2a140e787fe66996c), [`a374c18`](https://github.com/clerk/javascript/commit/a374c18e31793b0872fe193ab7808747749bc56b), [`af85739`](https://github.com/clerk/javascript/commit/af85739195f5f4b353ba4395a547bbc8a8b26483), [`10b5bea`](https://github.com/clerk/javascript/commit/10b5bea85c3bb588c59f13628f32a82934f5de5a), [`a05d130`](https://github.com/clerk/javascript/commit/a05d130451226d2c512c9ea1e9a9f1e4cb2e3ba2), [`b193f79`](https://github.com/clerk/javascript/commit/b193f79ee86eb8ce788db4b747d1c64a1c7c6ac5), [`e9d2f2f`](https://github.com/clerk/javascript/commit/e9d2f2fd1ea027f7936353dfcdc905bcb01c3ad7), [`43fc7b7`](https://github.com/clerk/javascript/commit/43fc7b7b40cf7c42cfb0aa8b2e2058243a3f38f5), [`c5ca7f7`](https://github.com/clerk/javascript/commit/c5ca7f7612247b3031c0349c0ddb3c9cab653b66), [`0f1011a`](https://github.com/clerk/javascript/commit/0f1011a062c3705fc1a69593672b96ad03936de1), [`38def4f`](https://github.com/clerk/javascript/commit/38def4fedc99b6be03c88a3737b8bd5940e5bff3), [`7772f45`](https://github.com/clerk/javascript/commit/7772f45ee601787373cf3c9a24eddf3f76c26bee), [`a3e689f`](https://github.com/clerk/javascript/commit/a3e689f3b7f2f3799a263da4b7bb14c0e49e42b7), [`583f7a9`](https://github.com/clerk/javascript/commit/583f7a9a689310f4bdd2c66f5258261f08e47109), [`965e7f1`](https://github.com/clerk/javascript/commit/965e7f1b635cf25ebfe129ec338e05137d1aba9e), [`2b76081`](https://github.com/clerk/javascript/commit/2b7608145611c10443a999cae4373a1acfd7cab7), [`f284c3d`](https://github.com/clerk/javascript/commit/f284c3d1d122b725594d0a287d0fb838f6d191f5), [`ac34168`](https://github.com/clerk/javascript/commit/ac3416849954780bd873ed3fe20a173a8aee89aa), [`cf0d0dc`](https://github.com/clerk/javascript/commit/cf0d0dc7f6380d6e0c4e552090345b7943c22b35), [`690280e`](https://github.com/clerk/javascript/commit/690280e91b0809d8e0fd1e161dd753dc62801244), [`b971d0b`](https://github.com/clerk/javascript/commit/b971d0bb3eed3a6d3d187b4a296bc6e56271014e), [`22d1689`](https://github.com/clerk/javascript/commit/22d1689cb4b789fe48134b08a4e3dc5921ac0e1b), [`e9a1d4d`](https://github.com/clerk/javascript/commit/e9a1d4dcac8a61595739f83a5b9b2bc18a35f59d), [`c088dde`](https://github.com/clerk/javascript/commit/c088dde13004dc16dd37c17572a52efda69843c9), [`cc3b220`](https://github.com/clerk/javascript/commit/cc3b2201213055dc010f4525a467e8b4e49b792b), [`8902e21`](https://github.com/clerk/javascript/commit/8902e216bab83fe85a491bdbc2ac8129e83e5a73), [`a70084c`](https://github.com/clerk/javascript/commit/a70084cc727e721fb79828b83f3018f1a8502625), [`972f6a0`](https://github.com/clerk/javascript/commit/972f6a015d720c4867aa24b4503db3968187e523), [`a1aaff3`](https://github.com/clerk/javascript/commit/a1aaff33700ed81f31a9f340cf6cb3a82efeef85), [`d85646a`](https://github.com/clerk/javascript/commit/d85646a0b9efc893e2548dc55dbf08954117e8c2), [`ab3dd16`](https://github.com/clerk/javascript/commit/ab3dd160608318363b42f5f46730ed32ee12335b), [`fd195c1`](https://github.com/clerk/javascript/commit/fd195c14086cba7087c74af472d2558d04fe3afd), [`8887fac`](https://github.com/clerk/javascript/commit/8887fac93fccffac7d1612cf5fb773ae614ceb22), [`8b95393`](https://github.com/clerk/javascript/commit/8b953930536b12bd8ade6ba5c2092f40770ea8df), [`fd195c1`](https://github.com/clerk/javascript/commit/fd195c14086cba7087c74af472d2558d04fe3afd), [`fd69edb`](https://github.com/clerk/javascript/commit/fd69edbcfe2dfca71d1e6d41af9647701dba2823), [`8d91225`](https://github.com/clerk/javascript/commit/8d91225acc67349fd0d35f982dedb0618f3179e9), [`1fc95e2`](https://github.com/clerk/javascript/commit/1fc95e2a0a5a99314b1bb4d59d3f3e3f03accb3d), [`3dac245`](https://github.com/clerk/javascript/commit/3dac245456dae1522ee2546fc9cc29454f1f345f), [`a4c3b47`](https://github.com/clerk/javascript/commit/a4c3b477dad70dd55fe58f433415b7cc9618a225), [`65a236a`](https://github.com/clerk/javascript/commit/65a236aed8b2c4e2f3da266431586c7cfc2aad72), [`7c3c002`](https://github.com/clerk/javascript/commit/7c3c002d6d81305124f934f41025799f4f03103e), [`d8bbc66`](https://github.com/clerk/javascript/commit/d8bbc66d47b476b3405c03e1b0632144afdd716b), [`222202e`](https://github.com/clerk/javascript/commit/222202e6ee5d2bc3ea587bda2bcc8b879a01eed5), [`3983cf8`](https://github.com/clerk/javascript/commit/3983cf85d657c247d46f94403cb121f13f6f01e4), [`f1f1d09`](https://github.com/clerk/javascript/commit/f1f1d09e675cf9005348d2380df0da3f293047a6), [`92599c7`](https://github.com/clerk/javascript/commit/92599c7096cbb3a630cc4ea4ca91dea7b9e3c7c0), [`736314f`](https://github.com/clerk/javascript/commit/736314f8641be005ddeacfccae9135a1b153d6f6), [`2cc7dbb`](https://github.com/clerk/javascript/commit/2cc7dbbb212f92e2889460086b50eb644b8ba69d), [`86d2199`](https://github.com/clerk/javascript/commit/86d219970cdc21d5160f0c8adf2c30fc34f1c7b9), [`2b61c5f`](https://github.com/clerk/javascript/commit/2b61c5f9e86b4195f6c6aea843529a83bae4007c), [`da415c8`](https://github.com/clerk/javascript/commit/da415c813332998dafd4ec4690a6731a98ded65f), [`97c9ab3`](https://github.com/clerk/javascript/commit/97c9ab3c2130dbe4500c3feb83232d1ccbbd910e), [`cc63aab`](https://github.com/clerk/javascript/commit/cc63aab479853f0e15947837eff5a4f46c71c9f2), [`a7a38ab`](https://github.com/clerk/javascript/commit/a7a38ab76c66d3f147b8b1169c1ce86ceb0d9384), [`cfa70ce`](https://github.com/clerk/javascript/commit/cfa70ce766b687b781ba984ee3d72ac1081b0c97), [`26254f0`](https://github.com/clerk/javascript/commit/26254f0463312115eca4bc0a396c5acd0703187b), [`c97e6af`](https://github.com/clerk/javascript/commit/c97e6af1d6974270843ce91ce17b0c36ee828aa0), [`d98727e`](https://github.com/clerk/javascript/commit/d98727e30b191087abb817acfc29cfccdb3a7047), [`79e2622`](https://github.com/clerk/javascript/commit/79e2622c18917709a351a122846def44c7e22f0c), [`12b3070`](https://github.com/clerk/javascript/commit/12b3070f3f102256f19e6af6acffb05b66d42e0b)]:
  - @clerk/shared@4.0.0
  - @clerk/localizations@4.0.0
