<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_react" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/clerk-react

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_react)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/react/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Ask a Question](https://github.com/clerk/javascript/discussions)

</div>

---

## Overview

Clerk is the easiest way to add authentication and user management to your React application. Add sign up, sign in, and profile management to your application in minutes.

## Getting Started

### Prerequisites

- React v18+
- Node.js `>=18.17.0` or later

### Installation

```sh
npm install @clerk/clerk-react
```

### Build

```sh
npm run build
```

To build the package in watch mode, run the following:

```sh
npm run dev
```

## Usage

Clerk requires your application to be wrapped in the `<ClerkProvider/>` context.

If using Vite, set `VITE_CLERK_PUBLISHABLE_KEY` to your Publishable key in your `.env.local` file to make the environment variable accessible on `process.env` and pass it as the `publishableKey` prop.

```jsx
import { render } from 'react-dom';

import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY;

render(
  <ClerkProvider publishableKey={publishableKey}>
    <App />
  </ClerkProvider>,
  document.getElementById('root'),
);

function App() {
  return (
    <>
      <h1>Hello Clerk!</h1>
      <SignedIn>
        <UserButton afterSignOutUrl={window.location.href} />
      </SignedIn>
      <SignedOut>
        <SignInButton mode='modal' />
      </SignedOut>
    </>
  );
}
```

_For further details and examples, please refer to our [Documentation](https://clerk.com/docs?utm_source=github&utm_medium=clerk_react)._

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Create a [GitHub Discussion](https://github.com/clerk/javascript/discussions)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_react)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md).

## Security

`@clerk/clerk-react` follows good practices of security, but 100% security cannot be assured.

`@clerk/clerk-react` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/react/LICENSE) for more information.
