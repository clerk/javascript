# CI: signalling translation updates (ideas)

Status: **ideas only, not implemented.** When the English `base` changes (keys added / changed /
removed), translators — or an AI drafting step — need to be told what went stale. This documents
options. Pairs with `migration.md` (the model where `en-US` is the typed `base` and other locales
are JSON diffs carrying only changed keys).

## What exists today

- `packages/localizations/src/utils/generate.ts` — a **manual** `pnpm generate` script. Aligns
  every locale's key set to `en-US` (adds missing keys as `: undefined`, deletes removed keys,
  sorts). Has a disabled stale-key pass (`SET_UNDEFINED_ON_THE_CHANGED_KEYS = false`) that compares
  against a snapshot (`enUS_v4.ts`) and resets changed keys to `undefined`. No CI integration.
- `.github/workflows/api-changes.yml` — already runs `@clerk/break-check` against
  `@clerk/localizations` **and already calls the Anthropic API in CI** (`BREAK_CHECK_ANTHROPIC_API_KEY`).
- `.github/workflows/labeler.yml` — labels PRs touching `packages/localizations/**`.
- `release.yml` — `clerk-cookie` PAT already has `contents: write` + `pull-requests: write`.
- Claude Code `schedule` / `loop` skills are available in-repo (scheduled cloud agents).
- **Absent**: any translation vendor (Crowdin / Lokalise / Phrase / Transifex / locize), any
  committed key manifest, any per-PR key-change detection.

## 1. Change detection — emit a committed key manifest

Add a `pnpm generate:manifest` step (extend `generate.ts`; `enUSKeysWithChangedValues` is a ready
prototype) that writes a flat, committed artifact:

```jsonc
// packages/localizations/key-manifest.json
{
  "apiKeys.action__add": "Add new key",
  "apiKeys.copySecret.formTitle": "Copy your \"{name}\" API Key now",
}
```

**Before / after** the change-detection story:

```
Before: en-US lives in a 91 KB .ts file; no machine-readable key set; changes invisible to CI.
After:  git diff origin/main -- packages/localizations/key-manifest.json
        → exact added / changed / removed key paths + old↔new English values.
```

CI fails if the manifest is stale vs `en-US` (forces regeneration on every base change). Post-Phase-2,
the same diff can run directly on the `en-US.json` / base namespace modules — no manifest needed.

| Detection approach                               | Pros                                                 | Cons                                                |
| ------------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------- |
| Committed `key-manifest.json` diff (recommended) | simple, reviewable, format-agnostic, doubles as docs | must regenerate + commit on every base change       |
| Diff JSON locales directly (post-migration)      | no extra artifact                                    | only available after Phase 2                        |
| Reuse `break-check` AST diff                     | zero new infra, already running                      | declaration-surface only, not per-key value changes |

## 2. Signalling translators — three approaches

### A. Push to a translation vendor (CLI/API on merge to main)

Diff the manifest → upload only changed keys via vendor CLI (`lokalise2 file upload`,
`crowdin upload sources`); vendor handles MT, TM, glossaries, plural forms, human workflow.

- **Pros**: professional translator workflow, translation memory, built-in plural/RTL handling.
- **Cons**: vendor cost + lock-in, secret management, days-long round-trip.

### B. Open a GitHub issue / PR comment with a stale-key list

Post the manifest diff (changed key paths + old/new English) as a PR comment or issue; tag the
`localizations` label. Uses infra that already exists (bot PAT, labels, community-via-GitHub).

- **Pros**: zero new infra, fits community-contributor flow.
- **Cons**: produces no translations, only flags work; noisy at 49 locales × frequent changes.
- Best as a _complement_ to C (signal humans to review AI drafts, not translate from scratch).

### C. Webhook to a custom service / serverless function

POST changed keys to an internal endpoint that queues per-locale jobs (DeepL / Google / Anthropic)
and opens a PR. Mirrors the existing Anthropic-in-CI pattern.

- **Pros**: full control, no lock-in, per-locale tuning, foundation for AI drafting (§3).
- **Cons**: must build/maintain the endpoint + retries + secrets.

## 3. AI-drafted translations (the "AI does it for us" option)

A CI job or scheduled Claude Code agent runs after base keys change:

1. Read the manifest diff (`added` / `changed` / `removed`, with new English values).
2. Per locale, prompt Claude with: BCP-47 tag, script direction, CLDR plural categories, the changed
   source strings, and existing translations for style consistency.
3. Call the Anthropic API (e.g. `claude-sonnet-4-6`) → structured JSON per locale.
4. Merge drafts into each locale's JSON diff; open **one** PR across all 49 locales.

**Hard constraints — enforced mechanically _after_ the model responds, not just prompted:**

- **Placeholder preservation**: the set of `{name}` / `{count}` tokens in the translation must
  exactly match the source; mismatch → drop that key (fall back to English).
- **Plural forms**: validate the locale's required CLDR categories (`one`/`other`/…) are present and
  no spurious ones added.
- **Do-not-translate glossary**: `Clerk`, `SAML`, `OAuth`, `TOTP`, `WebAuthn`, brand UI labels —
  validated unchanged.
- **RTL** (`ar-SA`, `fa-IR`, `he-IL`) and **complex-script** (`bn-IN`, `hi-IN`, `ta-IN`, `te-IN`,
  `th-TH`) locales: draft is a starting point, **mandatory** native-speaker review before merge.
- **Mark AI drafts** (per-locale table in the PR body or inline marker) and **never auto-merge** —
  require locale-reviewer approval (CODEOWNERS / required check).

Rough cost: a 20-key change × 49 locales batched per-locale ≈ a few dollars/run — negligible.

**Where the scheduled agent fits**: a nightly Claude Code routine checks whether `key-manifest.json`
changed since the last run, triggers drafting, and pings reviewers / posts to Slack — so drafts open
alongside the en-US PR and review happens in parallel with code review.

## 4. End-to-end pipelines

### Pipeline 1 — inline PR draft (lower infra, faster feedback) — recommended start

```
Trigger:  PR touches en-US base (or en-US.json post-migration)
Detect:   manifest diff → changed_keys.json; empty → stop
Draft:    matrix over 49 locales → Anthropic API → validate tokens/plurals/DNT → merge into JSON
PR:       branch chore/ai-translation-update-<sha>; clerk-cookie PAT; labels localizations, ai-draft
          body = locale × changed-key table, AI-draft flag per cell, links to UI context
Gate:     locale-reviewer approval required; RTL + complex-script require review before merge
Merge:    alongside/after the en-US PR; patch changeset; manifest updated
```

### Pipeline 2 — async post-merge + vendor hybrid (more control, slower)

```
Trigger:  push to main changing key-manifest.json (en-US already merged)
Detect:   manifest diff vs HEAD^
Signal:   2a vendor push (professional locales)  ||  2b AI draft (community locales) — in parallel
PR:       merge vendor + AI results; validate; mark draft vs professional
Nudge:    nightly scheduled Claude agent pings reviewers on stale translation PRs
```

|                    | Pipeline 1 (inline)                     | Pipeline 2 (async)                 |
| ------------------ | --------------------------------------- | ---------------------------------- |
| Latency            | drafts ready before en-US merges        | locales lag behind en-US           |
| Merge coordination | two PRs in flight                       | en-US lands first, simpler         |
| Coverage           | all 49 via AI                           | vendor (pro) + AI (community) mix  |
| Infra              | GitHub Actions + existing Anthropic key | adds vendor API / webhook endpoint |

**Recommendation**: Pipeline 1 with mandatory review gates for RTL / complex-script locales. The
committed manifest (§1) is the small unlock — `generate.ts` already has the diff primitives, and the
`BREAK_CHECK_ANTHROPIC_API_KEY` pattern shows the Anthropic-in-CI wiring already exists.
