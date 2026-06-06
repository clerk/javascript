---
name: clerk-monorepo
description: >-
  Work effectively in the clerk/javascript SDK monorepo. Use when setting up the repo,
  building / testing / running a package, deciding which of the @clerk/* packages to
  change, writing changesets, conventional commits, or PRs, or checking whether a change
  is a breaking change to clerk-js or ui. Covers the pnpm + turbo dev loop, the package
  map, and the repo's hard rules. AGENTS.md is the authority on the rules; this skill is
  the how-to layer that points back to it.
---

# Working in the clerk/javascript monorepo

This is Clerk's JavaScript SDK monorepo: 21 published `@clerk/*` packages managed with pnpm
workspaces and Turborepo. Read this before building, testing, committing, or touching anything
under `packages/`.

`AGENTS.md` (repo root) is the canonical source of truth for the hard rules. This skill restates
those rules in actionable form and links back to it. If a rule here ever disagrees with `AGENTS.md`,
`AGENTS.md` wins, and the discrepancy should be fixed here.

## Fast setup (happy path)

The order matters more than the commands. Do them in sequence:

1. **Node `>=24.15.0`** (pinned in `.nvmrc`). `nvm use` if you have nvm. Wrong Node version is the
   single most common cause of cryptic "cannot find module @clerk/..." build errors.
2. **`corepack enable`** before installing. The `preinstall` hook runs `only-allow pnpm`; npm/yarn
   are hard-blocked. Corepack pins the right pnpm (`>=10.33.0`).
3. **`pnpm install` from the repo root** (never a subdirectory). It is a workspace; installing from
   a package dir leaves cross-package links broken.
4. **`pnpm build`** before anything else. Packages depend on each other's built `dist/` + `.d.ts`.
   Skipping this makes `dev`, tests, and the editor's types all report phantom errors.
5. **`pnpm dev`** to start watch mode.

Full sequence, the 11 footguns, and the internal integration-test / 1Password setup live in
[`references/setup-and-footguns.md`](references/setup-and-footguns.md).

## Package map: where does X live?

The ~10 packages people touch most. Full 21-package table, the dependency pyramid, and the complete
"change X, touch Y" routing are in [`references/package-map.md`](references/package-map.md).

| Package                | You change it when...                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@clerk/shared`        | Utilities used everywhere (storage, events, React helpers). Most-depended-on; changes fan out to ~20 packages. Types live here too (`@clerk/shared/types`). |
| `@clerk/backend`       | Server-side: JWT verification, the Backend API REST client, webhooks. Used by every framework adapter.                                                      |
| `@clerk/clerk-js`      | ⚠️ The browser runtime loaded via script tag. **Backwards-compat sensitive** (see rules).                                                                   |
| `@clerk/ui`            | ⚠️ The React components powering the hosted sign-in / sign-up UI. **Backwards-compat sensitive**.                                                           |
| `@clerk/react`         | Shared React hooks/context (`useAuth`, `useUser`, ...) consumed by the React-based adapters.                                                                |
| `@clerk/nextjs`        | Next.js SDK: middleware, route handlers, server components.                                                                                                 |
| `@clerk/express`       | Express middleware and server helpers.                                                                                                                      |
| `@clerk/expo`          | React Native / Expo SDK.                                                                                                                                    |
| `@clerk/localizations` | UI translation strings (consumed by `ui`).                                                                                                                  |
| `@clerk/testing`       | E2E helpers for consumers (Playwright / Cypress).                                                                                                           |

> Heads-up: `packages/` may contain stale leftover dirs (`types`, `remix`, `themes`, `elements`, ...)
> with only `dist/` and no `package.json`. Those are removed packages, not active ones. The
> authoritative list is the git-tracked `packages/*/package.json` files.

## Dev-loop recipes

```bash
# Build one package (and its deps, via turbo ^build)
pnpm turbo build --filter=@clerk/nextjs

# Watch subsets instead of everything
pnpm dev:fe-libs      # clerk-js + ui + shared
pnpm dev:js           # clerk-js only
pnpm dev:sandbox      # rspack sandbox for previewing UI components

# Run one package's unit tests (builds deps first via turbo)
pnpm turbo test --filter=@clerk/backend
# Faster, after a full build, for tight iteration:
pnpm --filter @clerk/backend test

# Run a single test file (vitest matches by filename substring)
pnpm --filter @clerk/shared test -- run path/to/file.test.ts

# Quality gates (CI runs these)
pnpm lint
pnpm format            # also fixes non-workspace files like this skill

# Changesets
pnpm changeset         # for package-affecting changes
pnpm changeset:empty   # for repo/tooling-only changes (see rules)
```

Test runner differs by package (`shared`, `clerk-js`, most adapters use vitest; `backend` runs a
multi-runtime suite), but the `pnpm --filter <name> test` invocation is uniform.

If the editor or a build reports stale types from `@clerk/shared`, rebuild the foundations:
`pnpm turbo build --filter=@clerk/shared`.

Integration-test variants (`pnpm test:integration:*`) and canary/snapshot releases are the long tail:
see [`references/setup-and-footguns.md`](references/setup-and-footguns.md) and `docs/CONTRIBUTING.md`.

## The hard rules

Each rule below restates `AGENTS.md`; the parenthetical is how it is enforced.

- **pnpm only, Node `>=24.15`, pnpm `>=10.33`.** (`preinstall` blocks npm/yarn; `engines` in
  `package.json`.)
- **Every PR needs a changeset.** Use `pnpm changeset` for anything that affects a published package.
  Use `pnpm changeset:empty` for repo/tooling-only changes; an empty changeset is **two `---`
  delimiters with no body** (local `CLAUDE.local.md` convention). A changeset is a changelog entry
  for users upgrading, not a summary of the diff. (CI fails PRs missing a changeset.)
- **Conventional commit `type(scope):`, scope is mandatory.** Enforced on the **PR title**
  (`.github/workflows/pr-title-linter.yml`), not on individual commits. There is no local
  `commit-msg` hook. Valid `scope` = any `packages/*` short name **and** its `clerk-`-stripped form
  (so `clerk-js` accepts `clerk-js` or `js`), plus `repo`, `release`, `e2e`, `ci`, `*`. `docs` is a
  valid **type**, not a scope. Source of truth: `commitlint.config.ts`.
- **`clerk-js` and `ui` must stay backwards-compatible across non-major releases.** A new `clerk-js`
  runtime loads into apps still pinned to an _older_ framework SDK (`@clerk/nextjs`, etc.), so
  removing or renaming anything an older SDK calls breaks those apps in production. (`break-check`
  via `.github/workflows/api-changes.yml`.)
- **Changes to the core `Clerk` class API (`packages/clerk-js/src/core/clerk.ts`) require a major
  version** and `!allow-major` approval. (`.github/workflows/major-version-check.yml`.) APIs prefixed
  `__internal_` or exported from an `/experimental` subpath are exempt from SemVer guarantees.

## PR / changeset / commit flow

1. Branch off `main`.
2. Make the change in the right package(s); add/update unit tests next to the code.
3. `pnpm changeset` (or `pnpm changeset:empty`).
4. Verify locally: `pnpm build`, `pnpm test` (or the filtered forms above), `pnpm lint`,
   `pnpm format:check`.
5. Open the PR; the title must be a valid conventional commit (it becomes the squash commit). Fill in
   the PR template.

Release _policy_ (when/how things ship, canary, snapshot, backports) is in `docs/PUBLISH.md`. This
skill stops at opening the PR.

## Breaking-change quick check

If you are editing `clerk-js` or `ui`, answer these. **Any "yes" means it is breaking**, needs a
major + `!allow-major`, and `break-check` will flag it:

1. Removing or renaming a public export, method, or property?
2. Changing a public function/method signature (new required arg, changed return type)?
3. Changing the `Clerk` class public surface in `core/clerk.ts`?
4. Renaming/removing something an older SDK version still calls at runtime?

If the symbol is `__internal_`-prefixed or under `/experimental`, it is exempt. Full decision matrix:
[`references/breaking-changes.md`](references/breaking-changes.md).

## Deeper references

- `AGENTS.md` — the canonical hard rules (authority for this skill).
- `docs/CONTRIBUTING.md` — full setup, testing, JSDoc/Typedoc, changeset writing.
- `docs/PUBLISH.md` — release process: stable, canary, snapshot, backport, `!allow-major`.
- `docs/CICD.md` — CI/CD pipeline and automated releases.
- `docs/SECURITY.md` — vulnerability reporting (do **not** open public issues).
- `references/theming-architecture.md` — deep dive on the `@clerk/ui` appearance/theming system.
- Bundled: [`setup-and-footguns.md`](references/setup-and-footguns.md),
  [`package-map.md`](references/package-map.md),
  [`breaking-changes.md`](references/breaking-changes.md).

For analyzing or coordinating a **release PR** (the "Version packages" PR), use the dedicated
`analyze-javascript-release` and `coordinate-clerk-release` skills, not this one.
