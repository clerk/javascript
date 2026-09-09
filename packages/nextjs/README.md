<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_nextjs" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/nextjs</h1>
</p>

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_nextjs)
[![Follow on X](https://img.shields.io/twitter/follow/clerk?style=social)](https://x.com/intent/follow?screen_name=clerk)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/nextjs/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_nextjs)

</div>

## Getting Started

[Clerk](https://clerk.com/?utm_source=github&utm_medium=clerk_nextjs) is the easiest way to add authentication and user management to your Next.js application. Add sign up, sign in, and profile management to your application in minutes.

### Prerequisites

- Next.js 15.2.8 or later
- React 18 or later
- Node.js `>=20.9.0` or later
- A Clerk application. `npx -y clerk@latest init` creates or links one and writes its keys to your env file. Agents and new projects get temporary development keys with no Clerk account; in an existing project, a signed-out user is asked to log in unless they pass `--accountless`. Or [create your account](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=clerk_nextjs) and copy the keys from the dashboard.

### Installation

The fastest way to get started is the Clerk CLI. In an existing Next.js project, run `npx -y clerk@latest init`. In an empty directory, run `npx -y clerk@latest init --framework next --pm npm` and it scaffolds the Next.js app as well; there is no lockfile to detect a package manager from, so name one.

Either way it installs `@clerk/nextjs`, creates or links a Clerk application, writes the keys to your env file (the first `.env*` file that exists, or `.env.local` if none does), and adds `<ClerkProvider>`, the middleware, and sign-in and sign-up pages. When an agent runs it, or when you start in an empty directory, no Clerk account is needed: the CLI provisions temporary development keys. In an existing project, a signed-out user is asked to log in, or can pass `--accountless` to use temporary keys instead.

To set things up by hand instead, follow the [Next.js Quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart?utm_source=github&utm_medium=clerk_nextjs).

You'll learn how to install `@clerk/nextjs`, set up your environment keys, add `<ClerkProvider>` to your application, use the Clerk middleware, and use Clerk's prebuilt components.

## Usage

For further information, guides, and examples visit the [Next.js reference documentation](https://clerk.com/docs/references/nextjs/overview?utm_source=github&utm_medium=clerk_nextjs).

## Upgrading

`@clerk/nextjs` supports upgrading through automatic code migration.

## Support

For help, visit our [support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_nextjs).

## Community

Join our [Discord community](https://clerk.com/discord) to connect with other developers.

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/nextjs` follows good practices of security, but 100% security cannot be assured.

`@clerk/nextjs` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/nextjs/LICENSE) for more information.
