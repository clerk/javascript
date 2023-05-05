<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_fastify" target="_blank" rel="noopener noreferrer">
    <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
  </a>
  <br /> 
</p>

# @clerk/fastify

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.com/invite/b5rXHjAg7A)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_fastify)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerkinc/javascript/blob/main/packages/fastify/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=bug&template=bug_report.md&title=Bug%3A+)
·
[Request a Feature](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=Feature%3A+)
·
[Ask a Question](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)

</div>

---

## Overview

[Clerk](https://clerk.com?utm_source=github&utm_medium=clerk_fastify) is the easiest way to add authentication and user management to your Fastify application. To gain a better understanding of the Clerk Backend API and SDK, refer to
the <a href="https://clerk.com/docs/reference/node/getting-started?utm_source=github&utm_medium=clerk_fastify" target="_blank">Node SDK</a> and <a href="https://clerk.com/docs/reference/backend-api" target="_blank">Backend API</a> documentation.

## Getting Started

To use this plugin you should first create a Clerk application and retrieve a `Secret Key` and a `Publishable Key` for you application (see [here](https://clerk.com/docs/reference/node/getting-started#set-c-l-e-r-k-s-e-c-r-e-t-key)) to be used as environment variables `CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`.

### Prerequisites

- Node.js v14+
- Fastify v4+

### Installation

```shell
npm install @clerk/fastify
```

### Build

```shell
npm run build
```

## Usage

Retrieve your Backend API key from the [API Keys](https://dashboard.clerk.com/last-active?path=api-keys) screen in your Clerk dashboard and set it as an environment variable in a `.env` file:

```sh
CLERK_PUBLISHABLE_KEY=pk_*******
CLERK_SECRET_KEY=sk_******
```

You will then be able to access all the available methods.

```javascript
import 'dotenv/config'; // To read CLERK_PUBLISHABLE_KEY
import Fastify from 'fastify';
import { clerkPlugin, getAuth } from '@clerk/fastify';
import type { FastifyInstance } from 'fastify';

const server: FastifyInstance = Fastify({ logger: true });

server.register(clerkPlugin);

server.get('/private', async (req, reply) => {
  const auth = getAuth(req);
  if (!auth.userId) {
    return reply.code(403).send();
  }
  return { hello: 'world' };
});

const start = async () => {
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
```

### Scoped routes

Support authenticated routes that the Clerk middleware will run as plugin in `preHandler` hook and unauthenticated routes that will not trigger the middleware using the Fastify [docs](https://www.fastify.io/docs/latest/Guides/Getting-Started/#loading-order-of-your-plugins).

```javascript
import 'dotenv/config'; // To read CLERK_PUBLISHABLE_KEY
import Fastify from 'fastify';
import { clerkPlugin, getAuth } from '@clerk/fastify';
import type { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';

const server: FastifyInstance = Fastify({ logger: true });

const privateRoutes = async (fastify: FastifyInstance, _opts: any) => {
  fastify.register(clerkPlugin);

  fastify.get('/private', async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = getAuth(req);

    if (!auth.userId) {
      return reply.code(403).send();
    }

    return { hello: 'world', auth };
  });
};

server.register(privateRoutes);

server.get('/public', async (_req, _reply) => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
```

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Open a [GitHub support issue](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_fastify)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerkinc/javascript/blob/main/docs/CONTRIBUTING.md).

## Security

`@clerk/fastify` follows good practices of security, but 100% security cannot be assured.

`@clerk/fastify` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerkinc/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerkinc/javascript/blob/main/packages/fastify/LICENSE) for more information.
