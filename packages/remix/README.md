<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_remix" target="_blank" rel="noopener noreferrer">
    <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
  </a>
  <br />
</p>

# @clerk/remix

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.com/invite/b5rXHjAg7A)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_remix)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerkinc/javascript/blob/main/packages/remix/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=bug&template=bug_report.md&title=Bug%3A+)
·
[Request a Feature](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=Feature%3A+)
·
[Ask a Question](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)

</div>

---

## Overview

Clerk is the easiest way to add authentication and user management to your Remix application. Add sign up, sign in, and profile management to your application in minutes.

## Getting Started

### Prerequisites

- Remix v1.2+
- Node.js v16+

### Installation

```sh
npm install @clerk/remix
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

Make sure the following environment variables are set in a `.env` file:

```sh
CLERK_FRONTEND_API=[frontend-api-key]
CLERK_API_KEY=[backend-api-key]
CLERK_JWT_KEY=[jwt-verification-key]
```

You can get these from the [API Keys](https://dashboard.clerk.com/last-active?path=api-keys) screen in your Clerk dashboard.

To initialize Clerk with your Remix application, you will need to make three modifications to `app/root.jsx`:

1. Export `rootAuthLoader` as `loader`
2. Export `ClerkCatchBoundary` as `CatchBoundary`
3. Wrap the default export with `ClerkApp`

```jsx
import { rootAuthLoader } from '@clerk/remix/ssr.server';
import { ClerkApp, ClerkCatchBoundary } from '@clerk/remix';

export const loader = args => rootAuthLoader(args);
export const CatchBoundary = ClerkCatchBoundary();

function App() {
  return <html lang='en'>[...]</html>;
}

export default ClerkApp(App);
```

After those changes are made, you can use Clerk components in your routes.

For example, in `app/routes/index.jsx`:

```jsx
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/remix';

export default function Index() {
  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        lineHeight: '1.4',
        textAlign: 'center',
      }}
    >
      <h1>Hello Clerk!</h1>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton mode='modal' />
      </SignedOut>
    </div>
  );
}
```

_For further details and examples, please refer to our [Documentation](https://clerk.com/docs/get-started/remix?utm_source=github&utm_medium=clerk_remix)._

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Open a [GitHub support issue](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_remix)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerkinc/javascript/blob/main/docs/CONTRIBUTING.md).

## Security

`@clerk/remix` follows good practices of security, but 100% security cannot be assured.

`@clerk/remix` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerkinc/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerkinc/javascript/blob/main/packages/remix/LICENSE) for more information.
