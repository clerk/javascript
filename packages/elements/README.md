<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_react" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/elements

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_react)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/react/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://github.com/clerk/javascript/issues/new?assignees=&labels=feature-request&projects=&template=FEATURE_REQUEST.yml)
·
[Ask a Question](https://github.com/clerk/javascript/discussions)

</div>

---

## Overview

Clerk is the easiest way to add authentication and user management to your React application. Add sign up, sign in, and profile management to your application in minutes.

## Development

### Playground

```sh
# Togther:
turbo run dev --filter=...elements # Includes dependents of @clerk/elements

# Separate:

# -- NextJS playground
turbo run dev --filter=elements

# -- @clerk/elements (Only necessary if you're actively working on @clerk/elements)
turbo run dev --filter=elements-nextjs
```

**Note:** If you run into a "no workspaces found" issue with the playground, run the following: `(cd playground/elements/next && npx next telemetry disable)`

### E2E Testing

```sh
turbo run e2e --filter=elements-nextjs

# With UI: https://playwright.dev/docs/running-tests#run-tests-in-ui-mode
turbo run e2e --filter=elements-nextjs -- --ui

# Headed Mode: https://playwright.dev/docs/running-tests#run-tests-in-headed-mode
turbo run e2e --filter=elements-nextjs -- --headed

# Specific Tests: https://playwright.dev/docs/running-tests#run-specific-tests
turbo run e2e --filter=elements-nextjs -- e2e/elements.spec.ts
```
