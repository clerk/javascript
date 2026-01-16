---
"@clerk/backend": minor
"@clerk/shared": minor
"@clerk/clerk-js": minor
"@clerk/tanstack-react-start": minor
"@clerk/nextjs": patch
"@clerk/astro": patch
---

Add `satelliteAutoSync` option to optimize satellite app handshake behavior

Satellite apps currently trigger a handshake redirect on every first page load, even when no cookies exist. This creates unnecessary redirects to the primary domain for apps where most users aren't authenticated.

**New option: `satelliteAutoSync`** (default: `true`)
- When `true` (default): Satellite apps automatically trigger handshake on first load (existing behavior)
- When `false`: Skip automatic handshake if no session cookies exist, only trigger after explicit sign-in action

**New query parameter: `__clerk_sync`**
- `__clerk_sync=1` (NeedsSync): Triggers handshake after returning from primary sign-in
- `__clerk_sync=2` (Completed): Prevents re-sync loop after handshake completes

Backwards compatible: Still reads legacy `__clerk_synced=true` parameter.

**SSR redirect fix**: Server-side redirects (e.g., `redirectToSignIn()` from middleware) now correctly add `__clerk_sync=1` to the return URL for satellite apps. This ensures the handshake is triggered when the user returns from sign-in on the primary domain.

**CSR redirect fix**: Client-side redirects now add `__clerk_sync=1` to all redirect URL variants (`forceRedirectUrl`, `fallbackRedirectUrl`) for satellite apps, not just the default `redirectUrl`.

## Usage

### SSR (Next.js Middleware)
```typescript
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  isSatellite: true,
  domain: 'satellite.example.com',
  signInUrl: 'https://primary.example.com/sign-in',
  satelliteAutoSync: false,
});
```

### SSR (TanStack Start)
```typescript
import { clerkMiddleware } from '@clerk/tanstack-react-start/server';

export default clerkMiddleware({
  isSatellite: true,
  domain: 'satellite.example.com',
  signInUrl: 'https://primary.example.com/sign-in',
  satelliteAutoSync: false,
});
```

### CSR (ClerkProvider)
```tsx
<ClerkProvider
  publishableKey="pk_..."
  isSatellite={true}
  domain="satellite.example.com"
  signInUrl="https://primary.example.com/sign-in"
  satelliteAutoSync={false}
>
  {children}
</ClerkProvider>
```

### SSR (TanStack Start with callback)
```typescript
import { clerkMiddleware } from '@clerk/tanstack-react-start/server';

// Options callback - receives context object, returns options
export default clerkMiddleware(({ url }) => ({
  isSatellite: true,
  domain: 'satellite.example.com',
  signInUrl: 'https://primary.example.com/sign-in',
  satelliteAutoSync: url.pathname.startsWith('/dashboard'),
}));
```
