# Deprecate `requireAuth` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deprecate `requireAuth()` in `@clerk/express` with a runtime warning and JSDoc tag, guiding developers to use `clerkMiddleware()` + `getAuth()` instead.

**Architecture:** Add a `deprecated()` call from `@clerk/shared/deprecated` inside `requireAuth`, add `@deprecated` JSDoc, create a changeset. No behavioral changes.

**Tech Stack:** TypeScript, Express, Vitest, `@clerk/shared`

---

### Task 1: Add deprecation warning test

**Files:**

- Modify: `packages/express/src/__tests__/requireAuth.test.ts`

- [ ] **Step 1: Add mock for `@clerk/shared/deprecated` and write the failing test**

At the top of `packages/express/src/__tests__/requireAuth.test.ts`, add a mock for the deprecated module and a new test case. Add this right after the existing `vi.mock('../authenticateRequest', ...)` block (after line 16):

```ts
const mockDeprecated = vi.fn();
vi.mock('@clerk/shared/deprecated', () => ({
  deprecated: mockDeprecated,
}));
```

Then inside the `beforeEach` block, add `mockDeprecated.mockClear();` after `mockAuthenticateRequest = vi.fn();` (after line 22).

Then add this test at the end of the `describe` block (before the closing `});` on line 100):

```ts
it('should emit a deprecation warning when called', async () => {
  mockAuthenticateAndDecorateRequest.mockImplementation((): RequestHandler => {
    return (req, _res, next) => {
      Object.assign(req, mockRequestWithAuth({ userId: 'user_123' }));
      next();
    };
  });

  await runMiddleware(requireAuth());

  expect(mockDeprecated).toHaveBeenCalledWith(
    'requireAuth',
    'Use `clerkMiddleware()` with `getAuth()` instead. `requireAuth` will be removed in the next major version.',
  );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run packages/express/src/__tests__/requireAuth.test.ts`
Expected: FAIL - `mockDeprecated` is never called because `requireAuth` doesn't call `deprecated()` yet.

### Task 2: Add deprecation to `requireAuth`

**Files:**

- Modify: `packages/express/src/requireAuth.ts`

- [ ] **Step 1: Add the `deprecated()` import and call**

Add the import at the top of `packages/express/src/requireAuth.ts` (after line 1):

```ts
import { deprecated } from '@clerk/shared/deprecated';
```

Then add the `deprecated()` call as the first line inside the returned middleware function (after line 41 `return (request, response, next) => {`):

```ts
deprecated(
  'requireAuth',
  'Use `clerkMiddleware()` with `getAuth()` instead. `requireAuth` will be removed in the next major version.',
);
```

- [ ] **Step 2: Add `@deprecated` JSDoc tag**

Replace the existing JSDoc comment on `requireAuth` (lines 6-34) with a version that includes the `@deprecated` tag. The new JSDoc:

```ts
/**
 * Middleware to require authentication for user requests.
 * Redirects unauthenticated requests to the sign-in url.
 *
 * @deprecated Use `clerkMiddleware()` with `getAuth()` instead.
 * `requireAuth` will be removed in the next major version.
 *
 * @example
 * // Before (deprecated)
 * import { requireAuth } from '@clerk/express'
 * router.get('/path', requireAuth(), getHandler)
 *
 * @example
 * // After (recommended)
 * import { clerkMiddleware, getAuth } from '@clerk/express'
 *
 * app.use(clerkMiddleware())
 *
 * app.get('/api/protected', (req, res) => {
 *   const { userId } = getAuth(req);
 *   if (!userId) {
 *     return res.status(401).json({ error: 'Unauthorized' });
 *   }
 *   // handle authenticated request
 * })
 */
```

- [ ] **Step 3: Run the tests to verify they pass**

Run: `npx vitest run packages/express/src/__tests__/requireAuth.test.ts`
Expected: All 5 tests PASS (4 existing + 1 new deprecation test).

- [ ] **Step 4: Commit**

```bash
git add packages/express/src/requireAuth.ts packages/express/src/__tests__/requireAuth.test.ts
git commit -m "feat(express): Deprecate requireAuth middleware"
```

### Task 3: Create changeset

**Files:**

- Create: `.changeset/deprecate-require-auth.md`

- [ ] **Step 1: Create the changeset file**

Create `.changeset/deprecate-require-auth.md`:

````markdown
---
'@clerk/express': minor
---

Deprecated `requireAuth()` middleware. It will be removed in the next major version.

The `requireAuth()` middleware redirects unauthenticated requests to a sign-in page, which is often unexpected for API routes where a 401 response is more appropriate. Use `clerkMiddleware()` with `getAuth()` instead for explicit control over authentication behavior.

**Before (deprecated):**

```js
import { requireAuth } from '@clerk/express';

app.get('/api/protected', requireAuth(), (req, res) => {
  // handle authenticated request
});
```
````

**After (recommended):**

```js
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

````

- [ ] **Step 2: Commit**

```bash
git add .changeset/deprecate-require-auth.md
git commit -m "chore(express): Add changeset for requireAuth deprecation"
````
