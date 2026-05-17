# Vendored: `base-64`

- **Upstream:** https://github.com/mathiasbynens/base64
- **Vendored version:** 1.0.0 (published 2020-12-12)
- **License:** MIT (see `upstream/LICENSE-MIT.txt`)
- **Maintainer (npm):** `mathias` (single)
- **Owner inside Clerk:** `@clerk/expo` maintainers

## Why this is vendored

`base-64` is the userland `atob`/`btoa` implementation that `@clerk/expo` polyfills onto `global` for Hermes engines that lack native versions (see `packages/expo/src/polyfills/base64Polyfill.ts`). When `@clerk/expo` is installed by a customer, the published tarball declares `base-64` as a runtime external. The customer's package manager resolves `^1.0.0` against the npm registry at install time and fetches `base-64` fresh — Clerk's own `pnpm-lock.yaml` is not in the published tarball and does not participate in the customer's install.

That externality + the fact that `base-64`'s exports become **`global.btoa` and `global.atob` inside every Clerk-Expo customer's running app** makes this dependency a high-leverage supply-chain target. Two attack chains motivate vendoring:

### Chain 1 — Publisher account compromise

`base-64` is single-maintainer. If `mathias`'s npm account is compromised (phishing, token theft, hostile transfer, social engineering) and a malicious `base-64@1.0.1` is published, every customer install of `@clerk/expo` after the publish resolves `^1.0.0` to `1.0.1` and pulls the compromised bytes. The polyfill assigns the compromised `encode`/`decode` to `global.btoa`/`global.atob`. Every subsequent `btoa()` or `atob()` call anywhere in the customer's app — including third-party libraries and Clerk's own runtime — runs through the compromised implementation, silently.

Historical precedents in this class: `event-stream` (2018), `ua-parser-js` (2021), `colors.js`/`faker.js` (2022), `xz-utils` (2024). Each was a maintainer-account compromise that published a malicious new version.

Pinning to an exact version (`"base-64": "1.0.0"` instead of `"^1.0.0"`) would close Chain 1 for direct deps — the customer's resolver would never pick up `1.0.1`. But:

### Chain 2 — Registry-level same-version substitution

If the npm registry itself serves substituted bytes for `base-64@1.0.0` (registry compromise, malicious unpublish-then-republish, npm-internal account compromise), the customer's first install of `@clerk/expo` fetches the substituted bytes, computes their hash, and records it as the trusted reference in their lockfile. There is no prior hash to compare against. Future installs with `--frozen-lockfile` "verify" against the now-poisoned hash.

Exact-pinning does not address Chain 2 — the resolver still routes through the registry for `1.0.0`, and whatever bytes the registry serves are what the customer gets. Vendoring is the only mechanism that closes both chains: the customer's resolver never fetches `base-64` from the npm registry because the bytes ship inside the `@clerk/expo` npm tarball.

| | Caret range | Exact pin | Vendored |
|---|---|---|---|
| Chain 1 (new version) | ❌ | ✅ | ✅ |
| Chain 2 (same-version substitution, first install) | ❌ | ❌ | ✅ |

See `Sessions/S161/PROPOSAL.md` for the broader proposal.

## What's in `upstream/`

`upstream/` is a **byte-for-byte copy of the published `base-64@1.0.0` npm tarball.** Nothing in that directory has been modified by Clerk.

```
upstream/
├── base64.js          (~164 lines, single-file UMD; exports {encode, decode, version})
├── package.json       (upstream's; see "inert fields" below)
├── LICENSE-MIT.txt    (MIT)
└── README.md          (upstream's README)
```

### Inert fields in `upstream/package.json`

The upstream `package.json` is preserved so future refresh diffs against new `base-64` versions match byte-for-byte against `npm pack` output. These fields are **inert in this location** — they do nothing here:

- `scripts.*` — not executed; no install lifecycle runs against vendored code.
- `main: "base64.js"` — bundlers do not walk inner `package.json` of nested `src/vendor/` directories for relative imports; the Clerk-side `index.ts` (in this directory) handles resolution explicitly.

## How consumers import it

Inside `@clerk/expo`:

```ts
import { decode, encode } from '../vendor/base-64';
```

The Clerk-side `index.ts` shim re-exports from `./upstream/base64.js` with typed signatures, abstracting the bundler-resolution detail (see `index.ts`).

## Refreshing from upstream

`upstream/` is intentionally frozen. Don't routinely sync.

Refresh **only** when:

- A CVE is reported against `mathiasbynens/base64` upstream, OR
- A spec-relevant bug is discovered.

`base-64@1.0.0` has been the only release since 2014. Any new upstream release after 2020-12-12 should be treated as anomalous and investigated before adoption.

Procedure:

1. `npm pack base-64@<new-version>` in a scratch directory; extract.
2. `diff -r` against `upstream/`.
3. Read every changed line. Apply Clerk's threat model — is this a fix you want, or a behavior change you don't?
4. If accepting: replace `upstream/` with the new tarball contents in one commit (no other changes).
5. Re-run `parity.spec.ts` to confirm behavioral equivalence still holds.
6. Update the vendored version in this README.

## Tests

`__tests__/parity.spec.ts` asserts byte-equivalent inputs produce identical outputs between the upstream npm package (kept as `@clerk/expo`'s `devDependency`) and this vendored copy. Covers RFC 4648 fixtures, `atob`/`btoa` cross-compatibility, and Unicode edge cases.

The upstream `base-64` stays a `devDependency` of `@clerk/expo` for as long as this parity test exists. Removing the devDep would mean giving up the empirical comparator.
