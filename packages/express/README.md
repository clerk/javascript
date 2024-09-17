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

The `clerkMiddleware()` helper integrates Clerk authentication into your Express application. It is required to be set in the middleware chain before using other Clerk utilities, such as `requireAuth` and `getAuth()`.

```js
import { clerkMiddleware } from '@clerk/express';

const app = express();

// Pass no parameters
app.use(clerkMiddleware());

// Pass a function that will run as middleware
app.use(clerkMiddleware(handler));

// Pass options
app.use(clerkMiddleware(options));

// Pass both
app.use(clerkMiddleware(handler, options));
```

### `requireAuth`

`requireAuth` is a middleware function that you can use to protect routes in your Express.js application. This function checks if the user is authenticated, and passes an `UnauthorizedError` to the next middleware if they are not.

`clerkMiddleware()` is required to be set in the middleware chain before this util is used.

```js
import { clerkMiddleware, requireAuth, UnauthorizedError } from '@clerk/express';
import express from 'express';

const app = express();

const port = 3000;

// Apply centralized middleware
app.use(clerkMiddleware());

// Define a protected route
app.get('/protected', requireAuth, (req, res) => {
  res.send('This is a protected route');
});

app.use((err, req, res, next) => {
  if (err instanceof UnauthorizedError) {
    res.status(401).send('Unauthorized');
  } else {
    next(err);
  }
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

### `getAuth()`

The `getAuth()` helper retrieves authentication state from the request object. See the [Next.js reference documentation](https://clerk.com/docs/references/nextjs/get-auth) for more information on how to use it.

```js
import { clerkMiddleware, getAuth, ForbiddenError } from '@clerk/express';
import express from 'express';

const app = express();
const port = 3000;

// Apply centralized middleware
app.use(clerkMiddleware());

// Protect a route based on authorization status
hasPermission = (request, response, next) => {
  const auth = getAuth(request);

  // Handle if the user is not authorized
  if (!auth.has({ permission: 'org:admin:testpermission' })) {
    // Catch this inside an error-handling middleware
    return next(new ForbiddenError());
  }

  return next();
};

app.get('/path', requireAuth, hasPermission, (req, res) => res.json(req.auth));

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

### `clerkClient`

[Clerk's JavaScript Backend SDK](/docs/references/backend/overview) exposes Clerk's Backend API resources and low-level authentication utilities for JavaScript environments. For example, if you wanted to get a list of all users in your application, instead of creating a fetch to Clerk's `https://api.clerk.com/v1/users` endpoint, you can use the `users.getUserList()` method provided by the JavaScript Backend SDK.

All resource operations are mounted as sub-APIs on the `clerkClient` object. See the [reference documentation](/docs/references/backend/overview#usage) for more information.

```js
import { clerkClient } from '@clerk/express';
import express from 'express';

const app = express();
const port = 3000;

const users = await clerkClient.users.getUserList();

app.get('/users', requireAuth, (req, res) => res.json(users));

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
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
