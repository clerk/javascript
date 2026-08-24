# AGENTS.md

Clerk's JavaScript SDK and library monorepo.

## Rules

- Non-major releases in `packages/clerk-js` and `packages/ui` are pushed out to consuming applications without requiring explicit package updates. This means a new `clerk-js` runtime can load into an app pinned to an older `@clerk/nextjs` (or any other framework SDK) version, so changes must remain backwards-compatible with SDK versions already in the wild, not just the current monorepo state. Removing or renaming anything an older SDK still calls will break production for those users. Extra care must be put into any changes to these packages.
- The API exposed from the core Clerk class in `packages/clerk-js/src/core/clerk.ts` is a contract that is depended on by internal and external consumers (including older SDK versions still loading the latest `clerk-js`). Changes to this API must be done in a major version to avoid breakage.
- Use `pnpm` only. `npm` and `yarn` are blocked by `preinstall`. Node `>=24.15`, pnpm `>=10.33`.
- Every PR needs a changeset. `pnpm changeset` for package changes, `pnpm changeset:empty` for tooling/repo-only. Empty changesets are two `---` delimiters with no body. A changeset is a changelog entry for users upgrading the package, not a summary of the work done in the PR. Describe the user-facing change (what changed for someone consuming the library and how it affects them) rather than the implementation details of the diff. If a change has no user-facing impact, use an empty changeset.
- Commits must be conventional: `type(scope):` (commitlint enforces, on the PR title). `scope` is the package name without `@clerk/`, or `repo` / `release` / `e2e` / `ci` / `*`. `clerk-js` uses scope `js` (`clerk-js` is also accepted). Scope is mandatory; `docs` is a type, not a scope.
- PR descriptions follow `.github/PULL_REQUEST_TEMPLATE.md` and add no sections of their own. Never add a "Testing" (or "Test plan" / "How to test") section summarizing the tests written or the checks run; the Checklist covers that and reviewers read the diff. Describe the change, not the work done on it.
- Keep code comments minimal. Do not add a comment unless it is critical to explain WHY a non-obvious change was made; never restate what the code does. When one is warranted, keep it to a single terse line, not a verbose multi-line block.

## References

- For questions about theming, appearance customization, or the styled system, see `references/theming-architecture.md`.
- For the Mosaic design system (tokens, CVA utility, `MosaicProvider`, migration from existing system), see `references/mosaic-architecture.md`.
- For dev setup, testing, JSDoc/Typedoc, publishing, changesets, and commit conventions, see `docs/CONTRIBUTING.md`.
- For working in the repo day to day (setup ordering and footguns, the package map, dev-loop recipes, and the breaking-change checklist), the `clerk-monorepo` Claude Code skill in `.claude/skills/clerk-monorepo/` restates these rules in actionable form.

## Cursor Cloud specific instructions

Node/pnpm are already set up in the VM image; you do not need to install or activate anything. Node `24.15.0` is installed via nvm and made to win over the daemon's bundled `/exec-daemon/node` (v22) through symlinks in `/usr/local/cargo/bin` (which precedes `/exec-daemon` in `PATH`). Because the Cursor shell is non-interactive and does not source `~/.bashrc`, that symlink layer — not a profile edit — is what makes bare `node`/`pnpm`/`npx` resolve to v24 in every shell. If bare `node` ever reports v22, re-point those symlinks at `~/.nvm/versions/node/v24.15.0/bin`; do not edit `/exec-daemon`.

- Dependency install is handled by the startup update script (`pnpm install --frozen-lockfile`). Standard build/test/lint/dev commands live in `docs/CONTRIBUTING.md` and the `clerk-monorepo` skill; run `pnpm build` before `dev`/tests since packages consume each other's `dist/`.
- Runnable browser app: `pnpm dev:sandbox` serves the clerk-js UI sandbox at `http://localhost:4000` (it also starts the `@clerk/ui` bundle server on `:4011`, a hard dependency). No secrets needed — a staging publishable key is baked into `packages/clerk-js/sandbox/template.html`, so Clerk auth components render and talk to a live staging instance out of the box. Routes: `/sign-in`, `/sign-up`, `/user-profile`, etc. The Mosaic explorer (`pnpm dev:swingset`, `http://localhost:6006`) is a secondary secret-free app.
- Root `pnpm lint` currently exits non-zero on a clean checkout for reasons unrelated to environment setup: `scripts/lint.mjs` runs `turbo lint -- --quiet`, and `--quiet` gets appended to packages whose `lint` chains `typecheck` (e.g. `@clerk/headless` → `tsc --noEmit --quiet`), which TypeScript `6.0.3` rejects; there are also pre-existing eslint errors under `scripts/` and `integration/`. To lint a package's tooling cleanly, use `pnpm turbo lint --filter=<pkg>` (no `--quiet`).
- `pnpm test:integration:*` (Playwright E2E) needs 1Password-sourced `INTEGRATION_INSTANCE_KEYS` and live Clerk instances; it cannot run in this environment without those secrets. Unit tests (`pnpm test`, or `pnpm turbo test --filter=<pkg>`) run fully offline.
