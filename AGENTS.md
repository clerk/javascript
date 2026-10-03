# AGENTS.md

Clerk's JavaScript SDK and library monorepo.

## Rules

- Non-major releases in `packages/clerk-js` and `packages/ui` are pushed out to consuming applications without requiring explicit package updates. This means a new `clerk-js` runtime can load into an app pinned to an older `@clerk/nextjs` (or any other framework SDK) version, so changes must remain backwards-compatible with SDK versions already in the wild, not just the current monorepo state. Removing or renaming anything an older SDK still calls will break production for those users. Extra care must be put into any changes to these packages.
- The API exposed from the core Clerk class in `packages/clerk-js/src/core/clerk.ts` is a contract that is depended on by internal and external consumers (including older SDK versions still loading the latest `clerk-js`). Changes to this API must be done in a major version to avoid breakage.
- Unless specifically instructed to do so by the user, _do not write any code comments_. The only permissible time to edit existing comments is when the behavior they describe has been modified in such a way that the comment is no longer accurate. When another rule instructs you to write a JSDoc comment, specifically call out the content of the comment to the user for review.
- Use `pnpm` only. `npm` and `yarn` are blocked by `preinstall`. Node `>=24.15`, pnpm `>=10.33`.
- Every PR needs a changeset. `pnpm changeset` for package changes, `pnpm changeset:empty` for tooling/repo-only. Empty changesets are two `---` delimiters with no body. A changeset is a changelog entry for users upgrading the package, not a summary of the work done in the PR. Describe the user-facing change (what changed for someone consuming the library and how it affects them) rather than the implementation details of the diff. If a change has no user-facing impact, use an empty changeset.
- PR descriptions follow `.github/PULL_REQUEST_TEMPLATE.md` and add no sections of their own. Never add a "Testing" (or "Test plan" / "How to test") section summarizing the tests written or the checks run; the Checklist covers that and reviewers read the diff. Describe the change, not the work done on it.

## Verifying changes

Prove a change to `@clerk/expo` UI or auth behavior on a real simulator or emulator before calling it done. The skill is `.cursor/skills/verify-clerk-expo/`: read its `SKILL.md` and `features/README.md` first. Run the commands below from the repo root, after `npm ci` once in the skill directory.

1. `.cursor/skills/verify-clerk-expo/bin/control-clerk-expo doctor --platform ios` (or `android`) checks the machine. Fix what it names.
2. `.cursor/skills/verify-clerk-expo/bin/control-clerk-expo up --platform ios` builds the dev client, leases a lane device, and starts Metro.
3. `.cursor/skills/verify-clerk-expo/bin/control-clerk-expo run <feature> --platform ios` runs that feature's golden specs and keeps video, screenshots, and state under `.verify/runs/`.
4. `.cursor/skills/verify-clerk-expo/bin/control-clerk-expo down` releases the device, deletes the test users the run created, and keeps the evidence.

Use only test users: `+clerk_test` emails, phone numbers 555-0100 to 555-0199, and the code `424242`. Never type real credentials.

## References

- For questions about theming, appearance customization, or the styled system, see `references/theming-architecture.md`.
- For the Mosaic design system (tokens, CVA utility, `MosaicProvider`, migration from existing system), see `references/mosaic-architecture.md`.
- For dev setup, testing, JSDoc/Typedoc, publishing, changesets, and commit conventions, see `docs/CONTRIBUTING.md`.
- For working in the repo day to day (setup ordering and footguns, the package map, dev-loop recipes, and the breaking-change checklist), the `clerk-monorepo` Claude Code skill in `.claude/skills/clerk-monorepo/` restates these rules in actionable form.
