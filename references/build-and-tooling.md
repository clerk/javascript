# Build System & Tooling

## Package Manager

**pnpm 10.33.0** enforced via `preinstall: npx only-allow pnpm` and `packageManager` field. Node >= 24.15.0 required.

Workspace packages declared in `pnpm-workspace.yaml` under `packages/*`. Version catalogs defined for shared tool versions:

- `repo` — `tsup@8.5.1`, `tsdown@0.15.7`, `typescript@5.8.3`, etc.
- `rspack` — `@rspack/core@1.7.11`, `@rspack/cli@1.7.11`
- `react` / `peer-react` — React 18.3.1 for internal devDeps, React 18/19 for peer deps

## Turborepo

`turbo.json` (schema v2) with remote cache and signature verification enabled.

### Task Pipeline

| Task                      | `dependsOn`     | Cached | Notes                                              |
| ------------------------- | --------------- | ------ | -------------------------------------------------- |
| `build`                   | `^build`        | yes    | Outputs: `dist/**`, `*/package.json`, `scripts/**` |
| `build:declarations`      | `build`         | yes    | tsc declarations only                              |
| `dev`                     | —               | no     | Watch mode, not persistent                         |
| `dev:current`             | `^build`, `dev` | no     | Persistent; builds deps first, then watches        |
| `test`                    | `build`         | yes    | Requires built state                               |
| `lint`                    | `^build`        | yes    | Inputs include `eslint.config.mjs`                 |
| `lint:publint`            | `build`         | yes    | Package publishing lint                            |
| `lint:attw`               | `build`         | yes    | "Are The Types Wrong" check                        |
| `bundlewatch`             | `build`         | yes    | Bundle size monitoring                             |
| `format` / `format:check` | —               | yes    | No build dependency                                |

### Global Cache Keys

- Files: `.github/.cache-version`, `.npmrc`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig*.json`
- Env vars: all `CLERK_*`, `NEXT_PUBLIC_CLERK_*`, `VITE_CLERK_*`, `NODE_ENV`, `NODE_VERSION`, `VERCEL`

## Build Tools by Package

### Rspack (browser bundles)

Used by `@clerk/clerk-js` and `@clerk/ui` — the two packages shipping optimized browser bundles.

- **clerk-js**: Produces `clerk.js`, `clerk.mjs`, `clerk.browser.js`, `clerk.no-rhc.mjs`, `clerk.native.js`. Dev server on port 4000 with HMR via `@rspack/plugin-react-refresh`.
- **ui**: UMD bundle via rspack; ESM layer built with tsdown. Dev server on port 4011.

### tsup (library packages)

Used by the majority of packages: `nextjs`, `react`, `backend`, `expo`, `astro`, `vue`, `chrome-extension`, `hono`, `nuxt`, `react-router`, `tanstack-react-start`, `express`, `expo-passkeys`, `testing`, `localizations`.

Common config: both `esm` and `cjs` output, `bundle: true`, `sourcemap: true`, `minify: false`. Post-build runs `tsc` for declarations and optionally `pkglab pub --ping`.

Notable: `@clerk/nextjs` uses 6 separate tsup configs with `bundle: false` to preserve file structure for `"use client"` directives.

### tsdown (newer bundler)

Used by `@clerk/shared` (two configs: types + runtime, both cjs/esm, `target: es2022`) and `@clerk/ui`'s ESM build (with `@svgr/rollup` plugin).

### tsc standalone

Declaration-only builds (`.d.ts`) universally use `tsc -p tsconfig.declarations.json` as a post-build step. Vue packages use `vue-tsc` for Vue-aware declarations.

## TypeScript Configuration

No shared `tsconfig.base.json` — each package defines its own `tsconfig.json` independently. The root `tsconfig.json` is primarily used by ESLint's `projectService`.

| Package             | `module`   | `moduleResolution` | `target`          |
| ------------------- | ---------- | ------------------ | ----------------- |
| `nextjs`, `backend` | `NodeNext` | `NodeNext`         | `ES2019`/`ES2020` |
| `shared`, `ui`      | `preserve` | `bundler`          | `es2022`          |
| `clerk-js`          | `esnext`   | `Bundler`          | `ES2019`          |

Root tsconfig: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `noImplicitReturns: true`.

## Linting

### ESLint (flat config)

Base: `@eslint/js` recommended + `tseslint.configs.recommendedTypeChecked` (type-aware).

Key plugins: `simple-import-sort` (error), `unused-imports` (error), `turbo`, `react-hooks`, `jsx-a11y`, `playwright` (integration tests), `jsdoc` (shared), `yml`.

Custom rules:

- `no-navigate-useClerk` — disallows `navigate` from `useClerk()` in clerk-js UI
- `no-global-object` — use `globalThis` not `global.` (shared)
- `no-unstable-methods` — use `__internal_` or `__experimental_` not `__unstable_`
- `no-physical-css-properties` — enforces CSS logical properties for RTL (ui)

### Prettier

`singleQuote: true`, `jsxSingleQuote: true`, `printWidth: 120`, `trailingComma: 'all'`, `arrowParens: 'avoid'`, `singleAttributePerLine: true`. Plugins: `prettier-plugin-packagejson`, `prettier-plugin-tailwindcss`, `prettier-plugin-astro`.

### Pre-commit

Husky runs `lint-staged` on commit — Prettier auto-format only (no ESLint in pre-commit). Commitlint runs in CI only via `pr-title-linter.yml`.

## Changesets & Releases

Config: `updateInternalDependencies: patch`, `updateInternalDependents: always`, packages version independently (no `fixed`/`linked` groups).

### Release Flows

- **Production**: `changesets/action` creates a "Version packages" PR. When merged, publishes to npm with provenance. Dispatches downstream workflows to `sdk-infra-workers`, `dashboard`, `clerk-docs`.
- **Canary**: Automated on every push to `main` via `scripts/canary.mjs`. Published with `--tag canary`.
- **Snapshot**: On-demand via `!snapshot [name]` comment on a PR. Published with `--tag snapshot`.
- **Per-PR previews**: `pkg-pr-new` publishes preview packages for every PR.

## CI/CD Workflows

### `ci.yml` (PRs to main)

1. `check-permissions` — blocks fork PRs from secrets
2. `pre-checks` — formatting, dedupe, changeset status
3. `build-packages` — `turbo build` with remote cache
4. `static-analysis` — bundlewatch, publint, attw, eslint
5. `unit-tests` — matrix: Node 24.15.0 + Node 20.19.0
6. `integration-tests` — matrix of ~20 test suites across frameworks (uses `pkglab` local registry)
7. `pkg-pr-new` — per-PR preview package publishing

### `release.yml` (push to main)

- Production release via changesets
- Canary release (automatic)
- Snapshot release (triggered by PR comment)

### Other

- `nightly-checks.yml` — Next.js canary integration tests daily
- `release-preflight.yml` — validates changesets and `npm pack` on push to main
- `e2e-staging.yml` — integration tests against staging
- `major-version-check.yml` — requires `!allow-major` comment for major bumps
- `mobile-e2e.yml` — Expo E2E tests
