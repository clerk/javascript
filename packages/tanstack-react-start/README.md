<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_tanstack_start" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/tanstack-react-start</h1>
</p>

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_tanstack_start)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/tanstack-react-start/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_tanstack_start)

</div>

## Getting Started

[Clerk](https://clerk.com/?utm_source=github&utm_medium=clerk_tanstack_start) is the easiest way to add authentication and user management to your Tanstack Start application. Add sign up, sign in, and profile management to your application in minutes.

> [!WARNING] > `@clerk/tanstack-react-start` is currently in beta. It's not recommended to use it in production just yet, but it would be much appreciated if you give it a try.

### Prerequisites

- Tanstack Start `^1.49.1` or later
- Tanstack Router `^1.49.1` or later
- React 18 or later
- Node.js `>=18.17.0` or later
- An existing Clerk application. [Create your account for free](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=clerk_tanstack_start).

### Installation

```sh
npm install @clerk/tanstack-react-start
```

## Usage

Make sure the following environment variables are set in a `.env` file:

```sh
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

You can get these from the [API Keys](https://dashboard.clerk.com/last-active?path=api-keys) screen in your Clerk dashboard.

To initialize Clerk with your TanStack Start application, you will need to make one modification to `app/routes/_root.tsx`. Wrap the children of the `RootComponent` with `<ClerkProvider/>`

```tsx
import { ClerkProvider } from '@clerk/tanstack-react-start'
import { createRootRoute } from '@tanstack/react-router'
import { Link, Outlet, ScrollRestoration } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Body, Head, Html, Meta, Scripts } from '@tanstack/start'
import * as React from 'react'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'

export const Route = createRootRoute({
  meta: () => [
    {
      charSet: 'utf-8',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
  ],
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  return (
    <ClerkProvider>
      <RootDocument>
          <Outlet />
      </RootDocument>
    </ClerkProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) { ... }
```

### Setup `clerkHandler` in the SSR entrypoint

You will also need to make on more modification to you SSR entrypoint (default: `app/ssr.tsx`):

- Wrap the `createStartHandler` with `createClerkHandler`

```tsx
import { createStartHandler, defaultStreamHandler } from '@tanstack/start/server';
import { getRouterManifest } from '@tanstack/start/router-manifest';
import { createRouter } from './router';
import { createClerkHandler } from '@clerk/tanstack-react-start/server';

const handler = createStartHandler({
  createRouter,
  getRouterManifest,
});

const clerkHandler = createClerkHandler(handler);

/*
 * // You can also override Clerk options by passing an object as second argument
 * const clerkHandler = createClerkHandler(handler, {
 *   afterSignInUrl: '/dashboard',
 * });
 */

export default clerkHandler(defaultStreamHandler);
```

After those changes are made, you can use Clerk components in your routes.

For example, in `app/routes/index.tsx`:

```tsx
import { SignIn, SignedIn, SignedOut, UserButton } from '@clerk/tanstack-react-start';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div className='p-2'>
      <h1>Hello Clerk!</h1>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignIn />
      </SignedOut>
    </div>
  );
}
```

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- On [our support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_tanstack_start)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/tanstack-react-start` follows good practices of security, but 100% security cannot be assured.

`@clerk/tanstack-react-start` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/tanstack-react-start/LICENSE) for more information.
