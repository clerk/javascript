# Development Workflow

## Getting Started

```sh
git clone https://github.com/clerk/javascript
cd javascript
corepack enable          # Enables pnpm via Corepack
pnpm install             # Always from monorepo root
pnpm build               # Required before dev — generates types, resolves workspace deps
```

Node >= 24.15.0 and pnpm >= 10.33.0 required.

## Dev Commands

| Command            | What it does                                                                       |
| ------------------ | ---------------------------------------------------------------------------------- |
| `pnpm dev`         | Watch mode for all `@clerk/*` packages (excludes expo, tanstack, chrome-extension) |
| `pnpm dev:fe-libs` | Watch for `clerk-js`, `ui`, `shared` only                                          |
| `pnpm dev:js`      | `dev:current` for `clerk-js` — builds deps first, then watches                     |
| `pnpm dev:sandbox` | Sandbox UI at `http://localhost:4000` + `@clerk/ui` on port 4011                   |

Per-package:

- **clerk-js, ui**: `rspack serve` with HMR (React Refresh). `hot: true`, `liveReload: false`.
- **All other packages**: `tsup --watch` or `tsdown --watch` — rebuilds on change, downstream packages pick up via workspace symlinks.

## Sandbox

The sandbox (`packages/clerk-js/sandbox/`) is a browser environment for iterating on UI components without a real app.

- Served by rspack at `http://localhost:4000`
- `@clerk/ui` served separately on port 4011
- HMR enabled, source maps: `eval-cheap-source-map`

### Runtime Controls (browser console)

```js
components.signIn.setProps({
  /* ... */
}); // Adjust component props
scenario.setScenario('ScenarioName'); // Switch MSW mock scenario
scenario.setScenario(scenario.UserButtonLoggedIn); // Named scenario
```

Props and scenarios are persisted to URL query params and `localStorage`. Available scenarios live in `packages/clerk-js/sandbox/scenarios/`.

## Environment Variables

### For integration tests

Populated via `pnpm integration:secrets` (pulls from 1Password):

- `integration/.env.local` — Vercel credentials (`VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`, `VERCEL_TOKEN`)
- `integration/.keys.json` — Clerk instance keys (`{ pk, sk }` pairs per instance name)

### Turbo-tracked env vars

All `CLERK_*`, `NEXT_PUBLIC_CLERK_*`, `VITE_CLERK_*`, `EXPO_PUBLIC_CLERK_*`, `REACT_APP_CLERK_*`, `PUBLIC_CLERK_*`, `PLASMO_PUBLIC_CLERK_*`, `NODE_ENV`.

## Git Hooks

**Pre-commit** (Husky + lint-staged): runs Prettier auto-format on all staged files. No ESLint or type-checking in pre-commit.

**Commit message format**: `type(scope): subject` (conventional commits). Scope is required — must be a package name (e.g. `clerk-js`, `nextjs`, `shared`) or `repo`, `release`, `e2e`, `ci`, `*`. Enforced in CI only (`pr-title-linter.yml`), not locally.

## PR Workflow

1. Create a feature branch: `git checkout -b feat/amazing_feature`
2. Add a changeset: `pnpm changeset` (or `pnpm changeset:empty` for internal-only changes)
3. Commit using conventional commits
4. Open PR with description

CI will run: formatting check, dedupe check, changeset status, build, lint (eslint + publint + attw), unit tests (Node 24 + Node 20), integration tests, bundlewatch, and publish per-PR preview packages via `pkg-pr-new`.

## Useful Scripts

```sh
pnpm nuke                # Deep clean: deletes all dist/, node_modules/, .turbo/
pnpm lint                # ESLint across all packages
pnpm lint:fix            # ESLint with --fix
pnpm format              # Prettier format all files
pnpm format:check        # Prettier check mode
pnpm lint:publint        # Validate package.json publishing config
pnpm lint:attw           # "Are The Types Wrong" — validates type exports
pnpm bundlewatch         # Bundle size monitoring
pnpm changeset status    # See pending changesets
turbo build --filter @clerk/nextjs   # Build a single package
```

## Resetting a Broken State

```sh
pnpm nuke                # Removes dist/, node_modules/, .turbo/ everywhere
pnpm install
pnpm build
```

## TypeScript Errors

If errors come from `@clerk/shared/types`:

```sh
turbo build --filter=@clerk/shared --filter=@clerk/types
```

`@clerk/types` is deprecated — types are now exported from `@clerk/shared/types`.

## Code Generation

- `renovate.json5` is auto-generated: `node scripts/renovate-config-generator.mjs`
- TypeDoc API docs: `pnpm typedoc:generate` (builds first) or `pnpm typedoc:generate:skip-build`
- Canary/snapshot version files generated during release process
