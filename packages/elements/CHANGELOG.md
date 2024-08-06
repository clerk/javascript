# @clerk/elements

## 0.12.3

### Patch Changes

- Updated dependencies [[`9b2aeacb3`](https://github.com/clerk/javascript/commit/9b2aeacb32fff7c300bda458636a1cc81a42ee7b)]:
  - @clerk/types@4.12.1

## 0.12.2

### Patch Changes

- Return password validation errors with additional supporting information from instance configuration ([#3812](https://github.com/clerk/javascript/pull/3812)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Fixes a bug that briefly showed the underlying primitive input for OTPs when auto-filled in MacOS ([#3899](https://github.com/clerk/javascript/pull/3899)) by [@joe-bell](https://github.com/joe-bell)

- Updated dependencies [[`7e94fcf0f`](https://github.com/clerk/javascript/commit/7e94fcf0fcbee8842a54f7931c45190370aa870d)]:
  - @clerk/types@4.12.0

## 0.12.1

### Patch Changes

- Updated dependencies [[`568186cad`](https://github.com/clerk/javascript/commit/568186cad29acaf0b084a9f86ccb9d29bd23fcf4), [`407195270`](https://github.com/clerk/javascript/commit/407195270ed8aab6eef18c64a4918e3870fef471)]:
  - @clerk/types@4.11.0

## 0.12.0

### Minor Changes

- Add Metamask (Web3) support for sign in and sign up ([#3879](https://github.com/clerk/javascript/pull/3879)) by [@dstaley](https://github.com/dstaley)

## 0.11.0

### Minor Changes

- Add full SAML support ([#3842](https://github.com/clerk/javascript/pull/3842)) by [@tmilewski](https://github.com/tmilewski)

- Update signin `isLoggedInAndSingleSession` guard to navigate using `buildAfterSignInUrl` when true. ([#3841](https://github.com/clerk/javascript/pull/3841)) by [@alexcarpenter](https://github.com/alexcarpenter)

### Patch Changes

- Fixes issue where the incorrect sign in first factor strategy was being returned during sign in. ([#3828](https://github.com/clerk/javascript/pull/3828)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Ensure correct supported strategies are rendered based on first or second factor needs. ([#3843](https://github.com/clerk/javascript/pull/3843)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`aa06f3ba7`](https://github.com/clerk/javascript/commit/aa06f3ba7e725071c90d4a1d6840060236da3c23), [`80e647731`](https://github.com/clerk/javascript/commit/80e64773135865434cf0e6c220e287397aa07937)]:
  - @clerk/types@4.10.0

## 0.10.7

### Patch Changes

- Updated dependencies [[`b48689705`](https://github.com/clerk/javascript/commit/b48689705f9fc2251d2f24addec7a0d0b1da0fe1)]:
  - @clerk/types@4.9.1

## 0.10.6

### Patch Changes

- Add support for checkbox input usage and `signOutOfOtherSessions` functionality ([#3791](https://github.com/clerk/javascript/pull/3791)) by [@alexcarpenter](https://github.com/alexcarpenter)

## 0.10.5

### Patch Changes

- Reverts [addition of relatedTarget check](https://github.com/clerk/javascript/pull/3762) in onFocus event handler which prevented fieldstate info from render on focus. ([#3770](https://github.com/clerk/javascript/pull/3770)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Handle call to `hasTags` on undefined `state` ([#3738](https://github.com/clerk/javascript/pull/3738)) by [@tmilewski](https://github.com/tmilewski)

- Fixes issue where an invalid password field was immediately being refocused after submission causing the validation to run and show the success state. ([#3762](https://github.com/clerk/javascript/pull/3762)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Pass resource directly to machine over getSnapshot to avoid empty context ([#3738](https://github.com/clerk/javascript/pull/3738)) by [@tmilewski](https://github.com/tmilewski)

- Fix issue where password field validation was incorrectly showing successful field state due to input being refocused on invalid form submission ([#3778](https://github.com/clerk/javascript/pull/3778)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Update XState from 5.13.x to 5.15.x ([#3738](https://github.com/clerk/javascript/pull/3738)) by [@tmilewski](https://github.com/tmilewski)

- Update types to account for null second factors ([#3780](https://github.com/clerk/javascript/pull/3780)) by [@dstaley](https://github.com/dstaley)

- Add support for `transform` prop on `SignIn.SafeIdentifier` and determine identifier based on strategy ([#3749](https://github.com/clerk/javascript/pull/3749)) by [@dstaley](https://github.com/dstaley)

- Updated dependencies [[`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`86c75e50c`](https://github.com/clerk/javascript/commit/86c75e50cba9c4efb480672f1b8c6a6fff4ef477)]:
  - @clerk/types@4.9.0

## 0.10.4

### Patch Changes

- Fix issue where default field values were being set and clearing field errors. ([#3736](https://github.com/clerk/javascript/pull/3736)) by [@alexcarpenter](https://github.com/alexcarpenter)

  Fix issue where resendable UI in the email_link verification step was not updating on click.

## 0.10.3

### Patch Changes

- Ensure updated provided values to controlled inputs are sent to the machine by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Fix isWeb3Strategy check to account for prefix and suffix by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7)]:
  - @clerk/types@4.8.0

## 0.10.2

### Patch Changes

- Prefill populated fields when navigating back to the start step from the verify step ([#3685](https://github.com/clerk/javascript/pull/3685)) by [@alexcarpenter](https://github.com/alexcarpenter)

## 0.10.1

## 0.10.0

### Minor Changes

- Add `backup_code` verification strategy ([#3627](https://github.com/clerk/javascript/pull/3627)) by [@tmilewski](https://github.com/tmilewski)

  ```tsx
  <SignIn.Step name='choose-strategy'>
    <SignIn.SupportedStrategy name='backup_code'>Use a backup code</SignIn.SupportedStrategy>
  <SignIn.Step>
  ```

  ```tsx
  <SignIn.Step name='verifications'>
    <SignIn.Strategy name='backup_code'>
      <Clerk.Field name="backup_code">
        <Clerk.Label>Code:</Clerk.Label>
        <Clerk.Input />
        <Clerk.FieldError />
      </Clerk.Field>

      <Clerk.Action submit>Continue</Clerk.Action>
    </SignIn.Strategy>
  <SignIn.Step>
  ```

### Patch Changes

- Addresses the issue where sign-in factors were not properly falling back to empty arrays. ([#3647](https://github.com/clerk/javascript/pull/3647)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Refactors sign-up loading logic to be in-line with sign-in ([#3648](https://github.com/clerk/javascript/pull/3648)) by [@tmilewski](https://github.com/tmilewski)

- Ensure Sign Up resending resets upon being triggered ([#3652](https://github.com/clerk/javascript/pull/3652)) by [@tmilewski](https://github.com/tmilewski)

- Fixes persistent loading states within the `forgot-password` step ([#3648](https://github.com/clerk/javascript/pull/3648)) by [@tmilewski](https://github.com/tmilewski)

- Fix Sign In forgot-password step not rendering ([#3653](https://github.com/clerk/javascript/pull/3653)) by [@tmilewski](https://github.com/tmilewski)

## 0.9.2

### Patch Changes

- Updated dependencies [[`d6b5006c4`](https://github.com/clerk/javascript/commit/d6b5006c4cc1b6f07bb3a6832b4ec6e65ea15814)]:
  - @clerk/types@4.7.0

## 0.9.1

### Patch Changes

- Add a development-only warning for cases when a user renders a `<Strategy>` component that isn't activated for their Clerk instance. As this can be intended behavior (e.g. build out a full example and let user enable/disable stuff solely in the dashboard) the warning can safely be ignored if necessary. ([#3609](https://github.com/clerk/javascript/pull/3609)) by [@LekoArts](https://github.com/LekoArts)

## 0.9.0

### Minor Changes

- Improve `<FieldState>` and re-organize some data attributes related to validity states. These changes might be breaking changes for you. ([#3594](https://github.com/clerk/javascript/pull/3594)) by [@LekoArts](https://github.com/LekoArts)

  Overview of changes:

  - `<form>` no longer has `data-valid` and `data-invalid` attributes. If there are global errors (same heuristics as `<GlobalError>`) then a `data-global-error` attribute will be present.
  - Fixed a bug where `<Field>` could contain `data-valid` and `data-invalid` at the same time.
  - The field state (accessible through e.g. `<FieldState>`) now also incorporates the field's [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) into its output. If the `ValidityState` is invalid, the field state will be an `error`. You can access this information in three places:
    1. `<FieldState>`
    2. `data-state` attribute on `<Input>`
    3. `<Field>{(state) => <p>Field's state is {state}</p>}</Field>`

### Patch Changes

- Fix Sign In & Sign Up root fallbacks not rendering as expected ([#3601](https://github.com/clerk/javascript/pull/3601)) by [@tmilewski](https://github.com/tmilewski)

- Update all Radix dependencies to their June 19, 2024 release ([#3606](https://github.com/clerk/javascript/pull/3606)) by [@LekoArts](https://github.com/LekoArts)

## 0.8.0

### Minor Changes

- The `path` prop on the `<SignIn.Root>` and `<SignUp.Root>` component is now automatically inferred. Previously, the default values were `/sign-in` and `/sign-up`, on other routes you had to explicitly define your route. ([#3557](https://github.com/clerk/javascript/pull/3557)) by [@LekoArts](https://github.com/LekoArts)

  The new heuristic for determining the path where `<SignIn.Root>` and `<SignUp.Root>` are mounted is:

  1. `path` prop
  2. Automatically inferred
  3. If it can't be inferred, fallback to `CLERK_SIGN_IN_URL` and `CLERK_SIGN_UP_URL` env var
  4. Fallback to `/sign-in` and `/sign-up`

### Patch Changes

- Render the resendable button at the 0 tick ([#3575](https://github.com/clerk/javascript/pull/3575)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`1273b04ec`](https://github.com/clerk/javascript/commit/1273b04ecf1866b59ef59a74abe31dbcc726da2c)]:
  - @clerk/types@4.6.1

## 0.7.0

### Minor Changes

- Support passkeys in `<SignIn>` flows. ([#3472](https://github.com/clerk/javascript/pull/3472)) by [@panteliselef](https://github.com/panteliselef)

  APIs introduced:

  - `<SignIn.Passkey />`
  - `<SignIn.SupportedStrategy name='passkey'>`
  - `<SignIn.Strategy name='passkey'>`
  - Detects the usage of `webauthn` to trigger passkey autofill `<Clerk.Input autoComplete="webauthn" />`

  Usage examples:

  - `<SignIn.Action passkey />`

    ```tsx
    <SignIn.Step name="start">
      <SignIn.Passkey>
        <Clerk.Loading>
          {(isLoading) => (isLoading ? <Spinner /> : "Use passkey instead")}.
        </Clerk.Loading>
      </SignIn.Passkey>
    </SignIn.Step>
    ```

  - `<SignIn.SupportedStrategy name='passkey'>`

    ```tsx
    <SignIn.SupportedStrategy asChild name="passkey">
      <Button>use passkey</Button>
    </SignIn.SupportedStrategy>
    ```

  - `<SignIn.Strategy name='passkey'>`

    ```tsx
    <SignIn.Strategy name="passkey">
      <p className="text-sm">
        Welcome back <SignIn.Salutation />!
      </p>

      <CustomSubmit>Continue with Passkey</CustomSubmit>
    </SignIn.Strategy>
    ```

  - Passkey Autofill
    ```tsx
    <SignIn.Step name="start">
      <Clerk.Field name="identifier">
        <Clerk.Label className="sr-only">Email</Clerk.Label>
        <Clerk.Input
          autoComplete="webauthn"
          placeholder="Enter your email address"
        />
        <Clerk.FieldError />
      </Clerk.Field>
    </SignIn.Step>
    ```

## 0.6.0

### Minor Changes

- - Adds virtual router to support modal scenarios ([#3461](https://github.com/clerk/javascript/pull/3461)) by [@tmilewski](https://github.com/tmilewski)

  - Adds `routing` prop to `SignIn.Root` and `SignUp.Root` for handling `virtual` routing
  - Better support for Account Portal redirect callback flows

### Patch Changes

- Fix forms unable to submit upon re-mounting ([#3473](https://github.com/clerk/javascript/pull/3473)) by [@tmilewski](https://github.com/tmilewski)

- Set `@clerk/types` as a dependency for packages that had it as a dev dependency. ([#3450](https://github.com/clerk/javascript/pull/3450)) by [@desiprisg](https://github.com/desiprisg)

- Ensure missing passwordSettings don't throw an error ([#3474](https://github.com/clerk/javascript/pull/3474)) by [@tmilewski](https://github.com/tmilewski)

- Display hard to catch errors inside the sign-in verification step during development (when `NODE_ENV` is set to `development`). ([#3517](https://github.com/clerk/javascript/pull/3517)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`73e5d61e2`](https://github.com/clerk/javascript/commit/73e5d61e21ab3f77f3c8343bc63da0626466c7ac), [`b8e46328d`](https://github.com/clerk/javascript/commit/b8e46328da874859c4928f19f924219cd6520b11)]:
  - @clerk/types@4.6.0

## 0.5.2

### Patch Changes

- Widen optional peerDependency of `next` to include `>=15.0.0-rc`. This way you can use Next.js 15 with Clerk Elements without your package manager complaining. Also allow React 19. ([#3445](https://github.com/clerk/javascript/pull/3445)) by [@LekoArts](https://github.com/LekoArts)

## 0.5.1

### Patch Changes

- Update the TypeScript type of `<Input />` to allow the `validatePassword` prop also on `type="text"` (in addition to `type="password"`) ([#3394](https://github.com/clerk/javascript/pull/3394)) by [@LekoArts](https://github.com/LekoArts)

## 0.5.0

### Minor Changes

- - Adds Stately's Browser Inspector in development builds ([#3424](https://github.com/clerk/javascript/pull/3424)) by [@tmilewski](https://github.com/tmilewski)

  - Removes `@statelyai/inspect` from dependencies
  - Ensures all inspector-related code is omitted from the build

### Patch Changes

- Fix: Verification form submission wasn't working after returning from "choosing an alternate strategy" without making a selection. ([#3425](https://github.com/clerk/javascript/pull/3425)) by [@tmilewski](https://github.com/tmilewski)

  Perf: Adds a `NeverRetriable` state for applicable strategies so the countdown doesn't run needlessly.

## 0.4.7

### Patch Changes

- Update FieldError/GlobalError types to allow render function children while using the asChild prop ([#3426](https://github.com/clerk/javascript/pull/3426)) by [@tmilewski](https://github.com/tmilewski)

## 0.4.6

## 0.4.5

### Patch Changes

- Update `<FieldError />` to enable `asChild` prop for custom markup in render function usage. ([#3396](https://github.com/clerk/javascript/pull/3396)) by [@alexcarpenter](https://github.com/alexcarpenter)

## 0.4.4

### Patch Changes

- Fix `setActive` not firing upon a successful sign up. ([#3391](https://github.com/clerk/javascript/pull/3391)) by [@tmilewski](https://github.com/tmilewski)

## 0.4.3

### Patch Changes

- Fix typing for GlobalError and FieldError render functions ([#3387](https://github.com/clerk/javascript/pull/3387)) by [@tmilewski](https://github.com/tmilewski)

## 0.4.2

## 0.4.1

### Patch Changes

- This release includes various smaller fixes and one dependency update: ([#3343](https://github.com/clerk/javascript/pull/3343)) by [@tmilewski](https://github.com/tmilewski)

  - `xstate` was updated from `5.12.0` to `5.13.0`
  - Previously, the contents of the `fallback` prop were sometimes shown even if the user wasn't on the `start` step. This bug is fixed now.
  - Upon completion of an sign-in/sign-up attempt, don't immediately return to the `start` step. This fixes the issue of a "flash of content" that could e.g. be seen during sign-in with OAuth providers.
  - Some underlying fixes in Clerk Elements' XState logic were applied to make sure that during a sign-in/sign-up attempt the state is properly maintained. For example, if you visit an already completed attempt (some step of that flow) it now properly keeps track of that state.

## 0.4.0

### Minor Changes

- With this change `<SignIn.Step name="choose-strategy">` and `<SignIn.Step name="forgot-password">` now render a `<div>`. This aligns them with all other `<Step>` components (which render an element, mostly `<form>`). ([#3359](https://github.com/clerk/javascript/pull/3359)) by [@LekoArts](https://github.com/LekoArts)

  **Required action:** Update your markup to account for the new `<div>`, e.g. by removing an element you previously added yourself and moving props like `className` to the `<Step>` now. This change can be considered a breaking change so check if you're affected.

## 0.3.3

### Patch Changes

- The following are all internal changes and not relevant to any end-user: ([#3329](https://github.com/clerk/javascript/pull/3329)) by [@LauraBeatris](https://github.com/LauraBeatris)

  Create type interface for `TelemetryCollector` on `@clerk/types`. This allows to assign `telemetry` on the main Clerk SDK object, while inheriting from the actual `TelemetryCollector` implementation.

- Refactors internal logic to avoid reliance on `useEffect`. This resolves potential for race conditions as a result of functionality coupled to component renders. ([#3320](https://github.com/clerk/javascript/pull/3320)) by [@tmilewski](https://github.com/tmilewski)

- Typo fixes in README ([#3335](https://github.com/clerk/javascript/pull/3335)) by [@LekoArts](https://github.com/LekoArts)

## 0.3.2

### Patch Changes

- Fix issue where sign-up action resend would render type error for applying submit attribute ([#3327](https://github.com/clerk/javascript/pull/3327)) by [@alexcarpenter](https://github.com/alexcarpenter)

## 0.3.1

### Patch Changes

- Fix otp input overflow using clip path to prevent users clicking in the overflow space for password managers causing unexpected focus on input element ([#3317](https://github.com/clerk/javascript/pull/3317)) by [@alexcarpenter](https://github.com/alexcarpenter)

## 0.3.0

### Minor Changes

- Fix sign in route registration on development environments ([#3308](https://github.com/clerk/javascript/pull/3308)) by [@tmilewski](https://github.com/tmilewski)

## 0.2.1

### Patch Changes

- Add appropriate messaging for an invalid instance configuration vs implemented Elements strategies ([#3303](https://github.com/clerk/javascript/pull/3303)) by [@tmilewski](https://github.com/tmilewski)

- Fixes a bug where multiple verification codes were sent at once. ([#3303](https://github.com/clerk/javascript/pull/3303)) by [@tmilewski](https://github.com/tmilewski)

## 0.2.0

### Minor Changes

- Bump version to 0.2.0 ([#3301](https://github.com/clerk/javascript/pull/3301)) by [@tmilewski](https://github.com/tmilewski)

  Fix return type of `<SignIn.Strategy>` to be `JSX.Element | null`

### Patch Changes

- Update README to add install and usage instructions ([#3253](https://github.com/clerk/javascript/pull/3253)) by [@LekoArts](https://github.com/LekoArts)

## 0.1.46

### Patch Changes

- Consistently use sign-in/sign-up as a noun, sign in/sign up as a verb
- Change the `peerDependencies` range of `@clerk/clerk-react` and `@clerk/shared` to the stable Core 2 range
- Change the `peerDependency` range of `next` to mimic what `@clerk/nextjs` is doing
- Remove the `peerDependenciesMeta` entry for `@clerk/clerk-react` and `@clerk/shared` since that hacky workaround shouldn't be necessary anymore as Core 2 is stable now
- Change some imports of `@clerk/shared` to their subpath imports (e.g. `@clerk/shared/url`) to improve tree-shaking
- Add JSDoc comments where they were missing
- Update JSDoc comments to use namespace notation
- Misc JSDoc updates here and there

## 0.1.45

### Patch Changes

- Add the ability to use `<SignUp.Captcha />` to support visible challenges

## 0.1.44

### Patch Changes

- Add `<Action resend>` / `<Action resend fallback={...}>` to Sign-Up

## 0.1.43

### Patch Changes

- **[BREAKING]**
  - Rename `Provider` to `Connection`
  - Rename `ProviderIcon` to `Icon`
  - Update to handle both sign-up and sign-in
  - export under `/common`

## 0.1.42

### Patch Changes

- Add Sign In Forgot Password functionality
- Clerk’s all-in-one components have a neat feature for the password input during sign-up: There's an instant validation (according to the dashboard password strength settings) and feedback on how good/bad the password is.
  - You can add a `validatePassword` prop to `<Input type="password" />` to enable the aforementioned validation
  - The `<FieldState>` component now returns beside `state` also `message` and `codes`

## 0.1.41

### Patch Changes

- Introduce `exampleMode`, which unconditionally renders the start step. In the future, we can leverage this to make "mock" functional flows in docs. We'll use this currently in the docs to showcase pre-built examples.

## 0.1.40

### Patch Changes

- Add resendable verifications to sign-in

## 0.1.39

### Patch Changes

- Add verifications warning/error messages when building a verifications flow

## 0.1.38

### Patch Changes

- Adjust types to prevent `asChild` usage when using the render prop for OTP input

## 0.1.37

### Patch Changes

- Change data attribute on OTP input to `data-otp-input-standard`

## 0.1.36

### Patch Changes

- Allow `className` on `<Action>` and `<Action navigate>`

## 0.1.35

### Patch Changes

- Allow for controlled inputs

## 0.1.34

### Patch Changes

- Fix issues with TypeScript completions / IntelliSense

## 0.1.33

### Patch Changes

- Correctly passthrough `onChange` prop to `<Input />`

## 0.1.32

### Patch Changes

- Bugfixes for OTP component (`<input type=”otp” />`). You can now also pass a `passwordManagerOffset` prop to the component. It adds your specified number of pixels to the `width` of the input.

## 0.1.31

### Patch Changes

- Enable support for Next.js 14.1.0 or later (and its [window.history](https://nextjs.org/blog/next-14-1#windowhistorypushstate-and-windowhistoryreplacestate) changes)

## 0.1.30

### Patch Changes

- Ensure that `<Input />` can accept a `ref`

## 0.1.29

### Patch Changes

- Fix for a type issue with `<Step>`

## 0.1.28

### Patch Changes

- **[BREAKING]**
  - The import for the `<Loading>` component was moved to `/common`
    ```diff
    	- import { Loading } from "@clerk/elements/sign-in"
    - import { Loading } from "@clerk/elements/sign-up"
    + import { Loading } from "@clerk/elements/common"
    ```

## 0.1.27

### Patch Changes

- **[BREAKING]**
  - `<FieldState>` now returns its state directly in the function, not nested inside an object
    - Before: `<FieldState>{({ state }) => ()}</FieldState>`
    - After: `<FieldState>{state => ()}</FieldState>`
- `<Field>` now optionally allows for its children to accept a function providing the state. You don’t have to use the function, it’s optional.
  - Example: `<Field>{state => ()}</Field>`

## 0.1.26

### Patch Changes

- Introduction of the `<Loading>` component

## 0.1.25

### Patch Changes

- Removed internal usage of `"use client"` directive and replaced it with an implementation that still marks our components as client-only but throws a better error message when Clerk Elements is used in Server Components

## 0.1.24

### Patch Changes

- **[BREAKING]**
  - `<Verification>` was renamed to `<Strategy>`
  - The `<Navigate>` component was removed. Use `<Action>` instead.
    - Before: `<Navigate to="previous">Go back</Navigate>`
    - After: `<Action navigate="previous">Go back</Action>`
- You can use `<Action>` now instead of the `<Submit>` component
  - Example: `<Action submit>Log in</Action>`

## 0.1.23

### Patch Changes

- Adds `<SafeIdentifier>` to SignIn, enabling the ability to display the current identifier being validated against. E.g.: `We’ve sent a temporary code to <SafeIdentifier>**.**`
- **[BREAKING]** Renames the following components:
  - `<SocialProvider>` to `<Provider>`
  - `<SocialProviderIcon>` to `<ProviderIcon>`

## 0.1.22

### Patch Changes

- Disable debug logging by default. Go you can opt-in to it by using an environment variable: `NEXT_PUBLIC_CLERK_ELEMENTS_DEBUG=1`

## 0.1.21

### Patch Changes

- Resolved installation issues with pnpm

## 0.1.20

### Patch Changes

- Temporarily removed Core 2 Beta peerDependencies to resolve npm issues. Once Core 2 is stable they’ll get added back

## 0.1.19

### Patch Changes

- **[BREAKING]**
  - Require Core 2 Beta version to be used with Clerk Elements
    - You can install the Next.js SDK with `npm install @clerk/nextjs@beta`

## 0.1.18

### Patch Changes

- Attempt to fix Strict Mode errors during development

## 0.1.17

### Patch Changes

- Fix incorrect peer dependencies

## 0.1.16

### Patch Changes

- Fix internal function that maps the `name` of the `<Field>` component to input types. Use the autocomplete/IntelliSense on `<Field>` to use supported names

## 0.1.15

### Patch Changes

- You can now provide alternative login strategies during sign in. It’s the “Use another method” functionality that Clerk’s current prebuilt components offer.
  - Introduction of a `<StrategyOption>` component for the sign in flow.
- Introduction of a `<Navigate>` component.

## 0.1.14

### Patch Changes

- Performance improvements to underlying business logic
- **[BREAKING]**
  - `<Start>`, `<Continue>` and `<Verifications>` as export were removed. Use `<Step>` instead.

## 0.1.13

### Patch Changes

- Added JSDoc comments to all public APIs

## 0.1.12

### Patch Changes

- You can now add a `autoSubmit` prop to `<Input type="otp" />` to automatically submit the form if the OTP input is complete

## 0.1.11

### Patch Changes

- Fix bugs in SAML/OAuth flows
- Add `<Step>` component which can be used instead of `<Start>`, `<Continue>` and `<Verifications>` like this:
  ```tsx
  // You can also use name="continue" or name="verifications"
  <Step name="start">Contents</Step>
  ```

## 0.1.10

### Patch Changes

- Improved focus handling and accessibility of the `<Input type="otp">` component
- You can now pass a `length` prop to the `<Input type="otp>` component. Default value is `6`

## 0.1.9

### Patch Changes

- Initial version for external people to try

## 0.0.2-beta-v5.8

### Patch Changes

- Updated dependencies [[`24de66951`](https://github.com/clerk/javascript/commit/24de6695173a2a6c49ca38c61f22b86e43267426), [`8e5c881c4`](https://github.com/clerk/javascript/commit/8e5c881c40d7306c5dbd2e1f1803fbf75127bd71), [`d4ff346dd`](https://github.com/clerk/javascript/commit/d4ff346dd53bb3e1970e80bdc7b188c2dd344f12)]:
  - @clerk/nextjs@5.0.0-beta-v5.20
  - @clerk/shared@2.0.0-beta-v5.11
  - @clerk/clerk-react@5.0.0-beta-v5.17

## 0.0.2-alpha-v5.7

### Patch Changes

- Updated dependencies [[`4564ad643`](https://github.com/clerk/javascript/commit/4564ad643da6a6396a519d2c23d3799e9962bf52), [`9e99eb727`](https://github.com/clerk/javascript/commit/9e99eb7276249c68ef6f930cce418ce0004653b9), [`6fffd3b54`](https://github.com/clerk/javascript/commit/6fffd3b542f3df0bcb49281b7c4f77209a83f7a1)]:
  - @clerk/nextjs@5.0.0-alpha-v5.19

## 0.0.2-alpha-v5.6

### Patch Changes

- Updated dependencies [[`6a769771c`](https://github.com/clerk/javascript/commit/6a769771c975996d8d52b35b5cfdbae5dcec85d4), [`529e2e14c`](https://github.com/clerk/javascript/commit/529e2e14c4d53683bf5b2e3791a15e7bd265ab5c), [`32992906c`](https://github.com/clerk/javascript/commit/32992906c46f8d76e8ccb42257c8ffadf10e0076)]:
  - @clerk/nextjs@5.0.0-alpha-v5.18

## 0.0.2-alpha-v5.5

### Patch Changes

- Updated dependencies [[`8cc45d2af`](https://github.com/clerk/javascript/commit/8cc45d2af98320ccced3768fb039b86576e424a5), [`b4e79c1b9`](https://github.com/clerk/javascript/commit/b4e79c1b9ab8e14cbfccaf290f0f596da0416e13), [`c0a7455ac`](https://github.com/clerk/javascript/commit/c0a7455acfaa51dc77fa626f7fc48bbdfe388cbd), [`db2d82901`](https://github.com/clerk/javascript/commit/db2d829013722957332bcf03928685a4771f9a3c)]:
  - @clerk/clerk-react@5.0.0-alpha-v5.16
  - @clerk/shared@2.0.0-alpha-v5.10
  - @clerk/nextjs@5.0.0-alpha-v5.17

## 0.0.2-alpha-v5.4

### Patch Changes

- Updated dependencies [[`e9841dd91`](https://github.com/clerk/javascript/commit/e9841dd91897a7ebb468b14e272ce06154795389), [`59f9a7296`](https://github.com/clerk/javascript/commit/59f9a72968fb49add6d9031158c791ac60a161b9)]:
  - @clerk/clerk-react@5.0.0-alpha-v5.15
  - @clerk/nextjs@5.0.0-alpha-v5.16

## 0.0.2-alpha-v5.3

### Patch Changes

- Updated dependencies [[`1dc28ab46`](https://github.com/clerk/javascript/commit/1dc28ab46f6930074334be183c637ce7a81bebf7), [`ea4933655`](https://github.com/clerk/javascript/commit/ea4933655863ce315324aa2a3be7d5f263c2b61f), [`b67f6ab79`](https://github.com/clerk/javascript/commit/b67f6ab799c7a508a2cccd196cf4c551d4f2222e), [`38d8b3e8a`](https://github.com/clerk/javascript/commit/38d8b3e8a0387bcf0b9c8d16e3bbfcfe9b643ca2)]:
  - @clerk/shared@2.0.0-alpha-v5.9
  - @clerk/nextjs@5.0.0-alpha-v5.15
  - @clerk/clerk-react@5.0.0-alpha-v5.14

## 0.0.2-alpha-v5.2

### Patch Changes

- Updated dependencies [[`9a87eced3`](https://github.com/clerk/javascript/commit/9a87eced31c178b64914f19175c4408918baab14), [`7ecd6f6ab`](https://github.com/clerk/javascript/commit/7ecd6f6abb0e5bfb1a57c99cc11860de311c3e82)]:
  - @clerk/nextjs@5.0.0-alpha-v5.14
  - @clerk/shared@2.0.0-alpha-v5.8
  - @clerk/clerk-react@5.0.0-alpha-v5.13

## 0.0.2-alpha-v5.1

### Patch Changes

- Updated dependencies [[`cfea3d9c0`](https://github.com/clerk/javascript/commit/cfea3d9c00950eee8d7e942d88bee1a56a5f842b), [`fe2607b6f`](https://github.com/clerk/javascript/commit/fe2607b6fdeed83002db7e4a0c040ac0280e5ff7), [`2e4a43017`](https://github.com/clerk/javascript/commit/2e4a43017ef33b541949ba90e16bf5311ce8bc60), [`f5fb63cf1`](https://github.com/clerk/javascript/commit/f5fb63cf1dd51cd6cd0dba4d9eef871695ef06c3)]:
  - @clerk/clerk-react@5.0.0-alpha-v5.12

## 0.0.2-alpha-v5.0

### Patch Changes

- Updated dependencies [[`2a67f729d`](https://github.com/clerk/javascript/commit/2a67f729da58b3400df24da634fc4bf786065f25), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e)]:
  - @clerk/clerk-react@5.0.0-alpha-v5.11
