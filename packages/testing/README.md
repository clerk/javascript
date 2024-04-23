<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_testing" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br /> 
</p>

# @clerk/testing

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_testing)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/testing/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Ask a Question](https://github.com/clerk/javascript/discussions)

</div>

---

## Overview

This package provides utilities for testing Clerk applications.

It currently supports the following testing frameworks:

- [Playwright](https://playwright.dev/), a Node.js library to automate browsers and web pages.

## Playwright

### Prerequisites

- Node.js `>=18.17.0` or later
- Playwright v1+

### Installation

```shell
npm install @clerk/testing --save-dev
```

## Usage

On your global setup file for Playwright, you must use the `clerkSetup` function to set up Clerk for your tests.

```typescript
// global-setup.ts
import { clerkSetup } from '@clerk/testing/playwright';
import { test as setup } from '@playwright/test';

setup('global setup', async ({ }) => {
  await clerkSetup();
  ...
});
```

Then, you can use the `clerkBypassBotProtection` function to bypass bot protection on your tests.

```typescript
// my-test.spec.ts
import { clerkBypassBotProtection } from "@clerk/testing/playwright";
import { test } from "@playwright/test";

test("sign up", async ({ page }) => {
  await clerkBypassBotProtection({ page });

  await page.goto("/sign-up");
  ...
});
```

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Create a [GitHub Discussion](https://github.com/clerk/javascript/discussions)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_testing)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md).

## Security

`@clerk/testing` follows good practices of security, but 100% security cannot be assured.

`@clerk/testing` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/testing/LICENSE) for more information.
