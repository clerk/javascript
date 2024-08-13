# @clerk/astro

## 1.0.12

### Patch Changes

- Introduce functions that can be reused across front-end SDKs ([#3849](https://github.com/clerk/javascript/pull/3849)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`1305967bf`](https://github.com/clerk/javascript/commit/1305967bfefe7da48a586c3f65cf53f751044eb6), [`7e0ced3da`](https://github.com/clerk/javascript/commit/7e0ced3da94f41056bc4445d163d3b615afb6ab1), [`def3a3894`](https://github.com/clerk/javascript/commit/def3a38948969bddc94a0b5a045ad63e2a97b8f3), [`b6f0613dc`](https://github.com/clerk/javascript/commit/b6f0613dc9d8b0bab41cfabbaa8621b126e3bdf5)]:
  - @clerk/clerk-js@5.14.1
  - @clerk/shared@2.5.1
  - @clerk/types@4.13.1
  - @clerk/backend@1.6.3

## 1.0.11

### Patch Changes

- Updated dependencies [[`59d5f19d3`](https://github.com/clerk/javascript/commit/59d5f19d333bf4a35c244886e93b4368e215225c), [`4e6c94e3f`](https://github.com/clerk/javascript/commit/4e6c94e3f4cc92cbba8bddcd2b90fcc9cfb83763)]:
  - @clerk/shared@2.5.0
  - @clerk/clerk-js@5.14.0
  - @clerk/types@4.13.0
  - @clerk/backend@1.6.2

## 1.0.10

### Patch Changes

- Internal change: Use `AuthObject` type import from `@clerk/backend`. ([#3844](https://github.com/clerk/javascript/pull/3844)) by [@kduprey](https://github.com/kduprey)

- Updated dependencies [[`d7bf0f87c`](https://github.com/clerk/javascript/commit/d7bf0f87c4c50bc19d2796bca32bd694046a23b0), [`9b2aeacb3`](https://github.com/clerk/javascript/commit/9b2aeacb32fff7c300bda458636a1cc81a42ee7b)]:
  - @clerk/backend@1.6.1
  - @clerk/clerk-js@5.13.2
  - @clerk/types@4.12.1
  - @clerk/shared@2.4.5

## 1.0.9

### Patch Changes

- Updated dependencies [[`069103c8f`](https://github.com/clerk/javascript/commit/069103c8fbdf25a03e0992dc5478ebeaeaf122ea)]:
  - @clerk/clerk-js@5.13.1

## 1.0.8

### Patch Changes

- Updated dependencies [[`7e94fcf0f`](https://github.com/clerk/javascript/commit/7e94fcf0fcbee8842a54f7931c45190370aa870d)]:
  - @clerk/backend@1.6.0
  - @clerk/clerk-js@5.13.0
  - @clerk/types@4.12.0
  - @clerk/shared@2.4.4

## 1.0.7

### Patch Changes

- Updated dependencies [[`568186cad`](https://github.com/clerk/javascript/commit/568186cad29acaf0b084a9f86ccb9d29bd23fcf4), [`407195270`](https://github.com/clerk/javascript/commit/407195270ed8aab6eef18c64a4918e3870fef471)]:
  - @clerk/clerk-js@5.12.0
  - @clerk/types@4.11.0
  - @clerk/backend@1.5.2
  - @clerk/shared@2.4.3

## 1.0.6

### Patch Changes

- Updated dependencies [[`992e5960c`](https://github.com/clerk/javascript/commit/992e5960c785eace83f3bad7c34d589fa313dcaf)]:
  - @clerk/backend@1.5.1

## 1.0.5

### Patch Changes

- Fixed a bug where the `<Protect />` component would not validate any properties passed ([#3846](https://github.com/clerk/javascript/pull/3846)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`fde5b5e7e`](https://github.com/clerk/javascript/commit/fde5b5e7e6fb5faa4267e06d82a38a176165b4f4), [`aa06f3ba7`](https://github.com/clerk/javascript/commit/aa06f3ba7e725071c90d4a1d6840060236da3c23), [`80e647731`](https://github.com/clerk/javascript/commit/80e64773135865434cf0e6c220e287397aa07937)]:
  - @clerk/backend@1.5.0
  - @clerk/clerk-js@5.11.0
  - @clerk/types@4.10.0
  - @clerk/shared@2.4.2

## 1.0.4

### Patch Changes

- Introduce option to opt-out of telemetry data collection ([#3808](https://github.com/clerk/javascript/pull/3808)) by [@wobsoriano](https://github.com/wobsoriano)

- Allow the handler of `clerkMiddleware` to return undefined. When undefined is returned, `clerkMiddleware` implicitly calls `await next()`. ([#3792](https://github.com/clerk/javascript/pull/3792)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`b48689705`](https://github.com/clerk/javascript/commit/b48689705f9fc2251d2f24addec7a0d0b1da0fe1), [`17bbe0199`](https://github.com/clerk/javascript/commit/17bbe01994beb9c5e53355cc692a5d71ddf4cc8c), [`4e61f8d27`](https://github.com/clerk/javascript/commit/4e61f8d2770907f48a53d530187a7b6de09f107e)]:
  - @clerk/clerk-js@5.10.2
  - @clerk/types@4.9.1
  - @clerk/backend@1.4.3
  - @clerk/shared@2.4.1

## 1.0.3

### Patch Changes

- Updated dependencies [[`d465d7069`](https://github.com/clerk/javascript/commit/d465d70696bf26270cb2efbf4695ca49016fcb96)]:
  - @clerk/backend@1.4.2

## 1.0.2

### Patch Changes

- Updated dependencies [[`045fb93cb`](https://github.com/clerk/javascript/commit/045fb93cbf577ca84e5b95fc6dfaacde67693be2)]:
  - @clerk/backend@1.4.1
  - @clerk/clerk-js@5.10.1

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
