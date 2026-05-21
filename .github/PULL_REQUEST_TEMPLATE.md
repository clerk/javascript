## Description

<!--
  Thanks for contributing to Clerk. Make sure to read the contributing guide at https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md before opening a PR!

  **Please create a feature request before starting work on any significant change.**

  Write a brief description of the changes introduced in this PR.
  Include screenshots/videos if they help convey the change.

  Also explain how one can test the change.
-->

<!-- Fixes #(issue number) -->

## Checklist

- [ ] `pnpm test` runs as expected.
- [ ] `pnpm build` runs as expected.
- [ ] (If applicable) [JSDoc comments](https://jsdoc.app/about-getting-started.html) have been added or updated for any package exports
- [ ] (If applicable) [Documentation](https://github.com/clerk/clerk-docs) has been updated
- [ ] (If applicable) Hotload-boundary review completed for Clerk core / IsomorphicClerk changes.

<!--
  Complete the hotload-boundary review item when this PR changes:
  - packages/clerk-js/src/core/clerk.ts
  - packages/react/src/isomorphicClerk.ts

  Non-major releases in packages/clerk-js and packages/ui can hotload into
  applications that still have older framework SDKs or @clerk/shared installed.
  If this PR removes, renames, or changes a Clerk / IsomorphicClerk member,
  explicitly document whether older installed packages consume it across that
  hotload boundary. A cross-boundary member needs a compatibility shim,
  deprecation plan, or major-version removal plan.
-->

## Type of change

- [ ] 🐛 Bug fix
- [ ] 🌟 New feature
- [ ] 🔨 Breaking change
- [ ] 📖 Refactoring / dependency upgrade / documentation
- [ ] other:
