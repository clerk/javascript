---
'@clerk/nextjs': minor
---

Introduces machine authentication, supporting four token types: `api_key`, `oauth_token`, `machine_token`, and `session_token`. For backwards compatibility, `session_token` remains the default when no token type is specified. This enables machine-to-machine authentication and use cases such as API keys and OAuth integrations. Existing applications continue to work without modification.

You can specify which token types are allowed for a given route or handler using the `acceptsToken` property in the `auth()` helper, or the `token` property in the `auth.protect()` helper. Each can be set to a specific type, an array of types, or `'any'` to accept all supported tokens.

Example usage in Nextjs middleware:

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isOAuthAccessible = createRouteMatcher(['/oauth(.*)'])
const isApiKeyAccessible = createRouteMatcher(['/api(.*)'])
const isMachineTokenAccessible = createRouteMatcher(['/m2m(.*)'])
const isUserAccessible = createRouteMatcher(['/user(.*)'])
const isAccessibleToAnyValidToken = createRouteMatcher(['/any(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isOAuthAccessible(req)) await auth.protect({ token: 'oauth_token' })
  if (isApiKeyAccessible(req)) await auth.protect({ token: 'api_key' })
  if (isMachineTokenAccessible(req)) await auth.protect({ token: 'machine_token' })
  if (isUserAccessible(req)) await auth.protect({ token: 'session_token' })

  if (isAccessibleToAnyValidToken(req)) await auth.protect({ token: 'any' })
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

Leaf node route protection:

```ts
import { auth } from '@clerk/nextjs/server'

// In this example, we allow users and oauth tokens with the "profile" scope
// to access the data. Other types of tokens are rejected.
function POST(req, res) {
  const authObject = await auth({ acceptsToken: ['session_token', 'oauth_token'] })
  
  if (authObject.tokenType === 'oauth_token' &&
      !authObject.scopes?.includes('profile')) {
      throw new Error('Unauthorized: OAuth token missing the "profile" scope')
  }
  
  // get data from db using userId
  const data = db.select().from(user).where(eq(user.id, authObject.userId))
  
  return { data }
}
```