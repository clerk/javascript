# Design: electron-passkeys Native Binary Release Integration

**Date:** 2026-06-20
**Branch context:** `jw/electron-package-scaffold` (PR #8786)
**Status:** Approved, pending implementation

## Problem

`@clerk/electron-passkeys` is a napi-rs native module. The four platform subpackages each declare a `.node` binary as their `"main"` entry point, but `.node` files are gitignored. Without them in place at publish time, all four platform packages publish empty and broken.

The existing `electron-passkeys.yml` builds and verifies binaries on PRs but those binaries never flow into any release path:

| Release path                     | Current state                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| `pkg-pr-new` (CI)                | Publishes `./packages/electron-passkeys/npm/*` unconditionally with no `.node` files. Broken.     |
| `!snapshot`                      | `getPackageNames()` includes all native packages. They get versioned and published empty. Broken. |
| Canary                           | Same as snapshot. Broken.                                                                         |
| Production (`changesets/action`) | Same discovery; would publish empty native packages. Broken.                                      |

## Approach: Balanced

Reusable build workflow + composite assembly action + conditional native inclusion per release path. Keeps `changesets/action` and the core release mechanism untouched.

## Components

### 1. Reusable build workflow

**File:** `.github/workflows/electron-passkeys.yml` (updated in place)

**Trigger changes:**

- Remove `pull_request` trigger (callers control when it runs)
- Add `workflow_call` (no required inputs; caller's ref is used automatically)
- Keep `workflow_dispatch` for ad-hoc runs

**Body:** Unchanged from today: 4-target matrix (`aarch64-apple-darwin`, `x86_64-apple-darwin`, `x86_64-pc-windows-msvc`, `aarch64-pc-windows-msvc`), `dtolnay/rust-toolchain`, `Swatinem/rust-cache`, `pnpm build --target`, smoke test on host-native targets, `actions/upload-artifact` with name `bindings-{target}`.

**Removed:** The `package` job (assemble + verify) moves to the composite action below.

### 2. Composite assembly action

**File:** `.github/actions/electron-passkeys-artifacts/action.yml`

No inputs. Assumes the repo is checked out and pnpm is installed (always true by the time any caller needs this).

Steps:

1. `actions/download-artifact@v4` - downloads all `bindings-*` artifacts into `packages/electron-passkeys/artifacts/`
2. `pnpm --filter @clerk/electron-passkeys artifacts` - runs `napi artifacts --output-dir artifacts --npm-dir npm`, placing each `.node` into the correct `npm/<platform>/` directory
3. Verify loop: for each `packages/electron-passkeys/npm/*/`, assert exactly one `.node` file, then `npm pack --dry-run`

### 3. Native-changed path detector

**Important:** `workflow_call` reusable workflows must be invoked at the job level, not as a step. This means each release path needs a small extra job that runs `dorny/paths-filter`, outputs a `changed` flag, and is declared as a dependency of both the build job and the publish job.

The paths-filter config (shared across all callers):

```yaml
filters: |
  changed:
    - 'packages/electron-passkeys/src/**'
    - 'packages/electron-passkeys/Cargo.toml'
    - 'packages/electron-passkeys/Cargo.lock'
    - 'packages/electron-passkeys/build.rs'
    - 'packages/electron-passkeys/index.js'
    - 'packages/electron-passkeys/index.d.ts'
    - 'packages/electron-passkeys/npm/**/package.json'
    - 'packages/electron-passkeys/package.json'
    - '.github/workflows/electron-passkeys.yml'
    - '.github/actions/electron-passkeys-artifacts/**'
```

Base comparison per context:

- **pkg-pr-new / snapshot**: compares PR head against `origin/main`
- **canary**: compares against `${{ github.event.before }}` (the commit SHA before the push to main)
- **production**: does not use path-filter; uses version comparison instead (see section 6)

### 4. pkg-pr-new wiring (`ci.yml`)

Three jobs instead of one:

```
native-changed (new, outputs changed flag)
  -> electron-passkeys-build (new, conditional uses: ./.github/workflows/electron-passkeys.yml)
    -> pkg-pr-new (existing, gains needs on both, runs composite action as a step)
```

`native-changed` is a lightweight job (ubuntu runner) that checks out and runs `dorny/paths-filter`, then exposes `outputs.changed`.

`electron-passkeys-build` has `needs: [native-changed]` and `if: needs.native-changed.outputs.changed == 'true'`. It calls the reusable workflow: `uses: ./.github/workflows/electron-passkeys.yml`. When native files did not change, this job is skipped (not failed), so `pkg-pr-new` still runs.

`pkg-pr-new` gains `needs: [check-permissions, build-packages, native-changed, electron-passkeys-build]`. The composite action runs as a conditional step:

```yaml
- uses: ./.github/actions/electron-passkeys-artifacts
  if: needs.native-changed.outputs.changed == 'true'
```

The publish command splits into two conditional steps:

```yaml
- if: needs.native-changed.outputs.changed == 'true'
  run: pnpm run build && pnpx pkg-pr-new publish --compact --pnpm './packages/*' './packages/electron-passkeys/npm/*'

- if: needs.native-changed.outputs.changed != 'true'
  run: pnpm run build && pnpx pkg-pr-new publish --compact --pnpm './packages/*'
```

### 5. Snapshot and canary wiring (`release.yml` + scripts)

Same three-job pattern for each:

```
snapshot-native-changed (new)
  -> electron-passkeys-build-snapshot (new, conditional)
    -> snapshot-release (existing, updated)
```

```
canary-native-changed (new)
  -> electron-passkeys-build-canary (new, conditional)
    -> canary-release (existing, updated)
```

`snapshot-release` and `canary-release` each gain `needs` on their respective detect and build jobs. The composite action runs as a conditional step. The version script receives a flag based on the detect job output.

`scripts/snapshot.mjs` and `scripts/canary.mjs` gain an `--include-electron-passkeys` flag (default: off). When off, native packages are filtered out of the version/publish set:

```js
const skipElectronPasskeys = !argv['include-electron-passkeys'];
const electronPasskeysPackages = new Set([
  '@clerk/electron-passkeys',
  '@clerk/electron-passkeys-darwin-arm64',
  '@clerk/electron-passkeys-darwin-x64',
  '@clerk/electron-passkeys-win32-arm64-msvc',
  '@clerk/electron-passkeys-win32-x64-msvc',
]);
const packageNames = (await getPackageNames())
  .filter(name => !ignoredPackages.has(name))
  .filter(name => !skipElectronPasskeys || !electronPasskeysPackages.has(name));
```

The top-level loader (`@clerk/electron-passkeys`) is included in the filter set because publishing the loader without versioned platform packages in a snapshot context is misleading.

Version script invocation in the snapshot job:

```yaml
- name: Version packages for snapshot
  id: version-packages
  run: |
    flag=${{ needs.snapshot-native-changed.outputs.changed == 'true' && '--include-electron-passkeys' || '' }}
    pnpm version-packages:snapshot $flag ${{ steps.extract-snapshot-name.outputs.name }} | tail -1 >> "$GITHUB_OUTPUT"
```

### 6. Production release wiring (`release.yml`)

Three-job pattern again:

```
release-native-detect (new, outputs needs_native flag)
  -> electron-passkeys-build-production (new, conditional)
    -> release (existing, gains needs on both, composite action runs as step before changesets/action)
```

`release-native-detect` uses version comparison rather than path-filter (changesets are already consumed at publish time so path-filter gives no signal). Two conditions must both be true to set `needs_native=true`:

1. **Publish mode** - no pending changeset `.md` files (when changesets exist, `changesets/action` creates a PR rather than publishing):

```bash
count=$(find .changeset -name '*.md' ! -name 'README.md' | wc -l)
[ "$count" -eq 0 ] && echo "publish_mode=true" || echo "publish_mode=false"
```

2. **Native needs publishing** - local `package.json` version of `@clerk/electron-passkeys` differs from the npm-published version:

```bash
LOCAL=$(node -p "require('./packages/electron-passkeys/package.json').version")
NPM=$(npm view @clerk/electron-passkeys version 2>/dev/null || echo "0.0.0")
[ "$LOCAL" != "$NPM" ] && echo "needs_native=true" || echo "needs_native=false"
```

`electron-passkeys-build-production` has `if: needs.release-native-detect.outputs.needs_native == 'true'`.

In the `release` job, the composite action runs as a step before `changesets/action`:

```yaml
- uses: ./.github/actions/electron-passkeys-artifacts
  if: needs.release-native-detect.outputs.needs_native == 'true'
```

`changesets/action` is unchanged. It finds the `.node` files already in place and publishes native packages naturally.

**Safety:** False positive (build runs unnecessarily before a "create PR" run) - harmless, `.node` files sit unused. False negative (missed detection) - caught by the verify step in the composite action, which fails loudly before any publish attempt.

## Changeset requirement

When native package files change, production releases require explicit changesets for all five packages:

```markdown
---
'@clerk/electron-passkeys': patch
'@clerk/electron-passkeys-darwin-arm64': patch
'@clerk/electron-passkeys-darwin-x64': patch
'@clerk/electron-passkeys-win32-arm64-msvc': patch
'@clerk/electron-passkeys-win32-x64-msvc': patch
---

Update native Electron passkey binaries.
```

The existing `Require Changeset` step in `ci.yml` already enforces changeset presence for non-draft PRs. No additional CI enforcement is needed beyond reviewer awareness.

## Cache policy

Cache only build acceleration (Cargo registry, git deps, `target/` intermediates via `Swatinem/rust-cache`). Never cache or restore final `.node` binaries from cache. Publishable binaries must be current-run outputs from the exact ref being published.

## File change summary

| File                                                     | Change                                                                           |
| -------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `.github/workflows/electron-passkeys.yml`                | Add `workflow_call`, remove `pull_request`, remove `package` job                 |
| `.github/actions/electron-passkeys-artifacts/action.yml` | New composite action                                                             |
| `.github/workflows/ci.yml`                               | Add `native-changed` and `electron-passkeys-build` jobs; update `pkg-pr-new` job |
| `.github/workflows/release.yml`                          | Add detect + build jobs for snapshot, canary, and production paths               |
| `scripts/snapshot.mjs`                                   | Add `--include-electron-passkeys` flag                                           |
| `scripts/canary.mjs`                                     | Add `--include-electron-passkeys` flag                                           |
