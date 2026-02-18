# Netlify Cache Handler Improvement Design

**Date:** 2026-02-18
**Status:** Approved
**Author:** Claude Code

## Overview

Improve Clerk's Netlify cache handling during authentication handshakes by replacing timestamp-based cache-bust parameters with proper `Netlify-Vary` HTTP headers. This follows Netlify's recommended approach and eliminates URL pollution while providing a more reliable solution to prevent infinite redirect loops.

## Background

### The Problem

Clerk's authentication handshake mechanism creates redirect loops on Netlify-hosted server-rendered applications:

1. User visits protected page without valid authentication cookies
2. Server returns 307 redirect to Clerk's Frontend API for auth verification
3. FAPI verifies identity and redirects back with new session cookies
4. **Netlify's CDN serves the cached redirect from step 2 instead of processing the new auth state**
5. Infinite redirect loop occurs

This happens because Netlify caches the initial 307 redirect response and serves it even after authentication state changes via cookies.

### Current Solution

The current implementation (`handleNetlifyCacheInDevInstance`) adds a timestamp-based cache-bust parameter (`__clerk_netlify_cache_bust=<timestamp>`) to redirect URLs:

- Only applies to development instances on Netlify
- Requires cleanup in `clerk-js` to remove the parameter from URLs
- Works as a temporary workaround but doesn't address the root cause
- Referenced in: https://answers.netlify.com/t/cache-handling-recommendation-for-authentication-handshake-redirects/143969

### Netlify's Recommended Solution

Netlify recommends using `Netlify-Vary` headers to vary cache based on authentication cookies. This tells the CDN to maintain separate cache entries for different cookie combinations, preventing stale redirect responses.

## Design Goals

1. Replace cache-bust parameters with proper `Netlify-Vary` headers
2. Improve Netlify runtime detection reliability
3. Eliminate URL pollution and cleanup code
4. Maintain backward compatibility with all SDK integrations
5. Keep scope limited to development instances (not production)

## Architecture

### High-Level Changes

**Modified files:**

- `/packages/shared/src/netlifyCacheHandler.ts` - Core implementation
- `/packages/shared/src/__tests__/netlifyCacheHandler.spec.ts` - Test updates
- `/packages/clerk-js/src/core/clerk.ts` - Remove cache-bust cleanup
- `/packages/clerk-js/src/utils/getClerkQueryParam.ts` - Remove from query params list

**Unchanged SDK integrations:**
All 6 SDK middleware files continue calling `handleNetlifyCacheInDevInstance()` with the same signature:

- `@clerk/astro`
- `@clerk/remix`
- `@clerk/react-router`
- `@clerk/nuxt`
- `@clerk/tanstack-react-start`

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│ SDK Middleware (Astro, Remix, Nuxt, etc.)              │
│                                                         │
│  1. authenticateRequest() returns 307 with Location    │
│  2. Calls handleNetlifyCacheInDevInstance()            │
│  3. Returns 307 Response with headers                  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ handleNetlifyCacheInDevInstance()                       │
│ (packages/shared/src/netlifyCacheHandler.ts)           │
│                                                         │
│  ┌─────────────────────────────────────┐              │
│  │ isNetlifyRuntime()                  │              │
│  │ • Check NETLIFY env                 │              │
│  │ • Check NETLIFY_DEV env             │              │
│  │ • Check DEPLOY_PRIME_URL env        │              │
│  │ • Check NETLIFY_FUNCTIONS_TOKEN     │              │
│  │ • Check *.netlify.app URL           │              │
│  └─────────────────┬───────────────────┘              │
│                    │                                    │
│  ┌─────────────────▼───────────────────┐              │
│  │ isDevelopmentInstance()             │              │
│  │ • Check publishable key prefix      │              │
│  └─────────────────┬───────────────────┘              │
│                    │                                    │
│  ┌─────────────────▼───────────────────┐              │
│  │ If both true:                       │              │
│  │ Set Netlify-Vary header:            │              │
│  │ "cookie=__client, cookie=__session" │              │
│  └─────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ Netlify CDN                                             │
│                                                         │
│  Caches 307 responses with separate entries for:       │
│  • Different __client cookie values                     │
│  • Different __session cookie values                    │
│                                                         │
│  Result: No stale redirects served after auth state    │
│          changes via cookies                            │
└─────────────────────────────────────────────────────────┘
```

## Detailed Design

### 1. Enhanced Runtime Detection

**Current detection (limited):**

```typescript
Boolean(process.env.NETLIFY) ||
  Boolean(process.env.NETLIFY_FUNCTIONS_TOKEN) ||
  (typeof process.env.URL === 'string' && process.env.URL.endsWith('netlify.app'));
```

**New detection (comprehensive):**

```typescript
function isNetlifyRuntime(): boolean {
  if (typeof process === 'undefined' || !process.env) {
    return false;
  }

  return (
    Boolean(process.env.NETLIFY) ||
    Boolean(process.env.NETLIFY_DEV) ||
    Boolean(process.env.DEPLOY_PRIME_URL) ||
    Boolean(process.env.NETLIFY_FUNCTIONS_TOKEN) ||
    (typeof process.env.URL === 'string' && process.env.URL.endsWith('netlify.app'))
  );
}
```

**Improvement rationale:**

- `NETLIFY` - Always set to "true" on Netlify
- `NETLIFY_DEV` - Set to "true" during local development with `netlify dev`
- `DEPLOY_PRIME_URL` - Primary URL for the deploy (Netlify-specific)
- `NETLIFY_FUNCTIONS_TOKEN` - Functions token (existing check)
- `*.netlify.app` URL check - Fallback for edge cases

All checks are Netlify-specific (no generic env vars that could conflict with other providers).

### 2. Netlify-Vary Header Implementation

**Header format:**

```
Netlify-Vary: cookie=__client, cookie=__session
```

**Cookies to vary on:**

- `__client` - Clerk's client-side session cookie (suffixed as `__client_uat`)
- `__session` - Clerk's server-side session token cookie

These are the cookies that determine authentication state during the handshake flow.

**Implementation in `handleNetlifyCacheInDevInstance()`:**

```typescript
export function handleNetlifyCacheInDevInstance({
  locationHeader,
  requestStateHeaders,
  publishableKey,
}: {
  locationHeader: string;
  requestStateHeaders: Headers;
  publishableKey: string;
}) {
  const isOnNetlify = isNetlifyRuntime();
  const isDevelopmentInstance = isDevelopmentFromPublishableKey(publishableKey);

  if (isOnNetlify && isDevelopmentInstance) {
    // Set Netlify-Vary header to vary cache based on auth cookies
    requestStateHeaders.set('Netlify-Vary', 'cookie=__client, cookie=__session');
  }
}
```

**Key behavior:**

- Applied to all 307 redirects during handshake (both initial and callback)
- Netlify's CDN maintains separate cache entries for different cookie combinations
- Prevents serving stale redirect responses after authentication
- No URL modification needed

### 3. Clerk-JS Cleanup Removal

Since we're no longer adding cache-bust parameters, we can remove the cleanup code:

**Files to modify:**

1. **`/packages/clerk-js/src/core/clerk.ts`**
   - Remove line: `removeClerkQueryParam(CLERK_NETLIFY_CACHE_BUST_PARAM);`

2. **`/packages/clerk-js/src/utils/getClerkQueryParam.ts`**
   - Remove from CLERK_QUERY_PARAMS_TO_REMOVE: `CLERK_NETLIFY_CACHE_BUST_PARAM`

3. **`/packages/shared/src/netlifyCacheHandler.ts`**
   - Remove constant export: `export const CLERK_NETLIFY_CACHE_BUST_PARAM = '__clerk_netlify_cache_bust';`

**Why this is safe:**

- The parameter was only used for this workaround
- No external APIs or public documentation reference it
- Removing it simplifies the codebase
- Old deployments with cache-bust params continue working (params are harmless)

### 4. Test Updates

**Current test cases (cache-bust focused):**

- ✅ Add cache-bust parameter when on Netlify + dev instance
- ✅ Don't add parameter when handshake param present
- ✅ Don't add parameter when not on Netlify
- ✅ Handle invalid URL env var

**New test cases (header focused):**

1. **Should set Netlify-Vary header when on Netlify and in development**

   ```typescript
   expect(requestStateHeaders.get('Netlify-Vary')).toBe('cookie=__client, cookie=__session');
   ```

2. **Should set Netlify-Vary header regardless of handshake presence**
   - Unlike cache-bust, we always want the vary header
   - Test with and without `__clerk_handshake` param

3. **Should not set Netlify-Vary header when not on Netlify**
   - Verify header is NOT added on other platforms

4. **Runtime detection tests (new):**
   - Test detection with `NETLIFY=true`
   - Test detection with `NETLIFY_DEV=true`
   - Test detection with `DEPLOY_PRIME_URL` set
   - Test detection with `NETLIFY_FUNCTIONS_TOKEN` set
   - Test detection with `*.netlify.app` URL
   - Test NO detection when none are present

5. **Invalid env var handling (keep existing)**
   - Test when URL is not a string

**Key differences:**

- Test header presence, not URL modification
- Simpler assertions (just check header value)
- More comprehensive runtime detection coverage

## Understanding Clerk Handshake Flow

For context, here's how the handshake works:

### Normal Handshake Flow

1. **User visits protected page** without valid `__client_uat` or `__session` cookies
2. **Server returns 307 redirect** to FAPI:
   ```
   Location: https://{frontend-api}/v1/client/handshake?redirect_url={original_url}
   ```
3. **FAPI verifies identity** and returns 307 redirect back to original URL with cookies:
   ```
   Set-Cookie: __session=...
   Set-Cookie: __client_uat=...
   Set-Cookie: __refresh=...
   Location: {original_url}
   ```
4. **Server verifies handshake token** and processes the request with new session

### The Netlify Caching Problem

Without proper cache headers:

- Step 2's redirect gets cached by Netlify
- When user returns from FAPI with new cookies (step 3), Netlify serves **cached step 2 redirect**
- User gets redirected back to FAPI again
- Infinite loop

With `Netlify-Vary` headers:

- Netlify caches separate versions based on `__client` and `__session` cookie values
- After FAPI sets new cookies, Netlify knows this is a different cache state
- Serves fresh response instead of cached redirect
- No loop

## Error Handling & Edge Cases

### Scenarios Handled

1. **Non-Netlify environments**
   - Header only set when runtime detection confirms Netlify
   - No impact on other hosting platforms

2. **Browser environments**
   - Safe handling when `process.env` doesn't exist
   - Already implemented in current code

3. **Production instances**
   - Function only sets header for development instances
   - Production instances unaffected (by design)

4. **Empty or missing headers**
   - Function receives Headers object from middleware (always present)
   - `Headers.set()` is safe operation

### Backwards Compatibility

- Old deployments with cache-bust params continue working (params are harmless)
- New deployments use proper headers
- No migration needed
- No breaking changes to SDK integrations

## Implementation Checklist

1. **Update `netlifyCacheHandler.ts`**
   - [ ] Enhance `isNetlifyRuntime()` with additional env checks
   - [ ] Replace cache-bust logic with `Netlify-Vary` header setting
   - [ ] Remove `CLERK_NETLIFY_CACHE_BUST_PARAM` export
   - [ ] Update JSDoc comments

2. **Update `netlifyCacheHandler.spec.ts`**
   - [ ] Rewrite tests to check header presence instead of URL modification
   - [ ] Add runtime detection test cases for all env vars
   - [ ] Update test descriptions

3. **Update `clerk-js` cleanup**
   - [ ] Remove cache-bust param cleanup in `core/clerk.ts`
   - [ ] Remove param from query params list in `utils/getClerkQueryParam.ts`

4. **Testing**
   - [ ] Unit tests pass
   - [ ] Manual testing on Netlify dev instance
   - [ ] Verify no impact on non-Netlify environments
   - [ ] Verify SDK integrations still work

## Success Criteria

- ✅ No infinite redirect loops on Netlify development instances
- ✅ No URL pollution (no query parameters added)
- ✅ All unit tests pass
- ✅ SDK integrations work unchanged
- ✅ Follows Netlify's recommended approach
- ✅ Cleaner, more maintainable codebase

## References

- [Netlify Forum Discussion](https://answers.netlify.com/t/cache-handling-recommendation-for-authentication-handshake-redirects/143969)
- Netlify-Vary documentation (implicit from forum recommendation)
- Clerk Backend SDK: `/packages/backend/src/tokens/handshake.ts`
- Clerk constants: `/packages/backend/src/constants.ts`

## Open Questions

None - design approved.

## Future Considerations

- Monitor effectiveness in production deployments
- Consider extending to production instances if needed
- Document Netlify-Vary usage for other potential caching scenarios
