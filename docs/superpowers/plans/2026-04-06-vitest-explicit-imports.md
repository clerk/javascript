# Vitest Explicit Imports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove `globals: true` from all vitest configs and add explicit imports to test files that rely on vitest globals, aligning the entire monorepo on a single convention.

**Architecture:** For each package with `globals: true`, remove the setting from vitest.config and add `import { describe, it, ... } from 'vitest'` to every test file that lacks it. No tsconfig changes are needed since no package declares `"types": ["vitest/globals"]`.

**Why globals work without imports:** When `globals: true` is set in vitest.config, vitest injects `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach`, etc. into the global scope at runtime. TypeScript doesn't complain because these packages don't have strict type checking for vitest globals (no `"types": ["vitest/globals"]` in tsconfig). The tests compile and run fine, but the code is less explicit and inconsistent with the ~390 other test files in this repo that import explicitly.

**Tech Stack:** Vitest, TypeScript

---

### Task 1: packages/express - Add vitest imports and remove globals

**Files:**

- Modify: `packages/express/src/__tests__/exports.test.ts`
- Modify: `packages/express/src/__tests__/getAuth.test.ts`
- Modify: `packages/express/vitest.config.mts:6`

- [ ] **Step 1: Add vitest import to exports.test.ts**

```ts
// Add at top of file (line 1, before existing imports):
import { describe, expect, it } from 'vitest';
```

- [ ] **Step 2: Add vitest import to getAuth.test.ts**

```ts
// Add at top of file (line 1, before existing imports):
import { describe, expect, it } from 'vitest';
```

- [ ] **Step 3: Remove globals from vitest.config.mts**

Remove the `globals: true,` line from `packages/express/vitest.config.mts:6`.

- [ ] **Step 4: Run tests to verify**

Run: `npx turbo test --filter=@clerk/express`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/express/src/__tests__/exports.test.ts packages/express/src/__tests__/getAuth.test.ts packages/express/vitest.config.mts
git commit -m "fix(express): add explicit vitest imports and remove globals"
```

---

### Task 2: packages/fastify - Add vitest imports and remove globals

**Files:**

- Modify: `packages/fastify/src/__tests__/exports.test.ts`
- Modify: `packages/fastify/src/__tests__/getAuth.test.ts`
- Modify: `packages/fastify/vitest.config.mts:6`

- [ ] **Step 1: Add vitest import to exports.test.ts**

```ts
// Add at top of file (line 1, before existing imports):
import { describe, expect, it } from 'vitest';
```

- [ ] **Step 2: Add vitest import to getAuth.test.ts**

```ts
// Add at top of file (line 1, before existing imports):
import { describe, expect, it, test } from 'vitest';
```

Note: This file uses both `it` and `test`.

- [ ] **Step 3: Remove globals from vitest.config.mts**

Remove the `globals: true,` line from `packages/fastify/vitest.config.mts:6`.

- [ ] **Step 4: Run tests to verify**

Run: `npx turbo test --filter=@clerk/fastify`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/fastify/src/__tests__/exports.test.ts packages/fastify/src/__tests__/getAuth.test.ts packages/fastify/vitest.config.mts
git commit -m "fix(fastify): add explicit vitest imports and remove globals"
```

---

### Task 3: packages/hono - Add vitest imports and remove globals

**Files:**

- Modify: `packages/hono/src/__tests__/exports.test.ts`
- Modify: `packages/hono/src/__tests__/clerkMiddleware.test.ts`
- Modify: `packages/hono/vitest.config.mts:6`

- [ ] **Step 1: Add vitest import to exports.test.ts**

```ts
// Add at top of file (line 1, before existing imports):
import { describe, expect, it } from 'vitest';
```

- [ ] **Step 2: Add vitest import to clerkMiddleware.test.ts**

```ts
// Add at top of file (line 1, before existing imports):
import { beforeEach, describe, expect, test, vi } from 'vitest';
```

Note: This file uses `vi` (for `vi.fn()`, `vi.hoisted()`, `vi.mock()`, `vi.stubEnv()`, `vi.spyOn()`, `vi.importActual()`), `describe`, `test`, `expect`, and `beforeEach`, all without imports.

- [ ] **Step 3: Remove globals from vitest.config.mts**

Remove the `globals: true,` line from `packages/hono/vitest.config.mts:6`.

- [ ] **Step 4: Run tests to verify**

Run: `npx turbo test --filter=@clerk/hono`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/hono/src/__tests__/exports.test.ts packages/hono/src/__tests__/clerkMiddleware.test.ts packages/hono/vitest.config.mts
git commit -m "fix(hono): add explicit vitest imports and remove globals"
```

---

### Task 4: packages/react-router - Add vitest imports and remove globals

**Files:**

- Modify: `packages/react-router/src/utils/__tests__/assert.test.ts`
- Modify: `packages/react-router/vitest.config.mts:5`

- [ ] **Step 1: Add vitest import to assert.test.ts**

```ts
// Add at line 2 (after the eslint-disable comment on line 1):
import { afterEach, describe, expect, it } from 'vitest';
```

- [ ] **Step 2: Remove globals from vitest.config.mts**

Remove the `globals: true,` line from `packages/react-router/vitest.config.mts:5`.

- [ ] **Step 3: Run tests to verify**

Run: `npx turbo test --filter=@clerk/react-router`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/react-router/src/utils/__tests__/assert.test.ts packages/react-router/vitest.config.mts
git commit -m "fix(react-router): add explicit vitest imports and remove globals"
```

---

### Task 5: packages/tanstack-react-start - Add vitest imports and remove globals

**Files:**

- Modify: `packages/tanstack-react-start/src/__tests__/parseUrlForNavigation.test.ts`
- Modify: `packages/tanstack-react-start/src/__tests__/exports.test.ts`
- Modify: `packages/tanstack-react-start/vitest.config.mts:5`

- [ ] **Step 1: Add vitest import to parseUrlForNavigation.test.ts**

```ts
// Add at top of file (line 1, before existing imports):
import { describe, expect, it } from 'vitest';
```

- [ ] **Step 2: Add vitest import to exports.test.ts**

```ts
// Add at top of file (line 1, before existing imports):
import { describe, expect, it } from 'vitest';
```

- [ ] **Step 3: Remove globals from vitest.config.mts**

Remove the `globals: true,` line from `packages/tanstack-react-start/vitest.config.mts:5`.

- [ ] **Step 4: Run tests to verify**

Run: `npx turbo test --filter=@clerk/tanstack-react-start`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/tanstack-react-start/src/__tests__/parseUrlForNavigation.test.ts packages/tanstack-react-start/src/__tests__/exports.test.ts packages/tanstack-react-start/vitest.config.mts
git commit -m "fix(tanstack-react-start): add explicit vitest imports and remove globals"
```

---

### Task 6: packages/vue - Add vitest imports and remove globals

**Files:**

- Modify: `packages/vue/src/utils/__tests__/useCustomElementPortal.test.ts`
- Modify: `packages/vue/vitest.config.ts:6`

- [ ] **Step 1: Add vitest import to useCustomElementPortal.test.ts**

```ts
// Add at top of file (line 1, before existing imports):
import { describe, expect, it } from 'vitest';
```

- [ ] **Step 2: Remove globals from vitest.config.ts**

Remove the `globals: true,` line from `packages/vue/vitest.config.ts:6`.

- [ ] **Step 3: Run tests to verify**

Run: `npx turbo test --filter=@clerk/vue`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/vue/src/utils/__tests__/useCustomElementPortal.test.ts packages/vue/vitest.config.ts
git commit -m "fix(vue): add explicit vitest imports and remove globals"
```

---

### Task 7: packages/astro - Remove globals (no test files need changes)

**Files:**

- Modify: `packages/astro/vitest.config.ts:6`

All test files in the astro package already import from vitest explicitly. Only the config needs updating.

- [ ] **Step 1: Remove globals from vitest.config.ts**

Remove the `globals: true,` line from `packages/astro/vitest.config.ts:6`.

- [ ] **Step 2: Run tests to verify**

Run: `npx turbo test --filter=@clerk/astro`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/astro/vitest.config.ts
git commit -m "fix(astro): remove globals from vitest config"
```

---

### Task 8: packages/nuxt - Remove globals (no test files need changes)

**Files:**

- Modify: `packages/nuxt/vitest.config.ts:8`

All test files in the nuxt package already import from vitest explicitly. Only the config needs updating.

- [ ] **Step 1: Remove globals from vitest.config.ts**

Remove the `globals: true,` line from `packages/nuxt/vitest.config.ts:8`.

- [ ] **Step 2: Run tests to verify**

Run: `npx turbo test --filter=@clerk/nuxt`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/nuxt/vitest.config.ts
git commit -m "fix(nuxt): remove globals from vitest config"
```
