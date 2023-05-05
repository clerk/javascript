<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_localizations" target="_blank" rel="noopener noreferrer">
    <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
  </a>
  <br />
</p>

# @clerk/localizations

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.com/invite/b5rXHjAg7A)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_localizations)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerkinc/javascript/blob/main/packages/localizations/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=bug&template=bug_report.md&title=Bug%3A+)
·
[Request a Feature](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=Feature%3A+)
·
[Ask a Question](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)

</div>

---

## Overview

`@clerk/localizations` contains localized strings for applications using Clerk.

## Getting Started

### Prerequisites

- Clerk

### Installation

```shell
npm install @clerk/localizations
```

### Build

```shell
npm run build
```

## Usage

```javascript
import { ClerkProvider } from '@clerk/nextjs';
import { frFR } from '@clerk/localizations';

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

- Join our official community [Discord server](https://clerk.com/discord)
- Open a [GitHub support issue](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_localizations)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerkinc/javascript/blob/main/docs/CONTRIBUTING.md).

## Security

`@clerk/localizations` follows good practices of security, but 100% security cannot be assured.

`@clerk/localizations` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerkinc/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerkinc/javascript/blob/main/packages/localizations/LICENSE) for more information.
