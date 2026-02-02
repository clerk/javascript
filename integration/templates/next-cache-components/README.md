# Next.js Cache Components Integration Test App

This app tests Clerk's integration with Next.js 16's experimental cache components feature.

## Setup

```bash
pnpm install
pnpm dev
```

## Configuration

The app enables cache components in `next.config.js`:

```js
cacheComponents: true,  // Enables PPR and cache components
```

**Important**: ClerkProvider must be wrapped in `<Suspense>` for cache components to work correctly.

## Test Scenarios

### 1. auth() in Server Component (`/auth-server-component`)
Tests basic usage of `auth()` in a React Server Component.

### 2. auth() in Server Action (`/auth-server-action`)
Tests using `auth()` inside a server action triggered by a client component.

### 3. auth() in API Route (`/api/auth-check`)
Tests using `auth()` in a Next.js API route handler.

### 4. "use cache" with auth() - Error Case (`/use-cache-error`)
Tests that calling `auth()` inside a `"use cache"` function produces the expected error.
This is an **invalid pattern** because `auth()` uses dynamic APIs (cookies, headers).

### 5. "use cache" Correct Pattern (`/use-cache-correct`)
Demonstrates the correct way to use `"use cache"` with Clerk:
1. Call `auth()` **outside** the cache function
2. Pass the `userId` **into** the cache function
3. The cache function only contains cacheable operations

### 6. PPR with auth() (`/ppr-auth`)
Tests Partial Pre-Rendering with authenticated content.
Static content is pre-rendered while authenticated content streams in dynamically.

### 7. Protected Route (`/protected`)
Tests middleware-based route protection using `auth.protect()`.

## Expected Behaviors

| Scenario | Expected Result |
|----------|-----------------|
| auth() in RSC | Works normally |
| auth() in Server Action | Works normally |
| auth() in API Route | Works normally |
| auth() inside "use cache" | Should throw error |
| userId passed to "use cache" | Works correctly |
| PPR + auth() | Dynamic portion streams after static shell |
| Protected route (unauthenticated) | Redirects to sign-in |

## Related PRs

- PR #7119: Initial exploration of cacheComponents support
- PR #7530: Initial exploration of PPR + auth() issues
