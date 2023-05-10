<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_nextjs" target="_blank" rel="noopener noreferrer">
    <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
  </a>
  <br />
</p>

# @clerk/nextjs

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.com/invite/b5rXHjAg7A)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_nextjs)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerkinc/javascript/blob/main/packages/nextjs/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=bug&template=bug_report.md&title=Bug%3A+)
·
[Request a Feature](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=Feature%3A+)
·
[Ask a Question](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)

</div>

---

## Overview

Clerk is the easiest way to add authentication and user management to your Next.js application. Add sign up, sign in,
and profile management to your application in minutes.

## Getting Started

### Prerequisites

- Next.js v10+
- Node.js v14+

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

If you are using the previous version of Clerk keys, set `NEXT_PUBLIC_CLERK_FRONTEND_API` to your Frontend API in
your `.env.local` file.

```sh
NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.[your-domain].[tld]
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
- Open a [GitHub support issue](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_nextjs)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please
read [our contribution guidelines](https://github.com/clerkinc/javascript/blob/main/docs/CONTRIBUTING.md))
.

## Security

`@clerk/nextjs` follows good practices of security, but 100% security cannot be assured.

`@clerk/nextjs` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to
our [security documentation](https://github.com/clerkinc/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerkinc/javascript/blob/main/packages/nextjs/LICENSE) for more information.
