<p align="center">
  <a href="https://clerk.dev/" target="_blank" align="center">
    <img src="https://images.clerk.dev/static/clerk.svg" height="50">
  </a>
  <br />
</p>

# Clerk Edge SDK

_Clerk SDK for serverless and edge environments._

This package is a wrapper around Clerk core capabilities with added functionality and helpers aimed towards different edge and serverless platforms.

## Usage

Installing the package:

```sh
npm install @clerk/edge
# or
yarn add @clerk/edge
```

Methods for supported platforms can be imported from the specific path:

```ts
import { withAuth } from '@clerk/edge/vercel-edge';

async function handler(req, event) {
  // ...
}

export const middleware = withAuth(handler);
```

## Supported platforms

Currently supported environments/platforms:

### Vercel Edge Functions

To use with [Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions) :

```ts
import { withAuth } from '@clerk/edge/vercel-edge';

async function handler(req, event) {
  // ...
}

export const middleware = withAuth(handler);
```

Supported methods:

- `withAuth`
- `verifySessionToken`
- Resources API through `ClerkAPI`

### Validate the Authorized Party of a session token

Clerk's JWT session token, contains the azp claim, which equals the Origin of the request during token generation. You can provide the middlewares with a list of whitelisted origins to verify against, to protect your application of the subdomain cookie leaking attack. You can find an example below:

```ts
import { withAuth } from '@clerk/edge/vercel-edge';

const authorizedParties = ['http://localhost:3000', 'https://example.com'];

async function handler(req, event) {
  // ...
}

export const middleware = withAuth(handler, { authorizedParties });
```
