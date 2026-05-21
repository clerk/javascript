# AGENTS.md

Clerk's JavaScript SDK and library monorepo.

## Guidelines

- Non-major releases in `packages/clerk-js` and `packages/ui` are pushed out to consuming applications without requiring explicit package updates. Extra care must be put into any changes to these packages.
- The API exposed from the core Clerk class in `packages/clerk-js/src/core/clerk.ts` is a contract that is depended on by internal and external consumers. Changes to this API must be done in a major version to avoid breakage.

## References

- For questions about theming, appearance customization, or the styled system, see `references/theming-architecture.md`.
