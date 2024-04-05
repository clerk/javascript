<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=express" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/express

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=express)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/express/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://github.com/clerk/javascript/issues/new?assignees=&labels=feature-request&projects=&template=FEATURE_REQUEST.yml)
·
[Ask a Question](https://github.com/clerk/javascript/discussions)

</div>

---

## Overview

<!-- TODO(express): Update express/getting-started link or create page -->

[Clerk](https://clerk.com?utm_source=github&utm_medium=express) is the easiest way to add authentication and user management to your Node.js application. To gain a better understanding of the Express SDK and Clerk Backend API, refer to
the <a href="https://clerk.com/docs/reference/express/getting-started?utm_source=github&utm_medium=express" target="_blank">Express SDK</a> and <a href="https://clerk.com/docs/reference/backend-api" target="_blank">Backend API</a> documentation.

## Getting started

### Prerequisites

- Node.js `>=18.17.0` or later
- Express installed (follow their [Getting started](https://expressjs.com/en/starter/installing.html) guide)

## Installation

```sh
npm install @clerk/express
```

To build the package locally with the TypeScript compiler, run:

```sh
npm run build
```

## Usage

Retrieve your Backend API key from the [API Keys](https://dashboard.clerk.com/last-active?path=api-keys) screen in your Clerk dashboard and set it as an environment variable in a `.env` file:

```sh
CLERK_PUBLISHABLE_KEY=pk_*******
CLERK_SECRET_KEY=sk_******
```

You will then be able to access all the available methods.

```js
import 'dotenv/config'; // To read CLERK_SECRET_KEY
import { clerkClient } from '@clerk/express';

const { data: userList } = await clerkClient.users.getUserList();
```

<!-- TODO(express): Update documentation link or create page -->

_For further details and examples, please refer to our [Documentation](https://clerk.com/docs/reference/express/getting-started?utm_source=github&utm_medium=express)._

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Create a [GitHub Discussion](https://github.com/clerk/javascript/discussions)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=express)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md).

## Security

`@clerk/express` follows good practices of security, but 100% security cannot be assured.

`@clerk/express` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/express/LICENSE) for more information.
