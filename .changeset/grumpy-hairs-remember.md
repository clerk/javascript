---
"@clerk/nextjs": major
"@clerk/upgrade": minor
---

@clerk/nextjs: Converting auth() and clerkClient() interfaces to be async
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
