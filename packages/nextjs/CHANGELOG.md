# Change Log

## 6.8.3

### Patch Changes

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/types@4.39.2
  - @clerk/backend@1.20.3
  - @clerk/clerk-react@5.19.3
  - @clerk/shared@2.19.4

## 6.8.2

### Patch Changes

- Updated dependencies [[`fe75ced8a7d8b8a28839430444588ee173b5230a`](https://github.com/clerk/javascript/commit/fe75ced8a7d8b8a28839430444588ee173b5230a), [`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/backend@1.20.2
  - @clerk/types@4.39.1
  - @clerk/clerk-react@5.19.2
  - @clerk/shared@2.19.3

## 6.8.1

### Patch Changes

- Updated dependencies [[`4cb22548da81dd8b186a6ef1cf120aea99c85c62`](https://github.com/clerk/javascript/commit/4cb22548da81dd8b186a6ef1cf120aea99c85c62)]:
  - @clerk/shared@2.19.2
  - @clerk/backend@1.20.1
  - @clerk/clerk-react@5.19.1

## 6.8.0

### Minor Changes

- A new **experimental** feature is available: "Keyless mode" ([#4602](https://github.com/clerk/javascript/pull/4602)) by [@panteliselef](https://github.com/panteliselef)

  Normally, in order to start a Clerk + Next.js application you need to provide a publishable key and secret key. With "Keyless mode" activated you no longer need to provide these two keys to start your Clerk application. These keys will be automatically generated and the application can be claimed with your account either through a UI prompt or with a URL in your terminal.

  **Requirements**:

  - You need to use Next.js `14.2.0` or later
  - You need to set the environment variable `NEXT_PUBLIC_CLERK_ENABLE_KEYLESS=true`

### Patch Changes

- Updated dependencies [[`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99), [`550c7e9851329688e37be29b83ea0c3b12482af7`](https://github.com/clerk/javascript/commit/550c7e9851329688e37be29b83ea0c3b12482af7), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99)]:
  - @clerk/backend@1.20.0
  - @clerk/clerk-react@5.19.0
  - @clerk/types@4.39.0
  - @clerk/shared@2.19.1

## 6.7.1

### Patch Changes

- Updated dependencies [[`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3), [`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3)]:
  - @clerk/shared@2.19.0
  - @clerk/types@4.38.0
  - @clerk/backend@1.19.2
  - @clerk/clerk-react@5.18.2

## 6.7.0

### Minor Changes

- Remove usage of `ezheaders` ([#4706](https://github.com/clerk/javascript/pull/4706)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Updated dependencies [[`4e5e7f463c12893a21cb3b5f9317fc3f2945879b`](https://github.com/clerk/javascript/commit/4e5e7f463c12893a21cb3b5f9317fc3f2945879b)]:
  - @clerk/types@4.37.0
  - @clerk/backend@1.19.1
  - @clerk/clerk-react@5.18.1
  - @clerk/shared@2.18.1

## 6.6.0

### Minor Changes

- Drop path routing requirement for `<CreateOrganization/>`. ([#4687](https://github.com/clerk/javascript/pull/4687)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`8ee5d84995fa17532491ff96efac5738c9bcd9ef`](https://github.com/clerk/javascript/commit/8ee5d84995fa17532491ff96efac5738c9bcd9ef), [`09fedd1df155d30cc055ce701b133aa6470e9b47`](https://github.com/clerk/javascript/commit/09fedd1df155d30cc055ce701b133aa6470e9b47), [`b6aa589f75be62a89a3853d496176ed2f2c0e2c5`](https://github.com/clerk/javascript/commit/b6aa589f75be62a89a3853d496176ed2f2c0e2c5), [`235eaae4c3c9400492fca47d20a47c7081041565`](https://github.com/clerk/javascript/commit/235eaae4c3c9400492fca47d20a47c7081041565)]:
  - @clerk/types@4.36.0
  - @clerk/clerk-react@5.18.0
  - @clerk/backend@1.19.0
  - @clerk/shared@2.18.0

## 6.5.2

### Patch Changes

- Warn for deprecated support for `13.x` and `14.0.x` Next.js versions. ([#4657](https://github.com/clerk/javascript/pull/4657)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d), [`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d)]:
  - @clerk/types@4.35.1
  - @clerk/backend@1.18.1
  - @clerk/clerk-react@5.17.2
  - @clerk/shared@2.17.1

## 6.5.1

### Patch Changes

- - Re-export `isClerkRuntimeError` from `@clerk/clerk-react/errors`. ([#4656](https://github.com/clerk/javascript/pull/4656)) by [@panteliselef](https://github.com/panteliselef)

  - Fixes and issue where `isClerkAPIError` would only exist in the client bundle.

- Updated dependencies [[`115fd0c32443c6fc4e692c0ebdd60c092e57057e`](https://github.com/clerk/javascript/commit/115fd0c32443c6fc4e692c0ebdd60c092e57057e), [`0a1807552dcf0501a97f60b4df0280525bca9743`](https://github.com/clerk/javascript/commit/0a1807552dcf0501a97f60b4df0280525bca9743)]:
  - @clerk/clerk-react@5.17.1

## 6.5.0

### Minor Changes

- Introduce the `useReverification()` hook that handles the session reverification flow: ([#4536](https://github.com/clerk/javascript/pull/4536)) by [@panteliselef](https://github.com/panteliselef)

  - Replaces `__experimental_useReverification` with `useReverification`
    Also replaces the following APIs:
  - `____experimental_reverificationError` -> `__reverificationError`
  - `__experimental_reverificationErrorResponse` -> `reverificationErrorResponse`

### Patch Changes

- Updated dependencies [[`4da28fa857d1e5538eb5bbe28ecc4bf9dba1ce7d`](https://github.com/clerk/javascript/commit/4da28fa857d1e5538eb5bbe28ecc4bf9dba1ce7d), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`d84d7e31235c5c7da3415981dc76db4473a71a39`](https://github.com/clerk/javascript/commit/d84d7e31235c5c7da3415981dc76db4473a71a39), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`dce4f7ffca7248c0500f0ec9a978672b1f2fad69`](https://github.com/clerk/javascript/commit/dce4f7ffca7248c0500f0ec9a978672b1f2fad69)]:
  - @clerk/clerk-react@5.17.0
  - @clerk/shared@2.17.0
  - @clerk/types@4.35.0
  - @clerk/backend@1.18.0

## 6.4.2

### Patch Changes

- Updated dependencies [[`c70994b5b6f92a6550dfe37547f01bbfa810c223`](https://github.com/clerk/javascript/commit/c70994b5b6f92a6550dfe37547f01bbfa810c223), [`7623a99594e7329200b6b374e483152d7679ce66`](https://github.com/clerk/javascript/commit/7623a99594e7329200b6b374e483152d7679ce66)]:
  - @clerk/types@4.34.2
  - @clerk/backend@1.17.2
  - @clerk/clerk-react@5.16.2
  - @clerk/shared@2.16.1

## 6.4.1

### Patch Changes

- Updated dependencies [[`e47eb5882a7fd4a8dee25933c6644790d6ea3407`](https://github.com/clerk/javascript/commit/e47eb5882a7fd4a8dee25933c6644790d6ea3407), [`273d16cb0665d4d960838cb294dc356f41814745`](https://github.com/clerk/javascript/commit/273d16cb0665d4d960838cb294dc356f41814745), [`6b0961765e1f3d09679be4b163fa13ac7dd97191`](https://github.com/clerk/javascript/commit/6b0961765e1f3d09679be4b163fa13ac7dd97191)]:
  - @clerk/clerk-react@5.16.1
  - @clerk/shared@2.16.0
  - @clerk/types@4.34.1
  - @clerk/backend@1.17.1

## 6.4.0

### Minor Changes

- Rename `reverificationMismatch` to `reverificationError`. ([#4582](https://github.com/clerk/javascript/pull/4582)) by [@panteliselef](https://github.com/panteliselef)

- Add `initialValues` option to `<SignUpButton />` component. ([#4567](https://github.com/clerk/javascript/pull/4567)) by [@alexcarpenter](https://github.com/alexcarpenter)

### Patch Changes

- Removing error in dev when useAuth() is not wrapped in <ClerkProvider dynamic /> ([#4588](https://github.com/clerk/javascript/pull/4588)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`536fa996ff84a545678a3036b28409824d1c00dd`](https://github.com/clerk/javascript/commit/536fa996ff84a545678a3036b28409824d1c00dd), [`b2671affd230eed176ac03af516307898d371757`](https://github.com/clerk/javascript/commit/b2671affd230eed176ac03af516307898d371757), [`b28c5e8bc44885bf6b1533df48e872ba90c387da`](https://github.com/clerk/javascript/commit/b28c5e8bc44885bf6b1533df48e872ba90c387da), [`6c424e179850f520ae738e816bf0423a55ddf3ef`](https://github.com/clerk/javascript/commit/6c424e179850f520ae738e816bf0423a55ddf3ef)]:
  - @clerk/backend@1.17.0
  - @clerk/shared@2.15.0
  - @clerk/clerk-react@5.16.0

## 6.3.4

### Patch Changes

- Updated dependencies [[`46faeb6f59b19c963fb137c858347525b1cd9e19`](https://github.com/clerk/javascript/commit/46faeb6f59b19c963fb137c858347525b1cd9e19), [`ea6c52dd751abe38b350ee07f148652c24125e22`](https://github.com/clerk/javascript/commit/ea6c52dd751abe38b350ee07f148652c24125e22)]:
  - @clerk/shared@2.14.0
  - @clerk/types@4.34.0
  - @clerk/backend@1.16.4
  - @clerk/clerk-react@5.15.5

## 6.3.3

### Patch Changes

- Updated dependencies [[`1c0b5001f7f975a2f3f54ad692526ecf7257847e`](https://github.com/clerk/javascript/commit/1c0b5001f7f975a2f3f54ad692526ecf7257847e), [`6217a3f7c94311d49f873214bd406961e0b8d6f7`](https://github.com/clerk/javascript/commit/6217a3f7c94311d49f873214bd406961e0b8d6f7), [`1783025cdb94c447028704c2121fa0b8af785904`](https://github.com/clerk/javascript/commit/1783025cdb94c447028704c2121fa0b8af785904)]:
  - @clerk/types@4.33.0
  - @clerk/shared@2.13.0
  - @clerk/backend@1.16.3
  - @clerk/clerk-react@5.15.4

## 6.3.2

### Patch Changes

- Updated dependencies [[`ff4ebeba6c2a77c247a946070b56bdb2153d1588`](https://github.com/clerk/javascript/commit/ff4ebeba6c2a77c247a946070b56bdb2153d1588)]:
  - @clerk/backend@1.16.2

## 6.3.1

### Patch Changes

- Updated dependencies [[`7dbad4c5abd226d7b10941a626ead5d85b1a3f24`](https://github.com/clerk/javascript/commit/7dbad4c5abd226d7b10941a626ead5d85b1a3f24)]:
  - @clerk/types@4.32.0
  - @clerk/backend@1.16.1
  - @clerk/clerk-react@5.15.3
  - @clerk/shared@2.12.1

## 6.3.0

### Minor Changes

- Introduce experimental verification helpers exported from `@clerk/nextjs/server` ([#4480](https://github.com/clerk/javascript/pull/4480)) by [@panteliselef](https://github.com/panteliselef)

  - \_\_experimental_reverificationMismatch
  - \_\_experimental_reverificationMismatchResponse

### Patch Changes

- Fixes issues in `ClerkRouter` that were causing inaccurate pathnames within Elements flows. Also fixes a dependency issue where `@clerk/elements` was pulling in the wrong version of `@clerk/shared`. ([#4513](https://github.com/clerk/javascript/pull/4513)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Add timestamp to debug logger output. ([#4479](https://github.com/clerk/javascript/pull/4479)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`b185e42e5136de3511a0b37ce9b0030022ba679e`](https://github.com/clerk/javascript/commit/b185e42e5136de3511a0b37ce9b0030022ba679e), [`5a21de1f46df3642828dc27e4862263c9858da2b`](https://github.com/clerk/javascript/commit/5a21de1f46df3642828dc27e4862263c9858da2b), [`f7472e22877f62fc7f3c8d3efe409ff2276fb4a3`](https://github.com/clerk/javascript/commit/f7472e22877f62fc7f3c8d3efe409ff2276fb4a3), [`e10232c56551bf0cffc11246f2ff9aa58ec584d7`](https://github.com/clerk/javascript/commit/e10232c56551bf0cffc11246f2ff9aa58ec584d7), [`e199037b8f484abdeeb9fc24455a1b4b8c31c8dd`](https://github.com/clerk/javascript/commit/e199037b8f484abdeeb9fc24455a1b4b8c31c8dd), [`886e294a8d8c54b39cd5bda88d46b89eace3861e`](https://github.com/clerk/javascript/commit/886e294a8d8c54b39cd5bda88d46b89eace3861e), [`0e443ad7c76643420b50e5b169193e03f6ef79f9`](https://github.com/clerk/javascript/commit/0e443ad7c76643420b50e5b169193e03f6ef79f9), [`cc24c8145f1eea7fb91550f2c3e0bac3993e4320`](https://github.com/clerk/javascript/commit/cc24c8145f1eea7fb91550f2c3e0bac3993e4320)]:
  - @clerk/backend@1.16.0
  - @clerk/shared@2.12.0
  - @clerk/types@4.31.0
  - @clerk/clerk-react@5.15.2

## 6.2.1

### Patch Changes

- Updated dependencies [[`8a04ae47b8305f994b348301fd8134d5baf02943`](https://github.com/clerk/javascript/commit/8a04ae47b8305f994b348301fd8134d5baf02943)]:
  - @clerk/clerk-react@5.15.1
  - @clerk/shared@2.11.5
  - @clerk/backend@1.15.7

## 6.2.0

### Minor Changes

- New Feature: Introduce the `<Waitlist />` component and the `waitlist` sign up mode. ([#4376](https://github.com/clerk/javascript/pull/4376)) by [@nikospapcom](https://github.com/nikospapcom)

  - Allow users to request access with an email address via the new `<Waitlist />` component.
  - Show `Join waitlist` prompt from `<SignIn />` component when mode is `waitlist`.
  - Appropriate the text in the Sign Up component when mode is `waitlist`.
  - Added `joinWaitlist()` method in `Clerk` singleton.
  - Added `redirectToWaitlist()` method in `Clerk` singleton to allow user to redirect to waitlist page.

### Patch Changes

- Fixes an issue where Next.js cache invalidation was incorrectly setting a cookie. ([#4478](https://github.com/clerk/javascript/pull/4478)) by [@BRKalow](https://github.com/BRKalow)

- Fix issue within `<ClerkProvider />` where the window object is possibly undefined. ([#4476](https://github.com/clerk/javascript/pull/4476)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`d74a6a7c0f291104c6bba722a8c432814d7b336e`](https://github.com/clerk/javascript/commit/d74a6a7c0f291104c6bba722a8c432814d7b336e), [`1a0c8fe665869e732d3c800bde0f5219fce54301`](https://github.com/clerk/javascript/commit/1a0c8fe665869e732d3c800bde0f5219fce54301), [`0800fc3f1f4e1b6a1d13f5c02557001a283af6e8`](https://github.com/clerk/javascript/commit/0800fc3f1f4e1b6a1d13f5c02557001a283af6e8)]:
  - @clerk/clerk-react@5.15.0
  - @clerk/types@4.30.0
  - @clerk/shared@2.11.4
  - @clerk/backend@1.15.6

## 6.1.3

### Patch Changes

- Fix static analysis warnings warning during production NextJS builds by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updates broken Clerk documentation references by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`a7726cc12a824b278f6d2a37cb1901c38c5f70dc`](https://github.com/clerk/javascript/commit/a7726cc12a824b278f6d2a37cb1901c38c5f70dc)]:
  - @clerk/shared@2.11.3
  - @clerk/backend@1.15.5
  - @clerk/clerk-react@5.14.3

## 6.1.0

### Minor Changes

- Bug fix: For next>=14 applications resolve `__unstable__onBeforeSetActive` once `invalidateCacheAction` resolves. ([#4362](https://github.com/clerk/javascript/pull/4362)) by [@panteliselef](https://github.com/panteliselef)

- Introduce a new experimental hook called `useReverification` that makes it easy to handle reverification errors. ([#4362](https://github.com/clerk/javascript/pull/4362)) by [@panteliselef](https://github.com/panteliselef)

  It returns a high order function (HOF) and allows developers to wrap any function that triggers a fetch request which might fail due to a user's session verification status.
  When such error is returned, the recommended UX is to offer a way to the user to recover by re-verifying their credentials.
  This helper will automatically handle this flow in the developer's behalf, by displaying a modal the end-user can interact with.
  Upon completion, the original request that previously failed, will be retried (only once).

  Example with clerk-js methods.

  ```tsx
  import { __experimental_useReverification as useReverification } from '@clerk/nextjs';

  function DeleteAccount() {
    const { user } = useUser();
    const [deleteUserAccount] = useReverification(() => {
      if (!user) return;
      return user.delete();
    });

    return (
      <>
        <button
          onClick={async () => {
            await deleteUserAccount();
          }}
        >
          Delete account
        </button>
      </>
    );
  }
  ```

- Replace `next/headers` with `ezheaders` ([#4392](https://github.com/clerk/javascript/pull/4392)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Fixes a bug where `<ClerkProvider dynamic>` would error when rendered in a Next.js 13 application using the App Router. ([#4421](https://github.com/clerk/javascript/pull/4421)) by [@BRKalow](https://github.com/BRKalow)

- Updating peerDependencies for correct ranges ([#4436](https://github.com/clerk/javascript/pull/4436)) by [@jacekradko](https://github.com/jacekradko)

- Updated dependencies [[`69c8f4f21`](https://github.com/clerk/javascript/commit/69c8f4f21410b3db95ac11a23a2b3d1277981bcf), [`f875463da`](https://github.com/clerk/javascript/commit/f875463da9692f2d173b6d5388743cf720750ae3), [`41f2ede56`](https://github.com/clerk/javascript/commit/41f2ede56c82c97df509c5a28b7637862121b935), [`5be7ca9fd`](https://github.com/clerk/javascript/commit/5be7ca9fd239c937cc88e20ce8f5bfc9f3b84f22), [`08c5a2add`](https://github.com/clerk/javascript/commit/08c5a2add6872c76e62fc0df06db723e3728452e), [`08c5a2add`](https://github.com/clerk/javascript/commit/08c5a2add6872c76e62fc0df06db723e3728452e), [`24cd77989`](https://github.com/clerk/javascript/commit/24cd77989adb45a11db12627daa3f31e8d9338e4), [`434b432f8`](https://github.com/clerk/javascript/commit/434b432f8c114825120eef0f2c278b8142ed1563)]:
  - @clerk/clerk-react@5.14.0
  - @clerk/types@4.29.0
  - @clerk/shared@2.11.0
  - @clerk/backend@1.15.2

## 6.0.2

### Patch Changes

- Bug fix: Include protect types in `auth` ([#4398](https://github.com/clerk/javascript/pull/4398)) by [@panteliselef](https://github.com/panteliselef)

## 6.0.1

### Patch Changes

- Await usage of cookies() and ensure the return value of the server action is valid. ([#4396](https://github.com/clerk/javascript/pull/4396)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`3fdcdbf88`](https://github.com/clerk/javascript/commit/3fdcdbf88c38facf8b82563f634ec1b6604fd8e5), [`1c7e105a3`](https://github.com/clerk/javascript/commit/1c7e105a32fd492cc175ef9fd1c1fa0428c259dc)]:
  - @clerk/types@4.28.0
  - @clerk/backend@1.15.1
  - @clerk/clerk-react@5.13.1
  - @clerk/shared@2.10.1

## 6.0.0

### Major Changes

- Stop `<ClerkProvider>` from opting applications into dynamic rendering. A new prop, `<ClerkProvider dynamic>` can be used to opt-in to dynamic rendering and make auth data available during server-side rendering. The RSC `auth()` helper should be preferred for accessing auth data during dynamic rendering. ([#4366](https://github.com/clerk/javascript/pull/4366)) by [@jacekradko](https://github.com/jacekradko)

- @clerk/nextjs: Converting auth() and clerkClient() interfaces to be async ([#4366](https://github.com/clerk/javascript/pull/4366)) by [@jacekradko](https://github.com/jacekradko)

  @clerk/upgrade: Adding required codemod for @clerk/nextjs breaking changes

  # Migration guide

  ## `auth()` is now async

  Previously the `auth()` method from `@clerk/nextjs/server` was synchronous.

  ```typescript
  import { auth } from '@clerk/nextjs/server';

  export function GET() {
    const { userId } = auth();
    return new Response(JSON.stringify({ userId }));
  }
  ```

  The `auth` method now becomes asynchronous. You will need to make the following changes to the snippet above to make it compatible.

  ```diff
  - export function GET() {
  + export async function GET() {
  -   const { userId } = auth();
  +   const { userId } = await auth();
    return new Response(JSON.stringify({ userId }));
  }
  ```

  ## Clerk middleware auth is now async

  ```typescript
  import { clerkClient, clerkMiddleware } from '@clerk/nextjs/server';
  import { NextResponse } from 'next/server';

  export default clerkMiddleware(async (auth, request) => {
    const resolvedAuth = await auth();

    const count = await resolvedAuth.users.getCount();

    if (count) {
      return NextResponse.redirect(new URL('/new-url', request.url));
    }
  });

  export const config = {
    matcher: [...],
  };
  ```

  ## clerkClient() is now async

  Previously the `clerkClient()` method from `@clerk/nextjs/server` was synchronous.

  ```typescript
  import { clerkClient, clerkMiddleware } from '@clerk/nextjs/server';
  import { NextResponse } from 'next/server';

  export default clerkMiddleware((auth, request) => {
    const client = clerkClient();

    const count = await client.users?.getCount();

    if (count) {
      return NextResponse.redirect(new URL('/new-url', request.url));
    }
  });

  export const config = {
    matcher: [...],
  };
  ```

  The method now becomes async. You will need to make the following changes to the snippet above to make it compatible.

  ```diff
  - export default clerkMiddleware((auth, request) => {
  - const client = clerkClient();
  + export default clerkMiddleware(async (auth, request) => {
  + const client = await clerkClient();
    const count = await client.users?.getCount();

    if (count) {
  }
  ```

- Support `unstable_rethrow` inside `clerkMiddleware`. ([#4366](https://github.com/clerk/javascript/pull/4366)) by [@jacekradko](https://github.com/jacekradko)

  We changed the errors thrown by `protect()` inside `clerkMiddleware` in order for `unstable_rethrow` to recognise them and rethrow them.

- Removes deprecated APIs: `authMiddleware()`, `redirectToSignIn()`, and `redirectToSignUp()`. See the migration guide to learn how to update your usage. ([#4366](https://github.com/clerk/javascript/pull/4366)) by [@jacekradko](https://github.com/jacekradko)

### Minor Changes

- Bug fix: Correctly redirect to sign in page in Next 15. ([#4383](https://github.com/clerk/javascript/pull/4383)) by [@panteliselef](https://github.com/panteliselef)

- Add experimental support for new UI components ([#4114](https://github.com/clerk/javascript/pull/4114)) by [@BRKalow](https://github.com/BRKalow)

### Patch Changes

- Updated dependencies [[`93dfe7a09`](https://github.com/clerk/javascript/commit/93dfe7a09648f414ee3f50bc8fb3f342d24020cd), [`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc), [`a0204a8e8`](https://github.com/clerk/javascript/commit/a0204a8e8742b63aea92d67e7d66fe0bc86a166f), [`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc)]:
  - @clerk/backend@1.15.0
  - @clerk/shared@2.10.0
  - @clerk/types@4.27.0
  - @clerk/clerk-react@5.13.0

## 5.7.5

### Patch Changes

- Updated dependencies [[`e1a26547a`](https://github.com/clerk/javascript/commit/e1a26547a9c65f4c79c2bbd4dc386ddf67c2fbee)]:
  - @clerk/backend@1.14.1

## 5.7.4

### Patch Changes

- Updated dependencies [[`ce40ff6f0`](https://github.com/clerk/javascript/commit/ce40ff6f0d3bc79e33375be6dd5e03f140a07000), [`e81d45b72`](https://github.com/clerk/javascript/commit/e81d45b72c81403c7c206dac5454de1fef6bec57), [`752ce9bfa`](https://github.com/clerk/javascript/commit/752ce9bfa47a8eebd38cd272eeb58ae26fea3371), [`99cdf9b67`](https://github.com/clerk/javascript/commit/99cdf9b67d1e99e66cc73d8a5bfce1f1f8df1b83), [`ce40ff6f0`](https://github.com/clerk/javascript/commit/ce40ff6f0d3bc79e33375be6dd5e03f140a07000), [`fb7ba1f34`](https://github.com/clerk/javascript/commit/fb7ba1f3485abdeac5e504cce6c2d84d3f3e4ffc), [`2102052c0`](https://github.com/clerk/javascript/commit/2102052c017065ab511339870fcebaa6719f2702)]:
  - @clerk/clerk-react@5.12.0
  - @clerk/types@4.26.0
  - @clerk/shared@2.9.2
  - @clerk/backend@1.14.0

## 5.7.3

### Patch Changes

- Updated dependencies [[`d64e54c40`](https://github.com/clerk/javascript/commit/d64e54c40c9cf001b25e45a1b8939c9f7e80c6d6), [`2ba2fd148`](https://github.com/clerk/javascript/commit/2ba2fd1483b7561d7df9a1952ead0ee15e422131)]:
  - @clerk/shared@2.9.1
  - @clerk/types@4.25.1
  - @clerk/backend@1.13.10
  - @clerk/clerk-react@5.11.1

## 5.7.2

### Patch Changes

- Introduces `organizationSyncOptions` option to `clerkMiddleware`, which syncs an active organization or personal account from a URL to the Clerk session. ([#3977](https://github.com/clerk/javascript/pull/3977)) by [@izaaklauer](https://github.com/izaaklauer)

- Updated dependencies [[`358be296a`](https://github.com/clerk/javascript/commit/358be296a8181bb256fc1e15f878932c741b8743)]:
  - @clerk/backend@1.13.9

## 5.7.1

### Patch Changes

- Updated dependencies [[`fb932e5cf`](https://github.com/clerk/javascript/commit/fb932e5cf21315adf60bee0855b6bd5ee2ff9867)]:
  - @clerk/shared@2.9.0
  - @clerk/clerk-react@5.11.0
  - @clerk/types@4.25.0
  - @clerk/backend@1.13.8

## 5.7.0

### Minor Changes

- Drop the experimental mounted variant of `UserVerification`. ([#4266](https://github.com/clerk/javascript/pull/4266)) by [@panteliselef](https://github.com/panteliselef)

  Removes:

  - `<__experimental_UserVerification/>`
  - `__experimental_mountUserVerification()`
  - `__experimental_unmountUserVerification()`

### Patch Changes

- Updated dependencies [[`f6fb8b53d`](https://github.com/clerk/javascript/commit/f6fb8b53d236863ad7eca576ee7a16cd33f3506b), [`4a8570590`](https://github.com/clerk/javascript/commit/4a857059059a02bb4f20893e08601e1e67babbed)]:
  - @clerk/clerk-react@5.10.0
  - @clerk/types@4.24.0
  - @clerk/backend@1.13.7
  - @clerk/shared@2.8.5

## 5.6.4

### Patch Changes

- Updated dependencies [[`3e9160072`](https://github.com/clerk/javascript/commit/3e9160072aea72455a3db9cc710680a0a5359c55), [`748c0bae4`](https://github.com/clerk/javascript/commit/748c0bae4cfa1c2a721267fc9de7c6458200beb4), [`b579c3685`](https://github.com/clerk/javascript/commit/b579c36850126d994a96affa89bb1abc618ec38e)]:
  - @clerk/backend@1.13.6

## 5.6.3

### Patch Changes

- Updated dependencies [[`4749ed4c5`](https://github.com/clerk/javascript/commit/4749ed4c55a5ba5810451b8d436aad0d49829050), [`f1f17eaab`](https://github.com/clerk/javascript/commit/f1f17eaabed0dc4b7de405fb77d85503cf75ad33), [`2e35ac538`](https://github.com/clerk/javascript/commit/2e35ac53885f8008779940d41d1e804fa77ebfa9)]:
  - @clerk/backend@1.13.5
  - @clerk/types@4.23.0
  - @clerk/clerk-react@5.9.4
  - @clerk/shared@2.8.4

## 5.6.2

### Patch Changes

- Updated dependencies [[`c9063853e`](https://github.com/clerk/javascript/commit/c9063853e538a4010f5d4e522a3da5abc80098a4), [`19d3808d4`](https://github.com/clerk/javascript/commit/19d3808d4672234944226d6709ec51214e8d6e1d), [`737bcbb0f`](https://github.com/clerk/javascript/commit/737bcbb0ffb5e2dcadbb02e8fc718fe8825c5842)]:
  - @clerk/types@4.22.0
  - @clerk/backend@1.13.4
  - @clerk/clerk-react@5.9.3
  - @clerk/shared@2.8.3

## 5.6.1

### Patch Changes

- Updated dependencies [[`cb32aaf59`](https://github.com/clerk/javascript/commit/cb32aaf59d38dcd12e959f542782f71a87adf9c1), [`2e5c550e4`](https://github.com/clerk/javascript/commit/2e5c550e4aec61150c2a17fdcd4a0e1273cb50e7), [`6275c242c`](https://github.com/clerk/javascript/commit/6275c242cd8bcb6f7766934059967e0fe775a0c1), [`418be2fdb`](https://github.com/clerk/javascript/commit/418be2fdb558bb5c85d7be491945935b44cad681), [`c59636a1a`](https://github.com/clerk/javascript/commit/c59636a1aca67be7d6732d281cec307ed456678b), [`5c18671f1`](https://github.com/clerk/javascript/commit/5c18671f158f8077f822877ce5c1fa192199aeda), [`f9faaf031`](https://github.com/clerk/javascript/commit/f9faaf03100baf679c78e6c24877fbf3b60be529), [`e0ca9dc94`](https://github.com/clerk/javascript/commit/e0ca9dc94fa68f3d3db5d2433fa6b85d800d4ca2)]:
  - @clerk/shared@2.8.2
  - @clerk/clerk-react@5.9.2
  - @clerk/types@4.21.1
  - @clerk/backend@1.13.3

## 5.6.0

### Minor Changes

- Allows access to request object to dynamically define `clerkMiddleware` options ([#4160](https://github.com/clerk/javascript/pull/4160)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Updated dependencies [[`02babaccb`](https://github.com/clerk/javascript/commit/02babaccb648fa4e22f38cc0f572d44f82b09f78)]:
  - @clerk/backend@1.13.2

## 5.5.5

### Patch Changes

- Updated dependencies [[`3743eb911`](https://github.com/clerk/javascript/commit/3743eb9114733f20ed56a863ab98fa9c363b6723)]:
  - @clerk/shared@2.8.1
  - @clerk/backend@1.13.1
  - @clerk/clerk-react@5.9.1

## 5.5.4

### Patch Changes

- Updated dependencies [[`e578b1599`](https://github.com/clerk/javascript/commit/e578b1599451d9f2122f12d835b510b26882e839)]:
  - @clerk/backend@1.13.0

## 5.5.3

### Patch Changes

- Updated dependencies [[`ba19be354`](https://github.com/clerk/javascript/commit/ba19be35461f0e5c76a58d11e4252a16781322c6), [`8cecbe875`](https://github.com/clerk/javascript/commit/8cecbe8756f58879c4b14b799700a25a83c1f00a), [`248142a6d`](https://github.com/clerk/javascript/commit/248142a6ded6ca937d0df7d628197f25228aadec), [`1189f71f8`](https://github.com/clerk/javascript/commit/1189f71f872f2683c12de5add5f154aeb953ca8d), [`a5e95295b`](https://github.com/clerk/javascript/commit/a5e95295b88acc6953d07a22d818e123774aeffa)]:
  - @clerk/shared@2.8.0
  - @clerk/backend@1.12.0
  - @clerk/clerk-react@5.9.0
  - @clerk/types@4.21.0

## 5.5.2

### Patch Changes

- Vendor path-to-regexp ([#4145](https://github.com/clerk/javascript/pull/4145)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`be3b119f8`](https://github.com/clerk/javascript/commit/be3b119f840d2ae74f4b75d717711d53ac0e5f54)]:
  - @clerk/shared@2.7.2
  - @clerk/backend@1.11.1
  - @clerk/clerk-react@5.8.2

## 5.5.1

### Patch Changes

- Updated dependencies [[`b97b2c1ca`](https://github.com/clerk/javascript/commit/b97b2c1cae5cb1e569708a8745c13d203beb81d9), [`8c6909d46`](https://github.com/clerk/javascript/commit/8c6909d46328c943f1d464a28f1a324a27d0f3f1)]:
  - @clerk/backend@1.11.0
  - @clerk/clerk-react@5.8.1
  - @clerk/types@4.20.1
  - @clerk/shared@2.7.1

## 5.5.0

### Minor Changes

- Remove `@clerk/elements` reliance on `next` and `@clerk/clerk-react` directly. The host router is now provided by `@clerk/nextjs`. ([#4064](https://github.com/clerk/javascript/pull/4064)) by [@BRKalow](https://github.com/BRKalow)

### Patch Changes

- Add support for `basePath` config property ([#4063](https://github.com/clerk/javascript/pull/4063)) by [@dstaley](https://github.com/dstaley)

- Updated dependencies [[`c63a5adf0`](https://github.com/clerk/javascript/commit/c63a5adf0ba4b99252146f168318f51b709bb5dd), [`8823c21a2`](https://github.com/clerk/javascript/commit/8823c21a26bc81cbc3ed007908b1a9ea474bd343), [`95ac67a14`](https://github.com/clerk/javascript/commit/95ac67a143c263bef0c1f589728566ab8f95768d), [`a0cb062fa`](https://github.com/clerk/javascript/commit/a0cb062faa4d23bef7a577e5cc486f4c5efe6bfa), [`746b4ed5e`](https://github.com/clerk/javascript/commit/746b4ed5e2007505d5850a2a728484809474d7bf)]:
  - @clerk/backend@1.10.0
  - @clerk/clerk-react@5.8.0
  - @clerk/types@4.20.0
  - @clerk/shared@2.7.0

## 5.4.1

### Patch Changes

- Updated dependencies [[`8a3b9f079`](https://github.com/clerk/javascript/commit/8a3b9f0793484b32dd609a5c80a194e62151d6ea), [`e95c28196`](https://github.com/clerk/javascript/commit/e95c2819675cea7963f2404e5f71f37ebed8d5e0), [`1fe744328`](https://github.com/clerk/javascript/commit/1fe744328d126bc597e81770119796ac18e055ed)]:
  - @clerk/clerk-react@5.7.0
  - @clerk/types@4.19.0
  - @clerk/backend@1.9.2
  - @clerk/shared@2.6.2

## 5.4.0

### Minor Changes

- Add `<__experimental_UserVerification />` component. This is an experimental feature and breaking changes can occur until it's marked as stable. ([#4016](https://github.com/clerk/javascript/pull/4016)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733), [`82593173a`](https://github.com/clerk/javascript/commit/82593173aafbf6646e12c5779627cdcb138a1f27), [`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733)]:
  - @clerk/clerk-react@5.6.0
  - @clerk/types@4.18.0
  - @clerk/backend@1.9.1
  - @clerk/shared@2.6.1

## 5.3.7

### Patch Changes

- Tidy up and improve README ([#4053](https://github.com/clerk/javascript/pull/4053)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`c9ef59106`](https://github.com/clerk/javascript/commit/c9ef59106c4720af3012586f5656f7b54cf2e336), [`fece72014`](https://github.com/clerk/javascript/commit/fece72014e2d39c8343a7329ae677badcba56d15), [`58e6754ad`](https://github.com/clerk/javascript/commit/58e6754ad9f9a1244b023ce1f5e5f2c1c4eb20e7), [`13693018f`](https://github.com/clerk/javascript/commit/13693018f4f7ac5d224698aa730e20960896f68c), [`3aa63dc5a`](https://github.com/clerk/javascript/commit/3aa63dc5a48161cfe92d94093ef0c32efd401342), [`9d0477781`](https://github.com/clerk/javascript/commit/9d04777814bf6d86d05506838b101e7cfc7c208d), [`3304dcc0b`](https://github.com/clerk/javascript/commit/3304dcc0bc93a92a7f729f585c60ff91d2ae04f6)]:
  - @clerk/backend@1.9.0
  - @clerk/clerk-react@5.5.0
  - @clerk/types@4.17.0
  - @clerk/shared@2.6.0

## 5.3.6

### Patch Changes

- Updated dependencies [[`c1389492d`](https://github.com/clerk/javascript/commit/c1389492d8b6a9292ab04889bf776c0f45e66845)]:
  - @clerk/types@4.16.0
  - @clerk/backend@1.8.3
  - @clerk/clerk-react@5.4.5
  - @clerk/shared@2.5.5

## 5.3.5

### Patch Changes

- Updated dependencies [[`0158c774a`](https://github.com/clerk/javascript/commit/0158c774af2243a2cd13b55c4d6fae877178c961), [`8be1a7abc`](https://github.com/clerk/javascript/commit/8be1a7abc8849d7d59552011bd6b25bc917d51f5)]:
  - @clerk/types@4.15.1
  - @clerk/backend@1.8.2
  - @clerk/clerk-react@5.4.4
  - @clerk/shared@2.5.4

## 5.3.4

### Patch Changes

- Updated dependencies [[`96234ce3d`](https://github.com/clerk/javascript/commit/96234ce3d44ec6f262c07cc7416171f4cb82e07b), [`247b3fd75`](https://github.com/clerk/javascript/commit/247b3fd75042365dc9f950db056b76f9fadfdcf6)]:
  - @clerk/clerk-react@5.4.3
  - @clerk/types@4.15.0
  - @clerk/backend@1.8.1
  - @clerk/shared@2.5.3

## 5.3.3

### Patch Changes

- Updated dependencies [[`ed7baa048`](https://github.com/clerk/javascript/commit/ed7baa0488df0ee4c48add2aac934ffb47e4a6d2)]:
  - @clerk/backend@1.8.0

## 5.3.2

### Patch Changes

- Bug fix: Handle `nextGetStore.getStore()` returning `undefined`. Previously a TypeError would occur, when `pagePath` was accessed. ([#3939](https://github.com/clerk/javascript/pull/3939)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`dc0e1c33d`](https://github.com/clerk/javascript/commit/dc0e1c33d6844b028cb1ee11c3359b886d609f3c), [`dc94c0834`](https://github.com/clerk/javascript/commit/dc94c08341c883fa5bf891f880fb34c4569ea820)]:
  - @clerk/types@4.14.0
  - @clerk/backend@1.7.0
  - @clerk/clerk-react@5.4.2
  - @clerk/shared@2.5.2

## 5.3.1

### Patch Changes

- Introduce functions that can be reused across front-end SDKs ([#3849](https://github.com/clerk/javascript/pull/3849)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`7e0ced3da`](https://github.com/clerk/javascript/commit/7e0ced3da94f41056bc4445d163d3b615afb6ab1), [`b6f0613dc`](https://github.com/clerk/javascript/commit/b6f0613dc9d8b0bab41cfabbaa8621b126e3bdf5)]:
  - @clerk/shared@2.5.1
  - @clerk/clerk-react@5.4.1
  - @clerk/types@4.13.1
  - @clerk/backend@1.6.3

## 5.3.0

### Minor Changes

- Add a `nonce` to clerk-js' script loading options. Also adds a `nonce` prop to `ClerkProvider`. This can be used to thread a nonce value through to the clerk-js script load to support apps using a `strict-dynamic` content security policy. For next.js applications, the nonce will be automatically pulled from the CSP header and threaded through without needing any props so long as the provider is server-rendered. ([#3858](https://github.com/clerk/javascript/pull/3858)) by [@jescalan](https://github.com/jescalan)

### Patch Changes

- Updated dependencies [[`59d5f19d3`](https://github.com/clerk/javascript/commit/59d5f19d333bf4a35c244886e93b4368e215225c), [`4e6c94e3f`](https://github.com/clerk/javascript/commit/4e6c94e3f4cc92cbba8bddcd2b90fcc9cfb83763)]:
  - @clerk/shared@2.5.0
  - @clerk/clerk-react@5.4.0
  - @clerk/types@4.13.0
  - @clerk/backend@1.6.2

## 5.2.14

### Patch Changes

- Internal change: Use `AuthObject` type import from `@clerk/backend`. ([#3844](https://github.com/clerk/javascript/pull/3844)) by [@kduprey](https://github.com/kduprey)

- Updated dependencies [[`d7bf0f87c`](https://github.com/clerk/javascript/commit/d7bf0f87c4c50bc19d2796bca32bd694046a23b0), [`9b2aeacb3`](https://github.com/clerk/javascript/commit/9b2aeacb32fff7c300bda458636a1cc81a42ee7b)]:
  - @clerk/backend@1.6.1
  - @clerk/types@4.12.1
  - @clerk/clerk-react@5.3.3
  - @clerk/shared@2.4.5

## 5.2.13

### Patch Changes

- Updated dependencies [[`7e94fcf0f`](https://github.com/clerk/javascript/commit/7e94fcf0fcbee8842a54f7931c45190370aa870d)]:
  - @clerk/backend@1.6.0
  - @clerk/types@4.12.0
  - @clerk/clerk-react@5.3.2
  - @clerk/shared@2.4.4

## 5.2.12

### Patch Changes

- Updated dependencies [[`568186cad`](https://github.com/clerk/javascript/commit/568186cad29acaf0b084a9f86ccb9d29bd23fcf4), [`407195270`](https://github.com/clerk/javascript/commit/407195270ed8aab6eef18c64a4918e3870fef471)]:
  - @clerk/types@4.11.0
  - @clerk/backend@1.5.2
  - @clerk/clerk-react@5.3.1
  - @clerk/shared@2.4.3

## 5.2.11

### Patch Changes

- Updated dependencies [[`992e5960c`](https://github.com/clerk/javascript/commit/992e5960c785eace83f3bad7c34d589fa313dcaf)]:
  - @clerk/backend@1.5.1

## 5.2.10

### Patch Changes

- Fix debug logs on `debug: true` parameter of `clerkMiddleware()` ([#3871](https://github.com/clerk/javascript/pull/3871)) by [@dimkl](https://github.com/dimkl)

## 5.2.9

### Patch Changes

- Updated dependencies [[`fde5b5e7e`](https://github.com/clerk/javascript/commit/fde5b5e7e6fb5faa4267e06d82a38a176165b4f4), [`aa06f3ba7`](https://github.com/clerk/javascript/commit/aa06f3ba7e725071c90d4a1d6840060236da3c23), [`80e647731`](https://github.com/clerk/javascript/commit/80e64773135865434cf0e6c220e287397aa07937)]:
  - @clerk/backend@1.5.0
  - @clerk/clerk-react@5.3.0
  - @clerk/types@4.10.0
  - @clerk/shared@2.4.2

## 5.2.8

### Patch Changes

- Updated dependencies [[`b48689705`](https://github.com/clerk/javascript/commit/b48689705f9fc2251d2f24addec7a0d0b1da0fe1)]:
  - @clerk/types@4.9.1
  - @clerk/backend@1.4.3
  - @clerk/clerk-react@5.2.10
  - @clerk/shared@2.4.1

## 5.2.7

### Patch Changes

- Updated dependencies [[`d465d7069`](https://github.com/clerk/javascript/commit/d465d70696bf26270cb2efbf4695ca49016fcb96)]:
  - @clerk/backend@1.4.2

## 5.2.6

### Patch Changes

- Updated dependencies [[`045fb93cb`](https://github.com/clerk/javascript/commit/045fb93cbf577ca84e5b95fc6dfaacde67693be2)]:
  - @clerk/backend@1.4.1

## 5.2.5

### Patch Changes

- Fixes regression on `@clerk/nextjs/server` (introduced on https://github.com/clerk/javascript/pull/3758) where `server-only` module was being resolved in runtimes without `react-server` available, such as `getAuth` on `getServerSideProps`. ([#3761](https://github.com/clerk/javascript/pull/3761)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Return build-time error if `auth` and `currentUser` server-side helpers are imported into Client Components. ([#3758](https://github.com/clerk/javascript/pull/3758)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Stop throwing "Error: Clerk: auth() was called but Clerk can't detect usage of authMiddleware()." errors when no user action is needed by removing sourcemaps for all Clerk-bundled server actions. ([#3773](https://github.com/clerk/javascript/pull/3773)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`b87f7b9e1`](https://github.com/clerk/javascript/commit/b87f7b9e163756fd43789bc7b7344d2eb24015ec), [`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`86c75e50c`](https://github.com/clerk/javascript/commit/86c75e50cba9c4efb480672f1b8c6a6fff4ef477)]:
  - @clerk/backend@1.4.0
  - @clerk/shared@2.4.0
  - @clerk/types@4.9.0
  - @clerk/clerk-react@5.2.9

## 5.2.4

### Patch Changes

- Updated dependencies [[`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7)]:
  - @clerk/types@4.8.0
  - @clerk/backend@1.3.2
  - @clerk/clerk-react@5.2.8
  - @clerk/shared@2.3.3

## 5.2.3

### Patch Changes

- Fixes a bug where Clerk's Handshake mechanism would not run when an application is rendered in an iframe. ([#3555](https://github.com/clerk/javascript/pull/3555)) by [@anagstef](https://github.com/anagstef)

- Updated dependencies [[`5642b2616`](https://github.com/clerk/javascript/commit/5642b26167a6eb1aca68777d782a9686edacfd37)]:
  - @clerk/backend@1.3.1

## 5.2.2

### Patch Changes

- Fixes Next.js build warnings (https://github.com/clerk/javascript/issues/3660) where `AsyncLocalStorage` and `MessageEvent` were being imported as Node.js modules on the edge runtime. ([#3661](https://github.com/clerk/javascript/pull/3661)) by [@LauraBeatris](https://github.com/LauraBeatris)

## 5.2.1

### Patch Changes

- Updated dependencies [[`427fcdeaa`](https://github.com/clerk/javascript/commit/427fcdeaaba4e77273be29b4d7cca43f9aa18693)]:
  - @clerk/clerk-react@5.2.7

## 5.2.0

### Minor Changes

- Introduces dynamic keys from `clerkMiddleware`, allowing access by server-side helpers like `auth`. Keys such as `signUpUrl`, `signInUrl`, `publishableKey` and `secretKey` are securely encrypted using AES algorithm. ([#3525](https://github.com/clerk/javascript/pull/3525)) by [@LauraBeatris](https://github.com/LauraBeatris)

  - When providing `secretKey`, `CLERK_ENCRYPTION_KEY` is required as the encryption key. If `secretKey` is not provided, `CLERK_SECRET_KEY` is used by default.
  - `clerkClient` from `@clerk/nextjs` should now be called as a function, and its singleton form is deprecated. This change allows the Clerk backend client to read keys from the current request, which is necessary to support dynamic keys.

  For more information, refer to the documentation: https://clerk.com/docs/references/nextjs/clerk-middleware#dynamic-keys

### Patch Changes

- Updated dependencies [[`f1847b70b`](https://github.com/clerk/javascript/commit/f1847b70b2327bd490faf1f3eed1aa5639d54993)]:
  - @clerk/backend@1.3.0

## 5.1.7

### Patch Changes

- Updated dependencies [[`d6b5006c4`](https://github.com/clerk/javascript/commit/d6b5006c4cc1b6f07bb3a6832b4ec6e65ea15814)]:
  - @clerk/types@4.7.0
  - @clerk/backend@1.2.5
  - @clerk/clerk-react@5.2.6
  - @clerk/shared@2.3.2

## 5.1.6

### Patch Changes

- Makes the internally used `invalidateCacheAction()` server action an async function to comply with server actions constraints. More information: https://nextjs.org/docs/messages/invalid-use-server-value ([#3593](https://github.com/clerk/javascript/pull/3593)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`1273b04ec`](https://github.com/clerk/javascript/commit/1273b04ecf1866b59ef59a74abe31dbcc726da2c)]:
  - @clerk/types@4.6.1
  - @clerk/backend@1.2.4
  - @clerk/clerk-react@5.2.5
  - @clerk/shared@2.3.1

## 5.1.5

### Patch Changes

- Enhance page detection by utilizing the patched fetch from nextjs. ([#3529](https://github.com/clerk/javascript/pull/3529)) by [@panteliselef](https://github.com/panteliselef)

- Replace router.refresh() with cookies().delete() ([#3518](https://github.com/clerk/javascript/pull/3518)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`4ec3f63e2`](https://github.com/clerk/javascript/commit/4ec3f63e26d8d3725a7ba9bbf988a7776fe893ff)]:
  - @clerk/shared@2.3.0
  - @clerk/backend@1.2.3
  - @clerk/clerk-react@5.2.4

## 5.1.4

### Patch Changes

- Update dependency path-to-regexp to v6.2.2 ([#3490](https://github.com/clerk/javascript/pull/3490)) by [@renovate](https://github.com/apps/renovate)

- Set `@clerk/types` as a dependency for packages that had it as a dev dependency. ([#3450](https://github.com/clerk/javascript/pull/3450)) by [@desiprisg](https://github.com/desiprisg)

- Updated the check ran against the error caught by `buildRequestLike()` to re-throw Static Bailout errors thrown by React in the context of PPR (Partial Pre-Rendering), as these errors shouldn't be caught. This change was required as we have been checking the error message itself, but stopped working after the message was changed in a Next.js update a few months ago. ([#3499](https://github.com/clerk/javascript/pull/3499)) by [@ceIia](https://github.com/ceIia)

  - Breaking PR: https://github.com/vercel/next.js/commit/3008af6b0e7b2c8aadd986bdcbce5bad6c39ccc8#diff-20c354509ae1e93e143d91b67b75e3df592c38b7d1ec6ccf7c4a2f72b32ab17d
  - Why PPR errors shouldn't be caught: https://nextjs.org/docs/messages/ppr-caught-error
  - Previous fix: https://github.com/clerk/javascript/pull/2518

- Bug fix: Correctly update history state when on internal navigations. ([#3480](https://github.com/clerk/javascript/pull/3480)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`86a27f693`](https://github.com/clerk/javascript/commit/86a27f6933de50c99b6bc354bf87ff5c2cfcaf38), [`35a0015f5`](https://github.com/clerk/javascript/commit/35a0015f5dd3419f126950b3bfb51ccf51e54cda), [`02bed2e00`](https://github.com/clerk/javascript/commit/02bed2e00d3e0a4e1bb1698b13267faf6aeb31b3), [`73e5d61e2`](https://github.com/clerk/javascript/commit/73e5d61e21ab3f77f3c8343bc63da0626466c7ac), [`b8e46328d`](https://github.com/clerk/javascript/commit/b8e46328da874859c4928f19f924219cd6520b11)]:
  - @clerk/shared@2.2.2
  - @clerk/clerk-react@5.2.3
  - @clerk/backend@1.2.2
  - @clerk/types@4.6.0

## 5.1.3

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-react@5.2.2

## 5.1.2

### Patch Changes

- Allow next@15.0.0-rc as a peer dependency by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 5.1.1

### Patch Changes

- With the next major release, NextJS@15 will depend on `react` and `react-dom` v19, which is still in beta. We are updating our peer dependencies accordingly in order to accept `react` and `react-dom` @ `19.0.0-beta` ([#3428](https://github.com/clerk/javascript/pull/3428)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Utilize an awaitable replace function internally to avoid race conditions when using `router.replace`. ([#3416](https://github.com/clerk/javascript/pull/3416)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`ff31f7255`](https://github.com/clerk/javascript/commit/ff31f725541d82caaa9c13cf42cf15f8ce3992f4), [`0e48fc210`](https://github.com/clerk/javascript/commit/0e48fc210cf0b5852052a21494a05f6e723101f5)]:
  - @clerk/shared@2.2.1
  - @clerk/clerk-react@5.2.1
  - @clerk/backend@1.2.1

## 5.1.0

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
    callback: async response => {
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
    callback: async response => {
      const signInOrUp = await Clerk.authenticateWithGoogleOneTap({
        token: response.credential,
      });
      if (signInOrUp.status === 'complete') {
        await Clerk.setActive({
          session: signInOrUp.createdSessionId,
        });
      }
    },
  });
  ```

### Patch Changes

- Updated dependencies [[`d6a9b3f5d`](https://github.com/clerk/javascript/commit/d6a9b3f5dd8c64b1bd49f74c3707eb01dcd6aff4), [`456b06849`](https://github.com/clerk/javascript/commit/456b068493b8679e1772819eea24d49aa1bc6556), [`6888594cc`](https://github.com/clerk/javascript/commit/6888594cc5d0f922d166b6d28b7b994d657a5595)]:
  - @clerk/clerk-react@5.2.0
  - @clerk/shared@2.2.0
  - @clerk/backend@1.2.0

## 5.0.12

### Patch Changes

- Updated dependencies [[`3d790d5ea`](https://github.com/clerk/javascript/commit/3d790d5ea347a51ef16557c015c901a9f277effe)]:
  - @clerk/clerk-react@5.1.0

## 5.0.11

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-react@5.0.7

## 5.0.10

### Patch Changes

- Updated dependencies [[`4d3dc00fb`](https://github.com/clerk/javascript/commit/4d3dc00fb444c87e3d27f398cd0c1ce4d176f65b), [`ec84d51e7`](https://github.com/clerk/javascript/commit/ec84d51e705370273ffb82a0d7c94d90ba3de874)]:
  - @clerk/backend@1.1.5
  - @clerk/shared@2.1.1
  - @clerk/clerk-react@5.0.6

## 5.0.9

### Patch Changes

- Updated dependencies [[`b27ca8366`](https://github.com/clerk/javascript/commit/b27ca8366a1d6ec1d7ce4a5be5005f1b1b017c20), [`bcbb2c9ef`](https://github.com/clerk/javascript/commit/bcbb2c9ef42c11b13c1d2f60db4dd88a2d4f04f6)]:
  - @clerk/shared@2.1.0
  - @clerk/clerk-react@5.0.5
  - @clerk/backend@1.1.4

## 5.0.8

### Patch Changes

- Updated dependencies [[`b92402258`](https://github.com/clerk/javascript/commit/b924022580569c934a9d33310449b4a50156070a)]:
  - @clerk/backend@1.1.3

## 5.0.7

### Patch Changes

- Fix a bug where response headers from `@clerk/backend` would not be applied to the response when a redirect was triggered from a custom middleware handler. ([#3344](https://github.com/clerk/javascript/pull/3344)) by [@BRKalow](https://github.com/BRKalow)

- Pass `devBrowserToken` to `createRedirect()` to ensure methods from `auth()` that trigger redirects correctly pass the dev browser token for URL-based session syncing. ([#3334](https://github.com/clerk/javascript/pull/3334)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`39265d909`](https://github.com/clerk/javascript/commit/39265d90941c850fd1b24295b19b904a5f3eaba6), [`4f4375e88`](https://github.com/clerk/javascript/commit/4f4375e88fa2daae4d725c62da5e4cf29302e53c), [`1662aaae9`](https://github.com/clerk/javascript/commit/1662aaae965fcf36b13dba6b148e096ab6a1cd83), [`f70c885f7`](https://github.com/clerk/javascript/commit/f70c885f798f7ff513f6687f87c8a56daf26fa05), [`4ae79af36`](https://github.com/clerk/javascript/commit/4ae79af36552aae1f0284ecc4dfcfc23ef295d26), [`f5804a225`](https://github.com/clerk/javascript/commit/f5804a225e9d67cd315700f0ced0ff17b8b14e53)]:
  - @clerk/clerk-react@5.0.4
  - @clerk/backend@1.1.2
  - @clerk/shared@2.0.2

## 5.0.6

### Patch Changes

- Notify users when catch-all route and all of its children routes are being protected by the middleware ([#3311](https://github.com/clerk/javascript/pull/3311)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Update docs links to point to the correct pages ([#3312](https://github.com/clerk/javascript/pull/3312)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

## 5.0.5

### Patch Changes

- Updated dependencies [[`e93b5777b`](https://github.com/clerk/javascript/commit/e93b5777b4f8578e6a6f81566e2601ab0e65590a)]:
  - @clerk/clerk-react@5.0.3

## 5.0.4

### Patch Changes

- Updated dependencies [[`8fbe23857`](https://github.com/clerk/javascript/commit/8fbe23857bc588a4662af78ee33b24123cd8bc2e), [`a78bc447c`](https://github.com/clerk/javascript/commit/a78bc447c1aabaa41bcbaa2a8fe3c48f31275574), [`19cd42434`](https://github.com/clerk/javascript/commit/19cd42434450e568998336bf6d705e475122abbc), [`e79d2e3d3`](https://github.com/clerk/javascript/commit/e79d2e3d3be02eb1cf8b2647ac179cc5d4aa2de2)]:
  - @clerk/backend@1.1.1
  - @clerk/shared@2.0.1
  - @clerk/clerk-react@5.0.2

## 5.0.3

### Patch Changes

- Updated dependencies [[`b3fda50f0`](https://github.com/clerk/javascript/commit/b3fda50f03672106c6858219fc607d226851ec10), [`b3ad7a459`](https://github.com/clerk/javascript/commit/b3ad7a459c46be1f8967faf73c2cdd96406593c8), [`4e5de1164`](https://github.com/clerk/javascript/commit/4e5de1164d956c7dc21f72d25e312296d36504a7)]:
  - @clerk/backend@1.1.0

## 5.0.2

### Patch Changes

- Export all Webhook event types and related JSON types. The newly exported types are: `DeletedObjectJSON`, `EmailJSON`, `OrganizationInvitationJSON`, `OrganizationJSON`, `OrganizationMembershipJSON`, `SessionJSON`, `SMSMessageJSON`, `UserJSON`, `UserWebhookEvent`, `EmailWebhookEvent`, `SMSWebhookEvent`, `SessionWebhookEvent`, `OrganizationWebhookEvent`, `OrganizationMembershipWebhookEvent`, `OrganizationInvitationWebhookEvent` ([#3248](https://github.com/clerk/javascript/pull/3248)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`3c6e5a6f1`](https://github.com/clerk/javascript/commit/3c6e5a6f1dd0ac198e6e48d1b83c6d4846a7f900), [`65503dcb9`](https://github.com/clerk/javascript/commit/65503dcb97acb9538e5c0e3f8199d20ad31c9d7d)]:
  - @clerk/backend@1.0.1
  - @clerk/clerk-react@5.0.1

## 5.0.1

### Patch Changes

- cfbe43d3a: Correctly read legacy NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL and NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL env variables

## 5.0.0

### Major Changes

- c2a090513: Change the minimal Node.js version required by Clerk to `18.17.0`.
- f31031a21: Drop deprecations. Migration steps:
  - use `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` instead of `NEXT_PUBLIC_CLERK_FRONTEND_API` env variable
  - use `NEXT_PUBLIC_CLERK_JS_VERSION` instead of `CLERK_JS_VERSION`
  - use `CLERK_SECRET_KEY` instead of `CLERK_API_KEY`
  - use `publishableKey` instead of `frontendApi`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`
  - use `@clerk/nextjs` instead of `@clerk/nextjs/app-beta`
  - use `@clerk/nextjs` instead of `@clerk/nextjs/ssr`
  - use `@clerk/nextjs` instead of `@clerk/nextjs/edge-middleware` or `@clerk/nextjs/edge-middlewarefiles`
  - use `@clerk/nextjs` instead of `@clerk/nextjs/api`
  - use middleware with `authMiddleware` instead of `withClerkMiddleware`
  - avoid using exported constants: `API_URL`, `API_VERSION`, `CLERK_JS_URL`, `CLERK_JS_VERSION`, `DOMAIN`, `IS_SATELLITE`, `PROXY_URL`, `PUBLISHABLE_KEY`, `SECRET_KEY`, `SIGN_IN_URL`, `SIGN_UP_URL`
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
- 9a1fe3728: Fix a bug where navigating from the sign in page to the sign up page required two back button presses to go back.
- cfea3d9c0: Path-based routing is now the default routing strategy if the `path` prop is filled. Additionally, if the `path` and `routing` props are not filled, an error will be thrown.

  ```jsx

  // Without path or routing props, an error with be thrown
  <UserProfile />
  <CreateOrganization />
  <OrganizationProfile />
  <SignIn />
  <SignUp />

  // Alternative #1
  <UserProfile path="/whatever"/>
  <CreateOrganization path="/whatever"/>
  <OrganizationProfile path="/whatever"/>
  <SignIn path="/whatever"/>
  <SignUp path="/whatever"/>

  // Alternative #2
  <UserProfile routing="hash_or_virtual"/>
  <CreateOrganization routing="hash_or_virtual"/>
  <OrganizationProfile routing="hash_or_virtual"/>
  <SignIn routing="hash_or_virtual"/>
  <SignUp routing="hash_or_virtual"/>
  ```

- e602d6c1f: Drop support for NextJS v12: v12 was released on 26 Oct 2021. Support for security updates stopped on 21 Nov 2022.

  Drop support for NextJS <13.0.4: Various header-related bugs were introduced with the 12.1.0, 12.2.0, 13.0.1, 13.0.2, 13.0.3 NextJS releases which are now fixed since next@^13.0.4. We will be dropping support for these problematic versions in order to greatly reduce complexity in our codebase.

  Drop support for NextJS < 14.0.3 because of the issues described here: https://github.com/clerk/javascript/issues/1436.

  Deprecate `authMiddleware` in favor of `clerkMiddleware`. For more information, see https://clerk.com/docs/upgrade-guides/v5-introduction

  Move the server-side APIs from `@clerk/nextjs` to the `@clerk/nextjs/server` module: `WebhookEventType`, `WebhookEvent`, `verifyToken`, `redirectToSignIn`, `auth`, `buildClerkProps`, `clerkClient`, `currentUser`, `getAuth`, `redirectToSignUp` and `authMiddleware`. For more information, see https://clerk.com/docs/upgrade-guides/v5-introduction

- 2a22aade8: Drop deprecations. Migration steps:
  - drop `orgs` jwt claim from session token
  - change type of `auth` param of `withServerAuth()` callback to `AuthObject` from `ServerSideAuth` in `gatsby-clerk-plugin`
    - use `auth.sessionClaims` instead of `auth.claims`
    - use `AuthObject` properties from `auth`
  - use `publishableKey` instead of `frontendApi`
  - use `ClerkProviderOptionsWrapper` type instead of `IsomorphicClerkOptions`
- 8aea39cd6: - Introduce `@clerk/clerk-react/errors` and `@clerk/clerk-react/internal` subpath exports to expose some internal utilities. Eg

  ````typescript
  // Before
  import { **internal**setErrorThrowerOptions } from '@clerk/clerk-react';
  // After
  import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';

      // Before
      import { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react';
      // After
      import { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react/errors';

      // Before
      import { MultisessionAppSupport } from '@clerk/clerk-react';
      // After
      import { MultisessionAppSupport } from '@clerk/clerk-react/internal';
      ```

  - Drop from the `@clerk/clerk-react` and all other clerk-react wrapper packages:
    - `__internal__setErrorThrowerOptions` internal utility (moved to /internal subpath)
    - `WithClerkProp` type
    - `MultisessionAppSupport` component (moved to /internal subpath)
    - `EmailLinkErrorCode` enum
  - Drop `StructureContext` and related errors to reduce to reduce code complexity since it seems that it was not being used.
  - Drop `withUser`, `WithUser`, `withClerk` HOFs and `WithClerk`, `withSession`, `WithSession` HOCs from the `@clerk/clerk-react`
    to reduce the export surface since it's trivial to implement if needed.

  ````

- dd5703013: Change the response payload of Backend API requests to return `{ data, errors }` instead of return the data and throwing on error response.
  Code example to keep the same behavior:

  ```typescript
  import { users } from '@clerk/backend';
  import { ClerkAPIResponseError } from '@clerk/shared/error';

  const { data, errors, clerkTraceId, status, statusText } = await users.getUser('user_deadbeef');
  if (errors) {
    throw new ClerkAPIResponseError(statusText, {
      data: errors,
      status,
      clerkTraceId,
    });
  }
  ```

- 5f58a2274: Remove hashing and third-party cookie functionality related to development instance session syncing in favor of URL-based session syncing with query parameters.
- 52ff8fe6b: Upgrade React version to >=18 and add react-dom as peer dependency
  to fix issues with vite & rollup building.
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
- 0ec3a146c: Changes in exports of `@clerk/backend`:
  - Expose the following helpers and enums from `@clerk/backend/internal`:
    ```typescript
    import {
      AuthStatus,
      buildRequestUrl,
      constants,
      createAuthenticateRequest,
      createIsomorphicRequest,
      debugRequestState,
      makeAuthObjectSerializable,
      prunePrivateMetadata,
      redirect,
      sanitizeAuthObject,
      signedInAuthObject,
      signedOutAuthObject,
    } from '@clerk/backend/internal';
    ```
  - Drop the above exports from the top-level api:
    ```typescript
    // Before
    import { AuthStatus, ... } from '@clerk/backend';
    // After
    import { AuthStatus, ... } from '@clerk/backend/internal';
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.
- 1ad910eb9: Changes in exports of `@clerk/backend`:
  - Drop the following internal exports from the top-level api:
    ```typescript
    // Before
    import {
      AllowlistIdentifier,
      Client,
      DeletedObject,
      Email,
      EmailAddress,
      ExternalAccount,
      IdentificationLink,
      Invitation,
      OauthAccessToken,
      ObjectType,
      Organization,
      OrganizationInvitation,
      OrganizationMembership,
      OrganizationMembershipPublicUserData,
      PhoneNumber,
      RedirectUrl,
      SMSMessage,
      Session,
      SignInToken,
      Token,
      User,
      Verification,
    } from '@clerk/backend';
    // After : no alternative since there is no need to use those classes
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.
  - Keep those 3 resource related type exports
    ```typescript
    import type { Organization, Session, User, WebhookEvent, WebhookEventType } from '@clerk/backend';
    ```
- f58a9949b: Changes in exports of `@clerk/backend`:
  - Expose the following helpers and enums from `@clerk/backend/jwt`:
    ```typescript
    import { decodeJwt, hasValidSignature, signJwt, verifyJwt } from '@clerk/backend/jwt';
    ```
  - Drop the above exports from the top-level api:
    ```typescript
    // Before
    import { decodeJwt, ... } from '@clerk/backend';
    // After
    import { decodeJwt, ... } from '@clerk/backend/jwt';
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.
- 9a1fe3728: Use the new `routerPush` and `routerReplace` props for `<ClerkProvider />` instead of `navigate`.
- e1f7eae87: Limit TokenVerificationError exports to TokenVerificationError and TokenVerificationErrorReason
- 02976d494: (Note: This is only relevant if, in the unlikely case, you are using `Clerk` from `@clerk/nextjs` directly. If not, you can safely ignore this change.)

  Remove the named `Clerk` import from `@clerk/nextjs` and import `createClerkClient` instead. The latter is a factory method to create a Clerk client instance for you. This update aligns usage across our SDKs and will enable us to ship DX improvements better in the future.

  ```js
  import { Clerk } from '@clerk/nextjs';
  const clerk = Clerk({ secretKey: '...' });
  ```

  You need to rename the import from `Clerk` to `createClerkClient` and change its usage:

  ```js
  import { createClerkClient } from '@clerk/nextjs';
  const clerk = createClerkClient({ secretKey: '...' });
  ```

- 9b02c1aae: Changes in `@clerk/backend` exports:
  - Drop Internal `deserialize` helper
  - Introduce `/errors` subpath export, eg:
    ```typescript
    import {
      TokenVerificationError,
      TokenVerificationErrorAction,
      TokenVerificationErrorCode,
      TokenVerificationErrorReason,
    } from '@clerk/backend/errors';
    ```
  - Drop errors from top-level export
    ```typescript
    // Before
    import { TokenVerificationError, TokenVerificationErrorReason } from '@clerk/backend';
    // After
    import { TokenVerificationError, TokenVerificationErrorReason } from '@clerk/backend/errors';
    ```
- e5598cfb1: Drop `user`, `session`, and `organization` resources from the returned value of `auth()`.
- 6fffd3b54: Replace return the value of the following jwt helpers to match the format of backend API client return values (for consistency).

  ```diff
  import { signJwt } from '@clerk/backend/jwt';

  - const { data, error } = await signJwt(...);
  + const { data, errors: [error] = [] } = await signJwt(...);
  ```

  ```diff
  import { verifyJwt } from '@clerk/backend/jwt';

  - const { data, error } = await verifyJwt(...);
  + const { data, errors: [error] = [] } = await verifyJwt(...);
  ```

  ```diff
  import { hasValidSignature } from '@clerk/backend/jwt';

  - const { data, error } = await hasValidSignature(...);
  + const { data, errors: [error] = [] } = await hasValidSignature(...);
  ```

  ```diff
  import { decodeJwt } from '@clerk/backend/jwt';

  - const { data, error } = await decodeJwt(...);
  + const { data, errors: [error] = [] } = await decodeJwt(...);
  ```

  ```diff
  import { verifyToken } from '@clerk/backend';

  - const { data, error } = await verifyToken(...);
  + const { data, errors: [error] = [] } = await verifyToken(...);
  ```

- dd9d7da06: Use `NEXT_PUBLIC_CLERK_JS_URL` instead of `NEXT_PUBLIC_CLERK_JS` to pin a specific @clerk/clerk-js version.

### Minor Changes

- ecb60da48: Implement token signature verification when passing verified token from Next.js middleware to the application origin.
- 7f6a64f43: - By default, all the components with routing will have the `routing` prop assigned as `'path'` by default when the `path` prop is filled.
  - The `<UserButton />` component will set the default value of the `userProfileMode` prop to `'navigation'` if the `userProfileUrl` prop is provided.
  - The `<OrganizationSwitcher />` component will have the `organizationProfileMode` and `createOrganizationMode` props assigned with `'navigation'` by default if the `organizationProfileUrl` and `createOrganizationUrl` props are filled accordingly.
- ff08fe237: Introduce experimental support for Google One Tap
  - React Component `<__experimental_GoogleOneTap/>`
  - JS `clerk.__experimental_mountGoogleOneTap(node,props)`
- 2964f8a47: Expose debug headers in response for handshake / signed-out states from SDKs using headers returned from `authenticateRequest()`
- c7e6d00f5: Experimental support for `<Gate/>` with role checks.
- c7d960ca0: Replace redirectUrl of protect with `unauthorizedUrl` and `unauthenticatedUrl`.
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

- f98e480b1: Speed up loading of clerk-js by using a `<script/>` tag when html is generated.
  This is supported during SSR, SSG in
  - Next.js Pages Router
  - Next.js App Router
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
- 980a56cc7: Bump minimum nextjs@13 version to `13.5.4` from `13.0.4` to resolve vulnerabilities.

  ref: https://github.com/advisories/GHSA-c59h-r6p8-q9wc

- 18c0d015d: Pass environment into `sdkMetadata` in order to detect if production clerk-js is used by other sdks in dev mode. When it is log dev warning from clerk-js.
- 1fd2eff38: Allow manually passing a publishable/secret key pair to the `authMiddleware` and `clerkMiddleware` helpers.
- 5471c7e8d: Move and export the following from @clerk/clerk-js and @clerk/nextjs to @clerk/shared: - `DEV_BROWSER_SSO_JWT_PARAMETER` - `DEV_BROWSER_JWT_MARKER` - `DEV_BROWSER_SSO_JWT_KEY` - `setDevBrowserJWTInURL` - `getDevBrowserJWTFromURL` - `getDevBrowserJWTFromResponse`
- b4e79c1b9: Replace the `Clerk-Backend-SDK` header with `User-Agent` in BAPI requests and update it's value to contain both the package name and the package version of the clerk package
  executing the request. Eg request from `@clerk/nextjs` to BAPI with append `User-Agent: @clerk/nextjs@5.0.0-alpha-v5.16` using the latest version.

  Miscellaneous changes: The backend test build changed to use tsup.

### Patch Changes

- 4564ad643: - Export ClerkMiddlewareAuthObject, ClerkMiddlewareAuth and ClerkMiddlewareOptions types

  - Introduce `auth().redirectToSignIn()` that can be used in API routes and pages, eg

  ```ts
  import { auth } from '@clerk/nextjs/server';

  export const Layout = ({ children }) => {
    const { userId } = auth();

    if (!userId) {
      return auth().redirectToSignIn();
    }

    return <>{children}</>;
  };
  ```

- 7b200af49: The `auth().redirectToSignIn()` helper no longer needs to be explicitly returned when called within the middleware. The following examples are now equivalent:

  ```js
  // Before
  export default clerkMiddleware(auth => {
    if (protectedRoute && !auth.user) {
      return auth().redirectToSignIn()
    }
  })

  // After
  export default clerkMiddleware(auth => {
    if (protectedRoute && !auth.user) {
      auth().redirectToSignIn()
    }
  })
  ```

  Calling `auth().protect()` from a page will now automatically redirect back to the same page by setting `redirect_url` to the request url before the redirect to the sign-in URL takes place.

- 93d05c868: Drop the introduction of `OrganizationRole` and `OrganizationPermission` resources fro BAPI.
- 24de66951: Infer the path the component is mounted at automatically in pages and app router
- f68b0158b: Remove usage of useSearchParams() to avoid CSR de-opt.
- 2de442b24: Rename beta-v5 to beta
- ef2325dcc: Introduce `isTruthy` helper to better cast environment variables to a boolean. Previously only the string `"true"` was checked, now `true`, `"true"`, `"1"`, and `1` will work.
- 4a4287533: Throw a descriptive error when a Clerk component that is using path-based routing is mounted in a non-catch-all route
- 6a769771c: Update README for v5
- 9a87eced3: Introduce the new `clerkMiddleware` helper to allow for more flexibility in how Clerk is integrated into your Next.js middleware. Example usage can be found below, for more details, For more details, please see the [clerkMiddleware](https://clerk.com/docs/references/nextjs/clerkMiddleware) documentation.
  The `clerkMiddleware` helper effectively replaces the older `authMiddleware` helper, which is now considered deprecated and will be removed in the next major release.

  ### 1. Protect a route that requires authentication

  ```js
  import { clerkMiddleware } from '@clerk/nextjs/server';

  export default clerkMiddleware(auth => {
    const { userId } = auth().protect();
    // userId is now available for use in your route handler
    // for page requests, calling protect will automatically redirect the user to the sign-in URL if they are not authenticated
    return NextResponse.next();
  });
  ```

  ### 2. Protect a route that requires specific permissions

  ```js
  import { clerkMiddleware } from '@clerk/nextjs/server';

  export default clerkMiddleware(auth => {
    const { userId } = auth().protect({ permission: 'org:domains:delete' });
    // userId is now available for use in your route handler
    // for page requests, calling protect will automatically throw a notFound error if the user does not have the required permissions
    return NextResponse.next();
  });
  ```

  ### 2. Manually redirect to sign-in URL using the redirectToSignIn helper

  ```js
  import { clerkMiddleware } from '@clerk/nextjs/server';

  export default clerkMiddleware(auth => {
    // If you want more fine-grained control, you can always use the low-level redirectToSignIn helper
    if (!auth().userId) {
      return auth().redirectToSignIn();
    }

    return NextResponse.next();
  });
  ```

  This commit also introduces the experimental `createRouteMatcher` helper, which can be used to create a route matcher that matches a route against the current request. This is useful for creating custom logic based on which routes you want to handle as protected or public.

  ```js
  import { clerkMiddleware, experimental_createRouteMatcher } from '@clerk/nextjs/server';

  const isProtectedRoute = experimental_createRouteMatcher([/protected.*/]);

  export default clerkMiddleware((auth, request) => {
    if (isProtectedRoute(request)) {
      auth().protect();
    }

    return NextResponse.next();
  });
  ```

- 8e5c881c4: The following paginated APIs now return `{ data, totalCount }` instead of simple arrays, in order to make building paginated UIs easier:

  - `clerkClient.users.getOrganizationMembershipList(...)`
  - `clerkClient.organization.getOrganizationList(...)`
  - `clerkClient.organization.getOrganizationInvitationList(...)`

  Revert changing the `{ data, errors }` return value of the following helpers to throw the `errors` or return the `data` (keep v4 format):

  - `import { verifyToken } from '@clerk/backend'`
  - `import { signJwt, hasValidSignature, decodeJwt, verifyJwt } from '@clerk/backend/jwt'`
  - BAPI `clerkClient` methods eg (`clerkClient.users.getUserList(...)`)

- 9e99eb727: Update `@clerk/nextjs` error messages to refer to `clerkMiddleware()` and deprecated `authMiddleware()` and fix a typo in `cannotRenderSignUpComponentWhenSessionExists` error message.
- fcb91f6f1: Fixes the docs link pointing to clerk.com/docs in the `authAuthHeaderMissing` error by removing the trailing `.`
- ee57f21ac: Export `EmailLinkErrorCode` from `/errors` module
- 529e2e14c: Introduce `createRouteMatcher` which is designed to generate and return a function that evaluates whether a given Request object matches a set of predefined routes. It provides flexibility in defining these routes through various patterns, including glob patterns, regular expressions, and custom functions. This composable helper can be used in combination with the `clerkMiddleware` helper to easily protect specific routes, eg:

  ```ts
  import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

  const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

  export default clerkMiddleware((auth, request) => {
    if (isProtectedRoute(request)) {
      auth().protect();
    }
  });
  ```

- b234400c2: Adds telemetry event to clerkMiddleware initialization, passes publishableKey to `createClerkClient()` internally.
- 2e77cd737: Set correct information on required Node.js and React versions in README
- ae3a6683a: Ignore `.test.ts` files for the build output. Should result in smaller bundle size.
- 32992906c: Fix partial prerendering error when using NextJS by correctly rethrowing partial prerendering (PPR) error.
- c22cd5214: Fix type inferance for auth helper.
- b67f6ab79: Fix property `Page`/ `Link` missing from the `UserProfile` / `OrganizationProfile`
  when imported from `@clerk/nextjs` or `@clerk/remix`.
- f77e8cdbd: Add Autocomplete TS generic for union literals
- b892ac6cb: Ensure that cookies set inside Next.js Middleware are correctly passed through while using [`authMiddleware`](https://clerk.com/docs/references/nextjs/auth-middleware).
- 8b466a9ba: Prevent Clerk component flickering when mounted in a Next.js app using App Router
- ceb74c464: Using auth().protect inside clerkMiddleware will perform a redirection instead of throwing a not found error when internal navigation in pages router occurs and the user is unauthenticated.
- 7644b7472: Improve the default value for `CLERK_API_URL` by utilizing the publishable key to differentiate between local, staging and prod environments.
- d88b52079: Update NextJS quickstart link in error message
- 046224177: Make useAwaitableNavigate handle navigations between pages reliably
- 0ce0edc28: Add OrganizationPermissionAPI for CRUD operations regarding instance level organization permissions.
- a8901be64: Expose resources types
- 05bda497c: Accept `redirectUrl` as an option for `auth().protect()`.

  For example:

  ```ts
  // Authorization
  auth().protect({ role: 'org:admin' }, { redirectUrl: '/any-page' });
  auth().protect({ permission: 'org:settings:manage' }, { redirectUrl: '/any-page' });

  // Authentication
  auth().protect({ redirectUrl: '/any-page' });
  ```

- fb794ce7b: Support older iOS 13.3 and 13.4 mobile devices
- e6fc58ae4: Introduce `debug: true` option for the `clerkMiddleware` helper
- 40ac4b645: Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry.
- c0a7455ac: Export MultisessionAppSupport from @clerk/nextjs/internal
- Updated dependencies [3a2f13604]
- Updated dependencies [8c23651b8]
- Updated dependencies [f4f99f18d]
- Updated dependencies [743c4d204]
- Updated dependencies [4b8bedc66]
- Updated dependencies [9272006e7]
- Updated dependencies [2a67f729d]
- Updated dependencies [c2a090513]
- Updated dependencies [6ac9e717a]
- Updated dependencies [966b31205]
- Updated dependencies [1834a3ee4]
- Updated dependencies [a8901be64]
- Updated dependencies [896cb6104]
- Updated dependencies [64d3763ec]
- Updated dependencies [8350109ab]
- Updated dependencies [7b200af49]
- Updated dependencies [988a299c0]
- Updated dependencies [ecb60da48]
- Updated dependencies [deac67c1c]
- Updated dependencies [b3a3dcdf4]
- Updated dependencies [1dc28ab46]
- Updated dependencies [83e9d0846]
- Updated dependencies [244de5ea3]
- Updated dependencies [791c49807]
- Updated dependencies [935b0886e]
- Updated dependencies [93d05c868]
- Updated dependencies [ea4933655]
- Updated dependencies [7f6a64f43]
- Updated dependencies [a9fe242be]
- Updated dependencies [448e02e93]
- Updated dependencies [2671e7aa5]
- Updated dependencies [799abc281]
- Updated dependencies [4aaf5103d]
- Updated dependencies [a68eb3083]
- Updated dependencies [2de442b24]
- Updated dependencies [15af02a83]
- Updated dependencies [db18787c4]
- Updated dependencies [7f833da9e]
- Updated dependencies [de6519daa]
- Updated dependencies [e6ecbaa2f]
- Updated dependencies [ef2325dcc]
- Updated dependencies [6a769771c]
- Updated dependencies [fc3ffd880]
- Updated dependencies [8b6b094b9]
- Updated dependencies [bab2e7e05]
- Updated dependencies [71663c568]
- Updated dependencies [a6b893d28]
- Updated dependencies [02976d494]
- Updated dependencies [492b8a7b1]
- Updated dependencies [8e5c881c4]
- Updated dependencies [9e99eb727]
- Updated dependencies [034c47ccb]
- Updated dependencies [cfea3d9c0]
- Updated dependencies [e5c989a03]
- Updated dependencies [ff08fe237]
- Updated dependencies [7ecd6f6ab]
- Updated dependencies [12f3c5c55]
- Updated dependencies [c776f86fb]
- Updated dependencies [90aa2ea9c]
- Updated dependencies [ee57f21ac]
- Updated dependencies [1e98187b4]
- Updated dependencies [7bffc47cb]
- Updated dependencies [a605335e1]
- Updated dependencies [2e77cd737]
- Updated dependencies [2964f8a47]
- Updated dependencies [7af0949ae]
- Updated dependencies [97407d8aa]
- Updated dependencies [2a22aade8]
- Updated dependencies [63dfe8dc9]
- Updated dependencies [ae3a6683a]
- Updated dependencies [e921af259]
- Updated dependencies [d08ec6d8f]
- Updated dependencies [6e54b1b59]
- Updated dependencies [8aea39cd6]
- Updated dependencies [dd5703013]
- Updated dependencies [5f58a2274]
- Updated dependencies [5f58a2274]
- Updated dependencies [03079579d]
- Updated dependencies [c22cd5214]
- Updated dependencies [52ff8fe6b]
- Updated dependencies [c9e0f68af]
- Updated dependencies [86d52fb5c]
- Updated dependencies [fe2607b6f]
- Updated dependencies [c7e6d00f5]
- Updated dependencies [8cc45d2af]
- Updated dependencies [797e327e0]
- Updated dependencies [ab4eb56a5]
- Updated dependencies [a9fe242be]
- Updated dependencies [97407d8aa]
- Updated dependencies [12962bc58]
- Updated dependencies [7cb1241a9]
- Updated dependencies [9615e6cda]
- Updated dependencies [0ec3a146c]
- Updated dependencies [4bb57057e]
- Updated dependencies [c86f73be3]
- Updated dependencies [bad4de1a2]
- Updated dependencies [d4ff346dd]
- Updated dependencies [7644b7472]
- Updated dependencies [2ec9f6b09]
- Updated dependencies [2e4a43017]
- Updated dependencies [f98e480b1]
- Updated dependencies [66b283653]
- Updated dependencies [1affbb22a]
- Updated dependencies [46040a2f3]
- Updated dependencies [cace85374]
- Updated dependencies [f5fb63cf1]
- Updated dependencies [1ad910eb9]
- Updated dependencies [8daf8451c]
- Updated dependencies [f58a9949b]
- Updated dependencies [4aaf5103d]
- Updated dependencies [75ea300bc]
- Updated dependencies [d22e6164d]
- Updated dependencies [e1f7eae87]
- Updated dependencies [7f751c4ef]
- Updated dependencies [4fced88ac]
- Updated dependencies [f5d55bb1f]
- Updated dependencies [18c0d015d]
- Updated dependencies [0d1052ac2]
- Updated dependencies [d30ea1faa]
- Updated dependencies [e9841dd91]
- Updated dependencies [e7e2a1eae]
- Updated dependencies [1fd2eff38]
- Updated dependencies [5471c7e8d]
- Updated dependencies [a6308c67e]
- Updated dependencies [0ce0edc28]
- Updated dependencies [477170962]
- Updated dependencies [9b02c1aae]
- Updated dependencies [051833167]
- Updated dependencies [59f9a7296]
- Updated dependencies [b4e79c1b9]
- Updated dependencies [38d8b3e8a]
- Updated dependencies [be991365e]
- Updated dependencies [8350f73a6]
- Updated dependencies [d6a7ea61a]
- Updated dependencies [e0e79b4fe]
- Updated dependencies [e602d6c1f]
- Updated dependencies [142ded732]
- Updated dependencies [3c4209068]
- Updated dependencies [fb794ce7b]
- Updated dependencies [e6fc58ae4]
- Updated dependencies [6fffd3b54]
- Updated dependencies [a6451aece]
- Updated dependencies [987994909]
- Updated dependencies [40ac4b645]
- Updated dependencies [1bea9c200]
- Updated dependencies [6f755addd]
- Updated dependencies [844847e0b]
- Updated dependencies [6eab66050]
- Updated dependencies [db2d82901]
- Updated dependencies [c2b982749]
  - @clerk/backend@1.0.0
  - @clerk/shared@2.0.0
  - @clerk/clerk-react@5.0.0

## 5.0.0-beta.46

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-react@5.0.0-beta.41

## 5.0.0-beta.45

### Patch Changes

- Throw a descriptive error when a Clerk component that is using path-based routing is mounted in a non-catch-all route ([#3204](https://github.com/clerk/javascript/pull/3204)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`bab2e7e05`](https://github.com/clerk/javascript/commit/bab2e7e0590d0da1fd7db0680e63e8f2eb836b41)]:
  - @clerk/shared@2.0.0-beta.23
  - @clerk/backend@1.0.0-beta.37
  - @clerk/clerk-react@5.0.0-beta.40

## 5.0.0-beta.44

### Minor Changes

- Introduce experimental support for Google One Tap ([#3176](https://github.com/clerk/javascript/pull/3176)) by [@panteliselef](https://github.com/panteliselef)

  - React Component `<__experimental_GoogleOneTap/>`
  - JS `clerk.__experimental_mountGoogleOneTap(node,props)`

- Speed up loading of clerk-js by using a `<script/>` tag when html is generated. ([#3156](https://github.com/clerk/javascript/pull/3156)) by [@panteliselef](https://github.com/panteliselef)

  This is supported during SSR, SSG in

  - Next.js Pages Router
  - Next.js App Router

### Patch Changes

- Support older iOS 13.3 and 13.4 mobile devices ([#3188](https://github.com/clerk/javascript/pull/3188)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Introduce `debug: true` option for the `clerkMiddleware` helper ([#3189](https://github.com/clerk/javascript/pull/3189)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`ff08fe237`](https://github.com/clerk/javascript/commit/ff08fe237fa5a9ded04924b3c5821111836b49b6), [`f98e480b1`](https://github.com/clerk/javascript/commit/f98e480b1a9e41f5370efcd53aa6887af2ad6816), [`142ded732`](https://github.com/clerk/javascript/commit/142ded73265b776789b65404d96b6c91cfe15e98), [`fb794ce7b`](https://github.com/clerk/javascript/commit/fb794ce7b88001b98ad4a628bc2cc39a0c8ccfa5), [`e6fc58ae4`](https://github.com/clerk/javascript/commit/e6fc58ae4df5091eff00ba0d9045ce5ff0fff538)]:
  - @clerk/clerk-react@5.0.0-beta.39
  - @clerk/backend@1.0.0-beta.36
  - @clerk/shared@2.0.0-beta.22

## 5.0.0-beta.43

### Patch Changes

- Updated dependencies [[`7cb1241a9`](https://github.com/clerk/javascript/commit/7cb1241a9929b3d8a0d2157637734d82dd9fd852)]:
  - @clerk/backend@1.0.0-beta.35
  - @clerk/clerk-react@5.0.0-beta.38

## 5.0.0-beta.42

### Minor Changes

- Implement token signature verification when passing verified token from Next.js middleware to the application origin. ([#3121](https://github.com/clerk/javascript/pull/3121)) by [@BRKalow](https://github.com/BRKalow)

### Patch Changes

- Updated dependencies [[`ecb60da48`](https://github.com/clerk/javascript/commit/ecb60da48029b9cb2d17ab9b0a73cb92bc5c924b)]:
  - @clerk/backend@1.0.0-beta.34
  - @clerk/clerk-react@5.0.0-beta.37

## 5.0.0-beta.41

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-react@5.0.0-beta.36

## 5.0.0-beta.40

### Patch Changes

- Updated dependencies [[`63dfe8dc9`](https://github.com/clerk/javascript/commit/63dfe8dc92c28213db5c5644782e7d6751fa22a6), [`d22e6164d`](https://github.com/clerk/javascript/commit/d22e6164ddb765542e0e6335421d2ebf484af059)]:
  - @clerk/backend@1.0.0-beta.33
  - @clerk/clerk-react@5.0.0-beta.35

## 5.0.0-beta.39

### Minor Changes

- Allow manually passing a publishable/secret key pair to the `authMiddleware` and `clerkMiddleware` helpers. ([#3001](https://github.com/clerk/javascript/pull/3001)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Updated dependencies [[`fc3ffd880`](https://github.com/clerk/javascript/commit/fc3ffd88064a09ab98877dfba119150390f9296e), [`1fd2eff38`](https://github.com/clerk/javascript/commit/1fd2eff38dc71e45d2ff95a5b6e5a99cca53c6e7), [`987994909`](https://github.com/clerk/javascript/commit/987994909b7c462cc2b785f75afe4d621f5c960d), [`1bea9c200`](https://github.com/clerk/javascript/commit/1bea9c20090abdde962c7da1a859933e1cd51660)]:
  - @clerk/shared@2.0.0-beta.21
  - @clerk/backend@1.0.0-beta.32
  - @clerk/clerk-react@5.0.0-beta.34

## 5.0.0-beta.38

### Patch Changes

- Updated dependencies [[`988a299c0`](https://github.com/clerk/javascript/commit/988a299c0abf708e905592c29e394f8e4d79968e)]:
  - @clerk/backend@1.0.0-beta.31

## 5.0.0-beta.37

### Patch Changes

- Updated dependencies [[`8350109ab`](https://github.com/clerk/javascript/commit/8350109ab85909e0457199da1db0c9787d94001e)]:
  - @clerk/shared@2.0.0-beta.20
  - @clerk/backend@1.0.0-beta.30
  - @clerk/clerk-react@5.0.0-beta.33

## 5.0.0-beta.36

### Patch Changes

- Adds telemetry event to clerkMiddleware initialization, passes publishableKey to `createClerkClient()` internally. ([#3042](https://github.com/clerk/javascript/pull/3042)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies []:
  - @clerk/clerk-react@5.0.0-beta.32

## 5.0.0-beta.35

### Minor Changes

- Bump minimum nextjs@13 version to `13.5.4` from `13.0.4` to resolve vulnerabilities. ([#2983](https://github.com/clerk/javascript/pull/2983)) by [@dimkl](https://github.com/dimkl)

  ref: https://github.com/advisories/GHSA-c59h-r6p8-q9wc

### Patch Changes

- Updated dependencies [[`8c23651b8`](https://github.com/clerk/javascript/commit/8c23651b8c3ff1474057a7d62e3ddba939cb0b64), [`9272006e7`](https://github.com/clerk/javascript/commit/9272006e744fc906cfdee520d2dc6d7db141cc97), [`2671e7aa5`](https://github.com/clerk/javascript/commit/2671e7aa5081eb9ae38b92ee647f2e3fd824741f), [`66b283653`](https://github.com/clerk/javascript/commit/66b28365370bcbcdf4e51da39de58c7f8b1fc1b4)]:
  - @clerk/backend@1.0.0-beta.29
  - @clerk/clerk-react@5.0.0-beta.31

## 5.0.0-beta.34

### Minor Changes

- Expose debug headers in response for handshake / signed-out states from SDKs using headers returned from `authenticateRequest()` ([#2898](https://github.com/clerk/javascript/pull/2898)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`2964f8a47`](https://github.com/clerk/javascript/commit/2964f8a47e473fa8457a27104adb4d008613a0e3)]:
  - @clerk/backend@1.0.0-beta.28

## 5.0.0-beta.33

### Patch Changes

- Using auth().protect inside clerkMiddleware will perform a redirection instead of throwing a not found error when internal navigation in pages router occurs and the user is unauthenticated. ([#2942](https://github.com/clerk/javascript/pull/2942)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`c86f73be3`](https://github.com/clerk/javascript/commit/c86f73be382d01ec5f0ff5922ad907f429e63a58)]:
  - @clerk/clerk-react@5.0.0-beta.30

## 5.0.0-beta.32

### Patch Changes

- Updated dependencies [[`8350f73a6`](https://github.com/clerk/javascript/commit/8350f73a67f8980be78e3bd3343e772f5653d718)]:
  - @clerk/shared@2.0.0-beta.19
  - @clerk/backend@1.0.0-beta.27
  - @clerk/clerk-react@5.0.0-beta.29

## 5.0.0-beta.31

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-react@5.0.0-beta.28

## 5.0.0-beta.30

### Patch Changes

- Updated dependencies [[`e5c989a03`](https://github.com/clerk/javascript/commit/e5c989a035fa16413414c213febe16fcdbeef9b1), [`2ec9f6b09`](https://github.com/clerk/javascript/commit/2ec9f6b09f98ae276658d6dc705e16df0573d817)]:
  - @clerk/shared@2.0.0-beta.18
  - @clerk/backend@1.0.0-beta.26
  - @clerk/clerk-react@5.0.0-beta.27

## 5.0.0-beta.29

### Minor Changes

- Pass environment into `sdkMetadata` in order to detect if production clerk-js is used by other sdks in dev mode. When it is log dev warning from clerk-js. ([#2802](https://github.com/clerk/javascript/pull/2802)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`18c0d015d`](https://github.com/clerk/javascript/commit/18c0d015d20493e14049fed73a5b6f732372a5cf)]:
  - @clerk/clerk-react@5.0.0-beta.26

## 5.0.0-beta.28

### Patch Changes

- Make useAwaitableNavigate handle navigations between pages reliably ([#2899](https://github.com/clerk/javascript/pull/2899)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies []:
  - @clerk/clerk-react@5.0.0-beta.25

## 5.0.0-beta.27

### Patch Changes

- Updated dependencies [[`1834a3ee4`](https://github.com/clerk/javascript/commit/1834a3ee496ea27b9f7ceeb32ec5361f9de8ee30), [`15af02a83`](https://github.com/clerk/javascript/commit/15af02a837b0e87ea83f3a86dfacc149adca1345)]:
  - @clerk/shared@2.0.0-beta.17
  - @clerk/backend@1.0.0-beta.25
  - @clerk/clerk-react@5.0.0-beta.24

## 5.0.0-beta.26

### Patch Changes

- Updated dependencies [[`db18787c4`](https://github.com/clerk/javascript/commit/db18787c4d9fa8ee1306db9b65f3b3f5e2fe2dad)]:
  - @clerk/shared@2.0.0-beta.16
  - @clerk/backend@1.0.0-beta.24
  - @clerk/clerk-react@5.0.0-beta.23

## 5.0.0-beta.25

### Patch Changes

- Updated dependencies [[`6eab66050`](https://github.com/clerk/javascript/commit/6eab66050608a1bc5cb9aca6a234b1fea16106e5)]:
  - @clerk/shared@2.0.0-beta.15
  - @clerk/backend@1.0.0-beta.23
  - @clerk/clerk-react@5.0.0-beta.22

## 5.0.0-beta.24

### Patch Changes

- Updated dependencies [[`12f3c5c55`](https://github.com/clerk/javascript/commit/12f3c5c55580f93a81df27851fbc92ce1312107e)]:
  - @clerk/shared@2.0.0-beta.14
  - @clerk/backend@1.0.0-beta.22
  - @clerk/clerk-react@5.0.0-beta.21

## 5.0.0-beta.23

### Patch Changes

- Updated dependencies [[`051833167`](https://github.com/clerk/javascript/commit/0518331675ffb4d6c6830d79a1d61f9e4466773a)]:
  - @clerk/backend@1.0.0-beta.21
  - @clerk/clerk-react@5.0.0-beta.20

## 5.0.0-beta.22

### Patch Changes

- Rename beta-v5 to beta by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`2de442b24`](https://github.com/clerk/javascript/commit/2de442b2465cc5d424b8a0b21aa57c557f3aa2e7)]:
  - @clerk/backend@1.0.0-beta.20
  - @clerk/clerk-react@5.0.0-beta.19
  - @clerk/shared@2.0.0-beta.13

## 5.0.0-beta-v5.21

### Minor Changes

- Replace redirectUrl of protect with `unauthorizedUrl` and `unauthenticatedUrl`. ([#2672](https://github.com/clerk/javascript/pull/2672)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- The `auth().redirectToSignIn()` helper no longer needs to be explicitly returned when called within the middleware. The following examples are now equivalent: ([#2691](https://github.com/clerk/javascript/pull/2691)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  ```js
  // Before
  export default clerkMiddleware(auth => {
    if (protectedRoute && !auth.user) {
      return auth().redirectToSignIn()
    }
  })

  // After
  export default clerkMiddleware(auth => {
    if (protectedRoute && !auth.user) {
      auth().redirectToSignIn()
    }
  })
  ```

  Calling `auth().protect()` from a page will now automatically redirect back to the same page by setting `redirect_url` to the request url before the redirect to the sign-in URL takes place.

- Remove usage of useSearchParams() to avoid CSR de-opt. ([#2651](https://github.com/clerk/javascript/pull/2651)) by [@BRKalow](https://github.com/BRKalow)

- Export `EmailLinkErrorCode` from `/errors` module ([#2732](https://github.com/clerk/javascript/pull/2732)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Prevent Clerk component flickering when mounted in a Next.js app using App Router ([#2765](https://github.com/clerk/javascript/pull/2765)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Expose resources types ([#2660](https://github.com/clerk/javascript/pull/2660)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`6ac9e717a`](https://github.com/clerk/javascript/commit/6ac9e717a7ce8f09c1604f324add5e7e02041c07), [`966b31205`](https://github.com/clerk/javascript/commit/966b312050b572fbbbc07a6f0581cbec21847375), [`a8901be64`](https://github.com/clerk/javascript/commit/a8901be64fe91125a0d38a3c880ffa73168ccf5c), [`7b200af49`](https://github.com/clerk/javascript/commit/7b200af4908839ea661ddf2a76811057b545cafc), [`244de5ea3`](https://github.com/clerk/javascript/commit/244de5ea3a7641727cd85c544bb79fb04f2c0808), [`034c47ccb`](https://github.com/clerk/javascript/commit/034c47ccbef0129b9be9ff8aef683aa039e52602), [`ee57f21ac`](https://github.com/clerk/javascript/commit/ee57f21ac62fc2dd0d9d68b965f35081b538c85e), [`1affbb22a`](https://github.com/clerk/javascript/commit/1affbb22a040e210cfce8f72d52b7961057c02d1), [`8daf8451c`](https://github.com/clerk/javascript/commit/8daf8451cb564bc834dd856174ffc2cdfa932e37), [`7f751c4ef`](https://github.com/clerk/javascript/commit/7f751c4ef2d14410058cf65ea984a93b50c0b87e), [`4fced88ac`](https://github.com/clerk/javascript/commit/4fced88acc66a4837779d8bbca359086cddeec56), [`be991365e`](https://github.com/clerk/javascript/commit/be991365e1c78d0f1dfc59bb33dd533b6fad223a), [`c2b982749`](https://github.com/clerk/javascript/commit/c2b98274970bac5af33c9bb2e84c70ad90225180)]:
  - @clerk/clerk-react@5.0.0-beta-v5.18
  - @clerk/backend@1.0.0-beta-v5.19
  - @clerk/shared@2.0.0-beta-v5.12

## 5.0.0-beta-v5.20

### Patch Changes

- Infer the path the component is mounted at automatically in pages and app router ([#2634](https://github.com/clerk/javascript/pull/2634)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- The following paginated APIs now return `{ data, totalCount }` instead of simple arrays, in order to make building paginated UIs easier: ([#2633](https://github.com/clerk/javascript/pull/2633)) by [@dimkl](https://github.com/dimkl)

  - `clerkClient.users.getOrganizationMembershipList(...)`
  - `clerkClient.organization.getOrganizationList(...)`
  - `clerkClient.organization.getOrganizationInvitationList(...)`

  Revert changing the `{ data, errors }` return value of the following helpers to throw the `errors` or return the `data` (keep v4 format):

  - `import { verifyToken } from '@clerk/backend'`
  - `import { signJwt, hasValidSignature, decodeJwt, verifyJwt } from '@clerk/backend/jwt'`
  - BAPI `clerkClient` methods eg (`clerkClient.users.getUserList(...)`)

- Updated dependencies [[`8e5c881c4`](https://github.com/clerk/javascript/commit/8e5c881c40d7306c5dbd2e1f1803fbf75127bd71), [`d4ff346dd`](https://github.com/clerk/javascript/commit/d4ff346dd53bb3e1970e80bdc7b188c2dd344f12), [`a6308c67e`](https://github.com/clerk/javascript/commit/a6308c67e329879e001cee56cccd82e60b804422)]:
  - @clerk/backend@1.0.0-beta-v5.18
  - @clerk/shared@2.0.0-beta-v5.11
  - @clerk/clerk-react@5.0.0-beta-v5.17

## 5.0.0-alpha-v5.19

### Major Changes

- Replace return the value of the following jwt helpers to match the format of backend API client return values (for consistency). ([#2596](https://github.com/clerk/javascript/pull/2596)) by [@dimkl](https://github.com/dimkl)

  ```diff
  import { signJwt } from '@clerk/backend/jwt';

  - const { data, error } = await signJwt(...);
  + const { data, errors: [error] = [] } = await signJwt(...);
  ```

  ```diff
  import { verifyJwt } from '@clerk/backend/jwt';

  - const { data, error } = await verifyJwt(...);
  + const { data, errors: [error] = [] } = await verifyJwt(...);
  ```

  ```diff
  import { hasValidSignature } from '@clerk/backend/jwt';

  - const { data, error } = await hasValidSignature(...);
  + const { data, errors: [error] = [] } = await hasValidSignature(...);
  ```

  ```diff
  import { decodeJwt } from '@clerk/backend/jwt';

  - const { data, error } = await decodeJwt(...);
  + const { data, errors: [error] = [] } = await decodeJwt(...);
  ```

  ```diff
  import { verifyToken } from '@clerk/backend';

  - const { data, error } = await verifyToken(...);
  + const { data, errors: [error] = [] } = await verifyToken(...);
  ```

### Patch Changes

- - Export ClerkMiddlewareAuthObject, ClerkMiddlewareAuth and ClerkMiddlewareOptions types ([#2611](https://github.com/clerk/javascript/pull/2611)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  - Introduce `auth().redirectToSignIn()` that can be used in API routes and pages, eg

  ```ts
  import { auth } from '@clerk/nextjs/server';

  export const Layout = ({ children }) => {
    const { userId } = auth();

    if (!userId) {
      return auth().redirectToSignIn();
    }

    return <>{children}</>;
  };
  ```

- Update `@clerk/nextjs` error messages to refer to `clerkMiddleware()` and deprecated `authMiddleware()` and fix a typo in `cannotRenderSignUpComponentWhenSessionExists` error message. ([#2589](https://github.com/clerk/javascript/pull/2589)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`3a2f13604`](https://github.com/clerk/javascript/commit/3a2f13604e1b8b351a05de26d2c0672503aa67b3), [`9e99eb727`](https://github.com/clerk/javascript/commit/9e99eb7276249c68ef6f930cce418ce0004653b9), [`6fffd3b54`](https://github.com/clerk/javascript/commit/6fffd3b542f3df0bcb49281b7c4f77209a83f7a1)]:
  - @clerk/backend@1.0.0-alpha-v5.17

## 5.0.0-alpha-v5.18

### Patch Changes

- Update README for v5 ([#2577](https://github.com/clerk/javascript/pull/2577)) by [@LekoArts](https://github.com/LekoArts)

- Introduce `createRouteMatcher` which is designed to generate and return a function that evaluates whether a given Request object matches a set of predefined routes. It provides flexibility in defining these routes through various patterns, including glob patterns, regular expressions, and custom functions. This composable helper can be used in combination with the `clerkMiddleware` helper to easily protect specific routes, eg: ([#2572](https://github.com/clerk/javascript/pull/2572)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  ```ts
  import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

  const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

  export default clerkMiddleware((auth, request) => {
    if (isProtectedRoute(request)) {
      auth().protect();
    }
  });
  ```

- Fix partial prerendering error when using NextJS by correctly rethrowing partial prerendering (PPR) error. ([#2518](https://github.com/clerk/javascript/pull/2518)) by [@juliuslipp](https://github.com/juliuslipp)

- Updated dependencies [[`935b0886e`](https://github.com/clerk/javascript/commit/935b0886e8317445f30c92000a27ed68e1223ff6), [`6a769771c`](https://github.com/clerk/javascript/commit/6a769771c975996d8d52b35b5cfdbae5dcec85d4)]:
  - @clerk/backend@1.0.0-alpha-v5.16

## 5.0.0-alpha-v5.17

### Minor Changes

- Replace the `Clerk-Backend-SDK` header with `User-Agent` in BAPI requests and update it's value to contain both the package name and the package version of the clerk package ([#2558](https://github.com/clerk/javascript/pull/2558)) by [@dimkl](https://github.com/dimkl)

  executing the request. Eg request from `@clerk/nextjs` to BAPI with append `User-Agent: @clerk/nextjs@5.0.0-alpha-v5.16` using the latest version.

  Miscellaneous changes: The backend test build changed to use tsup.

### Patch Changes

- Export MultisessionAppSupport from @clerk/nextjs/internal ([#2553](https://github.com/clerk/javascript/pull/2553)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`799abc281`](https://github.com/clerk/javascript/commit/799abc281182efb953dd6637f9db7fc61c71a2cd), [`8cc45d2af`](https://github.com/clerk/javascript/commit/8cc45d2af98320ccced3768fb039b86576e424a5), [`b4e79c1b9`](https://github.com/clerk/javascript/commit/b4e79c1b9ab8e14cbfccaf290f0f596da0416e13), [`db2d82901`](https://github.com/clerk/javascript/commit/db2d829013722957332bcf03928685a4771f9a3c)]:
  - @clerk/backend@1.0.0-alpha-v5.15
  - @clerk/clerk-react@5.0.0-alpha-v5.16
  - @clerk/shared@2.0.0-alpha-v5.10

## 5.0.0-alpha-v5.16

### Patch Changes

- Updated dependencies [[`448e02e93`](https://github.com/clerk/javascript/commit/448e02e93cf2392878d5891009640c52103d99a8), [`e6ecbaa2f`](https://github.com/clerk/javascript/commit/e6ecbaa2ff7add95bf888cb4ce43457b9fde7a13), [`e921af259`](https://github.com/clerk/javascript/commit/e921af259e9bdc8810a830bed54d71cf8eced1f8), [`e9841dd91`](https://github.com/clerk/javascript/commit/e9841dd91897a7ebb468b14e272ce06154795389), [`59f9a7296`](https://github.com/clerk/javascript/commit/59f9a72968fb49add6d9031158c791ac60a161b9)]:
  - @clerk/backend@1.0.0-alpha-v5.14
  - @clerk/clerk-react@5.0.0-alpha-v5.15

## 5.0.0-alpha-v5.15

### Patch Changes

- Fix property `Page`/ `Link` missing from the `UserProfile` / `OrganizationProfile` ([#2508](https://github.com/clerk/javascript/pull/2508)) by [@dimkl](https://github.com/dimkl)

  when imported from `@clerk/nextjs` or `@clerk/remix`.

- Updated dependencies [[`1dc28ab46`](https://github.com/clerk/javascript/commit/1dc28ab46f6930074334be183c637ce7a81bebf7), [`ea4933655`](https://github.com/clerk/javascript/commit/ea4933655863ce315324aa2a3be7d5f263c2b61f), [`38d8b3e8a`](https://github.com/clerk/javascript/commit/38d8b3e8a0387bcf0b9c8d16e3bbfcfe9b643ca2)]:
  - @clerk/shared@2.0.0-alpha-v5.9
  - @clerk/backend@1.0.0-alpha-v5.13
  - @clerk/clerk-react@5.0.0-alpha-v5.14

## 5.0.0-alpha-v5.14

### Patch Changes

- Introduce the new `clerkMiddleware` helper to allow for more flexibility in how Clerk is integrated into your Next.js middleware. Example usage can be found below, for more details, For more details, please see the [clerkMiddleware](https://clerk.com/docs/references/nextjs/clerkMiddleware) documentation. ([#2404](https://github.com/clerk/javascript/pull/2404)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  The `clerkMiddleware` helper effectively replaces the older `authMiddleware` helper, which is now considered deprecated and will be removed in the next major release.

  ### 1. Protect a route that requires authentication

  ```js
  import { clerkMiddleware } from '@clerk/nextjs/server';

  export default clerkMiddleware(auth => {
    const { userId } = auth().protect();
    // userId is now available for use in your route handler
    // for page requests, calling protect will automatically redirect the user to the sign-in URL if they are not authenticated
    return NextResponse.next();
  });
  ```

  ### 2. Protect a route that requires specific permissions

  ```js
  import { clerkMiddleware } from '@clerk/nextjs/server';

  export default clerkMiddleware(auth => {
    const { userId } = auth().protect({ permission: 'org:domains:delete' });
    // userId is now available for use in your route handler
    // for page requests, calling protect will automatically throw a notFound error if the user does not have the required permissions
    return NextResponse.next();
  });
  ```

  ### 2. Manually redirect to sign-in URL using the redirectToSignIn helper

  ```js
  import { clerkMiddleware } from '@clerk/nextjs/server';

  export default clerkMiddleware(auth => {
    // If you want more fine-grained control, you can always use the low-level redirectToSignIn helper
    if (!auth().userId) {
      return auth().redirectToSignIn();
    }

    return NextResponse.next();
  });
  ```

  This commit also introduces the experimental `createRouteMatcher` helper, which can be used to create a route matcher that matches a route against the current request. This is useful for creating custom logic based on which routes you want to handle as protected or public.

  ```js
  import { clerkMiddleware, experimental_createRouteMatcher } from '@clerk/nextjs/server';

  const isProtectedRoute = experimental_createRouteMatcher([/protected.*/]);

  export default clerkMiddleware((auth, request) => {
    if (isProtectedRoute(request)) {
      auth().protect();
    }

    return NextResponse.next();
  });
  ```

- Updated dependencies [[`7ecd6f6ab`](https://github.com/clerk/javascript/commit/7ecd6f6abb0e5bfb1a57c99cc11860de311c3e82)]:
  - @clerk/shared@2.0.0-alpha-v5.8
  - @clerk/backend@1.0.0-alpha-v5.12
  - @clerk/clerk-react@5.0.0-alpha-v5.13

## 5.0.0-alpha-v5.13

### Major Changes

- Path-based routing is now the default routing strategy if the `path` prop is filled. Additionally, if the `path` and `routing` props are not filled, an error will be thrown. ([#2338](https://github.com/clerk/javascript/pull/2338)) by [@octoper](https://github.com/octoper)

  ```jsx

  // Without path or routing props, an error with be thrown
  <UserProfile />
  <CreateOrganization />
  <OrganizationProfile />
  <SignIn />
  <SignUp />

  // Alternative #1
  <UserProfile path="/whatever"/>
  <CreateOrganization path="/whatever"/>
  <OrganizationProfile path="/whatever"/>
  <SignIn path="/whatever"/>
  <SignUp path="/whatever"/>

  // Alternative #2
  <UserProfile routing="hash_or_virtual"/>
  <CreateOrganization routing="hash_or_virtual"/>
  <OrganizationProfile routing="hash_or_virtual"/>
  <SignIn routing="hash_or_virtual"/>
  <SignUp routing="hash_or_virtual"/>
  ```

### Patch Changes

- Updated dependencies [[`f4f99f18d`](https://github.com/clerk/javascript/commit/f4f99f18de0be8afaae9f52599deb2814ab235e7), [`cfea3d9c0`](https://github.com/clerk/javascript/commit/cfea3d9c00950eee8d7e942d88bee1a56a5f842b), [`fe2607b6f`](https://github.com/clerk/javascript/commit/fe2607b6fdeed83002db7e4a0c040ac0280e5ff7), [`bad4de1a2`](https://github.com/clerk/javascript/commit/bad4de1a2fd8a3e2643fe26677801166a8305c29), [`2e4a43017`](https://github.com/clerk/javascript/commit/2e4a43017ef33b541949ba90e16bf5311ce8bc60), [`f5fb63cf1`](https://github.com/clerk/javascript/commit/f5fb63cf1dd51cd6cd0dba4d9eef871695ef06c3), [`e7e2a1eae`](https://github.com/clerk/javascript/commit/e7e2a1eae2ed726ab49894dd195185c8f4e70acd)]:
  - @clerk/backend@1.0.0-alpha-v5.11
  - @clerk/clerk-react@5.0.0-alpha-v5.12

## 5.0.0-alpha-v5.12

### Major Changes

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

- Changes in exports of `@clerk/backend`: ([#2363](https://github.com/clerk/javascript/pull/2363)) by [@dimkl](https://github.com/dimkl)

  - Expose the following helpers and enums from `@clerk/backend/internal`:
    ```typescript
    import {
      AuthStatus,
      buildRequestUrl,
      constants,
      createAuthenticateRequest,
      createIsomorphicRequest,
      debugRequestState,
      makeAuthObjectSerializable,
      prunePrivateMetadata,
      redirect,
      sanitizeAuthObject,
      signedInAuthObject,
      signedOutAuthObject,
    } from '@clerk/backend/internal';
    ```
  - Drop the above exports from the top-level api:
    ```typescript
    // Before
    import { AuthStatus, ... } from '@clerk/backend';
    // After
    import { AuthStatus, ... } from '@clerk/backend/internal';
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.

- Changes in exports of `@clerk/backend`: ([#2365](https://github.com/clerk/javascript/pull/2365)) by [@dimkl](https://github.com/dimkl)

  - Drop the following internal exports from the top-level api:
    ```typescript
    // Before
    import {
      AllowlistIdentifier,
      Client,
      DeletedObject,
      Email,
      EmailAddress,
      ExternalAccount,
      IdentificationLink,
      Invitation,
      OauthAccessToken,
      ObjectType,
      Organization,
      OrganizationInvitation,
      OrganizationMembership,
      OrganizationMembershipPublicUserData,
      PhoneNumber,
      RedirectUrl,
      SMSMessage,
      Session,
      SignInToken,
      Token,
      User,
      Verification,
    } from '@clerk/backend';
    // After : no alternative since there is no need to use those classes
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.
  - Keep those 3 resource related type exports
    ```typescript
    import type { Organization, Session, User, WebhookEvent, WebhookEventType } from '@clerk/backend';
    ```

- Changes in exports of `@clerk/backend`: ([#2364](https://github.com/clerk/javascript/pull/2364)) by [@dimkl](https://github.com/dimkl)

  - Expose the following helpers and enums from `@clerk/backend/jwt`:
    ```typescript
    import { decodeJwt, hasValidSignature, signJwt, verifyJwt } from '@clerk/backend/jwt';
    ```
  - Drop the above exports from the top-level api:
    ```typescript
    // Before
    import { decodeJwt, ... } from '@clerk/backend';
    // After
    import { decodeJwt, ... } from '@clerk/backend/jwt';
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.

- Changes in `@clerk/backend` exports: ([#2362](https://github.com/clerk/javascript/pull/2362)) by [@dimkl](https://github.com/dimkl)

  - Drop Internal `deserialize` helper
  - Introduce `/errors` subpath export, eg:
    ```typescript
    import {
      TokenVerificationError,
      TokenVerificationErrorAction,
      TokenVerificationErrorCode,
      TokenVerificationErrorReason,
    } from '@clerk/backend/errors';
    ```
  - Drop errors from top-level export
    ```typescript
    // Before
    import { TokenVerificationError, TokenVerificationErrorReason } from '@clerk/backend';
    // After
    import { TokenVerificationError, TokenVerificationErrorReason } from '@clerk/backend/errors';
    ```

- Use `NEXT_PUBLIC_CLERK_JS_URL` instead of `NEXT_PUBLIC_CLERK_JS` to pin a specific @clerk/clerk-js version. ([#2374](https://github.com/clerk/javascript/pull/2374)) by [@SokratisVidros](https://github.com/SokratisVidros)

### Patch Changes

- Updated dependencies [[`2a67f729d`](https://github.com/clerk/javascript/commit/2a67f729da58b3400df24da634fc4bf786065f25), [`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7), [`1e98187b4`](https://github.com/clerk/javascript/commit/1e98187b4fba0f872576510d7bccf8b75a2579bd), [`d08ec6d8f`](https://github.com/clerk/javascript/commit/d08ec6d8f52a2bc037c0eb586123a9f7816e4b64), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`a9fe242be`](https://github.com/clerk/javascript/commit/a9fe242be4dbaaa02c6643fea0688f1fb23f23e7), [`0ec3a146c`](https://github.com/clerk/javascript/commit/0ec3a146cc4cbe4a80d1f990a440431ae4490183), [`1ad910eb9`](https://github.com/clerk/javascript/commit/1ad910eb92dce056731f29df0caaaad74d08bd7f), [`f58a9949b`](https://github.com/clerk/javascript/commit/f58a9949bc78737ca4e096ed5501b4e578a2d493), [`9b02c1aae`](https://github.com/clerk/javascript/commit/9b02c1aae1cae286ea305c5e216ae93cbbbc0f90)]:
  - @clerk/clerk-react@5.0.0-alpha-v5.11
  - @clerk/backend@1.0.0-alpha-v5.10
  - @clerk/shared@2.0.0-alpha-v5.7

## 5.0.0-alpha-v5.11

### Major Changes

- Drop support for NextJS v12: v12 was released on 26 Oct 2021. Support for security updates stopped on 21 Nov 2022. ([#2347](https://github.com/clerk/javascript/pull/2347)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  Drop support for NextJS <13.0.4: Various header-related bugs were introduced with the 12.1.0, 12.2.0, 13.0.1, 13.0.2, 13.0.3 NextJS releases which are now fixed since next@^13.0.4. We will be dropping support for these problematic versions in order to greatly reduce complexity in our codebase.

  Drop support for NextJS < 14.0.3 because of the issues described here: https://github.com/clerk/javascript/issues/1436.

  Deprecate `authMiddleware` in favor of `clerkMiddleware`. For more information, see https://clerk.com/docs/upgrade-guides/v5-introduction

  Move the server-side APIs from `@clerk/nextjs` to the `@clerk/nextjs/server` module: `WebhookEventType`, `WebhookEvent`, `verifyToken`, `redirectToSignIn`, `auth`, `buildClerkProps`, `clerkClient`, `currentUser`, `getAuth`, `redirectToSignUp` and `authMiddleware`. For more information, see https://clerk.com/docs/upgrade-guides/v5-introduction

### Patch Changes

- Updated dependencies [[`e602d6c1f`](https://github.com/clerk/javascript/commit/e602d6c1fde7a7757d292f24dfaddecd14ac1623)]:
  - @clerk/backend@1.0.0-alpha-v5.9

## 5.0.0-alpha-v5.10

### Major Changes

- - Introduce `@clerk/clerk-react/errors` and `@clerk/clerk-react/internal` subpath exports to expose some internal utilities. Eg ([#2328](https://github.com/clerk/javascript/pull/2328)) by [@dimkl](https://github.com/dimkl)

    ```typescript
    // Before
    import { __internal__setErrorThrowerOptions } from '@clerk/clerk-react';
    // After
    import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';

    // Before
    import { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react';
    // After
    import {
      isClerkAPIResponseError,
      isEmailLinkError,
      isKnownError,
      isMetamaskError,
    } from '@clerk/clerk-react/errors';

    // Before
    import { MultisessionAppSupport } from '@clerk/clerk-react';
    // After
    import { MultisessionAppSupport } from '@clerk/clerk-react/internal';
    ```

  - Drop from the `@clerk/clerk-react` and all other clerk-react wrapper packages:
    - `__internal__setErrorThrowerOptions` internal utility (moved to /internal subpath)
    - `WithClerkProp` type
    - `MultisessionAppSupport` component (moved to /internal subpath)
    - `EmailLinkErrorCode` enum
  - Drop `StructureContext` and related errors to reduce to reduce code complexity since it seems that it was not being used.
  - Drop `withUser`, `WithUser`, `withClerk` HOFs and `WithClerk`, `withSession`, `WithSession` HOCs from the `@clerk/clerk-react`
    to reduce the export surface since it's trivial to implement if needed.

- (Note: This is only relevant if, in the unlikely case, you are using `Clerk` from `@clerk/nextjs` directly. If not, you can safely ignore this change.) ([#2317](https://github.com/clerk/javascript/pull/2317)) by [@tmilewski](https://github.com/tmilewski)

  Remove the named `Clerk` import from `@clerk/nextjs` and import `createClerkClient` instead. The latter is a factory method to create a Clerk client instance for you. This update aligns usage across our SDKs and will enable us to ship DX improvements better in the future.

  ```js
  import { Clerk } from '@clerk/nextjs';
  const clerk = Clerk({ secretKey: '...' });
  ```

  You need to rename the import from `Clerk` to `createClerkClient` and change its usage:

  ```js
  import { createClerkClient } from '@clerk/nextjs';
  const clerk = createClerkClient({ secretKey: '...' });
  ```

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

- Update NextJS quickstart link in error message ([#2355](https://github.com/clerk/javascript/pull/2355)) by [@dimkl](https://github.com/dimkl)

- Accept `redirectUrl` as an option for `auth().protect()`. ([#2329](https://github.com/clerk/javascript/pull/2329)) by [@panteliselef](https://github.com/panteliselef)

  For example:

  ```ts
  // Authorization
  auth().protect({ role: 'org:admin' }, { redirectUrl: '/any-page' });
  auth().protect({ permission: 'org:settings:manage' }, { redirectUrl: '/any-page' });

  // Authentication
  auth().protect({ redirectUrl: '/any-page' });
  ```

- Updated dependencies [[`896cb6104`](https://github.com/clerk/javascript/commit/896cb610409f84c0ff7a4f502f0b4ccee1afc157), [`02976d494`](https://github.com/clerk/javascript/commit/02976d49473958b8c3fea38d4e389dc1bee7e8c4), [`8aea39cd6`](https://github.com/clerk/javascript/commit/8aea39cd6907e3a8ac01091aa6df64ebd6a42ed2), [`86d52fb5c`](https://github.com/clerk/javascript/commit/86d52fb5cf68f1dc7adf617605b922134e21268f), [`ab4eb56a5`](https://github.com/clerk/javascript/commit/ab4eb56a5c34baf496ebb8ac412ad6171b9bd79c), [`46040a2f3`](https://github.com/clerk/javascript/commit/46040a2f34d0991072fca490e031c1994b2e2296), [`75ea300bc`](https://github.com/clerk/javascript/commit/75ea300bce16a0ce401a225263bb267ad2a217b8), [`844847e0b`](https://github.com/clerk/javascript/commit/844847e0becf20243fba3c659b2b77a238dd270a)]:
  - @clerk/shared@2.0.0-alpha-v5.6
  - @clerk/backend@1.0.0-alpha-v5.8
  - @clerk/clerk-react@5.0.0-alpha-v5.10

## 5.0.0-alpha-v5.9

### Major Changes

- Limit TokenVerificationError exports to TokenVerificationError and TokenVerificationErrorReason ([#2189](https://github.com/clerk/javascript/pull/2189)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Updated dependencies [[`de6519daa`](https://github.com/clerk/javascript/commit/de6519daa84732023bcfd74ad816a2654f457952), [`7bffc47cb`](https://github.com/clerk/javascript/commit/7bffc47cb71a2c3e026df5977c25487bfd5c55d7), [`7af0949ae`](https://github.com/clerk/javascript/commit/7af0949ae7b4072f550dee220f4d41854fe504c6), [`e1f7eae87`](https://github.com/clerk/javascript/commit/e1f7eae87531b483564256f5456a31150caa469e)]:
  - @clerk/backend@1.0.0-alpha-v5.7
  - @clerk/clerk-react@5.0.0-alpha-v5.9

## 5.0.0-alpha-v5.8

### Patch Changes

- Drop the introduction of `OrganizationRole` and `OrganizationPermission` resources fro BAPI. ([#2252](https://github.com/clerk/javascript/pull/2252)) by [@panteliselef](https://github.com/panteliselef)

- Set correct information on required Node.js and React versions in README ([#2264](https://github.com/clerk/javascript/pull/2264)) by [@LekoArts](https://github.com/LekoArts)

- Ensure that cookies set inside Next.js Middleware are correctly passed through while using [`authMiddleware`](https://clerk.com/docs/references/nextjs/auth-middleware). ([#2244](https://github.com/clerk/javascript/pull/2244)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`93d05c868`](https://github.com/clerk/javascript/commit/93d05c8680ed213e594a16d4630a65f8eb244b32), [`a6b893d28`](https://github.com/clerk/javascript/commit/a6b893d281b23dc7b4bd7f3733b33e4cf655bc1b), [`2e77cd737`](https://github.com/clerk/javascript/commit/2e77cd737a333de022533d29cb12e73a907694c8), [`d30ea1faa`](https://github.com/clerk/javascript/commit/d30ea1faa45074e09c037530e8ba3ca2dbd50654)]:
  - @clerk/backend@1.0.0-alpha-v5.6
  - @clerk/clerk-react@5.0.0-alpha-v5.8
  - @clerk/shared@2.0.0-alpha-v5.5

## 5.0.0-alpha-v5.7

### Patch Changes

- Updated dependencies [[`4b8bedc66`](https://github.com/clerk/javascript/commit/4b8bedc66d47dca5c6192148f4b31ae6d49ff733), [`c776f86fb`](https://github.com/clerk/javascript/commit/c776f86fb2a999dcae46fda9abb5005718c354b2), [`6e54b1b59`](https://github.com/clerk/javascript/commit/6e54b1b590ccdbc7002bde151093d78c217de391), [`c9e0f68af`](https://github.com/clerk/javascript/commit/c9e0f68af1a5cf07dc373ff45999c72d3d86f8f9), [`d6a7ea61a`](https://github.com/clerk/javascript/commit/d6a7ea61a8ae64c93877ec117e54fc48b1c86f16)]:
  - @clerk/shared@2.0.0-alpha-v5.4
  - @clerk/clerk-react@5.0.0-alpha-v5.7
  - @clerk/backend@1.0.0-alpha-v5.5

## 5.0.0-alpha-v5.6

### Major Changes

- Fix a bug where navigating from the sign in page to the sign up page required two back button presses to go back. ([#1304](https://github.com/clerk/javascript/pull/1304)) by [@desiprisg](https://github.com/desiprisg)

- Use the new `routerPush` and `routerReplace` props for `<ClerkProvider />` instead of `navigate`. ([#1304](https://github.com/clerk/javascript/pull/1304)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-react@5.0.0-alpha-v5.6

## 5.0.0-alpha-v5.5

### Patch Changes

- Updated dependencies [[`03079579d`](https://github.com/clerk/javascript/commit/03079579d2b48a9a6969702814449382098d2cfb), [`12962bc58`](https://github.com/clerk/javascript/commit/12962bc58e2c9caad416ba4e6d52061d00bc2feb)]:
  - @clerk/backend@1.0.0-alpha-v5.4
  - @clerk/clerk-react@5.0.0-alpha-v5.5

## 5.0.0-alpha-v5.4

### Minor Changes

- - By default, all the components with routing will have the `routing` prop assigned as `'path'` by default when the `path` prop is filled. ([#1957](https://github.com/clerk/javascript/pull/1957)) by [@octoper](https://github.com/octoper)

  - The `<UserButton />` component will set the default value of the `userProfileMode` prop to `'navigation'` if the `userProfileUrl` prop is provided.
  - The `<OrganizationSwitcher />` component will have the `organizationProfileMode` and `createOrganizationMode` props assigned with `'navigation'` by default if the `organizationProfileUrl` and `createOrganizationUrl` props are filled accordingly.

### Patch Changes

- Updated dependencies [[`7f6a64f43`](https://github.com/clerk/javascript/commit/7f6a64f4335832c66ff355f6d2f311f33a313d59)]:
  - @clerk/clerk-react@5.0.0-alpha-v5.4

## 5.0.0-alpha-v5.3

### Major Changes

- Upgrade React version to >=18 and add react-dom as peer dependency ([#2164](https://github.com/clerk/javascript/pull/2164)) by [@dimkl](https://github.com/dimkl)

  to fix issues with vite & rollup building.

### Minor Changes

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

- Add OrganizationPermissionAPI for CRUD operations regarding instance level organization permissions. ([#2178](https://github.com/clerk/javascript/pull/2178)) by [@panteliselef](https://github.com/panteliselef)

- Introduces telemetry collection from Clerk's SDKs. Collected telemetry will be used to gain insights into product usage and help drive roadmap priority. For more information, see https://clerk.com/docs/telemetry. ([#2154](https://github.com/clerk/javascript/pull/2154)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`b3a3dcdf4`](https://github.com/clerk/javascript/commit/b3a3dcdf4a8fa75c0dee4c55ab8fedebd49fdfd4), [`4aaf5103d`](https://github.com/clerk/javascript/commit/4aaf5103d3132f4e1ae76b861fa6ce0aae02ecbe), [`52ff8fe6b`](https://github.com/clerk/javascript/commit/52ff8fe6b6ff88ceb5e1246378b54b0565bede9d), [`4bb57057e`](https://github.com/clerk/javascript/commit/4bb57057e9af20fc433626ed178d97d3ca811362), [`4aaf5103d`](https://github.com/clerk/javascript/commit/4aaf5103d3132f4e1ae76b861fa6ce0aae02ecbe), [`0ce0edc28`](https://github.com/clerk/javascript/commit/0ce0edc283849a88b14b4b0df53b6858ed3a4f80), [`40ac4b645`](https://github.com/clerk/javascript/commit/40ac4b645f449b546dae5b4c0d013c9d9ea6d09c)]:
  - @clerk/backend@1.0.0-alpha-v5.3
  - @clerk/shared@2.0.0-alpha-v5.3
  - @clerk/clerk-react@5.0.0-alpha-v5.3

## 5.0.0-alpha-v5.2

### Major Changes

- Change the minimal Node.js version required by Clerk to `18.17.0`. ([#2162](https://github.com/clerk/javascript/pull/2162)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`c2a090513`](https://github.com/clerk/javascript/commit/c2a0905132684a4a1e8d598b66caddf20062273e)]:
  - @clerk/backend@1.0.0-alpha-v5.2
  - @clerk/shared@2.0.0-alpha-v5.2
  - @clerk/clerk-react@5.0.0-alpha-v5.2

## 5.0.0-alpha-v5.1

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

- Change the response payload of Backend API requests to return `{ data, errors }` instead of return the data and throwing on error response. ([#2126](https://github.com/clerk/javascript/pull/2126)) by [@dimkl](https://github.com/dimkl)

  Code example to keep the same behavior:

  ```typescript
  import { users } from '@clerk/backend';
  import { ClerkAPIResponseError } from '@clerk/shared/error';

  const { data, errors, clerkTraceId, status, statusText } = await users.getUser('user_deadbeef');
  if (errors) {
    throw new ClerkAPIResponseError(statusText, {
      data: errors,
      status,
      clerkTraceId,
    });
  }
  ```

### Minor Changes

- Move and export the following from @clerk/clerk-js and @clerk/nextjs to @clerk/shared: ([#2149](https://github.com/clerk/javascript/pull/2149)) by [@dimkl](https://github.com/dimkl)

      - `DEV_BROWSER_SSO_JWT_PARAMETER`
      - `DEV_BROWSER_JWT_MARKER`
      - `DEV_BROWSER_SSO_JWT_KEY`
      - `setDevBrowserJWTInURL`
      - `getDevBrowserJWTFromURL`
      - `getDevBrowserJWTFromResponse`

### Patch Changes

- Fixes the docs link pointing to clerk.com/docs in the `authAuthHeaderMissing` error by removing the trailing `.` ([#2077](https://github.com/clerk/javascript/pull/2077)) by [@marcadrian-it](https://github.com/marcadrian-it)

- Add Autocomplete TS generic for union literals ([#2132](https://github.com/clerk/javascript/pull/2132)) by [@tmilewski](https://github.com/tmilewski)

- Updated dependencies [[`64d3763ec`](https://github.com/clerk/javascript/commit/64d3763ec73747ad04c4b47017195cf4114e150c), [`deac67c1c`](https://github.com/clerk/javascript/commit/deac67c1c40d6d3ccc3559746c0c31cc29a93b84), [`83e9d0846`](https://github.com/clerk/javascript/commit/83e9d08469e7c2840f06aa7d86831055e23f67a5), [`7f833da9e`](https://github.com/clerk/javascript/commit/7f833da9ebc1b2ec9c65513628c377d0584e5d72), [`492b8a7b1`](https://github.com/clerk/javascript/commit/492b8a7b12f14658a384566012e5807f0a171710), [`2a22aade8`](https://github.com/clerk/javascript/commit/2a22aade8c9bd1f83a9be085983f96fa87903804), [`dd5703013`](https://github.com/clerk/javascript/commit/dd57030133fb8ce98681ff0bcad7e53ee826bb0e), [`9615e6cda`](https://github.com/clerk/javascript/commit/9615e6cda8fb1cbc3c2e464e6e891d56e245fac4), [`cace85374`](https://github.com/clerk/javascript/commit/cace85374cb0bb13578cf63fe1f3e6ee59f7f3c2), [`0d1052ac2`](https://github.com/clerk/javascript/commit/0d1052ac284b909786fd0e4744b02fcf4d1a8be6), [`5471c7e8d`](https://github.com/clerk/javascript/commit/5471c7e8dd0155348748fa90e5ae97093f59efe9), [`477170962`](https://github.com/clerk/javascript/commit/477170962f486fd4e6b0653a64826573f0d8621b), [`e0e79b4fe`](https://github.com/clerk/javascript/commit/e0e79b4fe47f64006718d547c898b9f67fe4d424), [`3c4209068`](https://github.com/clerk/javascript/commit/3c42090688166b74badfdefc7ed8c428601a0ba7), [`a6451aece`](https://github.com/clerk/javascript/commit/a6451aecef0bac578b295b524f1246dede3a7598)]:
  - @clerk/shared@2.0.0-alpha-v5.1
  - @clerk/backend@1.0.0-alpha-v5.1
  - @clerk/clerk-react@5.0.0-alpha-v5.1

## 5.0.0-alpha-v5.0

### Major Changes

- Drop deprecations. Migration steps: ([#2006](https://github.com/clerk/javascript/pull/2006)) by [@dimkl](https://github.com/dimkl)

  - use `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` instead of `NEXT_PUBLIC_CLERK_FRONTEND_API` env variable
  - use `NEXT_PUBLIC_CLERK_JS_VERSION` instead of `CLERK_JS_VERSION`
  - use `CLERK_SECRET_KEY` instead of `CLERK_API_KEY`
  - use `publishableKey` instead of `frontendApi`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`
  - use `@clerk/nextjs` instead of `@clerk/nextjs/app-beta`
  - use `@clerk/nextjs` instead of `@clerk/nextjs/ssr`
  - use `@clerk/nextjs` instead of `@clerk/nextjs/edge-middleware` or `@clerk/nextjs/edge-middlewarefiles`
  - use `@clerk/nextjs` instead of `@clerk/nextjs/api`
  - use middleware with `authMiddleware` instead of `withClerkMiddleware`
  - avoid using exported constants: `API_URL`, `API_VERSION`, `CLERK_JS_URL`, `CLERK_JS_VERSION`, `DOMAIN`, `IS_SATELLITE`, `PROXY_URL`, `PUBLISHABLE_KEY`, `SECRET_KEY`, `SIGN_IN_URL`, `SIGN_UP_URL`

- Internal update default apiUrl domain from clerk.dev to clerk.com ([#1878](https://github.com/clerk/javascript/pull/1878)) by [@dimkl](https://github.com/dimkl)

- Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

- Drop `user`, `session`, and `organization` resources from the returned value of `auth()`. ([#1947](https://github.com/clerk/javascript/pull/1947)) by [@panteliselef](https://github.com/panteliselef)

### Minor Changes

- Experimental support for `<Gate/>` with role checks. ([#1942](https://github.com/clerk/javascript/pull/1942)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Introduce `isTruthy` helper to better cast environment variables to a boolean. Previously only the string `"true"` was checked, now `true`, `"true"`, `"1"`, and `1` will work. ([#2002](https://github.com/clerk/javascript/pull/2002)) by [@LekoArts](https://github.com/LekoArts)

- Ignore `.test.ts` files for the build output. Should result in smaller bundle size. ([#2005](https://github.com/clerk/javascript/pull/2005)) by [@LekoArts](https://github.com/LekoArts)

- Fix type inferance for auth helper. ([#2047](https://github.com/clerk/javascript/pull/2047)) by [@panteliselef](https://github.com/panteliselef)

- Improve the default value for `CLERK_API_URL` by utilizing the publishable key to differentiate between local, staging and prod environments. ([#1955](https://github.com/clerk/javascript/pull/1955)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`743c4d204`](https://github.com/clerk/javascript/commit/743c4d20423790b554e66923466081c0d3b0d9ed), [`791c49807`](https://github.com/clerk/javascript/commit/791c49807c3c9e19964cbf621c935d237caeecf3), [`a68eb3083`](https://github.com/clerk/javascript/commit/a68eb3083ff68459cd33098e2df190a5ba26c841), [`ef2325dcc`](https://github.com/clerk/javascript/commit/ef2325dcc18729e9ce9ee5823e9a963efa51dbc1), [`8b6b094b9`](https://github.com/clerk/javascript/commit/8b6b094b9c7d09eeae90f8bdfac44d53513aa63d), [`71663c568`](https://github.com/clerk/javascript/commit/71663c568926b1d60b97aa7ccc5298d05b618af2), [`90aa2ea9c`](https://github.com/clerk/javascript/commit/90aa2ea9c4675662cee581298b49bd76ec8f8850), [`a605335e1`](https://github.com/clerk/javascript/commit/a605335e1e6f37d9b02170282974b0e1406e3f98), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`ae3a6683a`](https://github.com/clerk/javascript/commit/ae3a6683aa1a28e5201325463e4211229b641711), [`c22cd5214`](https://github.com/clerk/javascript/commit/c22cd52147492ba25f3c07bdbe6bbc4eb49a5cf0), [`c7e6d00f5`](https://github.com/clerk/javascript/commit/c7e6d00f56e73df4ed87712e74ad9d5bcaca8924), [`797e327e0`](https://github.com/clerk/javascript/commit/797e327e05ce6bd23320555a9e7d6fadbd9d624f), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`7644b7472`](https://github.com/clerk/javascript/commit/7644b74726ba73e615a1256f9ff3fa03b0f8bc30), [`f5d55bb1f`](https://github.com/clerk/javascript/commit/f5d55bb1fc6a87303fb8bf461c3a917ae4da4005), [`6f755addd`](https://github.com/clerk/javascript/commit/6f755addd0886b9ff8b0d5dbe48e37470049acad)]:
  - @clerk/shared@2.0.0-alpha-v5.0
  - @clerk/backend@1.0.0-alpha-v5.0
  - @clerk/clerk-react@5.0.0-alpha-v5.0

## 4.25.7

### Patch Changes

- Fix an issue where only static routes would be allowed by `publicRoutes` prop from `authMiddleware`. ([#1928](https://github.com/clerk/javascript/pull/1928)) by [@desiprisg](https://github.com/desiprisg)

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Update `<ClerkProvider />` to work in client components within the app router. This allows rendering of the provider in client components, previously the pages router provider was being imported and throwing an error. ([#1840](https://github.com/clerk/javascript/pull/1840)) by [@BRKalow](https://github.com/BRKalow)

- Update imports of `@clerk/shared` to granular entrypoints. This addresses warnings during a Next.js build that are the result of unsupported APIs being included in the module graph of builds for the edge runtime. ([#1924](https://github.com/clerk/javascript/pull/1924)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`3bf64107e`](https://github.com/clerk/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`52f8553d2`](https://github.com/clerk/javascript/commit/52f8553d22f9454ee1194fd162410db15da7a4be), [`92727eec3`](https://github.com/clerk/javascript/commit/92727eec39566278263ffa118a085493f964eb94), [`b09b66eec`](https://github.com/clerk/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerk/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62), [`37d8856ba`](https://github.com/clerk/javascript/commit/37d8856babb9db8edf763455172c4d22d6035036), [`aa4cd7615`](https://github.com/clerk/javascript/commit/aa4cd761585b888706a36a6eed7436a8f0476dbf)]:
  - @clerk/clerk-sdk-node@4.12.16
  - @clerk/backend@0.31.3
  - @clerk/shared@1.0.0
  - @clerk/clerk-react@4.27.0
  - @clerk/types@3.57.0

## 4.25.6

### Patch Changes

- Update the error thrown by auth() or getAuth() to indicate that if the /src directory exists, then the middleware.ts file needs to be placed inside it, otherwise the middleware will not run. ([#1908](https://github.com/clerk/javascript/pull/1908)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`9ca215702`](https://github.com/clerk/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11)]:
  - @clerk/types@3.56.1
  - @clerk/backend@0.31.2
  - @clerk/clerk-react@4.26.6
  - @clerk/clerk-sdk-node@4.12.15

## 4.25.5

### Patch Changes

- Improves the debug log output, and changes the internal behavior to use multiple `console.log()` calls. This will help to avoid any platform logging limitations per call. ([#1866](https://github.com/clerk/javascript/pull/1866)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`35be8709d`](https://github.com/clerk/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`13e9dfbaa`](https://github.com/clerk/javascript/commit/13e9dfbaa5b7b7e72f63e4b8ecfc1c1918517cd8), [`e38488c92`](https://github.com/clerk/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerk/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`9b644d799`](https://github.com/clerk/javascript/commit/9b644d7991b8cba4b385e9443f87798cde5c9989), [`a9894b445`](https://github.com/clerk/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`834dadb36`](https://github.com/clerk/javascript/commit/834dadb36c30b2a8f052784de4ad1026b0083b4e), [`70f251007`](https://github.com/clerk/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`a46d6fe99`](https://github.com/clerk/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/types@3.56.0
  - @clerk/backend@0.31.1
  - @clerk/shared@0.24.5
  - @clerk/clerk-react@4.26.5
  - @clerk/clerk-sdk-node@4.12.14

## 4.25.4

### Patch Changes

- Warn about environment variables deprecations: ([#1859](https://github.com/clerk/javascript/pull/1859)) by [@dimkl](https://github.com/dimkl)

  - `CLERK_API_KEY`
  - `CLERK_FRONTEND_API`
  - `NEXT_PUBLIC_CLERK_FRONTEND_API`

- Introduce a new property on the core Clerk singleton, `sdkMetadata`. This will be populated by each host SDK. This metadata will be used to make logging and debugging easier. ([#1857](https://github.com/clerk/javascript/pull/1857)) by [@BRKalow](https://github.com/BRKalow)

- Introduce new `*EmailLink*` helpers that will replace the `*MagicLink*` helpers. ([#1833](https://github.com/clerk/javascript/pull/1833)) by [@dimkl](https://github.com/dimkl)

  Also marked all the `*MagicLink*` as deprecated using JSDocs.

- Updated dependencies [[`977336f79`](https://github.com/clerk/javascript/commit/977336f793cd4ce5984f98dac3cedf9f5ec363f5), [`997b8e256`](https://github.com/clerk/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`d89c09bb0`](https://github.com/clerk/javascript/commit/d89c09bb0ec9d23ea75ca10f208fe23bb124d87b), [`91e9a55f4`](https://github.com/clerk/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`c9b17f5a7`](https://github.com/clerk/javascript/commit/c9b17f5a72cb27786cfc7f1fb42be1233fb10d5c), [`91014880d`](https://github.com/clerk/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`451fc332a`](https://github.com/clerk/javascript/commit/451fc332a06b20482fc1c7345d2f606511144241), [`3848f8dbe`](https://github.com/clerk/javascript/commit/3848f8dbe094226c6062341405a32a9621042fd6), [`7f4d4b942`](https://github.com/clerk/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b)]:
  - @clerk/shared@0.24.4
  - @clerk/clerk-react@4.26.4
  - @clerk/types@3.55.0
  - @clerk/clerk-sdk-node@4.12.13
  - @clerk/backend@0.31.0

## 4.25.3

### Patch Changes

- Add deprecation warning for `@clerk/nextjs/app-beta` export. Use the `@clerk/nextjs` instead. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Retry the implemented changes from [#1767](https://github.com/clerk/javascript/pull/1767) which were reverted in [#1806](https://github.com/clerk/javascript/pull/1806) due to RSC related errors (not all uses components had the `use client` directive). Restore the original PR and add additional `use client` directives to ensure it works correctly. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1e212c19d`](https://github.com/clerk/javascript/commit/1e212c19d1cbfbcf6bc6718f5aec0a3cb893b96f), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679)]:
  - @clerk/clerk-react@4.26.3
  - @clerk/shared@0.24.3
  - @clerk/backend@0.30.3
  - @clerk/clerk-sdk-node@4.12.12

## 4.25.2

### Patch Changes

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerk/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`fed24f1bf`](https://github.com/clerk/javascript/commit/fed24f1bf3e2b8c3f3e3327178f77b57c391c62c), [`164f3aac7`](https://github.com/clerk/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerk/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerk/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`0636ff779`](https://github.com/clerk/javascript/commit/0636ff7799e126d1438d2738ce0e46c3b277f46a), [`9514618d6`](https://github.com/clerk/javascript/commit/9514618d65cfdde0ff011eabd41a992b61fc8dc1), [`bb2ec9373`](https://github.com/clerk/javascript/commit/bb2ec93738f92c89f008c6a275a986593816c4d3), [`c7c6912f3`](https://github.com/clerk/javascript/commit/c7c6912f34874467bc74104690fe9f95491cc10d), [`71bb1c7b5`](https://github.com/clerk/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf), [`e592565e0`](https://github.com/clerk/javascript/commit/e592565e0d7707626587f5e0ae7fb7279c84f050)]:
  - @clerk/types@3.54.0
  - @clerk/backend@0.30.2
  - @clerk/clerk-react@4.26.2
  - @clerk/clerk-sdk-node@4.12.11

## 4.25.1

### Patch Changes

- Temporarily revert internal change to resolve RSC-related errors ([#1806](https://github.com/clerk/javascript/pull/1806)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`cecf74d79`](https://github.com/clerk/javascript/commit/cecf74d79069662d25f73e4745aa01348d398afb), [`a0b25671c`](https://github.com/clerk/javascript/commit/a0b25671cdee39cd0c2fca832b8c378fd445ec39)]:
  - @clerk/backend@0.30.1
  - @clerk/clerk-react@4.26.1
  - @clerk/clerk-sdk-node@4.12.10

## 4.25.0

### Minor Changes

- Add the `use client` directive in `@clerk/shared` to make the package compatible with an RSC environment. ([#1767](https://github.com/clerk/javascript/pull/1767)) by [@dimkl](https://github.com/dimkl)

  Remove several helpers from `@clerk/nextjs` and import them from `@clerk/shared` instead.

### Patch Changes

- Apply deprecation warnings for `@clerk/nextjs`: ([#1767](https://github.com/clerk/javascript/pull/1767)) by [@dimkl](https://github.com/dimkl)

  - `CLERK_JS_VERSION` environment variable
  - `CLERK_API_KEY` environment variable
  - `NEXT_PUBLIC_CLERK_FRONTEND_API` environment variable
  - `withClerkMiddleware`
  - `withServerSideAuth`

- Updated dependencies [[`5c8754239`](https://github.com/clerk/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81), [`14895e2dd`](https://github.com/clerk/javascript/commit/14895e2dde0fa15b594b1b7d89829d6013f5afc6), [`2f6a6ac99`](https://github.com/clerk/javascript/commit/2f6a6ac9991469bf8532019bb22ff50adecdb434), [`94c36c755`](https://github.com/clerk/javascript/commit/94c36c755b598eb68d22f42eb7f738050f390678), [`7406afe7f`](https://github.com/clerk/javascript/commit/7406afe7f550f702bd91cde9616fd26222833a87)]:
  - @clerk/clerk-react@4.26.0
  - @clerk/types@3.53.0
  - @clerk/backend@0.30.0
  - @clerk/clerk-sdk-node@4.12.9

## 4.24.2

### Patch Changes

- Updated dependencies [[`53ccb27cf`](https://github.com/clerk/javascript/commit/53ccb27cfd195af65adde6694572ed523fc66d6d), [`c61ddf5bf`](https://github.com/clerk/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerk/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/clerk-react@4.25.2
  - @clerk/types@3.52.1
  - @clerk/backend@0.29.3
  - @clerk/clerk-sdk-node@4.12.8

## 4.24.1

### Patch Changes

- Updated dependencies [[`40ea407ad`](https://github.com/clerk/javascript/commit/40ea407ad1042fee6871755f30de544200b1f0d8), [`378a903ac`](https://github.com/clerk/javascript/commit/378a903ac4dc12e6ee708de20f0d9a5aa758bd18), [`27b611e47`](https://github.com/clerk/javascript/commit/27b611e47e4f1ad86e8dff42cb02c98bdc6ff6bd), [`4d0d90238`](https://github.com/clerk/javascript/commit/4d0d9023895c13290d5578ece218c24348c540fc)]:
  - @clerk/backend@0.29.2
  - @clerk/clerk-sdk-node@4.12.7
  - @clerk/clerk-react@4.25.1

## 4.24.0

### Minor Changes

- Introduce the new brand-new component OrganizationList ([#1692](https://github.com/clerk/javascript/pull/1692)) by [@panteliselef](https://github.com/panteliselef)

  - Lists all the memberships, invitations or suggestions an active user may have
  - Powered by our `useOrganizationList` react hook

### Patch Changes

- `SignInWithMetamaskButton` is now exported from the `@clerk/nextjs` package ([#1731](https://github.com/clerk/javascript/pull/1731)) by [@octoper](https://github.com/octoper)

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- Updates the default middleware config matcher to be more restrictive in how it detects static files. Paths with `.` in them are now allowed, as long as the `.` is not in the final path segment. ([#1695](https://github.com/clerk/javascript/pull/1695)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`e99df0a0d`](https://github.com/clerk/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerk/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`75be1d6b3`](https://github.com/clerk/javascript/commit/75be1d6b3d9bf7b5d71613b3f169a942b1d25e7e), [`01b024c57`](https://github.com/clerk/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68)]:
  - @clerk/clerk-react@4.25.0
  - @clerk/types@3.52.0
  - @clerk/clerk-sdk-node@4.12.6
  - @clerk/backend@0.29.1

## 4.23.5

### Patch Changes

- Updated dependencies [[`463ff84f5`](https://github.com/clerk/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`e6a388946`](https://github.com/clerk/javascript/commit/e6a38894640b6999b90ea44ef66acda34debe2c1), [`1426e5eb3`](https://github.com/clerk/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739)]:
  - @clerk/types@3.51.0
  - @clerk/backend@0.29.0
  - @clerk/clerk-react@4.24.2
  - @clerk/clerk-sdk-node@4.12.5

## 4.23.4

### Patch Changes

- Improve error messaging when clock skew is detected. ([#1661](https://github.com/clerk/javascript/pull/1661)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`975412ed5`](https://github.com/clerk/javascript/commit/975412ed5307ac81128c87289178bd1e6c2fb1af), [`a102c21d4`](https://github.com/clerk/javascript/commit/a102c21d4762895a80a1ad846700763cc801b3f3)]:
  - @clerk/backend@0.28.1
  - @clerk/clerk-react@4.24.1
  - @clerk/clerk-sdk-node@4.12.4

## 4.23.3

### Patch Changes

- Pass dev_browser to AP via query param, fix AP origin detection util ([#1567](https://github.com/clerk/javascript/pull/1567)) by [@yourtallness](https://github.com/yourtallness)

- Logs that exceed maximum allowed length on Vercel deployments will now be truncated to max length exactly ([#1598](https://github.com/clerk/javascript/pull/1598)) by [@jescalan](https://github.com/jescalan)

- Updated dependencies [[`96cc1921c`](https://github.com/clerk/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerk/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerk/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerk/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerk/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerk/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerk/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerk/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerk/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerk/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`86de584dd`](https://github.com/clerk/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e02a1aff2`](https://github.com/clerk/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerk/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerk/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerk/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerk/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerk/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`30fcdd51a`](https://github.com/clerk/javascript/commit/30fcdd51a98dea60da36f2b5152ea22405d2c4f2), [`89bc5de04`](https://github.com/clerk/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/types@3.50.0
  - @clerk/clerk-react@4.24.0
  - @clerk/backend@0.28.0
  - @clerk/clerk-sdk-node@4.12.3

## 4.23.2

### Patch Changes

- Updated dependencies [[`ea95525a4`](https://github.com/clerk/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerk/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`d433b83b9`](https://github.com/clerk/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerk/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`876777cb1`](https://github.com/clerk/javascript/commit/876777cb14443917d8e0a04b363327d165ad5580), [`0a59e122d`](https://github.com/clerk/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/backend@0.27.0
  - @clerk/types@3.49.0
  - @clerk/clerk-sdk-node@4.12.2
  - @clerk/clerk-react@4.23.2

## 4.23.1

### Patch Changes

- Updated dependencies [[`7c1359474`](https://github.com/clerk/javascript/commit/7c135947428e3e0611b6c860fabd8113c15b2166)]:
  - @clerk/clerk-sdk-node@4.12.1

## 4.23.0

### Minor Changes

- Support hosting NextJs apps on non-Vercel platforms by constructing req.url using host-related headers instead of using on req.url directly. CLERK_TRUST_HOST is now enabled by default. ([#1492](https://github.com/clerk/javascript/pull/1492)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerk/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3), [`4ff4b716f`](https://github.com/clerk/javascript/commit/4ff4b716fdb12b18182e506737afafc7dbc05604)]:
  - @clerk/types@3.48.1
  - @clerk/clerk-sdk-node@4.12.0
  - @clerk/backend@0.26.0
  - @clerk/clerk-react@4.23.1

## 4.22.1

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerk/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c)]:
  - @clerk/clerk-react@4.23.0
  - @clerk/types@3.48.0
  - @clerk/backend@0.25.1
  - @clerk/clerk-sdk-node@4.11.1

## 4.22.0

### Minor Changes

- Introduce `createIsomorphicRequest` in `@clerk/backend` ([#1393](https://github.com/clerk/javascript/pull/1393)) by [@anagstef](https://github.com/anagstef)

  This utility simplifies the `authenticateRequest` signature, and it makes it easier to integrate with more frameworks.

- Improve dev-mode logs for authMiddleware (protectedRoutes and ignoredRoutes) by [@nikosdouvlis](https://github.com/nikosdouvlis)

### Patch Changes

- Updated dependencies [[`16c3283ec`](https://github.com/clerk/javascript/commit/16c3283ec192cb7525312da5e718aa7cac8b8445), [`73c9c1d0e`](https://github.com/clerk/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerk/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerk/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`e3036848d`](https://github.com/clerk/javascript/commit/e3036848d19a48935129aec2fe50003518a3aa53), [`fd692af79`](https://github.com/clerk/javascript/commit/fd692af791fe206724e38eff647b8562e72c3652), [`090bab66e`](https://github.com/clerk/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`bb0d69b45`](https://github.com/clerk/javascript/commit/bb0d69b455fa5fd6ca5b1f45a0f242957521dfbb), [`592911196`](https://github.com/clerk/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8), [`dd10ebeae`](https://github.com/clerk/javascript/commit/dd10ebeae54d70b84b7c0374cea2876e9cdd6622)]:
  - @clerk/backend@0.25.0
  - @clerk/types@3.47.0
  - @clerk/clerk-sdk-node@4.11.0
  - @clerk/clerk-react@4.22.1

## 4.21.14

### Patch Changes

- Updated dependencies [[`2ad7cf390`](https://github.com/clerk/javascript/commit/2ad7cf390ba84b8e767ed6fe136800e38356d79c), [`4eeabbaa3`](https://github.com/clerk/javascript/commit/4eeabbaa36bfd5b277eadd1eaff3d0ed15e4e162), [`f6b77a1a3`](https://github.com/clerk/javascript/commit/f6b77a1a338cddeadb3cc7019171bf9703d7676e), [`f0b044c47`](https://github.com/clerk/javascript/commit/f0b044c475546e96a5995ef16198e60e35e8098f)]:
  - @clerk/backend@0.24.0
  - @clerk/clerk-sdk-node@4.10.15
  - @clerk/clerk-react@4.22.0

## 4.21.13

### Patch Changes

- Updated dependencies [[`3fee736c9`](https://github.com/clerk/javascript/commit/3fee736c993b0a8fd157d716890810d04e632962), [`968d9c265`](https://github.com/clerk/javascript/commit/968d9c2651ce25f6e03c2e6eecd81f7daf876f03), [`ac4e47274`](https://github.com/clerk/javascript/commit/ac4e47274afc2ab3a55a78b388a14bed76600402), [`5957a3da6`](https://github.com/clerk/javascript/commit/5957a3da68cde3386c741812e2bc03b5519d00e0)]:
  - @clerk/backend@0.23.7
  - @clerk/clerk-react@4.21.1
  - @clerk/clerk-sdk-node@4.10.14

## 4.21.12

### Patch Changes

- Updated dependencies [[`1e71b60a2`](https://github.com/clerk/javascript/commit/1e71b60a2c6832a5f4f9c75ad4152b82db2b52e1)]:
  - @clerk/clerk-react@4.21.0

## 4.21.11

### Patch Changes

- Resolve issue of appending :80 in urls when using CLERK_TRUST_HOST ([#1419](https://github.com/clerk/javascript/pull/1419)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`30f8ad18a`](https://github.com/clerk/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c)]:
  - @clerk/types@3.46.1
  - @clerk/backend@0.23.6
  - @clerk/clerk-react@4.20.6
  - @clerk/clerk-sdk-node@4.10.13

## 4.21.10

### Patch Changes

- Support hosting NextJs apps on non-Vercel platforms by constructing req.url using host-related headers instead of using on `req.url` directly. In order to enable this feature, set the `CLERK_TRUST_HOST` env variable to `true` ([#1394](https://github.com/clerk/javascript/pull/1394)) by [@dimkl](https://github.com/dimkl)

## 4.21.9

### Patch Changes

- Add isApiRoute to AfterAuthHandler['auth'] type ([#1397](https://github.com/clerk/javascript/pull/1397)) by [@dimkl](https://github.com/dimkl)

## 4.21.8

### Patch Changes

- Updated dependencies [[`bfb3af28`](https://github.com/clerk/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/types@3.46.0
  - @clerk/backend@0.23.5
  - @clerk/clerk-react@4.20.5
  - @clerk/clerk-sdk-node@4.10.12

## 4.21.7

### Patch Changes

- Updated dependencies [[`11954816`](https://github.com/clerk/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`de2347f9`](https://github.com/clerk/javascript/commit/de2347f9efaab4903787a905528a06551a9b7883), [`32148490`](https://github.com/clerk/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0
  - @clerk/clerk-sdk-node@4.10.11
  - @clerk/backend@0.23.4
  - @clerk/clerk-react@4.20.4

## 4.21.6

### Patch Changes

- Updated dependencies [[`17cc14ec`](https://github.com/clerk/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/types@3.44.0
  - @clerk/backend@0.23.3
  - @clerk/clerk-react@4.20.3
  - @clerk/clerk-sdk-node@4.10.10

## 4.21.5

### Patch Changes

- Updated dependencies [[`e41f848c`](https://github.com/clerk/javascript/commit/e41f848c35f5f284bde918e60bdfd77693e5d7bd)]:
  - @clerk/clerk-sdk-node@4.10.9

## 4.21.4

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerk/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerk/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/types@3.43.0
  - @clerk/backend@0.23.2
  - @clerk/clerk-react@4.20.2
  - @clerk/clerk-sdk-node@4.10.8

## 4.21.3

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-react@4.20.1

## 4.21.2

### Patch Changes

- Detect infinite redirect loops when using `authMiddleware` and inform the user about possible resolution steps. ([#1324](https://github.com/clerk/javascript/pull/1324)) by [@anagstef](https://github.com/anagstef)

- Allow `clerkJSVersion` to be passed when loading interstitial. Support for ([#1354](https://github.com/clerk/javascript/pull/1354)) by [@panteliselef](https://github.com/panteliselef)

  - Nextjs
  - Remix
  - Node

- Updated dependencies [[`f8a334b1`](https://github.com/clerk/javascript/commit/f8a334b1a97b1dab36d3114c42c4ba50ca6d38dc), [`b945c921`](https://github.com/clerk/javascript/commit/b945c92100454f00ff4b6b9c769201ca2ceaac93)]:
  - @clerk/clerk-sdk-node@4.10.7
  - @clerk/backend@0.23.1

## 4.21.1

### Patch Changes

- Resolve build issues affecting apps using App Router ([#1346](https://github.com/clerk/javascript/pull/1346)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`eff4e45e`](https://github.com/clerk/javascript/commit/eff4e45e351f7ab04da3996853d7bca40d642543)]:
  - @clerk/clerk-sdk-node@4.10.6

## 4.21.0

### Minor Changes

- Export error helpers from the shared package to the framework specific packages ([#1308](https://github.com/clerk/javascript/pull/1308)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Support `audience` parameter in authentication request ([#1004](https://github.com/clerk/javascript/pull/1004)) by [@dimkl](https://github.com/dimkl)

  The audience parameter is used to verify the the aud claim in
  the request matches the value of the parameter or is included
  (when the user provides a list).

  Resolves:

  - [#978](https://github.com/clerk/javascript/pull/978)
  - [#1004](https://github.com/clerk/javascript/pull/1004)

- Updated dependencies [[`7af91bc3`](https://github.com/clerk/javascript/commit/7af91bc3ecc25cba04968b491e1e3c6ec32c18af), [`c42b4ac0`](https://github.com/clerk/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`6f3d4305`](https://github.com/clerk/javascript/commit/6f3d43055690db1d69a356503a0a45dc948beaef), [`010484f4`](https://github.com/clerk/javascript/commit/010484f4978b9616e8c2ef50986eda742c4967bd)]:
  - @clerk/clerk-react@4.20.0
  - @clerk/types@3.42.0
  - @clerk/backend@0.23.0
  - @clerk/clerk-sdk-node@4.10.5

## 4.20.0

### Minor Changes

- Add support for NextJS applications hosted on AWS Amplify by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Tweaked the default `authMiddleware` behavior for protected API routes. An unauthenticated request for a protected API route will no longer return a `307 Redirect` - a `401 Unauthorized` response will be returned instead. by [@nikosdouvlis](https://github.com/nikosdouvlis)

  With this change, an API route is considered a request for which the following rules apply:

  - The request url matches the following patterns; `['/api/(.*)', '/trpc/(.*)']`
  - Or, the request has `Content-Type: application/json`
  - Or, the request method is not one of: `GET`, `OPTIONS` ,` HEAD`

  A new `apiRoutes` param has been introduced on `authMiddleware`. It can accept an array of path patterns, `RegexExp` or strings. If `apiRoutes` is passed in explicitly, then it overrides the behavior described above and only the requests matching `apiRoutes` will be considered as API routes requests.
  For more technical details, refer to the PR's description.

- Add support for NextJS applications hosted on Railway by [@nikosdouvlis](https://github.com/nikosdouvlis)

### Patch Changes

- Improve debug logs in NextJS by adding AuthStatusObject.debug data by [@nikosdouvlis](https://github.com/nikosdouvlis)

- The devBrowser JWT is now added to all cross-origin redirects triggered by calling `redirectToSignIn` or `redirectToSignUp`. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Improve debug logging by including `AuthObject.debug()` data when `debug` is `true` in `authMiddleware` by [@nikosdouvlis](https://github.com/nikosdouvlis)

- ESM/CJS support for `@clerk/clerk-react` by [@nikosdouvlis](https://github.com/nikosdouvlis)

  Changes that should affect users and OS contributors:

  - Better source map support for `@clerk/clerk-react`, `@clerk/shared`. This affects anyone developing in our monorepo or anyone using a debugger with Clerk installed in their app.
  - Easier node_modules debugging as `@clerk/clerk-react`, `@clerk/shared` and `@clerk/nextjs` are no longer getting bundled as a single-file package. This also improves error logging in nextjs a lot, as nextjs usually logs the line that threw the error - a minified, single-file package, usually consists of a very long single-line module, so logging error in NextJS wasn't ideal.
  - Headless clerk-js bundle size reduced by ~10kb, normal clerk-ks by ~6kb
  - A new `clerkJSVersion` prop has been added on ClerkProvider allowing to fetch a specific clerk-js version.

- `authMiddleware` handles multi-domain relared properties passed as functions properly by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/backend@0.22.0
  - @clerk/types@3.41.1
  - @clerk/clerk-react@4.19.0
  - @clerk/clerk-sdk-node@4.10.4

## [4.19.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.19.0-staging.1...@clerk/nextjs@4.19.0) (2023-05-26)

**Note:** Version bump only for package @clerk/nextjs

### [4.18.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.18.5-staging.0...@clerk/nextjs@4.18.5) (2023-05-26)

**Note:** Version bump only for package @clerk/nextjs

### [4.18.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.18.3...@clerk/nextjs@4.18.4) (2023-05-23)

**Note:** Version bump only for package @clerk/nextjs

### [4.18.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.18.3-staging.2...@clerk/nextjs@4.18.3) (2023-05-23)

**Note:** Version bump only for package @clerk/nextjs

### [4.18.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.18.2-staging.1...@clerk/nextjs@4.18.2) (2023-05-18)

**Note:** Version bump only for package @clerk/nextjs

### [4.18.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.18.1-staging.1...@clerk/nextjs@4.18.1) (2023-05-17)

**Note:** Version bump only for package @clerk/nextjs

## [4.18.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.18.0-staging.4...@clerk/nextjs@4.18.0) (2023-05-15)

**Note:** Version bump only for package @clerk/nextjs

### [4.17.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.17.0...@clerk/nextjs@4.17.1) (2023-05-04)

### Bug Fixes

- **nextjs:** Use signInUrl and signUpUrl from the env ([#1151](https://github.com/clerk/javascript/issues/1151)) ([0476d79](https://github.com/clerk/javascript/commit/0476d79360f59ecce90d8e69a57225bb0d5b73bb))

## [4.17.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.17.0-staging.6...@clerk/nextjs@4.17.0) (2023-05-04)

**Note:** Version bump only for package @clerk/nextjs

## [4.17.0-staging.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.17.0-staging.4...@clerk/nextjs@4.17.0-staging.5) (2023-05-04)

**Note:** Version bump only for package @clerk/nextjs

## [4.17.0-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.17.0-staging.0...@clerk/nextjs@4.17.0-staging.1) (2023-05-02)

**Note:** Version bump only for package @clerk/nextjs

### [4.16.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.16.4-staging.0...@clerk/nextjs@4.16.4) (2023-04-19)

**Note:** Version bump only for package @clerk/nextjs

### [4.16.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.16.2...@clerk/nextjs@4.16.3) (2023-04-19)

**Note:** Version bump only for package @clerk/nextjs

### [4.16.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.16.2-staging.0...@clerk/nextjs@4.16.2) (2023-04-12)

**Note:** Version bump only for package @clerk/nextjs

### [4.16.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.16.0...@clerk/nextjs@4.16.1) (2023-04-12)

### Reverts

- Revert "chore(nextjs): Use tsup to bundle and minify package" ([5453456](https://github.com/clerk/javascript/commit/5453456feedb4dbfbeccbc68ecf5cdd5e6b9e501))
- Revert "fix(nextjs): Omit test files from production build" ([392fd28](https://github.com/clerk/javascript/commit/392fd28ad6f0c1bc5968a1a40c57f91cfd57cc05))
- Revert "fix(nextjs): Add edge-middleware and drop client/ & middleware/ from tsup.config entry" ([ba85989](https://github.com/clerk/javascript/commit/ba85989bf91b3f99e015a82fdf748a79d7404f3d))
- Revert "chore(nextjs): Update serializable props GH issue link" ([f16e623](https://github.com/clerk/javascript/commit/f16e623fe2766274d05efa7cfbbe97d03bda6ff3))
- Revert "fix(nextjs): Fix serializable issue when build with tsup & tsup config cleanup" ([347f6df](https://github.com/clerk/javascript/commit/347f6df8dc23fc51a4a07f1c3942b8f749576541))

## [4.16.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.16.0-staging.0...@clerk/nextjs@4.16.0) (2023-04-11)

**Note:** Version bump only for package @clerk/nextjs

## [4.15.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.15.0-staging.1...@clerk/nextjs@4.15.0) (2023-04-06)

**Note:** Version bump only for package @clerk/nextjs

### [4.14.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.14.1-staging.1...@clerk/nextjs@4.14.1) (2023-04-03)

**Note:** Version bump only for package @clerk/nextjs

## [4.14.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.14.0-staging.3...@clerk/nextjs@4.14.0) (2023-03-31)

**Note:** Version bump only for package @clerk/nextjs

## [4.14.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.14.0-staging.2...@clerk/nextjs@4.14.0-staging.3) (2023-03-31)

**Note:** Version bump only for package @clerk/nextjs

## [4.14.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.13.1-staging.0...@clerk/nextjs@4.14.0-staging.0) (2023-03-31)

### Features

- **nextjs:** Add signInUrl to BAPI call for interstitial ([f2003fc](https://github.com/clerk/javascript/commit/f2003fcb337d2ec5b0496aebd030ebeb8b544799))
- **nextjs:** Support new env var NEXT_PUBLIC_CLERK_SIGN_IN_URL ([0d5bd88](https://github.com/clerk/javascript/commit/0d5bd88bba65d5c9d8e091449ddd13a6bc640928))

## [4.13.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.13.0-staging.2...@clerk/nextjs@4.13.0) (2023-03-29)

**Note:** Version bump only for package @clerk/nextjs

### [4.11.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.7-staging.2...@clerk/nextjs@4.11.7) (2023-03-10)

**Note:** Version bump only for package @clerk/nextjs

### [4.11.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.6-staging.1...@clerk/nextjs@4.11.6) (2023-03-09)

**Note:** Version bump only for package @clerk/nextjs

### [4.11.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.4...@clerk/nextjs@4.11.5) (2023-03-07)

### Bug Fixes

- **nextjs:** Stop exporting the /api helpers based on the runtime ([224426a](https://github.com/clerk/javascript/commit/224426aca9fe5fda33e728445d590204a7e99fc9))

### [4.11.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.4-staging.1...@clerk/nextjs@4.11.4) (2023-03-07)

**Note:** Version bump only for package @clerk/nextjs

### [4.11.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.3-staging.1...@clerk/nextjs@4.11.3) (2023-03-03)

**Note:** Version bump only for package @clerk/nextjs

### [4.11.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.2-staging.0...@clerk/nextjs@4.11.2) (2023-03-01)

**Note:** Version bump only for package @clerk/nextjs

### [4.11.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.1-staging.0...@clerk/nextjs@4.11.1) (2023-02-25)

**Note:** Version bump only for package @clerk/nextjs

## [4.11.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.11.0-staging.0...@clerk/nextjs@4.11.0) (2023-02-24)

**Note:** Version bump only for package @clerk/nextjs

### [4.10.3-staging.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.10.3-staging.4...@clerk/nextjs@4.10.3-staging.5) (2023-02-22)

### Bug Fixes

- **nextjs:** Reintroduce next as a peer dependency ([b1fd299](https://github.com/clerk/javascript/commit/b1fd2990b6091bba5abc1f9cf9b3c15fff980222))

### [4.10.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.10.2-staging.1...@clerk/nextjs@4.10.2) (2023-02-17)

**Note:** Version bump only for package @clerk/nextjs

### [4.10.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.10.1-staging.2...@clerk/nextjs@4.10.1) (2023-02-15)

**Note:** Version bump only for package @clerk/nextjs

## [4.10.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.10.0-staging.0...@clerk/nextjs@4.10.0) (2023-02-10)

**Note:** Version bump only for package @clerk/nextjs

### [4.9.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.9.1-staging.0...@clerk/nextjs@4.9.1) (2023-02-07)

**Note:** Version bump only for package @clerk/nextjs

### [4.9.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.9.0-staging.1...@clerk/nextjs@4.9.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/nextjs

## [4.9.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.9.0-staging.1...@clerk/nextjs@4.9.0) (2023-02-07)

**Note:** Version bump only for package @clerk/nextjs

### [4.8.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.8.1-staging.4...@clerk/nextjs@4.8.1) (2023-02-01)

**Note:** Version bump only for package @clerk/nextjs

## [4.8.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.8.0-staging.1...@clerk/nextjs@4.8.0) (2023-01-27)

**Note:** Version bump only for package @clerk/nextjs

### [4.7.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.7.6-staging.1...@clerk/nextjs@4.7.7) (2023-01-24)

**Note:** Version bump only for package @clerk/nextjs

### [4.7.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.7.4...@clerk/nextjs@4.7.5) (2023-01-20)

### Bug Fixes

- **nextjs,types:** Make frontendApi or publishableKey mutually exclusive but optional ([953c276](https://github.com/clerk/javascript/commit/953c27622ba24054172d6f4178bd5af50f73fa36))

### [4.7.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.7.3...@clerk/nextjs@4.7.4) (2023-01-19)

**Note:** Version bump only for package @clerk/nextjs

### [4.7.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.7.3-staging.0...@clerk/nextjs@4.7.3) (2023-01-18)

**Note:** Version bump only for package @clerk/nextjs

### [4.7.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.7.2-staging.0...@clerk/nextjs@4.7.2) (2023-01-18)

**Note:** Version bump only for package @clerk/nextjs

### [4.7.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.7.0...@clerk/nextjs@4.7.1) (2023-01-17)

**Note:** Version bump only for package @clerk/nextjs

## [4.7.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.7.0-staging.9...@clerk/nextjs@4.7.0) (2023-01-17)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.15](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.15-staging.2...@clerk/nextjs@4.6.15) (2022-12-23)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.14](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.14-staging.1...@clerk/nextjs@4.6.14) (2022-12-19)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.13](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.13-staging.1...@clerk/nextjs@4.6.13) (2022-12-13)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.12](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.11...@clerk/nextjs@4.6.12) (2022-12-12)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.11](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.11-staging.0...@clerk/nextjs@4.6.11) (2022-12-12)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.10](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.10-staging.1...@clerk/nextjs@4.6.10) (2022-12-09)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.9](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.8...@clerk/nextjs@4.6.9) (2022-12-08)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.8](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.8-staging.0...@clerk/nextjs@4.6.8) (2022-12-08)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.7-staging.0...@clerk/nextjs@4.6.7) (2022-12-02)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.6-staging.5...@clerk/nextjs@4.6.6) (2022-11-30)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.6-staging.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.6-staging.4...@clerk/nextjs@4.6.6-staging.5) (2022-11-29)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.5-staging.0...@clerk/nextjs@4.6.5) (2022-11-25)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.4-staging.0...@clerk/nextjs@4.6.4) (2022-11-25)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.2...@clerk/nextjs@4.6.3) (2022-11-23)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.2-staging.3...@clerk/nextjs@4.6.2) (2022-11-22)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.2-staging.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.2-staging.2...@clerk/nextjs@4.6.2-staging.3) (2022-11-21)

**Note:** Version bump only for package @clerk/nextjs

### [4.6.2-staging.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.2-staging.1...@clerk/nextjs@4.6.2-staging.2) (2022-11-21)

### Bug Fixes

- **nextjs:** Remove optional auth violation error from withClerkMiddleware ([1760b90](https://github.com/clerk/javascript/commit/1760b9092ff22e57b24d0475e4ec6b49dd5a7ecd))

### [4.6.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.1-staging.2...@clerk/nextjs@4.6.1) (2022-11-18)

**Note:** Version bump only for package @clerk/nextjs

## [4.6.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.6.0-staging.5...@clerk/nextjs@4.6.0) (2022-11-15)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.8](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.8-staging.1...@clerk/nextjs@4.5.8) (2022-11-10)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.7-staging.2...@clerk/nextjs@4.5.7) (2022-11-05)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.6-staging.7...@clerk/nextjs@4.5.6) (2022-11-03)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.6-staging.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.6-staging.3...@clerk/nextjs@4.5.6-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.6-staging.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.6-staging.1...@clerk/nextjs@4.5.6-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.6-staging.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.6-staging.1...@clerk/nextjs@4.5.6-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.6-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.5...@clerk/nextjs@4.5.6-staging.1) (2022-11-02)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.5-staging.0...@clerk/nextjs@4.5.5) (2022-10-24)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.3...@clerk/nextjs@4.5.4) (2022-10-14)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.3-staging.2...@clerk/nextjs@4.5.3) (2022-10-14)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.3-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.2...@clerk/nextjs@4.5.3-staging.1) (2022-10-13)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.2-staging.0...@clerk/nextjs@4.5.2) (2022-10-07)

**Note:** Version bump only for package @clerk/nextjs

### [4.5.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.1-staging.0...@clerk/nextjs@4.5.1) (2022-10-05)

**Note:** Version bump only for package @clerk/nextjs

## [4.5.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.5.0-staging.6...@clerk/nextjs@4.5.0) (2022-10-03)

**Note:** Version bump only for package @clerk/nextjs

## [4.4.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.4.0-staging.1...@clerk/nextjs@4.4.0) (2022-09-29)

**Note:** Version bump only for package @clerk/nextjs

### [4.3.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.3.1...@clerk/nextjs@4.3.2) (2022-09-25)

**Note:** Version bump only for package @clerk/nextjs

### [4.3.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.3.1-staging.2...@clerk/nextjs@4.3.1) (2022-09-24)

**Note:** Version bump only for package @clerk/nextjs

### [4.3.1-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.3.1-staging.0...@clerk/nextjs@4.3.1-staging.1) (2022-09-24)

**Note:** Version bump only for package @clerk/nextjs

## [4.3.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.3.0-staging.0...@clerk/nextjs@4.3.0) (2022-09-22)

**Note:** Version bump only for package @clerk/nextjs

### [4.2.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.2.0-staging.4...@clerk/nextjs@4.2.1) (2022-09-19)

**Note:** Version bump only for package @clerk/nextjs

## [4.2.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.2.0-staging.4...@clerk/nextjs@4.2.0) (2022-09-16)

**Note:** Version bump only for package @clerk/nextjs

### [4.1.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.1.6...@clerk/nextjs@4.1.7) (2022-09-08)

**Note:** Version bump only for package @clerk/nextjs

### [4.1.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.1.6-staging.0...@clerk/nextjs@4.1.6) (2022-09-07)

**Note:** Version bump only for package @clerk/nextjs

### [4.1.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.1.5-staging.0...@clerk/nextjs@4.1.5) (2022-09-07)

**Note:** Version bump only for package @clerk/nextjs

### [4.1.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.1.3...@clerk/nextjs@4.1.4) (2022-09-05)

**Note:** Version bump only for package @clerk/nextjs

### [4.1.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.1.3-staging.0...@clerk/nextjs@4.1.3) (2022-08-29)

**Note:** Version bump only for package @clerk/nextjs

### [4.1.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.1.2-staging.3...@clerk/nextjs@4.1.2) (2022-08-29)

**Note:** Version bump only for package @clerk/nextjs

### [4.1.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.1.1-staging.0...@clerk/nextjs@4.1.1) (2022-08-24)

**Note:** Version bump only for package @clerk/nextjs

## [4.1.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.0.5...@clerk/nextjs@4.1.0) (2022-08-18)

**Note:** Version bump only for package @clerk/nextjs

### [4.0.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.0.4...@clerk/nextjs@4.0.5) (2022-08-18)

**Note:** Version bump only for package @clerk/nextjs

### [4.0.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.0.4-staging.0...@clerk/nextjs@4.0.4) (2022-08-18)

**Note:** Version bump only for package @clerk/nextjs

### [4.0.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.0.3-staging.0...@clerk/nextjs@4.0.3) (2022-08-16)

**Note:** Version bump only for package @clerk/nextjs

### [4.0.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.0.2-staging.0...@clerk/nextjs@4.0.2) (2022-08-09)

**Note:** Version bump only for package @clerk/nextjs

### [4.0.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.0.0...@clerk/nextjs@4.0.1) (2022-08-07)

**Note:** Version bump only for package @clerk/nextjs

## [4.0.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@4.0.0-staging.1...@clerk/nextjs@4.0.0) (2022-08-05)

**Note:** Version bump only for package @clerk/nextjs

### [3.8.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.8.2...@clerk/nextjs@3.8.3) (2022-08-05)

**Note:** Version bump only for package @clerk/nextjs

### [3.8.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.8.1...@clerk/nextjs@3.8.2) (2022-08-04)

**Note:** Version bump only for package @clerk/nextjs

### [3.8.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.8.1-staging.0...@clerk/nextjs@3.8.1) (2022-07-26)

**Note:** Version bump only for package @clerk/nextjs

## [3.8.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.7.1...@clerk/nextjs@3.8.0) (2022-07-13)

### Features

- **nextjs:** Add req.organization access on gssp ([d064448](https://github.com/clerk/javascript/commit/d0644489a71e06df0e751c615b0d03d77967aab2))
- **types,clerk-react,nextjs:** Add loadOrg option for Next.js withServerSideAuth middleware ([0889bde](https://github.com/clerk/javascript/commit/0889bde9bc7f9e1a5d4c1e706c49212e1f7b36f4))

### [3.7.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.7.1-staging.0...@clerk/nextjs@3.7.1) (2022-07-11)

**Note:** Version bump only for package @clerk/nextjs

## [3.7.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.13...@clerk/nextjs@3.7.0) (2022-07-08)

### Features

- **backend-core,edge:** Add requireEdgeMiddlewareAuth ([9ce6a4e](https://github.com/clerk/javascript/commit/9ce6a4e3f763f5e75a59439f9e36dc1a2ec368c4))
- **edge,nextjs:** Compatibility with API middleware experimental edge-runtime ([107d70e](https://github.com/clerk/javascript/commit/107d70e2fb0522a89763c4b99f0968aea4e01c2c))

### [3.6.13](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.12...@clerk/nextjs@3.6.13) (2022-07-07)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.12](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.11...@clerk/nextjs@3.6.12) (2022-07-06)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.11](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.10...@clerk/nextjs@3.6.11) (2022-07-04)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.10](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.9...@clerk/nextjs@3.6.10) (2022-07-01)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.9](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.8...@clerk/nextjs@3.6.9) (2022-07-01)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.8](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.7...@clerk/nextjs@3.6.8) (2022-06-24)

### Bug Fixes

- **edge,nextjs,remix,clerk-sdk-node,types:** Correct SSR claims typing ([09c147c](https://github.com/clerk/javascript/commit/09c147c196c08e64794423f9eae791bfe453b858))

### [3.6.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.7-staging.0...@clerk/nextjs@3.6.7) (2022-06-16)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.6-staging.4...@clerk/nextjs@3.6.6) (2022-06-06)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.6-staging.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.6-staging.3...@clerk/nextjs@3.6.6-staging.4) (2022-06-03)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.6-staging.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.6-staging.2...@clerk/nextjs@3.6.6-staging.3) (2022-06-03)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.6-staging.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.6-staging.1...@clerk/nextjs@3.6.6-staging.2) (2022-06-02)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.6-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.6-staging.0...@clerk/nextjs@3.6.6-staging.1) (2022-06-01)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.5-staging.4...@clerk/nextjs@3.6.5) (2022-05-20)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.5-staging.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.5-staging.3...@clerk/nextjs@3.6.5-staging.4) (2022-05-20)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.5-staging.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.5-staging.2...@clerk/nextjs@3.6.5-staging.3) (2022-05-19)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.5-staging.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.4...@clerk/nextjs@3.6.5-staging.2) (2022-05-18)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.5-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.4...@clerk/nextjs@3.6.5-staging.1) (2022-05-17)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.5-staging.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.4...@clerk/nextjs@3.6.5-staging.0) (2022-05-16)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.1...@clerk/nextjs@3.6.4) (2022-05-13)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.1...@clerk/nextjs@3.6.3) (2022-05-12)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.1...@clerk/nextjs@3.6.2) (2022-05-12)

**Note:** Version bump only for package @clerk/nextjs

### [3.6.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.6.1-staging.0...@clerk/nextjs@3.6.1) (2022-05-11)

**Note:** Version bump only for package @clerk/nextjs

## [3.6.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.5.1...@clerk/nextjs@3.6.0) (2022-05-06)

### Features

- **nextjs,clerk-sdk-node,remix:** Add claims attribute to req.auth ([c695529](https://github.com/clerk/javascript/commit/c695529089f55baef72b86e3b73b8cd9f4f58e6d))

### [3.5.2-staging.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.5.1...@clerk/nextjs@3.5.2-staging.0) (2022-05-05)

**Note:** Version bump only for package @clerk/nextjs

### [3.5.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.5.1-staging.0...@clerk/nextjs@3.5.1) (2022-05-05)

**Note:** Version bump only for package @clerk/nextjs

## [3.5.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.5.0-staging.0...@clerk/nextjs@3.5.0) (2022-04-28)

**Note:** Version bump only for package @clerk/nextjs

### [3.4.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.4.0...@clerk/nextjs@3.4.1) (2022-04-27)

**Note:** Version bump only for package @clerk/nextjs

## [3.4.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.7...@clerk/nextjs@3.4.0) (2022-04-27)

### Features

- **nextjs:** Fix opts parsing in withServerSideAuth ([1eecb81](https://github.com/clerk/javascript/commit/1eecb81439809fd4536d4b7d2f65d4fed6c6137b))

### [3.3.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.6...@clerk/nextjs@3.3.7) (2022-04-22)

### Bug Fixes

- **nextjs,backend-core:** Fix handleError parsing ([4eb9732](https://github.com/clerk/javascript/commit/4eb97324d9153aa91492982d00bb76b8592947c7))

### [3.3.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.6-staging.1...@clerk/nextjs@3.3.6) (2022-04-19)

**Note:** Version bump only for package @clerk/nextjs

### [3.3.6-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.6-staging.0...@clerk/nextjs@3.3.6-staging.1) (2022-04-19)

**Note:** Version bump only for package @clerk/nextjs

### [3.3.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.5-alpha.0...@clerk/nextjs@3.3.5) (2022-04-18)

**Note:** Version bump only for package @clerk/nextjs

### [3.3.5-alpha.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.4...@clerk/nextjs@3.3.5-alpha.0) (2022-04-15)

**Note:** Version bump only for package @clerk/nextjs

### [3.3.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.3...@clerk/nextjs@3.3.4) (2022-04-15)

**Note:** Version bump only for package @clerk/nextjs

### [3.3.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.3-staging.1...@clerk/nextjs@3.3.3) (2022-04-15)

**Note:** Version bump only for package @clerk/nextjs

### [3.3.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.2-staging.0...@clerk/nextjs@3.3.2) (2022-04-13)

**Note:** Version bump only for package @clerk/nextjs

### [3.3.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.0...@clerk/nextjs@3.3.1) (2022-04-07)

**Note:** Version bump only for package @clerk/nextjs

## [3.3.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.3.0-staging.0...@clerk/nextjs@3.3.0) (2022-04-04)

**Note:** Version bump only for package @clerk/nextjs

### [3.2.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.2.4-staging.0...@clerk/nextjs@3.2.4) (2022-03-29)

**Note:** Version bump only for package @clerk/nextjs

### [3.2.3](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.2.3-staging.0...@clerk/nextjs@3.2.3) (2022-03-28)

**Note:** Version bump only for package @clerk/nextjs

### [3.2.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.2.2-alpha.0...@clerk/nextjs@3.2.2) (2022-03-24)

**Note:** Version bump only for package @clerk/nextjs

### [3.2.2-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.2.2-staging.0...@clerk/nextjs@3.2.2-staging.1) (2022-03-24)

**Note:** Version bump only for package @clerk/nextjs

### [3.2.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.2.1-staging.0...@clerk/nextjs@3.2.1-alpha.0) (2022-03-23)

**Note:** Version bump only for package @clerk/nextjs

## [3.2.0-alpha.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.2.0-alpha.1...@clerk/nextjs@3.2.0-alpha.2) (2022-03-23)

**Note:** Version bump only for package @clerk/nextjs

## [3.2.0-alpha.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.1.0-alpha.1...@clerk/nextjs@3.2.0-alpha.1) (2022-03-23)

### Features

- **backend-core,clerk-sdk-node,nextjs,remix:** Add injected jwtKey option ([53e56e7](https://github.com/clerk/javascript/commit/53e56e76d59984d4d3f5b7e1e2d276adb8b2dc77))

## [3.2.0-alpha.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.1.0-alpha.1...@clerk/nextjs@3.2.0-alpha.0) (2022-03-22)

**Note:** Version bump only for package @clerk/nextjs

## [3.1.0-alpha.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.1.0-alpha.0...@clerk/nextjs@3.1.0-alpha.1) (2022-03-22)

**Note:** Version bump only for package @clerk/nextjs

## [3.1.0-alpha.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.0.1-staging.0...@clerk/nextjs@3.1.0-alpha.0) (2022-03-22)

### Features

- **nextjs,remix:** Refactor remix and nextjs getAuthData to use common utils ([d5f5dba](https://github.com/clerk/javascript/commit/d5f5dbace577ae617636841ce51e7cccd5d25b95))

### Bug Fixes

- **nextjs,remix:** Make server getToken throw if called with no session ([f7736c1](https://github.com/clerk/javascript/commit/f7736c1f4730d713f3fbcedd73e2ef5a1ceee605))

### [3.0.1-alpha.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.0.1-alpha.1...@clerk/nextjs@3.0.1-alpha.2) (2022-03-20)

**Note:** Version bump only for package @clerk/nextjs

### [3.0.1-alpha.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.0.1-staging.0...@clerk/nextjs@3.0.1-alpha.1) (2022-03-20)

### Features

- **nextjs,remix:** Refactor remix and nextjs getAuthData to use common utils ([d5f5dba](https://github.com/clerk/javascript/commit/d5f5dbace577ae617636841ce51e7cccd5d25b95))

### Bug Fixes

- **nextjs,remix:** Make server getToken throw if called with no session ([f7736c1](https://github.com/clerk/javascript/commit/f7736c1f4730d713f3fbcedd73e2ef5a1ceee605))

### [3.0.1-alpha.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@3.0.1-staging.0...@clerk/nextjs@3.0.1-alpha.0) (2022-03-19)

### Bug Fixes

- **nextjs,remix:** Make server getToken throw if called with no session ([f7736c1](https://github.com/clerk/javascript/commit/f7736c1f4730d713f3fbcedd73e2ef5a1ceee605))

# [3.0.0-alpha.9](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.13...@clerk/nextjs@3.0.0-alpha.9) (2022-03-11)

### Features

- **clerk-remix:** Remove load options from `getAuth` ([246fe76](https://github.com/clerk/javascript/commit/246fe76943aedc07bed8510761a286ef324049ec))
- **nextjs:** Enforce withServerSideAuth callback return type ([3766a49](https://github.com/clerk/javascript/commit/3766a4938641de36f953ec49f45d539f971d778c))
- **nextjs:** Fetch user and session in parallel ([#49](https://github.com/clerk/javascript/issues/49)) ([fb89732](https://github.com/clerk/javascript/commit/fb89732952fba2d45fe9ea73820b6264f5e02dbc))
- **nextjs:** Move shared NextJS SSR types to types package ([78d8c7c](https://github.com/clerk/javascript/commit/78d8c7c3e84f3926127e48c655793a0fca3cdc2c))
- **nextjs:** Strictly type all possible withServerSideAuth return value combinations ([beba831](https://github.com/clerk/javascript/commit/beba83195828737ef20ca4450badded92d95d098))

## [3.0.0-alpha.8](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.4...@clerk/nextjs@3.0.0-alpha.8) (2022-02-28)

### Features

- **clerk-remix:** Remove load options from `getAuth` ([246fe76](https://github.com/clerk/javascript/commit/246fe76943aedc07bed8510761a286ef324049ec))
- **nextjs:** Enforce withServerSideAuth callback return type ([3766a49](https://github.com/clerk/javascript/commit/3766a4938641de36f953ec49f45d539f971d778c))
- **nextjs:** Fetch user and session in parallel ([#49](https://github.com/clerk/javascript/issues/49)) ([fb89732](https://github.com/clerk/javascript/commit/fb89732952fba2d45fe9ea73820b6264f5e02dbc))
- **nextjs:** Move shared NextJS SSR types to types package ([78d8c7c](https://github.com/clerk/javascript/commit/78d8c7c3e84f3926127e48c655793a0fca3cdc2c))
- **nextjs:** Strictly type all possible withServerSideAuth return value combinations ([beba831](https://github.com/clerk/javascript/commit/beba83195828737ef20ca4450badded92d95d098))

## [3.0.0-alpha.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.4...@clerk/nextjs@3.0.0-alpha.7) (2022-02-25)

### Features

- **clerk-remix:** Remove load options from `getAuth` ([5c1e23d](https://github.com/clerk/javascript/commit/5c1e23db40b7a49b7cec5a1d8206daad160e6361))
- **nextjs:** Enforce withServerSideAuth callback return type ([260d7cf](https://github.com/clerk/javascript/commit/260d7cfd255d6f6ff8d0dc2d32fb490008146804))
- **nextjs:** Fetch user and session in parallel ([#49](https://github.com/clerk/javascript/issues/49)) ([e5c2620](https://github.com/clerk/javascript/commit/e5c2620695d489b14e3c513d6773c4527c9baf8b))
- **nextjs:** Move shared NextJS SSR types to types package ([8b898a1](https://github.com/clerk/javascript/commit/8b898a1aa503889921180850292fbfa3c8133ef5))
- **nextjs:** Strictly type all possible withServerSideAuth return value combinations ([e99c57a](https://github.com/clerk/javascript/commit/e99c57adc816a42137c781477e43fe4f372d9d1e))

## [3.0.0-alpha.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.1-staging.0...@clerk/nextjs@3.0.0-alpha.6) (2022-02-18)

### Features

- **clerk-remix:** Remove load options from `getAuth` ([5f4cedc](https://github.com/clerk/javascript/commit/5f4cedc70db8398eb196ca769db41ebadb15ab12))
- **nextjs:** Enforce withServerSideAuth callback return type ([a45f28a](https://github.com/clerk/javascript/commit/a45f28ac0bcd357c36759112a73737487499ef3f))
- **nextjs:** Fetch user and session in parallel ([#49](https://github.com/clerk/javascript/issues/49)) ([ef58027](https://github.com/clerk/javascript/commit/ef58027b6d18c880074e1a55d0f2cfe4d83ab614))
- **nextjs:** Move shared NextJS SSR types to types package ([757dc2e](https://github.com/clerk/javascript/commit/757dc2ef1acf32f31bdad8bcab076bb710723781))

### [2.11.17](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.17-staging.1...@clerk/nextjs@2.11.17) (2022-03-17)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.17-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.17-staging.0...@clerk/nextjs@2.11.17-staging.1) (2022-03-17)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.15](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.14...@clerk/nextjs@2.11.15) (2022-03-14)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.14](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.13...@clerk/nextjs@2.11.14) (2022-03-11)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.13](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.12...@clerk/nextjs@2.11.13) (2022-03-09)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.12](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.12-staging.0...@clerk/nextjs@2.11.12) (2022-03-09)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.10](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.9...@clerk/nextjs@2.11.10) (2022-03-04)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.9](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.8...@clerk/nextjs@2.11.9) (2022-03-04)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.8](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.7...@clerk/nextjs@2.11.8) (2022-03-04)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.7](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.6...@clerk/nextjs@2.11.7) (2022-03-03)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.6](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.5...@clerk/nextjs@2.11.6) (2022-03-02)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.5](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.4...@clerk/nextjs@2.11.5) (2022-03-01)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.4](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.4-staging.0...@clerk/nextjs@2.11.4) (2022-02-24)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.4-staging.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.3-staging.0...@clerk/nextjs@2.11.4-staging.0) (2022-02-24)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.3-staging.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.2-staging.2...@clerk/nextjs@2.11.3-staging.0) (2022-02-17)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.2-staging.2](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.2-staging.1...@clerk/nextjs@2.11.2-staging.2) (2022-02-16)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.2-staging.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.2-staging.0...@clerk/nextjs@2.11.2-staging.1) (2022-02-16)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.2-staging.0](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.1...@clerk/nextjs@2.11.2-staging.0) (2022-02-15)

**Note:** Version bump only for package @clerk/nextjs

### [2.11.1](https://github.com/clerk/javascript/compare/@clerk/nextjs@2.11.1-staging.0...@clerk/nextjs@2.11.1) (2022-02-14)

**Note:** Version bump only for package @clerk/nextjs

### 2.11.1-staging.0 (2022-02-11)

**Note:** Version bump only for package @clerk/nextjs
