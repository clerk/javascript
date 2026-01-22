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

**New option: `satelliteAutoSync`** (default: `false`)
- When `false` (default): Skip automatic handshake if no session cookies exist, only trigger after explicit sign-in action
- When `true`: Satellite apps automatically trigger handshake on first load (previous behavior)

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
  // Set to true to automatically sync auth state on first load
  satelliteAutoSync: true,
});
```

### SSR (TanStack Start)
```typescript
import { clerkMiddleware } from '@clerk/tanstack-react-start/server';

export default clerkMiddleware({
  isSatellite: true,
  domain: 'satellite.example.com',
  signInUrl: 'https://primary.example.com/sign-in',
  // Set to true to automatically sync auth state on first load
  satelliteAutoSync: true,
});
```

### CSR (ClerkProvider)
```tsx
<ClerkProvider
  publishableKey="pk_..."
  isSatellite={true}
  domain="satellite.example.com"
  signInUrl="https://primary.example.com/sign-in"
  // Set to true to automatically sync auth state on first load
  satelliteAutoSync={true}
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

## Migration Guide

### Behavior change: `satelliteAutoSync` defaults to `false`

Previously, satellite apps would automatically trigger a handshake redirect on every first page load to sync authentication state with the primary domain—even when no session cookies existed. This caused unnecessary redirects to the primary domain for users who weren't authenticated.

The new default (`satelliteAutoSync: false`) provides a better experience for end users. Performance-wise, the satellite app can be shown immediately without attempting to sync state first, which is the right behavior for most use cases.

**To preserve the previous behavior** where visiting a satellite while already signed in on the primary domain automatically syncs your session, set `satelliteAutoSync: true`:

```typescript
export default clerkMiddleware({
  isSatellite: true,
  domain: 'satellite.example.com',
  signInUrl: 'https://primary.example.com/sign-in',
  satelliteAutoSync: true, // Opt-in to automatic sync on first load
});
```

### TanStack Start: Function props to options callback

The `clerkMiddleware` function no longer accepts individual props as functions. If you were using the function form for props like `domain`, `proxyUrl`, or `isSatellite`, migrate to the options callback pattern.

**Before (prop function form - no longer supported):**
```typescript
import { clerkMiddleware } from '@clerk/tanstack-react-start/server';

export default clerkMiddleware({
  isSatellite: true,
  // ❌ Function form for individual props no longer works
  domain: (url) => url.hostname,
});
```

**After (options callback form):**
```typescript
import { clerkMiddleware } from '@clerk/tanstack-react-start/server';

// ✅ Wrap entire options in a callback function
export default clerkMiddleware(({ url }) => ({
  isSatellite: true,
  domain: url.hostname,
}));
```

The callback receives a context object with the `url` property (a `URL` instance) and can return options synchronously or as a Promise for async configuration.
