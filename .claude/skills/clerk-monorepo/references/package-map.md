# Package map

Every package, the dependency shape, and the full "change X, touch Y" routing. `SKILL.md` has the
short version (the ~10 packages people touch most).

## All packages

The package list is the set of git-tracked `packages/*/package.json` files. Most have a
`description` saying what the package is, and `"private": true` marks the ones that never publish:

```bash
for f in $(git ls-files 'packages/*/package.json' | awk -F/ 'NF==3'); do
  node -p "const p = require('./$f'); p.name + (p.private ? ' (private)' : '') + ': ' + (p.description ?? '')"
done
```

The `packages/` directory can also hold leftover build artifacts from **removed** packages (e.g.
`types`, `remix`, `themes`, `elements`) with no `package.json`. Those are not active packages and are
not valid commit scopes.

Only `@clerk/clerk-js` and `@clerk/ui` carry the strict backwards-compatibility contract: their
runtime is pushed into apps pinned to older SDKs (see `breaking-changes.md`).

Tests: `pnpm turbo test --filter=@clerk/<name>` (or `pnpm --filter @clerk/<name> test` after a
build). Most packages use vitest; `@clerk/backend` runs a multi-runtime suite (node + edge +
cloudflare). A few packages (`localizations`, `expo-passkeys`, `msw`, `swingset`) have no unit-test
script.

## Dependency shape

```text
                @clerk/shared            (≈20 dependents, the base of the pyramid)
                    /      \
          @clerk/react   @clerk/backend  (≈10 dependents: every server adapter)
           /   |   \
   nextjs  react-router  expo ...        (framework adapters: consume react + backend + shared)

   @clerk/mosaic  ──uses──▶  @clerk/shared
   @clerk/ui  ──uses──▶  @clerk/localizations   (hosted UI; consumed by react / astro / vue / chrome-extension)
   @clerk/clerk-js                               (standalone browser runtime, script tag; delivered alongside @clerk/ui)
```

Practical consequence: a change to `@clerk/shared` or `@clerk/backend` fans out widely. Build and
test the consumers, not just the package you edited. After editing `shared`, a
`pnpm turbo build --filter=@clerk/shared` keeps everything else type-correct.

`@clerk/types` is no longer a package in this repo; its types were merged into `@clerk/shared`
(`packages/types/` is a leftover dir with no `package.json`). It survives only as a deprecated npm
package that re-exports `@clerk/shared/types`, so always import from `@clerk/shared/types`. If a type
error traces back to it, rebuild shared: `pnpm turbo build --filter=@clerk/shared`.

## Change X, touch Y

- **A React hook**: `useAuth` is implemented in `packages/react/src`; most others (`useUser`,
  `useOrganization`, ...) live in `packages/shared/src/react/hooks` and are re-exported by
  `@clerk/react`. Changes propagate to `nextjs`, `react-router`, `tanstack-react-start`, `expo`,
  `chrome-extension` (all consume `@clerk/react`; note `expo` wraps `useAuth` rather than just
  re-exporting it).
- **Mosaic components (`UserButton`, StyleX parts, flow views)**: `packages/mosaic/src` (`@clerk/mosaic`). Preview in Swingset (`pnpm dev:swingset`). Unstyled headless primitives live alongside them at `packages/mosaic/src/primitives`. Mosaic-only changesets should not list `@clerk/react` or `@clerk/nextjs`.
- **The hosted sign-in / sign-up UI (components, layout)**: `packages/ui/src/components` (`@clerk/ui`).
  Strings live in `packages/localizations/src`. `@clerk/ui` is consumed by the
  `react`/`astro`/`vue`/`chrome-extension` adapters; its compiled runtime is delivered alongside
  `clerk-js` (both are backwards-compat sensitive), though `clerk-js` does not declare it as a package
  dependency. Watch with `pnpm dev:fe-libs`. For the theming/appearance system specifically, read the
  repo-root `references/theming-architecture.md` (not this skill's own `references/` dir).
- **Backend token verification / JWT / Backend API client**: `packages/backend/src` (JWT logic under
  `packages/backend/src/jwt`). Every server adapter depends on this.
- **Next.js middleware / route handlers / server components**: `packages/nextjs/src` (client-side
  reuses `@clerk/react` unchanged).
- **Express / Fastify / Hono server integration**: the respective `packages/<framework>/src`.
- **Cross-cutting utilities (storage, events, React context plumbing)**: `packages/shared/src`. High
  fan-out; verify consumers.
- **Shared types / interfaces**: `packages/shared/src/types` (exported as `@clerk/shared/types`).
- **Mobile (React Native / Expo)**: `packages/expo/src`; passkeys in `packages/expo-passkeys/src`.
- **Localization / i18n strings**: `packages/localizations/src`.
- **The `Clerk` class public API**: `packages/clerk-js/src/core/clerk.ts`. This is a versioned
  contract; see `breaking-changes.md` before touching it.
- **Consumer-facing test helpers**: `packages/testing/src` (Playwright/Cypress); API mocks in
  `packages/msw`.
- **The upgrade codemods**: `packages/upgrade/src`.
- **ESLint rules that enforce Clerk patterns**: `packages/eslint-plugin/src`.
- **A brand-new framework adapter**: create `packages/<framework>`, depend on `@clerk/backend`
  (verify), `@clerk/shared` (utils), and `@clerk/react` (if React-based). Follow the structure of
  `packages/nextjs` or `packages/express`. The workspace glob `packages/*` picks it up automatically.
