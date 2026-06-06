# Setup and footguns

The exact first-time setup sequence, the traps that waste the most time, and the internal
integration-test setup. The short happy path is in `SKILL.md`; this is the full version plus
"what if X fails."

## First-time setup, in order (and why)

1. **Use Node `>=24.15.0`.** Pinned in `.nvmrc`; enforced by `engines` in `package.json`. Run
   `node --version` and `nvm use` (or install 24.15). Running on older Node is the top cause of
   builds that "succeed" but leave packages half-generated, then surface as
   `Cannot find module '@clerk/shared'` or missing-type errors downstream.
2. **`corepack enable`** before installing. `package.json` has `preinstall: only-allow pnpm`, so
   npm and yarn are blocked outright. Corepack reads `packageManager` and uses the pinned pnpm
   (`>=10.33.0`). Without it you may run a mismatched global pnpm.
3. **`git clone` and `cd` into the repo root.**
4. **`pnpm install` from the root.** This is a pnpm workspace; the root install links all packages
   together. Installing from a package subdirectory leaves workspace links broken. First install
   pulls a large lockfile and can take a few minutes; later installs are fast.
5. **`pnpm build`.** Each package consumes the built `dist/` and `.d.ts` of its dependencies
   (`turbo` `build` declares `dependsOn: ["^build"]`). The editor's TypeScript server also relies on
   these built types. Skipping the build makes `dev`, tests, and in-editor types all report errors
   that are not real.
6. **`pnpm dev`** to start watch mode across packages, or a narrower target (see below).

Reordering or skipping steps 1 to 5 is the root cause of most "it doesn't work on my machine"
reports here.

## dev targets

- `pnpm dev` watches all `@clerk/*` except `expo`, `tanstack-react-start`, `chrome-extension`.
- `pnpm dev:fe-libs` watches only `clerk-js` + `ui` + `shared` (the front-end runtime stack).
- `pnpm dev:js` watches only `clerk-js`.
- `pnpm dev:sandbox` runs the rspack sandbox for previewing `ui` components in isolation.

## Footguns

| Trap                                                        | Symptom                                                                               | Fix                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| System Node instead of 24.15                                | Build "passes" but `Cannot find module @clerk/...` or missing types appear later      | `node --version`; `nvm use` (`.nvmrc` pins 24.15.0)                                                 |
| `pnpm install` before `corepack enable` (or using npm/yarn) | `preinstall` aborts with an "only pnpm allowed" error                                 | `corepack enable`, then `pnpm install`                                                              |
| Installing from a package subdirectory                      | Workspace links incomplete; runtime `Cannot resolve @clerk/shared`                    | Always `pnpm install` from the repo root                                                            |
| `pnpm dev` before `pnpm build`                              | Watch mode emits broken output; phantom type errors                                   | Run `pnpm build` once first, then `dev`                                                             |
| Stale turbo cache after a Node/pnpm change                  | Old code runs, types do not update, unrelated tests fail                              | `pnpm nuke` (removes `.turbo`, `node_modules`, `dist`, coverage), then `pnpm install && pnpm build` |
| `pnpm --filter <pkg> build/test` expecting deps to build    | Filtered pnpm scripts skip turbo's `^build`, so deps may be stale                     | Use `pnpm turbo build/test --filter=@clerk/<pkg>` to include dependencies                           |
| Stale `@clerk/shared` / types after editing shared          | Type errors that "should not" exist in consumers                                      | `pnpm turbo build --filter=@clerk/shared`                                                           |
| Editing the hosted UI but seeing no change                  | `ui` is bundled into `clerk-js`; you watched the wrong target                         | Use `pnpm dev:fe-libs` so `ui` + `clerk-js` rebuild together                                        |
| Committing integration secrets                              | `integration/.env.local`, `.keys.json`, `.keys.staging.json`, or `certs/*.pem` leaked | These are generated/fetched locally and gitignored; never add them                                  |
| Running integration tests without 1Password set up          | `pnpm integration:secrets` fails to read from 1Password                               | Install the `op` CLI and enable desktop-app integration (below)                                     |
| First `pnpm install` "hangs"                                | Large monorepo, large lockfile                                                        | Expected for the first run; give it a few minutes before assuming failure                           |

## Unit tests vs integration tests

- **Unit tests** live next to the code (`*.test.ts` or `__tests__/`). Most packages use vitest;
  `backend` runs a multi-runtime suite (node + edge + cloudflare). Run with
  `pnpm turbo test --filter=@clerk/<pkg>`, or `pnpm --filter @clerk/<pkg> test` after a build for
  faster iteration. No credentials required.
- **Integration tests** are Playwright suites under `integration/`, driven by the
  `pnpm test:integration:*` scripts. They run real auth flows against real Clerk instances and need
  credentials. See `integration/README.md`.

## Internal: integration-test credentials (Clerk employees)

Integration tests need API keys and certs that are not in the repo. This requires access to the
internal 1Password vault.

1. Install the 1Password CLI: `brew install 1password-cli`.
2. Enable the desktop-app integration in 1Password (Settings, Developer, "Integrate with 1Password
   CLI").
3. From the repo root, run `pnpm integration:secrets`. It reads
   `op://Shared/JS SDKs integration tests/add more/.env.local` and `.keys.json` and writes them to
   `integration/.env.local` and `integration/.keys.json` (plus an optional
   `integration/.keys.staging.json` when present).
4. For local session/handshake suites that need certs, generate them under `integration/certs` with
   `mkcert` (see `integration/README.md`).

Then run a single suite, for example:

```bash
pnpm test:integration:nextjs       # E2E_APP_ID=next.appRouter.* , @nextjs grep tag
pnpm test:integration:generic      # the broad react + next smoke suite
```

Each `test:integration:*` script sets an `E2E_APP_ID` (which app template to run) and a Playwright
`--grep @tag`. The full list is in root `package.json`. External contributors without these
credentials should rely on unit tests and the CI integration runs on their PR.
