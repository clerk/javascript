# @clerk/upgrade

## 1.2.1

### Patch Changes

- Updates broken Clerk documentation references ([#4459](https://github.com/clerk/javascript/pull/4459)) by [@LauraBeatris](https://github.com/LauraBeatris)

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
