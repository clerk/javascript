# @clerk/astro

## 1.0.1

### Patch Changes

- Updated dependencies [[`b87f7b9e1`](https://github.com/clerk/javascript/commit/b87f7b9e163756fd43789bc7b7344d2eb24015ec), [`e1a8666b3`](https://github.com/clerk/javascript/commit/e1a8666b3e6dbd8d37905fbfeff2e65a17b0769d), [`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`c5d01525d`](https://github.com/clerk/javascript/commit/c5d01525d72f2b131441bfef90d1145b03be3d13), [`86c75e50c`](https://github.com/clerk/javascript/commit/86c75e50cba9c4efb480672f1b8c6a6fff4ef477)]:
  - @clerk/clerk-js@5.10.0
  - @clerk/backend@1.4.0
  - @clerk/shared@2.4.0
  - @clerk/types@4.9.0

## 1.0.0

### Major Changes

- Introduce the official Clerk SDK for Astro. ([#3743](https://github.com/clerk/javascript/pull/3743)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Allow for client side navigation inside UI components and improves the UX while navigating in components with path routing. ([#3734](https://github.com/clerk/javascript/pull/3734)) by [@panteliselef](https://github.com/panteliselef)

## 0.0.4

### Patch Changes

- Introduce `<ClerkLoaded/>` and `<ClerkLoading/>` React components ([#3724](https://github.com/clerk/javascript/pull/3724)) by [@wobsoriano](https://github.com/wobsoriano)

## 0.0.3

### Patch Changes

- Update existing env variables that is still using `PUBLIC_ASTRO_APP` prefix to `PUBLIC_`. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Move `@clerk/astro/components/*` to `@clerk/astro/components` by [@nikosdouvlis](https://github.com/nikosdouvlis)

  ```diff
  - import { UserProfile } from "@clerk/astro/components/interactive"
  + import { UserProfile } from "@clerk/astro/components"

  - import { Protect } from "@clerk/astro/components/control"
  + import { Protect } from "@clerk/astro/components"

  - import { SignInButton } from "@clerk/astro/components/unstyled"
  + import { SignInButton } from "@clerk/astro/components"
  ```

- Simplify submodules and drop the `bunlded` variant. by [@nikosdouvlis](https://github.com/nikosdouvlis)

  Moved

  - `@clerk/astro/client/react` to `@clerk/astro/react`
  - `@clerk/astro/client/stores` to `@clerk/astro/client`
    Dropped
  - `@clerk/astro/bundled`
  - `@clerk/astro/client/bundled`
  - `@clerk/astro/internal/bundled`
  - `@clerk/astro/integration`
  - `@clerk/astro/integration/bundled`

- Support `Astro.locals.auth().redirectToSignIn()` by [@nikosdouvlis](https://github.com/nikosdouvlis)

  This allows for redirectingToSignIn at the page level

- Add a reusable ID generation function by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Remove `@nanostores/react` from depedency. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Introduce `<AuthenticateWithRedirectCallback/>` as an Astro and as a React component by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7), [`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7)]:
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
