<p align="center">
  <a href="https://clerk.dev?utm_source=github&utm_medium=clerk_fastify" target="_blank" rel="noopener noreferrer">
    <img src="https://images.clerk.dev/static/logo-light-mode-400x400.png" height="64">
  </a>
  <br /> 
</p>

# @clerk/fastify

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.com/invite/b5rXHjAg7A)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.dev/docs?utm_source=github&utm_medium=clerk_fastify)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerkinc/javascript/blob/main/packages/fastify/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=bug&template=bug_report.md&title=Bug%3A+)
·
[Request a Feature](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=Feature%3A+)
·
[Ask a Question](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)

</div>

---

## Overview

`@clerk/fastify` contains localized strings for applications using Clerk.

## Getting Started

### Prerequisites

- Clerk

### Installation

```shell
npm install @clerk/fastify
```

### Build

```shell
npm run build
```

## Usage

```javascript
import { ClerkProvider } from '@clerk/nextjs';
import { frFR } from '@clerk/fastify';

function MyApp({ Component, pageProps }) {
  return (
    <ClerkProvider
      localization={frFR}
      {...pageProps}
    >
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
```

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://discord.com/invite/b5rXHjAg7A)
- Open a [GitHub support issue](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)
- Contact options listed on [our Support page](https://clerk.dev/support?utm_source=github&utm_medium=clerk_fastify)

## Security

`@clerk/fastify` follows good practices of security, but 100% security cannot be assured.

`@clerk/fastify` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerkinc/javascript/blob/main/packages/fastify/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerkinc/javascript/blob/main/packages/fastify/LICENSE) for more information.
