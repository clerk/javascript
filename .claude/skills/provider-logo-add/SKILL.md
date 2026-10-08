---
name: provider-logo-add
description: >-
  Add a logo for a new OAuth, Web3, or phone-code provider to Mosaic's
  `ProviderLogo` (the bundled provider logo set). Use when a provider is
  added to Clerk, or when asked to add a logo for a provider that
  `ProviderLogo` does not support yet. To refresh an existing logo, use
  `provider-logo-update`.
---

# Adding a provider logo

Read `../provider-logo-update/references/logo-pipeline.md` first. It covers where the files
live, the manifest, the three treatments, sourcing rules, SVG cleanup, verification, and
changesets.

## Workflow

1. **Confirm the id.** It must match Clerk's provider id: `provider` in
   `packages/shared/src/oauth.ts` or `packages/shared/src/web3.ts`, or `channel` in
   `packages/shared/src/alternativePhoneCode.ts`. If the provider is not there yet, say so: adding
   it to `@clerk/shared` is a separate change with its own changeset, and the backend has to
   support it. Don't add it to shared as part of this skill unless asked.
2. **Find the brand page** and the official symbol SVG, per the sourcing rules. Read its guidance
   for dark backgrounds and sign-in buttons.
3. **Pick a treatment** and explain the choice in one line to the user, citing the brand guidance.
4. **Add the files:**
   - `packages/mosaic/src/components/provider-logo/logos/<id>.svg`, cleaned per the reference.
   - A manifest entry with `id`, `name`, `treatment`, `groups` (every group whose lookup should
     resolve it, keyed by that group's provider ids), `colors` if adaptive or recolored, `brand`,
     `source` if anything is non-obvious, and `checked` set to today. Place it next to providers
     from the same shared list, in that list's order.
5. **Generate and verify** per the reference. Report the gzip size change, since every bundle that
   imports one of the logo's groups carries it.
6. **Changeset** per the reference.
