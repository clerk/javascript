<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_upgrade" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/upgrade</h1>
</p>

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_upgrade)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/upgrade/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_upgrade)

</div>

## Getting Started

A tool that helps with upgrading major versions of Clerk's SDKs.

### Prerequisites

- Node.js `>=18.17.0` or later

## Usage

Navigate to the application you want to upgrade and run the following in your terminal:

```sh
npx @clerk/upgrade
```

Fill out the questionnaire and the CLI will show you the required changes.

### Caveats

This tool uses regular expressions to scan for patterns that match breaking changes. This makes it run substantially faster and makes it more accessible for us at Clerk to author matchers for each breaking change, however it means that _we cannot gurarantee 100% accuracy of the results_. As such, it's important to treat this as a tool that can help you to complete your major version upgrades, rather than an automatic fix to all issues.

The main thing that this tool will miss is cases where _unusual import patterns_ are used in your codebase. As an example, if Clerk made a breaking change to the `getAuth` function exported from `@clerk/nextjs`, `@clerk/upgrade` would likely look for something like `import { getAuth } from "@clerk/nextjs"` in order to detect whether you need to make some changes. If you were using your imports like `import * as ClerkNext from "@clerk/nextjs"`, you could use `getAuth` without it detecting it with its matcher.

It will also be very likely to miss if you bind a method on an object to a separate variable and call it from there, or pass a bound method through a function param. For example, something like this:

```js
const updateUser = user.update.bind(user);

updateUser({ username: 'foo' });
```

Overall, there's a very good chance that this tool catches everything, but it's not a guarantee. Make sure that you also test your app before deploying, and that you have good E2E test coverage.

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- On [our support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_upgrade)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/upgrade` follows good practices of security, but 100% security cannot be assured.

`@clerk/upgrade` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/upgrade/LICENSE) for more information.
