---
'@clerk/astro': minor
---

Introduces machine authentication, supporting four token types: `api_key`, `oauth_token`, `m2m_token`, and `session_token`. For backwards compatibility, `session_token` remains the default when no token type is specified. This enables machine-to-machine authentication and use cases such as API keys and OAuth integrations. Existing applications continue to work without modification.

You can specify which token types are allowed by using the `acceptsToken` option in the `auth()` local. This option can be set to a specific type, an array of types, or `'any'` to accept all supported tokens.

Example usage in endpoints:

```ts
export const GET: APIRoute = ({ locals }) => {
  const authObject = locals.auth({ acceptsToken: 'any' })

  if (authObject.tokenType === 'session_token') {
    console.log('this is session token from a user')
  } else {
    console.log('this is some other type of machine token (api_key | oauth_token | m2m_token)')
    console.log('more specifically, a ' + authObject.tokenType)
  }

  return new Response(JSON.stringify({}))
}
```

In middleware:

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

const isProtectedRoute = createRouteMatcher(['/api(.*)']);

export const onRequest = clerkMiddleware((auth, context) => {
  const { userId } = auth({ acceptsToken: 'api_key' })

  if (!userId && isProtectedRoute(context.request)) {
    return new Response('Unauthorized', { status: 401 });
  }
});
```
