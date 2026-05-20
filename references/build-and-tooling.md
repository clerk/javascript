# Build System & Tooling

## Build Tools by Package

Not all packages use the same build tool:

- **Rspack**: `clerk-js` and `ui` — these are browser bundles with HMR dev servers
- **tsup**: most library packages (nextjs, react, backend, expo, astro, vue, express, etc.) — outputs both ESM and CJS
- **tsdown**: `shared` (types + runtime) and `ui`'s ESM layer
- **tsc**: declaration-only builds (`.d.ts`) as a post-build step everywhere

`@clerk/nextjs` is uniquely complex: 6 tsup configs with `bundle: false` to preserve file structure for `"use client"` directives.

## Turborepo

Key task dependencies to know:

- `build` depends on `^build` (upstream packages first)
- `test` and `lint` depend on `build`
- `dev` is uncached; `dev:current` builds deps first then watches
- Remote cache is enabled with signature verification

## Linting

ESLint flat config with type-checked rules. Notable custom rules:

- `no-navigate-useClerk` — clerk-js UI must not use `navigate` from `useClerk()`
- `no-global-object` — use `globalThis` not `global.` in `shared`
- `no-physical-css-properties` — CSS logical properties enforced in `ui` for RTL

Prettier runs on pre-commit via Husky + lint-staged. Commitlint (conventional commits with required scope) runs in CI only.

## Releases

- **Production**: changesets/action creates a "Version packages" PR → merge publishes to npm
- **Canary**: automatic on every push to `main`
- **Snapshot**: on-demand via `!snapshot [name]` PR comment
- **Per-PR previews**: `pkg-pr-new` publishes preview packages on every PR

Packages version independently (no fixed/linked groups). Internal dep bumps use patch.
