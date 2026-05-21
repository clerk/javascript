# AGENTS.md

Clerk JavaScript SDK monorepo.

## Rules

- Non-major releases in `packages/clerk-js` and `packages/ui` are pushed out to consuming applications without requiring explicit package updates. This means a new `clerk-js` runtime can load into an app pinned to an older `@clerk/nextjs` (or any other framework SDK) version, so changes must remain backwards-compatible with SDK versions already in the wild, not just the current monorepo state. Removing or renaming anything an older SDK still calls will break production for those users. Extra care must be put into any changes to these packages.
- The API exposed from the core Clerk class in `packages/clerk-js/src/core/clerk.ts` is a contract that is depended on by internal and external consumers (including older SDK versions still loading the latest `clerk-js`). Changes to this API must be done in a major version to avoid breakage.

## Toolchain

- pnpm only (`only-allow pnpm`). Node `>=24.15`, pnpm `>=10.33`.
- `pnpm install` from root.

## Changesets

- Every PR needs one. `pnpm changeset` for package changes, `pnpm changeset:empty` for tooling/repo-only.
- Empty changesets: two `---` delimiters, no body.

## Commits

- Conventional commits, `type(scope):` required (commitlint enforces).
- scope = package name without `@clerk/`, or `repo` / `release` / `e2e`. `clerk-js` uses `js`.

## More

`docs/CONTRIBUTING.md` for dev setup, testing, JSDoc, publishing.
