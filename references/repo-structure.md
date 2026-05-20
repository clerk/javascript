# Repository Structure & Package Architecture

## Packages

### Foundation

- **`@clerk/shared`** — types, hooks, utilities. Depended on by every other package. Must build first. (`@clerk/types` is deprecated; use `@clerk/shared/types`.)
- **`@clerk/upgrade`** — standalone CLI for SDK migration codemods
- **`@clerk/dev-cli`** — internal CLI for local dev iteration

### Core

- **`@clerk/backend`** — server-side Clerk API client + JWT verification. Multi-runtime (Node, Edge, Cloudflare). Depended on by all framework SDKs and server middleware.
- **`@clerk/react`** — hooks and components (ClerkProvider, useUser, useAuth). Depended on by all React-based framework SDKs.
- **`@clerk/clerk-js`** — browser JS bundle loaded by all web SDKs. Built with Rspack (not tsup). Depended on by `expo` and `chrome-extension`.
- **`@clerk/ui`** — internal UI components (sign-in, sign-up, profiles) built with Emotion. Not intended for direct consumption.
- **`@clerk/localizations`** — i18n strings for UI components, 40+ locales.

### Framework SDKs

| Package                       | Internal deps                       |
| ----------------------------- | ----------------------------------- |
| `@clerk/nextjs`               | `backend`, `react`, `shared`        |
| `@clerk/react-router`         | `backend`, `react`, `shared`        |
| `@clerk/tanstack-react-start` | `backend`, `react`, `shared`        |
| `@clerk/astro`                | `backend`, `shared`                 |
| `@clerk/vue`                  | `shared`                            |
| `@clerk/nuxt`                 | `backend`, `shared`, `vue`          |
| `@clerk/expo`                 | `clerk-js`, `react`, `shared`       |
| `@clerk/chrome-extension`     | `clerk-js`, `react`, `shared`, `ui` |

### Server Middleware

`@clerk/express`, `@clerk/fastify`, `@clerk/hono` — all depend on `backend` + `shared`.

### Testing

- **`@clerk/testing`** — published E2E utilities for Playwright and Cypress
- **`@clerk/msw`** — private MSW handlers for unit tests (not published)

## Key Relationships

- `shared` is the universal foundation — break it, break everything.
- `clerk-js` and `ui` ship browser bundles and are pushed to production without consumers updating. Extra care required.
- The Clerk class API in `clerk-js/src/core/clerk.ts` is a public contract — changes require a major version.
- `backend` is the server-side authority — all framework server integrations go through it.

## Directory Layout

- `integration/` — Playwright E2E tests with 19 app templates, one per framework
- `scripts/` — release, CI, and automation scripts
- `references/` — these docs
- `.github/workflows/` — CI, release, nightly, e2e-staging, mobile-e2e
- `.changeset/` — release management
