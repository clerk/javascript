<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_express" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/express</h1>
</p>

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_express)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/express/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_express)

</div>

## Getting Started

[Clerk](https://clerk.com/?utm_source=github&utm_medium=clerk_express) is the easiest way to add authentication and user management to your Express application. Add sign up, sign in, and profile management to your application in minutes.

### Prerequisites

- Node.js `>=18.17.0` or later
- An existing Clerk application. [Create your account for free](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=clerk_express).
- An existing Express application (follow their [Getting started](https://expressjs.com/en/starter/installing.html) guide)

### Installation

```sh
npm install @clerk/express
```

## Usage

Navigate to the [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys) and inside the **API Keys** section copy the publishable key and secret key.

Paste your keys into an `.env` file:

```sh
CLERK_PUBLISHABLE_KEY=pk_*******
CLERK_SECRET_KEY=sk_******
```

Ensure that the environment variables are loaded, for example by using `dotenv` at the top of your Express application:

```js
import 'dotenv/config';

// Rest of application
```

### `clerkMiddleware()`

The `clerkMiddleware()` function checks the request's cookies and headers for a session JWT and, if found, attaches the [`Auth`](https://clerk.com/docs/references/nextjs/auth-object#auth-object) object to the request object under the `auth` key.

```js
import { clerkMiddleware } from '@clerk/express';
import express from 'express';

const app = express();

// Pass no parameters
app.use(clerkMiddleware());

// Pass options
app.use(clerkMiddleware(options));
```

### `requireAuth`

The `requireAuth()` middleware functions similarly to `clerkMiddleware()`, but also protects your routes by redirecting unauthenticated users to the sign-in page.

The sign-in path will be read from the `signInUrl` option or the `CLERK_SIGN_IN_URL` environment variable if available.

```js
import { requireAuth } from '@clerk/express';
import express from 'express';

const app = express();

// Apply centralized middleware
app.use(requireAuth());

// Apply middleware to a specific route
app.get('/protected', requireAuth(), (req, res) => {
  res.send('This is a protected route');
});

// Custom sign-in URL
app.get('/protected', requireAuth({ signInUrl: '/sign-in' }), (req, res) => {
  res.send('This is a protected route');
});
```

### `getAuth()`

The `getAuth()` helper retrieves authentication state from the request object. See the [Next.js reference documentation](https://clerk.com/docs/references/nextjs/get-auth) for more information on how to use it.

```js
import { clerkMiddleware, getAuth } from '@clerk/express';
import express from 'express';

const app = express();

// Apply centralized middleware
app.use(clerkMiddleware());

// Protect a route based on authorization status
hasPermission = (request, response, next) => {
  const auth = getAuth(request);

  // Handle if the user is not authorized
  if (!auth.has({ permission: 'org:admin:testpermission' })) {
    return response.status(403).send('Unauthorized');
  }

  return next();
};

app.get('/path', requireAuth, hasPermission, (req, res) => res.json(req.auth));
```

### `clerkClient`

[Clerk's JavaScript Backend SDK](/docs/references/backend/overview) exposes Clerk's Backend API resources and low-level authentication utilities for JavaScript environments. For example, if you wanted to get a list of all users in your application, instead of creating a fetch to Clerk's `https://api.clerk.com/v1/users` endpoint, you can use the `users.getUserList()` method provided by the JavaScript Backend SDK.

All resource operations are mounted as sub-APIs on the `clerkClient` object. See the [reference documentation](/docs/references/backend/overview#usage) for more information.

```js
import { clerkClient } from '@clerk/express';
import express from 'express';

const app = express();

app.get('/users', requireAuth, async (req, res) => {
  const users = await clerkClient.users.getUserList();
  return res.json({ users });
});
```

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- On [our support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_express)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/express` follows good practices of security, but 100% security cannot be assured.

`@clerk/express` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/express/LICENSE) for more information.
