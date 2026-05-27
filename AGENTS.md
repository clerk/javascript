# AGENTS.md

Clerk's JavaScript SDK and library monorepo.

## Rules

- Non-major releases in `packages/clerk-js` and `packages/ui` are pushed out to consuming applications without requiring explicit package updates. This means a new `clerk-js` runtime can load into an app pinned to an older `@clerk/nextjs` (or any other framework SDK) version, so changes must remain backwards-compatible with SDK versions already in the wild, not just the current monorepo state. Removing or renaming anything an older SDK still calls will break production for those users. Extra care must be put into any changes to these packages.
- The API exposed from the core Clerk class in `packages/clerk-js/src/core/clerk.ts` is a contract that is depended on by internal and external consumers (including older SDK versions still loading the latest `clerk-js`). Changes to this API must be done in a major version to avoid breakage.
- Use `pnpm` only. `npm` and `yarn` are blocked by `preinstall`. Node `>=24.15`, pnpm `>=10.33`.
- Every PR needs a changeset. `pnpm changeset` for package changes, `pnpm changeset:empty` for tooling/repo-only. Empty changesets are two `---` delimiters with no body.
- Commits must be conventional: `type(scope):` (commitlint enforces). `scope` is the package name without `@clerk/`, or `repo` / `release` / `e2e`. `clerk-js` uses scope `js`.

## References

- For questions about theming, appearance customization, or the styled system, see `references/theming-architecture.md`.
- For dev setup, testing, JSDoc/Typedoc, publishing, changesets, and commit conventions, see `docs/CONTRIBUTING.md`.
