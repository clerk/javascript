---
name: provider-logo-update
description: >-
  Check Mosaic's provider logos (Google, GitHub, Apple, Discord, etc., used by
  `ProviderLogo`) against each brand's official assets and update any that are
  outdated, broken, or handled wrong in dark mode. Use when asked to refresh,
  audit, or check for updated provider/OAuth/social logos, or to fix how one
  provider's logo looks. For a provider that has no logo yet, use
  `provider-logo-add`.
---

# Updating provider logos

Read `references/logo-pipeline.md` first. It covers where the files live, the manifest, the
three treatments, sourcing rules, SVG cleanup, verification, and changesets.

## Workflow

1. **Scope.** One provider, a list, or all of them. For "all", sort the manifest by `checked`
   (oldest first) and fan out the brand checks to parallel subagents, about 10 providers each.
   Give each subagent the reference file and the current SVGs to compare against.
2. **Check each provider** against its `brand` URL and report, per provider:
   - whether the current mark still matches the official one (shape and colors),
   - what the brand says to do on dark backgrounds,
   - the recommended treatment, and whether it differs from the manifest,
   - the official SVG URL, or why one could not be fetched.
3. **Stop and report before changing anything.** Present a short table of proposed changes and
   the providers that could not be verified. Logo choices are brand and product calls; wait for
   the user to pick.
4. **Apply** the approved changes: replace `logos/<id>.svg`, update `treatment`, `colors`, and
   `source`, and set `checked` to today. Set `checked` on providers you verified as unchanged too.
5. **Verify** per the reference: generate, test, and look at both color schemes.
6. **Changeset** per the reference.

## Judgment calls to surface, not decide

- A brand has moved to a mark that is hard to reproduce as clean SVG (Google's 2025 gradient G).
- A brand rename (Twitter → X, Base App → Coinbase Wallet) where the old id stays.
- A color the brand's site uses but its asset files do not confirm (HubSpot).
- Spotify-style rules that turn a colored mark white on our dark background.
