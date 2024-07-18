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
- [Cypress](https://www.cypress.io/), a JavaScript-based end-to-end testing framework.

## Getting started

### Prerequisites

- Node.js `>=18.17.0` or later
- Playwright v1+ or Cypress v13+

### Installation

```shell
npm install @clerk/testing --save-dev
```

## Usage

### Playwright

Firstly, add your Clerk keys (`CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`) to your environment variables file (e.g. `.env.local` or `.env.`).
You can find these keys in your Clerk Dashboard.

All Playwright related utilities are exported from `@clerk/testing/playwright`. Make sure that your import paths are correct!

In your global setup file for Playwright, you must use the `clerkSetup` function to set up Clerk for your tests.

```typescript
// global-setup.ts
import { clerkSetup } from '@clerk/testing/playwright';
import { test as setup } from '@playwright/test';

setup('global setup', async ({ }) => {
  await clerkSetup();
  ...
});
```

Then, you can use the `setupClerkTestingToken` function to bypass bot protection in your tests.

```typescript
// my-test.spec.ts
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { test } from "@playwright/test";

test("sign up", async ({ page }) => {
  await setupClerkTestingToken({ page });

  await page.goto("/sign-up");
  ...
});
```

### Cypress

⚠️ **Please note:** Its intended usage is for **end-to-end** testing only. This package does not support unit testing with Cypress.

Firstly, add your Clerk keys (`CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`) to your environment variables file (e.g. `.env.local` or `.env.`).
You can find these keys in your Clerk Dashboard.

All Cypress related utilities are exported from `@clerk/testing/cypress`. Make sure that your import paths are correct!

In your `cypress.config.ts`, you must use the `clerkSetup` function to set up Clerk for your tests.
Keep in mind that you must pass the Cypress `config` object to the `clerkSetup` function and also return the new config object from the `setupNodeEvents` function.

```typescript
// cypress.config.ts
import { clerkSetup } from '@clerk/testing/cypress';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      return clerkSetup({ config });
    },
    baseUrl: 'http://localhost:3000', // your app's URL
  },
});
```

Then, you can use the `setupClerkTestingToken` function to bypass bot protection in your tests.

```typescript
// cypress/e2e/app.cy.ts
import { setupClerkTestingToken } from "@clerk/testing/cypress";

it("sign up", () => {
  setupClerkTestingToken();

  cy.visit('/sign-up');
  ...
});
```

## Cypress Custom commands

This package also provides custom commands to sign-in/sign-out with Clerk in your Cypress tests without having to interact with the UI.
To use these commands, you must import them in your `cypress/support/commands.ts` file.

```ts
// cypress/support/commands.ts
/// <reference types="cypress" />
import { addClerkCommands } from '@clerk/testing/cypress';
addClerkCommands({ Cypress, cy });

export {};
```

### `cy.clerkSignIn`

The `cy.clerkSignIn` command is used to sign in a user using Clerk. This custom command supports only the following first factor strategies:

- Password
- Phone code
- Email code

**Note:** Multi-factor authentication is not supported.

This helper internally uses the `setupClerkTestingToken`, so you don't need to call it separately.

**Prerequisites**

- You must call `cy.visit` before calling this command.
- Navigate to a non-protected page that loads Clerk before using this command.

**Parameters**

- `signInParams`: The sign-in object.
  - `strategy`: The sign-in strategy. Supported strategies are `'password'`, `'phone_code'`, and `'email_code'`.
  - `identifier`: The user's identifier. This could be a username, a phone number, or an email.
  - `password`: The user's password. This is required only if the strategy is `'password'`.

**Strategy Specifics**

- **Password:** The command will sign in the user using the provided password and identifier.
- **Phone Code:** You must have a user with a test phone number as an identifier (e.g., `+15555550100`).
- **Email Code:** You must have a user with a test email as an identifier (e.g., `your_email+clerk_test@example.com`).

**Example**

```ts
it('sign in', () => {
  cy.visit(`/`);
  cy.clerkSignIn({ strategy: 'phone_code', identifier: '+15555550100' });
  cy.visit('/protected');
});
```

### `cy.clerkSignOut`

The `cy.clerkSignOut` command is used to sign out the current user using Clerk.

**Prerequisites**

- You must call `cy.visit` before calling this command.
- Navigate to a page that loads Clerk before using this command.

**Parameters**

- `signOutOptions`: A `SignOutOptions` object.

**Example**

```ts
it('sign out', () => {
  cy.visit(`/`);
  cy.clerkSignIn({ strategy: 'phone_code', identifier: '+15555550100' });
  cy.visit('/protected');
  cy.clerkSignOut();
});
```

### `cy.clerkLoaded`

The `cy.clerkLoaded` command asserts that Clerk has been loaded.

**Prerequisites**

- You must call `cy.visit` before calling this command.
- Navigate to a page that loads Clerk before using this command.

**Example**

```ts
it('check Clerk loaded', () => {
  cy.visit(`/`);
  cy.clerkLoaded();
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
