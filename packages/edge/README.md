<p align="center">
  <a href="https://clerk.dev?utm_source=github&utm_medium=clerk_edge" target="_blank" rel="noopener noreferrer">
    <img src="https://images.clerk.dev/static/clerk.svg" alt="Clerk logo" height="50">
  </a>
  <br />
</p>

# @clerk/edge

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.com/invite/b5rXHjAg7A)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.dev/docs?utm_source=github&utm_medium=clerk_edge)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerkinc/javascript/blob/main/packages/edge/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=bug&template=bug_report.md&title=Bug%3A+)
·
[Request a Feature](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=Feature%3A+)
·
[Ask a Question](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)

</div>

---

## Overview

This package is a wrapper around Clerk core capabilities with added functionality and helpers aimed towards different edge and serverless platforms.

## Getting Started

### Installation

```sh
npm install @clerk/edge
```

### Build

To build the package locally with the TypeScript compiler, run:

```sh
npm run build
```

## Supported platforms

Currently supported environments/platforms:

### Vercel Edge Functions

To use with [Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions):

```js
import { withAuth } from '@clerk/edge/vercel-edge';

async function handler(req, event) {
  // ...
}

export const middleware = withAuth(handler);
```

Supported methods:

- `withAuth`
- `verifySessionToken`
- Resources API through `ClerkAPI`

## Usage

### Validate the Authorized Party of a session token

Clerk's JWT session token, contains the `azp` claim, which equals the Origin of the request during token generation. You can provide the middlewares with a list of whitelisted origins to verify against, to protect your application of the subdomain cookie leaking attack.

Example implementation:

```js
import { withAuth } from '@clerk/edge/vercel-edge';

const authorizedParties = ['http://localhost:3000', 'https://example.com'];

async function handler(req, event) {
  // ...
}

export const middleware = withAuth(handler, { authorizedParties });
```

_For further details and examples, please refer to our [Documentation](https://clerk.dev/docs?utm_source=github&utm_medium=clerk_edge)._

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://discord.com/invite/b5rXHjAg7A)
- Open a [GitHub support issue](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)
- Contact options listed on [our Support page](https://clerk.dev/support?utm_source=github&utm_medium=clerk_expo)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerkinc/javascript/blob/main/packages/edge/docs/CONTRIBUTING.md).

## Security

`@clerk/edge` follows good practices of security, but 100% security cannot be assured.

`@clerk/edge` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerkinc/javascript/blob/main/packages/edge/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerkinc/javascript/blob/main/packages/edge/LICENSE) for more information.
