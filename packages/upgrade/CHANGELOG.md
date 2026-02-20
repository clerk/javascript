# @clerk/upgrade

## 2.0.0

### Major Changes

- Updates the upgrade CLI to support Core 3 changes. If you need to upgrade to an older release, use the previous major version of this package. ([#7385](https://github.com/clerk/javascript/pull/7385)) by [@brkalow](https://github.com/brkalow)

- Require Node.js 20.9.0 in all packages ([#7262](https://github.com/clerk/javascript/pull/7262)) by [@jacekradko](https://github.com/jacekradko)

- `getToken()` now throws `ClerkOfflineError` instead of returning `null` when the client is offline. ([#7598](https://github.com/clerk/javascript/pull/7598)) by [@bratsos](https://github.com/bratsos)

  This makes it explicit that a token fetch failure was due to network conditions, not authentication state. Previously, returning `null` could be misinterpreted as "user is signed out," potentially causing the cached token to be cleared.

  To handle this change, catch `ClerkOfflineError` from `getToken()` calls:

  ```typescript
  import { ClerkOfflineError } from '@clerk/react/errors';

  try {
    const token = await session.getToken();
  } catch (error) {
    if (ClerkOfflineError.is(error)) {
      // Handle offline scenario - show offline UI, retry later, etc.
    }
    throw error;
  }
  ```

### Minor Changes

- Add support for the latest versions of the following packages: ([#6939](https://github.com/clerk/javascript/pull/6939)) by [@dstaley](https://github.com/dstaley)
  - `@clerk/react` (replacement for `@clerk/react`)
  - `@clerk/expo` (replacement for `@clerk/expo`)
  - `@clerk/nextjs`
  - `@clerk/react-router`
  - `@clerk/tanstack-start-react`

  During the upgrade, imports of the `useSignIn()` and `useSignUp()` hooks will be updated to import from the `/legacy` subpath.

- Add a `transform-protect-to-show` codemod that migrates `<Protect>`, `<SignedIn>`, `<SignedOut>` usages to `<Show>` with automatic prop and import updates. ([#7373](https://github.com/clerk/javascript/pull/7373)) by [@jacekradko](https://github.com/jacekradko)

- Add a migration guide generator and improve scan output. ([#7397](https://github.com/clerk/javascript/pull/7397)) by [@brkalow](https://github.com/brkalow)

- Add `transform-satellite-auto-sync` codemod for Core 3 migration that adds `satelliteAutoSync: true` wherever `isSatellite` is configured ([#7653](https://github.com/clerk/javascript/pull/7653)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Update `ClerkAPIError.kind` value to match class name ([#7509](https://github.com/clerk/javascript/pull/7509)) by [@kduprey](https://github.com/kduprey)

- Add `transform-clerk-provider-inside-body` codemod for Next.js 16 cache components support ([#7596](https://github.com/clerk/javascript/pull/7596)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Add missing Core 3 upgrade guide entries for breaking changes: `getToken` SSR behavior, React Router middleware requirement, Expo `publishableKey` requirement, Astro `as` prop removal, `simple` theme export change, React Router `api.server` removal, and Next.js minimum version bump. ([#7888](https://github.com/clerk/javascript/pull/7888)) by [@jacekradko](https://github.com/jacekradko)

- Add back the CLI header with gradient. ([#7465](https://github.com/clerk/javascript/pull/7465)) by [@jacekradko](https://github.com/jacekradko)

- Update transform-align-experimental-unstable-prefixes to avoid prototype pollution ([#7414](https://github.com/clerk/javascript/pull/7414)) by [@jacekradko](https://github.com/jacekradko)

- Export `Appearance` type from `@clerk/ui` root entry ([#7836](https://github.com/clerk/javascript/pull/7836)) by [@jacekradko](https://github.com/jacekradko)

- Add version check warning when `@tanstack/react-start` is below the minimum required v1.157.0 ([#7861](https://github.com/clerk/javascript/pull/7861)) by [@jacekradko](https://github.com/jacekradko)

- Fix typos in core-3 upgrade guide change files ([#7679](https://github.com/clerk/javascript/pull/7679)) by [@jacekradko](https://github.com/jacekradko)

- Improve `generate-guide` script to support generating guides for all SDKs at once and output MDX format compatible with clerk-docs ([#7454](https://github.com/clerk/javascript/pull/7454)) by [@jacekradko](https://github.com/jacekradko)

- Fix issue where package.json files were ignored. ([#7652](https://github.com/clerk/javascript/pull/7652)) by [@dstaley](https://github.com/dstaley)

- Update README.md ([#7413](https://github.com/clerk/javascript/pull/7413)) by [@jacekradko](https://github.com/jacekradko)

- Default Ready to upgrade? to yes ([#7425](https://github.com/clerk/javascript/pull/7425)) by [@jacekradko](https://github.com/jacekradko)

- Remove `@clerk/react-router/api.server` export (use `@clerk/react-router/server` instead). Added codemod to automatically migrate. ([#7643](https://github.com/clerk/javascript/pull/7643)) by [@jacekradko](https://github.com/jacekradko)

- Add entry for Sign-in Client Trust Status ([#7446](https://github.com/clerk/javascript/pull/7446)) by [@tmilewski](https://github.com/tmilewski)

- Handle `catalog:` protocol and other non-standard version specifiers ([#7540](https://github.com/clerk/javascript/pull/7540)) by [@jacekradko](https://github.com/jacekradko)

- Replace `globby` dependency with `tinyglobby` for smaller bundle size and faster installation ([#7415](https://github.com/clerk/javascript/pull/7415)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Add Vue-specific `transform-protect-to-show-vue` codemod that handles `.vue` SFC files with proper Vue v-bind syntax for the Protect to Show migration. ([#7615](https://github.com/clerk/javascript/pull/7615)) by [@jacekradko](https://github.com/jacekradko)

## 1.2.4

### Patch Changes

- Remove an internal function that was executed but its return value wasn't used. In some instances this function threw an error. ([#5138](https://github.com/clerk/javascript/pull/5138)) by [@LekoArts](https://github.com/LekoArts)

## 1.2.3

### Patch Changes

- Updates broken Clerk documentation references by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 1.2.0

### Minor Changes

- Enhancing error handling throughout the SDK upgrade flow ([#4410](https://github.com/clerk/javascript/pull/4410)) by [@jacekradko](https://github.com/jacekradko)

## 1.1.2

### Patch Changes

- Updating the CLI output to match the DX of core-1 to core-2 migration ([#4393](https://github.com/clerk/javascript/pull/4393)) by [@jacekradko](https://github.com/jacekradko)

## 1.1.1

### Patch Changes

- Adding fallback to properly link up transform ([#4386](https://github.com/clerk/javascript/pull/4386)) by [@jacekradko](https://github.com/jacekradko)

## 1.1.0

### Minor Changes

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

## 1.0.9

### Patch Changes

- Tidy up and improve README ([#4053](https://github.com/clerk/javascript/pull/4053)) by [@LekoArts](https://github.com/LekoArts)

## 1.0.8

### Patch Changes

- Bring `@clerk/upgrade` into the monorepo and publish from CI. No changes in behavior. ([#2474](https://github.com/clerk/javascript/pull/2474)) by [@jescalan](https://github.com/jescalan)
