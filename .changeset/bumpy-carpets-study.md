---
'@clerk/backend': major
---

Introduces machine authentication, supporting four token types: `api_key`, `oauth_token`, `machine_token`, and `session_token`. For backwards compatibility, `session_token` remains the default when no token type is specified. This enables machine-to-machine authentication and use cases such as API keys and OAuth integrations. Existing applications continue to work without modification.

You can specify which token types are allowed by using the `acceptsToken` option in the `authenticateRequest()` function. This option can be set to a specific type, an array of types, or `'any'` to accept all supported tokens.

Example usage:

```ts
import express from 'express';
import { clerkClient } from '@clerk/backend';

const app = express();

app.use(async (req, res, next) => {
  const requestState = await clerkClient.authenticateRequest(req, {
    acceptsToken: 'any'
  });

  if (!requestState.isAuthenticated) {
    // do something for unauthenticated requests
  }

  const authObject = requestState.toAuth();

  if (authObject.tokenType === 'session_token') {
    console.log('this is session token from a user')
  } else {
    console.log('this is some other type of machine token')
    console.log('more specifically, a ' + authObject.tokenType)
  }

  // Attach the auth object to locals so downstream handlers
  // and middleware can access it
  res.locals.auth = authObject;
  next();
});
```