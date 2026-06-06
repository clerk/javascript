# Package map

The 21 active, git-tracked packages, the dependency shape, and the full "change X, touch Y" routing.
`SKILL.md` has the short version (the ~10 packages people touch most).

> The authoritative package list is the set of `packages/*/package.json` files tracked in git. The
> `packages/` directory can also hold leftover build artifacts from **removed** packages (e.g.
> `types`, `remix`, `themes`, `elements`, `agent-toolkit`, `dev-cli`) that contain only `dist/` and
> no `package.json`. Those are not active packages and are not valid commit scopes.

## All packages

Categories: **foundational** (depended on by most others), **browser-runtime** (ships to the
browser directly), **adapter** (framework SDK), **ui/i18n**, **tooling**. The "BC" column marks the
two packages whose runtime is pushed into apps pinned to older SDKs, so they carry the strict
backwards-compatibility contract (see `breaking-changes.md`).

| Package                       | Category        | BC  | Purpose                                                                                                                                          |
| ----------------------------- | --------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@clerk/shared`               | foundational    |     | Internal utilities used by all SDKs (storage, events, React helpers). Hosts the shared types as `@clerk/shared/types`. Most-depended-on package. |
| `@clerk/backend`              | foundational    |     | Backend API REST client, JWT verification, webhook helpers. Used by every server adapter.                                                        |
| `@clerk/clerk-js`             | browser-runtime | ⚠️  | The browser runtime (script tag). Bundles the hosted UI. Backwards-compat sensitive.                                                             |
| `@clerk/ui`                   | ui              | ⚠️  | React components powering the hosted sign-in / sign-up flows. Consumed by `clerk-js`. Backwards-compat sensitive.                                |
| `@clerk/react`                | adapter (core)  |     | React hooks and context (`useAuth`, `useUser`, `useOrganization`, ...). Shared by the React-based adapters.                                      |
| `@clerk/nextjs`               | adapter         |     | Next.js SDK: middleware, route handlers, server components.                                                                                      |
| `@clerk/express`              | adapter         |     | Express middleware and server helpers.                                                                                                           |
| `@clerk/fastify`              | adapter         |     | Fastify plugin.                                                                                                                                  |
| `@clerk/hono`                 | adapter         |     | Hono SDK (edge / serverless).                                                                                                                    |
| `@clerk/astro`                | adapter         |     | Astro integration (components + server utilities).                                                                                               |
| `@clerk/nuxt`                 | adapter         |     | Nuxt module (Vue).                                                                                                                               |
| `@clerk/vue`                  | adapter         |     | Vue 3 composables and components.                                                                                                                |
| `@clerk/react-router`         | adapter         |     | React Router v7 SDK.                                                                                                                             |
| `@clerk/tanstack-react-start` | adapter         |     | TanStack React Start SDK.                                                                                                                        |
| `@clerk/expo`                 | adapter         |     | React Native / Expo SDK.                                                                                                                         |
| `@clerk/expo-passkeys`        | adapter         |     | Passkeys companion library for Expo.                                                                                                             |
| `@clerk/chrome-extension`     | browser-runtime |     | SDK for Chrome extension contexts.                                                                                                               |
| `@clerk/localizations`        | ui/i18n         |     | Translation strings for the UI components. Consumed by `ui`.                                                                                     |
| `@clerk/testing`              | tooling         |     | E2E test helpers for consumers (Playwright + Cypress).                                                                                           |
| `@clerk/msw`                  | tooling         |     | MSW request handlers for mocking the Clerk API in tests. Private (not published).                                                                |
| `@clerk/upgrade`              | tooling         |     | CLI codemod tool for upgrading consumers between SDK versions.                                                                                   |

Tests: `pnpm turbo test --filter=@clerk/<name>` (or `pnpm --filter @clerk/<name> test` after a
build). Most packages use vitest; `@clerk/backend` runs a multi-runtime suite (node + edge +
cloudflare). A few packages (`localizations`, `expo-passkeys`, `msw`) have no unit-test script.

## Dependency shape

```
                @clerk/shared            (≈20 dependents, the base of the pyramid)
                /     |     \
       @clerk/types  utils  @clerk/backend   (≈10 dependents: every server adapter)
                |               |
          @clerk/react     server helpers
           /   |   \
   nextjs  react-router  expo ...        (framework adapters, consume react + backend + shared)
                |
         @clerk/clerk-js  ──bundles──▶  @clerk/ui  ──uses──▶  @clerk/localizations
```

Practical consequence: a change to `@clerk/shared` or `@clerk/backend` fans out widely. Build and
test the consumers, not just the package you edited. After editing `shared`, a
`pnpm turbo build --filter=@clerk/shared` keeps everything else type-correct.

`@clerk/types` is a deprecated alias for `@clerk/shared/types`. Prefer importing from
`@clerk/shared/types`. If a type error traces back to it, rebuild shared:
`pnpm turbo build --filter=@clerk/shared`.

## Change X, touch Y

- **A React hook (`useAuth`, `useUser`, `useOrganization`, ...)**: `packages/react/src`. Changes
  propagate to `nextjs`, `react-router`, `tanstack-react-start`, `expo` (all consume `@clerk/react`).
- **The hosted sign-in / sign-up UI (components, layout)**: `packages/ui/src`. Strings live in
  `packages/localizations/src`. `clerk-js` bundles `ui`, so it propagates automatically. Watch with
  `pnpm dev:fe-libs`. For the theming/appearance system specifically, read
  `references/theming-architecture.md`.
- **Backend token verification / JWT / Backend API client**: `packages/backend/src` (JWT logic under
  `packages/backend/src/jwt`). Every server adapter depends on this.
- **Next.js middleware / route handlers / server components**: `packages/nextjs/src` (client side
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
- **A brand-new framework adapter**: create `packages/<framework>`, depend on `@clerk/backend`
  (verify), `@clerk/shared` (utils), and `@clerk/react` (if React-based). Follow the structure of
  `packages/nextjs` or `packages/express`. The workspace glob `packages/*` picks it up automatically.
