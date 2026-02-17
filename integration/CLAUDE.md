# Integration Test Infrastructure

This directory contains the E2E test suite for all Clerk JS SDKs. Tests run against real Clerk instances using real package tarballs installed via a local Verdaccio registry managed by pkglab.

## Key facts

- `integration/` is NOT a pnpm workspace member (not listed in `pnpm-workspace.yaml`). It gets `@clerk/backend` and other deps via root workspace hoisting.
- Test apps are created in `os.tmpdir()/.temp_integration/` - completely outside the monorepo workspace.
- `@clerk/backend` is used here purely as infrastructure (BAPI calls via `createClerkClient`) - it is not a test subject.
- The test apps in `/tmp` are what actually verify SDK behavior with real tarballs.
- Templates in `templates/` are copy sources only - they are never executed in-place.

## Directory layout

- `models/` - Core abstractions: `applicationConfig.ts`, `application.ts`, `longRunningApplication.ts`, `environment.ts`
- `presets/` - Pre-built configs for each framework: `react.ts`, `next.ts`, `vue.ts`, etc. Also `envs.ts` (Clerk instance configs) and `longRunningApps.ts`
- `templates/` - Static app source trees that get copied to `/tmp` during tests
- `testUtils/` - `createTestUtils`, page objects, and services (`usersService`, `emailService`, `organizationsService`, etc.)
- `tests/` - The actual Playwright test files

## How tests work

1. `pkglab pub` - builds and publishes all `@clerk/*` packages to a local Verdaccio registry
2. `appConfigs.<framework>.<variant>.clone().commit()` - copies the template to `/tmp/.temp_integration/<name>__<timestamp>__<hash>/` and patches `package.json`
3. `app.setup()` - runs `pkglab add @clerk/react @clerk/shared ...` which pins those deps to the local registry versions and installs everything
4. `app.withEnv(appConfigs.envs.withEmailCodes)` - writes a `.env` file into the tmp dir with the Clerk instance keys
5. `app.dev()` - starts the dev server, waits for it to be ready, sets up Clerk testing tokens
6. Playwright tests run against `app.serverUrl`
7. `app.teardown()` - kills the server and removes the tmp directory

## `linkPackage()` and `clerkDependencies`

`linkPackage()` in `presets/utils.ts` returns `'*'`. When `commit()` patches `package.json`, it writes `"@clerk/react": "*"`. Then `pkglab add` resolves `*` against the local Verdaccio registry, which has the locally-built tarballs. The `config.clerkDependencies` getter in `applicationConfig.ts` returns all dependencies whose name starts with `@clerk/`, which is the list passed to `pkglab add`.

## Long-running applications

Most tests use long-running apps defined in `presets/longRunningApps.ts`. These are started once in `global.setup.ts`, shared across all tests via a state file (`/tmp/.temp_integration/state.json`), and stopped in `global.teardown.ts`. This avoids re-installing deps for every test file.

Use `testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })` in test files to run against these pre-started apps. Each long-running app has an id like `next.appRouter.withEmailCodes` - use `E2E_APP_ID` to filter which ones start.

## Environment configs (`envs`)

An environment config holds PK/SK pairs for a specific Clerk instance plus other env vars. Instance keys come from either:

- `.keys.json` in the `integration/` directory (local dev, gitignored)
- `INTEGRATION_INSTANCE_KEYS` env var (CI, contains the same JSON)

The `base` config in `presets/envs.ts` sets shared vars like `CLERK_SIGN_IN_URL`, `CLERK_TELEMETRY_DISABLED`, and the clerk-js/clerk-ui URLs (defaulting to `http://localhost:18211/clerk.browser.js` for local dev).

## Environment variables

Important variables from `constants.ts`:

- `E2E_APP_ID` - which long-running apps to start, e.g. `next.appRouter.*` or `react.vite.withEmailCodes`
- `E2E_APP_URL` / `E2E_APP_SK` / `E2E_APP_PK` - point tests at a manually running app
- `E2E_APP_CLERK_JS` - override clerk-js URL (skip local clerk-js server)
- `E2E_CLEANUP=0` - keep the `/tmp` app around after the test run for debugging
- `E2E_NEXTJS_VERSION`, `E2E_REACT_VERSION`, etc. - pin specific upstream dep versions
- `INTEGRATION_INSTANCE_KEYS` - JSON blob with all Clerk instance PK/SK pairs (used in CI)

## Running tests

All commands run from the repo root:

```sh
# Prerequisite: publish packages to local registry
pkglab pub

# Run all integration tests
pnpm test:integration:base

# Run tests for a specific framework
pnpm test:integration:nextjs
pnpm test:integration:vue

# Filter by test file
pnpm test:integration:base -- email-code.test.ts

# Debug mode
pnpm test:integration:base -- --ui email-code.test.ts

# Keep tmp app after run (for inspection)
E2E_CLEANUP=0 pnpm test:integration:base
```

## Writing tests

A typical test file structure:

```ts
import { test } from '@playwright/test';
import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { createTestUtils } from '../testUtils';

test.describe('Feature name @nextjs', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodes);
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('can sign in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();
  });
});
```

Use `testAgainstRunningApps` instead when targeting long-running apps:

```ts
testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('Feature @generic', ({ app }) => {
  test('...', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    // ...
  });
});
```

## Adding a new framework preset

1. Create a template directory under `templates/` with a working app that uses Clerk
2. Register it in `templates/index.ts`
3. Create a preset file under `presets/` (e.g. `presets/myframework.ts`) using `applicationConfig()`, `useTemplate()`, `setEnvFormatter()`, and `addDependency('@clerk/myframework', linkPackage('myframework'))`
4. Export it from `presets/index.ts` via `appConfigs`
5. Add long-running app entries to `presets/longRunningApps.ts` if needed
6. Add a script to the root `package.json` like `test:integration:myframework`

## Adding a new Clerk instance (env config)

1. Create a new instance in the **Integration testing** Clerk org
2. Add its keys to 1Password ("JS SDKs integration tests" note)
3. Run `pnpm integration:secrets` to sync keys to `.keys.json`
4. Add an entry to `.keys.json.sample` (placeholder, committed)
5. Add the keys to the `INTEGRATION_INSTANCE_KEYS` secret in GitHub
6. Create an `environmentConfig()` entry in `presets/envs.ts` and export it from `envs`

## Debugging

If a test fails in CI but passes locally:

- Playwright traces are uploaded on failure - download and open at https://trace.playwright.dev/
- Set `appDirName` to a stable name in `applicationConfig.ts` and upload the tmp dir as a CI artifact
- Add `verbose: true` to the Turborepo setup step in `ci.yml` for full logs
- Use `E2E_CLEANUP=0` locally to inspect the generated app after a failed run

The state file at `/tmp/.temp_integration/state.json` tracks running long-running apps between setup and teardown. If a test run is interrupted, stale entries may cause issues - delete the file or the whole `/tmp/.temp_integration/` directory to reset.
