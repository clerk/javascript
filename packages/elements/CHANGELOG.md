# @clerk/elements

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
  <Step name='start'>Contents</Step>
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
