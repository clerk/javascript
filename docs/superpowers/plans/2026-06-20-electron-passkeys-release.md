# electron-passkeys Native Binary Release Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `@clerk/electron-passkeys` native `.node` binaries built and assembled automatically in all four release paths (pkg-pr-new, !snapshot, canary, production) so platform packages publish with their binaries rather than empty.

**Architecture:** A reusable build workflow (`electron-passkeys.yml`) compiles four platform binaries in a matrix and uploads them as artifacts. A composite action (`electron-passkeys-artifacts`) downloads and assembles them. Each release path gets a detect job and a conditional build job; the publish job then uses the composite action when binaries were built.

**Tech Stack:** GitHub Actions (`workflow_call`, composite actions, `dorny/paths-filter@v3`), napi-rs CLI (`napi artifacts`), pnpm workspaces, zx (snapshot.mjs / canary.mjs)

## Global Constraints

- pnpm only; Node >=24.15; pnpm >=10.33
- Never cache final `.node` binaries — only Cargo registry/git/target intermediates via `Swatinem/rust-cache`
- Publishable binaries must be outputs of the current workflow run from the exact ref being published
- Do not change the `changesets/action` step configuration in the `release` job
- Job names follow pattern `electron-passkeys-{verb}-{context}`
- Pin all new action `uses:` references with SHA hashes, matching the style of the surrounding workflow file
- Spec: `docs/superpowers/specs/2026-06-20-electron-passkeys-release-design.md`

---

## File Map

| File                                                     | Status     | Responsibility                                                                                       |
| -------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| `.github/actions/electron-passkeys-artifacts/action.yml` | **Create** | Download artifacts, run `napi artifacts`, verify each platform dir has exactly one `.node`           |
| `.github/workflows/electron-passkeys.yml`                | **Modify** | Add `workflow_call` + `ref` input, remove `pull_request` trigger, remove `package` job               |
| `scripts/snapshot.mjs`                                   | **Modify** | Add `--include-electron-passkeys` flag to filter native packages conditionally                       |
| `scripts/canary.mjs`                                     | **Modify** | Same as snapshot.mjs                                                                                 |
| `.github/workflows/ci.yml`                               | **Modify** | Add `electron-passkeys-changed` detect job, `electron-passkeys-build` build job; update `pkg-pr-new` |
| `.github/workflows/release.yml`                          | **Modify** | Add detect + build jobs for snapshot, canary, and production paths                                   |

---

## Task 1: Composite assembly action

**Files:**

- Create: `.github/actions/electron-passkeys-artifacts/action.yml`

**Interfaces:**

- Consumes: artifacts named `bindings-{target}` uploaded by the build workflow; repo already checked out; pnpm installed with deps
- Produces: `.node` files placed in `packages/electron-passkeys/npm/{platform}/`; fails loudly if any platform dir is missing its binary

- [ ] **Step 1: Create the action file**

```yaml
# .github/actions/electron-passkeys-artifacts/action.yml
name: Assemble electron-passkeys native artifacts
description: Downloads build artifacts, assembles platform packages, and verifies each contains exactly one .node binary.

runs:
  using: composite
  steps:
    - name: Download all build artifacts
      uses: actions/download-artifact@v4
      with:
        path: packages/electron-passkeys/artifacts

    - name: Move binaries into per-platform npm packages
      shell: bash
      run: pnpm --filter @clerk/electron-passkeys artifacts

    - name: Verify every platform package contains its binary
      shell: bash
      working-directory: ${{ github.workspace }}/packages/electron-passkeys
      run: |
        for dir in npm/*/; do
          count=$(find "$dir" -name '*.node' | wc -l)
          if [ "$count" -ne 1 ]; then
            echo "::error::$dir is missing its .node binary — publishing it would ship an empty package"
            exit 1
          fi
          (cd "$dir" && npm pack --dry-run)
        done
```

- [ ] **Step 2: Validate YAML syntax**

```bash
node -e "require('js-yaml').load(require('fs').readFileSync('.github/actions/electron-passkeys-artifacts/action.yml', 'utf8')); console.log('YAML valid')"
```

Expected: `YAML valid`

- [ ] **Step 3: Commit**

```bash
git add .github/actions/electron-passkeys-artifacts/action.yml
git commit -m "ci(electron): add composite action to assemble native artifacts"
```

---

## Task 2: Refactor `electron-passkeys.yml` to reusable workflow

**Files:**

- Modify: `.github/workflows/electron-passkeys.yml`

**Interfaces:**

- Consumes: optional `ref` string input (defaults to `github.sha`); used by callers that need to build from a non-default ref (snapshot builds from PR head)
- Produces: four artifacts named `bindings-aarch64-apple-darwin`, `bindings-x86_64-apple-darwin`, `bindings-x86_64-pc-windows-msvc`, `bindings-aarch64-pc-windows-msvc`

- [ ] **Step 1: Replace the file with the updated version**

Replace the entire file content:

```yaml
name: Electron Passkeys Native Build

on:
  workflow_call:
    inputs:
      ref:
        description: 'Git ref to checkout. Defaults to the caller ref (github.sha).'
        required: false
        type: string
        default: ''
  workflow_dispatch:

jobs:
  build:
    name: Build ${{ matrix.settings.target }}
    runs-on: ${{ matrix.settings.host }}
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix:
        settings:
          - host: macos-14
            target: aarch64-apple-darwin
          - host: macos-14
            target: x86_64-apple-darwin
          - host: windows-latest
            target: x86_64-pc-windows-msvc
          - host: windows-latest
            target: aarch64-pc-windows-msvc
    defaults:
      run:
        working-directory: packages/electron-passkeys
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ inputs.ref || github.sha }}

      - uses: actions/setup-node@v4
        with:
          node-version: 24

      - uses: pnpm/action-setup@v4

      - uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.settings.target }}

      - uses: Swatinem/rust-cache@v2
        with:
          workspaces: packages/electron-passkeys

      - name: Install dependencies
        run: pnpm install --filter @clerk/electron-passkeys... --frozen-lockfile --ignore-scripts
        working-directory: .

      - name: Build native module
        run: pnpm build --target ${{ matrix.settings.target }}

      - name: Smoke test (host-native targets only)
        if: matrix.settings.target == 'aarch64-apple-darwin' || matrix.settings.target == 'x86_64-pc-windows-msvc'
        run: node -e "const m = require('./index.js'); console.log('isAvailable:', m.isAvailable(), 'capabilities:', JSON.stringify(m.capabilities())); if (!m.isAvailable()) throw new Error('the loader did not find the freshly built native binary');"

      - uses: actions/upload-artifact@v4
        with:
          name: bindings-${{ matrix.settings.target }}
          path: packages/electron-passkeys/electron-passkeys.*.node
          if-no-files-found: error
```

Key changes vs. current file:

- `on:` block: replaced `pull_request` with `workflow_call` (with optional `ref` input); kept `workflow_dispatch`
- Removed the `concurrency:` block (callers manage their own concurrency)
- `actions/checkout` step: added `ref: ${{ inputs.ref || github.sha }}`
- Deleted the entire `package:` job (its work now lives in the composite action)

- [ ] **Step 2: Validate YAML syntax**

```bash
node -e "require('js-yaml').load(require('fs').readFileSync('.github/workflows/electron-passkeys.yml', 'utf8')); console.log('YAML valid')"
```

Expected: `YAML valid`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/electron-passkeys.yml
git commit -m "ci(electron): convert build workflow to reusable workflow_call"
```

---

## Task 3: Add `--include-electron-passkeys` flag to snapshot and canary scripts

**Files:**

- Modify: `scripts/snapshot.mjs:8-9`
- Modify: `scripts/canary.mjs:8-9`

**Interfaces:**

- Consumes: `argv['include-electron-passkeys']` boolean from zx's argv parser
- Produces: filtered `packageNames` array; when flag is absent, the five electron-passkeys packages are excluded from the version bump and publish

- [ ] **Step 1: Update `scripts/snapshot.mjs`**

Replace lines 8–9 (the two `const` lines at the top of the file after imports):

```js
// before:
const ignoredPackages = await getChangesetIgnoredPackages();
const packageNames = (await getPackageNames()).filter(name => !ignoredPackages.has(name));
```

```js
// after:
const skipElectronPasskeys = !argv['include-electron-passkeys'];
const electronPasskeysPackages = new Set([
  '@clerk/electron-passkeys',
  '@clerk/electron-passkeys-darwin-arm64',
  '@clerk/electron-passkeys-darwin-x64',
  '@clerk/electron-passkeys-win32-arm64-msvc',
  '@clerk/electron-passkeys-win32-x64-msvc',
]);
const ignoredPackages = await getChangesetIgnoredPackages();
const packageNames = (await getPackageNames())
  .filter(name => !ignoredPackages.has(name))
  .filter(name => !skipElectronPasskeys || !electronPasskeysPackages.has(name));
```

- [ ] **Step 2: Update `scripts/canary.mjs`**

Same replacement as above — identical block, same line positions (lines 8–9):

```js
// before:
const ignoredPackages = await getChangesetIgnoredPackages();
const packageNames = (await getPackageNames()).filter(name => !ignoredPackages.has(name));
```

```js
// after:
const skipElectronPasskeys = !argv['include-electron-passkeys'];
const electronPasskeysPackages = new Set([
  '@clerk/electron-passkeys',
  '@clerk/electron-passkeys-darwin-arm64',
  '@clerk/electron-passkeys-darwin-x64',
  '@clerk/electron-passkeys-win32-arm64-msvc',
  '@clerk/electron-passkeys-win32-x64-msvc',
]);
const ignoredPackages = await getChangesetIgnoredPackages();
const packageNames = (await getPackageNames())
  .filter(name => !ignoredPackages.has(name))
  .filter(name => !skipElectronPasskeys || !electronPasskeysPackages.has(name));
```

- [ ] **Step 3: Test the filter logic**

Run this to confirm the filter behaves correctly both ways:

```bash
node --input-type=module << 'EOF'
// Without --include-electron-passkeys (default): natives excluded
const argv1 = {};
const skipElectronPasskeys1 = !argv1['include-electron-passkeys'];
const electronPasskeysPackages = new Set([
  '@clerk/electron-passkeys',
  '@clerk/electron-passkeys-darwin-arm64',
  '@clerk/electron-passkeys-darwin-x64',
  '@clerk/electron-passkeys-win32-arm64-msvc',
  '@clerk/electron-passkeys-win32-x64-msvc',
]);
const all = ['@clerk/nextjs', '@clerk/react', '@clerk/electron-passkeys', '@clerk/electron-passkeys-darwin-arm64'];
const filtered1 = all.filter(n => !skipElectronPasskeys1 || !electronPasskeysPackages.has(n));
console.assert(filtered1.length === 2, `Expected 2, got ${filtered1.length}`);
console.assert(!filtered1.includes('@clerk/electron-passkeys'), 'Should exclude loader');

// With --include-electron-passkeys: all packages included
const argv2 = { 'include-electron-passkeys': true };
const skipElectronPasskeys2 = !argv2['include-electron-passkeys'];
const filtered2 = all.filter(n => !skipElectronPasskeys2 || !electronPasskeysPackages.has(n));
console.assert(filtered2.length === 4, `Expected 4, got ${filtered2.length}`);
console.assert(filtered2.includes('@clerk/electron-passkeys'), 'Should include loader');

console.log('All filter logic tests passed');
EOF
```

Expected output: `All filter logic tests passed`

- [ ] **Step 4: Commit**

```bash
git add scripts/snapshot.mjs scripts/canary.mjs
git commit -m "ci(electron): add --include-electron-passkeys flag to snapshot and canary scripts"
```

---

## Task 4: Wire `pkg-pr-new` in `ci.yml`

**Files:**

- Modify: `.github/workflows/ci.yml`

**Interfaces:**

- Consumes: `electron-passkeys-changed` outputs `changed` ('true'/'false'); `electron-passkeys-build` job (may be skipped)
- Produces: `pkg-pr-new` publishes platform packages only when native changed and binaries are assembled

Two new jobs are added before `pkg-pr-new`. The existing `pkg-pr-new` job gains two new `needs` entries and the publish step is split into two conditional variants.

- [ ] **Step 1: Add the `electron-passkeys-changed` detect job**

Add this job to `ci.yml` after the `build-packages` job definition:

```yaml
electron-passkeys-changed:
  name: Detect electron-passkeys changes
  needs: [check-permissions]
  runs-on: 'blacksmith-8vcpu-ubuntu-2204'
  outputs:
    changed: ${{ steps.filter.outputs.changed }}
  steps:
    - name: Checkout repository
      uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4
      with:
        persist-credentials: false
        fetch-depth: 0
        filter: blob:none
        show-progress: false

    - name: Check for electron-passkeys file changes
      uses: dorny/paths-filter@de90cc6fb38fc0963ad72b210f1f284cd68cea36 # v3
      id: filter
      with:
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

Note: Pin the `dorny/paths-filter` SHA. The SHA above (`de90cc6f...`) is for v3.0.2 — verify the latest v3 SHA at https://github.com/dorny/paths-filter/releases and substitute if newer.

- [ ] **Step 2: Add the `electron-passkeys-build` job**

Add this job after `electron-passkeys-changed`:

```yaml
electron-passkeys-build:
  name: Build electron-passkeys native binaries
  needs: [check-permissions, electron-passkeys-changed]
  if: needs.electron-passkeys-changed.outputs.changed == 'true'
  uses: ./.github/workflows/electron-passkeys.yml
  permissions:
    contents: read
```

- [ ] **Step 3: Update the `pkg-pr-new` job**

Find the existing `pkg-pr-new` job. Change its `needs` line from:

```yaml
needs: [check-permissions, build-packages]
```

To:

```yaml
needs: [check-permissions, build-packages, electron-passkeys-changed, electron-passkeys-build]
```

Then add the composite action step and split the publish step. The full `pkg-pr-new` job steps section becomes:

```yaml
steps:
  - name: Checkout repository
    uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4
    with:
      persist-credentials: false
      fetch-depth: 1
      fetch-tags: false
      filter: 'blob:none'
      show-progress: false

  - name: Setup Node
    uses: ./.github/actions/init-blacksmith
    with:
      cache-enabled: true
      turbo-enabled: true
      node-version: 24.15.0
      turbo-signature: ${{ secrets.TURBO_REMOTE_CACHE_SIGNATURE_KEY }}
      turbo-summarize: ${{ env.TURBO_SUMMARIZE }}
      turbo-team: ${{ vars.TURBO_TEAM }}
      turbo-token: ${{ secrets.TURBO_TOKEN }}

  - name: Assemble electron-passkeys native artifacts
    if: needs.electron-passkeys-changed.outputs.changed == 'true'
    uses: ./.github/actions/electron-passkeys-artifacts

  - name: Publish with pkg-pr-new (with native packages)
    if: needs.electron-passkeys-changed.outputs.changed == 'true'
    run: pnpm run build && pnpx pkg-pr-new@${{ vars.PKG_PR_NEW_VERSION || '0.0.49' }} publish --compact --pnpm './packages/*' './packages/electron-passkeys/npm/*'

  - name: Publish with pkg-pr-new
    if: needs.electron-passkeys-changed.outputs.changed != 'true'
    run: pnpm run build && pnpx pkg-pr-new@${{ vars.PKG_PR_NEW_VERSION || '0.0.49' }} publish --compact --pnpm './packages/*'
```

- [ ] **Step 4: Validate YAML syntax**

```bash
node -e "require('js-yaml').load(require('fs').readFileSync('.github/workflows/ci.yml', 'utf8')); console.log('YAML valid')"
```

Expected: `YAML valid`

- [ ] **Step 5: Verify job dependency chain**

```bash
node -e "
const yaml = require('js-yaml');
const wf = yaml.load(require('fs').readFileSync('.github/workflows/ci.yml', 'utf8'));
const jobs = wf.jobs;
const pkgPrNew = jobs['pkg-pr-new'];
const needs = pkgPrNew.needs;
console.assert(needs.includes('electron-passkeys-changed'), 'pkg-pr-new must need electron-passkeys-changed');
console.assert(needs.includes('electron-passkeys-build'), 'pkg-pr-new must need electron-passkeys-build');
console.assert(jobs['electron-passkeys-changed'].outputs.changed, 'electron-passkeys-changed must expose changed output');
console.log('Dependency chain valid');
"
```

Expected: `Dependency chain valid`

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci(electron): wire native binary build into pkg-pr-new"
```

---

## Task 5: Wire snapshot and canary in `release.yml`

**Files:**

- Modify: `.github/workflows/release.yml`

**Interfaces:**

- Consumes: `electron-passkeys-changed-snapshot` / `electron-passkeys-changed-canary` outputs `changed`; build jobs upload `bindings-*` artifacts
- Produces: snapshot and canary releases include native packages + assembled binaries only when native files changed

Four new jobs are added (two per path). The existing `snapshot-release` and `canary-release` jobs each gain two new `needs` entries, a composite action step, and an updated version script invocation.

- [ ] **Step 1: Add snapshot detect and build jobs**

Add these two jobs to `release.yml` (before the `snapshot-release` job is fine):

```yaml
electron-passkeys-changed-snapshot:
  name: Detect electron-passkeys changes (snapshot)
  if: ${{ github.event_name == 'issue_comment' && startsWith(github.event.comment.body, '!snapshot') && github.repository == 'clerk/javascript' && github.event.issue.pull_request }}
  runs-on: ${{ vars.RUNNER_NORMAL || 'ubuntu-latest' }}
  outputs:
    changed: ${{ steps.filter.outputs.changed }}
  steps:
    - name: Checkout PR head
      uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4
      with:
        ref: refs/pull/${{ github.event.issue.number }}/head
        persist-credentials: false
        fetch-depth: 0
        filter: blob:none

    - name: Check for electron-passkeys file changes
      uses: dorny/paths-filter@de90cc6fb38fc0963ad72b210f1f284cd68cea36 # v3
      id: filter
      with:
        base: main
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

electron-passkeys-build-snapshot:
  name: Build electron-passkeys native binaries (snapshot)
  needs: [electron-passkeys-changed-snapshot]
  if: needs.electron-passkeys-changed-snapshot.outputs.changed == 'true'
  uses: ./.github/workflows/electron-passkeys.yml
  with:
    ref: refs/pull/${{ github.event.issue.number }}/head
  permissions:
    contents: read
```

Note: The `ref` input is passed so the Rust code is compiled from the PR, not main's HEAD (the default `github.sha` for `issue_comment` events).

- [ ] **Step 2: Update `snapshot-release` to depend on the new jobs**

Find the `snapshot-release` job. Add the two new jobs to its `needs`:

```yaml
snapshot-release:
  name: Snapshot release
  needs: [electron-passkeys-changed-snapshot, electron-passkeys-build-snapshot]
  if: ${{ github.event_name == 'issue_comment' && startsWith(github.event.comment.body, '!snapshot') && github.repository == 'clerk/javascript' && github.event.issue.pull_request }}
```

Then add the composite action step and update the version-packages step. Insert after the "Setup" step and before the "Extract snapshot name" step:

```yaml
- name: Assemble electron-passkeys native artifacts
  if: needs.electron-passkeys-changed-snapshot.outputs.changed == 'true'
  uses: ./.github/actions/electron-passkeys-artifacts
```

Replace the existing "Version packages for snapshot" step:

```yaml
# before:
- name: Version packages for snapshot
  id: version-packages
  run: pnpm version-packages:snapshot ${{ steps.extract-snapshot-name.outputs.name }} | tail -1 >> "$GITHUB_OUTPUT"

# after:
- name: Version packages for snapshot
  id: version-packages
  run: |
    flag=${{ needs.electron-passkeys-changed-snapshot.outputs.changed == 'true' && '--include-electron-passkeys' || '' }}
    pnpm version-packages:snapshot $flag ${{ steps.extract-snapshot-name.outputs.name }} | tail -1 >> "$GITHUB_OUTPUT"
```

- [ ] **Step 3: Add canary detect and build jobs**

Add these two jobs to `release.yml` (before the `canary-release` job):

```yaml
electron-passkeys-changed-canary:
  name: Detect electron-passkeys changes (canary)
  if: ${{ github.event_name == 'push' && github.repository == 'clerk/javascript' }}
  runs-on: ${{ vars.RUNNER_NORMAL || 'ubuntu-latest' }}
  outputs:
    changed: ${{ steps.filter.outputs.changed }}
  steps:
    - name: Checkout repository
      uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4
      with:
        persist-credentials: false
        fetch-depth: 0
        filter: blob:none

    - name: Check for electron-passkeys file changes
      uses: dorny/paths-filter@de90cc6fb38fc0963ad72b210f1f284cd68cea36 # v3
      id: filter
      with:
        base: ${{ github.event.before }}
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

electron-passkeys-build-canary:
  name: Build electron-passkeys native binaries (canary)
  needs: [electron-passkeys-changed-canary]
  if: needs.electron-passkeys-changed-canary.outputs.changed == 'true'
  uses: ./.github/workflows/electron-passkeys.yml
  permissions:
    contents: read
```

- [ ] **Step 4: Update `canary-release` to depend on the new jobs**

Find the `canary-release` job. Add the two new jobs to its `needs`:

```yaml
canary-release:
  name: Canary release
  needs: [electron-passkeys-changed-canary, electron-passkeys-build-canary]
  if: ${{ github.event_name == 'push' && github.repository == 'clerk/javascript' }}
```

Add the composite action step after "Setup" and before "Version packages for canary":

```yaml
- name: Assemble electron-passkeys native artifacts
  if: needs.electron-passkeys-changed-canary.outputs.changed == 'true'
  uses: ./.github/actions/electron-passkeys-artifacts
```

Replace the existing "Version packages for canary" step:

```yaml
# before:
- name: Version packages for canary
  id: version-packages
  run: pnpm version-packages:canary | tail -1 >> "$GITHUB_OUTPUT"

# after:
- name: Version packages for canary
  id: version-packages
  run: |
    flag=${{ needs.electron-passkeys-changed-canary.outputs.changed == 'true' && '--include-electron-passkeys' || '' }}
    pnpm version-packages:canary $flag | tail -1 >> "$GITHUB_OUTPUT"
```

- [ ] **Step 5: Validate YAML syntax**

```bash
node -e "require('js-yaml').load(require('fs').readFileSync('.github/workflows/release.yml', 'utf8')); console.log('YAML valid')"
```

Expected: `YAML valid`

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci(electron): wire native binary build into snapshot and canary release paths"
```

---

## Task 6: Wire production in `release.yml`

**Files:**

- Modify: `.github/workflows/release.yml`

**Interfaces:**

- Consumes: `electron-passkeys-detect-production` outputs `needs_native` ('true'/'false'); build job uploads `bindings-*` artifacts
- Produces: `release` job assembles binaries before `changesets/action` when `needs_native=true`; `changesets/action` is unchanged and publishes native packages naturally

Two new jobs are added. The existing `release` job gains two new `needs` entries and one conditional composite action step inserted before `changesets/action`.

- [ ] **Step 1: Add the production detect job**

Add this job to `release.yml` (before the `release` job):

```yaml
electron-passkeys-detect-production:
  name: Detect if electron-passkeys needs native build (production)
  if: ${{ github.event_name == 'push' && github.repository == 'clerk/javascript' }}
  runs-on: ${{ vars.RUNNER_NORMAL || 'ubuntu-latest' }}
  outputs:
    needs_native: ${{ steps.detect.outputs.needs_native }}
  steps:
    - name: Checkout repository
      uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4
      with:
        persist-credentials: false
        fetch-depth: 1
        fetch-tags: false
        filter: blob:none

    - name: Detect if native packages need publishing
      id: detect
      run: |
        count=$(find .changeset -name '*.md' ! -name 'README.md' | wc -l)
        if [ "$count" -gt 0 ]; then
          echo "needs_native=false" >> "$GITHUB_OUTPUT"
          echo "Pending changesets found — in version-PR mode, skipping native build"
          exit 0
        fi
        LOCAL=$(node -p "require('./packages/electron-passkeys/package.json').version")
        NPM=$(npm view @clerk/electron-passkeys version 2>/dev/null || echo "0.0.0")
        if [ "$LOCAL" != "$NPM" ]; then
          echo "needs_native=true" >> "$GITHUB_OUTPUT"
          echo "Local ($LOCAL) differs from npm ($NPM) — native build needed"
        else
          echo "needs_native=false" >> "$GITHUB_OUTPUT"
          echo "Local ($LOCAL) matches npm — no native build needed"
        fi
```

- [ ] **Step 2: Add the production build job**

Add this job after `electron-passkeys-detect-production`:

```yaml
electron-passkeys-build-production:
  name: Build electron-passkeys native binaries (production)
  needs: [electron-passkeys-detect-production]
  if: needs.electron-passkeys-detect-production.outputs.needs_native == 'true'
  uses: ./.github/workflows/electron-passkeys.yml
  permissions:
    contents: read
```

- [ ] **Step 3: Update the `release` job**

Find the `release` job. Add the two new jobs to its `needs`:

```yaml
release:
  name: Release
  needs: [electron-passkeys-detect-production, electron-passkeys-build-production]
  if: ${{ github.event_name == 'push' && github.repository == 'clerk/javascript' }}
```

Then add the composite action step inside the `release` job's steps, immediately before the `changesets/action` step:

```yaml
- name: Assemble electron-passkeys native artifacts
  if: needs.electron-passkeys-detect-production.outputs.needs_native == 'true'
  uses: ./.github/actions/electron-passkeys-artifacts

- name: Create Release PR
  id: changesets
  uses: changesets/action@63a615b9cd06ba9a3e6d13796c7fbcb080a60a0b # v1
  with:
    commit: 'ci(repo): Version packages'
    title: 'ci(repo): Version packages'
    publish: pnpm release
    version: pnpm version-packages
  env:
    GITHUB_TOKEN: ${{ secrets.CLERK_COOKIE_PAT }}
    HUSKY: '0'
    NPM_CONFIG_PROVENANCE: true
```

The `changesets/action` step is unchanged — only the composite action step is inserted before it.

- [ ] **Step 4: Validate YAML syntax**

```bash
node -e "require('js-yaml').load(require('fs').readFileSync('.github/workflows/release.yml', 'utf8')); console.log('YAML valid')"
```

Expected: `YAML valid`

- [ ] **Step 5: Verify `release` job has the new needs**

```bash
node -e "
const yaml = require('js-yaml');
const wf = yaml.load(require('fs').readFileSync('.github/workflows/release.yml', 'utf8'));
const needs = wf.jobs['release'].needs;
console.assert(needs.includes('electron-passkeys-detect-production'), 'release must need detect job');
console.assert(needs.includes('electron-passkeys-build-production'), 'release must need build job');
console.log('Production wiring valid');
"
```

Expected: `Production wiring valid`

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci(electron): wire native binary build into production release path"
```

---

## Self-Review Checklist

Spec coverage check:

| Spec requirement                                                    | Task                            |
| ------------------------------------------------------------------- | ------------------------------- |
| Reusable build workflow with `workflow_call` + optional `ref` input | Task 2                          |
| Remove `pull_request` trigger from `electron-passkeys.yml`          | Task 2                          |
| Remove `package` job from `electron-passkeys.yml`                   | Task 2                          |
| Composite action: download artifacts, `napi artifacts`, verify      | Task 1                          |
| `--include-electron-passkeys` flag in `snapshot.mjs`                | Task 3                          |
| `--include-electron-passkeys` flag in `canary.mjs`                  | Task 3                          |
| `electron-passkeys-changed` detect job in `ci.yml`                  | Task 4                          |
| `electron-passkeys-build` job in `ci.yml`                           | Task 4                          |
| `pkg-pr-new` conditionally includes native packages                 | Task 4                          |
| Detect + build jobs for snapshot in `release.yml`                   | Task 5                          |
| Snapshot passes PR ref to build workflow                            | Task 5                          |
| `snapshot-release` conditionally assembles and passes flag          | Task 5                          |
| Detect + build jobs for canary in `release.yml`                     | Task 5                          |
| `canary-release` conditionally assembles and passes flag            | Task 5                          |
| Production version-compare detection                                | Task 6                          |
| `electron-passkeys-build-production` job                            | Task 6                          |
| `release` job assembles before `changesets/action`                  | Task 6                          |
| `changesets/action` step unchanged                                  | Task 6                          |
| Cache only Cargo intermediates via `Swatinem/rust-cache`            | Task 2 (unchanged from current) |
