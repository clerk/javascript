<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_nextjs" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/nextjs

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_nextjs)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/nextjs/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Ask a Question](https://github.com/clerk/javascript/discussions)

</div>

---

## Overview

Clerk is the easiest way to add authentication and user management to your Next.js application. Add sign up, sign in,
and profile management to your application in minutes.

## Getting Started

### Prerequisites

- Next.js 13.0.4 or later
- React 18 or later
- Node.js `>=18.17.0` or later

### Installation

```sh
npm install @clerk/nextjs
```

### Build

To build the package locally with the TypeScript compiler, run:

```sh
npm run build
```

To build the package in watch mode, run the following:

```sh
npm run dev
```

## Usage

Clerk requires your application to be wrapped in the `<ClerkProvider/>` context.

Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to your Publishable Key in your `.env.local` file to make the environment
variable accessible to the Provider.

```sh
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_(test|live)_xxxxxxx
```

An implementation of `<ClerkProvider />` with our flexible Control Components to build an authentication flow
in `pages/_app.js`:

```jsx
import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

function MyApp({ Component, pageProps }) {
  return (
    <ClerkProvider>
      <>
        <SignedIn>
          <>
            <header style={{ padding: 20 }}>
              <UserButton />
            </header>
            <Component {...pageProps} />
          </>
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    </ClerkProvider>
  );
}

export default MyApp;
```

_For further details and examples, please refer to
our [Documentation](https://clerk.com/docs?utm_source=github&utm_medium=clerk_nextjs)._

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Create a [GitHub Discussion](https://github.com/clerk/javascript/discussions)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_nextjs)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please
read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md))
.

## Security

`@clerk/nextjs` follows good practices of security, but 100% security cannot be assured.

`@clerk/nextjs` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to
our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/nextjs/LICENSE) for more information.
