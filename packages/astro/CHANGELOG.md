# @clerk/astro

## 0.0.3

### Patch Changes

- Update existing env variables that is still using `PUBLIC_ASTRO_APP` prefix to `PUBLIC_`. ([#3707](https://github.com/clerk/javascript/pull/3707)) by [@wobsoriano](https://github.com/wobsoriano)

- Move `@clerk/astro/components/*` to `@clerk/astro/components` ([#3705](https://github.com/clerk/javascript/pull/3705)) by [@panteliselef](https://github.com/panteliselef)

  ```diff
  - import { UserProfile } from "@clerk/astro/components/interactive"
  + import { UserProfile } from "@clerk/astro/components"

  - import { Protect } from "@clerk/astro/components/control"
  + import { Protect } from "@clerk/astro/components"

  - import { SignInButton } from "@clerk/astro/components/unstyled"
  + import { SignInButton } from "@clerk/astro/components"
  ```

- Simplify submodules and drop the `bunlded` variant. ([#3701](https://github.com/clerk/javascript/pull/3701)) by [@panteliselef](https://github.com/panteliselef)

  Moved

  - `@clerk/astro/client/react` to `@clerk/astro/react`
  - `@clerk/astro/client/stores` to `@clerk/astro/client`
    Dropped
  - `@clerk/astro/bundled`
  - `@clerk/astro/client/bundled`
  - `@clerk/astro/internal/bundled`
  - `@clerk/astro/integration`
  - `@clerk/astro/integration/bundled`

- Support `Astro.locals.auth().redirectToSignIn()` ([#3711](https://github.com/clerk/javascript/pull/3711)) by [@panteliselef](https://github.com/panteliselef)

  This allows for redirectingToSignIn at the page level

- Add a reusable ID generation function ([#3698](https://github.com/clerk/javascript/pull/3698)) by [@wobsoriano](https://github.com/wobsoriano)

- Remove `@nanostores/react` from depedency. ([#3693](https://github.com/clerk/javascript/pull/3693)) by [@panteliselef](https://github.com/panteliselef)

- Introduce `<AuthenticateWithRedirectCallback/>` as an Astro and as a React component ([#3719](https://github.com/clerk/javascript/pull/3719)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`d11873579`](https://github.com/clerk/javascript/commit/d118735794ea24842498f67b304821656eb6dd52), [`0935cfce9`](https://github.com/clerk/javascript/commit/0935cfce9b69cb584886625267ddbc5367f7ae18)]:
  - @clerk/clerk-js@5.9.0
  - @clerk/types@4.8.0
  - @clerk/backend@1.3.2
  - @clerk/shared@2.3.3

## 0.0.2

### Patch Changes

- Add an Astro component and a React UI Component for Google One Tap. ([#3676](https://github.com/clerk/javascript/pull/3676)) by [@panteliselef](https://github.com/panteliselef)

- Add unstyled authentication button components for Astro and React integration ([#3656](https://github.com/clerk/javascript/pull/3656)) by [@wobsoriano](https://github.com/wobsoriano)

- Introduce a shared component for interactive components that handles UI mounting ([#3664](https://github.com/clerk/javascript/pull/3664)) by [@wobsoriano](https://github.com/wobsoriano)

- Improve stream processing performance ([#3673](https://github.com/clerk/javascript/pull/3673)) by [@wobsoriano](https://github.com/wobsoriano)

- Drop convenience Astro wrappers for React components ([#3682](https://github.com/clerk/javascript/pull/3682)) by [@wobsoriano](https://github.com/wobsoriano)

- Change prefix for public env variables to `PUBLIC_`. The previous prefix was `PUBLIC_ASTRO_APP_`. ([#3669](https://github.com/clerk/javascript/pull/3669)) by [@panteliselef](https://github.com/panteliselef)

  - After this change the publishable key from should be set as `PUBLIC_CLERK_PUBLISHABLE_KEY=xxxxx`

- Implement telemetry for nanostores and middleware usage; include SDK metadata. ([#3662](https://github.com/clerk/javascript/pull/3662)) by [@wobsoriano](https://github.com/wobsoriano)

- Bug fix: Removed import.meta from integration to avoid breaking app during build. ([#3675](https://github.com/clerk/javascript/pull/3675)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`09f905a89`](https://github.com/clerk/javascript/commit/09f905a8915a39179cbffb2149342ca138bedb77), [`6a98c084e`](https://github.com/clerk/javascript/commit/6a98c084e89afb3800edb3d0136c396e020be6b7), [`5642b2616`](https://github.com/clerk/javascript/commit/5642b26167a6eb1aca68777d782a9686edacfd37)]:
  - @clerk/clerk-js@5.8.1
  - @clerk/backend@1.3.1

## 0.0.1

### Patch Changes

- Introduce an experimental version of the official [Astro](https://astro.build/) SDK called `@clerk/astro` ([#3646](https://github.com/clerk/javascript/pull/3646)) by [@panteliselef](https://github.com/panteliselef)
