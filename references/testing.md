# Testing Infrastructure

## Frameworks

- **Unit/component tests**: Vitest (v3.2.4) exclusively. No Jest.
- **Integration/E2E tests**: Playwright.
- **Cypress**: Supported in `@clerk/testing` as a public SDK for end-users, but not used within this repo.

Vitest workspace config at root (`vitest.workspace.mjs`) aggregates all per-package configs:

```
packages/*/vitest.config.{mts,mjs,js,ts}
scripts/vitest.config.mjs
```

## Running Tests

### Unit Tests

```sh
pnpm test                        # All packages via turbo (depends on build)
pnpm test:cache:clear            # Clear turbo test cache first
turbo test --filter @clerk/nextjs  # Single package
```

Most packages expose a watch mode:

```sh
cd packages/react && pnpm test:watch   # vitest watch
```

### Backend Multi-Runtime Tests

`@clerk/backend` tests against three runtimes:

```sh
pnpm test:node                   # vitest --environment node
pnpm test:edge-runtime           # vitest --environment edge-runtime
pnpm test:cloudflare-miniflare   # vitest --environment miniflare
```

### Integration Tests

```sh
pnpm test:integration:base       # Full Playwright suite
pnpm test:integration:nextjs     # Next.js-specific tests
pnpm test:integration:generic    # React + Next.js generic tests
pnpm test:integration:sessions   # Cross-origin session tests
pnpm test:integration:handshake  # Handshake flow tests
pnpm test:integration:billing    # Billing + JWT v2 tests
pnpm test:integration:astro      # Astro tests
pnpm test:integration:vue        # Vue tests
pnpm test:integration:nuxt       # Nuxt tests
# ...and one for every framework
```

Integration tests require secrets from 1Password:

```sh
pnpm integration:secrets         # Pulls .env.local + .keys.json
pnpm playwright install chromium webkit
npm install -g pkglab
pnpm build && pkglab pub
pnpm test:integration:base
```

## Test Patterns

### Unit Test Structure

All tests use explicit Vitest imports (`import { describe, it, expect, vi } from 'vitest'`). No globals mode.

### Component Tests (clerk-js, ui)

Use `bindCreateFixtures` to build a fully rendered React provider tree:

```ts
const { createFixtures } = bindCreateFixtures('OrganizationProfile');
const { wrapper, fixtures } = await createFixtures(f => {
  f.withOrganizations();
});
const { result } = renderHook(() => useOrganization(...), { wrapper });
```

### Mocking

- `vi.mock()` with `vi.hoisted()` for module-level mocks
- `vi.fn()`, `vi.spyOn()`, `vi.stubEnv()` for per-test stubs
- `vi.importActual()` for partial module mocks

### Type Tests

Several packages use `expectTypeOf` from Vitest with `typecheck.enabled: true` for compile-time type assertions.

### Integration Tests (Playwright)

Use page object model via `createTestUtils`:

```ts
const u = createTestUtils({ app, page, context });
await u.po.signIn.goto();
await u.po.signIn.setIdentifier('user@example.com');
```

Tests tagged with `@grep` labels (`@nextjs`, `@generic`, etc.) for targeted runs.

## Shared Test Utilities

### `@clerk/testing` (published package)

Public testing utilities for end-users:

- `@clerk/testing/playwright` — `clerkSetup`, `setupClerkTestingToken`, `clerk` helpers
- `@clerk/testing/playwright/unstable` — POM factory `createPageObjects`, `createAppPageObject`
- `@clerk/testing/cypress` — `clerkSetup`, `addClerkCommands`, `setupClerkTestingToken`

`setupClerkTestingToken` intercepts FAPI requests to inject testing tokens and bypass bot protection.

### Internal Fixtures (`packages/clerk-js/src/test/`)

Rich fixture system shared between `clerk-js` and `ui`:

- `create-fixtures.tsx` — `bindCreateFixtures` / `unboundCreateFixtures` — builds full React provider tree
- `fixtures.ts` — `createBaseEnvironmentJSON`, `createBaseClientJSON`, `createUserFixture` — complete JSON stubs
- `mock-helpers.ts` — `mockClerkMethods` (deep-mocks all Clerk singleton methods), `mockRouteContextValue`
- `utils.ts` — custom `render` wrapper adding `userEvent` to RTL's render

The `@clerk/ui` package reuses clerk-js fixtures via a path alias in its vitest config.

### MSW (`@clerk/backend`)

`packages/backend/src/mock-server.ts` sets up an MSW node server for backend tests. Validates Authorization, Clerk-API-Version, and User-Agent headers.

### Internal Integration Utils (`integration/testUtils/`)

- `createTestUtils` — factory wiring services, page objects, and browser helpers
- `testAgainstRunningApps` — wraps `test.describe` to iterate over running app configurations
- Service helpers: `usersService`, `organizationsService`, `emailService`

## Coverage

Coverage uses `@vitest/coverage-v8`. Configured per-package, no monorepo-wide thresholds.

Packages with coverage enabled by default: `backend`, `express`, `fastify`, `hono`, `testing`.
Packages with opt-in coverage scripts: `shared`, `ui` (via `pnpm test:coverage`).
`clerk-js` has coverage configured but disabled by default.

## Integration Test Architecture

The `integration/` directory is a standalone Playwright project:

- `templates/` — 19 app templates (next-app-router, react-vite, astro, express, nuxt, vue, etc.)
- `presets/` — typed app config builders per framework, plus `envs.ts` loading Clerk keys
- `models/` — `Application`, `ApplicationConfig`, `LongRunningApplication` — orchestrates app servers
- `global.setup.ts` / `global.teardown.ts` — lifecycle management

Playwright config: `fullyParallel: true`, 5 retries on CI, Desktop Chrome, `bypassCSP: true`, `actionTimeout: 10s`, `navigationTimeout: 30s`.
