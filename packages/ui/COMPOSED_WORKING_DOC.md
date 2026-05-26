# Composed Profile API — Working Doc

## Current Status

The composed profile providers (`UserProfile.Provider`, `OrganizationProfile.Provider`) now support full section-level composition and functional parity with the AIO `<UserProfile />` / `<OrganizationProfile />` components. Features like Coinbase wallet connect, password strength scoring, and navigation (leave org, delete org, cross-section links) all work through the composed API.

**Requirement**: `ui={ui}` must be passed to `<ClerkProvider>` when using composed components.

```tsx
import { ui } from '@clerk/ui';
import { ClerkProvider } from '@clerk/react';

<ClerkProvider
  publishableKey={pk}
  ui={ui}
>
  <UserProfile.Provider>...</UserProfile.Provider>
</ClerkProvider>;
```

## What Changed

### 1. ModuleManager — real dynamic imports for composed providers

**Problem**: Composed providers used a stub `ModuleManager` that returned `undefined` for all dynamic imports. This broke:

- Coinbase wallet connect (`@coinbase/wallet-sdk`)
- Base wallet connect (`@base-org/account`)
- Password strength scoring (`@zxcvbn-ts/core`)

**Root cause**: The real `ModuleManager` is created inside `clerk.load()` (in clerk-js) and passed to the `ClerkUI` constructor. But the composed providers render in the **user's React tree**, not in ClerkUI's tree — they had no way to access it.

**Rejected approach**: Expose `ModuleManager` on the Clerk instance via a `__internal_moduleManager` getter on `clerk.ts`. This would work but requires a clerk-js release before it takes effect, since clerk-js loads from CDN at runtime. The getter doesn't exist on the published CDN build.

**Implemented approach**: Module-level singleton store in `@clerk/ui`. When `ClerkUI` is constructed (which happens when `ui={ui}` is passed to `ClerkProvider`), it stores the `moduleManager` in a module-level variable. The composed providers read from that store. Since both `ClerkUI` and the composed providers are in the same `@clerk/ui` bundle, they share module scope.

**Files**:

- `packages/ui/src/composed/moduleManagerStore.ts` — `setModuleManager()` / `getModuleManager()`
- `packages/ui/src/ClerkUI.ts` — calls `setModuleManager(moduleManager)` in constructor
- `packages/ui/src/composed/UserProfile/UserProfileProvider.tsx` — reads from store
- `packages/ui/src/composed/OrganizationProfile/OrganizationProfileProvider.tsx` — reads from store

**Caveat**: Only works when `ui={ui}` is passed. Without it, ClerkUI loads from CDN as a separate bundle (different module scope), so the store is never populated. A `fallbackModuleManager` that returns `undefined` is used in that case — features degrade silently.

### 2. Router — real navigation for composed providers

**Problem**: The stub router only handled external URLs via `window.location.href`. Same-origin paths (`'/'`, `'../'`, `'./org-general'`) were silently dropped. This broke:

- Leave organization (navigates to `/`)
- Delete organization
- Cross-section links (e.g. "Manage domains")
- Error card back buttons

**Implemented approach**: `createComposedRouter(clerkNavigate)` factory that delegates all navigation to `clerk.navigate` — the public method on `LoadedClerk` that handles external URLs, same-origin with framework router, and fallback to `window.location`.

**Files**:

- `packages/ui/src/composed/stubRouter.ts` — `createComposedRouter()` factory, `stubRouter` kept as fallback
- Both provider files — `useMemo(() => createComposedRouter(clerk.navigate), [clerk])`

## Issues Encountered

### clerk-js loads from CDN, not local source

The playground (and all apps using `@clerk/react`) load clerk-js at runtime from a CDN script (`loadClerkJSScript`). Changes to `packages/clerk-js/src/core/clerk.ts` have no effect until published. This is why the `__internal_moduleManager` getter approach was abandoned — it required a clerk-js release to test.

### `@clerk/ui` dist must be rebuilt for playground testing

Vite resolves `@clerk/ui` from its built `dist/` directory (via package.json exports), not from source. After making changes to `@clerk/ui`, you must run `pnpm turbo build --filter=@clerk/ui --force` before testing in the playground.

### Spinner layout shift in composed mode

When clicking "Connect wallet" in the composed path, the loading spinner causes a slight content shift in the action menu that doesn't happen in the AIO component. Likely caused by the composed components rendering inline in the host page's DOM (inheriting the page's CSS), while the AIO component renders in a separate React root (isolated from page styles). This is a cosmetic issue — not yet fixed.

### Pre-existing test failure

`AccountWeb3 connect wallet calls createWeb3Wallet with a valid identifier` — this test fails because it tests through `MockClerkProvider` (not the composed providers) and the mock `ModuleManager` returns `undefined`. The test exercises the MetaMask `window.ethereum` path and is unrelated to the composed provider changes.

## Decisions Made

1. **`ui={ui}` required for composed components** — Accepted tradeoff. Users of composed components already depend on `@clerk/ui`, so importing `ui` and passing it is a one-line addition. This avoids needing clerk-js changes.

2. **Module-level singleton over Clerk instance getter** — The singleton approach works immediately without a clerk-js release. The Clerk instance getter would be more robust (works without `ui={ui}`) but requires a publish cycle to take effect.

3. **`createComposedRouter` delegates everything to `clerk.navigate`** — Rather than reimplementing same-origin detection, we delegate all navigation strings to `clerk.navigate` which already handles every case (external, same-origin via framework router, fallback to `window.location`).

4. **Fallback `moduleManager` returns `undefined` silently** — When `ui={ui}` is not passed, features that need dynamic imports (wallet connect, password strength) silently degrade. No error is thrown. This matches the pre-existing behavior.

## Test Coverage Gaps

The current tests use `bindCreateFixtures` / `MockClerkProvider`, which provides its own mock `ModuleManager`. This means:

- **Not tested through the actual composed providers**: Tests render section components directly with `MockClerkProvider`, not through `UserProfile.Provider`. The `moduleManagerStore` path is not exercised by any test.
- **No integration test for `ui={ui}` → `setModuleManager` → composed provider flow**: We verified this manually in the playground but there's no automated test.
- **Navigation via `createComposedRouter`**: The `stub-limitations.test.ts` tests verify `createComposedRouter` delegates to `clerkNavigate`, but don't test the full flow (e.g. clicking "Leave organization" → `clerk.navigate('/')` is called).
- **No test for the fallback path**: When `getModuleManager()` returns `undefined`, the fallback should be used. No test verifies this graceful degradation.
- **Spinner layout shift**: No visual regression test covers the styling difference between composed and AIO rendering.

### What would improve confidence

1. A test that renders through `UserProfileProvider` (not `MockClerkProvider`) and verifies `useModuleManager()` returns the real instance when `setModuleManager` has been called
2. A test that clicks a wallet connect button through the composed provider and verifies the Coinbase SDK flow is initiated (mocking `moduleManager.import` to return a fake SDK)
3. A test for the leave/delete org flow through the composed provider that verifies `clerk.navigate` is called with the right path
