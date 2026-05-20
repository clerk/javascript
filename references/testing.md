# Testing

## How to Run Tests

**Always run from the monorepo root** (`/path/to/javascript/`). Never `cd` into a package directory to run tests.

### Run all tests for a package

```sh
turbo test --filter @clerk/nextjs
```

Do NOT run `vitest` or `pnpm test` directly inside a package directory. Use `turbo test --filter` from the root — it ensures dependencies are built first.

### Run a single test file

```sh
turbo test --filter @clerk/react -- --testPathPattern=useAuth
turbo test --filter @clerk/clerk-js -- --testPathPattern=SignInForm
```

The argument after `--` is a regex matched against the file path. A substring of the filename is usually enough.

### Run a single test by name

```sh
turbo test --filter @clerk/backend -- --testNamePattern="should verify"
```

### Run tests in watch mode

```sh
turbo test --filter @clerk/react -- --watch
```

### Common mistakes to avoid

| Wrong                            | Right                              | Why                                    |
| -------------------------------- | ---------------------------------- | -------------------------------------- |
| `cd packages/react && pnpm test` | `turbo test --filter @clerk/react` | Turbo ensures deps are built first     |
| `vitest run packages/react`      | `turbo test --filter @clerk/react` | Direct vitest skips build dependencies |
| `pnpm test` (from root)          | `turbo test --filter @clerk/react` | Unfiltered runs the entire monorepo    |
| `turbo test --filter react`      | `turbo test --filter @clerk/react` | Filter needs the full package name     |

## Frameworks

- **Unit/component**: Vitest only (no Jest)
- **E2E**: Playwright

## Backend Multi-Runtime Tests

`@clerk/backend` tests against three runtimes. These are separate scripts, not vitest environments you pass as flags:

```sh
turbo test --filter @clerk/backend               # runs all three
```

## Component Test Fixtures

`clerk-js` and `ui` share a fixture system in `packages/clerk-js/src/test/`:

- `bindCreateFixtures(componentName)` — builds a full React provider tree for component-level tests
- `fixtures.ts` — JSON stubs for all Clerk API shapes (environment, client, user)
- `mockClerkMethods` — deep-mocks the entire Clerk singleton
- `ui` reuses these fixtures via a path alias in its vitest config

## Integration Tests

`integration/` is a standalone Playwright project. These require 1Password secrets (`pnpm integration:secrets`) and `pkglab` for a local package registry — they're not part of the normal dev loop.

```sh
pnpm test:integration:base          # full suite
pnpm test:integration:nextjs        # framework-specific
```

## Integration Test Architecture

- `integration/templates/` — 19 app templates (one per framework)
- `integration/presets/` — typed config builders per framework
- `integration/testUtils/` — `createTestUtils` factory providing page objects (`u.po.signIn`) and service helpers (`u.services.users`)
- Tests tagged with `@grep` labels (`@nextjs`, `@generic`) for targeted CI runs
