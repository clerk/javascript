<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_hono" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/hono

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_hono)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/hono/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_hono)

</div>

## Getting Started

[Clerk](https://clerk.com/?utm_source=github&utm_medium=clerk_hono) is the easiest way to add authentication and user management to your Hono application. Add sign up, sign in, and profile management to your application in minutes.

### Prerequisites

- Hono 4+
- Node.js 20+

### Installation

```sh
npm install @clerk/hono
```

### Configuration

Set your Clerk API keys as environment variables:

```sh
CLERK_SECRET_KEY=sk_****
CLERK_PUBLISHABLE_KEY=pk_****
```

### Usage

```typescript
import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@clerk/hono';

const app = new Hono();

// Apply Clerk middleware to all routes
app.use('*', clerkMiddleware());

// Public route
app.get('/', c => {
  return c.json({ message: 'Hello!' });
});

// Protected route
app.get('/protected', c => {
  const { userId } = getAuth(c);

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return c.json({ message: 'Hello authenticated user!', userId });
});

export default app;
```

### Accessing the Clerk Client

You can access the Clerk Backend API client directly from the context:

```typescript
app.get('/user/:id', async c => {
  const clerkClient = c.get('clerk');
  const user = await clerkClient.users.getUser(c.req.param('id'));
  return c.json({ user });
});
```

### Using `acceptsToken` for Machine Auth

```typescript
app.get('/api', c => {
  const auth = getAuth(c, { acceptsToken: 'api_key' });

  if (!auth.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return c.json({ message: 'API access granted' });
});
```

### Webhook Verification

```typescript
import { Hono } from 'hono';
import { verifyWebhook } from '@clerk/hono/webhooks';

const app = new Hono();

app.post('/webhooks/clerk', async c => {
  const evt = await verifyWebhook(c);

  switch (evt.type) {
    case 'user.created':
      console.log('User created:', evt.data.id);
      break;
    // Handle other event types...
  }

  return c.json({ received: true });
});
```

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- On [our support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_hono)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/hono` follows good practices of security, but 100% security cannot be assured.

`@clerk/hono` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/hono/LICENSE) for more information.
