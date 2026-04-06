# Deprecate `requireAuth` in `@clerk/express`

## Motivation

The `requireAuth()` middleware in `@clerk/express` is confusing. Developers expect it to return a 401 for unauthenticated API requests, but it actually redirects to a configured sign-in page, producing a different response code. This mismatch leads to unexpected behavior, especially for API routes.

Additionally, deprecating `requireAuth` reduces the API surface of `@clerk/express` by consolidating around `clerkMiddleware()` + `getAuth()` as the primary auth pattern.

## Approach

Deprecate `requireAuth` while keeping it fully functional. Add a runtime deprecation warning and JSDoc tag. Communicate removal in the next major version.

## Changes

### 1. Runtime deprecation warning

Add a call to the `deprecated()` helper from `@clerk/shared` inside the `requireAuth` function. The warning fires once per process (the helper deduplicates) and only in non-production/non-test environments.

**File:** `packages/express/src/requireAuth.ts`

The `deprecated()` call goes at the top of the returned middleware function, before any auth logic. The warning message directs developers to use `clerkMiddleware()` + `getAuth()` with an inline auth check.

### 2. JSDoc `@deprecated` tag

Add a `@deprecated` JSDoc tag to the `requireAuth` export. This gives IDE-level visibility (strikethrough in editors, warnings in autocomplete).

The deprecation message should point to `clerkMiddleware()` + `getAuth()` as the replacement, with a brief inline usage example.

### 3. Changeset

Create a changeset for `@clerk/express` with a `minor` semver bump.

Contents:

- What is deprecated: `requireAuth()` middleware
- Why: The redirect behavior is confusing for API routes where developers expect a 401
- Migration example using the inline pattern:

```ts
import { clerkMiddleware, getAuth } from '@clerk/express';

app.use(clerkMiddleware());

app.get('/api/protected', (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // handle authenticated request
});
```

- Statement that `requireAuth` will be removed in the next major version

### 4. Tests

Update the existing `requireAuth` test suite to verify that `deprecated()` is called when `requireAuth` is invoked.

Existing behavioral tests remain unchanged since the middleware still functions normally.

Also fix any missing vitest imports (e.g., `describe`, `it`, `expect`, `vi`) in existing express unit tests to align with vitest conventions.

### 5. Export snapshot

No changes needed. `requireAuth` remains exported.

## Files to modify

- `packages/express/src/requireAuth.ts` - Add `deprecated()` call and `@deprecated` JSDoc
- `packages/express/src/__tests__/requireAuth.test.ts` - Add deprecation warning test, fix vitest imports
- `.changeset/<generated-name>.md` - Changeset with minor bump and migration guide

## Out of scope

- Removing `requireAuth` (that happens in the next major version)
- Changing `requireAuth` behavior (it stays fully functional)
- Modifying other packages
