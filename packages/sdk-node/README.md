<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_sdk_node" target="_blank" rel="noopener noreferrer">
    <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
  </a>
  <br />
</p>

# @clerk/clerk-sdk-node

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.com/invite/b5rXHjAg7A)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_sdk_node)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerkinc/javascript/blob/main/packages/sdk-node/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=bug&template=bug_report.md&title=Bug%3A+)
·
[Request a Feature](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=Feature%3A+)
·
[Ask a Question](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)

</div>

---

## Overview

[Clerk](https://clerk.com?utm_source=github&utm_medium=clerk_sdk_node) is the easiest way to add authentication and user management to your Node.js application. To gain a better understanding of the Clerk Backend API and SDK, refer to
the <a href="https://clerk.com/docs/reference/node/getting-started?utm_source=github&utm_medium=clerk_sdk_node" target="_blank">Node SDK</a> and <a href="https://clerk.com/docs/reference/backend-api" target="_blank">Backend API</a> documentation.

## Getting started

### Prerequisites

- Node.js v14+

## Installation

```sh
npm install @clerk/clerk-sdk-node
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
import 'dotenv/config'; // To read CLERK_API_KEY
import clerk from '@clerk/clerk-sdk-node';

const userList = await clerk.users.getUserList();
```

_For further details and examples, please refer to our [Documentation](https://clerk.com/docs/reference/node/getting-started?utm_source=github&utm_medium=clerk_sdk_node)._

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Open a [GitHub support issue](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_sdk_node)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerkinc/javascript/blob/main/docs/CONTRIBUTING.md).

## Security

`@clerk/clerk-sdk-node` follows good practices of security, but 100% security cannot be assured.

`@clerk/clerk-sdk-node` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerkinc/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerkinc/javascript/blob/main/packages/sdk-node/LICENSE) for more information.
