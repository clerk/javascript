---
"@clerk/shared": patch
"@clerk/react": patch
"@clerk/express": patch
---

Add `publishableKeyFromHost` utility for multi-domain setups.

Derives the correct publishable key from the current request hostname, enabling
apps with multiple custom domains to resolve the right key per request without
any manual lookup table.

Pass your configured publishable key as `fallbackKey` to ensure development
instances (`pk_test_`) are returned as-is — otherwise deriving from a host
like `localhost` would produce an incorrect `pk_live_` key.

```ts
// React
import { publishableKeyFromHost } from '@clerk/react/internal';

<ClerkProvider publishableKey={publishableKeyFromHost(window.location.host, process.env.VITE_CLERK_PUBLISHABLE_KEY)}>
```

```ts
// Express — combine with the new clerkMiddleware callback
import { publishableKeyFromHost } from '@clerk/express/internal';

app.use(clerkMiddleware((req) => ({
  publishableKey: publishableKeyFromHost(req.hostname, process.env.CLERK_PUBLISHABLE_KEY),
})));
```
