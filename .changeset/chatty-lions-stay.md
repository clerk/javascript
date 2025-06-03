---
'@clerk/tanstack-react-start': minor
'@clerk/agent-toolkit': minor
'@clerk/react-router': minor
'@clerk/express': minor
'@clerk/fastify': minor
'@clerk/astro': minor
'@clerk/remix': minor
'@clerk/nuxt': minor
---

Machine authentication is now supported for advanced use cases via the backend SDK. You can use `clerkClient.authenticateRequest` to validate machine tokens (such as API keys, OAuth tokens, and machine-to-machine tokens). No new helpers are included in these packages yet.

Example (Astro):

```ts
import { clerkClient } from '@clerk/astro/server';

export const GET: APIRoute = ({ request }) => {
    const requestState = await clerkClient.authenticateRequest(request, {
        acceptsToken: 'api_key'
    });

    if (!requestState.isAuthenticated) {
        return new Response(401, { message: 'Unauthorized' })
    }

    return new Response(JSON.stringify(requestState.toAuth()))
}
```