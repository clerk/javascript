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
import { withSession } from '@clerk/edge/vercel-edge';

async function handler(req, event) {
  // ...
}

export const middleware = withSession(handler);
```

## Supported platforms

Currently supported environments/platforms:

### Vercel Edge Functions

To use with [Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions) :

```ts
import { withSession } from '@clerk/edge/vercel-edge';

async function handler(req, event) {
  // ...
}

export const middleware = withSession(handler);
```

Supported methods:

- `withSession`
- `verifySessionToken`
- Resources API through `ClerkAPI`
