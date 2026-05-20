# Repository Structure & Package Architecture

Clerk's JavaScript SDK monorepo (`clerk/javascript`).

## Top-Level Layout

```
packages/           All published and internal packages
integration/        Playwright E2E integration tests and app templates
scripts/            Release, CI, and automation scripts
references/         Internal design documentation
docs/               Minimal (CONTRIBUTING.md)
.github/            CI/CD workflows, issue templates, custom actions
.changeset/         Changesets for release management
.typedoc/           TypeDoc generation output and config
.husky/             Git hooks (pre-commit)
```

## Packages

### Foundation (no internal dependencies)

| Package            | npm name         | Description                                                                       |
| ------------------ | ---------------- | --------------------------------------------------------------------------------- |
| `packages/shared`  | `@clerk/shared`  | Utility library, types, hooks, React helpers. Depended on by every other package. |
| `packages/upgrade` | `@clerk/upgrade` | CLI tool (`clerk-upgrade`) for jscodeshift codemods during SDK migrations         |
| `packages/dev-cli` | `@clerk/dev-cli` | Internal CLI (`clerk-dev`) for local development iteration                        |

### Core Libraries

| Package                  | npm name               | Internal deps             | Description                                                                                                |
| ------------------------ | ---------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `packages/backend`       | `@clerk/backend`       | `shared`                  | Backend REST client for Clerk API + JWT verification. Multi-runtime (Node, Edge, Cloudflare).              |
| `packages/react`         | `@clerk/react`         | `shared`                  | Core React hooks and components (ClerkProvider, useUser, useAuth, etc.)                                    |
| `packages/localizations` | `@clerk/localizations` | `shared`                  | i18n strings for all Clerk UI components across 40+ locales                                                |
| `packages/ui`            | `@clerk/ui`            | `shared`, `localizations` | Internal package with all rendered UI components (sign-in, sign-up, user profile, etc.) built with Emotion |
| `packages/clerk-js`      | `@clerk/clerk-js`      | `shared`                  | Main browser JS bundle loaded by all Clerk web SDKs. Built with Rspack.                                    |

### Framework SDKs

| Package                         | npm name                      | Internal deps                       | Description                                                         |
| ------------------------------- | ----------------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| `packages/nextjs`               | `@clerk/nextjs`               | `backend`, `react`, `shared`        | Next.js SDK (App Router + Pages Router, middleware, Server Actions) |
| `packages/react-router`         | `@clerk/react-router`         | `backend`, `react`, `shared`        | React Router v7 SDK (framework mode, SSR, loaders)                  |
| `packages/tanstack-react-start` | `@clerk/tanstack-react-start` | `backend`, `react`, `shared`        | TanStack React Start SDK (SSR, server functions)                    |
| `packages/astro`                | `@clerk/astro`                | `backend`, `shared`                 | Astro integration (SSR + static, Cloudflare Workers compatible)     |
| `packages/vue`                  | `@clerk/vue`                  | `shared`                            | Vue 3 SDK (composables, components)                                 |
| `packages/nuxt`                 | `@clerk/nuxt`                 | `backend`, `shared`, `vue`          | Nuxt module wrapping the Vue SDK with server-side support           |
| `packages/expo`                 | `@clerk/expo`                 | `clerk-js`, `react`, `shared`       | React Native / Expo SDK (native + web, passkeys, OAuth)             |
| `packages/chrome-extension`     | `@clerk/chrome-extension`     | `clerk-js`, `react`, `shared`, `ui` | Chrome/browser extensions SDK                                       |

### Server Middleware

| Package            | npm name         | Internal deps       | Description                   |
| ------------------ | ---------------- | ------------------- | ----------------------------- |
| `packages/express` | `@clerk/express` | `backend`, `shared` | Express.js middleware         |
| `packages/fastify` | `@clerk/fastify` | `backend`, `shared` | Fastify plugin                |
| `packages/hono`    | `@clerk/hono`    | `backend`, `shared` | Hono middleware (edge-native) |

### Testing & Internal

| Package                  | npm name               | Internal deps       | Description                                                |
| ------------------------ | ---------------------- | ------------------- | ---------------------------------------------------------- |
| `packages/testing`       | `@clerk/testing`       | `backend`, `shared` | E2E testing utilities for Playwright and Cypress           |
| `packages/msw`           | `@clerk/msw`           | `shared`            | Private MSW handler package for unit tests (not published) |
| `packages/expo-passkeys` | `@clerk/expo-passkeys` | `shared`            | Passkeys library for Expo                                  |

## Dependency Graph

```
@clerk/shared                    <- FOUNDATION (depended on by all 17+ packages)
  |
  +-- @clerk/backend             <- SERVER AUTHORITY (depended on by 8 packages)
  |     +-- @clerk/nextjs
  |     +-- @clerk/react-router
  |     +-- @clerk/tanstack-react-start
  |     +-- @clerk/astro
  |     +-- @clerk/nuxt
  |     +-- @clerk/express
  |     +-- @clerk/fastify
  |     +-- @clerk/hono
  |     +-- @clerk/testing
  |
  +-- @clerk/react               <- CLIENT AUTHORITY (depended on by 5 packages)
  |     +-- @clerk/nextjs
  |     +-- @clerk/react-router
  |     +-- @clerk/tanstack-react-start
  |     +-- @clerk/expo
  |     +-- @clerk/chrome-extension
  |
  +-- @clerk/clerk-js            <- BROWSER BUNDLE (depended on by 2 packages)
  |     +-- @clerk/expo
  |     +-- @clerk/chrome-extension
  |
  +-- @clerk/localizations
  |     +-- @clerk/ui
  |
  +-- @clerk/vue
        +-- @clerk/nuxt
```

Key: `@clerk/shared` must be built first in every pipeline. `@clerk/types` is deprecated; use `@clerk/shared/types`.

## Non-Package Directories

### `integration/`

Playwright-based E2E test infrastructure:

- `templates/` — 19 ready-to-run app templates (next-app-router, react-vite, astro, express, nuxt, vue, etc.)
- `tests/` — ~70 test files covering auth flows, components, middleware, billing, sessions, handshake, etc.
- `presets/` — per-framework app configuration presets
- `models/` — test infrastructure models (Application, Environment, Deployment)
- `testUtils/` — shared test utilities (usersService, emailService, organizationsService)

### `scripts/`

Root-level automation:

- Release: `canary.mjs`, `snapshot.mjs`, `common.mjs`
- CI: `1password-keys.mjs`, `resolve-instance-keys.mjs`, `validate-staging-instances.mjs`
- Tooling: `lint.mjs`, `format-non-workspace.mjs`, `nuke.mjs`

### `.github/`

- 12 GitHub Actions workflows (ci, release, e2e-staging, nightly, mobile-e2e, etc.)
- 4 custom composite actions (ensure-stable-pr, init, init-blacksmith, version-prepatch)
